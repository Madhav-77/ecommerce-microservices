import { useState } from 'react';
import type { CartItem } from '../types/interfaces';

interface CartProps {
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

function Cart({ cart, onUpdateQuantity, onRemoveItem, onClearCart }: CartProps) {
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [orderResult, setOrderResult] = useState<any>(null);

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    if (!userEmail.trim()) {
      alert('Please enter your email address');
      return;
    }

    setLoading(true);
    setOrderResult(null);

    try {
      const response = await fetch('/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation PlaceOrder($input: PlaceOrderInput!) {
              placeOrder(input: $input) {
                id
                user_id
                status
                total_amount
                created_at
                items {
                  id
                  product_id
                  quantity
                  price
                }
              }
            }
          `,
          variables: {
            input: {
              user_email: userEmail,
              items: cart.map(item => ({
                product_id: item.product.id,
                quantity: item.quantity,
              })),
            },
          },
        }),
      });

      const data = await response.json();

      if (data.data?.placeOrder) {
        setOrderResult({
          success: true,
          order: data.data.placeOrder,
        });
        onClearCart();
        alert(`Order placed successfully! Order ID: ${data.data.placeOrder.id.substring(0, 8)}`);
      } else if (data.errors) {
        setOrderResult({
          success: false,
          error: data.errors[0]?.message || 'Failed to place order',
        });
        alert(`Error: ${data.errors[0]?.message || 'Failed to place order'}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setOrderResult({
        success: false,
        error: 'Network error: Failed to place order',
      });
      alert('Network error: Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && !orderResult) {
    return (
      <div className="section">
        <h2>Shopping Cart</h2>
        <p style={{ color: '#7f8c8d', textAlign: 'center', marginTop: '40px' }}>
          Your cart is empty. Add some products to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Shopping Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})</h2>
        {cart.length > 0 && (
          <button
            className="btn"
            onClick={onClearCart}
            style={{ backgroundColor: '#e74c3c' }}
          >
            Clear Cart
          </button>
        )}
      </div>

      {orderResult && (
        <div style={{
          padding: '20px',
          marginBottom: '20px',
          borderRadius: '8px',
          backgroundColor: orderResult.success ? '#d4edda' : '#f8d7da',
          color: orderResult.success ? '#155724' : '#721c24',
        }}>
          {orderResult.success ? (
            <>
              <h3>✅ Order Placed Successfully!</h3>
              <p>Order ID: {orderResult.order.id}</p>
              <p>Total: ${orderResult.order.total_amount.toFixed(2)}</p>
              <p>Status: {orderResult.order.status}</p>
            </>
          ) : (
            <>
              <h3>❌ Order Failed</h3>
              <p>{orderResult.error}</p>
            </>
          )}
        </div>
      )}

      {cart.length > 0 && (
        <>
          <div style={{ marginBottom: '30px' }}>
            {cart.map((item) => (
              <div key={item.product.id} className="card" style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3>{item.product.name}</h3>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#27ae60', marginTop: '10px' }}>
                      ${item.product.price.toFixed(2)} × {item.quantity} = ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                      <button
                        className="btn"
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        style={{ padding: '5px 12px', minWidth: 'auto' }}
                      >
                        -
                      </button>
                      <span style={{ padding: '0 10px', fontWeight: 'bold' }}>{item.quantity}</span>
                      <button
                        className="btn"
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        style={{ padding: '5px 12px', minWidth: 'auto' }}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="btn"
                      onClick={() => onRemoveItem(item.product.id)}
                      style={{ backgroundColor: '#e74c3c', padding: '5px 15px' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '2px solid #ecf0f1', paddingTop: '20px', marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Total:</h3>
              <h3 style={{ color: '#27ae60', fontSize: '28px' }}>${calculateTotal().toFixed(2)}</h3>
            </div>

            <form onSubmit={handleCheckout}>
              <div className="form-group">
                <label>Your Email (for order confirmation)</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '15px',
                  fontSize: '18px',
                  backgroundColor: '#27ae60',
                  fontWeight: 'bold'
                }}
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
