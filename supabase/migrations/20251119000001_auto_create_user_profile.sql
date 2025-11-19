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

  -- Insert new user profile
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
