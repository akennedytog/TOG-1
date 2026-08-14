#!/usr/bin/env python3
"""
Wikipedia Scraper for Athlete Origins
Scrapes celebrity high school sports data from Wikipedia
"""

import json
import requests
import re
from pathlib import Path
from time import sleep
from datetime import datetime

DATA_DIR = Path(__file__).parent.parent / "data"
OUTPUT_FILE = DATA_DIR / "wikipedia_profiles.json"

# Categories to scrape
WIKIPEDIA_CATEGORIES = [
    # Actors who played sports
    "American football players turned actors",
    "NBA players turned actors", 
    "MLB players turned actors",
    "Olympic athletes turned actors",
    "Boxers turned actors",
    "Wrestlers turned actors",
    
    # Musicians who played sports
    "Rappers who played sports",
    "Musicians who played basketball",
    
    # Politicians who played sports
    "American politicians who played sports",
    "US Presidents who played sports",
]

class WikipediaScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'AthleteOriginsBot/1.0 (Educational Project)'
        })
        self.profiles = []
        
    def search_celebrities(self, sport="football", limit=50):
        """Search Wikipedia for celebrities who played sports"""
        print(f"Searching for {sport} players...")
        
        # Common patterns for celebrity athletes
        search_terms = [
            f"{sport} player actor",
            f"{sport} player musician", 
            f"{sport} player rapper",
            f"played {sport} high school",
        ]
        
        found = []
        for term in search_terms[:2]:  # Limit to avoid rate limits
            try:
                # Wikipedia search API
                url = "https://en.wikipedia.org/w/api.php"
                params = {
                    "action": "query",
                    "format": "json",
                    "list": "search",
                    "srsearch": term,
                    "srlimit": limit
                }
                
                response = self.session.get(url, params=params, timeout=10)
                data = response.json()
                
                results = data.get("query", {}).get("search", [])
                for result in results:
                    title = result.get("title", "")
                    # Filter out disambiguation pages and non-people
                    if not any(x in title.lower() for x in ["list of", "disambiguation", "film)", "team"]):
                        found.append(title)
                
                sleep(0.5)  # Be nice to Wikipedia
                
            except Exception as e:
                print(f"Search error: {e}")
                continue
        
        return list(set(found))[:limit]  # Remove duplicates
    
    def scrape_person(self, name):
        """Scrape Wikipedia data for a person"""
        print(f"Scraping: {name}")
        
        try:
            # Use Wikipedia API
            url = "https://en.wikipedia.org/w/api.php"
            params = {
                "action": "query",
                "format": "json",
                "titles": name,
                "prop": "extracts|pageprops",
                "exintro": False,
                "explaintext": True,
                "exsentences": 20
            }
            
            response = self.session.get(url, params=params, timeout=10)
            data = response.json()
            
            pages = data.get("query", {}).get("pages", {})
            
            for page_id, page_data in pages.items():
                if page_id == "-1":
                    return None
                
                extract = page_data.get("extract", "")
                if not extract:
                    return None
                
                # Parse the extract for sports info
                profile = self._parse_extract(name, extract)
                if profile:
                    return profile
                    
        except Exception as e:
            print(f"  Error: {e}")
            return None
        
        return None
    
    def _parse_extract(self, name, text):
        """Parse Wikipedia extract for sports information"""
        profile = {
            "name": name,
            "slug": name.lower().replace(" ", "-").replace("'", ""),
            "famous_for": "",
            "current_profession": "",
            "high_school": "",
            "hometown": "",
            "sports": [],
            "primary_sport": "",
            "position": "",
            "stats": {},
            "notable_achievements": [],
            "what_if_analysis": "",
            "viral_angle": "",
            "data_quality": "scraped",  # Track data completeness
            "source": "wikipedia"
        }
        
        # Look for famous profession (first sentence usually)
        first_sentence = text.split('.')[0] if text else ""
        if 'actor' in first_sentence.lower():
            profile["current_profession"] = "Actor"
        elif 'musician' in first_sentence.lower() or 'rapper' in first_sentence.lower():
            profile["current_profession"] = "Musician"
        elif 'politician' in first_sentence.lower():
            profile["current_profession"] = "Politician"
        elif 'businessman' in first_sentence.lower():
            profile["current_profession"] = "Businessman"
        
        profile["famous_for"] = first_sentence[:100] if first_sentence else "Celebrity"
        
        # Look for high school mentions
        hs_patterns = [
            r'attended ([^,]+(?:High School|Academy|Prep|Secondary))',
            r'graduated from ([^,]+(?:High School|Academy))',
        ]
        
        for pattern in hs_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                profile["high_school"] = match.group(1).strip()
                break
        
        # Look for hometown
        hometown_patterns = [
            r'(?:born|raised) in ([A-Z][a-z]+(?:, [A-Z]{2})?)',
            r'(?:grew up|raised) in ([A-Z][a-z]+(?:, [A-Z][a-z]+)?)',
        ]
        
        for pattern in hometown_patterns:
            match = re.search(pattern, text)
            if match:
                profile["hometown"] = match.group(1)
                break
        
        # Detect sports played
        sports_keywords = {
            'football': ['football', 'quarterback', 'running back', 'linebacker', 'wide receiver'],
            'basketball': ['basketball', 'point guard', 'shooting guard', 'forward', 'center'],
            'baseball': ['baseball', 'pitcher', 'catcher', 'outfield', 'shortstop'],
            'track': ['track', 'sprinter', 'hurdler', 'long jump', 'high jump'],
            'soccer': ['soccer', 'footballer'],  # Note: 'football' above catches American football
            'tennis': ['tennis', 'tennis player'],
            'golf': ['golf', 'golfer'],
            'hockey': ['hockey', 'ice hockey'],
            'swimming': ['swimming', 'swimmer'],
            'wrestling': ['wrestling', 'wrestler'],
            'boxing': ['boxing', 'boxer'],
            'lacrosse': ['lacrosse'],
            'rugby': ['rugby'],
            'cricket': ['cricket'],
        }
        
        text_lower = text.lower()
        detected_sports = []
        
        for sport, keywords in sports_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    if sport not in detected_sports:
                        detected_sports.append(sport)
                    break
        
        profile["sports"] = detected_sports
        if detected_sports:
            profile["primary_sport"] = detected_sports[0]
        
        # Look for positions
        position_patterns = [
            (r'(?:played|was a) (quarterback|running back|wide receiver|tight end|linebacker|defensive end|defensive tackle|cornerback|safety)', 'football'),
            (r'(?:played|was a) (point guard|shooting guard|small forward|power forward|center)', 'basketball'),
            (r'(?:played|was a) (pitcher|catcher|first base|second base|third base|shortstop|outfield)', 'baseball'),
        ]
        
        for pattern, sport in position_patterns:
            match = re.search(pattern, text_lower)
            if match:
                profile["position"] = match.group(1).title()
                if sport in detected_sports:
                    profile["primary_sport"] = sport
                break
        
        # Look for achievements
        achievement_keywords = [
            'all-state', 'all-conference', 'all-american', 'state champion',
            'letterman', 'team captain', 'mvp', 'most valuable',
            'drafted', 'scholarship', 'walk-on', 'varsity'
        ]
        
        achievements = []
        for keyword in achievement_keywords:
            if keyword in text_lower:
                # Find the sentence containing the keyword
                sentences = text.split('.')
                for sent in sentences:
                    if keyword in sent.lower() and len(sent.strip()) > 20:
                        achievements.append(sent.strip())
                        break
        
        profile["notable_achievements"] = achievements[:3]
        
        # Generate what_if and viral_angle if we have enough info
        if profile["sports"] and profile["current_profession"]:
            sport = profile["primary_sport"].title() if profile["primary_sport"] else "sports"
            profession = profile["current_profession"].lower()
            
            profile["what_if_analysis"] = f"{name} played {sport} in high school before becoming a {profession}."
            
            hs = profile["high_school"] if profile["high_school"] else "high school"
            profile["viral_angle"] = f"{name} played {sport} at {hs}. Then they became {profile['famous_for'][:50]}..."
        
        # Data quality indicator
        fields_filled = sum([
            bool(profile["high_school"]),
            bool(profile["hometown"]),
            bool(profile["sports"]),
            bool(profile["notable_achievements"]),
        ])
        
        if fields_filled >= 4:
            profile["data_quality"] = "high"
        elif fields_filled >= 2:
            profile["data_quality"] = "medium"
        else:
            profile["data_quality"] = "low"
        
        return profile
    
    def run(self, target_count=100):
        """Main scraping loop"""
        print("🕷️ Wikipedia Scraper for Athlete Origins")
        print("=" * 50)
        
        # Search for different types of celebrities
        sports_to_search = ["football", "basketball", "baseball", "track", "boxing"]
        
        all_names = []
        for sport in sports_to_search:
            names = self.search_celebrities(sport, limit=30)
            all_names.extend(names)
            sleep(1)
        
        # Remove duplicates
        all_names = list(set(all_names))
        print(f"\nFound {len(all_names)} potential celebrities")
        
        # Scrape each person
        success = 0
        failed = 0
        low_quality = 0
        
        for name in all_names[:target_count]:
            profile = self.scrape_person(name)
            if profile:
                if profile.get("sports"):  # Only keep if we found sports
                    self.profiles.append(profile)
                    success += 1
                    
                    if profile.get("data_quality") == "low":
                        low_quality += 1
                else:
                    failed += 1
            else:
                failed += 1
            
            sleep(0.5)  # Be nice to Wikipedia
            
            # Progress update
            if (success + failed) % 10 == 0:
                print(f"  Progress: {success} sports profiles found, {failed} failed")
        
        print("\n" + "=" * 50)
        print(f"✅ Success: {success} profiles with sports data")
        print(f"❌ Failed/No sports data: {failed}")
        print(f"⚠️ Low quality: {low_quality}")
        
        # Save results
        if self.profiles:
            with open(OUTPUT_FILE, 'w') as f:
                json.dump(self.profiles, f, indent=2)
            print(f"\n💾 Saved to {OUTPUT_FILE}")
        
        return self.profiles


def main():
    scraper = WikipediaScraper()
    profiles = scraper.run(target_count=150)
    
    print(f"\n{'='*50}")
    print("Sample profiles found:")
    for p in profiles[:5]:
        print(f"\n{p['name']}:")
        print(f"  Sport: {', '.join(p['sports'])}")
        print(f"  School: {p['high_school']}")
        print(f"  Quality: {p['data_quality']}")


if __name__ == "__main__":
    main()
