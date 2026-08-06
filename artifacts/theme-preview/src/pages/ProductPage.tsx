import { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { PriceDisplay } from '../components/PriceDisplay';
import { StockBadge } from '../components/StockBadge';
import { products } from '../data/products';
import { CartDrawer } from '../components/CartDrawer';
import { useAppContext } from '../context/AppContext';

export function ProductPage() {
  const [qty, setQty] = useState(1);
  const { addToCart } = useAppContext();
  
  const product = products[0]; // Using Siemens 3NA3820 as sample

  const handleAddToCart = () => {
    addToCart({ title: product.title, qty, priceAura: product.priceAura });
  };

  return (
    <>
      <Header />
      
      <main style={{ padding: '2rem 0' }}>
        <div className="rf-container">
          {/* Breadcrumbs */}
          <nav style={{ fontSize: '0.8125rem', color: 'var(--rf-stal)', marginBottom: '2rem' }}>
            <a href="#" style={{ color: 'inherit' }}>Forsíða</a> &nbsp;/&nbsp; 
            <a href="#" style={{ color: 'inherit' }}>Varnarbúnaður</a> &nbsp;/&nbsp; 
            <strong style={{ color: 'var(--color-base-text)' }}>{product.title}</strong>
          </nav>

          <div className="rf-product-layout">
            {/* Gallery */}
            <div className="rf-product-gallery">
              <div className="rf-product-gallery__main">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" fill="none" width="80%" height="80%">
                  <rect width="400" height="400" fill="#EBEBEA" />
                  <path d="M150 200 L200 150 L250 200 L200 250 Z" fill="#D0D0CE" />
                  <circle cx="200" cy="200" r="20" fill="#B0602A" opacity="0.5" />
                </svg>
              </div>
              <div className="rf-product-gallery__thumbs">
                <div className="rf-product-gallery__thumb active">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" fill="none" width="100%" height="100%"><rect width="400" height="400" fill="#EBEBEA" /></svg>
                </div>
                <div className="rf-product-gallery__thumb">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" fill="none" width="100%" height="100%"><rect width="400" height="400" fill="#D0D0CE" /></svg>
                </div>
                <div className="rf-product-gallery__thumb">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" fill="none" width="100%" height="100%"><rect width="400" height="400" fill="#F6F6F4" /></svg>
                </div>
              </div>
            </div>

            {/* Buy Box */}
            <div className="rf-buy-box">
              <div>
                <div className="rf-buy-box__vendor">{product.vendor}</div>
                <h1 className="rf-buy-box__title">{product.title}</h1>
              </div>

              <div>
                <StockBadge status={product.stockStatus} />
              </div>

              <div>
                <PriceDisplay priceAura={product.priceAura} />
              </div>

              <div style={{ padding: '1.5rem 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
                <div className="rf-buy-box__actions">
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="rf-qty">
                      <button className="rf-qty__btn" onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
                      <input type="text" className="rf-qty__input" value={qty} readOnly />
                      <button className="rf-qty__btn" onClick={() => setQty(qty + 1)}>+</button>
                    </div>
                    <button className="btn btn--primary" style={{ flex: 1 }} onClick={handleAddToCart}>Bæta í körfu</button>
                  </div>
                  <div className="rf-lead-time">Afhendingartími: <strong>Vörur á lager fara samdægurs.</strong></div>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Tæknilegar upplýsingar</h3>
                <table className="rf-tech-table">
                  <tbody>
                    <tr><th>Vörunúmer</th><td>{product.mpn}</td></tr>
                    <tr><th>EAN strikamerki</th><td>4001869151522</td></tr>
                    <tr><th>Framleiðandi</th><td>{product.vendor}</td></tr>
                    <tr><th>Straumur</th><td>160 A</td></tr>
                    <tr><th>Spenna</th><td>500 V</td></tr>
                    <tr><th>Stærð</th><td>NH00</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <CartDrawer />
    </>
  );
}
