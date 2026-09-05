# 🧠 Family AI Assistant — Capability Playbook (LIVE)

_Verified working as of 2026-08-15. This is what the assistant can do RIGHT NOW through connected services._

---

## ✅ Confirmed Working (tested end-to-end)

### 📅 Calendar (Google Calendar — full read/write)
The assistant can manage your real schedule. Verified: pulled your actual calendar (lead-call blocks for Mon 8/17).

| You say | What it does |
|---------|-------------|
| "What's on my calendar today?" | Lists today's events |
| "What's my schedule this week?" | Lists events across all calendars |
| "Add dinner with Sarah Friday 7pm" | Creates event (natural language via quick-add) |
| "Book a call with X at 2pm Tue" | Creates a timed event |
| "Move my 3pm to 4pm" | Reschedules an event |
| "Cancel my dentist appt" | Deletes an event |
| "Find when I'm meeting John" | Searches events by text |
| "Am I free Thursday afternoon?" | Checks availability / conflicts |

### ✅ To-Dos (Google Tasks — full read/write)
| You say | What it does |
|---------|-------------|
| "Remind me to call the plumber" | Adds a task |
| "Add 'send invoice' to my list" | Adds a task with notes |
| "What's on my to-do list?" | Lists all tasks |
| "Mark 'pay rent' done" | Completes a task |
| "When is X due?" | Shows due dates |

### ✅ Email (Gmail — full read/write/send)
| You say | What it does |
|---------|-------------|
| "Any important emails?" | Fetches unread, flags what needs a reply |
| "Draft an email to X about Y" | Creates a draft (you review before send) |
| "Send a follow-up to X" | Sends email |
| "Reply to the email from X" | Replies in-thread |
| "Find the email about Z" | Searches Gmail |

### ✅ SMS (Twilio — inbound/outbound)
- New assistant number: **+1 (754) 350-9490**
- Allowlisted to your number only (+1 502-403-7201)
- Webhook wired to the Gateway (probe: `matches`, `probe ok: True`)
- ⏳ **Pending:** Twilio A2P brand approval (24h–5 days) before it can send/receive live texts

---

## 🧰 Also Connected (ready, not yet in the "command" layer)

| Service | What it can do |
|---------|---------------|
| **Google Sheets** | Read/write spreadsheets (lead tracking, referral tracker) |
| **Google Docs** | Create/edit documents |
| **Google Drive** | Store/retrieve files |
| **Google Slides** | Build presentations |
| **Google Forms** | Create forms, read responses |
| **Notion** | Read/write your workspace |
| **HubSpot** | Full CRM (contacts, deals, companies, tasks) |
| **GitHub** | Repos, issues, code |
| **Google Analytics** | Site traffic |
| **Search Console** | SEO data |

---

## 🧠 Assistant "Brain" (what it does automatically)

- **Reminders** — via cron + Google Tasks (set a time, it pings you)
- **Email triage** — heartbeat checks unread, pings you only for real humans / sales
- **Calendar triage** — flags events starting within ~2h
- **Lead pipeline** — Arlo finds leads → Iris drafts outreach → you approve/send
- **Reply scanner** — watches for lead replies, re-weights future targeting

---

## 🚧 Not Yet (needs setup)

- **Live SMS send/receive** — blocked on Twilio A2P approval
- **Restaurant reservations** (OpenTable) — not connected
- **Doctor booking** (Zocdoc/Elation) — not connected
- **Daycare** (Brightwheel/Procare) — not connected
- **Holiday calendar** (Calendarific) — not connected

---

## 💬 How to talk to it

Just text/type naturally. It parses intent and routes to the right tool:
- "remind me…" → Tasks + cron
- "add/book/schedule…" → Calendar
- "email/draft/send…" → Gmail
- "what's on…" → Calendar/Tasks read

**Safety rule:** Anything that sends externally (email send, public post) gets your review first. Calendar/task changes are safe to do directly.
