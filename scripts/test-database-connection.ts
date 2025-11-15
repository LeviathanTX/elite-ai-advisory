#!/usr/bin/env tsx

/**
 * Database Connection Test Script
 *
 * Tests the following:
 * 1. Supabase connectivity (network check)
 * 2. Anonymous API access (unauthenticated queries)
 * 3. RLS policy behavior (should block unauthenticated queries)
 * 4. Auth flow (sign up, sign in, authenticated query)
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: TestResult[] = [];

function logTest(name: string, passed: boolean, message: string, details?: any) {
  results.push({ name, passed, message, details });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name}: ${message}`);
  if (details) {
    console.log('   Details:', JSON.stringify(details, null, 2));
  }
}

async function testConnectivity() {
  console.log('\n🔌 TEST 1: Supabase Connectivity\n');

  if (!supabaseUrl || !supabaseAnonKey) {
    logTest(
      'Environment Variables',
      false,
      'Missing Supabase URL or Anon Key',
      { hasUrl: !!supabaseUrl, hasAnonKey: !!supabaseAnonKey }
    );
    return false;
  }

  logTest(
    'Environment Variables',
    true,
    'Supabase credentials found',
    { url: supabaseUrl, keyLength: supabaseAnonKey.length }
  );

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    });

    logTest(
      'Network Connection',
      response.ok,
      response.ok ? 'Connected successfully' : `HTTP ${response.status}`,
      { status: response.status, statusText: response.statusText }
    );

    return response.ok;
  } catch (error: any) {
    logTest('Network Connection', false, error.message);
    return false;
  }
}

async function testAnonAccess() {
  console.log('\n🔓 TEST 2: Anonymous Access (Unauthenticated Queries)\n');

  const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

  try {
    const { data, error } = await supabase.from('users').select('count');

    if (error) {
      // This is EXPECTED due to RLS policies
      logTest(
        'Unauthenticated Query',
        error.code === 'PGRST301' || error.message.includes('permission'),
        'Blocked by RLS (expected behavior)',
        { errorCode: error.code, errorMessage: error.message }
      );
    } else {
      logTest(
        'Unauthenticated Query',
        false,
        'Query succeeded (RLS may not be enabled!)',
        { data }
      );
    }
  } catch (error: any) {
    logTest('Unauthenticated Query', false, `Unexpected error: ${error.message}`);
  }
}

async function testServiceRoleAccess() {
  console.log('\n🔑 TEST 3: Service Role Access (Bypasses RLS)\n');

  if (!supabaseServiceKey) {
    logTest(
      'Service Role Key',
      false,
      'SUPABASE_SERVICE_ROLE_KEY not set in environment',
      { note: 'This is optional - only needed for admin operations' }
    );
    return;
  }

  const supabase = createClient(supabaseUrl!, supabaseServiceKey);

  try {
    const { data, error } = await supabase.from('users').select('count');

    if (error) {
      logTest('Service Role Query', false, error.message, { error });
    } else {
      logTest('Service Role Query', true, 'Successfully bypassed RLS', { data });
    }
  } catch (error: any) {
    logTest('Service Role Query', false, `Unexpected error: ${error.message}`);
  }
}

async function testAuthFlow() {
  console.log('\n👤 TEST 4: Authentication Flow\n');

  const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  // Test Sign Up
  try {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User',
        },
      },
    });

    if (signUpError) {
      logTest('Sign Up', false, signUpError.message, { signUpError });
      return;
    }

    logTest('Sign Up', true, 'User created successfully', {
      userId: signUpData.user?.id,
      email: signUpData.user?.email,
    });

    // Test authenticated query
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', signUpData.user?.id)
      .single();

    if (userError) {
      // User might not exist in users table yet (trigger might not have run)
      logTest(
        'Authenticated Query',
        userError.code === 'PGRST116',
        'User not in users table (normal for new signups)',
        { userError }
      );

      // Try to insert the user
      const newUser = {
        id: signUpData.user?.id,
        email: signUpData.user?.email,
        full_name: 'Test User',
        subscription_tier: 'founder',
      };

      const { data: insertedUser, error: insertError } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();

      if (insertError) {
        logTest('User Creation', false, insertError.message, { insertError });
      } else {
        logTest('User Creation', true, 'User profile created', { insertedUser });
      }
    } else {
      logTest('Authenticated Query', true, 'User profile fetched', { userData });
    }

    // Clean up - delete test user
    await supabase.auth.admin.deleteUser(signUpData.user?.id!);
  } catch (error: any) {
    logTest('Auth Flow', false, `Unexpected error: ${error.message}`);
  }
}

async function testRLSPolicies() {
  console.log('\n🔒 TEST 5: RLS Policy Verification\n');

  const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

  const tables = ['users', 'custom_advisors', 'conversations', 'documents', 'usage_stats'];

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('count');

      if (error) {
        logTest(
          `RLS on ${table}`,
          error.code === 'PGRST301' || error.message.includes('permission'),
          `Protected by RLS`,
          { errorCode: error.code }
        );
      } else {
        logTest(`RLS on ${table}`, false, `Not protected - query succeeded!`, { data });
      }
    } catch (error: any) {
      logTest(`RLS on ${table}`, false, `Unexpected error: ${error.message}`);
    }
  }
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║       AI-BoD Database Connection & Auth Test Suite       ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  await testConnectivity();
  await testAnonAccess();
  await testServiceRoleAccess();
  await testRLSPolicies();
  // Commented out - creates test users
  // await testAuthFlow();

  console.log('\n' + '═'.repeat(60));
  console.log('SUMMARY');
  console.log('═'.repeat(60) + '\n');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);

  console.log('\n' + '═'.repeat(60));
  console.log('DIAGNOSIS');
  console.log('═'.repeat(60) + '\n');

  const hasRLSIssues = results.some(
    r => r.name.startsWith('RLS on') && !r.passed && r.message.includes('succeeded')
  );

  const hasConnectivity = results.find(r => r.name === 'Network Connection')?.passed;
  const hasAuthIssues = results.some(r => r.name.includes('Auth') && !r.passed);

  if (!hasConnectivity) {
    console.log('❌ PRIMARY ISSUE: Cannot connect to Supabase');
    console.log('   - Check your internet connection');
    console.log('   - Verify REACT_APP_SUPABASE_URL is correct');
    console.log('   - Check firewall/network restrictions\n');
  } else if (hasRLSIssues) {
    console.log('⚠️  WARNING: RLS policies may not be properly configured');
    console.log('   - Unauthenticated queries should be blocked');
    console.log('   - Run the migration scripts to enable RLS\n');
  } else {
    console.log('✅ GOOD: RLS policies are active and blocking unauthenticated access');
    console.log('   - This is the expected behavior');
    console.log('   - Users must authenticate before accessing data');
    console.log('   - The timeout issues are likely due to:');
    console.log('     1. Auth session not being established');
    console.log('     2. Session token not included in API calls');
    console.log('     3. Sign-in/sign-up flow not completing\n');
  }

  if (hasAuthIssues) {
    console.log('💡 RECOMMENDATION: Check the authentication flow in the frontend');
    console.log('   - Ensure users can successfully sign up/sign in');
    console.log('   - Verify session is stored and passed to API calls');
    console.log('   - Check browser console for auth errors\n');
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(console.error);
