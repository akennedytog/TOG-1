# Agent Ownership & Responsibilities

_Last updated: 2026-09-10 (system audit). This is the canonical map of who owns what, what they're approved to do, and where their state lives._

## Ownership Map

| Domain | Owner agent/script | Purpose | Approved sources/tools | Trigger/schedule | Result destination | Durable state | Permission boundary |
|---|---|---|---|---|---|---|---|
| **Family assistant** | `family_sms_router.py` + `family_chief_of_staff.py` | Two-way SMS assistant for Alec + Allison | Twilio, Google Calendar, Google Sheets, family scripts | SMS router every 2 min; morning 8:00, evening 20:00, weekly Sun 8:00 | SMS to +15024037201 (Alec) + +18472801393 (Allison) | `data/family_sms_router_state.json`, `data/family_state.json` | Family number +17543509490 only; senders allowlisted to Alec+Allison |
| **OneGroup sales** | `onegroup_pipeline.py`, `onegroup_outreach.py`, `iris_real.py`, `arlo_iris_pipeline.py` | Lead-to-client pipeline | Google Sheets CRM, Gmail, arlo_findings.json | Daily pipeline report 7:00 weekdays; weekly Fri 7:00 | Drafts/reports to Alec (WhatsApp/SMS) | `data/onegroup_pipeline.json`, Google Sheet CRM | Email-only leads; drafts not auto-sent |
| **OneGroup X content** | `onegroup_content.py`, `post_tweet.py` | X content machine (5 pillars) | X (tweepy), real build details | Daily pack 6:00 weekdays; weekly plan Sun 7:00 | Drafts to Alec for approval; publish only on approval | `data/onegroup_content.json` | No fabricated claims; publish only with Alec approval |
| **Pit Row sales** | `pitrow_*` scripts, `booking_followup.py`, `booking_queue.py` | Event-sales prospecting + booking | Dealership/venue data, Twilio | Pit Row reply scanner 10/14/18 weekdays; daily send 9:00 | WhatsApp to Alec | `data/pitrow_outreach_state.json`, `data/pitrow_event_targets.json` | Never invent equipment/pricing/availability |
| **Work executive assistant** | (not yet built) | Meeting briefs, follow-ups, weekly summaries | Employer-approved sources only | Not scheduled | Internal drafts | (none yet) | No work data imported without employer authorization |
| **Thesis/stock** | `thesis_news_watcher.py`, `stock_market_monitor.py` | AI thesis news + stock monitoring | News APIs, stock APIs | Thesis 10:00/16:00 weekdays; stock 10:00/16:00 weekdays | WhatsApp to Alec | `data/thesis_news_state.json`, `data/stock_*` | Read-only monitoring |
| **Job search** | `job_pipeline.md`, `international_roles.md` | Job application tracking | Job boards | Daily 8:00 | WhatsApp to Alec | `data/job_pipeline.md` | — |

## Isolation Notes

- **Family vs business:** Family data lives in `family_*` scripts + `data/family_*`. Business (OneGroup/Pit Row) lives in `onegroup_*`, `iris_*`, `arlo_*`, `pitrow_*`. These are separate scripts and separate state files — no shared data files.
- **Work executive assistant:** NOT built yet. Requires employer-approved data + integrations. Per spec, prepare instructions/templates WITHOUT importing work data until authorized.
- **CRM:** Google Sheet `1NcLE13A6aLc2lAkw-5ch46Ydyx-1vabFUstZvBh9UDI` is the OneGroup sales CRM. Family tasks and employer info must NOT go into it.

## Failure & Escalation

- Family SMS: if a script fails, the router logs and continues; no spam to family.
- OneGroup: drafts/reports go to Alec; nothing auto-sends.
- All cron jobs use `--no-deliver` or explicit delivery; failures surface in the daily system proof report.
