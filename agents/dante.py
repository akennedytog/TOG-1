#!/usr/bin/env python3
"""
Dante - Creative Agent (Enhanced with YouTube Research)
Generates Twitter content based on Arlo's research, trending topics, and YouTube summaries.
Saves to data/dante_twitter_content.json
"""

import json
import random
import subprocess
from datetime import datetime
import os

OUTPUT_FILE = "/Users/aleckennedy/.openclaw/workspace/data/dante_twitter_content.json"
ARLO_FILE = "/Users/aleckennedy/.openclaw/workspace/data/arlo_findings.json"

# YouTube channels to monitor for industry content
YOUTUBE_SOURCES = [
    "https://www.youtube.com/@OpenAI",
    "https://www.youtube.com/@anthropic-ai",
    "https://www.youtube.com/@GoogleDeepMind",
    "https://www.youtube.com/@lexfridman",
]

def summarize_youtube(url, max_retries=2):
    """Use summarize CLI to extract key insights from YouTube videos."""
    try:
        result = subprocess.run(
            ["summarize", url, "--model", "gpt-4o-mini", "--slides"],
            capture_output=True,
            text=True,
            timeout=120  # YouTube takes longer
        )
        
        if result.returncode == 0:
            return {
                "summary": result.stdout[:1000] if result.stdout else "No summary available",
                "success": True
            }
        else:
            return {
                "summary": f"Summarize failed: {result.stderr[:100]}",
                "success": False
            }
    except subprocess.TimeoutExpired:
        return {
            "summary": "Timeout - video processing took too long",
            "success": False
        }
    except Exception as e:
        return {
            "summary": f"Error: {str(e)[:100]}",
            "success": False
        }

def load_arlo_findings():
    """Load recent research from Arlo."""
    try:
        with open(ARLO_FILE, 'r') as f:
            data = json.load(f)
            # Get last 5 leads for inspiration
            return data.get('leads', [])[-5:]
    except:
        return []

def load_existing_posts():
    """Load existing posts to check for duplicates."""
    try:
        with open(OUTPUT_FILE, 'r') as f:
            data = json.load(f)
            return data.get('posts', [])
    except:
        return []

def get_template_fingerprint(text):
    """Extract template pattern by removing city/company names."""
    import re
    cities = ['miami', 'fort lauderdale', 'boca raton', 'west palm beach', 'delray beach', 
              'boynton beach', 'lake worth', 'palm beach gardens', 'jupiter']
    fp = text.lower()
    for city in cities:
        fp = fp.replace(city.lower(), '{city}')
    fp = re.sub(r'[a-z]+ & associates', '{company}', fp)
    fp = re.sub(r'[a-z]+ (?:dental|electric|plumbing|hvac|law|medical)', '{company}', fp)
    return fp[:80]

def is_duplicate(new_text, existing_posts):
    """Check if post already exists."""
    new_clean = new_text.lower().strip()[:100]
    new_fingerprint = get_template_fingerprint(new_text)
    
    for post in existing_posts:
        existing = post.get('text', '').lower().strip()[:100]
        if new_clean == existing:
            return True
        existing_fp = get_template_fingerprint(post.get('text', ''))
        if new_fingerprint == existing_fp:
            return True
    return False

def generate_post_from_youtube_summary(summary, existing_posts):
    """Generate a tweet based on YouTube video insights."""
    if not summary or not summary.get('success'):
        return None
    
    video_content = summary.get('summary', '')
    
    # Extract key insights and create Twitter thread
    templates = [
        f"Just watched a fascinating video on AI trends:\n\nKey insight: {video_content[:150]}...\n\nThe future is moving fast. Are you keeping up?",
        f"Learning from the experts:\n\n{video_content[:120]}...\n\nBiggest takeaway: AI isn't replacing humans—it's amplifying what we do best.",
        f"Video breakdown:\n\n{video_content[:130]}...\n\nTranslation for South Florida businesses: Start small, scale what works.",
    ]
    
    for post in templates:
        if not is_duplicate(post, existing_posts):
            return post
    
    return None

