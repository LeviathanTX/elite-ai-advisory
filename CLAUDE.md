# AI-BoD (AI Board of Directors) - Project Instructions

## Related Project: Bear Trap

**Bear Trap** is a separate, independent project in its own repository:
- **Repository:** https://github.com/LeviathanTX/bear-trap
- **Local Path:** `/Users/jeffl/vibe-workspace/bear-trap/`
- **URL:** https://bear-trap-ten.vercel.app/

These are separate products - do NOT merge or confuse them.

---

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
- Working directory: `/Users/jeffl/vibe-workspace/ai-bod/`
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

## GitHub Automation (REST API)

**Important:** GitHub CLI (`gh`) is not available in the Claude Code sandbox, but we can automate GitHub operations using `curl` and the REST API.

### Setup (Once per session)

Set the GitHub token as an environment variable:
```bash
export GITHUB_TOKEN="your_github_pat_token_here"
```

**Token Requirements:**
- Create at: https://github.com/settings/tokens
- Required scopes: `repo`, `workflow`, `write:packages`, `read:org`
- Store securely, never commit to repository

### Automated Operations

**Create Pull Request:**
```bash
curl -X POST \
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
curl -X PUT \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/LeviathanTX/AI-BoD/pulls/{PR_NUMBER}/merge \
  -d '{"merge_method": "merge"}'
```

**Check PR Status:**
```bash
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/LeviathanTX/AI-BoD/pulls/{PR_NUMBER}
```

**List Open PRs:**
```bash
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/LeviathanTX/AI-BoD/pulls?state=open
```

### Benefits Over gh CLI
- More control over API operations
- Can handle complex workflows
- Works in sandboxed environments
- Direct access to GitHub's full API

### Session Initialization

At the start of each vibe coding session, request the user to run:
```bash
export GITHUB_TOKEN="token_here"
```

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

---

## Current State (Updated: 2025-11-27)

### Recent Achievements
- **Avatar Display Consistency**: All advisor avatars now display uniformly across all pages
  - Re-cropped all 32 avatar images to 512x512 showing complete heads
  - Added Avatar component to all advisor mode selection pages
  - Fixed Recent Conversations avatar display on Dashboard
  - Updated production URL alias (ai-bod.vercel.app)

### Active Features
- Celebrity advisor selection and customization with visual avatars
- Document upload and analysis (PDF, Word, Excel)
- Multiple consultation modes (Pitch Practice, Strategic Planning, Due Diligence, Quick Consultation)
- Supabase authentication and data persistence
- Vercel auto-deployment on push to main
- Consistent avatar display across all modes and components

### Known Issues
- None currently blocking

### Next Steps
- Monitor avatar display in production
- Continue feature development as requested

---

## Session Log

