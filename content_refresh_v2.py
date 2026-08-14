#!/usr/bin/env python3
"""
Content Refresh v2 - Better content generation with:
- No "saw this" generic formats
- No stale content (2-3 week old stories)
- SMB-focused angles
- Actual insight, not just announcements
"""

import json
import requests
import xml.etree.ElementTree as ET
import time
import hashlib
import random
import re
from difflib import SequenceMatcher
from datetime import datetime, timedelta
from pathlib import Path

# Config
STATE_FILE = Path('/Users/aleckennedy/.openclaw/workspace/state.json')
CACHE_FILE = Path('/Users/aleckennedy/.openclaw/workspace/.content_cache.json')
DUPLICATE_LOOKBACK_DAYS = 45
SIMILARITY_DUPLICATE_THRESHOLD = 0.84

# RSS Feeds
FEEDS = {
    'hackernews': 'https://hnrss.org/frontpage?points=100',
}

# Weak phrases to avoid
WEAK_PATTERNS = [
    'saw this', 'noticed this', 'spotted this', 'found this',
    'trending on hacker news', 'trending on hn', 'from hn today',
    'saw this development', 'just saw', 'came across',
]

# Non-business contexts to skip (humanitarian, medical, personal, etc.)
NON_BUSINESS_KEYWORDS = [
    'refugee', 'refugees', 'camp', 'camps', 'humanitarian', 'charity', 'donate',
    'cancer', 'disease', 'patient', 'patients', 'hospital', 'medical', 'healthcare',
    'suicide', 'death', 'died', 'killed', 'murder', 'attack', 'terrorist', 'war',
    'homeless', 'poverty', 'starvation', 'famine', 'disaster', 'earthquake',
    'tragedy', 'mourning', 'memorial', 'funeral', 'obituary',
]

# SMB angle templates - these transform tech news into business insight
SMB_ANGLES = {
    'automation': [
        "The businesses winning with {topic} aren't the ones with the most tools.",
        "They're the ones who automated one thing really well.",
        "",
        "Start with your biggest time sink. Automate 80% of it. Measure. Repeat.",
        "",
        "What's your biggest time sink right now?"
    ],
    'pricing': [
        "New pricing model from {topic}:",
        "",
        "The pattern: Free → Usage-based → Seat-based.",
        "",
        "Most SMBs get stuck at the free tier too long.",
        "Or upgrade too fast and waste budget.",
        "",
        "The right time to upgrade? When free becomes more expensive than your time."
    ],
    'workflow': [
        "What '{topic}' actually means for your business:",
        "",
        "The catch: It only works if your team actually uses it.",
        "",
        "Best rollout strategy:",
        "1. One volunteer team",
        "2. Measure for 2 weeks",
        "3. Expand if it sticks",
        "",
        "Skip step 2 and you're just buying software."
    ],
    'finance_ai': [
        "Finance ops reality for SMB teams:",
        "",
        "{topic} matters less than your visibility loop.",
        "If leadership cannot explain cash movement in 60 seconds, tooling is not the bottleneck.",
        "",
        "Run this sequence weekly:",
        "1. Auto-capture transactions",
        "2. Flag variance over threshold",
        "3. Review exceptions with an owner",
        "",
        "Outcome: faster decisions, fewer surprises."
    ],
    'finance_automation': [
        "Operator test log: {topic}",
        "",
        "Do not ask if this is 'cool'. Ask if it reduces cycle time.",
        "Best pattern: automate capture, keep approval human, log every exception.",
        "",
        "Most teams over-automate first and measure second. Flip that order."
    ],
    'cash_flow': [
        "Cash visibility play for operators:",
        "",
        "Treat forecasting like risk detection, not accounting trivia.",
        "Set weekly variance alerts and assign one person to resolve exceptions.",
        "",
        "If your forecast never changes, it is theater."
    ],
    'default': [
        "Operator takeaway from {topic}:",
        "",
        "Ignore the shiny feature list for a second.",
        "Ask what changes in your weekly operating rhythm.",
        "",
        "Quick decision filter:",
        "1. What process gets faster this month?",
        "2. What new risk do we need to manage?",
        "3. What metric tells us it worked?",
        "",
        "If the metric is fuzzy, the rollout is premature."
    ]
}

