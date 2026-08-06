/**
 * Rafríkið Theme — theme.js
 * VAT toggle, cart drawer, predictive search, quantity stepper,
 * gallery, hraðpöntun resolver.
 */

'use strict';

/* ============================================================
   1. Constants & helpers
   ============================================================ */
const VAT_RATE = 1.24;
const VAT_KEY = 'rafrikid_vsk';

function formatISK(orar) {
  // Format whole krónur: 12.450 kr.
  const kr = Math.round(orar / 100); // Shopify prices are in lowest denomination (aura)
  return kr.toLocaleString('is-IS').replace(/,/g, '.') + '\u00A0kr.';
}

function priceExVat(priceWithVat) {
  return Math.round(priceWithVat / VAT_RATE);
}

/* ============================================================
   2. VAT Toggle
   ============================================================ */
class VatToggle {
  constructor() {
    this.mode = this._readMode();
    this._init();
  }

  _readMode() {
    const stored = localStorage.getItem(VAT_KEY);
    if (stored) return stored;
    // Check if page loaded with server-side default set via data attribute
    const bodyMode = document.body.dataset.vatDefault;
    return bodyMode || 'med';
  }

  _init() {
    document.querySelectorAll('.rf-vat-toggle__btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setMode(btn.dataset.mode);
      });
    });
    this.apply();
  }

  setMode(mode) {
    this.mode = mode;
    localStorage.setItem(VAT_KEY, mode);
    this.apply();
  }

  apply() {
    // Keep html.vat-ant in sync so CSS pre-paint rules stay correct
    // after JS takes control (also handles runtime mode switches).
    document.documentElement.classList.toggle('vat-ant', this.mode === 'ant');

    // Update toggle buttons
    document.querySelectorAll('.rf-vat-toggle__btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === this.mode);
      btn.setAttribute('aria-pressed', btn.dataset.mode === this.mode ? 'true' : 'false');
    });

    // Show/hide price elements
    document.querySelectorAll('[data-price-mode]').forEach(el => {
      const show = this.mode === 'ant' ? 'ant' : 'med';
      el.setAttribute('data-price-visible', el.dataset.priceMode === show ? 'primary' : 'secondary');
    });

    // Update primary/secondary labels
    document.querySelectorAll('.rf-price').forEach(priceEl => {
      const medEl = priceEl.querySelector('[data-price-mode="med"]');
      const antEl = priceEl.querySelector('[data-price-mode="ant"]');
      if (!medEl || !antEl) return;

      if (this.mode === 'ant') {
        antEl.classList.add('rf-price__primary');
        antEl.classList.remove('rf-price__secondary');
        medEl.classList.add('rf-price__secondary');
        medEl.classList.remove('rf-price__primary');
      } else {
        medEl.classList.add('rf-price__primary');
        medEl.classList.remove('rf-price__secondary');
        antEl.classList.add('rf-price__secondary');
        antEl.classList.remove('rf-price__primary');
      }
    });
  }
}

/* ============================================================
   3. Cart Drawer
   ============================================================ */
class CartDrawer {
  constructor() {
    this.drawer = document.getElementById('rf-cart-drawer');
    this.overlay = document.getElementById('rf-cart-overlay');
    if (!this.drawer) return;
    this._bind();
  }

