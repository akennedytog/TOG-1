import dotenv from 'dotenv';
import { TwitterApi } from 'twitter-api-v2';
import fs from 'fs';

dotenv.config();

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
}).readWrite;

// Behind the scenes / contrarian evening post
const text = `Behind the scenes:

I've been building The One Group's Mission Control dashboard today.

8 AI agents.
70 South Florida leads tracked.
Real-time competitor intel.
All from a browser tab.

The real flex isn't the tech.
It's that I'm one person running what used to take a team of 10.

Automation isn't the future. It's now.`;

console.log('Posting evening tweet...');
console.log('Text:', text.substring(0, 60) + '...\n');

try {
  const result = await client.v2.tweet(text);
  console.log('✅ Posted! ID:', result.data.id);
  console.log('URL: https://twitter.com/user/status/' + result.data.id);
  
  // Update state
  const state = JSON.parse(fs.readFileSync('state.json', 'utf-8'));
  state.lastPostTime = Date.now();
  state.postedToday = (state.postedToday || 0) + 1;
  fs.writeFileSync('state.json', JSON.stringify(state, null, 2));
  
} catch (err) {
  if (err.code === 429) {
    console.error('❌ Rate limited - will retry later');
    process.exit(1);
  }
  console.error('❌ Failed:', err.message);
  process.exit(1);
}
