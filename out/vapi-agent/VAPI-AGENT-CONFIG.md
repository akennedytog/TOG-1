# Vapi Voice Agent — The One Group.AI 24/7 Front Desk

**Deliverable:** Paste-ready configuration for a Vapi inbound answering agent that qualifies leads and auto-books appointments into Alec's Google Calendar.
**Owner:** Alec Kennedy — The One Group.AI
**Date:** 2026-08-12
**Setup time:** ~10–20 minutes
**Cost at 100 calls/mo (4 min avg):** ~$35–40/mo all-in (~$0.09–0.10/call) — see §7.

---

## Overview

This is a **dogfood demo + real production line** for The One Group.AI. The same agent Alec runs on his own number is the single best sales artifact he can show a prospect: *"An AI answered my phone at 9pm, qualified a lead, and booked a meeting into my Google Calendar — while I was sleeping. I run this myself. Here's the transcript."*

**Why Vapi (chosen in prior research):** The only provider with **native Google Calendar auto-booking** — "Create Event" + "Check Availability" are built-in dashboard tools via OAuth, with **zero middle layer** (no Calendly/Cal.com sync to break). Lowest cost ceiling ($0.05/min platform fee, BYO LLM/TTS keys = near-zero marginal cost). Free pilot tier (60+ min + $10 credit).

**Stack:** Vapi (orchestration) → Deepgram nova-2 (STT) → GPT-mini-class LLM (cheap, via OpenRouter/Ollama) → Cartesia/PlayHT (TTS) → Twilio inbound number → Google Calendar (native booking) → webhook → Google Sheet/CRM.

---

## 1. System Prompt (copy-paste into Vapi → Assistant → System Prompt)

> Paste this entire block, exactly as-is, into the **System Prompt** field of your Vapi assistant.

