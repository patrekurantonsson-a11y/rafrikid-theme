---
name: Post-commit auto-push hook stalls rebases
description: Why platform rebase/reconcile steps time out in this repo and how to fix it
---
The repo had a `.git/hooks/post-commit` hook that runs `scripts/github-push.mjs` (full-workspace GitHub API push) after every commit. During task-completion rebases, every picked commit triggered this slow, rate-limit-prone push, making `git rebase` exceed the platform timeout repeatedly.

**Why:** GitHub API pushes of ~250 files can take minutes and exhaust the 5000/hr rate limit; hooks run on every rebase pick.

**How to apply:** If rebase/reconcile steps time out with the work tree clean and "all conflicts fixed", check `.git/hooks/` for slow hooks. Hook is currently disabled at `.git/hooks/post-commit.disabled`; re-enable only if the merchant wants auto-push, and keep it out of rebase paths.
