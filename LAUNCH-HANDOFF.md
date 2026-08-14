# 🚀 LAUNCH HANDOFF — The One Group.AI Funnel (2026-08-13)

**Status:** Sites deployed ✅ · Backend script fixed to Kit v4 ✅ · Everything below is the minimal manual sequence. Each step is copy-paste ready.

**What I (Clawd) already did:**
- ✅ Deployed **theonegroup.info** + **pitrowmiami.com** (credits reset) — both verified live
- ✅ Fixed `ai-visibility-score-backend.gs` to **Kit API v4** (old v3 endpoint is deprecated and would have silently failed). Committed `4f5cda4`.
- ✅ Verified the score form fields (name/email/industry/city/website/score/bucket) match the backend exactly.
- ✅ Vapi config + Distribution Kit are complete and paste-ready.

**What needs YOUR hands** (OAuth / account creation / 2FA — I can't do these): the 4 steps below, ~45 min total.

---

## STEP 1 — Deploy the score backend (Apps Script, ~10 min)

The score tool currently has a **placeholder URL** — it can't save leads until this is live.

1. Open **script.google.com** → create a new project → paste the contents of:
   `theonegroup-v2/scripts/ai-visibility-score-backend.gs`
2. **Run `setup_`** once (authorizes the script + creates the header row).
3. **Deploy → New deployment → Web app.**
   - Execute as: **Me** (akennedy@theonegroup.info)
   - Who has access: **Anyone** (public form backend)
4. Copy the `/exec` URL (e.g. `https://script.google.com/macros/s/XXXX/exec`).
5. **Tell me the URL** — I'll paste it into `ai-visibility-score.astro` line 236, rebuild, and redeploy the site. (Or you can do it: line 236 `const SCRIPT_URL = '...'` → rebuild → redeploy.)
6. Test: submit the score form with a test email → confirm a row lands in the linked Sheet.

---

## STEP 2 — Wire email capture (Kit, ~15 min)

Follow `KIT_SETUP_GUIDE.md` end-to-end. Critical items:

- [ ] Kit account (free plan, 10k subs) — **From:** The One Group.AI · akennedy@theonegroup.info
- [ ] Form **"AI Visibility Score Lead Capture"** (email + name + Industry dropdown + City)
- [ ] **Custom fields** (Settings → Custom Fields) — these MUST exist for the backend push to work:
  - `industry` (single-select: Real Estate / HVAC / Plumbing / Accounting / Restaurant / Medical / Home Services / Other)
  - `city` (text)
  - `ai_score` (number)
- [ ] 5-email automation from `NURTURE_SEQUENCE.md` (delays: instant / +1d / +3d / +5d / +8d)
- [ ] Calendly link on Emails 4 & 5 → `https://calendly.com/akennedy-theonegroup/30min`
- [ ] CAN-SPAM: unsubscribe + physical address
- [ ] **Get your Kit API key** (Settings → Advanced → API) + **form ID** → give both to me, I'll drop them into the backend script (or you set `KIT_API_KEY` / `KIT_FORM_ID` in the .gs config).
- [ ] Send yourself a test of all 5 emails.

> **Simplest v1:** embed the Kit form on the score page (Step 2A in the guide). The API integration (Step 6) is cleaner but optional — the backend push is already coded and v4-correct.

---

## STEP 3 — Voice agent live (Vapi, ~20 min)

Full paste-ready config: **`out/vapi-agent/VAPI-AGENT-CONFIG.md`**. Follow its §5 checklist:

1. **Twilio** — buy a fresh South Florida number (~$1.15/mo). Do FIRST (lead time).
2. **Vapi** — create assistant (free: 60+ min + $10 credit).
3. Paste the **System Prompt** (§1) into the Assistant.
4. Add the **2 Google Calendar tools** (§2): Check Availability + Create Event.
5. Pick providers (§3): Deepgram `nova-2` STT · GPT-mini-class LLM (BYO OpenRouter) · Cartesia `sonic-english` TTS.
6. **OAuth Google Calendar** into your Gmail (manual — your 2FA).
7. **Set up the webhook NOW** (§4) so every call + transcript lands in a Sheet (Vapi only keeps 14 days).
8. Run the **test script** (§6) from your cell — qualify, book, verify calendar event + no duplicate.
9. Point the number at the agent; add a warm human-transfer override.

---

## STEP 4 — Push traffic (Distribution Launch Kit)

`out/distribution-launch/DISTRIBUTION-LAUNCH-KIT.md` — copy is ready. **Only start after the tool URL is verified live** (it is — https://theonegroup.info/ai-visibility-score/ returns 200).

- FB groups (2 posts), Nextdoor, Reddit value-thread, guest pitch, X pin + 3 tweets, launch sequence.

---

## ⚡ The 3 things to send me (so I can finish wiring)

1. **Apps Script `/exec` URL** → I paste into the Astro page + rebuild + redeploy.
2. **Kit API key + form ID** → I drop into the backend script config.
3. Anything you want me to draft/prep while you're in the accounts.

---

## Files reference

| File | Purpose |
|------|---------|
| `theonegroup-v2/scripts/ai-visibility-score-backend.gs` | Apps Script backend (v4-correct) |
| `KIT_SETUP_GUIDE.md` | Kit setup walkthrough |
| `NURTURE_SEQUENCE.md` | 5-email copy |
| `out/vapi-agent/VAPI-AGENT-CONFIG.md` | Vapi paste-ready config |
| `out/distribution-launch/DISTRIBUTION-LAUNCH-KIT.md` | Traffic copy |
| `out/lead-magnet/` | 3 lead-magnet PDFs |
| `out/benchmarks/` | 4 benchmark reports |
