# AI Assessment Skill

Analyze business owner interview transcripts to identify automation opportunities, recommend tools, and generate executive-ready reports.

## What This Skill Does

Transforms raw interview transcripts into structured AI opportunity assessments. Perfect for consultants, agencies, and automation specialists who conduct discovery calls with business owners.

The skill extracts:
- Top automation opportunities ranked by impact
- Specific tool recommendations with alternatives
- Time savings estimates (hours/week)
- Implementation difficulty scoring
- Quick-win identification

## Usage

```bash
# Analyze a transcript file
openclaw run ai-assessment --transcript ~/interviews/client-call.txt

# Analyze with custom output path
openclaw run ai-assessment --transcript ~/interviews/client-call.txt --output ~/reports/

# Generate Gamma-ready report
openclaw run ai-assessment --transcript ~/interviews/client-call.txt --format gamma
```

## Input Format

**Source:** Raw transcript from 45-minute discovery call with business owner

**Supported formats:**
- Plain text (.txt)
- Markdown (.md)
- JSON with speaker labels (.json)

**Example Input Structure:**
```
[00:00:00] Interviewer: Thanks for joining. Can you tell me about your business?
[00:00:15] Owner: Sure, I run a 12-person digital marketing agency. We handle SEO, content, and PPC for e-commerce brands...
[00:02:30] Interviewer: What takes up most of your time day-to-day?
[00:02:45] Owner: Honestly? Client reporting eats up 8-10 hours every week. I pull data from 5 different platforms...
[00:05:15] Interviewer: How do you handle lead follow-up?
[00:05:30] Owner: That's another pain point. We get leads from the website but I know we're dropping the ball on follow-up...
```

## Analysis Prompt

Use this exact prompt when analyzing transcripts:

```
You are an AI automation consultant analyzing a business owner interview transcript.

TASK: Extract and analyze automation opportunities from the transcript below.

ANALYSIS FRAMEWORK:
1. Listen for mentions of:
   - Time-consuming manual tasks
   - Repetitive work patterns
   - Data entry or copying between systems
   - Follow-up delays or drops
   - Reporting overhead
   - Scheduling/appointment friction
   - Communication bottlenecks
   - Error-prone processes

2. For each opportunity identified:
   - Name the workflow/process clearly
   - Estimate current time spent (hours/week)
   - Identify specific tools mentioned or implied
   - Assess implementation complexity
   - Flag if it's a "quick win" (implementable in <1 week)

OUTPUT FORMAT - Return ONLY valid JSON:

{
  "businessProfile": {
    "companyType": "string",
    "teamSize": "string",
    "industry": "string",
    "primaryPainPoints": ["string"]
  },
  "automationOpportunities": [
    {
      "rank": 1,
      "opportunityName": "string",
      "description": "string",
      "currentProcess": "string",
      "toolsMentioned": ["string"],
      "toolRecommendations": [
        {
          "tool": "string",
          "rationale": "string",
          "cost": "string",
          "alternative": "string"
        }
      ],
      "timeSavings": {
        "hoursPerWeek": number,
        "calculationBasis": "string"
      },
      "implementation": {
        "difficulty": 1-5,
        "difficultyLabel": "Easy|Moderate|Complex|Advanced|Enterprise",
        "estimatedDays": number,
        "quickWin": true|false,
        "prerequisites": ["string"]
      },
      "roiEstimate": {
        "annualHoursSaved": number,
        "hourlyValue": number,
        "annualValue": number
      },
      "confidence": "High|Medium|Low"
    }
  ],
  "summary": {
    "totalOpportunities": number,
    "quickWins": number,
    "totalWeeklyHoursSaved": number,
    "totalAnnualValue": number,
    "recommendedPriority": ["opportunityName"]
  }
}

RULES:
- Include 5-7 opportunities minimum, 10 maximum
- Be specific with tool names ("Zapier" not "automation tool")
- Difficulty scale: 1=Easy (Zapier), 3=Moderate (API integration), 5=Complex (custom development)
- Time savings must have explicit calculation basis from transcript
- Quick wins = implementable in under 1 week with existing tools
- If business size isn't clear, infer from context
- Mark confidence as "Low" if opportunity is speculative

TRANSCRIPT TO ANALYZE:
[INSERT TRANSCRIPT HERE]
```

## Output Format

### JSON Structure

