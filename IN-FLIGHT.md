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
