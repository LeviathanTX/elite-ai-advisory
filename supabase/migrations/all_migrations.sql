-- ============================================================================
-- AI-BoD (Bearable AI Advisors) - Complete Database Setup
-- ============================================================================
-- This file contains all migrations in correct order
-- Copy the entire contents and paste into Supabase SQL Editor
--
-- Generated: $(date)
-- ============================================================================

BEGIN;


-- ============================================================================
-- Migration: 20241115000000_initial_schema.sql
-- ============================================================================

-- Supabase Database Setup for Bearable AI Advisors
-- Run this in Supabase SQL Editor if tables don't exist

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'founder' CHECK (subscription_tier IN ('founder', 'scale-up', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create custom_advisors table
CREATE TABLE IF NOT EXISTS public.custom_advisors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT,
  expertise TEXT[] DEFAULT '{}',
  personality_description TEXT NOT NULL,
  communication_style TEXT NOT NULL,
  background_context TEXT NOT NULL,
  avatar_emoji TEXT DEFAULT '👨‍💼',
  avatar_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS custom_advisors_user_id_idx ON public.custom_advisors(user_id);

ALTER TABLE public.custom_advisors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own advisors" ON public.custom_advisors
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own advisors" ON public.custom_advisors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own advisors" ON public.custom_advisors
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own advisors" ON public.custom_advisors
  FOR DELETE USING (auth.uid() = user_id);

-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  advisor_id UUID NOT NULL,
  advisor_type TEXT NOT NULL CHECK (advisor_type IN ('celebrity', 'custom')),
  mode TEXT NOT NULL CHECK (mode IN ('pitch_practice', 'strategic_planning', 'due_diligence', 'quick_consultation')),
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS conversations_user_id_idx ON public.conversations(user_id);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own conversations" ON public.conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON public.conversations
  FOR UPDATE USING (auth.uid() = user_id);

-- Create documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  content_text TEXT,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  analysis_status TEXT DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'processing', 'completed', 'error')),
  analysis_results JSONB
);

CREATE INDEX IF NOT EXISTS documents_user_id_idx ON public.documents(user_id);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own documents" ON public.documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own documents" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create usage_stats table
CREATE TABLE IF NOT EXISTS public.usage_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  ai_advisor_hours_used NUMERIC DEFAULT 0,
  document_analyses_used INTEGER DEFAULT 0,
  pitch_practice_sessions_used INTEGER DEFAULT 0,
  custom_advisors_created INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS usage_stats_user_id_idx ON public.usage_stats(user_id);

ALTER TABLE public.usage_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own stats" ON public.usage_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON public.usage_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON public.usage_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_advisors_updated_at BEFORE UPDATE ON public.custom_advisors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_stats_updated_at BEFORE UPDATE ON public.usage_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- Migration: 20241116000000_enhanced_document_system.sql
-- ============================================================================

-- Enhanced Document System for VC-Level Multi-Document Analysis
-- Migration: 20241116000000_enhanced_document_system.sql

-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Enhanced documents table with metadata and categorization
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS category TEXT CHECK (category IN (
    'pitch-deck', 'financial-projections', 'market-research', 'business-plan',
    'term-sheet', 'cap-table', 'legal', 'product-roadmap', 'competitive-analysis',
    'customer-data', 'team-info', 'other'
  )),
  ADD COLUMN IF NOT EXISTS confidentiality_level TEXT DEFAULT 'internal' CHECK (
    confidentiality_level IN ('public', 'internal', 'confidential', 'restricted')
  ),
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS extracted_metrics JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS document_date DATE,
  ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS parent_document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create document_chunks table for semantic search
CREATE TABLE IF NOT EXISTS public.document_chunks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  content_embedding vector(1536), -- OpenAI ada-002 embeddings dimension
  chunk_type TEXT CHECK (chunk_type IN ('text', 'table', 'list', 'summary', 'financial')),
  metadata JSONB DEFAULT '{}',
  token_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(document_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS document_chunks_document_id_idx ON public.document_chunks(document_id);
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx ON public.document_chunks
  USING ivfflat (content_embedding vector_cosine_ops) WITH (lists = 100);

ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own document chunks" ON public.document_chunks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.documents
      WHERE documents.id = document_chunks.document_id
      AND documents.user_id = auth.uid()
    )
  );

-- Create document_relationships table for tracking connections between documents
CREATE TABLE IF NOT EXISTS public.document_relationships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  target_document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN (
    'references', 'supplements', 'contradicts', 'updates', 'supports',
    'part-of-series', 'alternative-version', 'related-company', 'related-market'
  )),
  confidence_score NUMERIC(3,2) DEFAULT 0.5,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(source_document_id, target_document_id, relationship_type)
);

