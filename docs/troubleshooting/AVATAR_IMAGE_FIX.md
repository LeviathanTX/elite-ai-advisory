# Avatar Image Save Fix

## Problem
Custom advisor avatar images were not being saved when editing/creating advisors in the modal.

## Root Cause
1. **Context Issue**: The `updateAdvisor` function in `AdvisorContext.tsx` was destructuring the advisor object and removing the `type` field, but wasn't explicitly preserving `avatar_image` and `avatar_emoji` fields.

2. **Database Schema**: The `custom_advisors` table was missing `avatar_emoji`, `avatar_image`, and `updated_at` columns.

## Changes Made

### 1. Fixed AdvisorContext.tsx
- **`updateAdvisor` function** (line 791): Now explicitly includes `avatar_image` and `avatar_emoji` in the update data
- **`updateCustomAdvisor` function** (line 581):
  - Added `updated_at` timestamp to all updates
  - Added error handling for missing tables (bypass/demo mode)
  - Updates local state even if Supabase isn't available
- **`addAdvisor` function** (line 774): Ensures avatar fields are included when creating new advisors

### 2. Updated Database Schema
- Updated TypeScript types in `supabase.ts` to include `avatar_emoji`, `avatar_image`, and `updated_at` fields
- Updated `supabase-setup.sql` with the new columns
- Created `supabase-migration-avatar-fields.sql` for existing databases

## Database Migration Required

If you have an existing Supabase database, run this migration:

```sql
-- Run in Supabase SQL Editor
ALTER TABLE public.custom_advisors
ADD COLUMN IF NOT EXISTS avatar_emoji TEXT DEFAULT '👨‍💼';

ALTER TABLE public.custom_advisors
ADD COLUMN IF NOT EXISTS avatar_image TEXT;

ALTER TABLE public.custom_advisors
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE TRIGGER update_custom_advisors_updated_at BEFORE UPDATE ON public.custom_advisors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

Or simply run the file: `supabase-migration-avatar-fields.sql`

## Testing
1. Open the app and navigate to Advisor Management
2. Click "Create New Advisor" or edit an existing advisor
3. Upload a custom image in the avatar section
4. Save the advisor
5. Verify the custom image persists after refresh

## Notes
- The fix works in both Supabase-connected and bypass/demo modes
- Avatar images are stored as base64 data URLs (max 5MB)
- If Supabase tables don't exist, the app falls back to local state management
