#!/usr/bin/env node
/**
 * Rate Limit Recovery Poster
 * Tries to post queued items every 10 minutes
 * Usage: node rate-limit-recovery.js
 */

require('dotenv').config();
const fs = require('fs');
const { TwitterApi } = require('twitter-api-v2');

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
}).readWrite;

const QUEUE_FILE = './post-queue.json';

function loadQueue() {
  try {
    return JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf-8'));
  } catch {
    return { queued: [], posted: [] };
  }
}

function saveQueue(queue) {
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
}

async function tryPost() {
  const queue = loadQueue();
  
  if (queue.queued.length === 0) {
    console.log('No queued posts');
    return;
  }
  
  const post = queue.queued[0];
  console.log(`Attempting to post: ${post.id}`);
  console.log(`Previous attempts: ${post.attempts}`);
  
  try {
    const result = await client.v2.tweet(post.text);
    console.log(`✅ SUCCESS: https://twitter.com/user/status/${result.data.id}`);
    
    // Move to posted
    queue.posted.push({
      ...post,
      postedAt: new Date().toISOString(),
      status: 'success'
    });
    queue.queued.shift();
    saveQueue(queue);
    
  } catch (err) {
    if (err.code === 429) {
      post.attempts++;
      queue.queued[0] = post;
      saveQueue(queue);
      console.log(`❌ Still rate limited. Attempt ${post.attempts}. Retrying in 15 minutes...`);
    } else {
      console.error('❌ Other error:', err.message);
    }
  }
}

tryPost();
