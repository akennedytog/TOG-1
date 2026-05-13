#!/usr/bin/env python3
"""Post tweets immediately - for manual posting"""

import json
import os
from pathlib import Path
from datetime import datetime

STATE_FILE = Path('/Users/aleckennedy/.openclaw/workspace/state.json')
LOG_FILE = Path('/Users/aleckennedy/.openclaw/workspace/logs/twitter_post.log')

def log(msg):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f"[{timestamp}] {msg}")
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(LOG_FILE, 'a') as f:
        f.write(f"[{timestamp}] {msg}\n")

def load_state():
    return json.loads(STATE_FILE.read_text())

def save_state(state):
    STATE_FILE.write_text(json.dumps(state, indent=2))

def post_to_twitter(text):
    """Post tweet using Twitter API"""
    try:
        import tweepy
        
        api_key = os.getenv('TWITTER_API_KEY')
        api_secret = os.getenv('TWITTER_API_SECRET')
        access_token = os.getenv('TWITTER_ACCESS_TOKEN')
        access_secret = os.getenv('TWITTER_ACCESS_SECRET')
        
        if not all([api_key, api_secret, access_token, access_secret]):
            log("❌ Twitter credentials not found")
            return False
        
        client = tweepy.Client(
            consumer_key=api_key,
            consumer_secret=api_secret,
            access_token=access_token,
            access_token_secret=access_secret
        )
        
        response = client.create_tweet(text=text)
        log(f"✅ Tweet posted! ID: {response.data['id']}")
        return True
        
    except Exception as e:
        log(f"❌ Failed to post: {e}")
        return False

tweets = [
    {
        "id": "manual_today_debug",
        "text": """This morning:

Fixed my automated Twitter system.

The bug? Cron timeouts were too short (60s) for the posting script.

Also added duplicate detection.

Because nobody wants to see the same "reflection" tweet 4 times.

Small fixes. Big impact."""
    },
    {
        "id": "manual_week_lessons", 
        "text": """Last week's AI observations:

• Mercedes bringing back physical buttons (744 pts) — the UX pendulum swings back
• Ollama launches $20/month — local AI gets a price tag  
• Agent-to-agent negotiation is coming — etiquette TBD
• DeepClaude (Claude + DeepSeek) — hybrid approaches winning

Pattern: The best tools combine multiple models, not just one.

What's your stack?"""
    }
]

for tweet in tweets:
    log(f"📝 Posting: {tweet['text'][:60]}...")
    if post_to_twitter(tweet['text']):
        # Update state
        state = load_state()
        state.setdefault('postedLog', []).append({
            'id': tweet['id'],
            'text': tweet['text'],
            'postedAt': datetime.now().isoformat(),
            'type': 'manual'
        })
        state['postedToday'] = state.get('postedToday', 0) + 1
        save_state(state)
        log(f"✅ Posted and logged")
    else:
        log(f"❌ Failed to post tweet")

log("=" * 40)
