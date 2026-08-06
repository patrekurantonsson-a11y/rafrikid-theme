# Rafríkið Theme

Shopify Online Store 2.0 theme for [Rafríkið](https://rafrikid.is) — an Icelandic electrical supplies retailer based in Þorlákshöfn. Built on Dawn 2.0 conventions, heavily restyled.

---

## Running the theme locally

```bash
# Install Shopify CLI
npm install -g @shopify/cli @shopify/theme

# Authenticate (requires Shopify Partner or store access)
shopify auth login --store your-store.myshopify.com

# Start dev server
cd rafrikid-theme
shopify theme dev --store your-store.myshopify.com
```

## Uploading to Shopify Admin

1. Zip the `rafrikid-theme/` directory:
   ```bash
   zip -r rafrikid-theme.zip rafrikid-theme/
   ```
2. Go to **Shopify Admin → Online Store → Themes**
3. Click **Add theme → Upload zip file** and select `rafrikid-theme.zip`

---

## Metafields the theme expects

All metafields are in the **`custom`** namespace. Configure them in **Shopify Admin → Settings → Custom data → Products**.

| Icelandic label            | Namespace + Key              | Type            | Notes                                           |
|----------------------------|------------------------------|-----------------|--------------------------------------------------|
| Vörunúmer framleiðanda     | `custom.mpn`                 | `single_line_text_field` | Manufacturer Part Number. Mirror into product tags for search. |
| Strikamerki (EAN)          | `custom.ean`                 | `single_line_text_field` | EAN/GTIN. Mirror into product tags for search.  |
| Pakkning                   | `custom.pakkning`            | `single_line_text_field` | Packaging description                           |
| Í kassa                    | `custom.kassi`               | `number_integer` | Box quantity — qty stepper snaps to this value  |
| Á bretti                   | `custom.bretti`              | `number_integer` | Pallet quantity                                 |
| Spenna                     | `custom.spenna`              | `single_line_text_field` | Voltage (e.g. `230V AC`)                        |
| Straumur                   | `custom.straumur`            | `single_line_text_field` | Current (e.g. `16A`)                            |
| IP-flokkur                 | `custom.ip_flokkur`          | `single_line_text_field` | IP rating (e.g. `IP44`)                         |
| Litarhitastig              | `custom.litarhitastig`       | `single_line_text_field` | Colour temperature (e.g. `3000K`)              |
| Ljósstreymi                | `custom.ljosstreymi`         | `single_line_text_field` | Luminous flux (e.g. `800 lm`)                  |
| Orkuflokkur                | `custom.orkuflokkur`         | `single_line_text_field` | Energy class (e.g. `A++`)                      |
| Afhendingartími            | `custom.afhendingartimi`     | `single_line_text_field` | Lead time text (e.g. `3–5 virka daga`)         |
| Fagverð (excl. VAT, ISK)   | `custom.verd_fagadili`       | `number_decimal` | Trade net price in full ISK (not aura). Falls back to standard price if absent. See **Trade pricing** note. |
| Skjöl og leiðbeiningar     | `custom.skjol`               | `rich_text_field` or `file` | PDF/document list — rendered in product page accordion |

### MPN / EAN search

Shopify's native predictive search does **not** index metafields. To make MPN and EAN findable via search:

- **Mirror MPN and EAN into product tags** during import/sync. Example tag format: `mpn:4016779`, `ean:5413736001023`.
- Use the included `sync-mpn-ean-tags` script (see below) or a Shopify app to add these tags automatically from your ERP or supplier feed.

#### Running the MPN/EAN tag-sync script

The script lives in `scripts/src/sync-mpn-ean-tags.ts`. It reads every product's `custom.mpn` and `custom.ean` metafields via the Shopify Admin GraphQL API and writes (or corrects) the matching tags. Stale tags whose metafield value has since changed are removed automatically.

**Required Admin API scopes:** `read_products`, `write_products`

Create a [custom app](https://help.shopify.com/en/manual/apps/app-types/custom-apps) in **Shopify Admin → Settings → Apps and sales channels → Develop apps** and generate an Admin API access token with those two scopes.

```bash
# Full catalogue sync (live)
SHOPIFY_STORE=your-store.myshopify.com \
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxx \
pnpm --filter @workspace/scripts run sync-mpn-ean-tags

# Preview changes without writing anything
SHOPIFY_STORE=your-store.myshopify.com \
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxx \
pnpm --filter @workspace/scripts run sync-mpn-ean-tags -- --dry-run

# Sync a single product by Shopify GID
SHOPIFY_STORE=your-store.myshopify.com \
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxx \
pnpm --filter @workspace/scripts run sync-mpn-ean-tags -- \
  --product-id gid://shopify/Product/123456789
```

**Running as a webhook-triggered sync:** Deploy the script (or a thin wrapper around it) as a serverless function and point a Shopify `products/update` webhook at it. The function receives the updated product payload, extracts the product GID, and calls the script with `--product-id` so only the changed product is re-synced. This keeps tags up to date whenever a metafield is edited in the Shopify Admin without requiring a full nightly run.

---

## Customer tags the theme reads

| Tag         | Effect                                                                 |
|-------------|------------------------------------------------------------------------|
| `fagadili`  | Marks customer as trade. VAT toggle defaults to **Án vsk**. Fagverð badge shown when `custom.verd_fagadili` is set. |

Set the tag via **Shopify Admin → Customers → [customer] → Tags**, or via API/app after account approval.

---

## VAT display behaviour

- Icelandic VAT rate: **24%** (electrical goods).
- Shopify stores are configured with **tax-inclusive pricing** in Iceland. `product.price` includes VAT.
- Excl-VAT figure is always computed as `price / 1.24`, rounded to whole krónur. The incl-VAT figure is the source of truth; the excl figure is derived from it — never the other way round — to prevent rounding drift.
- ISK format: `12.450 kr.` (period as thousands separator, no decimal aura, space before `kr.`). All formatting goes through `snippets/verd.liquid`.
- The VAT toggle persists in `localStorage` under key `rafrikid_vsk`. On first paint, the server-side default is read from `body[data-vat-default]` (set in `layout/theme.liquid`) to avoid a flash of the wrong price.

---

## Trade pricing (`custom.verd_fagadili`)

**Important:** Shopify themes control **price display only**, not price calculation. A customer checking out always pays the Shopify variant price — not the displayed trade figure.

- Store the trade net price (excl. VAT, whole ISK) in `custom.verd_fagadili`.
- The theme multiplies it by 100 (converting to aura) for display consistency with Shopify's money filters.
- Genuine enforceable trade pricing requires **Shopify Plus B2B** or a wholesale/B2B app. Document this to the merchant.

---

## Features that require apps or Shopify configuration (out of scope for the theme)

These are documented here per the project spec. The theme UI is designed to accommodate them but cannot implement them without platform support:

| Feature | What's needed |
|---------|--------------|
| Customer-specific price lists / volume discounts | Shopify Plus B2B or wholesale app (e.g. Wholesale Gorilla, Locksmith + price list app) |
| Invoice / 30-day payment terms | Shopify Plus B2B, or manual draft orders via Admin API |
| ERP or supplier stock feed sync | Custom app or connector (e.g. SKULabs, Brightpearl) |
| Icelandic payment providers (Teya, Rapyd, Netgíró, Pei, Aur) | Configured in **Shopify Admin → Settings → Payments**, not the theme |
| Automatic kennitala lookup against Fyrirtækjaskrá | External API call — requires a custom app or serverless function |
| Real-time stock from supplier/ERP | Custom app with inventory webhook |
| Enforced trade account approval workflow | Flow automation + customer tagging app, or custom app |

---

## Navigation setup

Create a navigation menu named **`main-menu`** in **Shopify Admin → Online Store → Navigation** with the following top-level groups (add sub-links as needed):

1. Ljós og perur
2. Lampar og ljósabúnaður
3. Rofar og tenglar
4. Raflagnaefni
5. Töflubúnaður og varnir
6. Kaplar og vír
7. Iðnstýringar og sjálfvirkni
8. Hleðslustöðvar og rafbílar
9. Sólarorka og rafgeymar
10. Loftræsting og hiti
11. Verkfæri og mælitæki
12. Útsala

Create a **`footer`** menu for the footer category links.

---

## Page templates

Create these pages in **Shopify Admin → Online Store → Pages** and assign the matching template:

| Page handle          | Template               | Purpose                         |
|----------------------|------------------------|---------------------------------|
| `hradpontun`         | `page.hradpontun`      | Hraðpöntun (Quick Order)        |
| `um-okkur`           | `page` (default)       | About us                        |
| `afhending`          | `page`                 | Delivery information            |
| `skilmalar`          | `page`                 | Terms and conditions            |
| `personuvernd`       | `page`                 | Privacy policy                  |
| `skilarettur`        | `page`                 | Returns policy                  |
| `hafa-samband`       | `page`                 | Contact page                    |
| `fagadila-reikningur`| `page`                 | Trade account application info  |

---

## Hraðpöntun (Quick Order) — `page.hradpontun`

- Accepts MPN, EAN, or any product-tag-mirrored code, one per line, with optional quantity.
- Supported formats: `CODE magn`, `CODE,magn`, tab-separated.
- Also accepts `.csv` and `.xlsx` uploads (SheetJS is loaded from CDN on this page only — no external JS elsewhere).
- Resolves codes via Shopify's `/search/suggest.json` predictive search API.
- Unmatched codes are highlighted and remain editable.
- Running total shown in both VAT modes.
- "Setja allt í körfu" batches all matched items in one `/cart/add.js` call.

---

## Accessibility

- `lang="is"` on `<html>`.
- Skip link to `#MainContent`.
- All interactive elements have Icelandic accessible names.
- Correct heading hierarchy throughout.
- Focus rings in `--rf-kopar` (visible on all interactive elements via `:focus-visible`).
- `prefers-reduced-motion` respected — all animations and transitions are disabled.
- Keyboard navigation: VAT toggle, cart drawer, filters, gallery, and quantity steppers all keyboard-operable.

---

## Design tokens (CSS custom properties)

Defined in `assets/base.css`:

```css
--rf-panel:   #15191E  /* Header, footer, dark surfaces — enclosure steel */
--rf-kopar:   #B0602A  /* Primary action colour, links — copper */
--rf-pe-graen:#2F7D3A  /* PE stripe green */
--rf-pe-gul:  #D8CE24  /* PE stripe yellow */
--rf-hvitt:   #F6F6F4  /* Page background */
--rf-stal:    #5D6570  /* Secondary text, rules, metadata */
--rf-lager:   #1D7A4C  /* In-stock indicator */
--rf-bid:     #B8791A  /* Incoming / lead-time indicator */
```

**PE stripe** (`--rf-pe-graen` + `--rf-pe-gul`, 4px diagonal) appears in exactly three places: top edge of header, active nav item underline, section boundaries where the `rf-pe-stripe` class is used. Nowhere else.

**Typography:**
- Display: Archivo 700–800 (headlines, prices)
- Body: Public Sans 400/600 (all running text)
- Data: IBM Plex Mono 400 (MPN, EAN, SKU, technical specs — monospace is functional, not decorative)

---

## File structure

```
rafrikid-theme/
├── assets/
│   ├── base.css              # All design tokens, layout, components
│   └── theme.js              # VAT toggle, cart drawer, predictive search, hraðpöntun, etc.
├── config/
│   ├── settings_schema.json  # Theme editor schema
│   └── settings_data.json    # Default settings values
├── layout/
│   └── theme.liquid          # Root HTML, Google Fonts, JS init
├── locales/
│   ├── is.default.json       # Icelandic (default locale)
│   ├── is.default.schema.json
│   └── en.json               # English (secondary)
├── sections/
│   ├── header.liquid         # Sticky header: PE stripe, utility bar, VAT toggle, nav, search
│   ├── footer.liquid         # Footer columns + business line
│   ├── hero-search.liquid    # Search-first hero (forsíða)
│   ├── category-grid.liquid  # 12-tile category grid with SVG icons
│   ├── audience-panels.liquid# Tvær leiðir að versla (trade + consumer panels)
│   ├── featured-products.liquid
│   ├── delivery-info.liquid  # Afhendingarleiðir
│   ├── brand-strip.liquid    # Vörumerki logo strip
│   ├── newsletter.liquid
│   ├── main-product.liquid   # Full product page with tech table + gallery
│   ├── main-collection.liquid# Filter sidebar, grid/list toggle, pagination
│   ├── main-cart.liquid      # Full cart page
│   ├── main-search.liquid
│   ├── main-404.liquid
│   ├── main-page.liquid      # Generic page
│   ├── page-hradpontun.liquid# Quick order tool
│   ├── main-register.liquid  # Nýskráning (individual + company tabs)
│   ├── main-login.liquid
│   ├── main-blog.liquid
│   └── main-article.liquid
├── snippets/
│   ├── verd.liquid           # Single source of truth for ISK price formatting + VAT logic
│   ├── stock-badge.liquid    # Til á lager / Væntanlegt / Uppselt badge
│   ├── product-card.liquid   # Reusable product card
│   └── cart-drawer.liquid    # Cart drawer markup
└── templates/
    ├── index.json
    ├── product.json
    ├── collection.json
    ├── cart.json
    ├── search.json
    ├── 404.json
    ├── page.json
    ├── page.hradpontun.json
    ├── blog.json
    ├── article.json
    ├── password.liquid
    └── customers/
        ├── register.json
        ├── login.json
        ├── account.liquid
        └── order.liquid
```