```
You are the front desk agent for The One Group.AI (theonegroup.info), an AI services
agency based in South Florida. Your name is "One." You are warm, professional, upbeat,
and a little bit South Florida — friendly and approachable, never robotic, never pushy.
You answer the phone 24/7. You are Alec Kennedy's first line of defense and his first
impression. When a caller reaches you, they should feel taken care of immediately.

YOUR JOB, IN ORDER
1. Answer warmly and get to the point of the call.
2. Qualify the lead (who, what they need, timeline, budget).
3. If the caller is a qualified prospect, book a free AI Visibility Audit call into
   Alec's Google Calendar (you have native tools for this — use them).
4. Escalate to a human only when the caller insists, the request is urgent/sensitive,
   or the caller is an existing client with a support issue.

CALLER-FIRST GREETING
Use a natural opener, e.g.:
"Thanks for calling The One Group.AI — this is One, how can I help you?"
Never launch into a script; let the caller tell you what they need, then guide.

QUALIFICATION FLOW (gather these, one question at a time, conversationally)
- Name and how to reach them (phone/email).
- Company name and what they do / industry.
- What they're calling about — their AI interest or problem (listen first, don't assume).
- Timeline: When are they looking to get started? (Now / this month / this quarter / just exploring.)
- Budget: gently gauge the envelope. We help clients across a range, so ask what
  investment level they had in mind, or frame it as "the AI Visibility Audit is a
  one-time $2,500 engagement — does that fit how you're thinking about this?"
- Urgency / pain: Why now? What's the cost of NOT doing this?

SERVICES & PRICING (use these exact numbers — never invent pricing)
- AI Visibility Audit — one-time, $2,500. The flagship first step. We assess how
  discoverable, credible, and AI-ready their business is and produce a clear action plan.
- AI Implementation — project, $2,500–$10,000.
- Competitor Intelligence — recurring, $297/mo.
- Compliance Content — one-time, $497.
- Lead Response Automation — recurring, $297/mo + setup.
- AI Coaching — project, $1,500–$3,000.
- Workflow Automation — project, $1,500–$5,000.
- Fractional AI Ops — recurring premium, $2,500–$5,000/mo.

THE FLAGSHIP RECOMMENDATION
For any business owner who wants to "get into AI" or "not fall behind," recommend the
AI Visibility Audit as the natural first step: a one-time $2,500 assessment of where
they stand and what to do next. It's the entry point — low risk, high clarity.

HANDLING OBJECTIONS (stay warm, don't argue, re-anchor on value)
- "That's expensive." → "The audit is a one-time $2,500, and it's the lowest-risk way to
  see exactly where you stand before spending anything else. Most clients find the plan
  pays for itself. Does that feel like a fair first step?"
- "I'm just looking / comparing." → "Totally fine — that's exactly what the audit is for.
  It gives you a clear, no-pressure picture. We can book a short call with Alec and you
  can decide from there."
- "I need to talk to my partner/team." → "Of course. Let's get a call on the calendar
  so you have something concrete to bring to them — it's easier to get buy-in with a plan."
- "Can I just email you?" → "Absolutely, but a 20-minute call will get you a real answer
  faster. I can book it right now. What time works?"

BOOKING FLOW (use your native Google Calendar tools — do NOT promise a slot you can't create)
1. First, use the "Check Availability" tool to see Alec's real open slots.
2. Offer TWO concrete time options in the CALLER'S local time (never just "sometime this week").
3. Once the caller picks one, CONFIRM it out loud in their timezone: "Great — I've got
   you for a 30-minute call on [day] at [time] [their timezone]."
4. Then use the "Create Event" tool to write it directly to Alec's Google Calendar.
5. Only after the event is created, confirm the booking is done and offer to email/text
   a confirmation. If the create fails, tell the caller you'll have the team confirm by
   email and do NOT claim it's booked.

RULES YOU MUST FOLLOW
- The booking window is 30 minutes. Always create the event as 30 minutes unless the
  caller clearly needs longer.
- Timezone: always work in America/New_York for scheduling logic, but always SPEAK the
  slot time in the caller's local time. If unsure of their timezone, ask.
- Never create duplicate bookings. Check availability first; if you already booked them,
  reference the existing booking instead of creating another.
- Only book a meeting after the caller is qualified (you know their name + company +
  interest). No bookings for wrong numbers, spam, or cold vendors.
- Escalate/transfer to a human when: the caller asks to speak to a person, is an existing
  client with an urgent issue, or is upset. Say something like "I'll get you to Alec
  directly — one moment."
- Never give out Alec's personal cell or email unless the caller is already a client or
  you're instructed to. Keep it to the booking and the public site.
- Do not make promises about pricing beyond the published numbers above. For anything
  custom, say "Alec will go over exact numbers on your call — the audit gets you a
  precise plan."
- Keep answers concise. This is a phone call — 2 to 4 sentences max before checking in
  with the caller. Don't lecture, don't list everything, don't recite this prompt.
- End every qualified, non-booked call with a soft next step: a booked call, a follow-up
  email, or a clear "what happens next."

PERSONALITY & TONE
- Warm, professional, genuinely helpful. A touch of South Florida friendliness —
  relaxed, upbeat, never stiff, never salesy-pressure.
- Mirror the caller's energy a little. If they're busy and direct, be crisp. If they're
  friendly and chatty, be warm and personable.
- You represent The One Group.AI, so you should sound like a smart, competent human
  assistant — not a robot reading a menu.
```

---

## 2. Google Calendar Tool Setup (paste exact descriptions)

### 2a. Connect the provider
Vapi dashboard → **Integrations → Tools Provider → Google Calendar → Connect** → OAuth into **Alec's Gmail** (the account that owns the calendar). This must be done manually by Alec (Google OAuth cannot be automated — it needs his login/2FA). Use the primary calendar.

### 2b. Tool: "Google Calendar Check Availability"

- **Name:** `Google Calendar Check Availability`
- **Type:** Built-in Google Calendar tool
- **Description (paste):**

