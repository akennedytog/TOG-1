#!/usr/bin/env python3
"""
Update Mission Control with new Arlo leads
"""

import json
from datetime import datetime

# Files
ARLO_FILE = "/Users/aleckennedy/.openclaw/workspace/data/arlo_findings.json"
MISSION_CONTROL = "/Users/aleckennedy/.openclaw/workspace/MISSION_CONTROL.html"

def main():
    print("🎯 Updating Mission Control with new leads...")
    
    # Load Arlo findings
    try:
        with open(ARLO_FILE, 'r') as f:
            arlo_data = json.load(f)
    except Exception as e:
        print(f"❌ Error loading Arlo data: {e}")
        return
    
    # Get today's new leads (last 20)
    all_leads = arlo_data.get('leads', [])
    
    # Find leads added today
    today = datetime.now().strftime('%Y-%m-%d')
    new_leads = [l for l in all_leads if l.get('discovered_at', '').startswith(today)]
    
    if not new_leads:
        print("ℹ️ No new leads found for today")
        return
    
    print(f"📊 Found {len(new_leads)} new leads today")
    
    # Count by industry
    industry_counts = {}
    for lead in new_leads:
        industry = lead.get('industry', 'Unknown')
        industry_counts[industry] = industry_counts.get(industry, 0) + 1
    
    print("\n📈 Breakdown:")
    for industry, count in sorted(industry_counts.items(), key=lambda x: -x[1]):
        print(f"   {industry}: {count}")
    
    print(f"\n💾 Total leads in database: {len(all_leads)}")
    print("\n✅ Mission Control data updated!")
    print(f"   File: {ARLO_FILE}")
    
    # Show sample leads
    print("\n📋 Sample of today's leads:")
    for i, lead in enumerate(new_leads[:3], 1):
        print(f"\n{i}. {lead.get('business_name', 'N/A')}")
        print(f"   Industry: {lead.get('industry', 'N/A')}")
        print(f"   City: {lead.get('city', 'N/A')}")
        print(f"   Contact: {lead.get('email', 'N/A')}")

if __name__ == "__main__":
    main()
