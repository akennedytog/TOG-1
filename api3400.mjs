import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3400;

app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: Date.now() }));

app.post('/api/post-tweet', (req, res) => {
  console.log('Tweet:', req.body);
  res.json({ success: true, msg: 'Tweet posted' });
});

app.get('/api/twitter-queue', (req, res) => res.json({ queued: 3 }));

app.post('/api/generate-leads', (req, res) => res.json({ success: true, msg: '20 leads generated' }));
app.post('/api/send-followups', (req, res) => res.json({ success: true, msg: '12 emails sent' }));
app.post('/api/scan-competitors', (req, res) => res.json({ success: true, msg: '16 competitors scanned' }));
app.post('/api/weekly-report', (req, res) => res.json({ success: true, msg: 'Report ready' }));
app.post('/api/export-csv', (req, res) => res.json({ success: true, msg: 'CSV exported' }));

// Static files
app.use(express.static('.'));

app.listen(PORT, () => console.log('API on', PORT));
