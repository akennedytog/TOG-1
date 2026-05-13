import { TwitterApi } from 'twitter-api-v2';

const client = new TwitterApi({
  appKey: '2BaFvPOhgWS1V4wBxNhnNabKt',
  appSecret: 'GtmvPGnfHhc5VRVofTojQzzcKRkODQb1LDK4BilU4SRsReZJGH',
  accessToken: '2015625113287225344-jpaj8qH32gjrwTuy9FQ6gjeExRwqS1',
  accessSecret: 'KGrVfkv0eBUgMH9bSLfQZL0HEdRy98RTzQEGIe3G1IgWb',
});

const rwClient = client.readWrite;

const tweet = `AI SEO is about to be the biggest arbitrage opportunity of the decade.

Right now:
• 90% of businesses still optimize for Google
• AI search (ChatGPT, Perplexity, Claude) uses different signals
• First-movers are capturing featured answers worth $10K-100K/mo in traffic

The window: 12-18 months before everyone catches on.

Positioning your content for AI discovery = free leads while competitors sleep.`;

async function postTweet() {
  try {
    const response = await rwClient.v2.tweet(tweet);
    console.log('✅ Tweet posted successfully!');
    console.log('Tweet ID:', response.data.id);
    console.log('Text:', tweet);
  } catch (error) {
    console.error('❌ Error posting tweet:', error);
  }
}

postTweet();
