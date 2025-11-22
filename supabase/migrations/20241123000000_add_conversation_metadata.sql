-- Add metadata column to conversations table for storing additional conversation data
-- This includes advisors array, files, documents, and other metadata

ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add index for better query performance on updated_at
CREATE INDEX IF NOT EXISTS conversations_updated_at_idx ON public.conversations(updated_at DESC);

-- Add comment for documentation
COMMENT ON COLUMN public.conversations.metadata IS 'Stores conversation metadata including advisors array, files, documents, and title';
