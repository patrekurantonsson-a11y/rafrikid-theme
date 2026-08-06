/**
 * Push workspace to GitHub and maintain a clean `shopify` branch
 * with theme files at the repo root (required by Shopify's GitHub integration).
 *
 * Usage: node scripts/github-push.mjs
 */
import { ReplitConnectors } from "@replit/connectors-sdk";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const REPO  = "rafrikid-theme";
const ROOT  = resolve(import.meta.dirname, "..");
const THEME_DIR = "rafrikid-theme"; // subfolder in workspace

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

// ── 1. Resolve owner ──────────────────────────────────────────────────────────
const { json: user } = await ghFetch("/user");
const owner = user.login;
console.log(`\n▸ Authenticated as: ${owner}`);

// ── 2. Ensure repo exists ─────────────────────────────────────────────────────
const { status: repoStatus, json: repoData } = await ghFetch(`/repos/${owner}/${REPO}`);
if (repoStatus === 404) {
  const { status, json } = await ghFetch("/user/repos", {
    method: "POST",
    body: JSON.stringify({
      name: REPO,
      description: "Rafríkið — Shopify Online Store 2.0 theme",
      private: false,
      auto_init: false
    })
  });
  if (status === 201) console.log(`▸ Repo created: ${json.full_name}`);
  else { console.error("Failed to create repo:", status, json); process.exit(1); }
} else {
  console.log(`▸ Repo exists: ${repoData.full_name}`);
}

// ── 3. Helper: bootstrap empty repo ──────────────────────────────────────────
async function ensureBootstrapped() {
  const { status } = await ghFetch(`/repos/${owner}/${REPO}/git/ref/heads/main`);
  if (status !== 200) {
    console.log("▸ Bootstrapping empty repo…");
    const { status: s, json: d } = await ghFetch(`/repos/${owner}/${REPO}/contents/README.md`, {
      method: "PUT",
      body: JSON.stringify({
        message: "chore: init",
        content: Buffer.from("# rafrikid-theme\nRafríkið Shopify OS2.0 theme").toString("base64")
      })
    });
    if (s !== 201) { console.error("Bootstrap failed:", s, d); process.exit(1); }
    console.log("▸ Bootstrapped");
  }
}

// ── 4. Helper: create blobs for a file list ───────────────────────────────────
async function createBlobs(files) {
  const blobs = [];
  let i = 0;
  for (const { repoPath, fsPath } of files) {
    i++;
    process.stdout.write(`\r  Creating blobs… ${i}/${files.length}  `);
    let buf;
    try { buf = readFileSync(fsPath); } catch { continue; }
    const { status, json } = await ghFetch(`/repos/${owner}/${REPO}/git/blobs`, {
      method: "POST",
      body: JSON.stringify({ content: buf.toString("base64"), encoding: "base64" })
    });
    if (status !== 201) { console.warn(`\n  ⚠ blob failed ${repoPath}: ${status}`); continue; }
    blobs.push({ path: repoPath, mode: "100644", type: "blob", sha: json.sha });
  }
  process.stdout.write("\n");
  return blobs;
}

// ── 5. Helper: commit a tree to a branch ─────────────────────────────────────
async function commitToBranch(branch, tree, message, { useBasTree = false } = {}) {
  // When useBasTree is true we merge ON TOP of the existing branch tree so
  // files we don't touch (e.g. settings_data.json saved by the theme editor)
  // are preserved instead of being wiped.
  let baseTreeSha;
  if (useBasTree) {
    const { status: refSt, json: refD } = await ghFetch(`/repos/${owner}/${REPO}/git/ref/heads/${branch}`);
    if (refSt === 200) {
      const { json: commitD } = await ghFetch(`/repos/${owner}/${REPO}/git/commits/${refD.object.sha}`);
      baseTreeSha = commitD.tree?.sha;
    }
  }

  const treeBody = baseTreeSha ? { base_tree: baseTreeSha, tree } : { tree };
  const { status: treeStatus, json: treeData } = await ghFetch(`/repos/${owner}/${REPO}/git/trees`, {
    method: "POST",
    body: JSON.stringify(treeBody)
  });
  if (treeStatus !== 201) { console.error(`Tree failed (${branch}):`, treeStatus, treeData); process.exit(1); }

  const { status: refStatus, json: refData } = await ghFetch(`/repos/${owner}/${REPO}/git/ref/heads/${branch}`);
  const parents = refStatus === 200 ? [refData.object.sha] : [];

  const { status: commitStatus, json: commitData } = await ghFetch(`/repos/${owner}/${REPO}/git/commits`, {
    method: "POST",
    body: JSON.stringify({ message, tree: treeData.sha, parents })
  });
  if (commitStatus !== 201) { console.error(`Commit failed (${branch}):`, commitStatus, commitData); process.exit(1); }

  if (parents.length > 0) {
    const { status, json } = await ghFetch(`/repos/${owner}/${REPO}/git/refs/heads/${branch}`, {
      method: "PATCH",
      body: JSON.stringify({ sha: commitData.sha, force: true })
    });
    if (status !== 200) { console.error(`Ref update failed (${branch}):`, status, json); process.exit(1); }
  } else {
    const { status, json } = await ghFetch(`/repos/${owner}/${REPO}/git/refs`, {
      method: "POST",
      body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: commitData.sha })
    });
    if (status !== 201) { console.error(`Ref create failed (${branch}):`, status, json); process.exit(1); }
  }

  console.log(`▸ ${branch} → ${commitData.sha.slice(0, 7)}`);
}

