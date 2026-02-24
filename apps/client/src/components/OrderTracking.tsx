import { useState, useEffect, useRef } from 'react';
import { createClient } from 'graphql-ws';
import { WS_GATEWAY_URL } from '../lib/graphql-client';

interface OrderStatusUpdate {
  order_id: string;
  status: string;
  message: string;
  timestamp: string;
}

export function OrderTracking() {
  const [orderId, setOrderId] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [statusUpdates, setStatusUpdates] = useState<OrderStatusUpdate[]>([]);
  const [error, setError] = useState('');
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const startTracking = () => {
    if (!orderId.trim()) {
      setError('Please enter an Order ID');
      return;
    }

    setError('');
    setStatusUpdates([]);
    setIsTracking(true);

    // Create WebSocket client
    const client = createClient({
      url: WS_GATEWAY_URL,
    });

    // Subscribe to order status updates
    const unsubscribe = client.subscribe(
      {
        query: `
          subscription WatchOrder($orderId: String!) {
            watchOrderStatus(order_id: $orderId) {
              order_id
              status
              message
              timestamp
            }
          }
        `,
        variables: { orderId },
      },
      {
        next: (data: any) => {
          const update = data.data.watchOrderStatus;
          setStatusUpdates(prev => [...prev, update]);
        },
        error: (err: any) => {
          console.error('Subscription error:', err);
          setError(`Error: ${err.message || 'Failed to receive updates'}`);
          setIsTracking(false);
        },
        complete: () => {
          console.log('Subscription completed');
          setIsTracking(false);
        },
      }
    );

    // Store unsubscribe function for cleanup
    unsubscribeRef.current = unsubscribe;
  };

  const stopTracking = () => {
    setIsTracking(false);
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', marginBottom: '20px' }}>
      <h2>📦 Real-Time Order Tracking (Server Streaming)</h2>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Enter Order ID"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          disabled={isTracking}
          style={{ padding: '8px', marginRight: '10px', width: '300px' }}
        />
        {!isTracking ? (
          <button onClick={startTracking} style={{ padding: '8px 16px' }}>
            Start Tracking
          </button>
        ) : (
          <button onClick={stopTracking} style={{ padding: '8px 16px', background: '#dc3545', color: 'white' }}>
            Stop Tracking
          </button>
        )}
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>
      )}

      {isTracking && (
        <div style={{ marginTop: '20px' }}>
          <h3>Status Updates:</h3>
          {statusUpdates.length === 0 ? (
            <p style={{ color: '#666' }}>Waiting for updates...</p>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {statusUpdates.map((update, index) => (
                <div
                  key={index}
                  style={{
                    padding: '12px',
                    margin: '8px 0',
                    border: '1px solid #007bff',
                    borderRadius: '4px',
                    background: '#e7f3ff',
                  }}
                >
                  <div style={{ fontWeight: 'bold', color: '#007bff' }}>
                    {update.status}
                  </div>
                  <div style={{ margin: '4px 0' }}>{update.message}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {new Date(update.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <strong>How it works:</strong> This component uses GraphQL subscriptions over WebSocket
        to receive real-time status updates from the Order Service via gRPC Server Streaming.
        <br /><br />
        <strong>Note:</strong> You must enter a valid order ID from an order you've placed.
        To get an order ID: Go to Products → Add to Cart → Place Order, then copy the order ID from the success message.
      </div>
    </div>
  );
}
