#!/bin/bash
# Iris Daily Outreach
# Runs at 2:00 PM daily (after leads are processed)

WORKSPACE="/Users/aleckennedy/.openclaw/workspace"
LOG_FILE="$WORKSPACE/logs/iris.log"

echo "========================================" >> "$LOG_FILE"
echo "📧 Iris Daily Run - $(date)" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"

cd "$WORKSPACE" || exit 1

# Run Iris
python3 agents/iris_outreach.py >> "$LOG_FILE" 2>&1
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Iris completed successfully at $(date)" >> "$LOG_FILE"
else
    echo "❌ Iris failed with exit code $EXIT_CODE at $(date)" >> "$LOG_FILE"
fi

echo "" >> "$LOG_FILE"
exit $EXIT_CODE