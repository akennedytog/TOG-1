import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

// Lazy initialization
let supabaseInstance: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    });
  }
  return supabaseInstance;
}

// Backwards compatibility - lazy getter
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_, prop) {
    const client = getSupabase();
    return (client as any)[prop];
  },
}) as SupabaseClient<Database>;

// For client components
export const createClientComponent = () => {
  return createClientComponentClient<Database>();
};

// Helper functions
export const updateProfile = async (userId: string, data: Partial<Profile>) => {
  const { data: profile, error } = await getSupabase()
    .from('profiles')
    .update(data)
    .eq('id', userId)
    .select()
    .single();
  return { profile, error };
};

export const getProfile = async (userId: string) => {
  const { data: profile, error } = await getSupabase()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { profile, error };
};

export const updateTaskStatus = async (
  taskId: string,
  status: Task['status'],
  completionDate?: string | null,
) => {
  const update: Record<string, any> = { status, updated_at: new Date().toISOString() };
  if (completionDate !== undefined) update.completion_date = completionDate;
  const { data, error } = await getSupabase()
    .from('tasks')
    .update(update as any)
    .eq('id', taskId)
    .select()
    .single();
  return { task: data, error };
};

export const joinWaitlist = async (data: { email: string; state?: string; due_date?: string }) => {
  const { data: entry, error } = await getSupabase()
    .from('waitlist')
    .insert({
      email: data.email,
      state: data.state,
      due_date: data.due_date,
      joined_at: new Date().toISOString(),
    })
    .select()
    .single();
  return { entry, error };
};

export type HospitalBagItem = {
  id: string;
  user_id: string;
  item_key: string;
  name: string;
  category: string;
  essential: boolean;
  checked: boolean;
  is_custom: boolean;
  description: string | null;
  packed?: boolean | null;
  created_at: string;
  updated_at: string;
};

export const getHospitalBagItems = async (userId: string): Promise<HospitalBagItem[]> => {
  const { data, error } = await getSupabase()
    .from('hospital_bag_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('getHospitalBagItems error', error);
    return [];
  }
  return (data || []) as unknown as HospitalBagItem[];
};

export const addHospitalBagItem = async (userId: string, item: Partial<HospitalBagItem> & { name: string; category: string }) => {
  const { data, error } = await getSupabase()
    .from('hospital_bag_items')
    .insert({
      user_id: userId,
      ...item,
      created_at: new Date().toISOString(),
    } as any)
    .select()
    .single();
  return { item: data, error };
};

export const updateHospitalBagItem = async (itemId: string, updates: Partial<HospitalBagItem>) => {
  const { data, error } = await getSupabase()
    .from('hospital_bag_items')
    .update({ ...updates, updated_at: new Date().toISOString() } as any)
    .eq('id', itemId)
    .select()
    .single();
  return { item: data, error };
};

export const deleteHospitalBagItem = async (userIdOrItemId: string, itemKey?: string) => {
  const supa = getSupabase();
  if (itemKey) {
    // called as deleteHospitalBagItem(userId, item_key)
    const { error } = await supa
      .from('hospital_bag_items')
      .delete()
      .eq('user_id', userIdOrItemId)
      .eq('item_key', itemKey);
    return { error };
  }
  const { error } = await supa
    .from('hospital_bag_items')
    .delete()
    .eq('id', userIdOrItemId);
  return { error };
};

export const upsertHospitalBagItem = async (
  userId: string,
  item: Partial<HospitalBagItem> & { name: string; category: string }
) => {
  const { data, error } = await getSupabase()
    .from('hospital_bag_items')
    .upsert({
      user_id: userId,
      ...item,
      updated_at: new Date().toISOString(),
    } as any)
    .select()
    .single();
  return { item: data, error };
};

// Types
export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  state: string | null;
  due_date: string | null;
  income_bracket: string | null;
  family_size: number | null;
  monthly_budget?: number | null;
  onboarding_completed: boolean | null;
  onboarding_completed_at: string | null;
  onboarding_step: number | null;
  created_at: string;
  updated_at: string;
  [key: string]: any;
};

