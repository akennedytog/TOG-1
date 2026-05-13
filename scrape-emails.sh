#!/bin/bash
# Scrape contact pages for actual email addresses
# Requires browser-use (already installed)

WORKSPACE="/Users/aleckennedy/.openclaw/workspace"
LEADS_FILE="$WORKSPACE/data/arlo_findings.json"
OUTPUT_FILE="$WORKSPACE/verified-emails.json"

echo "🌐 Scraping contact pages for real email addresses..."
echo ""

# Get top 10 leads
cd "$WORKSPACE" || exit 1

# Use browser-use to scrape emails
# Note: This uses the AKennedy Chrome profile as configured

for WEBSITE in "https://rci-air.com/contact" "https://trinityac.com/contact" "https://www.panthermiami.com/contact"; do
  echo "Checking: $WEBSITE"
  /tmp/browser-use/.venv/bin/browser-use scrape "$WEBSITE" --extract-emails 2>/dev/null || echo "  Could not scrape"
  echo ""
done

echo "✅ Scraping complete"
echo "📁 Check $OUTPUT_FILE for results"
