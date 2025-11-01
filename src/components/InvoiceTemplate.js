import React from 'react';
import './InvoiceTemplate.css';

const InvoiceTemplate = ({ invoice, company, onRef }) => {
  // Default company settings from contact page
  const defaultCompany = {
    company_name: 'Praashibysupal',
    company_address: '203 SF Anikedhya Capital -2, Nr Mahalaxmi Cross Road, Paldi, Ahmedabad, Gujarat, India - 380006',
    company_phone: '+91 87806 06280',
    company_email: 'hello@praashibysupal.co.in',
    company_gstin: '',
    company_state: 'Gujarat',
    company_logo: '/logo.png',
    bank_details: null,
    invoice_terms: 'Thanks for doing business with us!'
  };

  // Use provided company data or defaults
  const companyData = company || defaultCompany;

  const formatCurrency = (amount) => {
    const numAmount = parseFloat(amount) || 0;
    if (isNaN(numAmount)) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(numAmount);
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
    const totalAmount = parseFloat(invoice?.total_amount) || 0;
    if (isNaN(totalAmount)) return 'Zero Rupees only';
    const amount = Math.floor(totalAmount);
    const paisa = Math.round((totalAmount - amount) * 100);
    let words = convertToWords(amount) + ' Rupees';
    if (paisa > 0) {
      words += ' and ' + convertToWords(paisa) + ' Paisa';
    }
    return words + ' only';
  };

  // Ensure invoice has required data
  if (!invoice) {
    return <div className="invoice-template">No invoice data available</div>;
  }

  return (
    <div ref={onRef} className="invoice-template">
      {/* Header */}
      <div className="invoice-header">
        <div className="company-logo">
          <img src={companyData.company_logo} alt="Company Logo" />
        </div>
        <div className="invoice-title">
          <h1>Tax Invoice</h1>
          <div className="original-label">Original</div>
        </div>
      </div>

      {/* Company Details */}
      <div className="company-details">
        <h2>{companyData.company_name}</h2>
        <p>{companyData.company_address}</p>
        <p>Phone: {companyData.company_phone}</p>
        <p>Email: {companyData.company_email}</p>
        <p>State: {companyData.company_state}</p>
      </div>

      {/* Invoice Details Grid */}
      <div className="invoice-details-grid">
        <div className="bill-to">
          <h3>Bill To:</h3>
          <div className="customer-details">
            <p><strong>{invoice.customer_name || 'N/A'}</strong></p>
            {invoice.customer_email && <p>{invoice.customer_email}</p>}
            {invoice.customer_phone && <p>{invoice.customer_phone}</p>}
            {invoice.customer_address && (
              <p>{invoice.customer_address}{invoice.customer_city ? `, ${invoice.customer_city}` : ''}{invoice.customer_pincode ? ` - ${invoice.customer_pincode}` : ''}</p>
            )}
            {invoice.customer_state && <p>State: {invoice.customer_state}</p>}
            {invoice.customer_gstin && <p>GSTIN: {invoice.customer_gstin}</p>}
            {invoice.shipping_address && (
              <div className="shipping-address-section">
                <p><strong>Shipping Address:</strong></p>
                <p className="shipping-address-text">{invoice.shipping_address}</p>
              </div>
            )}
          </div>
        </div>

        <div className="invoice-info">
          <h3>Invoice Details</h3>
          <div className="invoice-meta">
            <p><strong>Invoice No.:</strong> {invoice.invoice_number}</p>
            <p><strong>Date:</strong> {formatDate(invoice.invoice_date)}</p>
            <p><strong>Place of Supply:</strong> {companyData.company_state}</p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="items-table">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Image</th>
              <th>Item name</th>
              <th>HSN/SAC</th>
              <th>Quantity</th>
              <th>Price/ unit</th>
              <th>Discount</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items && invoice.items.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>
                  {item.product_image ? (
                    <img 
                      src={item.product_image.startsWith('http') || item.product_image.startsWith('/') ? item.product_image : `/uploads/products/${item.product_image}`} 
                      alt={item.product_name || 'Product'} 
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<span>📦</span>';
                      }}
                    />
                  ) : (
                    <span>📦</span>
                  )}
                </td>
                <td>{item.product_name}</td>
                <td>{item.hsn_sac}</td>
                <td>{item.quantity}</td>
                <td>{formatCurrency(item.unit_price || 0)}</td>
                <td>{formatCurrency(item.discount_amount || 0)} ({parseFloat(item.discount_percentage || 0).toFixed(2)}%)</td>
                <td>{formatCurrency(item.total_amount || 0)}</td>
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
          <div className="total-discount">{formatCurrency(invoice.items?.reduce((sum, item) => sum + (parseFloat(item.discount_amount) || 0), 0) || 0)}</div>
          <div className="total-amount">{formatCurrency(invoice.total_amount || 0)}</div>
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
          {companyData.bank_details && (
            <div className="bank-info">
              <p>Bank Name: {companyData.bank_details.bank_name}</p>
              <p>Account No.: {companyData.bank_details.account_number}</p>
              <p>IFSC Code: {companyData.bank_details.ifsc_code}</p>
              <p>Branch: {companyData.bank_details.branch}</p>
            </div>
          )}
        </div>

        <div className="terms-conditions">
          <h4>Terms and Conditions</h4>
          <p>{companyData.invoice_terms || 'Thanks for doing business with us!'}</p>
        </div>

        <div className="signature">
          <h4>Authorized Signatory</h4>
          <div className="signature-area">
            <p>For: {companyData.company_name}</p>
            <div className="signature-line"></div>
            <p>Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
