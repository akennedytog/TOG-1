#!/bin/bash
# Competitor Monitoring Script
# Uses Firecrawl to track competitors weekly
# Usage: ./scripts/monitor-competitors.sh

set -e

cd "$(dirname "$0")/.."

# Load env
source .env 2>/dev/null || true

DATE=$(date +%Y-%m-%d)
WEEK=$(date +%Y-week-%V)
REPORT_DIR=".firecrawl/competitor-reports"

# Create report directory
mkdir -p "$REPORT_DIR"

echo "🔍 Competitor Monitoring Report - $DATE"
echo "=========================================="
echo ""

# Keywords to track (your market)
KEYWORDS=(
    "AI automation Miami"
    "AI automation Fort Lauderdale" 
    "AI answering service HVAC"
    "AI legal intake Miami"
    "AI medical scheduling Florida"
    "small business AI automation"
)

echo "📊 Searching for competitor activity..."
echo ""

# Search each keyword (past week)
for keyword in "${KEYWORDS[@]}"; do
    echo "🔎 Searching: $keyword"
    
    # Create safe filename
    safe_keyword=$(echo "$keyword" | tr ' ' '-' | tr '[:upper:]' '[:lower:]')
    output_file="$REPORT_DIR/${DATE}-${safe_keyword}.json"
    
    # Run firecrawl search (past week)
    firecrawl search "$keyword" \
        --tbs qdr:w \
        --limit 5 \
        -o "$output_file" \
        --json 2>/dev/null || echo "   ⚠️  Search failed for: $keyword"
    
    # Extract competitor domains from results
    if [ -f "$output_file" ]; then
        echo "   ✅ Results saved"
        
        # Extract unique domains (excluding your own)
        cat "$output_file" | jq -r '.data.web[].url' 2>/dev/null | \
            sed 's|https://||; s|http://||; s|www.||; s|/.*||' | \
            sort -u | \
            grep -v "theonegroup.info" > "$REPORT_DIR/${DATE}-${safe_keyword}-domains.txt" 2>/dev/null || true
    fi
    
    echo ""
done

# Compile weekly report
echo "📈 Generating Weekly Report..."
echo ""

cat > "$REPORT_DIR/${WEEK}-summary.md" << EOF
# Competitor Activity Report - Week ${WEEK}
**Generated:** $(date)

## 🔍 Keywords Tracked
EOF

for keyword in "${KEYWORDS[@]}"; do
    echo "- $keyword" >> "$REPORT_DIR/${WEEK}-summary.md"
done

cat >> "$REPORT_DIR/${WEEK}-summary.md" << EOF

## 📊 Competitor Domains Found

EOF

# Combine all unique domains
find "$REPORT_DIR" -name "${DATE}*-domains.txt" -exec cat {} \; 2>/dev/null | \
    sort -u | \
    while read -r domain; do
        echo "- $domain" >> "$REPORT_DIR/${WEEK}-summary.md"
    done

cat >> "$REPORT_DIR/${WEEK}-summary.md" << EOF

## 📝 Analysis

*Review the individual JSON files for detailed results*

### Key Findings:
EOF

# Count results
result_count=$(find "$REPORT_DIR" -name "${DATE}-*.json" | wc -l)
echo "- **${result_count}** searches completed" >> "$REPORT_DIR/${WEEK}-summary.md"

unique_domains=$(find "$REPORT_DIR" -name "${DATE}*-domains.txt" -exec cat {} \; 2>/dev/null | sort -u | wc -l | xargs)
echo "- **${unique_domains}** unique competitor domains identified" >> "$REPORT_DIR/${WEEK}-summary.md"

cat >> "$REPORT_DIR/${WEEK}-summary.md" << EOF

## 🎯 Recommended Actions

1. Review competitor websites for:
   - Pricing strategies
   - Service offerings
   - Content themes
   - Customer testimonials

2. Identify content gaps where you can differentiate

3. Monitor their social media for engagement tactics

## 📁 Raw Data

See individual JSON files in: \`$REPORT_DIR/\`
EOF

echo "✅ Report generated: $REPORT_DIR/${WEEK}-summary.md"
echo ""
echo "📊 Summary:"
echo "   - Searches: $result_count"
echo "   - Unique domains: ${unique_domains:-0}"
echo ""
echo "💡 Next steps:"
echo "   1. Review: cat $REPORT_DIR/${WEEK}-summary.md"
echo "   2. Scrape competitor sites: firecrawl scrape https://domain.com"
echo "   3. Track changes weekly via cron"
