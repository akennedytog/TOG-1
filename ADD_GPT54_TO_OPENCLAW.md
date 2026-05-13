# Adding GPT-5.4 to Model Dropdown

## Step 1: Update OpenClaw Model Registry

Add these lines to your OpenClaw config:

```json
{
  "models": {
    "gpt-5.4": {
      "provider": "openai",
      "model": "gpt-5.4",
      "display": "gpt-5.4 · openai",
      "cost_per_1k": 3.0
    },
    "gpt-5.4-codex": {
      "provider": "openai", 
      "model": "gpt-5.4-codex",
      "display": "gpt-5.4-codex · openai",
      "cost_per_1k": 6.0
    },
    "gpt-5.4-pro": {
      "provider": "openai",
      "model": "gpt-5.4-pro",
      "display": "gpt-5.4-pro · openai",
      "cost_per_1k": 15.0
    }
  }
}
```

## Step 2: Command Line (Quick)

Run these commands to register GPT-5.4:

```bash
# Register GPT-5.4 base model
openclaw models add openai/gpt-5.4 "GPT-5.4" --cost 3.0

# Register GPT-5.4 Codex (coding focused)
openclaw models add openai/gpt-5.4-codex "GPT-5.4 Codex" --cost 6.0

# Register GPT-5.4 Pro (highest capability)
openclaw models add openai/gpt-5.4-pro "GPT-5.4 Pro" --cost 15.0
```

## Step 3: Verify Available Models

Check they're registered:
```bash
openclaw models list
```

## Step 4: Quick Switch Commands

Once added, use these shortcuts:

```bash
# Switch to GPT-5.4 for current session
openclaw model gpt-5.4

# Or use inline for one command
openclaw ask "your question" --model gpt-5.4

# For coding tasks (best for code)
openclaw ask "review this code" --model gpt-5.4-codex

# For complex reasoning
openclaw ask "analyze this" --model gpt-5.4-pro
```

## Model Use Cases

| Model | Best For | Cost/1M |
|-------|----------|---------|
| gpt-5.4 | General tasks, reasoning | $3.00 |
| gpt-5.4-codex | Code, debugging, architecture | $6.00 |
| gpt-5.4-pro | Complex analysis, multi-step | $15.00 |
| ollama/kimi-k2.5 | Free, everyday tasks | $0 |

## Make Default for Large Tasks

Edit your config to auto-route large tasks to GPT-5.4:

```json
{
  "routing": {
    "large_tasks": "openai/gpt-5.4-codex",
    "coding": "openai/gpt-5.4-codex",
    "default": "ollama/kimi-k2.5"
  }
}
```

## Note

The dropdown you showed is OpenClaw's model selector. After adding, restart OpenClaw:

```bash
openclaw restart
# or
openclaw gateway restart
```

Then GPT-5.4 will appear in your dropdown menu!