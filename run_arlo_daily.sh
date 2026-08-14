#!/bin/bash
# Arlo Daily Lead Research (REAL - Tavily + local LLM extraction)
# Runs at 9:00 AM daily

WORKSPACE="/Users/aleckennedy/.openclaw/workspace"
LOG_FILE="$WORKSPACE/logs/arlo.log"

echo "========================================" >> "$LOG_FILE"
echo "🤖 Arlo REAL Run - $(date)" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"

cd "$WORKSPACE" || exit 1

python3 agents/arlo_real.py >> "$LOG_FILE" 2>&1
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Arlo REAL completed at $(date)" >> "$LOG_FILE"
    # Enrich: find websites + emails
    python3 scripts/enrich_leads.py >> "$LOG_FILE" 2>&1 \
        && echo "🔬 Enrichment complete at $(date)" >> "$LOG_FILE" \
        || echo "⚠️ Enrichment failed at $(date)" >> "$LOG_FILE"
    # Draft outreach (Gmail drafts only, never sends)
    python3 agents/iris_real.py >> "$LOG_FILE" 2>&1 \
        && echo "✉️ Iris drafts complete at $(date)" >> "$LOG_FILE" \
        || echo "⚠️ Iris failed at $(date)" >> "$LOG_FILE"
    python3 scripts/arlo_sheets_sync.py >> "$LOG_FILE" 2>&1 \
        && echo "📊 Sheet sync complete at $(date)" >> "$LOG_FILE" \
        || echo "⚠️ Sheet sync failed at $(date)" >> "$LOG_FILE"
else
    echo "❌ Arlo failed with exit code $EXIT_CODE at $(date)" >> "$LOG_FILE"
fi

echo "" >> "$LOG_FILE"
exit $EXIT_CODE
