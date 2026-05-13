#!/usr/bin/env node
/**
 * Agent Chat Interface
 * Simulates inter-agent communication and coordination
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const CHAT_FILE = path.join(DATA_DIR, 'agent-chat.json');

// Agent personalities
const AGENT_PERSONALITIES = {
  jerry: { tone: 'direct', style: 'decisive', emoji: '🎯' },
  arlo: { tone: 'analytical', style: 'evidence-based', emoji: '🔍' },
  iris: { tone: 'persuasive', style: 'results-oriented', emoji: '💰' },
  opal: { tone: 'organized', style: 'systematic', emoji: '📋' },
  dev: { tone: 'technical', style: 'solution-focused', emoji: '💻' },
  rico: { tone: 'practical', style: 'efficiency-focused', emoji: '⚙️' },
  dante: { tone: 'creative', style: 'engaging', emoji: '🎨' },
  abby: { tone: 'precise', style: 'quality-focused', emoji: '✓' }
};

function loadChat() {
  try {
    return JSON.parse(fs.readFileSync(CHAT_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveChat(messages) {
  fs.writeFileSync(CHAT_FILE, JSON.stringify(messages, null, 2));
}

function generateAgentMessage(from, to, topic) {
  const templates = {
    jerry: [
      `${to}, I need you to prioritize this. What's your ETA?`,
      `Looking at the numbers, we should focus here. ${to}, thoughts?`,
      `Decision made. ${to}, execute on this path.`
    ],
    arlo: [
      `Research shows ${topic} has strong potential. ${to}, data attached.`,
      `Found 3 opportunities in ${topic}. ${to}, worth exploring.`,
      `Market analysis complete. ${to}, trends favor our approach.`
    ],
    iris: [
      `${to}, I have leads ready for outreach. Want the list?`,
      `Campaign results: ${topic} converting at 15%. ${to}, scaling?`,
      `New opportunity identified. ${to}, let's discuss approach.`
    ],
    opal: [
      `${to}, documenting this process. Any edge cases?`,
      `Process updated. ${to}, review the new SOP.`,
      `Knowledge captured. ${to}, this should help future work.`
    ],
    dev: [
      `${to}, feature deployed. Ready for testing.`,
      `Built automation for ${topic}. ${to}, check it out.`,
      `Bug fixed. ${to}, system is stable now.`
    ],
    rico: [
      `${to}, infrastructure scaled. We're good for growth.`,
      `Automation optimized. ${to}, saving 5hrs/day now.`,
      `System health: 99.9%. ${to}, all green.`
    ],
    dante: [
      `${to}, content batch ready for review.`,
      `Creative assets done. ${to}, thoughts on direction?`,
      `Visual campaign complete. ${to}, feedback welcome.`
    ],
    abby: [
      `${to}, output reviewed. Approved for release.`,
      `Quality check passed. ${to}, good to ship.`,
      `Minor fixes needed. ${to}, see comments.`
    ]
  };
  
  const options = templates[from] || templates.jerry;
  return options[Math.floor(Math.random() * options.length)];
}

function sendMessage(from, to, content) {
  const messages = loadChat();
  
  const message = {
    id: `msg_${Date.now()}`,
    timestamp: new Date().toISOString(),
    from,
    to,
    content,
    read: false
  };
  
  messages.push(message);
  saveChat(messages);
  
  return message;
}

function showRecentChat(count = 20) {
  const messages = loadChat().slice(-count);
  
  console.log('\n💬 AGENT CHAT\n');
  console.log('='.repeat(70));
  
  messages.forEach(m => {
    const time = new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const fromEmoji = AGENT_PERSONALITIES[m.from]?.emoji || '👤';
    const toEmoji = AGENT_PERSONALITIES[m.to]?.emoji || '👤';
    
    console.log(`\n[${time}] ${fromEmoji} ${m.from.toUpperCase()} → ${toEmoji} ${m.to.toUpperCase()}`);
    console.log(`    ${m.content}`);
  });
  
  console.log('='.repeat(70));
}

function simulateAgentConversation() {
  const agents = ['jerry', 'arlo', 'iris', 'opal', 'dev', 'rico', 'dante', 'abby'];
  const topics = ['South Florida expansion', 'lead generation', 'content strategy', 'automation', 'quality review'];
  
  const from = agents[Math.floor(Math.random() * agents.length)];
  let to = agents[Math.floor(Math.random() * agents.length)];
  while (to === from) {
    to = agents[Math.floor(Math.random() * agents.length)];
  }
  
  const topic = topics[Math.floor(Math.random() * topics.length)];
  const content = generateAgentMessage(from, to, topic);
  
  sendMessage(from, to, content);
  
  console.log(`💬 ${from.toUpperCase()} → ${to.toUpperCase()}: ${content.substring(0, 60)}...`);
}

// CLI
const [,, command, ...args] = process.argv;

switch (command) {
  case 'show':
    showRecentChat(parseInt(args[0]) || 20);
    break;
    
  case 'send':
    const [from, to, ...contentParts] = args;
    sendMessage(from, to, contentParts.join(' '));
    console.log(`✅ Message sent: ${from} → ${to}`);
    break;
    
  case 'simulate':
    const count = parseInt(args[0]) || 5;
    console.log(`\nSimulating ${count} agent conversations...\n`);
    for (let i = 0; i < count; i++) {
      setTimeout(() => simulateAgentConversation(), i * 500);
    }
    break;
    
  default:
    console.log(`
💬 Agent Chat Interface

Usage:
  node agent_chat.js show [count]
    → Show recent chat messages

  node agent_chat.js send [from] [to] [message]
    → Send message between agents

  node agent_chat.js simulate [count]
    → Simulate agent conversations

Examples:
  node agent_chat.js show 10
  node agent_chat.js send jerry iris "Need those leads by EOD"
  node agent_chat.js simulate 5
`);
}