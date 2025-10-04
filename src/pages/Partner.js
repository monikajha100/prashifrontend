import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FaBuilding, FaHandshake, FaStore, FaCheckCircle, FaUpload, FaUserCheck, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Partner.css';

const Partner = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    business: '',
    partnershipType: '',
    experience: '',
    documents: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      documents: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await fetch('/api/partners/apply', {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          business: '',
          partnershipType: '',
          experience: '',
          documents: null
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="partner-page">
      <Helmet>
        <title>Join Praashibysupal Network - Become a Partner</title>
        <meta name="description" content="Join Praashi by Supal as a Franchise Partner, Agency Partner, or Reseller Partner. Choose your role and start your journey with us." />
      </Helmet>

      <div className="container">
        <motion.div 
          className="partner-container"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="partner-header">
            <Link to="/" className="back-link">
              <FaArrowLeft /> Back to Home
            </Link>
            <h1>Join Praashibysupal Network</h1>
            <p className="partner-subtitle">
              Choose your role and start your journey with us
            </p>
          </div>

          {/* Partnership Types */}
          <div className="partnership-types">
            <motion.div 
              className="partnership-card franchise"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="partnership-icon">
                <FaBuilding />
              </div>
              <h3>Franchise Partner</h3>
              <p>Open your own store with full support and exclusive territory rights.</p>
              <ul className="partnership-benefits">
                <li>Exclusive territory rights</li>
                <li>Complete store setup support</li>
                <li>Marketing and advertising assistance</li>
                <li>Training and ongoing support</li>
                <li>Inventory management system</li>
                <li>Brand recognition and reputation</li>
              </ul>
              <div className="commission-rate">
                <span className="rate">15-25%</span>
                <span className="label">Commission Rate</span>
              </div>
              <button className="apply-btn" onClick={() => setFormData(prev => ({ ...prev, partnershipType: 'franchise' }))}>
                Apply as Franchise
              </button>
            </motion.div>

            <motion.div 
              className="partnership-card agency"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="partnership-icon">
                <FaHandshake />
              </div>
              <h3>Agency Partner</h3>
              <p>Manage multiple resellers and earn higher commissions through your network.</p>
              <ul className="partnership-benefits">
                <li>Manage multiple resellers</li>
                <li>Higher commission rates</li>
                <li>Sales training and support</li>
                <li>Performance tracking tools</li>
                <li>Priority customer support</li>
              </ul>
              <div className="commission-rate">
                <span className="rate">10-20%</span>
                <span className="label">Commission Rate</span>
              </div>
              <button className="apply-btn" onClick={() => setFormData(prev => ({ ...prev, partnershipType: 'agency' }))}>
                Apply as Agency
              </button>
            </motion.div>

            <motion.div 
              className="partnership-card reseller"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="partnership-icon">
                <FaStore />
              </div>
              <h3>Reseller Partner</h3>
              <p>Start selling products with minimal investment and maximum flexibility.</p>
              <ul className="partnership-benefits">
                <li>Low startup investment</li>
                <li>Flexible working hours</li>
                <li>Online and offline selling</li>
                <li>Product catalog access</li>
                <li>Basic training provided</li>
                <li>Commission-based earnings</li>
              </ul>
              <div className="commission-rate">
                <span className="rate">10-15%</span>
                <span className="label">Commission Rate</span>
              </div>
              <button className="apply-btn" onClick={() => setFormData(prev => ({ ...prev, partnershipType: 'reseller' }))}>
                Apply as Reseller
              </button>
            </motion.div>
          </div>

          {/* Digital Contract Process */}
          <motion.div 
            className="contract-process"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2>Digital Contract Process</h2>
            <div className="process-note">
              <FaUserCheck className="note-icon" />
              <span>Admin Approval Required</span>
              <p>All applications go through our approval process to ensure quality partnerships</p>
            </div>
            
            <div className="process-steps">
              <div className="process-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Apply Online</h4>
                  <p>Fill out the application form with your details and business information</p>
                </div>
              </div>
              <div className="process-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Upload Documents</h4>
                  <p>Upload required documents like ID proof, business registration, and bank details</p>
                </div>
              </div>
              <div className="process-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Digital Contract</h4>
                  <p>Review and sign the digital contract with terms and conditions</p>
                </div>
              </div>
              <div className="process-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Admin Review</h4>
                  <p>Our admin team reviews your application and documents</p>
                </div>
              </div>
              <div className="process-step">
                <div className="step-number">5</div>
                <div className="step-content">
                  <h4>Approval & Access</h4>
                  <p>Once approved, you'll get access to your partner dashboard</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Application Form */}
          <motion.div 
            className="application-form-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h2>Partnership Application</h2>
            <p>Fill out the form below to start your partnership journey with us.</p>
            
            {submitStatus === 'success' && (
              <div className="success-message">
                <FaCheckCircle />
                <h3>Application Submitted Successfully!</h3>
                <p>Thank you for your interest in partnering with us. Our team will review your application and get back to you within 24 hours.</p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="error-message">
                <h3>Submission Failed</h3>
                <p>There was an error submitting your application. Please try again or contact us directly.</p>
              </div>
            )}

            <form className="partnership-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="business" className="form-label">Business Name *</label>
                  <input
                    type="text"
                    id="business"
                    name="business"
                    value={formData.business}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                    placeholder="Enter your business name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="partnershipType" className="form-label">Partnership Type *</label>
                <select 
                  id="partnershipType" 
                  name="partnershipType" 
                  value={formData.partnershipType}
                  onChange={handleInputChange}
                  className="form-input" 
                  required
                >
                  <option value="">Select partnership type</option>
                  <option value="franchise">Franchise Partner</option>
                  <option value="agency">Agency Partner</option>
                  <option value="reseller">Reseller Partner</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="experience" className="form-label">Business Experience</label>
                <textarea
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="form-textarea"
                  rows="4"
                  placeholder="Tell us about your business experience and why you want to partner with us..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="documents" className="form-label">
                  <FaUpload /> Upload Documents (Optional)
                </label>
                <input
                  type="file"
                  id="documents"
                  name="documents"
                  onChange={handleFileChange}
                  className="form-file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <small className="file-help">Upload ID proof, business registration, or other relevant documents (PDF, DOC, or images)</small>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Partner;
