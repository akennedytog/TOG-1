#!/usr/bin/env python3
"""
Family Assistant — Weekly Meal Plan → Grocery List

Generates a 7-day dinner plan from the 30-minute recipe rotation (in
meal-plan-nutrition.md), then builds the weekly grocery list and populates the
shared Family Shopping List sheet.

The plan follows the nutrition guide's rules:
  - Chicken/steak rotation, carbs higher on Lower Body days (Mon/Thu per sheet)
  - Cook 1.5-2x protein (her half smaller on carbs than his)
  - Breakfast = smoothies, Lunch = leftovers/wraps (no decision fatigue)
  - Sunday = batch cook day

USAGE:
  python3 family_meal_plan.py --generate        # build plan + grocery list, write to sheet
  python3 family_meal_plan.py --preview         # print plan + grocery list, don't write
  python3 family_meal_plan.py --plan-only       # write only the meal plan tab
  python3 family_meal_plan.py --grocery-only    # write only the grocery list
"""
import argparse
import json
import urllib.request
from datetime import datetime, timedelta

WS = "/Users/aleckennedy/.openclaw/workspace"
CONNECTOR = "http://127.0.0.1:3000/v1/actions"

# Family Shopping List sheet (same as family_shopping_list.py)
SHOPPING_SHEET_ID = "126nYlbnzDu8Nmxg1JWx92L8R5tz9vmxEMr_LevHFzH8"
SHOPPING_RANGE = "Shopping List!A:D"

# Postpartum Workout + Nutrition Plan sheet (meal plan tab)
NUTRITION_SHEET_ID = "1f6LPQnt-tMOTpXpTuQ8L7DTv8U6nGyL1kVP6CkqD6uU"
MEAL_PLAN_RANGE = "Meal Plan - Recipes!A:D"

# 30-minute recipe rotation (from meal-plan-nutrition.md). Each entry:
#   name, protein, carb_level (high on leg days), cook_min, key_ingredients
RECIPES = [
    {"name": "Lemon Pepper Chicken Skillet", "protein": "chicken", "carb": "high",
     "min": 25, "ingredients": ["chicken breast", "lemon", "rice", "broccoli"]},
    {"name": "Steak Fajita Bowl", "protein": "steak", "carb": "high",
     "min": 20, "ingredients": ["sirloin steak", "bell pepper", "onion", "rice", "sour cream", "salsa"]},
    {"name": "Chicken Stir-Fry", "protein": "chicken", "carb": "high",
     "min": 20, "ingredients": ["chicken breast", "frozen stir-fry veg", "soy sauce", "honey", "rice"]},
    {"name": "Air-Fryer Chicken Thighs + Veg", "protein": "chicken", "carb": "low",
     "min": 25, "ingredients": ["chicken thighs", "broccoli", "asparagus"]},
    {"name": "Steak + Sheet-Pan Veggies", "protein": "steak", "carb": "low",
     "min": 25, "ingredients": ["sirloin steak", "brussels sprouts", "red onion"]},
    {"name": "Chicken Alfredo-ish", "protein": "chicken", "carb": "low",
     "min": 20, "ingredients": ["chicken breast", "greek yogurt", "parmesan", "zucchini", "pasta"]},
    {"name": "Ground Beef Power Bowl", "protein": "beef", "carb": "high",
     "min": 15, "ingredients": ["ground beef", "rice", "black beans", "avocado", "salsa"]},
    {"name": "Chicken Tenders + Dipping Sauce", "protein": "chicken", "carb": "low",
     "min": 20, "ingredients": ["chicken breast", "greek yogurt", "hot sauce"]},
    {"name": "Steak + Loaded Baked Sweet Potato", "protein": "steak", "carb": "high",
     "min": 30, "ingredients": ["sirloin steak", "sweet potato", "cheese", "butter"]},
    {"name": "Chicken Quesadillas", "protein": "chicken", "carb": "high",
     "min": 20, "ingredients": ["chicken breast", "tortilla", "cheese", "salsa", "greek yogurt"]},
]

# Lower Body days (per workout sheet: she trains legs Mon/Thu) → higher carb
LEG_DAYS = {0, 3}  # Monday=0, Thursday=3

