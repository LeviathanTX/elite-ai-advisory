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
