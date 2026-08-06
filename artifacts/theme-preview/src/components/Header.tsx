import { useAppContext } from '../context/AppContext';

export function Header() {
  const { vatMode, setVatMode, setCartOpen, cartItems } = useAppContext();

  const totalCartItems = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <div className="rf-header-wrapper">
      {/* Announcement Bar */}
      <div style={{ background: 'var(--rf-kopar)', color: 'white', textAlign: 'center', padding: '0.4rem', fontSize: '0.8125rem', fontWeight: 600 }}>
        Ókeypis sending yfir 50.000 kr. · Opið virka daga 8–17
      </div>

      {/* Utility Bar */}
      <div className="rf-utility-bar">
        <div className="rf-container rf-utility-bar__inner">
          <a href="/quick-order" style={{ fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>Hraðpöntun</a>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <a href="#">Um okkur</a>
          <a href="#">Skilmálar</a>
          <a href="#">Hafa samband</a>
          
          <div className="rf-vat-toggle" style={{ marginLeft: 'auto' }}>
            <span className="rf-vat-toggle__label">Verð sýnd:</span>
            <div className="rf-vat-toggle__group">
              <button 
                className={`rf-vat-toggle__btn ${vatMode === 'med' ? 'active' : ''}`}
                onClick={() => setVatMode('med')}
                data-testid="vat-toggle-med"
              >
                M. vsk
              </button>
              <button 
                className={`rf-vat-toggle__btn ${vatMode === 'ant' ? 'active' : ''}`}
                onClick={() => setVatMode('ant')}
                data-testid="vat-toggle-ant"
              >
                Án vsk
              </button>
            </div>
          </div>
          
          <div className="rf-utility-bar__phone">SÍMI: 555-1234</div>
        </div>
      </div>

      {/* Main Header */}
      <header className="rf-header">
        <div className="rf-container rf-header__inner">
          <a href={import.meta.env.BASE_URL || '/'} className="rf-logo" aria-label="Rafríkið — forsíða">
            {/* Lightning bolt mark — The Electric Kingdom */}
            <svg className="rf-logo__mark" width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect width="34" height="34" rx="8" fill="#1A5C96"/>
              <path d="M21 4L11 19h7L14 30l13-16h-7z" fill="white"/>
            </svg>
            <span className="rf-logo__wordmark">Rafríkið</span>
          </a>
          
          <div className="rf-header__search">
            <form className="rf-search-form" onSubmit={(e) => e.preventDefault()}>
              <input type="search" placeholder="Leita að vöru, vörunúmeri eða framleiðanda..." />
              <button type="submit" aria-label="Leita">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </button>
            </form>
          </div>
          
          <div className="rf-header__icons">
            <a href="#" className="rf-icon-btn" aria-label="Aðgangur">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </a>
            <button className="rf-icon-btn" aria-label="Karfa" onClick={() => setCartOpen(true)} data-testid="btn-open-cart">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              {totalCartItems > 0 && <span className="rf-cart-count">{totalCartItems}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Nav */}
      <nav className="rf-nav">
        <div className="rf-container rf-nav__inner">
          <div className="rf-nav__item">
            <a href="/collection" className="rf-nav__link">Raftæki</a>
            <div className="rf-megamenu">
              <a href="/collection">Tenglar og rofar</a>
              <a href="/collection">Greinitaflur</a>
              <a href="/collection">Kaplar</a>
            </div>
          </div>
          <div className="rf-nav__item"><a href="/collection" className="rf-nav__link">Lýsing</a></div>
          <div className="rf-nav__item"><a href="/collection" className="rf-nav__link">Sólarorka</a></div>
          <div className="rf-nav__item"><a href="/collection" className="rf-nav__link">Hleðslustöðvar</a></div>
          <div className="rf-nav__item"><a href="/collection" className="rf-nav__link">Varnarbúnaður</a></div>
          <div className="rf-nav__item"><a href="/collection" className="rf-nav__link">Tæki og verkfæri</a></div>
          <div className="rf-nav__item" style={{ marginLeft: 'auto' }}><a href="/collection" className="rf-nav__link" style={{ color: 'var(--rf-kopar)' }}>Tilboð</a></div>
        </div>
      </nav>

    </div>
  );
}
