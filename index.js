require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

// Initialize Twitter client
const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});
const rwClient = client.readWrite;

// Directories
const metricsDir = path.join(__dirname, 'memory', 'social-metrics');
const updatesDir = path.join(__dirname, 'memory', 'social-updates');
const newslettersDir = path.join(__dirname, 'newsletters');

// Ensure directories exist
[metricsDir, updatesDir, newslettersDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Placeholder: generate today's trend hook
// Load hooks from file and rotate through them
const hooksFile = path.join(__dirname, 'hooks-week1.md');
let hookIndex = 0;
async function generateTrendHook() {
  try {
    const content = fs.readFileSync(hooksFile, 'utf8');
    const lines = content.split(/\r?\n/).filter(l => l.trim() && !l.startsWith('#'));
    if (hookIndex >= lines.length) hookIndex = 0;
    const hook = lines[hookIndex];
    hookIndex++;
    return hook;
  } catch (err) {
    console.error('Error reading hooks file:', err);
    return 'AI Agents: scaling small business with intelligent automation. #AI';
  }
}

// Placeholder: fetch metrics for a Tweet ID
async function fetchMetrics(tweetId) {
  // TODO: implement real metrics fetch via Twitter API
  return { impressions: 0, likes: 0, retweets: 0, replies: 0, clicks: 0 };
}

// Post a tweet and log metrics & update note
async function postDailyHook() {
  const text = await generateTrendHook();
  const { data } = await rwClient.v2.tweet(text);
  const tweetId = data.id;

  // Wait a bit then fetch metrics
  setTimeout(async () => {
    const metrics = await fetchMetrics(tweetId);
    const date = new Date().toISOString().slice(0,10);
    fs.appendFileSync(
      path.join(metricsDir, `${date}.md`),
      `- Tweet ID: ${tweetId}, metrics: ${JSON.stringify(metrics)}\n`
    );
    fs.appendFileSync(
      path.join(updatesDir, `${date}.md`),
      `Posted daily hook: "${text.substring(0,50)}..." Metrics: ${JSON.stringify(metrics)}\n`
    );
  }, 5 * 60 * 1000);
}

// Weekly newsletter draft
async function draftNewsletter() {
  const date = new Date().toISOString().slice(0,10);
  const newsletterPath = path.join(newslettersDir, `${date}.md`);
  if (fs.existsSync(newsletterPath)) return;

  const template = fs.readFileSync(path.join(__dirname, 'newsletter-template.md'), 'utf8');
  // TODO: fill in template sections automatically
  fs.writeFileSync(newsletterPath, template);
}

// Engagement and content strategy pillars
const contentPillars = [
  'AI Agents for SMBs',
  'Tech Tutorials',
  'OpenClaw Tips'
];

// Engagement guidelines
const avoidKeywords = ['nsfw','xxx','porn','sex'];

// Engagement task: search and interact daily at 11:00 AM CDT
cron.schedule('0 11 * * *', async () => {
  try {
    // Search recent tweets with our hashtags
    const query = '#AIAgents OR #SmallBiz OR #OpenClawTips OR #TechTutorials -is:retweet lang:en';
    const res = await client.v2.search(query, { max_results: 10 });
    for await (const tweet of res) {
      const text = tweet.text.toLowerCase();
      if (avoidKeywords.some(k => text.includes(k))) continue;
      // Like the tweet
      await client.v2.like(process.env.TWITTER_USER_ID, tweet.id);
      // Reply with a light tone
      const replyText = `Great insight! Thanks for sharing. 😊`;
      await client.v2.tweet(replyText, { reply: { in_reply_to_tweet_id: tweet.id } });
    }
  } catch (err) {
    console.error('Error in engagement task:', err);
  }
}, { timezone: 'America/Chicago' });

// Schedule tasks
// Daily at 9:00 AM CDT
cron.schedule('0 9 * * *', () => {
  postDailyHook().catch(console.error);
}, { timezone: 'America/Chicago' });

// Every Friday at 9:30 AM CDT
cron.schedule('30 9 * * 5', () => {
  draftNewsletter().catch(console.error);
}, { timezone: 'America/Chicago' });

console.log('Social-manager agent started.');
