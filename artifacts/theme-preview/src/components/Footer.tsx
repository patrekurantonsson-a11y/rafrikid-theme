export function Footer() {
  return (
    <footer className="rf-footer">
      <div className="rf-container">
        <div className="rf-footer-cols">
          <div className="rf-footer-col">
            <div className="rf-footer-col__heading">Vöruflokkar</div>
            <a href="#">Raftæki</a>
            <a href="#">Lýsing</a>
            <a href="#">Solar búnaður</a>
            <a href="#">Hleðslustöðvar</a>
            <a href="#">Verkfæri</a>
          </div>
          <div className="rf-footer-col">
            <div className="rf-footer-col__heading">Þjónusta</div>
            <a href="#">Hraðpöntun</a>
            <a href="#">Afhendingarmáti</a>
            <a href="#">Skilaréttur</a>
            <a href="#">Reikningar</a>
          </div>
          <div className="rf-footer-col">
            <div className="rf-footer-col__heading">Um Rafríkið</div>
            <a href="#">Saga okkar</a>
            <a href="#">Verslanir og opnunartímar</a>
            <a href="#">Umhverfisstefna</a>
            <a href="#">Atvinna</a>
          </div>
          <div className="rf-footer-col">
            <div className="rf-footer-col__heading">Hafa samband</div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'rgba(255,255,255,0.65)' }}>
              Rafríkið ehf.<br/>
              Raftækjavegur 12<br/>
              105 Reykjavík<br/><br/>
              Sími: 555-1234<br/>
              rafrikid@rafrikid.is
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)' }}>
          <div>© {new Date().getFullYear()} Rafríkið ehf. Öll réttindi áskilin.</div>
          <div>B2B Vefverslunarkerfi</div>
        </div>
      </div>
    </footer>
  );
}