  _bind() {
    // Open triggers
    document.querySelectorAll('[data-cart-open]').forEach(el => {
      el.addEventListener('click', e => { e.preventDefault(); this.open(); });
    });

    // Close
    document.querySelectorAll('[data-cart-close]').forEach(el => {
      el.addEventListener('click', () => this.close());
    });

    this.overlay?.addEventListener('click', () => this.close());

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') this.close();
    });

    // Listen for cart updates
    document.addEventListener('cart:updated', () => this.refresh());
  }

  open() {
    this.drawer.classList.add('open');
    this.overlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
    this.drawer.setAttribute('aria-hidden', 'false');
    this.refresh();
    // Focus first focusable element
    this.drawer.querySelector('button, a, input')?.focus();
  }

  close() {
    this.drawer.classList.remove('open');
    this.overlay?.classList.remove('active');
    document.body.style.overflow = '';
    this.drawer.setAttribute('aria-hidden', 'true');
  }

  async refresh() {
    try {
      const res = await fetch('/cart.js');
      const cart = await res.json();
      this._render(cart);
    } catch (e) {
      console.error('Cart refresh failed', e);
    }
  }

  _render(cart) {
    const body = this.drawer.querySelector('.rf-cart-drawer__body');
    const footer = this.drawer.querySelector('.rf-cart-drawer__footer');
    if (!body || !footer) return;

    if (cart.item_count === 0) {
      body.innerHTML = `<p class="text-secondary" style="margin-top:2rem;text-align:center;">${window.theme?.t?.cart_empty || 'Karfan er tóm'}</p>`;
      footer.innerHTML = '';
      return;
    }

    body.innerHTML = cart.items.map(item => `
      <div class="rf-cart-item" data-key="${item.key}">
        <img src="${item.image}" alt="${item.title}" width="64" height="64" style="object-fit:contain;border:1px solid var(--color-border);border-radius:var(--border-radius);">
        <div style="flex:1;min-width:0;">
          <div style="font-weight:600;font-size:.875rem;">${item.product_title}</div>
          ${item.variant_title && item.variant_title !== 'Default Title' ? `<div style="font-size:.8125rem;color:var(--rf-stal);">${item.variant_title}</div>` : ''}
          <div class="rf-qty" style="margin-top:.5rem;">
            <button class="rf-qty__btn" data-key="${item.key}" data-delta="-1" aria-label="Minnka">−</button>
            <input class="rf-qty__input" type="number" value="${item.quantity}" min="1" data-key="${item.key}" aria-label="Magn">
            <button class="rf-qty__btn" data-key="${item.key}" data-delta="1" aria-label="Auka">+</button>
          </div>
        </div>
        <div style="text-align:right;flex-shrink:0;">
          <div style="font-weight:700;">${formatISK(item.line_price)}</div>
          <button class="btn btn--secondary" style="padding:.2em .5em;font-size:.75rem;margin-top:.5rem;" data-remove="${item.key}">Fjarlægja</button>
        </div>
      </div>
    `).join('');

    // Update cart count badges
    document.querySelectorAll('.rf-cart-count').forEach(el => {
      el.textContent = cart.item_count;
      el.hidden = cart.item_count === 0;
    });

    const totalMed = cart.total_price;
    const totalAnt = priceExVat(totalMed);

    footer.innerHTML = `
      <div class="rf-cart-totals">
        <div class="rf-cart-totals__row"><span>${window.theme?.t?.vat_24 || 'Virðisaukaskattur (24%)'}</span><span>${formatISK(totalMed - Math.round(totalMed / VAT_RATE) * 100 / 100)}</span></div>
        <div class="rf-cart-totals__row rf-cart-totals__row--total"><span>${window.theme?.t?.total || 'Samtals'}</span><span>${formatISK(totalMed)}</span></div>
        <div class="rf-cart-totals__row text-secondary" style="font-size:.8125rem;"><span>${window.theme?.t?.total_excl || 'Samtals án vsk'}</span><span>${formatISK(Math.round(totalMed / VAT_RATE * 100))}</span></div>
      </div>
      <p style="font-size:.8125rem;color:var(--rf-stal);margin-bottom:.75rem;">${window.theme?.t?.shipping_note || 'Sending reiknuð í næsta skrefi'}</p>
      <a href="/checkout" class="btn btn--primary btn--full" style="margin-bottom:.5rem;">${window.theme?.t?.checkout || 'Ganga frá pöntun'}</a>
      <a href="/cart" class="btn btn--secondary btn--full">${window.theme?.t?.view_cart || 'Skoða körfu'}</a>
    `;

    // Bind qty buttons
    body.querySelectorAll('.rf-qty__btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key;
        const input = body.querySelector(`.rf-qty__input[data-key="${key}"]`);
        if (!input) return;
        const newQty = parseInt(input.value) + parseInt(btn.dataset.delta);
        if (newQty < 1) return;
        input.value = newQty;
        this._updateQty(key, newQty);
      });
    });

    body.querySelectorAll('.rf-qty__input').forEach(input => {
      input.addEventListener('change', () => {
        this._updateQty(input.dataset.key, parseInt(input.value) || 1);
      });
    });

    body.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => this._updateQty(btn.dataset.remove, 0));
    });
  }

  async _updateQty(key, qty) {
    try {
      await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key, quantity: qty })
      });
      await this.refresh();
      document.dispatchEvent(new CustomEvent('cart:updated'));
    } catch (e) {
      console.error('Cart update failed', e);
    }
  }
}

