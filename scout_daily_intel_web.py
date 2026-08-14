#!/usr/bin/env python3
"""
Scout Daily Intelligence + Web Search
Enhanced daily briefing with web intelligence for active deals
"""

import os
import sys
import json
from datetime import datetime

# Import Scout modules
sys.path.insert(0, os.path.expanduser('~/.openclaw/workspace'))
from scout_db import ScoutDatabase, db
from scout_web_search import ScoutWebIntelligence

def generate_daily_web_briefing(owner_id=None):
    """Generate enhanced daily briefing with web intelligence"""
    
    # Initialize Scout
    scout_db = ScoutDatabase()
    web_intel = ScoutWebIntelligence()
    
    briefing = {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "title": "Scout Daily Intelligence + Web",
        "sections": []
    }
    
    # Get active deals
    active_deals = [d for d in scout_db.list_deals(owner_id=owner_id) 
                   if d.stage not in ['closed_won', 'closed_lost']]
    
    web_intel_section = {
        "heading": "🔍 Web Intelligence",
        "items": []
    }
    
    total_credits = 0
    
    # Research each active deal's company
    for deal in active_deals[:3]:  # Top 3 deals to save credits
        company_name = deal.name.split()[0] if ' ' in deal.name else deal.name
        
        print(f"Researching {company_name}...")
        
        intel = web_intel.monitor_deal_intelligence(
            deal.name, 
            company_name,
            deal.stage
        )
        
        if intel.get("intelligence"):
            for item in intel["intelligence"][:2]:  # Top 2 items per deal
                web_intel_section["items"].append({
                    "deal": deal.name,
                    "type": item["type"],
                    "priority": item["priority"],
                    "headline": item["headline"],
                    "action": item["action"],
                    "url": item["url"]
                })
        
        total_credits += web_intel.credits_used
    
    if web_intel_section["items"]:
        briefing["sections"].append(web_intel_section)
    
    # Add summary
    briefing["summary"] = {
        "deals_researched": len(active_deals[:3]),
        "intelligence_items": len(web_intel_section["items"]),
        "credits_used": total_credits,
        "web_search_enabled": True
    }
    
    return briefing


if __name__ == "__main__":
    print("🎯 Scout Daily Intelligence + Web Search")
    print("=" * 60)
    
    briefing = generate_daily_web_briefing()
    
    print(f"\n📊 Summary:")
    print(f"   Deals researched: {briefing['summary']['deals_researched']}")
    print(f"   Intelligence items: {briefing['summary']['intelligence_items']}")
    print(f"   Credits used: {briefing['summary']['credits_used']}")
    
    if briefing['sections']:
        for section in briefing['sections']:
            print(f"\n{section['heading']}")
            print("-" * 60)
            for item in section['items']:
                priority_emoji = {'high': '🔴', 'medium': '🟡', 'low': '🟢'}
                print(f"{priority_emoji.get(item['priority'], '⚪')} [{item['priority'].upper()}] {item['deal']}")
                print(f"   Type: {item['type']}")
                print(f"   Headline: {item['headline'][:60]}...")
                print(f"   → Action: {item['action']}")
                print(f"   → URL: {item['url'][:50]}...")
                print()
    else:
        print("\nℹ️  No active deals found or no intelligence detected.")
    
    # Save briefing
    output_file = f"scout_web_briefing_{datetime.now().strftime('%Y%m%d')}.json"
    with open(output_file, 'w') as f:
        json.dump(briefing, f, indent=2)
    
    print(f"✓ Briefing saved to: {output_file}")
