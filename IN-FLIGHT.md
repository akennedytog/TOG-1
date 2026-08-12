# IN-FLIGHT TRACKER

Running log of what's in flight, waiting on me, and waiting on Alec.
Updated as work progresses. This is my "next actions" surface — check it, keep it honest, never let something slip.

---

## 🔥 ACTIVE

### 1. Iris garbled-draft hardening — ✅ DONE (2026-08-10 14:30)
- Added `verify_body_clean()` to `agents/iris_real.py` + wired into main() draft loop.
- Flags/skips any draft whose body still contains MIME headers or a base64 blob (the intermittent llama3.1 quirk).
- Verified: compiles + correct on good/bad/empty inputs.

### 2. Iris calendar duplicate-event guard — ✅ DONE (2026-08-10 14:35)
- Found 8 duplicate calendar events (4 lead calls created 3x by repeated Iris runs) during first calendar triage.
- Deleted the 8 extras (kept 1 each); 0 duplicates remain on 8/11 calendar.
- Added dedup guard to iris_real.py: skip scheduling any lead that already has `calendar_event_at` set.

### 3. Proactive email + calendar triage — ✅ LIVE (2026-08-10 14:26)
- HEARTBEAT.md now has calendar triage as step 4 (alongside existing email triage step 3).
- Both respect quiet hours (23:00-08:00); only urgent/sales break through.
- heartbeat-state.json lastChecks.calendar now populated.

---

## ⏳ WAITING ON ALEC

- *(none right now)*

---

## 📋 QUEUED / IDEAS (not started)

- **Proactive email/calendar triage routine** — see #3 below (in progress).
- **Invoice pattern** — reportlab generator at `scripts/make_invoice.py` is reusable; just ask.

---

## 🗓️ RECENTLY COMPLETED

- **The Global Key invoice** — INV-2026-6603, PDF to Drive. ✅
- **Garbled lead drafts cleanup** — 7 deleted by ID, 3 clean remain, #3 re-drafted. ✅
- **PS note system** — per-industry + auto-appended in Iris. ✅

### 4. Proactive-power buildout — ✅ RESEARCH + CORE BUILT (2026-08-10 14:56)
Alec said "do all of these now" — all 5 proactive-power initiatives.

**DONE now:**
- **Feedback loop** (`agents/feedback_loop.py`): closes the Arlo→Iris loop. Iris records reply/booking signals to `data/reply_signals.json`; Arlo's `rotation_pairs` is now reply-weighted (explore 30%, exploit 70%). Wired into both arlo_real.py + iris_real.py (compiles ✅).
- **IP packaging / benchmark reports** (`scripts/generate_benchmark_report.py`): generates sellable "State of [Industry] in South Florida" reports from real Arlo lead data. Built 4 (Real Estate, HVAC, Accounting, Plumbing) → `out/benchmarks/`, copied to Google Drive `OpenClaw-Deliverables/benchmark-reports/`. Doubles as the lead-magnet deliverable.

**RESEARCH DONE (subagents):**
- **Voice agent** → `research/voice_agent_providers.md`: **Vapi recommended** (only provider with NATIVE Google Calendar auto-booking, $0.05/min, free $10+60min, BYO-model = near-zero marginal cost). Runner-up Retell (Cal.com path, best HIPAA BAA). ~$35-40/mo at 100 calls. 5-step impl plan + STIR/SHAKEN/spam gotchas.
- **Lead magnet funnel** → `research/lead_magnet_funnel.md`: **Kit (ConvertKit) free plan** (10k subs — MailerLite collapsed to 250 in 2026). Build "Did AI Just Steal Your Call?" PDF + 60-sec **AI Visibility Score** web tool (Astro form → Apps Script → Sheets/Kit → 5-email nurture → $2,500 audit). 5-step build order + 5 distribution placements.

**PENDING (next):** execute the builds — AI Visibility Score tool, lead-magnet PDF, Kit funnel, Vapi voice agent, distribution launch.

---

## 🚧 DEPLOY-BLOCKED UNTIL CREDITS RESET (2026-08-12)

**Netlify credits exhausted — `netlify deploy --prod` blocked until ~2026-08-13.** Both sites have FRESH builds staged, ready to deploy in one session tomorrow:

