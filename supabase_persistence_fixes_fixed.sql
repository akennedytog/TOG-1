-- BabyNest Data Persistence Fixes (FIXED VERSION)
-- Run this in Supabase SQL Editor to fix data persistence issues
-- Date: May 18, 2026

-- ============================================
-- ENSURE update_updated_at_column FUNCTION EXISTS FIRST
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- 1. CONTRACTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS contractions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER,
  intensity INTEGER CHECK (intensity >= 1 AND intensity <= 10),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE contractions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own contractions" ON contractions;
CREATE POLICY "Users can view own contractions" ON contractions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own contractions" ON contractions;
CREATE POLICY "Users can insert own contractions" ON contractions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own contractions" ON contractions;
CREATE POLICY "Users can update own contractions" ON contractions FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own contractions" ON contractions;
CREATE POLICY "Users can delete own contractions" ON contractions FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_contractions_updated_at ON contractions;
CREATE TRIGGER update_contractions_updated_at BEFORE UPDATE ON contractions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_contractions_user_id ON contractions(user_id);
CREATE INDEX IF NOT EXISTS idx_contractions_start_time ON contractions(start_time);

-- ============================================
-- 2. KICK_SESSIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS kick_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER,
  total_kicks INTEGER DEFAULT 0,
  target_kicks INTEGER DEFAULT 10,
  is_complete BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE kick_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own kick sessions" ON kick_sessions;
CREATE POLICY "Users can view own kick sessions" ON kick_sessions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own kick sessions" ON kick_sessions;
CREATE POLICY "Users can insert own kick sessions" ON kick_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own kick sessions" ON kick_sessions;
CREATE POLICY "Users can update own kick sessions" ON kick_sessions FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own kick sessions" ON kick_sessions;
CREATE POLICY "Users can delete own kick sessions" ON kick_sessions FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_kick_sessions_updated_at ON kick_sessions;
CREATE TRIGGER update_kick_sessions_updated_at BEFORE UPDATE ON kick_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_kick_sessions_user_id ON kick_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_kick_sessions_session_date ON kick_sessions(session_date);

-- ============================================
-- 3. EXPENSES TABLE - FIX EXISTING TABLE
-- ============================================

-- First, check if expenses table exists and fix the column name issue
DO $$
BEGIN
  -- Check if expenses table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'expenses') THEN
    -- If date column exists, keep it
    -- If created_at exists but no date, rename it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'date') THEN
      -- Check if created_at exists and rename it to date
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'created_at') THEN
        ALTER TABLE expenses RENAME COLUMN created_at TO date;
      ELSE
        -- Add date column if neither exists
        ALTER TABLE expenses ADD COLUMN date DATE DEFAULT CURRENT_DATE;
      END IF;
    END IF;
  END IF;
END $$;

-- Now create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  merchant TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_recurring BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure date column exists (add if missing)
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE;

-- Ensure category column has proper type
ALTER TABLE expenses ALTER COLUMN category TYPE VARCHAR(50);

-- Ensure is_recurring exists
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Clean up old policies
DROP POLICY IF EXISTS "Users can CRUD own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can view own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can only see their own expenses" ON expenses;

-- Create new policies
CREATE POLICY "Users can view own expenses" ON expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own expenses" ON expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own expenses" ON expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own expenses" ON expenses FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

-- ============================================
-- 4. DOCUMENTS TABLE
-- ============================================

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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if table exists
ALTER TABLE documents ADD COLUMN IF NOT EXISTS folder VARCHAR(100) DEFAULT 'all';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS size INTEGER;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS storage_path VARCHAR(1000);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS expiration_date DATE;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE documents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own documents" ON documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON documents;
DROP POLICY IF EXISTS "Users can update own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON documents;

CREATE POLICY "Users can view own documents" ON documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documents" ON documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own documents" ON documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents" ON documents FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_folder ON documents(folder);
CREATE INDEX IF NOT EXISTS idx_documents_is_favorite ON documents(is_favorite);

-- ============================================
-- 5. KICK_EVENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS kick_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES kick_sessions(id) ON DELETE CASCADE,
  kick_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  kick_type VARCHAR(50) DEFAULT 'normal',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE kick_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own kick events" ON kick_events;
CREATE POLICY "Users can view own kick events" ON kick_events FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own kick events" ON kick_events;
CREATE POLICY "Users can insert own kick events" ON kick_events FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own kick events" ON kick_events;
CREATE POLICY "Users can delete own kick events" ON kick_events FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_kick_events_user_id ON kick_events(user_id);
CREATE INDEX IF NOT EXISTS idx_kick_events_session_id ON kick_events(session_id);

-- ============================================
-- SUMMARY
-- ============================================
-- Tables created/fixed:
-- 1. contractions - Stores contraction timing data
-- 2. kick_sessions - Stores kick counting sessions  
-- 3. expenses - FIXED: Now has proper date column
-- 4. documents - Document storage with metadata
-- 5. kick_events - Detailed kick tracking
--
-- All tables have:
-- - UUID primary keys
-- - Foreign key to auth.users
-- - RLS enabled with user-specific policies
-- - updated_at triggers
-- - Appropriate indexes
-- ============================================
