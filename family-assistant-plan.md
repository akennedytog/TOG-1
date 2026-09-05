# Family Personal Assistant — Scope & Build Plan

**Goal:** One assistant (built on OpenClaw) that handles family life end-to-end — bookings, appointments, messages, scheduling — via a message bot ("get me a reservation at X", "schedule a doctor appt", "message the daycare").

---

## PHILOSOPHY — the 3-layer model

This isn't one product; it's a **brain + memory + action layer**:

1. **Brain (AI + decision-making):** OpenClaw (already running)
2. **Memory (family context):** OpenClaw memory system — who, where, preferences, routines, history
3. **Action (the "doing"):** integrations + connectors that actually execute

The hard part is layer 3. Everything below maps it.

---

## PHASE 1 — DOABLE NOW (build these first, most impact)

### 1. Restaurant Reservations ✅ HIGH VALUE
- **Primary:** OpenTable API (aggregates thousands of restaurants, real-time availability)
- **Backup:** phone/voice agent for restaurants not on OpenTable
- **Action:** message bot → picks restaurant/time/party size → confirms via text
- **Effort:** medium (one API + confirmation flow)

### 2. Doctor Appointments ✅ HIGH VALUE
- **Primary:** Zocdoc API (thousands of practices, real-time)
- **Platform-level:** Elation / Athenahealth / Kareo / Allscripts APIs (one per platform)
- **Epic/MyChart API** (covers major health systems)
- **Fallback:** voice agent calls the front desk (phone is the universal path)
- **Effort:** medium-high (needs HIPAA consideration + multiple integrations)

### 3. Family Calendar + Scheduling ✅ DOABLE NOW
- **Already working:** OpenClaw Google Calendar connector
- **Add:** shared family calendar, auto-scheduling, conflict detection
- **Effort:** low (mostly configuration + rules)

### 4. Daycare / School Messaging ✅ DOABLE NOW
- **If daycare uses text/email:** direct connector (easy)
- **If daycare uses an app (Brightwheel, Procare, Tadpoles):** these have APIs or app flows
- **Fallback:** voice/email agent
- **Effort:** low-medium

### 5. Message-Bot Control Surface ✅ DOABLE NOW
- **OpenClaw already routes through messaging** (webchat, WhatsApp, etc.)
- **Add:** phone-number texting (Twilio) so you can text the assistant from anywhere
- **Effort:** low

---

## PHASE 2 — NEAR-TERM (chain into single commands)

- **Command chaining:** "book a 6pm Italian spot near us Saturday for 4" → searches → books → adds to calendar → texts confirmations
- **Multi-step family tasks:** "arrange a sitter Saturday night and book us dinner" → coordinates both
- **Proactive reminders:** "doctor appt Tuesday at 10" → assistant preps (directions, who's driving, calendar blocked)

---

## PHASE 3 — THE PRIZE (persistent family memory)

- **Knows your routines, preferences, history** — not just answers commands but anticipates
- **Family profiles:** each member's schedule, dietary needs, preferences, medical history (private)
- **Learns over time:** "we usually eat at X on Fridays" → suggests it
- This is OpenClaw's memory system — the differentiator over every canned product

---

## THE DOCTOR QUESTION — answered

**Don't build per-doctor.** Build per-platform:
| Platform | Coverage | Approach |
|----------|----------|----------|
| Zocdoc | 1000s of practices | API |
| Elation/Athena/Kareo/Allscripts | Practices on those systems | API |
| Epic MyChart | Major health systems | API |
| Everything else | Any practice | Voice agent calls front desk |

**~5 integrations covers ~90% of cases.** The voice-agent fallback is the safety net that makes it work universally.

---

## WHAT'S REALISTICALLY HARD / WHERE I'LL BE HONEST

- **HIPAA:** handling medical data means compliance care (encryption, access controls, consent). Don't ignore this.
- **Payment actions:** booking a paid service (e.g. a prepaid class) = handling money. Higher stakes, more review.
- **Some apps have no access at all** — voice/email agent is the only universal fallback.
- **This is incremental.** Not a weekend build. Phase 1 alone is meaningful; Phase 3 takes months of use.

---

## RECOMMENDED NEXT STEP

**Build Phase 1 in this order (highest ROI first):**
1. Twilio text-message control surface (so you can text it from anywhere)
2. OpenTable restaurant booking
3. Zocdoc + practice-platform appointment booking
4. Daycare messaging (figure out which app they use first)
5. Then chain them in Phase 2

**The single most valuable thing to do right now:** confirm the **daycare's app/platform** and the **doctor's practice software** — those two answers tell us exactly which integrations are needed vs. which need workarounds.
