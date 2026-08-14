"""Test the full LLM-powered analysis pipeline."""
import sys, os, asyncio
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.engine import BlindSpotEngine, OllamaClient

async def test_llm_pipeline():
    print("🧪 Testing LLM-powered analysis pipeline...")
    
    # Initialize with Ollama
    llm = OllamaClient(model="qwen3-coder:latest")
    engine = BlindSpotEngine(llm_client=llm)
    
    # Test domain
    domain = "I run an AI consulting agency called The One Group. We help SMBs with AI automation. We focus on custom GPTs, workflow automation, and AI training. Our clients are mostly in professional services - law firms, medical practices, accounting firms. We charge $2,500 for audits, $2,500-$10,000 for implementation, and $1,500-$7,500 for coaching."
    
    print("Running full analysis...")
    report = await engine.analyze(domain)
    
    print(f"\n✅ Report generated for: {report.domain}")
    print(f"   Anti-queries: {len(report.anti_queries)}")
    print(f"   Assumptions: {len(report.assumptions)}")
    print(f"   Cross-domain matches: {len(report.cross_domain_matches)}")
    
    # Test LLM deep analysis
    print("\nRunning LLM deep analysis...")
    deep = await engine._llm_deep_analysis(
        domain, 
        None, 
        [type('q', (), {'question': q.get('question', '')})() for q in report.anti_queries[:5]],
        [type('a', (), {'statement': a.get('statement', '')})() for a in report.assumptions[:5]],
        [type('m', (), {'pattern': type('p', (), {'source_domain': m.get('pattern', {}).get('source_domain', '')})(), 'question': m.get('question', '')})() for m in report.cross_domain_matches[:5]]
    )
    print(f"   Deep analysis: {deep.get('analysis', 'N/A')[:200]}...")
    
    print("\n✅ LLM pipeline test complete!")

if __name__ == "__main__":
    asyncio.run(test_llm_pipeline())