/* ============================================================
   4. Add to Cart
   ============================================================ */
async function addToCart(variantId, quantity, properties) {
  const btn = document.querySelector('[data-add-to-cart]');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="loading-spinner"></span>';
  }

  try {
    const res = await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ id: variantId, quantity: quantity || 1, properties: properties || {} }]
      })
    });

    if (!res.ok) {
      const err = await res.json();
      showCartError(err.description || 'Ekki tókst að bæta í körfu. Reyndu aftur.');
      return;
    }

    document.dispatchEvent(new CustomEvent('cart:updated'));
    window.cartDrawer?.open();
  } catch (e) {
    showCartError('Ekki tókst að bæta í körfu. Reyndu aftur.');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = btn.dataset.label || 'Bæta í körfu';
    }
  }
}

function showCartError(msg) {
  let el = document.getElementById('rf-cart-error');
  if (!el) {
    el = document.createElement('div');
    el.id = 'rf-cart-error';
    el.setAttribute('role', 'alert');
    el.style.cssText = 'background:#c0392b;color:#fff;padding:.65em 1em;border-radius:var(--border-radius);margin-top:.75rem;font-size:.875rem;';
    document.querySelector('.rf-buy-box__actions')?.append(el);
  }
  el.textContent = msg;
  setTimeout(() => el.remove(), 6000);
}

/* ============================================================
   5. Quantity stepper — box snap
   ============================================================ */
function initQuantityStepper() {
  const wrap = document.querySelector('.rf-buy-box');
  if (!wrap) return;

  const qtyInput = wrap.querySelector('.rf-qty__input');
  const boxQty = parseInt(document.querySelector('[data-box-qty]')?.dataset.boxQty) || 1;

  if (!qtyInput) return;

  const snapToBox = val => Math.max(boxQty, Math.round(val / boxQty) * boxQty);

  qtyInput.addEventListener('blur', () => {
    if (boxQty > 1) {
      qtyInput.value = snapToBox(parseInt(qtyInput.value) || boxQty);
    }
  });

  wrap.querySelectorAll('.rf-qty__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const current = parseInt(qtyInput.value) || boxQty;
      const delta = parseInt(btn.dataset.delta) * boxQty;
      qtyInput.value = Math.max(boxQty, current + delta);
    });
  });
}

/* ============================================================
   6. Product Gallery
   ============================================================ */
function initGallery() {
  const mainImg = document.querySelector('.rf-product-gallery__main img');
  if (!mainImg) return;

  document.querySelectorAll('.rf-product-gallery__thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      const src = thumb.dataset.src;
      const srcset = thumb.dataset.srcset;
      if (src) mainImg.src = src;
      if (srcset) mainImg.srcset = srcset;
      mainImg.alt = thumb.dataset.alt || '';

      document.querySelectorAll('.rf-product-gallery__thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });

    thumb.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); thumb.click(); }
    });
  });
}

/* ============================================================
   7. Product page — add to cart binding
   ============================================================ */
function initProductForm() {
  const form = document.getElementById('rf-product-form');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const variantId = form.querySelector('[name="id"]')?.value;
    const quantity = parseInt(form.querySelector('.rf-qty__input')?.value) || 1;
    if (!variantId) return;
    await addToCart(variantId, quantity);
  });

  // Variant selects
  form.querySelectorAll('select[name^="option"]').forEach(sel => {
    sel.addEventListener('change', () => updateVariant(form));
  });
}

