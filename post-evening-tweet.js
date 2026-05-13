import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

const rwClient = client.readWrite;

// 9 PM Behind-the-scenes post
const text = `Behind the scenes at @TheOneGroupAI:

Our AI agent just made its first autonomous decision.

It noticed a pattern in engagement data and suggested we test a new hook format.

I approved. We'll see how it performs.

This is the future: AI suggests, humans decide.

#BuildingInPublic #AI`;

console.log('Posting evening tweet...');

try {
  const result = await rwClient.v2.tweet(text);
  console.log('✅ Posted successfully!');
  console.log('Tweet ID:', result.data.id);
  console.log('URL:', `https://x.com/i/web/status/${result.data.id}`);
} catch (err) {
  console.error('❌ Failed:', err.message);
}