CREATE INDEX IF NOT EXISTS document_relationships_source_idx ON public.document_relationships(source_document_id);
CREATE INDEX IF NOT EXISTS document_relationships_target_idx ON public.document_relationships(target_document_id);

ALTER TABLE public.document_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage document relationships" ON public.document_relationships
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.documents
      WHERE documents.id IN (source_document_id, target_document_id)
      AND documents.user_id = auth.uid()
    )
  );

-- Create financial_metrics table for extracted financial data
CREATE TABLE IF NOT EXISTS public.financial_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL CHECK (metric_type IN (
    'revenue', 'expenses', 'gross-margin', 'net-margin', 'burn-rate',
    'runway', 'arr', 'mrr', 'cac', 'ltv', 'ltv-cac-ratio', 'growth-rate',
    'valuation', 'headcount', 'customers', 'conversion-rate', 'churn-rate',
    'market-size', 'market-share', 'other'
  )),
  metric_name TEXT NOT NULL,
  value NUMERIC,
  value_string TEXT,
  unit TEXT,
  time_period TEXT,
  period_start DATE,
  period_end DATE,
  currency TEXT DEFAULT 'USD',
  confidence_score NUMERIC(3,2),
  extraction_method TEXT DEFAULT 'ai',
  context TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS financial_metrics_document_id_idx ON public.financial_metrics(document_id);
CREATE INDEX IF NOT EXISTS financial_metrics_type_idx ON public.financial_metrics(metric_type);
CREATE INDEX IF NOT EXISTS financial_metrics_period_idx ON public.financial_metrics(period_start, period_end);

ALTER TABLE public.financial_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own financial metrics" ON public.financial_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.documents
      WHERE documents.id = financial_metrics.document_id
      AND documents.user_id = auth.uid()
    )
  );

-- Create document_citations table for tracking references within documents
CREATE TABLE IF NOT EXISTS public.document_citations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  cited_document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  citation_text TEXT,
  source_chunk_id UUID REFERENCES public.document_chunks(id) ON DELETE SET NULL,
  cited_chunk_id UUID REFERENCES public.document_chunks(id) ON DELETE SET NULL,
  citation_type TEXT CHECK (citation_type IN ('direct-quote', 'paraphrase', 'data-reference', 'concept')),
  page_number INTEGER,
  relevance_score NUMERIC(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS document_citations_source_idx ON public.document_citations(source_document_id);
CREATE INDEX IF NOT EXISTS document_citations_cited_idx ON public.document_citations(cited_document_id);

ALTER TABLE public.document_citations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage citations" ON public.document_citations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.documents
      WHERE documents.id IN (source_document_id, cited_document_id)
      AND documents.user_id = auth.uid()
    )
  );

-- Create document_collections table for grouping related documents (e.g., all docs for a company)
CREATE TABLE IF NOT EXISTS public.document_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  collection_type TEXT CHECK (collection_type IN (
    'company', 'market-sector', 'investment-round', 'due-diligence', 'portfolio', 'custom'
  )),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS document_collections_user_id_idx ON public.document_collections(user_id);

ALTER TABLE public.document_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own collections" ON public.document_collections
  FOR ALL USING (auth.uid() = user_id);

-- Create junction table for documents in collections
CREATE TABLE IF NOT EXISTS public.collection_documents (
  collection_id UUID NOT NULL REFERENCES public.document_collections(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (collection_id, document_id)
);

CREATE INDEX IF NOT EXISTS collection_documents_collection_idx ON public.collection_documents(collection_id);
CREATE INDEX IF NOT EXISTS collection_documents_document_idx ON public.collection_documents(document_id);

ALTER TABLE public.collection_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage collection documents" ON public.collection_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.document_collections
      WHERE document_collections.id = collection_id
      AND document_collections.user_id = auth.uid()
    )
  );

-- Create analysis_queries table to cache multi-document analysis results
CREATE TABLE IF NOT EXISTS public.analysis_queries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query_text TEXT NOT NULL,
  query_type TEXT CHECK (query_type IN (
    'cross-document-comparison', 'trend-analysis', 'financial-analysis',
    'competitive-analysis', 'market-research', 'due-diligence', 'custom'
  )),
  document_ids UUID[] NOT NULL,
  collection_id UUID REFERENCES public.document_collections(id) ON DELETE SET NULL,
  results JSONB,
  insights JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS analysis_queries_user_id_idx ON public.analysis_queries(user_id);
CREATE INDEX IF NOT EXISTS analysis_queries_type_idx ON public.analysis_queries(query_type);

