import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { ordersAPI } from '../../services/api';
import toast from 'react-hot-toast';

const FullAdminOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: orders, isLoading, error } = useQuery(
    ['orders', statusFilter],
    () => ordersAPI.getAllOrders({ status: statusFilter !== 'all' ? statusFilter : undefined }),
    {
      select: (response) => response.data || [],
      retry: 1,
      onError: (err) => {
        console.error('Orders fetch error:', err);
        if (err.response?.status !== 401) {
          toast.error('Failed to load orders. Make sure backend is running.');
        }
      }
    }
  );

  const updateStatusMutation = useMutation(
    ({ orderId, status }) => ordersAPI.updateStatus(orderId, { status }),
    {
      onSuccess: () => {
        toast.success('Order status updated successfully!');
        queryClient.invalidateQueries('orders');
        setSelectedOrder(null);
      },
      onError: () => {
        toast.error('Failed to update order status');
      }
    }
  );

  const handleStatusUpdate = (orderId, newStatus) => {
    if (window.confirm(`Change order status to "${newStatus}"?`)) {
      updateStatusMutation.mutate({ orderId, status: newStatus });
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem' }}>⏳</div>
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error && error.response?.status !== 401) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{
          background: '#f8d7da',
          color: '#721c24',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h2>⚠️ Error Loading Orders</h2>
          <p>Unable to fetch orders. Please ensure:</p>
          <ul style={{ textAlign: 'left', maxWidth: '500px', margin: '20px auto' }}>
            <li>Backend server is running (http://localhost:5000)</li>
            <li>Database is connected</li>
            <li>You are logged in as admin</li>
          </ul>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              background: '#721c24',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return { bg: '#d4edda', color: '#155724' };
      case 'shipped': return { bg: '#cce5ff', color: '#004085' };
      case 'processing': return { bg: '#fff3cd', color: '#856404' };
      case 'cancelled': return { bg: '#f8d7da', color: '#721c24' };
      default: return { bg: '#e2e3e5', color: '#383d41' };
    }
  };

  const orderStats = {
    total: orders?.length || 0,
    pending: orders?.filter(o => o.status === 'pending').length || 0,
    processing: orders?.filter(o => o.status === 'processing').length || 0,
    shipped: orders?.filter(o => o.status === 'shipped').length || 0,
    delivered: orders?.filter(o => o.status === 'delivered').length || 0,
    cancelled: orders?.filter(o => o.status === 'cancelled').length || 0
  };

  return (
    <div style={{ padding: '20px', background: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#2C2C2C',
              marginBottom: '10px',
              fontFamily: "'Cormorant Garamond', serif"
            }}>
              Orders Management
            </h1>
            <p style={{ color: '#666', fontSize: '1.1rem' }}>
              Total Orders: {orderStats.total}
            </p>
          </div>
        </div>

        {/* Order Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '15px',
          marginBottom: '30px'
        }}>
          {[
            { label: 'All', count: orderStats.total, value: 'all', color: '#6c757d' },
            { label: 'Pending', count: orderStats.pending, value: 'pending', color: '#ffc107' },
            { label: 'Processing', count: orderStats.processing, value: 'processing', color: '#17a2b8' },
            { label: 'Shipped', count: orderStats.shipped, value: 'shipped', color: '#007bff' },
            { label: 'Delivered', count: orderStats.delivered, value: 'delivered', color: '#28a745' },
            { label: 'Cancelled', count: orderStats.cancelled, value: 'cancelled', color: '#dc3545' }
          ].map((stat) => (
            <div
              key={stat.value}
              onClick={() => setStatusFilter(stat.value)}
              style={{
                background: statusFilter === stat.value ? stat.color : 'white',
                color: statusFilter === stat.value ? 'white' : '#2C2C2C',
                padding: '15px',
                borderRadius: '10px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: `2px solid ${statusFilter === stat.value ? stat.color : '#e1e1e1'}`
              }}
            >
              <div style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '5px' }}>
                {stat.count}
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Orders Table */}
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '25px',
          boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e1e1e1' }}>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#2C2C2C' }}>Order #</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#2C2C2C' }}>Customer</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#2C2C2C' }}>Amount</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#2C2C2C' }}>Payment</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#2C2C2C' }}>Status</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#2C2C2C' }}>Date</th>
                  <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600', color: '#2C2C2C' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders && orders.length > 0 ? (
                  orders.map((order) => {
                    const statusStyle = getStatusColor(order.status);
                    return (
                      <tr key={order.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '15px', fontWeight: '600', color: '#2C2C2C' }}>
                          #{order.order_number}
                        </td>
                        <td style={{ padding: '15px' }}>
                          <div style={{ fontWeight: '600', color: '#2C2C2C' }}>
                            {order.user_name || 'Guest'}
                          </div>
                          <div style={{ fontSize: '0.9rem', color: '#666' }}>
                            {order.user_email || 'N/A'}
                          </div>
                        </td>
                        <td style={{ padding: '15px', fontWeight: '600', color: '#2C2C2C' }}>
                          ₹{order.total_amount}
                        </td>
                        <td style={{ padding: '15px' }}>
                          <div style={{ fontSize: '0.9rem', color: '#666' }}>
                            {order.payment_method || 'COD'}
                          </div>
                          <span style={{
                            background: order.payment_status === 'paid' ? '#d4edda' : '#f8d7da',
                            color: order.payment_status === 'paid' ? '#155724' : '#721c24',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '0.8rem',
                            fontWeight: '500'
                          }}>
                            {order.payment_status || 'pending'}
                          </span>
                        </td>
                        <td style={{ padding: '15px' }}>
                          <span style={{
                            background: statusStyle.bg,
                            color: statusStyle.color,
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            fontWeight: '500'
                          }}>
                            {order.status}
                          </span>
                        </td>
                        <td style={{ padding: '15px', color: '#666', fontSize: '0.9rem' }}>
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '15px', textAlign: 'center' }}>
                          <button 
                            onClick={() => setSelectedOrder(order)}
                            style={{
                              background: '#007bff',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '0.9rem',
                              cursor: 'pointer'
                            }}
                          >
                            👁️ View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                      No orders found{statusFilter !== 'all' && ` with status "${statusFilter}"`}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

