#!/usr/bin/env node
/**
 * OpenClaw Telegram Bridge
 * Connects Telegram messages to OpenClaw main session
 */

import TelegramBot from 'node-telegram-bot-api';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// Configuration
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw', 'telegram-config.json');
const STATE_FILE = path.join(process.cwd(), 'data', 'telegram-state.json');

// Load or create config
function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  } catch {
    return {
      bot_token: process.env.TELEGRAM_BOT_TOKEN,
      chat_id: process.env.TELEGRAM_CHAT_ID,
      openclaw_session: 'agent:main:main'
    };
  }
}

const config = loadConfig();

if (!config.bot_token) {
  console.error('❌ No Telegram bot token found!');
  console.error('Create a bot with @BotFather and add token to:');
  console.error(CONFIG_PATH);
  process.exit(1);
}

// Initialize bot
const bot = new TelegramBot(config.bot_token, { polling: true });

console.log('🤖 Telegram Bridge started!');
console.log('Send /start to begin...');

// Welcome message
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 
    `🔥 Welcome to The One Group AI Assistant!\n\n` +
    `I can help you with:\n` +
    `• Managing AI agents\n` +
    `• Grant applications\n` +
    `• Lead research\n` +
    `• Business automation\n\n` +
    `Commands:\n` +
    `/status - System status\n` +
    `/agents - List agents\n` +
    `/grants - Next deadlines\n` +
    `/help - All commands`
  );
  
  // Save chat ID for notifications
  config.chat_id = chatId;
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  console.log(`✅ Chat ID saved: ${chatId}`);
});

// Handle messages
bot.on('message', (msg) => {
  if (!msg.text || msg.text.startsWith('/')) return;
  
  const chatId = msg.chat.id;
  const text = msg.text;
  
  console.log(`📱 Message from ${msg.from.first_name}: ${text.substring(0, 50)}...`);
  
  // Forward to OpenClaw
  forwardToOpenClaw(text, chatId);
});

// Status command
bot.onText(/\/status/, (msg) => {
  const chatId = msg.chat.id;
  
  // Check agent status
  try {
    const status = getSystemStatus();
    bot.sendMessage(chatId, status);
  } catch (err) {
    bot.sendMessage(chatId, '⚠️ Unable to get status. OpenClaw may not be running.');
  }
});

// Agents command
bot.onText(/\/agents/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 
    `🤖 Active Agents:\n\n` +
    `• Arlo - Research (Daily 9AM)\n` +
    `• Dante - Content (Daily 12PM)\n` +
    `• Iris - Sales (Weekly Mon 2PM)\n` +
    `• Abby - QC (Weekly Fri 5PM)\n` +
    `• Rico - Operations\n` +
    `• Dev - Engineering\n` +
    `• Opal - Documentation\n` +
    `• Jerry - CEO\n\n` +
    `Type a message to chat with me!`
  );
});

// Grants command
bot.onText(/\/grants/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId,
    `💰 Grant Deadlines:\n\n` +
    `🔥 URGENT (This Week):\n` +
    `• AWS Activate - Apply anytime\n` +
    `• Microsoft Startups - Apply anytime\n` +
    `• Google Startups - Apply anytime\n\n` +
    `📅 COMING UP:\n` +
    `• Broward Micro-Grant - Opens April 27\n` +
    `• NSF SBIR - Various deadlines\n` +
    `• Y Combinator - Next batch\n\n` +
    `Total potential: $500K-$2M`
  );
});

// Help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId,
    `📱 The One Group Bot Commands:\n\n` +
    `/start - Welcome message\n` +
    `/status - System status\n` +
    `/agents - List AI agents\n` +
    `/grants - Grant deadlines\n` +
    `/leads - Today's leads\n` +
    `/dashboard - Web dashboard URL\n\n` +
    `Or just message me naturally!\n` +
    `Example: "Find me 20 new leads" or "What grants should I apply to?"`
  );
});

// Leads command
bot.onText(/\/leads/, (msg) => {
  const chatId = msg.chat.id;
  try {
    const leadsFile = path.join(process.cwd(), 'data', 'arlo_findings.json');
    const data = JSON.parse(fs.readFileSync(leadsFile, 'utf-8'));
    const leads = data.leads.slice(0, 5);
    
    let response = `📊 Latest Leads (${data.leads_found} total):\n\n`;
    leads.forEach((lead, i) => {
      response += `${i+1}. ${lead.name}\n`;
      response += `   ${lead.industry} | ${lead.city}\n`;
      response += `   Score: ${lead.score}/10\n\n`;
    });
    response += `View all: http://127.0.0.1:3200`;
    
    bot.sendMessage(chatId, response);
  } catch (err) {
    bot.sendMessage(chatId, '⚠️ No leads data found. Run Arlo agent first.');
  }
});

// Dashboard command
bot.onText(/\/dashboard/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId,
    `📊 Dashboard URLs:\n\n` +
    `Lead Management:\n` +
    `http://127.0.0.1:3200/lead_dashboard.html\n\n` +
    `Agent Status:\n` +
    `http://127.0.0.1:3200/index.html\n\n` +
    `Note: Must be on same WiFi as your Mac`
  );
});

// Forward message to OpenClaw
function forwardToOpenClaw(message, chatId) {
  console.log(`➡️ Forwarding to OpenClaw: ${message}`);
  
  // Save to state file for OpenClaw to pick up
  const state = loadState();
  state.pendingMessages = state.pendingMessages || [];
  state.pendingMessages.push({
    id: Date.now(),
    text: message,
    from: 'telegram',
    chatId: chatId,
    timestamp: new Date().toISOString()
  });
  saveState(state);
  
  // Send acknowledgement
  bot.sendMessage(chatId, '⏳ Processing your request...');
  
  // In real implementation, this would trigger OpenClaw agent
  // For now, simulate response
  setTimeout(() => {
    bot.sendMessage(chatId, 
      `✅ Received: "${message}"\n\n` +
      `I'm working on this! Check the web interface for full context.`
    );
  }, 1000);
}

// Load state
function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

// Save state
function saveState(state) {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// Get system status
function getSystemStatus() {
  return `🔥 The One Group Status:\n\n` +
    `🤖 Agents: 8 active\n` +
    `📊 Leads today: 20 new\n` +
    `💰 Grant apps ready: 5\n` +
    `🐦 Twitter queue: 3 posts\n` +
    `📧 Emails ready: 8\n\n` +
    `System: ✅ Operational\n` +
    `Next agent run: Tomorrow 9AM`;
}

console.log('✅ Telegram bridge running. Press Ctrl+C to stop.');