---
name: summarize
emoji: 📄
description: Summarize web pages, YouTube videos, PDFs, and files using steipete/summarize
---

# summarize

Summarize any URL, file, or YouTube video with AI. Uses multiple providers (OpenAI, Anthropic, Google, etc.).

## Prerequisites

`summarize` installed at `~/.local/bin/summarize`

## Usage

```bash
# Summarize a webpage
summarize "https://example.com"

# Summarize with specific model
summarize "https://example.com" --model gpt-4o-mini

# Summarize YouTube video
summarize "https://youtube.com/watch?v=..."

# Summarize local file
summarize "/path/to/document.pdf"

# Pipe content
cat file.txt | summarize -
```

## Environment Variables

- `OPENAI_API_KEY` - OpenAI models
- `ANTHROPIC_API_KEY` - Claude models
- `GEMINI_API_KEY` - Google models
- `SUMMARIZE_MODEL` - Default model override
- `FIRECRAWL_API_KEY` - Website extraction fallback

## Models

- `gpt-4o-mini` - Fast, cheap
- `gpt-4o` - Better quality
- `claude-3-5-sonnet` - Best reasoning
- `gemini-1.5-pro` - Large context

## Options

- `--youtube <mode>` - Transcript source: auto, web, no-auto, yt-dlp
- `--slides` - Extract slides from video
- `--transcriber <name>` - Audio transcription: whisper, parakeet, canary
- `--video-mode <mode>` - auto, transcript, understand

## Integration Examples

```javascript
// In an OpenClaw agent
const { exec } = require('child_process');

async function researchLead(companyUrl) {
  const summary = await execPromise(`summarize "${companyUrl}" --model gpt-4o-mini`);
  return summary;
}
```

```bash
# In a shell script
#!/bin/bash
URL="$1"
summarize "$URL" --model anthropic/claude-3-5-sonnet --output markdown > "summary.md"
```

## Notes

- Supports 100+ file types via magic numbers
- Automatically extracts YouTube transcripts
- Can extract slides from video presentations
- Falls back to Firecrawl for complex websites
- Free tier available via `summarize refresh-free`
