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

const text = `New open-source tool (HyperAgent) lets you control web browsers with plain English instructions.

For SMBs, this is huge:

→ Automate price checking competitors
→ Auto-fill forms across vendor sites
→ Extract data without brittle scripts

Your first automation project just got 10x easier. #AI #Automation #SMB`;

console.log('Posting 10 AM HyperAgent tweet...');

try {
  const result = await rwClient.v2.tweet(text);
  console.log('✅ Posted! ID:', result.data.id);
  console.log('URL:', `https://x.com/i/web/status/${result.data.id}`);
} catch (err) {
  console.error('❌ Failed:', err.message);
}