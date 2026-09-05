#!/usr/bin/env python3
"""
Delete all lead-call events ("📞 Call ...") from Alec's primary Google Calendar.

Per Alec (2026-08-15): these auto-scheduled lead-call events from Iris/Arlo
jumble up his shared calendar (and now show on the Echo via his wife's linked
account). Iris's CALENDAR_ENABLED is now False so no new ones get created;
this script cleans up the existing ones.

Usage:
  python3 agents/cleanup_lead_call_events.py [--dry-run]
"""
import json
import os
import sqlite3
import sys
import time
import urllib.request
import urllib.error
import urllib.parse

CONNECTOR_DB = os.path.expanduser(
    "~/.openclaw/workspace/spikes/open-connector/data/connect.sqlite"
)
DRY_RUN = "--dry-run" in sys.argv


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


def api(token, path, method="GET", body=None):
    url = "https://www.googleapis.com/calendar/v3/" + path
    headers = {"Authorization": "Bearer " + token}
    data = None
    if body is not None:
        data = json.dumps(body).encode()
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            raw = resp.read().decode()
            return resp.status, (json.loads(raw) if raw else {})
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try:
            return e.code, json.loads(raw)
        except Exception:
            return e.code, {"raw": raw}


def main():
    conn, cfg = load_connection()
    token = get_access_token(conn, cfg)
    CAL = "primary"

    # Fetch all events whose summary starts with the lead-call prefix
    # (use a wide time window to catch both past and future scheduled calls)
    status, data = api(
        token,
        f"calendars/{urllib.parse.quote(CAL)}/events"
        "?maxResults=2500&singleEvents=true&orderBy=startTime"
        "&timeMin=2026-08-01T00:00:00Z&timeMax=2027-01-01T00:00:00Z",
    )
    if status != 200:
        print(f"ERROR listing events: {status} {data}")
        return 1

    events = data.get("items", [])
    targets = [e for e in events if (e.get("summary") or "").startswith("\U0001F4DE Call")]
    print(f"Found {len(targets)} lead-call events to delete (of {len(events)} total in window)")

    deleted = 0
    failed = 0
    for e in targets:
        eid = e["id"]
        summary = e.get("summary", "")
        start = (e.get("start") or {}).get("dateTime", (e.get("start") or {}).get("date", "?"))
        if DRY_RUN:
            print(f"  [dry-run] would delete: {summary} @ {start}")
            continue
        s, resp = api(
            token,
            f"calendars/{urllib.parse.quote(CAL)}/events/{urllib.parse.quote(eid)}",
            method="DELETE",
        )
        if s == 204:
            deleted += 1
            print(f"  deleted: {summary} @ {start}")
        else:
            failed += 1
            print(f"  FAILED ({s}) {summary}: {resp}")
        time.sleep(0.2)

    print(f"\nDone: {deleted} deleted, {failed} failed" + (" (dry-run)" if DRY_RUN else ""))
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
