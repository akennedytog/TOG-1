import fs from 'fs';
import { spawnSync } from 'child_process';

const WORKSPACE = '/Users/aleckennedy/.openclaw/workspace';
const STATE_FILE = `${WORKSPACE}/state.json`;
const injectedText = process.argv.slice(2).join(' ').trim();

if (injectedText) {
  const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  const queue = Array.isArray(state.twitterQueue)
    ? state.twitterQueue
    : Array.isArray(state.queuedPosts)
      ? state.queuedPosts
      : [];
  queue.unshift({
    id: `manual_${Date.now()}`,
    status: 'queued',
    text: injectedText,
    source: 'manual',
    createdAt: new Date().toISOString(),
  });
  state.twitterQueue = queue;
  state.queuedPosts = queue;
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  console.log('📝 Injected manual tweet into queue head');
}

console.log('↪ Delegating to canonical poster: post_tweet.py');
const result = spawnSync('python3', ['post_tweet.py'], {
  cwd: WORKSPACE,
  stdio: 'inherit',
  env: process.env,
});
process.exit(result.status ?? 1);
