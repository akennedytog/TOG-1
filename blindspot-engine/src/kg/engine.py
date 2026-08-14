"""Knowledge Graph Engine - Builds and queries knowledge graphs about domains."""

import json
import os
import re
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field, asdict
import networkx as nx
from datetime import datetime

@dataclass
class Entity:
    id: str
    name: str
    type: str  # concept, company, person, technology, trend, etc.
    description: str = ""
    confidence: float = 0.5
    sources: List[str] = field(default_factory=list)
    metadata: Dict = field(default_factory=dict)

@dataclass
class Relationship:
    source: str
    target: str
    type: str  # depends_on, competes_with, enables, precedes, etc.
    strength: float = 0.5
    evidence: str = ""

class KnowledgeGraph:
    """Core knowledge graph for mapping a domain's known space."""
    
    def __init__(self):
        self.graph = nx.DiGraph()
        self.entities: Dict[str, Entity] = {}
        
    def add_entity(self, entity: Entity) -> str:
        self.entities[entity.id] = entity
        self.graph.add_node(entity.id, **asdict(entity))
        return entity.id
    
    def add_relationship(self, rel: Relationship) -> None:
        self.graph.add_edge(
            rel.source, rel.target,
            type=rel.type,
            strength=rel.strength,
            evidence=rel.evidence
        )
    
    def get_dense_clusters(self, min_size: int = 3) -> List[List[str]]:
        """Find well-connected clusters - these are 'known' areas."""
        from networkx.algorithms.community import greedy_modularity_communities
        ug = self.graph.to_undirected()
        communities = list(greedy_modularity_communities(ug))
        return [list(c) for c in communities if len(c) >= min_size]
    
    def get_sparse_regions(self) -> List[str]:
        """Find nodes with few connections - potential blind spots."""
        return [
            n for n in self.graph.nodes()
            if self.graph.degree(n) <= 2
        ]
    
    def get_bridges(self) -> List[Tuple[str, str]]:
        """Find bridge edges connecting different clusters."""
        from networkx.algorithms import bridges
        # Use undirected version for bridge detection
        ug = self.graph.to_undirected()
        return list(bridges(ug))
    
    def get_central_nodes(self, top_n: int = 10) -> List[str]:
        """Most central nodes - the 'obvious' things everyone knows."""
        centrality = nx.betweenness_centrality(self.graph)
        return sorted(centrality, key=centrality.get, reverse=True)[:top_n]
    
    def get_peripheral_nodes(self, top_n: int = 10) -> List[str]:
        """Least central nodes - things people might overlook."""
        centrality = nx.betweenness_centrality(self.graph)
        return sorted(centrality, key=centrality.get)[:top_n]
    
    def to_dict(self) -> Dict:
        return {
            "entities": {k: asdict(v) for k, v in self.entities.items()},
            "edges": [
                {"source": u, "target": v, **d}
                for u, v, d in self.graph.edges(data=True)
            ]
        }
    
    def save(self, path: str) -> None:
        with open(path, 'w') as f:
            json.dump(self.to_dict(), f, indent=2)
    
    @classmethod
    def load(cls, path: str) -> 'KnowledgeGraph':
        kg = cls()
        with open(path) as f:
            data = json.load(f)
        for eid, edata in data.get("entities", {}).items():
            kg.add_entity(Entity(**edata))
        for edge in data.get("edges", []):
            kg.graph.add_edge(edge["source"], edge["target"], **{k:v for k,v in edge.items() if k not in ("source","target")})
        return kg