function updateVariant(form) {
  const selected = Array.from(form.querySelectorAll('select[name^="option"]')).map(s => s.value);
  const variants = window.productVariants;
  if (!variants) return;

  const match = variants.find(v =>
    v.options.every((opt, i) => opt === selected[i])
  );

  if (!match) return;

  form.querySelector('[name="id"]').value = match.id;

  // Update price display
  const priceEl = document.querySelector('[data-variant-price]');
  if (priceEl && match.price) {
    const medPrice = formatISK(match.price);
    const antPrice = formatISK(Math.round(match.price / VAT_RATE * 100));
    document.querySelector('[data-price-mode="med"]').textContent = medPrice;
    document.querySelector('[data-price-mode="ant"]').textContent = antPrice;
  }

  // Update availability
  const stockEl = document.querySelector('[data-stock-badge]');
  if (stockEl) {
    if (match.available) {
      stockEl.className = 'rf-stock rf-stock--til';
      stockEl.textContent = window.theme?.t?.in_stock || 'Til á lager';
    } else {
      stockEl.className = 'rf-stock rf-stock--uppselt';
      stockEl.textContent = window.theme?.t?.out_of_stock || 'Uppselt';
    }
  }

  const addBtn = form.querySelector('[data-add-to-cart]');
  if (addBtn) {
    addBtn.disabled = !match.available;
  }
}

/* ============================================================
   8. Predictive Search
   ============================================================ */
class PredictiveSearch {
  constructor(input, results) {
    this.input = input;
    this.results = results;
    this.timer = null;
    this._bind();
  }

  _bind() {
    this.input.addEventListener('input', () => {
      clearTimeout(this.timer);
      const q = this.input.value.trim();
      if (q.length < 2) { this.results.hidden = true; return; }
      this.timer = setTimeout(() => this._fetch(q), 300);
    });

    document.addEventListener('click', e => {
      if (!this.input.contains(e.target) && !this.results.contains(e.target)) {
        this.results.hidden = true;
      }
    });

    this.input.addEventListener('keydown', e => {
      if (e.key === 'Escape') { this.results.hidden = true; this.input.blur(); }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.results.querySelector('a')?.focus();
      }
    });
  }

  async _fetch(q) {
    try {
      const url = `/search/suggest.json?q=${encodeURIComponent(q)}&resources[type]=product&resources[limit]=8`;
      const res = await fetch(url);
      const data = await res.json();
      this._render(data.resources?.results?.products || []);
    } catch (e) {
      this.results.hidden = true;
    }
  }

  _render(products) {
    if (!products.length) { this.results.hidden = true; return; }

    this.results.innerHTML = products.map(p => `
      <a href="${p.url}" class="rf-predictive-result">
        <img src="${p.featured_image?.url || ''}" alt="${p.title}" width="48" height="48" class="rf-predictive-result__img" loading="lazy">
        <div>
          <div class="rf-predictive-result__title">${p.title}</div>
          ${p.vendor ? `<div style="font-size:.75rem;color:var(--rf-stal);">${p.vendor}</div>` : ''}
        </div>
      </a>
    `).join('');

    this.results.hidden = false;
  }
}

/* ============================================================
   9. Collection — view toggle & filters
   ============================================================ */
function initCollectionView() {
  const STORAGE_KEY = 'rafrikid_view';
  const gridBtn = document.querySelector('[data-view="grid"]');
  const listBtn = document.querySelector('[data-view="list"]');
  const gridEl = document.getElementById('rf-product-grid');
  const listEl = document.getElementById('rf-product-list');

  if (!gridBtn) return;

  const savedView = localStorage.getItem(STORAGE_KEY) || 'grid';
  applyView(savedView);

  gridBtn.addEventListener('click', () => { applyView('grid'); localStorage.setItem(STORAGE_KEY, 'grid'); });
  listBtn?.addEventListener('click', () => { applyView('list'); localStorage.setItem(STORAGE_KEY, 'list'); });

  function applyView(v) {
    gridBtn.classList.toggle('active', v === 'grid');
    listBtn?.classList.toggle('active', v === 'list');
    if (gridEl) gridEl.hidden = v !== 'grid';
    if (listEl) listEl.hidden = v !== 'list';
  }
}

/* ============================================================
   10. Hraðpöntun (Quick Order)
   ============================================================ */
class HradPontun {
  constructor() {
    this.form = document.getElementById('rf-hradpontun-form');
    if (!this.form) return;
    this._bind();
  }

