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
