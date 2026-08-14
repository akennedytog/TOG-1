-- BabyNest Data Persistence Fixes
-- Run this in Supabase SQL Editor to fix data persistence issues
-- Date: May 18, 2026

-- ============================================
-- 1. CONTRACTIONS TABLE
-- For storing contraction timing data from ContractionTimer component
-- ============================================

CREATE TABLE IF NOT EXISTS contractions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- Duration in seconds
  intensity INTEGER CHECK (intensity >= 1 AND intensity <= 10), -- 1-10 scale
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on contractions
ALTER TABLE contractions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contractions
DROP POLICY IF EXISTS "Users can view own contractions" ON contractions;
CREATE POLICY "Users can view own contractions"
  ON contractions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own contractions" ON contractions;
CREATE POLICY "Users can insert own contractions"
  ON contractions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own contractions" ON contractions;
CREATE POLICY "Users can update own contractions"
  ON contractions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own contractions" ON contractions;
CREATE POLICY "Users can delete own contractions"
  ON contractions FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for contractions updated_at
DROP TRIGGER IF EXISTS update_contractions_updated_at ON contractions;
CREATE TRIGGER update_contractions_updated_at BEFORE UPDATE ON contractions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for contractions
CREATE INDEX IF NOT EXISTS idx_contractions_user_id ON contractions(user_id);
CREATE INDEX IF NOT EXISTS idx_contractions_start_time ON contractions(start_time);

-- ============================================
-- 2. KICK_SESSIONS TABLE
-- For storing kick counting sessions from KickCounter component
-- ============================================

CREATE TABLE IF NOT EXISTS kick_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- Duration in minutes
  total_kicks INTEGER DEFAULT 0,
  target_kicks INTEGER DEFAULT 10,
  is_complete BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on kick_sessions
ALTER TABLE kick_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for kick_sessions
DROP POLICY IF EXISTS "Users can view own kick sessions" ON kick_sessions;
CREATE POLICY "Users can view own kick sessions"
  ON kick_sessions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own kick sessions" ON kick_sessions;
CREATE POLICY "Users can insert own kick sessions"
  ON kick_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own kick sessions" ON kick_sessions;
CREATE POLICY "Users can update own kick sessions"
  ON kick_sessions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own kick sessions" ON kick_sessions;
CREATE POLICY "Users can delete own kick sessions"
  ON kick_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for kick_sessions updated_at
DROP TRIGGER IF EXISTS update_kick_sessions_updated_at ON kick_sessions;
CREATE TRIGGER update_kick_sessions_updated_at BEFORE UPDATE ON kick_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for kick_sessions
CREATE INDEX IF NOT EXISTS idx_kick_sessions_user_id ON kick_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_kick_sessions_session_date ON kick_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_kick_sessions_is_complete ON kick_sessions(is_complete);

-- ============================================
-- 3. DOCUMENTS TABLE (ENHANCED)
-- Enhanced documents table for DocumentVault with additional fields
-- ============================================

-- First, check if documents table exists and modify if needed
DO $$
BEGIN
  -- Add columns to existing documents table if they don't exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents') THEN
    -- Add folder column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'folder') THEN
      ALTER TABLE documents ADD COLUMN folder VARCHAR(100) DEFAULT 'all';
    END IF;
    
    -- Add size column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'size') THEN
      ALTER TABLE documents ADD COLUMN size INTEGER;
    END IF;
    
    -- Add tags column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'tags') THEN
      ALTER TABLE documents ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
    
    -- Add is_favorite column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'is_favorite') THEN
      ALTER TABLE documents ADD COLUMN is_favorite BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add expiration_date column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'expiration_date') THEN
      ALTER TABLE documents ADD COLUMN expiration_date DATE;
    END IF;
    
    -- Add uploaded_at column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'uploaded_at') THEN
      ALTER TABLE documents ADD COLUMN uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add updated_at column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'updated_at') THEN
      ALTER TABLE documents ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
  END IF;
END $$;

-- If documents table doesn't exist, create it
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(500) NOT NULL,
  type VARCHAR(100),
  folder VARCHAR(100) DEFAULT 'all',
  size INTEGER,
  storage_path VARCHAR(1000),
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,
  expiration_date DATE,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Legacy fields for compatibility
  filename TEXT,
  url TEXT,
  metadata JSONB,
  ocr_data JSONB,
  extracted_info JSONB
);

-- Enable RLS on documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to ensure clean state
DROP POLICY IF EXISTS "Users can CRUD own documents" ON documents;
DROP POLICY IF EXISTS "Users can view own documents" ON documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON documents;
DROP POLICY IF EXISTS "Users can update own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON documents;

-- RLS Policies for documents
CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for documents updated_at
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for documents
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_folder ON documents(folder);
CREATE INDEX IF NOT EXISTS idx_documents_is_favorite ON documents(is_favorite);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_at ON documents(uploaded_at);

-- ============================================
-- 4. EXPENSES TABLE (ENHANCED WITH RLS)
-- Enhanced expenses table with proper RLS policies
-- ============================================

-- Create expenses table if not exists
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('medical', 'gear', 'childcare', 'diapers', 'clothing', 'toys', 'savings', 'other')),
  description TEXT,
  merchant TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_recurring BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on expenses
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to ensure clean state
DROP POLICY IF EXISTS "Users can CRUD own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can view own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can only see their own expenses" ON expenses;

-- RLS Policies for expenses
CREATE POLICY "Users can view own expenses"
  ON expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
  ON expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON expenses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON expenses FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for expenses updated_at
DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for expenses
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

-- ============================================
-- 5. KICK_EVENTS TABLE (Optional - for detailed kick tracking)
-- For storing individual kick events within a session
-- ============================================

CREATE TABLE IF NOT EXISTS kick_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES kick_sessions(id) ON DELETE CASCADE,
  kick_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  kick_type VARCHAR(50) DEFAULT 'normal', -- 'normal', 'strong', 'weak'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on kick_events
ALTER TABLE kick_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for kick_events
DROP POLICY IF EXISTS "Users can view own kick events" ON kick_events;
CREATE POLICY "Users can view own kick events"
  ON kick_events FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own kick events" ON kick_events;
CREATE POLICY "Users can insert own kick events"
  ON kick_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own kick events" ON kick_events;
CREATE POLICY "Users can delete own kick events"
  ON kick_events FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for kick_events
CREATE INDEX IF NOT EXISTS idx_kick_events_user_id ON kick_events(user_id);
CREATE INDEX IF NOT EXISTS idx_kick_events_session_id ON kick_events(session_id);
CREATE INDEX IF NOT EXISTS idx_kick_events_kick_time ON kick_events(kick_time);

-- ============================================
-- ENSURE update_updated_at_column FUNCTION EXISTS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- SUMMARY
-- ============================================
-- Tables created/modified:
-- 1. contractions - Stores contraction timing data
-- 2. kick_sessions - Stores kick counting sessions
-- 3. documents - Enhanced with folder, tags, favorites, etc.
-- 4. expenses - Enhanced with proper RLS policies
-- 5. kick_events - Optional detailed kick tracking
--
-- All tables have:
-- - UUID primary keys
-- - Foreign key to auth.users
-- - RLS enabled with user-specific policies
-- - updated_at triggers
-- - Appropriate indexes for performance
-- ============================================