# Production Setup Guide - Fixing Signup Error

## Problem
Users see "Database error saving new user" when trying to sign up on https://ai-bod-ochre.vercel.app

## Root Cause
1. **Missing Vercel environment variables** - Supabase credentials not configured in production
2. **Database migrations not applied** - The `public.users` table and triggers don't exist in production Supabase

## Solution (Step-by-Step)

### Step 1: Set Up Supabase Project
If you don't have a Supabase project yet:

1. Go to https://supabase.com
2. Click "New Project"
3. Choose organization (or create one)
4. Configure project:
   - **Name**: ai-bod (or your choice)
   - **Database Password**: (generate a strong password - SAVE THIS!)
   - **Region**: Choose closest to your users (e.g., US East)
5. Wait for project to provision (~2 minutes)

### Step 2: Get Supabase Credentials

Once your project is created:

1. Go to Project Settings (gear icon in left sidebar)
2. Click "API" in the left menu
3. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long JWT token)

### Step 3: Apply Database Migrations

You have two options:

#### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Apply all migrations
supabase db push

# Verify migrations applied
supabase migration list
```

#### Option B: Manual SQL Execution

If you don't want to use the CLI:

1. Go to your Supabase Dashboard → SQL Editor
2. Run each migration file in order:
   - `supabase/migrations/20241115000000_initial_schema.sql`
   - `supabase/migrations/20241116000000_enhanced_document_system.sql`
   - `supabase/migrations/20241119000000_add_trial_fields.sql`
   - `supabase/migrations/20251119000001_auto_create_user_profile.sql`
   - `supabase/migrations/20251119000002_remove_email_unique_constraint.sql`

**Copy the entire contents of each file and run them in the SQL Editor.**

### Step 4: Verify Database Setup

In Supabase Dashboard → SQL Editor, run this verification query:

```sql
-- Check if users table exists with correct schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'users'
ORDER BY ordinal_position;

-- Check if trigger exists
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'users';
```

You should see:
- ✅ users table with columns: id, email, full_name, avatar_url, subscription_tier, trial_start_date, trial_end_date, is_trial_active, email_verified, created_at, updated_at
- ✅ Trigger: on_auth_user_created
- ✅ RLS policies for SELECT, UPDATE, INSERT

### Step 5: Configure Vercel Environment Variables

1. Go to https://vercel.com/dashboard
2. Select your project (elite-ai-advisory)
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

| Name | Value | Environment |
|------|-------|-------------|
| `REACT_APP_SUPABASE_URL` | Your Project URL from Step 2 | Production |
| `REACT_APP_SUPABASE_ANON_KEY` | Your anon public key from Step 2 | Production |

**Important**: Select "Production" environment for both variables!

### Step 6: Redeploy Application

After setting environment variables:

```bash
# Trigger a redeploy to pick up new environment variables
git commit --allow-empty -m "Trigger redeploy with Supabase credentials"
git push origin claude/review-ai-bod-app-01QXytkZPfh5k7S9J4j8jnEd
```

Or manually redeploy from Vercel Dashboard:
- Go to Deployments tab
- Click "..." on latest deployment
- Click "Redeploy"
- Check "Use existing Build Cache" → **UNCHECK** (to ensure env vars refresh)
- Click "Redeploy"

### Step 7: Test Signup Flow

Once redeployed (~2 minutes):

1. Go to https://ai-bod-ochre.vercel.app
2. Click "Start Free Trial"
3. Fill in signup form:
   - Name: Test User
   - Email: test@example.com
   - Password: test123456
4. Submit

**Expected behavior:**
- ✅ "Check Your Email!" success screen appears
- ✅ No error messages
- ✅ Check Supabase Dashboard → Authentication → Users (should see new user)
- ✅ Check Supabase Dashboard → Table Editor → users (should see new profile row)

### Step 8: Configure Email (Optional but Recommended)

By default, Supabase uses their email service (limited to 3 emails/hour in free tier).

For production, configure custom SMTP:

1. Supabase Dashboard → Authentication → Email Templates
2. Settings → SMTP Settings
3. Use SendGrid, Postmark, or AWS SES
4. Update email templates with your branding

## Verification Checklist

- [ ] Supabase project created
- [ ] Database migrations applied (all 5 files)
- [ ] Database verification query returns correct schema
- [ ] Trigger `on_auth_user_created` exists
- [ ] Environment variables added to Vercel (Production)
- [ ] Application redeployed
- [ ] Test signup succeeds (no "Database error")
- [ ] New user appears in Supabase auth.users
- [ ] New profile appears in Supabase public.users
- [ ] Email verification sent (check inbox/spam)

## Common Issues

### Issue: "User already exists" error
**Fix**: The auth.users entry was created but public.users profile failed. Delete the user from Supabase Dashboard → Authentication → Users, then try again.

### Issue: Environment variables not taking effect
**Fix**: Make sure you selected "Production" environment when adding vars. Then do a fresh redeploy (uncheck "Use existing build cache").

### Issue: Migrations fail with "table already exists"
**Fix**: Some tables may have been created manually. Either:
- Drop all tables and re-run migrations fresh
- Or modify migration files to use `CREATE TABLE IF NOT EXISTS`

### Issue: "Row Level Security" blocking trigger
**Fix**: The trigger runs with `SECURITY DEFINER` which bypasses RLS. If still blocked, check that service role has correct permissions:

```sql
-- Grant necessary permissions to trigger function
GRANT USAGE ON SCHEMA public TO postgres;
GRANT ALL ON public.users TO postgres;
```

## Quick Diagnostic Commands

If signup still fails, check these in Supabase SQL Editor:

```sql
-- 1. Check if auth user was created
SELECT id, email, created_at, email_confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 2. Check if profile was created
SELECT id, email, full_name, subscription_tier, trial_start_date, trial_end_date
FROM public.users
ORDER BY created_at DESC
LIMIT 5;

-- 3. Check trigger is enabled
SELECT tgname, tgenabled, tgtype
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- 4. Test trigger manually (replace with test UUID)
SELECT public.handle_new_user();
```

## Next Steps After Fix

Once signup is working:

1. ✅ **Test end-to-end flow**: Sign up → Verify email → Sign in → Access app
2. ✅ **Launch marketing campaign**: Capital Factory Slack + LinkedIn posts
3. ✅ **Set up monitoring**: Configure Sentry alerts for auth errors
4. ✅ **Add analytics**: Track signup conversion rates
5. ✅ **Gather testimonials**: Replace mock testimonials with real founder stories

## Support

If you still have issues after following this guide:

1. Check Supabase Logs: Dashboard → Logs → Filter by "error"
2. Check browser console for specific error messages
3. Verify Vercel deployment logs show correct env vars
4. Share specific error messages for debugging

---

**Pro Tip**: Before launching marketing, create a test account yourself and go through the entire flow from signup → email verification → first advisor conversation. This ensures everything works end-to-end.
