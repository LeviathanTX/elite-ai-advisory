# Supabase CLI Setup & Migration Instructions

## ✅ Completed Steps

1. **Supabase CLI Installed**: Version 2.58.5 is installed at `/root/.local/bin/supabase`
2. **Environment Variables Created**: `.env.local` file has been created with Supabase credentials
3. **Migration Files Ready**: Migration file is properly formatted and ready to apply

## 📋 Project Configuration

- **Supabase Project URL**: `https://tgzqffemrymlyioguflb.supabase.co`
- **Project Reference**: `tgzqffemrymlyioguflb`
- **Migration File**: `/home/user/AI-BoD/supabase/migrations/20241115000001_add_user_profile_trigger.sql`

## ⚠️ Manual Steps Required

Due to network restrictions in this environment, the following steps need to be completed manually:

### Option 1: Apply Migration via Supabase Dashboard (RECOMMENDED)

1. **Open Supabase SQL Editor**:
   ```
   https://app.supabase.com/project/tgzqffemrymlyioguflb/sql/new
   ```

2. **Copy the Migration SQL**:
   - Open the migration file: `supabase/migrations/20241115000001_add_user_profile_trigger.sql`
   - Copy the entire contents (43 lines)

3. **Paste and Execute**:
   - Paste the SQL into the Supabase SQL Editor
   - Click "Run" or press Cmd/Ctrl + Enter
   - Verify you see "Success. No rows returned" or similar

4. **Verify Trigger Creation**:
   - Go to Database > Functions
   - Look for `handle_new_user` function
   - Go to Database > Triggers
   - Look for `on_auth_user_created` trigger

### Option 2: Apply Migration via Supabase CLI (if you have local access)

1. **Login to Supabase CLI**:
   ```bash
   supabase login
   ```
   This will open a browser for authentication.

2. **Link the Project**:
   ```bash
   cd /home/user/AI-BoD
   supabase link --project-ref tgzqffemrymlyioguflb
   ```

3. **Push the Migration**:
   ```bash
   supabase db push
   ```

4. **Verify**:
   ```bash
   supabase db remote commit
   ```

### Option 3: Use Database Connection String

If you have the database password:

```bash
supabase db push --db-url "postgresql://postgres:[YOUR_PASSWORD]@db.tgzqffemrymlyioguflb.supabase.co:5432/postgres"
```

You can find your database password in:
- Supabase Dashboard > Project Settings > Database > Connection String

## 🧪 Testing After Migration

Once the migration is applied, run the test script to verify everything works:

```bash
cd /home/user/AI-BoD
npx tsx scripts/test-database-connection.ts
```

### Expected Test Results

The test script will verify:
1. ✅ Supabase connectivity (network check)
2. ✅ RLS policies are active (blocks unauthenticated queries)
3. ✅ Service role key works (if SUPABASE_SERVICE_ROLE_KEY is set)
4. ✅ All tables have proper RLS policies

### Successful Output Should Show

```
✅ Environment Variables: Supabase credentials found
✅ Network Connection: Connected successfully
✅ Unauthenticated Query: Blocked by RLS (expected behavior)
✅ RLS on users: Protected by RLS
✅ RLS on custom_advisors: Protected by RLS
✅ RLS on conversations: Protected by RLS
✅ RLS on documents: Protected by RLS
✅ RLS on usage_stats: Protected by RLS
```

## 🔍 What the Migration Does

The migration creates an automatic trigger system:

1. **Function: `handle_new_user()`**
   - Automatically creates a user profile when someone signs up
   - Populates the `users` table with auth user data
   - Creates initial `usage_stats` entry
   - Sets default subscription tier to 'founder'

2. **Trigger: `on_auth_user_created`**
   - Fires when a new user is inserted into `auth.users`
   - Calls `handle_new_user()` function
   - Ensures seamless user onboarding

3. **Permissions**
   - Grants necessary schema access
   - Allows anon, authenticated, and service_role access
   - Maintains security through RLS policies

## 📝 Migration SQL Preview

```sql
-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, subscription_tier)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'founder'
  );

  INSERT INTO public.usage_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger to run the function when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## 🚀 Next Steps After Migration

1. **Apply the migration** using one of the methods above
2. **Run the test script**: `npx tsx scripts/test-database-connection.ts`
3. **Test user signup** in your application
4. **Verify** that new users automatically get profile entries
5. **Check** that usage_stats are created for new users

## 🆘 Troubleshooting

### Issue: "Function already exists"
- **Solution**: This is fine! It means the migration was already applied.

### Issue: "Permission denied"
- **Solution**: Make sure you're logged in to Supabase Dashboard and have owner/admin access to the project.

### Issue: "Trigger not firing"
- **Check**: Verify trigger exists in Database > Triggers
- **Check**: Test by creating a new user and checking `users` table

### Issue: Test script shows "Missing Supabase URL or Anon Key"
- **Solution**: Make sure `.env.local` exists and contains the correct values
- **Run**: `cat .env.local` to verify

## 📞 Support

If you encounter issues:
1. Check the Supabase Dashboard logs: https://app.supabase.com/project/tgzqffemrymlyioguflb/logs/explorer
2. Review the database schema: https://app.supabase.com/project/tgzqffemrymlyioguflb/database/tables
3. Test with SQL Editor: https://app.supabase.com/project/tgzqffemrymlyioguflb/sql/new

---

**Created**: 2025-11-15
**Supabase CLI Version**: 2.58.5
**Project**: AI-BoD (Elite AI Advisory)
