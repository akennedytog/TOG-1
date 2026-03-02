import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

console.log('KEY', Boolean(process.env.TWITTER_API_KEY));
console.log('SECRET', Boolean(process.env.TWITTER_API_SECRET));
console.log('TOKEN', Boolean(process.env.TWITTER_ACCESS_TOKEN));
console.log('ACCESS_SECRET', Boolean(process.env.TWITTER_ACCESS_SECRET));
console.log('USER_ID', Boolean(process.env.TWITTER_USER_ID));
