#!/usr/bin/env python3
"""
Family Assistant — Shopping List Manager

Adds items to the shared Family Shopping List (a Google Sheet) from a free-form
text message or email. Infers quantity + category, appends a row, and replies
with a confirmation.

TRIGGERS (pick one or more):
  - SMS: text the family number "add milk, eggs, bread x2" → this script appends.
  - Email: email the family inbox with the same body → appended.
  - CLI test: `python3 family_shopping_list.py --add "milk, eggs, 2% milk x2"`

The shared sheet lives at:
  https://docs.google.com/spreadsheets/d/126nYlbnzDu8Nmxg1JWx92L8R5tz9vmxEMr_LevHFzH8
Tab "Shopping List", headers: Item | Qty | Category | Added

Category inference: matches item text against common grocery categories.
If an item is already on the list, its qty is bumped instead of duplicating.

USAGE:
  python3 family_shopping_list.py --add "milk, eggs, bread x2"
  python3 family_shopping_list.py --add "add milk and eggs please"
  python3 family_shopping_list.py --show          # print current list
  python3 family_shopping_list.py --clear         # clear list (destructive)
"""
import argparse
import json
import os
import re
import sys
import urllib.request
from datetime import datetime
from pathlib import Path

WS = Path("/Users/aleckennedy/.openclaw/workspace")
CONNECTOR = "http://127.0.0.1:3000/v1/actions"

SHEET_ID = "126nYlbnzDu8Nmxg1JWx92L8R5tz9vmxEMr_LevHFzH8"
RANGE = "Shopping List!A:D"
OWNER_NUMBER = "+18472801393"   # Allison (wife) — family SMS target
ASSISTANT_NUMBER = "+17543509490"

# Simple category classifier (order matters — first match wins)
CATEGORY_RULES = [
    ("Household", ["paper towel", "toilet paper", "tissue", "soap", "shampoo", "detergent",
                   "cleaner", "bleach", "sponge", "trash bag", "diaper", "wipes",
                   "toothpaste", "laundry", "dish soap", "aluminum foil", "cling wrap",
                   "ziploc", "bag", "paper towels", "dishwasher", "garbage"]),
    ("Produce", ["banana", "apple", "orange", "lettuce", "spinach", "tomato", "onion",
                 "avocado", "berry", "berries", "pepper", "potato", "carrot", "broccoli",
                 "cucumber", "celery", "garlic", "lemon", "lime", "grape", "mango",
                 "fruit", "vegetable", "kale", "zucchini", "mushroom", "peach", "pear",
                 "strawberr", "blueberr", "raspberr", "cabbage", "squash", "corn"]),
    ("Dairy", ["milk", "cheese", "butter", "yogurt", "cream", "eggs", "egg", "sour cream",
               "cottage cheese", "half and half", "half & half", "greek yogurt"]),
    ("Meat/Seafood", ["chicken", "beef", "pork", "steak", "ground beef", "turkey", "bacon",
                      "sausage", "salmon", "fish", "shrimp", "tuna", "ham", "lamb",
                      "chops", "ribs", "deli", "lunch meat", "hot dog", "burger"]),
    ("Bakery", ["bread", "bagel", "tortilla", "croissant", "muffin", "bun", "roll",
                "pita", "cake", "pie", "cookie", "brownie", "pastry"]),
    ("Frozen", ["frozen", "ice cream", "pizza", "fries", "waffle", "pancake", "tv dinner"]),
    ("Beverages", ["water", "juice", "soda", "coffee", "tea", "beer", "wine", "coke",
                   "sparkling", "lemonade", "kombucha", "smoothie", "protein shake"]),
    ("Snacks", ["chocolate", "candy", "granola bar", "protein bar", "nuts", "almond",
                "trail mix", "pretzel", "cookie", "brownie", "gum"]),
    ("Pantry", ["pasta", "rice", "cereal", "oat", "flour", "sugar", "salt", "pepper",
                "sauce", "soup", "bean", "canned", "oil", "vinegar", "spice", "spaghetti",
                "noodle", "peanut butter", "jam", "honey", "granola", "crackers", "chips",
                "popcorn", "tortilla chips", "salsa", "olive oil"]),
]


def categorize(item):
    low = item.lower()
    for cat, words in CATEGORY_RULES:
        for w in words:
            if w in low:
                return cat
    return "Other"


