# 🤖 The One Group - Agent Workflow Documentation

**Last Updated:** 2026-03-22  
**System:** OpenClaw Multi-Agent Framework  
**Agency:** The One Group

---

## 🎯 Agent System Overview

The One Group operates as a coordinated multi-agent system where each agent has a specialized role. Agents communicate through shared data files and follow standardized workflows.

### The Agent Team

| Agent | Role | Primary Function | Status |
|-------|------|------------------|--------|
| **Arlo** | Research Agent | Market research, lead discovery, competitive intelligence | ✅ Active |
| **Iris** | Sales & Marketing Agent | Outreach, email sequences, social media, conversion | ✅ Active |
| **Dante** | Content Agent | Blog posts, Twitter threads, visual assets, copywriting | ✅ Active |
| **Rico** | Automation Agent | System monitoring, workflow optimization, cron jobs | ✅ Active |
| **Dev** | Development Agent | Tool building, integrations, technical implementation | ✅ Active |
| **Abby** | Quality Agent | Review outputs, quality checks, consistency | ✅ Active |
| **Jerry** | Strategy Agent | Daily metrics, opportunity evaluation, decision support | ✅ Active |
| **Opal** | Organization Agent | Documentation, memory management, institutional knowledge | ✅ Active |

---

## 🔍 How Arlo Finds Leads

### Research Methodology

Arlo operates as the intelligence layer, finding signals before they become obvious.

**Research Areas:**
1. **South Florida Market** - Local businesses, competitors, opportunities
2. **AI Automation Trends** - New tools, techniques, best practices
3. **Competitor Intelligence** - What others are doing, pricing, positioning
4. **Lead Research** - Deep research on prospects before outreach
5. **Industry Monitoring** - HVAC, Legal, Accounting trends

### Lead Discovery Process

```
1. DEFINE TARGET
   └── Industry, location, company size criteria
   
2. WEB SCRAPING
   └── Firecrawl to extract business data
   └── Store in: ~/.openclaw/workspace/data/scraped_leads.json
   
3. SCORING & QUALIFICATION
   └── Score 1-10 based on:
       - Website quality
       - Company size
       - Pain point signals
       - Competition level
   └── Store in: ~/.openclaw/workspace/data/arlo_findings.json
   
4. ENRICHMENT
   └── Phone numbers
   └── Addresses
   └── Business details
   └── Recent news
   
5. HANDOFF TO IRIS
   └── High-quality leads (score 8+)
   └── Trigger: "arlo_findings.json updated"
```

### Output Files
- `data/arlo_findings.json` - Qualified leads with scores
- `data/scraped_leads.json` - Raw scraped data
- `.firecrawl/*.md` - Individual business profiles

### Success Metrics
- Insights generated
- Opportunities identified
- Research quality (actionability)
- Lead scores (8+ = qualified)

---

## 💌 How Iris Creates Templates

### Template System Architecture

Iris manages the entire sales and marketing communication system, generating personalized templates at scale.

### Template Creation Workflow

```
1. RECEIVE LEAD DATA
   └── Source: arlo_findings.json
   └── Filter: Score 8+, specific industry
   
2. INDUSTRY ANALYSIS
   └── Identify pain points
   └── Research industry-specific language
   └── Find relevant case studies
   
3. TEMPLATE GENERATION
   └── Create for each industry:
       - Cold email template
       - Follow-up sequences (4 touches)
       - LinkedIn connection request
       - Value proposition
   └── Store in: ~/.openclaw/workspace/data/iris_templates.json
   
4. SEQUENCE BUILDING
   └── Day 0: Initial email
   └── Day 4: Follow-up with social proof
   └── Day 8: Pattern break / direct ask
   └── Day 15: LinkedIn final touch
   └── Store in: ~/.openclaw/workspace/data/iris_sequences.json
   
5. PERSONALIZATION RULES
   └── Required variables: {{first_name}}, {{company_name}}, {{city}}
   └── Recommended: {{similar_company}}, {{specific_challenge}}
   └── Compliance: CAN-SPAM, unsubscribe links
```

### Industry Templates Currently Active

| Industry | Pain Points | Templates Available |
|----------|-------------|---------------------|
| **HVAC** | Peak season overflow, after-hours emergencies | Cold email, 4-touch sequence, LinkedIn |
| **Legal** | Missed intake calls, case qualification | Cold email, 4-touch sequence, LinkedIn |
| **Accounting** | Tax season chaos, client communication | Cold email, 4-touch sequence, LinkedIn |

### Output Files
- `data/iris_templates.json` - Email templates by industry
- `data/iris_sequences.json` - Follow-up sequences
- `data/cold_outreach_campaign.md` - Consolidated campaign docs

### Success Metrics
- Leads generated
- Conversion rates
- Revenue closed
- Reply rates (target: 15-25%)

---

## ✍️ How Dante Writes Content

### Content Production Pipeline

