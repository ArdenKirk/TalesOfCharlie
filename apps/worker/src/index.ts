import { Worker } from 'bullmq';
import pino from 'pino';
import { PrismaClient } from '@toc/db';
import { fromUrlExtract } from './lib/extract';
import { getMockChoices } from '@toc/ai-mocks';
import { llmService } from './lib/llm';

const log = pino({ name: 'worker' });
const connection = { url: process.env.REDIS_URL || 'redis://localhost:6379' };
const prisma = new PrismaClient();

interface ArticleProcessingJob {
  postId: string;
  url: string;
  domain: string;
  userId: string;
}

const worker = new Worker('article-processing', async (job) => {
  const { postId, url, domain, userId }: ArticleProcessingJob = job.data;

  log.info({ postId, url, domain }, 'processing article submission');

  try {
    // Step 1: Extract article content
    log.info({ postId }, 'extracting article content');
    const extractedData = await fromUrlExtract(url);

    if (!extractedData || !extractedData.headline) {
      throw new Error('Failed to extract article content');
    }

    log.info({ postId, headline: extractedData.headline }, 'content extracted successfully');

    // Step 2: AI Processing - Mock in development, Real LiteLLM in production
    const isProd = process.env.NODE_ENV === 'production';
    const aiMode = process.env.AI_MODE || 'mock';

    let aiResult: { decision: 'APPROVE' | 'DENY'; summaryMd: string; tags: string[] };

    if (aiMode === 'mock' && !isProd) {
      // Use mock system for development
      log.info({ postId }, 'using AI mock system');
      const mockChoices = getMockChoices(url);

      // Auto-select first choice for now - TODO: Implement Response Picker UI
      aiResult = mockChoices[0];
    } else if (aiMode === 'real' && isProd) {
      // Use real LiteLLM service in production
      log.info({ postId }, 'using LiteLLM service for real AI processing');
      
      try {
        // Prepare data for AI evaluation
        const bodyAfterLede = extractedData.rest || '';

        const aiDecision = await llmService.evaluateArticle(url, {
          headline: extractedData.headline,
          lede: extractedData.lede || '',
          bodyAfterLede
        });

        aiResult = {
          decision: aiDecision.decision,
          summaryMd: aiDecision.summaryMd,
          tags: aiDecision.tags
        };
        
        log.info({ 
          postId, 
          decision: aiResult.decision, 
          tagsCount: aiResult.tags.length 
        }, 'LiteLLM evaluation completed');
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        log.error({ postId, error: errorMessage }, 'LiteLLM evaluation failed');
        
        // Never fallback to approve/deny - always fail when AI doesn't work
        throw new Error(`AI Processing Failed: ${errorMessage}`);
      }
    } else {
      // Fallback mode (shouldn't normally happen)
      log.error({ postId, aiMode, isProd }, 'Unexpected AI mode configuration - failing processing');
      throw new Error('AI_CONFIG_ERROR: AI mode not properly configured. Article processing failed.');
    }

    log.info({ postId, decision: aiResult.decision }, 'AI processing completed');

    // Step 3: Update post in database
    const updateData = aiResult.decision === 'APPROVE' ? {
      headlineExact: extractedData.headline,
      ledeExact: extractedData.lede,
      summaryConservativeMd: aiResult.summaryMd,
      tags: aiResult.tags,
      status: 'PUBLISHED' as const,
    } : {
      status: 'DENIED' as const,
    };

    await prisma.post.update({
      where: { id: postId },
      data: updateData,
    });

    log.info({ postId, status: updateData.status }, 'post updated successfully');

    return {
      success: true,
      postId,
      decision: aiResult.decision,
      extractSuccess: true,
      updateSuccess: true,
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error({ postId, error: errorMessage, stack: error instanceof Error ? error.stack : undefined }, 'article processing failed');

    // Update post with error status
    try {
      await prisma.post.update({
        where: { id: postId },
        data: {
          status: 'DENIED',
          summaryConservativeMd: `❌ Processing failed: ${errorMessage}`,
        },
      });
    } catch (updateError) {
      const updateErrorMessage = updateError instanceof Error ? updateError.message : 'Unknown update error';
      log.error({ postId, error: updateErrorMessage }, 'failed to update post with error status');
    }

    throw error; // Re-throw to mark job as failed
  }
}, {
  connection,
  concurrency: 2, // Process up to 2 articles simultaneously
  removeOnComplete: 50 as any,  // Type compatibility
  removeOnFail: 20 as any,      // Type compatibility
});

// Worker event handlers
worker.on('ready', () => log.info('article processing worker is ready'));
worker.on('error', (error) => log.error({ error: error instanceof Error ? error.message : String(error) }, 'worker error'));
worker.on('failed', (jobId, err) => log.error({ jobId, error: err instanceof Error ? err.message : String(err) }, 'job failed'));
worker.on('completed', (jobId) => log.info({ jobId }, 'job completed successfully'));

// Graceful shutdown
process.on('SIGTERM', async () => {
  log.info('received SIGTERM, shutting down worker');
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  log.info('received SIGINT, shutting down worker');
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});

log.info('article processing worker started');
