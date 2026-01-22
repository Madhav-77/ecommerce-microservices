import { useState } from 'react';
import Products from './components/Products';
import Users from './components/Users';
import Orders from './components/Orders';

type View = 'products' | 'users' | 'orders';

function App() {
  const [currentView, setCurrentView] = useState<View>('products');

  return (
    <div>
      <header className="header">
        <div className="container">
          <h1>E-Commerce Microservices</h1>
          <nav className="nav">
            <button
              className={currentView === 'products' ? 'active' : ''}
              onClick={() => setCurrentView('products')}
            >
              Products
            </button>
            <button
              className={currentView === 'users' ? 'active' : ''}
              onClick={() => setCurrentView('users')}
            >
              Users
            </button>
            <button
              className={currentView === 'orders' ? 'active' : ''}
              onClick={() => setCurrentView('orders')}
            >
              Orders
            </button>
          </nav>
        </div>
      </header>

      <main className="container">
        {currentView === 'products' && <Products />}
        {currentView === 'users' && <Users />}
        {currentView === 'orders' && <Orders />}
      </main>
    </div>
  );
}

export default App;
