-- Fix Analytics RLS to allow anonymous event tracking
-- This allows analytics to work during login/signup flows

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can insert own events" ON public.user_events;
DROP POLICY IF EXISTS "Allow event tracking" ON public.user_events;

-- Create a more permissive policy that allows:
-- 1. Authenticated users to insert events where user_id matches
-- 2. Anonymous users to insert events with null user_id
CREATE POLICY "Allow event tracking" ON public.user_events
  FOR INSERT WITH CHECK (
    user_id IS NULL OR auth.uid() = user_id
  );
