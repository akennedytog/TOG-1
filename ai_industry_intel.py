#!/usr/bin/env python3
"""
AI Industry Intelligence Monitor
Tracks the entire AI industry for content opportunities
"""

import os
import sys
import json
from datetime import datetime
from typing import List, Dict

sys.path.insert(0, os.path.expanduser('~/.openclaw/workspace/skills/tavily/scripts'))

try:
    from tavily_search import search
    tavily_available = True
except ImportError:
    tavily_available = False

class AIIndustryIntel:
    """Monitor AI industry for content gold"""
    
    # Key companies, trends, topics to track
    AI_LANDSCAPE = {
        'frontier_models': ['OpenAI', 'Anthropic', 'Google', 'Meta', 'xAI', 'Mistral'],
        'infrastructure': ['NVIDIA', 'CoreWeave', 'Lambda Labs', 'Together AI', 'Fireworks AI'],
        'enterprise_ai': ['Microsoft', 'Salesforce', 'ServiceNow', 'Workday', 'SAP'],
        'key_trends': [
            'AI agents', 'agentic workflows', 'AI coding', 'multimodal AI',
            'RAG', 'LLM costs', 'AI pricing', 'AI regulation',
            'enterprise AI adoption', 'AI ROI', 'AI implementation'
        ],
        'money_signals': [
            'funding', 'IPO', 'acquisition', 'valuation', 'raise',
            'Series A', 'Series B', 'venture capital'
        ]
    }

    # Cutting-edge AI sources (ahead of the curve, not just mainstream tech press)
    CUTTING_EDGE_DOMAINS = [
        # Frontier lab blogs / announcements (first to publish)
        'openai.com', 'anthropic.com', 'deepmind.google', 'ai.googleblog.com',
        'research.google', 'ai.meta.com', 'x.ai', 'mistral.ai', 'huggingface.co',
        # AI-native publications (fast, technical, ahead of curve)
        'theinformation.com', 'semiengineering.com', 'syncedreview.com',
        'venturebeat.com', 'techcrunch.com', 'theverge.com', 'arstechnica.com',
        'wired.com', 'zdnet.com', 'forbes.com', 'bloomberg.com', 'reuters.com',
        # Research / technical
        'arxiv.org', 'github.blog', 'simonwillison.net', 'lilianweng.github.io',
        'sebastianraschka.com', 'latent.space', 'interconnects.ai',
        # AI newsletters / analysis
        'therundown.ai', 'bensbites.co', 'tlrd.ai', 'importai.substack.com',
        'aibreakfast.com', 'lastweekin.ai',
    ]

    # Mainstream sources to blend in (broader reach, still credible)
    MAINSTREAM_DOMAINS = [
        'techcrunch.com', 'theverge.com', 'venturebeat.com', 'arstechnica.com',
        'wired.com', 'zdnet.com', 'forbes.com', 'bloomberg.com', 'reuters.com',
        'cnbc.com', 'ft.com', 'wsj.com', 'nytimes.com', 'theguardian.com',
    ]
    
    def __init__(self):
        self.api_key = os.getenv('TAVILY_API_KEY')
        self.credits_used = 0
        self.cache = {}
    
    def get_daily_industry_pulse(self) -> Dict:
        """Get the AI industry's pulse for today"""
        if not tavily_available or not self.api_key:
            return {"error": "Tavily not configured"}
        
        intel = {
            "timestamp": datetime.now().isoformat(),
            "breaking": [],
            "funding_news": [],
            "product_launches": [],
            "trending_topics": [],
            "content_opportunities": []
        }
        
        # Query 1: Breaking AI news (cutting-edge sources first)
        result = search(
            "AI artificial intelligence breaking news today",
            api_key=self.api_key, max_results=5,
            topic="news",
            search_depth="advanced",
            include_domains=self.CUTTING_EDGE_DOMAINS
        )
        self.credits_used += 1
        
        if result.get("success"):
            for item in result["results"]:
                if not self._is_quality_source(item.get("url", "")):
                    continue
                intel["breaking"].append({
                    "title": item["title"],
                    "url": item["url"],
                    "content": item["content"][:200],
                    "score": item.get("score", 0)
                })
        
        # Query 2: Funding/valuation news (mainstream + cutting edge)
        result = search(
            "AI startup funding round raised this week million",
            api_key=self.api_key, max_results=5,
            topic="news",
            search_depth="advanced",
            include_domains=self.MAINSTREAM_DOMAINS
        )
        self.credits_used += 1
        
        if result.get("success"):
            for item in result["results"]:
                if not self._is_quality_source(item.get("url", "")):
                    continue
                intel["funding_news"].append({
                    "title": item["title"],
                    "url": item["url"],
                    "content": item["content"][:200]
                })
        
        # Query 3: Enterprise AI adoption trends (mainstream + cutting edge)
        result = search(
            "enterprise AI adoption ROI implementation SMB 2026",
            api_key=self.api_key, max_results=5,
            topic="news",
            include_domains=self.MAINSTREAM_DOMAINS
        )
        self.credits_used += 1
        
        if result.get("success"):
            for item in result["results"]:
                if not self._is_quality_source(item.get("url", "")):
                    continue
                intel["trending_topics"].append({
                    "title": item["title"],
                    "url": item["url"],
                    "content": item["content"][:200]
                })
        
        # Generate content opportunities
        intel["content_opportunities"] = self._extract_content_angles(intel)
        
        return intel
    
    def _is_quality_source(self, url: str) -> bool:
        """Reject press-release/promotional/low-quality sources."""
        if not url:
            return False
        url_lower = url.lower()
        # Reject press-release wire services and penny-stock promo sites
        bad_domains = [
            'globenewswire', 'businesswire', 'prnewswire', 'prweb', 'ainewswire',
            'accesswire', 'newswire', 'stocktitan', 'investing.com', 'benzinga',
            'manilatimes', 'streetinsider', 'fool.com', 'seekingalpha',
            'yahoo.com', 'marketwatch', 'nasdaq.com', 'otcmarkets',
        ]
        for d in bad_domains:
            if d in url_lower:
                return False
        # Reject obvious press-release URL patterns
        if '/press-release' in url_lower or '/globenewswire' in url_lower or '/newswire' in url_lower:
            return False
        # Reject listing/archive/index pages (not real articles)
        bad_paths = [
            '/list/', '/recent', '/abs/', '/search', '/index', '/archive',
            '/category/', '/tag/', '/topic/', '/page', '/latest', '/news',
        ]
        for p in bad_paths:
            if p in url_lower:
                return False
        return True
    
    def _extract_content_angles(self, intel: Dict) -> List[Dict]:
        """Extract tweet-worthy content angles from intel"""
        opportunities = []
        
        # Pattern matching for content gold
        for item in intel.get("breaking", []):
            title_lower = item["title"].lower()
            content_lower = item["content"].lower()
            
            # Funding angle
            if any(word in title_lower for word in ['funding', 'raised', 'million', 'billion']):
                opportunities.append({
                    "type": "funding_insight",
                    "angle": f"{item['title'][:60]}...",
                    "tweet_idea": "Another [X]M AI raise. The pattern: infrastructure beats applications. Who's building the picks and shovels?",
                    "source": item["url"]
                })
            
            # Product launch angle
            if any(word in title_lower for word in ['launch', 'release', 'announced', 'new']):
                opportunities.append({
                    "type": "product_reaction",
                    "angle": item["title"][:60],
                    "tweet_idea": "New AI tool drops. Three questions before you care: 1) What manual task dies? 2) What's the switching cost? 3) Will my team use it?",
                    "source": item["url"]
                })
            
            # Regulation/policy angle
            if any(word in title_lower for word in ['regulation', 'policy', 'law', 'government']):
                opportunities.append({
                    "type": "regulation_take",
                    "angle": item["title"][:60],
                    "tweet_idea": "AI regulation update: The winners will be the ones who built compliance in from day one, not the ones scrambling to catch up.",
                    "source": item["url"]
                })
        
        # SMB-specific angles
        opportunities.append({
            "type": "evergreen",
            "angle": "AI adoption reality check",
            "tweet_idea": "The SMBs winning with AI aren't the ones with the fanciest tools. They're the ones who picked ONE repetitive task and automated 80% of it.",
            "source": "evergreen"
        })
        
        return opportunities[:5]  # Top 5 opportunities
    
    def get_competitor_intel(self, competitor_name: str) -> Dict:
        """Get intelligence on a specific competitor"""
        if not tavily_available or not self.api_key:
            return {"error": "Tavily not configured"}
        
        result = search(
            f"{competitor_name} AI features pricing news 2026",
            api_key=self.api_key, max_results=5,
            topic="news"
        )
        self.credits_used += 1
        
        return {
            "competitor": competitor_name,
            "findings": result.get("results", []) if result.get("success") else [],
            "credits_used": self.credits_used
        }


if __name__ == "__main__":
    print("🤖 AI Industry Intelligence")
    print("=" * 60)
    
    intel = AIIndustryIntel()
    pulse = intel.get_daily_industry_pulse()
    
    print(f"\n📊 Daily Pulse ({pulse.get('timestamp', 'now')})")
    print(f"   Breaking news: {len(pulse.get('breaking', []))}")
    print(f"   Funding updates: {len(pulse.get('funding_news', []))}")
    print(f"   Trending topics: {len(pulse.get('trending_topics', []))}")
    print(f"   Credits used: {intel.credits_used}")
    
    print("\n🎯 Content Opportunities:")
    for opp in pulse.get("content_opportunities", []):
        print(f"\n   [{opp['type'].upper()}]")
        print(f"   Angle: {opp['angle']}")
        print(f"   💡 Tweet: {opp['tweet_idea'][:80]}...")
    
    # Save to file
    output = f"ai_industry_pulse_{datetime.now().strftime('%Y%m%d')}.json"
    with open(output, 'w') as f:
        json.dump(pulse, f, indent=2)
    
    print(f"\n✓ Saved to: {output}")