| Site | Deploy source | Staged in | Contains |
|------|--------------|-----------|----------|
| **theonegroup.info** | `theonegroup-v2/` (Astro) | `dist/` (built 08-10) | AI Visibility Score tool, real-estate-market-report landing w/ Kit embed, 13 pages |
| **pitrowmiami.com** | `pitrowmiami-v2/` (Astro) | `dist/` (built 08-09) | 4 SEO blog posts (racing-sim-rental, corporate-team-building, f1-watch-party) |

**TOMORROW DEPLOY SEQUENCE (after credits reset):**
1. `theonegroup-v2`: fresh `npm run build` → temp-dir deploy method (see MEMORY.md) → `netlify deploy --prod`
2. `pitrowmiami-v2`: temp-dir deploy → `netlify deploy --prod`
3. Verify both live URLs + verify `/ai-visibility-score/` renders.
4. THEN unpause distribution (Distribution Kit flags: nothing links the tool until URL verified live).

## ✅ FUNNEL BUILD WORK DONE (non-deploy, 2026-08-12)

- **AI Visibility Score tool** — page (`.astro`) + Apps Script backend (`.gs`) built & QA'd. Scoring rubric verified consistent frontend↔backend (buckets AI-Ready/At Risk/Invisible match). Deploy-ready.
- **Lead-magnet PDFs** — 3 built (default/real-estate/HVAC) → `out/lead-magnet/` + Drive.
- **Benchmark reports** — 4 built → `out/benchmarks/` + Drive.
- **Kit setup guide + 5-email nurture sequence** — `KIT_SETUP_GUIDE.md`, `NURTURE_SEQUENCE.md` (full ready-to-paste email copy).
- **Distribution Launch Kit** — `out/distribution-launch/DISTRIBUTION-LAUNCH-KIT.md` (FB groups x2, Nextdoor, Reddit value-thread, guest pitch, X pin + 3 tweets, launch sequence).
- **Vapi voice agent config** — `out/vapi-agent/` (system prompt + setup + test script).
- **Git**: funnel deliverables committed (`e495d89`, 19 files).

## 🔜 QUEUED FOR TOMORROW (beyond deploy)

- **Alec actions (not Netlify):** deploy the Apps Script web app → paste URL into `ai-visibility-score.astro`; create Kit account + form → swap `FORM_ID`; book audit CTA link.
- **Vapi setup** — follow `out/vapi-agent/VAPI-AGENT-CONFIG.md` (~10-20 min).
- **Distribution launch** — start after tool URL verified live (follow launch sequence).
- **Pit Row**: site is deploy-ready; GBP listings (`GBP-LISTINGS-DRAFT.md`) still need Google Business Profile execution.

---

## 🔧 FUNNEL HARDENING + SYSTEM FIXES (2026-08-12 17:00)

Alec: "do everything else" + "what else can we improve / most powerful thing" → closed funnel gaps + fixed stale systems:

- **Score tool no-lead-lost capture** — `ai-visibility-score.astro`: leads now queue in localStorage + auto-retry, and show a fallback note if backend unreachable. No lead silently dropped. Build passes (14 pages).
- **Audit booking link locked down** — CTA now goes straight to **https://calendly.com/akennedy-theonegroup/30min** (confirmed live). Nurture emails 4 & 5 got the same link. Was pointing at generic /contact (conversion friction).
- **Reply scanner (feedback loop now actually closes)** — built `agents/scan_replies.py`: fetches Gmail via connector, matches sender to drafted leads (domain match, skips personal/dealership threads), classifies reply/positive/booking/opt-out, records into `data/reply_signals.json` → re-weights Arlo. Verified: matches South Florida Air, correctly skips Hyundai/BMW personal threads. Cron `2230a9f9` every 3h (weekdays 8-19) — pings Alec only on positive/booking for fast follow-up.
- **Routing sync fixed** — `sync_model_routing.sh` + `sync_model_runtime_config.mjs` rewritten for v5.2 schema (were crashing on dead `.routing.provider_failover.paid_chain`). Now backups live config before write, syncs canonical stack (deepseek→gpt-oss-20b→kimi-k3→gpt-5.6-sol→luna). Live `openclaw.json` re-synced to canonical. Timestamped backups saved.

**Note:** The reply scanner found 0 real outreach replies in the last 14d of inbox (all personal dealership threads) — so no leads have replied yet. The scanner is now in place to catch the first one and alert fast.
