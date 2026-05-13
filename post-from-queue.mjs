#!/usr/bin/env node
/**
 * Post Tweets from Queue
 * Reads state.json and posts the next queued tweet
 * Usage: node post-from-queue.mjs [--dry-run]
 */

import fs from 'fs';
import { TwitterApi } from 'twitter-api-v2';

const STATE_FILE = '/Users/aleckennedy/.openclaw/workspace/state.json';
const DRY_RUN = process.argv.includes('--dry-run');

// Initialize Twitter client
const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY || '2BaFvPOhgWS1V4wBxNhnNabKt',
  appSecret: process.env.TWITTER_API_SECRET || 'GtmvPGnfHhc5VRVofTojQzzcKRkODQb1LDK4BilU4SRsReZJGH',
  accessToken: process.env.TWITTER_ACCESS_TOKEN || '2015625113287225344-jpaj8qH32gjrwTuy9FQ6gjeExRwqS1',
  accessSecret: process.env.TWITTER_ACCESS_SECRET || 'KGrVfkv0eBUgMH9bSLfQZL0HEdRy98RTzQEGIe3G1IgWb',
});

const rwClient = client.readWrite;

async function postFromQueue() {
  console.log('🐦 Twitter Queue Poster\n');
  
  try {
    // Read state
    const stateData = fs.readFileSync(STATE_FILE, 'utf-8');
    const state = JSON.parse(stateData);
    
    // Check if there are queued posts
    if (!state.queuedPosts || state.queuedPosts.length === 0) {
      console.log('ℹ️ No posts in queue. Run twitter_content_generator.py first.');
      return;
    }
    
    // Get the first unposted tweet
    const nextPost = state.queuedPosts[0];
    
    console.log(`📋 Next post: ${nextPost.type} (${nextPost.topic})`);
    console.log(`📝 Text preview: ${nextPost.text.substring(0, 80)}...\n`);
    
    if (DRY_RUN) {
      console.log('🔍 DRY RUN - Would post:');
      console.log('─'.repeat(50));
      console.log(nextPost.text);
      console.log('─'.repeat(50));
      return;
    }
    
    // Post the tweet
    console.log('📤 Posting to Twitter...');
    const response = await rwClient.v2.tweet(nextPost.text);
    
    console.log('✅ Tweet posted successfully!');
    console.log(`🔗 Tweet ID: ${response.data.id}`);
    console.log(`👤 Tweeted by: @TheOneGroupAI\n`);
    
    // Update state - remove posted tweet from queue
    state.queuedPosts.shift(); // Remove first item
    
    // Add to todayPosts tracking
    if (!state.postedToday) state.postedToday = 0;
    state.postedToday += 1;
    
    // Update last post time
    state.lastPostTime = Date.now().toString();
    
    // Add to posted log
    if (!state.postedLog) state.postedLog = [];
    state.postedLog.push({
      id: response.data.id,
      text: nextPost.text.substring(0, 100),
      postedAt: new Date().toISOString(),
      type: nextPost.type,
      topic: nextPost.topic
    });
    
    // Save updated state
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    console.log(`💾 Updated state.json (${state.queuedPosts.length} posts remaining in queue)`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 401) {
      console.error('\n⚠️ Twitter authentication failed. Check your API credentials.');
    } else if (error.code === 403) {
      console.error('\n⚠️ Tweet may be a duplicate or rate limited.');
    }
    process.exit(1);
  }
}

postFromQueue();
