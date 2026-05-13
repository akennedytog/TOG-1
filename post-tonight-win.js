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

// Tweet about tonight's automation build
const text = `Tonight I built something wild:\n\nMy AI agent (Arlo) finds leads → Apollo researches them → Iris sends personalized emails → I just reply to interested prospects\n\nFully automated sales pipeline.\n\n20 leads/day.\n20 personalized emails.\nZero manual work.\n\nThe future of small business isn't working harder.\nIt's building systems that work while you sleep.\n\n#BuildingInPublic #AI #Automation`;

console.log('Posting automation build tweet...');

try {
  const result = await rwClient.v2.tweet(text);
  console.log('✅ Posted!');
  console.log('URL:', `https://x.com/i/web/status/${result.data.id}`);
} catch (err) {
  console.error('❌ Failed:', err.message);
}