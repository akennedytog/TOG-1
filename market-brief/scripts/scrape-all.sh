#!/bin/bash
# Morning Market Brief Scraper
# Runs daily at 7 AM EST

TICKERS=("ASTS" "TE")
DATA_DIR="$HOME/.openclaw/workspace/market-brief/data"
TIMESTAMP=$(date +"%Y-%m-%d-%H%M")

echo "🔥 Starting Market Brief Scraper - $TIMESTAMP"

for TICKER in "${TICKERS[@]}"; do
  echo "📊 Scraping $TICKER..."
  
  # Finviz - Technicals, insider, analyst ratings
  firecrawl scrape "https://finviz.com/quote.ashx?t=$TICKER" \
    --only-main-content \
    -o "$DATA_DIR/$TICKER-finviz-$TIMESTAMP.md" 2>/dev/null &
  
  # Yahoo Finance - News
  firecrawl scrape "https://finance.yahoo.com/quote/$TICKER/news" \
    --only-main-content \
    -o "$DATA_DIR/$TICKER-yahoo-news-$TIMESTAMP.md" 2>/dev/null &
  
  # Yahoo Finance - Options (for unusual volume)
  firecrawl scrape "https://finance.yahoo.com/quote/$TICKER/options" \
    --only-main-content \
    -o "$DATA_DIR/$TICKER-yahoo-options-$TIMESTAMP.md" 2>/dev/null &
  
  # TradingView - Technical analysis
  firecrawl scrape "https://www.tradingview.com/symbols/NASDAQ-$TICKER/" \
    --only-main-content \
    -o "$DATA_DIR/$TICKER-tv-$TIMESTAMP.md" 2>/dev/null &
done

# Market-wide data
firecrawl scrape "https://finviz.com/news.ashx" \
  --only-main-content \
  -o "$DATA_DIR/market-news-$TIMESTAMP.md" 2>/dev/null &

wait
echo "✅ Scraping complete!"

# Generate brief
$HOME/.openclaw/workspace/market-brief/scripts/generate-brief.sh "$TIMESTAMP"