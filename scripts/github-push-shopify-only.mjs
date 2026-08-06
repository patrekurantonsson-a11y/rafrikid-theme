/**
 * Push only the rafrikid-theme/ files to the `shopify` branch.
 * Theme files land at the repo ROOT (required by Shopify GitHub integration).
 *
 * Usage: node scripts/github-push-shopify-only.mjs
 */
import { ReplitConnectors } from "@replit/connectors-sdk";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const REPO      = "rafrikid-theme";
const ROOT      = resolve(import.meta.dirname, "..");
const THEME_DIR = "rafrikid-theme";

const connectors = new ReplitConnectors();

async function ghFetch(path, init = {}) {
  const res = await connectors.proxy("github", path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers || {}) }
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { status: res.status, json };
}

const { json: user } = await ghFetch("/user");
const owner = user.login;
console.log(`\n▸ Authenticated as: ${owner}`);

const { status: repoStatus, json: repoData } = await ghFetch(`/repos/${owner}/${REPO}`);
if (repoStatus !== 200) {
  console.error("Repo not found:", repoStatus, repoData);
  process.exit(1);
}
console.log(`▸ Repo: ${repoData.full_name}`);

// Gather theme files from git-tracked list
const tracked = execSync("git ls-files", { cwd: ROOT })
  .toString().trim().split("\n").filter(Boolean);

const themeFiles = tracked
  .filter(p => p.startsWith(THEME_DIR + "/"))
  .map(p => ({
    repoPath: p.slice(THEME_DIR.length + 1),
    fsPath:   resolve(ROOT, p)
  }));

console.log(`▸ Theme files to push: ${themeFiles.length}`);

// Create blobs
const blobs = [];
let i = 0;
for (const { repoPath, fsPath } of themeFiles) {
  i++;
  process.stdout.write(`\r  Uploading ${i}/${themeFiles.length}: ${repoPath}  `);
  let buf;
  try { buf = readFileSync(fsPath); } catch { console.warn(`\n  ⚠ read failed: ${fsPath}`); continue; }
  const { status, json } = await ghFetch(`/repos/${owner}/${REPO}/git/blobs`, {
    method: "POST",
    body: JSON.stringify({ content: buf.toString("base64"), encoding: "base64" })
  });
  if (status !== 201) { console.warn(`\n  ⚠ blob failed ${repoPath}: ${status}`); continue; }
  blobs.push({ path: repoPath, mode: "100644", type: "blob", sha: json.sha });
}
process.stdout.write("\n");
console.log(`▸ Blobs created: ${blobs.length}`);

// Create tree
const { status: treeStatus, json: treeData } = await ghFetch(`/repos/${owner}/${REPO}/git/trees`, {
  method: "POST",
  body: JSON.stringify({ tree: blobs })
});
if (treeStatus !== 201) { console.error("Tree failed:", treeStatus, treeData); process.exit(1); }

// Get current shopify branch HEAD
const { status: refStatus, json: refData } = await ghFetch(`/repos/${owner}/${REPO}/git/ref/heads/shopify`);
const parents = refStatus === 200 ? [refData.object.sha] : [];

let message = "fix: add missing footer/section locale keys to en.json";

// Commit
const { status: commitStatus, json: commitData } = await ghFetch(`/repos/${owner}/${REPO}/git/commits`, {
  method: "POST",
  body: JSON.stringify({ message, tree: treeData.sha, parents })
});
if (commitStatus !== 201) { console.error("Commit failed:", commitStatus, commitData); process.exit(1); }

// Update or create ref
if (parents.length > 0) {
  const { status, json } = await ghFetch(`/repos/${owner}/${REPO}/git/refs/heads/shopify`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commitData.sha, force: true })
  });
  if (status !== 200) { console.error("Ref update failed:", status, json); process.exit(1); }
} else {
  const { status, json } = await ghFetch(`/repos/${owner}/${REPO}/git/refs`, {
    method: "POST",
    body: JSON.stringify({ ref: "refs/heads/shopify", sha: commitData.sha })
  });
  if (status !== 201) { console.error("Ref create failed:", status, json); process.exit(1); }
}

console.log(`\n✓ shopify → ${commitData.sha.slice(0, 7)}`);
console.log(`  https://github.com/${owner}/${REPO}/tree/shopify`);
console.log(`\n  In Shopify admin: connect GitHub → ${owner}/${REPO} → branch: shopify\n`);
