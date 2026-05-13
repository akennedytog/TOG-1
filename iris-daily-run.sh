#!/bin/bash
# IRIS Daily Email Run - Manual Trigger
# Add to crontab: 0 8 * * * cd ~/.openclaw/workspace && bash iris-daily-run.sh

cd ~/.openclaw/workspace
echo "🚀 IRIS Daily Run - $(date)"

# Check if node is available
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found"
  exit 1
fi

# Run IRIS automation
node iris-auto-email.mjs 2>&1 | tee -a iris-daily.log

echo "✅ Complete - $(date)"
echo "---" >> iris-daily.log
