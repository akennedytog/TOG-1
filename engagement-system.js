#!/usr/bin/env node
/**
 * Twitter Engagement System
 * Auto-reply to high-value accounts and trending AI content
 * Usage: node engagement-system.js
 */

require('dotenv').config();
const fs = require('fs');
const { TwitterApi } = require('twitter-api-v2');

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

const rwClient = client.readWrite;

// Target accounts to engage with
const TARGET_ACCOUNTS = [
  'sama',
  'karpathy',
  'AndrewYNg',
  'naval',
  'paulg',
  'sarahdrinkwater',
  'BinduReddy',
  'DrJimFan',
  'lexfridman',
  'smbs_ai',
  'TheRabbitHole',
  'aidailyinsights',
];

// Reply templates
const REPLY_TEMPLATES = [
  "This is exactly the kind of insight that drives real AI adoption. Thanks for sharing! 🚀",
  "Love this perspective. What is your biggest win with AI so far?",
  "Solid take. The practical applications here are huge for SMBs.",
  "Building in public with AI is the way. What are you shipping next?",
  "This resonates. The barrier to entry for AI keeps dropping—exciting times.",
  "Insightful. How are you measuring the impact on your workflow?",
  "Practical AI at work. The SMB space needs more of this.",
  "This is the kind of signal we need to cut through the AI noise."
];

// Hashtags to monitor
const MONITOR_HASHTAGS = ['AI', 'AITools', 'SMB', 'Automation', 'OpenClawAI', 'BuildingInPublic'];

const STATE_FILE = './engagement-state.json';

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  } catch {
    return { replied: [], followed: [], liked: [], lastRun: null };
  }
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function getRandomReply() {
  return REPLY_TEMPLATES[Math.floor(Math.random() * REPLY_TEMPLATES.length)];
}

async function searchAndEngage() {
  console.log('🔍 Searching for engagement opportunities...\n');
  const state = loadState();
  let actions = 0;
  const MAX_ACTIONS = 8; // Stay under rate limits

  try {
    // 1. Search recent tweets from target accounts
    console.log('📡 Checking target accounts...');
    for (const username of TARGET_ACCOUNTS.slice(0, 3)) { // Limit to avoid rate limits
      if (actions >= MAX_ACTIONS) break;
      
      try {
        const user = await client.v2.userByUsername(username);
        if (!user.data) continue;
        
        const tweets = await client.v2.userTimeline(user.data.id, { max_results: 5 });
        
        for (const tweet of tweets.data?.data || []) {
          if (actions >= MAX_ACTIONS) break;
          if (state.replied.includes(tweet.id)) continue;
          
          // Like the tweet
          try {
            await rwClient.v2.like(process.env.TWITTER_USER_ID, tweet.id);
            state.liked.push(tweet.id);
            actions++;
            console.log(`❤️  Liked @${username}: ${tweet.text.substring(0, 60)}...`);
          } catch (e) {
            // Continue
          }
          
          // Reply every 3rd liked tweet
          if (actions >= MAX_ACTIONS) break;
          if (Math.random() > 0.6) { // 40% chance to reply
            const reply = getRandomReply();
            try {
              await rwClient.v2.reply(reply, tweet.id);
              state.replied.push(tweet.id);
              actions++;
              console.log(`💬 Replied: ${reply.substring(0, 50)}...`);
            } catch (e) {
              console.error('Reply failed:', e.message);
            }
          }
        }
      } catch (e) {
        console.error(`Error checking @${username}:`, e.message);
      }
    }

    // 2. Search trending hashtags
    console.log('\n🏷️  Checking trending hashtags...');
    for (const hashtag of MONITOR_HASHTAGS.slice(0, 3)) {
      if (actions >= MAX_ACTIONS) break;
      
      try {
        const search = await client.v2.search(`#${hashtag} -is:retweet`, {
          max_results: 10,
          'tweet.fields': ['author_id', 'created_at', 'public_metrics'],
        });
        
        for (const tweet of search.data || []) {
          if (actions >= MAX_ACTIONS) break;
          if (state.liked.includes(tweet.id)) continue;
          
          // Only engage with tweets that have some traction
          const likes = tweet.public_metrics?.like_count || 0;
          if (likes < 5) continue; // Skip low-engagement tweets
          
          try {
            await rwClient.v2.like(process.env.TWITTER_USER_ID, tweet.id);
            state.liked.push(tweet.id);
            actions++;
            console.log(`❤️  Liked #${hashtag} tweet: ${tweet.text.substring(0, 50)}...`);
          } catch (e) {
            // Continue
          }
        }
      } catch (e) {
        console.error(`Hashtag search failed for #${hashtag}:`, e.message);
      }
    }

    state.lastRun = new Date().toISOString();
    saveState(state);
    
    console.log(`\n✅ Engagement complete: ${actions} actions`);
    console.log(`   Total liked: ${state.liked.length}`);
    console.log(`   Total replied: ${state.replied.length}`);
    
  } catch (err) {
    console.error('❌ Engagement system error:', err.message);
    saveState(state);
  }
}

// Run immediately if called directly
if (require.main === module) {
  searchAndEngage();
}

module.exports = { searchAndEngage };
