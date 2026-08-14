"""Anti-Query Generator - Produces questions from the negative space of a knowledge graph."""

import json
import re
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field, asdict
from datetime import datetime

@dataclass
class AntiQuery:
    id: str
    question: str
    category: str  # contrarian, cross_domain, historical, assumption, edge_case, second_order
    source_gap: str  # What gap in knowledge this addresses
    surprise_score: float = 0.5  # 0-1, how surprising/novel this is
    relevance_score: float = 0.5  # 0-1, how relevant to the domain
    context: str = ""
    related_entities: List[str] = field(default_factory=list)
    
    @property
    def combined_score(self) -> float:
        """Novelty × relevance with a bias toward novelty."""
        return (self.surprise_score * 0.6 + self.relevance_score * 0.4)

class AntiQueryGenerator:
    """Generates anti-queries from knowledge graph analysis."""
    
    def __init__(self, llm_client=None):
        self.llm = llm_client
        self.cross_domain_patterns = self._load_patterns()
    
    def _load_patterns(self) -> Dict[str, List[str]]:
        """Load cross-domain pattern templates."""
        return {
            "biology": [
                "How does this domain handle {concept} compared to how ecosystems handle {analog}?",
                "What would a predator-prey dynamic look like in this space?",
                "What's the equivalent of symbiosis here?",
                "What would go extinct if {entity} disappeared?",
            ],
            "military": [
                "What's the equivalent of asymmetric warfare in this domain?",
                "Where is the 'high ground' that everyone's ignoring?",
                "What would a flanking maneuver look like?",
                "What's the supply chain vulnerability no one's talking about?",
            ],
            "sports": [
                "What's the 'moneyball' inefficiency in this space?",
                "Where is everyone playing defense when they should be playing offense?",
                "What would a 'two-minute drill' urgency strategy look like?",
                "What's the equivalent of home field advantage?",
            ],
            "finance": [
                "What's being undervalued here?",
                "Where is there an arbitrage opportunity?",
                "What would a hedge fund short in this domain?",
                "What's the long-tail risk everyone's ignoring?",
            ],
            "engineering": [
                "What's the single point of failure?",
                "Where is there over-engineering vs under-engineering?",
                "What would a stress test reveal?",
                "What's the technical debt equivalent here?",
            ],
            "gaming": [
                "What's the 'boss level' everyone's avoiding?",
                "What would a speedrunner exploit in this system?",
                "What's the equivalent of a 'respawn mechanic'?",
                "What would a game theory optimal strategy look like?",
            ],
            "psychology": [
                "What cognitive biases are most dangerous in this domain?",
                "What would a 'nudge' strategy look like?",
                "What's the Dunning-Kruger effect equivalent?",
                "What would confirmation bias cause people to miss?",
            ],
            "evolution": [
                "What's the equivalent of natural selection here?",
                "What traits are being selected for/against?",
                "What would go extinct first in a disruption?",
                "What's the 'punctuated equilibrium' moment approaching?",
            ]
        }
    
    async def generate_anti_queries(self, kg, domain_description: str) -> List[AntiQuery]:
        """Generate anti-queries from a knowledge graph."""
        queries = []
        
        # 1. Generate from graph structure
        queries.extend(self._from_sparse_regions(kg))
        queries.extend(self._from_bridges(kg))
        queries.extend(self._from_periphery(kg))
        
        # 2. Generate from assumption detection
        queries.extend(await self._from_assumptions(kg, domain_description))
        
        # 3. Generate cross-domain patterns
        queries.extend(await self._from_cross_domain(kg, domain_description))
        
        # 4. Generate contrarian queries
        queries.extend(await self._from_contrarian(kg, domain_description))
        
        # 5. Generate second-order effect queries
        queries.extend(await self._from_second_order(kg, domain_description))
        
        # Score and rank
        for q in queries:
            q.surprise_score = self._calculate_surprise(q)
            q.relevance_score = self._calculate_relevance(q, kg)
        
        queries.sort(key=lambda q: q.combined_score, reverse=True)
        return queries[:20]  # Top 20
    
    def _from_sparse_regions(self, kg) -> List[AntiQuery]:
        """Generate queries from sparsely connected nodes."""
        queries = []
        sparse = kg.get_sparse_regions()
        
        for node_id in sparse[:5]:
            entity = kg.entities.get(node_id)
            if not entity:
                continue
            queries.append(AntiQuery(
                id=f"sparse_{node_id}",
                question=f"Why is '{entity.name}' so disconnected from everything else in this domain? Is it irrelevant, overlooked, or a hidden key?",
                category="edge_case",
                source_gap=f"'{entity.name}' has few connections in the knowledge graph",
                related_entities=[node_id]
            ))
        return queries
    
    def _from_bridges(self, kg) -> List[AntiQuery]:
        """Generate queries from bridge connections between clusters."""
        queries = []
        bridges = kg.get_bridges()
        
        for src, tgt in bridges[:5]:
            src_ent = kg.entities.get(src)
            tgt_ent = kg.entities.get(tgt)
            if not src_ent or not tgt_ent:
                continue
            queries.append(AntiQuery(
                id=f"bridge_{src}_{tgt}",
                question=f"'{src_ent.name}' and '{tgt_ent.name}' are the only connection between two clusters. What happens if that connection breaks? What's the alternative path?",
                category="second_order",
                source_gap=f"Bridge connection between '{src_ent.name}' and '{tgt_ent.name}'",
                related_entities=[src, tgt]
            ))
        return queries
    
    def _from_periphery(self, kg) -> List[AntiQuery]:
        """Generate queries from peripheral/low-centrality nodes."""
        queries = []
        peripheral = kg.get_peripheral_nodes(5)
        
        for node_id in peripheral:
            entity = kg.entities.get(node_id)
            if not entity:
                continue
            queries.append(AntiQuery(
                id=f"peripheral_{node_id}",
                question=f"Everyone's focused on the center of this domain. What if '{entity.name}' on the periphery is actually the most important thing? What would change?",
                category="contrarian",
                source_gap=f"'{entity.name}' is peripheral but potentially critical",
                related_entities=[node_id]
            ))
        return queries
    
    async def _from_assumptions(self, kg, domain: str) -> List[AntiQuery]:
        """Generate queries by identifying implicit assumptions."""
        if not self.llm:
            return self._fallback_assumptions(kg)
        
        entities_desc = "\n".join([f"- {e.name} ({e.type}): {e.description}" for e in kg.entities.values()])
        
        prompt = f"""Domain: {domain}

Key entities and relationships:
{entities_desc}

Identify 5 implicit assumptions people in this domain make. These are beliefs that are widely held but rarely questioned.

For each assumption, generate:
1. The assumption itself
2. A question that challenges it
3. What would change if the assumption is wrong

Return as JSON list with: assumption, question, impact_if_wrong"""
        
        result = await self.llm(prompt)
        return self._parse_assumption_queries(result)
    
    def _fallback_assumptions(self, kg) -> List[AntiQuery]:
        """Basic assumption queries without LLM."""
        return [
            AntiQuery(
                id="assumption_default_1",
                question="What's the one thing everyone in this domain agrees on that's probably wrong?",
                category="assumption",
                source_gap="Unquestioned consensus beliefs"
            ),
            AntiQuery(
                id="assumption_default_2",
                question="What would a newcomer from outside this industry find most confusing? That confusion is a blind spot.",
                category="assumption",
                source_gap="Industry-specific assumptions that seem 'obvious' to insiders"
            )
        ]
    
    def _parse_assumption_queries(self, text: str) -> List[AntiQuery]:
        """Parse LLM assumption responses."""
        queries = []
        try:
            json_match = re.search(r'\[.*?\]', text, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group())
                for i, item in enumerate(data):
                    queries.append(AntiQuery(
                        id=f"assumption_{i}",
                        question=item.get('question', item.get('assumption', '')),
                        category="assumption",
                        source_gap=f"Assumption: {item.get('assumption', '')}. Impact if wrong: {item.get('impact_if_wrong', '')}",
                        surprise_score=0.7
                    ))
        except (json.JSONDecodeError, AttributeError):
            pass
        return queries
    
    async def _from_cross_domain(self, kg, domain: str) -> List[AntiQuery]:
        """Generate queries by applying patterns from other domains."""
        queries = []
        
        if not self.llm:
            # Use template-based patterns
            entities = list(kg.entities.values())[:3]
            for domain_name, templates in self.cross_domain_patterns.items():
                for template in templates[:2]:
                    for entity in entities:
                        analog = self._find_analog(entity.type, domain_name)
                        question = template.format(concept=entity.name, entity=entity.name, analog=analog)
                        queries.append(AntiQuery(
                            id=f"cross_{domain_name}_{entity.id}",
                            question=question,
                            category="cross_domain",
                            source_gap=f"Pattern from {domain_name} applied to this domain",
                            related_entities=[entity.id],
                            surprise_score=0.8
                        ))
            return queries
        
        # LLM-based cross-domain analysis
        entities_desc = "\n".join([f"- {e.name} ({e.type})" for e in list(kg.entities.values())[:5]])
        domains = list(self.cross_domain_patterns.keys())
        
        prompt = f"""Domain: {domain}

Key entities:
{entities_desc}

Apply patterns from these domains to find blind spots: {', '.join(domains[:4])}

For each domain, generate 1-2 questions that someone in the original domain would never think to ask.

Return as JSON list with: source_domain, question, why_relevant"""
        
        result = await self.llm(prompt)
        try:
            json_match = re.search(r'\[.*?\]', result, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group())
                for i, item in enumerate(data):
                    queries.append(AntiQuery(
                        id=f"cross_llm_{i}",
                        question=item.get('question', ''),
                        category="cross_domain",
                        source_gap=f"Pattern from {item.get('source_domain', 'unknown')}: {item.get('why_relevant', '')}",
                        surprise_score=0.85
                    ))
        except (json.JSONDecodeError, AttributeError):
            pass
        
        return queries
    
    def _find_analog(self, entity_type: str, target_domain: str) -> str:
        """Simple analog mapping."""
        analogs = {
            ("company", "biology"): "species",
            ("company", "military"): "battalion",
            ("company", "sports"): "team",
            ("technology", "biology"): "organ",
            ("technology", "evolution"): "mutation",
            ("person", "psychology"): "subject",
            ("trend", "evolution"): "selection pressure",
        }
        return analogs.get((entity_type, target_domain), "equivalent concept")
    
    async def _from_contrarian(self, kg, domain: str) -> List[AntiQuery]:
        """Generate contrarian queries."""
        queries = []
        
        if not self.llm:
            central = kg.get_central_nodes(3)
            for node_id in central:
                entity = kg.entities.get(node_id)
                if entity:
                    queries.append(AntiQuery(
                        id=f"contrarian_{node_id}",
                        question=f"Everyone agrees '{entity.name}' is important. What if it's actually a distraction? What if the real leverage is elsewhere?",
                        category="contrarian",
                        source_gap=f"Conventional wisdom about '{entity.name}'",
                        related_entities=[node_id],
                        surprise_score=0.75
                    ))
            return queries
        
        central_desc = "\n".join([
            f"- {kg.entities[n].name} ({kg.entities[n].type})"
            for n in kg.get_central_nodes(5)
            if n in kg.entities
        ])
        
        prompt = f"""Domain: {domain}

Most central/important entities:
{central_desc}

Generate 5 contrarian questions that challenge the conventional wisdom in this domain.
Each should be something that sounds wrong at first but might be right.

Return as JSON list with: question, conventional_wisdom_it_challenges, what_would_change"""
        
        result = await self.llm(prompt)
        try:
            json_match = re.search(r'\[.*?\]', result, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group())
                for i, item in enumerate(data):
                    queries.append(AntiQuery(
                        id=f"contrarian_llm_{i}",
                        question=item.get('question', ''),
                        category="contrarian",
                        source_gap=f"Challenges: {item.get('conventional_wisdom_it_challenges', '')}",
                        surprise_score=0.8
                    ))
        except (json.JSONDecodeError, AttributeError):
            pass
        
        return queries
    
    async def _from_second_order(self, kg, domain: str) -> List[AntiQuery]:
        """Generate second-order effect queries."""
        queries = []
        
        if not self.llm:
            return [
                AntiQuery(
                    id="second_order_default",
                    question="If every company in this domain succeeded at their current strategy, what would the unintended consequences be?",
                    category="second_order",
                    source_gap="Second-order effects of collective action",
                    surprise_score=0.7
                )
            ]
        
        prompt = f"""Domain: {domain}

Generate 5 questions about second-order and third-order effects that people in this domain are ignoring.
Focus on: unintended consequences, feedback loops, and long-term ripple effects.

Return as JSON list with: question, first_order_effect, second_order_effect, time_horizon"""
        
        result = await self.llm(prompt)
        try:
            json_match = re.search(r'\[.*?\]', result, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group())
                for i, item in enumerate(data):
                    queries.append(AntiQuery(
                        id=f"second_order_{i}",
                        question=item.get('question', ''),
                        category="second_order",
                        source_gap=f"First order: {item.get('first_order_effect', '')}. Second order: {item.get('second_order_effect', '')}",
                        surprise_score=0.75
                    ))
        except (json.JSONDecodeError, AttributeError):
            pass
        
        return queries
    
    def _calculate_surprise(self, query: AntiQuery) -> float:
        """Calculate how surprising/novel a query is."""
        base = query.surprise_score
        # Cross-domain and contrarian are inherently more surprising
        if query.category == "cross_domain":
            base = max(base, 0.8)
        elif query.category == "contrarian":
            base = max(base, 0.75)
        elif query.category == "assumption":
            base = max(base, 0.7)
        return min(base + 0.1, 1.0)
    
    def _calculate_relevance(self, query: AntiQuery, kg) -> float:
        """Calculate how relevant a query is to the domain."""
        base = query.relevance_score
        # Queries related to central entities are more relevant
        if query.related_entities:
            central = set(kg.get_central_nodes(5))
            if any(e in central for e in query.related_entities):
                base = max(base, 0.7)
        return min(base + 0.1, 1.0)
