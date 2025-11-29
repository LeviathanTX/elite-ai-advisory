# AI-BoD (AI Board of Directors) - Project Instructions

---

## ⚠️ CRITICAL: DUAL DEPLOYMENT WARNING ⚠️

**THIS REPOSITORY HAS TWO INDEPENDENT PRODUCTION DEPLOYMENTS:**

### 1. AI-BoD (Main Branch) - LIVE WITH EARLY ADOPTERS
- **URL:** https://ai-bod.vercel.app
- **Branch:** `main`
- **Status:** PRODUCTION - DO NOT DISRUPT
- **Audience:** Early adopters actively using the platform
- **Features:** Full advisor roster (30+ advisors), teddy bear avatars

### 2. Bear Trap (bear-trap Branch) - SEPARATE PRODUCT
- **URL:** TBD (will need separate Vercel project)
- **Branch:** `bear-trap`
- **Status:** Development/Preview
- **Audience:** Different target market (Shark Tank focused)
- **Features:** 8 Shark Tank advisors only, real photos, voice conversations

### ❌ NEVER DO THIS:
- **NEVER** merge `bear-trap` into `main`
- **NEVER** run `vercel --prod` from the `bear-trap` branch
- **NEVER** deploy bear-trap changes to ai-bod.vercel.app
- **NEVER** modify `main` branch with Bear Trap features

### ✅ CORRECT WORKFLOW:
- Keep `main` and `bear-trap` as **completely separate branches**
- Deploy Bear Trap to its **own Vercel project** when ready
- Bug fixes for AI-BoD go to `main` only
- Bear Trap features stay in `bear-trap` only

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

## Current State (Updated: 2025-11-29)

### Recent Achievements
- **Bear Trap Single-Page Experience**: Complete overhaul of Dashboard with integrated Shark Tank conversation interface
  - Removed separate page navigation, everything on one page
  - Added timed pitch mode with full-screen countdown overlay
  - Pitch duration slider (0.5-20 minutes, default 3 min)
  - Voice chat integration with Gemini Live API
  - Dark Shark Tank theme with amber/orange accents

- **UI/UX Improvements**:
  - New header: "The Unauthorized AI Shark Tank Experience" with animated shark emoji
  - Dark themed Advisor Management screen with glass-morphism effects
  - Removed false "sample pitches" claim from landing page

### Active Features
- Celebrity advisor selection and customization with visual avatars
- Document upload and analysis (PDF, Word, Excel)
- Multiple consultation modes (Pitch Practice, Strategic Planning, Due Diligence, Quick Consultation)
- Supabase authentication and data persistence
- Vercel auto-deployment on push to main
- Consistent avatar display across all modes and components
- **Bear Trap branch**: Timed pitch mode, voice conversations, Shark Tank theming

### Known Issues
- Voice chat WebSocket connection may need further testing for reliability

### Next Steps
- Test voice chat functionality end-to-end
- Continue Bear Trap feature development as requested

---

## Session Log

### 2025-11-29: Bear Trap Single-Page Experience & Dark Theme
**Branch**: `bear-trap` (separate from main)
**Deployed**: ✅ Bear Trap Preview (https://bear-trap-ten.vercel.app)

**Work Completed**:

1. **Single-Page Dashboard Overhaul**:
   - Removed "Ready to face the sharks?", "Recent Conversations", and "The Sharks" blocks
   - Integrated full conversation interface directly into Dashboard
   - Moved Voice Chat button to bottom of chat interface (input area)
   - Created seamless single-page experience

2. **Timed Pitch Mode Implementation**:
   - Full-screen pitch overlay with large countdown timer (MM:SS format)
   - Timer color changes: normal → amber (30s remaining) → red with pulse (10s remaining)
   - Live transcript display during recording
   - Stop/Cancel buttons for pitch control
   - Auto-submission when timer expires
   - "Start Timed Pitch" button in welcome area and input area

3. **Pitch Duration Slider**:
   - Replaced 8-button duration selector with smooth slider
   - Range: 0.5 to 20 minutes
   - Default: 3 minutes
   - Custom styled thumb with amber-orange gradient

4. **Header Rebrand**:
   - Changed "Bear Trap - Shark Tank Advisory" to "The Unauthorized AI Shark Tank Experience"
   - Animated shark emoji with sparkle effect
   - "The Unauthorized" in red uppercase with letter spacing
   - "AI SHARK TANK" in amber→orange→red gradient
   - "Experience" in white

5. **Advisor Management Dark Theme**:
   - Dark background with hero image at 15% opacity
   - Gradient header: "Shark Management"
   - Animated stat cards with different colors (amber, green, blue, purple)
   - Glass-morphism search/filter bar
   - Dark themed advisor cards with hover effects
   - Motion animations for staggered card entrance
   - "Shark" terminology throughout

6. **Bug Fixes**:
   - Removed false "Pre-loaded with sample pitches" claim (replaced with "Instant access • No setup required")

**Files Modified**:
- `src/components/Dashboard/Dashboard.tsx` - Major rewrite for single-page experience
- `src/components/Advisory/AdvisorManagement.tsx` - Complete dark theme rewrite
- `src/App.tsx` - Removed false sample pitches claim

**Technical Details**:
- useGeminiVoice hook integrated for voice-to-text during pitch recording
- Pitch timer uses useEffect with 1-second interval
- AI service configuration uses `settings.aiServices?.claude` pattern
- Framer Motion animations throughout for smooth UX
- Glass-morphism: `bg-white/10 backdrop-blur-sm`
- Gradient text: `bg-clip-text text-transparent`

**TypeScript Errors Fixed**:
- TS2554/TS2339: Fixed createAdvisorAI usage with correct aiService config pattern
- Formatting: Applied Prettier via `npm run format`

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
