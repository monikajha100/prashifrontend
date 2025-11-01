import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { adminAPI } from '../../services/api';
import { Helmet } from 'react-helmet-async';
import AdminLayout from '../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import './InventoryManagement.css';

const InventoryManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const queryClient = useQueryClient();

  // Fetch inventory summary
  const { data: summary, isLoading: summaryLoading } = useQuery(
    'inventorySummary',
    () => adminAPI.getInventorySummary(),
    {
      select: (response) => response.data
    }
  );

  // Fetch stock levels
  const { data: stockLevels, isLoading: stockLevelsLoading } = useQuery(
    ['stockLevels'],
    () => adminAPI.getStockLevels({ 
      low_stock: 'true'
    }),
    {
      select: (response) => response.data
    }
  );

  // Fetch low stock alerts
  const { data: lowStockAlerts, isLoading: alertsLoading } = useQuery(
    ['lowStockAlerts'],
    () => adminAPI.getLowStockAlerts({ 
      is_resolved: 'false'
    }),
    {
      select: (response) => response.data
    }
  );

  const tabs = [
    { id: 'overview', label: '📊 Overview', component: <InventoryOverview summary={summary} stockLevels={stockLevels} lowStockAlerts={lowStockAlerts} /> },
    { id: 'stock-levels', label: '📦 Stock Levels', component: <StockLevelsManagement /> },
    { id: 'movements', label: '📈 Movements', component: <StockMovementsManagement /> },
    { id: 'adjustments', label: '📋 Adjustments', component: <StockAdjustmentsManagement /> },
    { id: 'alerts', label: '⚠️ Alerts', component: <LowStockAlertsManagement /> },
    { id: 'reports', label: '📊 Reports', component: <InventoryReports /> }
  ];

  if (summaryLoading) {
    return (
      <AdminLayout>
        <LoadingSpinner text="Loading inventory data..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <>
        <Helmet>
          <title>Inventory Management - Admin Panel</title>
        </Helmet>

        <div className="inventory-management">
          <div className="page-header">
            <h1>📦 Inventory Management</h1>
          </div>

          <div className="inventory-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="tab-content">
            {tabs.find(tab => tab.id === activeTab)?.component}
          </div>
        </div>
      </>
    </AdminLayout>
  );
};

