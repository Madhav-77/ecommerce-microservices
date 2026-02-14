import { useState, useEffect } from 'react';
import type { Product, CartItem } from '../types/interfaces';

interface ProductsProps {
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
}

function Products({ cart, onAddToCart }: ProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
  });

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query GetProducts($page: Float, $limit: Float) {
              getProducts(page: $page, limit: $limit) {
                products {
                  id
                  name
                  price
                  stock
                }
                total
              }
            }
          `,
          variables: { page: 1, limit: 50 },
        }),
      });
      const data = await response.json();
      if (data.data?.getProducts) {
        setProducts(data.data.getProducts.products || []);
      } else if (data.errors) {
        console.error('GraphQL errors:', data.errors);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation CreateProduct($input: CreateProductInput!) {
              createProduct(input: $input) {
                id
                name
                price
                stock
              }
            }
          `,
          variables: {
            input: {
              name: formData.name,
              price: parseFloat(formData.price),
              stock: parseInt(formData.stock),
            },
          },
        }),
      });
      const data = await response.json();
      if (data.data?.createProduct) {
        setProducts([...products, data.data.createProduct]);
        setShowCreateForm(false);
        alert('Product created successfully!');
      } else if (data.errors) {
        alert(`Error: ${data.errors[0]?.message || 'Failed to create product'}`);
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Network error: Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const getCartQuantity = (productId: string): number => {
    const cartItem = cart.find(item => item.product.id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  return (
    <div className="section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Products</h2>
        <button
          className="btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{ backgroundColor: showCreateForm ? '#e74c3c' : '#27ae60' }}
        >
          {showCreateForm ? 'Cancel' : '+ Create Product'}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={createProduct} style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h3>Create New Product</h3>
          <div className="form-group">
            <label>Product Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Price ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Stock</label>
            <input
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Creating...' : 'Create Product'}
          </button>
        </form>
      )}

      {loading && !showCreateForm && <p>Loading products...</p>}

      {products.length > 0 && (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
          {products.map((product) => {
            const cartQty = getCartQuantity(product.id);
            return (
              <div key={product.id} className="card" style={{ position: 'relative' }}>
                <h3>{product.name}</h3>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#27ae60' }}>${product.price.toFixed(2)}</p>
                <p style={{ color: product.stock > 0 ? '#3498db' : '#e74c3c' }}>
                  Stock: {product.stock} units
                </p>
                {cartQty > 0 && (
                  <p style={{
                    backgroundColor: '#3498db',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    display: 'inline-block',
                    fontSize: '12px',
                    marginTop: '5px'
                  }}>
                    {cartQty} in cart
                  </p>
                )}
                <button
                  className="btn"
                  onClick={() => onAddToCart(product)}
                  disabled={product.stock === 0}
                  style={{
                    marginTop: '10px',
                    width: '100%',
                    backgroundColor: product.stock === 0 ? '#95a5a6' : '#3498db'
                  }}
                >
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {!loading && products.length === 0 && (
        <p style={{ marginTop: '20px', color: '#7f8c8d', textAlign: 'center' }}>
          No products available. Create your first product!
        </p>
      )}
    </div>
  );
}

export default Products;
