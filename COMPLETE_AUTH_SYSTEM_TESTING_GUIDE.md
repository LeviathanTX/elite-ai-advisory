# Complete Authentication System Testing Guide

## Overview
This guide walks you through testing all three phases of the authentication system together. Follow these steps in order to ensure everything works correctly.

---

## Pre-Testing Setup

### 1. Run Database Migration (Phase 1)

**Go to Supabase SQL Editor:**
https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new

**Run this migration:**
```sql
-- Copy contents from: supabase/migrations/20241119000000_add_trial_fields.sql
-- This adds trial_start_date, trial_end_date, is_trial_active, email_verified columns
```

**Verify migration succeeded:**
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users';
```

You should see the new columns:
- trial_start_date
- trial_end_date
- is_trial_active
- email_verified

### 2. Configure Supabase Email Settings (Phase 2 & 3)

**Option A: Test Without Email (Recommended First)**
- Skip email configuration initially
- Test UI components and database logic
- Email verification banner will show (expected)
- Password reset will work locally but won't send emails

**Option B: Enable Email Verification (Full Testing)**

1. **Enable Email Confirmations:**
   - Go to: Authentication → Providers → Email
   - Toggle ON: "Enable email confirmations"

2. **Set Site URL:**
   - Go to: Authentication → URL Configuration
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.vercel.app`

3. **Add Redirect URLs:**
   ```
   http://localhost:3000/**
   https://your-domain.vercel.app/**
   ```

4. **Configure SMTP (Optional for Testing):**
   - Use Supabase default SMTP (100 emails/day limit)
   - Or configure custom SMTP provider

### 3. Start Development Server

```bash
cd /Users/jeffl/vibe-workspace/ai-bod
npm start
```

---

## Phase 1: Trial System Testing

### Test 1: New User Signup Creates Trial

**Steps:**
1. Open http://localhost:3000
2. Click "Get Started"
3. Fill in signup form:
   - Full Name: "Test User"
   - Email: "test@example.com"
   - Password: "password123"
4. Click "Create Account"

**Expected Results:**
- ✅ Success screen appears (if email enabled)
- ✅ User redirected to dashboard (if email disabled)
- ✅ Account created in Supabase

**Verify in Supabase Dashboard:**
```sql
SELECT
  email,
  trial_start_date,
  trial_end_date,
  is_trial_active,
  email_verified
FROM users
WHERE email = 'test@example.com';
```

**Should show:**
- trial_start_date: Today's date
- trial_end_date: 7 days from today
- is_trial_active: true
- email_verified: false (or true if email disabled)

### Test 2: Trial Banner Appears

**Steps:**
1. Sign in with your test account
2. View dashboard

**Expected Results:**
- ✅ TrialBanner appears at top of dashboard
- ✅ Shows "7 days remaining" (or current count)
- ✅ Has blue color scheme
- ✅ Shows progress bar at ~100%
- ✅ Has "Upgrade Now" button
- ✅ Has dismiss button (X)

### Test 3: Trial Days Countdown

**Manually set trial to 2 days remaining:**
```sql
UPDATE users
SET trial_end_date = NOW() + INTERVAL '2 days'
WHERE email = 'test@example.com';
```

**Refresh dashboard:**
- ✅ Banner shows "2 days remaining"
- ✅ Color changes to red (urgent)
- ✅ Message says "Upgrade now to continue..."
- ✅ Progress bar at ~28%

**Reset trial to 5 days:**
```sql
UPDATE users
SET trial_end_date = NOW() + INTERVAL '5 days'
WHERE email = 'test@example.com';
```

**Refresh dashboard:**
- ✅ Banner shows "5 days remaining"
- ✅ Color changes to yellow (warning)
- ✅ Progress bar at ~71%

### Test 4: Trial Expiration

**Set trial to expired:**
```sql
UPDATE users
SET
  trial_end_date = NOW() - INTERVAL '1 day',
  is_trial_active = false
WHERE email = 'test@example.com';
```

**Refresh dashboard:**
- ✅ TrialBanner disappears
- ✅ No errors in console
- ✅ User still logged in (trial just expired)

**Reset trial for further testing:**
```sql
UPDATE users
SET
  trial_start_date = NOW(),
  trial_end_date = NOW() + INTERVAL '7 days',
  is_trial_active = true
WHERE email = 'test@example.com';
```

