from ddgs import DDGS
import json

# Scrape Miami Music Week events (excluding Ultra)
with DDGS() as ddgs:
    # Get events from official site
    results = list(ddgs.text('miamimusicweek.com events 2026 "Venue:" price', max_results=50))
    
    # Parse and extract event info
    events = []
    
    # Manually extracted from firecrawl scrape
    scraped_events = [
        {
            "name": "Yousuke Yukimatsu, 999999999, Juliet Fox: RESISTANCE MMW",
            "venue": "M2",
            "price": "$39+",
            "date": "TBD"
        },
        {
            "name": "Eric Prydz, Argy, Jeremy Olander: RESISTANCE MMW",
            "venue": "M2",
            "price": "$99+",
            "date": "TBD"
        },
        {
            "name": "Amelie Lens, Boys Noize, ØTTA: RESISTANCE MMW",
            "venue": "M2",
            "price": "$79+",
            "date": "TBD"
        },
        {
            "name": "Boris Brejcha, Miss Monique: RESISTANCE MMW",
            "venue": "M2",
            "price": "$99+",
            "date": "TBD"
        },
        {
            "name": "Carl Cox, Maceo Plex - RESISTANCE MMW Closing Party",
            "venue": "M2",
            "price": "$99+",
            "date": "TBD"
        },
        {
            "name": "20Five8Records x Groovemates",
            "venue": "Astra Rooftop Garden",
            "price": "$10+",
            "date": "TBD"
        },
        {
            "name": "Beatport Live Pool Party x Mood Child",
            "venue": "Epic Hotel Pool",
            "price": "$46+",
            "date": "TBD"
        },
        {
            "name": "Brobot Records Miami x We Group Hi-Fi",
            "venue": "Miami Sound Bar",
            "price": "FREE",
            "date": "TBD"
        },
        {
            "name": "Experts Only: Miami Music Week 2026",
            "venue": "Space Miami",
            "price": "$70+",
            "date": "TBD"
        },
        {
            "name": "Get Closer: Luuk Van Dijk",
            "venue": "Jolene Sound Room",
            "price": "$15+",
            "date": "TBD"
        },
        {
            "name": "Satoshi Tomiie, Melody & More (NOMAD Talent MMW)",
            "venue": "To be confirmed",
            "price": "$TBD",
            "date": "TBD"
        },
        {
            "name": "Balance Miami",
            "venue": "To be confirmed",
            "price": "$TBD",
            "date": "TBD"
        },
        {
            "name": "Beatport Live Pool Party x 20 Years Rekids",
            "venue": "To be confirmed",
            "price": "$TBD",
            "date": "TBD"
        },
        {
            "name": "Carlita + LP Giobbi",
            "venue": "To be confirmed",
            "price": "$TBD",
            "date": "TBD"
        },
        {
            "name": "Coldharbour Night (MMW)",
            "venue": "To be confirmed",
            "price": "$TBD",
            "date": "TBD"
        },
        {
            "name": "Converge: Richie Hawtin B2b Dubfire",
            "venue": "To be confirmed",
            "price": "$TBD",
            "date": "TBD"
        },
        {
            "name": "DJ Mag presents Cloonee (Sagamore Pool Party)",
            "venue": "Sagamore",
            "price": "$TBD",
            "date": "TBD"
        },
        {
            "name": "MMW26: BEN BÖHMER LIVE",
            "venue": "To be confirmed",
            "price": "$TBD",
            "date": "TBD"
        },
        {
            "name": "Aliens On Mushrooms Pool Party",
            "venue": "To be confirmed",
            "price": "$TBD",
            "date": "TBD",
            "artists": "24 ARTISTS"
        },
        {
            "name": "AUDIEN: PROGRESSIVE HOUSE NEVER DIES",
            "venue": "To be confirmed",
            "price": "$TBD",
            "date": "TBD",
            "artists": "7 ARTISTS"
        }
    ]
    
    print(f"Found {len(scraped_events)} NON-ULTRA events")
    print("\nSample events:")
    for i, event in enumerate(scraped_events[:5], 1):
        print(f"{i}. {event['name']}")
        print(f"   Venue: {event['venue']}")
        print(f"   Price: {event['price']}")
        print()
    
    # Save to JSON
    with open('mmw_scraped_events.json', 'w') as f:
        json.dump(scraped_events, f, indent=2)
    
    print(f"✅ Saved {len(scraped_events)} events to mmw_scraped_events.json")