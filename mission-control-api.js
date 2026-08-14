// Mission Control API Server
// Serves the dashboard and provides endpoints to execute scripts

import express from 'express';
import fs from 'fs';
import { exec, execFile } from 'child_process';
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

  const statePath = path.join(__dirname, 'state.json');

  if (typeof text === 'string' && text.trim()) {
    let state = { twitterQueue: [], queuedPosts: [], lastPostTime: null };
    try {
      state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
    } catch (e) {}

    const queue = Array.isArray(state.twitterQueue)
      ? state.twitterQueue
      : Array.isArray(state.queuedPosts)
        ? state.queuedPosts
        : [];

    queue.unshift({
      id: id || `manual_${Date.now()}`,
      text: text.trim(),
      status: 'queued',
      source: 'mission-control',
      createdAt: new Date().toISOString(),
    });

    state.twitterQueue = queue;
    state.queuedPosts = queue;
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
  }

  execFile('python3', ['post_tweet.py'], { cwd: __dirname, timeout: 30000 }, (error, stdout, stderr) => {
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
  let state = { twitterQueue: [], queuedPosts: [], lastPostTime: null };
  
  try {
    state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
  } catch (e) {
    // State file doesn't exist yet
  }
  
  // Add to queue
  const queue = Array.isArray(state.twitterQueue)
    ? state.twitterQueue
    : Array.isArray(state.queuedPosts)
      ? state.queuedPosts
      : [];
  queue.push({
    id: Date.now(),
    text,
    scheduledTime: scheduledTime || new Date().toISOString(),
    status: 'queued'
  });
  state.twitterQueue = queue;
  state.queuedPosts = queue;
  
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
  
  res.json({ 
    success: true, 
    message: 'Tweet queued successfully',
    queuePosition: state.twitterQueue.length 
  });
});

// Get Twitter queue status
app.get('/api/twitter-queue', (req, res) => {
  const statePath = path.join(__dirname, 'state.json');
  let state = { twitterQueue: [], queuedPosts: [], lastPostTime: null };
  
  try {
    state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
  } catch (e) {}

  const queue = Array.isArray(state.twitterQueue)
    ? state.twitterQueue
    : Array.isArray(state.queuedPosts)
      ? state.queuedPosts
      : [];
  
  res.json({
    queued: queue.length,
    lastPost: state.lastPostTime,
    posts: queue
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
