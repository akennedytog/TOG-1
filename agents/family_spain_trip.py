#!/usr/bin/env python3
"""
Family Assistant — Spain Trip Manager

Countdown + checklist for the Kennedy family Spain trip. Reads/writes the
Kennedy Family Spain Trip sheet.

SHEET: 1Isnti5WWws8XY7lAqCvz3vVrxKjhdTo1yOpYKPiGb-U

USAGE:
  python3 family_spain_trip.py --status        # countdown + open items
  python3 family_spain_trip.py --add "Item|Category|Due By|Who"
  python3 family_spain_trip.py --done "Item"  # mark an item done
"""
import argparse
import json
import urllib.request
from datetime import datetime

CONNECTOR = "http://127.0.0.1:3000/v1/actions"
SHEET_ID = "1Isnti5WWws8XY7lAqCvz3vVrxKjhdTo1yOpYKPiGb-U"
RANGE = "Sheet1!A:H"


def call_action(action_id, payload):
    body = {"input": payload}
    req = urllib.request.Request(
        CONNECTOR + "/" + action_id,
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def read():
    res = call_action("googlesheets.values_get", {
        "spreadsheetId": SHEET_ID,
        "range": RANGE,
        "valueRenderOption": "UNFORMATTED_VALUE",
    })
    return res.get("data", {}).get("values", []) or []


def status():
    rows = read()
    open_items = []
    done_count = 0
    for row in rows[1:]:
        if not row or not row[0]:
            continue
        item = row[0]
        done = (len(row) > 7 and str(row[7]).strip().lower() in ("yes", "true", "x", "done"))
        if done:
            done_count += 1
        else:
            cat = row[1] if len(row) > 1 else ""
            who = row[4] if len(row) > 4 else ""
            open_items.append(f"• {item}" + (f" ({cat})" if cat else "") + (f" — {who}" if who else ""))
    total = done_count + len(open_items)
    lines = [f"🇪🇸 Spain Trip — {done_count}/{total} done"]
    if open_items:
        lines.append("Open:")
        lines.extend(open_items)
    else:
        lines.append("All done! 🎉")
    return "\n".join(lines)


def add(text):
    parts = [p.strip() for p in text.split("|")]
    if len(parts) < 1:
        return "Format: Item|Category|Due By|Who"
    item = parts[0]
    cat = parts[1] if len(parts) > 1 else ""
    due = parts[2] if len(parts) > 2 else ""
    who = parts[3] if len(parts) > 3 else ""
    now = datetime.now().strftime("%Y-%m-%d")
    call_action("googlesheets.values_append", {
        "spreadsheetId": SHEET_ID,
        "range": RANGE,
        "valueInputOption": "USER_ENTERED",
        "insertDataOption": "INSERT_ROWS",
        "values": [[item, cat, due, "To Do", who, "", now, "No"]],
    })
    return f"✅ Added to Spain trip: {item}"


def mark_done(item):
    rows = read()
    for i in range(1, len(rows)):
        row = rows[i]
        if row and row[0] and str(row[0]).strip().lower() == item.strip().lower():
            call_action("googlesheets.values_update", {
                "spreadsheetId": SHEET_ID,
                "range": f"Sheet1!H{i+1}",
                "valueInputOption": "USER_ENTERED",
                "values": [["Yes"]],
            })
            return f"✅ Marked done: {item}"
    return f"Not found: {item}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--status", action="store_true")
    ap.add_argument("--add", help="Item|Category|Due By|Who")
    ap.add_argument("--done", help="Item name to mark done")
    args = ap.parse_args()

    if args.status:
        print(status())
    elif args.add:
        print(add(args.add))
    elif args.done:
        print(mark_done(args.done))
    else:
        ap.print_help()


if __name__ == "__main__":
    main()
