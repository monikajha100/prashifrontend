import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { ordersAPI } from '../services/api';
import './CustomerOrders.css';

const CustomerOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const { data: orders, isLoading, error } = useQuery(
    'customerOrders',
    () => ordersAPI.getMyOrders(),
    {
      retry: 1,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        console.log('Customer orders data:', data);
      },
      onError: (error) => {
        console.error('Error fetching customer orders:', error);
      }
    }
  );

  // Ensure orders is always an array
  const ordersArray = Array.isArray(orders) ? orders : [];

  const handleViewOrderDetails = async (orderId) => {
    try {
      const orderDetails = await ordersAPI.getOrderDetails(orderId);
      setSelectedOrder(orderDetails);
      setShowOrderDetails(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
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
      <div className="customer-orders">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="customer-orders">
        <div className="error-container">
          <h2>Error Loading Orders</h2>
          <p>Unable to load your orders. Please try again later.</p>
          <p>Error: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-orders">
      <div className="orders-header">
        <h1>My Orders</h1>
        <p>Track and manage your orders</p>
      </div>

      {ordersArray.length === 0 ? (
        <div className="no-orders">
          <div className="no-orders-icon">📦</div>
          <h2>No Orders Yet</h2>
          <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
          <button className="btn-primary" onClick={() => window.location.href = '/products'}>
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {ordersArray.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>Order #{order.order_number}</h3>
                  <p className="order-date">Placed on {formatDate(order.created_at)}</p>
                </div>
                <div className="order-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <span 
                    className="payment-status-badge"
                    style={{ backgroundColor: getPaymentStatusColor(order.payment_status) }}
                  >
                    {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="order-summary">
                <div className="order-items">
                  <p><strong>Items:</strong> {order.items_summary || 'No items'}</p>
                </div>
                <div className="order-total">
                  <p><strong>Total:</strong> {formatCurrency(order.total_amount)}</p>
                </div>
              </div>

              <div className="order-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => handleViewOrderDetails(order.id)}
                >
                  View Details
                </button>
                {order.tracking_number && (
                  <button className="btn-outline">
                    Track Package
                  </button>
                )}
                {order.status === 'delivered' && (
                  <button className="btn-outline">
                    Reorder
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

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
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(selectedOrder.status) }}
                    >
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </span>
                  </div>
                  <div className="info-row">
                    <span>Payment Status:</span>
                    <span 
                      className="payment-status-badge"
                      style={{ backgroundColor: getPaymentStatusColor(selectedOrder.payment_status) }}
                    >
                      {selectedOrder.payment_status.charAt(0).toUpperCase() + selectedOrder.payment_status.slice(1)}
                    </span>
                  </div>
                  {selectedOrder.tracking_number && (
                    <div className="info-row">
                      <span>Tracking Number:</span>
                      <span>{selectedOrder.tracking_number}</span>
                    </div>
                  )}
                </div>

                <div className="shipping-info-section">
                  <h3>Shipping Information</h3>
                  <div className="shipping-address">
                    <p><strong>Customer:</strong> {selectedOrder.customer_name}</p>
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
              {selectedOrder.tracking_number && (
                <button className="btn-primary">
                  Track Package
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;
