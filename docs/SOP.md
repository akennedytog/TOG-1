# 📋 The One Group - Standard Operating Procedures

**Last Updated:** 2026-03-22  
**Owner:** Opal (Organization Agent)  
**Applies To:** All Agents and Human Operators

---

## Table of Contents

1. [Lead Research Process](#1-lead-research-process)
2. [Email Template Creation](#2-email-template-creation)
3. [Content Creation Workflow](#3-content-creation-workflow)
4. [Automation Setup Steps](#4-automation-setup-steps)
5. [Dashboard Usage](#5-dashboard-usage)

---

## 1. Lead Research Process

### Purpose
Systematically identify, qualify, and prepare leads for outreach campaigns.

### Frequency
- **Daily:** Arlo runs market monitoring
- **Weekly:** Deep research on target industries
- **As needed:** Specific prospect research

### Procedure

#### Step 1: Define Target Criteria (5 min)
```
Required Criteria:
- Industry: HVAC, Legal, Accounting (expandable)
- Location: South Florida (Miami-Dade, Broward, Palm Beach)
- Business size: 5-50 employees
- Pain signals: Growing business, multiple locations, seasonal demand

Scoring Rubric (1-10):
- Website quality (1-3)
- Company size fit (1-2)
- Pain point visibility (1-3)
- Competition level (1-2)
```

#### Step 2: Execute Web Scraping (15-30 min)
```bash
# Method: Firecrawl skill
openclaw skills run firecrawl-search --query "HVAC companies Miami"

# Output saved to: ~/.openclaw/workspace/.firecrawl/
# Files created: {website}.md with extracted data
```

#### Step 3: Data Extraction (10 min)
Extract for each business:
- Company name
- Website URL
- Phone number
- Physical address
- Services offered
- Years in business
- Team size (if available)

#### Step 4: Lead Scoring (10 min)
Apply scoring rubric from Step 1.

**Score 8+ = Qualified Lead**
**Score 6-7 = Monitor for future**
**Score <6 = Discard**

#### Step 5: Enrichment (10 min)
Add to each qualified lead:
- Specific pain points identified
- Nearby competitor reference
- Local city/neighborhood context
- Recent news or events

#### Step 6: File Update (5 min)
```bash
# Save to findings file
cat >> ~/.openclaw/workspace/data/arlo_findings.json << EOF
{
  "name": "Company Name",
  "industry": "HVAC",
  "city": "Miami",
  "website": "https://...",
  "phone": "(305) ...",
  "score": 9,
  "notes": "Specific findings..."
}
EOF
```

#### Step 7: Handoff to Iris
Trigger: `arlo_findings.json` updated
Method: File-based (Iris monitors for changes)
Notification: None needed (automated)

### Quality Checklist
- [ ] All required fields populated
- [ ] Score justified with notes
- [ ] Minimum 5 leads per batch
- [ ] Industry variety maintained
- [ ] Contact info verified

### Output
- `data/arlo_findings.json` - Updated with new leads
- `data/scraped_leads.json` - Raw data backup

---

## 2. Email Template Creation

### Purpose
Create personalized, industry-specific email templates and follow-up sequences.

### Frequency
- **Initial:** Create base templates for each industry
- **Ongoing:** Refine based on performance data
- **As needed:** New industry expansion

### Procedure

#### Step 1: Analyze Industry (10 min)
```
Research:
- Common pain points
- Industry terminology
- Seasonal patterns
- Decision maker titles
- Typical sales cycle

Sources:
- Arlo's research notes
- Client interviews
- Industry publications
- Competitor messaging
```

#### Step 2: Define Value Proposition (5 min)
```
Template: For {Industry}, we solve {Pain Point} by {Solution}

Example HVAC:
"For HVAC companies, we capture emergency calls during peak season 
so you never miss revenue when your techs are in the field."

Example Legal:
"For law firms, we ensure 100% of intake calls get answered with 
proper qualification so you never miss a case."
```

#### Step 3: Create Cold Email Template (15 min)
```json
{
  "industry": "hvac",
  "template": {
    "subject": "{{company_name}} — ready for the busy season rush?",
    "body": "Hi {{first_name}},\n\nI was looking at {{company_name}}'s reviews...",
    "tone": "casual, empathetic",
    "cta": "10-minute conversation"
  },
  "variables": {
    "required": ["first_name", "company_name", "city"],
    "recommended": ["similar_company", "nearby_city"]
  }
}
```

#### Step 4: Build Follow-up Sequence (20 min)
Create 4-touch sequence:

**Touch 1 (Day 0):** Initial cold email
- Goal: Engagement
- Content: Problem + Solution

**Touch 2 (Day 4):** Social proof follow-up
- Goal: Build credibility
- Content: Case study/stats

**Touch 3 (Day 8):** Pattern break
- Goal: Direct ask
- Content: Easy out + specific ask

**Touch 4 (Day 15):** Channel switch
- Goal: Final attempt
- Content: LinkedIn message

#### Step 5: Add Compliance (5 min)
```
Required for all emails:
- Unsubscribe link
- Physical address
- Clear sender identification
- Truthful subject lines

Storage:
- Save opt-outs
- Honor within 24 hours
- Track in CRM/spreadsheet
```

#### Step 6: Template Storage (5 min)
```bash
# Update templates file
# Location: ~/.openclaw/workspace/data/iris_templates.json

Structure:
{
  "industries": {
    "{industry}": {
      "pain_points": [...],
      "templates": {
        "cold_email": {...},
        "value_prop": "..."
      }
    }
  },
  "linkedin_templates": {...},
  "compliance_notes": [...]
}
```

#### Step 7: Sequence Storage (5 min)
```bash
# Update sequences file
# Location: ~/.openclaw/workspace/data/iris_sequences.json

Structure:
{
  "{industry}": {
    "sequence": [
      {"touch": 1, "day": 0, ...},
      {"touch": 2, "day": 4, ...}
    ]
  }
}
```

### Quality Checklist
- [ ] Subject line under 50 characters
- [ ] Body under 150 words
- [ ] Personalization variables identified
- [ ] Tone matches industry
- [ ] Clear CTA included
- [ ] Compliance requirements met
- [ ] Follow-up timing documented

### Output
- `data/iris_templates.json` - Templates by industry
- `data/iris_sequences.json` - Follow-up sequences

---

## 3. Content Creation Workflow

### Purpose
Produce consistent, high-quality content for marketing channels.

### Frequency
- **Twitter:** 2x daily (morning + afternoon)
- **Blog:** 2x weekly (Monday + Thursday)
- **Visual assets:** As needed

### Procedure

#### Step 1: Topic Selection (5 min)
```
Sources:
- Content calendar (content-calendar.json)
- Agent requests (Iris needs sales content)
- Trending topics (Arlo monitoring)
- Evergreen topics (FAQ, case studies)

Selection criteria:
- Relevance to target audience
- Supports business goals
- Has unique angle
- Can be executed quickly
```

#### Step 2: Content Type Decision (2 min)
```
Choose format:
- Thread (5 tweets) → Complex topics
- Single tweet → Quick insights
- Poll → Engagement
- Blog post → Deep dives
- Visual → Data/infographics
```

#### Step 3: Research (10 min)
```
Gather:
- Supporting data/statistics
- Relevant examples
- Competitor content (for differentiation)
- Visual references

Store:
- Links in notes
- Screenshots if relevant
- Key stats highlighted
```

#### Step 4: Drafting (15-30 min)

**For Twitter Threads:**
```
Structure:
1/ Hook (controversial or counter-intuitive)
2/ Problem/Context
3/ Data/Proof
4/ Solution/Insight
5/ CTA

Rules:
- Tweet 1 must stand alone
- Each tweet builds on previous
- Clear thread markers (1/5, 2/5)
- Strong CTA in final tweet
```

**For Single Tweets:**
```
Structure:
- Hook (first 2-3 words)
- Insight/Value
- Optional: CTA

Rules:
- Under 280 characters
- No hashtags (not 2026 style)
- One clear idea
- Punchy language
```

**For Blog Posts:**
```
Structure:
- Title (SEO optimized)
- Hook intro
- Problem statement
- Solution walkthrough
- Case study/example
- Conclusion + CTA

Rules:
- 800-1500 words
- H2/H3 headers
- Internal links
- Meta description
```

#### Step 5: Brand Voice Check (5 min)
```
The One Group Voice:
✓ Thought leader (confident, authoritative)
✓ Approachable (not academic)
✓ Witty (occasional humor)
✓ Data-backed (claims supported)
✗ Corporate speak
✗ Over-promising
✗ Generic advice
```

#### Step 6: CTA Addition (2 min)
```
Every piece needs CTA:
- Threads: "DM me for..."
- Singles: "DM me..." or "Reply with..."
- Blogs: Email signup or service inquiry
- Visuals: Website link
```

#### Step 7: Storage (5 min)
```bash
# Save to content library
# Location: ~/.openclaw/workspace/data/dante_twitter_content.json

Structure:
{
  "date": "2026-03-22",
  "content": [
    {
      "type": "thread",
      "topic": "...",
      "tweets": [...]
    },
    {
      "type": "single",
      "topic": "...",
      "text": "..."
    }
  ]
}
```

#### Step 8: Scheduling (5 min)
```bash
# Add to posting queue
# post_tweet.py handles canonical posting (scheduler wrappers may call it)

Timing:
- Morning post: 9-10 AM EST
- Afternoon post: 2-3 PM EST
- Blog: Monday morning
- Newsletter: Thursday morning
```

### Quality Checklist
- [ ] Hook is compelling
- [ ] Brand voice consistent
- [ ] CTA included
- [ ] Length appropriate
- [ ] Spelling/grammar checked
- [ ] Links verified (if any)
- [ ] Topic relevant

### Output
- `data/dante_twitter_content.json` - Content library
- Blog posts in `theonegroup-site/blog/`
- Visual assets in workspace

---

## 4. Automation Setup Steps

### Purpose
Configure and maintain automated workflows across the agent system.

### Frequency
- **Initial:** One-time setup
- **Ongoing:** Weekly optimization
- **As needed:** New automation

### Procedure

#### Step 1: Identify Automation Opportunity (10 min)
```
Questions:
- Is this task repetitive?
- Does it have clear inputs/outputs?
- Can it run without human judgment?
- What's the error cost if it fails?

Priority Matrix:
High frequency + Low error cost = Automate first
High frequency + High error cost = Automate with monitoring
Low frequency + Any cost = Manual or semi-automated
```

#### Step 2: Design Workflow (15 min)
```
Map out:
1. Trigger (what starts it?)
2. Steps (what happens?)
3. Decision points (if/then logic)
4. Output (what's produced?)
5. Error handling (what if it fails?)

Example - Lead Follow-up:
Trigger: New lead added to arlo_findings.json
Steps: 
  - Iris creates personalized sequence
  - Rico schedules emails
  - System tracks replies
Decision: If reply → stop sequence, notify Iris
Output: Updated lead status
Error: If email bounces → mark invalid, notify Arlo
```

#### Step 3: Choose Automation Method (5 min)
```
Options:
1. Cron jobs (time-based)
   - Daily/weekly tasks
   - Content posting
   - Report generation

2. File watchers (event-based)
   - New lead → trigger outreach
   - Content created → trigger review
   - Task completed → trigger next

3. API integrations (external triggers)
   - Webhook from Calendly
   - Form submission
   - Email received

4. Agent triggers (internal)
   - Task queue system
   - Agent-specific scheduling
```

#### Step 4: Implementation (30-60 min)

**For Cron Jobs:**
```bash
# Edit CRON_SETUP.md with schedule
# Add to system with:
crontab -e

Example:
0 9 * * * cd /path && node script.js >> log.txt 2>&1
```

**For File Watchers:**
```javascript
// Pseudo-code for file watching
const fs = require('fs');

fs.watch('data/arlo_findings.json', (eventType) => {
  if (eventType === 'change') {
    // Trigger Iris workflow
    require('./agents/iris/handler.js').processNewLeads();
  }
});
```

**For API Integrations:**
```bash
# Setup webhook endpoint
# Store in: backend/webhook-handler.js

# Configure external service with webhook URL
# Test with sample payload
```

#### Step 5: Testing (15 min)
```
Test checklist:
- Run automation manually first
- Verify output is correct
- Check error handling
- Test edge cases
- Confirm logging works

Red flags:
- Silent failures
- Infinite loops
- Resource exhaustion
- Data corruption
```

#### Step 6: Monitoring Setup (10 min)
```bash
# Add to Rico's monitoring
# Update: data/agent-tasks.json with task tracking

Monitoring items:
- Success/failure rate
- Execution time
- Resource usage
- Error logs
```

#### Step 7: Documentation (10 min)
```
Document in:
- CRON_SETUP.md (for cron jobs)
- AGENT_WORKFLOW.md (for agent triggers)
- SOP.md (for manual procedures)

Include:
- What it does
- How often it runs
- Who to contact if it fails
- How to restart it
```

#### Step 8: Activation (5 min)
```bash
# Enable automation
# Start monitoring
# Confirm first run successful
```

### Quality Checklist
- [ ] Tested end-to-end
- [ ] Error handling in place
- [ ] Logging configured
- [ ] Monitoring active
- [ ] Documented thoroughly
- [ ] Rollback plan ready

### Output
- `CRON_SETUP.md` - Cron schedules
- `AGENT_WORKFLOW.md` - Automation flows
- System logs - Execution history

---

## 5. Dashboard Usage

### Purpose
Centralized view of system status, tasks, and key metrics.

### Location
```
Dashboard files:
- data/agent-tasks.json - Task queue
- data/weekly-report.json - Business metrics
- cost-dashboard.js - Cost tracking
- twitter-analytics.json - Social metrics
```

### Procedure

#### Step 1: Access Dashboard
```bash
# Command line view
cat ~/.openclaw/workspace/data/agent-tasks.json | jq '.today'

# Summary view
node cost-dashboard.js
```

#### Step 2: Review Task Queue (2 min)
```
Check:
- Pending tasks by agent
- Overdue tasks
- Blocked tasks
- Completed today

Action items:
- Unblock stalled tasks
- Reassign if needed
- Escalate if failing
```

#### Step 3: Check System Health (2 min)
```
Metrics to monitor:
- Agent uptime
- API rate limits
- File system health
- Cron job status

Alerts:
- Rate limit warnings
- Failed tasks
- Missing data
```

#### Step 4: Review Key Metrics (3 min)
```
Daily metrics:
- New leads found (Arlo)
- Emails sent (Iris)
- Content created (Dante)
- Tasks completed (Rico)
- Tools built (Dev)

Weekly metrics:
- Total leads qualified
- Conversion rate
- Content engagement
- System uptime
- Cost per lead
```

#### Step 5: Identify Blockers (2 min)
```
Common blockers:
- Missing data inputs
- API rate limits
- Failed dependencies
- Human review needed

Resolution:
- Auto-resolve if possible
- Escalate to Dev for technical
- Queue for Abby review
- Flag for human intervention
```

#### Step 6: Plan Next Actions (2 min)
```
Based on dashboard:
- Prioritize blocked tasks
- Adjust resource allocation
- Schedule new initiatives
- Update priorities
```

### Dashboard Commands

```bash
# View all tasks
openclaw skills run task-tracker --action status

# View agent-specific tasks
cat data/agent-tasks.json | jq '.today[] | select(.agent == "arlo")'

# Check system costs
node cost-dashboard.js

# View weekly report
cat data/weekly-report.json

# Check Twitter analytics
cat twitter-analytics.json
```

### Quality Checklist
- [ ] Reviewed daily
- [ ] Blockers identified
- [ ] Metrics recorded
- [ ] Actions assigned
- [ ] Trends noted

### Output
- Updated task priorities
- Blocker resolutions
- Metric recordings
- Action items

---

## Quick Reference: File Locations

| File | Purpose | Owner |
|------|---------|-------|
| `data/agent-tasks.json` | Task queue | Rico |
| `data/arlo_findings.json` | Lead research | Arlo |
| `data/iris_templates.json` | Email templates | Iris |
| `data/iris_sequences.json` | Follow-up sequences | Iris |
| `data/dante_twitter_content.json` | Content library | Dante |
| `data/weekly-report.json` | Business metrics | Jerry |
| `CRON_SETUP.md` | Automation schedule | Rico |
| `OPERATING.md` | Business principles | All |

---

## Revision History

| Date | Change | Author |
|------|--------|--------|
| 2026-03-22 | Initial SOP creation | Opal |

---

**Questions?** Refer to `docs/AGENT_WORKFLOW.md` for detailed agent processes.
