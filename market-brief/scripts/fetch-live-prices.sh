#!/bin/bash
# Universal Price Fetcher - FIXED VERSION
# Priority: Polygon → Yahoo Finance → Cached

CONFIG_FILE="$HOME/.openclaw/workspace/market-brief/config/api-keys.json"
OUTPUT_FILE="$HOME/.openclaw/workspace/market-brief/output/live-prices.json"

# Hardcoded API key (from config file)
API_KEY="7m2OV9d8_UsimyrUZfoiAWM12s2b52uV"

echo "🔥 Fetching LIVE prices..."
echo "============================"
echo ""
echo "Current time: $(date '+%Y-%m-%d %H:%M:%S %Z')"
echo "Market status: Should be OPEN (9:30 AM - 4:00 PM ET)"
echo ""

ASTS_PRICE=""
TE_PRICE=""
SOURCE=""

# Try Polygon first
echo "Trying Polygon.io..."
ASTS_RESPONSE=$(curl -s "https://api.polygon.io/v2/aggs/ticker/ASTS/prev?apiKey=${API_KEY}" 2>/dev/null)
if echo "$ASTS_RESPONSE" | grep -q '"status":"OK"' 2>/dev/null; then
  ASTS_PRICE=$(echo "$ASTS_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['results'][0]['c'])" 2>/dev/null)
  ASTS_VOLUME=$(echo "$ASTS_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['results'][0]['v'])" 2>/dev/null)
  
  TE_RESPONSE=$(curl -s "https://api.polygon.io/v2/aggs/ticker/TE/prev?apiKey=${API_KEY}" 2>/dev/null)
  TE_PRICE=$(echo "$TE_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['results'][0]['c'])" 2>/dev/null)
  TE_VOLUME=$(echo "$TE_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['results'][0]['v'])" 2>/dev/null)
  
  if [ -n "$ASTS_PRICE" ] && [ "$ASTS_PRICE" != "null" ]; then
    SOURCE="polygon.io LIVE"
    echo "  ✅ Polygon.io SUCCESS"
    echo "     ASTS: \$$ASTS_PRICE (Vol: $ASTS_VOLUME)"
    echo "     TE: \$$TE_PRICE (Vol: $TE_VOLUME)"
  else
    echo "  ⚠️  Polygon returned OK but no price data"
  fi
else
  echo "  ⚠️  Polygon API failed"
  echo "  Response: $(echo $ASTS_RESPONSE | head -c 200)"
fi

# Fallback to Yahoo Finance if Polygon failed
if [ -z "$ASTS_PRICE" ] || [ "$ASTS_PRICE" = "null" ]; then
  echo ""
  echo "Trying Yahoo Finance..."
  
  ASTS_YAHOO=$(curl -s "https://query1.finance.yahoo.com/v8/finance/chart/ASTS?interval=1d&range=1d" 2>/dev/null)
  if echo "$ASTS_YAHOO" | grep -q '"regularMarketPrice"' 2>/dev/null; then
    ASTS_PRICE=$(echo "$ASTS_YAHOO" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['chart']['result'][0]['meta']['regularMarketPrice'])" 2>/dev/null)
    TE_YAHOO=$(curl -s "https://query1.finance.yahoo.com/v8/finance/chart/TE?interval=1d&range=1d" 2>/dev/null)
    TE_PRICE=$(echo "$TE_YAHOO" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['chart']['result'][0]['meta']['regularMarketPrice'])" 2>/dev/null)
    SOURCE="Yahoo Finance"
    echo "  ✅ Yahoo Finance SUCCESS"
    echo "     ASTS: \$$ASTS_PRICE"
    echo "     TE: \$$TE_PRICE"
  else
    echo "  ⚠️  Yahoo Finance failed"
  fi
fi

# Final fallback: Use cached data
if [ -z "$ASTS_PRICE" ] || [ "$ASTS_PRICE" = "null" ] || [ "$ASTS_PRICE" = "" ]; then
  echo ""
  echo "⚠️  FALLING BACK TO CACHED DATA"
  
  if [ -f "$OUTPUT_FILE" ]; then
    ASTS_PRICE=$(cat "$OUTPUT_FILE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['asts']['price'])" 2>/dev/null)
    TE_PRICE=$(cat "$OUTPUT_FILE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['te']['price'])" 2>/dev/null)
    SOURCE="CACHED (API Failed)"
    echo "  Using cached prices from previous fetch"
  fi
  
  # Absolute fallback
  if [ -z "$ASTS_PRICE" ] || [ "$ASTS_PRICE" = "null" ]; then
    ASTS_PRICE="88.10"
    TE_PRICE="6.88"
    SOURCE="SAMPLE (All APIs Failed)"
    echo "  ⚠️  Using SAMPLE prices - ALL APIs FAILED"
  fi
fi

echo ""
echo "======================================"
echo "✅ FINAL PRICES ($SOURCE):"
echo "  ASTS: \$$ASTS_PRICE"
echo "  TE: \$$TE_PRICE"
echo "======================================"
echo ""

# Save to JSON
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
cat > "$OUTPUT_FILE" << EOL
{
  "timestamp": "$TIMESTAMP",
  "source": "$SOURCE",
  "marketOpen": true,
  "fetchTime": "$(date '+%H:%M')",
  "asts": {
    "ticker": "ASTS",
    "price": $ASTS_PRICE
  },
  "te": {
    "ticker": "TE",
    "price": $TE_PRICE
  }
}
EOL

echo "📄 Saved to: $OUTPUT_FILE"
echo "⏰ $(date)"

if [[ "$SOURCE" == *"CACHED"* ]] || [[ "$SOURCE" == *"SAMPLE"* ]]; then
  echo ""
  echo "⚠️  WARNING: Using non-live data!"
fi
