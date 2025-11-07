#!/bin/bash

# Mac Mini Setup Verification Script
# Run this on your Mac Mini to verify all tools and configurations

echo "================================================"
echo "🔍 Mac Mini Development Environment Verification"
echo "================================================"
echo ""

PASS=0
FAIL=0
WARN=0

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASS++))
}

fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAIL++))
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARN++))
}

echo "📦 Checking System Tools..."
echo "----------------------------"

# Check Homebrew
if command -v brew &> /dev/null; then
    BREW_VERSION=$(brew --version | head -n 1)
    pass "Homebrew installed: $BREW_VERSION"
else
    fail "Homebrew not installed"
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    if [[ $NODE_VERSION == v22* ]]; then
        pass "Node.js installed: $NODE_VERSION"
    else
        warn "Node.js installed but version is $NODE_VERSION (expected v22.x)"
    fi
else
    fail "Node.js not installed"
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    pass "npm installed: v$NPM_VERSION"
else
    fail "npm not installed"
fi

# Check nvm
if command -v nvm &> /dev/null || [ -s "$NVM_DIR/nvm.sh" ]; then
    pass "nvm installed"
else
    warn "nvm not found (optional but recommended)"
fi

# Check Git
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    pass "Git installed: $GIT_VERSION"
else
    fail "Git not installed"
fi

# Check GitHub CLI
if command -v gh &> /dev/null; then
    GH_VERSION=$(gh --version | head -n 1)
    pass "GitHub CLI installed: $GH_VERSION"

    # Check if authenticated
    if gh auth status &> /dev/null; then
        pass "GitHub CLI authenticated"
    else
        warn "GitHub CLI not authenticated (run: gh auth login)"
    fi
else
    warn "GitHub CLI not installed (recommended)"
fi

# Check Vercel CLI
if command -v vercel &> /dev/null; then
    VERCEL_VERSION=$(vercel --version)
    pass "Vercel CLI installed: v$VERCEL_VERSION"

    # Check if authenticated
    if vercel whoami &> /dev/null; then
        VERCEL_USER=$(vercel whoami)
        pass "Vercel CLI authenticated as: $VERCEL_USER"
    else
        warn "Vercel CLI not authenticated (run: vercel login)"
    fi
else
    warn "Vercel CLI not installed (recommended for deployments)"
fi

echo ""
echo "📁 Checking Project Setup..."
echo "----------------------------"

# Check if in project directory
if [ -f "package.json" ]; then
    pass "In project directory (package.json found)"

    # Check if node_modules exists
    if [ -d "node_modules" ]; then
        pass "Dependencies installed (node_modules exists)"
    else
        fail "Dependencies not installed (run: npm install)"
    fi

    # Check if .env.local exists
    if [ -f ".env.local" ]; then
        pass ".env.local file exists"

        # Check for required environment variables
        if grep -q "REACT_APP_SUPABASE_URL" .env.local && grep -q "REACT_APP_SUPABASE_ANON_KEY" .env.local; then
            pass "Supabase credentials found in .env.local"
        else
            fail "Supabase credentials missing in .env.local"
        fi

        if grep -q "REACT_APP_OPENAI_API_KEY" .env.local; then
            pass "OpenAI API key found in .env.local"
        else
            warn "OpenAI API key missing in .env.local (required for AI features)"
        fi
    else
        fail ".env.local file not found (copy from .env.local.template)"
    fi

else
    fail "Not in project directory (package.json not found)"
    echo ""
    echo "Please run this script from the elite-ai-advisory directory:"
    echo "  cd ~/elite-ai-advisory"
    echo "  bash scripts/verify-mac-setup.sh"
    exit 1
fi

echo ""
echo "🔗 Checking Git Configuration..."
echo "----------------------------"

# Check git user config
GIT_USER=$(git config user.name)
GIT_EMAIL=$(git config user.email)

if [ -n "$GIT_USER" ]; then
    pass "Git user.name configured: $GIT_USER"
else
    warn "Git user.name not configured (run: git config --global user.name 'Your Name')"
fi

if [ -n "$GIT_EMAIL" ]; then
    pass "Git user.email configured: $GIT_EMAIL"
else
    warn "Git user.email not configured (run: git config --global user.email 'your@email.com')"
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
pass "Current branch: $CURRENT_BRANCH"

# Check if repo is clean
if [ -z "$(git status --porcelain)" ]; then
    pass "Working directory clean (no uncommitted changes)"
else
    warn "Working directory has uncommitted changes"
fi

# Check remote connection
if git ls-remote origin &> /dev/null; then
    pass "Can connect to GitHub remote"
else
    fail "Cannot connect to GitHub remote (check authentication)"
fi

echo ""
echo "🧪 Running Project Tests..."
echo "----------------------------"

# Test if npm scripts work
if npm run type-check &> /dev/null; then
    pass "Type checking passes (npm run type-check)"
else
    warn "Type checking has errors (run: npm run type-check)"
fi

echo ""
echo "================================================"
echo "📊 Verification Summary"
echo "================================================"
echo -e "${GREEN}Passed:${NC}  $PASS"
echo -e "${YELLOW}Warnings:${NC} $WARN"
echo -e "${RED}Failed:${NC}   $FAIL"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 Your Mac Mini is ready for development!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Start development server: npm start"
    echo "  2. Run tests: npm test"
    echo "  3. Make changes and commit: git add . && git commit -m 'message'"
    echo "  4. Push to GitHub: git push"
    echo ""
elif [ $FAIL -lt 3 ]; then
    echo -e "${YELLOW}⚠️  Almost there! Fix the failed items above.${NC}"
    exit 1
else
    echo -e "${RED}❌ Several issues need to be resolved.${NC}"
    echo ""
    echo "Review the failed items above and refer to MAC_MINI_SETUP.md"
    exit 1
fi
