import { useState } from 'react';

function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const fetchOrders = async () => {
    if (!userEmail.trim()) {
      alert('Please enter a user email');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query GetUserOrders($userEmail: String!, $page: Float, $limit: Float) {
              getUserOrders(user_email: $userEmail, page: $page, limit: $limit) {
                orders {
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
                total
              }
            }
          `,
          variables: {
            userEmail,
            page: 1,
            limit: 10,
          },
        }),
      });
      const data = await response.json();
      if (data.data?.getUserOrders) {
        setOrders(data.data.getUserOrders.orders || []);
      } else if (data.errors) {
        alert(`Error: ${data.errors[0]?.message || 'Failed to fetch orders'}`);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Network error: Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section">
      <h2>Orders</h2>

      <div style={{ marginBottom: '20px' }}>
        <div className="form-group">
          <label>User Email</label>
          <input
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="Enter user email to fetch orders"
            required
          />
        </div>
        <button className="btn" onClick={fetchOrders} disabled={loading}>
          {loading ? 'Loading...' : 'Fetch Orders'}
        </button>
      </div>

      {orders.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Orders for {userEmail}</h3>
          {orders.map((order) => (
            <div key={order.id} className="card">
              <h3>Order #{order.id.substring(0, 8)}</h3>
              <p>Status: <strong>{order.status}</strong></p>
              <p>Total: ${order.total_amount.toFixed(2)}</p>
              <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
              <details>
                <summary style={{ cursor: 'pointer', color: '#3498db' }}>
                  View {order.items.length} item(s)
                </summary>
                <ul style={{ marginTop: '10px' }}>
                  {order.items.map((item: any) => (
                    <li key={item.id}>
                      Product: {item.product_id.substring(0, 8)} - Qty: {item.quantity} - ${item.price.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          ))}
        </div>
      )}

      {!loading && orders.length === 0 && userEmail && (
        <p style={{ marginTop: '20px', color: '#7f8c8d' }}>
          No orders found for this user.
        </p>
      )}
    </div>
  );
}

export default Orders;
