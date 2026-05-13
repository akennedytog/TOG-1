#!/usr/bin/env node
/**
 * Billing Investigation Tool
 * Find where $17 charge came from
 * Usage: node investigate-billing.js
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔍 BILLING INVESTIGATION');
console.log('========================\n');

// Check 1: X/Twitter API tier
console.log('1️⃣  X/TWITTER API CHECK');
console.log('   Your tier: Basic ($100/month flat)');
console.log('   Cost per post: $0 (included in flat rate)');
console.log('   Posts allowed: 1,500/month (50/day)');
console.log('   ❌ CANNOT be $17 per post\n');

// Check 2: LLM costs
console.log('2️⃣  LLM COST CHECK');
console.log('   Ollama/Kimi: FREE');
console.log('   Claude 3.5: $3/$15 per 1M tokens');
console.log('   GPT-4o: $2.50/$10 per 1M tokens');
console.log('   To cost $17 in one session:');
console.log('     - Claude 3.5: ~1.1M output tokens');
console.log('     - GPT-4o: ~1.7M output tokens');
console.log('   ⚠️  POSSIBLE if heavy usage\n');

// Check 3: Other services
console.log('3️⃣  OTHER SERVICES CHECK');
const services = [
  { name: 'OpenAI API', check: 'OPENAI_API_KEY' },
  { name: 'Anthropic API', check: 'ANTHROPIC_API_KEY' },
  { name: 'ElevenLabs TTS', check: 'ELEVENLABS_API_KEY' },
  { name: 'Other APIs', check: 'API_KEY' },
];

services.forEach(s => {
  const hasKey = process.env[s.check] || 'Not found';
  console.log(`   ${s.name}: ${hasKey !== 'Not found' ? '✅ Active' : '❌ Not found'}`);
});

console.log('\n4️⃣  POSSIBLE SOURCES OF $17 CHARGE:');
console.log('   a) OpenAI API usage (check dashboard.openai.com)');
console.log('   b) Anthropic API usage (check console.anthropic.com)');
console.log('   c) Other API service (check your email receipts)');
console.log('   d) Subscription service (check bank/credit card)');
console.log('   e) Mistaken charge (contact provider)\n');

// Check 4: Recent API calls
console.log('5️⃣  RECENT ACTIVITY CHECK');
try {
  const logs = execSync('ls -la ~/.openclaw/logs/ 2>/dev/null | tail -10').toString();
  console.log('   Recent log files:');
  console.log(logs.split('\n').slice(0, 5).join('\n'));
} catch {
  console.log('   No recent logs found');
}

console.log('\n6️⃣  ACTION ITEMS:');
console.log('   ☐ Check OpenAI dashboard: https://platform.openai.com/usage');
console.log('   ☐ Check Anthropic console: https://console.anthropic.com/');
console.log('   ☐ Check email for receipts from today');
console.log('   ☐ Review credit card/bank statement');
console.log('   ☐ Set up billing alerts (see below)\n');

console.log('7️⃣  SET UP BILLING ALERTS:');
console.log('   OpenAI: Settings → Billing → Usage limits');
console.log('   Anthropic: Settings → Usage → Alerts');
console.log('   Recommended: Alert at $10, hard limit at $50\n');

console.log('💡 MOST LIKELY CULPRIT:');
console.log('   Heavy LLM usage (Claude/GPT) in one session');
console.log('   Check your OpenAI/Anthropic dashboards NOW.\n');
