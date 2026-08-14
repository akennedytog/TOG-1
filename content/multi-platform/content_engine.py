#!/usr/bin/env python3
"""
The One Group - Multi-Platform Content Engine
Single input → 5 platform outputs
"""

import json
import os
import re
from datetime import datetime
from pathlib import Path
from typing import Dict, List
from dataclasses import dataclass

@dataclass
class ContentPiece:
    platform: str
    format: str
    content: str
    hashtags: List[str]
    character_count: int
    scheduled_time: str
    
class MultiPlatformEngine:
    """Generate content for multiple platforms from single source"""
    
    PLATFORM_LIMITS = {
        "twitter": 280,
        "linkedin": 3000,
        "reddit": 40000,
        "newsletter": 10000,
        "youtube_shorts": 100  # script words
    }
    
    PLATFORM_TONES = {
        "twitter": "snappy, punchy, thread-friendly",
        "linkedin": "professional, story-driven, authoritative",
        "reddit": "helpful, community-focused, authentic",
        "newsletter": "educational, actionable, comprehensive",
        "youtube_shorts": "energetic, hook-driven, visual"
    }
    
    def __init__(self):
        self.workspace = Path(os.path.expanduser("~/.openclaw/workspace"))
        self.output_dir = self.workspace / "content" / "generated"
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Load templates
        self.templates = self._load_templates()
        
    def _load_templates(self) -> Dict:
        """Load content templates by category"""
        templates = {
            "finance_ai": {
                "twitter": "💰 {hook}\n\n{insight}\n\n{cta}\n\n{hashtags}",
                "linkedin": "{hook}\n\n{context}\n\n{insight}\n\n{example}\n\n{cta}",
                "reddit": "[{hook}]({insight})\n\nI've been working with SMBs and here's what I've learned:\n\n{key_points}\n\n{question}",
                "newsletter": "# {headline}\n\n{lead}\n\n## The Problem\n{problem}\n\n## The Solution\n{solution}\n\n## Real Results\n{results}\n\n{cta}",
                "youtube_shorts": "[Hook: {hook}] [Problem: {problem}] [Solution: {solution}] [CTA: {cta}]"
            },
            "compliance": {
                "twitter": "🔒 {hook}\n\n{insight}\n\n{checklist}",
                "linkedin": "Compliance doesn't have to be scary.\n\n{insight}\n\nHere's what {industry} needs to know:\n\n{points}\n\n{cta}",
                "reddit": "PSA: {hook}\n\n{detail}\n\n{tldr}",
                "newsletter": "# Compliance Corner: {topic}\n\n{Risk}\n{risk_detail}\n\n## What You Need\n{requirements}\n\n## How AI Helps\n{ai_solution}",
                "youtube_shorts": "[Warning tone: {hook}] [Industry: {industry}] [Risk: {risk}] [Solution: {solution}]"
            },
            "automation": {
                "twitter": "⚡ {hook}\n\n{stat}\n\n{how}\n\n{hashtags}",
                "linkedin": "Before/after: {scenario}\n\nBefore: {before}\n\nAfter: {after}\n\nHow: {method}\n\nResult: {outcome}",
                "reddit": "I automated {task} for my business. Here's how:\n\n{steps}\n\n{results}",
                "newsletter": "# The Automation Playbook: {topic}\n\n{intro}\n\n## Manual Process\n{manual}\n\n## Automated Solution\n{automated}\n\n## ROI\n{roi}",
                "youtube_shorts": "[Before state] [Pain point] [Solution reveal] [Result]"
            }
        }
        return templates
    
    def categorize_topic(self, topic: str) -> str:
        """Categorize topic for template selection"""
        topic_lower = topic.lower()
        
        finance_keywords = ['finance', 'money', 'cash', 'invoice', 'bookkeeping', 'accounting', 'tax']
        compliance_keywords = ['compliance', 'hipaa', 'gdpr', 'security', 'regulated', 'law', 'medical']
        automation_keywords = ['automation', 'workflow', 'efficiency', 'time', 'manual', 'process']
        
        if any(k in topic_lower for k in finance_keywords):
            return "finance_ai"
        if any(k in topic_lower for k in compliance_keywords):
            return "compliance"
        if any(k in topic_lower for k in automation_keywords):
            return "automation"
            
        return "automation"  # default
    
    def generate(self, topic: str, source_data: Dict = None) -> Dict[str, ContentPiece]:
        """Generate content for all platforms"""
        category = self.categorize_topic(topic)
        templates = self.templates.get(category, self.templates["automation"])
        
        # Build context from source data
        context = self._build_context(topic, source_data)
        
        results = {}
        for platform in ["twitter", "linkedin", "reddit", "newsletter", "youtube_shorts"]:
            template = templates.get(platform, templates["twitter"])
            content = self._fill_template(template, context, platform)
            
            results[platform] = ContentPiece(
                platform=platform,
                format=self._determine_format(platform, content),
                content=content,
                hashtags=self._extract_hashtags(content, platform),
                character_count=len(content),
                scheduled_time=self._schedule_time(platform)
            )
        
        return results
    
    def _build_context(self, topic: str, source_data: Dict) -> Dict:
        """Build context dictionary for template filling"""
        return {
            "topic": topic,
            "headline": f"How AI is Changing {topic}",
            "hook": self._generate_hook(topic),
            "insight": source_data.get("insight", "AI is transforming how businesses operate.") if source_data else "AI is transforming how businesses operate.",
            "stat": source_data.get("stat", "Businesses save 10+ hours/week") if source_data else "Businesses save 10+ hours/week",
            "hashtags": "#AI #SmallBusiness #Automation",
            "cta": "Want to see how? Drop a comment.",
            "industry": source_data.get("industry", "small business") if source_data else "small business",
            "problem": f"Manual {topic} takes too much time",
            "solution": f"AI handles {topic} automatically",
            "risk": "Non-compliance can cost $50K+",
            "tldr": "TL;DR: Use AI, stay compliant, save time."
        }
    
    def _generate_hook(self, topic: str) -> str:
        """Generate attention-grabbing hook"""
        hooks = [
            f"I spent 2 hours on {topic} yesterday.",
            f"Most businesses lose $10K/year to bad {topic}.",
            f"Here's what {topic} looks like with AI:",
            f"Stop doing {topic} manually.",
            f"This changed how I think about {topic}."
        ]
        import random
        return random.choice(hooks)
    
    def _fill_template(self, template: str, context: Dict, platform: str) -> str:
        """Fill template with context, respecting platform limits"""
        content = template
        for key, value in context.items():
            content = content.replace(f"{{{key}}}", str(value))
        
        # Clean up empty placeholders
        content = re.sub(r'\{[^}]+\}', '', content)
        
        # Truncate if needed
        limit = self.PLATFORM_LIMITS.get(platform, 10000)
        if len(content) > limit:
            content = content[:limit-3] + "..."
            
        return content.strip()
    
    def _determine_format(self, platform: str, content: str) -> str:
        """Determine content format"""
        if platform == "twitter" and "\n\n" in content:
            return "thread" if len(content) > 280 else "single"
        if platform == "reddit":
            return "text_post"
        if platform == "youtube_shorts":
            return "video_script"
        return "article"
    
    def _extract_hashtags(self, content: str, platform: str) -> List[str]:
        """Extract or generate hashtags"""
        if platform == "linkedin":
            return ["#AI", "#SmallBusiness", "#Innovation"]
        if platform == "twitter":
            return ["#AI", "#SMB", "#Automation"]
        return []
    
    def _schedule_time(self, platform: str) -> str:
        """Determine optimal posting time"""
        schedules = {
            "twitter": "9:00 AM",
            "linkedin": "8:00 AM",
            "reddit": "12:00 PM",
            "newsletter": "Sunday 9:00 AM",
            "youtube_shorts": "6:00 PM"
        }
        return schedules.get(platform, "9:00 AM")
    
    def save_content_package(self, topic: str, results: Dict[str, ContentPiece]) -> str:
        """Save generated content as a package"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{topic.lower().replace(' ', '_')}_{timestamp}.json"
        filepath = self.output_dir / filename
        
        output = {
            "topic": topic,
            "generated_at": datetime.now().isoformat(),
            "platforms": {}
        }
        
        for platform, piece in results.items():
            output["platforms"][platform] = {
                "content": piece.content,
                "format": piece.format,
                "character_count": piece.character_count,
                "scheduled_time": piece.scheduled_time
            }
        
        with open(filepath, 'w') as f:
            json.dump(output, f, indent=2)
            
        return str(filepath)

if __name__ == "__main__":
    import sys
    
    engine = MultiPlatformEngine()
    
    if len(sys.argv) > 1:
        topic = " ".join(sys.argv[1:])
    else:
        topic = "AI bookkeeping for small businesses"
    
    print(f"Generating content for: {topic}\n")
    results = engine.generate(topic)
    
    for platform, piece in results.items():
        print(f"\n{'='*60}")
        print(f"PLATFORM: {platform.upper()}")
        print(f"FORMAT: {piece.format}")
        print(f"CHARACTERS: {piece.character_count}")
        print(f"SCHEDULED: {piece.scheduled_time}")
        print(f"{'-'*60}")
        print(piece.content)
    
    # Save the package
    filepath = engine.save_content_package(topic, results)
    print(f"\n\nSaved to: {filepath}")
