// Auto-generated style Database type for Supabase typing.
// We use permissive Row/Insert/Update shapes (Record<string, any>) so we get
// safety where it matters (table name autocomplete + generic typing) without
// fighting Supabase's strict generated types throughout the codebase.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// A flexible table definition used for every table. This keeps the Supabase
// client typed (which fixes the rampant `never` errors) while letting the
// application layer enforce specific row shapes through its own types.
type GenericTable<Row = Record<string, any>> = {
  Row: Row & { [key: string]: any };
  Insert: Partial<Row> & { [key: string]: any };
  Update: Partial<Row> & { [key: string]: any };
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: GenericTable<{
        id: string;
        email: string;
        full_name: string | null;
        state: string | null;
        due_date: string | null;
        income_bracket: string | null;
        family_size: number | null;
        monthly_budget: number | null;
        onboarding_completed: boolean | null;
        onboarding_completed_at: string | null;
        onboarding_step: number | null;
        created_at: string;
        updated_at: string;
      }>;
      tasks: GenericTable<{
        id: string;
        user_id: string;
        title: string;
        description: string | null;
        due_date: string | null;
        category: string;
        status: string;
        priority: string;
        priority_weight: number | null;
        state_specific: boolean | null;
        state: string | null;
        estimated_time: number | null;
        completion_date: string | null;
        order: number | null;
        icon: string | null;
        created_at: string;
        updated_at: string;
      }>;
      newsletter_subscribers: GenericTable<{
        id: string;
        email: string;
        subscribed: boolean | null;
        subscribed_at: string | null;
        unsubscribed_at: string | null;
        source: string | null;
        created_at: string;
        updated_at: string;
      }>;
      waitlist: GenericTable<{
        id: string;
        email: string;
        state: string | null;
        due_date: string | null;
        joined_at: string;
      }>;
      hospital_bag_items: GenericTable<{
        id: string;
        user_id: string;
        item_key: string | null;
        name: string;
        category: string;
        packed: boolean | null;
        created_at: string;
        updated_at: string;
      }>;
      birth_plans: GenericTable<{
        id: string;
        user_id: string;
        sections: Json | null;
        notes: string | null;
        vaccines: Json | null;
        preferences: Json | null;
        created_at: string;
        updated_at: string;
      }>;
      benefit_documents: GenericTable<{
        id: string;
        user_id: string;
        name: string;
        file_name: string | null;
        document_type: string | null;
        type: string | null;
        category: string | null;
        uploaded_at: string | null;
        analysis: Json | null;
        extractedData: Json | null;
        created_at: string;
      }>;
      action_items: GenericTable<{
        id: string;
        user_id: string;
        title: string;
        description: string | null;
        completed: boolean | null;
        completed_at: string | null;
        status: string | null;
        priority: string | null;
        created_at: string;
      }>;
      registry_items: GenericTable<{
        id: string;
        user_id: string;
        name: string;
        category: string;
        price: number | null;
        quantity: number | null;
        source: string | null;
        status: string | null;
        priority: string | null;
        external_url: string | null;
        image_url: string | null;
        created_at: string;
      }>;
      savings_goals: GenericTable<{
        id: string;
        user_id: string;
        name: string;
        target_amount: number;
        current_amount: number | null;
        deadline: string | null;
        category: string | null;
        created_at: string;
      }>;
      budget_settings: GenericTable<{
        id: string;
        user_id: string;
        monthly_budget: number | null;
        created_at: string;
      }>;
      expenses: GenericTable<{
        id: string;
        user_id: string;
        description: string;
        amount: number;
        category: string;
        date: string;
        created_at: string;
      }>;
      notification_preferences: GenericTable<{
        id: string;
        user_id: string;
        email_enabled: boolean | null;
        push_enabled: boolean | null;
        email_frequency: string | null;
        push_frequency: string | null;
        quiet_hours_start: string | null;
        quiet_hours_end: string | null;
        created_at: string;
        updated_at: string;
      }>;
      pregnancy_tracking: GenericTable<{
        id: string;
        user_id: string;
        completed_vaccine_ids: string[] | null;
        data: Json | null;
        created_at: string;
        updated_at: string;
      }>;
      push_subscriptions: GenericTable<{
        id: string;
        user_id: string;
        endpoint: string;
        p256dh: string;
        auth: string;
        enabled: boolean | null;
        created_at: string;
      }>;
      baby_metrics: GenericTable<{
        id: string;
        user_id: string;
        date: string;
        weight: number | null;
        height: number | null;
        head_circumference: number | null;
        notes: string | null;
        created_at: string;
        updated_at: string;
      }>;
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}
