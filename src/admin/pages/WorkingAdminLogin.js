import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const WorkingAdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple validation - no API calls
    if (formData.email === 'admin@praashibysupal.com' && formData.password === 'admin123') {
      // Store admin session
      localStorage.setItem('adminToken', 'working-admin-token');
      localStorage.setItem('adminUser', JSON.stringify({
        id: 1,
        name: 'Admin User',
        email: 'admin@praashibysupal.com',
        role: 'admin'
      }));
      
      // Navigate to dashboard
      navigate('/admin/dashboard');
    } else {
      setError('Invalid credentials. Use admin@praashibysupal.com / admin123');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '40px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '30px' }}>
            <img 
              src="/logo.png" 
              alt="Praashi by Supal" 
              style={{ height: '60px', marginBottom: '20px' }}
            />
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#2C2C2C',
              marginBottom: '10px',
              fontFamily: "'Cormorant Garamond', serif"
            }}>
              Admin Login
            </h1>
            <p style={{
              color: '#666',
              fontSize: '1rem'
            }}>
              Sign in to access the admin panel
            </p>
          </div>

          {error && (
            <div style={{
              background: '#fee',
              color: '#c33',
              padding: '10px',
              borderRadius: '5px',
              marginBottom: '20px',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#2C2C2C'
              }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  border: '2px solid #e1e1e1',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#D4AF37'}
                onBlur={(e) => e.target.style.borderColor = '#e1e1e1'}
                required
                placeholder="admin@praashibysupal.com"
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#2C2C2C'
              }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  border: '2px solid #e1e1e1',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#D4AF37'}
                onBlur={(e) => e.target.style.borderColor = '#e1e1e1'}
                required
                placeholder="Enter your password"
              />
            </div>

            <button 
              type="submit" 
              style={{
                width: '100%',
                padding: '15px',
                background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                boxShadow: '0 5px 15px rgba(212, 175, 55, 0.3)'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(212, 175, 55, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 5px 15px rgba(212, 175, 55, 0.3)';
              }}
            >
              Sign In
            </button>
          </form>

          <div style={{
            marginTop: '30px',
            paddingTop: '20px',
            borderTop: '1px solid #e1e1e1'
          }}>
            <a 
              href="/" 
              style={{
                color: '#D4AF37',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              ← Back to Website
            </a>
          </div>

          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: '#f8f9fa',
            borderRadius: '8px',
            fontSize: '0.8rem',
            color: '#666'
          }}>
            <strong>Working Admin Credentials:</strong><br />
            Email: admin@praashibysupal.com<br />
            Password: admin123
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkingAdminLogin;