REPETITIVE_HOOKS = [
    "the real insight behind",
    "everyone's talking about the technology",
    "few are asking what it changes for actual work",
]

GENERIC_CLICHES = [
    "game changer",
    "future is here",
    "this changes everything",
    "no brainer",
]

def load_cache():
    if CACHE_FILE.exists():
        return json.loads(CACHE_FILE.read_text())
    return {'stories': {}, 'last_check': None, 'posted_ids': []}

def save_cache(cache):
    CACHE_FILE.write_text(json.dumps(cache))

def parse_iso_datetime(value):
    """Parse state timestamps safely (supports trailing Z)."""
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace('Z', '+00:00').replace('+00:00', ''))
    except Exception:
        return None


def normalize_text(text):
    text = (text or '').lower()
    text = re.sub(r'https?://\S+', '', text)
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def text_similarity(a, b):
    return SequenceMatcher(None, normalize_text(a), normalize_text(b)).ratio()


def make_title_key(title):
    return normalize_text(title)[:120]


def extract_intro_key(text):
    lines = [line.strip() for line in (text or '').splitlines() if line.strip()]
    if not lines:
        return ''
    words = normalize_text(lines[0]).split()
    return ' '.join(words[:8])


def build_recent_texts(posted_log, queued_posts, days=DUPLICATE_LOOKBACK_DAYS):
    recent = []
    cutoff = datetime.now() - timedelta(days=days)

    for entry in posted_log:
        posted_time = parse_iso_datetime(entry.get('postedAt') or entry.get('createdAt'))
        if posted_time and posted_time <= cutoff:
            continue
        text = entry.get('text', '')
        if text:
            recent.append(text)

    for entry in queued_posts:
        text = entry.get('text', '')
        if text:
            recent.append(text)

    return recent


def build_recent_story_keys(posted_log, queued_posts, days=DUPLICATE_LOOKBACK_DAYS):
    keys = set()
    cutoff = datetime.now() - timedelta(days=days)

    for entry in posted_log:
        posted_time = parse_iso_datetime(entry.get('postedAt') or entry.get('createdAt'))
        if posted_time and posted_time <= cutoff:
            continue
        story_title = entry.get('storyTitle')
        if story_title:
            keys.add(make_title_key(story_title))

    for entry in queued_posts:
        story_title = entry.get('storyTitle')
        if story_title:
            keys.add(make_title_key(story_title))

    return keys


def build_recent_intro_keys(posted_log, queued_posts, days=DUPLICATE_LOOKBACK_DAYS):
    keys = set()
    cutoff = datetime.now() - timedelta(days=days)

    for entry in posted_log:
        posted_time = parse_iso_datetime(entry.get('postedAt') or entry.get('createdAt'))
        if posted_time and posted_time <= cutoff:
            continue
        text = entry.get('text', '')
        intro = extract_intro_key(text)
        if intro:
            keys.add(intro)

    for entry in queued_posts:
        intro = extract_intro_key(entry.get('text', ''))
        if intro:
            keys.add(intro)

    return keys

def fetch_hn_rss():
    """Fetch HN RSS with date checking"""
    try:
        resp = requests.get('https://hnrss.org/frontpage?points=100', timeout=10)
        resp.raise_for_status()
        
        root = ET.fromstring(resp.content)
        
        stories = []
        now = datetime.now()
        cutoff = now - timedelta(days=3)  # Only use stories from last 3 days
        
        for item in root.findall('.//item'):
            title = item.find('title')
            link = item.find('link')
            pub_date = item.find('pubDate')
            
            if title is not None and link is not None:
                # Check if story is recent
                is_recent = True
                if pub_date is not None and pub_date.text:
                    try:
                        from email.utils import parsedate_to_datetime
                        story_date = parsedate_to_datetime(pub_date.text)
                        if story_date < cutoff:
                            is_recent = False
                    except:
                        pass
                
                if is_recent:
                    stories.append({
                        'title': title.text,
                        'link': link.text,
                        'source': 'hackernews'
                    })
        
        return stories[:10]
    except Exception as e:
        print(f"⚠️ Error fetching HN: {e}")
        return []

def is_non_business_context(title):
    """Check if story is about non-business contexts that shouldn't get business templates"""
    title_lower = title.lower()
    for keyword in NON_BUSINESS_KEYWORDS:
        if keyword in title_lower:
            return True
    return False

