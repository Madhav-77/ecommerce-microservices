import { useState, useEffect, useRef } from 'react';
import { createClient } from 'graphql-ws';
import { WS_GATEWAY_URL } from '../lib/graphql-client';

interface TrackingResponse {
  order_id: string;
  type: string;
  status: string;
  message: string;
  location?: string;
  eta?: string;
  timestamp: string;
}

export function InteractiveTracking() {
  const [orderId, setOrderId] = useState('');
  const [messages, setMessages] = useState<TrackingResponse[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');
  const clientRef = useRef<ReturnType<typeof createClient> | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const startTracking = () => {
    if (!orderId.trim()) {
      setError('Please enter an order ID');
      return;
    }

    setError('');
    setMessages([]);
    setIsConnected(true);

    // Create WebSocket client
    const client = createClient({
      url: WS_GATEWAY_URL,
    });

    clientRef.current = client;

    // Subscribe to interactive tracking
    const unsubscribe = client.subscribe(
      {
        query: `
          subscription InteractiveOrderTracking($order_id: String!) {
            interactiveOrderTracking(order_id: $order_id) {
              order_id
              type
              status
              message
              location
              eta
              timestamp
            }
          }
        `,
        variables: { order_id: orderId },
      },
      {
        next: (data: any) => {
          if (data.data?.interactiveOrderTracking) {
            const response = data.data.interactiveOrderTracking;
            setMessages((prev) => [...prev, response]);
          }
        },
        error: (err) => {
          console.error('Subscription error:', err);
          setError(`Error: ${err.message}`);
          setIsConnected(false);
        },
        complete: () => {
          console.log('Subscription completed');
          setIsConnected(false);
        },
      },
    );

    unsubscribeRef.current = unsubscribe;
  };

  const stopTracking = () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    if (clientRef.current) {
      clientRef.current.dispose();
      clientRef.current = null;
    }
    setIsConnected(false);
  };

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  const getMessageColor = (type: string) => {
    switch (type) {
      case 'STATUS_UPDATE': return '#3498db';
      case 'LOCATION': return '#9b59b6';
      case 'ETA': return '#f39c12';
      case 'CONFIRMATION': return '#27ae60';
      case 'ERROR': return '#e74c3c';
      default: return '#7f8c8d';
    }
  };

  return (
    <div className="section">
      <h2>Interactive Order Tracking (Bidirectional Streaming)</h2>
      <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>
        Real-time order updates - the server automatically pushes status changes every 3 seconds
      </p>

      <div style={{ marginBottom: '20px' }}>
        <div className="form-group">
          <label>Order ID</label>
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Enter order ID (from Orders tab)"
            disabled={isConnected}
          />
        </div>

        {!isConnected ? (
          <button className="btn" onClick={startTracking}>
            Start Tracking
          </button>
        ) : (
          <button
            className="btn"
            onClick={stopTracking}
            style={{ backgroundColor: '#e74c3c' }}
          >
            Stop Tracking
          </button>
        )}
      </div>

      {error && (
        <div style={{
          padding: '15px',
          backgroundColor: '#ffe6e6',
          color: '#e74c3c',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {isConnected && (
        <div style={{
          padding: '10px',
          backgroundColor: '#e8f8f5',
          color: '#27ae60',
          borderRadius: '4px',
          marginBottom: '20px',
          fontWeight: 'bold'
        }}>
          🟢 Connected - Receiving updates...
        </div>
      )}

      {messages.length > 0 && (
        <div className="card">
          <h3>Tracking Messages ({messages.length})</h3>
          <div style={{ maxHeight: '500px', overflowY: 'auto', marginTop: '15px' }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  padding: '12px',
                  marginBottom: '10px',
                  backgroundColor: '#f9f9f9',
                  borderLeft: `4px solid ${getMessageColor(msg.type)}`,
                  borderRadius: '4px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{
                    fontWeight: 'bold',
                    color: getMessageColor(msg.type),
                    fontSize: '14px'
                  }}>
                    {msg.type}
                  </span>
                  <span style={{ fontSize: '12px', color: '#7f8c8d' }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div style={{ marginBottom: '5px' }}>
                  <strong>Status:</strong> {msg.status}
                </div>
                <div style={{ marginBottom: '5px' }}>
                  {msg.message}
                </div>
                {msg.location && (
                  <div style={{ color: '#9b59b6', fontWeight: 'bold' }}>
                    📍 Location: {msg.location}
                  </div>
                )}
                {msg.eta && (
                  <div style={{ color: '#f39c12', fontWeight: 'bold' }}>
                    ⏰ {msg.eta}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#ecf0f1', borderRadius: '4px' }}>
        <h4 style={{ marginTop: 0 }}>How Bidirectional Streaming Works:</h4>
        <ol style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
          <li>Client sends SUBSCRIBE query → Server starts automatic status updates</li>
          <li>Server pushes updates every 3 seconds: PAID → PROCESSING → SHIPPED → DELIVERED</li>
          <li>Client can send queries anytime (GET_LOCATION, GET_ETA, CANCEL_ORDER)</li>
          <li>Both streams run simultaneously over WebSocket</li>
        </ol>
        <p style={{ marginTop: '15px', color: '#7f8c8d', fontSize: '14px' }}>
          <strong>Note:</strong> Currently showing auto-updates only. To test queries, you would need
          to add interactive buttons (future enhancement).
        </p>
      </div>
    </div>
  );
}
