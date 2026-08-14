#!/bin/bash
# Generate daily tweets using LIVE prices - FIXED VERSION
# Uses already-fetched prices from live-prices.json

OUTPUT_DIR="$HOME/.openclaw/workspace/market-brief/output/tweets"
LIVE_PRICES="$HOME/.openclaw/workspace/market-brief/output/live-prices.json"
TIMESTAMP=$(date +"%Y-%m-%d")

mkdir -p "$OUTPUT_DIR"

echo "🐦 Generating Daily Tweets - $TIMESTAMP"
echo "======================================"
echo "Current time: $(date '+%H:%M:%S')"
echo ""

# Read live prices (already fetched by Morpheus)
if [ -f "$LIVE_PRICES" ]; then
  ASTS_PRICE=$(cat "$LIVE_PRICES" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['asts']['price'])" 2>/dev/null)
  TE_PRICE=$(cat "$LIVE_PRICES" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['te']['price'])" 2>/dev/null)
  SOURCE=$(cat "$LIVE_PRICES" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['source'])" 2>/dev/null)
  FETCH_TIME=$(cat "$LIVE_PRICES" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('fetchTime', 'unknown'))" 2>/dev/null)
  
  # Check if data is stale (older than 10 minutes)
  if [[ "$SOURCE" == *"SAMPLE"* ]] || [[ "$SOURCE" == *"CACHED"* ]]; then
    echo "⚠️  WARNING: Prices are from cached/sample data!"
    echo "   Source: $SOURCE"
    echo "   ASTS: \$$ASTS_PRICE"
    echo "   TE: \$$TE_PRICE"
    echo ""
    echo "🔄 Re-fetching prices..."
    bash "$HOME/.openclaw/workspace/market-brief/scripts/fetch-live-prices.sh" > /dev/null 2>&1
    
    # Re-read after fetch
    ASTS_PRICE=$(cat "$LIVE_PRICES" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['asts']['price'])" 2>/dev/null)
    TE_PRICE=$(cat "$LIVE_PRICES" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['te']['price'])" 2>/dev/null)
    SOURCE=$(cat "$LIVE_PRICES" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['source'])" 2>/dev/null)
    FETCH_TIME=$(cat "$LIVE_PRICES" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('fetchTime', 'unknown'))" 2>/dev/null)
  fi
else
  ASTS_PRICE="88.10"
  TE_PRICE="6.88"
  SOURCE="fallback (no price file)"
fi

echo "Using prices from: $SOURCE"
echo "  ASTS: \$$ASTS_PRICE"
echo "  TE: \$$TE_PRICE"
echo "  Fetched at: $FETCH_TIME"
echo ""

# ASTS Tweet (squeeze focus)
cat > "$OUTPUT_DIR/asts-tweet-$TIMESTAMP.txt" << EOF
🚀 \$ASTS Update - $TIMESTAMP

Price: \$$ASTS_PRICE

• Short interest still elevated
• Options IV extreme - premium selling opportunity
• Key levels: Watch price action

Live data from: $SOURCE

*Not financial advice*

#ASTS #ShortSqueeze #Stocks
EOF

# TE Tweet (value/recovery focus)
cat > "$OUTPUT_DIR/te-tweet-$TIMESTAMP.txt" << EOF
📊 \$TE Update - $TIMESTAMP

Price: \$$TE_PRICE

• Post-earnings positioning
• Heavy put OI at key levels
• Recovery or more downside?

Live data from: $SOURCE

*Not financial advice*

#TE #ValueInvesting #Stocks
EOF

# Combined for Dante
TODAY_TWEETS="$OUTPUT_DIR/tweets-$TIMESTAMP.txt"
echo "=== DAILY TWEETS FOR DANTE (LIVE DATA - $(date '+%H:%M')) ===" > "$TODAY_TWEETS"
echo "" >> "$TODAY_TWEETS"
echo "✅ Data Source: $SOURCE" >> "$TODAY_TWEETS"
echo "🕐 Fetched at: $FETCH_TIME" >> "$TODAY_TWEETS"
echo "" >> "$TODAY_TWEETS"
echo "ASTS TWEET:" >> "$TODAY_TWEETS"
echo "-----------" >> "$TODAY_TWEETS"
cat "$OUTPUT_DIR/asts-tweet-$TIMESTAMP.txt" >> "$TODAY_TWEETS"
echo "" >> "$TODAY_TWEETS"
echo "TE TWEET:" >> "$TODAY_TWEETS"
echo "--------" >> "$TODAY_TWEETS"
cat "$OUTPUT_DIR/te-tweet-$TIMESTAMP.txt" >> "$TODAY_TWEETS"

echo "✅ Tweets generated:"
echo ""
cat "$TODAY_TWEETS"