---

## Phase 2: Email Verification Testing

### Test 5: Email Verification Banner (Email Disabled)

**With email confirmations disabled:**

**Steps:**
1. Sign in with test account
2. View dashboard

**Expected Results:**
- ✅ EmailVerificationBanner appears (orange)
- ✅ Shows test@example.com
- ✅ Has "Resend Email" button
- ✅ Can dismiss banner
- ✅ Banner above TrialBanner

### Test 6: Resend Verification Email

**Steps:**
1. Click "Resend Email" button on banner

**Expected Results (Email Disabled):**
- ✅ Button shows "Sending..." state
- ✅ Error appears (expected - email not configured)
- ✅ OR success message if email configured

**Expected Results (Email Enabled):**
- ✅ Button shows "Sending..." state
- ✅ Success message appears "Email Sent!"
- ✅ Button changes to "Email Sent!" and disables
- ✅ Check inbox for verification email

### Test 7: Email Verification Flow (Email Enabled Only)

**Steps:**
1. Check inbox for "Confirm your email" email
2. Click verification link in email
3. Redirected back to app

**Expected Results:**
- ✅ Redirected to app
- ✅ User signed in
- ✅ EmailVerificationBanner disappears
- ✅ TrialBanner still shows

**Verify in database:**
```sql
SELECT email, email_verified
FROM users
WHERE email = 'test@example.com';
```

Should show: `email_verified: true`

### Test 8: Signup Success Screen

**Steps:**
1. Sign out
2. Click "Get Started"
3. Create new account with different email
4. Fill form and submit

**Expected Results:**
- ✅ Success screen appears (checkmark icon)
- ✅ Shows email address entered
- ✅ Lists 3 clear steps
- ✅ Has "Got It!" button
- ✅ Clicking "Got It!" closes modal
- ✅ User redirected to landing (if email enabled) or dashboard

---

## Phase 3: Password Reset Testing

### Test 9: Forgot Password Link

**Steps:**
1. Sign out if logged in
2. Click "Login" button
3. AuthModal opens

**Expected Results:**
- ✅ "Forgot Password?" link visible
- ✅ Link is on same line as "Password" label
- ✅ Link is blue and underlined on hover

### Test 10: Password Reset Request

**Steps:**
1. Click "Forgot Password?" link
2. PasswordResetModal opens
3. Enter email: "test@example.com"
4. Click "Send Reset Link"

**Expected Results (Email Disabled):**
- ✅ Loading state shows
- ✅ Error appears (expected - email not configured)

**Expected Results (Email Enabled):**
- ✅ Loading state shows "Sending..."
- ✅ Success screen appears
- ✅ Shows email address
- ✅ Lists 4 steps
- ✅ Mentions "1 hour" expiration
- ✅ Has "Got It!" button

### Test 11: Password Reset Email (Email Enabled Only)

**Steps:**
1. Check inbox for "Reset your password" email
2. Verify email contents

**Expected Results:**
- ✅ Email received within 1-2 minutes
- ✅ Contains "Reset Password" button/link
- ✅ From address is your configured sender
- ✅ Subject mentions password reset

### Test 12: Password Reset Confirmation

**Steps:**
1. Click "Reset Password" link in email
2. Redirected to app
3. PasswordResetConfirmation page loads

**Expected Results:**
- ✅ Full-page component loads
- ✅ Shows "Set New Password" heading
- ✅ Has two password fields
- ✅ Has "Update Password" button
- ✅ Has "Back to Home" link
- ✅ No auth modal visible

### Test 13: Password Validation

**Test minimum length:**
1. Enter password: "abc"
2. Enter confirm: "abc"
3. Click "Update Password"

**Expected:**
- ✅ Error: "Password must be at least 6 characters long"

**Test password mismatch:**
1. Enter password: "password123"
2. Enter confirm: "password456"
3. Click "Update Password"

**Expected:**
- ✅ Error: "Passwords do not match"

### Test 14: Successful Password Reset

**Steps:**
1. Enter password: "newpassword123"
2. Enter confirm: "newpassword123"
3. Click "Update Password"

**Expected Results:**
- ✅ Loading state shows "Updating..."
- ✅ Success screen appears (checkmark)
- ✅ Shows "Password Updated!" message
- ✅ Shows "Redirecting..." message
- ✅ After 2 seconds, redirected
- ✅ AuthModal opens (if not logged in)

