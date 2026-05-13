# 🧠 Long-Term Memory

This file contains curated memories and insights worth keeping across sessions.

## Cost-Conscious Model Preferences (2026-03-14)

**Alec wants to minimize API costs.** Default to Ollama (free) for everything. Only use paid models (Claude/OpenAI) when:
- Task clearly exceeds Ollama's capabilities
- Complex reasoning or nuanced analysis needed
- Specific vision/model features required
- Explicitly requested

**Preference order:**
1. `ollama/kimi-k2.5:cloud` — FREE, use for 95% of tasks
2. `anthropic/claude-3-5-sonnet-20241022` — $3/15 per 1M tokens, use when Ollama isn't enough
3. `openai/gpt-4o` — $2.50/10 per 1M tokens, alternative when Claude unavailable
4. Cheaper options (Haiku, GPT-4o-mini) — for quick paid tasks only

**Always ask before switching to paid models unless clearly justified.**

---

## 🔑 Anthropic API Key (2026-05-11)

**Key:** `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`

**Use:** For Claude 3.5 Sonnet subagents when needed
**Stored:** 2026-05-11
**Security:** Keep private - do not commit to git

---

## Free Automation Systems Created (2026-03-20)

### 1. Referral Program Automation - READY TO IMPLEMENT
**Location:** `REFERRAL_PROGRAM_SETUP.md`
**Cost:** FREE
**Expected ROI:** $2,500-7,500/quarter
- Google Sheets tracker for referrals
- 3 email templates + social media templates
- $250 reward for successful referrals

### 2. Email Nurture Sequence - READY TO IMPLEMENT
**Location:** `EMAIL_NURTURE_SEQUENCE.md`
**Cost:** FREE (Gmail + Boomerang or Mailchimp free tier)
**Expected ROI:** 3-4x lead conversion improvement
- 5-email sequence for non-converting leads
- Expected: 20 leads/month → 3-4 customers

### 3. Testimonial Collection System - READY TO IMPLEMENT
**Location:** `TESTIMONIAL_COLLECTION_SETUP.md`
**Cost:** FREE
**Expected ROI:** +34% conversion rate
- Google Form + email templates
- $50 text, $150 video rewards

---

## Netlify Deployment Info (The One Group Site)

**Site ID:** a70736d7-9776-4d0e-9908-0f5402a5e16d
**Site Name:** theonegroup
**Deploy Command:**
```bash
cd ~/.openclaw/workspace/theonegroup-site && netlify deploy --prod
```
**Site URL:** https://theonegroup.info
**Deploy logs:** https://app.netlify.com/projects/theonegroup

**File Structure:**
- Site root: `~/.openclaw/workspace/theonegroup-site/`
- Blog posts: `~/.openclaw/workspace/theonegroup-site/blog/`
- Main config: `~/.openclaw/workspace/theonegroup-site/netlify.toml`

**Quick Deploy Process:**
1. Copy new files to `theonegroup-site/` directory
2. Run: `cd ~/.openclaw/workspace/theonegroup-site && netlify deploy --prod`
3. Check deploy status at: https://app.netlify.com/projects/theonegroup

---

## Service Portfolio (LIVE)

| Service | Price | Type |
|---------|-------|------|
| **AI Visibility Audit** | $2,500 | One-time assessment |
| **AI Optimization** | $2,500-$10,000 | Implementation |
| **AI Coaching** | $1,500-$7,500 | Training |
| **Competitor Intel** | $297/month | Ongoing monitoring |

**Competitor Intel:** https://theonegroup.info/competitor-monitoring.html

---

## OpenClaw Integration - COMPLETE ✅ (March 22, 2026)

**8 Agent System Running:**
- **Arlo** - Lead research (20/day)
- **Dante** - Content creation (3 posts/day)
- **Iris** - Sales outreach (email sequences)
- **Abby** - Quality assurance
- **Dev** - Development tasks
- **Opal** - Operations
- **Rico** - Analytics
- **Jerry** - General support

**Daily Automation:**
- Lead discovery (9 AM)
- Content generation (8 AM, 12 PM)
- Twitter posts (9 AM, 3 PM, 9 PM)
- Email follow-ups (2 PM)
- Canva templates (10 AM)

---

## Twitter Content Strategy (Updated 2026-03-31)

**Status:** 45 tweets posted (Mar 19-30), API engagement tracking BROKEN

**Content Distribution (Actual):**
| Type | Count | Hypothesis |
|------|-------|------------|
| Industry pain points | 12 (27%) | Strong performer |
| Dollar amounts | 9 (20%) | Credibility builder |
| Building in public | 8 (18%) | Authority building |
| Polls/questions | 6 (13%) | Reply driver |
| Contrarian takes | 5 (11%) | Share magnet |
| Behind-the-scenes | 5 (11%) | Trust builder |

**DOUBLE DOWN (Based on Strategy):**
1. **Specific dollar amounts** - "$2,000+ per missed call", "$10,000+ per case"
2. **Local industry targeting** - South Florida cities + specific industries
3. **Seasonal urgency** - "Summer's coming" for HVAC, "Tax season" for accounting
4. **Polls with A/B/C/D** - Low friction engagement

**REDUCE (Low expected engagement):**
1. Generic AI takes without local hook
2. Technical details (npm, API references)
3. Broad statements without specificity

**Content Schedule:**
| Time | Type | Goal |
|------|------|------|
| 9:00 AM | Thread | Authority/education |
| 3:00 PM | Poll/Question | Drive replies |
| 9:00 PM | Behind-scenes | Build trust |

**CRITICAL ACTION NEEDED:**
- Twitter API v2 engagement endpoint broken
- Cannot verify actual likes/replies
- Need manual spot-check of real Twitter account
- Consider third-party analytics (Typefully, Tweet Hunter)

**Research Integration:**
- Dante pulls from Arlo's daily findings (90+ leads)
- Content references real businesses: West Palm Family Medicine, Coastal Law Partners
- Seasonal triggers based on industry patterns

---

## Key Metrics to Track

**Referral Program:** Referrals submitted → Conversions → Cost per referral ($250)
**Email Nurture:** Leads in sequence → Open rates → Click rates → Conversions
**Testimonials:** Asked → Received → Published

---

## Truerep.com Project (On Hold)

**Concept:** Anonymous verified professional reputation platform
**URL:** https://theonegroup.info/truerep.html
**Status:** MVP landing page live, concept validated
**Next Step:** Validate demand before building

---

## Tools Stack (All Free)

| Tool | Purpose |
|------|---------|
| Gmail | Email sending |
| Google Sheets | Tracking |
| Google Forms | Testimonial collection |
| Boomerang | Email scheduling (10/month free) |
| Mailchimp | Email automation (500 contacts free) |
| Calendly | Scheduling |

---

## Current Priorities (March 2026)

1. **Twitter content** - Research-driven posts daily
2. **Lead outreach** - Email sequences active
3. **Canva templates** - 3 new templates/week
4. **Engagement tracking** - Fix Twitter API analytics

---

*Full Twitter strategy history moved to: `memory/twitter-strategy-archive.md`*