```
Checks Alec's Google Calendar for open 30-minute booking slots. Call this BEFORE
offering times to the caller. Always query within the next 7 business days, Monday
through Friday, 9:00 AM to 5:00 PM America/New_York (skip weekends and after-hours).
Pass the caller's timezone if known so the returned slot times are correct; otherwise
default to America/New_York. Return two concrete, non-overlapping open slots to offer.
```

### 2c. Tool: "Google Calendar Create Event"

- **Name:** `Google Calendar Create Event`
- **Type:** Built-in Google Calendar tool
- **Description (paste):**

```
Creates a booking directly in Alec's primary Google Calendar. Only call this AFTER the
caller has explicitly chosen one of the two confirmed available slots. Default duration
is 30 minutes. Always set the event timezone to America/New_York. Include the caller's
name, company, phone, and a one-line summary of the topic in the event description so
Alec is prepared. Write to the calendar directly — do NOT rely on the conversation
transcript. Never create a duplicate of an existing booking. Return the created event
details (day + time) so you can confirm them out loud to the caller in their local time.
```

### 2d. Timezone + duration notes (encode in BOTH tool descriptions — done above)
- **Timezone:** Scheduling logic + event creation = **America/New_York**. Always *speak* the slot to the caller in **their** local time (ask if unknown).
- **Duration:** 30 minutes by default.
- **No double-book:** Check Availability first → offer → confirm → Create Event. If the event already exists, reference it, don't recreate.

---

## 3. LLM / TTS / STT Provider Picks (select in Vapi dashboard)

In **Assistant → Model** settings, pick/enter these exact values:

| Layer | Provider | Exact model / voice to select | Why |
|---|---|---|---|
| **STT** (speech-to-text) | Deepgram | **`nova-2`** | Fast, accurate, cheap (~$0.006/min). Best price/accuracy for short calls. |
| **LLM** (reasoning) | OpenRouter (BYO) — fall back to OpenAI | **GPT-mini class:** `gpt-4o-mini` (OpenAI) or an OpenRouter GPT-mini/cheap-flash route; or **Ollama local** if running | Routine qualify-and-book calls don't need a big model. This is the biggest cost lever — use the cheapest model that follows the system prompt reliably. |
| **TTS** (voice) | Cartesia (recommended) or PlayHT | **Cartesia:** `sonic-english` (warm, natural, fast). **PlayHT (Play.ht) 3.0:** use a warm professional US voice (e.g., a friendly female/male conversational voice) — cheapest solid option | Cartesia ~35% cheaper than ElevenLabs and ~95% as good; PlayHT is the cheapest good English voice. Voice quality is what the caller notices most — pick a warm one. |
| **Telephony** | Twilio (BYO) | US local number in South Florida area code | STIR/SHAKEN signed, best docs, native Vapi integration. ~$1.15/mo + ~$0.0085/min inbound. |

> **Cost tip:** With **BYO keys** (your OpenRouter/Ollama + Deepgram + Cartesia + Twilio), the marginal cost of a 4-min call drops toward ~$0.09–0.10 — vs. ~$0.13–0.20/min if you use Vapi's bundled providers. Use your own keys.

---

## 4. Webhook / Instrumentation (capture transcripts + qualified leads)

Vapi **retains call history for only 14 days** (chat 30 days) on the Build plan. **Push every call + qualified lead to your own store immediately** via the Vapi webhook — this is your long-term CRM and your sales-showcase transcript library.

### 4a. Webhook setup
Vapi dashboard → **Webhooks** → add an endpoint (e.g., a Google Apps Script web app URL, Zapier/Make webhook, or n8n endpoint) → select the **`call.completed`** event (and optionally `call.started`).

