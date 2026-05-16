import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

type TaskInsert = Database['public']['Tables']['tasks']['Insert'];

// Lazy initialization
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

function getSupabase() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    supabaseClient = createClient<Database>(supabaseUrl, supabaseServiceKey);
  }
  return supabaseClient;
}

// State-specific insurance deadlines
const INSURANCE_DEADLINES: Record<string, number> = {
  'FL': 60, 'WI': 60, 'MN': 60, 'WA': 60, 'OR': 60, 'OK': 60,
  'AL': 60, 'AR': 60, 'MT': 60, 'NE': 60, 'NM': 60, 'WV': 60,
  'ID': 60, 'HI': 60, 'NH': 60, 'ME': 60, 'SD': 60, 'ND': 60,
  'AK': 60, 'VT': 60, 'WY': 60, 'IA': 60,
  'TX': 30, 'CA': 30, 'NY': 30, 'IL': 30, 'PA': 30, 'OH': 30,
  'MI': 30, 'GA': 30, 'NC': 30, 'NJ': 30, 'VA': 30, 'AZ': 30,
  'MA': 30, 'TN': 30, 'IN': 30, 'MO': 30, 'MD': 30, 'CO': 30,
  'CT': 30, 'NV': 30, 'KY': 30, 'LA': 30, 'SC': 30, 'RI': 30,
  'DE': 30, 'MS': 30, 'KS': 30,
};

// State-specific 529 plan names
const PLAN_529_NAMES: Record<string, string> = {
  'AL': 'CollegeCounts 529',
  'AK': 'UA College Savings Plan',
  'AZ': 'Arizona Family College Savings',
  'AR': 'GIFT College Investing Plan',
  'CA': 'ScholarShare 529',
  'CO': 'CollegeInvest',
  'CT': 'CHET',
  'DE': 'DE529 Education Savings Plan',
  'FL': 'Florida 529 Savings Plan',
  'GA': 'Path2College 529',
  'HI': 'Hawaii\'s College Savings Program',
  'ID': 'IDeal',
  'IL': 'Bright Start',
  'IN': 'CollegeChoice 529',
  'IA': 'College Savings Iowa',
  'KS': 'Learning Quest',
  'KY': 'KY Saves 529',
  'LA': 'START Saving Program',
  'ME': 'NextGen',
  'MD': 'Maryland College Investment Plan',
  'MA': 'U.Fund',
  'MI': 'MESP',
  'MN': 'Minnesota College Savings Plan',
  'MS': 'MACS',
  'MO': 'MOST',
  'MT': 'Achieve Montana',
  'NE': 'NEST',
  'NV': 'SSGA Upromise 529',
  'NH': 'UNIQUE',
  'NJ': 'NJ Best',
  'NM': 'The Education Plan',
  'NY': 'New York\'s 529 College Savings',
  'NC': 'NC 529 Plan',
  'ND': 'College SAVE',
  'OH': 'CollegeAdvantage',
  'OK': 'OK 529',
  'OR': 'Oregon College Savings Plan',
  'PA': 'PA 529',
  'RI': 'CollegeBound',
  'SC': 'Future Scholar',
  'SD': 'CollegeAccess',
  'TN': 'TNStars',
  'TX': 'Texas Tuition Promise Fund',
  'UT': 'my529',
  'VT': 'Vermont Higher Education',
  'VA': 'Invest529',
  'WA': 'DreamAhead',
  'WV': 'SMART529',
  'WI': 'Edvest',
  'WY': 'WyoScholar',
};

// Federal tax credit amounts
const TAX_CREDITS: Record<string, { ctc: number; eitc: number; cdc: number }> = {
  'low': { ctc: 2000, eitc: 6000, cdc: 3000 },
  'medium': { ctc: 2000, eitc: 3000, cdc: 6000 },
  'high': { ctc: 2000, eitc: 0, cdc: 6000 },
};

// Generate tasks based on user profile
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get user profile
    const { data: profile, error: profileError } = await getSupabase()
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const tasks = generateTasks(profile);

    // Delete existing tasks for this user
    await getSupabase()
      .from('tasks')
      .delete()
      .eq('user_id', userId);

    // Insert new tasks (typed via the Database generic).
    const rows: TaskInsert[] = tasks.map((task, index) => ({
      title: task.title,
      description: task.description || null,
      due_date: task.due_date || null,
      category: task.category,
      status: task.status,
      priority: task.priority,
      state_specific: task.state_specific ?? false,
      state: task.state || null,
      estimated_time: task.estimated_time || null,
      icon: task.icon || null,
      user_id: userId,
      order: index,
    }));

    const { error: insertError } = await getSupabase()
      .from('tasks')
      .insert(rows);

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({ 
      success: true, 
      taskCount: tasks.length,
      tasks: tasks.slice(0, 5)
    });
  } catch (error) {
    console.error('Generate tasks error:', error);
    return NextResponse.json(
      { error: 'Failed to generate tasks' },
      { status: 500 }
    );
  }
}