ALTER TABLE public.analysis_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own queries" ON public.analysis_queries
  FOR ALL USING (auth.uid() = user_id);

-- Add trigger for updated_at on documents
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_collections_updated_at BEFORE UPDATE ON public.document_collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to find similar document chunks using semantic search
CREATE OR REPLACE FUNCTION find_similar_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  filter_document_ids uuid[] DEFAULT NULL
)
RETURNS TABLE (
  chunk_id uuid,
  document_id uuid,
  content text,
  similarity float,
  chunk_type text,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    dc.content,
    1 - (dc.content_embedding <=> query_embedding) as similarity,
    dc.chunk_type,
    dc.metadata
  FROM document_chunks dc
  INNER JOIN documents d ON d.id = dc.document_id
  WHERE
    (filter_document_ids IS NULL OR dc.document_id = ANY(filter_document_ids))
    AND d.user_id = auth.uid()
    AND 1 - (dc.content_embedding <=> query_embedding) > match_threshold
  ORDER BY dc.content_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to get document relationships with metadata
CREATE OR REPLACE FUNCTION get_document_network(
  root_document_id uuid,
  max_depth int DEFAULT 2
)
RETURNS TABLE (
  document_id uuid,
  filename text,
  relationship_path text[],
  depth int
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE doc_tree AS (
    -- Base case: the root document
    SELECT
      d.id,
      d.filename,
      ARRAY[d.filename]::text[] as path,
      0 as depth
    FROM documents d
    WHERE d.id = root_document_id AND d.user_id = auth.uid()

    UNION ALL

    -- Recursive case: related documents
    SELECT
      d.id,
      d.filename,
      dt.path || d.filename,
      dt.depth + 1
    FROM documents d
    INNER JOIN document_relationships dr ON (
      dr.target_document_id = d.id OR dr.source_document_id = d.id
    )
    INNER JOIN doc_tree dt ON (
      (dr.source_document_id = dt.document_id AND dr.target_document_id = d.id)
      OR (dr.target_document_id = dt.document_id AND dr.source_document_id = d.id)
    )
    WHERE dt.depth < max_depth
      AND d.user_id = auth.uid()
      AND d.id != dt.document_id
  )
  SELECT DISTINCT ON (dt.document_id)
    dt.document_id,
    dt.filename,
    dt.path,
    dt.depth
  FROM doc_tree dt
  ORDER BY dt.document_id, dt.depth;
END;
$$;

-- Function to aggregate financial metrics across documents
CREATE OR REPLACE FUNCTION compare_financial_metrics(
  document_ids_array uuid[],
  metric_types_filter text[] DEFAULT NULL
)
RETURNS TABLE (
  metric_type text,
  metric_name text,
  document_id uuid,
  filename text,
  value numeric,
  unit text,
  time_period text,
  period_start date,
  period_end date
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    fm.metric_type,
    fm.metric_name,
    fm.document_id,
    d.filename,
    fm.value,
    fm.unit,
    fm.time_period,
    fm.period_start,
    fm.period_end
  FROM financial_metrics fm
  INNER JOIN documents d ON d.id = fm.document_id
  WHERE
    fm.document_id = ANY(document_ids_array)
    AND d.user_id = auth.uid()
    AND (metric_types_filter IS NULL OR fm.metric_type = ANY(metric_types_filter))
  ORDER BY fm.metric_type, fm.period_start NULLS LAST, d.filename;
END;
$$;

-- Add comments for documentation
COMMENT ON TABLE document_chunks IS 'Stores document chunks with vector embeddings for semantic search';
COMMENT ON TABLE document_relationships IS 'Tracks relationships and connections between documents';
COMMENT ON TABLE financial_metrics IS 'Extracted financial metrics from documents for analysis';
COMMENT ON TABLE document_citations IS 'Cross-references and citations between documents';
COMMENT ON TABLE document_collections IS 'Groups of related documents (companies, rounds, etc.)';
COMMENT ON TABLE analysis_queries IS 'Cached multi-document analysis results';

COMMENT ON FUNCTION find_similar_chunks IS 'Semantic search across document chunks using vector similarity';
COMMENT ON FUNCTION get_document_network IS 'Retrieves document relationship network with configurable depth';
COMMENT ON FUNCTION compare_financial_metrics IS 'Aggregates and compares financial metrics across multiple documents';


-- ============================================================================
-- Migration: 20241119000000_add_trial_fields.sql
-- ============================================================================

-- Add trial tracking fields to users table
-- This migration adds fields to track 7-day free trial period

-- Add trial_start_date column
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP WITH TIME ZONE;

-- Add trial_end_date column
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP WITH TIME ZONE;

-- Add is_trial_active column (computed based on dates)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_trial_active BOOLEAN DEFAULT true;

-- Add email_verified column for future email verification tracking
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- Update existing users to have trial dates if they don't have them
-- Set trial_start_date to their created_at date
-- Set trial_end_date to 7 days after created_at
UPDATE public.users
SET
  trial_start_date = created_at,
  trial_end_date = created_at + INTERVAL '7 days',
  is_trial_active = (NOW() < created_at + INTERVAL '7 days')
WHERE trial_start_date IS NULL;

-- Create index for faster trial expiration queries
CREATE INDEX IF NOT EXISTS users_trial_end_date_idx ON public.users(trial_end_date);

-- Create function to automatically check if trial is active
CREATE OR REPLACE FUNCTION check_trial_active()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.trial_end_date IS NOT NULL THEN
    NEW.is_trial_active = (NOW() < NEW.trial_end_date);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update is_trial_active before insert/update
DROP TRIGGER IF EXISTS update_trial_active ON public.users;
CREATE TRIGGER update_trial_active
  BEFORE INSERT OR UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION check_trial_active();

-- Add comment explaining the trial system
COMMENT ON COLUMN public.users.trial_start_date IS 'Date when user trial period started (typically signup date)';
COMMENT ON COLUMN public.users.trial_end_date IS 'Date when user trial period ends (7 days after start)';
COMMENT ON COLUMN public.users.is_trial_active IS 'Whether user trial is currently active (automatically computed)';
COMMENT ON COLUMN public.users.email_verified IS 'Whether user has verified their email address';


-- ============================================================================
-- Migration: 20251119000001_auto_create_user_profile.sql
-- ============================================================================

-- Auto-create user profile when a new auth user signs up
-- This ensures that every authenticated user has a corresponding profile in public.users

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  trial_end_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate trial end date (7 days from now)
  trial_end_date := NOW() + INTERVAL '7 days';

  -- Insert new user profile (only insert if doesn't exist)
  -- This prevents duplicate key errors on email if the profile already exists
  INSERT INTO public.users (
    id,
    email,
    full_name,
    subscription_tier,
    trial_start_date,
    trial_end_date,
    is_trial_active,
    email_verified
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'founder', -- Default tier with 7-day free trial
    NOW(),
    trial_end_date,
    true,
    NEW.email_confirmed_at IS NOT NULL
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    email_verified = NEW.email_confirmed_at IS NOT NULL,
    updated_at = NOW();

  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If there's a unique constraint violation (e.g., on email),
    -- just return NEW and let the auth signup succeed
    -- The user will still be created in auth.users
    RAISE NOTICE 'User profile already exists for email: %', NEW.email;
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log other errors but don't prevent auth user creation
    RAISE NOTICE 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill any existing auth users that don't have profiles
INSERT INTO public.users (
  id,
  email,
  full_name,
  subscription_tier,
  trial_start_date,
  trial_end_date,
  is_trial_active,
  email_verified
)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', ''),
  'founder',
  COALESCE(au.created_at, NOW()),
  COALESCE(au.created_at, NOW()) + INTERVAL '7 days',
  true,
  au.email_confirmed_at IS NOT NULL
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;


-- ============================================================================
-- Migration: 20251119000002_remove_email_unique_constraint.sql
-- ============================================================================

-- Remove unique constraint on email field in public.users
-- Email should not be unique in public.users since it matches auth.users.email
-- The primary key (id) is what enforces uniqueness

-- Drop the partial unique constraint on email if it exists
DROP INDEX IF EXISTS public.users_email_partial_key;

-- Also drop any other unique constraints on email
DO $$
BEGIN
    -- Drop constraint if it exists as a table constraint
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'users_email_partial_key'
        AND conrelid = 'public.users'::regclass
    ) THEN
        ALTER TABLE public.users DROP CONSTRAINT users_email_partial_key;
    END IF;

    -- Drop constraint if named differently
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'users_email_key'
        AND conrelid = 'public.users'::regclass
    ) THEN
        ALTER TABLE public.users DROP CONSTRAINT users_email_key;
    END IF;
END $$;

-- Email should only have a non-unique index for faster lookups (already exists)
-- CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);

-- Add comment explaining why email is not unique
COMMENT ON COLUMN public.users.email IS 'User email address (matches auth.users.email). Not unique because multiple auth methods can exist for same email.';


COMMIT;

-- ============================================================================
-- All migrations applied successfully!
-- Next steps:
-- 1. Verify tables exist: SELECT * FROM public.users LIMIT 1;
-- 2. Test signup flow on your application
-- ============================================================================
