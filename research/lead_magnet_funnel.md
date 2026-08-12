# Lead Magnet + Free Top-of-Funnel Tool Plan
## For The One Group.AI (Alec Kennedy) — August 2026

**Context:** Alec runs The One Group.AI, an AI services agency in South Florida selling:
- AI visibility audits ($2,500)
- AI optimization services
- Coaching
- Competitor intel ($297/mo)

**Current assets:** 8-agent automation system, Twitter/X content machine (3 posts/day), static Astro site (theonegroup-v2), Gmail + Google Sheets stack.

**Gap:** No lead magnets, no email-capture funnel, no free tool. This report builds the "free rung" of the ladder.

---

## 1. Email-Capture / Lead-Magnet Tech Stack

### Recommendation: **Kit (formerly ConvertKit) — Free plan**

**Why Kit wins for Alec specifically:**

| Factor | Kit (ConvertKit) | MailerLite (2026) | Buttondown | EmailOctopus |
|---|---|---|---|---|
| **Free plan subscribers** | **10,000** | 250 (shrunk in 2026) | ~100 | 2,500 |
| **Free monthly sends** | ~unlimited-ish | 2,500 | limited | 10,000 |
| **Landing pages/forms** | Yes | Yes | Yes (newsletter focus) | Yes |
| **Automations (free)** | Limited but enough for welcome email | Limited | Minimal | Yes |
| **Best for** | Creator/solo founder lead capture | Small business email | Text-first newsletters | Budget email |

**Critical 2026 data point:** MailerLite's free plan was cut hard in 2026 — from 500 → **250 subscribers** and from 12,000 → **2,500 emails/month**. It's effectively a sandbox now. Paid plans rose 10–30%. For a cost-conscious solo founder building a new list from zero, MailerLite's free tier is no longer viable past a few weeks.

Kit's free "Newsletter" plan gives **10,000 subscribers free** (confirmed via kit.com pricing + help center in 2026). This is a massive runway for Alec — he won't pay anything until his list is genuinely large.

**Why not the others:**
- **Buttondown** is writing-first (great for a newsletter, weak for multi-step lead-magnet automation and scoring funnels).
- **EmailOctopus** has a strong free tier but is more "batch campaign" oriented; Kit is purpose-built for creator/solo lead funnels with forms, landing pages, and automations that map directly to Alec's "free rung" concept.
- **Ghost** is a publishing platform — overkill (needs hosting) and doesn't solve email capture by itself.

**Why not "simple form + Sheets"?** It's free but gives zero deliverability, no double opt-in management, no welcome automation, and no list growth infrastructure. It's fine as a *backup*, but for a funnel that must convert prospects into a nurture sequence feeding a $2,500 audit, a real email platform pays for itself immediately.

**Cost:** $0/mo (free plan, up to 10k subs). When he outgrows it: Kit paid plans scale from ~$29/mo (creator) — still affordable. Integration with his Gmail/Sheets stack is straightforward via Kit's API/Zapier/Make and native webhooks.

**Integration with Astro (theonegroup-v2):** Kit gives an embeddable form/landing page URL that can be linked or iframed from the static Astro site — no backend needed. His 8-agent system can trigger Kit automations via API. Clean, no-server setup.

---

## 2. Three Specific Lead-Magnet Ideas (Tailored to His Offerings)

### Idea A: "Did AI Just Steal Your Call?" — Missed-AI-Call Report
A short PDF/checklist + mini-audit showing SMBs how many customers they lose because their business isn't in ChatGPT/Google AI Overview answers for "best [service] near me." Ties directly to his **AI visibility audit** ($2,500) — the lead magnet *is* the thin slice of the paid audit.
- **Hook:** Strong, emotional, specific to South Florida SMBs (plumbers, HVAC, restaurants, realtors).
- **Format:** 5-page PDF + a 3-question self-check.

### Idea B: "Your ChatGPT Reputation" — Brand Snapshot
A free 1-page report that shows what ChatGPT/Gemini actually say about the prospect's business (their AI-generated reputation), pulled from his existing **competitor intel ($297/mo)** capability.
- **Hook:** Curiosity + fear of missing. "See what AI tells customers about you before they call."
- **Cost to deliver:** Low — he can generate these with his existing AI agents.
- **Risk:** High perceived value but labor-intensive per lead; better as a high-ticket follow-up than a broad free magnet.

### Idea C: "The AI-Ready Checklist for SMBs" — 25-Point Scorecard
A downloadable checklist covering visibility, optimization, automation, and protection. Broad appeal, easy to distribute.

---

### 🏆 The single best to build first: **Idea A — "Did AI Just Steal Your Call?" (Missed-AI-Call Report)**