### Test 15: Sign In with New Password

**Steps:**
1. Sign in with:
   - Email: "test@example.com"
   - Password: "newpassword123"

**Expected Results:**
- ✅ Sign in successful
- ✅ Redirected to dashboard
- ✅ Trial banner shows (if trial active)
- ✅ Email verification banner shows (if not verified)

---

## Integration Testing (All Phases Together)

### Test 16: Complete New User Flow

**Full journey:**
1. Visit landing page
2. Click "Get Started"
3. Create account with new email
4. See signup success screen (if email enabled)
5. Click "Got It!"
6. View dashboard
7. See EmailVerificationBanner (orange)
8. See TrialBanner (blue) below it
9. Verify trial shows "7 days remaining"
10. Dismiss EmailVerificationBanner
11. TrialBanner still visible
12. Click "Upgrade Now" on TrialBanner
13. Settings modal opens (verify this works)

### Test 17: Banner Interaction

**Test both banners:**
1. EmailVerificationBanner shows (if not verified)
2. TrialBanner shows (if trial active)
3. Dismiss EmailVerificationBanner
4. TrialBanner moves up (no gap)
5. Refresh page
6. EmailVerificationBanner reappears
7. TrialBanner still shows
8. Both banners responsive on mobile

### Test 18: Complete Password Reset Journey

**Full flow:**
1. Sign out
2. Click "Login"
3. Click "Forgot Password?"
4. Enter email
5. Receive reset email
6. Click reset link
7. Enter new password
8. Confirm password
9. Click "Update Password"
10. Wait for redirect
11. Sign in with new password
12. Verify dashboard loads
13. Verify banners show correctly

---

## Edge Case Testing

### Test 19: Invalid Reset Token

**Manually create invalid URL:**
```
http://localhost:3000/#access_token=invalid&type=recovery
```

**Expected:**
- ✅ PasswordResetConfirmation loads
- ✅ Shows error: "Invalid or expired reset link"
- ✅ "Back to Home" link works

### Test 20: Expired Reset Token (Email Enabled)

**Wait 1 hour after requesting reset, then:**
1. Click reset link from old email

**Expected:**
- ✅ Error shows: "Invalid or expired reset link"
- ✅ User can request new reset
- ✅ New email arrives

### Test 21: Multiple Signup Attempts

**Create account, then try again with same email:**
1. Sign up with "duplicate@example.com"
2. Sign out
3. Try to sign up again with same email

**Expected:**
- ✅ Error: "User already registered" or similar
- ✅ Suggests signing in instead

### Test 22: Browser Storage Blocked

**Disable localStorage:**
1. Open DevTools
2. Go to Application tab
3. Block third-party cookies (or use incognito)
4. Try to sign in

**Expected:**
- ✅ Warning banner appears
- ✅ Mentions localStorage is blocked
- ✅ Sign in still works
- ✅ User must sign in on each visit

---

## Database Verification

### Verify Trial Fields

```sql
SELECT
  email,
  subscription_tier,
  trial_start_date,
  trial_end_date,
  is_trial_active,
  EXTRACT(DAY FROM (trial_end_date - NOW())) as days_remaining
FROM users
ORDER BY created_at DESC
LIMIT 5;
```

### Verify Email Verification Sync

```sql
-- Check Supabase auth
SELECT id, email, email_confirmed_at
FROM auth.users
WHERE email = 'test@example.com';

-- Check our users table
SELECT id, email, email_verified
FROM public.users
WHERE email = 'test@example.com';

-- Both should match:
-- email_confirmed_at IS NOT NULL <=> email_verified = true
```

### Check All Users

```sql
SELECT
  u.email,
  u.subscription_tier,
  u.is_trial_active,
  u.email_verified,
  CASE
    WHEN u.trial_end_date > NOW() THEN 'Active'
    ELSE 'Expired'
  END as trial_status,
  EXTRACT(DAY FROM (u.trial_end_date - NOW())) as days_left
FROM users u
ORDER BY u.created_at DESC;
```

---

## Performance Testing

### Test 23: Load Time

**Measure dashboard load:**
1. Sign in
2. Open DevTools → Network tab
3. Refresh dashboard
4. Check load time

**Expected:**
- ✅ Initial page load < 3 seconds
- ✅ Banner components render immediately
- ✅ No layout shift
- ✅ No console errors

