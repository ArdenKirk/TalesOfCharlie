import { Worker } from 'bullmq';
import pino from 'pino';
import { PrismaClient } from '@toc/db';
import { fromUrlExtract } from './lib/extract';
import { getMockChoices } from '@toc/ai-mocks';

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

    // Step 2: In development mode, use AI mock system
    const isProd = process.env.NODE_ENV === 'production';
    const aiMode = process.env.AI_MODE || 'mock';

    let aiResult: { decision: 'APPROVE' | 'DENY'; summaryMd: string; tags: string[] };

    if (aiMode === 'mock' && !isProd) {
      // Use mock system - normally this would show a UI for developer selection
      log.info({ postId }, 'using AI mock system');
      const mockChoices = getMockChoices(url);

      // For now, auto-select the first mock choice (APPROVE)
      // TODO: Implement Response Picker UI for developer choice
      aiResult = mockChoices[0];
    } else {
      // TODO: Implement real AI processing via LiteLLM
      // For now, default to approval
      aiResult = {
        decision: 'APPROVE',
        summaryMd: '**Conservative analysis pending** - AI integration in development',
        tags: ['politics', 'media-bias']
      };
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
