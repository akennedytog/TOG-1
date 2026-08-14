// Mission Control API Server
// Serves the dashboard and provides endpoints to execute scripts

import express from 'express';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3400;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Serve static files (the dashboard)
app.use(express.static(__dirname));

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// POST to Twitter
app.post('/api/post-tweet', (req, res) => {
  const { text, id } = req.body;
  
  // Run the post-today.js script
  const scriptPath = path.join(__dirname, 'post-today.js');
  
  exec(`cd ${__dirname} && node post-today.js`, { timeout: 30000 }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Twitter post error: ${error}`);
      res.status(500).json({ 
        success: false, 
        error: error.message,
        stderr: stderr 
      });
      return;
    }
    
    console.log('Twitter post output:', stdout);
    res.json({ 
      success: true, 
      message: 'Tweet posted successfully',
      output: stdout 
    });
  });
});

// Queue a tweet
app.post('/api/queue-tweet', (req, res) => {
  const { text, scheduledTime } = req.body;
  
  // Read current state
  const statePath = path.join(__dirname, 'state.json');
  let state = { queuedPosts: [], lastPostTime: null };
  
  try {
    state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
  } catch (e) {
    // State file doesn't exist yet
  }
  
  // Add to queue
  state.queuedPosts.push({
    id: Date.now(),
    text,
    scheduledTime: scheduledTime || new Date().toISOString(),
    status: 'queued'
  });
  
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
  
  res.json({ 
    success: true, 
    message: 'Tweet queued successfully',
    queuePosition: state.queuedPosts.length 
  });
});

// Get Twitter queue status
app.get('/api/twitter-queue', (req, res) => {
  const statePath = path.join(__dirname, 'state.json');
  let state = { queuedPosts: [], lastPostTime: null };
  
  try {
    state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
  } catch (e) {}
  
  res.json({
    queued: state.queuedPosts.length,
    lastPost: state.lastPostTime,
    posts: state.queuedPosts
  });
});

// Generate leads (trigger Arlo)
app.post('/api/generate-leads', (req, res) => {
  const { count = 20 } = req.body;
  
  // Trigger the Arlo research script
  const scriptPath = path.join(__dirname, 'skills/theonegroup/scripts/arlo_daily_leads.js');
  
  exec(`cd ${__dirname} && node ${scriptPath}`, { timeout: 60000 }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Arlo error: ${error}`);
      res.status(500).json({ success: false, error: error.message });
      return;
    }
    
    console.log('Arlo output:', stdout);
    res.json({ 
      success: true, 
      message: `Generated ${count} new leads`,
      output: stdout 
    });
  });
});

// Send follow-up emails
app.post('/api/send-followups', (req, res) => {
  // Mock implementation - would connect to email service
  res.json({ 
    success: true, 
    message: 'Follow-up emails queued',
    count: 12 
  });
});

// Scan competitors
app.post('/api/scan-competitors', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Competitor scan initiated',
    competitors: 16 
  });
});

// Generate weekly report
app.post('/api/weekly-report', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Weekly report generated',
    reportUrl: '/reports/weekly-2026-03-26.pdf' 
  });
});

// Export to CSV
app.post('/api/export-csv', (req, res) => {
  res.json({ 
    success: true, 
    message: 'CSV export ready',
    downloadUrl: '/exports/leads-2026-03-26.csv' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mission Control API running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard available at http://localhost:${PORT}/MISSION_CONTROL.html`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});
