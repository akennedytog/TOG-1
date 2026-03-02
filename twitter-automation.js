// twitter-automation.js (ESM)
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
const HASHTAGS = ['OpenClawAI', 'AgentSkills']; // NO "#" here
const SEARCH_MAX_RESULTS = 20;
const MAX_ACTIONS_PER_RUN = 5; // like/reply/tweet each count as 1
const RUN_EVERY_MS = 15 * 60 * 1000;

const REPLY_TEXT = 'Great insights on AI—thanks for sharing! 🚀';

const STATE_FILE = path.resolve(process.cwd(), 'state.json');
const MAX_SEEN_TWEETS = 1500;
const MAX_COMMENT_LOG = 1500;

// ---------- Required Env ----------
const requiredEnv = [
  'TWITTER_API_KEY',
  'TWITTER_API_SECRET',
  'TWITTER_ACCESS_TOKEN',
  'TWITTER_ACCESS_SECRET',
  'TWITTER_USER_ID',
];

let missing = false;
for (const k of requiredEnv) {
  if (!process.env[k]) {
    console.error(`[config] Missing env var: ${k}`);
    missing = true;
  }
}
if (missing) {
  console.error('[config] Missing env vars — bot will likely fail until fixed.');
}

const userId = String(process.env.TWITTER_USER_ID || '');

// ---------- Twitter Client ----------
const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});
const rwClient = client.readWrite;

// ---------- X API Credit Guard ----------
let creditsBlockedUntil = 0;

function isCreditsDepleted(err) {
  const data = err?.data || err?.response?.data || err;
  return (
    data?.title === 'CreditsDepleted' ||
    data?.type === 'https://api.twitter.com/2/problems/credits'
  );
}

function blockCredits(hours = 6) {
  creditsBlockedUntil = Date.now() + hours * 60 * 60 * 1000;
  console.error(`[x] Credits depleted. Blocking search/post calls for ${hours} hours.`);
}

function creditsBlocked() {
  return Date.now() < creditsBlockedUntil;
}

// ---------- State ----------
function loadState() {
  try {
    const raw = fs.readFileSync(STATE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);

    const migrated = {
      queuedPosts: Array.isArray(parsed.queuedPosts) ? parsed.queuedPosts : [],
      seenTweetIds: Array.isArray(parsed.seenTweetIds) ? parsed.seenTweetIds : [],
      follows: Array.isArray(parsed.follows) ? parsed.follows : [],
      comments: Array.isArray(parsed.comments) ? parsed.comments : [],
      posts: parsed.posts, // legacy
    };

    // Migrate legacy `posts`
    if (Array.isArray(parsed.posts) && parsed.posts.length) {
      for (const item of parsed.posts) {
        if (typeof item !== 'string') continue;
        if (/^\d{5,}$/.test(item)) {
          if (!migrated.seenTweetIds.includes(item)) migrated.seenTweetIds.push(item);
        } else {
          if (!migrated.queuedPosts.includes(item)) migrated.queuedPosts.push(item);
        }
      }
    }

    migrated.seenTweetIds = migrated.seenTweetIds.slice(-MAX_SEEN_TWEETS);
    migrated.comments = migrated.comments.slice(-MAX_COMMENT_LOG);
    return migrated;
  } catch {
    return { queuedPosts: [], seenTweetIds: [], follows: [], comments: [] };
  }
}

