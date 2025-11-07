# Verify Your Mac Mini Setup

After following the setup instructions in **MAC_MINI_SETUP.md**, use this guide to verify everything is working correctly.

## 🚀 Quick Verification

### Option 1: Automated Verification Script (Recommended)

Run this on your Mac Mini from the project directory:

```bash
cd ~/elite-ai-advisory
node scripts/verify-mac-setup.js
```

**What it checks:**
- ✓ All required tools installed (Node.js, Git, etc.)
- ✓ Project dependencies installed
- ✓ Environment variables configured
- ✓ Git configuration correct
- ✓ Authentication to GitHub and Vercel
- ✓ Type checking passes

**Sample output:**
```
✓ Node.js: v22.21.1 ✓ Correct version
✓ npm: v10.9.4
✓ Git: git version 2.43.0
✓ GitHub CLI: Authenticated ✓
✓ Vercel CLI: Authenticated as yourname
✓ .env.local exists
✓ REACT_APP_SUPABASE_URL configured
```

### Option 2: Bash Verification Script

For a more detailed check with color output:

```bash
cd ~/elite-ai-advisory
chmod +x scripts/verify-mac-setup.sh
bash scripts/verify-mac-setup.sh
```

### Option 3: Manual Verification Checklist

If you prefer to check manually, use the checklist below.

---

## ✅ Manual Verification Checklist

### 1. System Tools

Open Terminal on your Mac Mini and run each command:

```bash
# Check Node.js (should show v22.x.x)
node --version

# Check npm (should show 10.x.x)
npm --version

# Check Git
git --version

# Check Homebrew
brew --version

# Check GitHub CLI
gh --version
gh auth status

# Check Vercel CLI
vercel --version
vercel whoami
```

**Expected results:**
- ✓ Node.js: v22.x.x
- ✓ npm: 10.x.x
- ✓ Git: 2.x.x
- ✓ Homebrew: 4.x.x
- ✓ GitHub CLI authenticated
- ✓ Vercel CLI authenticated

---

### 2. Project Setup

```bash
# Navigate to project
cd ~/elite-ai-advisory

# Check if dependencies are installed
ls node_modules | wc -l
# Should show a large number (1000+)

# Check if .env.local exists
ls -la .env.local
# Should show the file

# View environment variables (check they're not empty)
cat .env.local | grep REACT_APP_SUPABASE_URL
cat .env.local | grep REACT_APP_OPENAI_API_KEY
```

**Expected results:**
- ✓ node_modules directory exists with packages
- ✓ .env.local file exists
- ✓ Environment variables are configured (not empty)

---

### 3. Git Configuration

```bash
# Check git identity
git config user.name
git config user.email

# Check current branch
git branch --show-current

# Check git status
git status

# Test GitHub connection
git ls-remote origin
```

**Expected results:**
- ✓ Git user.name configured
- ✓ Git user.email configured
- ✓ Can connect to GitHub remote

---

### 4. Project Tests

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests
npm test -- --watchAll=false

# Try starting dev server
npm start
# Should open browser to http://localhost:3000
# Press Ctrl+C to stop
```

**Expected results:**
- ✓ Type checking passes (or shows specific errors to fix)
- ✓ Linting passes
- ✓ Tests pass
- ✓ Dev server starts without errors

---

### 5. Test Git Sync (Multi-Machine Workflow)

This is the most important test to ensure you can work across machines:

**On Mac Mini:**
```bash
# Make a small test change
echo "# Test from Mac Mini" >> test.md

# Commit and push
git add test.md
git commit -m "test: Verify Mac Mini can push to GitHub"
git push origin main

# Clean up test file
git rm test.md
git commit -m "test: Remove test file"
git push origin main
```

**Expected results:**
- ✓ Can commit changes
- ✓ Can push to GitHub
- ✓ No authentication errors

---

## 🎯 Feature-Specific Verification

### Test Authentication (Supabase)

```bash
# Start dev server
npm start

# In browser (http://localhost:3000):
# 1. Click "Sign Up"
# 2. Enter test email and password
# 3. Check if you can sign up successfully
# 4. Try logging out and logging back in
```

### Test Document Upload (OpenAI)

```bash
# Make sure REACT_APP_OPENAI_API_KEY is set in .env.local
grep REACT_APP_OPENAI_API_KEY .env.local

# Start server and test:
# 1. Login
# 2. Go to Advisory Chat
# 3. Try uploading a PDF or document
# 4. Check if it processes successfully
```

### Test Pitch Practice (Deepgram)

```bash
# Check if Deepgram key is set (optional)
grep REACT_APP_DEEPGRAM_API_KEY .env.local

# Test in browser:
# 1. Login
# 2. Go to Pitch Practice
# 3. Try recording audio
# 4. Check if transcription works
```

---

## 📊 Verification Report

After running the verification script, you should see a summary like this:

```
================================================
📊 Verification Summary
================================================
Passed:   25
Warnings: 2
Failed:   0

🎉 Perfect! Your Mac Mini is fully set up!

You can now:
  • Start dev server:  npm start
  • Run tests:         npm test
  • Run verification:  npm run verify
  • Deploy:            vercel --prod
```

---

## 🐛 Common Issues & Solutions

### "node: command not found"

**Solution:**
```bash
# Reload shell configuration
source ~/.zshrc  # or source ~/.bash_profile

# Or install Node via nvm
nvm install 22
nvm use 22
```

### "permission denied" when running npm

**Never use sudo with npm!**

**Solution:**
```bash
# Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
```

### "Cannot find module" errors

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Git push fails with authentication error

**Solution:**
```bash
# Re-authenticate with GitHub
gh auth login

# Or set up SSH keys (recommended)
# Follow: https://docs.github.com/en/authentication/connecting-to-github-with-ssh
```

### Type check fails

**Solution:**
```bash
# Run type check to see specific errors
npm run type-check

# Usually these are pre-existing and don't block development
# You can continue working and fix gradually
```

### Port 3000 already in use

**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm start
```

---

## 🎉 Success Criteria

Your Mac Mini is ready when:

- ✅ All verification scripts pass
- ✅ `npm start` launches the app without errors
- ✅ Can login/signup with test account
- ✅ Can make code changes and see them update
- ✅ Can commit and push to GitHub
- ✅ Can pull changes from MacBook Pro

---

## 📤 Share Results for Verification

If you want me to verify your setup, run this and share the output:

```bash
node scripts/verify-mac-setup.js > setup-verification.txt
cat setup-verification.txt
```

Then copy and paste the output to me, and I can confirm everything is set up correctly!

---

## 🔄 Next Steps

Once verification passes:

1. **Test the sync workflow:**
   - Make a change on MacBook Pro → commit → push
   - Pull on Mac Mini → verify change appears
   - Make a change on Mac Mini → commit → push
   - Pull on MacBook Pro → verify change appears

2. **Start developing:**
   - Run `npm start` to begin development
   - Make changes and see hot reload
   - Use `npm run verify` before committing

3. **Set up VS Code sync** (optional):
   - Sign in with GitHub in VS Code
   - Enable Settings Sync
   - Your extensions and settings sync across machines

---

**Need help?** Run the verification script and share the output!
