#!/usr/bin/env python3
"""
Subscribe an external Outlook (.ics) calendar feed into Google Calendar
using the open-connector's stored OAuth token for googlecalendar.

Reads the googlecalendar connection + oauth client config from the
connector's SQLite DB, refreshes the access token if expired, then calls
POST /calendar/v3/users/me/calendarList with a `source` URL to subscribe
the feed (read-only).

Usage:
  python3 subscribe_outlook_calendar.py
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

# The Outlook calendar sharing feed from alec_kennedy@b-f.com
ICS_URL = (
    "https://outlook.office365.com/owa/calendar/"
    "77ad5b7107c9470a9b7728d279efa951@b-f.com/"
    "97d3046347f6469c89e796771f84f8525583221004949577365/"
    "S-1-8-2671720452-577120890-3899149293-4238475976/reachcalendar.ics"
)
CALENDAR_ID = "77ad5b7107c9470a9b7728d279efa951@b-f.com"
CALENDAR_TITLE = "Alec Kennedy (Work)"


def load_connection():
    con = sqlite3.connect(CONNECTOR_DB)
    row = con.execute(
        "SELECT value FROM connections WHERE service='googlecalendar' AND connection_name='default'"
    ).fetchone()
    if not row:
        raise RuntimeError("googlecalendar connection not found in connector DB")
    conn = json.loads(row[0])

    cfg_row = con.execute(
        "SELECT value FROM oauth_client_configs WHERE service='googlecalendar'"
    ).fetchone()
    cfg = json.loads(cfg_row[0]) if cfg_row else {}
    con.close()
    return conn, cfg


def refresh_access_token(conn, cfg):
    """Return a fresh access token, refreshing via refresh_token if expired."""
    access = conn["accessToken"]
    expires_at = conn.get("expiresAt")
    if expires_at:
        try:
            exp = time.mktime(time.strptime(expires_at, "%Y-%m-%dT%H:%M:%S.%fZ"))
        except ValueError:
            exp = 0
        if time.time() < exp - 60:
            return access  # still valid

    # Need to refresh
    refresh = conn.get("refreshToken")
    if not refresh:
        raise RuntimeError("No refresh token available; cannot refresh access token")
    client_id = cfg.get("clientId") or conn["metadata"].get("oauthClientId")
    client_secret = cfg.get("clientSecret") or conn["metadata"].get("oauthClientSecretExtra")
    if not client_id or not client_secret:
        raise RuntimeError("Missing OAuth client id/secret for token refresh")

    body = urllib.parse.urlencode({
        "client_id": client_id,
        "client_secret": client_secret,
        "refresh_token": refresh,
        "grant_type": "refresh_token",
    }).encode()
    req = urllib.request.Request(
        "https://oauth2.googleapis.com/token", data=body,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"Token refresh failed: {e.code} {e.read().decode()[:300]}")
    return data["access_token"]


def subscribe_calendar(access_token):
    payload = {
        "summary": CALENDAR_TITLE,
        "source": {
            "title": CALENDAR_TITLE,
            "url": ICS_URL,
        },
    }
    req = urllib.request.Request(
        "https://www.googleapis.com/calendar/v3/users/me/calendarList",
        data=json.dumps(payload).encode(),
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode() or "{}")


def main():
    conn, cfg = load_connection()
    token = refresh_access_token(conn, cfg)
    status, data = subscribe_calendar(token)
    print(f"HTTP {status}")
    print(json.dumps(data, indent=2))
    if status in (200, 201):
        print("\n✅ Calendar subscribed successfully.")
        print(f"   ID: {data.get('id')}")
        print(f"   Summary: {data.get('summary')}")
        print(f"   Source URL: {data.get('source', {}).get('url')}")
    else:
        print("\n❌ Subscription failed.")
        sys.exit(1)


if __name__ == "__main__":
    main()
