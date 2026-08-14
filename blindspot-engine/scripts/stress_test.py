#!/usr/bin/env python3
"""Stress test the Blind Spot Engine on 10 real businesses/domains."""
import sys, os, asyncio, json
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.engine import BlindSpotEngine, OllamaClient
from src.storage import save_analysis, get_recent_analyses

# 10 real businesses/domains to test
TEST_DOMAINS = [
    "A dental practice in South Florida with 3 locations. They do general dentistry, cosmetic, and orthodontics. Competing with 15 other practices within 5 miles. Marketing through Google Ads and patient referrals. Insurance-heavy patient base.",
    "A SaaS company selling project management software for construction contractors. $2M ARR, 500 customers. Competes with Procore, Buildertrend. Features: scheduling, budgeting, document management. Struggling with churn.",
    "A boutique law firm specializing in intellectual property for tech startups. 5 attorneys. Clients are early-stage companies. Revenue: $1.5M. Competition from larger firms and LegalZoom-type services.",
    "A meal prep delivery service in Austin, TX. 200 weekly subscribers. Focus on keto and paleo meals. Competes with Factor, HelloFresh, local meal prep kitchens. Kitchen capacity is bottleneck.",
    "A real estate investment firm buying single-family rentals in the Sun Belt. 50 properties, $12M portfolio. 8% average cap rate. Competition from institutional buyers and iBuyers. Property management is biggest challenge.",
    "An AI-powered recruiting platform for healthcare staffing. Connects nurses with hospitals. 10,000 candidates, 200 hospital clients. Competes with TravelNursing.com, Nomad Health. Revenue: $500K MRR.",
    "A mobile car detailing business in Miami. 5 trucks, 15 employees. Services: full detail, ceramic coating, paint correction. Competes with 20+ other mobile detailers. Customer acquisition via Instagram.",
    "A B2B content marketing agency serving cybersecurity companies. 8 employees, $800K revenue. Services: blog posts, whitepapers, case studies. Competes with larger agencies. Struggling to differentiate.",
    "A boutique fitness studio chain in Chicago. 3 locations, 1,200 members. Classes: yoga, pilates, HIIT. Competes with ClassPass, SoulCycle, local studios. Post-COVID recovery is slow.",
    "A commercial cleaning company serving office buildings in downtown Nashville. 50 employees, 30 contracts. Services: janitorial, deep cleaning, disinfection. Competition from national chains. Labor shortage is critical.",
]

async def run_stress_test():
    print("=" * 60)
    print("🔍 BLIND SPOT ENGINE - STRESS TEST")
    print("Testing on 10 real businesses/domains")
    print("=" * 60)
    
    # Initialize with Ollama for LLM-powered analysis
    llm = OllamaClient(model="qwen3-coder:latest")
    engine = BlindSpotEngine(llm_client=llm)
    
    results = []
    
    for i, domain in enumerate(TEST_DOMAINS, 1):
        print(f"\n{'='*60}")
        print(f"[{i}/10] Analyzing: {domain[:60]}...")
        print(f"{'='*60}")
        
        try:
            report = await engine.analyze(domain)
            
            # Save to storage
            aid = save_analysis(domain, report.to_dict())
            
            result = {
                "id": i,
                "domain": domain[:80],
                "analysis_id": aid,
                "n_queries": len(report.anti_queries),
                "n_assumptions": len(report.assumptions),
                "n_patterns": len(report.cross_domain_matches),
                "top_insights": report.top_insights[:3],
                "status": "PASS"
            }
            results.append(result)
            
            print(f"  ✅ Analysis complete!")
            print(f"     Anti-queries: {result['n_queries']}")
            print(f"     Assumptions: {result['n_assumptions']}")
            print(f"     Patterns: {result['n_patterns']}")
            print(f"     Top insight: {result['top_insights'][0][:100] if result['top_insights'] else 'N/A'}")
            
        except Exception as e:
            print(f"  ❌ FAILED: {e}")
            results.append({
                "id": i,
                "domain": domain[:80],
                "status": "FAIL",
                "error": str(e)
            })
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 STRESS TEST RESULTS")
    print("=" * 60)
    
    passed = [r for r in results if r["status"] == "PASS"]
    failed = [r for r in results if r["status"] == "FAIL"]
    
    print(f"\nPassed: {len(passed)}/{len(TEST_DOMAINS)}")
    print(f"Failed: {len(failed)}/{len(TEST_DOMAINS)}")
    
    if passed:
        avg_queries = sum(r["n_queries"] for r in passed) / len(passed)
        avg_assumptions = sum(r["n_assumptions"] for r in passed) / len(passed)
        avg_patterns = sum(r["n_patterns"] for r in passed) / len(passed)
        print(f"\nAverages:")
        print(f"  Anti-queries: {avg_queries:.1f}")
        print(f"  Assumptions: {avg_assumptions:.1f}")
        print(f"  Patterns: {avg_patterns:.1f}")
    
    if failed:
        print(f"\nFailed domains:")
        for r in failed:
            print(f"  ❌ [{r['id']}] {r['domain'][:50]}... - {r.get('error', 'Unknown')}")
    
    # Save results
    output = {
        "timestamp": asyncio.get_event_loop().time() if hasattr(asyncio, 'get_event_loop') else "now",
        "total": len(TEST_DOMAINS),
        "passed": len(passed),
        "failed": len(failed),
        "results": results
    }
    
    with open("data/stress_test_results.json", "w") as f:
        json.dump(output, f, indent=2)
    print(f"\nResults saved to data/stress_test_results.json")
    
    return results

if __name__ == "__main__":
    asyncio.run(run_stress_test())
