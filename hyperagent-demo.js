/**
 * HyperAgent Demo - Browser Automation with AI
 * 
 * Usage: node hyperagent-demo.js
 * 
 * Requires: HYPERBROWSER_API_KEY in .env
 */

import { HyperAgent } from 'hyperagent';
import dotenv from 'dotenv';

dotenv.config();

const agent = new HyperAgent({
  apiKey: process.env.HYPERBROWSER_API_KEY,
});

async function demo() {
  console.log('🤖 Starting HyperAgent demo...\n');
  
  try {
    // Example 1: Navigate and extract data
    console.log('Example 1: Search and extract');
    const result = await agent.execute(`
      Go to https://news.ycombinator.com
      Find the top 3 stories
      Extract: title, URL, and points for each
    `);
    
    console.log('✅ Result:', result);
    
    // Example 2: Form interaction
    console.log('\nExample 2: Form automation');
    const formResult = await agent.execute(`
      Go to a contact form
      Fill out name: "Test User"
      Fill out email: "test@example.com"
      Fill out message: "Interested in AI automation"
      Submit the form
    `);
    
    console.log('✅ Form submitted:', formResult);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await agent.close();
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demo();
}

export { demo };