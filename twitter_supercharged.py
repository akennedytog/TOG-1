#!/usr/bin/env python3
"""
Twitter/X Supercharged Automation
AI-driven content with web intelligence, optimal timing, engagement optimization
"""

import os
import sys
import json
import random
import re
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from pathlib import Path

# Import our intelligence modules
sys.path.insert(0, os.path.expanduser('~/.openclaw/workspace'))
from ai_industry_intel import AIIndustryIntel

class TwitterSupercharged:
    """AI-powered Twitter content engine"""
    
    def __init__(self):
        self.state_file = Path('~/.openclaw/workspace/state.json').expanduser()
        self.intel = AIIndustryIntel()
        
        # Content templates optimized for engagement
        self.TEMPLATES = {
            'insight_hook': [
                "The {topic} reality most won't admit:\n\n{insight}\n\nThe pattern: {pattern}\n\nYour move?",
                "What {topic} actually means for {audience}:\n\n{insight}\n\nMost get this wrong.",
                "Stop me if you've heard this one:\n\n{insight}\n\nHere's why it matters: {pattern}"
            ],
            'contrarian_take': [
                "Unpopular opinion: {hot_take}\n\nBefore you disagree, consider:\n{points}\n\nStill disagree? Tell me why.",
                "Everyone's focused on {trend}.\n\nBut the real opportunity is in {counter_trend}.\n\nHere's why:"
            ],
            'framework': [
                "Decision framework for {topic}:\n\n1. {step1}\n2. {step2}\n3. {step3}\n\nSkip any step and you're guessing.",
                "The {topic} playbook:\n\n✓ {win}\n✗ {fail}\n⚡ {edge}\n\nWhich bucket are you in?"
            ],
            'story': [
                "Behind the scenes:\n\n{setup}\n\nThe twist: {twist}\n\nThe lesson: {lesson}",
                "True story:\n\n{story}\n\nThe takeaway: {takeaway}"
            ]
        }
    
    def generate_daily_content(self) -> List[Dict]:
        """Generate a day's worth of AI-powered content"""
        posts = []
        
        # Get fresh industry intelligence
        print("🔍 Gathering AI industry intelligence...")
        pulse = self.intel.get_daily_industry_pulse()
        
        # Load posted history for dedup
        posted_log = self._load_posted_log()
        
        # --- 4 posts per day: 09:00, 11:00, 13:00, 20:00 ---
        
        # 1. Morning post (09:00): Breaking news + insight
        if pulse.get("breaking"):
            top_story = pulse["breaking"][0]
            content = self._craft_news_insight(top_story)
            if not self._is_duplicate(content, top_story.get("url", ""), posted_log):
                posts.append({
                    "time": "09:00",
                    "type": "insight",
                    "content": content,
                    "source": top_story["url"],
                    "engagement_tactic": "question_hook"
                })
        
        # 2. Late-morning post (11:00): Funding news reaction
        if pulse.get("funding_news"):
            funding = pulse["funding_news"][0]
            content = self._craft_funding_reaction(funding)
            if not self._is_duplicate(content, funding.get("url", ""), posted_log):
                posts.append({
                    "time": "11:00",
                    "type": "funding_reaction",
                    "content": content,
                    "source": funding["url"],
                    "engagement_tactic": "pattern_recognition"
                })
        
        # 3. Midday post (13:00): Contrarian take on trending topic
        if pulse.get("trending_topics"):
            trend = pulse["trending_topics"][0]
            content = self._craft_contrarian_take(trend)
            if not self._is_duplicate(content, trend.get("url", ""), posted_log):
                posts.append({
                    "time": "13:00",
                    "type": "contrarian",
                    "content": content,
                    "source": trend["url"],
                    "engagement_tactic": "polarizing_question"
                })
        
        # 4. Evening post (20:00): Framework/practical advice
        framework_content = self._craft_framework_post()
        if not self._is_duplicate(framework_content, "evergreen", posted_log):
            posts.append({
                "time": "20:00",
                "type": "framework",
                "content": framework_content,
                "source": "evergreen",
                "engagement_tactic": "self_identification"
            })
        
        # If any slot was deduped and we have fewer than 4, backfill with a second
        # story from the same category so we always hit 4 posts/day.
        if len(posts) < 4:
            posts = self._backfill_to_four(posts, pulse, posted_log)
        
        return posts
    
    def _backfill_to_four(self, posts: List[Dict], pulse: Dict, posted_log: List[Dict]) -> List[Dict]:
        """Backfill any deduped slots so we always produce 4 posts/day."""
        used_times = {p["time"] for p in posts}
        used_urls = {p.get("source", "") for p in posts}
        
        # Try to fill missing slots from remaining breaking/trending/funding stories
        candidates = []
        for story in pulse.get("breaking", [])[1:]:
            candidates.append(("09:00", "insight", self._craft_news_insight(story), story.get("url", "")))
        for story in pulse.get("trending_topics", [])[1:]:
            candidates.append(("13:00", "contrarian", self._craft_contrarian_take(story), story.get("url", "")))
        for story in pulse.get("funding_news", [])[1:]:
            candidates.append(("11:00", "funding_reaction", self._craft_funding_reaction(story), story.get("url", "")))
        
        for time_slot, ptype, content, url in candidates:
            if len(posts) >= 4:
                break
            if time_slot in used_times:
                continue
            if url in used_urls:
                continue
            if self._is_duplicate(content, url, posted_log):
                continue
            posts.append({
                "time": time_slot,
                "type": ptype,
                "content": content,
                "source": url,
                "engagement_tactic": "question_hook" if ptype == "insight" else ("pattern_recognition" if ptype == "funding_reaction" else "polarizing_question")
            })
            used_times.add(time_slot)
            used_urls.add(url)
        
        # If still short (e.g. all news deduped), add a second evergreen framework post
        if len(posts) < 4:
            evergreen_templates = [
                "The 3-question AI readiness test for your business:\n\n1. Do you repeat this task weekly?\n2. Does it follow a clear set of rules?\n3. Would automating it save you 2+ hours?\n\nAnswer yes to all three? That's your first automation.",
                "Most SMBs don't need a $50k AI overhaul.\n\nThey need ONE repetitive task automated this week.\n\nWhat's the single task eating 5+ hours of your week?",
                "The AI adoption trap:\n\nBuying 5 tools and using none consistently.\n\nThe fix: pick ONE task, automate it, measure the hours saved. Repeat.\n\nConsistency beats tool count every time.",
            ]
            for tpl in evergreen_templates:
                if len(posts) >= 4:
                    break
                if self._is_duplicate(tpl, "evergreen", posted_log):
                    continue
                posts.append({
                    "time": "20:00" if "20:00" not in used_times else "13:00",
                    "type": "framework",
                    "content": tpl,
                    "source": "evergreen",
                    "engagement_tactic": "self_identification"
                })
                used_times.add(posts[-1]["time"])
        
        # Sort by time for a clean daily schedule
        posts.sort(key=lambda p: p["time"])
        return posts
    
    def _load_posted_log(self) -> List[Dict]:
        """Load posted history from state.json for dedup"""
        if self.state_file.exists():
            try:
                with open(self.state_file) as f:
                    state = json.load(f)
                return state.get("postedLog", [])
            except Exception:
                return []
        return []
    
    def _is_duplicate(self, content: str, url: str, posted_log: List[Dict]) -> bool:
        """Robust dedup: URL match, content hash, or intro-key match against posted history."""
        import hashlib
        from difflib import SequenceMatcher
        
        def normalize(t):
            t = (t or '').lower()
            t = re.sub(r'https?://\S+', '', t)
            t = re.sub(r'[^a-z0-9\s]', ' ', t)
            t = re.sub(r'\s+', ' ', t).strip()
            return t
        
        def intro_key(t):
            lines = [l.strip() for l in (t or '').splitlines() if l.strip()]
            if not lines:
                return ''
            return ' '.join(normalize(lines[0]).split()[:8])
        
        norm = normalize(content)
        content_hash = hashlib.md5(norm[:160].encode()).hexdigest()[:16]
        ik = intro_key(content)
        
        for entry in posted_log:
            existing_text = entry.get('text', '') or entry.get('content', '')
            existing_url = entry.get('url', '') or entry.get('source', '')
            
            # 1. URL match (strongest signal)
            if url and existing_url and url.strip().rstrip('/') == existing_url.strip().rstrip('/'):
                return True
            
            existing_norm = normalize(existing_text)
            if not existing_norm:
                continue
            
            # 2. Content hash match
            existing_hash = hashlib.md5(existing_norm[:160].encode()).hexdigest()[:16]
            if existing_hash == content_hash:
                return True
            
            # 3. Intro-key match (same opening line = same topic)
            existing_ik = intro_key(existing_text)
            if ik and existing_ik and ik == existing_ik:
                return True
            
            # 4. High similarity
            if SequenceMatcher(None, norm, existing_norm).ratio() >= 0.84:
                return True
        
        return False
    
    def _clean_content(self, text: str, max_len: int = 140) -> str:
        """Strip junk/promo fragments from intel content and truncate cleanly."""
        if not text:
            return ""
        # Known junk/promo fragments to strip
        junk_markers = [
            'AINW is where breaking news', 'To receive SMS', 'text \"AI\" to',
            'Importance for marketers', 'Sign up for', 'Subscribe to', 'Newsletter',
            'Click here to', 'Read more at', 'For more information', 'Press release',
            'GlobeNewswire', 'Business Wire', 'PR Newswire', 'AINewsWire',
            'Also available in', '@Kassy', 'News\n', '\nNews', 'Home\n', 'Menu',
        ]
        cleaned = text
        for m in junk_markers:
            idx = cleaned.find(m)
            if idx != -1:
                cleaned = cleaned[:idx].rstrip()
        # Collapse repeated site-name fragments (e.g. 'Amnesty InternationalAmnesty International')
        import re as _re
        cleaned = _re.sub(r'\b([A-Z][A-Za-z ]{2,30}?)\1\b', r'\1', cleaned)
        cleaned = cleaned.strip()
        if len(cleaned) > max_len:
            cut = cleaned[:max_len]
            # Try to end at a sentence boundary
            for sep in ['. ', '! ', '? ']:
                idx = cut.rfind(sep)
                if idx > max_len * 0.5:
                    cut = cut[:idx + 1]
                    break
            cleaned = cut.rstrip()
        return cleaned.strip()
    
    def _craft_news_insight(self, story: Dict) -> str:
        """Turn breaking news into an educational insight post with source link"""
        title = story["title"]
        url = story.get("url", "")
        content = self._clean_content(story.get("content", ""), 140)
        
        # Extract the company/topic
        companies = ['Anthropic', 'OpenAI', 'Google', 'Meta', 'Microsoft', 'xAI', 'Nvidia', 'Amazon', 'Apple']
        mentioned = [c for c in companies if c.lower() in title.lower()]
        company = mentioned[0] if mentioned else "AI"
        
        # Educational format: What happened / Why it matters / Takeaway
        body = (
            f"What just happened: {title}\n\n"
            f"Why it matters: {content}\n\n"
            f"The takeaway for SMBs: {company} moves shape the AI tools you'll be using in 6-12 months. "
            f"Staying current is how you spot the opportunity before competitors do.\n\n"
            f"{url}"
        )
        return body
    
    def _craft_contrarian_take(self, trend: Dict) -> str:
        """Create an educational contrarian take on a trending topic with source link"""
        title = trend["title"]
        url = trend.get("url", "")
        content = self._clean_content(trend.get("content", ""), 140)
        
        body = (
            f"The AI story everyone's watching: {title}\n\n"
            f"What's actually happening: {content}\n\n"
            f"The contrarian take: the tools getting all the hype aren't the ones creating value. "
            f"Fancy features ≠ adoption. Cool demos ≠ ROI.\n\n"
            f"{url}"
        )
        return body
    
    def _craft_framework_post(self) -> str:
        """Create a practical educational framework post"""
        template = random.choice(self.TEMPLATES['framework'])
        
        return template.format(
            topic="AI tool evaluation",
            step1="Map the manual process (be specific)",
            step2="Automate 80%, keep the edge cases human",
            step3="Measure adoption, not enthusiasm",
            win="Picked one tool and used it for 30 days",
            fail="Bought five tools and used none consistently",
            edge="Someone owns the outcome, not just the tool"
        )
    
    def _craft_funding_reaction(self, funding: Dict) -> str:
        """React to funding news with an educational pattern + source link"""
        title = funding["title"]
        url = funding.get("url", "")
        
        # Extract amount if present
        import re
        amount_match = re.search(r'(\d+)[\s]*([MB]illion)', title)
        amount = amount_match.group(0) if amount_match else "Another major"
        
        return (
            f"What just happened: {amount} AI raise announced.\n\n"
            f"Why it matters: {title}\n\n"
            f"The pattern I'm seeing: Infrastructure > Applications. "
            f"Pick-and-shovel plays > gold rush bets. Boring automation > fancy demos.\n\n"
            f"Where are you seeing ROI?\n\n"
            f"{url}"
        )
    
    def get_optimal_posting_times(self) -> Dict:
        """Get optimal posting times based on engagement patterns"""
        return {
            "morning": "09:00",      # Tech workers checking Twitter
            "midday": "13:00",       # Lunch scroll
            "afternoon": "15:30",    # Post-lunch slump
            "evening": "20:00"       # Evening wind-down
        }
    
    def analyze_engagement_patterns(self, history_file: str = None) -> Dict:
        """Analyze past posts for engagement patterns"""
        # Load state.json for historical data
        if self.state_file.exists():
            with open(self.state_file) as f:
                state = json.load(f)
            
            posted = state.get("postedLog", [])
            
            if len(posted) > 10:
                return {
                    "total_posts": len(posted),
                    "analysis": "Historical data available for pattern analysis",
                    "recommendation": "Track engagement metrics to optimize future posts"
                }
        
        return {
            "status": "Need more data",
            "recommendation": "Post consistently for 2 weeks, then analyze patterns"
        }


if __name__ == "__main__":
    print("🚀 Twitter/X Supercharged")
    print("=" * 60)
    
    engine = TwitterSupercharged()
    
    # Generate today's content
    posts = engine.generate_daily_content()
    
    print(f"\n📅 Daily Content Schedule:")
    print("-" * 60)
    
    for i, post in enumerate(posts, 1):
        print(f"\n{i}. 🕐 {post['time']} | Type: {post['type']}")
        print(f"   Tactic: {post['engagement_tactic']}")
        print(f"   Source: {post['source'][:40]}...")
        print(f"\n   Content:")
        print(f"   {post['content'][:200]}...")
        print(f"   [{len(post['content'])} chars]")
    
    print(f"\n💰 Credits used: {engine.intel.credits_used}")
    print(f"📊 Optimal posting: {engine.get_optimal_posting_times()}")
    
    # Save content plan
    plan = {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "posts": posts,
        "credits_used": engine.intel.credits_used,
        "generated_at": datetime.now().isoformat()
    }
    
    output = f"twitter_content_plan_{datetime.now().strftime('%Y%m%d')}.json"
    with open(output, 'w') as f:
        json.dump(plan, f, indent=2)
    
    print(f"\n✓ Content plan saved: {output}")
