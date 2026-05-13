#!/usr/bin/env python3
"""
Twitter Reply Bot - Find and suggest replies to grow following
"""

import requests
import json
import re
from datetime import datetime
from pathlib import Path

STATE_FILE = Path('/Users/aleckennedy/.openclaw/workspace/state.json')
REPLIES_FILE = Path('/Users/aleckennedy/.openclaw/workspace/data/suggested_replies.json')

# Target accounts to monitor
TARGET_ACCOUNTS = [
    'sama', 'karpathy', 'AndrewYNg', 'naval', 'paulg',
    'TheRabbitHole', 'aidailyinsights', 'bindureddy',
]

# Keywords to find relevant tweets
KEYWORDS = [
    'SMB automation', 'AI for business', 'small business AI',
    'OpenClaw', 'AI agent', 'business automation',
    'Miami business', 'South Florida business',
]

def fetch_user_tweets(username, bearer_token):
    """Fetch recent tweets from a user"""
    url = f"https://api.twitter.com/2/users/by/username/{username}/tweets"
    headers = {"Authorization": f"Bearer {bearer_token}"}
    params = {"max_results": 10, "tweet.fields": "created_at,public_metrics"}
    
    try:
        resp = requests.get(url, headers=headers, params=params, timeout=10)
        if resp.status_code == 200:
            return resp.json().get('data', [])
    except Exception as e:
        print(f"Error fetching {username}: {e}")
    return []

def search_tweets(query, bearer_token):
    """Search for tweets by keyword"""
    url = "https://api.twitter.com/2/tweets/search/recent"
    headers = {"Authorization": f"Bearer {bearer_token}"}
    params = {
        "query": query,
        "max_results": 10,
        "tweet.fields": "author_id,created_at,public_metrics"
    }
    
    try:
        resp = requests.get(url, headers=headers, params=params, timeout=10)
        if resp.status_code == 200:
            return resp.json().get('data', [])
    except Exception as e:
        print(f"Error searching {query}: {e}")
    return []

def generate_reply_suggestion(tweet_text):
    """Generate a reply suggestion based on tweet content"""
    
    # Pattern matching for reply templates
    if 'automation' in tweet_text.lower():
        return {
            'style': 'insight_addition',
            'suggestion': 'Great point. We\'ve seen SMBs save 10+ hours/week with simple AI automation. The key is starting with ONE workflow, not trying to automate everything at once.',
            'reason': 'Adds practical context to automation discussion'
        }
    
    if 'cost' in tweet_text.lower() or 'expensive' in tweet_text.lower():
        return {
            'style': 'experience_share',
            'suggestion': 'Funny enough, the businesses that think AI is "too expensive" are usually losing more to inefficiency than they\'d spend on automation. We ran the numbers for a client last week...',
            'reason': 'Challenges assumption with real-world example'
        }
    
    if 'OpenClaw' in tweet_text or 'openclaw' in tweet_text.lower():
        return {
            'style': 'experience_share',
            'suggestion': 'Running OpenClaw for a few clients now. The learning curve is real, but the ownership model is huge for businesses that don\'t want vendor lock-in. Happy to share setup notes.',
            'reason': 'Establishes authority in OpenClaw community'
        }
    
    if 'HVAC' in tweet_text or 'plumber' in tweet_text.lower() or 'contractor' in tweet_text.lower():
        return {
            'style': 'local_hook',
            'suggestion': 'This is exactly what we see with South Florida [industry] owners. The ones who automate scheduling/quote follow-ups are capturing jobs while competitors are still checking voicemail.',
            'reason': 'Targets local service businesses'
        }
    
    # Default replies
    defaults = [
        {
            'style': 'appreciation',
            'suggestion': 'This is a great breakdown. Saving this thread.',
            'reason': 'Low-effort engagement'
        },
        {
            'style': 'question',
            'suggestion': 'How are you seeing this play out with smaller teams? We work with a lot of 5-10 person shops and curious if the pattern holds.',
            'reason': 'Invites further discussion'
        },
        {
            'style': 'insight_addition',
            'suggestion': 'From the SMB side of the table: [relevant observation]. It\'s a different calculus when you\'re running lean.',
            'reason': 'Adds SMB perspective'
        }
    ]
    
    import random
    return random.choice(defaults)

def main():
    print("🔍 Twitter Reply Bot")
    print("-" * 40)
    
    # Load state to get bearer token
    if not STATE_FILE.exists():
        print("❌ No state file found")
        return
    
    state = json.loads(STATE_FILE.read_text())
    
    # For now, just generate suggestions without actual API calls
    # (API requires elevated access which may not be available)
    
    suggestions = []
    
    # Example suggestions based on common patterns
    example_tweets = [
        "Thinking about automation for my small business",
        "OpenClaw vs other AI platforms - which should I choose?",
        "The cost of AI tools is getting crazy",
        "Just discovered OpenClaw and I'm blown away",
        "HVAC business owners - how are you handling lead follow-up?",
    ]
    
    for tweet in example_tweets:
        reply = generate_reply_suggestion(tweet)
        suggestions.append({
            'original_tweet': tweet,
            'suggested_reply': reply['suggestion'],
            'style': reply['style'],
            'reason': reply['reason'],
            'timestamp': datetime.now().isoformat()
        })
    
    # Save suggestions
    REPLIES_FILE.parent.mkdir(parents=True, exist_ok=True)
    REPLIES_FILE.write_text(json.dumps(suggestions, indent=2))
    
    print(f"✅ Generated {len(suggestions)} reply suggestions")
    print(f"📁 Saved to {REPLIES_FILE}")
    print()
    print("Sample suggestions:")
    for s in suggestions[:3]:
        print(f"\n📝 Tweet: {s['original_tweet'][:50]}...")
        print(f"💬 Reply: {s['suggested_reply'][:60]}...")

if __name__ == "__main__":
    main()
