#!/usr/bin/env python3
"""
Etsy Listing Bulk Creator
"""

import csv
from pathlib import Path

WORKSPACE = Path("/Users/aleckennedy/.openclaw/workspace")
OUTPUT_CSV = Path(__file__).parent / "etsy_listings_import.csv"

PRICING = {
    "TB-01": 28.00, "TB-02": 32.00, "TB-03": 35.00, "TB-04": 55.00, "TB-05": 98.00, "TB-06": 28.00,
    "CB-01": 45.00, "CB-02": 52.00, "CB-03": 48.00, "CB-04": 75.00,
    "PT-01": 12.00, "PT-02": 16.00, "PT-03": 18.00,
    "WD-01": 22.00, "WD-02": 38.00,
}

def create_template():
    with open(OUTPUT_CSV, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["SKU", "Title", "Price", "Category", "Photo_Path"])
        for sku, price in PRICING.items():
            photo = f"laserpecker_assets/etsy_photos/{sku}-hero.jpg"
            writer.writerow([sku, f"Product {sku}", price, "Personalized Gifts", photo])
    print(f"Created template: {OUTPUT_CSV}")

if __name__ == "__main__":
    create_template()