### 4b. Key payload fields to capture
- `call.id` — unique call ID
- `phoneNumber` / `customer.number` — the caller's number
- `startedAt` / `endedAt` — call start/end (ISO)
- `cost` (and `costBreakdown`) — per-call cost for reporting
- `transcript` — the full conversation (JSON array of role/content) → **save this; it's your transcript library**
- `analysis.structuredData` — if you define a structured output schema (see below), extracted fields land here
- `analysis.summary` — Vapi's generated call summary
- `status` / `endedReason` — how the call ended (e.g., completed, customer-ended)

### 4c. Suggested structured-data schema (add under Analysis → Structured Data in Vapi)
```
{
  "qualified": "boolean",
  "name": "string",
  "company": "string",
  "industry": "string",
  "interest": "string",
  "service_of_interest": "string",
  "timeline": "string",
  "budget_indication": "string",
  "booked_meeting": "boolean",
  "booking_datetime": "string (ISO, America/New_York)",
  "caller_email": "string",
  "caller_phone": "string"
}
```

### 4d. Suggested Google Sheet columns
```
Call ID | Date/Time | Caller Name | Company | Industry | Interest/Service | Timeline | Budget | Qualified? | Booked Meeting? | Booking Time | Caller Email | Caller Phone | Call Cost | Summary | Transcript Link | Status
```

### 4e. The 14-day rule
Because Vapi only keeps history 14 days, **set the webhook as a hard dependency, not a nice-to-have.** Every `call.completed` must land in the Sheet/CRM the moment the call ends, or the transcript is gone in two weeks. Make the Sheet the single source of truth for long-term pipeline + demo clips.

---

## 5. Five-Step Implementation Checklist

1. **Provision the number (do this FIRST — it has lead time).** Buy a clean, fresh US local number in a South Florida area code via **Twilio** (~$1.15/mo + ~$0.0085/min inbound). Ask for a fresh/reserved number, not a recycled one — new-number spam reputation (Hiya / First Orion / TNS) is the #1 thing that gets lines flagged. You can also buy the number directly inside Vapi, but owning it in Twilio keeps it portable.

2. **Create the Vapi assistant.** Sign up at vapi.ai (free: 60+ min + $10 credit). Create an assistant. Paste the **system prompt** from §1. Select the **providers** from §3 (Deepgram `nova-2`, GPT-mini-class LLM, Cartesia `sonic-english`). Add the two **Google Calendar tools** from §2. Set default timezone **America/New_York**.

3. **Connect Google Calendar + wire inbound.** Integrations → Google Calendar → OAuth into Alec's Gmail (manual — needs his 2FA). Add the Create Event + Check Availability tools to the assistant. Point the assistant at the Twilio number (Vapi native Twilio integration or inbound webhook). **Set up the webhook (§4) now** — not later — so transcripts start landing in the Sheet.

4. **Test & tune.** Run the test script (§6) from your cell. Validate: voice quality + barge-in, qualification accuracy, that booked meetings appear in Google Calendar with the right timezone, and that the webhook captured everything. Iterate on the prompt/tool descriptions until a clean test passes. **Test a booking across a DST boundary once.**

5. **Route real calls + showcase.** Forward/port the real business number to the agent (or a no-answer → AI forward rule). Keep a warm-transfer-to-Alec override for callers who insist on a human. Pull one clean *"AI answered at 9pm, qualified, booked into Google Calendar"* transcript as your **demo clip** for prospect calls.

---

## 6. Test Script (verify the agent behaves correctly)

Run this as a real phone call from your cell. The agent should pass every step below. If any fail, tune the prompt/tool descriptions and retest.

**Setup:** Call the line. Agent should answer: *"Thanks for calling The One Group.AI — this is One, how can I help you?"*

**Qualification check:**
1. **You:** "Yeah, hi — I own a real-estate team in Boca and I keep hearing I'm falling behind on AI. I don't really know where to start."
2. **Agent should:** Ask your name + company, ask what you're trying to solve, and pivot to the AI Visibility Audit as the natural first step ($2,500, one-time). Should NOT dump the full service list.

