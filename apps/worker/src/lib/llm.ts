import pino from 'pino';
import { createHash } from 'crypto';
import Redis from 'ioredis';
import { fromUrlExtract } from './extract';

const log = pino({ name: 'llm-service' });

// LiteLLM client configuration
interface LLMConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

interface LLMUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUSD: number;
}

interface LLMResponse {
  content: string;
  usage: LLMUsage;
  cached: boolean;
}

interface AIDecision {
  decision: 'APPROVE' | 'DENY';
  summaryMd: string;
  tags: string[];
  reasoning?: string;
}

export class LiteLLMService {
  private config: LLMConfig;
  private dailyCostTracker: Map<string, number> = new Map();
  private maxDailyCostUSD: number;
  private redis: Redis | undefined;
  private cacheEnabled: boolean;

  constructor(config: Partial<LLMConfig> = {}) {
    this.config = {
      apiKey: process.env.LITELLM_MASTER_KEY || process.env.OPENAI_API_KEY || '',
      baseUrl: process.env.LITELLM_BASE_URL || 'http://litellm:8080/v1',
      model: process.env.LLM_MODEL || 'gpt-4o-mini',
      maxTokens: 1500,
      temperature: 0.3,
      ...config
    };
    
    this.maxDailyCostUSD = parseFloat(process.env.MAX_DAILY_COST_USD || '5');
    
    // Initialize Redis for caching
    this.cacheEnabled = process.env.AI_MODE === 'real' && !!process.env.REDIS_URL;
    if (this.cacheEnabled) {
      this.redis = new Redis(process.env.REDIS_URL!);
      log.info({ redisUrl: process.env.REDIS_URL }, 'Redis cache enabled for LLM responses');
    } else {
      log.info('LLM response caching disabled (not in production or no Redis URL)');
    }
    
    log.info({
      baseUrl: this.config.baseUrl,
      model: this.config.model,
      maxDailyCostUSD: this.maxDailyCostUSD,
      hasApiKey: !!this.config.apiKey,
      cacheEnabled: this.cacheEnabled
    }, 'LiteLLM service initialized');
  }

