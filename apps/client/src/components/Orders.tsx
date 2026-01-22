import { useState } from 'react';

function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual GraphQL query when gateway is ready
      const response = await fetch('/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query {
              orders {
                id
                userId
                status
                totalAmount
                createdAt
              }
            }
          `,
        }),
      });
      const data = await response.json();
      setOrders(data.data?.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section">
      <h2>Orders</h2>

      <button className="btn" onClick={fetchOrders} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Orders'}
      </button>

      {orders.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          {orders.map((order) => (
            <div key={order.id} className="card">
              <h3>Order #{order.id.substring(0, 8)}</h3>
              <p>User ID: {order.userId}</p>
              <p>Status: <strong>{order.status}</strong></p>
              <p>Total: ${order.totalAmount}</p>
              <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      {!loading && orders.length === 0 && (
        <p style={{ marginTop: '20px', color: '#7f8c8d' }}>
          No orders loaded. Click "Fetch Orders" to load data.
        </p>
      )}
    </div>
  );
}

export default Orders;
