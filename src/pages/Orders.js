import React from 'react';
import { useQuery } from 'react-query';
import { ordersAPI } from '../services/api';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { FaShoppingBag, FaCalendarAlt, FaCheckCircle, FaClock, FaTruck, FaTimesCircle, FaRupeeSign } from 'react-icons/fa';
import './Orders.css';

const Orders = () => {
  const { isAuthenticated } = useAuth();
  
  const { data: orders, isLoading, error } = useQuery(
    'userOrders',
    async () => {
      try {
        const response = await ordersAPI.getMyOrders();
        const ordersData = response?.data || response;
        return Array.isArray(ordersData) ? ordersData : [];
      } catch (err) {
        console.error('Error fetching orders:', err);
        return [];
      }
    },
    {
      enabled: isAuthenticated,
      refetchOnWindowFocus: false
    }
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    return date.toLocaleDateString('en-IN', options);
  };

  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || 'pending';
    
    switch (statusLower) {
      case 'delivered':
        return { label: 'Delivered', class: 'delivered', icon: FaCheckCircle };
      case 'shipped':
      case 'out_for_delivery':
        return { label: 'Shipped', class: 'shipped', icon: FaTruck };
      case 'processing':
      case 'confirmed':
        return { label: 'Processing', class: 'processing', icon: FaClock };
      case 'cancelled':
      case 'canceled':
        return { label: 'Cancelled', class: 'cancelled', icon: FaTimesCircle };
      default:
        return { label: 'Pending', class: 'pending', icon: FaClock };
    }
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    const statusLower = paymentStatus?.toLowerCase() || 'pending';
    
    switch (statusLower) {
      case 'paid':
        return { label: 'Paid', class: 'paid' };
      case 'pending':
        return { label: 'Pending', class: 'payment-pending' };
      case 'refunded':
        return { label: 'Refunded', class: 'refunded' };
      case 'failed':
        return { label: 'Failed', class: 'payment-failed' };
      default:
        return { label: 'Pending', class: 'payment-pending' };
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="orders-page">
        <div className="container">
          <div className="not-authenticated">
            <FaShoppingBag className="empty-icon" />
            <h1>Please Login</h1>
            <p>You need to be logged in to view your orders.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner text="Loading your orders..." />;
  }

  if (error) {
    return (
      <div className="orders-page">
        <div className="container">
          <div className="error-state">
        <h2>Error loading orders</h2>
        <p>Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <Helmet>
        <title>My Orders - Praashibysupal</title>
      </Helmet>

      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="orders-header">
        <h1 className="page-title">My Orders</h1>
            <p className="page-subtitle">Track and manage your orders</p>
          </div>
        
        {orders && orders.length > 0 ? (
          <div className="orders-list">
              {orders.map((order, index) => {
                const statusBadge = getStatusBadge(order.status || order.order_status);
                const paymentBadge = getPaymentStatusBadge(order.payment_status);
                const StatusIcon = statusBadge.icon;
                const orderItems = order.items || [];
                const itemsSummary = order.items_summary || 
                  (orderItems.length > 0 
                    ? orderItems.map(item => `${item.product_name || item.name} (Qty: ${item.quantity || 1})`).join(', ')
                    : 'No items');

                return (
                  <motion.div
                    key={order.id}
                    className="order-card"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <div className="order-card-header">
                      <div className="order-identifier">
                        <div className="order-number">
                          <span className="order-label">Order #</span>
                          <span className="order-serial">{order.order_number || `ORD-${order.id}`}</span>
                        </div>
                        <div className="order-date">
                          <FaCalendarAlt className="date-icon" />
                          <span>Placed on {formatDate(order.created_at)}</span>
                        </div>
                      </div>
                      <div className="order-status-badges">
                        <div className={`status-badge ${statusBadge.class}`}>
                          <StatusIcon className="status-icon" />
                          <span>{statusBadge.label}</span>
                        </div>
                        {order.payment_status && (
                          <div className={`status-badge ${paymentBadge.class}`}>
                            <span>{paymentBadge.label}</span>
                  </div>
                        )}
                  </div>
                </div>
                
                    <div className="order-card-body">
                      <div className="order-items-section">
                        <h3 className="items-label">Items:</h3>
                        <div className="items-list">
                          {Array.isArray(orderItems) && orderItems.length > 0 ? (
                            <ul className="items-ul">
                              {orderItems.map((item, idx) => (
                                <li key={idx} className="item-li">
                                  <span className="item-name">{item.product_name || item.name || 'Product'}</span>
                                  <span className="item-qty">(Qty: {item.quantity || 1})</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="items-text">{itemsSummary}</p>
                          )}
                        </div>
                  </div>
                  
                      <div className="order-summary">
                        <div className="summary-row">
                          <span className="summary-label">Subtotal:</span>
                          <span className="summary-value">
                            <FaRupeeSign className="rupee-icon" />
                            {parseFloat(order.subtotal || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                        {order.shipping_amount !== undefined && (
                          <div className="summary-row">
                            <span className="summary-label">Shipping:</span>
                            <span className="summary-value">
                              {(!order.shipping_amount || order.shipping_amount === 0) ? (
                                <span className="free-shipping">Free</span>
                              ) : (
                                <>
                                  <FaRupeeSign className="rupee-icon" />
                                  {parseFloat(order.shipping_amount).toLocaleString('en-IN')}
                                </>
                              )}
                            </span>
                    </div>
                        )}
                        {order.tax_amount !== undefined && order.tax_amount > 0 && (
                          <div className="summary-row">
                            <span className="summary-label">Tax:</span>
                            <span className="summary-value">
                              <FaRupeeSign className="rupee-icon" />
                              {parseFloat(order.tax_amount).toLocaleString('en-IN')}
                            </span>
                    </div>
                        )}
                        <div className="summary-row total-row">
                          <span className="summary-label">Total:</span>
                          <span className="summary-value total-value">
                            <FaRupeeSign className="rupee-icon" />
                            {parseFloat(order.total_amount || order.total || 0).toLocaleString('en-IN')}
                          </span>
                    </div>
                  </div>
                </div>
                
                    {order.tracking_number && (
                      <div className="order-tracking">
                        <span className="tracking-label">Tracking:</span>
                        <span className="tracking-number">{order.tracking_number}</span>
                      </div>
                    )}

                    <div className="order-card-footer">
                      <button 
                        className="btn btn-secondary"
                        onClick={() => window.location.href = `/orders/${order.id}`}
                      >
                    View Details
                  </button>
                  {(order.status === 'delivered' || order.order_status === 'delivered') && (
                        <button 
                          className="btn btn-primary"
                          onClick={() => {
                            // TODO: Implement reorder functionality
                            console.log('Reorder:', order.id);
                          }}
                        >
                      Reorder
                    </button>
                  )}
                </div>
                  </motion.div>
                );
              })}
          </div>
        ) : (
            <motion.div
              className="no-orders"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <FaShoppingBag className="empty-icon" />
            <h2>No Orders Yet</h2>
            <p>You haven't placed any orders yet. Start shopping to see your orders here.</p>
              <button 
                className="btn btn-primary" 
                onClick={() => window.location.href = '/products'}
              >
              Start Shopping
            </button>
            </motion.div>
        )}
        </motion.div>
      </div>
    </div>
  );
};

export default Orders;