  _bind() {
    const parseBtn = document.getElementById('rf-hradpontun-parse');
    const orderBtn = document.getElementById('rf-hradpontun-order');
    const fileInput = document.getElementById('rf-hradpontun-file');

    parseBtn?.addEventListener('click', () => this._parse());
    orderBtn?.addEventListener('click', () => this._addAllToCart());
    fileInput?.addEventListener('change', e => this._handleFile(e.target.files[0]));
  }

  _parseText(raw) {
    return raw.split('\n')
      .map(l => l.trim())
      .filter(Boolean)
      .map(line => {
        // Support: CODE,qty or CODE qty or CODE\tqty
        const parts = line.split(/[\s,\t]+/);
        const code = parts[0]?.trim().toUpperCase();
        const qty = parseInt(parts[1]) || 1;
        return { code, qty };
      })
      .filter(r => r.code);
  }

  async _parse() {
    const textarea = this.form.querySelector('textarea');
    const rows = this._parseText(textarea.value);
    if (!rows.length) return;

    const tableBody = document.getElementById('rf-resolution-tbody');
    const tableWrap = document.getElementById('rf-resolution-table');

    tableWrap.hidden = false;
    tableBody.innerHTML = rows.map(r => `
      <tr data-code="${r.code}" data-qty="${r.qty}">
        <td class="rf-mono">${r.code}</td>
        <td><span class="loading-spinner"></span></td>
        <td>${r.qty}</td>
        <td>—</td>
        <td>—</td>
      </tr>
    `).join('');

    // Resolve each code via predictive search
    await Promise.all(rows.map(r => this._resolveCode(r)));
    this._updateTotal();
    document.getElementById('rf-hradpontun-order').hidden = false;
  }

  async _resolveCode({ code, qty }) {
    const row = document.querySelector(`[data-code="${code}"]`);
    if (!row) return;

    try {
      const url = `/search/suggest.json?q=${encodeURIComponent(code)}&resources[type]=product&resources[limit]=1`;
      const res = await fetch(url);
      const data = await res.json();
      const product = data.resources?.results?.products?.[0];

      if (!product) {
        row.children[1].textContent = 'Fannst ekki';
        row.children[1].classList.add('status-err');
        row.dataset.variantId = '';
        return;
      }

      // Get variant id from product URL
      const pRes = await fetch(`${product.url}.js`);
      const pData = await pRes.json();
      const variant = pData.variants?.[0];

      row.children[1].innerHTML = `<a href="${product.url}">${product.title}</a>`;
      row.children[3].textContent = variant ? formatISK(variant.price * qty) : '—';
      row.children[4].innerHTML = variant?.available
        ? `<span class="status-ok">Til á lager</span>`
        : `<span class="status-err">Uppselt</span>`;
      row.dataset.variantId = variant?.id || '';
      row.dataset.price = variant?.price || 0;
    } catch {
      row.children[1].textContent = 'Villa';
      row.children[1].classList.add('status-err');
    }
  }

  _updateTotal() {
    let totalAura = 0;
    document.querySelectorAll('#rf-resolution-tbody tr').forEach(row => {
      const price = parseInt(row.dataset.price) || 0;
      const qty = parseInt(row.dataset.qty) || 1;
      totalAura += price * qty;
    });

    const totalEl = document.getElementById('rf-hradpontun-total');
    if (totalEl) {
      totalEl.innerHTML = `
        <strong>${formatISK(totalAura)}</strong> með vsk
        &nbsp;/&nbsp;
        <span style="color:var(--rf-stal)">${formatISK(Math.round(totalAura / VAT_RATE * 100))}</span> án vsk
      `;
    }
  }

  async _addAllToCart() {
    const items = [];
    document.querySelectorAll('#rf-resolution-tbody tr').forEach(row => {
      const variantId = row.dataset.variantId;
      const qty = parseInt(row.dataset.qty) || 1;
      if (variantId) items.push({ id: parseInt(variantId), quantity: qty });
    });

    if (!items.length) return;

    const btn = document.getElementById('rf-hradpontun-order');
    btn.disabled = true;
    btn.innerHTML = '<span class="loading-spinner"></span> Bæti í körfu…';

    try {
      const res = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });

      if (res.ok) {
        document.dispatchEvent(new CustomEvent('cart:updated'));
        window.cartDrawer?.open();
      }
    } catch (e) {
      alert('Villa við að bæta í körfu. Reyndu aftur.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Setja allt í körfu';
    }
  }

  async _handleFile(file) {
    if (!file) return;
    const textarea = this.form.querySelector('textarea');

    if (file.name.endsWith('.csv')) {
      const text = await file.text();
      const rows = text.split('\n').map(l => l.trim()).filter(Boolean);
      textarea.value = rows.join('\n');
    } else if (file.name.match(/\.xlsx?$/i)) {
      // SheetJS (loaded on this page only)
      if (!window.XLSX) { alert('SheetJS er ekki hlaðið.'); return; }
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_csv(ws);
      textarea.value = data;
    }
  }
}

/* ============================================================
   11. Registration — tabs
   ============================================================ */
function initRegisterTabs() {
  const tabs = document.querySelectorAll('[data-reg-tab]');
  const panels = document.querySelectorAll('[data-reg-panel]');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.regTab;
      tabs.forEach(t => { t.classList.toggle('active', t.dataset.regTab === target); t.setAttribute('aria-selected', t.dataset.regTab === target); });
      panels.forEach(p => { p.hidden = p.dataset.regPanel !== target; });
    });
  });
}

/* ============================================================
   12. Kennitala validation
   ============================================================ */
function validateKennitala(kt) {
  const digits = kt.replace(/[^0-9]/g, '');
  if (digits.length !== 10) return false;

  const weights = [3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    sum += parseInt(digits[i]) * weights[i];
  }
  const check = 11 - (sum % 11);
  const checkDigit = parseInt(digits[8]);

  if (check === 11 && checkDigit !== 0) return false;
  if (check === 10) return false;
  return check % 11 === checkDigit;
}

function initKennitalaValidation() {
  const input = document.querySelector('[data-kennitala]');
  if (!input) return;

  const errorEl = document.getElementById('kennitala-error');
  input.addEventListener('blur', () => {
    const valid = !input.value || validateKennitala(input.value);
    if (errorEl) errorEl.hidden = valid;
    input.setAttribute('aria-invalid', !valid);
  });
}

/* ============================================================
   13. Announcement bar dismiss
   ============================================================ */
function initAnnouncement() {
  const bar = document.querySelector('.rf-announcement');
  const dismiss = bar?.querySelector('[data-dismiss-announcement]');
  dismiss?.addEventListener('click', () => {
    bar.hidden = true;
    sessionStorage.setItem('rafrikid_ann_dismissed', '1');
  });
  if (sessionStorage.getItem('rafrikid_ann_dismissed') && bar) bar.hidden = true;
}

/* ============================================================
   14. Mobile menu
   ============================================================ */
function initMobileMenu() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.getElementById('rf-mobile-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const open = menu.hidden;
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
}

/* ============================================================
   15. Filter sidebar (mobile drawer)
   ============================================================ */
function initFilters() {
  const openBtn = document.querySelector('[data-filter-open]');
  const closeBtn = document.querySelector('[data-filter-close]');
  const drawer = document.getElementById('rf-filter-drawer');

  openBtn?.addEventListener('click', () => {
    drawer?.classList.add('open');
    document.body.style.overflow = 'hidden';
  });

  closeBtn?.addEventListener('click', () => {
    drawer?.classList.remove('open');
    document.body.style.overflow = '';
  });
}

/* ============================================================
   16. Init on DOMContentLoaded
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  window.vatToggle = new VatToggle();
  window.cartDrawer = new CartDrawer();

  initQuantityStepper();
  initGallery();
  initProductForm();
  initCollectionView();
  initRegisterTabs();
  initKennitalaValidation();
  initAnnouncement();
  initMobileMenu();
  initFilters();

  new HradPontun();

  // Predictive search — header
  const headerInput = document.querySelector('.rf-header__search input[name="q"]');
  const headerResults = document.getElementById('rf-predictive-results');
  if (headerInput && headerResults) {
    new PredictiveSearch(headerInput, headerResults);
  }

  // Hero search
  const heroInput = document.querySelector('.rf-hero-search input[name="q"]');
  const heroResults = document.getElementById('rf-hero-predictive-results');
  if (heroInput && heroResults) {
    new PredictiveSearch(heroInput, heroResults);
  }
});
