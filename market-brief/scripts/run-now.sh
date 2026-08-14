#!/bin/bash
# Manual trigger for Morning Market Brief
# Run this when you want fresh data immediately

cd ~/.openclaw/workspace/market-brief

echo "🔥 Starting Market Brief Scraper..."
echo "================================"

# Get fresh data for ASTS
echo "📊 Scraping ASTS..."
firecrawl scrape "https://finviz.com/quote.ashx?t=ASTS" --only-main-content -o data/ASTS-finviz-$(date +%Y%m%d-%H%M).md 2>/dev/null &
firecrawl scrape "https://finance.yahoo.com/quote/ASTS/news" --only-main-content -o data/ASTS-news-$(date +%Y%m%d-%H%M).md 2>/dev/null &

# Get fresh data for TE
echo "📊 Scraping TE..."
firecrawl scrape "https://finviz.com/quote.ashx?t=TE" --only-main-content -o data/TE-finviz-$(date +%Y%m%d-%H%M).md 2>/dev/null &
firecrawl scrape "https://finance.yahoo.com/quote/TE/news" --only-main-content -o data/TE-news-$(date +%Y%m%d-%H%M).md 2>/dev/null &

wait

echo ""
echo "✅ Scraping complete!"
echo ""

# Generate new brief
bash scripts/generate-brief.sh "$(date +%Y%m%d-%H%M)"

echo ""
echo "🎯 Brief updated!"
echo "📄 View at: file://$HOME/.openclaw/workspace/market-brief/output/latest-brief.html"
echo "🌐 Or in Mission Control: file://$HOME/.openclaw/workspace/MISSION_CONTROL.html"