// ── 6. Bootstrap then gather tracked files ────────────────────────────────────
await ensureBootstrapped();

const tracked = execSync("git ls-files", { cwd: ROOT })
  .toString().trim().split("\n").filter(Boolean);

// All tracked files → main branch (full workspace)
const allFiles = tracked.map(p => ({ repoPath: p, fsPath: resolve(ROOT, p) }));

// Only theme files → shopify branch, with rafrikid-theme/ prefix stripped.
// We deliberately EXCLUDE files that Shopify writes back when the merchant
// saves in the theme editor — pushing those would wipe their customisations.
//   config/settings_data.json  — stores all theme-editor values
//   templates/*.json           — stores section layout & settings per template
// These are preserved via base_tree (we merge, not replace).
const THEME_DIRS = ["assets", "config", "layout", "locales", "sections", "snippets", "templates"];
const EDITOR_MANAGED = [
  "config/settings_data.json",
  // any templates/<name>.json (but keep templates/*.liquid)
];
const themeFiles = tracked
  .filter(p => p.startsWith(THEME_DIR + "/"))
  .filter(p => THEME_DIRS.includes(p.slice(THEME_DIR.length + 1).split("/")[0]))
  .map(p => ({
    repoPath: p.slice(THEME_DIR.length + 1), // strip "rafrikid-theme/"
    fsPath:   resolve(ROOT, p)
  }))
  .filter(({ repoPath }) => {
    // Exclude settings_data.json
    if (EDITOR_MANAGED.includes(repoPath)) return false;
    // Exclude templates/*.json (but allow templates/*.liquid)
    if (repoPath.startsWith("templates/") && repoPath.endsWith(".json")) return false;
    return true;
  });

console.log(`▸ main branch: ${allFiles.length} files`);
console.log(`▸ shopify branch: ${themeFiles.length} theme files (root-level)`);

// ── 7. Resolve commit message from local git history ─────────────────────────
let latestMessage;
try {
  latestMessage = execSync("git log -1 --pretty=%B", { cwd: ROOT }).toString().trim();
} catch {
  latestMessage = "Rafríkið theme — push from Replit";
}

// ── 8. Push main branch ───────────────────────────────────────────────────────
console.log("\n── main branch ──────────────────────────────────────────────────");
const mainBlobs = await createBlobs(allFiles);
console.log(`▸ Blobs: ${mainBlobs.length}`);
await commitToBranch("main", mainBlobs, latestMessage);

// ── 9. Push shopify branch ────────────────────────────────────────────────────
console.log("\n── shopify branch (Shopify import target) ───────────────────────");
const shopifyBlobs = await createBlobs(themeFiles);
console.log(`▸ Blobs: ${shopifyBlobs.length}`);
await commitToBranch("shopify", shopifyBlobs, latestMessage, { useBasTree: true });

console.log(`\n✓ Done!`);
console.log(`  main    → https://github.com/${owner}/${REPO}/tree/main`);
console.log(`  shopify → https://github.com/${owner}/${REPO}/tree/shopify`);
console.log(`\n  In Shopify: connect GitHub → ${owner}/${REPO} → branch: shopify\n`);
