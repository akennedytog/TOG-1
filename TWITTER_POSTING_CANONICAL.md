# Twitter Posting Canonical Flow

## Canonical Entrypoint
- `python3 post_tweet.py`
- Fresh content source: `python3 content_refresh_v2.py`

## Current Contract
- Queue source: `state.json` -> `twitterQueue` (with `queuedPosts` mirrored for compatibility)
- Credentials: environment variables from `.env`
- Daily rollover: managed in `post_tweet.py`

## Compatibility Shims (deprecated)
These paths still work but only delegate to `post_tweet.py`:
- `post-from-queue.mjs`
- `post-now.js`
- `post-now.mjs`
- `post-today.js`
- `post-evening-job.js`
- `post-evening.mjs`
- `post_twitter.sh`
- `twitter-automation.js` (scheduler wrapper)
- `run-twitter-automation.sh`

## Archived Implementations
Archived copies are in `legacy/twitter-posting/`.