```json
{
  "businessProfile": {
    "companyType": "12-person digital marketing agency",
    "teamSize": "12",
    "industry": "Marketing Services",
    "primaryPainPoints": [
      "Manual client reporting consuming 8-10 hours/week",
      "Inconsistent lead follow-up",
      "Data scattered across 5+ platforms"
    ]
  },
  "automationOpportunities": [
    {
      "rank": 1,
      "opportunityName": "Automated Client Reporting",
      "description": "Consolidate data from GA4, Facebook Ads, Google Ads, and SEO tools into automated weekly client dashboards",
      "currentProcess": "Manual data pulling and report creation in Google Sheets taking 8-10 hours weekly",
      "toolsMentioned": ["Google Analytics", "Facebook Ads Manager", "Google Ads", "Google Sheets"],
      "toolRecommendations": [
        {
          "tool": "Make (formerly Integromat)",
          "rationale": "More affordable than Zapier at scale, better data transformation capabilities",
          "cost": "$9-16/month (Core plan)",
          "alternative": "Zapier ($19.99/month+)"
        }
      ],
      "timeSavings": {
        "hoursPerWeek": 8,
        "calculationBasis": "Owner stated 8-10 hours on reporting; conservatively estimating 8 hours with automation"
      },
      "implementation": {
        "difficulty": 3,
        "difficultyLabel": "Moderate",
        "estimatedDays": 5,
        "quickWin": false,
        "prerequisites": ["API access to all ad platforms", "Client approval on report format"]
      },
      "roiEstimate": {
        "annualHoursSaved": 416,
        "hourlyValue": 150,
        "annualValue": 62400
      },
      "confidence": "High"
    },
    {
      "rank": 2,
      "opportunityName": "Lead Response Automation",
      "description": "Instant email/SMS response to new leads with qualification questions and meeting booking",
      "currentProcess": "Manual email checking and delayed responses, often 24-48 hours",
      "toolsMentioned": ["Website form", "Email"],
      "toolRecommendations": [
        {
          "tool": "Instantly.ai",
          "rationale": "Purpose-built for agency lead follow-up with built-in meeting scheduling",
          "cost": "$37-97/month",
          "alternative": "Reply.io"
        }
      ],
      "timeSavings": {
        "hoursPerWeek": 3,
        "calculationBasis": "Owner mentioned 'dropping the ball' on follow-up; 15 min per lead × 12 leads/week"
      },
      "implementation": {
        "difficulty": 2,
        "difficultyLabel": "Easy",
        "estimatedDays": 2,
        "quickWin": true,
        "prerequisites": ["Website form integration access"]
      },
      "roiEstimate": {
        "annualHoursSaved": 156,
        "hourlyValue": 150,
        "annualValue": 23400
      },
      "confidence": "High"
    }
  ],
  "summary": {
    "totalOpportunities": 6,
    "quickWins": 2,
    "totalWeeklyHoursSaved": 22.5,
    "totalAnnualValue": 168750,
    "recommendedPriority": [
      "Automated Client Reporting",
      "Lead Response Automation",
      "Content Calendar Automation"
    ]
  }
}
```

## Gamma Report Template

Generate presentation-ready markdown for Gamma:

```markdown
# AI Automation Assessment
## [Client Name] — [Date]

---

## Executive Summary

**Business:** [companyType] | **Team Size:** [teamSize]

| Metric | Value |
|--------|-------|
| **Opportunities Identified** | [totalOpportunities] |
| **Quick Wins** | [quickWins] |
| **Weekly Hours Recoverable** | [totalWeeklyHoursSaved] hrs |
| **Estimated Annual Value** | $[totalAnnualValue] |

### Recommended Priority
1. [opportunityName #1]
2. [opportunityName #2]
3. [opportunityName #3]

---

## Top Automation Opportunities

### #1: [Opportunity Name]
**Difficulty:** [difficultyLabel] | **Quick Win:** [Yes/No]

**Current State:**
[currentProcess]

**Proposed Solution:**
[description]

**Recommended Tools:**
| Tool | Rationale | Cost |
|------|-----------|------|
| [tool] | [rationale] | [cost] |
| Alternative: [alternative] |

**Time Impact:**
- Weekly savings: [hoursPerWeek] hours
- Annual hours recovered: [annualHoursSaved]
- Estimated annual value: $[annualValue]

**Implementation:**
- Difficulty: [difficulty]/5
- Timeline: [estimatedDays] days
- Prerequisites: [prerequisites]

---

### #2: [Opportunity Name]
[Repeat structure...]

---

## Implementation Roadmap

### Phase 1: Quick Wins (Week 1-2)
| Opportunity | Tool | Effort |
|-------------|------|--------|
| [quick win #1] | [tool] | [days] days |
| [quick win #2] | [tool] | [days] days |

### Phase 2: Core Automations (Week 3-6)
| Opportunity | Tool | Effort |
|-------------|------|--------|
| [core opp #1] | [tool] | [days] days |

### Phase 3: Advanced (Month 2+)
| Opportunity | Tool | Effort |
|-------------|------|--------|
| [advanced opp] | [tool] | [days] days |

---

## Investment Summary

| Category | Details |
|----------|---------|
| **Tools** | [List monthly costs] |
| **Implementation** | [Est. setup cost or DIY] |
| **Total First Year** | [Combined cost] |
| **ROI** | [Annual value / cost] |

---

## Next Steps

1. **Prioritize** — Review and confirm opportunity rankings
2. **Plan** — Schedule implementation phases
3. **Build** — Set up first quick win within 48 hours
4. **Measure** — Track time savings after 30 days

---

*Assessment generated from interview transcript analysis*
```

## Sample Transcript for Testing

Use this sample to test the skill:

