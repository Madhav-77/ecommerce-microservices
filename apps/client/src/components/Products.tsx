import { useState } from 'react';

function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual GraphQL query when gateway is ready
      const response = await fetch('/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query {
              products {
                id
                name
                price
                stock
              }
            }
          `,
        }),
      });
      const data = await response.json();
      setProducts(data.data?.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section">
      <h2>Products</h2>

      <button className="btn" onClick={fetchProducts} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Products'}
      </button>

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