**Justification:**
1. **Directly pre-sells the $2,500 audit.** The missed-call angle is the exact pain the paid AI visibility audit solves — the free magnet is the "demo" of the paid product. This is the strongest lead-to-sale alignment of the three.
2. **Emotional + specific.** "Lost customers" outranks "brand snapshot" or "checklist" for SMB owners. It creates urgency.
3. **Cheap to produce** with his existing 8-agent system (can generate localized examples for HVAC, real estate, restaurants).
4. **Distribution-friendly** (see Section 4) — it plugs naturally into trade-owner Facebook groups and Reddit threads about "customers not finding me."
5. **Idea B is better as a paid/sales follow-up** (the competitor-intel deep-dive), and **Idea C is a weaker opener** (checklists attract tire-kickers, not qualified audit prospects).

---

## 3. The Free 60-Second "AI Visibility Score" Tool (the Free Rung)

This is the flagship free tool. **Validated as a real 2026 practice** — multiple agencies/tools now offer "free AI visibility checkers" (Semrush, Meev, ClearRank, SearchScore, gaflow.io). The concept works; Alec's differentiator is *vertical specificity to South Florida SMBs + his paid audit funnel*.

### How to build it cheaply (no server, low cost):

**Stack (all free/low-cost):**
1. **Form:** A static HTML form on the Astro site (or a Kit landing page form) collecting email + business info.
2. **Scoring logic:** A small client-side JS scoring script (no backend needed) OR a **Google Apps Script** (ties into his existing Gmail/Sheets stack) that receives the form, computes the score, logs the lead to Sheets, and emails the result via Gmail.
3. **Deliverable:** Instant on-page score + a follow-up email with the full breakdown and a CTA to book the $2,500 audit.
4. **Email capture:** Email field is required *before* revealing the score (classic lead-capture friction), feeding directly into Kit.

**Build options (pick based on effort):**
- **Option 1 (simplest, $0):** Astro page with an HTML form → Apps Script web app → computes score → returns result + writes to Sheets + triggers a Kit welcome/CTA email via Kit API. All free, all in his existing stack.
- **Option 2 (no-code):** Kit landing page form with conditional logic → Zapier/Make → Apps Script/Sheets. Slightly more cost but faster to ship.

### What questions it asks (60 seconds, ~7 questions):

1. **Business name & website URL** (used to actually check AI visibility).
2. **Category:** HVAC / Real Estate / Restaurant / Medical / Trades / Other *(vertical segmentation → tailored messaging + list tags)*.
3. **Service area / city** (e.g., Miami, Fort Lauderdale, West Palm).
4. **"When someone asks AI 'best [your service] near me,' does your business show up?"** *(Yes / Not sure / No)*
5. **"Do you know what ChatGPT says about your business right now?"** *(Yes / No)*
6. **"Does your website mention specifics AI can quote (pricing, hours, reviews, service area)?"** *(Yes / Partially / No)*
7. **"Have you lost a customer because they couldn't find you online?"** *(Yes / Not sure / No)*

### How the score + CTA works:

**Scoring rubric (0–100):**
- **Q4 (shows up in AI?):** Yes=20, Not sure=10, No=0
- **Q5 (know your AI reputation?):** Yes=15, No=0
- **Q6 (AI-quotable content?):** Yes=20, Partially=10, No=0
- **Q7 (lost a customer?):** Yes=+25 (high pain), Not sure=+10, No=0
- Base visibility bonus: +20 if website exists & is clean

**Output buckets + CTA:**
- **80–100 "AI-Ready"** → CTA: "Get the paid audit to verify & stay ahead" (audit CTA).
- **50–79 "At Risk"** → CTA: "AI may be sending your customers elsewhere — get the full audit."
- **0–49 "Invisible"** → CTA: "You're losing calls to competitors right now. See the fix."

**Every score → email captured → Kit sequence:**
1. Immediate: full score breakdown + what it means.
2. +1 day: "Did AI just steal your call?" case study.
3. +3 days: competitor-intel tease.
4. +5 days: book-the-audit CTA (warm handoff to the $2,500 audit).

This funnels the free score → the paid audit cleanly, and recycles his content machine (3 posts/day) into the nurture sequence.

---

## 4. Distribution — Where to Place It (5 Specific Placements)

### The 5 actionable placements:

1. **Facebook Groups — HVAC, Real Estate, & Restaurant Owner groups (South Florida).**
   - Join 5–10 active groups (e.g., "Miami Realtors," "Florida HVAC Contractors," "South Florida Restaurant Owners," local chamber groups).
   - Post value-first: share a "Why your phone isn't ringing" tip, then offer the free 60-second AI Visibility Score as the solution. Link the tool. Don't spam — answer questions genuinely for 2 weeks before pitching.
   - **Why it works:** These are exactly the verticals Alec serves; group members are decision-makers who feel the "customers can't find me" pain daily.

