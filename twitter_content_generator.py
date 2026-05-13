#!/usr/bin/env python3
"""
Twitter Content Generator
Reads content-calendar.json and updates state.json with daily posts for the specified date.
"""

import json
from datetime import datetime, timezone

# Get today's date
TODAY = datetime.now(timezone.utc).strftime('%Y-%m-%d')

# Paths
STATE_FILE = "/Users/aleckennedy/.openclaw/workspace/state.json"
CALENDAR_FILE = "/Users/aleckennedy/.openclaw/workspace/content-calendar.json"

def main():
    print(f"🐦 Twitter Content Generator - {TODAY}")
    
    try:
        # Read existing state
        try:
            with open(STATE_FILE, 'r') as f:
                state = json.load(f)
        except FileNotFoundError:
            state = {
                "contentStrategy": {
                    "focus": "AI broadly, OpenClaw specifically, learning in public",
                    "tone": "Authentic, curious, genuine questions"
                }
            }
        
        # Read content calendar
        with open(CALENDAR_FILE, 'r') as cal:
            calendar = json.load(cal)
        
        # Get today's day of week (0=Monday, 2=Wednesday)
        today = datetime.now(timezone.utc)
        day_of_week = today.weekday() + 1  # Convert to 1-based (1-7 = Mon-Sun)
        
        # Filter for today's posts in the calendar
        today_posts = [p for p in calendar if p.get('dayOfWeek', 0) == day_of_week]
        
        if today_posts:
            print(f"📅 Found {len(today_posts)} posts for today (day {day_of_week})")
            
            # Create formatted content for state.json
            queued_posts = []
            daily_posts = []
            
            for i, post in enumerate(today_posts):
                post_data = {
                    "id": i + 1,
                    "text": post['text'],
                    "topic": post.get('topic', 'General'),
                    "type": post.get('type', 'standard'),
                    "scheduled": today.strftime('%Y-%m-%d')
                }
                queued_posts.append(post_data)
                daily_posts.append(post_data)
            
            # Update state with new data
            state.update({
                "date": TODAY,
                "queuedPosts": queued_posts,
                "todayPosts": daily_posts,
                "lastRefresh": today.isoformat()
            })
            
            # Save updated state
            with open(STATE_FILE, 'w') as f_out:
                json.dump(state, f_out, indent=2)
            
            print(f"✅ Updated {STATE_FILE} with {len(queued_posts)} posts for {TODAY}")
            
            # Also create a human-readable file
            output_file = f"/Users/aleckennedy/.openclaw/workspace/tweet-draft-{TODAY}.txt"
            with open(output_file, 'w') as draft:
                draft.write(f"Twitter Content Draft - {TODAY}\n")
                draft.write("=" * 50 + "\n\n")
                for i, post in enumerate(queued_posts, start=1):
                    draft.write(f"Post {i}: {post['type']}\n")
                    draft.write(f"Text: {post['text']}\n\n")
            
            print(f"📝 Saved human-readable draft to: {output_file}")
        else:
            print(f"⚠️ No posts found for today (day {day_of_week})")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