def is_weak_content(text):
    """Check if content uses weak patterns"""
    text_lower = text.lower()
    for pattern in WEAK_PATTERNS:
        if pattern in text_lower:
            return True
    
    # Also flag content that's too short (< 100 chars) or just announces without insight
    if len(text) < 100:
        return True

    text_lower = text.lower()
    if any(phrase in text_lower for phrase in REPETITIVE_HOOKS):
        return True
    if any(phrase in text_lower for phrase in GENERIC_CLICHES):
        return True

    # Require either explicit structure or a clear question.
    has_structure = any(token in text for token in ['\n1.', '\n2.', '•', '→', '->'])
    has_question = '?' in text
    if not (has_structure or has_question):
        return True
    
    # Keep it operator-focused instead of generic thought leadership.
    operator_terms = ['workflow', 'kpi', 'metric', 'process', 'owner', 'margin', 'runway', 'pilot']
    if not any(term in text_lower for term in operator_terms):
        return True
    
    return False

def audit_content(post, story_title=None):
    """Audit generated content before it's queued. Returns (is_valid, reason)"""
    text = post.get('text', '')
    
    # Check 1: No weak patterns
    if is_weak_content(text):
        return False, "Contains weak patterns or lacks substance"
    
    # Check 2: Makes contextual sense
    if story_title and is_non_business_context(story_title):
        return False, f"Story '{story_title[:40]}...' is non-business context - template inappropriate"
    
    # Check 3: Template actually filled in (not just placeholder)
    if '{topic}' in text or '{title}' in text:
        return False, "Template not properly filled"
    
    # Check 4: Length appropriate (not too short)
    if len(text) < 80:
        return False, "Content too short"

    # Check 5: Avoid placeholders and stale scaffolding
    if '[task]' in text.lower():
        return False, "Contains unresolved placeholder"

    # Check 6: Minimum lexical depth (avoid super-thin posts)
    words = [w for w in normalize_text(text).split(' ') if w]
    if len(words) < 28:
        return False, "Not enough substantive detail"
    
    # Check 7: Coherence check - does the hook match the body?
    lines = text.split('\n')
    if len(lines) > 1 and lines[0].endswith(':'):
        # If first line is a hook, check if rest follows
        first_line_topic = lines[0].replace('Operator takeaway from', '').replace(':', '').strip()
        if first_line_topic and len(first_line_topic) < 10:
            return False, "Hook appears incomplete or cut off"
    
    return True, "Passed audit"

def select_angle(title):
    """Select appropriate angle based on title keywords"""
    title_lower = title.lower()
    
    # Finance-specific keywords
    if any(word in title_lower for word in ['receipt', 'expense', 'bookkeeping', 'accounting', 'quickbooks']):
        return 'finance_automation'
    elif any(word in title_lower for word in ['cash flow', 'forecast', 'runway', 'financial']):
        return 'cash_flow'
    elif any(word in title_lower for word in ['invoice', 'payment', 'billing', 'accounts receivable', 'a/r']):
        return 'finance_ai'
    elif any(word in title_lower for word in ['fraud', 'security', 'compliance', 'audit']):
        return 'finance_ai'
    elif any(word in title_lower for word in ['bank', 'banking', 'finance', 'fintech', 'money']):
        return 'finance_ai'
    elif any(word in title_lower for word in ['price', 'pricing', 'cost', 'free', '$']):
        return 'pricing'
    elif any(word in title_lower for word in ['automation', 'automate', 'workflow', 'tool', 'app']):
        return 'automation'
    elif any(word in title_lower for word in ['api', 'integration', 'platform', 'service']):
        return 'workflow'
    else:
        return 'default'

