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

// Tonight's 3 tweets
const tweets = [
  `Week recap - What we shipped this week:\n\n✅ 8 automated tweets (built-in-public thread)\n✅ Blog post: Invisible automation framework\n✅ HyperAgent browser automation demo\n✅ 11 leads contacted via Iris\n✅ 20 new leads researched\n\nBuilding the machine while the machine builds. #BuildingInPublic`,
  
  `Just read about Claude's new agentic features. The gap between 'AI hype' and 'AI deployed' is closing fast.\n\nSMBs that start now will have a 6-month head start on competitors still 'researching' AI.\n\nThe best time to automate was yesterday.\nThe second best time is right now.\n\n#AI #Claude #SMB #OpenClaw`,
  
  `Friday night thoughts:\n\nWe're building an 8-agent system that runs itself.\n\nArlo finds leads.\nIris sends emails.\nDante creates content.\nAbby checks quality.\n\nI just approve the good stuff.\n\nThis is the future of solo entrepreneurship.\n\nWhat would YOU automate first?\n\n#AI #Automation #Entrepreneur`
];

async function postTweets() {
  console.log('Posting 3 tweets tonight...\n');
  
  for (let i = 0; i < tweets.length; i++) {
    try {
      const result = await rwClient.v2.tweet(tweets[i]);
      console.log(`✅ Tweet ${i + 1}/3 posted: ${result.data.id}`);
      
      // Wait 3 seconds between tweets
      if (i < tweets.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (err) {
      console.error(`❌ Failed tweet ${i + 1}:`, err.message);
    }
  }
  
  console.log('\n✅ Tonight\'s tweets complete!');
}

postTweets();