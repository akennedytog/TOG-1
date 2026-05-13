// Test script to verify dependencies load
try {
  const TwitterApi = require('twitter-api-v2').TwitterApi;
  const cron = require('node-cron');
  const dotenv = require('dotenv');
  dotenv.config();
  console.log('Dependencies loaded successfully');
} catch (err) {
  console.error('Error loading dependencies:', err);
  process.exit(1);
}