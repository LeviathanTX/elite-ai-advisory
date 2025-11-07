#!/usr/bin/env node
/**
 * Test Supabase Connection
 * Run this after setting up the database to verify everything works
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🧪 Testing Supabase Connection...\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase credentials not found in .env.local');
  console.error('Make sure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

console.log('📡 Connecting to:', supabaseUrl);
console.log('');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('1️⃣ Testing basic connection...');

  try {
    // Test 1: Basic connection
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    if (sessionError && sessionError.message !== 'Auth session missing!') {
      console.error('❌ Connection failed:', sessionError.message);
      return false;
    }
    console.log('✅ Connection successful!\n');

    // Test 2: Check tables exist
    console.log('2️⃣ Checking database tables...\n');

    const tables = [
      'users',
      'custom_advisors',
      'conversations',
      'documents',
      'voice_sessions',
      'usage_stats'
    ];

    let allTablesExist = true;

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.log(`❌ ${table} - Not found or error: ${error.message}`);
          allTablesExist = false;
        } else {
          console.log(`✅ ${table} - OK (${count || 0} rows)`);
        }
      } catch (err) {
        console.log(`❌ ${table} - Error: ${err.message}`);
        allTablesExist = false;
      }
    }

    console.log('');

    // Test 3: Test authentication
    console.log('3️⃣ Testing authentication...\n');

    // Try to sign up a test user (will fail if already exists, which is fine)
    const testEmail = `test-${Date.now()}@eliteai.test`;
    const testPassword = 'TestPassword123!';

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (signUpError) {
      if (signUpError.message.includes('email') || signUpError.message.includes('already')) {
        console.log('⚠️  Auth: Signup disabled or email exists (check Supabase auth settings)');
      } else {
        console.log(`⚠️  Auth: ${signUpError.message}`);
      }
    } else if (signUpData.user) {
      console.log('✅ Auth: Test signup successful!');
      console.log('   Test user created:', testEmail);

      // Clean up test user
      await supabase.auth.signOut();
    }

    console.log('');

    // Summary
    console.log('📊 Summary:\n');
    if (allTablesExist) {
      console.log('✅ All database tables exist');
      console.log('✅ Connection working');
      console.log('✅ Ready for development!\n');
      console.log('🎉 Supabase is fully configured!\n');
      console.log('Next steps:');
      console.log('  1. Set REACT_APP_BYPASS_AUTH=false in .env.local (to use real auth)');
      console.log('  2. Add these same credentials to Vercel');
      console.log('  3. Run: npm start');
      console.log('  4. Test signup/login in your app\n');
      return true;
    } else {
      console.log('⚠️  Some tables are missing');
      console.log('👉 Run the SQL setup script in Supabase dashboard\n');
      console.log('Go to: https://app.supabase.com/project/tgzqffemrymlyioguflb/sql/new');
      console.log('Copy contents of: supabase-setup.sql');
      console.log('Paste and click Run\n');
      return false;
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

testConnection()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  });
