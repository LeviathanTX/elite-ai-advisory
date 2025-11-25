# 🚀 Complete Setup Guide - Run on Your Mac

Since I can't connect to external services from the Claude environment, **you need to run these scripts on your Mac**. It's quick and easy!

## ✅ What I Already Did

- ✅ Updated `.env.local` with your Supabase credentials
- ✅ Created automated setup scripts
- ✅ Configured everything for local development
- ✅ All scripts are ready to run

## 👉 What You Need to Do (20 minutes total)

### Prerequisites

Make sure you're in the project directory:
```bash
cd ~/ai-bod
git pull  # Get latest changes with all the scripts I created
```

---

## Step 1: Set Up Supabase Database (5 min)

Run this script on your Mac:

```bash
node scripts/run-on-mac-setup.js
```

**What it does:**
- ✅ Checks if database tables exist
- ✅ Tests authentication configuration
- ✅ Tells you exactly what to fix if something is missing

**If tables are missing**, the script will tell you to:
1. Go to: https://app.supabase.com/project/tgzqffemrymlyioguflb/sql/new
2. Copy contents of `supabase-setup.sql`
3. Paste and click "Run"
4. Run the script again

---

## Step 2: Configure Vercel (5 min)

Run this script on your Mac:

```bash
node scripts/configure-vercel.js
```

**What it does:**
- ✅ Finds your Vercel project automatically
- ✅ Sets all required environment variables
- ✅ Configures Supabase credentials
- ✅ Sets security settings (bypass_auth = false)
- ✅ Enables all features

**Output should show:**
```
✅ Successfully set: 9 variables
✅ Vercel configuration complete!
```

---

## Step 3: Add API Keys Manually (5 min)

The script can't set API keys (you need to add them yourself):

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your project: `ai-bod-clean`
   - Go to Settings → Environment Variables

2. **Add these API keys:**

   **Required (Minimum):**
   ```
   REACT_APP_OPENAI_API_KEY = [Get from https://platform.openai.com/api-keys]
   ```

   **Optional (Recommended):**
   ```
   REACT_APP_DEEPGRAM_API_KEY = [Get from https://console.deepgram.com]
   REACT_APP_ANTHROPIC_API_KEY = [Get from https://console.anthropic.com]
   REACT_APP_SENTRY_DSN = [Get from https://sentry.io]
   ```

3. **For each key:**
   - Click "Add New"
   - Enter key name
   - Paste value
   - Select Environment: **Production** (and Preview if you want)
   - Click "Save"

---

## Step 4: Test Locally (5 min)

Before deploying, test everything works:

```bash
# Start development server
npm start
```

**Test these:**
1. ✅ App loads (http://localhost:3000)
2. ✅ You see login/signup modal (auth bypass is disabled)
3. ✅ You can sign up with a test email
4. ✅ You can log in
5. ✅ Dashboard loads after login
6. ✅ No console errors (check browser DevTools - F12)

**If you want to test in bypass mode first:**
- Edit `.env.local` → Change `REACT_APP_BYPASS_AUTH=false` to `true`
- Restart server
- Change back to `false` before deploying

---

## Step 5: Deploy to Production (2 min)

```bash
# Commit and push (if needed)
git add .
git commit -m "chore: Configure Supabase and Vercel for production"
git push origin main
```

Vercel will automatically deploy!

**Or deploy manually:**
```bash
npx vercel --prod
```

---

## Step 6: Verify Production (3 min)

1. **Visit your production site:**
   - https://ai-bod-clean.vercel.app

2. **Test critical paths:**
   - [ ] Site loads (no errors in console)
   - [ ] Sign up with new test account works
   - [ ] Login works
   - [ ] Dashboard loads
   - [ ] Can start advisory conversation
   - [ ] Can upload document (if you have OpenAI key)
   - [ ] Pitch practice loads (if you have Deepgram key)

3. **Check Supabase:**
   - Go to: https://app.supabase.com/project/tgzqffemrymlyioguflb/auth/users
   - Verify your test user appears

---

## 🐛 Troubleshooting

### Script Errors

**"Cannot find module '@supabase/supabase-js'"**
```bash
npm install
```

**"Permission denied"**
```bash
chmod +x scripts/*.js
```

**"fetch failed" or "ENOTFOUND"**
- Check your internet connection
- Make sure Supabase project is active
- Verify tokens are correct

### Database Issues

**Tables don't exist**
- Run the SQL script in Supabase dashboard manually
- Script location: `supabase-setup.sql`
- URL: https://app.supabase.com/project/tgzqffemrymlyioguflb/sql/new

**Auth not working**
- Enable email signup in Supabase
- Set Site URL correctly
- Add redirect URLs

### Vercel Issues

**Can't find project**
- Make sure you're logged into Vercel CLI: `npx vercel whoami`
- Check project name matches
- Verify token has project access

**Environment variables not showing**
- Check Vercel dashboard directly
- Refresh the page
- Variables may take a moment to appear

---

## 📊 Verification Checklist

After completing all steps:

- [ ] **Supabase**
  - [ ] All 6 tables exist
  - [ ] RLS policies enabled
  - [ ] Email auth enabled
  - [ ] Site URL configured
  - [ ] Test user created successfully

- [ ] **Vercel**
  - [ ] All environment variables set
  - [ ] API keys added
  - [ ] Project deployed
  - [ ] No build errors

- [ ] **Local Testing**
  - [ ] App runs locally
  - [ ] Can sign up
  - [ ] Can log in
  - [ ] Dashboard works

- [ ] **Production Testing**
  - [ ] Production site loads
  - [ ] Sign up works
  - [ ] Login works
  - [ ] No console errors
  - [ ] Core features work

---

## 🎯 Quick Reference

**Scripts to Run:**
```bash
# 1. Supabase setup
node scripts/run-on-mac-setup.js

# 2. Vercel configuration
node scripts/configure-vercel.js

# 3. Test locally
npm start

# 4. Deploy
git push origin main
```

**Important URLs:**
- Supabase Dashboard: https://app.supabase.com/project/tgzqffemrymlyioguflb
- Supabase SQL Editor: https://app.supabase.com/project/tgzqffemrymlyioguflb/sql/new
- Vercel Dashboard: https://vercel.com/dashboard
- Production Site: https://ai-bod-clean.vercel.app

**Your Credentials:**
- Supabase URL: https://tgzqffemrymlyioguflb.supabase.co
- Supabase Anon Key: [in .env.local]
- Supabase Service Key: sbp_1b9cfeffd10b24db2b398c488eb4f45dda772dbd
- Vercel Token: zCDcltN3MzcASjw4Frh01pHs

---

## 💡 Pro Tips

1. **Run Supabase script first** - Everything else depends on database being set up
2. **Test locally before deploying** - Catch issues early
3. **Start with just OpenAI key** - Add other APIs later
4. **Keep auth bypass disabled in production** - Security is important
5. **Check console for errors** - Browser DevTools (F12) is your friend

---

## ❓ Need Help?

If you get stuck:

1. **Read the error message carefully**
2. **Check the troubleshooting section above**
3. **Review NEXT_STEPS.md** for detailed guides
4. **Check Supabase/Vercel dashboards** for configuration issues
5. **Ask me!** Share the error and I'll help debug

---

## 🎉 When You're Done

You'll have:
- ✅ Supabase database fully configured
- ✅ Authentication working
- ✅ Vercel environment configured
- ✅ Production site deployed
- ✅ Ready for Capital Factory demo!

**Time estimate: 20-30 minutes total**

---

**Ready? Start with Step 1 and run through them in order!** 🚀

Let me know how it goes!
