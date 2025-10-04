import React from 'react';

const AdminInventory = () => {
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '2px solid #e1e1e1'
      }}>
        <div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '2rem', 
            color: '#333',
            fontWeight: '700'
          }}>
            🏪 Inventory Management
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem', margin: '5px 0 0 0' }}>
            Manage product inventory and stock levels
          </p>
        </div>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🏪</div>
        <h2 style={{ color: '#333', marginBottom: '15px' }}>Inventory Management</h2>
        <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '30px' }}>
          Track and manage your product inventory, stock levels, and warehouse operations.
        </p>
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'left',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <h3 style={{ color: '#333', marginBottom: '15px' }}>Features Coming Soon:</h3>
          <ul style={{ color: '#666', lineHeight: '1.6' }}>
            <li>📦 Stock level tracking</li>
            <li>📊 Inventory reports</li>
            <li>⚠️ Low stock alerts</li>
            <li>📈 Stock movement history</li>
            <li>🏬 Multi-warehouse support</li>
            <li>📋 Stock adjustments</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminInventory;
