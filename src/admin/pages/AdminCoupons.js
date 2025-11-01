import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';
import { couponsAPI } from '../../services/api';
import './AdminCoupons.css';

const AdminCoupons = () => {
  const [activeTab, setActiveTab] = useState('coupons');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'percentage',
    value: '',
    min_order_amount: '',
    max_discount: '',
    usage_limit: '',
    start_date: '',
    end_date: '',
    target_audience: 'all',
    description: ''
  });
  const queryClient = useQueryClient();

  // Fetch coupons from API
  const { data: couponsData, isLoading, error } = useQuery(
    ['coupons', statusFilter, typeFilter, searchTerm],
    () => couponsAPI.getAllCoupons({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      type: typeFilter !== 'all' ? typeFilter : undefined,
      search: searchTerm || undefined
    }),
    {
      select: (response) => response.data,
      refetchOnWindowFocus: false
    }
  );

  // Delete coupon mutation
  const deleteCouponMutation = useMutation(
    (couponId) => {
      console.log('Calling deleteCoupon API with ID:', couponId);
      return couponsAPI.deleteCoupon(couponId);
    },
    {
      onSuccess: (response) => {
        console.log('Delete success:', response);
        console.log('Response data:', response.data);
        toast.success(response.data?.message || 'Coupon deleted successfully');
        queryClient.invalidateQueries(['coupons']);
      },
      onError: (error) => {
        console.error('Delete error:', error);
        console.error('Error response:', error.response);
        console.error('Error response data:', error.response?.data);
        const errorMsg = error.response?.data?.message || 
                        error.response?.data?.error ||
                        error.message || 
                        'Error deleting coupon';
        toast.error(errorMsg);
      }
    }
  );

  // Create/Update coupon mutation
  const saveCouponMutation = useMutation(
    (couponData) => {
      if (editingCoupon) {
        return couponsAPI.updateCoupon(editingCoupon.id, couponData);
      }
      return couponsAPI.createCoupon(couponData);
    },
    {
      onSuccess: (response) => {
        toast.success(response.data.message || `Coupon ${editingCoupon ? 'updated' : 'created'} successfully`);
        queryClient.invalidateQueries(['coupons']);
        setShowCreateModal(false);
        setShowEditModal(false);
        setEditingCoupon(null);
        resetForm();
      },
      onError: (error) => {
        console.error('Error saving coupon:', error);
        console.error('Error response:', error.response?.data);
        const errorMsg = error.response?.data?.message || 
                        error.response?.data?.errors?.[0]?.msg ||
                        error.response?.data?.errors?.[0]?.message ||
                        error.message ||
                        `Error ${editingCoupon ? 'updating' : 'creating'} coupon`;
        toast.error(errorMsg);
      }
    }
  );

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      type: 'percentage',
      value: '',
      min_order_amount: '',
      max_discount: '',
      usage_limit: '',
      start_date: '',
      end_date: '',
      target_audience: 'all',
      description: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateCoupon = () => {
    setEditingCoupon(null);
    resetForm();
    setShowCreateModal(true);
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code || '',
      name: coupon.name || '',
      type: coupon.type || 'percentage',
      value: coupon.value || '',
      min_order_amount: coupon.min_order_amount || '',
      max_discount: coupon.max_discount || '',
      usage_limit: coupon.usage_limit || '',
      start_date: coupon.start_date ? coupon.start_date.split('T')[0] : '',
      end_date: coupon.end_date ? coupon.end_date.split('T')[0] : '',
      target_audience: coupon.target_audience || 'all',
      description: coupon.description || ''
    });
    setShowEditModal(true);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon code "${code}" copied to clipboard!`);
  };

  const handleGenerateQR = async (coupon) => {
    setSelectedCoupon(coupon);
    try {
      const siteUrl = window.location.origin;
      const qrUrlString = `${siteUrl}/checkout?coupon=${coupon.code}`;
      const qrUrl = await QRCode.toDataURL(qrUrlString);
      setQrCodeUrl(qrUrl);
      setShowQRModal(true);
    } catch (error) {
      toast.error('Error generating QR code');
    }
  };

  const handleDelete = async (coupon) => {
    const usedCount = parseInt(coupon.used_count || coupon.usedCount || 0);
    const action = usedCount > 0 ? 'deactivate' : 'delete';
    
    if (window.confirm(`Are you sure you want to ${action} the coupon "${coupon.code}"?`)) {
      try {
        console.log('Deleting coupon:', coupon.id, coupon.code);
        await deleteCouponMutation.mutateAsync(coupon.id);
      } catch (error) {
        console.error('Failed to delete coupon:', error);
        // Error is already handled in mutation onError
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.code || !formData.name || !formData.value || !formData.start_date || !formData.end_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Prepare data
    const couponData = {
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      type: formData.type,
      value: parseFloat(formData.value),
      min_order_amount: parseFloat(formData.min_order_amount || 0),
      max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
      usage_limit: parseInt(formData.usage_limit),
      start_date: formData.start_date,
      end_date: formData.end_date,
      target_audience: formData.target_audience,
      description: formData.description || ''
    };

    saveCouponMutation.mutate(couponData);
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
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpiringSoon = (date) => {
    if (!date) return false;
    const expiryDate = new Date(date);
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return expiryDate <= sevenDaysFromNow && expiryDate > new Date();
  };

  const getUsagePercentage = (used, limit) => {
    if (!limit || limit === 0) return 0;
    return Math.min(100, Math.round((used / limit) * 100));
  };

  const coupons = couponsData?.coupons || [];
  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = !searchTerm || 
      coupon.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const mockCampaigns = [];

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
        <button 
          className={activeTab === 'usage' ? 'tab-active' : 'tab'}
          onClick={() => setActiveTab('usage')}
        >
          📋 Usage History
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

          {/* Loading State */}
          {isLoading && (
            <div className="loading">Loading coupons...</div>
          )}

          {/* Error State */}
          {error && (
            <div className="error">Error loading coupons: {error.message}</div>
          )}

          {/* Coupons Table */}
          {!isLoading && !error && (
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
                  {filteredCoupons.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                        No coupons found
                      </td>
                    </tr>
                  ) : (
                    filteredCoupons.map((coupon) => {
                      const usedCount = parseInt(coupon.used_count || coupon.usedCount || 0);
                      const usageLimit = parseInt(coupon.usage_limit || 0);
                      // Ensure status is properly set - check both status and is_active
                      const couponStatus = coupon.status || (coupon.is_active === 1 || coupon.is_active === true ? 'active' : 'inactive');
                      const isActive = couponStatus === 'active';
                      
                      return (
                        <tr key={coupon.id} className={isExpiringSoon(coupon.end_date) ? 'expiring-row' : ''}>
                          <td>
                            <div className="coupon-code">
                              <strong>{coupon.code}</strong>
                              {isExpiringSoon(coupon.end_date) && (
                                <span className="expiry-warning">⚠️ Expires Soon</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="coupon-info">
                              <strong>{coupon.name}</strong>
                              <div className="coupon-description">{coupon.description || ''}</div>
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
                              {coupon.max_discount && (
                                <div className="max-discount">Max: {formatCurrency(coupon.max_discount)}</div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="usage-info">
                              <div className="usage-bar">
                                <div 
                                  className="usage-fill"
                                  style={{ width: `${getUsagePercentage(usedCount, usageLimit)}%` }}
                                ></div>
                              </div>
                              <div className="usage-text">
                                {usedCount}/{usageLimit} uses
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="expiry-info">
                              {formatDate(coupon.end_date)}
                            </div>
                          </td>
                          <td>
                            <span 
                              className="status-badge"
                              style={{ backgroundColor: getStatusColor(couponStatus) }}
                            >
                              {couponStatus}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                className="btn-qr" 
                                onClick={() => handleGenerateQR(coupon)}
                                title="Generate QR Code"
                                type="button"
                              >
                                📱
                              </button>
                              <button 
                                className="btn-edit" 
                                onClick={() => handleEdit(coupon)}
                                title="Edit Coupon"
                                type="button"
                              >
                                ✏️
                              </button>
                              <button 
                                className="btn-copy" 
                                onClick={() => handleCopyCode(coupon.code)}
                                title="Copy Code"
                              >
                                📋
                              </button>
                              <button 
                                className="btn-delete" 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDelete(coupon);
                                }}
                                title="Delete Coupon"
                                type="button"
                                disabled={deleteCouponMutation.isLoading}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="campaigns-content">
          <div className="no-data">Campaigns feature coming soon...</div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="analytics-content">
          <div className="no-data">Analytics feature coming soon...</div>
        </div>
      )}

      {/* Usage History Tab */}
      {activeTab === 'usage' && (
        <div className="usage-content">
          <CouponUsageHistory />
        </div>
      )}

      {/* Create Coupon Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🎫 Create New Coupon</h3>
              <button onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form className="coupon-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Coupon Code *</label>
                    <input 
                      type="text" 
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      placeholder="e.g., WELCOME20" 
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Coupon Name *</label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Welcome Discount" 
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Discount Type *</label>
                    <select name="type" value={formData.type} onChange={handleInputChange} required>
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Discount Value *</label>
                    <input 
                      type="number" 
                      name="value"
                      value={formData.value}
                      onChange={handleInputChange}
                      placeholder={formData.type === 'percentage' ? "20" : "100"} 
                      min="0"
                      step={formData.type === 'percentage' ? "1" : "0.01"}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Minimum Order Amount *</label>
                    <input 
                      type="number" 
                      name="min_order_amount"
                      value={formData.min_order_amount}
                      onChange={handleInputChange}
                      placeholder="500" 
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Maximum Discount</label>
                    <input 
                      type="number" 
                      name="max_discount"
                      value={formData.max_discount}
                      onChange={handleInputChange}
                      placeholder="1000 (for percentage only)" 
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Usage Limit *</label>
                    <input 
                      type="number" 
                      name="usage_limit"
                      value={formData.usage_limit}
                      onChange={handleInputChange}
                      placeholder="100" 
                      min="1"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Target Audience</label>
                    <select name="target_audience" value={formData.target_audience} onChange={handleInputChange}>
                      <option value="all">All Customers</option>
                      <option value="new_customers">New Customers</option>
                      <option value="vip_customers">VIP Customers</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date *</label>
                    <input 
                      type="date" 
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date *</label>
                    <input 
                      type="date" 
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    rows="3" 
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the coupon offer..."
                  ></textarea>
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => setShowCreateModal(false)}
                    disabled={saveCouponMutation.isLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={saveCouponMutation.isLoading}
                  >
                    {saveCouponMutation.isLoading ? 'Creating...' : 'Create Coupon'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Coupon Modal */}
      {showEditModal && editingCoupon && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✏️ Edit Coupon</h3>
              <button onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form className="coupon-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Coupon Code *</label>
                    <input 
                      type="text" 
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      required
                      disabled
                    />
                    <small style={{ color: '#6b7280' }}>Code cannot be changed</small>
                  </div>
                  <div className="form-group">
                    <label>Coupon Name *</label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Discount Type *</label>
                    <select name="type" value={formData.type} onChange={handleInputChange} required>
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Discount Value *</label>
                    <input 
                      type="number" 
                      name="value"
                      value={formData.value}
                      onChange={handleInputChange}
                      min="0"
                      step={formData.type === 'percentage' ? "1" : "0.01"}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Minimum Order Amount *</label>
                    <input 
                      type="number" 
                      name="min_order_amount"
                      value={formData.min_order_amount}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Maximum Discount</label>
                    <input 
                      type="number" 
                      name="max_discount"
                      value={formData.max_discount}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Usage Limit *</label>
                    <input 
                      type="number" 
                      name="usage_limit"
                      value={formData.usage_limit}
                      onChange={handleInputChange}
                      min="1"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Target Audience</label>
                    <select name="target_audience" value={formData.target_audience} onChange={handleInputChange}>
                      <option value="all">All Customers</option>
                      <option value="new_customers">New Customers</option>
                      <option value="vip_customers">VIP Customers</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date *</label>
                    <input 
                      type="date" 
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date *</label>
                    <input 
                      type="date" 
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    rows="3" 
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => setShowEditModal(false)}
                    disabled={saveCouponMutation.isLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={saveCouponMutation.isLoading}
                  >
                    {saveCouponMutation.isLoading ? 'Updating...' : 'Update Coupon'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedCoupon && (
        <div className="modal-overlay" onClick={() => setShowQRModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
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
                  const siteUrl = window.location.origin;
                  navigator.clipboard.writeText(`${siteUrl}/checkout?coupon=${selectedCoupon.code}`);
                  toast.success('Coupon URL copied to clipboard!');
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

// Coupon Usage History Component
const CouponUsageHistory = () => {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, error } = useQuery(
    ['couponUsage', page],
    () => couponsAPI.getUsageHistory({ page, limit }),
    {
      select: (response) => response.data
    }
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toFixed(2)}`;
  };

  if (isLoading) {
    return <div className="loading">Loading usage history...</div>;
  }

  if (error) {
    return <div className="error">Error loading usage history: {error.message}</div>;
  }

  const { usageHistory = [], pagination } = data || {};

  return (
    <div className="usage-history">
      <h2>Coupon Usage History</h2>
      
      {usageHistory.length === 0 ? (
        <div className="no-data">No coupon usage found.</div>
      ) : (
        <>
          <div className="usage-table-container">
            <table className="usage-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Coupon Code</th>
                  <th>Order Number</th>
                  <th>Customer</th>
                  <th>Order Total</th>
                  <th>Discount</th>
                </tr>
              </thead>
              <tbody>
                {usageHistory.map((usage) => (
                  <tr key={usage.id}>
                    <td>{formatDate(usage.used_at)}</td>
                    <td>
                      <strong>{usage.coupon_code || 'N/A'}</strong>
                      {usage.coupon_name && (
                        <div className="coupon-name-text">{usage.coupon_name}</div>
                      )}
                    </td>
                    <td>{usage.order_number || 'N/A'}</td>
                    <td>
                      {usage.user_name || usage.user_email || 'Guest'}
                      {usage.user_email && (
                        <div className="user-email-text">{usage.user_email}</div>
                      )}
                    </td>
                    <td>{formatCurrency(usage.order_total)}</td>
                    <td className="discount-amount">{formatCurrency(usage.discount_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!pagination.hasPrev}
                className="pagination-btn"
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button 
                onClick={() => setPage(p => p + 1)}
                disabled={!pagination.hasNext}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}

          <div className="usage-summary">
            <p>Total Usage Records: {pagination?.totalUsage || 0}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminCoupons;
