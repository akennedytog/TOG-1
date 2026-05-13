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

// Thread promoting the blog post
const tweets = [
  `I\'ve deployed AI for 50+ small businesses.\n\nHere\'s what I learned about why most AI tools fail—and how to build ones that actually stick:\n\n🧵👇`,
  
  `1/ The "revolutionary" AI tools almost always fail.\n\nWhy?\n\nThey ask you to:\n→ Learn a new interface\n→ Change your workflow\n→ "Transform your business"\n\nResult: 15% adoption, abandoned in 3 months.`,
  
  `2/ The AI tools that stick share ONE trait:\n\nThey don\'t ask users to change.\nThey adapt to existing workflows.\n\nThe best automation is INVISIBLE.\n\nIt feels like you\'re suddenly better at your job—not like you\'re using a new tool.`,
  
  `3/ Real example:\n\nClient told me: "I didn\'t realize we were using AI. I just noticed my inbox was magically manageable."\n\nThat\'s the goal.`,
  
  `4/ Three principles for invisible automation:\n\n→ Contextual integration (lives where you work)\n→ Gradual enhancement (5 min savings compound)\n→ Transparent operation (clear what it does, even if complex how)`,
  
  `5/ The bottom line:\n\nMost successful AI implementations aren\'t the ones with the most impressive technology.\n\nThey\'re the ones that become invisible—seamlessly woven into how people already work.`,
  
  `I wrote the full breakdown here:\n\nhttps://theonegroup.info/blog/2026-04-03-invisible-automation.html\n\nBuilding with AI? This will save you months of frustration.\n\n#AI #Automation #SMB #BuildingInPublic`
];

async function postThread() {
  console.log('Posting thread...\n');
  let lastTweetId = null;
  
  for (let i = 0; i < tweets.length; i++) {
    try {
      const tweet = tweets[i];
      const replyTo = lastTweetId ? { reply: { in_reply_to_tweet_id: lastTweetId } } : {};
      
      const result = await rwClient.v2.tweet(tweet, replyTo);
      lastTweetId = result.data.id;
      
      console.log(`✅ Tweet ${i + 1}/${tweets.length}: ${result.data.id}`);
      
      // Wait 2 seconds between tweets
      if (i < tweets.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (err) {
      console.error(`❌ Failed tweet ${i + 1}:`, err.message);
      break;
    }
  }
  
  console.log('\n✅ Thread complete!');
  console.log('First tweet:', `https://x.com/i/web/status/${lastTweetId}`);
}

postThread();