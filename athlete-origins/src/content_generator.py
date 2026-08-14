#!/usr/bin/env python3
"""
Content Generator for Athlete Origins
Generates TikTok/Reels/Shorts scripts from profile data
"""

import json
from pathlib import Path
import random

DATA_FILE = Path(__file__).parent.parent / "data" / "seed_data.json"
OUTPUT_DIR = Path(__file__).parent.parent / "content_output"

class ContentGenerator:
    def __init__(self):
        with open(DATA_FILE) as f:
            self.profiles = json.load(f)
        OUTPUT_DIR.mkdir(exist_ok=True)
    
    def generate_hook_scripts(self, count=10):
        """Generate hook-style scripts for TikTok"""
        scripts = []
        selected = random.sample(self.profiles, min(count, len(self.profiles)))
        
        for p in selected:
            script = f"""
【HOOK SCRIPT: {p['name']}】

[0-3 SECONDS] HOOK:
Text: "Before {p['name']} was famous..."
Visual: Yearbook photo / B&W

[3-6 SECONDS] REVEAL:
Text: "They were {p['primary_sport']} at {p['high_school']}"
Visual: Sports photo

[6-10 SECONDS] STAT DROP:
Text: "{self._get_best_stat(p)}"
Visual: Highlight reel / Stat graphic

[10-15 SECONDS] TWIST:
Text: "{p['what_if_analysis'][:80]}..."
Visual: Then vs Now split

[15-17 SECONDS] CTA:
Text: "What other celebs played sports?"
+ Follow button animation

---
HASHTAGS: #BeforeTheyWereFamous #{p['primary_sport'].title()} #HighSchoolSports #AthleteOrigins

VIRAL ANGLE: {p['viral_angle']}
"""
            scripts.append(script)
        
        return scripts
    
    def generate_comparison_content(self):
        """Generate comparison-style content"""
        # Find athletes who played multiple sports
        multi_sport = [p for p in self.profiles if len(p['sports']) > 1]
        
        content = []
        for p in multi_sport[:5]:
            second_sport = p['sports'][1]
            c = f"""
【COMPARISON: {p['name']}】

Text Overlay:
"{p['name']}"
"{p['sports'][0].title()} Stats: {self._get_best_stat(p)}"
"{second_sport.title()} Stats: Also starred"

Hook: "Most people know {p['name']} from {p['famous_for'].split(',')[0]}..."

Twist: "But they almost went pro in {second_sport}!"

What If: {p['what_if_analysis']}
"""
            content.append(c)
        
        return content
    
    def generate_trivia_questions(self, count=20):
        """Generate trivia questions for engagement"""
        questions = []
        
        for p in random.sample(self.profiles, min(count, len(self.profiles))):
            q = {
                "question": f"What sport did {p['name']} play at {p['high_school']}?",
                "answer": ", ".join(p['sports']),
                "fun_fact": p['viral_angle'],
                "engagement_hook": f"{p['name']} was {p['what_if_analysis'][:60]}..."
            }
            questions.append(q)
        
        return questions
    
    def generate_full_script_library(self):
        """Generate complete script library to file"""
        output = []
        
        output.append("=" * 60)
        output.append("ATHLETE ORIGINS - CONTENT SCRIPT LIBRARY")
        output.append("=" * 60)
        output.append("")
        
        # Hook scripts
        output.append("📱 TIKTOK/REELS HOOK SCRIPTS")
        output.append("-" * 40)
        output.extend(self.generate_hook_scripts(10))
        
        output.append("")
        output.append("🔄 COMPARISON CONTENT")
        output.append("-" * 40)
        output.extend(self.generate_comparison_content())
        
        output.append("")
        output.append("❓ TRIVIA QUESTIONS")
        output.append("-" * 40)
        for i, q in enumerate(self.generate_trivia_questions(20), 1):
            output.append(f"{i}. Q: {q['question']}")
            output.append(f"   A: {q['answer']}")
            output.append(f"   💡 {q['fun_fact']}")
            output.append("")
        
        # Save to file
        output_file = OUTPUT_DIR / "content_scripts.txt"
        with open(output_file, "w") as f:
            f.write("\n".join(output))
        
        print(f"✅ Generated content library: {output_file}")
        return output_file
    
    def generate_daily_content_calendar(self, days=30):
        """Generate a 30-day content calendar"""
        calendar = []
        content_types = [
            "Hook Script",
            "Comparison Post",
            "Trivia Question",
            "Stat Drop",
            "What If Story",
            "Viral Angle",
            "Behind the Scenes",
            "Fan Poll",
        ]
        
        for day in range(1, days + 1):
            profile = random.choice(self.profiles)
            content_type = content_types[day % len(content_types)]
            
            calendar.append({
                "day": day,
                "type": content_type,
                "subject": profile['name'],
                "sport": profile['primary_sport'],
                "hook": profile['viral_angle'][:100] + "...",
                "cta": "Follow for more athlete origins"
            })
        
        # Save as JSON and readable format
        json_file = OUTPUT_DIR / "content_calendar.json"
        with open(json_file, "w") as f:
            json.dump(calendar, f, indent=2)
        
        # Readable version
        txt_file = OUTPUT_DIR / "content_calendar.txt"
        with open(txt_file, "w") as f:
            f.write("30-DAY CONTENT CALENDAR\n")
            f.write("=" * 50 + "\n\n")
            for item in calendar:
                f.write(f"DAY {item['day']} - {item['type'].upper()}\n")
                f.write(f"Subject: {item['subject']} ({item['sport']})\n")
                f.write(f"Hook: {item['hook']}\n")
                f.write(f"CTA: {item['cta']}\n")
                f.write("-" * 40 + "\n\n")
        
        print(f"✅ Generated 30-day calendar")
        return json_file, txt_file
    
    def _get_best_stat(self, profile):
        """Get the most impressive stat for a profile"""
        stats = profile['stats']
        if not stats:
            return "Multi-sport athlete"
        
        # Priority order
        priority = ['ppg', 'yards', 'touchdowns', 'sacks', 'receptions', 'draft']
        
        for key in priority:
            for stat_key, value in stats.items():
                if key in stat_key.lower() and value:
                    return f"{value} {stat_key.replace('_', ' ')}"
        
        # Return first available
        first = next(iter(stats.items()))
        return f"{first[1]} {first[0].replace('_', ' ')}"


def main():
    print("🎬 Athlete Origins Content Generator")
    print("=" * 50)
    
    gen = ContentGenerator()
    
    # Generate all content
    print("\n1. Generating hook scripts...")
    gen.generate_hook_scripts(10)
    
    print("2. Generating comparison content...")
    gen.generate_comparison_content()
    
    print("3. Generating trivia questions...")
    gen.generate_trivia_questions(20)
    
    print("4. Creating full script library...")
    gen.generate_full_script_library()
    
    print("5. Creating 30-day content calendar...")
    gen.generate_daily_content_calendar(30)
    
    print("\n" + "=" * 50)
    print(f"✅ All content generated in: {OUTPUT_DIR}")
    print("\nFiles created:")
    for f in OUTPUT_DIR.iterdir():
        print(f"  - {f.name}")


if __name__ == "__main__":
    main()
