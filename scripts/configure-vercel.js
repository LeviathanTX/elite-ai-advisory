#!/usr/bin/env node
/**
 * Configure Vercel Environment Variables
 * Sets up all production environment variables automatically
 */

const https = require('https');

const VERCEL_TOKEN = 'zCDcltN3MzcASjw4Frh01pHs';

console.log('🚀 Configuring Vercel Environment Variables\n');
console.log('='.repeat(60) + '\n');

// Environment variables to set
const envVars = [
  // Supabase
  {
    key: 'REACT_APP_SUPABASE_URL',
    value: 'https://tgzqffemrymlyioguflb.supabase.co',
    target: ['production', 'preview'],
    description: 'Supabase project URL'
  },
  {
    key: 'REACT_APP_SUPABASE_ANON_KEY',
    value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnenFmZmVtcnltbHlpb2d1ZmxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyODg4NzUsImV4cCI6MjA2ODg2NDg3NX0.nvaNrQZaUChoEQUQwqiIi6KSHfOV4EN2UuIiTnatC9o',
    target: ['production', 'preview'],
    description: 'Supabase anon key'
  },

  // Security
  {
    key: 'REACT_APP_BYPASS_AUTH',
    value: 'false',
    target: ['production', 'preview'],
    description: 'Disable auth bypass in production'
  },

  // Environment
  {
    key: 'REACT_APP_ENV',
    value: 'production',
    target: ['production'],
    description: 'Environment name'
  },
  {
    key: 'REACT_APP_DEBUG_MODE',
    value: 'false',
    target: ['production'],
    description: 'Debug mode disabled'
  },
  {
    key: 'REACT_APP_USE_MOCK_AI',
    value: 'false',
    target: ['production', 'preview'],
    description: 'Use real AI services'
  },

  // Feature Flags
  {
    key: 'REACT_APP_ENABLE_DOCUMENT_UPLOAD',
    value: 'true',
    target: ['production', 'preview'],
    description: 'Enable document upload'
  },
  {
    key: 'REACT_APP_ENABLE_VOICE_INPUT',
    value: 'true',
    target: ['production', 'preview'],
    description: 'Enable voice input'
  },
  {
    key: 'REACT_APP_MAX_DOCUMENT_SIZE',
    value: '10485760',
    target: ['production', 'preview'],
    description: 'Max document size (10MB)'
  }
];

// Get project ID
async function getProjectId() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.vercel.com',
      path: '/v9/projects',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);

          if (response.error) {
            reject(new Error(response.error.message || 'Failed to get projects'));
            return;
          }

          // Find project by name
          const project = response.projects?.find(p =>
            p.name === 'elite-ai-advisory-clean' ||
            p.name === 'elite-ai-advisory' ||
            p.name.includes('elite')
          );

          if (project) {
            resolve(project.id);
          } else {
            reject(new Error('Project not found. Projects available: ' +
              response.projects?.map(p => p.name).join(', ')));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Set environment variable
async function setEnvVar(projectId, envVar) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      key: envVar.key,
      value: envVar.value,
      type: 'encrypted',
      target: envVar.target
    });

    const options = {
      hostname: 'api.vercel.com',
      path: `/v10/projects/${projectId}/env`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);

          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ success: true, data: response });
          } else if (response.error?.code === 'ENV_ALREADY_EXISTS') {
            resolve({ success: true, alreadyExists: true });
          } else {
            resolve({ success: false, error: response.error?.message || 'Unknown error' });
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  try {
    // Step 1: Get project ID
    console.log('🔍 Finding your Vercel project...\n');
    const projectId = await getProjectId();
    console.log(`✅ Found project: ${projectId}\n`);

    // Step 2: Set each environment variable
    console.log('📝 Setting environment variables:\n');

    let successCount = 0;
    let existsCount = 0;
    let failCount = 0;

    for (const envVar of envVars) {
      process.stdout.write(`   ${envVar.key}... `);

      try {
        const result = await setEnvVar(projectId, envVar);

        if (result.success) {
          if (result.alreadyExists) {
            console.log('⚠️  Already exists');
            existsCount++;
          } else {
            console.log('✅ Set');
            successCount++;
          }
        } else {
          console.log(`❌ Failed: ${result.error}`);
          failCount++;
        }
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        failCount++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n📊 Summary:\n');
    console.log(`   ✅ Successfully set: ${successCount}`);
    console.log(`   ⚠️  Already existed: ${existsCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log('');

    if (successCount > 0 || existsCount > 0) {
      console.log('🎉 Vercel configuration complete!\n');
      console.log('⚠️  IMPORTANT: You still need to add these API keys manually:\n');
      console.log('   Required:');
      console.log('   - REACT_APP_OPENAI_API_KEY (get from https://platform.openai.com/api-keys)\n');
      console.log('   Optional:');
      console.log('   - REACT_APP_DEEPGRAM_API_KEY (for voice features)');
      console.log('   - REACT_APP_ANTHROPIC_API_KEY (for Claude advisor)');
      console.log('   - REACT_APP_SENTRY_DSN (for error tracking)\n');
      console.log('Add these in Vercel Dashboard:');
      console.log(`https://vercel.com/settings/environment-variables?projectId=${projectId}\n`);
      console.log('After adding API keys, redeploy your project:\n');
      console.log('   git push origin main\n');
      console.log('   Or use: vercel --prod\n');
    } else {
      console.log('⚠️  No variables were set. Please check Vercel token and project access.\n');
    }

  } catch (error) {
    console.error('\n❌ Configuration failed:', error.message);
    console.error('\nPlease check:');
    console.error('1. Vercel token is valid');
    console.error('2. You have access to the project');
    console.error('3. Project name is correct\n');
    process.exit(1);
  }
}

main();
