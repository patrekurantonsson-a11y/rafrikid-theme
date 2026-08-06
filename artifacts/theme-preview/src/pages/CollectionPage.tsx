import { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProductCard } from '../components/ProductCard';
import { products } from '../data/products';
import { CartDrawer } from '../components/CartDrawer';
import { useAppContext } from '../context/AppContext';
import { formatISK } from '../utils/format';

export function CollectionPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { vatMode } = useAppContext();

  // Create 12 products by repeating the 8 we have
  const collectionProducts = [...products, ...products.slice(0, 4)].map((p, i) => ({ ...p, id: i + 100 }));

  return (
    <>
      <Header />
      
      <main style={{ padding: '2rem 0' }}>
        <div className="rf-container">
          {/* Breadcrumbs */}
          <nav style={{ fontSize: '0.8125rem', color: 'var(--rf-stal)', marginBottom: '2rem' }}>
            <a href="#" style={{ color: 'inherit' }}>Forsíða</a> &nbsp;/&nbsp; 
            <a href="#" style={{ color: 'inherit' }}>Raftæki</a> &nbsp;/&nbsp; 
            <strong style={{ color: 'var(--color-base-text)' }}>Tenglar og rofar</strong>
          </nav>

          <h1 style={{ marginBottom: '2rem' }}>Tenglar og rofar</h1>

          <div className="rf-collection-layout">
            {/* Sidebar */}
            <aside className="rf-filter-sidebar">
              <div className="rf-filter-group">
                <div className="rf-filter-group__title">Tegund</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                    <input type="checkbox" /> Tenglar
                  </label>
                  <label style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                    <input type="checkbox" /> Rofar
                  </label>
                  <label style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                    <input type="checkbox" /> Rammar
                  </label>
                </div>
              </div>
              <div className="rf-filter-group">
                <div className="rf-filter-group__title">Framleiðandi</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                    <input type="checkbox" /> ABB
                  </label>
                  <label style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                    <input type="checkbox" /> Gira
                  </label>
                  <label style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                    <input type="checkbox" /> Legrand
                  </label>
                </div>
              </div>
              <div className="rf-filter-group">
                <div className="rf-filter-group__title">Lagerstaða</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                    <input type="checkbox" /> Til á lager
                  </label>
                </div>
              </div>
            </aside>

            {/* Main Area */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--rf-stal)' }}>12 vörur fundust</span>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <select className="rf-select" style={{ width: 'auto', padding: '0.3em 2.5em 0.3em 0.7em', fontSize: '0.8125rem' }}>
                    <option>Flokka eftir...</option>
                    <option>Verð (Lægst fyrst)</option>
                    <option>Verð (Hæst fyrst)</option>
                    <option>Nýjast</option>
                  </select>
                  
                  <div className="rf-view-toggle">
                    <button 
                      className={`rf-view-toggle__btn ${viewMode === 'grid' ? 'active' : ''}`}
                      onClick={() => setViewMode('grid')}
                      title="Grind sýn"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                    </button>
                    <button 
                      className={`rf-view-toggle__btn ${viewMode === 'list' ? 'active' : ''}`}
                      onClick={() => setViewMode('list')}
                      title="Lista sýn"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                    </button>
                  </div>
                </div>
              </div>

              {viewMode === 'grid' ? (
                <div className="rf-product-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  {collectionProducts.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="rf-list-table">
                    <thead>
                      <tr>
                        <th>Vörunr.</th>
                        <th>Lýsing</th>
                        <th>Lager</th>
                        <th style={{ textAlign: 'right' }}>Verð {vatMode === 'med' ? 'm. vsk' : 'án vsk'}</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {collectionProducts.map(p => {
                        const price = vatMode === 'med' ? p.priceAura : Math.round(p.priceAura / 1.24);
                        return (
                          <tr key={p.id}>
                            <td className="rf-mono" style={{ color: 'var(--rf-stal)' }}>{p.mpn}</td>
                            <td style={{ fontWeight: 600 }}>{p.vendor} {p.title}</td>
                            <td>
                              <span className={`rf-stock rf-stock--${p.stockStatus}`}>
                                {p.stockStatus === 'til' ? 'Á lager' : (p.stockStatus === 'vaentanlegt' ? 'Væntanlegt' : 'Uppselt')}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 600, fontFamily: 'var(--font-data)' }}>
                              {formatISK(price)}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button className="btn btn--primary" style={{ padding: '0.3em 0.8em', fontSize: '0.8125rem' }}>Bæta í körfu</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <CartDrawer />
    </>
  );
}
