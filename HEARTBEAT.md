# HEARTBEAT

Run this lightweight checklist when heartbeat is triggered.

1. Routing health check
- Run: `bash scripts/model_routing_healthcheck.sh`
- If any model fails twice in a row, note it in `memory/heartbeat-state.json` and recommend temporary exclusion from auto-routing.

2. Routing drift check
- Confirm `routing-config.json` is canonical.
- If `MODEL_ROUTING.md` or `MODEL_ROUTING_V2.json` drift, run: `bash scripts/sync_model_routing.sh`

3. Email triage (NEW — via open-connector, requires connector running on localhost:3000)
- Check connector is up: `curl -s -m 3 http://localhost:3000/v1/actions > /dev/null` — if down, restart with `launchctl kickstart gui/$(id -u)/com.theonegroup.open-connector` and skip email this cycle if it doesn't recover.
- Fetch unread from last 24h:
  `curl -s -X POST http://localhost:3000/v1/actions/gmail.fetch_emails -H 'content-type: application/json' -d '{"input":{"query":"is:unread newer_than:1d","detail":"summary","maxResults":10}}'`
- Ping Alec ONLY if: message from a real human (not newsletters/notifications) that needs a reply, or anything sales-related (lead replies, audit requests, pricing questions, Calendly bookings).
- Update `memory/heartbeat-state.json` lastChecks.email with the current epoch.
- Respect quiet hours (23:00-08:00): only sales-related replies break through.

4. Calendar triage (completes the proactive loop — complements email)
- Fetch upcoming events on the primary calendar for the next 48h (use googlecalendar.list_events / list_events_all_calendars, calendarId=primary, timeMin=now, timeMax=+48h).
- Ping Alec ONLY if: an event starts within ~2h (prep/reminder), or something looks like a booking/meeting he may have missed (e.g. a Calendly slot, a client call).
- Update `memory/heartbeat-state.json` lastChecks.calendar with the current epoch.
- Quiet hours rule applies (only urgent/sales events break through 23:00-08:00).

5. Quiet hours and urgency
- If no urgent issue and within quiet window, reply `HEARTBEAT_OK`.
- If a premium model path is failing, send a short alert with impacted task classes.
If exec returns approval-pending, send the exact /approve command from "Reply with:"; do not ask for another code.
