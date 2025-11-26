-- Fix RLS policies on conversations table
-- Add missing DELETE policy and fix UPDATE policy to include WITH CHECK

-- Drop existing UPDATE policy to recreate with WITH CHECK clause
DROP POLICY IF EXISTS "Users can update own conversations" ON public.conversations;

-- Recreate UPDATE policy with WITH CHECK
CREATE POLICY "Users can update own conversations" ON public.conversations
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add missing DELETE policy
DROP POLICY IF EXISTS "Users can delete own conversations" ON public.conversations;

CREATE POLICY "Users can delete own conversations" ON public.conversations
  FOR DELETE
  USING (auth.uid() = user_id);
