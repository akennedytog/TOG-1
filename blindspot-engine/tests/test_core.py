"""Core component tests for Blind Spot Engine."""
import sys
sys.path.insert(0, '/Users/aleckennedy/.openclaw/workspace/blindspot-engine')

from src.kg.engine import KnowledgeGraph, Entity, Relationship
from src.antiquery.generator import AntiQueryGenerator
from src.assumptions.detector import AssumptionDetector
from src.patterns.matcher import CrossDomainMatcher, PatternLibrary

def test_knowledge_graph():
    kg = KnowledgeGraph()
    kg.add_entity(Entity(id='ai', name='AI Consulting', type='service'))
    kg.add_entity(Entity(id='smb', name='SMBs', type='customer'))
    kg.add_entity(Entity(id='gpt', name='Custom GPTs', type='technology'))
    kg.add_entity(Entity(id='workflow', name='Workflow Automation', type='service'))
    kg.add_entity(Entity(id='comp', name='Competitors', type='competitor'))
    kg.add_relationship(Relationship(source='ai', target='smb', type='serves'))
    kg.add_relationship(Relationship(source='ai', target='gpt', type='uses'))
    kg.add_relationship(Relationship(source='ai', target='workflow', type='provides'))
    kg.add_relationship(Relationship(source='gpt', target='workflow', type='enables'))
    
    assert len(kg.entities) == 5
    assert kg.graph.number_of_edges() == 4
    assert len(kg.get_sparse_regions()) > 0
    assert len(kg.get_central_nodes(3)) == 3
    print("✅ Knowledge Graph: PASS")

def test_anti_query_generator():
    kg = KnowledgeGraph()
    kg.add_entity(Entity(id='ai', name='AI Consulting', type='service'))
    kg.add_entity(Entity(id='smb', name='SMBs', type='customer'))
    kg.add_entity(Entity(id='gpt', name='Custom GPTs', type='technology'))
    kg.add_relationship(Relationship(source='ai', target='smb', type='serves'))
    kg.add_relationship(Relationship(source='ai', target='gpt', type='uses'))
    
    gen = AntiQueryGenerator()
    queries = gen._from_sparse_regions(kg)
    queries += gen._from_bridges(kg)
    queries += gen._from_periphery(kg)
    
    assert len(queries) > 0
    assert all(hasattr(q, 'question') for q in queries)
    print(f"✅ Anti-Query Generator: PASS ({len(queries)} queries)")

def test_assumption_detector():
    detector = AssumptionDetector()
    assumptions = detector._structural_assumptions(
        'AI consulting for SMBs is the most important thing. Everyone needs custom GPTs. You must use workflow automation. It always works. There is no other way.'
    )
    assert len(assumptions) > 0
    assert all(hasattr(a, 'statement') for a in assumptions)
    print(f"✅ Assumption Detector: PASS ({len(assumptions)} assumptions)")

def test_pattern_library():
    library = PatternLibrary()
    assert len(library.patterns) > 0
    assert len(library.get_all_domains()) >= 5
    print(f"✅ Pattern Library: PASS ({len(library.patterns)} patterns, {len(library.get_all_domains())} domains)")

def test_cross_domain_matcher():
    matcher = CrossDomainMatcher()
    assert matcher.library is not None
    print("✅ Cross-Domain Matcher: PASS")

def test_full_pipeline():
    """Test the full pipeline without LLM (using fallbacks)."""
    from src.engine import BlindSpotEngine
    import asyncio
    
    async def run():
        engine = BlindSpotEngine()
        report = await engine.analyze(
            'AI consulting for SMBs. We help small businesses with custom GPTs and workflow automation.'
        )
        assert report.domain is not None
        assert len(report.anti_queries) > 0
        assert len(report.assumptions) > 0
        assert len(report.cross_domain_matches) > 0
        assert len(report.top_insights) > 0
        print(f"✅ Full Pipeline: PASS ({len(report.anti_queries)} queries, {len(report.assumptions)} assumptions, {len(report.cross_domain_matches)} patterns)")
        return report
    
    report = asyncio.run(run())
    return report

if __name__ == '__main__':
    test_knowledge_graph()
    test_anti_query_generator()
    test_assumption_detector()
    test_pattern_library()
    test_cross_domain_matcher()
    report = test_full_pipeline()
    print("\n🎉 All tests passed!")
    print(f"\nSample insights:")
    for i, insight in enumerate(report.top_insights[:3], 1):
        print(f"  {i}. {insight[:100]}...")
