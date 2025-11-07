#!/usr/bin/env node
/**
 * Check Supabase Database Schema
 * This script connects to Supabase and lists existing tables
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tgzqffemrymlyioguflb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnenFmZmVtcnltbHlpb2d1ZmxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyODg4NzUsImV4cCI6MjA2ODg2NDg3NX0.nvaNrQZaUChoEQUQwqiIi6KSHfOV4EN2UuIiTnatC9o';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('🔍 Checking Supabase Database Schema...\n');
  console.log('Project: v24');
  console.log('URL:', supabaseUrl);
  console.log('');

  // Tables we need for Elite AI Advisory
  const requiredTables = [
    'users',
    'custom_advisors',
    'conversations',
    'documents',
    'voice_sessions',
    'usage_stats'
  ];

  console.log('📋 Checking for required tables:\n');

  for (const tableName of requiredTables) {
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          console.log(`❌ ${tableName} - NOT FOUND`);
        } else {
          console.log(`⚠️  ${tableName} - ERROR: ${error.message}`);
        }
      } else {
        console.log(`✅ ${tableName} - EXISTS (${count || 0} rows)`);
      }
    } catch (err) {
      console.log(`⚠️  ${tableName} - ERROR: ${err.message}`);
    }
  }

  console.log('\n📊 Checking authentication setup...\n');

  // Try to get auth user (will fail if not set up, but that's ok)
  const { data: authData, error: authError } = await supabase.auth.getSession();

  if (authError) {
    console.log('⚠️  Auth: Not configured or no active session');
  } else {
    console.log('✅ Auth: Available (no active session)');
  }

  console.log('\n✨ Database check complete!\n');
}

checkDatabase().catch(err => {
  console.error('❌ Error checking database:', err);
  process.exit(1);
});
