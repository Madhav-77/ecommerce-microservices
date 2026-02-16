import { useState } from 'react';

interface Product {
  name: string;
  price: number;
  stock: number;
}

interface BulkUploadResult {
  total_received: number;
  created: number;
  failed: number;
  errors: { product_name: string; error_message: string }[];
}

function BulkUpload() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BulkUploadResult | null>(null);
  const [csvInput, setCsvInput] = useState('');

  const parseCsv = () => {
    try {
      const lines = csvInput.trim().split('\n');
      if (lines.length < 2) {
        alert('CSV must have at least a header and one data row');
        return;
      }

      // Skip header line (name,price,stock)
      const parsed: Product[] = [];
      for (let i = 1; i < lines.length; i++) {
        const [name, priceStr, stockStr] = lines[i].split(',').map(s => s.trim());

        if (!name || !priceStr || !stockStr) {
          alert(`Invalid row ${i + 1}: Missing fields`);
          return;
        }

        const price = parseFloat(priceStr);
        const stock = parseInt(stockStr, 10);

        if (isNaN(price) || isNaN(stock)) {
          alert(`Invalid row ${i + 1}: Price and stock must be numbers`);
          return;
        }

        parsed.push({ name, price, stock });
      }

      setProducts(parsed);
      alert(`Parsed ${parsed.length} products successfully!`);
    } catch (error) {
      alert(`Failed to parse CSV: ${error}`);
    }
  };

  const uploadProducts = async () => {
    if (products.length === 0) {
      alert('No products to upload. Parse CSV first.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation BulkCreateProducts($products: [CreateProductInput!]!) {
              bulkCreateProducts(products: $products) {
                total_received
                created
                failed
                errors {
                  product_name
                  error_message
                }
              }
            }
          `,
          variables: {
            products,
          },
        }),
      });

      const data = await response.json();

      if (data.data?.bulkCreateProducts) {
        setResult(data.data.bulkCreateProducts);
      } else if (data.errors) {
        alert(`Error: ${data.errors[0]?.message || 'Failed to upload products'}`);
      }
    } catch (error) {
      console.error('Error uploading products:', error);
      alert('Network error: Failed to upload products');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => {
    const sampleCsv = `name,price,stock
iPhone 14 Pro,999.99,50
MacBook Air M2,1199.99,30
AirPods Pro,249.99,100
iPad Air,599.99,75
Apple Watch Series 8,399.99,60`;
    setCsvInput(sampleCsv);
  };

  return (
    <div className="section">
      <h2>Bulk Product Upload (Client Streaming RPC)</h2>
      <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>
        Upload multiple products at once using CSV format
      </p>

      <div style={{ marginBottom: '20px' }}>
        <button className="btn" onClick={loadSample} style={{ marginBottom: '10px' }}>
          Load Sample CSV
        </button>

        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
          CSV Input (name,price,stock)
        </label>
        <textarea
          value={csvInput}
          onChange={(e) => setCsvInput(e.target.value)}
          placeholder="name,price,stock&#10;iPhone 14,999.99,50&#10;MacBook Pro,1999.99,25"
          rows={10}
          style={{
            width: '100%',
            padding: '10px',
            fontFamily: 'monospace',
            fontSize: '14px',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        />

        <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
          <button className="btn" onClick={parseCsv}>
            Parse CSV ({products.length} products ready)
          </button>
          <button
            className="btn"
            onClick={uploadProducts}
            disabled={loading || products.length === 0}
            style={{
              backgroundColor: products.length > 0 ? '#27ae60' : '#95a5a6',
            }}
          >
            {loading ? 'Uploading...' : `Upload ${products.length} Products`}
          </button>
        </div>
      </div>

      {result && (
        <div className="card" style={{ marginTop: '20px' }}>
          <h3>Upload Results</h3>
          <div style={{ marginTop: '10px' }}>
            <p>
              <strong>Total Received:</strong> {result.total_received}
            </p>
            <p style={{ color: '#27ae60' }}>
              <strong>Created:</strong> {result.created}
            </p>
            <p style={{ color: result.failed > 0 ? '#e74c3c' : '#7f8c8d' }}>
              <strong>Failed:</strong> {result.failed}
            </p>
          </div>

          {result.errors.length > 0 && (
            <details style={{ marginTop: '15px' }}>
              <summary style={{ cursor: 'pointer', color: '#e74c3c', fontWeight: 'bold' }}>
                View {result.errors.length} Error(s)
              </summary>
              <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                {result.errors.map((error, index) => (
                  <li key={index} style={{ marginBottom: '5px' }}>
                    <strong>{error.product_name}:</strong> {error.error_message}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#ecf0f1', borderRadius: '4px' }}>
        <h4 style={{ marginTop: 0 }}>How it works:</h4>
        <ol style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
          <li>Paste CSV data (or load sample)</li>
          <li>Click "Parse CSV" to validate</li>
          <li>Click "Upload" - Gateway converts array → Observable stream</li>
          <li>Product Service receives stream via gRPC Client Streaming</li>
          <li>Service processes all products and returns summary</li>
        </ol>
      </div>
    </div>
  );
}

export default BulkUpload;
