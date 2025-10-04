import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const WorkingAdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/admin/products', icon: '📦', label: 'Products' },
    { path: '/admin/categories', icon: '🏷️', label: 'Categories' },
    { path: '/admin/subcategories', icon: '📂', label: 'Subcategories' },
    { path: '/admin/inventory', icon: '🏪', label: 'Inventory' },
    { path: '/admin/orders', icon: '🛒', label: 'Orders' },
    { path: '/admin/invoices', icon: '📄', label: 'Invoices' },
    { path: '/admin/payment-settings', icon: '💳', label: 'Payment Settings' },
    { path: '/admin/users', icon: '👥', label: 'Users' },
    { path: '/admin/partners', icon: '🤝', label: 'Partners' },
    { path: '/admin/contracts', icon: '📄', label: 'Contracts' },
    { path: '/admin/coupons', icon: '🎫', label: 'Coupons' },
    { path: '/admin/storefront', icon: '🏬', label: 'Storefront' },
    { path: '/admin/insta-shop', icon: '📸', label: 'Insta Shop' },
    { path: '/admin/footer-pages', icon: '📝', label: 'Footer Pages' },
    { path: '/admin/banners', icon: '🖼️', label: 'Banners' },
    { path: '/admin/contacts', icon: '📧', label: 'Contacts' },
    { path: '/admin/reports', icon: '📈', label: 'Reports' },
    { path: '/admin/settings', icon: '⚙️', label: 'Settings' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <style>
        {`
          /* Custom scrollbar for webkit browsers */
          .admin-sidebar-nav::-webkit-scrollbar {
            width: 6px;
          }
          
          .admin-sidebar-nav::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
          }
          
          .admin-sidebar-nav::-webkit-scrollbar-thumb {
            background: #D4AF37;
            border-radius: 3px;
          }
          
          .admin-sidebar-nav::-webkit-scrollbar-thumb:hover {
            background: #B8941F;
          }
        `}
      </style>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Sidebar */}
      <div 
        className="admin-sidebar"
        style={{
          width: sidebarOpen ? '250px' : '70px',
          background: 'white',
          boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          position: 'fixed',
          height: '100vh',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{ 
          padding: '20px',
          borderBottom: '1px solid #e1e1e1',
          flexShrink: 0
        }}>
          {/* Logo */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarOpen ? 'flex-start' : 'center'
          }}>
            {sidebarOpen ? (
              <>
                <img 
                  src="/logo.png" 
                  alt="Praashi by Supal" 
                  style={{ height: '40px', marginRight: '10px' }}
                />
                <div>
                  <h2 style={{
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    color: '#2C2C2C',
                    margin: '0',
                    fontFamily: "'Cormorant Garamond', serif",
                    whiteSpace: 'nowrap'
                  }}>
                    Admin Panel
                  </h2>
                </div>
              </>
            ) : (
              <div style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#D4AF37'
              }}>
                👑
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Navigation */}
        <div 
          className="admin-sidebar-nav"
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '20px',
            paddingTop: '10px',
            // Custom scrollbar styling for Firefox
            scrollbarWidth: 'thin',
            scrollbarColor: '#D4AF37 #f1f1f1'
          }}
        >
          <nav>
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                title={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  padding: '12px 15px',
                  marginBottom: '5px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: isActive(item.path) ? '#D4AF37' : '#666',
                  background: isActive(item.path) ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                  fontWeight: isActive(item.path) ? '600' : '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  if (!isActive(item.path)) {
                    e.target.style.background = 'rgba(212, 175, 55, 0.05)';
                    e.target.style.color = '#D4AF37';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive(item.path)) {
                    e.target.style.background = 'transparent';
                    e.target.style.color = '#666';
                  }
                }}
              >
                <span style={{ 
                  marginRight: sidebarOpen ? '12px' : '0', 
                  fontSize: '1.3rem'
                }}>
                  {item.icon}
                </span>
                {sidebarOpen && (
                  <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div style={{ 
          padding: '20px',
          borderTop: '1px solid #e1e1e1',
          flexShrink: 0
        }}>
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title="Logout"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              width: '100%',
              padding: '12px 15px',
              background: 'none',
              border: 'none',
              borderRadius: '8px',
              color: '#dc3545',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(220, 53, 69, 0.1)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'transparent';
            }}
          >
            <span style={{ 
              marginRight: sidebarOpen ? '12px' : '0', 
              fontSize: '1.3rem'
            }}>
              🚪
            </span>
            {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div 
        className="admin-content"
        style={{
          flex: 1,
          marginLeft: sidebarOpen ? '250px' : '70px',
          transition: 'margin-left 0.3s ease'
        }}
      >
        {/* Header */}
        <header style={{
          background: 'white',
          padding: '15px 30px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              color: '#2C2C2C',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '5px',
              transition: 'background 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.background = 'rgba(0,0,0,0.05)'}
            onMouseOut={(e) => e.target.style.background = 'transparent'}
          >
            {sidebarOpen ? '✕' : '☰'}
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 15px',
              background: 'rgba(212, 175, 55, 0.1)',
              borderRadius: '20px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                background: '#28a745',
                borderRadius: '50%'
              }}></div>
              <span style={{
                fontSize: '0.9rem',
                color: '#2C2C2C',
                fontWeight: '500'
              }}>
                Working Admin
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main>
          {children}
        </main>
      </div>
    </div>
    </>
  );
};

export default WorkingAdminLayout;
