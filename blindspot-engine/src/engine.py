"""Blind Spot Engine - Main orchestrator that ties all components together."""

import asyncio
import json
import os
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field, asdict
from datetime import datetime

from src.kg.engine import KnowledgeGraph, DomainMapper, Entity
from src.antiquery.generator import AntiQueryGenerator, AntiQuery
from src.assumptions.detector import AssumptionDetector, Assumption, MentalModel
from src.patterns.matcher import CrossDomainMatcher, PatternMatch

@dataclass
class BlindSpotReport:
    """Complete blind spot analysis report."""
    domain: str
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    knowledge_graph: Optional[Dict] = None
    anti_queries: List[Dict] = field(default_factory=list)
    assumptions: List[Dict] = field(default_factory=list)
    mental_model: Optional[Dict] = None
    cross_domain_matches: List[Dict] = field(default_factory=list)
    summary: str = ""
    top_insights: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict:
        return asdict(self)
    
    def to_markdown(self) -> str:
        lines = [f"# Blind Spot Report: {self.domain}", f"*Generated: {self.timestamp}*\n"]
        
        if self.summary:
            lines.append(f"## Summary\n{self.summary}\n")
        
        if self.top_insights:
            lines.append("## 🔥 Top Insights")
            for i, insight in enumerate(self.top_insights, 1):
                lines.append(f"{i}. {insight}")
            lines.append("")
        
        if self.anti_queries:
            lines.append("## 🤔 Questions You're Not Asking")
            for i, q in enumerate(self.anti_queries[:10], 1):
                lines.append(f"### {i}. {q.get('question', '')}")
                lines.append(f"*Category: {q.get('category', '')} | Surprise: {q.get('surprise_score', 0):.0%}*")
                if q.get('source_gap'):
                    lines.append(f"> {q['source_gap']}")
                lines.append("")
        
        if self.assumptions:
            lines.append("## 🧠 Hidden Assumptions")
            for i, a in enumerate(self.assumptions[:8], 1):
                lines.append(f"### {i}. {a.get('statement', '')}")
                lines.append(f"*Category: {a.get('category', '')} | Confidence: {a.get('confidence', 0):.0%}*")
                if a.get('impact_if_wrong'):
                    lines.append(f"> Impact if wrong: {a['impact_if_wrong']}")
                lines.append("")
        
        if self.cross_domain_matches:
            lines.append("## 🔄 Cross-Domain Patterns")
            for i, m in enumerate(self.cross_domain_matches[:5], 1):
                p = m.get('pattern', {})
                lines.append(f"### {i}. {p.get('name', 'Pattern')} (from {p.get('source_domain', 'unknown')})")
                lines.append(f"**Question:** {m.get('question', '')}")
                lines.append(f"*Confidence: {m.get('confidence', 0):.0%}*")
                lines.append("")
        
        return "\n".join(lines)

