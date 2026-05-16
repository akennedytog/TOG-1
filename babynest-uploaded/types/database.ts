// Database types for Supabase
// Shape matches what @supabase/postgrest-js expects: each Table must have
// Row/Insert/Update/Relationships, and the schema must include Views/Functions/Enums.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          due_date: string | null;
          category: string;
          status: string;
          priority: string;
          state_specific: boolean;
          state: string | null;
          estimated_time: number | null;
          icon: string | null;
          order: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          due_date?: string | null;
          category: string;
          status: string;
          priority: string;
          state_specific?: boolean;
          state?: string | null;
          estimated_time?: number | null;
          icon?: string | null;
          order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          due_date?: string | null;
          category?: string;
          status?: string;
          priority?: string;
          state_specific?: boolean;
          state?: string | null;
          estimated_time?: number | null;
          icon?: string | null;
          order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          state: string | null;
          due_date: string | null;
          income_bracket: string | null;
          family_size: number;
          onboarding_completed: boolean;
          onboarding_completed_at: string | null;
          onboarding_step: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          state?: string | null;
          due_date?: string | null;
          income_bracket?: string | null;
          family_size?: number;
          onboarding_completed?: boolean;
          onboarding_completed_at?: string | null;
          onboarding_step?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          state?: string | null;
          due_date?: string | null;
          income_bracket?: string | null;
          family_size?: number;
          onboarding_completed?: boolean;
          onboarding_completed_at?: string | null;
          onboarding_step?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          subscribed: boolean;
          subscribed_at: string | null;
          unsubscribed_at: string | null;
          source: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          subscribed?: boolean;
          subscribed_at?: string | null;
          unsubscribed_at?: string | null;
          source?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          subscribed?: boolean;
          subscribed_at?: string | null;
          unsubscribed_at?: string | null;
          source?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      // Catch-all rows for tables we don't fully model yet.
      // Permissive shapes keep TypeScript happy without forcing exhaustive schema definitions.
      waitlist: {
        Row: {
          id: string;
          email: string;
          state: string | null;
          due_date: string | null;
          joined_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          state?: string | null;
          due_date?: string | null;
          joined_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          state?: string | null;
          due_date?: string | null;
          joined_at?: string;
        };
        Relationships: [];
      };
      hospital_bag_items: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: string;
          packed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          category: string;
          packed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          category?: string;
          packed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
