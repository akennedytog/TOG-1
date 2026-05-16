import { supabase } from './supabase';

/**
 * Check if a user has completed onboarding
 */
export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
    
    return data?.onboarding_completed || false;
  } catch (error) {
    console.error('Error in hasCompletedOnboarding:', error);
    return false;
  }
}

/**
 * Get the current onboarding step for a user
 */
export async function getOnboardingStep(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('onboarding_step')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error getting onboarding step:', error);
      return 0;
    }
    
    return data?.onboarding_step || 0;
  } catch (error) {
    console.error('Error in getOnboardingStep:', error);
    return 0;
  }
}

/**
 * Update onboarding progress
 */
export async function updateOnboardingProgress(
  userId: string,
  step: number,
  data?: Partial<{
    state: string;
    due_date: string;
    income_bracket: string;
    family_size: number;
  }>
): Promise<void> {
  try {
    const updates: any = {
      onboarding_step: step,
      updated_at: new Date().toISOString(),
    };
    
    if (data) {
      if (data.state) updates.state = data.state;
      if (data.due_date) updates.due_date = data.due_date;
      if (data.income_bracket) updates.income_bracket = data.income_bracket;
      if (data.family_size) updates.family_size = data.family_size;
    }
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating onboarding progress:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateOnboardingProgress:', error);
    throw error;
  }
}

/**
 * Complete onboarding for a user
 */
export async function completeOnboarding(
  userId: string,
  data: {
    state: string;
    due_date: string;
    income_bracket?: string;
    family_size?: number;
  }
): Promise<void> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        ...data,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        onboarding_step: 6,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
    
    if (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in completeOnboarding:', error);
    throw error;
  }
}

/**
 * Get state insurance deadline
 */
