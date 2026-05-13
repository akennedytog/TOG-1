// twitter-automation.js (ESM) - POSTING ONLY VERSION
// TheOneGroupAI Twitter Automation - Simplified for cost efficiency
// Posts only - no search/engagement to save API credits

import dotenv from 'dotenv';
import { TwitterApi } from 'twitter-api-v2';
import fs from 'fs';
import path from 'path';

// --- Load .env next to this file ---
dotenv.config({ path: new URL('./.env', import.meta.url).pathname });

console.log('[env] loaded keys:', {
  apiKey: Boolean(process.env.TWITTER_API_KEY),
  apiSecret: Boolean(process.env.TWITTER_API_SECRET),
  accessToken: Boolean(process.env.TWITTER_ACCESS_TOKEN),
  accessSecret: Boolean(process.env.TWITTER_ACCESS_SECRET),
  userId: Boolean(process.env.TWITTER_USER_ID),
});

console.log('LOADED FILE:', import.meta.url);

// ---------- Config ----------
const RUN_EVERY_MS = 60 * 60 * 1000; // Check queue every hour (was 15 min)
const MAX_POSTS_PER_RUN = 1; // Post max 1 per hour to avoid spam

const STATE_FILE = path.resolve(process.cwd(), 'state.json');
const ANALYTICS_FILE = path.resolve(process.cwd(), 'twitter-analytics.json');

// ---------- Required Env ----------
const userId = String(process.env.TWITTER_USER_ID || '');

// ---------- Twitter Client ----------
const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});
const rwClient = client.readWrite;

// ---------- State Management ----------
function loadState() {
  try {
    const raw = fs.readFileSync(STATE_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { queuedPosts: [], lastPostTime: null };
  }
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// ---------- Analytics Tracking ----------
function loadAnalytics() {
  try {
    return JSON.parse(fs.readFileSync(ANALYTICS_FILE, 'utf-8'));
  } catch {
    return {
      dailyStats: {},
      totalTweets: 0,
      engagementLog: [],
      startDate: new Date().toISOString(),
    };
  }
}

function saveAnalytics(analytics) {
  fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(analytics, null, 2));
}

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

function logTweet(analytics, text, tweetId) {
  const today = getTodayKey();
  if (!analytics.dailyStats[today]) {
    analytics.dailyStats[today] = { tweets: 0 };
  }
  analytics.dailyStats[today].tweets++;
  analytics.totalTweets++;
  analytics.engagementLog.push({
    type: 'tweet',
    text: text.substring(0, 100),
    tweetId,
    timestamp: new Date().toISOString(),
  });
  saveAnalytics(analytics);
}

// ---------- Main Logic - POSTING ONLY ----------
async function runOnce() {
  console.log(`[${new Date().toISOString()}] Run started`);

  const state = loadState();
  const analytics = loadAnalytics();

  // Check if we have posts in queue
  if (!Array.isArray(state.queuedPosts) || state.queuedPosts.length === 0) {
    console.log('[queue] No posts queued');
    return;
  }

  // Rate limit: Don't post more than once per hour
  const now = Date.now();
  const lastPost = state.lastPostTime ? parseInt(state.lastPostTime) : 0;
  const hoursSinceLastPost = (now - lastPost) / (60 * 60 * 1000);

  if (hoursSinceLastPost < 1) {
    console.log(`[rate] Last post was ${hoursSinceLastPost.toFixed(2)}h ago. Waiting...`);
    console.log(`[queue] ${state.queuedPosts.length} posts waiting`);
    return;
  }

  const postData = state.queuedPosts[0];
  
  // Handle various post formats safely
  let postText;
  if (typeof postData === 'string') {
    postText = postData;
  } else if (postData && typeof postData === 'object') {
    postText = postData.text || postData.content || JSON.stringify(postData);
  } else {
    console.error(`[tweet] Invalid post data format: ${typeof postData}`);
    // Remove invalid post from queue
    state.queuedPosts.shift();
    saveState(state);
    return;
  }
  
  // Ensure postText is a string
  if (typeof postText !== 'string') {
    console.error(`[tweet] Post text is not a string: ${typeof postText}`);
    state.queuedPosts.shift();
    saveState(state);
    return;
  }
  console.log(`[tweet] Posting: ${postText.substring(0, 60)}...`);

  try {
    const result = await rwClient.v2.tweet(postText);
    console.log(`[tweet] ✅ Posted! ID: ${result.data.id}`);

    // Update state
    state.queuedPosts.shift();
    state.lastPostTime = now.toString();
    saveState(state);

    // Log analytics
    logTweet(analytics, postText, result.data.id);

    console.log(`[analytics] Today's tweets: ${analytics.dailyStats[getTodayKey()]?.tweets || 0}`);
    console.log(`[queue] ${state.queuedPosts.length} posts remaining`);

  } catch (err) {
    console.error(`[tweet] ❌ Failed: ${err.message}`);
    if (err.code === 403) {
      console.error('[tweet] Rate limited or billing cap reached. Will retry later.');
    }
  }

  console.log(`[${new Date().toISOString()}] Run finished`);
}

// ---------- Schedule ----------
console.log('[start] Twitter bot started (POSTING ONLY mode)');
console.log(`[config] Checking queue every ${RUN_EVERY_MS / 60000} minutes`);
console.log(`[config] Max ${MAX_POSTS_PER_RUN} post per hour`);

// Run immediately on startup
runOnce().catch((e) => console.error('[startup error]', e));

// Then schedule
setInterval(() => runOnce().catch((e) => console.error('[interval error]', e)), RUN_EVERY_MS);
