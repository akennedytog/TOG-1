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

// Missed tweets from Monday and Tuesday
const missedTweets = [
  "AI isn't the future-it's the now. 🚀 Today I'm helping SMBs automate lead follow-up in under 60s. What's your biggest bottleneck? #AI #PracticalAI",
  "Built this new hero section to showcase our ROI-first approach. Thoughts? #WebDesign #AI",
  "Machine learning can supercharge small businesses-no PhD required. Here's how: [🧵👇] #MachineLearning #SMB",
  "In 7 days we deployed an AI responder for a local contractor. 50% faster lead conversion. More details: [link] #AIinBusiness"
];

console.log(`Posting ${missedTweets.length} missed tweets...\n`);

for (let i = 0; i < missedTweets.length; i++) {
  const text = missedTweets[i];
  console.log(`\n--- Tweet ${i + 1} ---`);
  console.log('Content:', text.substring(0, 60) + '...');
  
  try {
    const result = await rwClient.v2.tweet(text);
    console.log('✅ Posted! ID:', result.data.id);
    console.log('URL:', `https://x.com/i/web/status/${result.data.id}`);
    
    // Wait 2 seconds between tweets to avoid rate limits
    if (i < missedTweets.length - 1) {
      console.log('Waiting 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  } catch (err) {
    console.error('❌ Failed:', err.message);
  }
}

console.log('\n✅ All done!');