// Inventory Overview Component
const InventoryOverview = ({ summary, stockLevels, lowStockAlerts }) => {
  return (
    <div className="inventory-overview">
      <div className="overview-stats">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-value">{summary?.total_products || 0}</div>
            <div className="stat-label">Total Products</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{summary?.total_stock || 0}</div>
            <div className="stat-label">Total Stock</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">₹{summary?.total_value?.toLocaleString() || 0}</div>
            <div className="stat-label">Total Value</div>
          </div>
        </div>
        
        <div className="stat-card alert">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-value">{summary?.low_stock_count || 0}</div>
            <div className="stat-label">Low Stock</div>
          </div>
        </div>
        
        <div className="stat-card danger">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <div className="stat-value">{summary?.out_of_stock_count || 0}</div>
            <div className="stat-label">Out of Stock</div>
          </div>
        </div>
      </div>

      <div className="overview-sections">
        <div className="section">
          <h3>⚠️ Low Stock Alerts</h3>
          <div className="alerts-list">
            {lowStockAlerts?.length > 0 ? (
              lowStockAlerts.slice(0, 5).map(alert => (
                <div key={alert.id} className="alert-item">
                  <span className="product-name">{alert.product_name}</span>
                  <span className="stock-info">
                    {alert.current_stock} / {alert.min_stock_level}
                  </span>
                </div>
              ))
            ) : (
              <p className="no-data">No low stock alerts</p>
            )}
          </div>
        </div>

        <div className="section">
          <h3>📦 Recent Stock Levels</h3>
          <div className="stock-list">
            {stockLevels?.length > 0 ? (
              stockLevels.slice(0, 5).map(stock => (
                <div key={stock.product_id} className="stock-item">
                  <span className="product-name">{stock.product_name}</span>
                  <span className={`stock-status ${stock.stock_status}`}>
                    {stock.current_stock} units
                  </span>
                </div>
              ))
            ) : (
              <p className="no-data">No stock data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Stock Levels Management Component
const StockLevelsManagement = () => {
  const [showAddStock, setShowAddStock] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const queryClient = useQueryClient();

  const { data: stockLevels, isLoading } = useQuery(
    ['stockLevels'],
    () => adminAPI.getStockLevels(),
    {
      select: (response) => response.data
    }
  );

  const updateStockMutation = useMutation(
    ({ productId, stockData }) => adminAPI.updateStockLevel(productId, stockData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('stockLevels');
        queryClient.invalidateQueries('inventorySummary');
        toast.success('Stock level updated successfully');
        setShowAddStock(false);
        setSelectedProduct(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update stock level');
      }
    }
  );

  const handleUpdateStock = (productId, stockData) => {
    updateStockMutation.mutate({ productId, stockData });
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading stock levels..." />;
  }

  return (
    <div className="stock-levels-management">
      <div className="section-header">
        <h2>Stock Levels Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddStock(true)}
        >
          + Update Stock
        </button>
      </div>

      <div className="stock-levels-table">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Current Stock</th>
              <th>Min Level</th>
              <th>Max Level</th>
              <th>Reorder Point</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stockLevels?.map(stock => (
              <tr key={stock.product_id}>
                <td>{stock.product_name}</td>
                <td>{stock.sku}</td>
                <td>{stock.current_stock}</td>
                <td>{stock.min_stock_level}</td>
                <td>{stock.max_stock_level}</td>
                <td>{stock.reorder_point}</td>
                <td>
                  <span className={`status-badge ${stock.stock_status}`}>
                    {stock.stock_status.replace('_', ' ')}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => {
                      setSelectedProduct(stock);
                      setShowAddStock(true);
                    }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddStock && (
        <UpdateStockModal
          product={selectedProduct}
          onClose={() => {
            setShowAddStock(false);
            setSelectedProduct(null);
          }}
          onSubmit={handleUpdateStock}
          isLoading={updateStockMutation.isLoading}
        />
      )}
    </div>
  );
};

// Update Stock Modal Component
const UpdateStockModal = ({ product, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    product_id: product?.product_id || '',
    current_stock: product?.current_stock || 0,
    min_stock_level: product?.min_stock_level || 0,
    max_stock_level: product?.max_stock_level || 0,
    reorder_point: product?.reorder_point || 0
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData.product_id, {
      current_stock: parseInt(formData.current_stock),
      min_stock_level: parseInt(formData.min_stock_level),
      max_stock_level: parseInt(formData.max_stock_level),
      reorder_point: parseInt(formData.reorder_point)
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{product ? 'Update Stock Level' : 'Add Stock Level'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="update-stock-form">
          <div className="form-group">
            <label>Product ID *</label>
            <input
              type="number"
              name="product_id"
              value={formData.product_id}
              onChange={handleChange}
              required
              disabled={!!product}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Current Stock *</label>
              <input
                type="number"
                name="current_stock"
                value={formData.current_stock}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label>Min Stock Level</label>
              <input
                type="number"
                name="min_stock_level"
                value={formData.min_stock_level}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Max Stock Level</label>
              <input
                type="number"
                name="max_stock_level"
                value={formData.max_stock_level}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Reorder Point</label>
              <input
                type="number"
                name="reorder_point"
                value={formData.reorder_point}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Stock Movements Management Component
const StockMovementsManagement = () => {
  const [showAddMovement, setShowAddMovement] = useState(false);
  const [filters, setFilters] = useState({
    movement_type: '',
    date_from: '',
    date_to: ''
  });
  const queryClient = useQueryClient();

  const { data: movements, isLoading } = useQuery(
    ['stockMovements', filters],
    () => adminAPI.getStockMovements({ 
      ...filters
    }),
    {
      select: (response) => response.data
    }
  );

  const createMovementMutation = useMutation(
    (movementData) => adminAPI.createStockMovement(movementData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('stockMovements');
        queryClient.invalidateQueries('stockLevels');
        queryClient.invalidateQueries('inventorySummary');
        toast.success('Stock movement created successfully');
        setShowAddMovement(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create stock movement');
      }
    }
  );

  const handleCreateMovement = (movementData) => {
    createMovementMutation.mutate(movementData);
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading stock movements..." />;
  }

  return (
    <div className="stock-movements-management">
      <div className="section-header">
        <h2>Stock Movements Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddMovement(true)}
        >
          + Add Movement
        </button>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Movement Type:</label>
          <select 
            value={filters.movement_type} 
            onChange={(e) => setFilters({...filters, movement_type: e.target.value})}
          >
            <option value="">All Types</option>
            <option value="in">Stock In</option>
            <option value="out">Stock Out</option>
            <option value="transfer">Transfer</option>
            <option value="adjustment">Adjustment</option>
            <option value="return">Return</option>
          </select>
        </div>
        <div className="filter-group">
          <label>From Date:</label>
          <input 
            type="date" 
            value={filters.date_from}
            onChange={(e) => setFilters({...filters, date_from: e.target.value})}
          />
        </div>
        <div className="filter-group">
          <label>To Date:</label>
          <input 
            type="date" 
            value={filters.date_to}
            onChange={(e) => setFilters({...filters, date_to: e.target.value})}
          />
        </div>
      </div>

      <div className="movements-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Reference</th>
              <th>User</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {movements?.map(movement => (
              <tr key={movement.id}>
                <td>{new Date(movement.created_at).toLocaleDateString()}</td>
                <td>{movement.product_name}</td>
                <td>
                  <span className={`movement-type ${movement.movement_type}`}>
                    {movement.movement_type}
                  </span>
                </td>
                <td className={movement.movement_type === 'in' || movement.movement_type === 'return' ? 'positive' : 'negative'}>
                  {movement.movement_type === 'in' || movement.movement_type === 'return' ? '+' : '-'}{movement.quantity}
                </td>
                <td>{movement.reference_number || movement.reference_type}</td>
                <td>{movement.user_name || 'System'}</td>
                <td>{movement.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddMovement && (
        <AddStockMovementModal
          onClose={() => setShowAddMovement(false)}
          onSubmit={handleCreateMovement}
          isLoading={createMovementMutation.isLoading}
        />
      )}
    </div>
  );
};

// Stock Adjustments Management Component
const StockAdjustmentsManagement = () => {
  const [showAddAdjustment, setShowAddAdjustment] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const queryClient = useQueryClient();

  const { data: adjustments, isLoading } = useQuery(
    ['stockAdjustments', statusFilter],
    () => adminAPI.getStockAdjustments({ 
      status: statusFilter || undefined
    }),
    {
      select: (response) => response.data
    }
  );

  const createAdjustmentMutation = useMutation(
    (adjustmentData) => adminAPI.createStockAdjustment(adjustmentData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('stockAdjustments');
        toast.success('Stock adjustment created successfully');
        setShowAddAdjustment(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create stock adjustment');
      }
    }
  );

  const approveAdjustmentMutation = useMutation(
    ({ adjustmentId, approvalData }) => adminAPI.approveStockAdjustment(adjustmentId, approvalData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('stockAdjustments');
        queryClient.invalidateQueries('stockLevels');
        queryClient.invalidateQueries('inventorySummary');
        toast.success('Stock adjustment approved successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to approve adjustment');
      }
    }
  );

  const handleCreateAdjustment = (adjustmentData) => {
    createAdjustmentMutation.mutate(adjustmentData);
  };

  const handleApproveAdjustment = (adjustmentId) => {
    approveAdjustmentMutation.mutate({
      adjustmentId,
      approvalData: { approved_by: 1 } // In real app, get from auth context
    });
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading stock adjustments..." />;
  }

  return (
    <div className="stock-adjustments-management">
      <div className="section-header">
        <h2>Stock Adjustments Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddAdjustment(true)}
        >
          + Create Adjustment
        </button>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Status:</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="adjustments-table">
        <table>
          <thead>
            <tr>
              <th>Adjustment #</th>
              <th>Product</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Created By</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {adjustments?.map(adjustment => (
              <tr key={adjustment.id}>
                <td>{adjustment.adjustment_number}</td>
                <td>{adjustment.product_name}</td>
                <td>
                  <span className={`adjustment-type ${adjustment.adjustment_type}`}>
                    {adjustment.adjustment_type}
                  </span>
                </td>
                <td>{adjustment.quantity}</td>
                <td>{adjustment.reason}</td>
                <td>
                  <span className={`status-badge ${adjustment.status}`}>
                    {adjustment.status}
                  </span>
                </td>
                <td>{adjustment.user_name}</td>
                <td>{new Date(adjustment.created_at).toLocaleDateString()}</td>
                <td>
                  {adjustment.status === 'pending' && (
                    <button 
                      className="btn btn-sm btn-success"
                      onClick={() => handleApproveAdjustment(adjustment.id)}
                      disabled={approveAdjustmentMutation.isLoading}
                    >
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddAdjustment && (
        <AddStockAdjustmentModal
          onClose={() => setShowAddAdjustment(false)}
          onSubmit={handleCreateAdjustment}
          isLoading={createAdjustmentMutation.isLoading}
        />
      )}
    </div>
  );
};

// Low Stock Alerts Management Component
const LowStockAlertsManagement = () => {
  const [statusFilter, setStatusFilter] = useState('false'); // Show unresolved by default
  const queryClient = useQueryClient();

  const { data: alerts, isLoading } = useQuery(
    ['lowStockAlerts', statusFilter],
    () => adminAPI.getLowStockAlerts({ 
      is_resolved: statusFilter
    }),
    {
      select: (response) => response.data
    }
  );

  const resolveAlertMutation = useMutation(
    ({ alertId, resolveData }) => adminAPI.resolveLowStockAlert(alertId, resolveData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('lowStockAlerts');
        queryClient.invalidateQueries('inventorySummary');
        toast.success('Alert resolved successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to resolve alert');
      }
    }
  );

  const handleResolveAlert = (alertId) => {
    resolveAlertMutation.mutate({
      alertId,
      resolveData: { resolved_by: 1 } // In real app, get from auth context
    });
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading low stock alerts..." />;
  }

  return (
    <div className="low-stock-alerts-management">
      <div className="section-header">
        <h2>⚠️ Low Stock Alerts Management</h2>
        <div className="alert-stats">
          <span className="stat-item unresolved">
            Unresolved: {alerts?.filter(alert => !alert.is_resolved).length || 0}
          </span>
          <span className="stat-item resolved">
            Resolved: {alerts?.filter(alert => alert.is_resolved).length || 0}
          </span>
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Status:</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="false">Unresolved</option>
            <option value="true">Resolved</option>
            <option value="">All Alerts</option>
          </select>
        </div>
      </div>

      <div className="alerts-table">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Current Stock</th>
              <th>Min Level</th>
              <th>Alert Type</th>
              <th>Created</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {alerts?.map(alert => (
              <tr key={alert.id} className={alert.is_resolved ? 'resolved' : 'unresolved'}>
                <td>{alert.product_name}</td>
                <td>{alert.sku}</td>
                <td className="stock-amount">{alert.current_stock}</td>
                <td className="min-level">{alert.min_stock_level}</td>
                <td>
                  <span className={`alert-type ${alert.alert_type}`}>
                    {alert.alert_type.replace('_', ' ')}
                  </span>
                </td>
                <td>{new Date(alert.created_at).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${alert.is_resolved ? 'resolved' : 'unresolved'}`}>
                    {alert.is_resolved ? 'Resolved' : 'Active'}
                  </span>
                </td>
                <td>
                  {!alert.is_resolved && (
                    <button 
                      className="btn btn-sm btn-success"
                      onClick={() => handleResolveAlert(alert.id)}
                      disabled={resolveAlertMutation.isLoading}
                    >
                      Resolve
                    </button>
                  )}
                  {alert.is_resolved && (
                    <span className="resolved-info">
                      Resolved by {alert.resolved_by_name} on {new Date(alert.resolved_at).toLocaleDateString()}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {alerts?.length === 0 && (
        <div className="no-alerts">
          <div className="no-alerts-icon">✅</div>
          <h3>No Alerts Found</h3>
          <p>
            {statusFilter === 'false' 
              ? 'Great! No unresolved low stock alerts at the moment.'
              : 'No alerts match the current filter criteria.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

// Inventory Reports Component
const InventoryReports = () => {
  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });

  const { data: summary, isLoading: summaryLoading } = useQuery(
    'inventorySummary',
    () => adminAPI.getInventorySummary(),
    {
      select: (response) => response.data
    }
  );

  const { data: stockLevels, isLoading: stockLevelsLoading } = useQuery(
    ['stockLevels'],
    () => adminAPI.getStockLevels(),
    {
      select: (response) => response.data
    }
  );

  if (summaryLoading || stockLevelsLoading) {
    return <LoadingSpinner text="Loading inventory reports..." />;
  }

  return (
    <div className="inventory-reports">
      <div className="section-header">
        <h2>📊 Inventory Reports & Analytics</h2>
        <div className="report-filters">
          <select 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value)}
            className="report-type-select"
          >
            <option value="summary">Summary Report</option>
            <option value="detailed">Detailed Report</option>
            <option value="low-stock">Low Stock Report</option>
          </select>
        </div>
      </div>

      <div className="reports-content">
        {reportType === 'summary' && (
          <div className="summary-report">
            <h3>Inventory Summary</h3>
            <div className="summary-cards">
              <div className="summary-card">
                <div className="card-icon">📦</div>
                <div className="card-content">
                  <div className="card-value">{summary?.total_products || 0}</div>
                  <div className="card-label">Total Products</div>
                </div>
              </div>
              <div className="summary-card">
                <div className="card-icon">📊</div>
                <div className="card-content">
                  <div className="card-value">{summary?.total_stock || 0}</div>
                  <div className="card-label">Total Stock</div>
                </div>
              </div>
              <div className="summary-card">
                <div className="card-icon">💰</div>
                <div className="card-content">
                  <div className="card-value">₹{summary?.total_value?.toLocaleString() || 0}</div>
                  <div className="card-label">Total Value</div>
                </div>
              </div>
              <div className="summary-card warning">
                <div className="card-icon">⚠️</div>
                <div className="card-content">
                  <div className="card-value">{summary?.low_stock_count || 0}</div>
                  <div className="card-label">Low Stock</div>
                </div>
              </div>
              <div className="summary-card danger">
                <div className="card-icon">❌</div>
                <div className="card-content">
                  <div className="card-value">{summary?.out_of_stock_count || 0}</div>
                  <div className="card-label">Out of Stock</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {reportType === 'detailed' && (
          <div className="detailed-report">
            <h3>Detailed Stock Report</h3>
            <div className="detailed-table">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Current Stock</th>
                    <th>Min Level</th>
                    <th>Max Level</th>
                    <th>Reorder Point</th>
                    <th>Status</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {stockLevels?.map(stock => (
                    <tr key={stock.product_id}>
                      <td>{stock.product_name}</td>
                      <td>{stock.sku}</td>
                      <td>{stock.current_stock}</td>
                      <td>{stock.min_stock_level}</td>
                      <td>{stock.max_stock_level}</td>
                      <td>{stock.reorder_point}</td>
                      <td>
                        <span className={`status-badge ${stock.stock_status}`}>
                          {stock.stock_status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>₹{(stock.current_stock * stock.price).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'low-stock' && (
          <div className="low-stock-report">
            <h3>Low Stock Report</h3>
            <div className="low-stock-table">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Current Stock</th>
                    <th>Min Level</th>
                    <th>Deficit</th>
                    <th>Status</th>
                    <th>Action Required</th>
                  </tr>
                </thead>
                <tbody>
                  {stockLevels?.filter(stock => stock.current_stock <= stock.min_stock_level).map(stock => (
                    <tr key={stock.product_id}>
                      <td>{stock.product_name}</td>
                      <td>{stock.sku}</td>
                      <td className="stock-amount">{stock.current_stock}</td>
                      <td className="min-level">{stock.min_stock_level}</td>
                      <td className="deficit">{stock.min_stock_level - stock.current_stock}</td>
                      <td>
                        <span className={`status-badge ${stock.stock_status}`}>
                          {stock.stock_status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <span className="action-required">
                          {stock.current_stock === 0 ? 'URGENT: Restock immediately' : 'Reorder needed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Modal Components
const AddStockMovementModal = ({ onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    product_id: '',
    movement_type: 'in',
    quantity: '',
    reference_type: 'initial',
    reference_number: '',
    notes: '',
    user_id: 1
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      quantity: parseInt(formData.quantity),
      product_id: parseInt(formData.product_id)
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add Stock Movement</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="add-movement-form">
          <div className="form-row">
            <div className="form-group">
              <label>Product ID *</label>
              <input
                type="number"
                name="product_id"
                value={formData.product_id}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Movement Type *</label>
              <select
                name="movement_type"
                value={formData.movement_type}
                onChange={handleChange}
                required
              >
                <option value="in">Stock In</option>
                <option value="out">Stock Out</option>
                <option value="transfer">Transfer</option>
                <option value="adjustment">Adjustment</option>
                <option value="return">Return</option>
              </select>
            </div>
            <div className="form-group">
              <label>Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Reference Type *</label>
              <select
                name="reference_type"
                value={formData.reference_type}
                onChange={handleChange}
                required
              >
                <option value="initial">Initial</option>
                <option value="purchase">Purchase</option>
                <option value="sale">Sale</option>
                <option value="transfer">Transfer</option>
                <option value="adjustment">Adjustment</option>
                <option value="return">Return</option>
              </select>
            </div>
            <div className="form-group">
              <label>Reference Number</label>
              <input
                type="text"
                name="reference_number"
                value={formData.reference_number}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Movement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddStockAdjustmentModal = ({ onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    product_id: '',
    adjustment_type: 'increase',
    quantity: '',
    reason: 'correction',
    notes: '',
    user_id: 1
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      quantity: parseInt(formData.quantity),
      product_id: parseInt(formData.product_id)
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create Stock Adjustment</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="add-adjustment-form">
          <div className="form-row">
            <div className="form-group">
              <label>Product ID *</label>
              <input
                type="number"
                name="product_id"
                value={formData.product_id}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Adjustment Type *</label>
              <select
                name="adjustment_type"
                value={formData.adjustment_type}
                onChange={handleChange}
                required
              >
                <option value="increase">Increase</option>
                <option value="decrease">Decrease</option>
                <option value="set">Set to Amount</option>
              </select>
            </div>
            <div className="form-group">
              <label>Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Reason *</label>
            <select
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
            >
              <option value="damage">Damage</option>
              <option value="theft">Theft</option>
              <option value="found">Found</option>
              <option value="correction">Correction</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryManagement;