def generate_insight_post(story, recent_intro_keys=None, post_type='morning'):
    """Generate a post with actual insight, not just announcement"""
    title = story['title']
    angle = select_angle(title)
    template = SMB_ANGLES.get(angle, SMB_ANGLES['default'])

    # Extract topic from title (simplified)
    topic = title.split(':')[0].split('–')[0].strip()[:52]

    opener_options = [
        f"Operator brief on {topic}:",
        f"Execution read for lean teams on {topic}:",
        f"What this week means for SMB operators: {topic}",
        f"Practical takeaway from {topic}:",
    ]
    operator_moves = [
        "Pick one team, one workflow, one KPI and run a 2-week pilot.",
        "Assign a single owner before you buy another tool.",
        "Map the manual step first, then automate only that step.",
        "Roll out with a stop rule: no KPI movement, no expansion.",
    ]
    metric_lines = [
        "Metric to watch this week: cycle time per task.",
        "Metric to watch this week: rework rate after handoff.",
        "Metric to watch this week: time-to-cash on invoices.",
        "Metric to watch this week: team adoption after week 2.",
    ]
    close_questions = [
        "Which process are you testing first?",
        "What KPI would prove this is worth keeping?",
        "Where are you still losing time manually?",
    ]

    for _ in range(16):
        first_line = random.choice(opener_options)
        lines = [line.format(topic=topic) if '{topic}' in line else line for line in template]
        if lines:
            lines[0] = first_line
        lines.extend([
            "",
            f"Operator move: {random.choice(operator_moves)}",
            random.choice(metric_lines),
            "",
            random.choice(close_questions),
        ])
        candidate = '\n'.join(lines)
        intro_key = extract_intro_key(candidate)
        if recent_intro_keys is not None and intro_key in recent_intro_keys:
            continue
        if recent_intro_keys is not None and intro_key:
            recent_intro_keys.add(intro_key)
        return candidate

    # Fallback if intro keys are heavily saturated.
    return '\n'.join(lines)

def generate_poll_post(posted_log, queued_posts, recent_intro_keys=None):
    """Generate an engagement question, avoiding recent duplicates"""
    prompt_prefixes = [
        "Operator pulse check:",
        "Quick field question for SMB builders:",
        "Would love a candid answer here:",
    ]
    stems = [
        ("Where does AI actually save your team time right now?", ["Inbox triage", "Reporting", "Ops handoffs", "Nowhere yet"]),
        ("What is blocking AI rollout in your company today?", ["No clear owner", "Messy process", "Tool overload", "Trust/compliance"]),
        ("Which finance workflow would you automate next?", ["Expense coding", "Invoice follow-up", "Forecast updates", "Month-end close"]),
        ("How are you deciding what AI tools stay in your stack?", ["Usage data", "Team feedback", "ROI only", "Still experimenting"]),
        ("What is your biggest workflow drag this quarter?", ["Rework", "Approvals", "Context switching", "Manual updates"]),
    ]
    closers = [
        "Short answers are perfect. I am mapping real-world patterns.",
        "Trying to separate hype from operating reality.",
        "This helps prioritize what to build next.",
    ]

    recent_texts = build_recent_texts(posted_log, queued_posts)
    for _ in range(20):
        stem, options = random.choice(stems)
        random.shuffle(options)
        option_line = " / ".join(options[:4])
        candidate = "\n\n".join([
            random.choice(prompt_prefixes),
            stem,
            option_line,
            random.choice(closers)
        ])
        intro_key = extract_intro_key(candidate)
        intro_is_reused = recent_intro_keys is not None and intro_key in recent_intro_keys
        if not intro_is_reused and not is_content_duplicate(candidate, [{'text': t} for t in recent_texts], days=DUPLICATE_LOOKBACK_DAYS):
            if recent_intro_keys is not None and intro_key:
                recent_intro_keys.add(intro_key)
            return {
                'text': candidate,
                'id_suffix': f"poll_{hashlib.md5(candidate.encode()).hexdigest()[:8]}"
            }

    # Last-resort fresh wording
    fallback = "Operator pulse check:\n\nWhat repetitive workflow are you still doing manually every single week?\n\nReply with one line. That answer is usually your next automation ROI win."
    return {'text': fallback, 'id_suffix': 'poll_fallback'}