  private async checkDailyBudget(): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];
    const todaySpent = this.dailyCostTracker.get(today) || 0;
    
    if (todaySpent >= this.maxDailyCostUSD) {
      log.warn({
        todaySpent,
        maxDailyCostUSD: this.maxDailyCostUSD
      }, 'Daily AI budget exceeded');
      return false;
    }
    
    return true;
  }

  private updateDailyBudget(costUSD: number): void {
    const today = new Date().toISOString().split('T')[0];
    const currentSpent = this.dailyCostTracker.get(today) || 0;
    this.dailyCostTracker.set(today, currentSpent + costUSD);
    
    log.info({
      todaySpent: currentSpent + costUSD,
      costUSD,
      maxDailyCostUSD: this.maxDailyCostUSD
    }, 'Updated daily AI budget');
  }

  private estimateCost(usage: { promptTokens: number; completionTokens: number; totalTokens: number }): number {
    // GPT-4o-mini pricing (approximate)
    const inputCostPer1K = 0.00015;  // $0.150 per 1M tokens
    const outputCostPer1K = 0.0006;  // $0.600 per 1M tokens
    
    const inputCost = (usage.promptTokens / 1000) * inputCostPer1K;
    const outputCost = (usage.completionTokens / 1000) * outputCostPer1K;
    
    return inputCost + outputCost;
  }

  private generateCacheKey(messages: any[], model: string, temperature: number): string {
    const content = JSON.stringify({ messages, model, temperature });
    return `llm:${createHash('sha256').update(content).digest('hex')}`;
  }

  private async getCachedResponse(cacheKey: string): Promise<LLMResponse | null> {
    if (!this.cacheEnabled || !this.redis) return null;

    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        const response = JSON.parse(cached);
        log.info({ cacheKey }, 'Using cached LLM response');
        return { ...response, cached: true };
      }
    } catch (error) {
      log.warn({ error: error instanceof Error ? error.message : String(error) }, 'Cache read failed');
    }

    return null;
  }

  private async setCachedResponse(cacheKey: string, response: LLMResponse, ttlMinutes: number = 30): Promise<void> {
    if (!this.cacheEnabled || !this.redis) return;

    try {
      await this.redis.setex(cacheKey, ttlMinutes * 60, JSON.stringify({
        content: response.content,
        usage: response.usage,
        cached: false
      }));
      log.info({ cacheKey, ttlMinutes }, 'Cached LLM response');
    } catch (error) {
      log.warn({ error: error instanceof Error ? error.message : String(error) }, 'Cache write failed');
    }
  }

  private async callLiteLLM(messages: any[], options: Partial<LLMConfig> = {}): Promise<LLMResponse> {
    const requestConfig = { ...this.config, ...options };
    
    // Try cache first
    const cacheKey = this.generateCacheKey(messages, requestConfig.model, requestConfig.temperature);
    const cachedResponse = await this.getCachedResponse(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    try {
      const response = await fetch(`${requestConfig.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${requestConfig.apiKey}`,
        },
        body: JSON.stringify({
          model: requestConfig.model,
          messages,
          max_tokens: requestConfig.maxTokens,
          temperature: requestConfig.temperature,
        }),
      });

      if (!response.ok) {
        throw new Error(`LiteLLM API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      const usage: LLMUsage = {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
        estimatedCostUSD: 0
      };
      
      usage.estimatedCostUSD = this.estimateCost(usage);
      
      const llmResponse: LLMResponse = {
        content: data.choices?.[0]?.message?.content || '',
        usage,
        cached: false
      };

      // Cache the response
      await this.setCachedResponse(cacheKey, llmResponse, 30); // 30 minute TTL
      
      return llmResponse;
      
    } catch (error) {
      log.error({ error: error instanceof Error ? error.message : String(error) }, 'LiteLLM API call failed');
      throw error;
    }
  }

  async evaluateArticle(url: string, extractedData: { headline: string; lede: string; bodyAfterLede: string }): Promise<AIDecision> {
    log.info({ url }, 'Starting AI article evaluation');
    
    // Check budget
    const budgetOk = await this.checkDailyBudget();
    if (!budgetOk) {
      log.error({ url }, 'Daily AI budget exceeded, denying service');
      throw new Error('BUDGET_EXCEEDED: Daily AI budget limit reached. Article processing temporarily unavailable.');
    }

    const systemPrompt = `You are a conservative news analyst for Tales of Charlie, evaluating articles for inclusion and summarization.

MISSION: Expose corruption and bias in liberal media against conservatives, the white race, and groups maligned by the left.

EVALUATION CRITERIA:
- APPROVE if either:
  1) Right-leaning source reporting facts favorable to conservative views or exposing left misconduct
  2) Left-leaning source hostile to our views (pushing abortion, denigrating white people, praising attacks on right, calling right "Nazis") - we document this bias
- DENY if content lacks substance for conservative analysis

If APPROVED, provide:
1) Conservative summary in Markdown (2-3 paragraphs, extremely conservative perspective)
2) Up to 20 tags from this allowlist: politics, media-bias, conservative-review, culture-war, traditional-values, religion, economics, government-overreach, individual-liberty, progressivism, liberal-bias, mainstream-media, propaganda, media-watch, academic-freedom, free-speech, progressive-agenda, education, conservative-news, reliable-source, traditional-media, ideological-analysis, mixed-content, progressive-bias

Be uncompromising in conservative analysis while maintaining professional tone.`;

    const userPrompt = `URL: ${url}

HEADLINE: ${extractedData.headline}

LEDE: ${extractedData.lede}

BODY CONTENT: ${extractedData.bodyAfterLede.slice(0, 2000)}

