# AI-BoD (AI Board of Directors) - Project Instructions

## 🚨 ORIENTATION PROTOCOL (Read This First)

**When a user says "ORIENT: ai-bod" or starts a session mentioning this project, Claude MUST:**

1. **Confirm correct repository:**
   ```bash
   cd /Users/jeffl/vibe-workspace/ai-bod
   git remote -v
   # Must show: github.com/LeviathanTX/ai-bod
   ```

2. **Check current branch:**
   ```bash
   git branch --show-current
   git status -s
   ```

3. **Read current state:** Review the "Current State" section at the bottom of this file

4. **Read recent session:** Check the top entry in SESSION_LOG.md

5. **Report to user before proceeding:**
   - Repository: ai-bod ✓ or ✗
   - Branch: [branch name]
   - Working directory: clean / has changes
   - Last session: [date and summary]
   - Current state: [brief summary]

**NEVER start coding until orientation is complete and confirmed.**

---

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

**CRITICAL: Vercel Alias Issue (December 2025)**
The `ai-bod.vercel.app` alias does NOT auto-update with new deployments. After each deployment:
```bash
# After vercel --prod --force, run:
vercel alias set <deployment-url> ai-bod.vercel.app
```
The default auto-aliases are `ai-bod-ochre.vercel.app` and `ai-bod-jeff-levines-projects.vercel.app`.
Always manually alias to `ai-bod.vercel.app` after production deploys.

**Verify deployment:**
```bash
curl -s "https://ai-bod.vercel.app" | grep -o 'main\.[a-f0-9]*\.js'
```
Compare this hash to your local build in `build/static/js/main.*.js`.

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

## Current State (Updated: 2025-12-11)

### Recent Achievements
- **Landing Page Redesign**: Major overhaul with "AI Disciples" theme
  - Dark gradient design (slate-900 → blue-900 → indigo-900)
  - "Get billion-dollar advice without the billion-dollar connections" headline
  - Testimonial quotes from AI advisors (Reed Pawffman, Jason Clawcanis, Satya Nadellaw, etc.)
  - Problem/Solution/Proof teaser structure
  - Featured founder quote: "I wanted to make world-class advisory expertise available to everyone."
- **Marc Beardreessen Advisor**: New "Software Bear" advisor inspired by legendary tech investor
  - "Software is eating the world" philosophy
  - Deep expertise in platform economics, network effects, Web3, AI/ML
  - Custom teddy bear avatar (black sweater, white collar)
- **Advisor Tile Redesign**: Large square avatars on left side of each tile card
  - 80x80px images instead of small circles
  - Better visual hierarchy with name, role, and edit button
- **Demo Tour Fix**: Wider tooltip (420px), better button spacing
  - Tour no longer locks up after first few steps
- **Pitch Practice UX**: Added guidance screen when Pitch Practice selected without advisors
- **New Avatars**: Updated Jeff Levine and Marc Beardreessen avatars

### Advisor Update Research (TODO - Come Back To This)
User wants to implement advisor updates for current industry news. Three approaches researched:
1. **RAG (Retrieval Augmented Generation)**: Index news/market data in vector DB, retrieve at query time
2. **Periodic Updates**: Scheduled cron job to regenerate advisor prompts weekly/monthly
3. **MCP Integration**: Real-time data access via Model Context Protocol servers

**Recommended hybrid approach**:
- Start with Periodic Updates (simplest with Supabase/Vercel)
- Add RAG for document/news context
- Future: MCP for real-time data (when mature)

### Active Features
- Bear persona advisors with large square avatar tiles
- Document upload and analysis (PDF, Word, Excel)
- Integrated Pitch Practice mode (voice recording → AI feedback → text follow-up)
- Manage Advisors in Settings (create custom, edit bear persona advisors)
- Demo Tour with guided walkthrough
- Supabase authentication and data persistence
- New landing page with disciple quotes and dark theme

### Known Issues
- Vercel's `ai-bod.vercel.app` alias doesn't auto-update (see Deployment section)

### Next Steps
- Implement advisor update mechanism (RAG/periodic/MCP)
- Continue feature development as requested

---

## Session Log

