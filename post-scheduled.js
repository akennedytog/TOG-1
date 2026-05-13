#!/usr/bin/env node
/**
 * Scheduled Posting System
 * Posts content based on time of day
 * Usage: node post-scheduled.js
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

const calendar = JSON.parse(fs.readFileSync('./content-calendar-next.json', 'utf-8'));

const today = new Date().toISOString().split('T')[0];
const todayData = calendar.posts.find(p => p.date === today);

if (!todayData) {
  console.log('No posts scheduled for today');
  process.exit(0);
}

const currentHour = new Date().getHours();
const currentMinute = new Date().getMinutes();
const currentTime = currentHour * 60 + currentMinute;

async function postTweet(text, isThread = false, followUps = []) {
  try {
    const result = await client.v2.tweet(text);
    console.log(`✅ Posted: https://twitter.com/user/status/${result.data.id}`);
    
    // Post thread replies if applicable
    if (isThread && followUps.length > 0) {
      let lastId = result.data.id;
      for (let i = 0; i < Math.min(followUps.length, 5); i++) {
        await new Promise(r => setTimeout(r, 2000)); // Rate limit safety
        const reply = await client.v2.reply(followUps[i], lastId);
        console.log(`  ↳ Reply ${i+1} posted`);
        lastId = reply.data.id;
      }
    }
    
    return result.data.id;
  } catch (err) {
    if (err.code === 429) {
      console.error('❌ Rate limited. Try again in 15-30 minutes.');
    } else {
      console.error('❌ Failed:', err.message);
    }
    return null;
  }
}

async function main() {
  console.log(`📅 Today: ${todayData.day}, ${today}`);
  console.log(`🕐 Current time: ${String(currentHour).padStart(2,'0')}:${String(currentMinute).padStart(2,'0')}\n`);
  
  // Find post for this time slot (within 30 min window)
  const post = todayData.schedule.find(p => {
    const [h, m] = p.time.split(':').map(Number);
    const postTime = h * 60 + m;
    return Math.abs(postTime - currentTime) <= 30;
  });
  
  if (!post) {
    console.log('No posts scheduled for current time window');
    console.log('Next scheduled posts:');
    todayData.schedule.forEach(p => {
      console.log(`  ${p.time} - [${p.type.toUpperCase()}] ${p.text.substring(0, 50)}...`);
    });
    return;
  }
  
  console.log(`📝 Posting: [${post.type.toUpperCase()}] ${post.pillar}`);
  console.log(`Text: ${post.text.substring(0, 100)}...\n`);
  
  const isThread = post.type === 'thread';
  await postTweet(post.text, isThread, post.followUps || []);
}

main();
