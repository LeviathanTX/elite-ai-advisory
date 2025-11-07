# 🚀 Deployment Checklist for Elite AI Advisory

## Pre-Deployment Requirements

### 1. Environment Setup

- [ ] **Supabase Project Created**
  - Go to [supabase.com](https://supabase.com)
  - Create new project
  - Copy project URL and anon key
  - Run `supabase-setup.sql` in SQL Editor

- [ ] **API Keys Obtained**
  - [ ] OpenAI API key ([platform.openai.com](https://platform.openai.com/api-keys))
  - [ ] Anthropic Claude API key (optional, [console.anthropic.com](https://console.anthropic.com/))
  - [ ] Deepgram API key (for voice, [console.deepgram.com](https://console.deepgram.com/))
  - [ ] Sentry DSN (optional, [sentry.io](https://sentry.io))

- [ ] **Vercel Account Setup**
  - Connect GitHub repository
  - Set production branch to `main`
  - Configure environment variables (see below)

### 2. Environment Variables Configuration

In Vercel Dashboard → Project Settings → Environment Variables, add:

```bash
# REQUIRED
REACT_APP_SUPABASE_URL=<your_supabase_url>
REACT_APP_SUPABASE_ANON_KEY=<your_supabase_anon_key>
REACT_APP_OPENAI_API_KEY=<your_openai_key>

# Auth Configuration (CRITICAL)
REACT_APP_BYPASS_AUTH=false  # MUST be false in production

# Optional but Recommended
REACT_APP_ANTHROPIC_API_KEY=<your_anthropic_key>
REACT_APP_DEEPGRAM_API_KEY=<your_deepgram_key>
REACT_APP_SENTRY_DSN=<your_sentry_dsn>

# Feature Flags
REACT_APP_ENABLE_DOCUMENT_UPLOAD=true
REACT_APP_ENABLE_VOICE_INPUT=true
REACT_APP_MAX_DOCUMENT_SIZE=10485760

# Environment
REACT_APP_ENV=production
REACT_APP_DEBUG_MODE=false
REACT_APP_USE_MOCK_AI=false
```

### 3. Code Quality Checks

Run these locally before deploying:

```bash
# Install dependencies
npm install

# Format code
npm run format

# Run linter
npm run lint:fix

# Type check
npm run type-check

# Run unit tests
npm run test:ci

# Build for production
npm run build

# Run E2E tests (optional, requires running server)
npm start  # In one terminal
npm run test:e2e  # In another terminal
```

### 4. Security Checklist

- [ ] **Auth bypass disabled** (`REACT_APP_BYPASS_AUTH=false`)
- [ ] **API keys not committed** (check `.gitignore` includes `.env.local`)
- [ ] **Supabase RLS policies enabled** (Row Level Security)
- [ ] **CORS configured properly** in Vercel and Supabase
- [ ] **Sentry error tracking configured**
- [ ] **Environment variables set in Vercel** (not in code)

### 5. Database Setup

In Supabase SQL Editor, run:

```bash
# 1. Open Supabase Dashboard
# 2. Navigate to SQL Editor
# 3. Copy contents of supabase-setup.sql
# 4. Execute the script
# 5. Verify tables created:
#    - users
#    - custom_advisors
#    - conversations
#    - documents
#    - voice_sessions
#    - usage_stats
```

### 6. OAuth Configuration (Optional)

If using social login:

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `https://<your-project>.supabase.co/auth/v1/callback`
4. Add to Supabase: Dashboard → Authentication → Providers → Google

**Microsoft OAuth:**
1. Go to [Azure Portal](https://portal.azure.com)
2. Register application
3. Configure redirect URI in Supabase
4. Add to Supabase: Dashboard → Authentication → Providers → Microsoft

## Deployment Process

### First-Time Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "chore: Prepare for production deployment"
   git push origin main
   ```

2. **Verify Vercel Auto-Deploy**
   - Check Vercel dashboard for deployment status
   - Wait for build to complete (~2-5 minutes)
   - Check deployment logs for errors

3. **Verify Production Site**
   ```bash
   # Open production URL
   open https://elite-ai-advisory-clean.vercel.app
   ```

4. **Test Critical Paths**
   - [ ] Site loads without errors
   - [ ] User can sign up/login
   - [ ] Advisory conversation works
   - [ ] Document upload works
   - [ ] Pitch practice mode works
   - [ ] No console errors in browser DevTools

### Subsequent Deployments

```bash
# 1. Make changes on feature branch
git checkout -b feature/your-feature

# 2. Test locally
npm run verify

# 3. Commit and push
git add .
git commit -m "feat: Your feature description"
git push -u origin feature/your-feature

# 4. Create PR and get preview deployment

# 5. Test preview deployment

# 6. Merge to main for production deployment
```

## Post-Deployment Verification

### Automated Checks

Run this script after deployment:

```bash
# Check production health
curl https://elite-ai-advisory-clean.vercel.app

# Verify API proxy
curl https://elite-ai-advisory-clean.vercel.app/api/generate

# Check Sentry for errors
# Visit: https://sentry.io/organizations/your-org/issues/
```

### Manual Verification

- [ ] **Authentication Flow**
  - Sign up new user
  - Sign in existing user
  - Sign out works
  - Profile updates persist

- [ ] **Core Features**
  - Advisory conversation generates responses
  - Document upload and analysis works
  - Pitch practice mode records audio
  - All 4 modes accessible

- [ ] **UI/UX**
  - Responsive on mobile (375px, 768px, 1024px)
  - No layout shifts
  - Loading states show properly
  - Error messages are user-friendly

- [ ] **Performance**
  - Lighthouse score > 80
  - Time to Interactive < 5s
  - No memory leaks (check DevTools)

## Rollback Procedure

If deployment fails:

1. **Immediate Rollback in Vercel**
   ```bash
   # In Vercel Dashboard:
   # Deployments → Find last good deployment → Promote to Production
   ```

2. **Or rollback via Git**
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Check Sentry for errors**
   - Identify what broke
   - Fix on feature branch
   - Deploy fix

## Monitoring

### Error Tracking (Sentry)
- Production errors: [Sentry Dashboard](https://sentry.io)
- Set up alerts for critical errors
- Review daily error summaries

### Analytics (Optional)
- Add Google Analytics or Mixpanel
- Track key metrics:
  - Daily active users
  - Conversation completions
  - Document uploads
  - Pitch sessions

### Usage Monitoring
- Monitor Supabase usage dashboard
- Check API key usage:
  - OpenAI: [platform.openai.com/usage](https://platform.openai.com/usage)
  - Deepgram: [console.deepgram.com/billing](https://console.deepgram.com/billing)

## Cost Management

### Monthly Cost Estimates (Test Phase)

- Supabase: **$0** (free tier, up to 500MB database)
- Vercel: **$0** (free tier, 100GB bandwidth)
- OpenAI: **$50-200** (depends on usage)
- Deepgram: **$0-50** (free tier includes 45 hours/month)
- Sentry: **$0** (free tier, 5k events/month)

**Total: $50-250/month**

### Scaling Considerations

When you exceed free tiers:
- Supabase Pro: $25/month
- Vercel Pro: $20/month
- Set up budget alerts in all services

## Troubleshooting

### Build Fails

```bash
# Check build logs in Vercel
# Common issues:
# - Missing environment variables → Add in Vercel dashboard
# - TypeScript errors → Run npm run type-check locally
# - Dependency issues → Delete node_modules and npm install
```

### API Keys Not Working

```bash
# Verify in Vercel dashboard:
# 1. Environment variables are set
# 2. Variable names match exactly (case-sensitive)
# 3. No extra spaces in values
# 4. Redeploy after adding variables
```

### Supabase Connection Issues

```bash
# Check:
# 1. Project URL is correct (ends with .supabase.co)
# 2. Anon key is the "anon" key, not service_role
# 3. Database is not paused (Supabase dashboard)
# 4. RLS policies allow anonymous access if needed
```

## Success Criteria

Before announcing to test users:

- [ ] All environment variables configured
- [ ] Auth bypass disabled in production
- [ ] Supabase database set up and tested
- [ ] API keys working and tested
- [ ] Site loads with no console errors
- [ ] User can complete end-to-end workflow
- [ ] Mobile responsive verified
- [ ] Sentry receiving events
- [ ] Deployment pipeline working (PR → Preview → Production)

## Support

For issues:
1. Check Sentry for errors
2. Review Vercel deployment logs
3. Check Supabase logs
4. Review GitHub Actions for CI/CD issues

---

**Last Updated:** 2024
**Maintained By:** Elite AI Advisory Team
