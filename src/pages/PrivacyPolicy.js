import React from 'react';
import { Helmet } from 'react-helmet-async';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - Praashibysupal</title>
        <meta name="description" content="Privacy Policy for Praashi by Supal - Learn how we collect, use, and protect your personal information." />
      </Helmet>
      
      <div className="legal-page">
        <div className="container">
          <div className="legal-content">
            <h1 className="legal-title">Privacy Policy</h1>
            <p className="last-updated">Last updated: January 15, 2025</p>
            
            <div className="legal-section">
              <p>
                At Praashi by Supal, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website or make a purchase.
              </p>
            </div>

            <div className="legal-section">
              <h2>Information We Collect</h2>
              
              <h3>Personal Information</h3>
              <p>When you make a purchase or attempt to make a purchase through our site, we collect certain information from you, including:</p>
              <ul>
                <li>Name and contact information (email address, phone number)</li>
                <li>Billing and shipping addresses</li>
                <li>Payment information (credit card details, billing address)</li>
                <li>Order history and preferences</li>
              </ul>

              <h3>Automatically Collected Information</h3>
              <p>We automatically collect certain information about your device when you visit our website, including:</p>
              <ul>
                <li>Web browser information</li>
                <li>IP address</li>
                <li>Time zone and location data</li>
                <li>Pages visited and time spent on our site</li>
                <li>Referring website information</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2>How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your orders and our products</li>
                <li>Improve our website and customer experience</li>
                <li>Send you marketing communications (with your consent)</li>
                <li>Prevent fraud and enhance security</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2>Information Sharing</h2>
              <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:</p>
              <ul>
                <li>To trusted service providers who assist us in operating our website and conducting our business</li>
                <li>To comply with legal requirements or protect our rights</li>
                <li>In connection with a business transfer or acquisition</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2>Data Security</h2>
              <p>
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
              </p>
            </div>

            <div className="legal-section">
              <h2>Cookies and Tracking</h2>
              <p>
                We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookie settings through your browser preferences.
              </p>
            </div>

            <div className="legal-section">
              <h2>Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access and update your personal information</li>
                <li>Request deletion of your personal information</li>
                <li>Opt-out of marketing communications</li>
                <li>Request a copy of your data</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2>Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
