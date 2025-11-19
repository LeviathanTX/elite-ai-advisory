# Supabase Email Verification Setup Guide

## Overview
This guide walks you through enabling email verification for user signups in AI-BoD. Email verification ensures that users have access to their email address before they can fully use the platform.

## Prerequisites
- Supabase project created and configured
- Access to Supabase Dashboard
- Production domain configured (for production deployments)

---

## Step 1: Enable Email Confirmations

### Option A: Using Supabase Dashboard (Recommended)

1. **Navigate to Authentication Settings**
   - Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/auth/providers
   - Or: Dashboard → Authentication → Providers

2. **Configure Email Provider**
   - Scroll to "Email" section
   - Click to expand settings

3. **Enable Email Confirmations**
   - Toggle ON: **"Enable email confirmations"**
   - This requires users to verify their email before they can sign in

4. **Configure Email Templates (Optional but Recommended)**
   - Click "Email Templates" tab
   - Customize the "Confirm signup" email template
   - Variables available:
     - `{{ .ConfirmationURL }}` - The verification link
     - `{{ .Token }}` - The verification token
     - `{{ .SiteURL }}` - Your site URL
     - `{{ .Email }}` - User's email address

### Option B: Using Supabase CLI (For Automation)

```bash
# Update supabase/config.toml
[auth.email]
enable_signup = true
enable_confirmations = true
double_confirm_changes = true
```

---

## Step 2: Configure Site URL and Redirect URLs

### Setting Site URL

The Site URL is where users will be redirected after clicking the verification link.

1. **Go to Authentication → URL Configuration**
   - URL: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/auth/url-configuration

2. **Set Site URL**

   **For Development:**
   ```
   http://localhost:3000
   ```

   **For Production:**
   ```
   https://your-domain.vercel.app
   ```

3. **Add Redirect URLs**
   Add these patterns to allow redirects:

   ```
   http://localhost:3000/**
   https://your-domain.vercel.app/**
   https://*.vercel.app/**
   ```

   This allows Supabase to redirect users back to your app after email verification.

---

## Step 3: Configure Email Rate Limits (Optional)

To prevent abuse of the verification email system:

1. **Go to Authentication → Rate Limits**
   - URL: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/auth/rate-limits

2. **Set Rate Limits**
   - Email signups: `10 per hour` per IP address
   - Email resends: `3 per hour` per user
   - OTP verifications: `5 per hour` per user

---

## Step 4: Configure SMTP (For Production Email Delivery)

By default, Supabase uses their SMTP server with a daily limit. For production, configure your own SMTP provider.

### Recommended SMTP Providers:
- **SendGrid** (Free tier: 100 emails/day)
- **AWS SES** (Pay as you go, very cheap)
- **Mailgun** (Free tier: 5,000 emails/month)
- **Postmark** (Developer plan available)

### Configure Custom SMTP:

1. **Go to Authentication → SMTP Settings**
   - URL: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/auth

2. **Enable Custom SMTP**
   - Toggle ON: "Enable custom SMTP"

3. **Enter SMTP Details**
   ```
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: YOUR_SENDGRID_API_KEY
   Sender email: noreply@your-domain.com
   Sender name: Bearable Advisors
   ```

4. **Test Email Delivery**
   - Click "Send test email"
   - Check that you receive the test email

---

## Step 5: Verify Configuration

### Test the Email Verification Flow:

1. **Sign up with a test email**
   - Use a real email address you can access
   - Complete the signup form

2. **Check your inbox**
   - You should receive a verification email within 1-2 minutes
   - Check spam folder if not in inbox

3. **Click verification link**
   - Should redirect to your app
   - User should be marked as verified in database

4. **Verify in Supabase Dashboard**
   - Go to: Authentication → Users
   - Check that user has `email_confirmed_at` timestamp

5. **Test in Application**
   - EmailVerificationBanner should NOT appear after verification
   - User's `email_verified` field should be `true` in users table

---

## Step 6: Troubleshooting

### Common Issues:

#### 1. Verification Email Not Received
**Possible causes:**
- Email in spam folder
- SMTP not configured correctly
- Daily email limit reached (Supabase default SMTP)

**Solutions:**
- Check spam/junk folder
- Verify SMTP settings in dashboard
- Configure custom SMTP provider
- Check Supabase logs for email delivery errors

#### 2. Verification Link Doesn't Work
**Possible causes:**
- Site URL not configured correctly
- Redirect URL not whitelisted
- Token expired (default: 24 hours)

