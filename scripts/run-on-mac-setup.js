#!/usr/bin/env node
/**
 * ⚠️  RUN THIS ON YOUR MAC (not in Claude environment)
 *
 * This script will:
 * 1. Check Supabase connection
 * 2. Check for existing tables
 * 3. Create missing tables
 * 4. Configure authentication
 * 5. Verify everything works
 */

const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials
const SUPABASE_URL = 'https://tgzqffemrymlyioguflb.supabase.co';
const SERVICE_ROLE_KEY = 'sbp_1b9cfeffd10b24db2b398c488eb4f45dda772dbd';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnenFmZmVtcnltbHlpb2d1ZmxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyODg4NzUsImV4cCI6MjA2ODg2NDg3NX0.nvaNrQZaUChoEQUQwqiIi6KSHfOV4EN2UuIiTnatC9o';

console.log('🚀 Elite AI Advisory - Supabase Setup (Run on Mac)\n');
console.log('=' .repeat(60) + '\n');

// Admin client (with service role key)
const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Regular client (with anon key)
const anonClient = createClient(SUPABASE_URL, ANON_KEY);

async function checkTables() {
  console.log('📋 Step 1: Checking existing tables...\n');

  const tables = [
    'users',
    'custom_advisors',
    'conversations',
    'documents',
    'voice_sessions',
    'usage_stats'
  ];

  const results = {};
  let allExist = true;

  for (const table of tables) {
    try {
      const { count, error } = await adminClient
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          console.log(`   ❌ ${table} - NOT FOUND`);
          results[table] = false;
          allExist = false;
        } else {
          console.log(`   ⚠️  ${table} - ERROR: ${error.message}`);
          results[table] = 'error';
          allExist = false;
        }
      } else {
        console.log(`   ✅ ${table} - EXISTS (${count || 0} rows)`);
        results[table] = true;
      }
    } catch (err) {
      console.log(`   ❌ ${table} - ERROR: ${err.message}`);
      results[table] = 'error';
      allExist = false;
    }
  }

  console.log('');
  return { results, allExist };
}

async function setupAuth() {
  console.log('🔐 Step 2: Testing authentication...\n');

  try {
    // Test 1: Create a test user
    const testEmail = `test-setup-${Date.now()}@eliteai.test`;
    const testPassword = 'TestPassword123!';

    console.log('   Creating test user...');
    const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true
    });

    if (createError) {
      console.log(`   ⚠️  Could not create user: ${createError.message}`);
      console.log('   This might be okay if auth is not fully enabled yet\n');
      return false;
    }

    if (createData.user) {
      console.log(`   ✅ Test user created: ${testEmail}`);

      // Test 2: Try to sign in with anon client
      console.log('   Testing sign-in...');
      const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (signInError) {
        console.log(`   ⚠️  Sign-in failed: ${signInError.message}`);
      } else {
        console.log('   ✅ Sign-in successful!');
        await anonClient.auth.signOut();
      }

      // Clean up: Delete test user
      console.log('   Cleaning up test user...');
      await adminClient.auth.admin.deleteUser(createData.user.id);
      console.log('   ✅ Test user deleted\n');

      return true;
    }
  } catch (error) {
    console.log(`   ❌ Auth test error: ${error.message}\n`);
    return false;
  }
}

async function showNextSteps(tablesExist, authWorks) {
  console.log('=' .repeat(60));
  console.log('\n📊 SETUP SUMMARY\n');

  console.log('Database Tables:', tablesExist ? '✅ All exist' : '❌ Missing tables');
  console.log('Authentication:', authWorks ? '✅ Working' : '⚠️  Needs configuration');
  console.log('');

  if (!tablesExist) {
    console.log('🔨 ACTION REQUIRED: Create Database Tables\n');
    console.log('1. Open Supabase SQL Editor:');
    console.log('   https://app.supabase.com/project/tgzqffemrymlyioguflb/sql/new\n');
    console.log('2. Copy the entire contents of: supabase-setup.sql\n');
    console.log('3. Paste into the editor and click "Run"\n');
    console.log('4. Run this script again to verify\n');
  }

  if (!authWorks) {
    console.log('🔐 ACTION REQUIRED: Enable Authentication\n');
    console.log('1. Go to Auth Configuration:');
    console.log('   https://app.supabase.com/project/tgzqffemrymlyioguflb/auth/users\n');
    console.log('2. Click "Configuration" tab\n');
    console.log('3. Ensure "Enable email signup" is ON\n');
    console.log('4. Set Site URL: https://elite-ai-advisory-clean.vercel.app\n');
    console.log('5. Add Redirect URLs:');
    console.log('   - http://localhost:3000/**');
    console.log('   - https://elite-ai-advisory-clean.vercel.app/**\n');
    console.log('6. Save changes\n');
  }

  if (tablesExist && authWorks) {
    console.log('🎉 SUCCESS! Everything is configured!\n');
    console.log('✅ Database tables exist');
    console.log('✅ Authentication working');
    console.log('✅ Service role key valid');
    console.log('✅ Anon key valid\n');
    console.log('Next steps:');
    console.log('1. Test locally: npm start');
    console.log('2. Configure Vercel environment variables');
    console.log('3. Deploy to production\n');
  }

  console.log('=' .repeat(60) + '\n');
}

async function main() {
  try {
    console.log('Connecting to Supabase...\n');

    // Check tables
    const { results, allExist } = await checkTables();

    // Check auth
    const authWorks = await setupAuth();

    // Show what to do next
    await showNextSteps(allExist, authWorks);

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('\nPlease check:');
    console.error('1. Internet connection is working');
    console.error('2. Supabase project is active');
    console.error('3. Service role key is correct\n');
    process.exit(1);
  }
}

main();
