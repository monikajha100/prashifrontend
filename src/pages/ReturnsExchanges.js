import React from 'react';
import { Helmet } from 'react-helmet-async';
import './ReturnsExchanges.css';

const ReturnsExchanges = () => {
  return (
    <>
      <Helmet>
        <title>Returns & Exchanges - Praashibysupal</title>
        <meta name="description" content="Returns & Exchanges Policy for Praashi by Supal - Quality-checked jewelry with limited exchange policy for wrong products only." />
      </Helmet>
      
      <div className="legal-page">
        <div className="container">
          <div className="legal-content">
            <h1 className="legal-title">Returns & Exchanges</h1>
            <p className="returns-subtitle">Quality-checked Jewelry with limited exchange policy</p>
            
            <div className="quality-highlight">
              <h2 className="highlight-title">🔍 Quality Assurance</h2>
              <p className="highlight-text">
                <strong>Quality-Checked Before Dispatch</strong>
              </p>
              <p>At Praashi by Supal, we take great care in ensuring that each piece of jewellery is quality-checked before dispatch.</p>
            </div>

            <div className="legal-section">
              <h2>Return Policy Overview</h2>
              <p>
                We do not offer returns or exchanges on products once sold. An exchange will be considered only in case the customer has received the wrong product.
              </p>
            </div>

            <div className="legal-section">
              <h2>Exchange Eligibility</h2>
              <p>To be eligible for an exchange, the customer must:</p>
              
              <div className="eligibility-steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h3>Contact Within 24 Hours</h3>
                    <p>Send us an email within 24 hours of delivery to initiate the exchange process</p>
                  </div>
                </div>
                
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h3>Provide Unboxing Video</h3>
                    <p>Attach a complete unboxing video clearly showing the parcel opening and product received</p>
                  </div>
                </div>
              </div>

              <div className="warning-notice">
                <h3>⚠️ Important Notice</h3>
                <p>
                  <strong>Requests without a proper video or raised after 24 hours will not be entertained.</strong>
                </p>
              </div>
            </div>

            <div className="legal-section">
              <h2>Exchange Process</h2>
              <p>If you have received the wrong product, follow these steps:</p>
              <ol>
                <li>Contact us immediately via email at support@praashibysupal.com</li>
                <li>Provide your order number and details of the wrong product received</li>
                <li>Attach the complete unboxing video as proof</li>
                <li>We will verify the issue and arrange for the correct product to be sent</li>
                <li>Return the incorrect item using the packaging provided</li>
              </ol>
            </div>

            <div className="legal-section">
              <h2>Quality Assurance</h2>
              <p>Our commitment to quality:</p>
              <ul>
                <li>Each piece undergoes thorough quality inspection before dispatch</li>
                <li>Professional quality control team ensures product standards</li>
                <li>Careful packaging to prevent damage during transit</li>
                <li>Detailed product descriptions and images for accurate expectations</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2>What We Don't Accept</h2>
              
              <h3>❌ Not Eligible for Exchange</h3>
              <p>The following situations are not eligible for exchange:</p>
              <ul>
                <li>Change of mind or preference</li>
                <li>Size issues (please check size charts before ordering)</li>
                <li>Color or style preferences</li>
                <li>Items damaged after delivery</li>
                <li>Requests made after 24 hours of delivery</li>
                <li>Missing unboxing video evidence</li>
                <li>Any other reasons except receiving the wrong product</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2>Contact for Exchanges</h2>
              <p>For exchange inquiries (wrong product only):</p>
              <ul>
                <li><strong>Email:</strong> support@praashibysupal.com</li>
                <li><strong>Phone:</strong> +91 87806 06280</li>
                <li><strong>WhatsApp:</strong> +91 87806 06280</li>
                <li><strong>Business Hours:</strong> Monday to Saturday, 10 AM to 7 PM</li>
                <li><strong>Response Time:</strong> Within 24 hours during business days</li>
              </ul>
            </div>

            <div className="quality-highlight">
              <h3>💎 Quality Commitment</h3>
              <p>
                We are committed to delivering quality products and ensuring you receive exactly what you ordered. Our quality control process minimizes the chances of wrong product delivery.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReturnsExchanges;
