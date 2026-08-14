"""Cross-Domain Pattern Matcher - Maps patterns from diverse fields onto target domains."""

import json
import re
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field, asdict
from datetime import datetime

@dataclass
class DomainPattern:
    """A reusable pattern from a specific domain."""
    id: str
    name: str
    source_domain: str
    description: str
    mechanism: str  # How the pattern works
    conditions: List[str]  # When this pattern applies
    signals: List[str]  # Signs this pattern might be relevant
    examples: List[str] = field(default_factory=list)

@dataclass
class PatternMatch:
    """A pattern applied to the target domain."""
    pattern: DomainPattern
    target_analog: str  # What in the target domain corresponds
    question: str  # The blind spot question this reveals
    confidence: float  # 0-1 how good the match is
    reasoning: str = ""

class PatternLibrary:
    """Library of patterns from diverse domains."""
    
    def __init__(self):
        self.patterns: Dict[str, DomainPattern] = {}
        self._load_default_patterns()
    
    def _load_default_patterns(self):
        """Load the default pattern library."""
        patterns = [
            # Biology patterns
            DomainPattern(
                id="bio_red_queen",
                name="Red Queen Effect",
                source_domain="biology",
                description="In evolutionary systems, you must keep running just to stay in place. Competitors co-evolve, so advantages are temporary.",
                mechanism="Continuous adaptation is required just to maintain position, not to gain ground.",
                conditions=["Competitive landscape", "Fast-moving industry", "Technology-driven market"],
                signals=["Competitors copying features quickly", "Diminishing returns on innovation", "Arms race dynamics"],
                examples=["AI model capabilities converging", "SaaS feature parity"]
            ),
            DomainPattern(
                id="bio_punctuated_eq",
                name="Punctuated Equilibrium",
                source_domain="biology",
                description="Long periods of stability interrupted by brief bursts of rapid change.",
                mechanism="Most change happens in short, intense periods rather than gradually.",
                conditions=["Mature industry", "Regulatory change approaching", "Platform shift"],
                signals=["Long period of no major changes", "New technology reaching inflection point", "Regulatory uncertainty"],
                examples=["Cloud computing adoption", "Mobile internet shift"]
            ),
            DomainPattern(
                id="bio_symbiosis",
                name="Symbiosis vs Parasitism",
                source_domain="biology",
                description="Relationships can be mutualistic (both benefit), commensal (one benefits, other neutral), or parasitic (one benefits at other's expense).",
                mechanism="The nature of a relationship determines long-term stability and outcomes.",
                conditions=["Partnership ecosystem", "Platform businesses", "Supply chains"],
                signals=["Uneven value capture", "Partner churn", "Platform dependency"],
                examples=["App store economics", "Agency-client relationships"]
            ),
            DomainPattern(
                id="bio_niche_spec",
                name="Niche Specialization",
                source_domain="biology",
                description="Species that occupy narrow niches face less competition but are vulnerable to niche destruction.",
                mechanism="Specialization reduces competition but increases extinction risk.",
                conditions=["Niche market", "B2B specialized service", "Single-customer dependency"],
                signals=["Very specific target market", "Few competitors", "High expertise barrier"],
                examples=["Enterprise software for one industry", "Boutique consulting"]
            ),
            
            # Military patterns
            DomainPattern(
                id="mil_asymmetric",
                name="Asymmetric Warfare",
                source_domain="military",
                description="A weaker opponent can defeat a stronger one by avoiding their strengths and attacking their weaknesses.",
                mechanism="Don't play the game the leader wants you to play. Change the battlefield.",
                conditions=["Market leader with clear strength", "Resource disadvantage", "Regulatory moat"],
                signals=["Leader investing in defending their strength", "New entrants avoiding direct competition", "Unserved segments"],
                examples=["Netflix vs Blockbuster", "Uber vs Taxi"]
            ),
            DomainPattern(
                id="mil_high_ground",
                name="High Ground",
                source_domain="military",
                description="Whoever controls the high ground controls the battlefield. In business, this is the bottleneck or platform.",
                mechanism="Identify and capture the position that gives leverage over all other positions.",
                conditions=["Platform market", "Intermediary business", "Distribution-dependent industry"],
                signals=["One company controlling access", "High switching costs", "Network effects"],
                examples=["Google in search", "Stripe in payments"]
            ),
            DomainPattern(
                id="mil_flanking",
                name="Flanking Maneuver",
                source_domain="military",
                description="Instead of attacking the strongest point, go around it and attack from an unexpected direction.",
                mechanism="Find the angle the opponent isn't defending and attack there.",
                conditions=["Strong incumbent", "High barriers to head-on competition", "Adjacent opportunity"],
                signals=["Incumbent ignoring a segment", "Regulatory blind spot", "Technology enabling new approach"],
                examples=["Amazon vs traditional retail", "Zoom vs Cisco"]
            ),
            DomainPattern(
                id="mil_supply_lines",
                name="Supply Line Vulnerability",
                source_domain="military",
                description="An army's greatest vulnerability is its supply line. Cut it and the army collapses regardless of its strength.",
                mechanism="Identify what the opponent needs to function and target that.",
                conditions=["Dependency on specific resource", "Concentrated supply chain", "Single point of failure"],
                signals=["Single supplier", "Proprietary technology dependency", "Key person dependency"],
                examples=["Chip shortage in auto industry", "API dependency"]
            ),
            
            # Finance patterns
            DomainPattern(
                id="fin_arbitrage",
                name="Information Arbitrage",
                source_domain="finance",
                description="Profiting from price differences of the same asset in different markets. In knowledge, profiting from knowing something others don't.",
                mechanism="Find where information is unevenly distributed and exploit the gap.",
                conditions=["Information asymmetry", "New technology or regulation", "Geographic or industry gap"],
                signals=["Same concept priced differently in different contexts", "Knowledge that doesn't cross industry boundaries"],
                examples=["Cross-industry application of AI", "Regulatory arbitrage"]
            ),
            DomainPattern(
                id="fin_long_tail",
                name="Long Tail Risk",
                source_domain="finance",
                description="Rare, high-impact events that models underestimate because they haven't happened recently.",
                mechanism="The most important risks are the ones that haven't materialized yet.",
                conditions=["Stable period without disruption", "Models based on recent data", "Complacency"],
                signals=["'This time is different' thinking", "Risk models showing low probability", "Everyone comfortable"],
                examples=["2008 financial crisis", "COVID-19 pandemic"]
            ),
            DomainPattern(
                id="fin_compound",
                name="Compound Effects",
                source_domain="finance",
                description="Small advantages compound over time into massive differences. The key is consistency and time horizon.",
                mechanism="Small, consistent edges become insurmountable advantages given enough time.",
                conditions=["Long-term play", "Repeatable small advantages", "Patient capital"],
                signals=["Focus on short-term metrics", "Underinvestment in compounding activities", "Quarterly thinking"],
                examples=["Content marketing compounding", "SEO investment"]
            ),
            
            # Psychology patterns
            DomainPattern(
                id="psy_dunning_kruger",
                name="Dunning-Kruger Effect",
                source_domain="psychology",
                description="People with low competence overestimate their ability, while experts underestimate theirs.",
                mechanism="The less you know, the more confident you are. The more you know, the more you see what you don't know.",
                conditions=["New field or technology", "Rapidly changing domain", "Cross-industry moves"],
                signals=["Overconfidence in predictions", "Dismissal of complexity", "Simple solutions to complex problems"],
                examples=["AI capability predictions", "Market entry assumptions"]
            ),
            DomainPattern(
                id="psy_confirmation",
                name="Confirmation Bias",
                source_domain="psychology",
                description="People seek and interpret information that confirms their existing beliefs.",
                mechanism="We naturally filter out disconfirming evidence without realizing it.",
                conditions=["Strongly held beliefs", "Emotional investment", "Identity tied to position"],
                signals=["Ignoring contradictory data", "Explaining away failures", "Selective evidence gathering"],
                examples=["Startup pivots delayed too long", "Bad hires justified"]
            ),
            DomainPattern(
                id="psy_sunk_cost",
                name="Sunk Cost Fallacy",
                source_domain="psychology",
                description="Continuing a course of action because of past investment rather than future prospects.",
                mechanism="Past costs shouldn't affect future decisions, but they do.",
                conditions=["Long-running project", "Significant investment", "Personal ownership"],
                signals=["'We've already invested so much'", "Doubling down on failing strategy", "Refusing to pivot"],
                examples=["Failed product launches", "Bad acquisitions"]
            ),
            
            # Gaming patterns
            DomainPattern(
                id="game_boss",
                name="Boss Level Avoidance",
                source_domain="gaming",
                description="Players naturally avoid the hardest challenges. In business, the most important problems are often the ones everyone avoids.",
                mechanism="The hardest problem is usually the most valuable one to solve.",
                conditions=["Industry-wide pain point", "Everyone complaining but no one fixing", "Obvious problem"],
                signals=["Common complaint with no solution", "Workarounds accepted as normal", "Problem mentioned but not addressed"],
                examples=["Email security", "Healthcare interoperability"]
            ),
            DomainPattern(
                id="game_speedrun",
                name="Speedrun Exploit",
                source_domain="gaming",
                description="Speedrunners find glitches and exploits that skip normal gameplay. In business, these are unconventional shortcuts.",
                mechanism="The intended path isn't the only path. Look for glitches in the system.",
                conditions=["Established industry with norms", "Regulatory complexity", "Legacy processes"],
                signals=["'That's just how it's done'", "Complex workarounds", "Accepted inefficiencies"],
                examples=["Direct-to-consumer brands", "Remote-first companies"]
            ),
            DomainPattern(
                id="game_meta",
                name="Meta Shift",
                source_domain="gaming",
                description="The 'meta' (most effective tactics available) shifts when someone discovers a new strategy that beats the current best.",
                mechanism="The optimal strategy changes when someone innovates, making old strategies obsolete.",
                conditions=["Competitive equilibrium", "Stable best practices", "Copycat behavior"],
                signals=["Everyone doing the same thing", "Diminishing returns on current approach", "New tool enabling different approach"],
                examples=["SEO algorithm changes", "Social media platform shifts"]
            ),
            
            # Engineering patterns
            DomainPattern(
                id="eng_spof",
                name="Single Point of Failure",
                source_domain="engineering",
                description="A system is only as strong as its weakest component. One failure can bring down the whole system.",
                mechanism="Identify components whose failure would cascade to the entire system.",
                conditions=["Complex system", "Interdependent components", "Centralized architecture"],
                signals=["One person/team with critical knowledge", "Single vendor dependency", "Concentrated customer base"],
                examples=["Cloud provider outage", "Key person risk"]
            ),
            DomainPattern(
                id="eng_tech_debt",
                name="Technical Debt",
                source_domain="engineering",
                description="Shortcuts taken now create interest payments later. The debt compounds if not addressed.",
                mechanism="Every shortcut creates future cost. The longer you wait, the more expensive it gets.",
                conditions=["Fast growth", "Time pressure", "Resource constraints"],
                signals=["'We'll fix it later'", "Decreasing velocity", "Increasing bug rate"],
                examples=["Code quality shortcuts", "Process workarounds"]
            ),
            DomainPattern(
                id="eng_stress_test",
                name="Stress Testing",
                source_domain="engineering",
                description="Systems should be tested at their limits to find failure points before they fail in production.",
                mechanism="Push the system to extremes to find where it breaks, then reinforce those points.",
                conditions=["Critical system", "Growth phase", "Uncertain demand"],
                signals=["No testing at limits", "Assumptions about capacity", "Surprise failures"],
                examples=["Server capacity planning", "Team bandwidth"]
            ),
        ]
        
        for p in patterns:
            self.patterns[p.id] = p
    
    def get_patterns_by_domain(self, domain: str) -> List[DomainPattern]:
        return [p for p in self.patterns.values() if p.source_domain == domain]
    
    def get_all_domains(self) -> List[str]:
        return list(set(p.source_domain for p in self.patterns.values()))

