#!/bin/bash
#
# Configure Vercel Environment Variables
# This script sets up all required environment variables for production
#

VERCEL_TOKEN="zCDcltN3MzcASjw4Frh01pHs"
PROJECT_NAME="elite-ai-advisory-clean"

echo "🚀 Configuring Vercel Environment Variables"
echo "==========================================="
echo ""

# Function to add environment variable
add_env_var() {
  local key=$1
  local value=$2
  local target=${3:-production}

  echo "Setting: $key (target: $target)"

  curl -s -X POST \
    "https://api.vercel.com/v10/projects/${PROJECT_NAME}/env" \
    -H "Authorization: Bearer ${VERCEL_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{
      \"key\": \"${key}\",
      \"value\": \"${value}\",
      \"type\": \"encrypted\",
      \"target\": [\"${target}\"]
    }" | jq -r '.error // "✅ Success"'
}

echo "📝 Setting Supabase credentials..."
add_env_var "REACT_APP_SUPABASE_URL" "https://tgzqffemrymlyioguflb.supabase.co" "production"
add_env_var "REACT_APP_SUPABASE_ANON_KEY" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnenFmZmVtcnltbHlpb2d1ZmxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyODg4NzUsImV4cCI6MjA2ODg2NDg3NX0.nvaNrQZaUChoEQUQwqiIi6KSHfOV4EN2UuIiTnatC9o" "production"

echo ""
echo "🔒 Setting security configuration..."
add_env_var "REACT_APP_BYPASS_AUTH" "false" "production"
add_env_var "REACT_APP_ENV" "production" "production"
add_env_var "REACT_APP_DEBUG_MODE" "false" "production"
add_env_var "REACT_APP_USE_MOCK_AI" "false" "production"

echo ""
echo "🎯 Setting feature flags..."
add_env_var "REACT_APP_ENABLE_DOCUMENT_UPLOAD" "true" "production"
add_env_var "REACT_APP_ENABLE_VOICE_INPUT" "true" "production"
add_env_var "REACT_APP_MAX_DOCUMENT_SIZE" "10485760" "production"

echo ""
echo "==========================================="
echo "✅ Vercel configuration complete!"
echo ""
echo "⚠️  NOTE: You still need to add API keys manually:"
echo "  - REACT_APP_OPENAI_API_KEY"
echo "  - REACT_APP_DEEPGRAM_API_KEY (optional)"
echo "  - REACT_APP_ANTHROPIC_API_KEY (optional)"
echo "  - REACT_APP_SENTRY_DSN (optional)"
echo ""
echo "Add these in Vercel Dashboard:"
echo "https://vercel.com/dashboard/[your-project]/settings/environment-variables"
echo ""
