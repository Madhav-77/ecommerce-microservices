import { useState } from 'react';
import { graphqlClient } from '../lib/graphql-client';

function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  const testConnection = async () => {
    setLoading(true);
    setMessage('');
    try {
      const data = await graphqlClient.request<{ hello: string; status: string }>(`
        query {
          hello
          status
        }
      `);
      setMessage(`✅ Gateway Connected!\n${data.hello}\n${data.status}`);
      console.log('Gateway response:', data);
    } catch (error) {
      console.error('Error connecting to gateway:', error);
      setMessage(`❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setMessage('');
    try {
      const data = await graphqlClient.request<{ products: any[] }>(`
        query {
          products {
            id
            name
            price
            stock
          }
        }
      `);
      setProducts(data.products || []);
      setMessage('✅ Products loaded successfully!');
    } catch (error) {
      console.error('Error fetching products:', error);
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section">
      <h2>Products</h2>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button className="btn" onClick={testConnection} disabled={loading}>
          {loading ? 'Testing...' : 'Test Gateway Connection'}
        </button>
        <button className="btn" onClick={fetchProducts} disabled={loading}>
          {loading ? 'Loading...' : 'Fetch Products'}
        </button>
      </div>

      {message && (
        <div style={{
          padding: '15px',
          marginBottom: '20px',
          borderRadius: '5px',
          backgroundColor: message.startsWith('✅') ? '#d4edda' : '#f8d7da',
          color: message.startsWith('✅') ? '#155724' : '#721c24',
          whiteSpace: 'pre-line'
        }}>
          {message}
        </div>
      )}

      {products.length > 0 && (
        <div className="grid" style={{ marginTop: '20px' }}>
          {products.map((product) => (
            <div key={product.id} className="card">
              <h3>{product.name}</h3>
              <p>Price: ${product.price}</p>
              <p>Stock: {product.stock} units</p>
            </div>
          ))}
        </div>
      )}

      {!loading && products.length === 0 && (
        <p style={{ marginTop: '20px', color: '#7f8c8d' }}>
          No products loaded. Click "Fetch Products" to load data.
        </p>
      )}
    </div>
  );
}

export default Products;
