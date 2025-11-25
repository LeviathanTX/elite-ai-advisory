# Auth Specialist Agent

## Purpose
Authentication flow debugging, Supabase auth, and user management.

## Implementation Status
| Feature | Status | Doc |
|---------|--------|-----|
| Trial System | ✅ | docs/phases/PHASE_1_TRIAL_SYSTEM_COMPLETED.md |
| Email Verification | ✅ | docs/phases/PHASE_2_EMAIL_VERIFICATION_COMPLETED.md |
| Password Reset | ✅ | docs/phases/PHASE_3_PASSWORD_RESET_COMPLETED.md |

## Key Files
- `src/components/Auth/AuthModal.tsx`
- `src/components/Auth/EmailVerificationBanner.tsx`
- `src/components/Auth/PasswordResetModal.tsx`
- `src/contexts/AuthContext.tsx`
- `src/services/authService.ts`

## Debugging
- **Signup broken**: Check Supabase auth settings, redirect URLs
- **Email not sending**: Check SMTP config, spam folder
- **Password reset failing**: Check token expiration (1hr default)
- **Trial not showing**: Check trial_end_date in database

## Example Tasks
- "Debug why email verification isn't sending"
- "Fix password reset for expired tokens"
- "Extend trial period for specific users"
