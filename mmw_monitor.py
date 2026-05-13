#!/usr/bin/env python3
"""
Miami Music Week Event Monitor
Uses browser-use to scrape and compare events
"""

import json
import os
from datetime import datetime

# Try to import browser-use
# If not available, we'll create a shell script version

def check_browser_use():
    """Check if browser-use CLI is available"""
    result = os.system("which browser-use > /dev/null 2>&1")
    return result == 0

def scrape_mmw_events():
    """
    Scrape Miami Music Week events using browser-use
    This creates a script that the user can run
    """
    
    script = '''
#!/bin/bash
# MMW Event Monitor Script
# Generated: {timestamp}

echo "🔍 Miami Music Week Event Monitor"
echo "=================================="
echo ""

# Step 1: Open the site
echo "1️⃣  Opening Miami Music Week events..."
browser-use open "https://miamimusicweek.com/events?page=1"
sleep 3

# Step 2: Get page state
echo ""
echo "2️⃣  Getting page state..."
browser-use state > /tmp/mmw_page1_state.txt
echo "   ✓ Saved to /tmp/mmw_page1_state.txt"

# Step 3: Extract visible events
echo ""
echo "3️⃣  Extracting events from page 1..."
browser-use extract "List all event names, venues, dates, and prices visible on this page" > /tmp/mmw_page1_events.txt
echo "   ✓ Saved to /tmp/mmw_page1_events.txt"

# Step 4: Check for next page
echo ""
echo "4️⃣  Checking for next page..."
NEXT_BUTTON=$(browser-use state | grep -i "next" | head -1)
if [ ! -z "$NEXT_BUTTON" ]; then
    echo "   Found next page button"
    echo "   To navigate: browser-use click [button number from state]"
else
    echo "   No next page button found (might need to scroll)"
fi

# Step 5: Compare with existing
echo ""
echo "5️⃣  Comparing with existing events..."
if [ -f "~/.openclaw/workspace/mmw-events/events.json" ]; then
    echo "   Current events: $(cat ~/.openclaw/workspace/mmw-events/events.json | grep '"name"' | wc -l)"
    echo "   New events extracted: $(cat /tmp/mmw_page1_events.txt | grep -c 'event\|party\|festival\|showcase' || echo '0')"
else
    echo "   No existing events file found"
fi

echo ""
echo "=================================="
echo "✅ Monitoring complete!"
echo ""
echo "📁 Files created:"
echo "   - /tmp/mmw_page1_state.txt (page structure)"
echo "   - /tmp/mmw_page1_events.txt (extracted events)"
echo ""
echo "🔄 To check for new events:"
echo "   1. Run this script daily: bash /tmp/mmw_monitor.sh"
echo "   2. Compare /tmp/mmw_page1_events.txt with current list"
echo "   3. Add new events to your website"
'''.format(timestamp=datetime.now().isoformat())
    
    # Save the script
    script_path = os.path.expanduser("~/.openclaw/workspace/mmw_monitor.sh")
    with open(script_path, 'w') as f:
        f.write(script)
    os.chmod(script_path, 0o755)
    
    return script_path

def create_monitoring_schedule():
    """Create a cron job for daily monitoring"""
    cron_cmd = "0 9 * * * cd ~/.openclaw/workspace && bash mmw_monitor.sh >> mmw_monitor.log 2>&1"
    
    print("To set up daily monitoring, add this to your crontab:")
    print(f"  {cron_cmd}")
    print("")
    print("Or run manually:")
    print("  bash ~/.openclaw/workspace/mmw_monitor.sh")

def main():
    print("🔍 Miami Music Week Event Monitor")
    print("=" * 50)
    print("")
    
    # Check browser-use
    if check_browser_use():
        print("✅ browser-use CLI found")
    else:
        print("⚠️  browser-use CLI not found")
        print("   Install with: pip install browser-use")
        return
    
    print("")
    print("📄 Creating monitoring script...")
    
    script_path = scrape_mmw_events()
    
    print(f"✅ Script created: {script_path}")
    print("")
    print("🚀 Next steps:")
    print("   1. Run the script: bash mmw_monitor.sh")
    print("   2. Review extracted events")
    print("   3. Add new events to your website")
    print("")
    
    # Show monitoring options
    create_monitoring_schedule()
    
    print("")
    print("💡 Pro tip: Set up a GitHub Action or cron job")
    print("   to run this automatically every morning!")

if __name__ == "__main__":
    main()