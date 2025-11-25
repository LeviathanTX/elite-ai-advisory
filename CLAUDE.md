# AI-BoD (AI Board of Directors) - Project Instructions

## Multi-Interface Development Model

This project uses our enhanced vibe coding architecture:

### Interface Responsibilities

**Claude Code (Browser):**
- Document analysis and business strategy planning
- Complex multi-file architectural refactoring
- Business advisor AI logic and knowledge framework design
- Reviewing uploaded business plans and financial documents

**Claude Code (CLI):**
- Rapid feature implementation
- File operations and code generation
- Git workflows and deployment
- Testing and debugging
- Database migrations

**Claude GitHub App:**
- PR reviews for code quality
- Automated CI error fixes
- Security vulnerability detection
- Documentation updates

### Core Philosophy
**Never assume success without verification.** Build ≠ deploy ≠ functionality working.

## Quality Verification Protocol
Before marking any task complete:
1. Run `npm run verify` (lint, type-check, test all pass)
2. Deploy to production and verify bundle hash changed
3. Test live URL with actual user actions
4. Check browser console clean (no errors/warnings)
5. Verify document processing works (upload test PDF)
6. Report specific evidence (not "should work")

## Error Handling Priority
Fix in this order to avoid cascade failures:
1. Syntax errors (code won't run)
2. Type errors (TypeScript compilation)
3. Test failures (functionality broken)
4. Lint errors (code style)
5. Warnings (potential issues)

## Project-Specific Behavior

### Production Environment
- **Production URL**: https://ai-bod.vercel.app
- **Project Name**: AI-BoD (formerly Elite AI Advisory)
- **Deployment**: Vercel (auto-deploy on push to main)
- **Domain**: bearableai.com (email sending via Resend)

### File System
- Working directory: `/Users/jeffl/projects/ai-bod/`
- Never use `git add -A` from home directory
- Avoid operations requiring sudo
- Ask before workarounds if blocked

### Deployment (Vercel)
- Auto-deploy on push to main
- PR preview deployments automatic
- Manual: `vercel --prod --force` if needed
- Verify deployment: check bundle hash changed
- Test live URL before marking complete

### Document Processing
- PDF.js worker must be in public/
- Test with actual file uploads
- Verify Supabase storage working
- Check OpenAI API responses

### API Testing
- Test with actual HTTP requests
- Verify OpenAI API key valid
- Check Supabase connection
- Don't assume env vars set

## CLAUDE CAPABILITIES - DO NOT ASK USER TO DO THESE

**Claude CAN and SHOULD do directly:**
- Set environment variables using Bash tool (`export GITHUB_TOKEN="..."`)
- Run curl commands for GitHub REST API operations
- Create, check, and merge pull requests via API
- Run npm/git/bash commands
- Read, write, and edit files
- Deploy using Vercel CLI
- Run tests, linters, type checkers

**ONLY ask user for:**
- GitHub tokens (user must provide the token value)
- Clarification on requirements or approach
- Permission for destructive operations (force push, delete, etc.)
- Confirmation when multiple valid approaches exist

## GitHub Automation (REST API)

**Important:** GitHub CLI (`gh`) is not available in the Claude Code sandbox, but we can automate GitHub operations using `curl` and the REST API.

### Setup (Once per session)

**When user provides a GitHub token, Claude MUST store it in a file:**
```bash
echo 'export GITHUB_TOKEN="token_value_from_user"' > ~/.github_token
```

**Then source it before each GitHub API operation:**
```bash
source ~/.github_token && curl -H "Authorization: Bearer $GITHUB_TOKEN" ...
```

**DO NOT ask user to run these commands - Claude does them directly using the Bash tool.**

**Token Requirements:**
- Create at: https://github.com/settings/tokens
- Required scopes: `repo`, `workflow`, `write:packages`, `read:org`
- Store securely, never commit to repository

### Automated Operations

**Create Pull Request:**
```bash
source ~/.github_token && curl -X POST \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/LeviathanTX/AI-BoD/pulls \
  -d '{
    "title": "Feature: Description",
    "head": "claude/branch-name",
    "base": "main",
    "body": "## Summary\n\nPR description here"
  }'
```

**Merge Pull Request:**
```bash
source ~/.github_token && curl -X PUT \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/LeviathanTX/AI-BoD/pulls/{PR_NUMBER}/merge \
  -d '{"merge_method": "merge"}'
```

**Check PR Status:**
```bash
source ~/.github_token && curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/LeviathanTX/AI-BoD/pulls/{PR_NUMBER}
```

**List Open PRs:**
```bash
source ~/.github_token && curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/LeviathanTX/AI-BoD/pulls?state=open
```

### Benefits Over gh CLI
- More control over API operations
- Can handle complex workflows
- Works in sandboxed environments
- Direct access to GitHub's full API

### Session Initialization

When user provides a GitHub token at the start of a session, Claude MUST:
1. Immediately store it: `echo 'export GITHUB_TOKEN="token_value"' > ~/.github_token`
2. NOT ask the user to run this command
3. Verify it works by listing open PRs: `source ~/.github_token && curl ...`

This enables automated PR creation, merging, and status checks throughout the session.

## When Blocked
1. Don't repeat failing approaches
2. Suggest concrete alternatives
3. Ask for help with permissions
4. Report verified results only

## Tech Stack
- **Frontend**: React 19 + TypeScript + Tailwind
- **State**: Zustand + TanStack Query
- **Backend**: Supabase (PostgreSQL + Storage + Auth)
- **AI**: OpenAI API (GPT-4, embeddings)
- **Documents**: PDF.js, Mammoth (Word), XLSX
- **Deploy**: Vercel (main + PR previews)
- **Monitoring**: Sentry

## Project-Specific Agents
- `document-processor` - PDF/Word/Excel analysis
- `business-advisor` - AI business consulting logic
- `deployment-verifier` - Production validation
- See `.claude/agents/` directory