class DomainMapper:
    """Maps a domain by extracting entities and relationships from text."""
    
    def __init__(self, llm_client=None, search_client=None):
        self.llm = llm_client
        self.search = search_client
        self.kg = KnowledgeGraph()
    
    async def map_domain(self, domain_description: str) -> KnowledgeGraph:
        """Map a domain from a natural language description."""
        # Phase 1: Extract initial entities
        entities = await self._extract_entities(domain_description)
        for e in entities:
            self.kg.add_entity(e)
        
        # Phase 2: Discover relationships
        relationships = await self._extract_relationships(entities, domain_description)
        for r in relationships:
            self.kg.add_relationship(r)
        
        # Phase 3: Expand via search (if available)
        if self.search:
            await self._expand_via_search(entities)
        
        return self.kg
    
    async def _extract_entities(self, text: str) -> List[Entity]:
        """Extract key entities from domain description using LLM."""
        prompt = f"""Extract the key entities (concepts, companies, people, technologies, trends, 
        competitors, customers, tools, platforms) from this domain description.
        
        Domain: {text}
        
        Return a JSON list of objects with: name, type, description (1-2 sentences).
        Focus on the most important 15-25 entities."""
        
        if self.llm:
            result = await self.llm(prompt)
            return self._parse_entities(result)
        return self._fallback_entities(text)
    
    def _parse_entities(self, text: str) -> List[Entity]:
        """Parse LLM response into Entity objects."""
        entities = []
        try:
            # Try to find JSON in the response
            json_match = re.search(r'\[.*?\]', text, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group())
                for item in data:
                    eid = re.sub(r'[^a-z0-9]', '_', item.get('name', '').lower().strip())
                    entities.append(Entity(
                        id=eid or f"entity_{len(entities)}",
                        name=item.get('name', 'Unknown'),
                        type=item.get('type', 'concept'),
                        description=item.get('description', ''),
                        confidence=0.7
                    ))
        except (json.JSONDecodeError, AttributeError):
            pass
        return entities
    
    def _fallback_entities(self, text: str) -> List[Entity]:
        """Basic entity extraction without LLM."""
        words = re.findall(r'[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*', text)
        seen = set()
        entities = []
        for w in words[:20]:
            key = w.lower().strip()
            if key not in seen and len(w) > 3:
                seen.add(key)
                eid = re.sub(r'[^a-z0-9]', '_', key)
                entities.append(Entity(
                    id=eid, name=w.strip(),
                    type='concept', description='',
                    confidence=0.3
                ))
        return entities
    
    async def _extract_relationships(self, entities: List[Entity], context: str) -> List[Relationship]:
        """Extract relationships between entities."""
        if not entities or len(entities) < 2:
            return []
        
        names = [e.name for e in entities]
        prompt = f"""Given these entities from the domain "{context}":
        {', '.join(names)}
        
        Identify the 10-15 most important relationships between them.
        For each, specify: source, target, type (depends_on|competes_with|enables|precedes|similar_to|opposite_of|part_of), and a brief evidence statement.
        
        Return as JSON list."""
        
        if self.llm:
            result = await self.llm(prompt)
            return self._parse_relationships(result, entities)
        return []
    
    def _parse_relationships(self, text: str, entities: List[Entity]) -> List[Relationship]:
        """Parse LLM response into Relationship objects."""
        rels = []
        name_to_id = {e.name.lower(): e.id for e in entities}
        
        try:
            json_match = re.search(r'\[.*?\]', text, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group())
                for item in data:
                    src = name_to_id.get(item.get('source', '').lower())
                    tgt = name_to_id.get(item.get('target', '').lower())
                    if src and tgt:
                        rels.append(Relationship(
                            source=src, target=tgt,
                            type=item.get('type', 'related_to'),
                            strength=0.6,
                            evidence=item.get('evidence', '')
                        ))
        except (json.JSONDecodeError, AttributeError):
            pass
        return rels
    
    async def _expand_via_search(self, entities: List[Entity]) -> None:
        """Expand knowledge graph by searching for each entity."""
        if not self.search:
            return
        for entity in entities[:5]:  # Limit to top 5
            try:
                results = await self.search(f"{entity.name} industry trends competitors")
                # Process results to add more entities/relationships
            except Exception:
                pass
