# 🧠 Long-Term Memory

This file contains curated memories and insights worth keeping across sessions.

---

## Model Routing Stack v5 - LIVE (Updated 2026-07-31 late) ✅

**v5 = Ollama Cloud first.** Alec has Ollama Pro (paid subscription) — cloud models = $0 marginal cost.

| Tier | Model | Use For | Cost |
|------|-------|---------|------|
| **Default** | `ollama/gpt-oss:120b-cloud` | ALL interactive sessions, standard work | $0 (Pro) |
| **Light** | `ollama/gpt-oss:20b-cloud` | Heartbeats, cron, triage, fallback | $0 (Pro) |
| **Premium** | `openrouter/moonshotai/kimi-k3` | MANUAL PIN ONLY — heavy builds | $3/$15 per 1M |
| **Local batch** | `ollama/llama3.1:latest` (direct API) | Arlo extraction, Iris drafting | $0 local |

- Fallback chain: 120b-cloud → 20b-cloud → openrouter gpt-5.6-luna
- kimi-k3:cloud exists on Ollama but bills as "extra usage" (not Pro-included) — same cost as OpenRouter, either provider works
- RETIRED: kimi-k2.5:cloud (retired by Ollama 2026-07-31), qwen3-coder as gateway default (too slow: >6min on 20k context, gateway timeout → "agent run failed")
- Canonical doc: routing-config.json v5. Cron jobs auto-inherit new default.
- Cron WhatsApp delivery targets set to +15024037201 (scout + supercharged were erroring 7x/13x on missing target)

*v4 stack preserved below for history*

---

## Model Routing Stack v4 - LIVE (Updated 2026-07-31) ✅

**Complete overhaul:** Replaced broken kimi-k2.5:cloud + stale OpenAI/Anthropic fallbacks with cost-optimized tiered system using local Ollama and OpenRouter.

### Current Stack

| Tier | Model | Use For | Cost |
|------|-------|---------|------|
| **Free Local** | `ollama/llama3.1:latest` | Chat, heartbeats, triage, summaries | **$0** |
| **Free Local** | `ollama/qwen3-coder:latest` | Standard coding, scripts, terminal | **$0** |
| **Cheap Cloud** | `openrouter/openai/gpt-5.6-luna` | Fast cloud backup, mid-tier tasks | **$1/$6 per 1M tokens** |
| **Premium Cloud** | `openrouter/moonshotai/kimi-k3` | Heavy coding, architecture, deep reasoning | **$3/$15 per 1M tokens** |

### Provider Status

| Provider | Key Status | Models Available |
|----------|-----------|------------------|
| Ollama (local) | ✅ No key needed | llama3.1, qwen3-coder |
| OpenRouter | ✅ Key set (`~/.openclaw/.env`) | kimi-k3, gpt-5.6-luna |
| Anthropic | ⚠️ Key present but billing disabled/credits too low | Excluded from auto-routing |
| OpenAI | ✅ Key present | Not in default fallback chain; OpenRouter preferred |

### Cost Estimate

**Previous:** $20/month ChatGPT Pro (mostly unused via API)  
**Current:** ~$3-6/month pay-as-you-go on OpenRouter + local models  
**Savings:** ~75% while getting stronger capabilities

### Removed (Dead/Broken)

- ~~`ollama/kimi-k2.5:cloud`~~ — Deprecated by Moonshot, required paid Ollama subscription
- ~~`anthropic/claude-3-5-sonnet-20241022`~~ — API account has insufficient credits as of 2026-07-31
- ~~`openai/gpt-5.3-codex`~~ — Stale/unavailable route
- ~~`openai/gpt-5.4-codex`~~ — Model not found in current OpenAI account
- ~~`openai/gpt-5.1-codex`~~ — Stale/unavailable route

### Files

- Config: `~/.openclaw/workspace/routing-config.json` (v4)
- Runtime config: `~/.openclaw/openclaw.json`
- Backup: `routing-config.json.bak.20260718_*`, `*.bak.model-fix.20260731_163545`
- Healthcheck: `scripts/model_routing_healthcheck.sh`

