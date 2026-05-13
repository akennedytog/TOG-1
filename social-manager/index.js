require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { TwitterApi } = require('twitter-api-v2');
const cron = require('node-cron');

// Initialize Twitter client
const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});
const rwClient = client.readWrite;

// Directories
const metricsDir = path.join(__dirname, '../memory/social-metrics');
const updatesDir = path.join(__dirname, '../memory/social-updates');
const newslettersDir = path.join(__dirname, '../newsletters');
// Ensure dirs exist
[metricsDir, updatesDir, newslettersDir].forEach(d => fs.mkdirSync(d, { recursive: true }));

// Post a daily trend hook
async function postDailyHook() {
  const trend = await monitorTrends();
  const text = `Daily trend hook: ${trend.title} - ${trend.summary}`;
  const tweet = await rwClient.v2.tweet(text);
  console.log('Posted daily hook', tweet.data.id);
}

// Post weekly deep dive (Friday at 9am)
async function postWeeklyDeepDive() {
  const deep = await generateDeepDive();
  const text = `Weekly deep dive: ${deep.title}\n${deep.content}`;
  const tweet = await rwClient.v2.tweet(text);
  console.log('Posted weekly deep dive', tweet.data.id);
}

// Log metrics
async function logMetrics() {
  const today = new Date().toISOString().slice(0,10);
  const pathMetrics = path.join(metricsDir, `${today}.md`);
  // placeholder: fetch metrics for yesterday's posts
  const metrics = await fetchMetrics();
  const content = `# Metrics ${today}\n` +
    `Impressions: ${metrics.impressions}\n` +
    `Engagements: ${metrics.engagements}\n` +
    `Clicks: ${metrics.clicks}\n`;
  fs.writeFileSync(pathMetrics, content);
  console.log('Logged metrics to', pathMetrics);
}

// Append performance notes
defaultPerformanceNote = '';
async function appendPerformanceNotes() {
  const today = new Date().toISOString().slice(0,10);
  const pathNote = path.join(updatesDir, `${today}.md`);
  const note = await generatePerformanceNote();
  fs.appendFileSync(pathNote, `- ${note}\n`);
  console.log('Appended performance note');
}

// Draft Friday newsletter
async function draftNewsletter() {
  const today = new Date().toISOString().slice(0,10);
  const weekNum = getWeekNumber(new Date());
  const fname = `${String(weekNum).padStart(2,'0')}-${today}.md`;
  const fullPath = path.join(newslettersDir, fname);
  const template = fs.readFileSync(path.join(__dirname, 'newsletter-template.md'), 'utf8');
  const content = template.replace(/{{date}}/g, today)
                          .replace(/{{week}}/g, weekNum);
  fs.writeFileSync(fullPath, content);
  console.log('Drafted newsletter', fname);
}

// Schedule jobs
dailyAt('08:00', postDailyHook);
dailyAt('18:00', logMetrics);
dailyAt('18:30', appendPerformanceNotes);
cron.schedule('0 9 * * 5', postWeeklyDeepDive);
cron.schedule('0 10 * * 5', draftNewsletter);

console.log('Social-manager agent started.');

// Helpers and placeholders
function dailyAt(time, fn) {
  const [hour, minute] = time.split(':');
  cron.schedule(`${minute} ${hour} * * *`, fn);
}

async function monitorTrends() {
  // TODO: integrate with trend API
  return { title: 'Example Trend', summary: 'A summary of trend' };
}
async function generateDeepDive() {
  return { title: 'Deep Dive Topic', content: 'In-depth analysis...' };
}
async function fetchMetrics() {
  return { impressions: 1234, engagements: 56, clicks: 78 };
}
async function generatePerformanceNote() {
  return 'Daily engagement was strong on video posts.';
}
function getWeekNumber(d) {
  const jan1 = new Date(d.getFullYear(),0,1);
  return Math.ceil((((d - jan1) / 86400000) + jan1.getDay()+1)/7);
}
