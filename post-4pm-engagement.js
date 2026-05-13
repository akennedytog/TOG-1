import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';

dotenv.config();

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

const rwClient = client.readWrite;

// 4 PM engagement post - poll style
const text = "South Florida business owners:\n\nWhat's your biggest time sink right now?\n\nA) Following up with leads\nB) Scheduling appointments\nC) Responding to reviews\nD) Creating content/social media\n\nReply A/B/C/D — I'll share the automation playbook that fixes it.\n\n#SouthFlorida #SMB #BusinessAutomation";

console.log('Posting 4 PM engagement tweet...');
console.log('Content:', text.substring(0, 60) + '...');

try {
  const result = await rwClient.v2.tweet(text);
  console.log('✅ Posted successfully!');
  console.log('Tweet ID:', result.data.id);
  console.log('URL:', `https://x.com/i/web/status/${result.data.id}`);
} catch (err) {
  console.error('❌ Failed:', err.message);
}