---

## Cost-Conscious Model Preferences (DEPRECATED - See v4 Stack Above)

*Old preference order (March 2026):*
1. ~~`ollama/kimi-k2.5:cloud`~~ — **BROKEN**, replaced with llama3.1 + qwen3-coder
2. ~~`anthropic/claude-3-5-sonnet-20241022`~~ — **BILLING DISABLED**, excluded from auto-routing
3. ~~`openai/gpt-4o`~~ — **REMOVED**, no key

*See "Model Routing Stack v4" above for current setup.*

---

## 🔑 Anthropic API Key (2026-05-11)

**Status:** Removed from `MEMORY.md` for security.
**Use:** Fallback only — kept for emergencies but routing prefers OpenRouter
**Storage policy:** Keep secrets in OpenClaw secret refs and/or local `.env` files outside tracked docs.

---

## OpenRouter API Key (2026-07-18)

**Status:** Active in `~/.openclaw/.env`
**Credits loaded:** $10
**Models:** kimi-k3, gpt-5.6-luna, gpt-5.6-luna-pro
**Provider:** OpenRouter.ai (aggregates Moonshot, OpenAI, and others)

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

## Netlify Deployment Info — AUTHORITATIVE SITE INVENTORY (2026-08-09)

**LIVE SITES (do not delete):**
| Site | Netlify ID | Serves | Project dir |
|------|-----------|--------|-------------|
| **theonegroup-v2** | `56446bc7-9070-44b6-84f3-aa0dd8b5277b` | theonegroup.info | `~/.openclaw/workspace/theonegroup-v2/` (Astro) |
| **pitrowmiami** | `7abc1027-310c-4712-971f-adb899d694b2` | pitrowmiami.com | `~/.openclaw/workspace/pitrowmiami-v2/` (Astro) |

**PAUSED reference (kept, do NOT deploy):**
- `theonegroup-site` static (id `2cead4bc` = `poetic-centaur-588295`) — OLD static HTML project, stale, NO consent/legal/ADA work. Kept as reference copy only. NEVER deploy from it.

**DELETED (throwaways, gone 2026-08-09):**
- old `theonegroup` (id `a70736d7`) — did not serve the domain
- `magenta-douhua-522f88` (id `83c2672f`) — accidental

**GOLDEN RULES:**
1. theonegroup.info → ALWAYS deploy from `theonegroup-v2/` (Astro). NEVER from `theonegroup-site/`.
2. pitrowmiami.com → ALWAYS deploy from `pitrowmiami-v2/` (Astro). NEVER from old `pitrowmiami/` static.
3. Deploying from a stale project overwrites the live site (happened 2026-08-09, restored).
- **Deploy logs:** https://app.netlify.com/projects/theonegroup-v2

**Deploy Command (WORKING METHOD — do not run from site dir):**
```bash
# theonegroup-v2: copy FULL dist/ to clean temp dir, link, deploy
rm -rf /tmp/tog-full && mkdir -p /tmp/tog-full
cp -r ~/.openclaw/workspace/theonegroup-v2/dist/* /tmp/tog-full/
cp ~/.openclaw/workspace/theonegroup-v2/dist/_redirects /tmp/tog-full/ 2>/dev/null
cd /tmp/tog-full
rm -rf .netlify
netlify link --id 56446bc7-9070-44b6-84f3-aa0dd8b5277b   # theonegroup-v2
netlify deploy --prod --dir .
```

**⚠️ DEPLOY GOTCHAS (learned 2026-08-09):**
1. **Deploying a partial file set REPLACES the whole site** — always deploy the full `dist/` contents, never just new files.
2. **`netlify link --id` may resolve to a wrong/accidental site** if the temp dir has stale `.netlify/state.json` — `rm -rf .netlify` first, then link.
3. **Avoid the `netlify.toml` that triggers Next.js build** (`functions = "netlify/functions"` errors when dir missing). Deploying `dist/` contents directly (no netlify.toml) works.
4. **⚠️ theonegroup-v2 has Netlify Functions (`netlify/functions/leads|subscribe|test`)** — the temp-dir dist-only method DROPS functions → `/api/leads` & `/api/subscribe` 404. For this site, deploy FROM PROJECT ROOT with `netlify deploy --prod --build` so functions get zipped. (Fixed 2026-08-13, deploy `6a7e8439`; added `/api/subscribe` redirect to netlify.toml.)

