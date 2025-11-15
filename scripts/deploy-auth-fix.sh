#!/bin/bash

# Deploy Auth Fix Script
# This script applies the database migration and tests the auth flow

set -e  # Exit on error

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║         AI-BoD Auth Flow Fix - Deployment Script         ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

echo "📂 Project directory: $PROJECT_DIR"
cd "$PROJECT_DIR"

# Check if we're in the right place
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are you in the right directory?"
    exit 1
fi

echo "✅ Found package.json"
echo ""

# Step 1: Check Supabase CLI
echo "🔍 STEP 1: Checking Supabase CLI..."
if command -v supabase &> /dev/null; then
    echo "✅ Supabase CLI found: $(supabase --version)"

    # Check if project is linked
    if supabase status &> /dev/null; then
        echo "✅ Supabase project is linked"

        # Apply migration
        echo ""
        echo "📤 Applying database migration..."
        if supabase db push; then
            echo "✅ Migration applied successfully!"
        else
            echo "⚠️  Migration failed. Trying alternative method..."
            MANUAL_MIGRATION=true
        fi
    else
        echo "⚠️  Supabase project not linked. You'll need to apply migration manually."
        MANUAL_MIGRATION=true
    fi
else
    echo "⚠️  Supabase CLI not installed. You'll need to apply migration manually."
    MANUAL_MIGRATION=true
fi

if [ "$MANUAL_MIGRATION" = true ]; then
    echo ""
    echo "📋 Manual Migration Required:"
    echo "   1. Go to Supabase Dashboard: https://app.supabase.com"
    echo "   2. Select your project"
    echo "   3. Go to SQL Editor"
    echo "   4. Copy and run this file:"
    echo "      $PROJECT_DIR/supabase/migrations/20241115000001_add_user_profile_trigger.sql"
    echo ""
    echo "   Or view the SQL here:"
    cat "$PROJECT_DIR/supabase/migrations/20241115000001_add_user_profile_trigger.sql"
    echo ""
    read -p "Press Enter after you've applied the migration manually, or Ctrl+C to exit..."
fi

echo ""

# Step 2: Run test script
echo "🧪 STEP 2: Running database connection test..."
echo ""

if [ -f "$PROJECT_DIR/scripts/test-database-connection.ts" ]; then
    if npx tsx scripts/test-database-connection.ts; then
        echo ""
        echo "✅ Test script completed successfully!"
    else
        echo ""
        echo "⚠️  Test script found issues. Check the output above."
    fi
else
    echo "⚠️  Test script not found at: scripts/test-database-connection.ts"
fi

echo ""

# Step 3: Check environment variables
echo "🔑 STEP 3: Checking environment variables..."
echo ""

if [ -f "$PROJECT_DIR/.env.local" ]; then
    echo "✅ Found .env.local"

    # Check for required vars (without exposing values)
    if grep -q "REACT_APP_SUPABASE_URL" "$PROJECT_DIR/.env.local"; then
        echo "✅ REACT_APP_SUPABASE_URL is set"
    else
        echo "❌ REACT_APP_SUPABASE_URL not found"
    fi

    if grep -q "REACT_APP_SUPABASE_ANON_KEY" "$PROJECT_DIR/.env.local"; then
        echo "✅ REACT_APP_SUPABASE_ANON_KEY is set"
    else
        echo "❌ REACT_APP_SUPABASE_ANON_KEY not found"
    fi
else
    echo "⚠️  .env.local not found. Make sure environment variables are set in Vercel."
fi

echo ""

# Step 4: Check Vercel environment variables
echo "📦 STEP 4: Checking Vercel deployment..."
echo ""

if command -v vercel &> /dev/null; then
    echo "✅ Vercel CLI found"

    echo "Current deployments:"
    vercel ls 2>/dev/null || echo "⚠️  Could not list deployments. You may need to login: vercel login"

    echo ""
    echo "Environment variables:"
    vercel env ls 2>/dev/null || echo "⚠️  Could not list env vars. You may need to login: vercel login"
else
    echo "⚠️  Vercel CLI not installed"
    echo "   Install with: npm i -g vercel"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "SUMMARY"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "✅ Code changes committed and pushed"
echo "   Branch: claude/confirm-database-tables-012i8W6aAVnDVkCfhjEsTjeQ"
echo "   Commit: c0d6c1c"
echo ""
echo "Next steps:"
echo "1. Verify migration was applied (check trigger exists in Supabase)"
echo "2. Deploy to Vercel (auto-deploy should trigger on push)"
echo "3. Test sign-up in production:"
echo "   - Open live URL in browser"
echo "   - Open console (F12)"
echo "   - Try to sign up"
echo "   - Watch for: '✅ User profile loaded successfully'"
echo ""
echo "📖 See AUTH_FIX_PLAN.md for detailed instructions"
echo ""

# Open the plan in default editor/viewer
if [ -f "$PROJECT_DIR/AUTH_FIX_PLAN.md" ]; then
    echo "Opening AUTH_FIX_PLAN.md..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open "$PROJECT_DIR/AUTH_FIX_PLAN.md" 2>/dev/null || cat "$PROJECT_DIR/AUTH_FIX_PLAN.md"
    else
        cat "$PROJECT_DIR/AUTH_FIX_PLAN.md"
    fi
fi
