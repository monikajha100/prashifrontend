import React from 'react';
import './InvoiceTemplate.css';

const InvoiceTemplate = ({ invoice, company, onRef }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      paid: '#10b981',
      overdue: '#ef4444',
      cancelled: '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  const convertToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    if (num === 0) return 'Zero';
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + convertToWords(num % 100) : '');
    if (num < 100000) return convertToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + convertToWords(num % 1000) : '');
    if (num < 10000000) return convertToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + convertToWords(num % 100000) : '');
    return convertToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + convertToWords(num % 10000000) : '');
  };

  const amountInWords = () => {
    const amount = Math.floor(invoice.total_amount);
    const paisa = Math.round((invoice.total_amount - amount) * 100);
    let words = convertToWords(amount) + ' Rupees';
    if (paisa > 0) {
      words += ' and ' + convertToWords(paisa) + ' Paisa';
    }
    return words + ' only';
  };

  return (
    <div ref={onRef} className="invoice-template">
      {/* Header */}
      <div className="invoice-header">
        <div className="company-logo">
          <img src={company.company_logo || '/logo.png'} alt="Company Logo" />
        </div>
        <div className="invoice-title">
          <h1>Tax Invoice</h1>
          <div className="original-label">Original</div>
        </div>
      </div>

      {/* Company Details */}
      <div className="company-details">
        <h2>{company.company_name || 'Praashibysupal'}</h2>
        <p>{company.company_address || '123 Business Street, Mumbai, Maharashtra 400001'}</p>
        <p>Phone: {company.company_phone || '+91 9876543210'}</p>
        <p>Email: {company.company_email || 'info@praashibysupal.com'}</p>
        <p>GSTIN: {company.company_gstin || '27AABCU9603R1ZX'}</p>
        <p>State: {company.company_state || '27-Maharashtra'}</p>
      </div>

      {/* Invoice Details Grid */}
      <div className="invoice-details-grid">
        <div className="bill-to">
          <h3>Bill To:</h3>
          <div className="customer-details">
            <p><strong>{invoice.customer_name}</strong></p>
            <p>{invoice.customer_email}</p>
            <p>{invoice.customer_phone}</p>
            <p>GSTIN: {invoice.customer_gstin || 'N/A'}</p>
            <p>State: {invoice.customer_state || 'N/A'}</p>
          </div>
        </div>

        <div className="transportation-details">
          <h3>Transportation Details</h3>
          <div className="transport-info">
            <p>Transport Name: {invoice.transport_name || 'N/A'}</p>
            <p>Vehicle Number: {invoice.vehicle_number || 'N/A'}</p>
            <p>Delivery Date: {invoice.delivery_date ? formatDate(invoice.delivery_date) : 'N/A'}</p>
            <p>Delivery Location: {invoice.delivery_location || 'N/A'}</p>
          </div>
        </div>

        <div className="invoice-info">
          <h3>Invoice Details</h3>
          <div className="invoice-meta">
            <p><strong>Invoice No.:</strong> {invoice.invoice_number}</p>
            <p><strong>Date:</strong> {formatDate(invoice.invoice_date)}</p>
            <p><strong>Place of Supply:</strong> {company.company_state || '27-Maharashtra'}</p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="items-table">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Item name</th>
              <th>HSN/SAC</th>
              <th>Quantity</th>
              <th>Price/ unit</th>
              <th>Discount</th>
              <th>Taxable amount</th>
              <th>CGST (9.0%)</th>
              <th>SGST (9.0%)</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items && invoice.items.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.product_name}</td>
                <td>{item.hsn_sac}</td>
                <td>{item.quantity}</td>
                <td>{formatCurrency(item.unit_price)}</td>
                <td>{formatCurrency(item.discount_amount)} ({item.discount_percentage}%)</td>
                <td>{formatCurrency(item.taxable_amount)}</td>
                <td>{formatCurrency(item.cgst_amount)}</td>
                <td>{formatCurrency(item.sgst_amount)}</td>
                <td>{formatCurrency(item.total_amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="totals-section">
        <div className="totals-row">
          <div className="total-label">Total</div>
          <div className="total-quantity">{invoice.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}</div>
          <div className="total-discount">{formatCurrency(invoice.items?.reduce((sum, item) => sum + item.discount_amount, 0) || 0)}</div>
          <div className="total-taxable">{formatCurrency(invoice.subtotal)}</div>
          <div className="total-cgst">{formatCurrency(invoice.items?.reduce((sum, item) => sum + item.cgst_amount, 0) || 0)}</div>
          <div className="total-sgst">{formatCurrency(invoice.items?.reduce((sum, item) => sum + item.sgst_amount, 0) || 0)}</div>
          <div className="total-amount">{formatCurrency(invoice.total_amount)}</div>
        </div>
      </div>

      {/* Tax Details and Amounts */}
      <div className="tax-amounts-section">
        <div className="tax-details">
          <h4>Tax details</h4>
          <div className="tax-breakdown">
            <p>CGST: {formatCurrency(invoice.items?.reduce((sum, item) => sum + item.cgst_amount, 0) || 0)} (9.0%)</p>
            <p>SGST: {formatCurrency(invoice.items?.reduce((sum, item) => sum + item.sgst_amount, 0) || 0)} (9.0%)</p>
          </div>
        </div>

        <div className="amounts-summary">
          <h4>Amounts</h4>
          <div className="amount-breakdown">
            <p>Sub Total: {formatCurrency(invoice.subtotal)}</p>
            <p>Tax: {formatCurrency(invoice.tax_amount)}</p>
            <p>Shipping: {formatCurrency(invoice.shipping_amount)}</p>
            <p><strong>Total: {formatCurrency(invoice.total_amount)}</strong></p>
            <p>Received: {formatCurrency(invoice.received_amount || 0)}</p>
            <p>Balance: {formatCurrency(invoice.total_amount - (invoice.received_amount || 0))}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="invoice-footer">
        <div className="amount-in-words">
          <h4>Invoice Amount In Words</h4>
          <p>{amountInWords()}</p>
        </div>

        <div className="payment-mode">
          <p><strong>Payment Mode:</strong> {invoice.payment_method || 'Credit'}</p>
        </div>

        <div className="description">
          <h4>Description</h4>
          <p>Thanks for doing business with us.</p>
        </div>
      </div>

      {/* Bank Details and Terms */}
      <div className="bank-terms-section">
        <div className="bank-details">
          <h4>Bank Details</h4>
          {company.bank_details && (
            <div className="bank-info">
              <p>Bank Name: {company.bank_details.bank_name}</p>
              <p>Account No.: {company.bank_details.account_number}</p>
              <p>IFSC Code: {company.bank_details.ifsc_code}</p>
              <p>Branch: {company.bank_details.branch}</p>
            </div>
          )}
        </div>

        <div className="terms-conditions">
          <h4>Terms and Conditions</h4>
          <p>{company.invoice_terms || 'Thanks for doing business with us!'}</p>
        </div>

        <div className="signature">
          <h4>Authorized Signatory</h4>
          <div className="signature-area">
            <p>For: {company.company_name || 'Praashibysupal'}</p>
            <div className="signature-line"></div>
            <p>Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
