#!/bin/bash

# Production Environment Setup Script for Vercel
# This script helps configure all required environment variables for production

set -e

echo "🚀 AI-BoD Production Environment Setup"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found${NC}"
    echo ""
    echo "Install it with:"
    echo "  npm install -g vercel"
    echo ""
    echo "Or configure manually via Vercel Dashboard:"
    echo "  See PRODUCTION_SETUP.md for instructions"
    exit 1
fi

echo -e "${GREEN}✅ Vercel CLI found${NC}"
echo ""

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Vercel${NC}"
    echo "Please login first:"
    vercel login
    echo ""
fi

# Get Supabase credentials
echo -e "${BLUE}Step 1: Supabase Configuration${NC}"
echo "================================"
echo ""

SUPABASE_URL="https://tgzqffemrymlyioguflb.supabase.co"
echo "Supabase URL: $SUPABASE_URL"
echo ""

echo "Get your Supabase Anon Key from:"
echo "  https://app.supabase.com/project/tgzqffemrymlyioguflb/settings/api"
echo ""
read -p "Paste your Supabase Anon Key: " SUPABASE_ANON_KEY

if [ -z "$SUPABASE_ANON_KEY" ]; then
    echo -e "${RED}❌ Supabase Anon Key required${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 2: AI API Keys${NC}"
echo "==================="
echo ""

read -p "OpenAI API Key (required): " OPENAI_API_KEY
if [ -z "$OPENAI_API_KEY" ]; then
    echo -e "${RED}❌ OpenAI API Key required${NC}"
    exit 1
fi

read -p "Anthropic API Key (optional, press Enter to skip): " ANTHROPIC_API_KEY
read -p "Deepgram API Key (optional, press Enter to skip): " DEEPGRAM_API_KEY

echo ""
echo -e "${BLUE}Step 3: Review Configuration${NC}"
echo "============================="
echo ""

echo "The following environment variables will be added to Vercel:"
echo ""
echo "  REACT_APP_SUPABASE_URL=$SUPABASE_URL"
echo "  REACT_APP_SUPABASE_ANON_KEY=eyJ... (hidden)"
echo "  REACT_APP_BYPASS_AUTH=false"
echo "  REACT_APP_OPENAI_API_KEY=sk-... (hidden)"
[ -n "$ANTHROPIC_API_KEY" ] && echo "  REACT_APP_ANTHROPIC_API_KEY=sk-... (hidden)"
[ -n "$DEEPGRAM_API_KEY" ] && echo "  REACT_APP_DEEPGRAM_API_KEY=... (hidden)"
echo "  REACT_APP_ENV=production"
echo "  REACT_APP_DEBUG_MODE=false"
echo "  REACT_APP_USE_MOCK_AI=false"
echo "  REACT_APP_ENABLE_DOCUMENT_UPLOAD=true"
echo "  REACT_APP_ENABLE_VOICE_INPUT=true"
echo ""

read -p "Continue? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo -e "${BLUE}Step 4: Setting Environment Variables${NC}"
echo "======================================"
echo ""

# Function to add environment variable
add_env_var() {
    local name=$1
    local value=$2
    local env=${3:-production}

    echo -n "Adding $name... "

    # Check if variable exists
    if vercel env ls "$env" 2>&1 | grep -q "$name"; then
        echo -e "${YELLOW}exists, removing old value${NC}"
        echo "$value" | vercel env rm "$name" "$env" --yes &> /dev/null || true
    fi

    # Add new value
    echo "$value" | vercel env add "$name" "$env" &> /dev/null
    echo -e "${GREEN}✓${NC}"
}

# Add all variables
add_env_var "REACT_APP_SUPABASE_URL" "$SUPABASE_URL" "production"
add_env_var "REACT_APP_SUPABASE_URL" "$SUPABASE_URL" "preview"
add_env_var "REACT_APP_SUPABASE_URL" "$SUPABASE_URL" "development"

add_env_var "REACT_APP_SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY" "production"
add_env_var "REACT_APP_SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY" "preview"
add_env_var "REACT_APP_SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY" "development"

add_env_var "REACT_APP_BYPASS_AUTH" "false" "production"
add_env_var "REACT_APP_BYPASS_AUTH" "false" "preview"

add_env_var "REACT_APP_OPENAI_API_KEY" "$OPENAI_API_KEY" "production"
add_env_var "REACT_APP_OPENAI_API_KEY" "$OPENAI_API_KEY" "preview"
add_env_var "REACT_APP_OPENAI_API_KEY" "$OPENAI_API_KEY" "development"

if [ -n "$ANTHROPIC_API_KEY" ]; then
    add_env_var "REACT_APP_ANTHROPIC_API_KEY" "$ANTHROPIC_API_KEY" "production"
    add_env_var "REACT_APP_ANTHROPIC_API_KEY" "$ANTHROPIC_API_KEY" "preview"
    add_env_var "REACT_APP_ANTHROPIC_API_KEY" "$ANTHROPIC_API_KEY" "development"
fi

if [ -n "$DEEPGRAM_API_KEY" ]; then
    add_env_var "REACT_APP_DEEPGRAM_API_KEY" "$DEEPGRAM_API_KEY" "production"
    add_env_var "REACT_APP_DEEPGRAM_API_KEY" "$DEEPGRAM_API_KEY" "preview"
    add_env_var "REACT_APP_DEEPGRAM_API_KEY" "$DEEPGRAM_API_KEY" "development"
fi

add_env_var "REACT_APP_ENV" "production" "production"
add_env_var "REACT_APP_DEBUG_MODE" "false" "production"
add_env_var "REACT_APP_USE_MOCK_AI" "false" "production"
add_env_var "REACT_APP_ENABLE_DOCUMENT_UPLOAD" "true" "production"
add_env_var "REACT_APP_ENABLE_VOICE_INPUT" "true" "production"

echo ""
echo -e "${GREEN}✅ All environment variables configured!${NC}"
echo ""

echo -e "${BLUE}Step 5: Next Steps${NC}"
echo "=================="
echo ""
echo "1. Verify database tables exist:"
echo "   https://app.supabase.com/project/tgzqffemrymlyioguflb/editor"
echo ""
echo "2. Configure Supabase Auth URLs:"
echo "   https://app.supabase.com/project/tgzqffemrymlyioguflb/auth/url-configuration"
echo "   - Set Site URL to your production domain"
echo "   - Add redirect URLs"
echo ""
echo "3. Deploy to production:"
echo "   Option A: Push to main branch:"
echo "     git push origin main"
echo ""
echo "   Option B: Manual deploy:"
echo "     vercel --prod"
echo ""
echo "4. Test your production site:"
echo "   - Visit your production URL"
echo "   - Check browser console for errors"
echo "   - Test sign up and login"
echo ""
echo -e "${GREEN}Setup complete! 🎉${NC}"
