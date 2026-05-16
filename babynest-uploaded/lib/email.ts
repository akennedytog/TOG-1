import { Resend } from 'resend';

// Initialize Resend only if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = 'notifications@babynest.app';

// HTML escape function to prevent XSS
function escapeHtml(text: string): string {
  const div = { toString: () => text };
  // Use a safer approach
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Helper to send email (with fallback for missing API key)
const sendEmail = async (to: string, subject: string, html: string, text: string) => {
  if (!resend) {
    console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}`);
    return { data: { id: 'mock-' + Date.now() }, error: null };
  }
  
  try {
    return await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text,
    });
  } catch (error) {
    console.error('Email send error:', error);
    return { data: null, error };
  }
};

export type EmailType = 'task_reminder' | 'task_due' | 'weekly_digest' | 'welcome';

export interface TaskReminderData {
  userName: string;
  urgentTasks: number;
  dueThisWeek: number;
  tasks: Array<{
    title: string;
    dueDate: string;
    priority: string;
  }>;
}

export interface TaskDueData {
  userName: string;
  taskTitle: string;
  dueDate: string;
  category: string;
}

export interface WeeklyDigestData {
  userName: string;
  weekOf: string;
  completedTasks: number;
  newTasks: number;
  upcomingDeadlines: number;
  savingsProgress: number;
}

export interface WelcomeData {
  userName: string;
  onboardingTasks: number;
}

// Validate email addresses
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function sendTaskReminderEmail(
  to: string,
  data: TaskReminderData
) {
  if (!isValidEmail(to)) {
    throw new Error('Invalid email address');
  }

  const subject = `You have ${data.urgentTasks} urgent tasks this week`;
  
  const html = `
    <h1>Hi ${escapeHtml(data.userName)},</h1>
    <p>You have ${data.urgentTasks} urgent tasks and ${data.dueThisWeek} tasks due this week.</p>
    <h2>Upcoming Tasks:</h2>
    <ul>
      ${data.tasks.map(task => `<li>${escapeHtml(task.title)} - Due ${escapeHtml(task.dueDate)}</li>`).join('')}
    </ul>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://babynest.app'}/dashboard">View Dashboard</a></p>
  `;
  
  const text = `Hi ${data.userName}, You have ${data.urgentTasks} urgent tasks. View: ${process.env.NEXT_PUBLIC_APP_URL || 'https://babynest.app'}/dashboard`;
  
  return sendEmail(to, subject, html, text);
}

export async function sendTaskDueEmail(
  to: string,
  data: TaskDueData
) {
  if (!isValidEmail(to)) {
    throw new Error('Invalid email address');
  }

  const subject = `Task Due Tomorrow: ${data.taskTitle}`;
  
  const html = `
    <h1>Hi ${escapeHtml(data.userName)},</h1>
    <p>Your task "${escapeHtml(data.taskTitle)}" is due tomorrow (${escapeHtml(data.dueDate)}).</p>
    <p>Category: ${escapeHtml(data.category)}</p>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://babynest.app'}/dashboard">View Task</a></p>
  `;
  
  const text = `Hi ${data.userName}, Task "${data.taskTitle}" is due tomorrow. ${process.env.NEXT_PUBLIC_APP_URL || 'https://babynest.app'}/dashboard`;
  
  return sendEmail(to, subject, html, text);
}

export async function sendWeeklyDigestEmail(
  to: string,
  data: WeeklyDigestData
) {
  if (!isValidEmail(to)) {
    throw new Error('Invalid email address');
  }

  const subject = `Your BabyNest Weekly Digest - Week of ${data.weekOf}`;
  
  const html = `
    <h1>Hi ${escapeHtml(data.userName)},</h1>
    <h2>Weekly Summary</h2>
    <ul>
      <li>${data.completedTasks} tasks completed</li>
      <li>${data.newTasks} new tasks added</li>
      <li>${data.upcomingDeadlines} upcoming deadlines</li>
      <li>Savings progress: ${data.savingsProgress}%</li>
    </ul>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://babynest.app'}/dashboard">View Dashboard</a></p>
  `;
  
  const text = `Weekly Summary: ${data.completedTasks} completed, ${data.newTasks} new tasks. ${process.env.NEXT_PUBLIC_APP_URL || 'https://babynest.app'}/dashboard`;
  
  return sendEmail(to, subject, html, text);
}

export async function sendWelcomeEmail(
  to: string,
  data: WelcomeData
) {
  if (!isValidEmail(to)) {
    throw new Error('Invalid email address');
  }

  const subject = 'Welcome to BabyNest!';
  
  const html = `
    <h1>Welcome ${escapeHtml(data.userName)}!</h1>
    <p>Thank you for joining BabyNest. You have ${data.onboardingTasks} tasks to get started.</p>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://babynest.app'}/dashboard">Get Started</a></p>
  `;
  
  const text = `Welcome ${data.userName}! Get started: ${process.env.NEXT_PUBLIC_APP_URL || 'https://babynest.app'}/dashboard`;
  
  return sendEmail(to, subject, html, text);
}

export async function sendTestEmail(to: string) {
  if (!isValidEmail(to)) {
    throw new Error('Invalid email address');
  }

  const subject = 'BabyNest Test Email';
  
  const html = `
    <h1>Test Email</h1>
    <p>If you're seeing this, email notifications are working!</p>
  `;
  
  const text = 'Test email from BabyNest';
  
  return sendEmail(to, subject, html, text);
}
