#!/bin/bash
# Universal price loader - Source this in other scripts
# Usage: source _load_prices.sh

LIVE_PRICES="$HOME/.openclaw/workspace/market-brief/output/live-prices.json"

# Load live prices
if [ -f "$LIVE_PRICES" ]; then
  ASTS_PRICE=$(cat "$LIVE_PRICES" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['asts']['price'])" 2>/dev/null)
  TE_PRICE=$(cat "$LIVE_PRICES" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['te']['price'])" 2>/dev/null)
  PRICE_SOURCE=$(cat "$LIVE_PRICES" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['source'])" 2>/dev/null)
  
  # Validate prices
  if [ -z "$ASTS_PRICE" ] || [ "$ASTS_PRICE" = "null" ] || [ "$ASTS_PRICE" = "" ]; then
    ASTS_PRICE="89.58"
    TE_PRICE="8.70"
    PRICE_SOURCE="fallback"
  fi
else
  ASTS_PRICE="89.58"
  TE_PRICE="8.70"
  PRICE_SOURCE="fallback (no file)"
fi

export ASTS_PRICE TE_PRICE PRICE_SOURCE
