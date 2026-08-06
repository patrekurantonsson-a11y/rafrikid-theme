---
name: GitHub push via connector
description: gitPush callback fails NO_CREDENTIALS when user has API integration but not source-control connection; use Git Data API script instead
---

`gitPush({ branch })` requires a **source-control** credential (connected via the Git pane), which is separate from the GitHub **API integration** (connected via Integrations panel). If the user has the API integration but not source-control:

**Fix:** use `scripts/github-push.mjs` which calls the GitHub Git Data API via `@replit/connectors-sdk`.

**Key quirk:** empty repos return HTTP 409 (not 404) for `GET /repos/{owner}/{repo}/git/ref/heads/main`. Bootstrap with the Contents API (`PUT /contents/README.md`) before using the Git Data API.

**Why:** Replit has two separate GitHub auth systems — source-control (for git CLI push/pull) and the connector proxy (for API calls). They use different OAuth scopes and credential stores.

**How to apply:** When gitPush returns `NO_CREDENTIALS`, check if a GitHub integration connection is added. If yes, run `node scripts/github-push.mjs` via ShellExec to push via API.
