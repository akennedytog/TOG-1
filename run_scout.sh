#!/bin/bash
# Scout Agent - Daily Sales Intelligence Run (OPTIMIZED)
# Run this every morning at 8 AM to generate route and briefing

WORKSPACE="/Users/aleckennedy/.openclaw/workspace"
SCOUT_DIR="$WORKSPACE/agents"
OUTPUT_DIR="$WORKSPACE/data/scout_output"
LOG_FILE="$WORKSPACE/logs/scout.log"

# Create directories
mkdir -p "$OUTPUT_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

echo "$(date): === Scout Daily Run Started ===" >> "$LOG_FILE"

# Check if data exists
if [ ! -d "$WORKSPACE/data/sales_reports" ]; then
    echo "$(date): ⚠️ No sales data directory found." >> "$LOG_FILE"
    exit 1
fi

# Run Scout Agent (OPTIMIZED - uses caching)
echo "$(date): 🎯 Running Scout Agent (Optimized v3.1)..." >> "$LOG_FILE"
cd "$WORKSPACE" && python3 agents/scout_bf.py >> "$LOG_FILE" 2>&1

if [ $? -eq 0 ]; then
    echo "$(date): ✅ Scout completed successfully" >> "$LOG_FILE"
    
    # Send email briefing (if configured)
    if [ -f "$OUTPUT_DIR/briefing_latest.json" ]; then
        echo "$(date): 📧 Briefing generated, ready for email" >> "$LOG_FILE"
        
        # Send email using gog skill
        if command -v gog &> /dev/null; then
            echo "$(date): 📤 Sending email..." >> "$LOG_FILE"
            # Email will be sent by scout_emailer.py or cron
        fi
    fi
else
    echo "$(date): ❌ Scout failed" >> "$LOG_FILE"
    exit 1
fi

echo "$(date): === Scout Run Complete ===" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
