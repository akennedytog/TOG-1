#!/bin/bash
# Dante Daily Content Creation
# Runs at 8:00 AM daily

WORKSPACE="/Users/aleckennedy/.openclaw/workspace"
LOG_FILE="$WORKSPACE/logs/dante.log"

echo "========================================" >> "$LOG_FILE"
echo "🎨 Dante Daily Run - $(date)" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"

cd "$WORKSPACE" || exit 1

# Run Dante
python3 agents/dante.py >> "$LOG_FILE" 2>&1
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Dante completed successfully at $(date)" >> "$LOG_FILE"
else
    echo "❌ Dante failed with exit code $EXIT_CODE at $(date)" >> "$LOG_FILE"
fi

echo "" >> "$LOG_FILE"
exit $EXIT_CODE