// twitter-engagement.js - Strategic Twitter Engagement
// Searches for tweets from AI thought leaders and replies thoughtfully

import dotenv from 'dotenv';
import { TwitterApi } from 'twitter-api-v2';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: new URL('./.env', import.meta.url).pathname });

// ---------- Config ----------
const STATE_FILE = path.resolve(process.cwd(), 'state.json');
const TARGET_ACCOUNTS = [
  'sama',           // Sam Altman
  'karpathy',       // Andrej Karpathy
  'AndrewYNg',      // Andrew Ng
  'naval',          // Naval Ravikant
  'paulg',          // Paul Graham
  'TheRabbitHole',  // AI/creator content
  'aidailyinsights' // AI daily insights
];

// Keywords to filter for AI/automation/business content
const KEYWORDS = ['AI', 'artificial intelligence', 'automation', 'LLM', 'model', 'build', 'startup', 'business', 'product', 'agent'];

// Reply styles to rotate through
const REPLY_STYLES = ['appreciation', 'question', 'insight', 'experience'];

// ---------- Twitter Client ----------
const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});
const rwClient = client.readWrite;

// ---------- State Management ----------
function loadState() {
  try {
    const raw = fs.readFileSync(STATE_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { queuedPosts: [], seenTweetIds: [], comments: [], lastEngagementRun: null };
  }
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// ---------- Reply Templates by Style ----------
function generateReply(tweet, style) {
  const text = tweet.text.toLowerCase();
  const isAboutAI = KEYWORDS.some(k => text.includes(k.toLowerCase()));
  
  // Only reply to AI/automation/business related content
  if (!isAboutAI) return null;
  
  const replies = {
    appreciation: [
      "This is exactly the kind of insight that cuts through the noise. Appreciate you sharing this.",
      "Genuine insight here. Thanks for putting this into words.",
      "Love this perspective. It's refreshing to see thoughtful takes in the AI space.",
      "This resonates. The clarity in how you frame this is valuable.",
    ],
    question: [
      "Curious - what do you think is the biggest misconception people have about this right now?",
      "What's your take on where this heads in the next 6 months?",
      "Do you think the bottleneck is technical or more about user adoption?",
      "How do you see this playing out for smaller teams vs. the big players?",
    ],
    insight: [
      "The pattern you're describing is exactly what I'm seeing in practice. The tools are getting good faster than the workflows are adapting.",
      "This mirrors what I've observed: the leverage is in the compound learning, not the single-shot output.",
      "What's interesting is how this changes the skill stack. Tool fluency becoming as important as domain expertise.",
      "The second-order effects here are underrated. Everyone's focused on the capability jump, not the workflow rewrite.",
    ],
    experience: [
      "Been thinking about this a lot lately. Built something similar and the edge cases were where the real learning happened.",
      "Tried implementing this approach recently. The 80/20 rule applies hard here - most value came from the first 20% of effort.",
      "This aligns with what I'm seeing building with AI right now. The iteration speed is the real unlock.",
      "Experience check: this works until it doesn't, and then you learn way more than when it works. Still worth it.",
    ]
  };
  
  const styleReplies = replies[style];
  return styleReplies[Math.floor(Math.random() * styleReplies.length)];
}

// ---------- Search for Tweets ----------
async function searchRecentTweets(username) {
  try {
    // Search for recent tweets from this user
    const query = `from:${username} -is:retweet -is:reply`;
    const tweets = await client.v2.search(query, {
      max_results: 10,
      'tweet.fields': ['created_at', 'author_id', 'public_metrics'],
      expansions: ['author_id'],
    });
    
    return tweets.data?.data || [];
  } catch (err) {
    console.error(`[search] Error searching @${username}: ${err.message}`);
    return [];
  }
}

// ---------- Main Engagement Logic ----------
async function runEngagement() {
  console.log(`[${new Date().toISOString()}] Engagement run started`);
  
  const state = loadState();
  const seenIds = new Set(state.seenTweetIds || []);
  const comments = state.comments || [];
  
  let candidates = [];
  
  // Search each target account
  for (const username of TARGET_ACCOUNTS) {
    console.log(`[search] Checking @${username}...`);
    const tweets = await searchRecentTweets(username);
    
    for (const tweet of tweets) {
      if (!seenIds.has(tweet.id)) {
        // Check if it's about AI/automation/business
        const text = tweet.text.toLowerCase();
        const isRelevant = KEYWORDS.some(k => text.includes(k.toLowerCase()));
        
        if (isRelevant) {
          candidates.push({
            id: tweet.id,
            text: tweet.text,
            author: username,
            created_at: tweet.created_at,
          });
        }
        
        // Mark as seen even if not replying (to avoid reprocessing)
        seenIds.add(tweet.id);
      }
    }
    
    // Small delay between searches to be respectful
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log(`[candidates] Found ${candidates.length} relevant tweets`);
  
  // Select up to 3 tweets to reply to
  const toReply = candidates.slice(0, 3);
  let repliedCount = 0;
  
  for (const tweet of toReply) {
    // Pick a reply style (rotate based on existing comments)
    const styleIndex = comments.length % REPLY_STYLES.length;
    const style = REPLY_STYLES[styleIndex];
    
    const replyText = generateReply(tweet, style);
    if (!replyText) continue;
    
    console.log(`[reply] To @${tweet.author}: ${replyText.substring(0, 50)}...`);
    
    try {
      await rwClient.v2.reply(replyText, tweet.id);
      console.log(`[reply] ✅ Sent reply to ${tweet.id}`);
      
      // Track the comment
      comments.push({
        tweetId: tweet.id,
        text: replyText,
        style: style,
        at: new Date().toISOString(),
      });
      
      repliedCount++;
      
      // Delay between replies
      if (toReply.length > 1) {
        await new Promise(r => setTimeout(r, 5000));
      }
    } catch (err) {
      console.error(`[reply] ❌ Failed: ${err.message}`);
    }
  }
  
  // Update state
  state.seenTweetIds = Array.from(seenIds);
  state.comments = comments;
  state.lastEngagementRun = new Date().toISOString();
  saveState(state);
  
  console.log(`[done] Replied to ${repliedCount} tweets. Total seen: ${seenIds.size}`);
}

// Run
runEngagement().catch(console.error);
