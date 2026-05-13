import dotenv from 'dotenv';
import { TwitterApi } from 'twitter-api-v2';

dotenv.config();

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
}).readWrite;

// Afternoon engagement post - question style
const text = `What's the #1 thing that makes you choose one service business over another? 

Reply with the number:
1. Fast response time
2. Lowest price
3. Best reviews
4. Personal referral

Most business owners get this wrong. 👇`;

console.log('Posting afternoon engagement question...');
console.log('Text:', text.substring(0, 80) + '...\n');

try {
  const result = await client.v2.tweet(text);
  console.log('✅ Posted! ID:', result.data.id);
  console.log('URL: https://twitter.com/user/status/' + result.data.id);
  
} catch (err) {
  if (err.code === 429) {
    console.error('❌ Rate limited');
    process.exit(1);
  }
  console.error('❌ Failed:', err.message);
  process.exit(1);
}
