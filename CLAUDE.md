# Elite AI Advisory - Agent Instructions

## Core Philosophy
**Never assume success without verification.** Build ≠ deploy ≠ functionality working.

## Quality Verification Protocol
Before marking complete:
1. Run `npm run verify` (lint, type-check, test all pass)
2. Deploy to production and wait for bundle hash to change
3. Test live URL with actual user actions
4. Check browser console for errors
5. Report specific evidence (not "should work")

## Error Handling Priority
Fix in this order to avoid cascade failures:
1. Syntax errors (code won't run)
2. Type errors (TypeScript compilation)
3. Test failures (functionality broken)
4. Lint errors (code style)
5. Warnings (potential issues)

## Project-Specific Behavior

### File System Constraints
- Stay within `/Users/jeffl/elite-ai-advisory/`
- Never use `git add -A` from home directory
- Avoid operations requiring sudo/elevated permissions
- Ask before workarounds if blocked

### Deployment Verification (Vercel)
- Manual deployments may be needed (`vercel --prod --force`)
- After push, verify Vercel actually deployed (check bundle filename changed)
- Check deployment logs for errors
- Test live site, not just local build

### API Testing
- Test with actual HTTP requests (curl/fetch/test scripts)
- Check response status AND body content
- Verify API keys are valid and working
- Don't assume environment variables are set correctly

## When Blocked
1. Don't repeat failing approaches (e.g., npm cache permission issues)
2. Suggest concrete alternatives
3. Ask for help with permissions/access
4. Report what verified works, not what "should work"

## Tech Stack Context
- React 19 + TypeScript + Zustand + TanStack Query
- Supabase (backend) + OpenAI (AI capabilities)
- Multi-format document processing (PDF, Word, Excel)
