# Workspace Optimization - Implementation Guide

## Overview

This guide walks you through implementing the workspace optimizations to reduce context loss between Claude sessions.

## Files to Copy

Copy these files from this package to your `ai-bod` project:

```bash
# From wherever you downloaded/extracted these files:
cp CLAUDE.md /Users/jeffl/vibe-workspace/ai-bod/CLAUDE.md
cp SESSION_LOG.md /Users/jeffl/vibe-workspace/ai-bod/SESSION_LOG.md
cp -r .claude /Users/jeffl/vibe-workspace/ai-bod/.claude
cp -r scripts /Users/jeffl/vibe-workspace/ai-bod/scripts

# Make the orient script executable
chmod +x /Users/jeffl/vibe-workspace/ai-bod/scripts/claude-orient.sh
```

## Package.json Updates

Add this script to your `package.json` scripts section:

```json
{
  "scripts": {
    "orient": "bash scripts/claude-orient.sh",
    // ... existing scripts
  }
}
```

## Docs Folder Reorganization

Move your documentation files into a cleaner structure:

```bash
cd /Users/jeffl/vibe-workspace/ai-bod

# Create subdirectories
mkdir -p docs/phases docs/guides docs/demos

# Move phase documentation
mv PHASE_1_TRIAL_SYSTEM_COMPLETED.md docs/phases/
mv PHASE_2_EMAIL_VERIFICATION_COMPLETED.md docs/phases/
mv PHASE_3_PASSWORD_RESET_COMPLETED.md docs/phases/

# Move guides
mv SUPABASE_EMAIL_VERIFICATION_SETUP.md docs/guides/
mv COMPLETE_AUTH_SYSTEM_TESTING_GUIDE.md docs/guides/
mv USER_GUIDE.md docs/guides/

# Move demo scripts
mv CAPITAL_FACTORY_DEMO.md docs/demos/
```

## First Session Workflow

After implementing these changes, your first session should:

1. **Run orientation:**
   ```bash
   npm run orient
   ```

2. **Update CLAUDE.md Current State:**
   Fill in the actual values for branch, last commit, etc.

3. **Commit the new structure:**
   ```bash
   git add .
   git commit -m "chore: add claude workspace optimization files"
   ```

## Session Start Checklist

Every time you start a Claude Code session:

1. ✅ Run `npm run orient` (or `git status && git log -3 --oneline`)
2. ✅ Review CLAUDE.md "Current State" section
3. ✅ Check SESSION_LOG.md for last session context
4. ✅ Tell Claude what you're working on

## Session End Checklist

Before ending a Claude Code session:

1. ✅ Ask Claude to update CLAUDE.md "Current State"
2. ✅ Ask Claude to add entry to SESSION_LOG.md
3. ✅ Commit any work in progress (or stash)

## Prompt Templates for Claude

### Session Start
```
Let's continue working on ai-bod. Run `npm run orient` first, then check 
CLAUDE.md and SESSION_LOG.md for context. [Describe what you want to work on]
```

### Session End
```
Before we wrap up, please:
1. Update the Current State section in CLAUDE.md with our current branch, 
   what we accomplished, and next steps
2. Add a session entry to SESSION_LOG.md
3. List any uncommitted changes I should commit
```

### Using Agents
```
Use the auth-specialist agent to help debug why password reset emails 
aren't being received.
```

## Troubleshooting

### Claude doesn't remember context
- Check that CLAUDE.md Current State was updated last session
- Verify SESSION_LOG.md has recent entries
- Run `npm run orient` and share output with Claude

### Agent not loading
- Agents are reference docs, not executable code
- Ask Claude to "read the [agent-name] agent file in .claude/agents/"

### Orient script not working
- Ensure script is executable: `chmod +x scripts/claude-orient.sh`
- Run directly: `bash scripts/claude-orient.sh`
