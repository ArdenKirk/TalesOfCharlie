# LiteLLM Integration Guide

This document describes the LiteLLM integration in Tales of Charlie, providing AI-powered article evaluation and summarization with cost controls and multi-provider support.

## Overview

The LiteLLM integration enables production AI functionality while maintaining development-friendly mock systems. Key features include:

- **Multi-Provider Support**: OpenAI, Anthropic, Google AI models
- **Budget Controls**: Daily spending limits with automatic fallbacks
- **Response Caching**: Redis-based caching to minimize costs
- **Environment Separation**: Mock responses in development, real AI in production
- **Conservative Analysis**: Specialized prompts for right-wing perspective summarization

## Architecture

### Development Mode
- **AI_MODE**: `mock`
- **Mock System**: Deterministic responses from `@toc/ai-mocks`
- **Response Picker**: UI for developers to select AI responses (planned)
- **No API Calls**: Zero cost, offline development

### Production Mode
- **AI_MODE**: `real`
- **LiteLLM Proxy**: Containerized proxy service handling multiple providers
- **Budget Enforcement**: $5/day limit with automatic fallbacks
- **Redis Caching**: 30-minute TTL for identical requests
- **Model Routing**: Automatic fallback between providers

## Configuration

### Environment Variables

#### Development (.env.dev)
```bash
AI_MODE=mock
REDIS_URL=redis://redis:6379
```

#### Production (.env.prod)
```bash
# Core AI Configuration
AI_MODE=real
MAX_DAILY_COST_USD=5
LLM_MODEL=gpt-4o-mini

# LiteLLM Service
LITELLM_BASE_URL=http://litellm:8080/v1
LITELLM_MASTER_KEY=your-secure-master-key
LITELLM_SALT_KEY=your-secure-salt-key

# Provider API Keys
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key  # Optional
GOOGLE_API_KEY=your-google-key        # Optional

# Redis for Caching
REDIS_URL=redis://redis:6379
```

### Docker Configuration

The production stack includes a LiteLLM container:

```yaml
litellm:
  image: ghcr.io/berriai/litellm:latest
  environment:
    OPENAI_API_KEY: ${OPENAI_API_KEY}
    ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY:-}
    GOOGLE_API_KEY: ${GOOGLE_API_KEY:-}
    LITELLM_MASTER_KEY: ${LITELLM_MASTER_KEY}
    MAX_BUDGET: ${MAX_DAILY_COST_USD:-5}
  volumes:
    - ./litellm-config.yaml:/app/config.yaml:ro
  expose: ["8080"]
```

## Usage

### Article Evaluation

The worker service automatically calls AI for article evaluation:

```typescript
// In worker/src/index.ts
if (aiMode === 'real' && isProd) {
  const aiDecision = await llmService.evaluateArticle(url, {
    headline: extractedData.headline,
    lede: extractedData.lede,
    bodyAfterLede: extractedData.bodyAfterLede
  });
}
```

### Conservative Summarization

AI generates summaries from a conservative perspective:

```typescript
const systemPrompt = `You are a conservative news analyst for Tales of Charlie, evaluating articles for inclusion and summarization.

MISSION: Expose corruption and bias in liberal media against conservatives, the white race, and groups maligned by the left.

EVALUATION CRITERIA:
- APPROVE if either:
  1) Right-leaning source reporting facts favorable to conservative views
  2) Left-leaning source hostile to our views - we document this bias
- DENY if content lacks substance for conservative analysis

If APPROVED, provide:
1) Conservative summary in Markdown (2-3 paragraphs)
2) Up to 20 tags from allowlist

Be uncompromising in conservative analysis while maintaining professional tone.`;
```

## Budget Management

### Daily Limits
- Default: $5/day per environment variable
- Automatic tracking of token usage and estimated costs
- Service denial when budget exceeded (no processing until budget resets)

### Cost Optimization
- **Response Caching**: Redis stores responses for 30 minutes
- **Model Selection**: Uses cost-effective models (gpt-4o-mini default)
- **Budget Monitoring**: Real-time cost tracking with proactive shutoff

### Fallback Behavior
When budget is exceeded:
```typescript
// Budget exceeded - deny service
throw new Error('BUDGET_EXCEEDED: Daily AI budget limit reached. Article processing temporarily unavailable.');
```

When API fails (non-budget errors):
```typescript
// No fallback decisions - fail the entire process
throw error;
```

## Model Configuration

