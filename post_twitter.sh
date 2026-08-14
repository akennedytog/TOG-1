#!/bin/bash
# Deprecated compatibility shim.
# Canonical poster: post_tweet.py

set -euo pipefail

WORKSPACE="/Users/aleckennedy/.openclaw/workspace"

if [[ -f "$WORKSPACE/.env" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$WORKSPACE/.env"
  set +a
fi

cd "$WORKSPACE"
echo "[deprecated] post_twitter.sh -> post_tweet.py"
python3 post_tweet.py
