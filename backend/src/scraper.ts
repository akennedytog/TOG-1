import cron from 'node-cron';

// Stub for scraper job
cron.schedule('0 * * * *', () => {
  console.log('Running hourly scrape (stub)');
  // TODO: fetch sources, classify, store into database
});

console.log('Scraper scheduled.');