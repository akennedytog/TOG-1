import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import { TwitterApi } from 'twitter-api-v2';

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

const me = await client.v2.me();
console.log('User ID:', me.data.id);
console.log('Username:', me.data.username);