### Supported Models
1. **OpenAI**
   - `gpt-4o-mini` (default, cost-effective)
   - `gpt-4o` (higher quality, more expensive)

2. **Anthropic**
   - `claude-3-haiku` (fast, cost-effective)

3. **Google**
   - `gemini-pro` (alternative option)

### Model Selection
```yaml
# In litellm-config.yaml
model_list:
  - model_name: gpt-4o-mini
    litellm_params:
      model: openai/gpt-4o-mini
      api_key: ${OPENAI_API_KEY}
      timeout: 30
      max_tokens: 2000
      temperature: 0.3
```

## Monitoring and Debugging

### Logging
LiteLLM service provides comprehensive logging:
```bash
# View LiteLLM logs
docker logs litellm-container

# Worker AI processing logs
docker logs worker-container | grep llm-service
```

### Health Checks
```bash
# Check LiteLLM health
curl http://litellm:8080/health

# Check budget status via worker logs
docker logs worker-container | grep "daily budget"
```

### Cache Monitoring
```bash
# Connect to Redis and check cache
redis-cli -h redis
> KEYS llm:*
> TTL llm:sha256hash...
```

## Development Workflow

### 1. Development (Mock Mode)
```bash
# Start development stack
cd ops && ./dev.sh up

# Submit article - uses mock responses
# Worker logs will show: "using AI mock system"
```

### 2. Production Testing
```bash
# Set production environment
export AI_MODE=real
export OPENAI_API_KEY=your-key

# Deploy production stack
cd ops && ./prod.sh
```

### 3. Response Picker (Planned)
Future development will include a UI for developers to interactively select mock responses during article submission testing.

## Troubleshooting

### Common Issues

1. **Budget Exceeded - Service Denied**
   - Articles will fail processing until budget resets (next day)
   - Check `MAX_DAILY_COST_USD` environment variable
   - Review cache hit rate in Redis to optimize costs
   - Consider using cheaper models for future requests

2. **API Authentication Failures**
   - Verify `LITELLM_MASTER_KEY` is set correctly
   - Check provider API keys are valid
   - Ensure LiteLLM container has environment variables

3. **Cache Not Working**
   - Verify Redis connection in worker logs
   - Check `AI_MODE=real` (caching disabled in mock mode)
   - Confirm Redis container is running

### Debug Commands
```bash
# Check worker logs for AI processing
docker logs worker-container | grep -E "(llm-service|AI processing)"

# Verify LiteLLM configuration
docker exec litellm-container cat /app/config.yaml

# Test direct LiteLLM API call
curl -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"test"}]}' \
     http://litellm:8080/v1/chat/completions
```

## Security Considerations

### API Key Management
- Store API keys securely in environment variables
- Use different keys for development and production
- Rotate keys regularly

### Budget Protection
- Set conservative daily limits initially ($5/day default)
- Service automatically stops processing when budget exceeded
- Monitor spending through provider dashboards
- Implement alerting for budget exceeded events
- Budget resets at midnight UTC daily

### Content Safety
- AI responses are logged for moderation review
- Conservative editorial guidelines enforced through prompts
- Fallback mechanisms ensure site continues operating

## Performance Optimization

### Caching Strategy
- 30-minute TTL for AI responses
- Cache key includes article content hash
- Reduces API calls for identical articles

### Model Selection
- Default to cost-effective models (gpt-4o-mini)
- Upgrade to higher-quality models for complex analysis
- Automatic fallback between providers for reliability

### Rate Limiting
```yaml
rate_limit:
  gpt-4o-mini:
    requests_per_minute: 60
    tokens_per_minute: 50000
```

## Future Enhancements

1. **Advanced Prompt Engineering**
   - A/B testing of different conservative analysis prompts
   - Specialized prompts for different content types

2. **Response Quality Monitoring**
   - Human review workflow for AI decisions
   - Quality scoring and feedback loop

3. **Enhanced Budget Controls**
   - Per-user budget allocation
   - Dynamic pricing based on content complexity

4. **Multi-Model Routing**
   - Intelligent model selection based on content type
   - Performance-based routing decisions

## Support

For LiteLLM integration issues:
1. Check worker and LiteLLM container logs
2. Verify environment variable configuration
3. Test API connectivity manually
4. Review budget and cache status
5. Consult LiteLLM documentation for advanced configuration

---

**Last Updated**: September 2025  
**Integration Status**: Production Ready ✅