# Category classifier (mirrors family_shopping_list.py)
CATEGORY_RULES = [
    ("Household", ["paper towel", "toilet paper", "tissue", "soap", "shampoo", "detergent",
                   "cleaner", "bleach", "sponge", "trash bag", "diaper", "wipes",
                   "toothpaste", "laundry", "dish soap", "aluminum foil", "cling wrap",
                   "ziploc", "bag", "paper towels", "dishwasher", "garbage"]),
    ("Produce", ["banana", "apple", "orange", "lettuce", "spinach", "tomato", "onion",
                 "avocado", "berry", "berries", "pepper", "potato", "carrot", "broccoli",
                 "cucumber", "celery", "garlic", "lemon", "lime", "grape", "mango",
                 "fruit", "vegetable", "kale", "zucchini", "mushroom", "peach", "pear",
                 "strawberr", "blueberr", "raspberr", "cabbage", "squash", "corn",
                 "asparagus", "brussels", "red onion", "sweet potato"]),
    ("Dairy", ["milk", "cheese", "butter", "yogurt", "cream", "eggs", "egg", "sour cream",
               "cottage cheese", "half and half", "half & half", "greek yogurt", "parmesan"]),
    ("Meat/Seafood", ["chicken", "beef", "pork", "steak", "ground beef", "turkey", "bacon",
                      "sausage", "salmon", "fish", "shrimp", "tuna", "ham", "lamb",
                      "chops", "ribs", "deli", "lunch meat", "hot dog", "burger", "thighs"]),
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
                "popcorn", "tortilla chips", "salsa", "olive oil", "soy sauce", "seasoning"]),
]


def categorize(item):
    low = item.lower()
    for cat, words in CATEGORY_RULES:
        for w in words:
            if w in low:
                return cat
    return "Other"

# Base weekly grocery list (from meal-plan-nutrition.md) — always on the list
BASE_GROCERY = [
    ("Chicken breast", 12, "Meat/Seafood"),
    ("Sirloin steak", 3, "Meat/Seafood"),
    ("Ground beef", 1, "Meat/Seafood"),
    ("Eggs", 18, "Dairy"),
    ("Greek yogurt", 2, "Dairy"),
    ("Cottage cheese", 1, "Dairy"),
    ("Protein powder", 1, "Snacks"),
    ("Frozen mixed berries", 2, "Frozen"),
    ("Bananas", 6, "Produce"),
    ("Spinach", 2, "Produce"),
    ("Bell peppers", 4, "Produce"),
    ("Onion", 3, "Produce"),
    ("Broccoli", 3, "Produce"),
    ("Green beans", 2, "Produce"),
    ("Lettuce", 1, "Produce"),
    ("Avocado", 2, "Produce"),
    ("Tomato", 3, "Produce"),
    ("Garlic", 1, "Produce"),
    ("Lemon", 3, "Produce"),
    ("Rolled oats", 1, "Pantry"),
    ("Almond butter", 1, "Pantry"),
    ("Almond milk", 2, "Dairy"),
    ("Rice", 2, "Pantry"),
    ("Potatoes", 3, "Produce"),
    ("Sweet potatoes", 3, "Produce"),
    ("Tortillas", 1, "Bakery"),
    ("Olive oil", 1, "Pantry"),
    ("Seasonings", 1, "Pantry"),
    ("Cheese", 1, "Dairy"),
    ("Butter", 1, "Dairy"),
    ("Sour cream", 1, "Dairy"),
    ("Salsa", 1, "Pantry"),
    ("Hot sauce", 1, "Pantry"),
    ("Soy sauce", 1, "Pantry"),
    ("Honey", 1, "Pantry"),
    ("Parmesan", 1, "Dairy"),
    ("Zucchini", 2, "Produce"),
    ("Brussels sprouts", 1, "Produce"),
    ("Black beans", 1, "Pantry"),
    ("Frozen stir-fry veg", 1, "Frozen"),
    ("Asparagus", 1, "Produce"),
    ("Pasta", 1, "Pantry"),
]


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


