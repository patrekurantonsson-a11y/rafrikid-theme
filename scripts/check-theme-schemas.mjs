#!/usr/bin/env node
/*
 * Guard: Shopify's server rejects any schema setting with "default": ""
 * (empty-string default). Local theme-check and JSON validation do NOT
 * catch this — the file silently fails to save on Shopify's side, which
 * surfaces as "'<name>' is not a valid section type".
 *
 * Scans every {% schema %} block in sections/ and snippets/ and fails
 * if any setting (top-level or block-level) has an empty-string default.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const THEME_DIR = "rafrikid-theme";
const errors = [];

for (const sub of ["sections", "snippets"]) {
  const dir = join(THEME_DIR, sub);
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir).filter(f => f.endsWith(".liquid"))) {
    const path = join(dir, file);
    const src = readFileSync(path, "utf8");
    const m = src.match(/{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}/);
    if (!m) continue;
    let schema;
    try {
      schema = JSON.parse(m[1]);
    } catch (e) {
      errors.push(`${path}: schema block is not valid JSON (${e.message})`);
      continue;
    }
    const checkSettings = (settings, ctx) => {
      for (const s of settings ?? []) {
        if (Object.prototype.hasOwnProperty.call(s, "default") && s.default === "") {
          errors.push(`${path}: ${ctx} setting id="${s.id}" has "default": "" — omit the default key instead (Shopify rejects empty-string defaults)`);
        }
      }
    };
    checkSettings(schema.settings, "schema");
    for (const b of schema.blocks ?? []) checkSettings(b.settings, `block "${b.type}"`);
  }
}

if (errors.length) {
  console.error("Theme schema check FAILED:\n" + errors.map(e => "  - " + e).join("\n"));
  process.exit(1);
}
console.log("Theme schema check passed: no empty-string defaults.");
