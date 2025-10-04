import React from 'react';
import { useQuery } from 'react-query';
import { ordersAPI } from '../services/api';
import { Helmet } from 'react-helmet-async';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import './Orders.css';

const Orders = () => {
  const { isAuthenticated } = useAuth();
  
  const { data: orders, isLoading, error } = useQuery(
    'userOrders',
    () => ordersAPI.getMyOrders(),
    {
      enabled: isAuthenticated,
      select: (response) => response.data
    }
  );

  if (!isAuthenticated) {
    return (
      <div className="orders-page">
        <div className="container">
          <div className="not-authenticated">
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
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>Error loading orders</h2>
        <p>Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <Helmet>
        <title>My Orders - Praashibysupal</title>
      </Helmet>

      <div className="container">
        <h1 className="page-title">My Orders</h1>
        
        {orders && orders.length > 0 ? (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order #{order.order_number}</h3>
                    <p>Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="order-status">
                    <span className={`status-badge status-${order.order_status}`}>
                      {order.order_status}
                    </span>
                  </div>
                </div>
                
                <div className="order-details">
                  <div className="order-items">
                    <p><strong>Items:</strong> {order.items_summary}</p>
                  </div>
                  
                  <div className="order-totals">
                    <div className="total-row">
                      <span>Subtotal:</span>
                      <span>₹ {order.subtotal}</span>
                    </div>
                    <div className="total-row">
                      <span>Shipping:</span>
                      <span>{order.shipping_cost === 0 ? 'Free' : `₹ ${order.shipping_cost}`}</span>
                    </div>
                    <div className="total-row final">
                      <span>Total:</span>
                      <span>₹ {order.total_amount}</span>
                    </div>
                  </div>
                </div>
                
                <div className="order-actions">
                  <button className="btn btn-secondary">
                    View Details
                  </button>
                  {order.order_status === 'delivered' && (
                    <button className="btn btn-primary">
                      Reorder
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-orders">
            <h2>No Orders Yet</h2>
            <p>You haven't placed any orders yet. Start shopping to see your orders here.</p>
            <button className="btn btn-primary" onClick={() => window.location.href = '/products'}>
              Start Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
