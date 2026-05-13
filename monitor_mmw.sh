#!/bin/bash
# Miami Music Week Event Monitor
# Uses browser-use to check for new events

echo "🔍 Monitoring Miami Music Week for new events..."
echo ""

# Check if browser-use is installed
if ! command -v browser-use &> /dev/null; then
    echo "❌ browser-use not found. Installing..."
    pip install browser-use
fi

# Navigate to the events page
echo "📱 Opening Miami Music Week events page..."
browser-use open "https://miamimusicweek.com/events"

# Wait for page to load
sleep 3

# Get current state
echo "📊 Getting page state..."
browser-use state > /tmp/mmw_current_state.txt

# Count events on page
echo ""
echo "✅ Page loaded successfully!"
echo ""
echo "To extract events, run:"
echo "  browser-use extract 'event names, venues, dates, prices'"
echo ""
echo "To take a screenshot:"
echo "  browser-use screenshot mmw_events_$(date +%Y%m%d).png"
echo ""
echo "To navigate to next page:"
echo "  browser-use click [button_index]"
echo ""
echo "Browser session is active. Run commands above to extract data."
echo ""
echo "💡 Tip: Compare extracted events with your current list:"
echo "  diff /tmp/mmw_extracted_events.txt ~/.openclaw/workspace/mmw_events_current.txt"