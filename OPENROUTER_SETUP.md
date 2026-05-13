# OpenRouter Integration Configuration
# OpenClaw Model Routing with OpenRouter
# Saves 20-30% on API costs with automatic failover

## What is OpenRouter?

OpenRouter is a unified API that routes to the cheapest available model:
- **Cost optimization:** Automatically picks cheapest provider
- **No single point of failure:** Falls back if one provider is down
- **One API key:** Access 100+ models from different providers
- **Pay-as-you-go:** No monthly minimums

## Cost Comparison (per 1M tokens)

| Model | Direct | OpenRouter | Savings |
|-------|--------|------------|---------|
| Claude 3.5 Sonnet | $3/$15 | $2.50/$10 | ~30% |
| GPT-4o | $2.50/$10 | $2/$8 | ~20% |
| Claude 3 Opus | $15/$75 | $12/$60 | ~20% |

## Setup Instructions

### 1. Get OpenRouter API Key

```bash
# Sign up at https://openrouter.ai
# Create API key (free $5 credit to start)
# Copy key to clipboard
```

### 2. Add to Environment

```bash
# Edit your .env file
nano ~/.openclaw/workspace/.env

# Add these lines:
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_HTTP_REFERER=https://theonegroup.info
OPENROUTER_X_TITLE=TheOneGroupAI
```

### 3. Configure OpenClaw

Edit `~/.openclaw/openclaw.json`:

```json
{
  "models": {
    "default": "ollama/kimi-k2.5:cloud",
    "routing": {
      "free": ["ollama/kimi-k2.5:cloud"],
      "fast": ["openrouter/claude-3.5-sonnet"],
      "cheap": ["openrouter/gpt-4o-mini"],
      "vision": ["openrouter/gpt-4o"],
      "complex": ["openrouter/claude-3.5-sonnet", "anthropic/claude-3.5-sonnet"]
    }
  }
}
```

### 4. Create Model Router Script

```javascript
// router.js - Smart model selection
function selectModel(task, complexity) {
  // Always try free first
  if (complexity === 'low') return 'ollama/kimi-k2.5:cloud';
  
  // Use OpenRouter for paid (cheaper)
  if (complexity === 'medium') return 'openrouter/gpt-4o-mini';
  if (complexity === 'high') return 'openrouter/claude-3.5-sonnet';
  if (complexity === 'vision') return 'openrouter/gpt-4o';
  
  // Fallback to direct if OpenRouter fails
  return 'anthropic/claude-3.5-sonnet';
}
```

## Updated Cost Tracking

Add to `cost-dashboard.js`:

```javascript
'openrouter/claude-3.5-sonnet': { type: 'llm', input: 2.5, output: 10 },
'openrouter/gpt-4o': { type: 'llm', input: 2, output: 8 },
'openrouter/gpt-4o-mini': { type: 'llm', input: 0.12, output: 0.48 },
```

## Quick Test

```bash
# Test OpenRouter connectivity
curl https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer $OPENROUTER_API_KEY"

# Test with OpenClaw
openclaw models list --provider openrouter
```

## Migration Plan

### Phase 1: Add OpenRouter as option
- [ ] Get API key
- [ ] Add to .env
- [ ] Test connectivity
- [ ] Log costs to compare

### Phase 2: Switch default routing
- [ ] Update MODEL_ROUTING.md
- [ ] Change fallback chain
- [ ] Monitor for 1 week
- [ ] Compare actual costs

### Phase 3: Optimize further
- [ ] Review cost logs weekly
- [ ] Adjust routing rules
- [ ] Add custom caching
- [ ] Implement request batching

## Expected Savings

| Current Monthly | With OpenRouter | Savings |
|-----------------|-----------------|---------|
| $150 (mostly Claude) | $100-120 | $30-50/month |
| $300 (heavy usage) | $200-240 | $60-100/month |

## Fallback Strategy

If OpenRouter is down:
1. Retry with exponential backoff
2. Fall back to direct provider
3. Log the failure
4. Alert via Slack/email

```javascript
async function callWithFallback(prompt, complexity) {
  const providers = [
    'openrouter/claude-3.5-sonnet',
    'anthropic/claude-3.5-sonnet',
    'openai/gpt-4o'
  ];
  
  for (const provider of providers) {
    try {
      return await callModel(provider, prompt);
    } catch (err) {
      logCost('fallback', provider, 0, 0, `Failed: ${err.message}`);
    }
  }
  throw new Error('All providers failed');
}
```

## Summary

**Do this now:**
1. Sign up at openrouter.ai
2. Add key to `.env`
3. Test with one task
4. Monitor savings in cost-dashboard

**Expected result:** 20-30% cost reduction on paid models, same quality.

