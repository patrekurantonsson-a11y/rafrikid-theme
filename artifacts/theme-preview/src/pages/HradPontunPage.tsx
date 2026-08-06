import { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { products } from '../data/products';
import { CartDrawer } from '../components/CartDrawer';
import { useAppContext } from '../context/AppContext';
import { formatISK } from '../utils/format';

export function HradPontunPage() {
  const { vatMode, addToCart } = useAppContext();
  
  // Hardcoded sample resolved lines based on instructions
  const initialLines = [
    { id: 1, mpn: '3NA3820', status: 'ok', title: 'Siemens 3NA3820', qty: 5, priceAura: 3490000, product: products[0] },
    { id: 2, mpn: 'S200B16', status: 'ok', title: 'ABB S200 B16', qty: 12, priceAura: 189000, product: products[1] },
    { id: 3, mpn: '1234567', status: 'err', title: 'Fannst ekki í kerfi', qty: 1, priceAura: 0 },
    { id: 4, mpn: '222413', status: 'ok', title: 'Wago 222-413', qty: 100, priceAura: 89000, product: products[4] },
    { id: 5, mpn: '2099', status: 'ok', title: 'OBO Bettermann 2099', qty: 2, priceAura: 134000, product: products[6] },
  ];

  const totalAura = initialLines
    .filter(l => l.status === 'ok')
    .reduce((acc, l) => acc + (l.priceAura * l.qty), 0);
  
  const totalPrice = vatMode === 'med' ? totalAura : Math.round(totalAura / 1.24);

  const handleAddAll = () => {
    initialLines.forEach(l => {
      if (l.status === 'ok') {
        addToCart({ title: l.title, qty: l.qty, priceAura: l.priceAura });
      }
    });
  };

  return (
    <>
      <Header />
      
      <main style={{ padding: '3rem 0' }}>
        <div className="rf-container rf-hradpontun-wrap">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{ marginBottom: '0.5rem' }}>Hraðpöntun</h1>
            <p style={{ color: 'var(--rf-stal)', maxWidth: '500px', margin: '0 auto' }}>
              Límdu inn vörunúmer eða EAN kóða ásamt magni. Við finnum vörurnar og þú getur sett allt í körfuna með einum smelli.
            </p>
          </div>

          <div style={{ background: 'white', padding: '2rem', border: '1.5px solid var(--color-border)', borderRadius: 'var(--border-radius)', marginBottom: '3rem' }}>
            <div className="rf-field">
              <label className="rf-label">Límdu inn vörunúmer (t.d. úr Excel)</label>
              <textarea 
                className="rf-textarea" 
                defaultValue="3NA3820&#9;5&#10;S200B16&#9;12&#10;1234567&#9;1&#10;222413&#9;100&#10;2099&#9;2"
              ></textarea>
            </div>
            <button className="btn btn--dark">Þátta línur</button>
          </div>

          <h3 style={{ marginBottom: '1.5rem' }}>Niðurstaða</h3>
          <div style={{ overflowX: 'auto', border: '1.5px solid var(--color-border)', borderRadius: 'var(--border-radius)', background: 'white' }}>
            <table className="rf-list-table rf-resolution-table">
              <thead>
                <tr>
                  <th>Kóði</th>
                  <th>Staða</th>
                  <th>Lýsing</th>
                  <th style={{ textAlign: 'center' }}>Magn</th>
                  <th style={{ textAlign: 'right' }}>Samtals {vatMode === 'med' ? 'm. vsk' : 'án vsk'}</th>
                </tr>
              </thead>
              <tbody>
                {initialLines.map(line => {
                  const lineTotal = vatMode === 'med' ? line.priceAura * line.qty : Math.round(line.priceAura * line.qty / 1.24);
                  return (
                    <tr key={line.id}>
                      <td>{line.mpn}</td>
                      <td>
                        {line.status === 'ok' 
                          ? <span className="status-ok">✔ Fannst</span> 
                          : <span className="status-err">✖ Fannst ekki</span>}
                      </td>
                      <td style={{ fontWeight: line.status === 'ok' ? 600 : 400 }}>{line.title}</td>
                      <td style={{ textAlign: 'center' }}>{line.qty}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-data)' }}>
                        {line.status === 'ok' ? formatISK(lineTotal) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} style={{ textAlign: 'right', fontWeight: 700, padding: '1rem' }}>Samtals:</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-data)', padding: '1rem', background: 'var(--color-base-background-2)' }}>
                    {formatISK(totalPrice)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <button className="btn btn--primary" onClick={handleAddAll}>Setja allt í körfu</button>
          </div>
        </div>
      </main>

      <Footer />
      <CartDrawer />
    </>
  );
}
