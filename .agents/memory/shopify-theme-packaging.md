---
name: Shopify theme zip packaging
description: Why "'X' is not a valid section type" can be a packaging problem, not a code problem
---

**Rule:** A Shopify theme zip must have `assets/`, `config/`, `layout/`, `locales/`, `sections/`, `snippets/`, `templates/` at the zip ROOT. Always build with the root `build:theme` script (`pnpm run build:theme`), never `zip -r out.zip themedir/` from the workspace root — that nests everything one level down and Shopify silently drops all files.

**Why:** The error "Error in tag 'section' - 'header' is not a valid section type" cost multiple debugging rounds (schema edits, filter removal, filename byte checks) when the Liquid was valid all along — Theme Check passed with 0 errors. The uploaded zip was nested, so Shopify's copy had no sections at all where expected.

**How to apply:** When Shopify says a section/snippet "is not valid" or "does not exist" but the file is present and Theme Check passes, inspect the zip structure first (`unzip -l`). Also note: each zip upload creates a NEW theme in the Shopify library; static layout section settings live in `settings_data.json` under `current.sections.<name>` (not top-level theme settings), and IDs must not be duplicated in `settings_schema.json`.
