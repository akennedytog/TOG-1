# 🚀 LAUNCH CHECKLIST — The One Group.AI Funnel (2026-08-13)

**Goal:** Take the fully-built (but not-yet-live) lead machine and flip it on in one coordinated launch.
**Time to execute:** ~45–60 min, mostly Alec hands-on (OAuth, Kit, Vapi, Netlify). Everything else is pre-built and verified.

---

## WHY THIS ORDER MATTERS

Do the deploys FIRST (site live → score tool reachable), then wire the capture (Kit), then the voice agent (Vapi), then push traffic. Each step makes the next one testable. Don't skip to traffic before the funnel captures.

---

## ✅ STEP 0 — Pre-flight (5 min, do first)

- [ ] Netlify credits reset (deploy was blocked yesterday on credits)
- [ ] Confirm both site builds are fresh (they are, as of 8/12):
  - `theonegroup-v2/dist/` — has AI Visibility Score page + benchmarks
  - `pitrowmiami-v2/dist/` — has 4 SEO blog posts
- [ ] Google Apps Script (`ai-visibility-score-backend.gs`) is saved & ready to deploy
- [ ] You can log into: Netlify, Kit, Vapi, Twilio, Google (all are your existing accounts or free)

---

## STEP 1 — DEPLOY THE WEBSITES (Netlify, ~10 min)

> Both sites deploy from their Astro `dist/` folders via the temp-dir method (NEVER from a stale project — see MEMORY.md golden rules).

**Site A — theonegroup.info** (this is the funnel home)
```bash
rm -rf /tmp/tog-full && mkdir -p /tmp/tog-full
cp -r ~/.openclaw/workspace/theonegroup-v2/dist/* /tmp/tog-full/
cp ~/.openclaw/workspace/theonegroup-v2/dist/_redirects /tmp/tog-full/ 2>/dev/null
cd /tmp/tog-full
rm -rf .netlify
netlify link --id 56446bc7-9070-44b6-84f3-aa0dd8b5277b   # theonegroup-v2
netlify deploy --prod --dir .
```
- [ ] Verify: **theonegroup.info/ai-visibility-score/** loads (the tool)

**Site B — pitrowmiami.com** (SEO asset, same pattern, id `7abc1027-310c-4712-971f-adb899d694b2`)
- [ ] Verify: pitrowmiami.com blog pages load (4 new posts)

---

## STEP 2 — DEPLOY THE SCORE BACKEND (Apps Script, ~10 min)

The score tool currently has a **placeholder URL** — it can't actually save leads until this is live.

1. Open **script.google.com** → the `ai-visibility-score-backend.gs` project.
2. **Deploy → New deployment → Web app.**
3. Execute as: **Me** · Who has access: **Anyone** (this is a public form backend).
4. Copy the `/exec` URL (e.g. `https://script.google.com/macros/s/XXXX/exec`).
5. Paste it into `theonegroup-v2/src/pages/ai-visibility-score.astro` line 236:
   ```js
   const SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_REAL_ID/exec';
   ```
6. Rebuild + redeploy the site (repeat STEP 1) so the live page has the real URL.
- [ ] Test: submit the score form with a test email → confirm a row lands in the linked Sheet.
- [ ] The score tool now has **no-lead-lost capture** (localStorage queue + retry) built in.

---

## STEP 3 — WIRE EMAIL CAPTURE (Kit, ~15 min)

Follow `KIT_SETUP_GUIDE.md` end-to-end. The critical items:
- [ ] Kit account (free plan, 10k subscribers) + sender identity (`akennedy@theonegroup.info`)
- [ ] Form **"AI Visibility Score Lead Capture"** (email + name + Industry + City custom fields)
- [ ] 5-email automation (from `NURTURE_SEQUENCE.md`) with delays: instant / +1d / +3d / +5d / +8d
- [ ] Industry-matched P.S. (tags or conditional content)
- [ ] **Calendly link on Emails 4 & 5** → `https://calendly.com/akennedy-theonegroup/30min` (already in the sequence)
- [ ] CAN-SPAM: unsubscribe + physical address
- [ ] Connect the score backend → Kit (Step 6 in guide) OR embed the Kit form directly on the page
- [ ] Send yourself a test of all 5 emails, confirm placeholders + links work

> **Simplest v1:** embed the Kit form on the score page (Step 2A). The API integration is cleaner but optional.

---

## STEP 4 — VOICE AGENT LIVE (Vapi, ~20 min)

> Full paste-ready config: **`out/vapi-agent/VAPI-AGENT-CONFIG.md`**. This is the highest-leverage revenue lever (24/7 audit booking). Follow its §5 checklist:

1. **Twilio** — buy a fresh South Florida number (~$1.15/mo). Do FIRST (lead time).
2. **Vapi** — create assistant (free trial: 60+ min + $10 credit).
3. **Paste the System Prompt** (§1 of the config) into the Assistant.
4. **Add the 2 Google Calendar tools** (§2): Check Availability + Create Event (paste exact descriptions).
5. **Pick providers** (§3): Deepgram `nova-2` STT · GPT-mini-class LLM (BYO OpenRouter) · Cartesia `sonic-english` TTS.
6. **OAuth Google Calendar** into your Gmail (manual — your 2FA).
7. **Set up the webhook NOW** (§4) so every call + transcript lands in a Sheet (Vapi only keeps 14 days).
8. **Run the test script** (§6) from your cell — qualify, book, verify calendar event + no duplicate.
9. Point the number at the agent; add a warm human-transfer override.

- [ ] Test call passes all §6 steps
- [ ] Booked meeting appears in Google Calendar (30 min, America/New_York)
- [ ] Webhook row in the Sheet with transcript

---

## STEP 5 — PUSH TRAFFIC (Distribution Launch Kit)

> Follow **`out/distribution-launch/DISTRIBUTION-LAUNCH-KIT.md`**.

- [ ] Post A + B in target Facebook groups (HVAC/home-services + real-estate owner groups)
- [ ] Pinned X post pointing to the score tool
- [ ] Nextdoor / local Reddit placements
- [ ] Benchmark reports (in `out/benchmarks/`) as lead magnets to share
- [ ] Update the system-proof page with the live Vapi "AI answered at 9pm + booked" demo clip once you have it

---

## 📋 MASTER QUICK-CHECK (all funnel pieces live?)

| Piece | Live? | Where |
|---|---|---|
| Website (theonegroup.info) | [ ] | Netlify deploy |
| AI Visibility Score page | [ ] | /ai-visibility-score/ |
| Score backend saves leads | [ ] | Apps Script web app |
| Email capture (Kit) | [ ] | Kit form + 5-email auto |
| Calendly audit booking | [ ] | calendly.com/akennedy-theonegroup/30min |
| Voice agent (Vapi) | [ ] | Vapi assistant on Twilio # |
| Reply scanner (feedback loop) | [ ] | Already cron'd (2230a9f9) |
| Traffic | [ ] | Distribution kit |

**When all 8 are ✅, the machine is fully live and self-feeding.**

---

## 🎯 THE HEADLINE NUMBER TO SELL WITH

**"I run this exact system on my own line — an AI answered my phone at 9pm, qualified the lead, and booked the meeting into my Google Calendar while I slept. It costs me about ten cents a call. I wouldn't put my number on it if it didn't work."**

That's the dogfood pitch. One clean transcript of the Vapi agent doing its thing is your single best sales artifact.

---

*Built 2026-08-12. Everything referenced exists and is verified — only the deploy/account actions in Steps 1–4 require your hands.*