### 2025-11-27: Avatar Display Consistency Across All Pages
**Commits**: `03a86d5`, `c36d9d7`
**Deployed**: ✅ Production (https://ai-bod.vercel.app)

**Work Completed**:
1. **Avatar Image Re-cropping**:
   - Re-cropped all 32 advisor avatar images to 512x512 pixels
   - Updated cropping to show complete heads (previously showed only middle portions)
   - Used batch processing with sips command for consistency
   - All images now show full head and proper framing

2. **Dashboard Updates**:
   - Fixed Recent Conversations avatar display in Dashboard.tsx (lines 419-425)
   - Replaced letter circle with Avatar component
   - Added proper avatar_url prop support

3. **Mode Selection Pages - Avatar Component Integration**:
   - **PitchPracticeMode.tsx** (lines 1909-1917): Added Avatar component to advisor tiles
   - **StrategicPlanningMode.tsx** (lines 289-297): Added Avatar component to advisor cards
   - **QuickConsultationMode.tsx** (lines 694-702): Added Avatar component to advisor grid
   - **DueDiligenceMode.tsx** (lines 637-643): Replaced emoji with full Avatar component

4. **Deployment & URL Updates**:
   - Pushed all changes to main branch (commits 03a86d5, c36d9d7)
   - Deployed to production via Vercel
   - Updated Vercel alias: ai-bod.vercel.app now points to latest deployment
   - Verified production accessibility (HTTP 200)

**Files Modified**:
- `src/components/Dashboard/Dashboard.tsx` - Recent Conversations avatar fix
- `src/components/Modes/PitchPracticeMode.tsx` - Added Avatar import and component
- `src/components/Modes/StrategicPlanningMode.tsx` - Added Avatar import and component
- `src/components/Modes/QuickConsultationMode.tsx` - Added Avatar import and component
- `src/components/Modes/DueDiligenceMode.tsx` - Added Avatar import and component
- `public/images/advisors/*.jpg` - All 32 images re-cropped

**Technical Details**:
- Avatar component consistently used across all advisor displays
- All mode selection pages now show professional teddy bear portraits
- Images load from /images/advisors/ with proper 512x512 dimensions
- TypeScript compilation verified with no errors
- Consistent UX across Dashboard, Pitch Practice, Strategic Planning, Quick Consultation, and Due Diligence modes

**User Feedback Addressed**:
- ✅ Avatar images now show entire heads (not just middle portions)
- ✅ Avatars display on Recent Conversation blocks
- ✅ Avatars display on all advisor selection tiles/cards
- ✅ Production URL ai-bod.vercel.app properly aliased

---

### 2025-11-26: Custom Advisor Avatars Implementation
**Commits**: `410f403`, `2a90209`, `22ae7d0`
**Deployed**: ✅ Production (https://ai-bod-ochre.vercel.app)

**Work Completed**:
1. **Image Processing**:
   - Renamed 22 new advisor images to kebab-case convention
   - Optimized all 30 images using sips (512x512 max, 75% JPEG quality)
   - Reduced file sizes from 400KB-1.1MB to 34K-96K (85-95% reduction)

2. **Database Updates**:
   - Created migration `20251126000006_update_all_advisor_avatars.sql`
   - Updated 8 Shark Tank advisors in celebrity_advisors table with avatar URLs

3. **Code Updates**:
   - Added `avatar_url` properties to 25 celebrity advisors in `src/contexts/AdvisorContext.tsx`
   - Enhanced Avatar component (`src/components/Common/Avatar.tsx`) to support avatar_url prop
   - Updated AdvisorManagement component to pass avatar_url to Avatar component
   - Added `avatar_url?: string` to CustomAdvisor TypeScript interface

4. **Deployment**:
   - All changes pushed to main branch
   - TypeScript compilation verified (no errors)
   - Successfully deployed to production via Vercel
   - Avatar images verified accessible on production

**Advisors with Custom Avatars** (30 total):
- Shark Tank (8): Mark Cuban, Barbara Corcoran, Daymond John, Lori Greiner, Robert Herjavec, Kevin O'Leary, Kendra Scott, Daniel Lubetzky
- Iconic Investors (3): Reid Hoffman, Jason Calacanis, Sheryl Sandberg
- Strategic Advisors (5): Michael Porter, Sarah Chen, David Kim, Rebecca Goldman, James Wilson
- Functional Specialists (8): Fei-Fei Li, Adam Grant, Patricia Williams, Marc Benioff, Whitney Wolfe Herd, Tim Cook, DJ Patil, Masayoshi Son
- Industry Specialists (6): Jensen Huang, Jennifer Doudna, Jamie Dimon, Mary Barra, Satya Nadella, Elon Musk

**Technical Details**:
- Images location: `/public/images/advisors/`
- Database advisors override hardcoded ones with same ID
- Avatar component supports backward compatibility with avatar_image prop
- All images use consistent naming convention (kebab-case)

**Issues Resolved**:
- Fixed Avatar component to recognize avatar_url prop (was only checking avatar_image)
- Fixed TypeScript compilation error by adding avatar_url to CustomAdvisor interface
- Fixed image file naming inconsistencies (spaces, capitalization)
