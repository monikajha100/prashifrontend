import React from 'react';

const AdminContracts = () => {
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
            📄 Contracts Management
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem', margin: '5px 0 0 0' }}>
            Manage business contracts and legal agreements
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
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📄</div>
        <h2 style={{ color: '#333', marginBottom: '15px' }}>Contracts Management</h2>
        <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '30px' }}>
          Manage business contracts, agreements, and legal documentation.
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
            <li>📋 Contract templates</li>
            <li>✍️ Digital signatures</li>
            <li>📅 Renewal reminders</li>
            <li>📊 Contract analytics</li>
            <li>🔍 Document search</li>
            <li>📱 Mobile access</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminContracts;
