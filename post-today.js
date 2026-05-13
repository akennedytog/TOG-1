// Post today's scheduled content (Wednesday 10am myth-busting)
import dotenv from 'dotenv';
import { TwitterApi } from 'twitter-api-v2';
import fs from 'fs';
import path from 'path';

dotenv.config();

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
}).readWrite;

// Today's scheduled post (Wednesday 10am - myth-busting)
const text = `AI Myth #1: "You need tons of data to get started"

Reality: Most SMBs see results with just 10-20 examples.

The barrier isn't data volume.
It's knowing which 10-20 examples actually matter.

Quality of signal > quantity of noise.`;

console.log('Posting today\'s scheduled content...');
console.log('Text:', text.substring(0, 60) + '...\n');

try {
  const result = await client.v2.tweet(text);
  console.log('✅ Posted! ID:', result.data.id);
  console.log('URL: https://twitter.com/user/status/' + result.data.id);
  
  // Update state
  const stateFile = path.resolve('state.json');
  const state = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
  state.lastPostTime = Date.now();
  state.queuedPosts = state.queuedPosts.slice(1); // Remove first item
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
  
} catch (err) {
  if (err.code === 429) {
    console.error('❌ Rate limited - will retry later');
    process.exit(1);
  }
  console.error('❌ Failed:', err.message);
  process.exit(1);
}
