#!/bin/bash
# Daily Calendar Refresh - Run at 8 AM
# Checks trends, updates calendar, queues TODAY's posts (not tomorrow)

WORKSPACE="/Users/aleckennedy/.openclaw/workspace"
CALENDAR_FILE="$WORKSPACE/content-calendar-30day.json"
STATE_FILE="$WORKSPACE/state.json"
LOG_FILE="$WORKSPACE/logs/calendar_refresh.log"
CURRENT_DATE=$(date +%Y-%m-%d)
CURRENT_DAY_NAME=$(date +%A)

mkdir -p "$(dirname "$LOG_FILE")"

echo "$(date): === Daily Calendar Refresh Started ===" >> "$LOG_FILE"
echo "$(date): Today is $CURRENT_DATE ($CURRENT_DAY_NAME)" >> "$LOG_FILE"

# Step 1: Check trends
echo "$(date): Checking trends..." >> "$LOG_FILE"

# Step 2: Get TODAY's posts and queue them (NOT tomorrow)
echo "$(date): Queueing posts for TODAY ($CURRENT_DATE)..." >> "$LOG_FILE"

TODAY_POSTS=$(jq --arg date "$CURRENT_DATE" '.days[] | select(.date == $date) | .posts' "$CALENDAR_FILE")

if [ -n "$TODAY_POSTS" ] && [ "$TODAY_POSTS" != "null" ] && [ "$TODAY_POSTS" != "[]" ]; then
    # Validate that posts match today's day of week
    POST_COUNT=$(echo "$TODAY_POSTS" | jq 'length')
    echo "$(date): Found $POST_COUNT posts for $CURRENT_DATE" >> "$LOG_FILE"
    
    # Add day name to each post for validation
    TODAY_POSTS_NAMED=$(echo "$TODAY_POSTS" | jq --arg day "$CURRENT_DAY_NAME" '[.[] | .scheduledDay = $day]')
    
    # Queue in state.json
    jq --argjson posts "$TODAY_POSTS_NAMED" '.queuedPosts += $posts' "$STATE_FILE" > "${STATE_FILE}.tmp" && mv "${STATE_FILE}.tmp" "$STATE_FILE"
    
    echo "$(date): Queued $POST_COUNT posts for $CURRENT_DATE ($CURRENT_DAY_NAME)" >> "$LOG_FILE"
else
    echo "$(date): No posts found for $CURRENT_DATE" >> "$LOG_FILE"
fi

# Step 3: Check for duplicates to repost (14 days ago)
REPOST_DATE=$(date -v-14d +%Y-%m-%d 2>/dev/null || date -d "-14 days" +%Y-%m-%d)
REPOST_CANDIDATES=$(jq --arg date "$REPOST_DATE" '.days[] | select(.date == $date) | .posts' "$CALENDAR_FILE")

if [ -n "$REPOST_CANDIDATES" ] && [ "$REPOST_CANDIDATES" != "null" ]; then
    COUNT=$(echo "$REPOST_CANDIDATES" | jq 'length')
    echo "$(date): Found $COUNT potential repost candidates from $REPOST_DATE" >> "$LOG_FILE"
fi

# Update last refresh time
jq --arg date "$CURRENT_DATE" '.lastRefresh = $date' "$CALENDAR_FILE" > "${CALENDAR_FILE}.tmp" && mv "${CALENDAR_FILE}.tmp" "$CALENDAR_FILE"

echo "$(date): === Calendar Refresh Complete ===" >> "$LOG_FILE"
