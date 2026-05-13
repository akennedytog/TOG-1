import dotenv from 'dotenv';
import { TwitterApi } from 'twitter-api-v2';

dotenv.config({ path: new URL('./.env', import.meta.url).pathname });

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

const thread = [
  "I see this question in OpenClaw comments daily:\n\n\"How can this make money?\"\n\nThe answer? It doesn't.",
  "OpenClaw isn't a money printer. It's a force multiplier.\n\nIt gives you infrastructure to build faster, iterate quicker, and execute at scale. But you still need:",
  "• A vision worth pursuing\n• A market that actually wants it\n• The guts to ship when it's imperfect\n\nThe tool doesn't create the business.\nThe human does.",
  "Every successful OpenClaw user I've seen isn't asking \"how do I monetize this?\"\n\nThey're asking \"how do I solve this expensive problem faster than everyone else?\"",
  "That's the frame shift.\n\nAutomation doesn't replace strategy.\nIt just removes the excuse that you \"don't have time.\"",
  "What's the expensive problem you're sitting on? 👇"
];

console.log('Posting thread...');

try {
  const first = await client.readWrite.v2.tweet(thread[0]);
  console.log('✅ 1/6:', first.data.id);
  
  let replyTo = first.data.id;
  for (let i = 1; i < thread.length; i++) {
    const reply = await client.readWrite.v2.tweet({
      text: thread[i],
      reply: { in_reply_to_tweet_id: replyTo }
    });
    console.log(`✅ ${i+1}/6:`, reply.data.id);
    replyTo = reply.data.id;
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log('\n✅ Thread complete!');
} catch (err) {
  console.error('❌ Failed:', err.message);
}