require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');

(async () => {
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
  }).readWrite;

  try {
    // Tweet 1
    const hook = "AI Agents aren’t just for enterprises anymore. Here’s how small businesses can deploy them today without huge budgets. #AI #SmallBizAgents";
    const { data: tweet1 } = await client.v2.tweet(hook);
    const thread = [];
    thread.push(tweet1.id);

    // Tweet 2
    const step1 = "1/3 Start with a focused use case: customer support, appointment booking, or lead qualification. Pick one process that eats up your team’s time.";
    const { data: tweet2 } = await client.v2.tweet(step1, { reply: { in_reply_to_tweet_id: tweet1.id } });
    thread.push(tweet2.id);

    // Tweet 3
    const step2 = "2/3 Leverage low-code tools (e.g. LangChain, Zapier, Make) to connect your data (CRM, spreadsheets) to a simple chat interface. No heavy dev required.";
    const { data: tweet3 } = await client.v2.tweet(step2, { reply: { in_reply_to_tweet_id: tweet2.id } });
    thread.push(tweet3.id);

    // Tweet 4
    const step3 = "3/3 Launch a pilot: let the agent handle a small slice of requests, collect feedback, then iterate. Scale up as accuracy and ROI improve.";
    const { data: tweet4 } = await client.v2.tweet(step3, { reply: { in_reply_to_tweet_id: tweet3.id } });
    thread.push(tweet4.id);

    console.log('Thread posted successfully:', thread);
  } catch (err) {
    console.error('Error posting thread:', err);
    process.exit(1);
  }
})();