# 🚀 Production Setup - Quick Start (15 minutes)

**Your code changes are already deployed and working!** The timeout fix is live. You just need to configure environment variables in Vercel.

---

## ✅ Pre-requisites

- [x] Supabase project created: `tgzqffemrymlyioguflb`
- [x] Code deployed to Vercel
- [x] Timeout fix already in production
- [ ] Supabase Anon Key (get in Step 1)
- [ ] OpenAI API Key (or Anthropic)

---

## 🎯 Quick Setup (3 Steps)

### Step 1: Get Supabase Anon Key (2 min)

1. Go to: https://app.supabase.com/project/tgzqffemrymlyioguflb/settings/api
2. Copy the **"anon public"** key (starts with `eyJ...`)
3. Keep this for Step 2

### Step 2: Add Environment Variables in Vercel (10 min)

**Go to Vercel Dashboard:**
1. https://vercel.com/dashboard
2. Select your project: **elite-ai-advisory-clean**
3. Click **Settings** → **Environment Variables**

**Add these 6 critical variables:**

| Name | Value | Environments |
|------|-------|-------------|
| `REACT_APP_SUPABASE_URL` | `https://tgzqffemrymlyioguflb.supabase.co` | Production, Preview, Development |
| `REACT_APP_SUPABASE_ANON_KEY` | *[paste your key from Step 1]* | Production, Preview, Development |
| `REACT_APP_BYPASS_AUTH` | `false` | Production, Preview, Development |
| `REACT_APP_OPENAI_API_KEY` | *[your OpenAI key]* | Production, Preview, Development |
| `REACT_APP_ENV` | `production` | Production |
| `REACT_APP_USE_MOCK_AI` | `false` | Production |

**Click "Save" after each one!**

### Step 3: Redeploy (3 min)

**In Vercel Dashboard:**
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **"Redeploy"** button
4. Click **"Redeploy"** again to confirm

**Wait 2-3 minutes for deployment to complete.**

---

## ✅ Verification

Once deployed, visit your production URL:

**Expected behavior:**
- ✅ Page loads immediately (no timeout)
- ✅ Sign in modal appears (if not logged in)
- ✅ Can create account and log in
- ✅ Browser console shows: "Production mode - Using real Supabase"

**If you see issues:**
- Check browser console (F12)
- Verify all 6 env vars are set in Vercel
- Make sure deployment completed AFTER adding variables
- Clear browser cache (Ctrl+Shift+R)

---

## 🔧 Optional Setup

### Add More AI Providers (optional)
In Vercel Environment Variables, add:
- `REACT_APP_ANTHROPIC_API_KEY` - For Claude AI
- `REACT_APP_DEEPGRAM_API_KEY` - For voice features

### Configure Supabase Auth URLs (recommended)
1. Go to: https://app.supabase.com/project/tgzqffemrymlyioguflb/auth/url-configuration
2. Set **Site URL**: `https://your-production-domain.vercel.app`
3. Add **Redirect URLs**:
   - `https://your-production-domain.vercel.app/**`
   - `http://localhost:3000/**` (for local dev)

---

## 🆘 Troubleshooting

### Still seeing timeout?
- Variables not set correctly in Vercel
- Need to redeploy after adding variables
- Clear browser cache

### "Demo mode" in production?
- `REACT_APP_BYPASS_AUTH` should be `false`
- `REACT_APP_SUPABASE_URL` is set correctly
- Redeploy after changing variables

### Can't log in?
- Check Supabase dashboard: users appear after signup?
- Email auth enabled in Supabase?
- Correct anon key in Vercel?

---

## 📚 Full Documentation

- **PRODUCTION_SETUP.md** - Detailed step-by-step guide
- **DEPLOYMENT.md** - Complete deployment checklist
- **FIX_LOGIN_ISSUE.md** - Login timeout fix details

---

## 🎯 Summary

**What you need:**
1. Supabase anon key (2 min to get)
2. OpenAI API key (you should already have)
3. Access to Vercel dashboard

**What to do:**
1. Get anon key from Supabase
2. Add 6 environment variables in Vercel
3. Redeploy

**Time:** ~15 minutes

**Result:** Fully working production app with real auth! 🎉
