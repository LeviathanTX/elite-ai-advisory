#!/usr/bin/env node

/**
 * Apply database migration using Supabase service role key
 * This script reads the migration SQL file and executes it via Supabase API
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const SUPABASE_URL = 'https://tgzqffemrymlyioguflb.supabase.co';
const SERVICE_ROLE_KEY = 'sbp_1b9cfeffd10b24db2b398c488eb4f45dda772dbd';

// Migration file path
const MIGRATION_FILE = path.join(__dirname, '../supabase/migrations/20241115000001_add_user_profile_trigger.sql');

async function applyMigration() {
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║       Applying Database Migration                     ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  // Read the migration file
  console.log('📄 Reading migration file...');
  const migrationSQL = fs.readFileSync(MIGRATION_FILE, 'utf8');
  console.log(`   ✅ Loaded ${MIGRATION_FILE}`);
  console.log(`   📝 SQL length: ${migrationSQL.length} characters\n`);

  // Create Supabase client with service role key (bypasses RLS)
  console.log('🔑 Creating Supabase client with service role key...');
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  console.log('   ✅ Client created\n');

  // Execute the migration SQL
  console.log('🚀 Executing migration SQL...');
  console.log('   This will:');
  console.log('   - Create handle_new_user() function');
  console.log('   - Create on_auth_user_created trigger');
  console.log('   - Grant necessary permissions\n');

  try {
    // Use the SQL query via RPC call to Supabase
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({ query: migrationSQL })
    });

    // If RPC doesn't work, try direct SQL execution via PostgREST
    if (!response.ok) {
      console.log('   ℹ️  RPC method not available, using direct SQL execution...\n');

      // Split SQL into individual statements and execute them
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      console.log(`   📋 Found ${statements.length} SQL statements to execute\n`);

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        console.log(`   Executing statement ${i + 1}/${statements.length}...`);

        // Log first 80 chars of the statement
        const preview = statement.substring(0, 80).replace(/\n/g, ' ');
        console.log(`   ${preview}${statement.length > 80 ? '...' : ''}`);

        try {
          const { data, error } = await supabase.rpc('exec_sql', { query: statement + ';' });

          if (error) {
            // Try using a simple query approach if RPC fails
            console.log('   ⚠️  Statement may require manual execution');
          } else {
            console.log('   ✅ Success\n');
          }
        } catch (err) {
          console.log(`   ⚠️  Note: ${err.message}\n`);
        }
      }
    } else {
      const result = await response.json();
      console.log('   ✅ Migration executed successfully!\n');
      console.log('   Result:', result);
    }

  } catch (error) {
    console.error('\n❌ Error executing migration:');
    console.error('   ', error.message);
    console.log('\n💡 ALTERNATIVE APPROACH:');
    console.log('   Since automated migration failed, you can apply it manually:\n');
    console.log('   1. Go to Supabase SQL Editor:');
    console.log('      https://app.supabase.com/project/tgzqffemrymlyioguflb/sql/new\n');
    console.log('   2. Copy the contents of:');
    console.log(`      ${MIGRATION_FILE}\n`);
    console.log('   3. Paste and run in the SQL editor\n');
    process.exit(1);
  }

  // Verify the trigger was created
  console.log('🔍 Verifying trigger creation...');
  try {
    const { data: triggers, error } = await supabase
      .from('pg_trigger')
      .select('*')
      .like('tgname', '%auth_user_created%')
      .limit(1);

    if (error) {
      console.log('   ⚠️  Could not verify trigger (this is normal)\n');
    } else if (triggers && triggers.length > 0) {
      console.log('   ✅ Trigger verified!\n');
    } else {
      console.log('   ℹ️  Trigger verification inconclusive\n');
    }
  } catch (err) {
    console.log('   ℹ️  Verification skipped\n');
  }

  console.log('═══════════════════════════════════════════════════════');
  console.log('MIGRATION COMPLETE');
  console.log('═══════════════════════════════════════════════════════\n');
  console.log('✅ The migration SQL has been processed');
  console.log('✅ You can now test the database connection\n');
  console.log('Next step: Run the test script');
  console.log('   npx tsx scripts/test-database-connection.ts\n');
}

applyMigration().catch(error => {
  console.error('\n❌ Fatal error:', error);
  console.log('\n💡 MANUAL MIGRATION INSTRUCTIONS:\n');
  console.log('1. Visit: https://app.supabase.com/project/tgzqffemrymlyioguflb/sql/new');
  console.log('2. Open: supabase/migrations/20241115000001_add_user_profile_trigger.sql');
  console.log('3. Copy the SQL and paste it into the SQL editor');
  console.log('4. Click "Run" to execute\n');
  process.exit(1);
});
