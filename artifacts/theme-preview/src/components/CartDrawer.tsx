import { useAppContext } from '../context/AppContext';
import { formatISK } from '../utils/format';

export function CartDrawer() {
  const { isCartOpen, setCartOpen, cartItems, vatMode, removeFromCart, updateCartQty } = useAppContext();

  const totalMedVsk = cartItems.reduce((acc, item) => acc + (item.priceAura * item.qty), 0);
  const totalAnVsk = Math.round(totalMedVsk / 1.24);

  return (
    <>
      <div 
        className={`rf-cart-drawer__overlay ${isCartOpen ? 'active' : ''}`}
        onClick={() => setCartOpen(false)}
        data-testid="cart-overlay"
      ></div>
      <div className={`rf-cart-drawer ${isCartOpen ? 'open' : ''}`} data-testid="cart-drawer">
        <div className="rf-cart-drawer__header">
          <h2 className="rf-cart-drawer__title">Karfa</h2>
          <button className="rf-cart-drawer__close" onClick={() => setCartOpen(false)} data-testid="btn-close-cart">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div className="rf-cart-drawer__body">
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--rf-stal)', marginTop: '2rem' }}>
              Karfan er tóm.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cartItems.map((item) => {
                const itemPricePrimary = vatMode === 'med' ? item.priceAura : Math.round(item.priceAura / 1.24);
                return (
                  <div key={item.id} style={{ display: 'flex', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ width: '60px', height: '60px', background: 'var(--color-base-background-2)', borderRadius: 'var(--border-radius)' }}></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.title}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--rf-stal)', marginBottom: '0.5rem' }}>
                        {formatISK(itemPricePrimary)} / stk
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="rf-qty" style={{ transform: 'scale(0.85)', transformOrigin: 'left center' }}>
                          <button className="rf-qty__btn" onClick={() => updateCartQty(item.id, Math.max(1, item.qty - 1))}>-</button>
                          <input type="text" className="rf-qty__input" value={item.qty} readOnly />
                          <button className="rf-qty__btn" onClick={() => updateCartQty(item.id, item.qty + 1)}>+</button>
                        </div>
                        <button 
                          style={{ background: 'none', border: 'none', color: '#c0392b', fontSize: '0.8125rem', cursor: 'pointer', textDecoration: 'underline' }}
                          onClick={() => removeFromCart(item.id)}
                        >
                          Fjarlægja
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="rf-cart-drawer__footer">
          <div className="rf-cart-totals">
            <div className="rf-cart-totals__row">
              <span>Samtals án vsk:</span>
              <span>{formatISK(totalAnVsk)}</span>
            </div>
            <div className="rf-cart-totals__row">
              <span>VSK (24%):</span>
              <span>{formatISK(totalMedVsk - totalAnVsk)}</span>
            </div>
            <div className="rf-cart-totals__row rf-cart-totals__row--total">
              <span>Samtals m. vsk:</span>
              <span>{formatISK(totalMedVsk)}</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button className="btn btn--primary btn--full" disabled={cartItems.length === 0}>Ganga frá pöntun</button>
            <button className="btn btn--secondary btn--full" onClick={() => setCartOpen(false)}>Skoða körfu</button>
          </div>
        </div>
      </div>
    </>
  );
}
