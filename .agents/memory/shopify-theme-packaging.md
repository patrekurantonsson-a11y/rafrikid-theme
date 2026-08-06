---
name: Shopify theme gotchas
description: Server-only schema validation rules and zip packaging pitfalls that surface as "'X' is not a valid section type"
---

**Rule 1 — no empty-string schema defaults:** Shopify's server rejects any section schema setting with `"default": ""` (FileSaveError: "default can't be blank"). The file then silently never saves, so `{% section 'x' %}` throws "'x' is not a valid section type" — on zip upload AND GitHub sync alike. For optional settings, OMIT the `default` key. **Local theme-check, JSON validation, and valid Liquid all pass this — only Shopify's server enforces it.** Guard: `pnpm run check:theme` (scripts/check-theme-schemas.mjs) scans all schema blocks; wired into typecheck and build:theme.

**Rule 2 — zip layout:** theme dirs (`assets/ config/ layout/ ...`) must sit at zip ROOT; build with `pnpm run build:theme` (deletes stale zip first — `zip -r` on an existing archive keeps deleted files).

**Why:** The header debugging cost many rounds chasing packaging/sync/branch theories when the true cause was `"default": ""` on one setting. Shopify's storefront error message never mentions the schema; the real error only appears in the Shopify code editor when saving the file manually.

**How to apply:** When Shopify says a section "is not valid" but the file exists locally and theme-check passes: (1) run check:theme, (2) try pasting the file into Shopify's code editor — its save error reveals the server-side objection. Also: `link.active` is not a Shopify link property — use `link.current` / `link.child_active`. Static layout section settings live in `settings_data.json` under `current.sections.<name>`, and each zip upload creates a NEW theme in the library.