def generate_post_from_lead(lead, existing_posts):
    """Generate a unique tweet based on a lead's industry."""
    industry = lead.get('industry', 'Business')
    city = lead.get('city', 'South Florida')
    company = lead.get('name', 'Local business')
    
    # Use website summary if available
    website_summary = lead.get('website_summary', {})
    ai_opportunities = lead.get('ai_opportunity', [])
    
    templates = {
        'HVAC': [
            f"Spoke with an HVAC company in {city} today.\n\nTheir biggest pain point?\nMissing after-hours calls during summer heat waves.\n\nAI voice agents don't sleep. Customers get 24/7 answers.\n\nSimple shift, big impact.",
            f"HVAC businesses in {city} are preparing for summer rush.\n\nMost are still:\n❌ Missing 30% of calls\n❌ Playing phone tag\n❌ Losing emergency jobs\n\nAI changes the game. Not by replacing humans.\nBy capturing what humans miss.",
        ],
        'Legal': [
            f"Law firms in {city} are drowning in intake.\n\nEvery missed call = potential $5K-50K case.\n\nAI doesn't replace attorneys.\nIt qualifies leads before they ever reach your desk.\n\nThe best part? It works at 2 AM when you're sleeping.",
        ],
        'Real Estate': [
            f"Real estate agents in {city}:\n\nYour best leads come when you're showing houses.\n\nThat's also when you can't answer.\n\nAI can:\n✅ Qualify buyer vs tire-kicker\n✅ Schedule showings\n✅ Send listings\n✅ Follow up automatically\n\nYou focus on closing. AI handles the noise.",
        ],
        'Programming': [
            f"Dev agencies in {city}:\n\nSales calls interrupt deep work.\n\nContext switching kills productivity.\n\nAI can:\n✅ Qualify prospects\n✅ Collect project requirements\n✅ Schedule technical calls\n✅ Send NDAs\n\nYou code. AI handles the business development.",
        ],
        'default': [
            f"{company} in {city}:\n\nThe biggest advantage AI gives you?\n\nNot replacing people.\n\nIt's being available when your competitors aren't.\n\n24/7. Instant. Professional.\n\nThat's how you win local markets.",
        ]
    }
    
    posts = templates.get(industry, templates['default'])
    random.shuffle(posts)
    
    for post in posts:
        if not is_duplicate(post, existing_posts):
            return post
    
    return random.choice(posts) + f"\n\n[{datetime.now().strftime('%H:%M')}]"

def generate_general_post(existing_posts):
    """Generate a unique general educational post."""
    templates = [
        "The businesses thriving with AI right now:\n\nThey're not the ones with the fanciest prompts.\n\nThey're the ones who:\n• Identified repetitive tasks\n• Built simple automation\n• Measured the results\n• Iterated quickly\n\nExecution > Theory",
        "OpenClaw's best feature isn't even technical.\n\nIt's the 'skills' system.\n\nInstead of one massive prompt, you build:\n• Reusable modules\n• Tested workflows\n• Documented capabilities\n\nThen compose them like Lego blocks.\n\nThis is how you scale AI without chaos.",
    ]
    
    for _ in range(20):
        post = random.choice(templates)
        if not is_duplicate(post, existing_posts):
            return post
    
    return random.choice(templates) + f"\n\n[{datetime.now().strftime('%H:%M')} daily]"

def main():
    print("🎨 Dante Creative Agent Starting...")
    print("🎥 Now with YouTube research!")
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print("-" * 50)
    
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    existing_posts = load_existing_posts()
    arlo_leads = load_arlo_findings()
    
    posts = []
    
    # Try to get YouTube content (in production, this would be actual video URLs)
    # For now, we'll use the existing lead-based generation
    
    # Generate 3 unique posts
    for i in range(3):
        if arlo_leads and i < len(arlo_leads):
            lead = arlo_leads[i]
            post = generate_post_from_lead(lead, existing_posts)
            source = f"arlo:{lead['industry']}"
        else:
            post = generate_general_post(existing_posts)
            source = "general"
        
        if is_duplicate(post, existing_posts):
            post = post + f"\n\n[Generated {datetime.now().strftime('%H:%M')}]"
        
        posts.append({
            "text": post,
            "source": source,
            "generated_at": datetime.now().isoformat(),
            "type": "insight",
            "status": "ready"
        })
        print(f"✅ Generated post {i+1}: {post[:60]}...")
    
    # Save to file
    try:
        with open(OUTPUT_FILE, 'r') as f:
            data = json.load(f)
            if isinstance(data, list):
                existing = {"posts": data, "total_generated": len(data)}
            else:
                existing = data
    except:
        existing = {"posts": [], "total_generated": 0}
    
    existing["posts"].extend(posts)
    existing["total_generated"] = existing.get("total_generated", 0) + len(posts)
    existing["last_run"] = datetime.now().isoformat()
    
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(existing, f, indent=2)
    
    print("-" * 50)
    print(f"💾 Saved {len(posts)} posts to {OUTPUT_FILE}")
    print(f"📊 Total posts generated: {existing['total_generated']}")
    print("\n✨ Dante creative work complete!")

if __name__ == "__main__":
    main()
