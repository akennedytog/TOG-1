#!/usr/bin/env node
import { spawnSync } from 'child_process';

const WORKSPACE = '/Users/aleckennedy/.openclaw/workspace';
console.log('⚠️ post-evening-job.js is deprecated. Using post_tweet.py.');
const result = spawnSync('python3', ['post_tweet.py'], {
  cwd: WORKSPACE,
  stdio: 'inherit',
  env: process.env,
});
process.exit(result.status ?? 1);
