# Research Agent Integration

## What's New

Your OpenClaw agents now have **summarize** superpowers:

### 1. Arlo → Auto-Summarizes Lead Websites
**Before:** Just found business name + contact info  
**Now:** Summarizes their website + extracts AI opportunities automatically

```bash
python3 agents/arlo.py
# Each lead now includes:
# - website_summary (key points from their site)
# - ai_opportunity (specific AI use cases for that business)
```

### 2. Dante → Researches YouTube Content
**Before:** Generated content from templates  
**Now:** Can research industry videos for fresh insights

```bash
python3 agents/dante.py
# Can pull from YouTube videos for content ideas
# (production: add actual YouTube URLs to research)
```

### 3. Research Command → Quick Competitive Analysis
**New tool:** One-command competitive intelligence

```bash
# Competitor analysis
./research.sh "https://competitor-website.com" --competitor

# Content research from YouTube
./research.sh "https://youtube.com/watch?v=..." --content

# Standard summary
./research.sh "/path/to/document.pdf"
```

## Usage Examples

### Research a Competitor
```bash
./research.sh "https://www.theonegroup.info/competitor" --competitor
# Generates: competitive analysis report with AI opportunities
```

### Research Industry Content
```bash
./research.sh "https://youtube.com/watch?v=ai-trends-2026" --content
# Generates: content brief with Twitter thread ideas
```

### Quick PDF Summary
```bash
./research.sh "/path/to/industry-report.pdf" --slides
# Generates: summary + slide extraction
```

## File Locations

- `agents/arlo.py` - Enhanced research agent with website summarization
- `agents/dante.py` - Creative agent with YouTube research capability
- `research.sh` - Standalone research command
- `research/` - Output directory for research reports

## API Keys Required

Set these environment variables:
- `OPENAI_API_KEY` - For OpenAI models
- `ANTHROPIC_API_KEY` - For Claude models
- `FIRECRAWL_API_KEY` - For website extraction fallback

## Models Used

- **gpt-4o-mini** (default) - Fast, cheap ($0.15/M tokens)
- **gpt-4o** - Better quality ($2.50/M tokens)
- **claude-3-5-sonnet** - Best reasoning ($3.00/M tokens)

## Integration with Existing Pipeline

All changes are **backward compatible**:
- Arlo still outputs to `data/arlo_findings.json`
- Dante still outputs to `data/dante_twitter_content.json`
- Just adds new fields for richer data

Run your normal workflow:
```bash
./run_agents.sh      # Runs both Arlo + Dante with new features
./run_daily_updates.sh  # Full pipeline with summarization
```

## Cost Impact

- **Arlo**: +20 API calls/day (20 leads × 1 website each)
- **Cost**: ~$0.30/day with gpt-4o-mini
- **Dante**: Variable based on YouTube research
- **Research command**: On-demand, ~$0.01-0.05 per analysis

Total: ~$10/month additional for automated research
