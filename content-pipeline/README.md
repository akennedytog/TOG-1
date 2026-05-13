# Content Pipeline for TheOneGroupAI
# Converts social content → long-form → multi-channel

## Content Types

### 1. Twitter Thread → Blog Post
- Takes a thread from content-calendar.json
- Expands into 500-800 word article
- SEO-optimized with headers
- Auto-posts to site

### 2. Case Study → PDF Lead Magnet
- Client wins → downloadable PDF
- Gated behind email capture
- Linked from blog posts

### 3. Weekly Digest → Email Newsletter
- Curated best tweets of week
- Sends via himalaya (once installed)

### 4. LinkedIn Articles
- Repurposes blog content
- Professional tone adjustment

## Automation Triggers

### Daily (Morning)
- Read content-calendar.json
- Identify today's scheduled content
- Generate expanded version
- Queue for review

### Weekly (Sunday)
- Compile best performing content
- Create newsletter draft
- Schedule email send

### Monthly (1st)
- Generate analytics report
- Update content strategy
- Refresh calendar

## File Structure

content/
├── blog/              # Auto-generated posts
├── newsletters/       # Weekly digests
├── lead-magnets/      # Downloadable PDFs
├── social/            # Cross-platform variants
└── calendar-next.json # Future content queue

## SEO Strategy

Target Keywords:
- AI automation for small business
- SMB AI implementation
- Practical AI consulting
- AI lead response automation
- Small business AI ROI

## Next Actions

1. Create blog post generator
2. Build email newsletter workflow
3. Set up analytics tracking
4. Create lead magnet templates

