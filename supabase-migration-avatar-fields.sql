-- Migration: Add avatar fields to custom_advisors table
-- Run this in Supabase SQL Editor to add avatar support

-- Add avatar_emoji column
ALTER TABLE public.custom_advisors
ADD COLUMN IF NOT EXISTS avatar_emoji TEXT DEFAULT '👨‍💼';

-- Add avatar_image column (stores base64 data URL)
ALTER TABLE public.custom_advisors
ADD COLUMN IF NOT EXISTS avatar_image TEXT;

-- Add updated_at column for tracking changes
ALTER TABLE public.custom_advisors
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create trigger to auto-update updated_at for custom_advisors
CREATE TRIGGER update_custom_advisors_updated_at BEFORE UPDATE ON public.custom_advisors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comment for documentation
COMMENT ON COLUMN public.custom_advisors.avatar_emoji IS 'Emoji character used as avatar';
COMMENT ON COLUMN public.custom_advisors.avatar_image IS 'Base64 encoded image data URL for custom avatar';