**Solutions:**
- Verify Site URL matches your domain exactly
- Add redirect URL patterns with wildcards
- Have user request new verification email
- Check token expiration settings

#### 3. User Can Sign In Without Verification
**Possible causes:**
- Email confirmations not enabled
- Old users created before confirmations enabled

**Solutions:**
- Verify "Enable email confirmations" is ON
- Existing users may need manual verification
- Run migration to mark old users as verified

#### 4. Verification Banner Always Shows
**Possible causes:**
- `email_verified` field not syncing from Supabase auth
- Auth state not updating after verification

**Solutions:**
- Check AuthContext sync logic (fetchUserProfile)
- Verify `email_confirmed_at` exists in Supabase auth
- Force refresh user profile after verification
- Check browser console for errors

---

## Step 7: Database Sync Verification

The application automatically syncs email verification status from Supabase auth to your database.

### Verify Sync is Working:

1. **Check Supabase Auth Table**
   ```sql
   SELECT email, email_confirmed_at
   FROM auth.users
   WHERE email = 'test@example.com';
   ```

2. **Check Your Users Table**
   ```sql
   SELECT email, email_verified
   FROM public.users
   WHERE email = 'test@example.com';
   ```

3. **Both should match:**
   - If `email_confirmed_at` is NOT NULL → `email_verified` should be `true`
   - If `email_confirmed_at` is NULL → `email_verified` should be `false`

### Manual Sync (If Needed):

```sql
-- Sync verification status for all users
UPDATE public.users
SET email_verified = (
  SELECT email_confirmed_at IS NOT NULL
  FROM auth.users
  WHERE auth.users.id = public.users.id
);
```

---

## Configuration Checklist

Before going live, verify:

- [ ] Email confirmations enabled in Supabase
- [ ] Site URL configured for production domain
- [ ] Redirect URLs whitelisted
- [ ] Custom SMTP configured (for production)
- [ ] Email templates customized (optional)
- [ ] Rate limits configured
- [ ] Test signup completes successfully
- [ ] Verification email received
- [ ] Verification link works
- [ ] Banner disappears after verification
- [ ] Database sync verified

---

## Email Template Customization (Optional)

### Default Template Variables:

```html
<h2>Confirm Your Email</h2>
<p>Follow this link to confirm your account:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
```

### Recommended Custom Template:

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #2563eb;">Welcome to Bearable Advisors!</h2>

  <p>Thank you for signing up. Please verify your email address to get started with your AI Board of Directors.</p>

  <p style="margin: 30px 0;">
    <a href="{{ .ConfirmationURL }}"
       style="background: linear-gradient(to right, #2563eb, #9333ea);
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              display: inline-block;">
      Verify Email Address
    </a>
  </p>

  <p style="color: #6b7280; font-size: 14px;">
    If you didn't create an account, you can safely ignore this email.
  </p>

  <p style="color: #6b7280; font-size: 14px;">
    This link expires in 24 hours.
  </p>
</div>
```

---

## Environment Variables

Ensure these are set in your deployment:

```bash
# Vercel or .env.local
REACT_APP_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here

# Optional: Disable auth bypass for production
REACT_APP_BYPASS_AUTH=false
```

---

## Testing Checklist

### Development Testing:
- [ ] Signup with test email
- [ ] Receive verification email
- [ ] Click link, redirects correctly
- [ ] Banner shows for unverified users
- [ ] Banner hides after verification
- [ ] Resend email button works
- [ ] Can't sign in without verification (if enabled)

### Production Testing:
- [ ] Signup with real email
- [ ] Email not in spam
- [ ] Branding looks correct
- [ ] Links work with production domain
- [ ] SMTP delivery reliable
- [ ] Rate limits working
- [ ] Error handling works

---

## Support & Resources

**Supabase Documentation:**
- Email Auth: https://supabase.com/docs/guides/auth/auth-email
- SMTP Setup: https://supabase.com/docs/guides/auth/auth-smtp
- Email Templates: https://supabase.com/docs/guides/auth/auth-email-templates

**AI-BoD Implementation:**
- AuthContext: `src/contexts/AuthContext.tsx`
- Email Banner: `src/components/Auth/EmailVerificationBanner.tsx`
- Auth Service: `src/services/authService.ts`

---

**Setup Date**: 2025-11-19
**Status**: Ready for Configuration
**Next**: Complete setup and test with real email addresses
