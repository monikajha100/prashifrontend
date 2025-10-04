import React, { useState, useRef } from 'react';
import { useQuery } from 'react-query';
import { invoicesAPI } from '../services/api';
import InvoiceTemplate from '../components/InvoiceTemplate';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './CustomerInvoices.css';

const CustomerInvoices = () => {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);
  const invoiceRef = useRef(null);

  const { data: invoices, isLoading, error } = useQuery(
    'customerInvoices',
    () => invoicesAPI.getMyInvoices(),
    {
      retry: 1,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        console.log('Customer invoices data received:', data);
      },
      onError: (error) => {
        console.error('Error fetching customer invoices:', error);
        console.error('Error details:', error.response?.data || error.message);
      }
    }
  );

  const { data: invoiceDetails } = useQuery(
    ['invoiceDetails', selectedInvoice?.id],
    () => invoicesAPI.getInvoiceDetails(selectedInvoice?.id),
    {
      enabled: !!selectedInvoice?.id,
      retry: 1
    }
  );

  const handleViewInvoiceDetails = async (invoiceId) => {
    try {
      const invoice = await invoicesAPI.getInvoiceDetails(invoiceId);
      setSelectedInvoice(invoice);
      setShowInvoiceDetails(true);
    } catch (error) {
      console.error('Error fetching invoice details:', error);
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
      <div className="customer-invoices">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your invoices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="customer-invoices">
        <div className="error-container">
          <h2>Error Loading Invoices</h2>
          <p>Unable to load your invoices. Please try again later.</p>
          <p>Error: {error.message}</p>
        </div>
      </div>
    );
  }

  // Ensure invoices is always an array
  const invoicesArray = Array.isArray(invoices) ? invoices : [];

  return (
    <div className="customer-invoices">
      <div className="invoices-header">
        <h1>My Invoices</h1>
        <p>View and download your invoices</p>
      </div>

      {invoicesArray.length === 0 ? (
        <div className="no-invoices">
          <div className="no-invoices-icon">📄</div>
          <h2>No Invoices Yet</h2>
          <p>You don't have any invoices yet. Your invoices will appear here after you place orders.</p>
          <button className="btn-primary" onClick={() => window.location.href = '/products'}>
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="invoices-list">
          {invoicesArray.map((invoice) => (
            <div key={invoice.id} className="invoice-card">
              <div className="invoice-header">
                <div className="invoice-info">
                  <h3>Invoice #{invoice.invoice_number}</h3>
                  <p className="invoice-date">Date: {formatDate(invoice.invoice_date)}</p>
                  <p className="order-number">Order: {invoice.order_number}</p>
                </div>
                <div className="invoice-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(invoice.payment_status) }}
                  >
                    {invoice.payment_status.charAt(0).toUpperCase() + invoice.payment_status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="invoice-summary">
                <div className="invoice-amount">
                  <p><strong>Total Amount:</strong> {formatCurrency(invoice.total_amount)}</p>
                </div>
                <div className="invoice-due">
                  <p><strong>Due Date:</strong> {formatDate(invoice.due_date)}</p>
                </div>
              </div>

              <div className="invoice-actions">
                <button 
                  className="btn-primary"
                  onClick={() => handleViewInvoiceDetails(invoice.id)}
                >
                  View Invoice
                </button>
                {invoice.email_sent && (
                  <span className="email-sent-indicator">✓ Email Sent</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

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
                >
                  Download PDF
                </button>
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

export default CustomerInvoices;
