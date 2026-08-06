#!/usr/bin/env tsx
/**
 * sync-mpn-ean-tags.ts
 *
 * Mirrors MPN (custom.mpn) and EAN (custom.ean) metafields into Shopify
 * product tags so that Shopify's predictive search (/search/suggest.json)
 * can find products by part number or barcode.
 *
 * Tags are written in the format:  mpn:4016779   ean:5413736001023
 *
 * Usage:
 *   SHOPIFY_STORE=your-store.myshopify.com \
 *   SHOPIFY_ACCESS_TOKEN=shpat_xxx \
 *   pnpm --filter @workspace/scripts run sync-mpn-ean-tags
 *
 * Options:
 *   --dry-run     Preview changes without writing anything to Shopify
 *   --product-id  Sync a single product by GID, e.g.
 *                   --product-id gid://shopify/Product/123456789
 *
 * Required Admin API scopes:
 *   read_products, write_products
 *
 * API version: 2025-01 (GraphQL Admin API)
 */

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const API_VERSION = "2025-01";
const PAGE_SIZE = 50; // products per GraphQL page (max 250)
const REQUEST_DELAY_MS = 500; // conservative pause between pages to respect rate limits

// ---------------------------------------------------------------------------
// CLI flags
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const singleProductFlag = args.findIndex((a) => a === "--product-id");
const SINGLE_PRODUCT_ID: string | null =
  singleProductFlag !== -1 ? (args[singleProductFlag + 1] ?? null) : null;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProductMetafield {
  key: string;
  value: string;
}

interface ShopifyProduct {
  id: string;
  title: string;
  tags: string[];
  metafields: {
    edges: Array<{ node: ProductMetafield }>;
  };
}

interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

interface ProductsPage {
  products: {
    edges: Array<{ node: ShopifyProduct }>;
    pageInfo: PageInfo;
  };
}

interface SingleProductPage {
  product: ShopifyProduct | null;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string; locations?: unknown }>;
}

interface TagUpdateResponse {
  tagsAdd?: { node: { id: string }; userErrors: UserError[] };
  tagsRemove?: { node: { id: string }; userErrors: UserError[] };
}

interface UserError {
  field: string[];
  message: string;
}

// ---------------------------------------------------------------------------
// GraphQL helpers
// ---------------------------------------------------------------------------

const GRAPHQL_ENDPOINT = `https://${SHOPIFY_STORE}/admin/api/${API_VERSION}/graphql.json`;

async function gql<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN!,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  const json = (await res.json()) as GraphQLResponse<T>;

  if (json.errors?.length) {
    throw new Error(
      `GraphQL errors: ${json.errors.map((e) => e.message).join("; ")}`
    );
  }

  return json.data as T;
}

// ---------------------------------------------------------------------------
// Queries & mutations
// ---------------------------------------------------------------------------

const PRODUCTS_QUERY = /* graphql */ `
  query ProductsPage($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        node {
          id
          title
          tags
          metafields(first: 2, namespace: "custom", keys: ["mpn", "ean"]) {
            edges {
              node {
                key
                value
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const SINGLE_PRODUCT_QUERY = /* graphql */ `
  query SingleProduct($id: ID!) {
    product(id: $id) {
      id
      title
      tags
      metafields(first: 2, namespace: "custom", keys: ["mpn", "ean"]) {
        edges {
          node {
            key
            value
          }
        }
      }
    }
  }
`;

const TAGS_ADD_MUTATION = /* graphql */ `
  mutation TagsAdd($id: ID!, $tags: [String!]!) {
    tagsAdd(id: $id, tags: $tags) {
      node { id }
      userErrors { field message }
    }
  }
`;

const TAGS_REMOVE_MUTATION = /* graphql */ `
  mutation TagsRemove($id: ID!, $tags: [String!]!) {
    tagsRemove(id: $id, tags: $tags) {
      node { id }
      userErrors { field message }
    }
  }