```
[00:00:00] Consultant: Thanks for taking the time today, Sarah. Can you walk me through what your company does?
[00:00:10] Sarah: Absolutely. I'm the founder of GrowthLabs — we're a boutique marketing agency specializing in DTC e-commerce brands. We have about 15 people on the team, mostly account managers and creatives.
[00:00:45] Consultant: What does your typical week look like? Where does most of your time go?
[00:01:00] Sarah: Honestly? It's embarrassing. I spend probably 10-12 hours every week just pulling reports for clients. I have to log into Shopify, Klaviyo, Facebook Ads, Google Ads, and Google Analytics, pull all the numbers, copy them into Google Sheets, and then format them into something readable. Every. Single. Week.
[00:01:45] Consultant: That sounds painful. Is there any part of that you could automate?
[00:02:00] Sarah: I've thought about it, but I don't know where to start. We tried DashThis for a while but it was expensive and the clients didn't love the format.
[00:02:30] Consultant: What about new business? How do you handle leads?
[00:02:45] Sarah: That's our other big gap. We get maybe 8-10 leads a week through the website, but I know we're slow to respond. Sometimes it takes me 24-48 hours to get back to them because I'm buried in those reports. I've definitely lost deals to faster agencies.
[00:03:30] Consultant: Are you using any CRM or automation there?
[00:03:40] Sarah: We have HubSpot, but it's basically just a database. Nothing automated happens when someone fills out the form.
[00:04:00] Consultant: What about client onboarding? How does that work?
[00:04:15] Sarah: It's manual too. When someone signs, I send them a welcome email with a Google Form for their brand assets, then I have to chase them for logos, copy, access to their accounts... that whole dance takes 2-3 weeks sometimes.
[00:05:00] Consultant: Any other repetitive tasks that come to mind?
[00:05:15] Sarah: Oh, social media. We're supposed to be posting thought leadership content, but it never happens consistently because everyone is busy. We have like 20 half-written posts sitting in Notion.
[00:05:45] Consultant: What about your own marketing? How do you handle that?
[00:06:00] Sarah: That's the irony — we're so busy doing client work that we neglect our own marketing. I know I should be emailing our list regularly, but it happens maybe once a month when I find time to write something.
[00:06:45] Consultant: If you could wave a magic wand and automate three things, what would they be?
[00:07:00] Sarah: Definitely the reporting first. Then lead follow-up — I'd love instant responses with a calendar link. And probably getting those social posts actually published instead of just sitting in drafts.
```

## Tool Categories & Recommendations

### Reporting & Analytics
- **Make (Integromat)** — Best value for data-heavy workflows
- **Zapier** — Easiest to learn, more expensive at scale
- **SyncWith** — Purpose-built for marketing reports
- **Funnel.io** — Enterprise marketing data aggregation

### Lead Response
- **Instantly.ai** — Agency-focused cold email + follow-up
- **Reply.io** — Multi-channel sequences (email + LinkedIn)
- **GHL (GoHighLevel)** — All-in-one with built-in automation
- **Calendly + Mailchimp** — Budget combo

### Content & Social
- **Make + Buffer** — Schedule from Notion/database
- **Repurpose.io** — Auto-distribute content across channels
- **Hypefury** — Twitter/thread automation
- **Copy.ai / Jasper** — AI-assisted content creation

### CRM & Onboarding
- **HubSpot Workflows** — If already paying for HubSpot
- **Airtable Automations** — Visual, flexible
- **Typeform + Make** — Beautiful onboarding flows
- **Pipefy** — Process-centric onboarding

### Email Marketing
- **Beehiiv** — Newsletter + automation hybrid
- **ConvertKit** — Creator-focused sequences
- **Klaviyo** — If already in e-commerce ecosystem

## Difficulty Scale Reference

| Score | Label | Description | Examples |
|-------|-------|-------------|----------|
| 1 | Easy | No-code, template-based | Zapier zaps, Calendly scheduling |
| 2 | Simple | No-code with some config | Email sequences, basic integrations |
| 3 | Moderate | API connections, data mapping | Multi-platform reporting, webhooks |
| 4 | Complex | Custom logic, conditional flows | Multi-step approval chains, AI classification |
| 5 | Advanced | Custom dev, significant architecture | Full system integration, ML pipelines |

## Tips for Best Results

**When interviewing business owners:**
- Ask "How many hours per week do you spend on...?" (quantifies savings)
- Probe on tool stack — specific tools mentioned = better recommendations
- Listen for emotional pain: "embarrassing," "nightmare," "always falls through"
- Ask about failed attempts — shows what to avoid
- End with "magic wand" question to surface hidden priorities

**When analyzing:**
- Be conservative on time savings — better to under-promise
- Always suggest alternatives — businesses have different budget constraints
- Flag integration risks — tools that don't play well with existing stack
- Note confidence level — don't present speculation as fact

## Requirements

- Transcript file (text format)
- Claude or GPT-4 for analysis (required for quality extraction)
- Optional: Gamma account for presentation generation

## Installation

```bash
clawhub install ai-assessment
```

---

*Built for automation consultants who want to turn conversations into concrete implementation plans.*
