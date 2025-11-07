# Mac Mini Development Setup Guide

## Quick Start Checklist

Use this checklist to set up your Mac Mini for development on the Elite AI Advisory project.

### Prerequisites Installation
- [ ] Install Homebrew
- [ ] Install Node.js (v22.x) via nvm
- [ ] Install Git
- [ ] Install GitHub CLI (gh)
- [ ] Install Vercel CLI
- [ ] Install VS Code or your preferred editor

### Project Setup
- [ ] Clone repository from GitHub
- [ ] Copy `.env.local.template` to `.env.local`
- [ ] Add all API keys to `.env.local`
- [ ] Run `npm install`
- [ ] Run Supabase setup script
- [ ] Test local development server

### Verification
- [ ] `npm start` works (app loads on localhost:3000)
- [ ] `npm test` passes
- [ ] `npm run type-check` passes
- [ ] `npm run verify` passes
- [ ] Can login/signup with test account
- [ ] Can push commits to GitHub

---

## Detailed Installation Steps

### 1. Install Homebrew (macOS Package Manager)

Open Terminal and run:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**After installation**, follow the "Next steps" instructions to add Homebrew to your PATH.

Verify:
```bash
brew --version
```

### 2. Install Node.js via nvm

```bash
# Install nvm (Node Version Manager)
brew install nvm

# Create nvm directory
mkdir ~/.nvm

# Add nvm to your shell profile (~/.zshrc or ~/.bash_profile)
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo '[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"' >> ~/.zshrc
echo '[ -s "/opt/homebrew/opt/nvm/etc/bash_completion.d/nvm" ] && \. "/opt/homebrew/opt/nvm/etc/bash_completion.d/nvm"' >> ~/.zshrc

# Reload shell configuration
source ~/.zshrc

# Install Node.js v22 (same version as your MacBook Pro)
nvm install 22
nvm use 22
nvm alias default 22
```

Verify:
```bash
node --version  # Should show v22.x.x
npm --version   # Should show 10.x.x
```

### 3. Install Git

Git may already be installed on macOS. Check first:
```bash
git --version
```

If not installed:
```bash
brew install git

# Configure git with your identity
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 4. Install GitHub CLI

```bash
brew install gh

# Authenticate with GitHub
gh auth login
# Choose:
# - GitHub.com
# - HTTPS
# - Login with a web browser
```

### 5. Install Vercel CLI

```bash
npm install -g vercel

# Authenticate with Vercel
vercel login
# Follow the browser authentication flow
```

### 6. Install Code Editor (Optional)

If you don't have VS Code:
```bash
brew install --cask visual-studio-code
```

Or use your preferred editor:
- Cursor: `brew install --cask cursor`
- Sublime Text: `brew install --cask sublime-text`
- WebStorm: Download from JetBrains

---

## Clone and Setup Project

### 1. Clone Repository

```bash
# Navigate to your preferred projects directory
cd ~/  # or cd ~/Projects, etc.

# Clone the repository
git clone https://github.com/LeviathanTX/elite-ai-advisory.git
cd elite-ai-advisory

# Check current branch
git branch
```

### 2. Install Dependencies

```bash
# Install all npm packages
npm install

# This will also run postinstall script to copy PDF worker
```

### 3. Configure Environment Variables

```bash
# Copy the template
cp .env.local.template .env.local

# Edit with your actual credentials
code .env.local  # or nano .env.local
```

**Required variables** (copy from your MacBook Pro's `.env.local`):
```env
REACT_APP_SUPABASE_URL=https://tgzqffemrymlyioguflb.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
REACT_APP_OPENAI_API_KEY=your_openai_key_here

# Optional but recommended
REACT_APP_DEEPGRAM_API_KEY=your_deepgram_key_here
REACT_APP_ANTHROPIC_API_KEY=your_anthropic_key_here

# Development setting
REACT_APP_BYPASS_AUTH=false
```

### 4. Run Setup Scripts

```bash
# Verify Supabase database is configured
node scripts/run-on-mac-setup.js

# If you plan to deploy from Mac Mini
node scripts/configure-vercel.js
```

### 5. Test Local Development

```bash
# Start development server
npm start
# App should open at http://localhost:3000

# In a new terminal tab, run tests
npm test

# Check for type errors
npm run type-check

# Run full verification suite
npm run verify
```

---

## Multi-Machine Git Workflow

### Starting Work on Mac Mini

```bash
# 1. Pull latest changes
cd ~/elite-ai-advisory
git pull origin main

# 2. Install any new dependencies (if package.json changed)
npm install

# 3. Start development
npm start
```

### After Making Changes on Mac Mini

```bash
# 1. Check what changed
git status

# 2. Stage changes
git add .

# 3. Commit with descriptive message
git commit -m "feat: Add new feature X"

# 4. Push to GitHub
git push origin main
```

### Switching Back to MacBook Pro

```bash
# Simply pull the changes
cd ~/elite-ai-advisory
git pull origin main
npm install  # if needed
```

### Commit Message Conventions

Use these prefixes for clarity:
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `docs:` - Documentation changes
- `test:` - Test changes
- `chore:` - Build/config changes

Examples:
```bash
git commit -m "feat: Add document export functionality"
git commit -m "fix: Resolve login authentication issue"
git commit -m "refactor: Improve advisory chat performance"
```

---

## Working with Feature Branches

For larger features, use branches:

```bash
# Create and switch to new branch
git checkout -b feature/my-new-feature

