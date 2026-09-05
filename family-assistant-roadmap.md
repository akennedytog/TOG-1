# 🚀 Family AI Assistant — Capability Expansion Roadmap

_Research compiled 2026-08-15. Benchmarks: HelpMeJuno (SMS home manager), Rosie (family assistant), Evoxa, oneBot._

---

## ✅ MANDATORY: Amazon Echo Show 15 Calendar

**Good news: this is native — no custom integration needed.**

The Echo Show 15 **natively supports Google Calendar**. Since the assistant already writes to your Google Calendar, whatever the assistant adds will automatically appear on the Show 15's screen.

### How to link it (one-time, ~2 min):
1. Open the **Alexa app** on your phone
2. Tap **More** (bottom right) → **Settings**
3. Scroll to **Alexa Preferences** → tap **Calendar**
4. Tap **Accounts** → choose **Google** → **Connect Account**
5. Sign in to your Google account (akennedy@theonegroup.info)
6. Toggle the calendars you want, pick a default, hit **Continue**

### What you get once linked:
- The Show 15 displays your **daily agenda** on the home screen (calendar widget)
- Voice commands: *"Alexa, what's on my calendar today?"*, *"Alexa, when is my next event?"*
- **The key synergy:** When you text the assistant "add dinner Friday 7pm," it writes to Google Calendar → the Show 15 shows it automatically. **One calendar, two surfaces.**

### ⚠️ One caveat to verify:
The Show 15 links to the **Google account's calendar**. If your assistant writes to a **different** Google Calendar than the one linked to Alexa, you'll need to either (a) link the same account, or (b) share the assistant's calendar with the Alexa-linked account. I can check which calendar the assistant writes to and confirm it matches.

---

## 🧠 CAPABILITY EXPANSION — What makes a family assistant strong

Based on the two best-in-class products in this exact space (HelpMeJuno and Rosie), here's the feature set that makes an assistant genuinely powerful. Ranked by value:

### Tier 1 — High value, buildable now (uses tools already connected)

| # | Capability | What it does | Tools |
|---|-----------|--------------|-------|
| 1 | **Morning briefing** | Every morning, texts you the day's schedule + weather + anything due | Calendar + weather + cron |
| 2 | **Reminder engine** | "Remind me to call X at 3pm" → auto-pings you at 3pm | Tasks + cron |
| 3 | **Email triage** | Flags important emails, drafts replies | Gmail |
| 4 | **Shared family calendar** | One calendar the whole family sees (incl. Show 15) | Calendar |
| 5 | **Grocery/shopping list** | "Add milk to the list" → shared list | Sheets/Tasks |
| 6 | **Weather alerts** | "Rain at 4pm, soccer may be cancelled" | Weather API |

### Tier 2 — Strong differentiators (moderate build)

| # | Capability | What it does |
|---|-----------|--------------|
| 7 | **Forward-an-email → calendar** | Forward a school/event email, assistant extracts dates & adds to calendar |
| 8 | **Photo/flyer → reminder** | Send a photo of a flyer/permission slip, assistant reads it & adds a reminder |
| 9 | **Weekly recap** | Sunday text/email summarizing the week ahead |
| 10 | **Family memory** | Remembers people, routines, allergies, preferences (structured, not chat) |
| 11 | **Multi-user** | Allowlist spouse/kids; each texts the same number, gets their own context |

### Tier 3 — "WOW" features (sellable as premium)

| # | Capability | What it does |
|---|-----------|--------------|
| 12 | **Restaurant reservations** | "Book dinner for 4 Friday" → OpenTable |
| 13 | **Doctor booking** | "Schedule a dentist appt" → Zocdoc/Elation |
| 14 | **Daycare/school** | Brightwheel/Procare sync (pickup times, updates) |
| 15 | **Smart home control** | "Turn off the lights" → Alexa/Home Assistant |
| 16 | **Voice (phone calls)** | Call the number, talk to the assistant (Twilio voice) |

---

## 🎯 Recommended build order (my suggestion)

**Phase 1 (this week) — the "wow" foundation:**
1. Link Echo Show 15 to Google Calendar (you do this, 2 min)
2. Morning briefing (cron, 8am)
3. Reminder engine (cron + Tasks)
4. Weather alerts

**Phase 2 (next) — the differentiators:**
5. Forward-email → calendar
6. Photo/flyer → reminder
7. Weekly recap

**Phase 3 (sellable premium):**
8. Multi-user (spouse/kids)
9. Restaurant reservations (OpenTable)
10. Voice calls

---

## 💰 How to sell this (as a feature)

The **SMS assistant** is a compelling product because:
- **No app to install** — just text a number (lowest friction possible)
- **Works for non-technical users** — your target SMB/consumer market
- **A2P-approved** — legit, deliverable, carrier-compliant
- **Multi-channel** — SMS + WhatsApp + email + Echo Show, one brain

**Pitch angle:** *"Text your family's AI assistant. It manages your calendar, reminds you of everything, and shows up on your Echo Show. No app, no login — just text."*

---

## Next step I recommend

Let me start with **Phase 1**: I'll build the **morning briefing + reminder engine + weather** (all use tools already connected, no new approvals needed), and you link the Echo Show 15 to Google Calendar. Want me to start building?
