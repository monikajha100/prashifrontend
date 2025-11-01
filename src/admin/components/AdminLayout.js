import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaHome, FaBox, FaTags, FaShoppingCart, FaUsers, FaCog, FaSignOutAlt, FaCreditCard, FaFileInvoice, FaImage, FaBullhorn, FaGift, FaEnvelope } from 'react-icons/fa';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  useEffect(() => {
    // Check if user is admin
    if (!adminUser.role || adminUser.role !== 'admin') {
      navigate('/admin/login');
    }
  }, [adminUser.role, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: FaHome },
    { path: '/admin/products', label: 'Products', icon: FaBox },
    { path: '/admin/categories', label: 'Categories', icon: FaTags },
    { path: '/admin/banners', label: 'Banners', icon: FaImage },
    { path: '/admin/promotional-banners', label: 'Promotional Banners', icon: FaBullhorn },
    { path: '/admin/special-offers', label: 'Special Offers', icon: FaGift },
    { path: '/admin/orders', label: 'Orders', icon: FaShoppingCart },
    { path: '/admin/invoices', label: 'Invoices', icon: FaFileInvoice },
    { path: '/admin/customers', label: 'Customers', icon: FaUsers },
    { path: '/admin/contacts', label: 'Contacts', icon: FaEnvelope },
    { path: '/admin/payment-settings', label: 'Payment Settings', icon: FaCreditCard },
    { path: '/admin/users', label: 'Users', icon: FaUsers },
    { path: '/admin/settings', label: 'Settings', icon: FaCog }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src="/logo.png" alt="Praashi by Supal" className="admin-logo" />
          <h2>Admin Panel</h2>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
            >
              <item.icon />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        {/* Top Bar */}
        <div className="admin-topbar">
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
          
          <div className="topbar-content">
            <h1>Admin Panel</h1>
            <div className="admin-user">
              <span>Welcome, {adminUser.name}</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="admin-content">
          {children || <Outlet />}
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
