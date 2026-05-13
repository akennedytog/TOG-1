#!/usr/bin/env node
/**
 * Cost Tracking Dashboard
 * Monitor API costs across all services
 * Usage: node cost-dashboard.js [report|live]
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const LOG_FILE = './cost-log.json';
const DAILY_BUDGET = 20; // $20/day max
const MONTHLY_BUDGET = 500; // $500/month

// Cost rates (per 1M tokens or per action)
const RATES = {
  // LLM Providers
  'ollama/kimi-k2.5': { type: 'llm', input: 0, output: 0, unit: 'per_1m_tokens' },
  'anthropic/claude-3-5-sonnet': { type: 'llm', input: 3, output: 15, unit: 'per_1m_tokens' },
  'anthropic/claude-3-opus': { type: 'llm', input: 15, output: 75, unit: 'per_1m_tokens' },
  'anthropic/claude-3-5-haiku': { type: 'llm', input: 0.8, output: 2.4, unit: 'per_1m_tokens' },
  'openai/gpt-4o': { type: 'llm', input: 2.5, output: 10, unit: 'per_1m_tokens' },
  'openai/gpt-4o-mini': { type: 'llm', input: 0.15, output: 0.6, unit: 'per_1m_tokens' },
  'openai/gpt-4.5': { type: 'llm', input: 75, output: 150, unit: 'per_1m_tokens' },
  
  // OpenRouter (usually cheaper)
  'openrouter/claude-3.5-sonnet': { type: 'llm', input: 2.5, output: 10, unit: 'per_1m_tokens' },
  'openrouter/gpt-4o': { type: 'llm', input: 2, output: 8, unit: 'per_1m_tokens' },
  
  // X/Twitter API
  'twitter-api-basic': { type: 'twitter', monthly: 100, posts: 1500, unit: 'flat' },
  'twitter-api-pro': { type: 'twitter', monthly: 5000, posts: 9000, unit: 'flat' },
  
  // Other services
  'openai-embeddings': { type: 'embedding', cost: 0.13, unit: 'per_1m_tokens' },
  'openai-image-gen': { type: 'image', cost: 0.04, unit: 'per_image' },
  'elevenlabs-tts': { type: 'tts', cost: 0.3, unit: 'per_1k_chars' },
};

function loadLog() {
  try {
    return JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'));
  } catch {
    return { entries: [], daily: {}, monthly: {}, alerts: [] };
  }
}

function saveLog(log) {
  fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));
}

function logCost(service, model, tokensIn = 0, tokensOut = 0, notes = '') {
  const log = loadLog();
  const now = new Date();
  const dateKey = now.toISOString().split('T')[0];
  const monthKey = dateKey.substring(0, 7);
  
  const rate = RATES[model] || RATES[service] || { type: 'unknown', cost: 0 };
  let cost = 0;
  
  if (rate.unit === 'per_1m_tokens') {
    cost = (tokensIn / 1000000) * rate.input + (tokensOut / 1000000) * rate.output;
  } else if (rate.unit === 'flat') {
    cost = rate.monthly / 30; // Daily allocation
  }
  
  const entry = {
    timestamp: now.toISOString(),
    service,
    model,
    tokensIn,
    tokensOut,
    cost: Math.round(cost * 1000) / 1000,
    notes
  };
  
  log.entries.push(entry);
  
  // Daily tracking
  if (!log.daily[dateKey]) log.daily[dateKey] = { total: 0, byService: {} };
  log.daily[dateKey].total += cost;
  log.daily[dateKey].byService[service] = (log.daily[dateKey].byService[service] || 0) + cost;
  
  // Monthly tracking
  if (!log.monthly[monthKey]) log.monthly[monthKey] = { total: 0, byService: {} };
  log.monthly[monthKey].total += cost;
  log.monthly[monthKey].byService[service] = (log.monthly[monthKey].byService[service] || 0) + cost;
  
  // Budget alerts
  if (log.daily[dateKey].total > DAILY_BUDGET) {
    const alert = `⚠️ DAILY BUDGET EXCEEDED: $${log.daily[dateKey].total.toFixed(2)}/$${DAILY_BUDGET}`;
    if (!log.alerts.includes(alert)) log.alerts.push(alert);
  }
  
  saveLog(log);
  return entry;
}

function generateReport() {
  const log = loadLog();
  const today = new Date().toISOString().split('T')[0];
  const month = today.substring(0, 7);
  
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║         CLAWDBOT COST DASHBOARD                          ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`║  Date: ${today.padEnd(45)} ║`);
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  
  // Today's costs
  const todayData = log.daily[today] || { total: 0, byService: {} };
  console.log(`📅 TODAY: $${todayData.total.toFixed(2)} / $${DAILY_BUDGET} budget`);
  console.log(`   Budget remaining: $${(DAILY_BUDGET - todayData.total).toFixed(2)}\n`);
  
  // Monthly costs
  const monthData = log.monthly[month] || { total: 0, byService: {} };
  console.log(`📊 THIS MONTH: $${monthData.total.toFixed(2)} / $${MONTHLY_BUDGET} budget`);
  console.log(`   Projected: $${(monthData.total * (30 / new Date().getDate())).toFixed(2)}\n`);
  
  // By service
  console.log('💰 BREAKDOWN BY SERVICE:');
  Object.entries(monthData.byService || {})
    .sort((a, b) => b[1] - a[1])
    .forEach(([service, cost]) => {
      console.log(`   ${service.padEnd(25)} $${cost.toFixed(2)}`);
    });
  
  // Recent entries
  console.log('\n📝 RECENT TRANSACTIONS (last 10):');
  log.entries.slice(-10).reverse().forEach(e => {
    console.log(`   ${e.timestamp.split('T')[1].split('.')[0]} | ${e.service.padEnd(15)} | $${e.cost.toFixed(4)} | ${e.notes.substring(0, 40)}`);
  });
  
  // Alerts
  if (log.alerts.length > 0) {
    console.log('\n🚨 ALERTS:');
    log.alerts.slice(-5).forEach(a => console.log(`   ${a}`));
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  if (todayData.total > DAILY_BUDGET * 0.8) {
    console.log('   ⚠️  You\'ve used 80%+ of today\'s budget. Switch to Ollama/Kimi for remaining tasks.');
  }
  if (monthData.total > MONTHLY_BUDGET * 0.5) {
    console.log('   ⚠️  You\'ve used 50%+ of monthly budget. Review high-cost services.');
  }
  
  // Cost-saving tips
  console.log('\n🎯 COST-SAVING TIPS:');
  console.log('   • Default to Ollama/Kimi (free) for 95% of tasks');
  console.log('   • Use Claude Haiku ($0.80/$2.40) for quick tasks');
  console.log('   • Use GPT-4o-mini ($0.15/$0.60) for simple queries');
  console.log('   • Reserve Claude 3.5/GPT-4o for complex reasoning only');
  console.log('   • Twitter API: Stay on Basic tier ($100/mo)\n');
  
  return log;
}

// CLI
const command = process.argv[2];
if (command === 'log') {
  const [service, model, tokensIn, tokensOut, notes] = process.argv.slice(3);
  const entry = logCost(service, model, parseInt(tokensIn) || 0, parseInt(tokensOut) || 0, notes);
  console.log(`Logged: ${entry.service} - $${entry.cost}`);
} else if (command === 'report') {
  generateReport();
} else if (command === 'live') {
  generateReport();
  console.log('\n👀 Live mode: Watching for new transactions... (Ctrl+C to exit)\n');
  setInterval(() => {
    const log = loadLog();
    const lastEntry = log.entries[log.entries.length - 1];
    if (lastEntry && new Date(lastEntry.timestamp) > new Date(Date.now() - 5000)) {
      console.log(`[${new Date().toISOString().split('T')[1].split('.')[0]}] New: ${lastEntry.service} - $${lastEntry.cost}`);
    }
  }, 5000);
} else {
  generateReport();
}

module.exports = { logCost, generateReport };
