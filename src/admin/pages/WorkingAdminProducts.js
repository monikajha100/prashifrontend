import React from 'react';

const WorkingAdminProducts = () => {
  const sampleProducts = [
    { id: 1, name: 'Victorian Ring Set', price: 2999, stock: 15, category: 'Rings', status: 'Active' },
    { id: 2, name: 'Color Changing Earrings', price: 1799, stock: 8, category: 'Earrings', status: 'Active' },
    { id: 3, name: 'Gold Necklace', price: 4500, stock: 5, category: 'Necklaces', status: 'Active' },
    { id: 4, name: 'Diamond Bracelet', price: 6200, stock: 3, category: 'Bracelets', status: 'Active' },
    { id: 5, name: 'Pearl Earrings', price: 2200, stock: 12, category: 'Earrings', status: 'Active' },
    { id: 6, name: 'Silver Ring', price: 1500, stock: 20, category: 'Rings', status: 'Active' }
  ];

  return (
    <div style={{ padding: '20px', background: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#2C2C2C',
              marginBottom: '10px',
              fontFamily: "'Cormorant Garamond', serif"
            }}>
              Products
            </h1>
            <p style={{ color: '#666', fontSize: '1.1rem' }}>
              Manage your product inventory
            </p>
          </div>
          <button style={{
            background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 5px 15px rgba(212, 175, 55, 0.3)'
          }}>
            Add New Product
          </button>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '25px',
          boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e1e1e1' }}>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#2C2C2C' }}>Product</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#2C2C2C' }}>Category</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#2C2C2C' }}>Price</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#2C2C2C' }}>Stock</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#2C2C2C' }}>Status</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#2C2C2C' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sampleProducts.map((product) => (
                  <tr key={product.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '50px',
                          height: '50px',
                          background: '#f0f0f0',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#999'
                        }}>
                          📷
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: '#2C2C2C' }}>{product.name}</div>
                          <div style={{ fontSize: '0.9rem', color: '#666' }}>ID: {product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '15px', color: '#666' }}>{product.category}</td>
                    <td style={{ padding: '15px', fontWeight: '600', color: '#2C2C2C' }}>₹{product.price}</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{
                        background: product.stock < 10 ? '#f8d7da' : '#d4edda',
                        color: product.stock < 10 ? '#721c24' : '#155724',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}>
                        {product.stock} units
                      </span>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <span style={{
                        background: product.status === 'Active' ? '#d4edda' : '#f8d7da',
                        color: product.status === 'Active' ? '#155724' : '#721c24',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}>
                        {product.status}
                      </span>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{
                          background: '#007bff',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '0.9rem',
                          cursor: 'pointer'
                        }}>
                          Edit
                        </button>
                        <button style={{
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '0.9rem',
                          cursor: 'pointer'
                        }}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkingAdminProducts;
