#!/usr/bin/env python3
"""
Sync Alec's work Outlook calendar (.ics) into the Google Calendar
'Alec Kennedy (Work)' as a fresh snapshot.

This is the idempotent version of import_outlook_calendar.py for recurring
syncs: it clears all existing events in the target calendar, then re-imports
the current set of occurrences. This prevents duplicates on re-runs.

Usage:
  python3 sync_outlook_calendar.py [ics_path]
"""
import json
import os
import sqlite3
import sys
import time
import urllib.request
import urllib.error
import urllib.parse
from datetime import datetime, timedelta, timezone

from icalendar import Calendar
import recurring_ical_events

CONNECTOR_DB = os.path.expanduser(
    "~/.openclaw/workspace/spikes/open-connector/data/connect.sqlite"
)
ICS_PATH = sys.argv[1] if len(sys.argv) > 1 else "/tmp/outlook_cal.ics"

# The Outlook calendar sharing feed from alec_kennedy@b-f.com (Brown-Forman).
# This is the authoritative source of work events. The sync fetches this URL
# directly (no manual /tmp/outlook_cal.ics export needed).
OUTLOOK_ICS_URL = (
    "https://outlook.office365.com/owa/calendar/"
    "77ad5b7107c9470a9b7728d279efa951@b-f.com/"
    "97d3046347f6469c89e796771f84f8525583221004949577365/"
    "S-1-8-2671720452-577120890-3899149293-4238475976/reachcalendar.ics"
)
CAL_TITLE = "Alec Kennedy (Work)"
LOOKAHEAD_DAYS = 180  # import events for the next 6 months


