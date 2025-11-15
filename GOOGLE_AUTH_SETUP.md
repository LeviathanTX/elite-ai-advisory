# Google Workspace Authentication Setup for AI-BoD

Complete guide to set up Google Workspace SSO for your AI-BoD application.

---

## 📋 Prerequisites

- Admin access to your Google Workspace
- Admin access to Supabase project
- Your production URL (e.g., `https://elite-ai-advisory.vercel.app`)

---

## Part 1: Google Cloud Console Setup

### Step 1: Create a Google Cloud Project

1. **Go to Google Cloud Console:**
   - https://console.cloud.google.com/

2. **Create New Project** (or select existing):
   - Click "Select a project" at the top
   - Click "New Project"
   - Name: `AI-BoD Authentication` (or similar)
   - Click "Create"

3. **Wait for project creation** (~30 seconds)
   - You'll see a notification when ready

---

### Step 2: Configure OAuth Consent Screen

1. **Navigate to OAuth consent screen:**
   - In the sidebar: APIs & Services → OAuth consent screen
   - Or direct link: https://console.cloud.google.com/apis/credentials/consent

2. **Select User Type:**
   - **Internal** (if you want ONLY your Google Workspace users)
     - Recommended for company-only access
     - Only users in your workspace can sign in
   - **External** (if you want any Google user)
     - Anyone with a Google account can sign in
     - You can still restrict to your domain later

3. **For Internal (Recommended for Workspace):**
   - Click "Internal"
   - Click "Create"

4. **Fill in App Information:**

   **App name:** `AI-BoD` (or your preferred name)

   **User support email:** Select your email from dropdown

   **App logo:** (Optional) Upload your company logo

   **Application home page:** `https://elite-ai-advisory.vercel.app`

   **Authorized domains:**
   - Click "Add Domain"
   - Add: `vercel.app`
   - If you have custom domain, add it too

   **Developer contact email:** Your email address

5. **Click "Save and Continue"**

6. **Scopes Screen:**
   - Click "Add or Remove Scopes"
   - Select these scopes:
     - `openid`
     - `email`
     - `profile`
   - Or manually add:
     - `https://www.googleapis.com/auth/userinfo.email`
     - `https://www.googleapis.com/auth/userinfo.profile`
   - Click "Update"
   - Click "Save and Continue"

7. **Summary Screen:**
   - Review and click "Back to Dashboard"

---

### Step 3: Create OAuth 2.0 Credentials

1. **Navigate to Credentials:**
   - In the sidebar: APIs & Services → Credentials
   - Or: https://console.cloud.google.com/apis/credentials

2. **Create Credentials:**
   - Click "+ CREATE CREDENTIALS" at the top
   - Select "OAuth client ID"

3. **Configure OAuth Client:**

   **Application type:** `Web application`

   **Name:** `AI-BoD Supabase Auth`

   **Authorized JavaScript origins:**
   - Click "Add URI"
   - Add: `https://tgzqffemrymlyioguflb.supabase.co`

   **Authorized redirect URIs:**
   - Click "Add URI"
   - Add: `https://tgzqffemrymlyioguflb.supabase.co/auth/v1/callback`

   ⚠️ **IMPORTANT:** The redirect URI must match EXACTLY (including `/auth/v1/callback`)

4. **Click "CREATE"**

5. **Save Your Credentials:**
   - You'll see a popup with:
     - **Client ID** (looks like: `123456789-abc.apps.googleusercontent.com`)
     - **Client Secret** (looks like: `GOCSPX-abc123xyz`)
   - **COPY BOTH** - you'll need them for Supabase
   - Click "Download JSON" (optional backup)
   - Click "OK"

---

## Part 2: Supabase Configuration

### Step 4: Enable Google Provider in Supabase

1. **Go to Supabase Dashboard:**
   - https://app.supabase.com/project/tgzqffemrymlyioguflb

2. **Navigate to Authentication:**
   - Click "Authentication" in the left sidebar
   - Click "Providers"

3. **Configure Google:**
   - Find "Google" in the list
   - Toggle it **ON** (enable)

4. **Enter Credentials:**
   - **Client ID:** Paste the Client ID from Google Cloud Console
   - **Client Secret:** Paste the Client Secret from Google Cloud Console

5. **Advanced Settings (Optional but Recommended):**

   **Skip nonce check:** Leave OFF (more secure)

   **Redirect URL:** Should show your callback URL
   - `https://tgzqffemrymlyioguflb.supabase.co/auth/v1/callback`

   **Additional Scopes:** (Optional)
   - Default is fine for most use cases
   - Advanced: Add `https://www.googleapis.com/auth/user.organization.read` if you need org data

