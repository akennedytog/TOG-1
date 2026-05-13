#!/usr/bin/env python3
"""
Twitter Poster - Simple script to post next queued tweet
Reads from state.json, posts via Twitter API v2
"""

import json
import os
import sys
from pathlib import Path
from datetime import datetime

# Load .env file
def load_dotenv(filepath='.env'):
    """Load environment variables from .env file"""
    env_path = Path(filepath)
    if not env_path.exists():
        env_path = Path(__file__).parent / '.env'
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ.setdefault(key, value)

load_dotenv()

# Paths
STATE_FILE = Path('/Users/aleckennedy/.openclaw/workspace/state.json')
LOG_FILE = Path('/Users/aleckennedy/.openclaw/workspace/logs/twitter_post.log')

# Ensure log directory exists
LOG_FILE.parent.mkdir(parents=True, exist_ok=True)

def log(msg):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f"[{timestamp}] {msg}")
    with open(LOG_FILE, 'a') as f:
        f.write(f"[{timestamp}] {msg}\n")

def load_state():
    if not STATE_FILE.exists():
        log("❌ state.json not found")
        return None
    return json.loads(STATE_FILE.read_text())

def save_state(state):
    STATE_FILE.write_text(json.dumps(state, indent=2))

def is_duplicate(text, posted_log, hours=24):
    """Check if similar content was posted recently"""
    import hashlib
    from datetime import datetime, timedelta
    
    # Create a hash of the first 100 chars (handles minor edits)
    content_hash = hashlib.md5(text[:100].lower().encode()).hexdigest()[:16]
    
    cutoff = datetime.now() - timedelta(hours=hours)
    
    for entry in posted_log:
        posted_at = entry.get('postedAt', '')
        if posted_at:
            try:
                posted_time = datetime.fromisoformat(posted_at.replace('Z', '+00:00'))
                if posted_time > cutoff:
                    existing_hash = hashlib.md5(entry.get('text', '')[:100].lower().encode()).hexdigest()[:16]
                    if existing_hash == content_hash:
                        return True
            except:
                pass
    return False

def post_to_twitter(text, posted_log=None):
    """Post tweet using Twitter API via tweepy or direct API call"""
    
    # Check for duplicates first
    if posted_log and is_duplicate(text, posted_log):
        log("⚠️ Duplicate content detected - skipping post")
        return "duplicate"
    
    try:
        import tweepy
        
        # Load credentials from env
        api_key = os.getenv('TWITTER_API_KEY')
        api_secret = os.getenv('TWITTER_API_SECRET')
        access_token = os.getenv('TWITTER_ACCESS_TOKEN')
        access_secret = os.getenv('TWITTER_ACCESS_SECRET')
        
        if not all([api_key, api_secret, access_token, access_secret]):
            log("❌ Twitter credentials not found in environment")
            return False
        
        # Create client
        client = tweepy.Client(
            consumer_key=api_key,
            consumer_secret=api_secret,
            access_token=access_token,
            access_token_secret=access_secret
        )
        
        # Post tweet
        response = client.create_tweet(text=text)
        log(f"✅ Tweet posted! ID: {response.data['id']}")
        return True
        
    except ImportError:
        log("⚠️ tweepy not installed, trying requests...")
        
        # Fallback to using the running node process
        import subprocess
        try:
            # Signal the running twitter-automation.js to post immediately
            result = subprocess.run(
                ['pkill', '-USR1', '-f', 'twitter-automation.js'],
                capture_output=True,
                text=True
            )
            log("✅ Signaled twitter-automation.js to post")
            return True
        except Exception as e:
            log(f"❌ Failed to signal: {e}")
            return False
            
    except Exception as e:
        log(f"❌ Failed to post: {e}")
        return False

def main():
    log("=" * 50)
    log("🐦 Twitter Poster Started")
    
    # Load state
    state = load_state()
    if not state:
        sys.exit(1)
    
    # Check queue
    queue = state.get('twitterQueue', [])
    if not queue:
        log("ℹ️ No posts in queue")
        sys.exit(0)
    
    log(f"📊 {len(queue)} posts in queue")
    
    # Get next post
    next_post = queue[0]
    text = next_post.get('text', '')
    post_id = next_post.get('id', 'unknown')
    
    if not text:
        log("❌ Post has no text, removing from queue")
        state['twitterQueue'] = queue[1:]
        save_state(state)
        sys.exit(1)
    
    log(f"📝 Posting: {text[:60]}...")
    
    # Post to Twitter
    result = post_to_twitter(text, state.get('postedLog', []))
    
    if result == "duplicate":
        # Remove duplicate from queue without posting
        state['twitterQueue'] = queue[1:]
        save_state(state)
        log(f"🗑️ Removed duplicate from queue. {len(state['twitterQueue'])} remaining")
        sys.exit(0)
    elif result:
        # Remove from queue and add to posted log
        state['twitterQueue'] = queue[1:]
        state.setdefault('postedLog', []).append({
            'id': post_id,
            'text': text,
            'postedAt': datetime.now().isoformat(),
            'type': 'auto'
        })
        state['postedToday'] = state.get('postedToday', 0) + 1
        save_state(state)
        log(f"✅ Posted! {len(state['twitterQueue'])} remaining in queue")
    else:
        log("❌ Post failed, keeping in queue for retry")
        sys.exit(1)

if __name__ == "__main__":
    main()
