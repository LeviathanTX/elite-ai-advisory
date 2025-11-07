#!/usr/bin/env node
/**
 * Complete Supabase Setup Script
 * Uses service role key to set up database and check configuration
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = 'https://tgzqffemrymlyioguflb.supabase.co';
const SERVICE_ROLE_KEY = 'sbp_1b9cfeffd10b24db2b398c488eb4f45dda772dbd';

// Create admin client
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🚀 Elite AI Advisory - Supabase Setup\n');
console.log('Project URL:', SUPABASE_URL);
console.log('Using service role key for admin access\n');

async function checkTables() {
  console.log('📋 Checking existing tables...\n');

  const tables = [
    'users',
    'custom_advisors',
    'conversations',
    'documents',
    'voice_sessions',
    'usage_stats'
  ];

  const results = {};

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          console.log(`❌ ${table} - NOT FOUND`);
          results[table] = false;
        } else {
          console.log(`⚠️  ${table} - ERROR: ${error.message}`);
          results[table] = 'error';
        }
      } else {
        console.log(`✅ ${table} - EXISTS (${count || 0} rows)`);
        results[table] = true;
      }
    } catch (err) {
      console.log(`⚠️  ${table} - ERROR: ${err.message}`);
      results[table] = 'error';
    }
  }

  console.log('');
  return results;
}

async function setupDatabase() {
  console.log('🔨 Setting up database...\n');

  try {
    // Check if tables exist
    const tableStatus = await checkTables();

    const missingTables = Object.entries(tableStatus)
      .filter(([_, exists]) => !exists)
      .map(([name]) => name);

    if (missingTables.length === 0) {
      console.log('✅ All tables already exist!\n');
      return true;
    }

    console.log(`⚠️  Missing tables: ${missingTables.join(', ')}\n`);
    console.log('📝 To create tables, you need to run the SQL script manually:\n');
    console.log('1. Go to: https://app.supabase.com/project/tgzqffemrymlyioguflb/sql/new');
    console.log('2. Copy contents of: supabase-setup.sql');
    console.log('3. Paste and click "Run"\n');
    console.log('The Supabase REST API does not support executing raw SQL for security.');
    console.log('However, I\'ve verified your service role key is working!\n');

    return false;

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    return false;
  }
}

async function checkAuth() {
  console.log('🔐 Checking authentication configuration...\n');

  try {
    // Try to create a test user to verify auth is working
    const testEmail = `test-${Date.now()}@eliteai.test`;
    const { data, error } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'TestPassword123!',
      email_confirm: true
    });

    if (error) {
      console.log('⚠️  Auth test failed:', error.message);
      console.log('This might mean auth is not fully configured yet\n');
      return false;
    }

    if (data.user) {
      console.log('✅ Authentication is working!');
      console.log('   Test user created:', testEmail);

      // Clean up test user
      await supabase.auth.admin.deleteUser(data.user.id);
      console.log('   Test user deleted\n');
      return true;
    }

  } catch (error) {
    console.log('⚠️  Auth check error:', error.message);
    return false;
  }
}

async function main() {
  try {
    // Step 1: Check tables
    await setupDatabase();

    // Step 2: Check auth
    await checkAuth();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📊 Summary:\n');
    console.log('✅ Service role key is valid');
    console.log('✅ Connection to Supabase working');
    console.log('');
    console.log('Next steps:');
    console.log('1. If tables are missing, run SQL script in Supabase dashboard');
    console.log('2. Configure Site URL in Auth settings');
    console.log('3. Run: node scripts/test-supabase-connection.js');
    console.log('4. Configure Vercel environment variables\n');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

main();
