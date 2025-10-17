import React from 'react';
import { Helmet } from 'react-helmet-async';
import './ShippingInfo.css';

const ShippingInfo = () => {
  return (
    <>
      <Helmet>
        <title>Shipping Policy - Praashibysupal</title>
        <meta name="description" content="Shipping Policy for Praashi by Supal - Fast, reliable, and secure delivery to your doorstep with free shipping on orders above ₹999." />
      </Helmet>
      
      <div className="legal-page">
        <div className="container">
          <div className="legal-content">
            <h1 className="legal-title">Shipping Policy</h1>
            <p className="shipping-subtitle">Fast, reliable, and secure delivery to your doorstep</p>
            
            <div className="shipping-highlight">
              <h2 className="highlight-title">🚚 Free Shipping Offer</h2>
              <p className="highlight-text">
                <strong>Free Shipping on Orders ₹999 & Above</strong>
              </p>
              <p>Enjoy complimentary shipping on all orders across India!</p>
            </div>

            <div className="legal-section">
              <h2>Shipping Overview</h2>
              <p>
                We are committed to delivering your jewelry safely and on time. Here's everything you need to know about our shipping policy:
              </p>
            </div>

            <div className="legal-section">
              <h2>Processing & Dispatch</h2>
              <p>
                <strong>Orders are dispatched within 2-3 working days.</strong>
              </p>
              <p>
                Once your order is confirmed and payment is verified, we begin processing your order immediately. Our team carefully prepares and packages each item to ensure it reaches you in perfect condition.
              </p>
            </div>

            <div className="legal-section">
              <h2>Delivery Timeline</h2>
              <p>
                <strong>Delivery time: 3–7 days within India (location dependent).</strong>
              </p>
              
              <div className="delivery-table">
                <table>
                  <thead>
                    <tr>
                      <th>Location Type</th>
                      <th>Delivery Time</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Metro Cities</strong></td>
                      <td>3-4 days</td>
                      <td>Mumbai, Delhi, Bangalore, Chennai, Kolkata, Hyderabad, Pune, Ahmedabad</td>
                    </tr>
                    <tr>
                      <td><strong>Major Cities</strong></td>
                      <td>4-5 days</td>
                      <td>State capitals and major district headquarters</td>
                    </tr>
                    <tr>
                      <td><strong>Other Locations</strong></td>
                      <td>5-7 days</td>
                      <td>Smaller towns and remote areas</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="legal-section">
              <h2>Shipping Options & Charges</h2>
              
              <h3>💰 Shipping Cost Structure</h3>
              <p>
                <strong>Free shipping on all orders!</strong>
              </p>
              
              <div className="shipping-table">
                <table>
                  <thead>
                    <tr>
                      <th>Shipping Method</th>
                      <th>Delivery Time</th>
                      <th>Cost (Orders below ₹999)</th>
                      <th>Cost (Orders ₹999+)</th>
                      <th>Coverage</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Standard Shipping</strong></td>
                      <td>3-7 days</td>
                      <td>₹80</td>
                      <td>FREE</td>
                      <td>All India</td>
                    </tr>
                    <tr>
                      <td><strong>Express Shipping</strong></td>
                      <td>2-3 days</td>
                      <td>₹150</td>
                      <td>₹150</td>
                      <td>All India</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3>Shipping Cost Summary</h3>
              <ul>
                <li><strong>Orders ₹999 and above:</strong> FREE standard shipping</li>
                <li><strong>All orders:</strong> Free shipping</li>
                <li><strong>Express Shipping:</strong> ₹150 (all orders)</li>
                <li><strong>No hidden charges:</strong> What you see is what you pay</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2>Order Tracking</h2>
              <p>
                <strong>Tracking details will be shared once shipped.</strong>
              </p>
              <p>As soon as your order is dispatched from our warehouse, you will receive:</p>
              <ul>
                <li>Email notification with tracking number</li>
                <li>SMS updates on your registered mobile number</li>
                <li>Real-time tracking link to monitor your package</li>
                <li>Estimated delivery date and time</li>
              </ul>

              <h3>How to Track Your Order</h3>
              <ol>
                <li>Check your email for the tracking notification</li>
                <li>Click on the tracking link provided</li>
                <li>Use the tracking number on the courier's website</li>
                <li>Monitor real-time updates on delivery status</li>
              </ol>
            </div>

            <div className="legal-section">
              <h2>Secure Packaging</h2>
              <p>
                <strong>All items are securely packed to avoid damage.</strong>
              </p>
              <p>We take extra care to pack your precious Jewelry:</p>
              <ul>
                <li>Each item is individually wrapped in protective material</li>
                <li>Items are placed in branded gift boxes</li>
                <li>Additional bubble wrap and padding for fragile items</li>
                <li>Tamper-evident packaging for security</li>
                <li>Insurance coverage for all shipments</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2>Delivery Process</h2>
              <p>Our delivery process ensures your package reaches you safely:</p>
              <ul>
                <li><strong>Address Verification:</strong> We verify your address before dispatch</li>
                <li><strong>Safe Handling:</strong> Packages are handled with care throughout transit</li>
                <li><strong>Delivery Attempt:</strong> Our courier partners will attempt delivery at your address</li>
                <li><strong>Contact Information:</strong> Keep your phone number active for delivery updates</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2>Delivery Instructions</h2>
              <p>To ensure smooth delivery:</p>
              <ul>
                <li>Provide accurate and complete address details</li>
                <li>Include landmark information for easy location</li>
                <li>Ensure someone is available to receive the package</li>
                <li>Keep your phone number active for delivery updates</li>
                <li>Check your email regularly for delivery notifications</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2>Failed Delivery</h2>
              <p>If delivery fails due to:</p>
              <ul>
                <li><strong>Incorrect Address:</strong> Contact us immediately to update the address</li>
                <li><strong>Recipient Unavailable:</strong> The package will be held at the nearest delivery center for 3 days</li>
                <li><strong>Refused Delivery:</strong> The package will be returned to us</li>
                <li><strong>Wrong Contact Number:</strong> Update your contact details in your account</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2>International Shipping</h2>
              <p>
                Currently, we only ship within India. International shipping will be available soon. Please check back for updates.
              </p>
            </div>

            <div className="legal-section">
              <h2>Contact for Shipping Issues</h2>
              <p>If you have any questions or concerns about your shipment:</p>
              <ul>
                <li><strong>Email:</strong> support@praashibysupal.com</li>
                <li><strong>Phone:</strong> +91 87806 06280</li>
                <li><strong>WhatsApp:</strong> +91 87806 06280</li>
                <li><strong>Business Hours:</strong> Monday to Saturday, 10 AM to 7 PM</li>
              </ul>
            </div>

            <div className="shipping-highlight">
              <h3>📦 Safe & Secure Delivery</h3>
              <p>
                Your precious Jewelry is our priority. We ensure every package is handled with utmost care and delivered safely to your doorstep with complete tracking and insurance coverage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShippingInfo;
