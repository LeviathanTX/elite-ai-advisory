#!/bin/bash

##############################################################################
# Supabase User Profile Trigger Migration Script
#
# This script helps you apply the user profile trigger migration to your
# Supabase database. It provides multiple methods depending on your setup.
##############################################################################

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PROJECT_REF="tgzqffemrymlyioguflb"
MIGRATION_FILE="supabase/migrations/20241115000001_add_user_profile_trigger.sql"

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Supabase User Profile Trigger Migration                ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${RED}❌ Migration file not found: $MIGRATION_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Migration file found${NC}"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}⚠️  Supabase CLI not found${NC}"
    echo ""
    echo "Please install Supabase CLI first:"
    echo "  https://supabase.com/docs/guides/cli/getting-started"
    echo ""
    echo "Quick install:"
    echo "  npm install -g supabase"
    echo "  # or"
    echo "  brew install supabase/tap/supabase"
    echo ""
    echo -e "${BLUE}Alternative: Apply manually via Supabase Dashboard${NC}"
    echo "  https://app.supabase.com/project/$PROJECT_REF/sql/new"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Supabase CLI found: $(supabase --version)${NC}"
echo ""

# Check if logged in
if ! supabase projects list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Supabase CLI${NC}"
    echo ""
    echo "Logging you in..."
    supabase login
    echo ""
fi

echo -e "${GREEN}✅ Logged in to Supabase${NC}"
echo ""

# Check if project is linked
if [ ! -f "supabase/.temp/project-ref" ] && [ ! -f ".git/config" ] || ! grep -q "$PROJECT_REF" supabase/.temp/project-ref 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Project not linked${NC}"
    echo ""
    echo "Linking to project $PROJECT_REF..."
    supabase link --project-ref "$PROJECT_REF"
    echo ""
fi

echo -e "${GREEN}✅ Project linked${NC}"
echo ""

# Display what will be applied
echo -e "${BLUE}📋 Migration Preview:${NC}"
echo ""
echo "This migration will:"
echo "  • Create handle_new_user() function"
echo "  • Create on_auth_user_created trigger"
echo "  • Grant necessary permissions"
echo ""
echo "What it does:"
echo "  • Automatically creates user profile when users sign up"
echo "  • Populates users table with auth user data"
echo "  • Creates initial usage_stats entry"
echo ""

# Ask for confirmation
read -p "Apply this migration? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Migration cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}🚀 Applying migration...${NC}"
echo ""

# Apply the migration
if supabase db push; then
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║           ✅ Migration Applied Successfully!              ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "The user profile trigger is now active!"
    echo ""
    echo "Next steps:"
    echo "  1. Test the database connection:"
    echo "     npx tsx scripts/test-database-connection.ts"
    echo ""
    echo "  2. Test user signup in your application"
    echo ""
    echo "  3. Verify users table is populated automatically"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Migration failed${NC}"
    echo ""
    echo -e "${BLUE}💡 Alternative: Apply manually${NC}"
    echo ""
    echo "1. Go to Supabase SQL Editor:"
    echo "   https://app.supabase.com/project/$PROJECT_REF/sql/new"
    echo ""
    echo "2. Copy and paste the contents of:"
    echo "   $MIGRATION_FILE"
    echo ""
    echo "3. Click 'Run' to execute"
    echo ""
    exit 1
fi
