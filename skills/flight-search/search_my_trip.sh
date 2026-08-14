#!/bin/bash
# Search for Alec's paternity leave trip

echo "=========================================="
echo "  FLIGHT SEARCH: Miami → Madrid/Lisbon"
echo "  Business Class | Sept 6-10 → 24-28"
echo "=========================================="
echo ""

cd /Users/aleckennedy/.openclaw/workspace

# Search Madrid
echo "🛫 Searching MIAMI → MADRID..."
python3 skills/flight-search/flight_search.py \
  --origin MIA \
  --destination MAD \
  --depart-range "2026-09-06,2026-09-10" \
  --return-range "2026-09-24,2026-09-28" \
  --class business \
  --output /tmp/madrid_flights.json

echo ""
echo "=========================================="
echo ""

# Search Lisbon
echo "🛫 Searching MIAMI → LISBON..."
python3 skills/flight-search/flight_search.py \
  --origin MIA \
  --destination LIS \
  --depart-range "2026-09-06,2026-09-10" \
  --return-range "2026-09-24,2026-09-28" \
  --class business \
  --output /tmp/lisbon_flights.json

echo ""
echo "=========================================="
echo "✅ Search complete!"
echo "Results saved to:"
echo "  - /tmp/madrid_flights.json"
echo "  - /tmp/lisbon_flights.json"
echo "=========================================="
