# 🗄️ Supabase Database Setup Guide

## Step-by-Step Instructions

### Step 1: Check What Tables Already Exist

1. **Go to:** https://app.supabase.com/project/tgzqffemrymlyioguflb/editor
2. **Look at the left sidebar** under "Tables"
3. **Write down** what tables you see (if any)

**Do you see any of these tables?**
- [ ] users
- [ ] custom_advisors
- [ ] conversations
- [ ] documents
- [ ] voice_sessions
- [ ] usage_stats

---

### Step 2: Run the Database Setup Script

1. **Go to SQL Editor:**
   - https://app.supabase.com/project/tgzqffemrymlyioguflb/sql/new

2. **Copy the entire contents** of `supabase-setup.sql` file

3. **Paste into the SQL Editor**

4. **Click "Run"** (bottom right)

5. **Wait for success message** (should take 5-10 seconds)

---

### Step 3: Verify Tables Were Created

1. **Go back to:** https://app.supabase.com/project/tgzqffemrymlyioguflb/editor

2. **Check the left sidebar** - You should now see 6 tables:
   - ✅ users
   - ✅ custom_advisors
   - ✅ conversations
   - ✅ documents
   - ✅ voice_sessions
   - ✅ usage_stats

3. **Click on "users" table** - You should see these columns:
   - id (uuid)
   - email (text)
   - full_name (text)
   - avatar_url (text)
   - subscription_tier (text)
   - created_at (timestamp)
   - updated_at (timestamp)

---

### Step 4: Enable Email Authentication

1. **Go to Authentication:**
   - https://app.supabase.com/project/tgzqffemrymlyioguflb/auth/users

2. **Click "Configuration" tab** (top navigation)

3. **Scroll to "Email Auth"**

4. **Verify these settings:**
   - ✅ Enable email signup: **ON**
   - ✅ Enable email confirmations: **OFF** (for beta testing)
   - Site URL: Should be your Vercel URL or `http://localhost:3000` for development

5. **Save any changes**

---

### Step 5: Configure Site URL (Important!)

1. **Still in Authentication → Configuration**

2. **Find "Site URL"** section

3. **Set to your production URL:**
   ```
   https://ai-bod-clean.vercel.app
   ```

4. **Find "Redirect URLs"** section

5. **Add these URLs** (one per line):
   ```
   http://localhost:3000/**
   https://ai-bod-clean.vercel.app/**
   ```

6. **Save changes**

---

## ✅ Verification Checklist

After completing the steps above, verify:

- [ ] All 6 tables visible in Database → Tables
- [ ] Row Level Security (RLS) enabled on all tables
- [ ] Email authentication enabled
- [ ] Site URL configured
- [ ] Redirect URLs added

---

## 🐛 Troubleshooting

### "Relation already exists" error
- **This is fine!** It means some tables already existed
- The script uses `CREATE TABLE IF NOT EXISTS` so it won't duplicate
- Continue to next step

### "Permission denied" error
- Make sure you're logged in to Supabase
- Make sure you're in the correct project (v24)
- Try refreshing the page

### Can't find SQL Editor
- Direct link: https://app.supabase.com/project/tgzqffemrymlyioguflb/sql/new
- Or: Left sidebar → SQL Editor → New query

### Tables not appearing
- Refresh the page
- Check you're looking at "public" schema (not "auth" or other schemas)
- Click the refresh icon next to "Tables" in sidebar

---

## 📞 What to Report Back

After you run the script, let me know:

1. ✅ Did it run successfully? (or what errors?)
2. ✅ How many tables do you see now?
3. ✅ Did you enable email authentication?
4. ✅ Did you set the Site URL?

Then I'll help you test the connection!

---

## 🎯 Next Steps After Setup

Once database is set up:
1. Test local connection (I'll help with this)
2. Add credentials to Vercel
3. Test authentication flow
4. Create your first test user
5. Deploy to production

**You're doing great! Let me know when you've completed these steps.** 🚀