### Test 24: Multiple API Calls

**Check for redundant calls:**
1. Open DevTools → Network tab
2. Sign in and view dashboard
3. Filter by "fetch/XHR"

**Expected:**
- ✅ No duplicate user profile fetches
- ✅ No polling/repeated requests
- ✅ Supabase calls are minimal
- ✅ No failed requests

---

## Mobile Testing

### Test 25: Mobile Responsive

**Test on mobile viewport (or real device):**
1. Resize browser to 375px width
2. Test all modals
3. Test both banners

**Expected:**
- ✅ AuthModal fits on screen
- ✅ PasswordResetModal readable
- ✅ Banners stack properly
- ✅ Text is readable
- ✅ Buttons are tappable
- ✅ No horizontal scroll

---

## Browser Compatibility

### Test 26: Cross-Browser

**Test in:**
- Chrome/Edge (Chromium)
- Firefox
- Safari (if on Mac)

**Verify:**
- ✅ All modals work
- ✅ Banners display correctly
- ✅ localStorage works (or warning shows)
- ✅ Email links work
- ✅ No console errors

---

## Final Checklist

### Code Quality
- [ ] TypeScript compilation passes
- [ ] Build succeeds
- [ ] No console errors in production build
- [ ] All components render without warnings

### Phase 1: Trial System
- [ ] Trial dates set on signup
- [ ] Trial banner shows with correct days
- [ ] Colors change based on urgency
- [ ] Banner dismissible
- [ ] Trial expiration works
- [ ] Database fields populated correctly

### Phase 2: Email Verification
- [ ] Signup success screen shows
- [ ] Email verification banner appears
- [ ] Resend email button works
- [ ] Email verification syncs from Supabase
- [ ] Banner hides after verification
- [ ] Can verify email successfully

### Phase 3: Password Reset
- [ ] "Forgot Password?" link visible
- [ ] Reset modal opens and works
- [ ] Reset email sent (if enabled)
- [ ] Reset confirmation page loads
- [ ] Password validation works
- [ ] Password update successful
- [ ] Can sign in with new password

### Integration
- [ ] All banners work together
- [ ] No conflicts between phases
- [ ] Navigation flows smoothly
- [ ] Error handling works
- [ ] Database stays in sync

### Production Readiness
- [ ] Email templates customized
- [ ] SMTP configured
- [ ] Site URL set correctly
- [ ] Redirect URLs whitelisted
- [ ] Rate limits configured
- [ ] Monitoring in place

---

## Troubleshooting

### Issue: Trial Banner Not Showing
**Check:**
- Is `is_trial_active = true` in database?
- Is `trial_end_date` in the future?
- Is user logged in?
- Check browser console for errors

### Issue: Email Verification Banner Always Shows
**Check:**
- Is `email_verified = false` in database?
- Does Supabase auth show `email_confirmed_at`?
- Check console for sync errors
- Try manual sync query

### Issue: Password Reset Email Not Received
**Check:**
- Email confirmations enabled?
- SMTP configured correctly?
- Check spam folder
- Supabase logs for errors
- Rate limit not exceeded?

### Issue: Reset Link Doesn't Work
**Check:**
- Link clicked within 1 hour?
- Site URL configured in Supabase?
- Redirect URLs whitelisted?
- Check URL hash format
- Try requesting new link

---

## Next Steps After Testing

1. **Fix any bugs found** during testing
2. **Customize email templates** for branding
3. **Configure production SMTP** for reliable delivery
4. **Set up monitoring** for email deliverability
5. **Deploy to Vercel** when ready
6. **Test in production** with real emails
7. **Monitor user signups** for issues
8. **Gather user feedback** on UX

---

## Support

**Documentation:**
- Phase 1: `PHASE_1_TRIAL_SYSTEM_COMPLETED.md`
- Phase 2: `PHASE_2_EMAIL_VERIFICATION_COMPLETED.md`
- Phase 3: `PHASE_3_PASSWORD_RESET_COMPLETED.md`
- Supabase Setup: `SUPABASE_EMAIL_VERIFICATION_SETUP.md`

**Need Help?**
- Check Supabase logs in dashboard
- Review browser console errors
- Check database directly with SQL queries
- Verify environment variables set

---

**Happy Testing! 🚀**
