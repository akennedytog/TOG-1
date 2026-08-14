---
name: flight-search
description: Search for flights using browser automation (Google Flights) and APIs. Finds cheapest business class flights, compares cash vs points, monitors prices.
allowed-tools: Bash(flight_search.py, browser-use:*)
---

# Flight Search Skill

Search for flights using browser automation (Google Flights) with Duffel API as fallback.

## Why No Amadeus?
Amadeus API was decommissioned July 17, 2026. This skill uses:
1. **Browser automation** - Google Flights scraping (primary)
2. **Duffel API** - Modern flight API (optional, pay-per-use)

## Quick Start

### Search Specific Dates
```bash
python skills/flight-search/flight_search.py \
  --origin MIA \
  --destination MAD \
  --depart 2026-09-08 \
  --return 2026-09-26 \
  --class business
```

### Search Date Range (Find Cheapest)
```bash
python skills/flight-search/flight_search.py \
  --origin MIA \
  --destination MAD \
  --depart-range "2026-09-06,2026-09-10" \
  --return-range "2026-09-24,2026-09-28" \
  --class business
```

### Save Results
```bash
python skills/flight-search/flight_search.py \
  --origin MIA \
  --destination LIS \
  --depart-range "2026-09-06,2026-09-10" \
  --return-range "2026-09-24,2026-09-28" \
  --class business \
  --output flights_miami_lisbon.json
```

## Tools

### flight_search.py
Main CLI tool with two modes:

**Single Date Search:**
- `--origin` - IATA airport code (e.g., MIA)
- `--destination` - IATA airport code (e.g., MAD, LIS)
- `--depart` - YYYY-MM-DD
- `--return` - YYYY-MM-DD (optional)
- `--class` - economy, premium, business, first
- `--output` - Save JSON results

**Range Search (find cheapest):**
- `--depart-range` - "start,end" dates
- `--return-range` - "start,end" dates

## How It Works

1. Uses browser-use to open Google Flights
2. Navigates to search results
3. Extracts flight data (airline, price, duration, stops)
4. Sorts by price
5. Returns top 10 cheapest options

## Limitations

- Google Flights layout changes may break scraper
- Rate limited by browser automation speed
- Headless browser may be detected (use --headed if issues)

## Future Enhancements

- Duffel API integration (requires API key)
- Price monitoring/alerts
- Award availability search (miles/points)
- Kayak/Skyscanner comparison
