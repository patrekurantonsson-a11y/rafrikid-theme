# Rafríkið Shopify Theme

A complete Shopify Online Store 2.0 theme for Rafríkið (rafrikid.is) — an Icelandic electrical supplies retailer in Þorlákshöfn. Serves trade buyers (fagaðilar) and consumers from a single storefront.

## Deliverable

The theme is in `rafrikid-theme/`. Zip it and upload to Shopify Admin → Online Store → Themes → Add theme → Upload zip.

```bash
zip -r rafrikid-theme.zip rafrikid-theme/
# Then upload rafrikid-theme.zip to Shopify admin
```

Or use Shopify CLI to dev-serve:

```bash
shopify theme dev --store your-store.myshopify.com
```

## Stack

- Shopify Online Store 2.0 (section-based JSON templates)
- Liquid, CSS custom properties, vanilla JS (no bundler required)
- Dawn 2.0 conventions — works as a base for `shopify theme push`

## Key features built

- **VAT toggle** — persistent header control (`Með vsk` / `Án vsk`), stored in `localStorage`, server-side default for trade customers tagged `fagadili`, flips all prices on the page without reload
- **`snippets/verd.liquid`** — single source of truth for ISK price formatting (12.450 kr. format), VAT-excl figure always derived from incl figure to prevent rounding drift
- **Hraðpöntun** (`page.hradpontun`) — trade quick-order tool: paste MPN/EAN list, CSV/xlsx upload, resolves via predictive search API, batched add-to-cart
- **Dual-audience collection list/grid** — grid view for consumers, dense table view (MPN, EAN, stock, box qty, inline add) for trade; choice persisted in localStorage
- **Technical data table** — 11 metafields rendered only when present, in IBM Plex Mono (monospace = machine data)
- **PE stripe** — IEC 60446 protective-earth colours (green + yellow diagonal) used as the single graphic device: header top edge, active nav underline, section boundaries only
- **Icelandic-first** — all UI strings in `locales/is.default.json`, lang="is" on html, full Icelandic character support (þ ð æ ö á í ó ú ý) across all three typefaces
- **Company registration** with kennitala mod-11 validation, company-tab fields, approval note

## Where things live

| File | Purpose |
|------|---------|
| `rafrikid-theme/assets/base.css` | All design tokens, layout, component styles |
| `rafrikid-theme/assets/theme.js` | VAT toggle, cart drawer, predictive search, hraðpöntun |
| `rafrikid-theme/snippets/verd.liquid` | ISK price + VAT formatting — use this everywhere |
| `rafrikid-theme/sections/header.liquid` | Sticky header with utility bar and VAT toggle |
| `rafrikid-theme/sections/main-product.liquid` | Full product page |
| `rafrikid-theme/sections/main-collection.liquid` | Collection with filters and list/grid toggle |
| `rafrikid-theme/sections/page-hradpontun.liquid` | Quick order page |
| `rafrikid-theme/README.md` | Full deployment docs, metafield reference, nav setup |

## Architecture decisions

- VAT toggle is display-only (Shopify platform limit). Enforceable trade pricing needs Plus B2B or a wholesale app — documented in README.
- MPN/EAN metafields must be mirrored into product tags for predictive search (Shopify does not index metafields natively).
- `custom.verd_fagadili` stores trade price in whole ISK (not aura) — theme multiplies × 100 for Shopify money filter compatibility.
- SheetJS loaded from CDN only on the hraðpöntun page — no external JS on any other page.
- `snippets/verd.liquid` is the only place prices are formatted — do not scatter money formatting elsewhere.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Run `shopify theme dev` from inside `rafrikid-theme/`, not the workspace root.
- After uploading, assign `page.hradpontun` template to the Hraðpöntun page in Shopify Admin.
- Create a `main-menu` link list with the 12 top-level categories for the nav to populate.