**File Structure (theonegroup-v2):**
- Project root: `~/.openclaw/workspace/theonegroup-v2/`
- Source: `src/pages/*.astro` + `src/layouts/BaseLayout.astro` + `src/styles/global.css`
- Built site (deploy source): `theonegroup-v2/dist/`
- **System Proof page:** `src/pages/system-proof.astro` → live at /system-proof/ (linked in nav + footer + homepage social-proof band)

**Quick Deploy Process (theonegroup-v2):**
1. Edit source in `theonegroup-v2/src/`
2. `cd theonegroup-v2 && npm run build`
3. Deploy the full `dist/` contents using the temp-dir method above
4. Check deploy status at: https://app.netlify.com/projects/theonegroup-v2

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

## Twitter Content Strategy (Updated 2026-05-24) - DEPLOYED ✅

**Status:** AI + Finance content **ADDED** to existing strategy (not replacing)

**Major Update (May 24):**
- **New Focus Area:** AI + Finance content for SMBs (added alongside existing content)
- **Why:** Gap in market — most AI finance content too enterprise or too technical
- **Goal:** Practical, affordable solutions real SMBs can use
- **Note:** Existing general AI content (automation, pricing, workflow) still active

**Content Pillars (UPDATED MIX):**
| Pillar | % of Content | Focus |
|--------|--------------|-------|
| AI + Finance | 40% | NEW: Bookkeeping, cash flow, invoicing, forecasting |
| General AI for SMBs | 40% | EXISTING: Automation, workflows, tools |
| Fun/Engagement | 20% | Community, memes, relatability |

**Finance Content Types (NEW):**
1. **Tool breakdowns** — "I tested 6 receipt scanners..." (2x/week)
2. **Workflow threads** — "Month-end used to take 2 days..." (2x/week)
3. **ROI stories** — "The $3,000/year I saved..." (1x/week)
4. **Finance polls** — "What's your biggest finance pain?" (3x/week)

**Existing Content Types (CONTINUING):**
- General automation insights
- Pricing model analysis
- Workflow optimization
- General AI polls and reflections

**Automation Deployed:**
- `content_refresh_v2.py` updated with finance templates
- **Existing templates preserved:** automation, pricing, workflow, default
- **New templates added:** finance_ai, finance_automation, cash_flow
- **Total pool:** 15 polls (10 general + 5 finance), 14 reflections (10 general + 4 finance)
- Auto-detects finance keywords but general content still triggers on other stories

**Content Strategy Doc:** `SOCIAL_MEDIA_STRATEGY.md`
**Finance Templates:** `FINANCE_CONTENT_TEMPLATES.md`
**Research Deep-Dive:** `AI_FINANCE_CONTENT_STRATEGY.md`

**Success Metrics:**
- Finance content: FEWER likes but MORE saves/replies
- General content: Continues existing performance baseline
- Mix target: ~40% finance, ~40% general AI, ~20% fun/engagement

---

## Previous Twitter Strategy (Pre-Finance Focus)

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

## Default File Delivery Preference (2026-07-11)

- Alec wants all newly created deliverable files copied to Google Drive by default.
- Default destination: `/Users/aleckennedy/Library/CloudStorage/GoogleDrive-akennedy@theonegroup.info/My Drive/OpenClaw-Deliverables`
- If a specific Drive folder is requested, use that instead.

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

## Current Priorities (July 2026) - UPDATED

1. **✅ Model Routing v4** — Deployed, tested, live. Cancel ChatGPT Pro.
2. **AI + Finance Content** — Deployed, monitoring engagement metrics
3. **Twitter content** — Research-driven posts daily with finance focus
4. **Lead outreach** — Email sequences active
5. **Engagement tracking** — Fix Twitter API analytics

---

## Previous Priorities (May 2026)

