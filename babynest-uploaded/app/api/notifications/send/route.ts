import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { 
  sendTaskReminderEmail, 
  sendTaskDueEmail, 
  sendWeeklyDigestEmail, 
  sendWelcomeEmail,
  sendTestEmail,
  TaskReminderData,
  TaskDueData,
  WeeklyDigestData,
  WelcomeData
} from '@/lib/email';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validation schemas
const TaskSchema = z.object({
  title: z.string().min(1).max(500),
  dueDate: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
});

const NotificationSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('task_reminder'),
    userId: z.string().uuid(),
    data: z.object({
      userName: z.string().max(100),
      urgentTasks: z.number().int().min(0),
      dueThisWeek: z.number().int().min(0),
      tasks: z.array(TaskSchema),
    }),
  }),
  z.object({
    type: z.literal('task_due'),
    userId: z.string().uuid(),
    data: z.object({
      userName: z.string().max(100),
      taskTitle: z.string().min(1).max(500),
      dueDate: z.string(),
      category: z.string().max(100),
    }),
  }),
  z.object({
    type: z.literal('weekly_digest'),
    userId: z.string().uuid(),
    data: z.object({
      userName: z.string().max(100),
      weekOf: z.string(),
      completedTasks: z.number().int().min(0),
      newTasks: z.number().int().min(0),
      upcomingDeadlines: z.number().int().min(0),
      savingsProgress: z.number().min(0).max(100),
    }),
  }),
  z.object({
    type: z.literal('welcome'),
    userId: z.string().uuid(),
    data: z.object({
      userName: z.string().max(100),
      onboardingTasks: z.number().int().min(0),
    }),
  }),
  z.object({
    type: z.literal('test'),
    userId: z.string().uuid(),
    data: z.object({}).optional(),
  }),
]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate with Zod
    const validationResult = NotificationSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { type, userId, data } = validationResult.data;

    // Get user email from profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get notification preferences
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    const email = profile.email;
    const userName = profile.full_name?.split(' ')[0] || '';

    switch (type) {
      case 'task_reminder': {
        if (!prefs?.task_reminders) {
          return NextResponse.json({ skipped: true, reason: 'task_reminders disabled' });
        }
        const result = await sendTaskReminderEmail(email, { ...data, userName });
        return NextResponse.json({ success: true, id: result.data?.id });
      }

      case 'task_due': {
        if (!prefs?.task_due_alerts) {
          return NextResponse.json({ skipped: true, reason: 'task_due_alerts disabled' });
        }
        const result = await sendTaskDueEmail(email, { ...data, userName });
        return NextResponse.json({ success: true, id: result.data?.id });
      }

      case 'weekly_digest': {
        if (!prefs?.weekly_digest) {
          return NextResponse.json({ skipped: true, reason: 'weekly_digest disabled' });
        }
        const result = await sendWeeklyDigestEmail(email, { ...data, userName });
        return NextResponse.json({ success: true, id: result.data?.id });
      }

      case 'welcome': {
        const result = await sendWelcomeEmail(email, { ...data, userName });
        return NextResponse.json({ success: true, id: result.data?.id });
      }

      case 'test': {
        const result = await sendTestEmail(email);
        return NextResponse.json({ success: true, id: result.data?.id });
      }

      default:
        return NextResponse.json(
          { error: `Unknown email type: ${type}` },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Get user's notification preferences
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Validate UUID
    const uuidSchema = z.string().uuid();
    if (!uuidSchema.safeParse(userId).success) {
      return NextResponse.json(
        { error: 'Invalid userId format' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json(
        { error: 'Failed to fetch preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      preferences: data || {
        task_reminders: true,
        task_due_alerts: true,
        weekly_digest: true,
        daily_digest: false,
        quiet_hours_start: '20:00',
        quiet_hours_end: '08:00'
      }
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

// Update notification preferences
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, preferences } = body;

    if (!userId || !preferences) {
      return NextResponse.json(
        { error: 'userId and preferences are required' },
        { status: 400 }
      );
    }

    // Validate UUID
    const uuidSchema = z.string().uuid();
    if (!uuidSchema.safeParse(userId).success) {
      return NextResponse.json(
        { error: 'Invalid userId format' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, preferences: data });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
