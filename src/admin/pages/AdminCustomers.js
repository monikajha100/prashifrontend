import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { customersAPI, ordersAPI, invoicesAPI } from '../../services/api';
import InvoiceTemplate from '../../components/InvoiceTemplate';
import './AdminCustomers.css';

const AdminCustomers = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [filters, setFilters] = useState({
    search: '',
    page: 1
  });

  const { data: customersData, isLoading, error } = useQuery(
    ['adminCustomers', filters],
    async () => {
      console.log('🔵 Fetching customers with filters:', filters);
      const response = await customersAPI.getAllCustomers(filters);
      console.log('🟢 Raw customers API response:', response);
      return response;
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        console.log('✅ Customers data received:', data);
        console.log('✅ Customers count:', data?.customers?.length || 0);
      },
      onError: (error) => {
        console.error('❌ Error fetching customers:', error);
        console.error('❌ Error response:', error.response?.data);
      }
    }
  );

  const customers = customersData?.customers || [];
  const pagination = customersData?.pagination || {};

  const handleViewCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetails(true);
  };

  const toggleRowExpansion = (customerId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(customerId)) {
      newExpanded.delete(customerId);
    } else {
      newExpanded.add(customerId);
    }
    setExpandedRows(newExpanded);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const handleDownloadOrder = async (orderId, orderNumber) => {
    try {
      console.log('⬇️ Downloading order:', orderId);
      
      // Fetch order details
      const response = await ordersAPI.getOrderDetails(orderId);
      const order = response.data || response;
      
      // Dynamically import required libraries
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);

      // Create a temporary container for the order
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '210mm';
      tempContainer.style.padding = '20mm';
      tempContainer.style.backgroundColor = '#ffffff';
      document.body.appendChild(tempContainer);

      // Create order document HTML
      const orderHTML = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px;">
            <h1 style="margin: 0; color: #333;">Order Confirmation</h1>
            <p style="margin: 5px 0; color: #666;">Order Number: ${order.order_number}</p>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
            <div style="flex: 1;">
              <h3 style="margin: 0 0 10px 0; color: #333;">Shipping Address</h3>
              <div style="white-space: pre-wrap; color: #666; line-height: 1.6;">
${order.shipping_address || 'N/A'}
              </div>
            </div>
            <div style="flex: 1; margin-left: 30px;">
              <h3 style="margin: 0 0 10px 0; color: #333;">Billing Address</h3>
              <div style="white-space: pre-wrap; color: #666; line-height: 1.6;">
${order.billing_address || order.shipping_address || 'N/A'}
              </div>
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; color: #333;">Customer Information</h3>
            <p style="margin: 5px 0; color: #666;"><strong>Name:</strong> ${order.customer_name || 'N/A'}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Email:</strong> ${order.customer_email || 'N/A'}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Phone:</strong> ${order.customer_phone || 'N/A'}</p>
          </div>

          <div style="margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; color: #333;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f5f5f5;">
                  <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Item</th>
                  <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Quantity</th>
                  <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Price</th>
                  <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items && order.items.length > 0 ? order.items.map(item => `
                  <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;">${item.product_name || 'N/A'}</td>
                    <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${item.quantity || 0}</td>
                    <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${formatCurrency(item.unit_price || 0)}</td>
                    <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${formatCurrency(item.total_price || 0)}</td>
                  </tr>
                `).join('') : '<tr><td colspan="4" style="padding: 10px; text-align: center; border: 1px solid #ddd;">No items found</td></tr>'}
              </tbody>
            </table>
          </div>

          <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #333;">
            <div style="display: flex; justify-content: flex-end;">
              <div style="width: 300px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span>Subtotal:</span>
                  <span>${formatCurrency(order.subtotal || 0)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span>Tax:</span>
                  <span>${formatCurrency(order.tax_amount || 0)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span>Shipping:</span>
                  <span>${formatCurrency(order.shipping_amount || 0)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.2em; padding-top: 10px; border-top: 1px solid #ddd;">
                  <span>Total:</span>
                  <span>${formatCurrency(order.total_amount || 0)}</span>
                </div>
              </div>
            </div>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 0.9em;">
            <p><strong>Order Status:</strong> ${order.status || 'N/A'}</p>
            <p><strong>Payment Status:</strong> ${order.payment_status || 'N/A'}</p>
            <p><strong>Payment Method:</strong> ${order.payment_method || 'N/A'}</p>
            ${order.tracking_number ? `<p><strong>Tracking Number:</strong> ${order.tracking_number}</p>` : ''}
            <p><strong>Order Date:</strong> ${formatDate(order.created_at)}</p>
          </div>
        </div>
      `;

      tempContainer.innerHTML = orderHTML;

      // Wait for content to render
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
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

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`order-${orderNumber || order.order_number}.pdf`);
      
      // Cleanup
      document.body.removeChild(tempContainer);
    } catch (error) {
      console.error('Error downloading order:', error);
      alert('Error downloading order: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDownloadInvoice = async (invoiceId, invoiceNumber) => {
    try {
      console.log('⬇️ Downloading invoice:', invoiceId);
      
      // Fetch invoice details
      const response = await invoicesAPI.getInvoiceDetails(invoiceId);
      const invoice = response.data || response;
      
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
                    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
                      import('html2canvas'),
                      import('jspdf')
                    ]);

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

                    while (heightLeft >= 0) {
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
      console.error('Error downloading invoice:', error);
      alert('Error downloading invoice: ' + (error.response?.data?.message || error.message));
    }
  };

  if (isLoading) {
    return (
      <div className="admin-customers">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading customers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-customers">
        <div className="error-container">
          <p>Error loading customers: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-customers">
      <div className="customers-header">
        <h1>Customers</h1>
        <p>Manage and view all customers, their orders, login details, and invoices</p>
      </div>

      <div className="customers-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          />
        </div>
      </div>

      <div className="customers-table-container">
        <table className="customers-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Account</th>
              <th>Orders</th>
              <th>Invoices</th>
              <th>Total Spent</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">No customers found</td>
              </tr>
            ) : (
              customers.map((customer) => (
                <React.Fragment key={customer.id}>
                  <tr 
                    className={expandedRows.has(customer.id) ? 'expanded' : ''}
                    onClick={() => toggleRowExpansion(customer.id)}
                  >
                    <td>
                      <strong>{customer.name || 'N/A'}</strong>
                    </td>
                    <td>{customer.email}</td>
                    <td>{customer.phone || 'N/A'}</td>
                    <td>
                      <span className={`account-badge ${customer.has_account ? 'has-account' : 'guest'}`}>
                        {customer.has_account ? '✓ Account' : 'Guest'}
                      </span>
                      {customer.is_active === false && customer.has_account && (
                        <span className="inactive-badge">Inactive</span>
                      )}
                    </td>
                    <td>
                      <span className="stat-badge">{customer.stats?.total_orders || 0}</span>
                    </td>
                    <td>
                      <span className="stat-badge">{customer.stats?.total_invoices || 0}</span>
                    </td>
                    <td>
                      <strong>{formatCurrency(customer.stats?.total_spent || 0)}</strong>
                    </td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewCustomerDetails(customer);
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                  {expandedRows.has(customer.id) && (
                    <tr className="expanded-row">
                      <td colSpan="8">
                        <div className="customer-details-expanded">
                          <div className="details-section">
                            <h3>Login Details</h3>
                            {customer.has_account ? (
                              <div className="info-grid">
                                <div><strong>Email:</strong> {customer.email}</div>
                                <div><strong>Name:</strong> {customer.name}</div>
                                <div><strong>Phone:</strong> {customer.phone || 'N/A'}</div>
                                <div><strong>Account Status:</strong> 
                                  <span className={customer.is_active ? 'active' : 'inactive'}>
                                    {customer.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                                <div><strong>Created:</strong> {formatDate(customer.created_at)}</div>
                              </div>
                            ) : (
                              <p className="no-account">No account - Guest customer</p>
                            )}
                          </div>

                          <div className="details-section">
                            <h3>Recent Orders ({customer.orders?.length || 0})</h3>
                            {customer.orders && customer.orders.length > 0 ? (
                              <div className="orders-list">
                                {(customer.orders || []).slice(0, 5).map((order) => (
                                  <div key={order.id} className="order-item">
                                    <div className="order-header">
                                      <span className="order-number">{order.order_number}</span>
                                      <span className={`status-badge ${order.status}`}>
                                        {order.status}
                                      </span>
                                      <span className={`payment-status ${order.payment_status}`}>
                                        {order.payment_status}
                                      </span>
                                      <button
                                        className="download-btn-small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDownloadOrder(order.id, order.order_number);
                                        }}
                                        title="Download Order PDF"
                                      >
                                        📥 Order
                                      </button>
                                    </div>
                                    <div className="order-info">
                                      <span>{formatCurrency(order.total_amount)}</span>
                                      <span>{formatDate(order.created_at)}</span>
                                    </div>
                                    {(order.shipping_address || order.billing_address) && (
                                      <div className="address-info">
                                        {order.shipping_address && (
                                          <div className="address-block">
                                            <strong>Shipping:</strong>
                                            <div className="address-text">{order.shipping_address}</div>
                                          </div>
                                        )}
                                        {order.billing_address && order.billing_address !== order.shipping_address && (
                                          <div className="address-block">
                                            <strong>Billing:</strong>
                                            <div className="address-text">{order.billing_address}</div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                                {customer.orders.length > 5 && (
                                  <p className="more-items">+{customer.orders.length - 5} more orders</p>
                                )}
                              </div>
                            ) : (
                              <p className="no-data">No orders</p>
                            )}
                          </div>

                          <div className="details-section">
                            <h3>Recent Invoices ({customer.invoices?.length || 0})</h3>
                            {customer.invoices && customer.invoices.length > 0 ? (
                              <div className="invoices-list">
                                {(customer.invoices || []).slice(0, 5).map((invoice) => (
                                  <div key={invoice.id} className="invoice-item">
                                    <div className="invoice-header">
                                      <span className="invoice-number">{invoice.invoice_number}</span>
                                      <span className={`payment-status ${invoice.payment_status}`}>
                                        {invoice.payment_status}
                                      </span>
                                      <button
                                        className="download-btn-small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDownloadInvoice(invoice.id, invoice.invoice_number);
                                        }}
                                        title="Download Invoice PDF"
                                      >
                                        📥 Invoice
                                      </button>
                                    </div>
                                    <div className="invoice-info">
                                      <span>Order: {invoice.order_number || 'N/A'}</span>
                                      <span>{formatCurrency(invoice.total_amount)}</span>
                                      <span>{formatDate(invoice.created_at)}</span>
                                    </div>
                                  </div>
                                ))}
                                {customer.invoices.length > 5 && (
                                  <p className="more-items">+{customer.invoices.length - 5} more invoices</p>
                                )}
                              </div>
                            ) : (
                              <p className="no-data">No invoices</p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={!pagination.hasPrev}
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
          >
            Previous
          </button>
          <span>
            Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalCustomers} total)
          </span>
          <button
            disabled={!pagination.hasNext}
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
          >
            Next
          </button>
        </div>
      )}

      {showCustomerDetails && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setShowCustomerDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Customer Details</h2>
              <button className="close-btn" onClick={() => setShowCustomerDetails(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="customer-info-section">
                <h3>Customer Information</h3>
                <div className="info-grid">
                  <div><strong>Name:</strong> {selectedCustomer.name || 'N/A'}</div>
                  <div><strong>Email:</strong> {selectedCustomer.email}</div>
                  <div><strong>Phone:</strong> {selectedCustomer.phone || 'N/A'}</div>
                  <div><strong>Account Type:</strong> {selectedCustomer.has_account ? 'Registered User' : 'Guest Customer'}</div>
                  {selectedCustomer.has_account && (
                    <>
                      <div><strong>Account Status:</strong> 
                        <span className={selectedCustomer.is_active ? 'active' : 'inactive'}>
                          {selectedCustomer.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div><strong>Account Created:</strong> {formatDate(selectedCustomer.created_at)}</div>
                    </>
                  )}
                  <div><strong>Total Orders:</strong> {selectedCustomer.stats?.total_orders || 0}</div>
                  <div><strong>Total Invoices:</strong> {selectedCustomer.stats?.total_invoices || 0}</div>
                  <div><strong>Total Spent:</strong> {formatCurrency(selectedCustomer.stats?.total_spent || 0)}</div>
                  <div><strong>Total Paid:</strong> {formatCurrency(selectedCustomer.stats?.total_paid || 0)}</div>
                </div>
              </div>

              <div className="customer-orders-section">
                <h3>All Orders ({selectedCustomer.orders?.length || 0})</h3>
                <div className="orders-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Order Number</th>
                        <th>Status</th>
                        <th>Payment Status</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedCustomer.orders || []).map((order) => (
                        <tr key={order.id}>
                          <td>{order.order_number}</td>
                          <td>
                            <span className={`status-badge ${order.status}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>
                            <span className={`payment-status ${order.payment_status}`}>
                              {order.payment_status}
                            </span>
                          </td>
                          <td>{formatCurrency(order.total_amount)}</td>
                          <td>{formatDate(order.created_at)}</td>
                          <td>
                            <button
                              className="download-btn"
                              onClick={() => handleDownloadOrder(order.id, order.order_number)}
                              title="Download Order PDF"
                            >
                              📥 Order
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Billing and Shipping Addresses */}
                {selectedCustomer.orders && selectedCustomer.orders.length > 0 && selectedCustomer.orders.some(o => o.shipping_address || o.billing_address) && (
                  <div className="addresses-section">
                    <h4>Order Addresses</h4>
                    <div className="addresses-grid">
                      {(selectedCustomer.orders || []).map((order) => (
                        (order.shipping_address || order.billing_address) && (
                          <div key={order.id} className="order-address-card">
                            <div className="order-address-header">
                              <strong>{order.order_number}</strong>
                              <span className={`status-badge ${order.status}`}>{order.status}</span>
                            </div>
                            {order.shipping_address && (
                              <div className="address-detail">
                                <strong>Shipping Address:</strong>
                                <div className="address-text">{order.shipping_address}</div>
                              </div>
                            )}
                            {order.billing_address && (
                              <div className="address-detail">
                                <strong>Billing Address:</strong>
                                <div className="address-text">
                                  {order.billing_address !== order.shipping_address 
                                    ? order.billing_address 
                                    : 'Same as shipping'}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="customer-invoices-section">
                <h3>All Invoices ({selectedCustomer.invoices?.length || 0})</h3>
                <div className="invoices-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Invoice Number</th>
                        <th>Order Number</th>
                        <th>Amount</th>
                        <th>Payment Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedCustomer.invoices || []).map((invoice) => (
                        <tr key={invoice.id}>
                          <td>{invoice.invoice_number}</td>
                          <td>{invoice.order_number || 'N/A'}</td>
                          <td>{formatCurrency(invoice.total_amount)}</td>
                          <td>
                            <span className={`payment-status ${invoice.payment_status}`}>
                              {invoice.payment_status}
                            </span>
                          </td>
                          <td>{formatDate(invoice.created_at)}</td>
                          <td>
                            <button
                              className="download-btn"
                              onClick={() => handleDownloadInvoice(invoice.id, invoice.invoice_number)}
                              title="Download Invoice PDF"
                            >
                              📥 Invoice
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;

