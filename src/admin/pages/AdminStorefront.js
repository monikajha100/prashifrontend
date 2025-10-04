import React from 'react';

const AdminStorefront = () => {
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
            🏬 Storefront Management
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem', margin: '5px 0 0 0' }}>
            Customize and manage your online store appearance
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
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🏬</div>
        <h2 style={{ color: '#333', marginBottom: '15px' }}>Storefront Management</h2>
        <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '30px' }}>
          Customize your online store's appearance, layout, and branding.
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
            <li>🎨 Theme customization</li>
            <li>🏠 Homepage layout</li>
            <li>🎯 Featured sections</li>
            <li>📱 Mobile optimization</li>
            <li>🔧 Widget management</li>
            <li>📊 Store analytics</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminStorefront;
