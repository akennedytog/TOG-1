# The One Group — Full Business Audit
**Date:** 2026-07-31 | **Scope:** Website, links, duplicates, competitors, GitHub landscape

---

## 1. SITE HEALTH — Every Page Tested Live

**Result: All 54 pages return HTTP 200.** No dead pages.

### 🔴 CRITICAL — Broken Links (live 404s)

| Broken URL | Linked From | Impact |
|---|---|---|
| `/lead-response.html` | index, pricing, contact, competitor-intelligence, compliance-content | **Dead conversion page linked from your 5 most important money pages** |
| `/mmw-2026.html` | events.html | File exists at `/archive/mmw-2026.html` — link just points to wrong path |

**Fix:** Either create lead-response.html or repoint those links to `/qualify.html` or `/contact.html`. Update events.html link to `/archive/mmw-2026.html` (or remove the event).

### 🟡 Duplicate / Overlapping Content

| Issue | Pages | Recommendation |
|---|---|---|
| Same topic, 2 posts | `blog/ai-data-myth.html` + `blog/ai-myth-data.html` | Merge into one, 301-redirect the weaker one. Two near-identical posts cannibalize SEO. |
| Building-in-public sprawl | `building-in-public.html` ("Week 3 Learnings") + `week1/week2/week3` + `complete` | 5 overlapping posts. Keep the 3-week series + "complete" recap; redirect the orphan `building-in-public.html` to week3. |
| Duplicate meta descriptions | `truerep.html`, `free-ai-audit.html`, `missed-call-calculator.html` all share the same default description | Write unique descriptions — Google may ignore duplicated ones. |
| Paid vs free audit conflict | `ai-audit.html` ($2,500) vs `free-ai-audit.html` | Not inherently wrong, but pages don't differentiate. Free audit should be positioned as the *entry point* to the paid audit. Cross-link them explicitly. |
| Dangling project page | `truerep.html` live, project on hold | Either add "Coming soon — join waitlist" capture or noindex it. |
| Redirect stack | `ai-assessment`→ai-audit, `workshop`/`ai-growth-sprint`→ai-agent-workshop, `competitor-monitoring`→competitor-intelligence | Harmless, but update internal links to point directly at final destinations. |

### 🟡 Repo Hygiene
- `dist/` directory (entire built copy of the site) is in the working tree — if it's committed to git, add to `.gitignore`.
- `node_modules/` in root, `server/`, and `.netlify/` — ensure all are gitignored.

---

## 2. COMPETITOR LANDSCAPE

### Local (South Florida)
- **OneWave AI** — positions as "Florida-rooted AI consultancy," statewide coverage
- **Purple Horizons** — Miami AI consulting, content-led (guides for business leaders)
- **Miami Business Consulting** — traditional consulting adding AI

### What winning agencies do in 2026 (research-backed)
1. **Personalized video outreach** — short Loom videos showing a *custom prototype built for that specific prospect* outperform every other cold channel. Generic outreach is dead.
2. **Productized pricing** — market settled at $500–$20k/mo retainers or fixed-scope packages. SMBs strongly prefer fixed-price, clearly-scoped offers (your pricing page already does this — good).
3. **Niche by industry, not geography** — winners own a vertical (e.g., "AI for HVAC," "AI for dental") rather than "AI for everyone in Miami."
4. **Inbound via YouTube/education** — agencies getting inbound DMs teach publicly: build logs, teardowns, cost comparisons. Your blog has the bones of this (QuickBooks comparison, HVAC case study) but it's text-only.
5. **Free tool as lead magnet** — calculators/audits that deliver instant value. You HAVE this (missed-call-calculator) — it's underpromoted.
6. **Proof density** — every service page on winning sites has a case study with a dollar figure within one scroll.

### Your edge vs competitors
- You run an actual 8-agent autonomous system (they talk about AI; you run it in public)
- Local city pages (Miami/Fort Lauderdale/Boca/WPB/Palm Beach Gardens bookkeeping) — nobody local has this SEO footprint
- Nobody local is doing AI+Finance for SMBs — your May pivot was correct

---

## 3. GITHUB — What You're Missing

| Repo | Stars | Why it matters to you |
|---|---|---|
| `enescingoz/awesome-n8n-templates` | 24k | 280+ ready workflows. DIY tools keep getting easier — your moat is implementation + outcomes, not tooling. Also a goldmine for client build speed. |
| `activepieces/activepieces` | 23.5k | Open-source Zapier + 400 MCP servers. Could cut your delivery cost on client automations. |
| `dify` / `simstudioai/sim` | 151k / 29k | Visual agent builders — useful for client demos and prototypes in sales calls. |
| `vercel-labs/agent-browser` | 36k | Browser automation CLI for agents — trend of 2026: agents that *operate* software, not just chat. Relevant to your bookkeeping/invoicing offers. |
| `500 AI Agents Projects` (curated) | trending | Idea bank for new productized services — solves "what to sell next." |
| `LocoreMind/locoagent` | 1k, new | Social-media agent with real browser automation — could upgrade Dante's posting pipeline. |

**Strategic read:** the tooling gap closes every month. The agencies that survive sell *outcomes and implementation speed*, not access to tools. Your content should hammer "we run this for you" not "here's a cool tool."

---

## 4. PRIORITY ACTION LIST (ranked by revenue impact)

1. **TODAY:** Fix `/lead-response.html` — it's dead on your 5 highest-traffic money pages. Point to `/qualify.html`.
2. **This week:** Merge duplicate blog posts (ai-data-myth pair; building-in-public orphan). Add canonical/301s.
3. **This week:** Unique meta descriptions on truerep, free-ai-audit, missed-call-calculator.
4. **This week:** Position free-ai-audit as step 1 → paid AI Visibility Audit as step 2, cross-linked.
5. **Next 2 weeks:** Record 5 personalized Loom-style video audits for Arlo's best leads — this is the highest-converting outbound tactic in 2026 and nobody local does it.
6. **Next 2 weeks:** Add a dollar-figure case study block to every service page (proof density).
7. **Ongoing:** Pick ONE vertical to dominate in content (HVAC already has 2 proof assets — consider leaning in).
8. **Ongoing:** Promote the missed-call calculator as your top lead magnet — link it from homepage hero.
