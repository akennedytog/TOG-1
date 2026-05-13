#!/usr/bin/env node
/**
 * Agent Task Automation System
 * Runs scheduled tasks for all agents via OpenClaw
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'agent-tasks.json');
const DECISIONS_FILE = path.join(DATA_DIR, 'decision-log.json');
const METRICS_FILE = path.join(DATA_DIR, 'metrics.json');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// Task templates by agent
const AGENT_TASKS = {
  jerry: [
    { name: 'Review daily metrics', frequency: 'daily', time: '09:00' },
    { name: 'Evaluate new opportunities', frequency: 'daily', time: '10:00' },
    { name: 'Approve major initiatives', frequency: 'weekly', time: 'Monday' },
    { name: 'Strategic planning', frequency: 'weekly', time: 'Sunday' }
  ],
  arlo: [
    { name: 'Research South Florida market', frequency: 'daily', time: '08:00' },
    { name: 'Monitor competitor activity', frequency: 'daily', time: '12:00' },
    { name: 'Trend analysis', frequency: 'weekly', time: 'Tuesday' },
    { name: 'Opportunity discovery', frequency: 'weekly', time: 'Thursday' }
  ],
  iris: [
    { name: 'Send cold emails (10)', frequency: 'daily', time: '09:30' },
    { name: 'Follow up on leads', frequency: 'daily', time: '14:00' },
    { name: 'Create Twitter content', frequency: 'daily', time: '11:00' },
    { name: 'Weekly sales report', frequency: 'weekly', time: 'Friday' }
  ],
  opal: [
    { name: 'Update documentation', frequency: 'daily', time: '17:00' },
    { name: 'Review agent logs', frequency: 'daily', time: '16:00' },
    { name: 'Process improvement', frequency: 'weekly', time: 'Wednesday' },
    { name: 'System audit', frequency: 'weekly', time: 'Saturday' }
  ],
  dev: [
    { name: 'Build scheduled features', frequency: 'daily', time: '10:00' },
    { name: 'Fix bugs', frequency: 'daily', time: '15:00' },
    { name: 'Deploy updates', frequency: 'weekly', time: 'Thursday' },
    { name: 'Technical debt review', frequency: 'weekly', time: 'Sunday' }
  ],
  rico: [
    { name: 'Check system health', frequency: 'daily', time: '08:00' },
    { name: 'Optimize automation', frequency: 'daily', time: '14:00' },
    { name: 'Infrastructure scaling', frequency: 'weekly', time: 'Tuesday' },
    { name: 'Security audit', frequency: 'weekly', time: 'Friday' }
  ],
  dante: [
    { name: 'Create blog content', frequency: 'daily', time: '10:30' },
    { name: 'Design visual assets', frequency: 'daily', time: '13:00' },
    { name: 'Social media graphics', frequency: 'weekly', time: 'Monday' },
    { name: 'Content calendar planning', frequency: 'weekly', time: 'Wednesday' }
  ],
  abby: [
    { name: 'Review agent outputs', frequency: 'daily', time: '11:00' },
    { name: 'Quality check', frequency: 'daily', time: '16:00' },
    { name: 'Standards enforcement', frequency: 'weekly', time: 'Tuesday' },
    { name: 'Performance review', frequency: 'weekly', time: 'Thursday' }
  ]
};

function generateId() {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
}

function getCurrentTasks() {
  try {
    return JSON.parse(fs.readFileSync(TASKS_FILE, 'utf-8'));
  } catch {
    return { pending: [], completed: [], today: [] };
  }
}

function saveTasks(tasks) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

function generateDailyTasks() {
  const tasks = getCurrentTasks();
  const today = new Date().toISOString().split('T')[0];
  
  // Clear today's tasks
  tasks.today = [];
  
  // Generate tasks for each agent
  Object.entries(AGENT_TASKS).forEach(([agent, agentTasks]) => {
    agentTasks.forEach(task => {
      if (task.frequency === 'daily') {
        tasks.today.push({
          id: generateId(),
          agent,
          name: task.name,
          time: task.time,
          status: 'pending',
          priority: 'medium',
          created: new Date().toISOString()
        });
      }
    });
  });
  
  saveTasks(tasks);
  console.log(`✅ Generated ${tasks.today.length} daily tasks`);
  return tasks.today;
}

function completeTask(taskId) {
  const tasks = getCurrentTasks();
  const taskIndex = tasks.today.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) return false;
  
  const task = tasks.today[taskIndex];
  task.status = 'completed';
  task.completed_at = new Date().toISOString();
  
  tasks.completed.push(task);
  tasks.today.splice(taskIndex, 1);
  
  saveTasks(tasks);
  
  // Log the decision
  logDecision(task.agent, 'task_completed', {
    task: task.name,
    agent: task.agent,
    result: 'completed',
    time: task.completed_at
  });
  
  return true;
}

function assignTask(agent, taskName, priority = 'medium') {
  const tasks = getCurrentTasks();
  
  const task = {
    id: generateId(),
    agent,
    name: taskName,
    status: 'pending',
    priority,
    assigned_at: new Date().toISOString(),
    due: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };
  
  tasks.pending.push(task);
  saveTasks(tasks);
  
  // Log the decision
  logDecision('system', 'task_assigned', {
    task: taskName,
    agent,
    priority,
    task_id: task.id
  });
  
  console.log(`✅ Task assigned to ${agent}: ${taskName}`);
  return task;
}

function logDecision(agent, type, data) {
  const decisions = loadDecisions();
  
  decisions.push({
    id: generateId(),
    timestamp: new Date().toISOString(),
    agent,
    type,
    data,
    reviewed: false
  });
  
  fs.writeFileSync(DECISIONS_FILE, JSON.stringify(decisions, null, 2));
}

function loadDecisions() {
  try {
    return JSON.parse(fs.readFileSync(DECISIONS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function getMetrics() {
  try {
    return JSON.parse(fs.readFileSync(METRICS_FILE, 'utf-8'));
  } catch {
    return {
      revenue: 0,
      leads: 0,
      customers: 0,
      tasks_completed: 0,
      agent_efficiency: {}
    };
  }
}

function updateMetrics(update) {
  const metrics = getMetrics();
  Object.assign(metrics, update);
  fs.writeFileSync(METRICS_FILE, JSON.stringify(metrics, null, 2));
  return metrics;
}

function runScheduledTasks() {
  console.log('🤖 Running scheduled agent tasks...\n');
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
  
  const tasks = getCurrentTasks();
  const dueTasks = tasks.today.filter(t => t.time <= currentTime && t.status === 'pending');
  
  if (dueTasks.length === 0) {
    console.log('No tasks due at this time');
    return;
  }
  
  console.log(`Found ${dueTasks.length} tasks to execute:\n`);
  
  dueTasks.forEach(task => {
    console.log(`▶️  ${task.agent.toUpperCase()}: ${task.name}`);
    
    // Simulate task execution
    setTimeout(() => {
      completeTask(task.id);
      console.log(`✅ ${task.agent.toUpperCase()} completed: ${task.name}`);
    }, 1000);
  });
  
  // Update metrics
  const metrics = getMetrics();
  metrics.tasks_completed += dueTasks.length;
  updateMetrics(metrics);
}

function showTaskQueue() {
  const tasks = getCurrentTasks();
  
  console.log('\n📋 AGENT TASK QUEUE\n');
  console.log('='.repeat(60));
  
  console.log(`\n🕐 Today's Tasks (${tasks.today.length}):`);
  tasks.today.forEach(t => {
    const status = t.status === 'pending' ? '⏳' : '✅';
    console.log(`   ${status} [${t.time}] ${t.agent}: ${t.name}`);
  });
  
  console.log(`\n⏸️  Pending Tasks (${tasks.pending.length}):`);
  tasks.pending.slice(0, 10).forEach(t => {
    console.log(`   • ${t.agent}: ${t.name} (${t.priority})`);
  });
  
  console.log(`\n✅ Completed Today (${tasks.completed.length}):`);
  tasks.completed.slice(-5).forEach(t => {
    console.log(`   • ${t.agent}: ${t.name}`);
  });
  
  console.log('='.repeat(60));
}

function showDecisionLog(count = 20) {
  const decisions = loadDecisions().slice(-count);
  
  console.log('\n📜 DECISION LOG\n');
  console.log('='.repeat(60));
  
  decisions.reverse().forEach(d => {
    const time = new Date(d.timestamp).toLocaleTimeString();
    console.log(`\n[${time}] ${d.agent.toUpperCase()}`);
    console.log(`   ${d.type}: ${JSON.stringify(d.data, null, 2).substring(0, 100)}`);
  });
  
  console.log('='.repeat(60));
}

// CLI
const [,, command, ...args] = process.argv;

switch (command) {
  case 'generate':
    generateDailyTasks();
    break;
    
  case 'run':
    runScheduledTasks();
    break;
    
  case 'assign':
    const [agent, ...taskParts] = args;
    assignTask(agent, taskParts.join(' '));
    break;
    
  case 'complete':
    completeTask(args[0]);
    break;
    
  case 'queue':
    showTaskQueue();
    break;
    
  case 'log':
    showDecisionLog(parseInt(args[0]) || 20);
    break;
    
  case 'metrics':
    const metrics = getMetrics();
    console.log('\n📊 BUSINESS METRICS\n');
    console.log(JSON.stringify(metrics, null, 2));
    break;
    
  default:
    console.log(`
🤖 Agent Task Automation System

Usage:
  node agent_tasks.js generate
    → Generate today's tasks for all agents

  node agent_tasks.js run
    → Execute scheduled tasks

  node agent_tasks.js assign [agent] [task]
    → Assign task to agent

  node agent_tasks.js complete [task_id]
    → Mark task as complete

  node agent_tasks.js queue
    → Show task queue

  node agent_tasks.js log [count]
    → Show decision log

  node agent_tasks.js metrics
    → Show business metrics

Examples:
  node agent_tasks.js generate
  node agent_tasks.js assign iris "Research 10 new leads"
  node agent_tasks.js queue
`);
}