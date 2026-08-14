#!/usr/bin/env node
/**
 * Compatibility shim.
 * Canonical poster: post_tweet.py
 */

import fs from 'fs';
import { spawnSync } from 'child_process';

const WORKSPACE = '/Users/aleckennedy/.openclaw/workspace';
const STATE_FILE = `${WORKSPACE}/state.json`;
const DRY_RUN = process.argv.includes('--dry-run');

if (DRY_RUN) {
  try {
    const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    const queue = Array.isArray(state.twitterQueue)
      ? state.twitterQueue
      : Array.isArray(state.queuedPosts)
        ? state.queuedPosts
        : [];
    if (queue.length === 0) {
      console.log('ℹ️ No posts in queue');
      process.exit(0);
    }
    const nextPost = queue[0];
    const text = typeof nextPost === 'string' ? nextPost : nextPost?.text || '';
    console.log('🔍 DRY RUN - Next queued post:');
    console.log(text);
    process.exit(0);
  } catch (error) {
    console.error(`❌ Failed dry run: ${error.message}`);
    process.exit(1);
  }
}

console.log('↪ Delegating to canonical poster: post_tweet.py');
const result = spawnSync('python3', ['post_tweet.py'], {
  cwd: WORKSPACE,
  stdio: 'inherit',
  env: process.env,
});
process.exit(result.status ?? 1);
