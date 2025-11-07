#!/usr/bin/env node

/**
 * Mac Mini Setup Verification Script (Node.js version)
 * Run: node scripts/verify-mac-setup.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

let passed = 0;
let failed = 0;
let warnings = 0;

function pass(msg) {
  console.log(`${GREEN}✓${RESET} ${msg}`);
  passed++;
}

function fail(msg) {
  console.log(`${RED}✗${RESET} ${msg}`);
  failed++;
}

function warn(msg) {
  console.log(`${YELLOW}⚠${RESET} ${msg}`);
  warnings++;
}

function info(msg) {
  console.log(`${BLUE}ℹ${RESET} ${msg}`);
}

function exec(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: 'pipe' }).trim();
  } catch (error) {
    return null;
  }
}

function checkCommand(cmd, name) {
  const result = exec(`which ${cmd}`);
  return result !== null;
}

console.log('\n================================================');
console.log('🔍 Mac Mini Development Environment Verification');
console.log('================================================\n');

// System Information
console.log('💻 System Information...');
console.log('----------------------------');
const osType = exec('uname -s');
const osVersion = exec('sw_vers -productVersion') || exec('uname -r');
const hostname = exec('hostname');
info(`Operating System: ${osType} ${osVersion}`);
info(`Hostname: ${hostname}`);
console.log();

// Check Tools
console.log('📦 Checking Development Tools...');
console.log('----------------------------');

// Homebrew
if (checkCommand('brew', 'Homebrew')) {
  const brewVersion = exec('brew --version')?.split('\n')[0];
  pass(`Homebrew: ${brewVersion}`);
} else {
  fail('Homebrew not installed');
}

// Node.js
if (checkCommand('node', 'Node.js')) {
  const nodeVersion = exec('node --version');
  if (nodeVersion?.startsWith('v22')) {
    pass(`Node.js: ${nodeVersion} ✓ Correct version`);
  } else {
    warn(`Node.js: ${nodeVersion} (expected v22.x)`);
  }
} else {
  fail('Node.js not installed');
}

// npm
if (checkCommand('npm', 'npm')) {
  const npmVersion = exec('npm --version');
  pass(`npm: v${npmVersion}`);
} else {
  fail('npm not installed');
}

// Git
if (checkCommand('git', 'Git')) {
  const gitVersion = exec('git --version');
  pass(`Git: ${gitVersion}`);
} else {
  fail('Git not installed');
}

// GitHub CLI
if (checkCommand('gh', 'GitHub CLI')) {
  const ghVersion = exec('gh --version')?.split('\n')[0];
  pass(`GitHub CLI: ${ghVersion}`);

  const ghAuth = exec('gh auth status 2>&1');
  if (ghAuth?.includes('Logged in')) {
    pass('GitHub CLI: Authenticated ✓');
  } else {
    warn('GitHub CLI: Not authenticated (run: gh auth login)');
  }
} else {
  warn('GitHub CLI not installed (recommended)');
}

// Vercel CLI
if (checkCommand('vercel', 'Vercel CLI')) {
  const vercelVersion = exec('vercel --version');
  pass(`Vercel CLI: ${vercelVersion}`);

  const vercelUser = exec('vercel whoami 2>&1');
  if (vercelUser && !vercelUser.includes('Error')) {
    pass(`Vercel CLI: Authenticated as ${vercelUser}`);
  } else {
    warn('Vercel CLI: Not authenticated (run: vercel login)');
  }
} else {
  warn('Vercel CLI not installed (recommended for deployments)');
}

console.log();

// Check Project Setup
console.log('📁 Checking Project Setup...');
console.log('----------------------------');

const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  pass('package.json found (in project directory)');

  // Check node_modules
  if (fs.existsSync(path.join(process.cwd(), 'node_modules'))) {
    pass('node_modules exists (dependencies installed)');
  } else {
    fail('node_modules missing (run: npm install)');
  }

  // Check .env.local
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    pass('.env.local exists');

    const envContent = fs.readFileSync(envPath, 'utf8');

    // Check required variables
    const requiredVars = [
      'REACT_APP_SUPABASE_URL',
      'REACT_APP_SUPABASE_ANON_KEY',
      'REACT_APP_OPENAI_API_KEY'
    ];

    requiredVars.forEach(varName => {
      if (envContent.includes(varName) && !envContent.includes(`${varName}=\n`)) {
        pass(`${varName} configured`);
      } else {
        if (varName === 'REACT_APP_OPENAI_API_KEY') {
          warn(`${varName} missing (required for AI features)`);
        } else {
          fail(`${varName} missing or empty`);
        }
      }
    });

    // Check optional variables
    const optionalVars = [
      'REACT_APP_DEEPGRAM_API_KEY',
      'REACT_APP_ANTHROPIC_API_KEY'
    ];

    optionalVars.forEach(varName => {
      if (envContent.includes(varName) && !envContent.includes(`${varName}=\n`)) {
        pass(`${varName} configured (optional)`);
      } else {
        info(`${varName} not configured (optional)`);
      }
    });

  } else {
    fail('.env.local not found (copy from .env.local.template)');
  }

} else {
  fail('package.json not found - not in project directory?');
  console.log('\nPlease run this script from the elite-ai-advisory directory:');
  console.log('  cd ~/elite-ai-advisory');
  console.log('  node scripts/verify-mac-setup.js');
  process.exit(1);
}

console.log();

// Check Git Configuration
console.log('🔗 Checking Git Configuration...');
console.log('----------------------------');

const gitUser = exec('git config user.name');
const gitEmail = exec('git config user.email');

if (gitUser) {
  pass(`Git user.name: ${gitUser}`);
} else {
  warn('Git user.name not set (run: git config --global user.name "Your Name")');
}

if (gitEmail) {
  pass(`Git user.email: ${gitEmail}`);
} else {
  warn('Git user.email not set (run: git config --global user.email "your@email.com")');
}

const currentBranch = exec('git branch --show-current');
if (currentBranch) {
  info(`Current branch: ${currentBranch}`);
}

const gitStatus = exec('git status --porcelain');
if (!gitStatus) {
  pass('Working directory clean');
} else {
  info('Working directory has uncommitted changes');
}

const gitRemote = exec('git ls-remote origin HEAD 2>&1');
if (gitRemote && !gitRemote.includes('fatal')) {
  pass('Can connect to GitHub remote');
} else {
  fail('Cannot connect to GitHub remote');
}

console.log();

// Test npm scripts
console.log('🧪 Testing Project Scripts...');
console.log('----------------------------');

try {
  execSync('npm run type-check', { stdio: 'pipe' });
  pass('Type checking passes (npm run type-check)');
} catch (error) {
  warn('Type checking has errors (run: npm run type-check to see details)');
}

console.log();

// Summary
console.log('================================================');
console.log('📊 Verification Summary');
console.log('================================================');
console.log(`${GREEN}Passed:${RESET}   ${passed}`);
console.log(`${YELLOW}Warnings:${RESET} ${warnings}`);
console.log(`${RED}Failed:${RESET}   ${failed}`);
console.log();

if (failed === 0 && warnings === 0) {
  console.log(`${GREEN}🎉 Perfect! Your Mac Mini is fully set up!${RESET}\n`);
  console.log('You can now:');
  console.log('  • Start dev server:  npm start');
  console.log('  • Run tests:         npm test');
  console.log('  • Run verification:  npm run verify');
  console.log('  • Deploy:            vercel --prod');
  console.log();
} else if (failed === 0) {
  console.log(`${GREEN}✓ Your Mac Mini is ready for development!${RESET}\n`);
  console.log('Minor warnings above are optional tools or features.');
  console.log('You can start developing immediately!');
  console.log();
} else if (failed < 3) {
  console.log(`${YELLOW}⚠️  Almost there! Fix the ${failed} failed item(s) above.${RESET}\n`);
  console.log('Review MAC_MINI_SETUP.md for detailed instructions.');
  console.log();
  process.exit(1);
} else {
  console.log(`${RED}❌ Setup incomplete. Please resolve the issues above.${RESET}\n`);
  console.log('Review MAC_MINI_SETUP.md for step-by-step setup instructions.');
  console.log();
  process.exit(1);
}

// Print system summary for sharing
console.log('================================================');
console.log('📋 System Summary (for verification)');
console.log('================================================');
console.log(`OS: ${osType} ${osVersion}`);
console.log(`Node: ${exec('node --version') || 'not installed'}`);
console.log(`npm: v${exec('npm --version') || 'not installed'}`);
console.log(`Git: ${exec('git --version') || 'not installed'}`);
console.log(`GitHub CLI: ${checkCommand('gh') ? '✓' : '✗'}`);
console.log(`Vercel CLI: ${checkCommand('vercel') ? '✓' : '✗'}`);
console.log(`Project: ${fs.existsSync(packageJsonPath) ? '✓' : '✗'}`);
console.log(`Dependencies: ${fs.existsSync('node_modules') ? '✓' : '✗'}`);
console.log(`Environment: ${fs.existsSync('.env.local') ? '✓' : '✗'}`);
console.log('================================================\n');
