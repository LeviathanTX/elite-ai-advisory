# 🚀 Production Setup - Complete Guide

## Your Supabase Project

**Project ID:** tgzqffemrymlyioguflb
**URL:** `https://tgzqffemrymlyioguflb.supabase.co`
**Dashboard:** https://app.supabase.com/project/tgzqffemrymlyioguflb

---

## Step 1: Get Your Supabase Anon Key

1. Go to your Supabase project settings:
   ```
   https://app.supabase.com/project/tgzqffemrymlyioguflb/settings/api
   ```

2. Copy the **anon/public** key (starts with `eyJ...`)

3. Keep this handy - you'll need it in Step 2

---

## Step 2: Configure Vercel Environment Variables

### Option A: Using Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard:**
   ```
   https://vercel.com/dashboard
   ```

2. **Select your project** (elite-ai-advisory or ai-bod)

3. **Go to Settings → Environment Variables**

4. **Add these variables** (click "Add New" for each):

   **CRITICAL - Authentication:**
   ```
   Name: REACT_APP_SUPABASE_URL
   Value: https://tgzqffemrymlyioguflb.supabase.co
   Environment: Production, Preview, Development
   ```

   ```
   Name: REACT_APP_SUPABASE_ANON_KEY
   Value: [paste your anon key from Step 1]
   Environment: Production, Preview, Development
   ```

   ```
   Name: REACT_APP_BYPASS_AUTH
   Value: false
   Environment: Production, Preview, Development
   ```

   **REQUIRED - AI Services:**
   ```
   Name: REACT_APP_OPENAI_API_KEY
   Value: [your OpenAI API key]
   Environment: Production, Preview, Development
   ```

   **Optional but Recommended:**
   ```
   Name: REACT_APP_ANTHROPIC_API_KEY
   Value: [your Anthropic key - optional]
   Environment: Production, Preview, Development
   ```

   ```
   Name: REACT_APP_DEEPGRAM_API_KEY
   Value: [your Deepgram key - optional]
   Environment: Production, Preview, Development
   ```

   **Environment Settings:**
   ```
   Name: REACT_APP_ENV
   Value: production
   Environment: Production
   ```

   ```
   Name: REACT_APP_DEBUG_MODE
   Value: false
   Environment: Production
   ```

   ```
   Name: REACT_APP_USE_MOCK_AI
   Value: false
   Environment: Production
   ```

   **Feature Flags:**
   ```
   Name: REACT_APP_ENABLE_DOCUMENT_UPLOAD
   Value: true
   Environment: Production, Preview, Development
   ```

   ```
   Name: REACT_APP_ENABLE_VOICE_INPUT
   Value: true
   Environment: Production, Preview, Development
   ```

5. **Save all variables**

### Option B: Using Vercel CLI

If you have Vercel CLI installed:

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Add environment variables
vercel env add REACT_APP_SUPABASE_URL production
# Enter: https://tgzqffemrymlyioguflb.supabase.co

vercel env add REACT_APP_SUPABASE_ANON_KEY production
# Enter: [your anon key]

vercel env add REACT_APP_BYPASS_AUTH production
# Enter: false

vercel env add REACT_APP_OPENAI_API_KEY production
# Enter: [your OpenAI key]

vercel env add REACT_APP_ENV production
# Enter: production

vercel env add REACT_APP_DEBUG_MODE production
# Enter: false

vercel env add REACT_APP_USE_MOCK_AI production
# Enter: false
```

---

## Step 3: Verify Database Setup

Your Supabase database should have these tables. Check here:
```
https://app.supabase.com/project/tgzqffemrymlyioguflb/editor
```

**Required tables:**
- ✅ users
- ✅ custom_advisors
- ✅ conversations
- ✅ documents
- ✅ voice_sessions
- ✅ usage_stats

**If tables are missing:**
1. Go to SQL Editor: https://app.supabase.com/project/tgzqffemrymlyioguflb/sql/new
2. Copy contents of `supabase/migrations/20241115000000_initial_schema.sql`
3. Paste and run

---

## Step 4: Configure Supabase Authentication

1. **Go to Auth Configuration:**
   ```
   https://app.supabase.com/project/tgzqffemrymlyioguflb/auth/url-configuration
   ```

2. **Set Site URL:**
   ```
   https://your-production-domain.vercel.app
   ```

3. **Add Redirect URLs:**
   ```
   https://your-production-domain.vercel.app/**
   http://localhost:3000/**
   ```

4. **Email Auth Settings:**
   - Go to: https://app.supabase.com/project/tgzqffemrymlyioguflb/auth/providers
   - Enable "Email" provider
   - For testing: Disable "Confirm email"
   - For production: Enable "Confirm email"

---

## Step 5: Deploy to Production

### Option A: Push to Main Branch (Auto-deploy)

```bash
# Commit your changes
git add -A
git commit -m "Configure production environment"