def build_plan(start_date=None):
    """Build a 7-day dinner plan. Returns list of (date, day_name, recipe)."""
    start = start_date or datetime.now().date()
    plan = []
    # Rotate through recipes, but ensure leg days get high-carb recipes
    high_carb = [r for r in RECIPES if r["carb"] == "high"]
    low_carb = [r for r in RECIPES if r["carb"] == "low"]
    hi_i, lo_i = 0, 0
    used = set()
    for i in range(7):
        d = start + timedelta(days=i)
        is_leg = d.weekday() in LEG_DAYS
        pool = high_carb if is_leg else low_carb
        idx = hi_i if is_leg else lo_i
        # pick next unused recipe from pool (wrap if all used)
        recipe = None
        for _ in range(len(pool)):
            cand = pool[idx % len(pool)]
            if cand["name"] not in used:
                recipe = cand
                break
            idx += 1
        if recipe is None:
            recipe = pool[idx % len(pool)]
        used.add(recipe["name"])
        if is_leg:
            hi_i += 1
        else:
            lo_i += 1
        plan.append((d, d.strftime("%A"), recipe))
    return plan


def build_grocery(plan):
    """Build grocery list from plan + base list. Returns list of (item, qty, cat)."""
    # Start with base list
    grocery = {item.lower(): [item, qty, cat] for item, qty, cat in BASE_GROCERY}
    # Add recipe-specific ingredients (bump qty if already present)
    for _, _, recipe in plan:
        for ing in recipe["ingredients"]:
            key = ing.lower()
            if key in grocery:
                grocery[key][1] += 1
            else:
                grocery[key] = [ing.title(), 1, categorize(ing)]
    # Sort by category then item
    return sorted(grocery.values(), key=lambda x: (x[2], x[0]))


def write_meal_plan(plan):
    """Write the meal plan to the Nutrition sheet 'Meal Plan' tab."""
    rows = [["Date", "Day", "Dinner", "Cook (min)"]]
    for d, day, recipe in plan:
        rows.append([d.isoformat(), day, recipe["name"], recipe["min"]])
    call_action("googlesheets.values_update", {
        "spreadsheetId": NUTRITION_SHEET_ID,
        "range": MEAL_PLAN_RANGE,
        "valueInputOption": "USER_ENTERED",
        "values": rows,
    })
    return rows


def write_grocery(grocery):
    """Write grocery list to the Family Shopping List sheet (clear + rewrite)."""
    # Clear existing data (keep header)
    existing = call_action("googlesheets.values_get", {
        "spreadsheetId": SHOPPING_SHEET_ID,
        "range": SHOPPING_RANGE,
        "valueRenderOption": "UNFORMATTED_VALUE",
    }).get("data", {}).get("values", []) or []
    if len(existing) > 1:
        call_action("googlesheets.clear_values", {
            "spreadsheetId": SHOPPING_SHEET_ID,
            "range": f"Shopping List!A2:D{len(existing)}",
        })
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    rows = [["Item", "Qty", "Category", "Added"]]
    for item, qty, cat in grocery:
        rows.append([item, qty, cat, now])
    call_action("googlesheets.values_update", {
        "spreadsheetId": SHOPPING_SHEET_ID,
        "range": SHOPPING_RANGE,
        "valueInputOption": "USER_ENTERED",
        "values": rows,
    })
    return rows


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--generate", action="store_true", help="Build plan + grocery, write to sheets")
    ap.add_argument("--preview", action="store_true", help="Print plan + grocery, don't write")
    ap.add_argument("--plan-only", action="store_true", help="Write only the meal plan tab")
    ap.add_argument("--grocery-only", action="store_true", help="Write only the grocery list")
    args = ap.parse_args()

    plan = build_plan()
    grocery = build_grocery(plan)

    if args.preview or not (args.generate or args.plan_only or args.grocery_only):
        print("=== 7-DAY MEAL PLAN ===")
        for d, day, recipe in plan:
            print(f"{day:<10} {recipe['name']} ({recipe['min']} min)")
        print("\n=== GROCERY LIST ===")
        for item, qty, cat in grocery:
            print(f"  {item} x{qty} ({cat})")
        return

    if args.generate or args.plan_only:
        write_meal_plan(plan)
        print(f"✅ Meal plan written to Nutrition sheet ({len(plan)} days)")
    if args.generate or args.grocery_only:
        write_grocery(grocery)
        print(f"✅ Grocery list written to Family Shopping List ({len(grocery)} items)")


if __name__ == "__main__":
    main()