6. **Click "Save"**

---

### Step 5: Configure Redirect URLs

1. **Still in Supabase → Authentication → URL Configuration:**

2. **Site URL:**
   - Set to: `https://elite-ai-advisory.vercel.app`

3. **Redirect URLs:**
   - Add these allowed redirect URLs (one per line):
   ```
   https://elite-ai-advisory.vercel.app
   https://elite-ai-advisory.vercel.app/auth/callback
   http://localhost:3000
   http://localhost:3000/auth/callback
   ```

4. **Click "Save"**

---

## Part 3: Update Frontend Code

### Step 6: Add Google Sign-In Button

The code already has Google sign-in functions in `authService.ts`! We just need to add the UI.

I'll create the updated auth modal with Google button.

---

### Step 7: Create Auth Callback Page

We need a page to handle the OAuth callback from Google.

---

## Part 4: Optional - Restrict to Company Domain

### Step 8: Domain Restriction (Google Workspace Only)

If you want to ONLY allow users from your company domain (e.g., @yourcompany.com):

**Option A: Use Internal OAuth (Simplest)**
- Already done if you selected "Internal" in Step 2
- Only users in your Workspace can access

**Option B: Add Domain Restriction in Code**
- Add email validation after sign-in
- Check if email ends with `@yourcompany.com`
- Reject users from other domains

**Option C: Database Trigger**
- Add trigger to check email domain on signup
- Automatically reject non-company emails

---

## 🧪 Testing

### Step 9: Test Google Sign-In

1. **Deploy the changes** (I'll help with this)

2. **Open your production URL:**
   - https://elite-ai-advisory.vercel.app

3. **Click "Sign in with Google"**

4. **You should see:**
   - Google account picker
   - Permission consent screen (first time)
   - Redirect back to your app
   - Logged in successfully

5. **Check database:**
   - Go to Supabase → Table Editor → auth.users
   - Should see new user with Google provider
   - Go to public.users → should see profile (created by trigger)

---

## 🔒 Security Best Practices

### Recommended Settings

1. **Use Internal OAuth** if company-only access
2. **Enable email verification** in Supabase
3. **Set up proper CORS** in Supabase settings
4. **Rotate client secret** periodically
5. **Monitor auth logs** in Supabase dashboard

### Email Domain Restriction Code

If you need to restrict to specific domains in code, add this check:

```typescript
// After successful Google sign-in
const allowedDomains = ['yourcompany.com', 'subsidiary.com'];
const emailDomain = user.email.split('@')[1];

if (!allowedDomains.includes(emailDomain)) {
  await supabase.auth.signOut();
  throw new Error('Only company email addresses are allowed');
}
```

---

## 🆘 Troubleshooting

### Common Issues

**"Redirect URI mismatch"**
- Check that redirect URI in Google Cloud Console exactly matches:
  `https://tgzqffemrymlyioguflb.supabase.co/auth/v1/callback`

**"Access blocked: This app's request is invalid"**
- Make sure OAuth consent screen is configured
- Check that you added all required scopes

**"Sign-in loop" or keeps redirecting**
- Check Site URL in Supabase matches your production URL
- Verify redirect URLs are correctly configured

**"User not found" after Google sign-in**
- The database trigger should auto-create the profile
- Check trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`

**"Internal" option not available**
- Your Google account might not be part of a Workspace
- Use "External" instead, then add domain restriction in code

---

## 📝 Checklist

Before marking as complete, verify:

- [ ] Google Cloud Project created
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 credentials created
- [ ] Client ID and Secret saved securely
- [ ] Google provider enabled in Supabase
- [ ] Credentials entered in Supabase
- [ ] Redirect URLs configured in Supabase
- [ ] Site URL set correctly
- [ ] Frontend code updated with Google button
- [ ] Auth callback page created
- [ ] Changes deployed to production
- [ ] Google sign-in tested successfully
- [ ] User profile created in database
- [ ] Domain restriction implemented (if needed)

---

## 🔗 Quick Links

- **Google Cloud Console:** https://console.cloud.google.com/
- **OAuth Credentials:** https://console.cloud.google.com/apis/credentials
- **Supabase Auth:** https://app.supabase.com/project/tgzqffemrymlyioguflb/auth/providers
- **Supabase URL Config:** https://app.supabase.com/project/tgzqffemrymlyioguflb/auth/url-configuration

---

## 📞 Need Help?

If you encounter issues:
1. Check the Supabase logs (Dashboard → Logs → Auth)
2. Check browser console for errors
3. Verify all URLs match exactly
4. Make sure OAuth consent screen is published (if External)

---

**Setup created:** 2025-11-15
**For:** AI-BoD Google Workspace Authentication