# Push to main branch (triggers Vercel deployment)
git push origin main
```

### Option B: Manual Deploy via Vercel

```bash
# Using Vercel CLI
vercel --prod
```

### Option C: Via Vercel Dashboard

1. Go to your Vercel project
2. Click "Deployments"
3. Click "Redeploy" on latest deployment
4. Check "Use existing build cache"
5. Click "Redeploy"

---

## Step 6: Verify Production Deployment

1. **Wait for deployment to complete** (2-3 minutes)

2. **Visit your production URL**
   ```
   https://your-project.vercel.app
   ```

3. **Check browser console** (F12 → Console)
   - Should see: "✅ Production mode - Using real Supabase"
   - Should NOT see: "⚠️ RUNNING IN DEMO MODE"
   - Should NOT see timeout errors

4. **Test authentication:**
   - Click "Sign Up"
   - Create an account
   - Should redirect to dashboard after signup

5. **Verify user in Supabase:**
   ```
   https://app.supabase.com/project/tgzqffemrymlyioguflb/auth/users
   ```
   - Should see your new user

---

## Troubleshooting

### Issue: Still seeing "Demo Mode" or timeout

**Check:**
1. Environment variables are set in Vercel (all of them)
2. Variables are set for "Production" environment
3. Deployment completed AFTER adding variables
4. Browser cache cleared (Ctrl+Shift+R)

**Fix:**
- Redeploy in Vercel dashboard
- Clear browser cache
- Check browser console for errors

### Issue: "Invalid login credentials"

**Check:**
1. Email auth is enabled in Supabase
2. User exists in Supabase auth panel
3. Password meets requirements (6+ chars)

**Fix:**
- Try password reset
- Create new account
- Check Supabase logs

### Issue: "Network error" or timeouts

**Check:**
1. Supabase project is active (not paused)
2. Supabase URL is correct in Vercel
3. Anon key is correct in Vercel

**Fix:**
- Test Supabase directly: https://tgzqffemrymlyioguflb.supabase.co/rest/v1/
- Check Supabase project status
- Regenerate and update anon key

---

## Environment Variables Checklist

Use this to verify all variables are set in Vercel:

### Critical (App won't work without these):
- [ ] `REACT_APP_SUPABASE_URL` = https://tgzqffemrymlyioguflb.supabase.co
- [ ] `REACT_APP_SUPABASE_ANON_KEY` = [your key]
- [ ] `REACT_APP_BYPASS_AUTH` = false
- [ ] `REACT_APP_OPENAI_API_KEY` = [your key] OR
- [ ] `REACT_APP_ANTHROPIC_API_KEY` = [your key] (at least one AI key)

### Recommended:
- [ ] `REACT_APP_ENV` = production
- [ ] `REACT_APP_DEBUG_MODE` = false
- [ ] `REACT_APP_USE_MOCK_AI` = false
- [ ] `REACT_APP_ENABLE_DOCUMENT_UPLOAD` = true
- [ ] `REACT_APP_ENABLE_VOICE_INPUT` = true

### Optional:
- [ ] `REACT_APP_DEEPGRAM_API_KEY` = [for voice features]
- [ ] `REACT_APP_SENTRY_DSN` = [for error tracking]
- [ ] `REACT_APP_GOOGLE_API_KEY` = [for Gemini]
- [ ] `REACT_APP_DEEPSEEK_API_KEY` = [for DeepSeek]

---

## Quick Reference

**Supabase Dashboard:**
https://app.supabase.com/project/tgzqffemrymlyioguflb

**Supabase API Settings:**
https://app.supabase.com/project/tgzqffemrymlyioguflb/settings/api

**Supabase Auth Users:**
https://app.supabase.com/project/tgzqffemrymlyioguflb/auth/users

**Supabase Database Tables:**
https://app.supabase.com/project/tgzqffemrymlyioguflb/editor

**Supabase SQL Editor:**
https://app.supabase.com/project/tgzqffemrymlyioguflb/sql/new

---

## Need Help?

1. Check browser console for errors (F12)
2. Check Vercel deployment logs
3. Check Supabase project logs
4. Review `DEPLOYMENT.md` for detailed troubleshooting

---

## Summary

**What you need:**
1. ✅ Supabase anon key (from Step 1)
2. ✅ OpenAI API key (or Anthropic)
3. ✅ Vercel project access

**What to do:**
1. Get Supabase anon key
2. Add all env vars to Vercel (Step 2)
3. Verify database tables exist (Step 3)
4. Configure Supabase auth (Step 4)
5. Deploy to production (Step 5)
6. Test and verify (Step 6)

**Time:** ~15 minutes total

Once complete, your production app will have:
- ✅ Real authentication (no bypass)
- ✅ Real AI responses (no mocks)
- ✅ Persistent user data
- ✅ All features working
- ✅ No timeouts or errors
