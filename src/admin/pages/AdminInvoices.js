import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { invoicesAPI } from '../../services/api';
import InvoiceTemplate from '../../components/InvoiceTemplate';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './AdminInvoices.css';

const AdminInvoices = () => {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1
  });
  const invoiceRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: invoicesResponse, isLoading, error } = useQuery(
    ['adminInvoices', filters],
    async () => {
      console.log('🔵 Fetching invoices with filters:', filters);
      const response = await invoicesAPI.getAllInvoices(filters);
      console.log('🟢 Raw invoices API response:', response);
      return response;
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        console.log('✅ Invoices data received:', data);
        console.log('✅ Invoices count:', Array.isArray(data) ? data.length : 'Not an array');
      },
      onError: (error) => {
        console.error('❌ Error fetching invoices:', error);
        console.error('❌ Error response:', error.response?.data);
      }
    }
  );

  // Extract invoices array from response - backend returns array directly
  const invoices = Array.isArray(invoicesResponse) ? invoicesResponse : [];
  
  console.log('=== ADMIN INVOICES DEBUG ===');
  console.log('invoicesResponse:', invoicesResponse);
  console.log('invoices array:', invoices);
  console.log('invoices.length:', invoices.length);
  console.log('=== END DEBUG ===');

  const { data: invoiceDetails } = useQuery(
    ['invoiceDetails', selectedInvoice?.id],
    () => invoicesAPI.getInvoiceDetails(selectedInvoice?.id),
    {
      enabled: !!selectedInvoice?.id,
      retry: 1
    }
  );

  const sendEmailMutation = useMutation(
    (invoiceId) => invoicesAPI.sendInvoiceEmail(invoiceId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminInvoices');
        alert('Invoice sent successfully!');
      },
      onError: (error) => {
        alert('Error sending invoice: ' + error.message);
      }
    }
  );

  const updatePaymentStatusMutation = useMutation(
    ({ invoiceId, paymentData }) => invoicesAPI.updatePaymentStatus(invoiceId, paymentData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminInvoices');
        queryClient.invalidateQueries('invoiceDetails');
        alert('Payment status updated successfully!');
      },
      onError: (error) => {
        alert('Error updating payment status: ' + error.message);
      }
    }
  );

  const handleViewInvoiceDetails = async (invoiceId) => {
    try {
      console.log('📄 Fetching invoice details for ID:', invoiceId);
      const response = await invoicesAPI.getInvoiceDetails(invoiceId);
      console.log('📄 Invoice details response:', response);
      
      // Handle both response.data and direct response
      const invoice = response.data || response;
      console.log('📄 Processed invoice details:', invoice);
      
      setSelectedInvoice(invoice);
      setShowInvoiceDetails(true);
    } catch (error) {
      console.error('❌ Error fetching invoice details:', error);
      alert('Failed to load invoice details. Please try again.');
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
                    const canvas = await html2canvas(ref, {
                      scale: 2,
                      useCORS: true,
                      allowTaint: true,
                      backgroundColor: '#ffffff'
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
      console.error('❌ Error downloading invoice:', error);
      alert('Failed to download invoice. Please try again.');
    }
  };

  const handleGeneratePDF = async () => {
    if (!invoiceRef.current || !invoiceDetails) return;

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true
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

      pdf.save(`invoice-${invoiceDetails.invoice_number}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF');
    }
  };

  const handleSendEmail = (invoiceId) => {
    if (window.confirm('Are you sure you want to send this invoice via email?')) {
      sendEmailMutation.mutate(invoiceId);
    }
  };

  const handleUpdatePaymentStatus = (invoiceId, newStatus) => {
    const paymentDate = newStatus === 'paid' ? new Date().toISOString().split('T')[0] : null;
    updatePaymentStatusMutation.mutate({
      invoiceId,
      paymentData: { payment_status: newStatus, payment_date: paymentDate }
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      paid: '#10b981',
      overdue: '#ef4444',
      cancelled: '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
      <div className="admin-invoices">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading invoices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-invoices">
        <div className="error-container">
          <h2>Error Loading Invoices</h2>
          <p>Unable to load invoices. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-invoices">
      <div className="invoices-header">
        <h1>Invoice Management</h1>
        <p>Manage and track customer invoices</p>
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
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Search:</label>
            <input
              type="text"
              placeholder="Invoice number, order number, customer name, or email"
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

      {/* Invoices Table */}
      <div className="invoices-table-container">
        {!invoices || invoices.length === 0 ? (
          <div className="no-invoices">
            <div className="no-invoices-icon">📄</div>
            <h2>No Invoices Found</h2>
            <p>No invoices match your current filters.</p>
          </div>
        ) : (
          <table className="invoices-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Order #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Status</th>
                <th>Total</th>
                <th>Email Sent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>
                    <strong>{invoice.invoice_number}</strong>
                  </td>
                  <td>{invoice.order_number}</td>
                  <td>
                    <div className="customer-info">
                      <div className="customer-name">{invoice.customer_name}</div>
                      <div className="customer-email">{invoice.customer_email}</div>
                    </div>
                  </td>
                  <td>{formatDate(invoice.invoice_date)}</td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(invoice.payment_status) }}
                    >
                      {invoice.payment_status.charAt(0).toUpperCase() + invoice.payment_status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <strong>{formatCurrency(invoice.total_amount)}</strong>
                  </td>
                  <td>
                    {invoice.email_sent ? (
                      <span className="email-sent">✓ Sent</span>
                    ) : (
                      <span className="email-not-sent">Not Sent</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-primary btn-sm"
                        onClick={() => handleViewInvoiceDetails(invoice.id)}
                        title="View invoice details"
                      >
                        👁️ View
                      </button>
                      <button 
                        className="btn-success btn-sm"
                        onClick={() => handleDownloadInvoice(invoice.id, invoice.invoice_number)}
                        title="Download invoice as PDF"
                        style={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          border: 'none'
                        }}
                      >
                        ⬇️ Download
                      </button>
                      {!invoice.email_sent && (
                        <button 
                          className="btn-secondary btn-sm"
                          onClick={() => handleSendEmail(invoice.id)}
                          disabled={sendEmailMutation.isLoading}
                          title="Send invoice via email"
                        >
                          📧 Send Email
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Invoice Details Modal */}
      {showInvoiceDetails && invoiceDetails && (
        <div className="modal-overlay" onClick={() => setShowInvoiceDetails(false)}>
          <div className="modal-content invoice-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Invoice Details - {invoiceDetails.invoice_number}</h2>
              <button 
                className="modal-close"
                onClick={() => setShowInvoiceDetails(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {/* Invoice Actions */}
              <div className="invoice-actions">
                <button 
                  className="btn-primary"
                  onClick={handleGeneratePDF}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>⬇️</span> Download PDF
                </button>
                {!invoiceDetails.email_sent && (
                  <button 
                    className="btn-secondary"
                    onClick={() => handleSendEmail(invoiceDetails.id)}
                    disabled={sendEmailMutation.isLoading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>📧</span> {sendEmailMutation.isLoading ? 'Sending...' : 'Send Email'}
                  </button>
                )}
                <select
                  value={invoiceDetails.payment_status}
                  onChange={(e) => handleUpdatePaymentStatus(invoiceDetails.id, e.target.value)}
                  className="payment-status-select"
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '0.95rem',
                    cursor: 'pointer'
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Invoice Template */}
              <div className="invoice-preview">
                <InvoiceTemplate 
                  invoice={invoiceDetails} 
                  company={invoiceDetails.company}
                  onRef={invoiceRef}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowInvoiceDetails(false)}
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

export default AdminInvoices;
