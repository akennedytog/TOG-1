---
name: theonegroup
description: 'Complete business operating system for The One Group - AI automation consultancy. Manage leads, clients, content, and operations via OpenClaw. Use when: handling sales inquiries, onboarding clients, generating content, tracking projects, or managing daily business operations.'
metadata:
  {
    "openclaw": { 
      "emoji": "🚀", 
      "requires": { 
        "files": ["BUSINESS.md", "OPERATING.md"],
        "env": ["CALENDLY_LINK", "HUBSPOT_API_KEY"]
      }
    },
  }
---

# The One Group Business Operating System

## Overview

Complete AI-powered business management for The One Group - AI automation consultancy specializing in small business AI deployment.

## Capabilities

### 1. Lead Management
- Capture and qualify new inquiries
- Auto-respond with scheduling link
- Track lead source and status
- Nurture non-converting leads

### 2. Client Operations
- Onboard new clients (standardized process)
- Track project milestones
- Generate deliverables (audits, reports)
- Manage support requests

### 3. Content Engine
- Generate Twitter threads from articles
- Create blog posts from ideas
- Write newsletter content
- Produce case studies

### 4. Financial Tracking
- Log revenue and expenses
- Track MRR and pipeline
- Generate invoices
- Monitor cash flow

### 5. Reporting
- Weekly business summary
- Monthly P&L analysis
- Client satisfaction tracking
- Competitor intel reports

## Usage

### Manage a New Lead
```
openclaw run theonegroup --task "New lead from Twitter: John Smith, HVAC company, wants AI for scheduling"
```

### Generate Content
```
openclaw run theonegroup --task "Create Twitter thread about AI automation myths"
```

### Client Onboarding
```
openclaw run theonegroup --task "Onboard new client: Acme Corp, AI Visibility Audit, $2,500"
```

### Weekly Review
```
openclaw run theonegroup --task "Generate weekly business report"
```

## Data Structures

### Lead Object
```json
{
  "id": "lead_001",
  "name": "John Smith",
  "company": "Smith HVAC",
  "email": "john@smithhvac.com",
  "source": "Twitter",
  "service": "AI Visibility Audit",
  "budget": "$2,500",
  "status": "qualified",
  "next_action": "Send Calendly link",
  "created": "2026-03-22",
  "notes": "Wants to rank in ChatGPT for HVAC services"
}
```

### Client Object
```json
{
  "id": "client_001",
  "name": "Acme Corp",
  "contact": "Jane Doe",
  "email": "jane@acme.com",
  "service": "AI Optimization",
  "value": "$5,000",
  "status": "in_progress",
  "start_date": "2026-03-15",
  "milestone": "audit_complete",
  "next_delivery": "2026-03-29"
}
```

### Content Object
```json
{
  "id": "content_001",
  "type": "twitter_thread",
  "title": "AI Myths Debunked",
  "status": "draft",
  "scheduled": "2026-03-23T10:00:00Z",
  "engagement": { "likes": 0, "replies": 0, "retweets": 0 }
}
```

## File Structure

```
skills/theonegroup/
├── SKILL.md                    # This file
├── scripts/
│   ├── lead_manager.js         # Lead capture & nurturing
│   ├── client_ops.js           # Client onboarding & management
│   ├── content_engine.js       # Content generation & scheduling
│   ├── financial_tracker.js    # Revenue & expense tracking
│   └── weekly_report.js        # Business intelligence
├── templates/
│   ├── proposal_template.md    # Service proposals
│   ├── audit_template.md       # AI Visibility Audit
│   ├── onboarding_checklist.md # New client onboarding
│   └── email_templates/        # All email templates
└── references/
    ├── pricing_sheet.md        # Service pricing
    ├── competitor_matrix.md    # Competitive analysis
    └── faq.md                  # Common questions & answers
```

## Integration Points

### External APIs
- **Calendly** - Scheduling
- **HubSpot** - CRM (optional)
- **Stripe** - Payments
- **Twitter** - Content distribution
- **Netlify** - Website deployment

### Internal Tools
- **content-pipeline** - Blog/newsletter generation
- **twitter-automation** - Social media posting
- **gh-issues** - Project tracking
- **cron** - Scheduled tasks

## Automation Workflows

### Lead → Client Workflow
1. Lead inquiry received
2. Auto-qualify (score 1-10)
3. Send personalized response + Calendly
4. Schedule discovery call
5. Call happens (notes captured)
6. Generate proposal
7. Send proposal + follow-up sequence
8. Close or nurture

### Content Production Workflow
1. Idea → Brief
2. Generate draft (AI)
3. Human review
4. Schedule for publish
5. Auto-post to Twitter
6. Monitor engagement
7. Repurpose to blog if performs well

### Client Delivery Workflow
1. Contract signed + deposit received
2. Kickoff call + access granted
3. Discovery + audit phase
4. Implementation phase
5. Training + handoff
6. Testimonial request (30 days post)
7. Referral ask (90 days post)

## Metrics Dashboard

### Weekly KPIs
- New leads
- Lead→Call conversion
- Call→Close conversion
- Revenue closed
- Content published
- Social engagement

### Monthly KPIs
- MRR
- Pipeline value
- Client satisfaction (NPS)
- Cost per acquisition
- Lifetime value
- Churn rate

## Maintenance

### Daily
- Check new leads
- Review content performance
- Monitor project status

### Weekly
- Generate business report
- Review financials
- Plan content calendar
- Update sales pipeline

### Monthly
- P&L analysis
- Strategy review
- Pricing optimization
- Goal progress check

## Support

For questions or issues:
- **Docs:** https://docs.openclaw.ai
- **Discord:** https://discord.com/invite/clawd
- **Email:** alec@theonegroup.info