#!/bin/bash
# Cron wrapper for Supercharged Daily Run
# This replaces the old content_refresh with the full intelligence pipeline

export HOME=/Users/aleckennedy
export PATH="$HOME/.local/bin:$PATH"
export OPENCLAW_WORKSPACE="$HOME/.openclaw/workspace"

cd "$OPENCLAW_WORKSPACE"

# Load environment
if [ -f "$HOME/.openclaw/.env" ]; then
    export $(grep -v '^#' "$HOME/.openclaw/.env" | xargs)
fi

# Run the supercharged pipeline
/usr/bin/python3 "$OPENCLAW_WORKSPACE/daily_supercharged_run.py" > "$OPENCLAW_WORKSPACE/logs/supercharged_$(date +%Y%m%d_%H%M%S).log" 2>&1

# Exit with success
exit 0