### 2025-12-11: Landing Page Redesign, Marc Beardreessen, Advisor Tile UI
**Deployed**: ✅ Production (https://ai-bod.vercel.app)

**Work Completed**:

1. **Landing Page Complete Redesign**:
   - Dark gradient theme (slate-900 → blue-900 → indigo-900)
   - "AI Disciples of the World's Best Entrepreneurs & Investors" tagline
   - Hero: "Get billion-dollar advice without the billion-dollar connections"
   - Problem/Solution/Proof teaser cards
   - Testimonial quotes from bear advisors:
     - Reed Pawffman: "Entrepreneurs waste months trying to get 15 minutes..."
     - Jason Clawcanis: "What if you could get board-level advice... on demand, 24/7..."
     - Satya Nadellaw: "Now every entrepreneur can get a board meeting..."
     - Jamie Diamondpaw: "Get a board meeting... without writing a single check..."
     - Whitney Wolfbear Herd: "Get mentored by the world's most successful..."
   - Featured quote: "Get million-dollar advice without the million-dollar meeting."
   - Founder quote: "I wanted to make world-class advisory expertise available to everyone." — Jeff Levine

2. **Marc Beardreessen Advisor** (new):
   - "The Software Bear" at Andrebearn Pawrowitz
   - "Software is eating the world" philosophy
   - Expertise: Platform economics, network effects, Web3, AI/ML, consumer internet, enterprise SaaS
   - Contrarian, visionary, technical communication style
   - Custom teddy bear avatar (black sweater, white collar)

3. **Advisor Tile UI Redesign**:
   - Large 80x80px square avatars on left side of each tile
   - Name, role, star badge, and checkmark on right
   - Edit button appears on hover
   - Purple ring highlight when selected
   - Better visual presentation of advisor images

4. **Demo Tour Formatting Fix**:
   - Widened tooltip from 384px to 420px
   - Fixed "Next" button cutoff issue
   - Shortened button labels for better fit

5. **Avatar Updates**:
   - New Jeff Levine avatar (optimized to 512x512)
   - New Marc Beardreessen avatar (optimized to 512x512)

**Files Modified**:
- `src/App.tsx` - Complete landing page redesign with testimonials
- `src/contexts/AdvisorContext.tsx` - Added Marc Beardreessen advisor
- `src/components/Conversations/AdvisoryConversation.tsx` - Large square avatar tiles
- `src/components/Help/DemoTour.tsx` - Wider tooltip, better button spacing
- `public/images/advisors/marc-andreessen.jpg` - New avatar
- `public/images/advisors/jeff-levine.jpg` - Updated avatar

---

### 2025-12-10: Bear Personas, Demo Tour Fix, Email Updates, Vercel Alias Issue
**Commits**: `1190d67`, `78d9d29`, `941d6a5`, `ef0e559`, `9880c71`, `7985cb2`, `a3bb821`, `789f3e9`, `f6b0481`
**Deployed**: ✅ Production (https://ai-bod.vercel.app)

**Work Completed**:

1. **Bear Persona Advisors** (avoid trademark issues):
   - Renamed all celebrity advisors to bear-themed personas
   - Examples: Reed Pawffman, Jason Clawcanis, Cheryl Sandbearg, Fei-Fei Pawli
   - Removed 9 advisors from roster (Shark Tank cast, Gordon Daugherty)
   - Created database migrations to sync with Supabase
   - Updated all references in AdvisorContext, OnboardingFlow, QuickStartGuide, HelpModal, DemoTour

2. **Demo Tour Button Fix**:
   - **Root Cause**: Demo Tour button was only in Dashboard.tsx, but users land on AdvisoryConversation
   - **Fix**: Added Demo Tour button to AdvisoryConversation header
   - Added DemoTour component import and state management
   - HelpModal's "Start Demo Tour" button now works (passes onStartDemoTour prop)

3. **Email Updates**: All emails changed to jeff@bearableai.com
   - HelpModal.tsx, TermsOfService.tsx, PrivacyPolicy.tsx, docs/USER_GUIDE.md

4. **Pitch Practice Mode Fix**:
   - Added `pitch_practice` case to App.tsx switch statement
   - Was falling through to default "under development" message

5. **Vercel Alias Issue Documented**:
   - **Critical**: `ai-bod.vercel.app` does NOT auto-update with deployments
   - Must manually run: `vercel alias set <deployment-url> ai-bod.vercel.app`
   - Default aliases are `ai-bod-ochre.vercel.app` variants

**Files Modified**:
- `src/App.tsx` - Added PitchPracticeMode import and case, landing page text update
- `src/components/Conversations/AdvisoryConversation.tsx` - Added Demo Tour button and component
- `src/components/Dashboard/Dashboard.tsx` - Demo Tour button (users rarely see this)
- `src/components/Help/HelpModal.tsx` - onStartDemoTour prop, email update
- `src/components/Help/DemoTour.tsx` - Bear persona names
- `src/contexts/AdvisorContext.tsx` - Bear persona names and system prompts
- `supabase/migrations/20251210000001_update_advisor_bear_personas.sql`
- `supabase/migrations/20251210000002_remove_gordon_daugherty.sql`

**Key Technical Details**:
- App defaults to `advisory_conversation` mode (line 214 in App.tsx)
- Dashboard component is rarely rendered - users go straight to ConversationManager → AdvisoryConversation
- Vercel CLI: `vercel --prod --force` uploads local files, but alias must be set manually

---

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
