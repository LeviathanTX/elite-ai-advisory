#!/bin/bash
echo "=========================================="
echo "🤖 AI-BoD Project Orientation"
echo "=========================================="
echo ""
echo "📍 Current Branch:"
git branch --show-current
echo ""
echo "📝 Recent Commits (last 5):"
git log -5 --oneline
echo ""
echo "📂 Working Directory Status:"
git status -s
if [ -z "$(git status -s)" ]; then
    echo "   (clean)"
fi
echo ""
echo "=========================================="
echo "📋 Next Steps:"
echo "   1. Review CLAUDE.md 'Current State' section"
echo "   2. Check SESSION_LOG.md for context"
echo "   3. Update Current State when session ends"
echo "=========================================="
