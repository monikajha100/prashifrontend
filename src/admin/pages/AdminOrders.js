import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { ordersAPI } from '../../services/api';
import './AdminOrders.css';

const AdminOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1
  });

  const queryClient = useQueryClient();

  const { data: orders, isLoading, error } = useQuery(
    ['adminOrders', filters],
    () => ordersAPI.getAllOrders(filters),
    {
      retry: 1,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        console.log('Orders data received:', data);
      },
      onError: (error) => {
        console.error('Error fetching orders:', error);
      }
    }
  );

  const updateStatusMutation = useMutation(
    ({ orderId, statusData }) => ordersAPI.updateStatus(orderId, statusData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminOrders');
        setShowOrderDetails(false);
      }
    }
  );

  const updatePaymentStatusMutation = useMutation(
    ({ orderId, paymentData }) => ordersAPI.updatePaymentStatus(orderId, paymentData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminOrders');
        setShowOrderDetails(false);
      }
    }
  );

  const addTrackingMutation = useMutation(
    ({ orderId, trackingData }) => ordersAPI.addTracking(orderId, trackingData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminOrders');
        setShowOrderDetails(false);
      }
    }
  );

  const handleViewOrderDetails = async (orderId) => {
    try {
      const orderDetails = await ordersAPI.getOrderDetails(orderId);
      setSelectedOrder(orderDetails);
      setShowOrderDetails(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const handleStatusUpdate = (orderId, newStatus) => {
    updateStatusMutation.mutate({
      orderId,
      statusData: { status: newStatus }
    });
  };

  const handlePaymentStatusUpdate = (orderId, newPaymentStatus) => {
    updatePaymentStatusMutation.mutate({
      orderId,
      paymentData: { payment_status: newPaymentStatus }
    });
  };

  const handleAddTracking = (orderId, trackingNumber) => {
    addTrackingMutation.mutate({
      orderId,
      trackingData: { tracking_number: trackingNumber }
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      processing: '#8b5cf6',
      shipped: '#06b6d4',
      delivered: '#10b981',
      cancelled: '#ef4444',
      refunded: '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      paid: '#10b981',
      failed: '#ef4444',
      refunded: '#6b7280',
      partially_refunded: '#f59e0b'
    };
    return colors[status] || '#6b7280';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="admin-orders">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-orders">
        <div className="error-container">
          <h2>Error Loading Orders</h2>
          <p>Unable to load orders. Please try again later.</p>
          <p>Error: {error.message}</p>
        </div>
      </div>
    );
  }

  // Ensure orders is always an array
  const ordersArray = Array.isArray(orders) ? orders : [];

  return (
    <div className="admin-orders">
      <div className="orders-header">
        <h1>Order Management</h1>
        <p>Manage and track customer orders</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="filter-group">
            <label>Status:</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Search:</label>
            <input
              type="text"
              placeholder="Order number, customer name, or email"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            />
          </div>

          <button 
            className="btn-secondary"
            onClick={() => setFilters({ status: '', search: '', page: 1 })}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="orders-table-container">
        {ordersArray.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-icon">📦</div>
            <h2>No Orders Found</h2>
            <p>No orders match your current filters.</p>
          </div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ordersArray.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>{order.order_number}</strong>
                  </td>
                  <td>
                    <div className="customer-info">
                      <div className="customer-name">{order.customer_name}</div>
                      <div className="customer-email">{order.customer_email}</div>
                    </div>
                  </td>
                  <td>{formatDate(order.created_at)}</td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <span 
                      className="payment-status-badge"
                      style={{ backgroundColor: getPaymentStatusColor(order.payment_status) }}
                    >
                      {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <strong>{formatCurrency(order.total_amount)}</strong>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-primary btn-sm"
                        onClick={() => handleViewOrderDetails(order.id)}
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowOrderDetails(false)}>
          <div className="modal-content order-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details - #{selectedOrder.order_number}</h2>
              <button 
                className="modal-close"
                onClick={() => setShowOrderDetails(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="order-details-grid">
                <div className="order-info-section">
                  <h3>Order Information</h3>
                  <div className="info-row">
                    <span>Order Number:</span>
                    <span>{selectedOrder.order_number}</span>
                  </div>
                  <div className="info-row">
                    <span>Order Date:</span>
                    <span>{formatDate(selectedOrder.created_at)}</span>
                  </div>
                  <div className="info-row">
                    <span>Status:</span>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                  <div className="info-row">
                    <span>Payment Status:</span>
                    <select
                      value={selectedOrder.payment_status}
                      onChange={(e) => handlePaymentStatusUpdate(selectedOrder.id, e.target.value)}
                      className="payment-status-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                      <option value="partially_refunded">Partially Refunded</option>
                    </select>
                  </div>
                  <div className="info-row">
                    <span>Tracking Number:</span>
                    <div className="tracking-input-group">
                      <input
                        type="text"
                        placeholder="Enter tracking number"
                        defaultValue={selectedOrder.tracking_number || ''}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddTracking(selectedOrder.id, e.target.value);
                          }
                        }}
                        className="tracking-input"
                      />
                      <button 
                        className="btn-primary btn-sm"
                        onClick={(e) => {
                          const input = e.target.previousElementSibling;
                          handleAddTracking(selectedOrder.id, input.value);
                        }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                <div className="shipping-info-section">
                  <h3>Customer Information</h3>
                  <div className="shipping-address">
                    <p><strong>Name:</strong> {selectedOrder.customer_name}</p>
                    <p><strong>Email:</strong> {selectedOrder.customer_email}</p>
                    <p><strong>Phone:</strong> {selectedOrder.customer_phone}</p>
                    <div className="address-block">
                      <p><strong>Shipping Address:</strong></p>
                      <p>{selectedOrder.shipping_address}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-items-section">
                <h3>Order Items</h3>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <div className="items-list">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="order-item">
                        <div className="item-image">
                          {item.product_image ? (
                            <img src={item.product_image} alt={item.product_name} />
                          ) : (
                            <div className="no-image">📦</div>
                          )}
                        </div>
                        <div className="item-details">
                          <h4>{item.product_name}</h4>
                          <p>SKU: {item.product_sku || 'N/A'}</p>
                          <p>Quantity: {item.quantity}</p>
                          <p>Price: {formatCurrency(item.product_price)}</p>
                        </div>
                        <div className="item-total">
                          <p><strong>{formatCurrency(item.total_price)}</strong></p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No items found for this order.</p>
                )}
              </div>

              <div className="order-summary-section">
                <h3>Order Summary</h3>
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Tax:</span>
                  <span>{formatCurrency(selectedOrder.tax_amount)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping:</span>
                  <span>{formatCurrency(selectedOrder.shipping_amount)}</span>
                </div>
                <div className="summary-row total-row">
                  <span><strong>Total:</strong></span>
                  <span><strong>{formatCurrency(selectedOrder.total_amount)}</strong></span>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="order-notes-section">
                  <h3>Order Notes</h3>
                  <p>{selectedOrder.notes}</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowOrderDetails(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;