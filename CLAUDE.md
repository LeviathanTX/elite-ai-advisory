# Claude Configuration for Elite AI Advisory

## Testing Philosophy
- ALWAYS run tests before claiming something is fixed
- If tests fail after your changes, fix them before committing
- Write tests for new features before implementing them
- Use the test output to guide your fixes, don't guess

## Workflow Rules
1. Before saying "I've fixed it", run: `npm run verify`
2. If any tests fail, analyze the actual error message
3. Don't make superficial fixes - address root causes
4. When debugging, add console.logs temporarily but remove them before committing
5. Always verify types compile with `npm run type-check`

## Common Issues and Solutions
- If you see "Cannot find module" errors: Run `npm install` first
- If types are failing: Check tsconfig.json and ensure imports are correct
- If tests timeout: The code might have infinite loops or uncaught promises
- If lint fails: Run `npm run lint:fix` to auto-fix, then handle remaining issues

## Git Commit Standards
- Use conventional commits: feat:, fix:, chore:, docs:, test:, refactor:
- Include ticket number if applicable
- Keep commits focused on single changes
- Run tests before every commit

## Error Handling Priority
1. Syntax errors (code won't run)
2. Type errors (TypeScript compilation)
3. Test failures (functionality broken)
4. Lint errors (code style)
5. Warning messages (potential issues)

Fix in this order to avoid cascade failures.

## Elite AI Advisory Specific Features
- Document processing pipeline (PDF, Word, Excel)
- AI-powered business analysis and recommendations
- Supabase integration for data persistence
- OpenAI API integration for intelligent analysis
- File upload and processing workflows
- Business plan generation and advisory services

## Key Commands
- `npm run verify` - Run all checks (lint, type-check, test)
- `npm test` - Run tests with coverage
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run type-check` - Check TypeScript types
- `claude /test-loop` - Run automated test fixing loop
- `claude /verify-pr` - Comprehensive PR verification

## Architecture Notes
- React 19 + TypeScript application
- Zustand for state management
- TanStack Query for data fetching
- Tailwind CSS for styling
- Supabase for backend services
- OpenAI for AI capabilities
- Multi-format document processing

# Deployment & Verification Protocol

## CRITICAL: Never Assume Success
- **ALWAYS verify deployments work** before reporting completion
- Build success ≠ deployment success ≠ functionality working
- After every deployment, check the live site for actual errors
- Use browser dev tools or automated tests to confirm fixes

## Testing Requirements
1. **Before claiming "fixed":**
   - Run local build
   - Deploy to production
   - Wait for deployment to complete (check actual bundle hash changed)
   - Test the live URL with real user actions
   - Verify console shows no errors

2. **For API endpoints:**
   - Test with actual HTTP requests (curl/fetch/test scripts)
   - Check response status AND body content
   - Verify API keys are valid and working
   - Don't assume environment variables are set correctly

## Vercel-Specific
- **Manual deployments may be required** - auto-deploy isn't always configured for all branches
- After pushing code, verify Vercel actually deployed it (check bundle filename changed)
- Use `vercel --prod --force` for manual deployments
- Always check deployment logs for errors

## File System & Permissions
- **Stay within project directories** (`/Users/jeffl/elite-ai-advisory/`)
- Don't create files in home directory or system directories
- Avoid operations requiring sudo/elevated permissions
- If permissions block you, ask user first before trying workarounds

## Error Handling Philosophy
- Real errors from production trump local testing
- If user reports errors with console output, **believe the console**
- "It should work" is not acceptable - verify it actually works
- When investigating, use the actual tools (browser, curl, logs)

## Git & Deployment
- Only add project files to git, never use `git add -A` from home directory
- Check for stale lock files before committing
- Verify commits actually contain the changes you made
- After push, confirm deployment triggered and completed

## Communication Style
- Report what you **verified works**, not what you **think should work**
- If you can't verify, say "I deployed X but cannot verify without [tool/access]"
- Be honest when blocked by permissions or missing tools
- Don't repeat the same failed approach - pivot or ask for help

## When Blocked
1. Don't silently fail - explain what's blocking you
2. Suggest concrete alternatives
3. Ask user for help with permissions/access if needed
4. Don't waste time on approaches that keep failing (like npm cache permission issues)