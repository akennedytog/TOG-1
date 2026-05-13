import { TwitterApi } from 'twitter-api-v2';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

const rwClient = client.readWrite;

// The 5 PM tweet (AI Myth #1)
const text = "AI Myth #1: 'You need tons of data to get started'\n\nReality: Most SMBs see results with just 10-20 examples.\n\nThe barrier isn't data volume. It's knowing which 10-20 examples actually matter.\n\nQuality of signal > quantity of noise. #AI #SMB #MythBusting";

console.log('Posting tweet now...');
console.log('Content:', text.substring(0, 50) + '...');

try {
  const result = await rwClient.v2.tweet(text);
  console.log('✅ Posted successfully!');
  console.log('Tweet ID:', result.data.id);
  console.log('Tweet URL:', `https://x.com/i/web/status/${result.data.id}`);
} catch (err) {
  console.error('❌ Failed to post:', err.message);
  if (err.code === 403) {
    console.error('Rate limited or billing issue');
  }
}