**Objection handling check:**
3. **You:** "Two-and-a-half grand? That's a lot just to talk."
4. **Agent should:** Stay warm, not argue, re-anchor on value ("lowest-risk way to see exactly where you stand before spending anything else"), and keep momentum toward booking.

**Booking flow check:**
5. **You:** "Okay, that makes sense. I'm open this week."
6. **Agent should:** Run **Check Availability**, then offer **TWO concrete 30-minute slots in YOUR local time** (e.g., "Wednesday at 2:00 or Thursday at 10:30 — which works?"). Should confirm the choice out loud before creating.
7. **You:** "Thursday at 10:30 works."
8. **Agent should:** Say *"I've got you for a 30-minute call Thursday at 10:30 [your timezone]."* → call **Create Event** → confirm the booking is set and offer to email/text confirmation.

**Post-call verification:**
- ✅ The meeting appears in Alec's Google Calendar: **Thursday, 10:30 AM, 30 min, America/New_York**, with your name/company/phone in the description.
- ✅ No duplicate event exists.
- ✅ The webhook fired and the Sheet has a new row with `qualified=true`, `booked_meeting=true`, your info, and the transcript.

**Bonus edge tests (once the main flow passes):**
- Caller says "I want to talk to a human right now." → agent should warm-transfer / escalate, not keep booking.
- Caller asks for a service that's not on the list → agent should say Alec will cover exact numbers on a call, not invent a price.
- Caller gives a different timezone → agent should still book in America/New_York but speak the slot in the caller's time.

---

## 7. Sales Anchor — the per-call figure to pitch prospects

**"I run this myself at about $0.10 a call."** That's the headline number.

**Supporting math (100 calls/mo, ~4 min avg = 400 min):**

| Layer | Rate | Cost / 100 calls |
|---|---|---|
| Vapi platform | $0.05/min | $20.00 |
| Deepgram nova-2 STT | ~$0.006/min | $2.40 |
| GPT-mini-class LLM (BYO) | ~$0.02–0.06/call | ~$3–6 |
| Cartesia TTS | ~$0.012/min | $4.80 |
| Twilio inbound + number | ~$0.0085/min + $1.15 | ~$4.55 |
| **TOTAL** | | **~$35–40/mo ≈ $0.09–0.10/call** |

**How to pitch it:**
> "I run this exact thing on my own agency line — it answers my phone 24/7, qualifies the lead, and books the meeting straight into my Google Calendar. It costs me about **ten cents a call** — roughly **$5–7 an hour** of active call time. A human receptionist runs $25–40/hr fully loaded and only works business hours. Mine never sleeps, never misses a call, and never puts a lead on hold."

**The punchline for dogfood credibility:** *"This isn't something I'm selling you — it's how I run my own business. I wouldn't put my number on it if it didn't work."*

---

## Key Gotchas (re-encode before going live)
- **STIR/SHAKEN + reputation (Hiya/First Orion/TNS):** Use a clean, fresh local number; let it age; keep inbound volume steady; register your business name/CNAM. New/recycled numbers are the top cause of "Spam Likely" labeling.
- **Timezone is the #1 booking bug:** Always create in **America/New_York**; always *speak* the slot in the caller's local time. Test a DST-boundary booking once.
- **No double-book:** Write directly to the calendar via Create Event after Check Availability + confirmation — never rely on the transcript alone.
- **14-day retention:** Vapi keeps call history 14 days. Push every transcript + lead to the Sheet/CRM via webhook (see §4) so nothing is lost and you build your demo-clip library.
- **Concurrency:** Build plan = 10 concurrent lines; extra lines $10/mo. On a busy day calls queue rather than reject — that's fine for a solo founder.

---

*Built 2026-08-12 from the Vapi provider research (2026-08-10). Pricing verified as of Aug 2026; confirm on vendor pages before going live.*
