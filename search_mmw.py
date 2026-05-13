from ddgs import DDGS
import json

# Search for Miami Music Week events
with DDGS() as ddgs:
    results = list(ddgs.text('Miami Music Week 2026 events parties', max_results=15))
    
    print("🔍 Miami Music Week Events Found:")
    print("=" * 60)
    
    for i, r in enumerate(results, 1):
        print(f"{i}. {r['title']}")
        print(f"   URL: {r['href']}")
        print(f"   {r['body'][:120]}...")
        print()
    
    # Save to file
    with open('mmw_events_duckduckgo.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"✅ Saved {len(results)} results to mmw_events_duckduckgo.json")