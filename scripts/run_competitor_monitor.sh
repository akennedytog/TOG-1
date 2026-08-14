#!/bin/bash
# The One Group - Competitor Intelligence Monitor
# Run daily to check all monitored competitors

WORKSPACE="$HOME/.openclaw/workspace"
LOG_FILE="$WORKSPACE/logs/competitor-intel.log"
ALERTS_DIR="$WORKSPACE/products/competitor-intel/data/alerts"

mkdir -p "$WORKSPACE/logs"
mkdir -p "$ALERTS_DIR"

echo "=== Competitor Intelligence Check ===" | tee -a "$LOG_FILE"
echo "Started at $(date)" | tee -a "$LOG_FILE"

cd "$WORKSPACE/products/competitor-intel"

# Run full check
python3 monitor_service.py run > /tmp/competitor_results.json 2>&1

# Check if any alerts were generated
if [ -s /tmp/competitor_results.json ]; then
    changes=$(python3 -c "import json; d=json.load(open('/tmp/competitor_results.json')); print(d.get('changes_detected', 0))")
    
    if [ "$changes" -gt 0 ]; then
        echo "🚨 ALERT: $changes changes detected!" | tee -a "$LOG_FILE"
        
        # Generate alert summary
        cat > "$ALERTS_DIR/alert_$(date +%Y%m%d_%H%M%S).md" << ALERT
# Competitor Alert Summary

**Date:** $(date)
**Changes Detected:** $changes

## Details

\`\`\`json
$(cat /tmp/competitor_results.json)
\`\`\`

## Recommended Actions

1. Review detected changes
2. Assess competitive impact
3. Update positioning if needed
4. Consider counter-moves

ALERT
        
        # TODO: Send notification (Slack/email)
        # echo "Competitor alert: $changes changes" | openclaw skills run slack --channel="#alerts"
    else
        echo "✅ No changes detected" | tee -a "$LOG_FILE"
    fi
fi

echo "Done at $(date)" | tee -a "$LOG_FILE"