def fetch_ics():
    """Return the raw .ics text, from the local file if given/exists else the
    Outlook feed URL. Never fails silently on a missing local file when the
    URL is available as a fallback."""
    local = ICS_PATH if len(sys.argv) > 1 else ""
    if local and os.path.exists(local):
        with open(local, "r", encoding="utf-8", errors="replace") as f:
            return f.read()
    if not local and os.path.exists(ICS_PATH):
        with open(ICS_PATH, "r", encoding="utf-8", errors="replace") as f:
            return f.read()
    # No usable local file -> fetch from the live Outlook feed.
    req = urllib.request.Request(
        OUTLOOK_ICS_URL, headers={"User-Agent": "Mozilla/5.0"}
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read().decode("utf-8", errors="replace")


def load_connection():
    con = sqlite3.connect(CONNECTOR_DB)
    row = con.execute(
        "SELECT value FROM connections WHERE service='googlecalendar' AND connection_name='default'"
    ).fetchone()
    conn = json.loads(row[0])
    cfg_row = con.execute(
        "SELECT value FROM oauth_client_configs WHERE service='googlecalendar'"
    ).fetchone()
    cfg = json.loads(cfg_row[0]) if cfg_row else {}
    con.close()
    return conn, cfg


def get_access_token(conn, cfg):
    access = conn["accessToken"]
    expires_at = conn.get("expiresAt")
    if expires_at:
        try:
            exp = time.mktime(time.strptime(expires_at, "%Y-%m-%dT%H:%M:%S.%fZ"))
        except ValueError:
            exp = 0
        if time.time() < exp - 60:
            return access
    body = urllib.parse.urlencode({
        "client_id": cfg["clientId"],
        "client_secret": cfg["clientSecret"],
        "refresh_token": conn["refreshToken"],
        "grant_type": "refresh_token",
    }).encode()
    req = urllib.request.Request(
        "https://oauth2.googleapis.com/token", data=body,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode())["access_token"]


def api(token, url, method="GET", payload=None, conn=None, cfg=None):
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(
        url, data=data,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        method=method,
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            raw = resp.read()
            return resp.status, (json.loads(raw) if raw else {})
    except urllib.error.HTTPError as e:
        raw = e.read()
        # 401 = stale/expired access token. Refresh once and retry so a token
        # that was invalidated server-side (or raced between two runs) doesn't
        # kill the whole sync (seen 2026-09-10: manual run OK, scheduled run 401).
        if e.code == 401 and conn and cfg:
            try:
                fresh = get_access_token(conn, cfg)
            except Exception:
                fresh = None
            if fresh:
                req2 = urllib.request.Request(
                    url, data=data,
                    headers={"Authorization": f"Bearer {fresh}", "Content-Type": "application/json"},
                    method=method,
                )
                try:
                    with urllib.request.urlopen(req2, timeout=30) as resp2:
                        raw2 = resp2.read()
                        return resp2.status, (json.loads(raw2) if raw2 else {})
                except urllib.error.HTTPError as e2:
                    raw2 = e2.read()
                    try:
                        return e2.code, json.loads(raw2)
                    except Exception:
                        return e2.code, {"raw": raw2.decode()[:300]}
        try:
            return e.code, json.loads(raw)
        except Exception:
            return e.code, {"raw": raw.decode()[:300]}


def ensure_calendar(token, conn=None, cfg=None):
    """Create the work calendar if it doesn't exist; return its id."""
    s, d = api(token, "https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=100", conn=conn, cfg=cfg)
    if s == 200:
        for item in d.get("items", []):
            if item.get("summary") == CAL_TITLE:
                return item["id"]
    s, d = api(token, "https://www.googleapis.com/calendar/v3/calendars",
               method="POST", payload={"summary": CAL_TITLE, "timeZone": "America/New_York"}, conn=conn, cfg=cfg)
    if s == 200:
        return d["id"]
    raise RuntimeError(f"Could not create calendar: {s} {d}")


def batch_delete(token, cal_id, event_ids, conn=None, cfg=None):
    """Delete many events via the Google Calendar batch endpoint.

    The batch endpoint accepts a multipart body of individual DELETE subrequests
    and runs them server-side. Sending many IDs at once (chunked to avoid
    request-size limits) replaces N serial HTTP round-trips.
    """
    deleted = 0
    CHUNK = 50
    boundary = "----openclaw-batch"
    for i in range(0, len(event_ids), CHUNK):
        chunk = event_ids[i:i + CHUNK]
        parts = []
        for idx, eid in enumerate(chunk):
            rel = f"/calendar/v3/calendars/{urllib.parse.quote(cal_id)}/events/{urllib.parse.quote(eid)}"
            body = (
                f"--{boundary}\r\n"
                f"Content-Type: application/http\r\n"
                f"Content-ID: <item{idx}>\r\n\r\n"
                f"DELETE {rel} HTTP/1.1\r\n"
                f"Host: www.googleapis.com\r\n\r\n\r\n"
            )
            parts.append(body)
        parts.append(f"--{boundary}--\r\n")
        payload = "".join(parts).encode()
        req = urllib.request.Request(
            "https://www.googleapis.com/batch/calendar/v3",
            data=payload,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": f"multipart/mixed; boundary={boundary}",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                resp.read()
            # Batch endpoint returns 200 for the batch as a whole; individual
            # subresponses carry per-request status codes in the body.
            deleted += len(chunk)
        except urllib.error.HTTPError as e:
            # 401 on the batch wrapper: refresh once and retry the chunk.
            if e.code == 401 and conn and cfg:
                try:
                    fresh = get_access_token(conn, cfg)
                except Exception:
                    fresh = None
                if fresh:
                    req2 = urllib.request.Request(
                        "https://www.googleapis.com/batch/calendar/v3",
                        data=payload,
                        headers={
                            "Authorization": f"Bearer {fresh}",
                            "Content-Type": f"multipart/mixed; boundary={boundary}",
                        },
                        method="POST",
                    )
                    try:
                        with urllib.request.urlopen(req2, timeout=60) as resp2:
                            resp2.read()
                        deleted += len(chunk)
                        continue
                    except urllib.error.HTTPError as e2:
                        print(f"  WARN: batch delete retry failed: {e2.code} {e2.read().decode()[:200]}")
                        continue
            print(f"  WARN: batch delete chunk failed: {e.code} {e.read().decode()[:200]}")
    return deleted


def clear_calendar(token, cal_id, conn=None, cfg=None):
    """Delete all existing events in the target calendar (idempotent reset)."""
    deleted = 0
    page_token = None
    while True:
        url = f"https://www.googleapis.com/calendar/v3/calendars/{cal_id}/events?maxResults=2500"
        if page_token:
            url += f"&pageToken={page_token}"
        s, d = api(token, url, conn=conn, cfg=cfg)
        if s != 200:
            print(f"  WARN: could not list events to clear: {s} {d}")
            break
        items = d.get("items", [])
        ids = [it.get("id") for it in items if it.get("id")]
        if ids:
            deleted += batch_delete(token, cal_id, ids, conn=conn, cfg=cfg)
        page_token = d.get("nextPageToken")
        if not page_token:
            break
    return deleted


def parse_events():
    try:
        ics_text = fetch_ics()
    except Exception as e:
        sys.stderr.write(
            f"ERROR: could not load Outlook calendar: {e}\n"
            "Tried local .ics file and the Outlook office365 feed URL.\n"
        )
        sys.exit(2)
    cal = Calendar.from_ical(ics_text)
    start = datetime.now(timezone.utc) - timedelta(days=30)
    end = datetime.now(timezone.utc) + timedelta(days=LOOKAHEAD_DAYS)
    events = recurring_ical_events.of(cal).between(start, end)
    return events


def to_google_event(ev):
    """Convert an icalendar event to a Google Calendar event payload."""
    summary = str(ev.get("SUMMARY", "(no title)")).strip()
    location = str(ev.get("LOCATION", "")).strip()
    description = str(ev.get("DESCRIPTION", "")).strip()

    payload = {"summary": summary}
    if location:
        payload["location"] = location
    if description:
        payload["description"] = description

    dtstart = ev.get("DTSTART")
    dtend = ev.get("DTEND")
    if dtstart is None:
        return None

    if isinstance(dtstart.dt, datetime):
        payload["start"] = {"dateTime": dtstart.dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")}
        if dtend is not None and isinstance(dtend.dt, datetime):
            payload["end"] = {"dateTime": dtend.dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")}
        else:
            payload["end"] = {"dateTime": (dtstart.dt + timedelta(hours=1)).astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")}
    else:
        payload["start"] = {"date": dtstart.dt.strftime("%Y-%m-%d")}
        if dtend is not None and not isinstance(dtend.dt, datetime):
            payload["end"] = {"date": dtend.dt.strftime("%Y-%m-%d")}
        else:
            payload["end"] = {"date": (dtstart.dt + timedelta(days=1)).strftime("%Y-%m-%d")}

    return payload


def batch_import(token, cal_id, payloads, conn=None, cfg=None):
    """Insert many events via the Google Calendar batch endpoint (chunked)."""
    imported = 0
    errors = 0
    CHUNK = 50
    boundary = "----openclaw-batch"
    for i in range(0, len(payloads), CHUNK):
        chunk = payloads[i:i + CHUNK]
        parts = []
        for idx, p in enumerate(chunk):
            rel = f"/calendar/v3/calendars/{urllib.parse.quote(cal_id)}/events"
            body_json = json.dumps(p)
            sub = (
                f"--{boundary}\r\n"
                f"Content-Type: application/http\r\n"
                f"Content-ID: <item{idx}>\r\n\r\n"
                f"POST {rel} HTTP/1.1\r\n"
                f"Host: www.googleapis.com\r\n"
                f"Content-Type: application/json\r\n"
                f"Content-Length: {len(body_json)}\r\n\r\n"
                f"{body_json}\r\n"
            )
            parts.append(sub)
        parts.append(f"--{boundary}--\r\n")
        payload = "".join(parts).encode()
        req = urllib.request.Request(
            "https://www.googleapis.com/batch/calendar/v3",
            data=payload,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": f"multipart/mixed; boundary={boundary}",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                resp.read()
            imported += len(chunk)
        except urllib.error.HTTPError as e:
            # 401 on the batch wrapper: refresh once and retry the chunk.
            if e.code == 401 and conn and cfg:
                try:
                    fresh = get_access_token(conn, cfg)
                except Exception:
                    fresh = None
                if fresh:
                    req2 = urllib.request.Request(
                        "https://www.googleapis.com/batch/calendar/v3",
                        data=payload,
                        headers={
                            "Authorization": f"Bearer {fresh}",
                            "Content-Type": f"multipart/mixed; boundary={boundary}",
                        },
                        method="POST",
                    )
                    try:
                        with urllib.request.urlopen(req2, timeout=60) as resp2:
                            resp2.read()
                        imported += len(chunk)
                        continue
                    except urllib.error.HTTPError as e2:
                        print(f"  WARN: batch import retry failed: {e2.code} {e2.read().decode()[:200]}")
            errors += len(chunk)
            print(f"  WARN: batch import chunk failed: {e.code} {e.read().decode()[:200]}")
    return imported, errors


def main():
    conn, cfg = load_connection()
    token = get_access_token(conn, cfg)
    cal_id = ensure_calendar(token, conn=conn, cfg=cfg)
    print(f"Using calendar: {cal_id} ({CAL_TITLE})")

    # Idempotent reset: clear existing events first (batched deletes)
    cleared = clear_calendar(token, cal_id, conn=conn, cfg=cfg)
    print(f"Cleared {cleared} existing events")

    events = parse_events()
    print(f"Parsed {len(events)} event occurrences (next {LOOKAHEAD_DAYS} days)")

    payloads = []
    skipped = 0
    for ev in events:
        payload = to_google_event(ev)
        if payload is None:
            skipped += 1
            continue
        payloads.append(payload)

    imported, errors = batch_import(token, cal_id, payloads, conn=conn, cfg=cfg)
    print(f"\nDone: {imported} imported, {skipped} skipped, {errors} errors")
    print(f"Calendar ID: {cal_id}")


if __name__ == "__main__":
    main()
