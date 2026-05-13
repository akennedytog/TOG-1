export interface Contact {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  title?: string
  account_id?: string
  owner_id?: string
  source?: string
  tags: string[]
  custom_fields: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Account {
  id: string
  name: string
  domain?: string
  industry?: string
  size?: string
  annual_revenue?: number
  website?: string
  address?: string
  billing_address?: string
  owner_id?: string
  status: string
  health_score?: number
  last_activity_at?: string
  next_activity_at?: string
  tags: string[]
  custom_fields: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Deal {
  id: string
  name: string
  account_id: string
  contact_id?: string
  owner_id?: string
  stage: string
  value: number
  currency: string
  probability?: number
  expected_close_date?: string
  actual_close_date?: string
  source?: string
  priority: string
  competitors: string[]
  notes?: string
  tags: string[]
  custom_fields: Record<string, any>
  created_at: string
  updated_at: string
  // Enriched fields
  account_name?: string
  contact_name?: string
}

export interface Activity {
  id: string
  type: 'call' | 'email' | 'meeting' | 'note' | 'task'
  contact_id?: string
  account_id?: string
  deal_id?: string
  owner_id?: string
  subject?: string
  description?: string
  outcome?: string
  duration_minutes?: number
  scheduled_at?: string
  completed_at?: string
  metadata: Record<string, any>
  created_at: string
}

export interface Task {
  id: string
  title: string
  description?: string
  contact_id?: string
  account_id?: string
  deal_id?: string
  owner_id?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  due_date?: string
  completed_at?: string
  ai_suggested: boolean
  ai_reason?: string
  created_at: string
}

export interface PipelineStage {
  stage: string
  name: string
  color: string
  count: number
  value: number
}

export interface DashboardMetrics {
  open_deals: number
  weighted_pipeline: number
  month_revenue: number
  tasks_today: number
  activities_this_week: number
}

export interface Briefing {
  generated_at: string
  owner_id?: string
  summary: {
    greeting: string
    focus: string
    stats: {
      urgent: number
      high: number
      medium: number
      pipeline_value: number
    }
    top_priority: string
  }
  priority_actions: BriefingAction[]
  insights: BriefingInsight[]
  metrics: DashboardMetrics
}

export interface BriefingAction {
  type: string
  priority: 'urgent' | 'high' | 'medium' | 'low'
  title: string
  description: string
  entity_id?: string
  entity_type?: 'deal' | 'contact' | 'account'
  reason: string
  suggested_action: string
}

export interface BriefingInsight {
  type: string
  title: string
  description: string
  recommended_action: string
}

export interface DealVelocity {
  deal_id: string
  deal_name: string
  velocity_score: number | null
  activity_per_week: number
  days_in_stage: number
  total_activities: number
  activity_frequency: 'high' | 'medium' | 'low'
  trend: 'accelerating' | 'stable' | 'slowing' | 'insufficient_data'
  stage: string
}

export interface DealScore {
  deal_id: string
  deal_name: string
  total_score: number
  components: Record<string, number>
  risk_category: 'On Track' | 'Needs Attention' | 'At Risk'
  risk_color: 'green' | 'yellow' | 'red'
  predicted_close_probability: number
  recommendation: string
}
