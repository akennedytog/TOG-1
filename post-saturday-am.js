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

const tweet = `Saturday morning: Reviewing this week's wins.

Most impactful?
The 7-tweet thread about invisible automation.

Why it worked:
→ Specific example (client quote)
→ Clear framework (3 principles)
→ Link to full post

Specificity beats generic every time.

#ContentStrategy #BuildingInPublic`;

async function postTweet() {
  try {
    const result = await rwClient.v2.tweet(tweet);
    console.log('✅ Tweet posted:', result.data.id);
  } catch (err) {
    console.error('❌ Failed:', err.message);
  }
}

postTweet();