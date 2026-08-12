# AI Voice Agent for Inbound Business Calls — Provider Research (Aug 2026)

**Prepared for:** Alec Kennedy / The One Group.AI
**Use case:** 24/7 inbound call answering + lead qualification + auto-booking into Google Calendar, on Alec's own phone number, as a dogfood demo for SMB prospects.
**Date:** 2026-08-10

---

## Executive Summary

The best-of-breed providers for this exact workload (inbound answering → qualify → auto-book) are **Vapi**, **Retell AI**, and **Bland AI**, with **GoHighLevel Voice AI** as the CRM-native option and **Air.ai** as the long-form sales specialist. For Alec's dogfood case, the single deciding factor is **native Google Calendar auto-booking**, and only **Vapi** does this directly (Google Calendar is a built-in tool in the Vapi dashboard — no middle layer). **Vapi is the recommended pick.** Retell is the runner-up (native booking is via Cal.com, which syncs to Google Calendar, rather than direct-to-Calendar).

Two providers are effectively eliminated for cost reasons: **Synthflow** has moved to a **$30,000/year enterprise floor** (no longer solo-founder friendly), and **Air.ai** is the priciest per minute with no free credits (best for long 10–40 min sales conversations, which is not this use case).

---

## 1. Provider Comparison (Current Pricing, 2026)

> Prices are real published 2026 rates, verified against vendor pages and independent reviews (A8gent, Litmus, Tested Media, AI Agent Rank). Most platforms advertise a "platform fee per minute" that is only ONE of several cost layers (LLM tokens + TTS + telephony stack on top). See Section 6 for the real all-in math.

