#!/usr/bin/env python3
"""
Twitter Poster - Simple script to post next queued tweet
Reads from state.json, posts via Twitter API v2
"""

import json
import os
import sys
import re
import fcntl
import tempfile
from pathlib import Path
from datetime import datetime
from difflib import SequenceMatcher

# ---------------------------------------------------------------------------
# Cross-process lock: prevents two concurrent post_tweet.py runs (e.g. cron +
# PM2 poller racing) from both reading the same queue and posting the SAME
# tweet twice. This was the root cause of duplicate tweets on 2026-08-14.
# ---------------------------------------------------------------------------
_LOCK_FILE = '/tmp/post_tweet.lock'
_lock_fd = None

def acquire_lock():
    """Take an exclusive flock. Exit immediately if another run holds it."""
    global _lock_fd
    _lock_fd = open(_LOCK_FILE, 'w')
    try:
        fcntl.flock(_lock_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except OSError:
        log(f"⏭️ Another post_tweet.py run is already in progress (lock held) - skipping")
        sys.exit(0)
    _lock_fd.write(str(os.getpid()))
    _lock_fd.flush()

def release_lock():
    global _lock_fd
    if _lock_fd is not None:
        try:
            fcntl.flock(_lock_fd, fcntl.LOCK_UN)
        except OSError:
            pass
        _lock_fd.close()
        _lock_fd = None


# Load .env file
def load_dotenv(filepath='.env'):
    """Load environment variables from .env file"""
    # Check cwd, then script dir, then the canonical OpenClaw env location
    candidates = [
        Path(filepath),
        Path(__file__).parent / '.env',
        Path.home() / '.openclaw' / '.env',
    ]
    for env_path in candidates:
        if env_path.exists():
            with open(env_path) as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        key, value = line.split('=', 1)
                        os.environ.setdefault(key, value)
            break

load_dotenv()

# Paths
STATE_FILE = Path('/Users/aleckennedy/.openclaw/workspace/state.json')
LOG_FILE = Path('/Users/aleckennedy/.openclaw/workspace/logs/twitter_post.log')
SIMILARITY_DUPLICATE_THRESHOLD = 0.84

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
    # Keep both queue keys in sync for backward compatibility with older scripts.
    state['queuedPosts'] = state.get('twitterQueue', [])
    STATE_FILE.write_text(json.dumps(state, indent=2))

def normalize_state(state):
    """Normalize state shape and reset daily counters on date rollover."""
    if state is None:
        return None

    # Migrate old queue key if needed. Prefer the non-empty queue.
    tq = state.get('twitterQueue')
    qp = state.get('queuedPosts', [])
    if isinstance(tq, list) and tq:
        queue = tq
    elif isinstance(qp, list) and qp:
        queue = qp
    else:
        queue = tq if isinstance(tq, list) else (qp if isinstance(qp, list) else [])
    state['twitterQueue'] = queue

    # Ensure core keys exist.
    state.setdefault('postedLog', [])
    state.setdefault('todayPosts', [])
    state.setdefault('postedToday', 0)
    state.setdefault('postingStatus', {'status': 'ready'})

    today = datetime.now().strftime('%Y-%m-%d')
    if state.get('date') != today:
        state['date'] = today
        state['postedToday'] = 0
        state['todayPosts'] = []

    # Recompute postedToday from the current day list for consistency.
    if isinstance(state.get('todayPosts'), list):
        state['postedToday'] = len(state['todayPosts'])
    else:
        state['todayPosts'] = []
        state['postedToday'] = 0

    return state

def normalize_text(text):
    text = (text or '').lower()
    text = re.sub(r'https?://\S+', '', text)
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def intro_key(text):
    lines = [line.strip() for line in (text or '').splitlines() if line.strip()]
    if not lines:
        return ''
    words = normalize_text(lines[0]).split()
    return ' '.join(words[:8])


def is_low_quality(text):
    # Minimum length: 40 chars is enough to reject junk fragments (e.g. "AINW is where...")
    # while allowing punchy short-form tweets. 120 was too aggressive and rejected good content.
    if len((text or '').strip()) < 40:
        return True
    banned = [
        'the real insight behind',
        "everyone's talking about the technology",
        '[task]',
        'this changes everything',
        'game changer'
    ]
    text_lower = (text or '').lower()
    return any(phrase in text_lower for phrase in banned)


def is_duplicate(text, posted_log, hours=24 * 45):
    """Check if similar content was posted recently"""
    import hashlib
    from datetime import datetime, timedelta
    
    normalized = normalize_text(text)
    new_intro_key = intro_key(text)
    content_hash = hashlib.md5(normalized[:160].encode()).hexdigest()[:16]
    
    cutoff = datetime.now() - timedelta(hours=hours)
    
    for entry in posted_log:
        posted_at = entry.get('postedAt', '')
        if posted_at:
            try:
                posted_time = datetime.fromisoformat(posted_at.replace('Z', '+00:00'))
                if posted_time > cutoff:
                    existing_text = entry.get('text', '')
                    existing_normalized = normalize_text(existing_text)
                    existing_intro_key = intro_key(existing_text)
                    existing_hash = hashlib.md5(existing_normalized[:160].encode()).hexdigest()[:16]
                    if existing_hash == content_hash:
                        return True
                    if new_intro_key and existing_intro_key and new_intro_key == existing_intro_key:
                        return True
                    if SequenceMatcher(None, normalized, existing_normalized).ratio() >= SIMILARITY_DUPLICATE_THRESHOLD:
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
        log("❌ tweepy is not installed. Install tweepy for canonical posting.")
        return False
            
    except Exception as e:
        log(f"❌ Failed to post: {e}")
        error_msg = str(e).lower()
        if 'duplicate' in error_msg or '403' in error_msg:
            log("🗑️ Duplicate detected via API error - will remove from queue")
            return "duplicate"
        return False

def main():
    log("=" * 50)
    log("🐦 Twitter Poster Started")

    # Acquire cross-process lock FIRST so concurrent runs can't double-post.
    acquire_lock()
    import atexit
    atexit.register(release_lock)
    
    # Load state
    state = normalize_state(load_state())
    if not state:
        sys.exit(1)
    
    # Check queue
    queue = state.get('twitterQueue', [])
    if not queue:
        log("ℹ️ No posts in queue")
        sys.exit(0)
    
    log(f"📊 {len(queue)} posts in queue")

    # Drain invalid/repetitive items from queue head until a valid candidate is found.
    next_post = None
    text = ""
    post_id = "unknown"
    story_title = None
    while queue:
        candidate = queue[0]
        candidate_text = (candidate.get('text') or candidate.get('content') or '') if isinstance(candidate, dict) else str(candidate or '')
        if not candidate_text.strip():
            log("❌ Post has no text, removing from queue")
            queue = queue[1:]
            state['twitterQueue'] = queue
            save_state(state)
            continue
        if is_low_quality(candidate_text):
            log("🗑️ Removed low-quality/repetitive queued post")
            queue = queue[1:]
            state['twitterQueue'] = queue
            save_state(state)
            continue
        if is_duplicate(candidate_text, state.get('postedLog', [])):
            log("🗑️ Removed duplicate queued post before posting")
            queue = queue[1:]
            state['twitterQueue'] = queue
            save_state(state)
            continue

        next_post = candidate if isinstance(candidate, dict) else {'text': candidate_text}
        if isinstance(next_post, dict) and not next_post.get('text') and next_post.get('content'):
            next_post['text'] = next_post['content']
        text = candidate_text
        post_id = next_post.get('id', 'unknown')
        story_title = next_post.get('storyTitle') or next_post.get('story_title')
        break

    if not next_post:
        log("ℹ️ Queue exhausted after quality/duplicate filtering")
        sys.exit(0)
    
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
        posted_at = datetime.now().isoformat()
        state.setdefault('postedLog', []).append({
            'id': post_id,
            'text': text,
            'postedAt': posted_at,
            'storyTitle': story_title,
            'type': 'auto'
        })
        state.setdefault('todayPosts', []).append({
            'id': post_id,
            'text': text,
            'postedAt': posted_at,
            'type': next_post.get('source', next_post.get('type', 'auto'))
        })
        state['postedToday'] = len(state['todayPosts'])
        state['date'] = datetime.now().strftime('%Y-%m-%d')
        state['lastPostTime'] = str(int(datetime.now().timestamp() * 1000))
        save_state(state)
        log(f"✅ Posted! {len(state['twitterQueue'])} remaining in queue")
    else:
        log("❌ Post failed, keeping in queue for retry")
        sys.exit(1)

if __name__ == "__main__":
    main()