const OrderDetailsModal = ({ order, onClose, onStatusUpdate }) => {
  const [newStatus, setNewStatus] = useState(order.status);

  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '30px',
        maxWidth: '700px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0, color: '#2C2C2C' }}>
            Order #{order.order_number}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ✕
          </button>
        </div>

        {/* Customer Info */}
        <div style={{
          background: '#f8f9fa',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#2C2C2C' }}>Customer Information</h3>
          <div style={{ fontSize: '0.95rem', color: '#666' }}>
            <div style={{ marginBottom: '5px' }}><strong>Name:</strong> {order.user_name || 'N/A'}</div>
            <div style={{ marginBottom: '5px' }}><strong>Email:</strong> {order.user_email || 'N/A'}</div>
            <div style={{ marginBottom: '5px' }}><strong>Phone:</strong> {order.user_phone || 'N/A'}</div>
          </div>
        </div>

        {/* Order Details */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#2C2C2C' }}>Order Details</h3>
          <div style={{ fontSize: '0.95rem', color: '#666' }}>
            <div style={{ marginBottom: '5px' }}><strong>Total Amount:</strong> ₹{order.total_amount}</div>
            <div style={{ marginBottom: '5px' }}><strong>Payment Method:</strong> {order.payment_method || 'COD'}</div>
            <div style={{ marginBottom: '5px' }}><strong>Payment Status:</strong> {order.payment_status || 'pending'}</div>
            <div style={{ marginBottom: '5px' }}><strong>Order Date:</strong> {new Date(order.created_at).toLocaleString()}</div>
          </div>
        </div>

        {/* Update Status */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#2C2C2C' }}>Update Status</h3>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '2px solid #e1e1e1',
              borderRadius: '8px',
              fontSize: '1rem',
              boxSizing: 'border-box',
              marginBottom: '10px'
            }}
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          
          {newStatus !== order.status && (
            <button
              onClick={() => onStatusUpdate(order.id, newStatus)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Update Status to "{newStatus}"
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default FullAdminOrders;