def parse_items(text):
    """Parse 'add milk, eggs, bread x2' into [(item, qty), ...]."""
    # Strip command words
    t = text.strip().lower()
    t = re.sub(r"^(please\s+)?(add|put|get|buy|need|grab|remind me to get)\s*", "", t).strip()
    t = re.sub(r"(please|thanks|thank you|thx)\s*$", "", t).strip()
    # Split on commas, "and", semicolons
    parts = re.split(r"[,;]|\s+and\s+|\s*&\s*", t)
    items = []
    for p in parts:
        p = p.strip()
        if not p:
            continue
        # quantity patterns: "milk x2", "milk 2", "2 milk", "bread (2)"
        qty = 1
        m = re.search(r"x\s*(\d+)", p)
        if m:
            qty = int(m.group(1))
            p = p[:m.start()].strip()
        else:
            m = re.search(r"\b(\d+)\s*$", p)
            if m:
                qty = int(m.group(1))
                p = p[:m.start()].strip()
            else:
                m = re.match(r"(\d+)\s+(.+)", p)
                if m:
                    qty = int(m.group(1))
                    p = m.group(2).strip()
        # strip leading "a " / "an " / "some " and measure words
        p = re.sub(r"^(a|an|some)\s+", "", p).strip()
        p = re.sub(r"^(?:\d+\s+)?(gallons?|cartons?|boxes?|bags?|cans?|bottles?|packs?|jars?|loaves?|loaf|bunches?|heads?|pounds?|lbs?|oz|dozen|liters?|quarts?)\s+of\s+", "", p).strip()
        if p:
            items.append((p, qty))
    return items


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


def read_existing():
    res = call_action("googlesheets.values_get", {
        "spreadsheetId": SHEET_ID,
        "range": RANGE,
        "valueRenderOption": "UNFORMATTED_VALUE",
    })
    return res.get("data", {}).get("values", []) or []


def append_rows(rows):
    call_action("googlesheets.spreadsheets_values_append", {
        "spreadsheetId": SHEET_ID,
        "range": RANGE,
        "valueInputOption": "USER_ENTERED",
        "insertDataOption": "INSERT_ROWS",
        "values": rows,
    })


def update_cell(row_idx, col_letter, value):
    call_action("googlesheets.values_update", {
        "spreadsheetId": SHEET_ID,
        "range": f"Shopping List!{col_letter}{row_idx}",
        "valueInputOption": "USER_ENTERED",
        "values": [[value]],
    })


def add_items(text, source="cli"):
    """Add parsed items to the sheet. Returns a human summary string."""
    items = parse_items(text)
    if not items:
        return "Hmm, I couldn't find any items in that. Try: add milk, eggs, bread"
    existing = read_existing()
    # header at row 1, data from row 2
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    added = []
    bumped = []
    for item, qty in items:
        low = item.lower()
        found_row = None
        for i in range(1, len(existing)):  # skip header
            row = existing[i]
            if row and row[0] and str(row[0]).strip().lower() == low:
                found_row = i + 1  # 1-based sheet row
                break
        if found_row:
            # bump qty
            old_qty = 1
            if len(existing[found_row - 1]) > 1 and existing[found_row - 1][1]:
                try:
                    old_qty = int(str(existing[found_row - 1][1]).split()[0])
                except (ValueError, IndexError):
                    old_qty = 1
            new_qty = old_qty + qty
            update_cell(found_row, "B", new_qty)
            bumped.append(f"{item.title()} (was {old_qty}, now {new_qty})")
        else:
            cat = categorize(item)
            append_rows([[item.title(), qty, cat, now]])
            added.append(f"{item.title()} x{qty}")
    summary_parts = []
    if added:
        summary_parts.append("Added: " + ", ".join(added))
    if bumped:
        summary_parts.append("Bumped: " + ", ".join(bumped))
    return ". ".join(summary_parts) if summary_parts else "No changes."


def show_list():
    existing = read_existing()
    if len(existing) <= 1:
        return "Shopping list is empty."
    lines = []
    for row in existing[1:]:
        if row and row[0]:
            item = str(row[0])
            qty = str(row[1]) if len(row) > 1 and row[1] else "1"
            cat = str(row[2]) if len(row) > 2 and row[2] else ""
            lines.append(f"• {item} x{qty}" + (f" ({cat})" if cat else ""))
    return "\n".join(lines)


def clear_list():
    existing = read_existing()
    if len(existing) > 1:
        call_action("googlesheets.clear_values", {
            "spreadsheetId": SHEET_ID,
            "range": f"Shopping List!A2:D{len(existing)}",
        })
    return "Shopping list cleared."


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--add", help="Text like: milk, eggs, bread x2")
    ap.add_argument("--show", action="store_true", help="Print current list")
    ap.add_argument("--clear", action="store_true", help="Clear the list")
    args = ap.parse_args()

    if args.show:
        print(show_list())
    elif args.clear:
        print(clear_list())
    elif args.add:
        result = add_items(args.add)
        print(result)
    else:
        ap.print_help()


if __name__ == "__main__":
    main()
