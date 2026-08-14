#!/bin/bash
# Daily AI Job Search Wrapper
# Runs the Python job search script and logs results

cd /Users/aleckennedy/.openclaw/workspace

# Log start
echo "[$(date)] Starting daily job search" >> /Users/aleckennedy/.openclaw/workspace/job_search.log

# Run the Python script
python3 daily_job_search.py >> /Users/aleckennedy/.openclaw/workspace/job_search.log 2>&1

# Log completion
echo "[$(date)] Job search complete" >> /Users/aleckennedy/.openclaw/workspace/job_search.log
echo "---" >> /Users/aleckennedy/.openclaw/workspace/job_search.log
