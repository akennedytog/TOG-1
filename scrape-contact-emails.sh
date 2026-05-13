#!/bin/bash
# Scrape contact pages for actual email addresses using browser-use

echo "🌐 Scraping contact pages for verified emails..."
echo ""

BROWSER_USE="/tmp/browser-use/.venv/bin/browser-use"

# Top 10 leads to scrape
WEBSITES=(
  "https://rci-air.com/contact"
  "https://trinityac.com/contact-us" 
  "https://www.panthermiami.com/contact"
  "https://www.gtlaw.com/en/offices/miami"
  "https://www.akerman.com/en/locations/united-states/miami.html"
  "https://aglawoffices.com/contact"
  "https://kaufmanrossin.com/contact-us"
  "https://miamidentalgroup.com/contact"
  "https://www.mgccpa.net/contact"
  "https://rossmedicalgroup.com/contact-us"
)

OUTPUT_FILE="/Users/aleckennedy/.openclaw/workspace/scraped-emails.txt"
echo "Scraped Emails - $(date)" > "$OUTPUT_FILE"
echo "=========================================" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

for WEBSITE in "${WEBSITES[@]}"; do
  echo "🔍 Scraping: $WEBSITE"
  
  # Extract domain for logging
  DOMAIN=$(echo "$WEBSITE" | sed 's|https://||' | sed 's|www.||' | cut -d'/' -f1)
  
  # Use browser-use to get page content and grep for emails
  # Note: Using AKennedy Chrome profile as per your config
  PAGE_CONTENT=$($BROWSER_USE scrape "$WEBSITE" 2>/dev/null | head -100)
  
  # Extract emails using regex
  EMAILS=$(echo "$PAGE_CONTENT" | grep -oE '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' | sort -u)
  
  if [ -n "$EMAILS" ]; then
    echo "✅ Found emails for $DOMAIN:"
    echo "$EMAILS" | while read email; do
      echo "   📧 $email"
      echo "$DOMAIN: $email" >> "$OUTPUT_FILE"
    done
  else
    echo "⚠️ No emails found on $DOMAIN contact page"
    echo "$DOMAIN: NO_EMAIL_FOUND" >> "$OUTPUT_FILE"
  fi
  
  echo ""
  sleep 2  # Rate limiting
done

echo "✅ Scraping complete!"
echo "📁 Results saved to: $OUTPUT_FILE"
echo ""
cat "$OUTPUT_FILE"
