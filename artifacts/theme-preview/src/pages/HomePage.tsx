import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProductCard } from '../components/ProductCard';
import { products } from '../data/products';
import { CartDrawer } from '../components/CartDrawer';

export function HomePage() {
  return (
    <>
      <Header />
      
      <main>
        {/* Hero Section — kalon-inspired: left-aligned, oversized display text */}
        <section style={{ background: 'var(--rf-panel)', color: 'white', padding: '5.5rem 0 4.5rem' }}>
          <div className="rf-container">
  
            <h1 style={{
              fontSize: 'clamp(3.5rem, 9vw, 8rem)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1.0,
              color: '#fff',
              marginBottom: '1.5rem',
              maxWidth: '18ch',
            }}>
              Raflagnaefni&shy;. Fljót afhending.
            </h1>
            <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.65)', maxWidth: '52ch', marginBottom: '2.5rem', lineHeight: 1.65, fontWeight: 400, letterSpacing: 0 }}>
              Yfir 15.000 vörur á lager. Sendum um allt land — eða sækja á staðnum í Þorlákshöfn virka daga 8–17.
            </p>

            <div className="rf-hero-search" style={{ maxWidth: '580px', marginBottom: '2rem', borderRadius: 'var(--border-radius)', display: 'flex', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.25)' }}>
              <input type="text" placeholder="Leita að vöru, vörunúmeri eða strikamerki…" style={{ flex: 1, background: 'rgba(255,255,255,0.1)', border: 'none', padding: '1rem 1.25rem', color: 'white', fontSize: '1rem', fontFamily: 'inherit' }} />
              <button style={{ background: 'var(--rf-kopar)', color: 'white', border: 'none', padding: '0 1.5rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.9375rem', borderRadius: '0 var(--border-radius) var(--border-radius) 0' }}>Leita</button>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <a href="#" className="btn btn--primary">Skoða vöruúrval</a>
              <a href="#" className="btn" style={{ background: 'transparent', color: 'rgba(255,255,255,0.8)', borderColor: 'rgba(255,255,255,0.25)', borderRadius: '50px' }}>Innskráning fagaðila</a>
              <span style={{ color: 'rgba(255,255,255,0.3)', margin: '0 0.25rem' }}>·</span>
              {['Hraðpöntun', 'Ljós', 'Rofar', 'Solar'].map(label => (
                <a key={label} href="#" style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '1px' }}>{label}</a>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section style={{ padding: '3rem 0' }}>
          <div className="rf-container">
            <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Vöruflokkar</h2>
            <div className="rf-cat-grid">
              {['Raftæki', 'Lýsing', 'Solar', 'Hleðslustöðvar', 'Varnarbúnaður', 'Tæki og verkfæri'].map((cat, i) => (
                <a href="#" className="rf-cat-tile" key={i}>
                  <svg className="rf-cat-tile__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="3" x2="9" y2="21"></line>
                  </svg>
                  <span>{cat}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Products */}
        <section style={{ padding: '3rem 0', background: 'var(--color-base-background-1)' }}>
          <div className="rf-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0 }}>Vinsælar vörur</h2>
              <a href="#" style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Sjá allt &rarr;</a>
            </div>
            
            <div className="rf-product-grid">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section style={{ padding: '4rem 0', background: 'var(--color-base-background-2)', borderTop: '1.5px solid var(--color-border)', borderBottom: '1.5px solid var(--color-border)' }}>
          <div className="rf-container" style={{ textAlign: 'center', maxWidth: '600px' }}>
            <h2 style={{ marginBottom: '1rem' }}>Skráðu þig á póstlistann</h2>
            <p style={{ color: 'var(--rf-stal)', marginBottom: '1.5rem' }}>Fáðu nýjustu tilboðin og tæknifréttir beint í pósthólfið.</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="email" className="rf-input" placeholder="Netfang..." style={{ flex: 1 }} />
              <button className="btn btn--primary">Skrá mig</button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <CartDrawer />
    </>
  );
}