Evaluate this article and provide your decision with reasoning.`;

    try {
      const response = await this.callLiteLLM([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);

      // Update budget tracking
      this.updateDailyBudget(response.usage.estimatedCostUSD);

      // Parse AI response (simplified for now - would need more robust parsing)
      const content = response.content;
      
      // For now, implement basic parsing - in production would use structured output
      const decision = content.toLowerCase().includes('approve') ? 'APPROVE' : 'DENY';
      
      let summaryMd = '';
      let tags: string[] = [];
      
      if (decision === 'APPROVE') {
        // Extract summary (basic implementation)
        const summaryMatch = content.match(/(?:summary|analysis)[:\s]*([^]*?)(?:tags|$)/i);
        summaryMd = summaryMatch?.[1]?.trim() || '**Conservative Analysis**: This article requires conservative perspective analysis.';
        
        // Extract tags (basic implementation)
        const tagsMatch = content.match(/tags[:\s]*\[(.*?)\]/i);
        if (tagsMatch) {
          tags = tagsMatch[1].split(',').map(tag => tag.trim().replace(/['"]/g, '')).slice(0, 20);
        } else {
          tags = ['politics', 'media-bias'];
        }
      }

      const result: AIDecision = {
        decision: decision as 'APPROVE' | 'DENY',
        summaryMd,
        tags,
        reasoning: content
      };

      log.info({
        url,
        decision: result.decision,
        cost: response.usage.estimatedCostUSD,
        tokens: response.usage.totalTokens
      }, 'AI evaluation completed');

      return result;
      
    } catch (error) {
      log.error({ url, error: error instanceof Error ? error.message : String(error) }, 'AI evaluation failed');
      
      // No fallback decisions - fail the entire process
      throw error;
    }
  }

  async generateSummary(url: string, extractedData: { headline: string; lede: string; bodyAfterLede: string }): Promise<{ summaryMd: string; tags: string[] }> {
    log.info({ url }, 'Generating conservative summary');
    
    const budgetOk = await this.checkDailyBudget();
    if (!budgetOk) {
      log.error({ url }, 'Daily AI budget exceeded, denying summary service');
      throw new Error('BUDGET_EXCEEDED: Daily AI budget limit reached. Summary generation temporarily unavailable.');
    }

    const systemPrompt = `You are a conservative content analyst for Tales of Charlie. Generate an extremely conservative summary and tags for this article.

Write 2-3 paragraphs from an uncompromisingly conservative perspective, highlighting:
- Traditional values under attack
- Government overreach concerns  
- Media bias and propaganda
- Economic freedom vs progressive control
- Cultural and religious freedom issues

Use professional news tone while maintaining strong conservative viewpoint.

Assign up to 20 relevant tags from the allowlist: politics, media-bias, conservative-review, culture-war, traditional-values, religion, economics, government-overreach, individual-liberty, progressivism, liberal-bias, mainstream-media, propaganda, media-watch, academic-freedom, free-speech, progressive-agenda, education, conservative-news, reliable-source, traditional-media, ideological-analysis, mixed-content, progressive-bias`;

    const userPrompt = `Generate conservative summary for:

HEADLINE: ${extractedData.headline}
LEDE: ${extractedData.lede}
CONTENT: ${extractedData.bodyAfterLede.slice(0, 2000)}`;

    try {
      const response = await this.callLiteLLM([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);

      this.updateDailyBudget(response.usage.estimatedCostUSD);

      // Parse response for summary and tags
      const content = response.content;
      const tagsMatch = content.match(/tags[:\s]*\[(.*?)\]/i);
      const tags = tagsMatch 
        ? tagsMatch[1].split(',').map(tag => tag.trim().replace(/['"]/g, '')).slice(0, 20)
        : ['politics', 'conservative-review'];

      // Remove tags from summary
      const summaryMd = content.replace(/tags[:\s]*\[.*?\]/i, '').trim();

      log.info({
        url,
        cost: response.usage.estimatedCostUSD,
        tokens: response.usage.totalTokens,
        tagsCount: tags.length
      }, 'Conservative summary generated');

      return { summaryMd, tags };
      
    } catch (error) {
      log.error({ url, error: error instanceof Error ? error.message : String(error) }, 'Summary generation failed');
      
      // No fallback responses - fail the entire process
      throw error;
    }
  }
}

// Export singleton instance
export const llmService = new LiteLLMService();
