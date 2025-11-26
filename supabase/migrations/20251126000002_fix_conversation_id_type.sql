-- Fix conversations.id column type to allow string IDs
-- Change from UUID to TEXT to support app-generated IDs like "conv-1764123783570"

ALTER TABLE public.conversations
ALTER COLUMN id TYPE TEXT;

-- Update the default to generate text-based IDs instead of UUIDs
-- Note: We'll let the application generate IDs, so we remove the default
ALTER TABLE public.conversations
ALTER COLUMN id DROP DEFAULT;
