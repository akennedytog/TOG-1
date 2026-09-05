---
name: "outlook-calendar"
description: "Pull calendar events from Microsoft Outlook/365 on macOS. Use when a user asks to export, scrape, or read their Outlook calendar."
---

# Outlook / Microsoft 365 Calendar Access (macOS)

## When to use
A user asks to export, scrape, or read their Outlook calendar — e.g. to reconstruct an activity plan from real calendar events.

## Diagnose the account type first
Run AppleScript to count events:
```applescript
tell application "Microsoft Outlook"
  set evs to every calendar event
  return (count of evs)
end tell
```
If it returns **0**, check whether events exist on disk:
```bash
find ~/Library/Group\ Containers/UBF8T346G9.Office/Outlook -name "*.olk15CalendarEvent" | wc -l
```
If both are 0, confirm the account is Microsoft 365/Exchange (online) by reading the profile:
```bash
plutil -p ~/Library/Group\ Containers/UBF8T346G9.Office/Outlook/Outlook\ 15\ Profiles/Main\ Identity/ProfilePreferences.plist
```
Look for `_ActiveSyncExchange_HxS` and an `outlook.office365.com` URL. **That means the calendar lives on the server, not on the Mac** — there is nothing local to scrape, and you must not ask for corporate credentials in chat.

## Working method: publish an ICS link (no download)
1. Tell the user to open **https://outlook.office.com/calendar** (sign in with their work account).
2. **Settings (gear) → View all Outlook settings → Calendar → Shared calendars**.
3. Under **"Publish a calendar"**: pick the calendar, set permission to **"Can view all details"**, click **Publish**.
4. Have them copy the **ICS link** and paste it in chat.
5. Fetch the ICS link and parse the events (VEVENT blocks) for the requested date range.

The ICS link is read-only and can be unpublished after use, so it is safe to share.

## Pitfalls
- Do not attempt to scrape the desktop app for an online account — it will always show 0 events.
- Never ask the user to paste corporate credentials or auth tokens into chat.
- Scope the export to the requested date range; filter the parsed events if the user cannot.

## Stale feed misses history — re-publish to get the full range
A published ICS feed only exposes a **limited rolling window** (often ~3–4 months ahead of when it was published). If the user gives you a link that was published earlier, it will be missing older events — e.g. an audit period in the past returns 0 events even though the feed is live.

**Recovery:** before trusting a feed, check its actual date coverage by parsing the `DTSTART` values and confirming the requested range is present. If the historical range is missing, have the user **publish a fresh ICS link** (same steps as above) — a newly published link includes the full history, not just the rolling window. Then re-fetch and re-parse.
