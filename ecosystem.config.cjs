const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

module.exports = {
  apps: [
    {
      name: 'x-engagement-bot',
      script: 'twitter-automation.js',
      cwd: __dirname,
      interpreter: 'node',
      env: {
        TWITTER_API_KEY: process.env.TWITTER_API_KEY,
        TWITTER_API_SECRET: process.env.TWITTER_API_SECRET,
        TWITTER_ACCESS_TOKEN: process.env.TWITTER_ACCESS_TOKEN,
        TWITTER_ACCESS_SECRET: process.env.TWITTER_ACCESS_SECRET,
        TWITTER_USER_ID: process.env.TWITTER_USER_ID,
      },
    },
  ],
};
