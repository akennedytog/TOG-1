#!/usr/bin/env python3
"""
Etsy Order Automation
Connects Etsy to Google Sheets + Email notifications
"""

import json
import os
from datetime import datetime
from pathlib import Path

CONFIG = {
    "shop_name": "YourEtsyShopName",
    "webhook_url": "",  # Make.com webhook URL after setup
    "google_sheet": "LaserPecker Orders",
    "proof_template": "proof_request_template.txt",
    "thank_you_template": "order_received_template.txt",
}

def log_order(order_data):
    """Log order to Google Sheets"""
    order_id = order_data.get("order_id")
    customer = order_data.get("customer_name")
    sku = order_data.get("sku")
    personalization = order_data.get("personalization")
    
    # Add to production queue
    production_entry = {
        "date": datetime.now().isoformat(),
        "order_id": order_id,
        "customer": customer,
        "sku": sku,
        "personalization": personalization,
        "status": "PENDING_PROOF",
        "ship_by": "",  # Calculate from order date
    }
    
    print(f"Order logged: {order_id} - {sku} - {customer}")
    return production_entry

def send_proof_request(order_data):
    """Send automated proof request email"""
    template = """Hi {customer},

Thank you for your order! ({order_id})

We're creating your personalized {product_name}. Before we engrave, please confirm:

PERSONALIZATION DETAILS:
{personalization}

REPLY with:
✓ "APPROVED" - proceed as shown
✗ "REVISION: [your changes]" - one free revision included

Need it faster? Reply "RUSH" for 48-hour processing (+${rush_price}).

Best,
Alec
"""
    
    email_body = template.format(
        customer=order_data.get("customer_name"),
        order_id=order_data.get("order_id"),
        product_name=order_data.get("product_name"),
        personalization=order_data.get("personalization"),
        rush_price=order_data.get("rush_price", "12")
    )
    
    print(f"Proof request prepared for: {order_data.get('customer_email')}")
    return email_body

def add_to_production_schedule(order_data):
    """Add to daily production batch"""
    sku = order_data.get("sku")
    
    # Determine batch day based on SKU
    batch_schedule = {
        "TB": "Monday",  # Tumblers
        "CB": "Wednesday",  # Cutting boards
        "PT": "Tuesday",  # Pet tags
        "WD": "Tuesday",  # Wedding items
    }
    
    batch_day = batch_schedule.get(sku[:2], "Friday")
    
    print(f"Added to {batch_day} production batch: {sku}")
    return batch_day

if __name__ == "__main__":
    print("Etsy Order Automation Module")
    print("Run this when you receive webhook from Make.com")
