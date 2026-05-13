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

// 4 PM Engagement post - poll style
const text = `South Florida business owners:\n\nQuick question:\n\nWhat's your biggest time sink right now?\n\nA) Following up with leads\nB) Scheduling appointments\nC) Creating content/social posts\nD) Data entry/admin tasks\n\nReply A/B/C/D — I'll share the automation that fixes it.\n\n#SouthFlorida #SMB #Automation`;

console.log('Posting 4 PM engagement tweet...');

try {
  const result = await rwClient.v2.tweet(text);
  console.log('✅ Posted! ID:', result.data.id);
  console.log('URL:', `https://x.com/i/web/status/${result.data.id}`);
} catch (err) {
  console.error('❌ Failed:', err.message);
}