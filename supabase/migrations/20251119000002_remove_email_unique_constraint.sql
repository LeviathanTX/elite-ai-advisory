-- Remove unique constraint on email field in public.users
-- Email should not be unique in public.users since it matches auth.users.email
-- The primary key (id) is what enforces uniqueness

-- Drop the partial unique constraint on email if it exists
DROP INDEX IF EXISTS public.users_email_partial_key;

-- Also drop any other unique constraints on email
DO $$
BEGIN
    -- Drop constraint if it exists as a table constraint
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'users_email_partial_key'
        AND conrelid = 'public.users'::regclass
    ) THEN
        ALTER TABLE public.users DROP CONSTRAINT users_email_partial_key;
    END IF;

    -- Drop constraint if named differently
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'users_email_key'
        AND conrelid = 'public.users'::regclass
    ) THEN
        ALTER TABLE public.users DROP CONSTRAINT users_email_key;
    END IF;
END $$;

-- Email should only have a non-unique index for faster lookups (already exists)
-- CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);

-- Add comment explaining why email is not unique
COMMENT ON COLUMN public.users.email IS 'User email address (matches auth.users.email). Not unique because multiple auth methods can exist for same email.';
