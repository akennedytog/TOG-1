# Canva Template Automation Pipeline

Automated template generation and listing creation system for Canva-compatible design templates.

## Quick Start

```bash
# Generate a single template manually
node scripts/canva_automation.js single instagram_carousel

# Generate daily batch (up to 3 templates)
node scripts/canva_automation.js daily

# Install scheduler to run automatically
cd scripts
node template_scheduler.js start
```

## Directory Structure

```
~/.openclaw/workspace/
├── scripts/
│   ├── canva_automation.js      # Main automation engine
│   └── template_scheduler.js    # CRON scheduler
├── data/canva_templates/
│   ├── template_queue.json      # Generation queue
│   ├── generation_state.json    # Daily/weekly tracking
│   ├── scheduler_state.json     # Scheduler config
│   └── notifications_sent.json  # Notification log
├── outputs/templates/
│   └── {template_id}/           # Generated templates
│       ├── {id}_figma_commands.json
│       ├── {id}_canva_import.md
│       ├── {id}_metadata.json
│       ├── {id}_preview.html
│       └── listings/
│           ├── etsy_listing.json
│           ├── creative_market_listing.json
│           ├── designcuts_listing.json
│           ├── master_listing.json
│           └── copy_paste.txt
└── logs/
    └── canva_automation_YYYY-MM-DD.log
```

## Available Templates

| Template ID | Name | Etsy | Creative Market | DesignCuts |
|-------------|------|------|-----------------|------------|
| instagram_carousel | Instagram Carousel Post | $5.99 | $7.00 | $6.50 |
| youtube_thumbnail | YouTube Thumbnail Pack | $8.99 | $12.00 | $10.00 |
| business_card | Professional Business Card | $4.99 | $6.00 | $5.50 |
| resume_cv | Modern Resume/CV Template | $6.99 | $9.00 | $8.00 |
| presentation_deck | Pitch Deck Presentation | $12.99 | $18.00 | $15.00 |
| story_templates | Instagram Stories Pack | $7.99 | $10.00 | $9.00 |
| flyer_poster | Event Flyer / Poster | $5.99 | $8.00 | $7.00 |
| ebook_cover | eBook Cover Bundle | $9.99 | $14.00 | $12.00 |

## Commands

### Canva Automation Script

```bash
# List all available templates
node canva_automation.js list

# Generate specific template
node canva_automation.js single <template-id>

# Run daily generation (3 templates)
node canva_automation.js daily

# Check queue status
node canva_automation.js status

# Generate weekly report
node canva_automation.js weekly

# Estimate revenue potential
node canva_automation.js revenue [template-id...]
```

### Template Scheduler

```bash
# Install CRON job (runs daily at 9 AM)
node template_scheduler.js start

# Check status
node template_scheduler.js status

# Run once manually
node template_scheduler.js once [template-id]

# Change schedule
node template_scheduler.js schedule "0 */6 * * *"

# Stop scheduler
node template_scheduler.js stop

# View logs
node template_scheduler.js logs [n]
```

## Configuration

Edit `canva_automation.js` to customize:

- `CONFIG.dailyLimit` - Templates per day (default: 3)
- `TEMPLATE_CONFIGS` - Add/modify template types
- Pricing per platform

## Manual Steps Required

These parts of the workflow require **manual action**:

1. **Create Templates in Canva**
   - Open the `_canva_import.md` file
   - Follow the step-by-step instructions
   - Create the actual template in Canva
   - Export as PDF/PNG

2. **Upload to Platforms**
   - Etsy: Upload PDF, add Canva link
   - Creative Market: Upload template files
   - DesignCuts: Submit for approval

3. **Set up Notifications** (optional)
   - Configure Slack webhook
   - Add email notifications
   - Set up Discord webhook

## Automation Status

| Component | Status | Notes |
|-----------|--------|-------|
| Cron Scheduler | ✅ Automated | Runs daily at 9 AM |
| Template Queue | ✅ Automated | Auto-populates from configs |
| File Generation | ✅ Automated | Creates all template files |
| Quality Control | ✅ Automated | Validates exports |
| Listing Generation | ✅ Automated | Creates 3 platform listings |
| Revenue Tracking | ✅ Automated | Estimates based on 5% conversion |
| Canva Template Creation | ⚠️ Manual | Must follow import instructions |
| Platform Upload | ⚠️ Manual | Upload to Etsy, CM, DesignCuts |
| Sales Sync | ❌ Not Implemented | Requires platform APIs |

## Revenue Estimation

Based on 5% conversion rate assumption:

```bash
node canva_automation.js revenue
```

Example output:
```json
{
  "etsy": {
    "totalListings": 8,
    "totalValue": 63.91,
    "estimatedRevenue": 3.20,
    "conversionRate": "5%"
  },
  "creative_market": {
    "totalValue": 84.00,
    "estimatedRevenue": 4.20
  },
  "designcuts": {
    "totalValue": 73.00,
    "estimatedRevenue": 3.65
  }
}
```