Dante creates all content for The One Group, from Twitter threads to blog posts to visual assets.

### Content Creation Workflow

```
1. RECEIVE TOPIC / PROMPT
   └── Source: content-calendar.json
   └── Source: Agent request (Iris, Arlo, etc.)
   
2. CONTENT TYPE SELECTION
   └── Thread (5 tweets) → Thought leadership
   └── Single tweet → Quick insights
   └── Poll → Engagement
   └── Blog post → Deep dive
   └── Visual asset → Infographics, headers
   
3. CONTENT GENERATION
   └── Research supporting data
   └── Write in brand voice
   └── Include CTAs where appropriate
   └── Store in: ~/.openclaw/workspace/data/dante_twitter_content.json
   
4. BRAND VOICE APPLICATION
   └── Thought leader tone
   └── Insightful but approachable
   └── Witty when appropriate
   └── Data-backed claims
   
5. OUTPUT DELIVERY
   └── Twitter content → post_tweet.py (canonical)
   └── Blog content → theonegroup-site/blog/
   └── Visual assets → Image files in workspace
```

### Content Calendar (Weekly)

| Day | Morning | Afternoon |
|-----|---------|-----------|
| **Monday** | AI industry roundup | Thread on research paper |
| **Tuesday** | Community spotlight | TheOneGroupAI news/pitch |
| **Wednesday** | Quick AI tip/myth-bust | Comment on influencer thread |
| **Thursday** | Behind-the-scenes | Reaction to trending news |
| **Friday** | Week wrap-up | Fun poll or quiz |

### Output Files
- `data/dante_twitter_content.json` - Twitter content library
- `content-calendar.json` - Editorial calendar
- Image files (PNG) - Visual assets

### Success Metrics
- Content pieces created
- Engagement rates
- Click-through rates
- Lead generation from content

---

## ⚙️ How Rico Automates

### Automation System

Rico monitors, optimizes, and maintains all automated workflows across the agent system.

### Automation Responsibilities

```
1. SYSTEM HEALTH MONITORING
   └── Check: agent-tasks.json for stuck tasks
   └── Check: cron jobs execution
   └── Check: API rate limits
   └── Check: file system health
   └── Time: 08:00 daily
   
2. WORKFLOW OPTIMIZATION
   └── Analyze: task completion rates
   └── Identify: bottlenecks
   └── Optimize: timing and sequencing
   └── Time: 14:00 daily
   
3. CRON JOB MANAGEMENT
   └── Morning check (9 AM)
   └── Evening wrap (6 PM)
   └── Weekly review (Sunday 8 PM)
   └── Store config: ~/.openclaw/workspace/CRON_SETUP.md
   
4. ALERT HANDLING
   └── Rate limit warnings
   └── Failed task notifications
   └── Missing data alerts
   └── System health reports
```

### Automated Workflows

| Workflow | Trigger | Frequency | Output |
|----------|---------|-----------|--------|
| **Lead Research** | Morning cron | Daily | arlo_findings.json |
| **Content Posting** | Scheduled | 2x daily | Twitter/X posts |
| **Follow-up Sequences** | Lead added | As needed | Emails queued |
| **Weekly Report** | Sunday 8 PM | Weekly | Business metrics |
| **Health Check** | 08:00 daily | Daily | System status |

### Output Files
- `CRON_SETUP.md` - Automation schedule
- `data/agent-tasks.json` - Task tracking
- System logs in various `.log` files

### Success Metrics
- System uptime
- Task completion rate
- Automation efficiency
- Alert response time

---

## 🛠️ How Dev Builds Tools

### Development Process

Dev creates the tools, integrations, and technical infrastructure that power the agent system.

### Tool Building Workflow

```
1. RECEIVE REQUIREMENTS
   └── Source: Agent request or system need
   └── Define: success criteria
   └── Define: inputs/outputs
   
2. TECHNICAL DESIGN
   └── Choose: appropriate stack (Node.js, Python, etc.)
   └── Design: data structures
   └── Plan: integration points
   
3. IMPLEMENTATION
   └── Write: modular, documented code
   └── Test: end-to-end functionality
   └── Store: in appropriate workspace location
   
4. DOCUMENTATION
   └── Create: usage instructions
   └── Document: API/schema
   └── Store: in relevant .md files
   
5. DEPLOYMENT
   └── Deploy: to production (Netlify, etc.)
   └── Monitor: for issues
   └── Maintain: updates and fixes
```

### Active Tools & Infrastructure

| Tool | Purpose | Location | Status |
|------|---------|----------|--------|
| **Lead Manager** | Lead database operations | `data/` | ✅ Live |
| **Content Engine** | Content generation | `content-pipeline/` | ✅ Live |
| **Twitter Automation** | Social media posting | `post_tweet.py` (+ scheduler wrapper) | ✅ Live |
| **Weekly Report** | Business intelligence | `weekly-recap.js` | ✅ Live |
| **Scraping System** | Data collection | Firecrawl skills | ✅ Live |
| **Website** | Public presence | `theonegroup-site/` | ✅ Live |

