import React, { useState } from 'react';
import { FaEdit, FaTrash, FaPlus, FaEye, FaSave, FaTimes } from 'react-icons/fa';
import './AdminFooterPages.css';

const AdminFooterPages = () => {
  const [pages, setPages] = useState([
    {
      id: 1,
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      content: `# Privacy Policy

Last updated: January 15, 2025

At Praashi by Supal, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website or make a purchase.

## Information We Collect

### Personal Information
When you make a purchase or attempt to make a purchase through our site, we collect certain information from you, including:
- Name and contact information (email address, phone number)
- Billing and shipping addresses
- Payment information (credit card details, billing address)
- Order history and preferences

### Automatically Collected Information
We automatically collect certain information about your device when you visit our website, including:
- Web browser information
- IP address
- Time zone and location data
- Pages visited and time spent on our site
- Referring website information

## How We Use Your Information
We use the information we collect to:
- Process and fulfill your orders
- Communicate with you about your orders and our products
- Improve our website and customer experience
- Send you marketing communications (with your consent)
- Prevent fraud and enhance security
- Comply with legal obligations

## Information Sharing
We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:
- To trusted service providers who assist us in operating our website and conducting our business
- To comply with legal requirements or protect our rights
- In connection with a business transfer or acquisition

## Data Security
We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.

## Cookies and Tracking
We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookie settings through your browser preferences.

## Your Rights
You have the right to:
- Access and update your personal information
- Request deletion of your personal information
- Opt-out of marketing communications
- Request a copy of your data

## Changes to This Policy
We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.`,
      status: 'published',
      lastUpdated: '2025-01-15'
    },
    {
      id: 2,
      title: 'Terms of Service',
      slug: 'terms-of-service',
      content: `# Terms of Service

Last updated: January 15, 2025

Welcome to Praashi by Supal! These Terms of Service ("Terms") govern your use of our website and services. By accessing or using our website, you agree to be bound by these Terms.

## 1. Acceptance of Terms
By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.

## 2. Use License
Permission is granted to temporarily download one copy of the materials on Praashi by Supal's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
- Modify or copy the materials
- Use the materials for any commercial purpose or for any public display
- Attempt to reverse engineer any software contained on the website
- Remove any copyright or other proprietary notations from the materials

## 3. Product Information
We strive to provide accurate product descriptions, images, and pricing information. However, we do not warrant that product descriptions or other content is accurate, complete, reliable, current, or error-free.

### Product Availability
All products are subject to availability. We reserve the right to discontinue any product at any time without notice.

### Pricing
Prices are subject to change without notice. We reserve the right to modify prices at any time, but such changes will not affect orders that have already been placed.

## 4. Orders and Payment
When you place an order through our website, you are making an offer to purchase products. We reserve the right to accept or decline your order for any reason.

### Payment Terms
- Payment is due at the time of order placement
- We accept major credit cards, debit cards, and other payment methods as displayed
- All payments are processed securely through our payment partners
- You are responsible for any applicable taxes

## 5. Shipping and Delivery
Shipping terms and delivery times are provided at the time of checkout. We are not responsible for delays caused by shipping carriers or circumstances beyond our control.

### Free Shipping
Free shipping is available on orders of ₹999 and above. Shipping charges apply to orders below this threshold.

## 6. Returns and Exchanges
Please refer to our Returns & Exchanges policy for detailed information about returning or exchanging products.

## 7. User Accounts
When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.

## 8. Prohibited Uses
You may not use our website:
- For any unlawful purpose or to solicit others to perform unlawful acts
- To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances
- To infringe upon or violate our intellectual property rights or the intellectual property rights of others
- To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate
- To submit false or misleading information

## 9. Intellectual Property
The content, organization, graphics, design, compilation, magnetic translation, digital conversion, and other matters related to the website are protected under applicable copyrights, trademarks, and other proprietary rights.

## 10. Disclaimer
The information on this website is provided on an "as is" basis. To the fullest extent permitted by law, this Company:
- Excludes all representations and warranties relating to this website and its contents
- Excludes all liability for damages arising out of or in connection with your use of this website

## 11. Limitation of Liability
In no event shall Praashi by Supal, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the website.

## 12. Governing Law
These Terms shall be interpreted and governed by the laws of India, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.

## 13. Changes to Terms
We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.

### Important Notice
By using our website, you acknowledge that you have read and understood these Terms of Service and agree to be bound by them. If you do not agree to these terms, please do not use our website.`,
      status: 'published',
      lastUpdated: '2025-01-15'
    },
    {
      id: 3,
      title: 'Shipping Info',
      slug: 'shipping-info',
      content: `# Shipping Policy

Fast, reliable, and secure delivery to your doorstep

## 🚚 Free Shipping Offer
**Free Shipping on Orders ₹999 & Above**

Enjoy complimentary shipping on all orders above ₹999 across India!

## Shipping Overview
We are committed to delivering your jewelry safely and on time. Here's everything you need to know about our shipping policy:

## Processing & Dispatch
**Orders are dispatched within 2-3 working days.**

Once your order is confirmed and payment is verified, we begin processing your order immediately. Our team carefully prepares and packages each item to ensure it reaches you in perfect condition.

## Delivery Timeline
**Delivery time: 3–7 days within India (location dependent).**

| Location Type | Delivery Time | Description |
|---------------|---------------|-------------|
| **Metro Cities** | 3-4 days | Mumbai, Delhi, Bangalore, Chennai, Kolkata, Hyderabad, Pune, Ahmedabad |
| **Major Cities** | 4-5 days | State capitals and major district headquarters |
| **Other Locations** | 5-7 days | Smaller towns and remote areas |

## Shipping Options & Charges
### 💰 Shipping Cost Structure
**Free shipping on orders above ₹999; flat ₹80 below that amount.**

| Shipping Method | Delivery Time | Cost (Orders below ₹999) | Cost (Orders ₹999+) | Coverage |
|-----------------|---------------|---------------------------|---------------------|----------|
| **Standard Shipping** | 3-7 days | ₹80 | FREE | All India |
| **Express Shipping** | 2-3 days | ₹150 | ₹150 | All India |

### Shipping Cost Summary
- **Orders ₹999 and above:** FREE standard shipping
- **Orders below ₹999:** Standard shipping ₹80
- **Express Shipping:** ₹150 (all orders)
- **No hidden charges:** What you see is what you pay

## Order Tracking
**Tracking details will be shared once shipped.**

As soon as your order is dispatched from our warehouse, you will receive:
- Email notification with tracking number
- SMS updates on your registered mobile number
- Real-time tracking link to monitor your package
- Estimated delivery date and time

### How to Track Your Order
1. Check your email for the tracking notification
2. Click on the tracking link provided
3. Use the tracking number on the courier's website
4. Monitor real-time updates on delivery status

## Secure Packaging
**All items are securely packed to avoid damage.**

We take extra care to pack your precious Jewelry:
- Each item is individually wrapped in protective material
- Items are placed in branded gift boxes
- Additional bubble wrap and padding for fragile items
- Tamper-evident packaging for security
- Insurance coverage for all shipments

## Delivery Process
Our delivery process ensures your package reaches you safely:
- **Address Verification:** We verify your address before dispatch
- **Safe Handling:** Packages are handled with care throughout transit
- **Delivery Attempt:** Our courier partners will attempt delivery at your address
- **Contact Information:** Keep your phone number active for delivery updates

## Delivery Instructions
To ensure smooth delivery:
- Provide accurate and complete address details
- Include landmark information for easy location
- Ensure someone is available to receive the package
- Keep your phone number active for delivery updates
- Check your email regularly for delivery notifications

## Failed Delivery
If delivery fails due to:
- **Incorrect Address:** Contact us immediately to update the address
- **Recipient Unavailable:** The package will be held at the nearest delivery center for 3 days
- **Refused Delivery:** The package will be returned to us
- **Wrong Contact Number:** Update your contact details in your account

## International Shipping
Currently, we only ship within India. International shipping will be available soon. Please check back for updates.

## Contact for Shipping Issues
If you have any questions or concerns about your shipment:
- **Email:** support@praashibysupal.com
- **Phone:** +91 87806 06280
- **WhatsApp:** +91 87806 06280
- **Business Hours:** Monday to Saturday, 10 AM to 7 PM

### 📦 Safe & Secure Delivery
Your precious Jewelry is our priority. We ensure every package is handled with utmost care and delivered safely to your doorstep with complete tracking and insurance coverage.`,
      status: 'published',
      lastUpdated: '2025-01-15'
    },
    {
      id: 4,
      title: 'Returns & Exchanges',
      slug: 'returns-exchanges',
      content: `# Returns & Exchanges

Quality-checked Jewelry with limited exchange policy

## 🔍 Quality Assurance
**Quality-Checked Before Dispatch**

At Praashi by Supal, we take great care in ensuring that each piece of jewellery is quality-checked before dispatch.

## Return Policy Overview
We do not offer returns or exchanges on products once sold. An exchange will be considered only in case the customer has received the wrong product.

## Exchange Eligibility
To be eligible for an exchange, the customer must:

1. **Contact Within 24 Hours**
   Send us an email within 24 hours of delivery to initiate the exchange process

2. **Provide Unboxing Video**
   Attach a complete unboxing video clearly showing the parcel opening and product received

### ⚠️ Important Notice
**Requests without a proper video or raised after 24 hours will not be entertained.**

## Exchange Process
If you have received the wrong product, follow these steps:
1. Contact us immediately via email at support@praashibysupal.com
2. Provide your order number and details of the wrong product received
3. Attach the complete unboxing video as proof
4. We will verify the issue and arrange for the correct product to be sent
5. Return the incorrect item using the packaging provided

## Quality Assurance
Our commitment to quality:
- Each piece undergoes thorough quality inspection before dispatch
- Professional quality control team ensures product standards
- Careful packaging to prevent damage during transit
- Detailed product descriptions and images for accurate expectations

## What We Don't Accept
### ❌ Not Eligible for Exchange
The following situations are not eligible for exchange:
- Change of mind or preference
- Size issues (please check size charts before ordering)
- Color or style preferences
- Items damaged after delivery
- Requests made after 24 hours of delivery
- Missing unboxing video evidence
- Any other reasons except receiving the wrong product

## Contact for Exchanges
For exchange inquiries (wrong product only):
- **Email:** support@praashibysupal.com
- **Phone:** +91 87806 06280
- **WhatsApp:** +91 87806 06280
- **Business Hours:** Monday to Saturday, 10 AM to 7 PM
- **Response Time:** Within 24 hours during business days

### 💎 Quality Commitment
We are committed to delivering quality products and ensuring you receive exactly what you ordered. Our quality control process minimizes the chances of wrong product delivery.`,
      status: 'published',
      lastUpdated: '2025-01-15'
    }
  ]);

  const [editingPage, setEditingPage] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPage, setNewPage] = useState({
    title: '',
    slug: '',
    content: '',
    status: 'draft'
  });

  const handleEdit = (page) => {
    setEditingPage({ ...page });
    setShowAddForm(false);
  };

  const handleSave = () => {
    if (editingPage) {
      setPages(pages.map(page => 
        page.id === editingPage.id 
          ? { ...editingPage, lastUpdated: new Date().toISOString().split('T')[0] }
          : page
      ));
      setEditingPage(null);
    }
  };

  const handleCancel = () => {
    setEditingPage(null);
    setShowAddForm(false);
    setNewPage({ title: '', slug: '', content: '', status: 'draft' });
  };

  const handleDelete = (pageId) => {
    if (window.confirm('Are you sure you want to delete this page?')) {
      setPages(pages.filter(page => page.id !== pageId));
    }
  };

  const handleAdd = () => {
    if (newPage.title && newPage.slug && newPage.content) {
      const page = {
        ...newPage,
        id: Date.now(),
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      setPages([...pages, page]);
      setNewPage({ title: '', slug: '', content: '', status: 'draft' });
      setShowAddForm(false);
    }
  };

  const handleView = (slug) => {
    window.open(`/${slug}`, '_blank');
  };

  return (
    <div className="admin-footer-pages">
      <div className="page-header">
        <div>
          <h1>📝 Footer Pages Management</h1>
          <p>Manage legal pages like Privacy Policy, Terms of Service, Shipping Info, and Returns & Exchanges</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          <FaPlus /> Add New Page
        </button>
      </div>

      {showAddForm && (
        <div className="form-modal">
          <div className="form-content">
            <div className="form-header">
              <h2>Add New Page</h2>
              <button className="close-btn" onClick={handleCancel}>
                <FaTimes />
              </button>
            </div>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={newPage.title}
                onChange={(e) => setNewPage({ ...newPage, title: e.target.value })}
                placeholder="Enter page title"
              />
            </div>
            <div className="form-group">
              <label>Slug</label>
              <input
                type="text"
                value={newPage.slug}
                onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })}
                placeholder="Enter URL slug (e.g., about-us)"
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={newPage.status}
                onChange={(e) => setNewPage({ ...newPage, status: e.target.value })}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="form-group">
              <label>Content (Markdown)</label>
              <textarea
                value={newPage.content}
                onChange={(e) => setNewPage({ ...newPage, content: e.target.value })}
                placeholder="Enter page content in Markdown format"
                rows="20"
              />
            </div>
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAdd}>
                <FaSave /> Add Page
              </button>
            </div>
          </div>
        </div>
      )}

      {editingPage && (
        <div className="form-modal">
          <div className="form-content">
            <div className="form-header">
              <h2>Edit Page: {editingPage.title}</h2>
              <button className="close-btn" onClick={handleCancel}>
                <FaTimes />
              </button>
            </div>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={editingPage.title}
                onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Slug</label>
              <input
                type="text"
                value={editingPage.slug}
                onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={editingPage.status}
                onChange={(e) => setEditingPage({ ...editingPage, status: e.target.value })}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="form-group">
              <label>Content (Markdown)</label>
              <textarea
                value={editingPage.content}
                onChange={(e) => setEditingPage({ ...editingPage, content: e.target.value })}
                rows="20"
              />
            </div>
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                <FaSave /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pages-grid">
        {pages.map(page => (
          <div key={page.id} className="page-card">
            <div className="page-header">
              <h3>{page.title}</h3>
              <span className={`status-badge ${page.status}`}>
                {page.status}
              </span>
            </div>
            <div className="page-info">
              <p><strong>Slug:</strong> /{page.slug}</p>
              <p><strong>Last Updated:</strong> {page.lastUpdated}</p>
              <p><strong>Content Length:</strong> {page.content.length} characters</p>
            </div>
            <div className="page-actions">
              <button 
                className="btn btn-sm btn-info"
                onClick={() => handleView(page.slug)}
                title="View Page"
              >
                <FaEye />
              </button>
              <button 
                className="btn btn-sm btn-warning"
                onClick={() => handleEdit(page)}
                title="Edit Page"
              >
                <FaEdit />
              </button>
              <button 
                className="btn btn-sm btn-danger"
                onClick={() => handleDelete(page.id)}
                title="Delete Page"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminFooterPages;
