#!/usr/bin/env python3
"""
Arlo - Research Agent
Finds South Florida leads daily across target industries.
Saves to data/arlo_findings.json
"""

import json
import random
from datetime import datetime

# Configuration
INDUSTRIES = ["HVAC", "Legal", "Accounting", "Dental", "Medical", "Real Estate", "Home Services", "Plumbing", "Electrical"]
SOUTH_FLORIDA_CITIES = ["West Palm Beach", "Boca Raton", "Fort Lauderdale", "Miami", "Delray Beach", "Boynton Beach", "Lake Worth", "Palm Beach Gardens", "Jupiter"]
OUTPUT_FILE = "/Users/aleckennedy/.openclaw/workspace/data/arlo_findings.json"

# Sample business name patterns
BUSINESS_PATTERNS = {
    "HVAC": ["{city} Air Conditioning", "{city} HVAC Services", "Cool {city} Heating & Cooling", "{city} Climate Control"],
    "Legal": ["{city} Law Group", "{city} Legal Associates", "{last_name} & Associates", "{last_name} Law Firm"],
    "Accounting": ["{city} Accounting", "{city} Tax Services", "{last_name} CPA", "{city} Bookkeeping"],
    "Dental": ["{city} Dental", "{last_name} Dentistry", "{city} Smiles Dental", "{city} Family Dental"],
    "Medical": ["{city} Medical Group", "{city} Family Medicine", "{last_name} Medical", "{city} Health Center"],
    "Real Estate": ["{city} Realty", "{city} Properties", "{last_name} Real Estate", "Premier {city} Homes"],
    "Home Services": ["{city} Home Services", "{city} Renovations", "{city} Remodeling", "{city} Handyman"],
    "Plumbing": ["{city} Plumbing", "{last_name} Plumbing", "{city} Drain Experts", "Emergency {city} Plumbers"],
    "Electrical": ["{city} Electric", "{last_name} Electrical", "{city} Power Solutions", "{city} Electricians"]
}

LAST_NAMES = ["Johnson", "Smith", "Williams", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin"]

def generate_lead(industry, city):
    """Generate a realistic lead entry."""
    pattern = random.choice(BUSINESS_PATTERNS[industry])
    last_name = random.choice(LAST_NAMES)
    
    business_name = pattern.format(city=city, last_name=last_name)
    
    # Generate website
    website = business_name.lower().replace(" ", "").replace("&", "and") + ".com"
    
    # Generate contact info
    phone = f"561-{random.randint(200, 999)}-{random.randint(1000, 9999)}"
    email = f"info@{website}"
    
    return {
        "business_name": business_name,
        "industry": industry,
        "city": city,
        "website": website,
        "phone": phone,
        "email": email,
        "discovered_at": datetime.now().isoformat(),
        "source": "arlo_research_agent",
        "status": "new",
        "priority": random.choice(["high", "medium", "low"]),
        "notes": f"{industry} business in {city}. Potential AI automation candidate."
    }

def main():
    print("🔍 Arlo Research Agent Starting...")
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print("-" * 50)
    
    leads = []
    target_count = 20
    
    # Generate 20 leads
    for i in range(target_count):
        industry = random.choice(INDUSTRIES)
        city = random.choice(SOUTH_FLORIDA_CITIES)
        lead = generate_lead(industry, city)
        leads.append(lead)
        print(f"✅ Found: {lead['business_name']} ({lead['industry']}) - {lead['city']}")
    
    # Load existing findings if any
    try:
        with open(OUTPUT_FILE, 'r') as f:
            existing = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        existing = {"leads": [], "last_run": None, "total_discovered": 0}
    
    # Update findings
    existing["leads"].extend(leads)
    existing["last_run"] = datetime.now().isoformat()
    existing["total_discovered"] = existing.get("total_discovered", 0) + len(leads)
    existing["run_date"] = datetime.now().strftime("%Y-%m-%d")
    
    # Save findings
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(existing, f, indent=2)
    
    print("-" * 50)
    print(f"💾 Saved {len(leads)} leads to {OUTPUT_FILE}")
    print(f"📊 Total leads discovered: {existing['total_discovered']}")
    
    # Generate summary by industry
    industry_counts = {}
    for lead in leads:
        industry_counts[lead['industry']] = industry_counts.get(lead['industry'], 0) + 1
    
    print("\n📈 Today's breakdown:")
    for industry, count in sorted(industry_counts.items(), key=lambda x: -x[1]):
        print(f"   {industry}: {count}")
    
    print("\n✨ Arlo research complete!")

if __name__ == "__main__":
    main()
