-- Fix RLS policies on users table
-- Remove duplicate/conflicting policies and ensure only correct ones exist

-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can read their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- Recreate policies with correct configuration
-- These policies apply to authenticated users only
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