*Full Twitter strategy history moved to: `memory/twitter-strategy-archive.md`*

---

## Cron Jobs - SUPERCHARGED (2026-07-18) ✅

**Active Daily Schedule:**

| Time | Job | Purpose |
|------|-----|---------|
| 8:00 AM ET | **Supercharged Daily Intelligence** | AI industry intel + Scout web + Twitter content generation |
| 8:00 AM ET | Scout daily intelligence | Email briefing with sales CRM intel |
| 9:00 AM CT | Twitter morning post | Auto-post from queue |
| 8:00 PM CT | Twitter evening post | Auto-post from queue |
| 8:00 AM CT Mon | **Weekly Lead Report** | Funnel report → Gmail draft + WhatsApp ping |

**Disabled:**
- ~~Dante Daily Content Creation~~ — superseded by supercharged
- ~~Old content-refresh~~ — replaced with AI-driven pipeline

**New Job ID:** `ca4be2b0-e607-46c5-a2af-d85371060bba`

**What Supercharged does:**
1. Searches AI industry for breaking news, funding, launches
2. Researches companies in active Scout deals
3. Generates 3-4 tweet-worthy posts using fresh intel
4. Queues posts for optimal posting times
5. Uses ~12 Tavily credits/day (well within 1,000 free limit)

**Cost:** ~$0.10/day in API credits vs old $20/month ChatGPT Pro
---

## HubSpot CRM Sync - LIVE (2026-08-01) ✅