class CrossDomainMatcher:
    """Matches patterns from other domains onto a target domain."""
    
    def __init__(self, llm_client=None):
        self.library = PatternLibrary()
        self.llm = llm_client
    
    async def find_matches(self, kg, domain_description: str) -> List[PatternMatch]:
        """Find cross-domain pattern matches for a knowledge graph."""
        matches = []
        
        # Get domain characteristics
        central = [kg.entities.get(n) for n in kg.get_central_nodes(5) if n in kg.entities]
        domain_chars = {
            "entities": [e.name for e in central if e],
            "entity_types": list(set(e.type for e in central if e)),
            "description": domain_description
        }
        
        # Check each pattern for relevance
        for pattern in self.library.patterns.values():
            match = await self._evaluate_pattern(pattern, domain_chars, kg)
            if match and match.confidence > 0.3:
                matches.append(match)
        
        # Sort by confidence
        matches.sort(key=lambda m: m.confidence, reverse=True)
        return matches[:10]
    
    async def _evaluate_pattern(self, pattern: DomainPattern, domain_chars: Dict, kg) -> Optional[PatternMatch]:
        """Evaluate if a pattern applies to the target domain."""
        # Check condition overlap
        condition_match = self._check_conditions(pattern.conditions, domain_chars)
        signal_match = self._check_signals(pattern.signals, domain_chars)
        
        if condition_match < 0.2 and signal_match < 0.2:
            return None
        
        confidence = (condition_match * 0.5 + signal_match * 0.5)
        
        # Generate the analog and question
        analog = self._find_analog(pattern, domain_chars)
        question = self._generate_question(pattern, analog)
        
        return PatternMatch(
            pattern=pattern,
            target_analog=analog,
            question=question,
            confidence=confidence,
            reasoning=f"Condition match: {condition_match:.2f}, Signal match: {signal_match:.2f}"
        )
    
    def _check_conditions(self, conditions: List[str], domain: Dict) -> float:
        """Check how well pattern conditions match domain characteristics."""
        if not conditions:
            return 0.5
        
        matches = 0
        desc_lower = domain.get("description", "").lower()
        entity_names = [e.lower() for e in domain.get("entities", [])]
        
        for condition in conditions:
            c_lower = condition.lower()
            # Check if condition keywords appear in domain
            keywords = c_lower.split()
            if any(k in desc_lower for k in keywords):
                matches += 1
            elif any(k in " ".join(entity_names) for k in keywords):
                matches += 1
        
        return matches / len(conditions)
    
    def _check_signals(self, signals: List[str], domain: Dict) -> float:
        """Check how well pattern signals match domain characteristics."""
        if not signals:
            return 0.5
        
        matches = 0
        desc_lower = domain.get("description", "").lower()
        
        for signal in signals:
            s_lower = signal.lower()
            keywords = s_lower.split()
            if any(k in desc_lower for k in keywords):
                matches += 1
        
        return matches / len(signals)
    
    def _find_analog(self, pattern: DomainPattern, domain: Dict) -> str:
        """Find what in the target domain corresponds to the pattern."""
        entities = domain.get("entities", [])
        if entities:
            return entities[0]
        return "this domain"
    
    def _generate_question(self, pattern: DomainPattern, analog: str) -> str:
        """Generate a blind spot question from a pattern match."""
        templates = {
            "bio_red_queen": f"In {analog}, you're running just to stay in place. What if your competitors are adapting faster than you're innovating?",
            "bio_punctuated_eq": f"What if {analog} is about to experience a punctuated equilibrium event? What's the trigger?",
            "bio_symbiosis": f"Are your key relationships in {analog} truly mutualistic, or is one side capturing more value?",
            "bio_niche_spec": f"Is {analog} too specialized? What happens if the niche shrinks or disappears?",
            "mil_asymmetric": f"What would asymmetric warfare look like against the leaders in {analog}? Where are they weakest?",
            "mil_high_ground": f"What's the high ground in {analog}? Who controls the bottleneck?",
            "mil_flanking": f"What flanking maneuver would catch everyone in {analog} off guard?",
            "mil_supply_lines": f"What's the supply line vulnerability in {analog}? What single point of failure would collapse the system?",
            "fin_arbitrage": f"What information arbitrage exists in {analog}? What do you know that others don't?",
            "fin_long_tail": f"What long-tail risk is everyone in {analog} ignoring because it hasn't happened recently?",
            "fin_compound": f"What small, consistent advantage could compound into dominance in {analog} over 5 years?",
            "psy_dunning_kruger": f"Where might the Dunning-Kruger effect be strongest in {analog}? What are people overconfident about?",
            "psy_confirmation": f"What confirmation bias is most dangerous in {analog}? What evidence is being filtered out?",
            "psy_sunk_cost": f"What sunk cost is driving bad decisions in {analog}? What should be abandoned?",
            "game_boss": f"What's the boss level everyone in {analog} is avoiding? What's the hard problem no one wants to solve?",
            "game_speedrun": f"What speedrun exploit exists in {analog}? What unconventional shortcut could bypass the normal path?",
            "game_meta": f"What if the meta in {analog} is about to shift? What new strategy would make current best practices obsolete?",
            "eng_spof": f"What's the single point of failure in {analog}? What one thing breaking would bring everything down?",
            "eng_tech_debt": f"What technical debt is accumulating in {analog}? What shortcuts are creating future costs?",
            "eng_stress_test": f"What would a stress test of {analog} reveal? Where does it break first?"
        }
        
        return templates.get(pattern.id, f"Pattern from {pattern.source_domain}: {pattern.description} How does this apply to {analog}?")
