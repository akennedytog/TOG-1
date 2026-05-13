#!/usr/bin/env node
/**
 * The One Group - Main Skill Entry Point
 * Usage: node theonegroup.js [command] [args]
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const commands = {
  'lead': 'scripts/lead_manager.js',
  'content': 'scripts/content_engine.js',
  'report': 'scripts/weekly_report.js',
};

function showHelp() {
  console.log(`
🚀 The One Group - Business Operating System

Usage:
  openclaw run theonegroup --task "[command] [action] [args]"

Commands:
  lead add '{name:"John",company:"Acme",email:"john@acme.com",source:"Twitter",notes:"Wants AI"}'
    → Capture and qualify a new lead

  lead list [filter]
    → Show all leads (optionally filter by status)

  content twitter [topic]
    → Generate a Twitter thread

  content blog [title]
    → Create a blog post template

  report
    → Generate weekly business report

Examples:
  openclaw run theonegroup --task "lead add '{\"name\":\"Jane\",\"company\":\"HVAC Inc\",\"email\":\"jane@hvac.com\",\"source\":\"LinkedIn\",\"notes\":\"Wants scheduling automation\"}'"

  openclaw run theonegroup --task "content twitter automation"

  openclaw run theonegroup --task "report"

Files:
  • BUSINESS.md - Company overview
  • OPERATING.md - Operating principles
  • data/leads.json - Lead database
  • data/weekly-report.json - Business metrics
`);
}

const [,, command, ...args] = process.argv;

if (!command || command === 'help') {
  showHelp();
  process.exit(0);
}

if (commands[command]) {
  const scriptPath = path.join(__dirname, commands[command]);
  const child = spawn('node', [scriptPath, ...args], {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  child.on('error', (err) => {
    console.error(`❌ Error running ${command}:`, err.message);
  });
} else {
  console.error(`❌ Unknown command: ${command}`);
  showHelp();
  process.exit(1);
}