class BlindSpotEngine:
    """Main engine that orchestrates blind spot detection."""
    
    def __init__(self, llm_client=None, search_client=None):
        self.llm = llm_client
        self.search = search_client
        self.domain_mapper = DomainMapper(llm_client, search_client)
        self.anti_query_gen = AntiQueryGenerator(llm_client)
        self.assumption_detector = AssumptionDetector(llm_client)
        self.pattern_matcher = CrossDomainMatcher(llm_client)
    
    async def analyze(self, domain_description: str) -> BlindSpotReport:
        """Run full blind spot analysis on a domain."""
        report = BlindSpotReport(domain=domain_description[:100])
        
        # Phase 1: Map the domain
        kg = await self.domain_mapper.map_domain(domain_description)
        report.knowledge_graph = kg.to_dict()
        
        # Phase 2: Detect assumptions
        assumptions = await self.assumption_detector.detect_assumptions(domain_description, kg)
        report.assumptions = [asdict(a) for a in assumptions]
        
        # Phase 3: Reconstruct mental model
        mental_model = self.assumption_detector.reconstruct_mental_model(domain_description, assumptions)
        report.mental_model = asdict(mental_model)
        
        # Phase 4: Generate anti-queries
        anti_queries = await self.anti_query_gen.generate_anti_queries(kg, domain_description)
        report.anti_queries = [asdict(q) for q in anti_queries]
        
        # Phase 5: Cross-domain pattern matching
        matches = await self.pattern_matcher.find_matches(kg, domain_description)
        report.cross_domain_matches = [asdict(m) for m in matches]
        
        # Phase 6: Generate summary and top insights
        report.summary = self._generate_summary(anti_queries, assumptions, matches)
        report.top_insights = self._extract_top_insights(anti_queries, assumptions, matches)
        
        return report
    
    def _generate_summary(self, queries: List[AntiQuery], assumptions: List[Assumption], matches: List[PatternMatch]) -> str:
        """Generate a summary of findings."""
        n_queries = len(queries)
        n_assumptions = len(assumptions)
        n_patterns = len(matches)
        
        top_queries = [q for q in queries[:3]]
        top_assumptions = [a for a in assumptions[:3]]
        
        summary_parts = [
            f"Analysis identified **{n_queries} blind spot questions**, **{n_assumptions} hidden assumptions**, and **{n_patterns} cross-domain patterns**.",
            "",
            "**Most surprising findings:**",
        ]
        
        for q in top_queries:
            summary_parts.append(f"- 🤔 {q.question[:150]}")
        
        for a in top_assumptions:
            summary_parts.append(f"- 🧠 Hidden assumption: {a.statement[:150]}")
        
        return "\n".join(summary_parts)
    
    def _extract_top_insights(self, queries: List[AntiQuery], assumptions: List[Assumption], matches: List[PatternMatch]) -> List[str]:
        """Extract the top insights from all findings."""
        insights = []
        
        # Top anti-queries
        for q in queries[:3]:
            insights.append(f"🤔 {q.question[:200]}")
        
        # Top assumptions
        for a in assumptions[:2]:
            insights.append(f"🧠 You assume: {a.statement[:200]}")
        
        # Top pattern matches
        for m in matches[:2]:
            p = m.pattern
            insights.append(f"🔄 {p.source_domain.title()} pattern: {m.question[:200]}")
        
        return insights[:7]
    
    async def _llm_deep_analysis(self, domain: str, kg, queries, assumptions, matches) -> dict:
        """Use LLM for deep analysis of findings."""
        top_queries = [q.question[:200] for q in queries[:5]]
        top_assumptions = [a.statement[:200] for a in assumptions[:5]]
        top_patterns = [f"{m.pattern.source_domain}: {m.question[:200]}" for m in matches[:5]]
        
        context = f"""Domain: {domain[:300]}

Top blind spot questions identified:
{chr(10).join(f'- {q}' for q in top_queries)}

Hidden assumptions detected:
{chr(10).join(f'- {a}' for a in top_assumptions)}

Cross-domain patterns found:
{chr(10).join(f'- {p}' for p in top_patterns)}

Based on these findings, provide:
1. A concise summary (2-3 sentences) of the biggest blind spots
2. 5-7 actionable insights that would genuinely surprise someone in this domain
3. The single most important question they should be asking right now

Return as JSON: {{"summary": "...", "insights": ["...", "..."], "most_important_question": "..."}}"""

        result = await self.llm(context)
        try:
            import re
            json_match = re.search(r'\{.*\}', result, re.DOTALL)
            if json_match:
                import json as j
                return j.loads(json_match.group())
        except Exception:
            pass
        return {}

    
# Simple LLM client for Ollama
class OllamaClient:
    """Simple async client for Ollama API."""
    
    def __init__(self, model: str = "qwen3-coder:latest", base_url: str = "http://localhost:11434"):
        self.model = model
        self.base_url = base_url
    
    async def __call__(self, prompt: str) -> str:
        import httpx
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {"temperature": 0.8, "num_predict": 2048}
                    }
                )
                if response.status_code == 200:
                    return response.json().get("response", "")
                return ""
        except Exception as e:
            return ""

# Simple search client using Tavily

class TavilyClient:
    """Simple async client for Tavily search."""
    
    def __init__(self, api_key: str = ""):
        self.api_key = api_key or os.environ.get("TAVILY_API_KEY", "")
    
    async def __call__(self, query: str) -> List[Dict]:
        import httpx
        if not self.api_key:
            return []
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.tavily.com/search",
                    json={"api_key": self.api_key, "query": query, "max_results": 5}
                )
                if response.status_code == 200:
                    data = response.json()
                    return data.get("results", [])
                return []
        except Exception:
            return []