# Make changes, commit
git add .
git commit -m "feat: Start implementing new feature"

# Push branch to GitHub
git push -u origin feature/my-new-feature

# When ready, create PR on GitHub
gh pr create --title "Add new feature" --body "Description of changes"

# After PR is merged, update main
git checkout main
git pull origin main

# Delete local feature branch
git branch -d feature/my-new-feature
```

---

## Troubleshooting

### Node Version Mismatch

If you see errors about Node version:
```bash
nvm use 22
# Or set it as default
nvm alias default 22
```

### Port Already in Use

If port 3000 is busy:
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm start
```

### Permission Errors with npm

Never use `sudo` with npm. If you see permission errors:
```bash
# Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
```

### Git Authentication Issues

If git push fails:
```bash
# Re-authenticate with GitHub CLI
gh auth login

# Or set up SSH keys (recommended)
ssh-keygen -t ed25519 -C "your.email@example.com"
# Follow GitHub's SSH key setup guide
```

### Supabase Connection Issues

If you can't connect to Supabase:
1. Verify `.env.local` has correct credentials
2. Check internet connection
3. Verify Supabase project is active at https://app.supabase.com

---

## Recommended Tools

### Essential
- **iTerm2**: Better terminal than default Terminal.app
  ```bash
  brew install --cask iterm2
  ```

- **Oh My Zsh**: Enhanced shell experience
  ```bash
  sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
  ```

### Optional but Useful
- **Postman**: API testing
  ```bash
  brew install --cask postman
  ```

- **Rectangle**: Window management
  ```bash
  brew install --cask rectangle
  ```

- **SourceTree**: Git GUI client
  ```bash
  brew install --cask sourcetree
  ```

---

## Performance Optimization

### Speed Up Development

1. **Use Fast DNS**
   ```bash
   # Add to /etc/hosts
   sudo nano /etc/hosts
   # Add: 127.0.0.1 localhost
   ```

2. **Increase File Watchers** (if needed)
   ```bash
   echo kern.maxfiles=65536 | sudo tee -a /etc/sysctl.conf
   echo kern.maxfilesperproc=65536 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -w kern.maxfiles=65536
   sudo sysctl -w kern.maxfilesperproc=65536
   ```

3. **Clear npm Cache** (if builds are slow)
   ```bash
   npm cache clean --force
   ```

---

## Quick Reference Commands

```bash
# Start development
npm start

# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Full verification
npm run verify

# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Git workflow
git pull          # Get latest changes
git status        # Check what changed
git add .         # Stage all changes
git commit -m ""  # Commit with message
git push          # Push to GitHub

# Branch management
git checkout -b feature/name  # Create branch
git checkout main             # Switch to main
git branch -d feature/name    # Delete branch
```

---

## Environment Variables Reference

Copy these from your MacBook Pro's `.env.local`:

```env
# Supabase (Required)
REACT_APP_SUPABASE_URL=
REACT_APP_SUPABASE_ANON_KEY=

# OpenAI (Required for AI features)
REACT_APP_OPENAI_API_KEY=

# Deepgram (Optional - for audio transcription)
REACT_APP_DEEPGRAM_API_KEY=

# Anthropic (Optional - for Claude AI features)
REACT_APP_ANTHROPIC_API_KEY=

# Sentry (Optional - for error tracking)
REACT_APP_SENTRY_DSN=

# Development Settings
REACT_APP_BYPASS_AUTH=false
```

---

## Next Steps After Setup

1. **Test all features locally**
   - Sign up with test account
   - Test document upload
   - Test advisory chat
   - Test pitch practice

2. **Make a test commit**
   - Change a comment or add a console.log
   - Commit and push
   - Verify it appears on GitHub

3. **Pull on MacBook Pro**
   - Test the git sync workflow
   - Ensure changes appear

4. **Set up VS Code sync** (optional)
   - Sign in with GitHub in VS Code
   - Enable Settings Sync
   - Your extensions and settings will sync across machines

---

## Support

If you run into issues:

1. Check this guide's Troubleshooting section
2. Review SETUP_ON_MAC.md for Supabase/Vercel setup
3. Check CLAUDE.md for project-specific guidelines
4. Ask for help with specific error messages

---

## Verification Checklist

After completing setup, verify:

- [ ] `node --version` shows v22.x.x
- [ ] `npm --version` shows 10.x.x
- [ ] `git --version` works
- [ ] `gh auth status` shows authenticated
- [ ] `vercel whoami` shows your account
- [ ] Project cloned and dependencies installed
- [ ] `.env.local` configured with all keys
- [ ] `npm start` launches app successfully
- [ ] `npm test` passes all tests
- [ ] `npm run verify` passes
- [ ] Can login with test account
- [ ] `git push` works (test with a small change)
- [ ] Changes sync between MacBook Pro and Mac Mini

---

**Setup Time Estimate: 30-45 minutes**

Once complete, you'll have a fully synchronized development environment across both machines!