def generate_reflection_post(posted_log, queued_posts, recent_intro_keys=None):
    """Generate behind-the-scenes reflection content, avoiding duplicates"""
    openings = [
        "End-of-day note from the operator seat:",
        "One pattern from this week:",
        "Quick reflection after reviewing workflow data:",
    ]
    observations = [
        "Teams get ROI fastest when they automate one painful loop, not ten shiny tasks.",
        "The failure mode is not bad tools. It is unclear ownership and no measurement.",
        "Adoption rises when the workflow is simpler after AI, not just different.",
        "Finance visibility improves the moment weekly reporting becomes automatic.",
        "Most wins came from reducing rework, not from generating more output.",
    ]
    frameworks = [
        "Process I keep using: pick one KPI, automate one step, run a 2-week trial, keep only what moves the KPI.",
        "Rule of thumb: if nobody would notice when the tool is off, it is still a demo.",
        "Execution rule: AI suggests, humans approve, systems log everything.",
    ]
    closes = [
        "Curious if this matches what you're seeing.",
        "If you're in this phase, what broke first for you?",
        "What would you cut first in your current workflow?",
    ]

    recent_texts = build_recent_texts(posted_log, queued_posts)
    for _ in range(20):
        candidate = "\n\n".join([
            random.choice(openings),
            random.choice(observations),
            random.choice(frameworks),
            random.choice(closes),
        ])
        intro_key = extract_intro_key(candidate)
        intro_is_reused = recent_intro_keys is not None and intro_key in recent_intro_keys
        if not intro_is_reused and not is_content_duplicate(candidate, [{'text': t} for t in recent_texts], days=DUPLICATE_LOOKBACK_DAYS):
            if recent_intro_keys is not None and intro_key:
                recent_intro_keys.add(intro_key)
            return candidate

    return "End-of-day note: the best AI workflow is the one your team keeps using after the novelty wears off. Measure adoption, not enthusiasm."

def generate_posts_from_trends(trends, state):
    """Generate posts with proper structure, contextual validation, and audit"""
    posts = []
    hn_stories = trends.get('hackernews', [])
    posted_log = state.get('postedLog', [])
    queued_posts = state.get('twitterQueue', [])
    recent_story_keys = build_recent_story_keys(posted_log, queued_posts)
    recent_intro_keys = build_recent_intro_keys(posted_log, queued_posts)
    
    # Morning post - Insight based on first VALID story
    insight_added = False
    for story in hn_stories:
        story_key = make_title_key(story['title'])
        if story_key in recent_story_keys:
            print(f"  ⚠️ Skipping previously used story: {story['title'][:50]}...")
            continue

        # Skip non-business contexts
        if is_non_business_context(story['title']):
            print(f"  ⚠️ Skipping non-business story: {story['title'][:50]}...")
            continue
        
        post_text = generate_insight_post(story, recent_intro_keys, 'morning')
        
        # Check for duplicates in both posted AND queued
        if is_content_duplicate(post_text, posted_log + queued_posts, days=DUPLICATE_LOOKBACK_DAYS):
            print(f"  ⚠️ Skipping duplicate insight: {story['title'][:50]}...")
            continue
        
        post = {
            'id': f"morning_{datetime.now().strftime('%Y-%m-%d')}_{story['title'][:15].replace(' ', '_').replace(':', '')}",
            'text': post_text,
            'scheduled': '09:00',
            'source': 'Generated-Insight',
            'story_title': story['title']
        }
        
        # AUDIT before adding
        is_valid, reason = audit_content(post, story['title'])
        if is_valid:
            posts.append(post)
            insight_added = True
            print(f"  ✅ AUDIT PASSED: {story['title'][:50]}...")
            break
        else:
            print(f"  ❌ AUDIT FAILED: {reason}")
            print(f"     Story: {story['title'][:60]}...")
            continue
    
    if not insight_added:
        print("  ⚠️ No valid insight post generated")
    
    # Afternoon post - Poll/engagement (with deduplication)
    poll = generate_poll_post(posted_log, queued_posts, recent_intro_keys)
    posts.append({
        'id': f"afternoon_{datetime.now().strftime('%Y-%m-%d')}_{poll['id_suffix']}",
        'text': poll['text'],
        'scheduled': '15:00',
        'source': 'Generated-Poll'
    })
    
    # Evening post - Reflection (with deduplication)
    reflection = generate_reflection_post(posted_log, queued_posts, recent_intro_keys)
    posts.append({
        'id': f"evening_{datetime.now().strftime('%Y-%m-%d')}",
        'text': reflection,
        'scheduled': '20:00',
        'source': 'Generated-Reflection'
    })
    
    return posts