function saveState(state) {
  state.seenTweetIds = (state.seenTweetIds || []).slice(-MAX_SEEN_TWEETS);
  state.comments = (state.comments || []).slice(-MAX_COMMENT_LOG);
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// ---------- Helpers ----------
function nowIso() {
  return new Date().toISOString();
}

function logTwitterError(prefix, e) {
  console.error(prefix);
  console.error(e?.data || e);
}

function isLikelySelfTweet(tweet) {
  return tweet?.author_id && String(tweet.author_id) === String(userId);
}

// Prevent overlapping runs
let running = false;

// ---------- Main Logic ----------
async function runOnce() {
  if (running) {
    console.log(`[${nowIso()}] Skipping run: previous run still in progress`);
    return;
  }
  running = true;

  const state = loadState();
  let actionsCount = 0;

  try {
    console.log(`[${nowIso()}] Run started`);

    // 1) Verify auth
    try {
      const me = await rwClient.v2.me();
      const authedId = String(me?.data?.id || '');
      if (authedId && userId && authedId !== userId) {
        console.warn(
          `[warn] TWITTER_USER_ID (${userId}) does not match authenticated user (${authedId}). Fix .env.`
        );
      }
    } catch (e) {
      logTwitterError('[auth] Failed to call v2.me()', e);
      return;
    }

    // 2) Engage via hashtag search
    for (const tag of HASHTAGS) {
      if (actionsCount >= MAX_ACTIONS_PER_RUN) break;
      if (creditsBlocked()) {
        console.log('[x] Credits blocked — skipping searches.');
        break;
      }

      let paginator;
      try {
        paginator = await rwClient.v2.search(`#${tag}`, {
          max_results: SEARCH_MAX_RESULTS,
          expansions: ['author_id'],
          'tweet.fields': ['author_id', 'created_at', 'lang', 'possibly_sensitive'],
        });
      } catch (err) {
        if (isCreditsDepleted(err)) blockCredits(6);
        console.error(`[search] Failed searching #${tag}`);
        console.error(err?.data || err);
        continue; // next tag
      }

      try {
        for await (const tweet of paginator) {
          if (actionsCount >= MAX_ACTIONS_PER_RUN) break;
          if (!tweet?.id) continue;

          const tweetId = String(tweet.id);

          // Skip sensitive
          if (tweet.possibly_sensitive) {
            state.seenTweetIds.push(tweetId);
            continue;
          }

          // Skip already handled
          if (state.seenTweetIds.includes(tweetId)) continue;
          if (state.comments.some((c) => String(c.tweetId) === tweetId)) continue;

          // Skip your own tweets
          if (isLikelySelfTweet(tweet)) {
            state.seenTweetIds.push(tweetId);
            continue;
          }

          // Like
          try {
            await rwClient.v2.like(userId, tweetId);
            console.log(`[like] ${tweetId} (#${tag})`);
            actionsCount++;
          } catch (e) {
            logTwitterError(`[like] Failed on tweet ${tweetId}`, e);
          }

          if (actionsCount >= MAX_ACTIONS_PER_RUN) {
            state.seenTweetIds.push(tweetId);
            break;
          }

          // Reply
          try {
            await rwClient.v2.reply(REPLY_TEXT, tweetId);
            console.log(`[reply] ${tweetId}`);
            state.comments.push({ tweetId, text: REPLY_TEXT, at: nowIso() });
            actionsCount++;
          } catch (e) {
            logTwitterError(`[reply] Failed on tweet ${tweetId}`, e);
          }

          // Mark as seen regardless
          state.seenTweetIds.push(tweetId);

          // Periodic save
          if (actionsCount % 5 === 0) saveState(state);
        }
      } catch (err) {
        if (isCreditsDepleted(err)) blockCredits(6);
        logTwitterError(`[iterate] Failed iterating results for #${tag}`, err);
      }
    }

    // 3) Post queued tweets
    if (Array.isArray(state.queuedPosts) && state.queuedPosts.length) {
      if (creditsBlocked()) {
        console.log('[x] Credits blocked — skipping queued posts.');
      } else {
        console.log(`[queue] ${state.queuedPosts.length} queued posts found`);

        while (state.queuedPosts.length && actionsCount < MAX_ACTIONS_PER_RUN) {
          const postText = state.queuedPosts[0];

          try {
            await rwClient.v2.tweet(postText);
            console.log(`[tweeted] ${postText}`);
            state.queuedPosts.shift();
            actionsCount++;
            saveState(state);
          } catch (err) {
            if (isCreditsDepleted(err)) blockCredits(6);
            logTwitterError('[tweet] Failed posting queued tweet (leaving it in queue)', err);
            break;
          }
        }
      }
    }

    saveState(state);

    console.log(
      `[${nowIso()}] Run finished. actions=${actionsCount}, seen=${state.seenTweetIds.length}, comments=${state.comments.length}, queued=${state.queuedPosts.length}`
    );
  } finally {
    running = false;
  }
}

// ---------- Schedule ----------
runOnce().catch((e) => logTwitterError('[startup] runOnce crashed', e));
setInterval(() => runOnce().catch((e) => logTwitterError('[interval] runOnce crashed', e)), RUN_EVERY_MS);
