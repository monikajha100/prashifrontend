import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';
import './AdminCoupons.css';

const AdminCoupons = () => {
  const [activeTab, setActiveTab] = useState('coupons');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const queryClient = useQueryClient();
  const qrCanvasRef = useRef(null);

  // Mock data for demonstration - replace with actual API calls
  const mockCoupons = [
    {
      id: 1,
      code: 'WELCOME20',
      name: 'Welcome Discount',
      type: 'percentage',
      value: 20,
      minOrderAmount: 500,
      maxDiscount: 1000,
      usageLimit: 100,
      usedCount: 45,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'active',
      targetAudience: 'new_customers',
      description: '20% off for new customers',
      qrCode: 'https://praashibysupal.com/coupon/WELCOME20',
      createdAt: '2024-01-01',
      isExpiring: false
    },
    {
      id: 2,
      code: 'FLASH50',
      name: 'Flash Sale',
      type: 'fixed',
      value: 50,
      minOrderAmount: 200,
      maxDiscount: 50,
      usageLimit: 50,
      usedCount: 32,
      startDate: '2024-10-01',
      endDate: '2024-10-31',
      status: 'active',
      targetAudience: 'all',
      description: '₹50 off on orders above ₹200',
      qrCode: 'https://praashibysupal.com/coupon/FLASH50',
      createdAt: '2024-10-01',
      isExpiring: true
    },
    {
      id: 3,
      code: 'VIP15',
      name: 'VIP Customer Discount',
      type: 'percentage',
      value: 15,
      minOrderAmount: 1000,
      maxDiscount: 500,
      usageLimit: 10,
      usedCount: 10,
      startDate: '2024-09-01',
      endDate: '2024-09-30',
      status: 'expired',
      targetAudience: 'vip_customers',
      description: '15% off for VIP customers',
      qrCode: 'https://praashibysupal.com/coupon/VIP15',
      createdAt: '2024-09-01',
      isExpiring: false
    }
  ];

  const mockCampaigns = [
    {
      id: 1,
      name: 'Holiday Season Sale',
      description: 'Special discounts for holiday season',
      startDate: '2024-12-01',
      endDate: '2024-12-31',
      status: 'active',
      couponCount: 5,
      totalUsage: 150,
      targetAudience: 'all'
    },
    {
      id: 2,
      name: 'New Customer Acquisition',
      description: 'Welcome offers for new customers',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'active',
      couponCount: 3,
      totalUsage: 89,
      targetAudience: 'new_customers'
    }
  ];

  // Filter coupons based on search and filters
  const filteredCoupons = mockCoupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coupon.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || coupon.status === statusFilter;
    const matchesType = typeFilter === 'all' || coupon.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleCreateCoupon = () => {
    setShowCreateModal(true);
  };

  const handleGenerateQR = async (coupon) => {
    setSelectedCoupon(coupon);
    try {
      const qrUrl = await QRCode.toDataURL(coupon.qrCode);
      setQrCodeUrl(qrUrl);
      setShowQRModal(true);
    } catch (error) {
      toast.error('Error generating QR code');
    }
  };

  const handleToggleStatus = (coupon) => {
    const newStatus = coupon.status === 'active' ? 'inactive' : 'active';
    toast.success(`Coupon ${coupon.code} ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
  };

  const getStatusColor = (status) => {
    const colors = {
      active: '#10b981',
      inactive: '#6b7280',
      expired: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpiringSoon = (date) => {
    const expiryDate = new Date(date);
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return expiryDate <= sevenDaysFromNow && expiryDate > new Date();
  };

  const getUsagePercentage = (used, limit) => {
    return Math.round((used / limit) * 100);
  };

  return (
    <div className="admin-coupons">
      {/* Header */}
      <div className="coupons-header">
        <div>
          <h1>🎫 Coupons Management</h1>
          <p>Create and manage discount coupons and promotional codes</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={handleCreateCoupon}>
            🎫 Create Coupon
          </button>
          <button className="btn-secondary">
            📊 Analytics
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="coupons-tabs">
        <button 
          className={activeTab === 'coupons' ? 'tab-active' : 'tab'}
          onClick={() => setActiveTab('coupons')}
        >
          🎫 Coupons ({filteredCoupons.length})
        </button>
        <button 
          className={activeTab === 'campaigns' ? 'tab-active' : 'tab'}
          onClick={() => setActiveTab('campaigns')}
        >
          🎯 Campaigns ({mockCampaigns.length})
        </button>
        <button 
          className={activeTab === 'analytics' ? 'tab-active' : 'tab'}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
      </div>

      {/* Coupons Tab */}
      {activeTab === 'coupons' && (
        <div className="coupons-content">
          {/* Filters and Search */}
          <div className="coupons-filters">
            <div className="search-box">
              <input
                type="text"
                placeholder="🔍 Search coupons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-group">
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
              </select>
              <select 
                value={typeFilter} 
                onChange={(e) => setTypeFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Types</option>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
          </div>

          {/* Coupons Table */}
          <div className="coupons-table-container">
            <table className="coupons-table">
              <thead>
                <tr>
                  <th>Coupon Code</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Value</th>
                  <th>Usage</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className={isExpiringSoon(coupon.endDate) ? 'expiring-row' : ''}>
                    <td>
                      <div className="coupon-code">
                        <strong>{coupon.code}</strong>
                        {isExpiringSoon(coupon.endDate) && (
                          <span className="expiry-warning">⚠️ Expires Soon</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="coupon-info">
                        <strong>{coupon.name}</strong>
                        <div className="coupon-description">{coupon.description}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`coupon-type ${coupon.type}`}>
                        {coupon.type === 'percentage' ? '%' : '₹'}
                      </span>
                    </td>
                    <td>
                      <div className="coupon-value">
                        {coupon.type === 'percentage' ? `${coupon.value}%` : formatCurrency(coupon.value)}
                        {coupon.maxDiscount && (
                          <div className="max-discount">Max: {formatCurrency(coupon.maxDiscount)}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="usage-info">
                        <div className="usage-bar">
                          <div 
                            className="usage-fill"
                            style={{ width: `${getUsagePercentage(coupon.usedCount, coupon.usageLimit)}%` }}
                          ></div>
                        </div>
                        <div className="usage-text">
                          {coupon.usedCount}/{coupon.usageLimit} uses
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="expiry-info">
                        {formatDate(coupon.endDate)}
                      </div>
                    </td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(coupon.status) }}
                      >
                        {coupon.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-qr" 
                          onClick={() => handleGenerateQR(coupon)}
                          title="Generate QR Code"
                        >
                          📱
                        </button>
                        <button 
                          className="btn-toggle" 
                          onClick={() => handleToggleStatus(coupon)}
                          title={coupon.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          {coupon.status === 'active' ? '⏸️' : '▶️'}
                        </button>
                        <button className="btn-edit" title="Edit Coupon">✏️</button>
                        <button className="btn-copy" title="Copy Code">📋</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="campaigns-content">
          <div className="campaigns-grid">
            {mockCampaigns.map((campaign) => (
              <div key={campaign.id} className="campaign-card">
                <div className="campaign-header">
                  <h3>{campaign.name}</h3>
                  <span className={`campaign-status ${campaign.status}`}>
                    {campaign.status}
                  </span>
                </div>
                <div className="campaign-description">
                  {campaign.description}
                </div>
                <div className="campaign-stats">
                  <div className="stat">
                    <span className="stat-number">{campaign.couponCount}</span>
                    <span className="stat-label">Coupons</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{campaign.totalUsage}</span>
                    <span className="stat-label">Total Uses</span>
                  </div>
                </div>
                <div className="campaign-dates">
                  <div>Start: {formatDate(campaign.startDate)}</div>
                  <div>End: {formatDate(campaign.endDate)}</div>
                </div>
                <div className="campaign-actions">
                  <button className="btn-primary">View Coupons</button>
                  <button className="btn-secondary">Edit Campaign</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="analytics-content">
          <div className="analytics-grid">
            <div className="analytics-card">
              <h3>📊 Coupon Overview</h3>
              <div className="metric">
                <span className="metric-value">{mockCoupons.length}</span>
                <span className="metric-label">Total Coupons</span>
              </div>
              <div className="metric">
                <span className="metric-value">{mockCoupons.filter(c => c.status === 'active').length}</span>
                <span className="metric-label">Active</span>
              </div>
              <div className="metric">
                <span className="metric-value">{mockCoupons.filter(c => isExpiringSoon(c.endDate)).length}</span>
                <span className="metric-label">Expiring Soon</span>
              </div>
            </div>
            
            <div className="analytics-card">
              <h3>💰 Usage Statistics</h3>
              <div className="metric">
                <span className="metric-value">
                  {mockCoupons.reduce((sum, c) => sum + c.usedCount, 0)}
                </span>
                <span className="metric-label">Total Uses</span>
              </div>
              <div className="metric">
                <span className="metric-value">
                  {Math.round(mockCoupons.reduce((sum, c) => sum + c.usedCount, 0) / mockCoupons.length)}
                </span>
                <span className="metric-label">Avg Uses per Coupon</span>
              </div>
            </div>

            <div className="analytics-card">
              <h3>🎯 Campaign Performance</h3>
              <div className="metric">
                <span className="metric-value">{mockCampaigns.length}</span>
                <span className="metric-label">Active Campaigns</span>
              </div>
              <div className="metric">
                <span className="metric-value">
                  {mockCampaigns.reduce((sum, c) => sum + c.totalUsage, 0)}
                </span>
                <span className="metric-label">Total Campaign Uses</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Coupon Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>🎫 Create New Coupon</h3>
              <button onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form className="coupon-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Coupon Code</label>
                    <input type="text" placeholder="e.g., WELCOME20" />
                  </div>
                  <div className="form-group">
                    <label>Coupon Name</label>
                    <input type="text" placeholder="e.g., Welcome Discount" />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Discount Type</label>
                    <select>
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Discount Value</label>
                    <input type="number" placeholder="20" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Minimum Order Amount</label>
                    <input type="number" placeholder="500" />
                  </div>
                  <div className="form-group">
                    <label>Maximum Discount</label>
                    <input type="number" placeholder="1000" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Usage Limit</label>
                    <input type="number" placeholder="100" />
                  </div>
                  <div className="form-group">
                    <label>Target Audience</label>
                    <select>
                      <option value="all">All Customers</option>
                      <option value="new_customers">New Customers</option>
                      <option value="vip_customers">VIP Customers</option>
                      <option value="returning_customers">Returning Customers</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input type="date" />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input type="date" />
        </div>
      </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea rows="3" placeholder="Describe the coupon offer..."></textarea>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Create Coupon
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedCoupon && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>📱 QR Code - {selectedCoupon.code}</h3>
              <button onClick={() => setShowQRModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="qr-code-container">
                <img src={qrCodeUrl} alt="QR Code" className="qr-code-image" />
                <div className="qr-code-info">
                  <p><strong>Coupon:</strong> {selectedCoupon.name}</p>
                  <p><strong>Code:</strong> {selectedCoupon.code}</p>
                  <p><strong>URL:</strong> {selectedCoupon.qrCode}</p>
                </div>
              </div>
              <div className="qr-actions">
                <button className="btn-secondary" onClick={() => {
                  const link = document.createElement('a');
                  link.download = `qr-${selectedCoupon.code}.png`;
                  link.href = qrCodeUrl;
                  link.click();
                }}>
                  Download QR Code
                </button>
                <button className="btn-primary" onClick={() => {
                  navigator.clipboard.writeText(selectedCoupon.qrCode);
                  toast.success('URL copied to clipboard!');
                }}>
                  Copy URL
                </button>
              </div>
        </div>
      </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
