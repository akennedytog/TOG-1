"""Assumption Detector - Reverse-engineers mental models and identifies implicit assumptions."""

import json
import re
from typing import Dict, List, Optional
from dataclasses import dataclass, field, asdict

@dataclass
class Assumption:
    id: str
    statement: str
    category: str  # framing, boundary, causality, priority, identity, temporal
    confidence: float  # 0-1 how sure we are this is actually held
    impact_if_wrong: str = ""
    evidence: str = ""
    related_entities: List[str] = field(default_factory=list)

@dataclass
class MentalModel:
    """Reconstructed mental model of how someone views their domain."""
    core_beliefs: List[str] = field(default_factory=list)
    assumed_boundaries: List[str] = field(default_factory=list)  # What they think is/isn't possible
    causal_links: List[str] = field(default_factory=list)  # X causes Y assumptions
    priorities: List[str] = field(default_factory=list)  # What they think matters most
    blind_spots: List[Assumption] = field(default_factory=list)

class AssumptionDetector:
    """Detects implicit assumptions in domain descriptions."""
    
    ASSUMPTION_CATEGORIES = {
        "framing": "How the problem is defined and what's included/excluded",
        "boundary": "Assumptions about what's possible or impossible",
        "causality": "Assumed cause-and-effect relationships",
        "priority": "What's assumed to be most/least important",
        "identity": "Assumptions about who the players are and their roles",
        "temporal": "Assumptions about timing, speed, and sequence"
    }
    
    def __init__(self, llm_client=None):
        self.llm = llm_client
    
    async def detect_assumptions(self, domain_description: str, kg=None) -> List[Assumption]:
        """Detect implicit assumptions in a domain description."""
        assumptions = []
        
        # 1. Structural analysis
        assumptions.extend(self._structural_assumptions(domain_description))
        
        # 2. LLM-based deep analysis
        if self.llm:
            llm_assumptions = await self._llm_assumptions(domain_description, kg)
            assumptions.extend(llm_assumptions)
        
        # 3. Category-based systematic check
        assumptions.extend(self._category_assumptions(domain_description))
        
        return assumptions
    
    def _structural_assumptions(self, text: str) -> List[Assumption]:
        """Find assumptions from text structure and language patterns."""
        assumptions = []
        
        # Look for absolute language
        absolutes = re.findall(r'(always|never|everyone|nobody|impossible|must|can\'t|cannot|only way)', text, re.IGNORECASE)
        if absolutes:
            assumptions.append(Assumption(
                id="struct_absolute",
                statement=f"The text uses absolute language ({', '.join(set(absolutes))}) suggesting assumed certainty where there may be alternatives.",
                category="boundary",
                confidence=0.6,
                impact_if_wrong="Missing alternative approaches and edge cases"
            ))
        
        # Look for assumed causality
        causals = re.findall(r'(because|therefore|thus|leads to|results in|causes|drives)', text, re.IGNORECASE)
        if causals:
            assumptions.append(Assumption(
                id="struct_causal",
                statement="The text assumes specific cause-and-effect relationships that may not hold in all contexts.",
                category="causality",
                confidence=0.5,
                impact_if_wrong="Wrong diagnosis leads to wrong solutions"
            ))
        
        # Look for assumed priorities
        priorities = re.findall(r'(most important|key|critical|essential|vital|crucial)', text, re.IGNORECASE)
        if priorities:
            assumptions.append(Assumption(
                id="struct_priority",
                statement=f"The text prioritizes ({', '.join(set(priorities))}) without considering alternative priorities.",
                category="priority",
                confidence=0.5,
                impact_if_wrong="Missing what actually matters most"
            ))
        
        return assumptions
    
    async def _llm_assumptions(self, domain: str, kg=None) -> List[Assumption]:
        """Use LLM to surface deeper assumptions."""
        kg_context = ""
        if kg:
            central = [kg.entities.get(n) for n in kg.get_central_nodes(5) if n in kg.entities]
            kg_context = "\nKey entities:\n" + "\n".join([f"- {e.name} ({e.type})" for e in central if e])
        
        prompt = f"""Analyze this domain description for hidden assumptions:

Domain: {domain}
{kg_context}

Identify 8-12 implicit assumptions that someone describing this domain is likely making.
These should be beliefs that seem "obvious" to insiders but are actually questionable.

For each assumption, specify:
1. The assumption statement
2. Category (framing|boundary|causality|priority|identity|temporal)
3. What would change if this assumption is wrong
4. Evidence from the text that suggests this assumption

Return as JSON list."""
        
        result = await self.llm(prompt)
        return self._parse_assumptions(result)
    
    def _parse_assumptions(self, text: str) -> List[Assumption]:
        """Parse LLM response into Assumption objects."""
        assumptions = []
        try:
            json_match = re.search(r'\[.*?\]', text, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group())
                for i, item in enumerate(data):
                    assumptions.append(Assumption(
                        id=f"llm_assumption_{i}",
                        statement=item.get('assumption', item.get('statement', '')),
                        category=item.get('category', 'framing'),
                        confidence=0.7,
                        impact_if_wrong=item.get('impact_if_wrong', item.get('what_would_change', '')),
                        evidence=item.get('evidence', '')
                    ))
        except (json.JSONDecodeError, AttributeError):
            pass
        return assumptions
    
    def _category_assumptions(self, text: str) -> List[Assumption]:
        """Systematically check each assumption category."""
        assumptions = []
        
        # Check for framing assumptions
        if "problem" in text.lower() or "challenge" in text.lower():
            assumptions.append(Assumption(
                id="cat_framing",
                statement="The problem is framed in a specific way that excludes alternative framings.",
                category="framing",
                confidence=0.4,
                impact_if_wrong="Solving the wrong problem"
            ))
        
        # Check for identity assumptions
        competitors = re.findall(r'(competitor|rival|alternative)', text, re.IGNORECASE)
        if not competitors:
            assumptions.append(Assumption(
                id="cat_identity_comp",
                statement="The analysis may assume a specific set of competitors or ignore non-obvious competition.",
                category="identity",
                confidence=0.5,
                impact_if_wrong="Missing disruptive threats from outside the industry"
            ))
        
        # Check for temporal assumptions
        if not re.search(r'(year|month|quarter|timeline|roadmap|phase)', text, re.IGNORECASE):
            assumptions.append(Assumption(
                id="cat_temporal",
                statement="No explicit timeline is mentioned, suggesting an assumption about the pace of change.",
                category="temporal",
                confidence=0.4,
                impact_if_wrong="Timing assumptions could be completely wrong"
            ))
        
        return assumptions
    
    def reconstruct_mental_model(self, domain_description: str, assumptions: List[Assumption]) -> MentalModel:
        """Reconstruct the likely mental model from domain description and detected assumptions."""
        model = MentalModel()
        
        # Extract core beliefs from the text
        sentences = re.split(r'[.!?]+', domain_description)
        model.core_beliefs = [s.strip() for s in sentences if len(s.strip()) > 20][:5]
        
        # Extract assumed boundaries
        for a in assumptions:
            if a.category == "boundary":
                model.assumed_boundaries.append(a.statement)
        
        # Extract causal links
        for a in assumptions:
            if a.category == "causality":
                model.causal_links.append(a.statement)
        
        # Extract priorities
        for a in assumptions:
            if a.category == "priority":
                model.priorities.append(a.statement)
        
        # Blind spots are the assumptions themselves
        model.blind_spots = assumptions
        
        return model
