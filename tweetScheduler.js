import { TwitterApi } from 'twitter-api-v2';
import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import dotenv from 'dotenv';

dotenv.config();
const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});
const rwClient = client.readWrite;
const schedulePath = path.resolve('.', 'tweet-schedule.json');
const statePath = path.resolve('.', 'tweet-state.json');

let tweetSchedule = JSON.parse(fs.readFileSync(schedulePath, 'utf-8'));
let state = { posted: [] };
try { state = JSON.parse(fs.readFileSync(statePath, 'utf-8')); } catch {}

function shouldPost(entry) {
  const now = new Date();
  // Sunday=0 ... Saturday=6
  if (now.getDay() !== entry.dayOfWeek) return false;
  if (now.getHours() !== entry.hour) return false;
  if (now.getMinutes() !== entry.minute) return false;
  if (state.posted.includes(entry.text)) return false;
  return true;
}

async function postScheduled() {
  for (const entry of tweetSchedule) {
    if (shouldPost(entry)) {
      try {
        await rwClient.v2.tweet(entry.text);
        console.log(`Tweeted: ${entry.text}`);
        state.posted.push(entry.text);
        fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
      } catch (e) {
        console.error('Error posting tweet:', e);
      }
    }
  }
}

// Schedule to run every minute and post when time matches
cron.schedule('* * * * *', () => { postScheduled(); });

console.log('Tweet scheduler started.');