export function getInsuranceDeadline(state: string): number {
  const deadlines: Record<string, number> = {
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
  
  return deadlines[state] || 30;
}

/**
 * Get state 529 plan name
 */
export function get529PlanName(state: string): string {
  const names: Record<string, string> = {
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
    'RI': 'CollegeBound Saver',
    'SC': 'Future Scholar',
    'SD': 'CollegeAccess 529',
    'TN': 'TNStars',
    'TX': 'Texas College Savings Plan',
    'UT': 'my529',
    'VT': 'Vermont Higher Education',
    'VA': 'Invest529',
    'WA': 'DreamAhead',
    'WV': 'SMART529',
    'WI': 'Edvest',
    'WY': 'Wyoming College Investment Plan',
  };
  
  return names[state] || `${state} 529 Plan`;
}

/**
 * Get state tax benefits for 529
 */
export function getStateTaxBenefits(state: string): { deduction: string; note: string } | null {
  const benefits: Record<string, { deduction: string; note: string }> = {
    'NY': { deduction: '$10,000', note: '$5,000 single filer' },
    'IL': { deduction: '$10,000', note: '$20,000 joint filers' },
    'MI': { deduction: '$5,000', note: '$10,000 joint filers' },
    'MS': { deduction: '$10,000', note: 'Full deduction' },
    'OK': { deduction: '$10,000', note: '$20,000 joint filers' },
    'OR': { deduction: '$2,500', note: '$5,000 joint filers' },
    'SC': { deduction: 'Unlimited', note: 'Full amount of contributions' },
    'VA': { deduction: '$4,000', note: 'Per account' },
    'WI': { deduction: '$3,500', note: 'Per beneficiary' },
    'PA': { deduction: '$17,000', note: '$34,000 joint filers' },
    'OH': { deduction: '$4,000', note: 'Per beneficiary' },
    'IN': { deduction: '$5,000', note: '$7,500 for joint filers' },
    'MD': { deduction: '$2,500', note: '$5,000 joint filers' },
    'AR': { deduction: '$5,000', note: '$10,000 joint filers' },
    'CO': { deduction: 'Full amount', note: 'No limit on deduction' },
    'NM': { deduction: 'Full amount', note: 'No limit on deduction' },
    'WV': { deduction: 'Full amount', note: 'No limit on deduction' },
    'IA': { deduction: '$3,619', note: 'Per beneficiary' },
    'MO': { deduction: '$8,000', note: '$16,000 joint filers' },
    'NE': { deduction: '$10,000', note: '$5,000 single filers' },
    'KS': { deduction: '$3,000', note: '$6,000 joint filers' },
    'ME': { deduction: '$250', note: 'Annual match available' },
    'NJ': { deduction: '$10,000', note: 'New as of 2022' },
  };
  
  return benefits[state] || null;
}

/**
 * Get unique state programs
 */
export function getUniquePrograms(state: string): Array<{ name: string; description: string; link?: string }> {
  const programs: Record<string, Array<{ name: string; description: string; link?: string }>> = {
    'CA': [
      { name: 'CalKIDS', description: 'California provides $25-$100 in college savings for every child born in California' },
    ],
    'FL': [
      { name: 'Florida Prepaid', description: 'Lock in future college tuition at today\'s prices' },
    ],
    'MI': [
      { name: 'MI Kids 529', description: '$50 matching contribution for eligible families' },
    ],
    'ME': [
      { name: 'Harold Alfond Grant', description: '$500 grant for every Maine resident baby' },
    ],
    'NV': [
      { name: 'Silver State Matching Grant', description: 'Up to $300 annual matching for eligible families' },
    ],
    'IL': [
      { name: 'Bright Start Illinois', description: 'State tax deduction up to $10,000' },
    ],
  };
  
  return programs[state] || [];
}

/**
 * Calculate pregnancy timeline
 * FIXED: Properly calculate trimester based on weeks until due date
 */
export function calculateTimeline(dueDate: string): {
  trimester: 1 | 2 | 3 | 'postpartum';
  daysUntilDue: number;
  weeksUntilDue: number;
  label: string;
  color: string;
  bgColor: string;
} {
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - today.getTime();
  const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const weeksUntilDue = Math.floor(daysUntilDue / 7);
  
  // Calculate weeks pregnant (40 weeks total - weeks remaining)
  // But cap at 40 weeks (can't be more pregnant than full term)
  const weeksPregnant = Math.min(40, Math.max(0, 40 - weeksUntilDue));
  
  if (daysUntilDue < 0) {
    return {
      trimester: 'postpartum',
      daysUntilDue,
      weeksUntilDue,
      label: 'Baby has arrived! 🎉',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    };
  } else if (weeksPregnant >= 27) {
    // 3rd trimester: weeks 27-40
    return {
      trimester: 3,
      daysUntilDue,
      weeksUntilDue,
      label: `3rd Trimester - ${daysUntilDue} days to go! 🏁`,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    };
  } else if (weeksPregnant >= 13) {
    // 2nd trimester: weeks 13-26
    return {
      trimester: 2,
      daysUntilDue,
      weeksUntilDue,
      label: `2nd Trimester - ${weeksUntilDue} weeks to go ✨`,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    };
  } else {
    // 1st trimester: weeks 0-12
    return {
      trimester: 1,
      daysUntilDue,
      weeksUntilDue,
      label: `1st Trimester - ${weeksUntilDue} weeks to go 💚`,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
    };
  }
}

/**
 * Format income bracket for display
 */
export function formatIncomeBracket(bracket: string): string {
  const labels: Record<string, string> = {
    'under50k': 'Under $50,000',
    '50k-75k': '$50,000 - $75,000',
    '75k-100k': '$75,000 - $100,000',
    '100k-150k': '$100,000 - $150,000',
    '150k-200k': '$150,000 - $200,000',
    'over200k': 'Over $200,000',
  };
  
  return labels[bracket] || bracket;
}

/**
 * Format plan type for display
 */
export function formatPlanType(planType: string): string {
  const labels: Record<string, string> = {
    'ppo': 'PPO',
    'hmo': 'HMO',
    'epo': 'EPO',
    'pos': 'POS',
    'hdhp': 'HDHP',
    'unknown': 'Not Sure',
  };
  
  return labels[planType] || planType;
}

/**
 * Generate onboarding tasks based on user data
 */
export function generateOnboardingTasks(
  userId: string,
  data: {
    state: string;
    dueDate: string;
    incomeBracket?: string;
    familySize?: string;
    provider?: string;
    planType?: string;
  }
): any[] {
  const tasks = [];
  const due = new Date(data.dueDate);
  const today = new Date();
  const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Insurance deadline
  const insuranceDays = getInsuranceDeadline(data.state);
  
  // Core tasks everyone gets
  tasks.push({
    user_id: userId,
    title: `Add Baby to Health Insurance`,
    description: `In ${data.state}, you have ${insuranceDays} days from birth to add your baby to your health insurance plan.`,
    due_date: new Date(due.getTime() + insuranceDays * 24 * 60 * 60 * 1000).toISOString(),
    category: 'insurance',
    status: 'pending',
    priority: 'urgent',
    state_specific: true,
    state: data.state,
    estimated_time: 60,
  });
  
  tasks.push({
    user_id: userId,
    title: 'Apply for Social Security Number',
    description: 'Apply for your baby\'s SSN at the hospital or SSA office. You\'ll need it for taxes and insurance.',
    due_date: new Date(due.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'tax',
    status: 'pending',
    priority: 'high',
    state_specific: false,
    state: null,
    estimated_time: 30,
  });
  
  tasks.push({
    user_id: userId,
    title: 'Order Birth Certificate',
    description: 'Order certified copies of the birth certificate for insurance, taxes, and legal purposes.',
    due_date: new Date(due.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'legal',
    status: 'pending',
    priority: 'high',
    state_specific: true,
    state: data.state,
    estimated_time: 15,
  });
  
  // Add pre-birth tasks if applicable
  if (daysUntilDue > 0) {
    if (daysUntilDue > 30) {
      tasks.unshift({
        user_id: userId,
        title: 'Confirm Pediatrician is In-Network',
        description: 'Verify your chosen pediatrician accepts your insurance before delivery.',
        due_date: new Date(due.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'insurance',
        status: 'pending',
        priority: 'high',
        state_specific: false,
        state: null,
        estimated_time: 15,
      });
    }
    
    if (daysUntilDue > 60) {
      tasks.unshift({
        user_id: userId,
        title: 'Research Hospital Billing',
        description: 'Contact the hospital billing department to understand costs and payment options.',
        due_date: new Date(due.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'insurance',
        status: 'pending',
        priority: 'medium',
        state_specific: false,
        state: null,
        estimated_time: 30,
      });
    }
  }
  
  return tasks;
}
