#!/usr/bin/env python3
"""
Daily Supercharged Run (Clean Version)
Integrates Scout web intelligence + AI industry intel + Twitter optimization
NO Hacker News content refresh — that was removed
"""

import os
import sys
import json
from datetime import datetime
from pathlib import Path

sys.path.insert(0, os.path.expanduser('~/.openclaw/workspace'))

def run_daily_supercharged():
    """Run the complete daily intelligence and content pipeline"""
    
    print("🚀 DAILY SUPERCHARGED RUN")
    print("=" * 70)
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    results = {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "started": datetime.now().isoformat(),
        "modules": {}
    }
    
    # 1. Scout Web Intelligence (if deals exist)
    print("1️⃣  Scout Web Intelligence")
    print("-" * 70)
    try:
        from scout_daily_intel_web import generate_daily_web_briefing
        scout_briefing = generate_daily_web_briefing()
        results["modules"]["scout"] = {
            "status": "success",
            "deals_researched": scout_briefing.get("summary", {}).get("deals_researched", 0),
            "intelligence_items": scout_briefing.get("summary", {}).get("intelligence_items", 0)
        }
        print(f"   ✓ Researched {results['modules']['scout']['deals_researched']} deals")
        print(f"   ✓ Found {results['modules']['scout']['intelligence_items']} intelligence items")
    except Exception as e:
        results["modules"]["scout"] = {"status": "error", "error": str(e)}
        print(f"   ⚠️  Scout: {e}")
    
    print()
    
    # 2. AI Industry Intelligence
    print("2️⃣  AI Industry Intelligence")
    print("-" * 70)
    try:
        from ai_industry_intel import AIIndustryIntel
        intel = AIIndustryIntel()
        pulse = intel.get_daily_industry_pulse()
        
        results["modules"]["ai_industry"] = {
            "status": "success",
            "breaking_news": len(pulse.get("breaking", [])),
            "funding_news": len(pulse.get("funding_news", [])),
            "content_opportunities": len(pulse.get("content_opportunities", [])),
            "credits_used": intel.credits_used
        }
        
        print(f"   ✓ Breaking news: {results['modules']['ai_industry']['breaking_news']}")
        print(f"   ✓ Funding updates: {results['modules']['ai_industry']['funding_news']}")
        print(f"   ✓ Content opportunities: {results['modules']['ai_industry']['content_opportunities']}")
        print(f"   ✓ Credits used: {results['modules']['ai_industry']['credits_used']}")
        
        # Save opportunities for Twitter
        if pulse.get("content_opportunities"):
            output_path = f"/Users/aleckennedy/.openclaw/workspace/content_opportunities_{datetime.now().strftime('%Y%m%d')}.json"
            with open(output_path, 'w') as f:
                json.dump(pulse["content_opportunities"], f, indent=2)
            print(f"   ✓ Saved opportunities to {output_path}")
    except Exception as e:
        results["modules"]["ai_industry"] = {"status": "error", "error": str(e)}
        print(f"   ⚠️  AI Industry: {e}")
    
    print()
    
    # 3. Twitter Supercharged Content
    print("3️⃣  Twitter/X Supercharged Content")
    print("-" * 70)
    try:
        from twitter_supercharged import TwitterSupercharged
        engine = TwitterSupercharged()
        posts = engine.generate_daily_content()
        
        results["modules"]["twitter"] = {
            "status": "success",
            "posts_generated": len(posts),
            "credits_used": engine.intel.credits_used
        }
        
        print(f"   ✓ Posts generated: {results['modules']['twitter']['posts_generated']}")
        if posts:
            print(f"   ✓ Schedule:")
            for post in posts:
                print(f"      {post['time']} - {post['type']} ({post['engagement_tactic']})")
        
        # Queue posts for posting
        queue_posts(posts)
        
    except Exception as e:
        results["modules"]["twitter"] = {"status": "error", "error": str(e)}
        print(f"   ⚠️  Twitter: {e}")
    
    print()
    
    # Summary
    print("📊 DAILY SUMMARY")
    print("=" * 70)
    total_credits = sum(m.get("credits_used", 0) for m in results["modules"].values())
    successful = sum(1 for m in results["modules"].values() if m.get("status") == "success")
    
    print(f"   Modules run: {len(results['modules'])}")
    print(f"   Successful: {successful}")
    print(f"   Total API credits: {total_credits}")
    print(f"   Finished: {datetime.now().strftime('%H:%M:%S')}")
    
    results["finished"] = datetime.now().isoformat()
    results["total_credits"] = total_credits
    
    # Save results
    output_file = f"/Users/aleckennedy/.openclaw/workspace/daily_run_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n✓ Results saved: {output_file}")
    
    return results


def queue_posts(posts):
    """Queue generated posts for the posting system"""
    state_file = Path('/Users/aleckennedy/.openclaw/workspace/state.json')
    
    if not state_file.exists():
        print("   ⚠️  No state.json found")
        return
    
    with open(state_file) as f:
        state = json.load(f)
    
    # Add posts to queue
    if "queuedPosts" not in state:
        state["queuedPosts"] = []
    if "twitterQueue" not in state:
        state["twitterQueue"] = []

    for post in posts:
        item = {
            "scheduled_time": post["time"],
            "content": post["content"],
            "text": post["content"],  # post_tweet.py reads 'text'
            "type": post["type"],
            "tactic": post["engagement_tactic"],
            "source": post.get("source", "ai_generated"),
            "added_at": datetime.now().isoformat()
        }
        state["queuedPosts"].append(item)
        state["twitterQueue"].append(item)
    
    # Save updated state
    with open(state_file, 'w') as f:
        json.dump(state, f, indent=2)
    
    print(f"   ✓ {len(posts)} posts queued in state.json")


if __name__ == "__main__":
    results = run_daily_supercharged()
