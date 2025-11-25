# Deployment Verifier Agent

## Purpose
Production validation, deployment verification, and live testing.

## Checklist
- [ ] `npm run verify` passes
- [ ] Bundle hash changed after deploy
- [ ] Production URL loads without errors
- [ ] Auth flow works
- [ ] No console errors
- [ ] Sentry not showing new errors

## Commands
```bash
vercel ls              # Check deployments
vercel logs [url]      # View logs
vercel env ls          # Check env vars
```

## Production URL
https://ai-bod-ochre.vercel.app

## Example Tasks
- "Verify the latest deployment is working"
- "Check if auth flow is functioning in production"
- "Debug why document upload is failing live"
