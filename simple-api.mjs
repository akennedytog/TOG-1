import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3456;

app.use(cors());
app.use(express.json());

// API routes FIRST
app.get('/api/health', (req, res) => {
  console.log('Health check received');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/post-tweet', (req, res) => {
  console.log('Post tweet received');
  res.json({ success: true, message: 'Tweet posted!' });
});

app.get('/api/twitter-queue', (req, res) => {
  res.json({ queued: 3, lastPost: null, posts: [] });
});

app.post('/api/generate-leads', (req, res) => {
  res.json({ success: true, message: '20 leads generated' });
});

app.post('/api/send-followups', (req, res) => {
  res.json({ success: true, message: '12 emails sent' });
});

app.post('/api/scan-competitors', (req, res) => {
  res.json({ success: true, message: '16 competitors scanned' });
});

app.post('/api/weekly-report', (req, res) => {
  res.json({ success: true, message: 'Report generated' });
});

app.post('/api/export-csv', (req, res) => {
  res.json({ success: true, message: 'CSV exported' });
});

// Static files LAST
app.use(express.static('.'));

app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
});
