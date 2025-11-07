#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = 'https://tgzqffemrymlyioguflb.supabase.co';
const SERVICE_KEY = 'sbp_1b9cfeffd10b24db2b398c488eb4f45dda772dbd';

console.log('🚀 Setting up Supabase database...\n');

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function executeSQLFile() {
  try {
    const sql = fs.readFileSync('supabase-setup.sql', 'utf8');
    
    // Split into statements
    const statements = sql.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));
    
    console.log(`Executing ${statements.length} SQL statements...\n`);
    
    // Note: Supabase REST API doesn't support raw SQL execution for security
    // We need to use the Supabase CLI or web interface
    
    console.log('❌ Cannot execute SQL via REST API (security restriction)\n');
    console.log('✅ But here\'s what you need to do:\n');
    console.log('1. Go to: https://app.supabase.com/project/tgzqffemrymlyioguflb/sql/new');
    console.log('2. Copy ALL contents from: supabase-setup.sql');
    console.log('3. Paste and click "Run"\n');
    console.log('This is a one-time setup that takes 30 seconds.\n');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

executeSQLFile();
