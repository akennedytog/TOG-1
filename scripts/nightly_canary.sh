#!/bin/bash

# Nightly Canary for Model Routing
# This script tests if the configured default model is working correctly

# Log file
LOG_FILE="/Users/aleckennedy/.openclaw/workspace/logs/canary.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Function to log messages
log_message() {
    echo "[$DATE] $1" >> "$LOG_FILE"
}

# Test the default model
log_message "Starting nightly canary test"

# Try to run a simple test completion with the default model
# This uses the OpenClaw API to test the model
if openclaw tool_call --model default complete "Test completion for canary" > /dev/null 2>&1; then
    log_message "✅ Canary test PASSED - Default model is working"
    exit 0
else
    log_message "❌ Canary test FAILED - Default model is not working"
    # Send alert (you can customize this part)
    echo "Model routing issue detected - please check the configuration" | mail -s "Model Canary Alert" akennedy@theonegroup.info
    exit 1
fi