def is_content_duplicate(text, posted_log, days=DUPLICATE_LOOKBACK_DAYS):
    """Check for duplicates using hash + fuzzy similarity"""
    normalized = normalize_text(text)
    text_hash = hashlib.md5(normalized[:160].encode()).hexdigest()[:12]
    cutoff = datetime.now() - timedelta(days=days)
    
    for entry in posted_log:
        try:
            existing_text = entry.get('text', '')
            existing_normalized = normalize_text(existing_text)
            existing_hash = hashlib.md5(existing_normalized[:160].encode()).hexdigest()[:12]
            posted_at = entry.get('postedAt') or entry.get('createdAt')
            posted_time = parse_iso_datetime(posted_at)
            # queue and undated entries are considered active duplicates
            in_window = posted_time is None or posted_time > cutoff
            if not in_window:
                continue

            if existing_hash == text_hash:
                return True

            if text_similarity(normalized, existing_normalized) >= SIMILARITY_DUPLICATE_THRESHOLD:
                return True
        except:
            pass
    return False

def update_state(posts):
    """Update state.json with new posts - already audited"""
    if not STATE_FILE.exists():
        state = {'twitterQueue': [], 'postedLog': [], 'postedToday': 0}
    else:
        state = json.loads(STATE_FILE.read_text())

    # Normalize queue keys and daily counters.
    queue = state.get('twitterQueue')
    if queue is None:
        queue = state.get('queuedPosts', [])
    state['twitterQueue'] = queue if isinstance(queue, list) else []
    state.setdefault('todayPosts', [])
    state.setdefault('postedToday', 0)
    state.setdefault('postingStatus', {'status': 'ready'})
    today = datetime.now().strftime('%Y-%m-%d')
    if state.get('date') != today:
        state['date'] = today
        state['todayPosts'] = []
        state['postedToday'] = 0
    
    posted_log = state.get('postedLog', [])
    queued_posts = state.get('twitterQueue', [])
    added = 0
    skipped = 0
    audit_failed = 0
    
    for post in posts:
        # Final duplicate check - check BOTH posted log AND current queue
        all_existing = posted_log + [{'text': q.get('text', ''), 'postedAt': q.get('createdAt')} for q in queued_posts]
        if is_content_duplicate(post['text'], all_existing, days=DUPLICATE_LOOKBACK_DAYS):
            print(f"  ⚠️ Skipping duplicate: {post['text'][:50]}...")
            skipped += 1
            continue
        
        state['twitterQueue'].append({
            'id': post['id'],
            'status': 'queued',
            'text': post['text'],
            'scheduledFor': post['scheduled'],
            'source': post['source'],
            'storyTitle': post.get('story_title'),
            'createdAt': datetime.now().isoformat(),
            'audited': True  # Mark as audited
        })
        added += 1
    
    state['lastRefresh'] = datetime.now().isoformat()
    state['queuedPosts'] = state['twitterQueue']
    
    # Update trending topics with date filter info
    hn_stories = [s for s in posts if s.get('source') == 'Generated-Insight']
    state['trendingTopics'] = [
        f"Fresh content generated (3-day filter active) - {datetime.now().strftime('%Y-%m-%d')}"
    ]
    
    STATE_FILE.write_text(json.dumps(state, indent=2))
    print(f"\n✅ Added {added} posts (skipped {skipped} duplicates, {audit_failed} failed audit)")

def main():
    print("🔄 Content Refresh v2")
    print("-" * 40)
    print("✓ No 'saw this' patterns")
    print("✓ 3-day freshness filter")
    print("✓ SMB-focused angles only")
    print("-" * 40)
    
    start = time.time()
    
    # Load current state for deduplication
    if STATE_FILE.exists():
        state = json.loads(STATE_FILE.read_text())
    else:
        state = {'twitterQueue': [], 'postedLog': []}
    
    trends = check_trends()
    posts = generate_posts_from_trends(trends, state)
    update_state(posts)
    
    elapsed = time.time() - start
    print(f"\n✨ Complete in {elapsed:.1f}s")
    print(f"📊 Fetched {sum(len(v) for v in trends.values())} fresh stories")
    print(f"📝 Generated {len(posts)} quality posts")

def check_trends():
    """Quick trend check"""
    print("📊 Checking trends...")
    cache = load_cache()
    
    print("  Fetching Hacker News...")
    hn_stories = fetch_hn_rss()
    print(f"    ✅ {len(hn_stories)} fresh stories (last 3 days)")
    
    cache['stories'] = {'hackernews': hn_stories}
    cache['last_check'] = datetime.now().isoformat()
    save_cache(cache)
    
    return cache['stories']

if __name__ == "__main__":
    main()