- **Portal:** 246928220 | **Dev app:** 47713390 (Alec's HubSpot developer account)
- **Connection:** OAuth via open-connector (localhost:3000), full CRM read/write scopes
- **Flow:** Every Iris draft → HubSpot company (+ contact when email exists), IDs stored on lead
- **Gotchas:** Never send free-text `industry` (HubSpot fixed enum); connector envelope lies about success — require `data.record.id`; no delete action available (use HubSpot UI)
- Alec picked HubSpot over Pipedrive


---

## Model Routing Stack v6 - LIVE (2026-08-01) ✅

**v6 = DeepSeek V4 Flash via Ollama Cloud.** Switched from GPT-OSS 120b to DeepSeek V4 Flash as the primary model. All costs remain $0 (Ollama Pro prepaid).

| Tier | Model | Use For | Cost |
|------|-------|---------|------|
| **Default** | `ollama/deepseek-v4-flash:cloud` | ALL interactive sessions, crons, heartbeats | $0 (Pro) |
| **Fallback 1** | `ollama/gpt-oss:20b-cloud` | Auto-fallback if primary is down | $0 (Pro) |
| **Fallback 2** | `openrouter/moonshotai/kimi-k3` | Second fallback | $3/$15 per 1M |
| **Fallback 3** | `openrouter/openai/gpt-5.6-sol` | Third fallback | $1/$6 per 1M |
| **Utility** | `openrouter/openai/gpt-5.6-luna` | Last-resort emergency fallback | $1/$6 per 1M |
| **Local batch** | `ollama/llama3.1:latest`, `ollama/qwen3-coder:latest` | Direct API calls from scripts | $0 local |

**Alias:** `deepseek` → `ollama/deepseek-v4-flash:cloud`

**Cron jobs updated:** scout-daily-intelligence, twitter-morning-post, twitter-evening-post all pinned to DeepSeek V4 Flash.

**Provider:** Ollama Cloud only (not OpenRouter). DeepSeek is an Ollama-hosted model.

**Files:**
- Config: `~/.openclaw/openclaw.json` (backup: `.bak.deepseek-20260801-2337`)
- Routing: `routing-config.json` (backup: `.bak.deepseek-20260801-2337`)
- Healthcheck: `scripts/model_routing_healthcheck.sh` — all models PASS

---

## Pit Row Miami - Site & Deploy (2026-08-03)

**Domain:** pitrowmiami.com (Cloudflare, proxied)
**Netlify Site ID:** 7abc1027-310c-4712-971f-adb899d694b2
**Site Root:** `~/.openclaw/workspace/pitrowmiami/`
**Production URL:** https://pitrowmiami.com
**Email:** info@pitrowmiami.com (Cloudflare Email Routing → akennedy@theonegroup.info)
**📞 Pit Row PUBLIC phone (2026-08-14):** **(954) 800-2162** (Twilio, forwards to Alec's cell 502-403-7201). This is the number on ALL Pit Row assets. Personal cell is NOT shown on Pit Row materials. Forward target stays +15024037201 in forward.xml (intentional). TOG corporate assets keep (502) 403-7201 as the TOG business number — separate brand.

### ⚠️ Deploy Gotcha
The site was originally created for a Next.js project (babynest). The Netlify CLI auto-detects Next.js runtime even though pitrowmiami is a plain static site. **Do NOT run `netlify deploy --prod` from the pitrowmiami directory** — it will fail with Next.js plugin errors.

**Working deploy method:**
```bash
mkdir -p /tmp/pitrowmiami-deploy
cp ~/.openclaw/workspace/pitrowmiami/*.{html,svg,png,jpg,pdf,xml,txt} /tmp/pitrowmiami-deploy/
cp -r ~/.openclaw/workspace/pitrowmiami/netlify /tmp/pitrowmiami-deploy/
cp ~/.openclaw/workspace/pitrowmiami/netlify.toml /tmp/pitrowmiami-deploy/
cd /tmp/pitrowmiami-deploy && netlify deploy --prod --dir .
```

### Assets
- Logo: `logo.png` (PNG, 1.4MB) and `logo.svg` (SVG, 4KB) — both work
- Hero: `hero-image.jpg`
- Favicon: `favicon.png` and `favicon.svg`
- QR code: `qr-code.png`
- OG image: `og-image.jpg`
- One-sheet PDF: `PitRowMiami-OneSheet.pdf`

### Email Sending
- Resend free tier can only send from `onboarding@resend.dev` — cannot send as `info@pitrowmiami.com` without $10/mo upgrade
- Contact form on site uses `info@pitrowmiami.com` as the reply-to

---

## 🔐 Security & Key Management (2026-08-03)

### Key Storage Policy
- **ALL API keys live in one place:** `~/.openclaw/.env` (permissions: 600, outside workspace)
- **No keys in memory files** — memory files reference paths only
- **No keys in workspace** — workspace `.env` was deleted and merged into main `.env`
- **No keys in git** — `.env` is in `.gitignore`

### Current Keys in `~/.openclaw/.env`
| Key | Purpose | Rotated |
|-----|---------|---------|
| ANTHROPIC_API_KEY | Claude API (emergency fallback) | — |
| OPENCLAW_GATEWAY_TOKEN | OpenClaw internal | — |
| OPENROUTER_API_KEY | OpenRouter AI routing | — |
| TAVILY_API_KEY | Web search (Scout) | — |
| OPENAI_API_KEY | OpenAI API (backup) | — |
| TWITTER_API_KEY | Twitter/X API v2 | — |
| TWITTER_API_SECRET | Twitter/X API v2 | — |
| TWITTER_ACCESS_TOKEN | Twitter/X posting | — |
| TWITTER_ACCESS_SECRET | Twitter/X posting | — |
| TWITTER_USER_ID | Twitter/X account ID | — |
| RESEND_API_KEY | Email sending | — |
| FIRECRAWL_API_KEY | Web scraping | — |

### If Compromised — Key Rotation Checklist
1. **OpenRouter** — Rotate at https://openrouter.ai/keys
2. **OpenAI** — Rotate at https://platform.openai.com/api-keys
3. **Anthropic** — Rotate at https://console.anthropic.com/settings/keys
4. **Tavily** — Rotate at https://tavily.com/dashboard
5. **Twitter/X** — Rotate at https://developer.twitter.com/en/portal/dashboard
6. **Resend** — Rotate at https://resend.com/api-keys
7. **Firecrawl** — Rotate at https://firecrawl.dev/dashboard
8. **OpenClaw Gateway** — Regenerate via `openclaw gateway token --rotate`
9. Update `~/.openclaw/.env` with new values
10. Restart any running services/connectors

### Security Rules
- Never store keys in memory files (MEMORY.md, daily notes)
- Never commit `.env` to git
- Never paste key values in chat messages
- If a key is exposed, rotate it immediately

---

## 🎨 Brand — The One Group Logo (2026-08-13) ✅

**Canonical logo:** `assets/brand/theonegroup-logo.png` (workspace) + Google Drive `OpenClaw-Deliverables/Brand/theonegroup-logo.png`
- **Design:** Stylized metallic "1" in a diamond (blue/purple gradient, neon glow), "THE ONE GROUP" below (ONE in blue gradient), subtext "AI AUTOMATION AGENCY". Black background. Square 1254×1254.
- **Source file:** `~/.openclaw/media/inbound/ChatGPT_Image_Aug_9_2026_06_28_16_PM---dc4e4de4-b3d1-4ee5-ba18-ecb8401a823d.png`

**Integrated into theonegroup.info (deployed `6a7e0904`):**
- Header nav + footer now use `/logo.png` (was text-only "The One Group")
- Favicon (`/favicon.png` 32px), apple-touch-icon (`/apple-touch-icon.png` 180px) regenerated from logo
- OG default banner (`/assets/images/og-default.png` 1200×630) rebuilt with logo + brand text

**RULE for all future materials:** Use `assets/brand/theonegroup-logo.png` as the canonical The One Group logo. Do NOT use the Pit Row Miami logo (different brand — pitrowmiami-v2 has its own logo).

## Iris Lead Emails — Standing Rules (2026-08-10) ✅
- **PS note is mandatory & deterministic:** Every lead-outreach email draft Iris creates MUST include the industry-matched PS note (PS_NOTES dict + pick_ps() in `agents/iris_real.py`). NEVER regress to model-generated P.S. Full notes in `LEAD-EMAIL-PS-NOTES.md`.
- **Subject parsing rule:** Always anchor the subject capture to the FIRST line (`SUBJECT:\s*([^\n]+)\n\s*\n?(.*)`). Greedy `(.+)` with `re.S` swallows the whole body into the subject group — this caused the garbled/base64 drafts on 2026-08-10.
- **Verify rendered drafts:** Always check the RENDERED draft body (list_drafts) before telling Alec it's ready — llama3.1 intermittently wraps the signature in a base64 MIME block, so a draft can be created yet garbled.
- **Never bulk-delete drafts by list-scan** (see TOOLS.md lesson 2026-07-31). Delete only by exact draft ID captured at creation.
- **Re-draft single lead:** reuse iris_real.py's functions via a small one-off script, not main() (avoids MAX_EMAIL_DRAFTS cap + re-drafting other leads).
- **STATUS NEVER AUTO-ADVANCES drafted→sent (2026-08-12):** Iris marks a lead `drafted` but never updates it when Alec sends the Gmail draft. Leads accumulate as stale "drafted" forever. Fix: run `python3 agents/reconcile_draft_status.py` (checks Gmail sent-mail incl. trash per drafted lead, marks confirmed-sent ones `sent`). Alec may also trash duplicate drafts (status `deleted_duplicate` — NOT an outreach target; reply scanner skips these). Only run this after each batch/send.
- **Reply scanner (2026-08-12):** `agents/scan_replies.py` matches Gmail replies against leads with status {drafted, sent, replied}, classifies reply/positive/booking/opt-out, feeds data/reply_signals.json → re-weights Arlo. Cron 2230a9f9 every 3h weekdays. Skips deleted_duplicate and personal/dealership threads.

## Invoice Generation Capability (2026-08-10) ✅
- Can generate clean PDF invoices with reportlab 4.5.1. Reusable generator: `scripts/make_invoice.py`.
- **Example delivered:** The Global Key → Alec Kennedy / Brown-Forman, INV-2026-6603, July 29 2026, $3,125.38 (single line, no itemization), PBR Florida Freedom Dinner — Cote · 14 guests · Jack Daniel's & Woodford Reserve cocktails.
- Deliverables copied to Google Drive → OpenClaw-Deliverables by default. Verify via qlmanage thumbnail + image tool.
