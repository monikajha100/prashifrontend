import React from 'react';
import { Helmet } from 'react-helmet-async';
import './TermsOfService.css';

const TermsOfService = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service - Praashibysupal</title>
        <meta name="description" content="Terms of Service for Praashi by Supal - Read our terms and conditions for using our website and services." />
      </Helmet>
      
      <div className="legal-page">
        <div className="container">
          <div className="legal-content">
            <h1 className="legal-title">Terms of Service</h1>
            <p className="last-updated">Last updated: January 15, 2025</p>
            
            <div className="legal-section">
              <p>
                Welcome to Praashi by Supal! These Terms of Service ("Terms") govern your use of our website and services. By accessing or using our website, you agree to be bound by these Terms.
              </p>
            </div>

            <div className="legal-section">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </div>

            <div className="legal-section">
              <h2>2. Use License</h2>
              <p>
                Permission is granted to temporarily download one copy of the materials on Praashi by Supal's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul>
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on the website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2>3. Product Information</h2>
              <p>
                We strive to provide accurate product descriptions, images, and pricing information. However, we do not warrant that product descriptions or other content is accurate, complete, reliable, current, or error-free.
              </p>

              <h3>Product Availability</h3>
              <p>
                All products are subject to availability. We reserve the right to discontinue any product at any time without notice.
              </p>

              <h3>Pricing</h3>
              <p>
                Prices are subject to change without notice. We reserve the right to modify prices at any time, but such changes will not affect orders that have already been placed.
              </p>
            </div>

            <div className="legal-section">
              <h2>4. Orders and Payment</h2>
              <p>
                When you place an order through our website, you are making an offer to purchase products. We reserve the right to accept or decline your order for any reason.
              </p>

              <h3>Payment Terms</h3>
              <ul>
                <li>Payment is due at the time of order placement</li>
                <li>We accept major credit cards, debit cards, and other payment methods as displayed</li>
                <li>All payments are processed securely through our payment partners</li>
                <li>You are responsible for any applicable taxes</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2>5. Shipping and Delivery</h2>
              <p>
                Shipping terms and delivery times are provided at the time of checkout. We are not responsible for delays caused by shipping carriers or circumstances beyond our control.
              </p>

              <h3>Free Shipping</h3>
              <p>
                Free shipping is available on orders of ₹999 and above. Shipping charges apply to orders below this threshold.
              </p>
            </div>

            <div className="legal-section">
              <h2>6. Returns and Exchanges</h2>
              <p>
                Please refer to our Returns & Exchanges policy for detailed information about returning or exchanging products.
              </p>
            </div>

            <div className="legal-section">
              <h2>7. User Accounts</h2>
              <p>
                When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
              </p>
            </div>

            <div className="legal-section">
              <h2>8. Prohibited Uses</h2>
              <p>You may not use our website:</p>
              <ul>
                <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2>9. Intellectual Property</h2>
              <p>
                The content, organization, graphics, design, compilation, magnetic translation, digital conversion, and other matters related to the website are protected under applicable copyrights, trademarks, and other proprietary rights.
              </p>
            </div>

            <div className="legal-section">
              <h2>10. Disclaimer</h2>
              <p>
                The information on this website is provided on an "as is" basis. To the fullest extent permitted by law, this Company:
              </p>
              <ul>
                <li>Excludes all representations and warranties relating to this website and its contents</li>
                <li>Excludes all liability for damages arising out of or in connection with your use of this website</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2>11. Limitation of Liability</h2>
              <p>
                In no event shall Praashi by Supal, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the website.
              </p>
            </div>

            <div className="legal-section">
              <h2>12. Governing Law</h2>
              <p>
                These Terms shall be interpreted and governed by the laws of India, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
              </p>
            </div>

            <div className="legal-section">
              <h2>13. Changes to Terms</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </div>

            <div className="legal-section">
              <h3>Important Notice</h3>
              <p>
                By using our website, you acknowledge that you have read and understood these Terms of Service and agree to be bound by them. If you do not agree to these terms, please do not use our website.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsOfService;
