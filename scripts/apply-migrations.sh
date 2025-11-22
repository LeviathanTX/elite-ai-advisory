#!/bin/bash

# Script to apply all database migrations to Supabase
# This script concatenates all migration files in order and outputs a single SQL file
# that can be copy-pasted into Supabase SQL Editor

set -e

MIGRATIONS_DIR="supabase/migrations"
OUTPUT_FILE="supabase/migrations/all_migrations.sql"

echo "🔨 AI-BoD Database Migration Script"
echo "===================================="
echo ""

# Check if migrations directory exists
if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo "❌ Error: Migrations directory not found: $MIGRATIONS_DIR"
    exit 1
fi

# Create output file with header
cat > "$OUTPUT_FILE" << 'EOF'
-- ============================================================================
-- AI-BoD (Bearable AI Advisors) - Complete Database Setup
-- ============================================================================
-- This file contains all migrations in correct order
-- Copy the entire contents and paste into Supabase SQL Editor
--
-- Generated: $(date)
-- ============================================================================

BEGIN;

EOF

echo "📦 Combining migration files in order..."

# List of migration files in order
MIGRATIONS=(
    "20241115000000_initial_schema.sql"
    "20241116000000_enhanced_document_system.sql"
    "20241119000000_add_trial_fields.sql"
    "20251119000001_auto_create_user_profile.sql"
    "20251119000002_remove_email_unique_constraint.sql"
)

# Append each migration
for migration in "${MIGRATIONS[@]}"; do
    migration_path="$MIGRATIONS_DIR/$migration"

    if [ ! -f "$migration_path" ]; then
        echo "⚠️  Warning: Migration file not found: $migration"
        continue
    fi

    echo "  ✅ Adding $migration"

    echo "" >> "$OUTPUT_FILE"
    echo "-- ============================================================================" >> "$OUTPUT_FILE"
    echo "-- Migration: $migration" >> "$OUTPUT_FILE"
    echo "-- ============================================================================" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"

    cat "$migration_path" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
done

# Add commit statement
echo "" >> "$OUTPUT_FILE"
echo "COMMIT;" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "-- ============================================================================" >> "$OUTPUT_FILE"
echo "-- All migrations applied successfully!" >> "$OUTPUT_FILE"
echo "-- Next steps:" >> "$OUTPUT_FILE"
echo "-- 1. Verify tables exist: SELECT * FROM public.users LIMIT 1;" >> "$OUTPUT_FILE"
echo "-- 2. Test signup flow on your application" >> "$OUTPUT_FILE"
echo "-- ============================================================================" >> "$OUTPUT_FILE"

echo ""
echo "✅ Combined migrations file created: $OUTPUT_FILE"
echo ""
echo "📋 Next steps:"
echo "   1. Open Supabase Dashboard → SQL Editor"
echo "   2. Create new query"
echo "   3. Copy contents of: $OUTPUT_FILE"
echo "   4. Paste and run in SQL Editor"
echo "   5. Verify tables created successfully"
echo ""
echo "Or use Supabase CLI:"
echo "   supabase db push"
echo ""