### Output Files
- JavaScript/Python scripts
- HTML/CSS/JS websites
- API integrations
- Database schemas

### Success Metrics
- Tools shipped
- Bugs fixed
- System reliability
- Code quality

---

## 🔄 How Agents Work Together

### Inter-Agent Communication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      THE ONE GROUP AGENT SYSTEM                   │
└─────────────────────────────────────────────────────────────────┘

┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│   ARLO   │─────→│   IRIS   │─────→│  DANTE   │─────→│   RICO   │
│ Research │      │  Sales   │      │ Content  │      │Automation│
└──────────┘      └──────────┘      └──────────┘      └──────────┘
     │                 │                 │                 │
     │                 │                 │                 │
     ↓                 ↓                 ↓                 ↓
┌─────────────────────────────────────────────────────────────────┐
│                     SHARED DATA LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  arlo_findings.json  │  iris_templates.json  │  dante_content.json │
│  scraped_leads.json  │  iris_sequences.json  │  agent-tasks.json   │
└─────────────────────────────────────────────────────────────────┘

┌──────────┐      ┌──────────┐      ┌──────────┐
│   DEV    │      │   ABBY   │      │  JERRY   │
│  Tools   │      │ Quality  │      │ Strategy │
└──────────┘      └──────────┘      └──────────┘
     │                 │                 │
     └─────────────────┴─────────────────┘
                       │
                       ↓
              ┌──────────┐
              │   OPAL   │
              │   Docs   │
              └──────────┘
```

### Workflow Orchestration

#### Lead Generation Flow
```
1. Arlo scrapes websites → Finds leads
2. Arlo scores leads → Saves to arlo_findings.json
3. Iris reads findings → Creates templates
4. Iris sequences outreach → Saves to iris_sequences.json
5. Rico monitors execution → Ensures delivery
6. Abby reviews quality → Validates approach
7. Opal documents → Updates SOPs
```

#### Content Creation Flow
```
1. Rico triggers daily content job
2. Dante generates content → Saves to dante_twitter_content.json
3. Abby reviews content → Checks brand voice
4. Rico schedules posting → Queues for delivery
5. Dev monitors systems → Fixes any issues
6. Jerry analyzes performance → Recommends adjustments
```

#### Client Onboarding Flow
```
1. Iris closes deal → Triggers onboarding
2. Dev builds solution → Implements automation
3. Rico monitors systems → Ensures uptime
4. Abby reviews quality → Checks deliverables
5. Opal documents process → Updates SOPs
6. Jerry analyzes results → Refines approach
```

### Communication Protocol

1. **File-Based Communication**
   - Agents read/write JSON files in `data/` directory
   - File updates trigger next agent actions
   - Schema consistency maintained by Dev

2. **Task Queue System**
   - Centralized in `data/agent-tasks.json`
   - Each agent has assigned tasks with priorities
   - Rico monitors completion

3. **Documentation Standards**
   - All outputs documented by Opal
   - SOPs maintained in `docs/` directory
   - Memory updated in `MEMORY.md`

---

## 📋 Agent Task Schedule

| Time | Agent | Task |
|------|-------|------|
| 08:00 | Arlo | Research South Florida market |
| 08:00 | Rico | Check system health |
| 09:00 | Jerry | Review daily metrics |
| 09:30 | Iris | Send cold emails (10) |
| 10:00 | Dev | Build scheduled features |
| 10:00 | Jerry | Evaluate new opportunities |
| 10:30 | Dante | Create blog content |
| 11:00 | Abby | Review agent outputs |
| 11:00 | Dante | Create Twitter content |
| 12:00 | Arlo | Monitor competitor activity |
| 13:00 | Dante | Design visual assets |
| 14:00 | Iris | Follow up on leads |
| 14:00 | Rico | Optimize automation |
| 15:00 | Dev | Fix bugs |
| 16:00 | Opal | Review agent logs |
| 16:00 | Abby | Quality check |
| 17:00 | Opal | Update documentation |

---

## 🔧 Maintenance & Troubleshooting

### Common Issues

**Agent not producing output:**
- Check `data/agent-tasks.json` for stuck tasks
- Verify input files exist
- Review agent SOUL.md for correct operation

**Data out of sync:**
- Verify JSON file schemas
- Check file timestamps
- Review inter-agent handoff logic

**Automation failing:**
- Check cron job status
- Review Rico's system health logs
- Verify API credentials and rate limits

### Recovery Procedures

1. **Restart agent workflow:** Clear task queue, re-trigger from beginning
2. **Rebuild data files:** Re-run Arlo research, regenerate templates
3. **Reset automation:** Check Rico's cron config, restart services

---

**Document Owner:** Opal (Organization Agent)  
**Review Cycle:** Weekly (Sundays)  
**Questions?** Check `docs/SOP.md` for detailed procedures
