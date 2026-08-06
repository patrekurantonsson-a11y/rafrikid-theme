import { Route, Switch, Router as WouterRouter } from 'wouter';
import { AppProvider } from './context/AppContext';
import { HomePage } from './pages/HomePage';
import { CollectionPage } from './pages/CollectionPage';
import { ProductPage } from './pages/ProductPage';
import { HradPontunPage } from './pages/HradPontunPage';
import './index.css';


function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/collection" component={CollectionPage} />
      <Route path="/product" component={ProductPage} />
      <Route path="/quick-order" component={HradPontunPage} />
      <Route>
        <div style={{ textAlign: 'center', padding: '4rem' }}>Síða fannst ekki (404)</div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <AppProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <div className="theme-preview-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Router />
          </div>
        </div>
      </WouterRouter>
    </AppProvider>
  );
}

export default App;