function generateTasks(profile: any) {
  const tasks = [];
  const state = profile.state || 'CA';
  const dueDate = profile.due_date ? new Date(profile.due_date) : null;
  const income = profile.income_bracket || 'medium';
  const now = new Date();

  const dueDateTime = dueDate?.getTime() || now.getTime() + 90 * 24 * 60 * 60 * 1000;
  const trimester1End = dueDateTime - 180 * 24 * 60 * 60 * 1000;
  const trimester2Start = trimester1End;
  const trimester2End = dueDateTime - 90 * 24 * 60 * 60 * 1000;
  const trimester3Start = trimester2End;
  const birthYear = dueDate?.getFullYear() || now.getFullYear();

  const insuranceDeadline = INSURANCE_DEADLINES[state] || 30;
  tasks.push({
    title: 'Add Baby to Health Insurance',
    description: `You have ${insuranceDeadline} days after birth to add your baby to your health insurance plan.`,
    due_date: new Date(dueDateTime + insuranceDeadline * 24 * 60 * 60 * 1000).toISOString(),
    category: 'insurance',
    status: 'pending',
    priority: 'urgent',
    state_specific: true,
    state: state,
    estimated_time: 30,
    icon: 'Shield',
  });

  const planName = PLAN_529_NAMES[state] || 'Your State\'s 529 Plan';
  tasks.push({
    title: `Research ${planName}`,
    description: `${planName} offers tax-advantaged savings for education.`,
    due_date: new Date(trimester2Start + 30 * 24 * 60 * 60 * 1000).toISOString(),
    category: '529',
    status: 'pending',
    priority: 'medium',
    state_specific: true,
    state: state,
    estimated_time: 60,
    icon: 'GraduationCap',
  });

  tasks.push({
    title: `Open ${planName} Account`,
    description: 'Open a 529 account for your baby.',
    due_date: new Date(trimester2Start + 60 * 24 * 60 * 60 * 1000).toISOString(),
    category: '529',
    status: 'pending',
    priority: 'medium',
    state_specific: true,
    state: state,
    estimated_time: 30,
    icon: 'Wallet',
  });

  const taxCredits = TAX_CREDITS[income] || TAX_CREDITS.medium;
  tasks.push({
    title: 'Claim Child Tax Credit',
    description: `You may be eligible for up to $${taxCredits.ctc} per child.`,
    due_date: new Date(birthYear + 1, 3, 15).toISOString(),
    category: 'tax',
    status: 'pending',
    priority: 'high',
    state_specific: false,
    state: null,
    estimated_time: 120,
    icon: 'Calculator',
  });

  if (taxCredits.eitc > 0) {
    tasks.push({
      title: 'Apply for Earned Income Tax Credit',
      description: `You may qualify for up to $${taxCredits.eitc} in EITC.`,
      due_date: new Date(birthYear + 1, 3, 15).toISOString(),
      category: 'tax',
      status: 'pending',
      priority: 'high',
      state_specific: false,
      state: null,
      estimated_time: 90,
      icon: 'DollarSign',
    });
  }

  tasks.push({
    title: 'Claim Child Care Tax Credit',
    description: `Claim up to $${taxCredits.cdc} in expenses.`,
    due_date: new Date(birthYear + 1, 3, 15).toISOString(),
    category: 'tax',
    status: 'pending',
    priority: 'medium',
    state_specific: false,
    state: null,
    estimated_time: 60,
    icon: 'Baby',
  });

  tasks.push({
    title: 'Create or Update Will',
    description: 'Name guardians for your child.',
    due_date: new Date(trimester3Start + 30 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'legal',
    status: 'pending',
    priority: 'high',
    state_specific: false,
    state: null,
    estimated_time: 180,
    icon: 'FileText',
  });

  tasks.push({
    title: 'Order Birth Certificate',
    description: 'Request certified copies.',
    due_date: new Date(dueDateTime + 14 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'legal',
    status: 'pending',
    priority: 'high',
    state_specific: true,
    state: state,
    estimated_time: 30,
    icon: 'FileText',
  });

  tasks.push({
    title: 'Apply for Social Security Number',
    description: 'Apply for your baby\'s SSN.',
    due_date: new Date(dueDateTime + 30 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'legal',
    status: 'pending',
    priority: 'high',
    state_specific: false,
    state: null,
    estimated_time: 60,
    icon: 'CreditCard',
  });

  tasks.push({
    title: 'Adjust FSA/HSA Contributions',
    description: 'Increase contributions for next year.',
    due_date: new Date(trimester3Start).toISOString(),
    category: 'benefit',
    status: 'pending',
    priority: 'medium',
    state_specific: false,
    state: null,
    estimated_time: 30,
    icon: 'PiggyBank',
  });

  tasks.push({
    title: 'Review Life Insurance Coverage',
    description: 'Consider increasing coverage.',
    due_date: new Date(trimester2Start + 90 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'insurance',
    status: 'pending',
    priority: 'medium',
    state_specific: false,
    state: null,
    estimated_time: 90,
    icon: 'Heart',
  });

  tasks.push({
    title: 'Create Baby Document Folder',
    description: 'Set up a folder for documents.',
    due_date: new Date(dueDateTime + 7 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'general',
    status: 'pending',
    priority: 'medium',
    state_specific: false,
    state: null,
    estimated_time: 60,
    icon: 'Folder',
  });

  return tasks;
}
