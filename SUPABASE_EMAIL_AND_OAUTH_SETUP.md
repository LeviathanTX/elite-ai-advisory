# Supabase Email & OAuth Setup Guide

## Issue: Verification and Password Reset Emails Not Being Delivered

### Root Cause
Supabase requires additional configuration beyond just adding `emailRedirectTo` in code. Email delivery requires:
1. Proper Site URL configuration
2. Email service/SMTP setup
3. Email templates enabled
4. Redirect URLs whitelisted

---

## Step 1: Configure Site URL and Redirect URLs

### In Supabase Dashboard:

1. Go to **Authentication** → **URL Configuration**

2. Set **Site URL**:
   ```
   https://ai-bod.vercel.app
   ```

3. Add **Redirect URLs** (one per line):
   ```
   https://ai-bod.vercel.app/auth/callback
   https://ai-bod.vercel.app/reset-password
   http://localhost:3000/auth/callback
   http://localhost:3000/reset-password
   ```

4. Click **Save**

---

## Step 2: Enable Email Authentication

### In Supabase Dashboard:

1. Go to **Authentication** → **Providers**

2. Find **Email** provider

3. Ensure these settings:
   - ✅ **Enable Email provider**
   - ✅ **Confirm email** (toggle ON)
   - ✅ **Secure email change** (recommended: toggle ON)

4. Click **Save**

---

## Step 3: Configure Email Service

### Option A: Use Supabase Built-in Email (Quick but Limited)

**Pros:**
- No configuration needed
- Works immediately

**Cons:**
- Limited sending quota
- May be flagged as spam
- Not suitable for production

**How to check if it's enabled:**
1. Go to **Project Settings** → **Authentication**
2. Look for **Enable email confirmations**
3. Should be toggled ON

### Option B: Configure Custom SMTP (Recommended for Production)

**Recommended providers:**
- **Resend** (modern, developer-friendly, generous free tier)
- **SendGrid** (popular, reliable)
- **AWS SES** (cheap, scalable)

**Setup with Resend (Recommended):**

1. Sign up at https://resend.com
2. Verify your domain
3. Get your API key
4. In Supabase Dashboard:
   - Go to **Project Settings** → **Authentication**
   - Scroll to **SMTP Settings**
   - Fill in:
     ```
     Host: smtp.resend.com
     Port: 587
     Username: resend
     Password: [Your Resend API Key]
     Sender email: noreply@yourdomain.com
     Sender name: AI-BoD
     ```
5. Click **Save**

---

## Step 4: Customize Email Templates

### In Supabase Dashboard:

1. Go to **Authentication** → **Email Templates**

2. Customize these templates:
   - **Confirm signup** - Sent when user signs up
   - **Magic Link** - Sent for passwordless login
   - **Change Email Address** - Sent when email is changed
   - **Reset Password** - Sent for password reset

3. Important variables you can use:
   - `{{ .ConfirmationURL }}` - Email confirmation link
   - `{{ .Token }}` - Verification token
   - `{{ .SiteURL }}` - Your site URL
   - `{{ .Email }}` - User's email

4. Example **Confirm signup** template:
   ```html
   <h2>Confirm your email</h2>
   <p>Welcome to AI-BoD! Please confirm your email address by clicking the link below:</p>
   <p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
   <p>Or copy and paste this URL into your browser:</p>
   <p>{{ .ConfirmationURL }}</p>
   ```

5. Click **Save** for each template

---

## Step 5: Add Google OAuth Authentication

### 1. Create Google OAuth Credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **APIs & Services** → **Credentials**
5. Click **Create Credentials** → **OAuth client ID**
6. Choose **Web application**
7. Add **Authorized redirect URIs**:
   ```
   https://[YOUR_SUPABASE_PROJECT_REF].supabase.co/auth/v1/callback
   ```
   (Get your project ref from Supabase dashboard URL)
8. Click **Create**
9. Copy your **Client ID** and **Client Secret**

### 2. Configure Google Provider in Supabase:

1. In Supabase Dashboard → **Authentication** → **Providers**
2. Find **Google** provider
3. Toggle **Enable**
4. Fill in:
   - **Client ID**: [Your Google Client ID]
   - **Client Secret**: [Your Google Client Secret]
5. (Optional) Add **Authorized Client IDs** if using Google Workspace
6. Click **Save**

### 3. Add Google Sign-In Button to Your App:

Add this to your AuthModal component:

```typescript
// Add to imports
import { supabase } from '../../services/supabase';

// Add Google sign-in function
const handleGoogleSignIn = async () => {
  setLoading(true);
  setError('');

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
  } catch (err: any) {
    setError(err.message || 'Failed to sign in with Google');
  } finally {
    setLoading(false);
  }
};
```

Add button in the UI:

```tsx
{/* Add after existing sign-in form */}
<div className="mt-4">
  <div className="relative">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-gray-300" />
    </div>
    <div className="relative flex justify-center text-sm">
      <span className="px-2 bg-white text-gray-500">Or continue with</span>
    </div>
  </div>

  <button
    onClick={handleGoogleSignIn}
    disabled={loading}
    className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
  >
    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
    Sign in with Google
  </button>
</div>
```

---

## Step 6: Test Email Delivery

### 1. Test Signup Email:
1. Go to your app
2. Sign up with a real email address
3. Check email inbox (and spam folder)
4. Verify you receive confirmation email
5. Click the confirmation link

### 2. Test Password Reset:
1. Click "Forgot password"
2. Enter your email
3. Check email inbox (and spam folder)
4. Verify you receive password reset email
5. Click the reset link

### 3. Check Supabase Logs:
If emails still aren't arriving:
1. Go to **Authentication** → **Logs** in Supabase Dashboard
2. Look for email-related errors
3. Common issues:
   - SMTP authentication failed
   - Email rate limit exceeded
   - Invalid redirect URL

---

## Troubleshooting

### Emails Not Arriving:

**Check 1: Supabase Email Confirmation Enabled**
- Go to Authentication → Providers → Email
- Verify "Confirm email" is enabled

**Check 2: Site URL is correct**
- Go to Authentication → URL Configuration
- Verify Site URL matches your production domain

**Check 3: SMTP Configuration**
- Go to Project Settings → Authentication → SMTP
- Test SMTP connection
- Check logs for authentication errors

**Check 4: Email in Spam**
- Check spam/junk folder
- If using Supabase built-in email, deliverability is limited
- Consider custom SMTP for production

**Check 5: Rate Limits**
- Supabase free tier has email sending limits
- Upgrade plan if hitting limits
- Use custom SMTP to avoid limits

### Google OAuth Not Working:

**Check 1: Redirect URI Matches**
- Google Console redirect URI must EXACTLY match
- Format: `https://[PROJECT_REF].supabase.co/auth/v1/callback`
- No trailing slash

**Check 2: Google+ API Enabled**
- Verify in Google Cloud Console
- May take a few minutes to propagate

**Check 3: Credentials are Active**
- Check Google Console for credential status
- Verify not expired or revoked

---

## Production Checklist

Before going live:

- [ ] Site URL configured to production domain
- [ ] Redirect URLs include production domain
- [ ] Custom SMTP configured (not using Supabase built-in)
- [ ] Email templates customized with branding
- [ ] Google OAuth credentials for production domain
- [ ] Tested signup email delivery
- [ ] Tested password reset email
- [ ] Tested Google OAuth login
- [ ] Email sent from verified domain
- [ ] SPF/DKIM records configured for email domain
- [ ] Confirmed email deliverability (not in spam)

---

## Quick Reference: Environment Variables

No additional environment variables needed! All email and OAuth configuration is done in the Supabase Dashboard.

The code already has:
- `emailRedirectTo` parameter in signup calls ✅
- OAuth redirect configuration ready ✅

You just need to configure the Supabase Dashboard settings above.

---

## Need Help?

Common resources:
- [Supabase Email Auth Docs](https://supabase.com/docs/guides/auth/auth-email)
- [Supabase OAuth Docs](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Resend Setup Guide](https://resend.com/docs/send-with-supabase)
- Email: hello@bearableai.com
