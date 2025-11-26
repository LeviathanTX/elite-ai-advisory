-- Fix advisor_id column type to allow string IDs for celebrity advisors
-- Change from UUID to TEXT to support both UUID (custom advisors) and string IDs (celebrity advisors)

ALTER TABLE public.conversations
ALTER COLUMN advisor_id TYPE TEXT;
