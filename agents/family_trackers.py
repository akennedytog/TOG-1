#!/usr/bin/env python3
"""
Family Assistant — Trackers (Bills, Home Maintenance, Gifts & Occasions)

Unified manager for the three family tracker sheets. Reads/writes via the
Google Sheets connector, same pattern as family_shopping_list.py.

SHEETS:
  Bills & Subscriptions  1JtdxgdWXmHjyUjBuexBWixcr1jcfx83YTUWafIaYvlM
  Home Maintenance       1V4sTkkyIfD-LISPUQuDSaBTkSaMjXEOuoAUZ8hWv_XU
  Gifts & Occasions      19-HQNdxN8Emyy2HvGhu6alM_wQ1Gw1kvGabeEmuBYL4

USAGE:
  python3 family_trackers.py --bills show
  python3 family_trackers.py --bills add "Netflix|Streaming|15.49|Monthly"
  python3 family_trackers.py --maintenance show
  python3 family_trackers.py --maintenance add "Replace HVAC filter|Every 3 months"
  python3 family_trackers.py --gifts show
  python3 family_trackers.py --gifts add "Mom|Birthday|2026-03-15"
  python3 family_trackers.py --due            # show items due soon across all
"""
import argparse
import json
import sys
import urllib.request
from datetime import datetime, timedelta

CONNECTOR = "http://127.0.0.1:3000/v1/actions"

SHEETS = {
    "bills": {
        "id": "1JtdxgdWXmHjyUjBuexBWixcr1jcfx83YTUWafIaYvlM",
        "range": "Sheet1!A:H",
        "headers": ["Service", "Category", "Cost/Month", "Billing Cycle", "Next Renewal", "Auto-Renew", "Status", "Notes"],
    },
    "maintenance": {
        "id": "1V4sTkkyIfD-LISPUQuDSaBTkSaMjXEOuoAUZ8hWv_XU",
        "range": "Sheet1!A:H",
        "headers": ["Task", "Frequency", "Last Done", "Next Due", "Est. Cost", "Importance", "Status", "Notes"],
    },
    "gifts": {
        "id": "19-HQNdxN8Emyy2HvGhu6alM_wQ1Gw1kvGabeEmuBYL4",
        "range": "Sheet1!A:H",
        "headers": ["Person", "Occasion", "Date", "Remind Me", "Gift Idea", "Budget", "Status", "Notes"],
    },
}


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


def read_sheet(key):
    s = SHEETS[key]
    res = call_action("googlesheets.values_get", {
        "spreadsheetId": s["id"],
        "range": s["range"],
        "valueRenderOption": "UNFORMATTED_VALUE",
    })
    return res.get("data", {}).get("values", []) or []


def append_row(key, values):
    s = SHEETS[key]
    call_action("googlesheets.values_append", {
        "spreadsheetId": s["id"],
        "range": s["range"],
        "valueInputOption": "USER_ENTERED",
        "insertDataOption": "INSERT_ROWS",
        "values": [values],
    })


def show(key):
    rows = read_sheet(key)
    if len(rows) <= 1:
        return f"{key}: empty."
    lines = []
    for row in rows[1:]:
        if row and row[0]:
            lines.append(" | ".join(str(c) for c in row if c))
    return "\n".join(lines)


def add(key, text):
    parts = [p.strip() for p in text.split("|")]
    if len(parts) < 2:
        return "Format: field1|field2|field3 (pipe-separated)"
    append_row(key, parts)
    return f"Added to {key}: {parts[0]}"


def due_soon(days=14):
    """Scan maintenance + gifts for items due within N days."""
    out = []
    today = datetime.now().date()
    # Maintenance: check Next Due column (index 3)
    for row in read_sheet("maintenance")[1:]:
        if len(row) > 3 and row[3]:
            try:
                due = datetime.strptime(str(row[3]), "%Y-%m-%d").date()
                if 0 <= (due - today).days <= days:
                    out.append(f"🔧 {row[0]} due {due} ({row[5] if len(row)>5 else ''})")
            except ValueError:
                pass
    # Gifts: check Date column (index 2)
    for row in read_sheet("gifts")[1:]:
        if len(row) > 2 and row[2]:
            try:
                d = datetime.strptime(str(row[2]), "%Y-%m-%d").date()
                # handle yearly recurrence
                this_year = d.replace(year=today.year)
                if this_year < today:
                    this_year = this_year.replace(year=today.year + 1)
                if 0 <= (this_year - today).days <= days:
                    out.append(f"🎁 {row[0]} {row[1]} on {this_year}")
            except ValueError:
                pass
    return "\n".join(out) if out else f"Nothing due in the next {days} days."


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--bills", nargs="?", const="show", help="show|add")
    ap.add_argument("--maintenance", nargs="?", const="show", help="show|add")
    ap.add_argument("--gifts", nargs="?", const="show", help="show|add")
    ap.add_argument("--due", type=int, nargs="?", const=14, help="items due soon")
    args = ap.parse_args()

    if args.due is not None:
        print(due_soon(args.due))
        return
    for key, val in [("bills", args.bills), ("maintenance", args.maintenance), ("gifts", args.gifts)]:
        if val:
            if val == "show":
                print(f"=== {key.upper()} ===")
                print(show(key))
            else:
                print(add(key, val))


if __name__ == "__main__":
    main()
