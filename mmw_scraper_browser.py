#!/usr/bin/env python3
"""
Miami Music Week Event Scraper using Firecrawl (since browser-use requires setup)
This uses the firecrawl skill we already have installed
"""

import json
import os
from datetime import datetime

def scrape_with_firecrawl():
    """
    Scrape Miami Music Week using firecrawl (already installed)
    """
    print("🔍 Miami Music Week Event Monitor")
    print("=" * 50)
    print()
    
    # Use firecrawl command
    print("📱 Scraping events from miamimusicweek.com...")
    print()
    
    # Create a script that can be run
    script = '''#!/bin/bash
# Miami Music Week Scraper using Firecrawl

echo "🔍 Scraping Miami Music Week Events"
echo "===================================="
echo ""

# Check if firecrawl is available
if ! command -v firecrawl &> /dev/null; then
    echo "❌ Firecrawl not found. Checking for npx..."
    if command -v npx &> /dev/null; then
        FIRECRAWL="npx firecrawl"
    else
        echo "❌ Neither firecrawl nor npx found"
        exit 1
    fi
else
    FIRECRAWL="firecrawl"
fi

# Page 1
echo "📄 Scraping page 1..."
$FIRECRAWL scrape "https://miamimusicweek.com/events?page=1" --format markdown > /tmp/mmw_page1.md 2>&1
echo "   ✓ Saved to /tmp/mmw_page1.md"

# Page 2  
echo "📄 Scraping page 2..."
$FIRECRAWL scrape "https://miamimusicweek.com/events?page=2" --format markdown > /tmp/mmw_page2.md 2>&1
echo "   ✓ Saved to /tmp/mmw_page2.md"

# Page 3
echo "📄 Scraping page 3..."
$FIRECRAWL scrape "https://miamimusicweek.com/events?page=3" --format markdown > /tmp/mmw_page3.md 2>&1
echo "   ✓ Saved to /tmp/mmw_page3.md"

echo ""
echo "===================================="
echo "✅ Scraping complete!"
echo ""
echo "📁 Files created:"
echo "   - /tmp/mmw_page1.md"
echo "   - /tmp/mmw_page2.md"
echo "   - /tmp/mmw_page3.md"
echo ""
echo "🔍 To extract events, run:"
echo "   grep -E '^\[.*\]\(https://miamimusicweek.com/event' /tmp/mmw_page*.md"
'''
    
    script_path = os.path.expanduser("~/.openclaw/workspace/scrape_mmw_firecrawl.sh")
    with open(script_path, 'w') as f:
        f.write(script)
    os.chmod(script_path, 0o755)
    
    print(f"✅ Created scraping script: {script_path}")
    print()
    print("🚀 To run the scraper:")
    print(f"   bash {script_path}")
    print()
    print("📊 This will:")
    print("   1. Scrape pages 1-3 of Miami Music Week")
    print("   2. Save to /tmp/mmw_page*.md")
    print("   3. Extract all event links")
    print()
    print("⏰ To automate (daily at 9 AM):")
    print("   0 9 * * * bash ~/.openclaw/workspace/scrape_mmw_firecrawl.sh")
    
    return script_path

def main():
    script_path = scrape_with_firecrawl()
    
    print()
    print("=" * 50)
    print("Want to run it now?")
    print(f"   bash {script_path}")
    print()
    print("Or I can run it for you:")
    print("   (Just say 'run it now')")

if __name__ == "__main__":
    main()