`;

// ---------------------------------------------------------------------------
// Core logic
// ---------------------------------------------------------------------------

function buildTagsFromMetafields(metafields: ProductMetafield[]): string[] {
  const tags: string[] = [];
  for (const mf of metafields) {
    const value = mf.value.trim();
    if (!value) continue;
    if (mf.key === "mpn") tags.push(`mpn:${value}`);
    if (mf.key === "ean") tags.push(`ean:${value}`);
  }
  return tags;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface SyncResult {
  productId: string;
  title: string;
  added: string[];
  stale: string[];
  skipped: boolean;
}

/**
 * Compute and optionally apply tag changes for a single product.
 *
 * "Stale" tags are ones like `mpn:OLD` that no longer match the current
 * metafield value — they are removed to keep tags in sync.
 */
async function syncProduct(product: ShopifyProduct): Promise<SyncResult> {
  const metafields = product.metafields.edges.map((e) => e.node);
  const desiredTags = buildTagsFromMetafields(metafields);

  // Determine which desired tags are missing
  const existingTagSet = new Set(product.tags);
  const toAdd = desiredTags.filter((t) => !existingTagSet.has(t));

  // Find stale tags: existing tags with an mpn:/ean: prefix that are NOT in
  // the current desired set (e.g. the metafield value changed).
  const toRemove = product.tags.filter((t) => {
    const isManaged = t.startsWith("mpn:") || t.startsWith("ean:");
    return isManaged && !desiredTags.includes(t);
  });

  const nothingToDo = toAdd.length === 0 && toRemove.length === 0;

  const result: SyncResult = {
    productId: product.id,
    title: product.title,
    added: toAdd,
    stale: toRemove,
    skipped: nothingToDo,
  };

  if (nothingToDo) return result;

  if (!DRY_RUN) {
    if (toAdd.length > 0) {
      const data = await gql<TagUpdateResponse>(TAGS_ADD_MUTATION, {
        id: product.id,
        tags: toAdd,
      });
      const errors = data.tagsAdd?.userErrors ?? [];
      if (errors.length) {
        throw new Error(
          `tagsAdd failed for ${product.id}: ${errors.map((e) => e.message).join("; ")}`
        );
      }
    }

    if (toRemove.length > 0) {
      const data = await gql<TagUpdateResponse>(TAGS_REMOVE_MUTATION, {
        id: product.id,
        tags: toRemove,
      });
      const errors = data.tagsRemove?.userErrors ?? [];
      if (errors.length) {
        throw new Error(
          `tagsRemove failed for ${product.id}: ${errors.map((e) => e.message).join("; ")}`
        );
      }
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------

function logResult(result: SyncResult): void {
  if (result.skipped) {
    console.log(`  ✓ ${result.title} — already up to date`);
    return;
  }

  const prefix = DRY_RUN ? "[dry-run] " : "";
  if (result.added.length > 0) {
    console.log(
      `  ${prefix}+ ${result.title}: adding tags → ${result.added.join(", ")}`
    );
  }
  if (result.stale.length > 0) {
    console.log(
      `  ${prefix}– ${result.title}: removing stale tags → ${result.stale.join(", ")}`
    );
  }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  // --- Validate environment ------------------------------------------------
  if (!SHOPIFY_STORE) {
    console.error(
      "Error: SHOPIFY_STORE env var is required (e.g. your-store.myshopify.com)"
    );
    process.exit(1);
  }
  if (!SHOPIFY_ACCESS_TOKEN) {
    console.error(
      "Error: SHOPIFY_ACCESS_TOKEN env var is required (shpat_… or custom app token)"
    );
    process.exit(1);
  }

  console.log(`\nRafríkið — MPN/EAN tag sync`);
  console.log(`Store : ${SHOPIFY_STORE}`);
  console.log(`Mode  : ${DRY_RUN ? "DRY RUN (no writes)" : "LIVE"}`);
  if (SINGLE_PRODUCT_ID) {
    console.log(`Scope : single product ${SINGLE_PRODUCT_ID}`);
  }
  console.log();

  let total = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  // --- Single-product mode -------------------------------------------------
  if (SINGLE_PRODUCT_ID) {
    const data = await gql<SingleProductPage>(SINGLE_PRODUCT_QUERY, {
      id: SINGLE_PRODUCT_ID,
    });
    if (!data.product) {
      console.error(`Product not found: ${SINGLE_PRODUCT_ID}`);
      process.exit(1);
    }
    try {
      const result = await syncProduct(data.product);
      logResult(result);
      total = 1;
      result.skipped ? skipped++ : updated++;
    } catch (err) {
      console.error(`  ✗ Error: ${(err as Error).message}`);
      errors++;
    }
  } else {
    // --- Full-catalogue mode -----------------------------------------------
    let cursor: string | null = null;
    let page = 1;

    while (true) {
      console.log(`Fetching page ${page}…`);
      const data: ProductsPage = await gql<ProductsPage>(PRODUCTS_QUERY, {
        first: PAGE_SIZE,
        after: cursor,
      });

      const edges = data.products.edges;
      const pageInfo: PageInfo = data.products.pageInfo;

      for (const { node: product } of edges) {
        total++;
        try {
          const result = await syncProduct(product);
          logResult(result);
          result.skipped ? skipped++ : updated++;
        } catch (err) {
          console.error(
            `  ✗ ${product.title} (${product.id}): ${(err as Error).message}`
          );
          errors++;
        }
      }

      if (!pageInfo.hasNextPage) break;
      cursor = pageInfo.endCursor;
      page++;
      await sleep(REQUEST_DELAY_MS);
    }
  }

  // --- Summary -------------------------------------------------------------
  console.log();
  console.log("─".repeat(50));
  console.log(`Done.`);
  console.log(`  Products scanned : ${total}`);
  console.log(`  Tags updated     : ${updated}${DRY_RUN ? " (dry-run — no writes)" : ""}`);
  console.log(`  Already correct  : ${skipped}`);
  if (errors > 0) {
    console.log(`  Errors           : ${errors}`);
    process.exit(1);
  }
  console.log();
}

main().catch((err) => {
  console.error("Fatal:", (err as Error).message);
  process.exit(1);
});
