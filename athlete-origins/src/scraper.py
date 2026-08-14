#!/usr/bin/env python3
"""
Scraper for celebrity high school sports stats
Primary source: Wikipedia
"""

import json
import requests
import re
from pathlib import Path
from time import sleep

DATA_DIR = Path(__file__).parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)

# Initial list of celebrities to scrape (mix of athletes, actors, musicians)
SEED_LIST = [
    "LeBron James",
    "Tom Brady",
    "Dwayne Johnson",
    "Kyler Murray",
    "Terry Crews",
    "Jamie Foxx",
    "Master P",
    "Carl Weathers",
    "Ed O'Neill",
]


def clean_text(text):
    """Clean Wikipedia text"""
    if not text:
        return ""
    # Remove citation markers [1], [2], etc.
    text = re.sub(r'\[\d+\]', '', text)
    # Remove parenthetical notes
    text = re.sub(r'\s*\([^)]*\)', '', text)
    return text.strip()


def extract_hs_sports_info(text, person_name):
    """Extract high school sports info from Wikipedia text"""
    info = {
        "sports": [],
        "high_school": "",
        "hometown": "",
        "notable_achievements": [],
        "position": "",
        "stats": {},
    }
    
    lines = text.split('\n')
    
    for i, line in enumerate(lines):
        line_lower = line.lower()
        
        # Look for high school mentions
        if 'high school' in line_lower and ('attended' in line_lower or 'school' in line_lower):
            # Try to extract school name
            school_match = re.search(r'attended ([^,]+(?:High School|Academy|Prep))', line, re.IGNORECASE)
            if school_match:
                info["high_school"] = clean_text(school_match.group(1))
            
            # Try to extract hometown
            hometown_match = re.search(r'in ([A-Z][a-z]+(?:, [A-Z]{2})?)', line)
            if hometown_match:
                info["hometown"] = hometown_match.group(1)
        
        # Look for sports mentions
        sports_keywords = [
            ("football", ["football", "quarterback", "wide receiver", "running back"]),
            ("basketball", ["basketball", "point guard", "shooting guard", "forward", "center"]),
            ("baseball", ["baseball", "pitcher", "shortstop", "catcher", "outfield"]),
            ("track", ["track", "sprinter", "hurdler", "long jump"]),
            ("soccer", ["soccer", "midfielder", "striker", "goalkeeper"]),
            ("wrestling", ["wrestling", "wrestler"]),
        ]
        
        for sport, keywords in sports_keywords:
            if any(kw in line_lower for kw in keywords):
                if sport not in info["sports"]:
                    info["sports"].append(sport)
                
                # Try to extract position
                for keyword in keywords:
                    if keyword in line_lower and keyword != sport:
                        info["position"] = keyword.title()
                        break
        
        # Look for stats
        stat_patterns = [
            ("points_per_game", r'(\d+(?:\.\d+)?)\s*points?\s*(?:per\s*game|a\s*game)'),
            ("yards", r'(\d+(?:\.\d+)?)\s*yards?'),
            ("touchdowns", r'(\d+)\s*touchdowns?'),
            ("receptions", r'(\d+)\s*receptions?'),
            ("rushing_yards", r'(\d+(?:\.\d+)?)\s*rushing\s*yards?'),
        ]
        
        for stat_name, pattern in stat_patterns:
            match = re.search(pattern, line, re.IGNORECASE)
            if match:
                info["stats"][stat_name] = match.group(1)
        
        # Look for achievements
        achievement_keywords = [
            "all-state", "all-state selection", "all-conference",
            "state champion", "letterman", "team captain",
            "most valuable", "mvp", "scholarship offer"
        ]
        
        for keyword in achievement_keywords:
            if keyword in line_lower:
                achievement = clean_text(line)
                if achievement and len(achievement) < 200:
                    info["notable_achievements"].append(achievement)
                    break
    
    # Remove duplicate achievements
    info["notable_achievements"] = list(dict.fromkeys(info["notable_achievements"]))
    
    return info


def scrape_person(name):
    """Scrape Wikipedia data for a person"""
    print(f"Scraping: {name}")
    
    try:
        # Wikipedia API endpoint
        search_url = "https://en.wikipedia.org/w/api.php"
        params = {
            "action": "query",
            "format": "json",
            "titles": name,
            "prop": "extracts",
            "exintro": False,
            "explaintext": True,
        }
        
        response = requests.get(search_url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        pages = data.get("query", {}).get("pages", {})
        
        for page_id, page_data in pages.items():
            if page_id == "-1":
                print(f"  ❌ Page not found for {name}")
                return None
            
            extract = page_data.get("extract", "")
            
            if not extract:
                print(f"  ⚠️ No extract for {name}")
                return None
            
            # Extract high school sports info
            hs_info = extract_hs_sports_info(extract, name)
            
            # Build profile
            profile = {
                "name": name,
                "current_profession": "",  # Will need secondary lookup
                "famous_for": "",
                "high_school": hs_info["high_school"],
                "hometown": hs_info["hometown"],
                "sports": hs_info["sports"],
                "position": hs_info["position"],
                "stats": hs_info["stats"],
                "notable_achievements": hs_info["notable_achievements"][:3],  # Top 3
                "wikipedia_extract": extract[:1000],  # First 1000 chars for context
            }
            
            print(f"  ✅ Found {len(profile['sports'])} sport(s): {', '.join(profile['sports']) if profile['sports'] else 'None found'}")
            
            return profile
        
    except Exception as e:
        print(f"  ❌ Error scraping {name}: {e}")
        return None


def save_profile(profile):
    """Save profile to JSON file"""
    if not profile:
        return
    
    # Create filename from name
    filename = profile["name"].lower().replace(" ", "-").replace("'", "") + ".json"
    filepath = DATA_DIR / filename
    
    with open(filepath, "w") as f:
        json.dump(profile, f, indent=2)
    
    print(f"  💾 Saved to {filepath.name}")


def main():
    """Main scraping function"""
    print("🕷️ Athlete Origins Scraper")
    print("=" * 40)
    
    success_count = 0
    fail_count = 0
    
    for name in SEED_LIST:
        profile = scrape_person(name)
        if profile:
            save_profile(profile)
            success_count += 1
        else:
            fail_count += 1
        
        # Be nice to Wikipedia
        sleep(0.5)
    
    print("=" * 40)
    print(f"✅ Success: {success_count}")
    print(f"❌ Failed: {fail_count}")
    print(f"📁 Data saved to: {DATA_DIR}")


if __name__ == "__main__":
    main()
