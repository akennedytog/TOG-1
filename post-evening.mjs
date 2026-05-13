import { TwitterApi } from 'twitter-api-v2';

const client = new TwitterApi({
  appKey: '2BaFvPOhgWS1V4wBxNhnNabKt',
  appSecret: 'GtmvPGnfHhc5VRVofTojQzzcKRkODQb1LDK4BilU4SRsReZJGH',
  accessToken: '2015625113287225344-jpaj8qH32gjrwTuy9FQ6gjeExRwqS1',
  accessSecret: 'KGrVfkv0eBUgMH9bSLfQZL0HEdRy98RTzQEGIe3G1IgWb',
});

const rwClient = client.readWrite;

const tweet = `Realized today I've been running this 8-agent setup for 3 weeks.

The thing that surprised me most?

Not what they CAN do. It's how little I have to think about the stuff they handle.

The mental space is the real ROI.`;

async function postTweet() {
  try {
    const response = await rwClient.v2.tweet(tweet);
    console.log('✅ Tweet posted successfully!');
    console.log('Tweet ID:', response.data.id);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

postTweet();
