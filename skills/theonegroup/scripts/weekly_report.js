#!/usr/bin/env node
/**
 * Weekly Report Generator
 * Business intelligence dashboard
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const REPORT_FILE = path.join(DATA_DIR, 'weekly-report.json');

function loadData(filename) {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, filename), 'utf-8'));
  } catch {
    return [];
  }
}

function generateWeeklyReport() {
  const leads = loadData('leads.json');
  const clients = loadData('clients.json') || [];
  
  // Calculate metrics
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const newLeads = leads.filter(l => new Date(l.created) > weekAgo);
  const qualifiedLeads = leads.filter(l => l.status === 'qualified' && new Date(l.updated || l.created) > weekAgo);
  const wonDeals = clients.filter(c => new Date(c.start_date) > weekAgo);
  
  const revenue = wonDeals.reduce((sum, c) => {
    const value = parseInt(c.value?.replace(/[^0-9]/g, '') || '0');
    return sum + value;
  }, 0);
  
  const pipeline = leads
    .filter(l => ['qualified', 'proposal_sent'].includes(l.status))
    .reduce((sum, l) => {
      const val = parseInt(l.budget?.replace(/[^0-9]/g, '') || '2500');
      return sum + val;
    }, 0);
  
  const report = {
    week_ending: new Date().toISOString().split('T')[0],
    metrics: {
      new_leads: newLeads.length,
      qualified_leads: qualifiedLeads.length,
      won_deals: wonDeals.length,
      revenue: revenue,
      pipeline_value: pipeline,
      avg_lead_score: leads.length > 0 
        ? (leads.reduce((s, l) => s + (l.score || 5), 0) / leads.length).toFixed(1)
        : 0
    },
    highlights: newLeads.slice(0, 3).map(l => `${l.company}: ${l.notes?.substring(0, 50)}...`),
    actions: [
      'Follow up with qualified leads',
      'Schedule content for next week',
      'Review client deliverables',
      'Update competitor intel reports'
    ],
    goals: {
      mrr_target: 25000,
      current_mrr: clients.reduce((sum, c) => {
        if (c.service?.includes('monthly') || c.service?.includes('Intel')) {
          return sum + 297; // Monthly recurring
        }
        return sum;
      }, 0),
      leads_needed: 10 - newLeads.length
    }
  };
  
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
  
  // Print formatted report
  console.log(`
╔════════════════════════════════════════════════════════╗
║     THE ONE GROUP - WEEKLY BUSINESS REPORT             ║
║     Week Ending: ${report.week_ending}                          ║
╚════════════════════════════════════════════════════════╝

📊 KEY METRICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• New Leads:        ${report.metrics.new_leads}
• Qualified:        ${report.metrics.qualified_leads}
• Won Deals:        ${report.metrics.won_deals}
• Revenue:          $${report.metrics.revenue.toLocaleString()}
• Pipeline:         $${report.metrics.pipeline_value.toLocaleString()}
• Avg Lead Score:   ${report.metrics.avg_lead_score}/10

🔥 HIGHLIGHTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${report.highlights.map(h => `• ${h}`).join('\n') || '• No major highlights this week'}

📈 GOALS PROGRESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• MRR Target:       $${report.goals.mrr_target.toLocaleString()}/mo
• Current MRR:      $${report.goals.current_mrr}/mo
• Leads Needed:     ${report.goals.leads_needed} to hit weekly goal

✅ RECOMMENDED ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${report.actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}

Report saved: ${REPORT_FILE}
  `);
  
  return report;
}

generateWeeklyReport();