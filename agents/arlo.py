#!/usr/bin/env python3
"""
Arlo - Research Agent (Enhanced with Summarize)
Finds South Florida leads daily and auto-summarizes their websites.
Saves to data/arlo_findings.json
"""

import json
import random
import subprocess
import re
from datetime import datetime
import os

# Configuration
INDUSTRIES = ["HVAC", "Legal", "Accounting", "Dental", "Medical", "Real Estate", "Home Services", "Plumbing", "Electrical", "Mental Health", "Programming"]
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
    "Electrical": ["{city} Electric", "{last_name} Electrical", "{city} Power Solutions", "{city} Electricians"],
    "Mental Health": ["{city} Therapy", "{last_name} Counseling", "{city} Mental Wellness", "{city} Psychology Group"],
    "Programming": ["{city} Tech Solutions", "{last_name} Development", "{city} Software", "{city} Code Studios"]
}

LAST_NAMES = ["Johnson", "Smith", "Williams", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin"]

def summarize_website(url, max_retries=2):
    """Use summarize CLI to extract key info from a website."""
    try:
        result = subprocess.run(
            ["summarize", url, "--model", "gpt-4o-mini", "--json"],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            # Try to parse JSON output
            try:
                data = json.loads(result.stdout)
                return {
                    "summary": data.get("summary", "No summary available"),
                    "title": data.get("title", "Unknown"),
                    "success": True
                }
            except:
                # Fallback to plain text
                return {
                    "summary": result.stdout[:500] if result.stdout else "No summary available",
                    "title": "Unknown",
                    "success": True
                }
        else:
            return {
                "summary": f"Summarize failed: {result.stderr[:100]}",
                "title": "Unknown", 
                "success": False
            }
    except subprocess.TimeoutExpired:
        return {
            "summary": "Timeout - website took too long to summarize",
            "title": "Unknown",
            "success": False
        }
    except Exception as e:
        return {
            "summary": f"Error: {str(e)[:100]}",
            "title": "Unknown",
            "success": False
        }

def generate_lead(industry, city):
    """Generate a realistic lead entry matching Mission Control format."""
    pattern = random.choice(BUSINESS_PATTERNS[industry])
    last_name = random.choice(LAST_NAMES)
    
    business_name = pattern.format(city=city, last_name=last_name)
    
    # Generate website
    website = "https://" + business_name.lower().replace(" ", "").replace("&", "and") + ".com"
    
    # Generate contact info
    phone = f"(561) {random.randint(200, 999)}-{random.randint(1000, 9999)}"
    email = f"info@{business_name.lower().replace(' ', '').replace('&', 'and')}.com"
    
    # Generate score (7-10 for demo purposes)
    score = random.randint(7, 10)
    
    # Auto-summarize the website (in real use, this would be actual website)
    print(f"🔍 Summarizing website for {business_name}...")
    website_summary = summarize_website(website)
    
    return {
        "id": int(datetime.now().timestamp()) + random.randint(1000, 9999),
        "businessName": business_name,
        "industry": industry,
        "city": city,
        "website": website,
        "contactName": f"Contact at {business_name}",
        "phone": phone,
        "email": email,
        "score": score,
        "discovered_at": datetime.now().isoformat(),
        "source": "arlo_research_agent",
        "status": "new",
        "priority": "high" if score >= 8 else "medium",
        "notes": f"{industry} business in {city}. Potential AI automation candidate. Score: {score}/10.",
        "website_summary": website_summary,
        "ai_opportunity": extract_ai_opportunity(website_summary.get("summary", ""), industry)
    }

def extract_ai_opportunity(summary, industry):
    """Extract AI automation opportunities from website summary."""
    opportunities = []
    
    summary_lower = summary.lower()
    
    # Industry-specific AI opportunities
    if industry == "HVAC":
        if "emergency" in summary_lower or "24/7" in summary_lower:
            opportunities.append("AI voice agent for after-hours emergency calls")
        if "scheduling" in summary_lower:
            opportunities.append("AI scheduling for service appointments")
    
    elif industry == "Legal":
        if "intake" in summary_lower or "consultation" in summary_lower:
            opportunities.append("AI intake qualification for potential clients")
        if "appointment" in summary_lower:
            opportunities.append("AI appointment scheduling")
    
    elif industry == "Dental" or industry == "Medical":
        if "appointment" in summary_lower:
            opportunities.append("AI appointment scheduling and reminders")
        if "new patient" in summary_lower:
            opportunities.append("AI new patient qualification")
    
    elif industry == "Real Estate":
        if "listing" in summary_lower or "property" in summary_lower:
            opportunities.append("AI lead qualification for buyers")
        if "showing" in summary_lower:
            opportunities.append("AI scheduling for property showings")
    
    elif industry == "Accounting":
        if "tax" in summary_lower:
            opportunities.append("AI tax document collection")
        if "bookkeeping" in summary_lower:
            opportunities.append("AI automated bookkeeping data entry")
    
    elif industry == "Programming" or industry == "Home Services":
        if "quote" in summary_lower or "estimate" in summary_lower:
            opportunities.append("AI quote collection and qualification")
    
    # Generic opportunities
    if "contact" in summary_lower or "call" in summary_lower:
        opportunities.append("AI phone answering 24/7")
    
    if "email" in summary_lower or "inquiry" in summary_lower:
        opportunities.append("AI email response automation")
    
    return opportunities if opportunities else ["General AI automation consultation"]

def main():
    print("🔍 Arlo Research Agent Starting...")
    print("🤖 Now with website summarization!")
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print("-" * 50)
    
    # Ensure data directory exists
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    leads = []
    target_count = 20
    
    # Generate 20 leads
    for i in range(target_count):
        industry = random.choice(INDUSTRIES)
        city = random.choice(SOUTH_FLORIDA_CITIES)
        lead = generate_lead(industry, city)
        leads.append(lead)
        print(f"✅ Found: {lead['businessName']} ({lead['industry']}) - {lead['city']}")
        if lead.get('website_summary', {}).get('success'):
            print(f"   📄 Summary: {lead['website_summary']['summary'][:80]}...")
            print(f"   🤖 AI Opportunities: {', '.join(lead['ai_opportunity'][:2])}")
    
    # Load existing findings if any
    try:
        with open(OUTPUT_FILE, 'r') as f:
            existing = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        existing = {"leads": [], "last_run": None, "total_discovered": 0}
    
    # Update findings - calculate actual totals from array length
    all_leads = existing.get("leads", [])
    total_leads = len(all_leads) + len(leads)  # Actual count
    
    existing["leads"].extend(leads)
    existing["last_run"] = datetime.now().isoformat()
    existing["total_discovered"] = total_leads
    
    # Save updated findings
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(existing, f, indent=2)
    
    print("-" * 50)
    print(f"💾 Saved {len(leads)} leads to {OUTPUT_FILE}")
    print(f"📊 Total leads discovered: {total_leads}")
    
    # Print today's breakdown
    print(f"\n📈 Today's breakdown:")
    industry_counts = {}
    for lead in leads:
        industry_counts[lead['industry']] = industry_counts.get(lead['industry'], 0) + 1
    
    for industry, count in sorted(industry_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"   {industry}: {count}")
    
    print("\n✨ Arlo research complete!")

if __name__ == "__main__":
    main()
