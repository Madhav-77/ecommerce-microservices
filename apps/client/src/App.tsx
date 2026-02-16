import { useState } from 'react';
import Products from './components/Products';
import Users from './components/Users';
import Orders from './components/Orders';
import Cart from './components/Cart';
import { OrderTracking } from './components/OrderTracking';
import { InteractiveTracking } from './components/InteractiveTracking';
import BulkUpload from './components/BulkUpload';
import type { Product, CartItem } from './types/interfaces';

type View = 'products' | 'users' | 'orders' | 'cart' | 'tracking' | 'interactive' | 'bulk-upload';

function App() {
  const [currentView, setCurrentView] = useState<View>('products');
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);

      if (existingItem) {
        // Increment quantity if already in cart
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item
        );
      } else {
        // Add new item to cart
        return [...prevCart, { product, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(quantity, item.product.stock) }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

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
              className={currentView === 'cart' ? 'active' : ''}
              onClick={() => setCurrentView('cart')}
              style={{ position: 'relative' }}
            >
              Cart
              {cartItemCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '2px 6px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  minWidth: '20px',
                  textAlign: 'center'
                }}>
                  {cartItemCount}
                </span>
              )}
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
            <button
              className={currentView === 'tracking' ? 'active' : ''}
              onClick={() => setCurrentView('tracking')}
            >
              Track Order
            </button>
            <button
              className={currentView === 'interactive' ? 'active' : ''}
              onClick={() => setCurrentView('interactive')}
            >
              Interactive
            </button>
            <button
              className={currentView === 'bulk-upload' ? 'active' : ''}
              onClick={() => setCurrentView('bulk-upload')}
            >
              Bulk Upload
            </button>
          </nav>
        </div>
      </header>

      <main className="container">
        {currentView === 'products' && <Products cart={cart} onAddToCart={addToCart} />}
        {currentView === 'cart' && (
          <Cart
            cart={cart}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            onClearCart={clearCart}
          />
        )}
        {currentView === 'users' && <Users />}
        {currentView === 'orders' && <Orders />}
        {currentView === 'tracking' && <OrderTracking />}
        {currentView === 'interactive' && <InteractiveTracking />}
        {currentView === 'bulk-upload' && <BulkUpload />}
      </main>
    </div>
  );
}

export default App;
