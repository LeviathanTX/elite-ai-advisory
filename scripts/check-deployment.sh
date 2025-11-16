#!/bin/bash

# Deployment Diagnostic Script
# Checks Vercel deployment status and configuration

set -e

echo "🔍 AI-BoD Deployment Diagnostic"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not installed${NC}"
    echo "Install with: npm install -g vercel"
    echo ""
    echo "Continuing with manual checks..."
    USE_VERCEL_CLI=false
else
    echo -e "${GREEN}✅ Vercel CLI found${NC}"
    USE_VERCEL_CLI=true
fi

echo ""
echo -e "${BLUE}1. Git Status Check${NC}"
echo "===================="
git status --short
git log --oneline -5
echo ""

echo -e "${BLUE}2. Environment Variables in Code${NC}"
echo "=================================="
echo "Checking src/config/appConfig.ts..."
if [ -f "src/config/appConfig.ts" ]; then
    echo -e "${GREEN}✅ Found appConfig.ts${NC}"
    grep -n "REACT_APP_" src/config/appConfig.ts | head -20 || echo "No REACT_APP_ references"
else
    echo -e "${RED}❌ appConfig.ts not found${NC}"
fi

echo ""
echo "Checking src/services/supabase.ts..."
if [ -f "src/services/supabase.ts" ]; then
    echo -e "${GREEN}✅ Found supabase.ts${NC}"
    grep -n "REACT_APP_SUPABASE" src/services/supabase.ts || echo "No REACT_APP_SUPABASE references"
else
    echo -e "${RED}❌ supabase.ts not found${NC}"
fi

echo ""
echo -e "${BLUE}3. Recent Commits Related to Auth${NC}"
echo "===================================="
git log --oneline --grep="auth" --grep="Auth" --grep="login" --grep="Login" -i -10 || echo "No auth-related commits found"

echo ""
echo -e "${BLUE}4. Check for .env files${NC}"
echo "======================="
ls -la .env* 2>/dev/null || echo "No .env files in root"

if [ -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local exists (local development only)${NC}"
    echo "Contents:"
    cat .env.local
fi

echo ""
if [ "$USE_VERCEL_CLI" = true ]; then
    echo -e "${BLUE}5. Vercel Project Info${NC}"
    echo "======================"

    # Check if logged in
    if vercel whoami &> /dev/null; then
        echo -e "${GREEN}✅ Logged in to Vercel${NC}"
        vercel whoami

        echo ""
        echo "Project deployments (last 5):"
        vercel ls 2>/dev/null | head -10 || echo "Could not list deployments"

        echo ""
        echo "Environment variables check:"
        echo "(Run 'vercel env ls' to see all environment variables)"

    else
        echo -e "${YELLOW}⚠️  Not logged in to Vercel CLI${NC}"
        echo "Run: vercel login"
    fi
fi

echo ""
echo -e "${BLUE}6. Production URL Check${NC}"
echo "======================="
echo "Expected project name: elite-ai-advisory-clean"
echo "Expected Supabase URL: https://tgzqffemrymlyioguflb.supabase.co"
echo ""
echo "Common production URLs to check:"
echo "  - https://elite-ai-advisory-clean.vercel.app"
echo "  - https://ai-bod.vercel.app"
echo ""

echo -e "${BLUE}7. Critical Files Modified${NC}"
echo "==========================="
echo "Last modified dates:"
ls -lt src/contexts/AuthContext.tsx 2>/dev/null || echo "AuthContext.tsx not found"
ls -lt src/services/supabase.ts 2>/dev/null || echo "supabase.ts not found"
ls -lt src/config/appConfig.ts 2>/dev/null || echo "appConfig.ts not found"

echo ""
echo -e "${BLUE}8. Recommendations${NC}"
echo "=================="
echo ""
echo "To verify deployment:"
echo "  1. Visit: https://vercel.com/dashboard"
echo "  2. Find project: elite-ai-advisory-clean"
echo "  3. Check latest deployment status"
echo "  4. Verify deployment timestamp is AFTER you added env vars"
echo ""
echo "To verify environment variables:"
echo "  1. Vercel Dashboard → elite-ai-advisory-clean → Settings → Environment Variables"
echo "  2. Confirm all 6 variables exist:"
echo "     - REACT_APP_SUPABASE_URL"
echo "     - REACT_APP_SUPABASE_ANON_KEY"
echo "     - REACT_APP_BYPASS_AUTH"
echo "     - REACT_APP_OPENAI_API_KEY"
echo "     - REACT_APP_ENV"
echo "     - REACT_APP_USE_MOCK_AI"
echo "  3. Each should have ✅ Production ✅ Preview ✅ Development"
echo ""
echo "To test production:"
echo "  1. Open production URL in browser"
echo "  2. Press F12 → Console tab"
echo "  3. Look for initialization logs"
echo "  4. Should see: '✅ Production mode - Using real Supabase'"
echo "  5. Should NOT see: '⚠️ RUNNING IN DEMO MODE'"
echo ""
echo -e "${GREEN}Diagnostic complete!${NC}"