2. **Nextdoor + local Facebook city pages (South Florida).**
   - Nextdoor is underrated for local SMBs (validated in 2026 community-marketing guides). Post the free tool as a "free help for local business owners" — high trust, hyper-local.
   - Target Miami, Fort Lauderdale, West Palm, Boca, Tampa.

3. **Reddit — r/smallbusiness, r/Entrepreneur, r/HVAC, r/RealEstate, r/restaurateur.**
   - **Critical 2026 rule:** Reddit heavily punishes fake/spammy promotion (a recent case: an agency got hammered for fake comments — see getfoundquick.com, April 2026). Must post genuinely useful content, not links.
   - Approach: Write a real "I built a free tool to check if your business shows up in AI search — here's how it works, and honest examples" post. Engage in comments. No upvote manipulation, no bot comments.

4. **Guest content / local business publications.**
   - Pitch a short article to South Florida SMB blogs, local chamber newsletters, and AI-for-business newsletters: "How to find out if ChatGPT is recommending your business." Embed the free tool + lead magnet as the natural CTA. Reuses his existing content machine.

5. **His own Twitter/X funnel + a dedicated landing page.**
   - The 3 posts/day already drive traffic. Add a persistent pinned post + bio link to the "AI Visibility Score" tool. Create a dedicated `/score` or `/ai-visibility` landing page on the Astro site. This converts his existing audience (which currently has no destination) into captured leads.

**Distribution principle:** Lead magnet *first* (the report), *then* the free tool as the interactive capture. Both point to the same Kit funnel.

---

## 5. Five-Step Implementation Sequence

**Step 1 — Set up the email backbone (Day 1).**
Create Kit account (free plan). Set up list, welcome automation, and a placeholder form. Create the `ai-visibility-score` landing page on the Astro site. This is the foundation everything plugs into. *(0–2 hrs)*

**Step 2 — Build the lead magnet (Days 2–4).**
Create the "Did AI Just Steal Your Call?" PDF/report using the 8-agent system. Make 3 vertical versions (HVAC, real estate, restaurant) for South Florida. Set up the Kit deliverable automation (auto-send PDF on signup). *(3–5 hrs)*

**Step 3 — Build the 60-second AI Visibility Score tool (Days 5–9).**
Build the scoring form + Apps Script backend (or no-code Kit form) + scored output + email capture → Sheets/Kit. Test the full flow: form → score → email → CTA. *(6–10 hrs)*

**Step 4 — Create the nurture sequence (Days 10–12).**
Write the 5-email automation (score breakdown → case study → competitor tease → audit CTA). Repurpose existing content-machine posts into these emails. Set the audit booking CTA (link to his scheduling/cal). *(3–5 hrs)*

**Step 5 — Launch distribution (Days 13–21).**
Publish the landing page. Add the pinned post/bio link on X. Join and engage in the 5 Facebook groups + Nextdoor. Post the genuine Reddit value-thread. Pitch 2–3 guest pieces. Launch on the content machine. *(ongoing)*

**Sequencing rationale:** Email backbone first (so nothing is lost), then the downloadable magnet (fast win), then the interactive tool (the main capture), then the nurture (conversion), then distribution (traffic). This ships value at every step and doesn't build distribution before the capture exists.

---

## Summary of Top Recommendation

Build the **"Did AI Just Steal Your Call?"** lead magnet (PDF report) + a **60-second AI Visibility Score** web tool, both funneling into a **Kit (ConvertKit) free account** (10,000 free subscribers — the clear best-value email stack in 2026 after MailerLite's free plan collapsed to 250 subs). The score tool is a cheap no-server build (Astro form → Google Apps Script → scored output → email capture → Kit nurture), and it's the exact "free rung" that converts prospects into the $2,500 audit via a 5-email sequence. Distribute through South Florida trade-owner Facebook groups, Nextdoor, genuine Reddit posts, guest content, and a pinned X link — then follow the 5-step build order: email backbone → PDF magnet → score tool → nurture sequence → launch.

---

*Sources: kit.com pricing & help center (2026), mailerlite.com pricing (2026), emailoctopus.com MailerLite pricing analysis (June 2026), ownletter.com MailerLite vs Kit 2026, converthook.com "How to Offer AI-Visibility Audits" 2026, loudmink.ai AEO audits as lead magnet, semrush.com / meev.ai / clearrank.io / searchscore.io / gaflow.io AI visibility checkers (2026), getfoundquick.com Reddit marketing 2026, yourwebteam.io community marketing 2026.*
