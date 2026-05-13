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

// Behind the scenes - April 2 evening
const text = `Behind the scenes:\n\nSpent the day fixing my automation stack after realizing I'd been stuck in boot sequences all morning.\n\nThe irony? Building AI systems that are supposed to run themselves... and forgetting to run them.\n\nLesson learned: automation isn't "set and forget" — it's "monitor and iterate."\n\nSystems are live now. 11 leads hit the pipeline today. Emails go out tomorrow at 9 AM.\n\nBuilding in public means showing the broken parts too.\n\n#BuildingInPublic #AI #Automation`;

console.log('Posting evening behind-the-scenes tweet...');

try {
  const result = await rwClient.v2.tweet(text);
  console.log('✅ Posted! ID:', result.data.id);
  console.log('URL:', `https://x.com/i/web/status/${result.data.id}`);
} catch (err) {
  console.error('❌ Failed:', err.message);
}