### Vapi — `vapi.ai` (RECOMMENDED)
- **Positioning:** Developer infrastructure for voice agents. You pick STT, LLM, TTS providers (or bring your own keys); Vapi orchestrates the real-time loop, turn-taking, telephony, tools.
- **Pricing:** Platform fee **$0.05/min** (cleanest meter in the industry — only charges for its own layer). Plus $0.005/SMS or chat message. STT/LLM/TTS passed through at cost, or **$0 to Vapi if you BYO provider keys** (e.g., your existing OpenRouter/Ollama stack).
- **Free entry:** **Build plan is pay-as-you-go with 60+ free minutes** + **$10 free credits** on signup. 10 concurrent lines included (extra lines $10/mo each).
- **Google Calendar booking:** ✅ **NATIVE.** Google Calendar is a built-in Tool Provider. Two dashboard tools — *Create Event* and *Check Availability* — connect via OAuth directly to Alec's Gmail. The agent checks real availability, then creates the event in the primary calendar. This is exactly the "auto-book" requirement with zero middle layer.
- **Other integrations:** Calendly, Cal.com, HubSpot, Salesforce, n8n, Zapier, Make, custom webhooks/tools, MCP.
- **Strengths:** Lowest cost ceiling, maximum control, BYO-model friendly (aligns with Alec's cheap local Ollama/OpenRouter stack), strongest compliance story (SOC 2, HIPAA add-on).
- **Watch-outs:** Developer product — needs API comfort. HIPAA add-on is a steep $2,000/mo (not relevant for a dogfood demo, but relevant for selling to healthcare SMBs). Call history retained 14 days on Build plan.
- **Real-world all-in:** ~$0.13–$0.20/min with bundled providers; can go lower with BYO keys.

### Retell AI — `retellai.com` (RUNNER-UP)
- **Positioning:** Polished product platform. Opinionated defaults, fastest time-to-first-call, lowest default latency (~600–800ms), best built-in conversation analytics.
- **Pricing:** Bundled **$0.07–$0.31/min** (stacks: Retell infra $0.055 + TTS $0.015–0.040 + LLM $0.027–0.08). Real production setups land **$0.13–$0.31/min**.
- **Free entry:** **$10 free credits** on signup; no flat free plan. $10 covers a few hundred pilot minutes.
- **Google Calendar booking:** ⚠️ **Not direct.** Native booking is via **Cal.com** (Retell has official Cal.com preset tools — check availability + book). Cal.com syncs two-way to Google Calendar, so a Cal.com booking lands in Google Calendar — but there IS a middle layer and you must set up a (free) Cal.com account. This works, but is one step removed from direct Google Calendar booking.
- **Other integrations:** Cal.com, Calendly, HubSpot, Salesforce, GoHighLevel, Twilio, Vonage, n8n, Zapier, Make, SIP (bring-your-own telephony).
- **Strengths:** Easiest/fastest to get a working inbound agent, best latency, strong analytics, SOC 2 Type II + HIPAA + GDPR with **self-serve BAA** (huge for selling to healthcare/regulated SMBs), durable company (~$60M ARR, growing).
- **Watch-outs:** Pricing stacking is hard to forecast; latency can spike to 2.5–3s in some production configs; less control over underlying providers; SaaS only (no self-host).
- **Real-world all-in:** ~$0.13–$0.31/min.

### Bland AI — `bland.ai`
- **Positioning:** Outbound-call infrastructure at scale (dialer, voicemail detection, scheduling, compliance). Inbound works but isn't the main story.
- **Pricing:** Flat **$0.14/min** — no token charges, no provider pass-throughs, "no surprise bills." Simple.
- **Free entry:** **Start plan includes 2 credits + an inbound phone number** ($15/mo value included). Inbound number included is a nice touch.
- **Google Calendar booking:** ⚠️ Via **Calendly** integration (OAuth; books meetings, checks live availability), not Google Calendar direct.
- **Strengths:** Best high-volume outbound dialing economics, clean flat pricing, purpose-built scheduling/retries/compliance for outbound.
- **Watch-outs:** Outbound-flavored; less BYO flexibility; smaller developer community. For pure inbound answering + booking it's overbuilt in the wrong direction.
- **Real-world all-in:** ~$0.07–$0.18/min.

### GoHighLevel Voice AI — `gohighlevel.com`
- **Positioning:** CRM-native voice agent inside the GHL ecosystem (call → contact → workflow → booking all in one place).
- **Pricing:** Voice engine ~$0.045/min + TTS $0.015–0.17/min + LLM tokens + phone charges (~$0.012 inbound). Typical call **$0.07–$0.25/min all-in** on top of a GHL plan.
- **Plan cost:** **AI Employee plan ~$97/mo per sub-account covers inbound Voice AI** (plus Conversation AI, Reviews AI, Content AI). Outbound billed pay-per-use even on that plan.
- **Google Calendar booking:** ⚠️ **Native to GHL's own calendar** (which can sync to Google Calendar), not Google Calendar directly. If Alec runs prospects on GHL, this is a one-click booking path; for his own Google Calendar it requires the GHL↔Google sync to be wired.
- **Strengths:** Zero glue code — caller auto-becomes a contact, books into calendar, triggers confirmation text. 14-day (30-day via partner) free trial. Perfect if Alec's prospects already use GHL.
- **Watch-outs:** Voice quality on cheaper voices is the #1 complaint; best reserved for agencies/SMBs already on GHL; compliance (HIPAA) needs planning.

### Air.ai — `air.ai`
- **Positioning:** Long-form conversational sales specialist (holds coherent 10–40 min conversations).
- **Pricing:** Most expensive — **$0.20–$0.40/min**. **No free credits.**
- **Google Calendar booking:** Available (scheduling is a core feature), but at premium cost.
- **Verdict for Alec:** **Gimmick-adjacent for this use case.** Impressive marketing/demos and genuinely good at long sales conversations, but overkill and overpriced for 2–5 min inbound qualification + booking. Skip.

### Synthflow — `synthflow.ai`
- **Pricing:** **Repositioned to Enterprise only — contracts start at $30,000/year.** Dropped the old per-minute/no-code tiers.
- **Verdict:** **Eliminated.** Was once the no-code SMB favorite; no longer fits a solo founder. (If Alec's prospects ask about "no-code voice AI," mention that Synthflow went upmarket and alternatives like GHL/Voiceflow cover that niche.)

### Play.ai (Play.ht) — `play.ai`
- **Positioning:** TTS + voice cloning + voice agent platform (PlayDialog). Excellent voices (PlayHT 3.0), good for affordable English TTS.
- **Pricing:** TTS from ~$0.08/1K chars; agent platform usage-based. Free tier exists for TTS.
- **Google Calendar booking:** Not a native booking tool — requires building the calendar tool yourself via API/webhooks.
- **Verdict:** Better thought of as a **voice/TTS provider** than a turnkey inbound booking agent. Useful as a BYO-TTS option inside Vapi, not as a standalone pick.

---

## 2. Google Calendar Auto-Booking — the Critical Requirement

| Provider | Native Google Calendar booking? | How it works |
|---|---|---|
| **Vapi** | ✅ **YES — direct** | Google Calendar is a built-in Tool Provider. "Create Event" + "Check Availability" tools via OAuth. Agent books straight into Alec's primary Google Calendar. No middle layer. |
| **Retell AI** | ⚠️ Via **Cal.com** | Official Cal.com preset tools (check availability + book). Cal.com syncs two-way to Google Calendar, so bookings DO land in Google Calendar — but you must set up a Cal.com account and wire the sync. |
| **Bland AI** | ⚠️ Via **Calendly** | Calendly OAuth integration books meetings and checks live availability. Calendly then syncs to Google Calendar. |
| **GoHighLevel** | ⚠️ Native to **GHL calendar** | Books into GHL's own calendar; syncs to Google Calendar via GHL integration. Direct Google Calendar requires the sync to be set up. |
| **Air.ai** | ✅ Available | Scheduling is a core feature, but premium cost, no free trial. |
| **Play.ai** | ❌ No native booking tool | Must build a custom calendar tool. |

**Bottom line:** If "must auto-book into Google Calendar, natively, with the least moving parts" is the requirement, **Vapi is the only one that does it directly.** That alone drives the recommendation.

---

## 3. Free Trial / Low-Cost Entry (Alec is cost-conscious)

| Provider | Free entry | Notes |
|---|---|---|
| **Vapi** | **60+ free minutes + $10 credits**, pay-as-you-go | Cheapest platform fee ($0.05). BYO LLM/TTS keys = near-zero marginal cost (aligns with Alec's Ollama/OpenRouter stack). **Best for cost-conscious.**
| **Retell AI** | **$10 free credits** | Enough for a few hundred pilot minutes. |
| **Bland AI** | **2 credits + free inbound number** | Free number included is convenient. |
| **GoHighLevel** | **14-day free trial** (30 via partner) | Free trial covers full platform + Voice AI on the trial. |
| **Air.ai** | **No free credits** | ✗ |
| **Synthflow** | None (Enterprise only, $30k/yr) | ✗ Eliminated. |

---

## 4. Recommended Pick + Runner-Up

### 🏆 RECOMMENDED: Vapi (`vapi.ai`)
The only provider with **native Google Calendar auto-booking** (Create Event + Check Availability tools built into the dashboard — exactly what a 24/7 qualify-and-book inbound agent needs, with zero middle layer to break). It also has the **lowest cost ceiling** ($0.05/min platform fee, with LLM/TTS pass-through at cost or $0 with your own keys), a **free pilot tier**, and BYO-model flexibility that lets Alec plug in his cheap local Ollama/OpenRouter stack to keep marginal cost near zero — ideal for dogfooding. It's a developer-grade tool, which fits an AI-services founder building a proof-of-concept, and the built-in Google Calendar tool turns the "auto-book" promise into a clean demo for prospects.

### 🥈 RUNNER-UP: Retell AI (`retellai.com`)
If Alec wants the fastest time-to-first-call with less assembly, Retell is the most polished product and has the best default latency and call analytics. Its booking path is via Cal.com (which syncs to Google Calendar), so it's one extra moving part versus Vapi's direct Google Calendar integration — but for prospects who already use Cal.com/Calendly, Retell's native preset tools are a strong story. Retell is also the safest default if Alec plans to sell into regulated SMBs (healthcare/finance), because it offers **self-serve HIPAA BAA** on its Enterprise tier — a differentiator Vapi prices at $2,000/mo.

---

## 5. Five-Step Implementation Plan (Stand Up on Alec's Own Number)

### Step 1 — Provision a real US phone number (do this first; it has lead time)
- **Twilio** (safe default, best docs): US local number **~$1.15/mo**, inbound voice **~$0.0085/min**. STIR/SHAKEN signing included. Start here — the ecosystem support is unmatched.
- **Telnyx** (cheaper challenger): US local number **~$1.00/mo**, inbound **~$0.0035/min** (roughly half of Twilio for inbound). Use if volume compounds or you want tighter SIP control. Fine for US/CA-only traffic.
- **SkyVerge** (Alec mentioned): wholesale/competitive rates; worth pricing against Telnyx for inbound US volume, but Twilio/Telnyx are the two battle-tested defaults for Vapi.
- **Cheapest realistic:** 1 local number ≈ **$1.00–1.15/mo** + ~**$0.004–0.0085/min** inbound. For a solo founder's inbound line that's roughly **$3–8/mo** in telephony.
- *Note:* You can also just buy the number directly inside Vapi (Vapi has a number-provisioning path), but owning it in Twilio/Telnyx keeps the number portable.

### Step 2 — Create the Vapi assistant + prompt
- Sign up for Vapi (free, $10 credit + 60 free minutes). Create an assistant in the dashboard.
- Write a system prompt: identity ("This is The One Group.AI's front desk"), 24/7 answering behavior, qualification script (name, company, service interest, budget/timeline, urgency), escalation rules (transfer to a human on request or emergency signals), and the booking flow (check availability → offer 2 slots → confirm → create event).
- Point the assistant at the Twilio/Telnyx number (Vapi has a native Twilio integration; or wire the inbound webhook).

### Step 3 — Connect Google Calendar + add booking tools (the core auto-book)
- In Vapi dashboard: **Integrations → Tools Provider → Google Calendar → Connect** (OAuth to Alec's Gmail).
- Create the two tools: **"Google Calendar Create Event"** and **"Google Calendar Check Availability."**
- Add both tools to the assistant; give each a precise description so the model knows when to call them (e.g., "Call after collecting caller name + desired service; confirm 30-min slot in the caller's timezone before creating the event").
- Set a default timezone (America/New_York) and define standard meeting durations in the tool description.

### Step 4 — Test, tune, then route real calls
- Make test calls from your cell to validate: voice quality, interruption/barge-in handling, qualification accuracy, and that booked meetings actually appear in Google Calendar with the right timezone.
- Iterate on the prompt and tool descriptions (Vapi keeps call transcripts/history for tuning).
- When happy, forward/port the real business number to the agent, or add a "no answer → AI" forwarding rule (works if you're on a carrier that supports simultaneous ring / call-forward-on-no-answer).
- Dogfood note: keep a manual override — the agent should be configured to warm-transfer to your cell when a caller insists on a human.

### Step 5 — Instrument + showcase to prospects
- Turn on call recording/transcripts and post-call analysis (Vapi webhooks → log calls, qualified leads, and bookings to a simple sheet/CRM).
- Pull one clean "AI answered at 9pm, qualified a lead, booked a meeting into Google Calendar" example as the demo clip for prospect calls.
- Budget the per-minute cost into a per-call figure (see Section 6) to use as your sales anchor ("I run this myself at $X/call").

---

## 6. Realistic Cost Estimate (Solo Founder)

Alec's call volume for his own agency line will be modest — realistically **50–200 inbound calls/month** (mix of prospect inquiries, existing clients, vendor calls), averaging **3–5 minutes**.

**Cost model (Vapi, recommended stack):**

| Layer | Rate | 100 calls × 4 min = 400 min/mo |
|---|---|---|
| Vapi platform fee | $0.05/min | $20.00 |
| STT (Deepgram, BYO or bundled) | ~$0.006/min | $2.40 |
| LLM (GPT-5.x-mini class / local OpenRouter) | ~$0.02–0.06/call | ~$3–6 |
| TTS (Cartesia or PlayHT — cheaper, 95% as good as ElevenLabs) | ~$0.012/min | $4.80 |
| Telephony (Twilio inbound) | ~$0.0085/min + $1.15 number | $4.55 |
| **TOTAL** | | **~$35–40/month** |

- **Conservative high end** (200 calls × 5 min, bundled premium voice + model): **~$120–150/month**.
- **With BYO keys on Alec's existing OpenRouter/Ollama stack**: marginal cost drops toward **$20–35/month** — near-zero marginal cost per the brief.
- **Upfront:** essentially $0 (free tier + $10 credit). Real cost is Alec's engineering time (~10–20 hrs for a first Vapi agent).

**Compare:** a human receptionist runs **$25–40/hr fully loaded**; a $0.08–0.12/min AI agent is **~$5–7/hr of active call time** and never sleeps. This is a strong dogfood ROI story.

---

## 7. Gotchas & Compliance (Read Before Going Live)

### STIR/SHAKEN (call authentication)
- STIR/SHAKEN is the FCC-mandated framework that cryptographically signs calls so carriers can verify the caller ID is real and not spoofed. **It applies to outbound calls** and directly affects your caller ID reputation and answer rates.
- Twilio and Telnyx both sign STIR/SHAKEN on qualifying numbers by default. For **inbound** (which is this use case) you're the recipient, so STIR/SHAKEN is not the primary concern — but the same number's reputation matters if you also dial outbound callbacks.
- For outbound, enable **Branded Calling** (Retell charges +$0.10/outbound call; Vapi/Twilio have their own branded-call options) to reduce "Spam Likely" flags.

### Spam-labeling / caller-ID reputation
- **Three independent reputation databases** — **Hiya, First Orion, and TNS** — each assign your number a score. Any one can label your line "Spam Likely." You need to keep ALL three clean.
- **New numbers are riskiest.** A fresh number with zero history or high call volume spikes gets flagged. Mitigations: buy the number early and let it age, keep inbound volume low/steady, avoid mass dialing from it, and register your business name/CNAM.
- **Warm-up applies mostly to outbound.** For a pure inbound answering line, the number reputation is largely inherited from the carrier + the number's age and whether it was previously used for spam. Choose a clean local number (not a recycled VoIP number with a bad past) — ask the carrier for a fresh/reserved number.

### Call caps & concurrency
- Vapi Build plan includes **10 concurrent lines** — plenty for a solo founder. If a busy day spikes, new calls **queue rather than reject** (good behavior); watch the `remainingConcurrentCalls` / `concurrencyBlocked` fields and add lines ($10/mo each) only if needed.
- **Platforms differ on dropped-call billing:** Bland and Air.ai charge for partial/retried calls; Retell and Vapi do NOT. Prefer platforms that don't charge for failed retries at low volume.
- **Overage / caps:** Pay-as-you-go platforms (Vapi, Retell) have no hard monthly cap — you're billed per minute, so set a spending alert. Tier-based platforms (GHL) charge 2–3x for overage; size 25% above expected volume.

### Other gotchas
- **Timezone is the #1 booking bug.** Google Calendar tools default to UTC; always pass America/New_York and confirm the slot's local time with the caller. Test a booking across a DST boundary.
- **Double-booking:** A booking that only exists in the call transcript is a double-booking waiting to happen. Ensure the agent writes directly to the calendar (Vapi Create Event) rather than just promising a slot.
- **Retention limits:** Vapi Build keeps call history 14 days, chat 30 days. Push transcripts/lead data to your own store (sheet/CRM) if you need them long-term.
- **Compliance costs can dwarf call costs:** Vapi HIPAA is **$2,000/mo** add-on; Retell/Bland bundle BAA into Enterprise (sales conversation). Not needed for Alec's dogfood, but budget this when selling into healthcare SMBs.
- **Voice quality ≠ platform quality:** The voice you choose (ElevenLabs best, Cartesia 35% cheaper & 95% as good, PlayHT cheapest) matters more than the platform. TTS is the biggest variable cost.
- **LLM choice matters more than platform fee:** A cheaper model (GPT-mini / Gemini Flash / local) handles routine booking calls fine; keep a big model only for fallback/hard cases. This is where Alec's OpenRouter/Ollama stack wins.
- **"Gimmick vs production-ready":** Air.ai is the most marketing-heavy — impressive demos, but expensive and aimed at long-form sales, not this use case. Synthflow's move to a $30k floor makes it irrelevant here. Vapi/Retell/Bland are genuinely production-grade (Retell: ~$60M ARR and growing; Vapi: used by thousands of dev teams).

---

## Sources
- AI Agent Rank — "Vapi vs Retell AI vs Bland AI 2026" (latency, positioning, per-min ranges)
- A8gent — "Vapi Review (2026)" (real all-in cost: $0.05 platform + pass-throughs, $235/mo verifiable at 1k calls, HIPAA $2,000/mo)
- Litmus Tools — "Retell AI Review (2026)" (component pricing, $10 free credits, Cal.com booking, HIPAA self-serve BAA)
- Tested Media — "AI Voice Agent Pricing 2026" (5 cost layers, per-platform platform fees, real monthly scenarios)
- Retell AI pricing page + docs (Cal.com preset tools; $0.07–0.31/min)
- Vapi docs — "Google Calendar Integration" (native Create Event + Check Availability tools)
- RocketLauncher.ai — "GoHighLevel Voice AI (2026)" (AI Employee ~$97/mo covers inbound, GHL calendar booking, $0.07–0.25/min)
- Bland.ai pricing + solutions (flat $0.14/min, 2 credits + free inbound number, Calendly integration)
- Burki.dev — "Twilio vs Telnyx for Voice AI 2026" (US per-minute + number pricing, STIR/SHAKEN, reliability)
- CallSphere/Thoughtly/Twilio — STIR/SHAKEN, Hiya/First Orion/TNS reputation, spam-labeling and warm-up guidance

*Prices verified as of Aug 2026 and can change. Always confirm on the vendor's current pricing page before committing.*
