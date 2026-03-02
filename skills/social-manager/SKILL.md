# social-manager Skill

Description:
Automated Social-Media Manager supporting multiple platforms (X, LinkedIn, Mastodon) using OpenClaw.

Commands:

1. `social-manager init`  
   Scaffold a multi-platform social manager project with config stubs for each platform.

2. `social-manager post [--platform PLATFORM] [--file MESSAGE_FILE] [--schedule SCHEDULE]`  
   Schedule or immediately post a message to the specified platform.

3. `social-manager engage [--platform PLATFORM] [--tags TAGS...] [--limit N]`  
   Auto-like or reply to posts matching hashtags/page queries, with budget controls.

4. `social-manager metrics [--platform PLATFORM] [--since DAYS]`  
   Fetch engagement metrics (likes, comments, follower growth) for reporting.

Inputs:
- `.env` with API keys/tokens for each platform
- `message.txt` or JSON templates

Outputs:
- Scheduled tasks, engagement logs, metrics CSV exports

Examples:

  # Initialize project
  > openclaw social-manager init

  # Schedule todays post to X
  > openclaw social-manager post --platform x --file today.txt --schedule "2026-03-02T10:00:00"

  # Engage on Mastodon
  > openclaw social-manager engage --platform mastodon --tags AI,OpenClawAI --limit 10

Dependencies:
- twitter-api-v2
- Mastodon.js
- LinkedIn API SDK (community)
