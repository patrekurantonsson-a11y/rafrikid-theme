#!/bin/bash
# Install git hooks for this repo.
# Run this once after cloning, or it runs automatically via post-merge.sh.

HOOKS_DIR="$(git rev-parse --git-dir)/hooks"

cat > "$HOOKS_DIR/post-commit" << 'EOF'
#!/bin/bash
# Auto-push to GitHub after every commit.
REPO_ROOT="$(git rev-parse --show-toplevel)"
echo ""
echo "▸ Auto-pushing to GitHub…"
node "$REPO_ROOT/scripts/github-push.mjs" 2>&1
EOF

chmod +x "$HOOKS_DIR/post-commit"
echo "✓ post-commit hook installed"
