import dotenv from 'dotenv';
import { spawn } from 'child_process';

dotenv.config({ path: new URL('./.env', import.meta.url).pathname });

const WORKSPACE = '/Users/aleckennedy/.openclaw/workspace';
const RUN_EVERY_MS = 60 * 60 * 1000;

let running = false;

function runOnce(reason) {
  if (running) {
    console.log(`[skip] post already running (${reason})`);
    return;
  }

  running = true;
  console.log(`[${new Date().toISOString()}] run started (${reason})`);

  const child = spawn('python3', ['post_tweet.py'], {
    cwd: WORKSPACE,
    env: process.env,
    stdio: 'inherit',
  });

  child.on('exit', (code) => {
    running = false;
    console.log(`[${new Date().toISOString()}] run finished (exit ${code ?? 1})`);
  });

  child.on('error', (error) => {
    running = false;
    console.error(`[runner] failed to start: ${error.message}`);
  });
}

process.on('SIGUSR1', () => runOnce('signal'));

console.log('[start] twitter-automation scheduler started');
console.log('[deprecated] posting logic moved to post_tweet.py');
console.log(`[config] interval: ${RUN_EVERY_MS / 60000} minutes`);

runOnce('startup');
setInterval(() => runOnce('interval'), RUN_EVERY_MS);
