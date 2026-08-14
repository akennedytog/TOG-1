#!/usr/bin/env python3
"""
Scout Web Intelligence Module
Adds web search capabilities to Scout CRM for company research and news monitoring
"""

import os
import json
import sys
from datetime import datetime
from typing import List, Dict, Optional

# Add Tavily skill to path
sys.path.insert(0, os.path.expanduser('~/.openclaw/workspace/skills/tavily/scripts'))

try:
    from tavily_search import search
    tavily_available = True
except ImportError:
    tavily_available = False
    print("⚠️  Tavily not available")

class ScoutWebIntelligence:
    """Web search intelligence for Scout CRM"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv('TAVILY_API_KEY')
        self.credits_used = 0
    
    def research_company(self, company_name: str, industry: Optional[str] = None) -> Dict:
        """Research a company — latest news, funding, key developments"""
        if not tavily_available or not self.api_key:
            return {"error": "Tavily not configured"}
        
        queries = [
            f"{company_name} news",
            f"{company_name} funding raised",
            f"{company_name} recent developments"
        ]
        
        if industry:
            queries.append(f"{company_name} {industry} trends")
        
        all_results = []
        for query in queries[:2]:  # Limit to 2 queries to save credits
            result = search(query, api_key=self.api_key, max_results=3, topic="news")
            if result.get("success"):
                all_results.extend(result.get("results", []))
                self.credits_used += 1
        
        # Deduplicate by URL
        seen_urls = set()
        unique_results = []
        for r in all_results:
            if r['url'] not in seen_urls:
                seen_urls.add(r['url'])
                unique_results.append(r)
        
        # Generate summary
        summary = self._generate_company_summary(company_name, unique_results)
        
        return {
            "company": company_name,
            "results_found": len(unique_results),
            "summary": summary,
            "top_stories": unique_results[:5],
            "credits_used": self.credits_used,
            "timestamp": datetime.now().isoformat()
        }
    
    def monitor_deal_intelligence(self, deal_name: str, company_name: str, 
                                   stage: str = "qualification") -> Dict:
        """Get intelligence relevant to an active deal"""
        if not tavily_available or not self.api_key:
            return {"error": "Tavily not configured"}
        
        # Customize search based on deal stage
        if stage in ['proposal', 'negotiation']:
            query = f"{company_name} recent news funding announcements"
        else:
            query = f"{company_name} industry trends competitors"
        
        result = search(query, api_key=self.api_key, max_results=5, topic="news")
        self.credits_used += 1
        
        if not result.get("success"):
            return {"error": "Search failed", "details": result}
        
        stories = result.get("results", [])
        
        # Identify key intelligence
        intel = self._extract_intelligence(deal_name, company_name, stories)
        
        return {
            "deal": deal_name,
            "company": company_name,
            "stage": stage,
            "intelligence": intel,
            "top_stories": stories[:3],
            "credits_used": self.credits_used,
            "timestamp": datetime.now().isoformat()
        }
    
    def get_market_intel(self, industry: str, competitors: List[str] = None) -> Dict:
        """Get market-level intelligence for an industry"""
        if not tavily_available or not self.api_key:
            return {"error": "Tavily not configured"}
        
        queries = [
            f"{industry} industry news 2026",
            f"{industry} market trends"
        ]
        
        if competitors and len(competitors) > 0:
            queries.append(f"{' '.join(competitors[:3])} comparison")
        
        all_results = []
        for query in queries[:2]:
            result = search(query, api_key=self.api_key, max_results=4, topic="news")
            if result.get("success"):
                all_results.extend(result.get("results", []))
                self.credits_used += 1
        
        # Deduplicate
        seen_urls = set()
        unique_results = []
        for r in all_results:
            if r['url'] not in seen_urls:
                seen_urls.add(r['url'])
                unique_results.append(r)
        
        return {
            "industry": industry,
            "results_found": len(unique_results),
            "top_stories": unique_results[:5],
            "credits_used": self.credits_used,
            "timestamp": datetime.now().isoformat()
        }
    
    def _generate_company_summary(self, company: str, results: List[Dict]) -> str:
        """Generate a brief intelligence summary"""
        if not results:
            return f"No recent news found for {company}."
        
        # Extract key themes from titles
        titles = [r['title'] for r in results[:3]]
        themes = []
        
        funding_keywords = ['funding', 'raised', 'investment', 'series', 'valuation']
        product_keywords = ['launch', 'product', 'feature', 'release', 'update']
        partnership_keywords = ['partnership', 'collaboration', 'deal', 'agreement']
        
        for title in titles:
            title_lower = title.lower()
            if any(k in title_lower for k in funding_keywords):
                themes.append("funding activity")
            if any(k in title_lower for k in product_keywords):
                themes.append("product developments")
            if any(k in title_lower for k in partnership_keywords):
                themes.append("partnerships")
        
        if themes:
            return f"{company} showing {', '.join(set(themes))}. See top stories below."
        return f"{company} has {len(results)} recent mentions."
    
    def _extract_intelligence(self, deal: str, company: str, stories: List[Dict]) -> List[Dict]:
        """Extract actionable intelligence from stories"""
        intel = []
        
        funding_pattern = ['raised', 'funding', 'million', 'billion', 'series']
        expansion_pattern = ['expansion', 'new office', 'hiring', 'growth']
        risk_pattern = ['layoff', 'downsizing', 'restructuring', 'lawsuit']
        
        for story in stories:
            title = story.get('title', '').lower()
            content = story.get('content', '').lower()
            text = title + ' ' + content
            
            intel_type = None
            priority = 'low'
            
            if any(p in text for p in funding_pattern):
                intel_type = 'funding'
                priority = 'high'
            elif any(p in text for p in expansion_pattern):
                intel_type = 'expansion'
                priority = 'medium'
            elif any(p in text for p in risk_pattern):
                intel_type = 'risk'
                priority = 'high'
            
            if intel_type:
                intel.append({
                    "type": intel_type,
                    "priority": priority,
                    "headline": story['title'],
                    "url": story['url'],
                    "action": self._suggest_action(intel_type, company)
                })
        
        return intel
    
    def _suggest_action(self, intel_type: str, company: str) -> str:
        """Suggest a follow-up action based on intelligence type"""
        actions = {
            'funding': f"Mention {company}'s recent funding in your next conversation",
            'expansion': f"Ask {company} about their growth plans and how you can support",
            'risk': f"Check in with {company} — recent changes may affect timeline"
        }
        return actions.get(intel_type, f"Review latest news about {company}")


# Initialize
web_intel = ScoutWebIntelligence()


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Scout Web Intelligence")
    parser.add_argument("mode", choices=["company", "deal", "market"])
    parser.add_argument("--name", required=True, help="Company or deal name")
    parser.add_argument("--company", help="Company name for deal mode")
    parser.add_argument("--stage", default="qualification", help="Deal stage")
    parser.add_argument("--industry", help="Industry for context")
    
    args = parser.parse_args()
    
    print("🔍 Scout Web Intelligence")
    print("=" * 50)
    
    if args.mode == "company":
        result = web_intel.research_company(args.name, args.industry)
    elif args.mode == "deal":
        result = web_intel.monitor_deal_intelligence(
            args.name, args.company or args.name, args.stage
        )
    elif args.mode == "market":
        result = web_intel.get_market_intel(args.name)
    
    print(json.dumps(result, indent=2))
    
    print(f"\n✓ Credits used: {web_intel.credits_used}")
    print(f"✓ Tavily API: Active")
