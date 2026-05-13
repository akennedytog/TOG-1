#!/usr/bin/env node
/**
 * Template Scheduler - CRON-based automation for Canva template generation
 * Run daily to generate templates and manage the pipeline
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const SCRIPTS_DIR = path.join(process.env.HOME, '.openclaw/workspace/scripts');
const DATA_DIR = path.join(process.env.HOME, '.openclaw/workspace/data/canva_templates');
const LOGS_DIR = path.join(process.env.HOME, '.openclaw/workspace/logs');
const CRONTAB_MARKER = '# === CANVA_TEMPLATE_SCHEDULER ===';

// Ensure directories
[DATA_DIR, LOGS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Logger
const log = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const entry = { timestamp, level, message, ...meta };
  const logFile = path.join(LOGS_DIR, `scheduler_${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, JSON.stringify(entry) + '\n');
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, meta);
};

// Scheduler State Management
class SchedulerState {
  constructor() {
    this.stateFile = path.join(DATA_DIR, 'scheduler_state.json');
    this.load();
  }

  load() {
    try {
      this.state = JSON.parse(fs.readFileSync(this.stateFile, 'utf8'));
    } catch {
      this.state = {
        isRunning: false,
        lastRun: null,
        nextRun: null,
        runCount: 0,
        cronInstalled: false,
        schedule: '0 9 * * *', // 9 AM daily by default
        notifications: {
          email: null,
          slack: null,
          webhook: null,
        },
      };
    }
  }

  save() {
    fs.writeFileSync(this.stateFile, JSON.stringify(this.state, null, 2));
  }

  updateRun() {
    this.state.lastRun = new Date().toISOString();
    this.state.runCount++;
    
    // Calculate next run
    const [minute, hour, , , dayOfWeek] = this.state.schedule.split(' ');
    const next = new Date();
    next.setDate(next.getDate() + 1);
    next.setHours(parseInt(hour), parseInt(minute), 0, 0);
    this.state.nextRun = next.toISOString();
    
    this.save();
  }

  setSchedule(cronExpression) {
    this.state.schedule = cronExpression;
    this.save();
  }
}

// Cron Manager
class CronManager {
  constructor(state) {
    this.state = state;
    this.scriptPath = path.join(SCRIPTS_DIR, 'template_scheduler.js');
  }

  getCronEntry() {
    return `${this.state.state.schedule} cd ${SCRIPTS_DIR} && /usr/bin/env node ${this.scriptPath} run >> ${LOGS_DIR}/cron.log 2>&1`;
  }

  isInstalled() {
    try {
      const currentCrontab = execSync('crontab -l 2>/dev/null || echo ""', { encoding: 'utf8' });
      return currentCrontab.includes(CRONTAB_MARKER);
    } catch {
      return false;
    }
  }

  install() {
    try {
      let currentCrontab = '';
      try {
        currentCrontab = execSync('crontab -l', { encoding: 'utf8' });
      } catch {
        // No existing crontab is OK
      }

      // Remove old entries
      const lines = currentCrontab.split('\n').filter(line => !line.includes('template_scheduler.js') && !line.includes(CRONTAB_MARKER));
      
      // Add new entry
      const newCrontab = [
        ...lines,
        '',
        CRONTAB_MARKER,
        '# Daily Canva template generation',
        this.getCronEntry(),
        '# ' + CRONTAB_MARKER + ' END',
        '',
      ].join('\n');

      // Write new crontab
      execSync('echo "' + newCrontab.replace(/"/g, '\\"') + '" | crontab -');
      
      this.state.state.cronInstalled = true;
      this.state.save();
      
      log('info', 'Cron job installed successfully', { schedule: this.state.state.schedule });
      return true;
    } catch (error) {
      log('error', 'Failed to install cron job', { error: error.message });
      return false;
    }
  }

  uninstall() {
    try {
      let currentCrontab = '';
      try {
        currentCrontab = execSync('crontab -l', { encoding: 'utf8' });
      } catch {
        return true; // Nothing to remove
      }

      const lines = currentCrontab.split('\n');
      const startIdx = lines.findIndex(l => l.includes(CRONTAB_MARKER));
      const endIdx = lines.findIndex((l, i) => i > startIdx && l.includes(CRONTAB_MARKER));

      let newCrontab;
      if (startIdx !== -1 && endIdx !== -1) {
        newCrontab = [...lines.slice(0, startIdx), ...lines.slice(endIdx + 1)].join('\n');
      } else {
        // Remove any lines with template_scheduler
        newCrontab = lines.filter(l => !l.includes('template_scheduler.js')).join('\n');
      }

      execSync('echo "' + newCrontab.replace(/"/g, '\\"') + '" | crontab -');
      
      this.state.state.cronInstalled = false;
      this.state.save();
      
      log('info', 'Cron job uninstalled');
      return true;
    } catch (error) {
      log('error', 'Failed to uninstall cron job', { error: error.message });
      return false;
    }
  }

  status() {
    try {
      const currentCrontab = execSync('crontab -l 2>/dev/null || echo ""', { encoding: 'utf8' });
      const lines = currentCrontab.split('\n');
      const ourLines = lines.filter(l => l.includes('template_scheduler.js') || (l.includes(CRONTAB_MARKER)));
      
      return {
        installed: this.isInstalled(),
        entries: ourLines,
        schedule: this.state.state.schedule,
      };
    } catch (error) {
      return { installed: false, error: error.message };
    }
  }
}

// Queue Manager
class QueueManager {
  constructor() {
    this.queueFile = path.join(DATA_DIR, 'template_queue.json');
  }

  getStats() {
    try {
      const queue = JSON.parse(fs.readFileSync(this.queueFile, 'utf8'));
      return {
        pending: queue.pending?.length || 0,
        inProgress: queue.inProgress?.length || 0,
        completed: queue.completed?.length || 0,
        failed: queue.failed?.length || 0,
      };
    } catch {
      return { pending: 0, inProgress: 0, completed: 0, failed: 0 };
    }
  }

  populateIfEmpty() {
    try {
      const queue = JSON.parse(fs.readFileSync(this.queueFile, 'utf8'));
      if (queue.pending?.length === 0 && queue.inProgress?.length === 0) {
        // Import the automation script to get template configs
        const { TEMPLATE_CONFIGS } = require('./canva_automation.js');
        
        TEMPLATE_CONFIGS.forEach(config => {
          if (!queue.pending.find(t => t.templateId === config.id)) {
            queue.pending.push({
              templateId: config.id,
              priority: 'normal',
              addedAt: new Date().toISOString(),
              id: require('crypto').randomUUID(),
            });
          }
        });
        
        fs.writeFileSync(this.queueFile, JSON.stringify(queue, null, 2));
        log('info', 'Auto-populated queue with all templates', { count: TEMPLATE_CONFIGS.length });
      }
    } catch (error) {
      log('error', 'Failed to populate queue', { error: error.message });
    }
  }
}

// Notification Handler
class NotificationHandler {
  constructor(state) {
    this.state = state;
  }

  async send(title, message, meta = {}) {
    // Log notification
    log('info', `Notification: ${title}`, { message, ...meta });

    // TODO: Add actual notification channels here
    // Examples:
    // - Slack webhook
    // - Email via sendgrid/aws ses
    // - Push notification via Pushover/Pushbullet
    // - Discord webhook
    
    const notification = {
      id: require('crypto').randomUUID(),
      title,
      message,
      timestamp: new Date().toISOString(),
      meta,
      sent: {
        log: true,
        slack: false,
        email: false,
      },
    };

    // Save notification log
    const notifLog = path.join(DATA_DIR, 'notifications_sent.json');
    let notifications = [];
    try {
      notifications = JSON.parse(fs.readFileSync(notifLog, 'utf8'));
    } catch {}
    notifications.push(notification);
    fs.writeFileSync(notifLog, JSON.stringify(notifications, null, 2));

    return notification;
  }

  async sendTemplateComplete(templateId, outputPath) {
    return this.send(
      '✅ Template Ready',
      `Template "${templateId}" has been generated and is ready for export.`,
      { templateId, outputPath, type: 'template_complete' }
    );
  }

  async sendDailySummary(results) {
    const { generated = [], failed = [] } = results;
    return this.send(
      '📊 Daily Generation Complete',
      `Generated ${generated.filter(r => r.success).length} templates. Failed: ${failed.length}`,
      { results, type: 'daily_summary' }
    );
  }

  async sendWeeklyReport(report) {
    return this.send(
      '📈 Weekly Report Available',
      `This week: ${report.generated} templates generated. Total all-time: ${report.totalAllTime}`,
      { report, type: 'weekly_report' }
    );
  }
}

// Main Runner
class SchedulerRunner {
  constructor() {
    this.state = new SchedulerState();
    this.cron = new CronManager(this.state);
    this.queue = new QueueManager();
    this.notifier = new NotificationHandler(this.state);
  }

  async run() {
    log('info', 'Starting scheduled template generation run');
    
    try {
      this.state.state.isRunning = true;
      this.state.save();

      // Ensure queue has items
      this.queue.populateIfEmpty();

      // Run the main automation
      const { CanvaAutomationPipeline } = require('./canva_automation.js');
      const pipeline = new CanvaAutomationPipeline();
      
      const result = await pipeline.run({ fullPipeline: true });
      
      // Update state
      this.state.updateRun();
      this.state.state.isRunning = false;
      this.state.save();

      // Send notifications
      await this.notifier.sendDailySummary(result);

      // Generate weekly report on Sundays
      const today = new Date();
      if (today.getDay() === 0) { // Sunday
        const weeklyReport = await pipeline.generateWeeklyReport();
        await this.notifier.sendWeeklyReport(weeklyReport);
      }

      log('info', 'Scheduled run completed', { 
        generated: result.generated?.length || 0,
        remaining: result.remaining || 0 
      });

      return result;

    } catch (error) {
      this.state.state.isRunning = false;
      this.state.save();
      log('error', 'Scheduled run failed', { error: error.message, stack: error.stack });
      await this.notifier.send('❌ Generation Failed', error.message, { error: error.stack });
      throw error;
    }
  }

  async runOnce(templateId = null) {
    log('info', 'Running one-off generation', { templateId });
    
    try {
      const { CanvaAutomationPipeline } = require('./canva_automation.js');
      const pipeline = new CanvaAutomationPipeline();
      
      const result = templateId 
        ? await pipeline.run({ specificTemplate: templateId, fullPipeline: true })
        : await pipeline.run({ fullPipeline: true });

      if (result.generated?.length > 0) {
        const success = result.generated.find(r => r.success);
        if (success) {
          await this.notifier.sendTemplateComplete(success.templateId, success.path);
        }
      }

      return result;
    } catch (error) {
      log('error', 'One-off run failed', { error: error.message });
      throw error;
    }
  }

  getStatus() {
    const cronStatus = this.cron.status();
    const queueStats = this.queue.getStats();
    
    return {
      scheduler: {
        isRunning: this.state.state.isRunning,
        lastRun: this.state.state.lastRun,
        nextRun: this.state.state.nextRun,
        runCount: this.state.state.runCount,
        schedule: this.state.state.schedule,
      },
      cron: cronStatus,
      queue: queueStats,
    };
  }
}

// CLI Interface
async function main() {
  const command = process.argv[2];
  const runner = new SchedulerRunner();

  switch (command) {
    case 'run':
      // Called by cron - run the pipeline
      await runner.run();
      break;

    case 'once':
      // Manual single run
      const templateId = process.argv[3];
      const result = await runner.runOnce(templateId);
      console.log('\n=== Run Result ===');
      console.log(JSON.stringify(result, null, 2));
      break;

    case 'start':
      // Install cron job
      if (runner.cron.install()) {
        console.log('✅ Scheduler installed successfully');
        console.log(`Schedule: ${runner.state.state.schedule} (daily)`);
        console.log('To change schedule, use: schedule <cron-expression>');
      } else {
        console.error('❌ Failed to install scheduler');
        process.exit(1);
      }
      break;

    case 'stop':
      // Uninstall cron job
      if (runner.cron.uninstall()) {
        console.log('✅ Scheduler stopped');
      } else {
        console.error('❌ Failed to stop scheduler');
        process.exit(1);
      }
      break;

    case 'restart':
      // Restart scheduler
      runner.cron.uninstall();
      if (runner.cron.install()) {
        console.log('✅ Scheduler restarted');
      } else {
        console.error('❌ Failed to restart scheduler');
        process.exit(1);
      }
      break;

    case 'status':
      const status = runner.getStatus();
      console.log('\n=== Scheduler Status ===\n');
      console.log('Scheduler State:');
      console.log(`  Running: ${status.scheduler.isRunning ? 'Yes' : 'No'}`);
      console.log(`  Last Run: ${status.scheduler.lastRun || 'Never'}`);
      console.log(`  Next Run: ${status.scheduler.nextRun || 'Not scheduled'}`);
      console.log(`  Total Runs: ${status.scheduler.runCount}`);
      console.log(`  Schedule: ${status.scheduler.schedule}`);
      
      console.log('\nCron Status:');
      console.log(`  Installed: ${status.cron.installed ? 'Yes' : 'No'}`);
      if (status.cron.entries?.length > 0) {
        console.log('  Entries:');
        status.cron.entries.forEach(e => console.log(`    ${e}`));
      }
      
      console.log('\nQueue Status:');
      console.log(`  Pending: ${status.queue.pending}`);
      console.log(`  In Progress: ${status.queue.inProgress}`);
      console.log(`  Completed: ${status.queue.completed}`);
      console.log(`  Failed: ${status.queue.failed}`);
      break;

    case 'schedule':
      const newSchedule = process.argv[3];
      if (!newSchedule) {
        console.log('Current schedule:', runner.state.state.schedule);
        console.log('\nUsage: schedule <cron-expression>');
        console.log('Examples:');
        console.log('  "0 9 * * *"  - Every day at 9 AM');
        console.log('  "0 */6 * * *" - Every 6 hours');
        console.log('  "0 9 * * 1"  - Every Monday at 9 AM');
        process.exit(1);
      }
      runner.state.setSchedule(newSchedule);
      if (runner.state.state.cronInstalled) {
        runner.cron.install(); // Re-install with new schedule
      }
      console.log(`✅ Schedule updated to: ${newSchedule}`);
      break;

    case 'logs':
      const lines = parseInt(process.argv[3]) || 50;
      try {
        const logFile = path.join(LOGS_DIR, 'scheduler_' + new Date().toISOString().split('T')[0] + '.log');
        if (fs.existsSync(logFile)) {
          const content = fs.readFileSync(logFile, 'utf8');
          const logLines = content.split('\n').filter(l => l.trim()).slice(-lines);
          console.log(logLines.join('\n'));
        } else {
          console.log('No logs found for today');
        }
      } catch (error) {
        console.error('Failed to read logs:', error.message);
      }
      break;

    case 'test':
      // Quick test without full generation
      console.log('Testing scheduler configuration...');
      const testStatus = runner.getStatus();
      console.log(JSON.stringify(testStatus, null, 2));
      break;

    default:
      console.log(`
Template Scheduler - Canva Automation CRON Manager

Commands:
  start              Install cron job (runs daily at configured time)
  stop               Remove cron job
  restart            Restart scheduler
  status             Show current status
  schedule <expr>    Change schedule (cron expression)
  run                Run generation (called by cron)
  once [id]          Run once manually (optionally specify template ID)
  logs [n]           Show last n log lines (default: 50)
  test               Test configuration

Schedule Examples:
  "0 9 * * *"     Daily at 9:00 AM
  "0 */6 * * *"   Every 6 hours
  "0 9 * * 1"     Every Monday at 9:00 AM
  "0 9,15 * * *"  Twice daily at 9 AM and 3 PM

Quick Start:
  1. node template_scheduler.js start    # Install scheduler
  2. node template_scheduler.js status   # Check it's working
  3. node template_scheduler.js once     # Test manually
`);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

// Export for use as module
module.exports = {
  SchedulerRunner,
  SchedulerState,
  CronManager,
  QueueManager,
  NotificationHandler,
};
