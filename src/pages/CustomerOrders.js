import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { ordersAPI, invoicesAPI, toAbsoluteImageUrl } from '../services/api';
import InvoiceTemplate from '../components/InvoiceTemplate';
import './CustomerOrders.css';

const CustomerOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const { data: orders, isLoading, error } = useQuery(
    'customerOrders',
    async () => {
      try {
        const response = await ordersAPI.getMyOrders();
        // axios response has data property, react-query should extract it automatically
        // But let's be explicit to handle edge cases
        const ordersData = response?.data || response;
        console.log('Raw API response:', response);
        console.log('Orders data:', ordersData);
        return Array.isArray(ordersData) ? ordersData : (ordersData ? [ordersData] : []);
      } catch (err) {
        console.error('Error in query function:', err);
        return [];
      }
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        console.log('Customer orders data (success):', data);
        console.log('Customer orders count:', Array.isArray(data) ? data.length : 0);
      },
      onError: (error) => {
        console.error('Error fetching customer orders:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
      }
    }
  );

  // Ensure orders is always an array
  const ordersArray = Array.isArray(orders) ? orders : [];

  const handleViewOrderDetails = async (orderId) => {
    try {
      const response = await ordersAPI.getOrderDetails(orderId);
      // Handle both wrapped response and direct data
      const orderDetails = response?.data || response;
      console.log('Order details fetched:', orderDetails);
      setSelectedOrder(orderDetails);
      setShowOrderDetails(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      console.error('Error response:', error.response?.data);
    }
  };

  const handleDownloadInvoice = async (invoiceId, invoiceNumber, orderId) => {
    try {
      if (!invoiceId) {
        // Try to get invoice by order ID
        try {
          const invoiceResponse = await invoicesAPI.getInvoiceByOrderId(orderId);
          invoiceId = invoiceResponse?.data?.invoice_id || invoiceResponse?.invoice_id;
          invoiceNumber = invoiceResponse?.data?.invoice_number || invoiceResponse?.invoice_number;
        } catch (err) {
          alert('Invoice not found for this order. Please contact support.');
          return;
        }
      }

      if (!invoiceId) {
        alert('Invoice not found for this order. Please contact support.');
        return;
      }

      console.log('⬇️ Downloading invoice:', invoiceId);
      
      // Fetch invoice details
      const response = await invoicesAPI.getInvoiceDetails(invoiceId);
      const invoice = response?.data || response;
      
      // Dynamically import required libraries
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);

      // Create a temporary container for the invoice
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      document.body.appendChild(tempContainer);

      // Render invoice template in temp container
      const { createRoot } = await import('react-dom/client');
      const root = createRoot(tempContainer);
      
      await new Promise((resolve) => {
        root.render(
          <InvoiceTemplate 
            invoice={invoice} 
            company={invoice.company}
            onRef={(ref) => {
              if (ref) {
                setTimeout(async () => {
                  try {
                    // Wait a bit more for all content to render, especially images and text
                    await new Promise(resolve => setTimeout(resolve, 300));
                    
                    const canvas = await html2canvas(ref, {
                      scale: 2,
                      useCORS: true,
                      allowTaint: true,
                      backgroundColor: '#ffffff',
                      logging: false,
                      windowWidth: ref.scrollWidth,
                      windowHeight: ref.scrollHeight
                    });

                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    
                    const imgWidth = 210;
                    const pageHeight = 295;
                    const imgHeight = (canvas.height * imgWidth) / canvas.width;
                    let heightLeft = imgHeight;
                    let position = 0;

                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;

                    // Only add new page if there's significant content left (> 10mm)
                    while (heightLeft > 10) {
                      position = heightLeft - imgHeight;
                      pdf.addPage();
                      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                      heightLeft -= pageHeight;
                    }

                    pdf.save(`invoice-${invoiceNumber || invoice.invoice_number}.pdf`);
                    
                    // Cleanup
                    root.unmount();
                    document.body.removeChild(tempContainer);
                    resolve();
                  } catch (error) {
                    console.error('Error generating PDF:', error);
                    alert('Error downloading invoice');
                    root.unmount();
                    document.body.removeChild(tempContainer);
                    resolve();
                  }
                }, 500);
              }
            }}
          />
        );
      });
    } catch (error) {
      console.error('❌ Error downloading invoice:', error);
      alert('Failed to download invoice. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    if (!status) return '#6b7280';
    const statusLower = String(status).toLowerCase();
    const colors = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      processing: '#8b5cf6',
      shipped: '#06b6d4',
      delivered: '#10b981',
      cancelled: '#ef4444',
      refunded: '#6b7280'
    };
    return colors[statusLower] || '#6b7280';
  };

  const getPaymentStatusColor = (status) => {
    if (!status) return '#6b7280';
    const statusLower = String(status).toLowerCase();
    const colors = {
      pending: '#f59e0b',
      paid: '#10b981',
      failed: '#ef4444',
      refunded: '#6b7280',
      partially_refunded: '#f59e0b'
    };
    return colors[statusLower] || '#6b7280';
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

  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    const statusStr = String(status).toLowerCase();
    return statusStr.charAt(0).toUpperCase() + statusStr.slice(1);
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
                    style={{ backgroundColor: getStatusColor(order.status || order.order_status) }}
                  >
                    {formatStatus(order.status || order.order_status)}
                  </span>
                  <span 
                    className="payment-status-badge"
                    style={{ backgroundColor: getPaymentStatusColor(order.payment_status) }}
                  >
                    {formatStatus(order.payment_status)}
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
                {order.invoice_id && (
                  <button 
                    className="btn-primary"
                    onClick={() => handleDownloadInvoice(order.invoice_id, order.invoice_number, order.id)}
                    style={{ marginLeft: '8px' }}
                  >
                    📥 Download Invoice
                  </button>
                )}
                {order.tracking_number && (
                  <button className="btn-outline" style={{ marginLeft: '8px' }}>
                    Track Package
                  </button>
                )}
                {(order.status === 'delivered' || order.order_status === 'delivered') && (
                  <button className="btn-outline" style={{ marginLeft: '8px' }}>
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
                      style={{ backgroundColor: getStatusColor(selectedOrder.status || selectedOrder.order_status) }}
                    >
                      {formatStatus(selectedOrder.status || selectedOrder.order_status)}
                    </span>
                  </div>
                  <div className="info-row">
                    <span>Payment Status:</span>
                    <span 
                      className="payment-status-badge"
                      style={{ backgroundColor: getPaymentStatusColor(selectedOrder.payment_status) }}
                    >
                      {formatStatus(selectedOrder.payment_status)}
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
                          {(() => {
                            // Try multiple possible image paths
                            const imageUrl = item.product_image || 
                                           item.product?.primary_image || 
                                           item.primary_image || 
                                           null;
                            const absoluteImageUrl = imageUrl ? toAbsoluteImageUrl(imageUrl) : null;
                            
                            return absoluteImageUrl ? (
                              <img 
                                src={absoluteImageUrl} 
                                alt={item.product_name || 'Product'} 
                                onError={(e) => {
                                  // Fallback to placeholder if image fails to load
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = '<div class="no-image">📦</div>';
                                }}
                              />
                            ) : (
                              <div className="no-image">📦</div>
                            );
                          })()}
                        </div>
                        <div className="item-details">
                          <h4>{item.product_name}</h4>
                          <p>SKU: {item.product_sku || item.product?.sku || 'N/A'}</p>
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
              {selectedOrder.invoice_id && (
                <button 
                  className="btn-primary"
                  onClick={() => handleDownloadInvoice(selectedOrder.invoice_id, selectedOrder.invoice_number, selectedOrder.id)}
                  style={{ marginLeft: '8px' }}
                >
                  📥 Download Invoice
                </button>
              )}
              {selectedOrder.tracking_number && (
                <button className="btn-primary" style={{ marginLeft: '8px' }}>
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
