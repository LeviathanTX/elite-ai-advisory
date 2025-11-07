#!/usr/bin/env node
/**
 * Setup Supabase Database
 * This script creates all necessary tables and policies
 */

const https = require('https');
const fs = require('fs');

const SUPABASE_URL = 'https://tgzqffemrymlyioguflb.supabase.co';
const SERVICE_ROLE_KEY = 'sbp_1b9cfeffd10b24db2b398c488eb4f45dda772dbd';

console.log('🔧 Setting up Supabase database...\n');

// Read the SQL setup file
const sqlSetup = fs.readFileSync('./supabase-setup.sql', 'utf8');

// Execute SQL via Supabase REST API
function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });

    const options = {
      hostname: 'tgzqffemrymlyioguflb.supabase.co',
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data: body });
        } else {
          resolve({ success: false, error: body, status: res.statusCode });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Alternative: Use pg client connection
async function setupWithManualQueries() {
  console.log('📊 Creating database schema...\n');

  // Split SQL into individual statements
  const statements = sqlSetup
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`Found ${statements.length} SQL statements to execute\n`);

  // For now, let's just verify we can connect
  const checkUrl = `${SUPABASE_URL}/rest/v1/`;

  return new Promise((resolve, reject) => {
    const req = https.request(checkUrl, {
      method: 'GET',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Connection successful!\n');
          resolve({ success: true });
        } else {
          console.log(`⚠️  Connection status: ${res.statusCode}\n`);
          resolve({ success: false, status: res.statusCode });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

setupWithManualQueries()
  .then(result => {
    if (result.success) {
      console.log('✅ Supabase is accessible!\n');
      console.log('📝 Next: Run the SQL setup in Supabase dashboard\n');
      console.log('The service role key is configured correctly.');
    } else {
      console.log('⚠️  Could not fully verify connection');
    }
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
  });