export type Task = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  category: string;
  status: string;
  priority: string;
  priority_weight?: number | null;
  state_specific?: boolean | null;
  state?: string | null;
  estimated_time?: number | null;
  completion_date?: string | null;
  order?: number | null;
  icon?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
};

export type FamilyMember = {
  id: string;
  user_id: string;
  name: string;
  relationship: string;
  email: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  plan: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
};

export type InsuranceDoc = {
  id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  extracted_text: string | null;
  parsed_data: any | null;
  category: string;
  created_at: string;
  updated_at: string;
};

export type Document = {
  id: string;
  user_id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  category: 'insurance' | 'legal' | 'financial' | 'medical' | 'other';
  uploaded_at: string;
};

export type Milestone = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  due_date: string | null;
  completed_at: string | null;
  icon: string | null;
  category: 'medical' | 'financial' | 'legal' | 'benefit' | 'general';
  created_at: string;
};

export type Contraction = {
  id: string;
  user_id: string;
  start_time: string;
  duration: number;
  intensity: 1 | 2 | 3 | 4 | 5;
  notes: string | null;
  created_at: string;
};

export type BabyRegistryItem = {
  id: string;
  user_id: string;
  name: string;
  category: string;
  priority: 'essential' | 'nice' | 'optional';
  estimated_cost: number | null;
  purchased: boolean;
  purchased_at: string | null;
  created_at: string;
};

export type SavingsGoal = {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  category: string;
  created_at: string;
};

export type Budget = {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  created_at: string;
};

export type Expense = {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  created_at: string;
};

export type NotificationPref = {
  id: string;
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  email_frequency: 'immediate' | 'daily' | 'weekly' | 'never';
  push_frequency: 'immediate' | 'daily' | 'never';
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  created_at: string;
  updated_at: string;
};

export type PushSubscription = {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  enabled: boolean;
  created_at: string;
};

export type WaitlistEntry = {
  id: string;
  email: string;
  state: string | null;
  due_date: string | null;
  joined_at: string;
};

export type NewsletterSubscriber = {
  id: string;
  email: string;
  subscribed: boolean;
  subscribed_at: string | null;
  unsubscribed_at: string | null;
  source?: string;
  created_at: string;
  updated_at: string;
};

export type Admin = {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  created_at: string;
};

export type ProfileWithSubscription = Profile & {
  subscriptions: Subscription[];
};

// Additional types for components
export type BenefitDocument = {
  id: string;
  user_id: string;
  name?: string | null;
  file_name?: string | null;
  type?: string | null;
  document_type?: string | null;
  category?: string | null;
  uploaded_at?: string | null;
  analysis?: any;
  extractedData?: {
    summary?: string;
    benefits?: string[];
    coverage?: string[];
  };
  [key: string]: any;
};

export type ActionItem = {
  id: string;
  title?: string | null;
  description?: string | null;
  completed?: boolean | null;
  completed_at?: string | null;
  status?: string | null;
  priority?: string | null;
  task_text?: string | null;
  category?: string | null;
  user_id?: string | null;
  document_id?: string | null;
  created_at?: string;
  [key: string]: any;
};

export type BirthPlan = {
  id: string;
  user_id: string;
  preferences: {
    environment: string[];
    painManagement: string[];
    delivery: string[];
    afterBirth: string[];
    newbornCare: string[];
    contingencies: string[];
  };
  created_at: string;
  updated_at: string;
};

// Birth Plan helpers
export const getBirthPlan = async (userId: string): Promise<any | null> => {
  const { data, error } = await getSupabase()
    .from('birth_plans')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    console.error('getBirthPlan error', error);
    return null;
  }
  return data;
};

export const upsertBirthPlan = async (
  userId: string,
  payload: {
    sections?: any;
    notes?: string;
    vaccines?: any;
    preferences?: BirthPlan['preferences'];
  }
) => {
  const { data, error } = await getSupabase()
    .from('birth_plans')
    .upsert({
      user_id: userId,
      ...payload,
      updated_at: new Date().toISOString(),
    } as any)
    .select()
    .single();
  return { birthPlan: data, error };
};
