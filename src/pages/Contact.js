import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { contactAPI } from '../services/api';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [faqOpen, setFaqOpen] = useState(null);

  const contactMutation = useMutation(
    (data) => contactAPI.submit(data),
    {
      onSuccess: () => {
        toast.success('🎉 Thank you! Your message has been sent successfully. We\'ll get back to you within 24 hours.');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      },
      onError: (error) => {
        const message = error.response?.data?.message || '❌ Sorry, there was an error sending your message. Please try again or contact us directly.';
        toast.error(message);
      }
    }
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Enhanced validation
    const errors = validateForm(formData);
    if (errors.length > 0) {
      toast.error('Please fix the following errors:\n• ' + errors.join('\n• '));
      return;
    }
    
    contactMutation.mutate(formData);
  };

  const validateForm = (data) => {
    const errors = [];
    
    if (!data.firstName.trim()) errors.push('First name is required');
    if (!data.lastName.trim()) errors.push('Last name is required');
    if (!data.email.trim()) errors.push('Email is required');
    if (!data.subject) errors.push('Subject is required');
    if (!data.message.trim()) errors.push('Message is required');
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.email && !emailRegex.test(data.email)) {
      errors.push('Please enter a valid email address');
    }
    
    if (data.message.trim().length < 10) {
      errors.push('Message must be at least 10 characters long');
    }
    
    if (data.phone && data.phone.trim()) {
      const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(data.phone.replace(/\s/g, ''))) {
        errors.push('Please enter a valid phone number');
      }
    }
    
    return errors;
  };

  const toggleFAQ = (index) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  return (
    <div className="contact-page">
      <Helmet>
        <title>Contact Us - Praashibysupal</title>
        <meta name="description" content="Get in touch with Praashibysupal for inquiries, custom jewelry orders, or any questions about our luxury Victorian-inspired jewelry collection." />
        <meta name="keywords" content="jewelry, victorian sets, color changing jewelry, designer jewelry, luxury jewelry, earrings, necklaces, rings" />
        <meta name="theme-color" content="#D4AF37" />
      </Helmet>

      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <h1 className="page-title">Contact Us</h1>
          <p className="page-subtitle">We'd love to hear from you. Get in touch with us for any inquiries or custom jewelry requests.</p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="container">
          <div className="contact-container">
            {/* Contact Form (Left Side) */}
            <div className="contact-form-container">
              <div className="form-header">
                <h2>
                  <i className="fas fa-envelope"></i>
                  Send Us a Message
                </h2>
                <p>
                  We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                </p>
              </div>
              
              <form className="contact-form" onSubmit={handleSubmit}>
                {/* Personal Information Section */}
                <div className="form-section">
                  <h3>
                    <i className="fas fa-user"></i>
                    Personal Information
                  </h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        First Name <span className="required">*</span>
                      </label>
                      <input 
                        type="text" 
                        name="firstName" 
                        value={formData.firstName}
                        onChange={handleChange}
                        required 
                        placeholder="Enter your first name"
                      />
                      <div className="field-help">Required field</div>
                    </div>
                    <div className="form-group">
                      <label>
                        Last Name <span className="required">*</span>
                      </label>
                      <input 
                        type="text" 
                        name="lastName" 
                        value={formData.lastName}
                        onChange={handleChange}
                        required 
                        placeholder="Enter your last name"
                      />
                      <div className="field-help">Required field</div>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        Email Address <span className="required">*</span>
                      </label>
                      <input 
                        type="email" 
                        name="email" 
                        value={formData.email}
                        onChange={handleChange}
                        required 
                        placeholder="your.email@example.com"
                      />
                      <div className="field-help">We'll use this to respond to you</div>
                    </div>
                    <div className="form-group">
                      <label>
                        Phone Number
                      </label>
                      <input 
                        type="tel" 
                        name="phone" 
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                      />
                      <div className="field-help">Optional - for urgent inquiries</div>
                    </div>
                  </div>
                </div>
                
                {/* Inquiry Details Section */}
                <div className="form-section">
                  <h3>
                    <i className="fas fa-comment-dots"></i>
                    Inquiry Details
                  </h3>
                
                  <div className="form-group">
                    <label>
                      Subject <span className="required">*</span>
                    </label>
                    <select 
                      name="subject" 
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Choose a subject that best describes your inquiry</option>
                      <option value="general">General Inquiry</option>
                      <option value="custom">Custom Jewelry Request</option>
                      <option value="order">Order Support & Tracking</option>
                      <option value="return">Returns & Exchanges</option>
                      <option value="wholesale">Wholesale & Partnership</option>
                      <option value="complaint">Complaint or Feedback</option>
                      <option value="other">Other</option>
                    </select>
                    <div className="field-help">Help us route your inquiry to the right team</div>
                  </div>
                  
                  <div className="form-group">
                    <label>
                      Message <span className="required">*</span>
                    </label>
                    <textarea 
                      name="message" 
                      rows="6" 
                      value={formData.message}
                      onChange={handleChange}
                      required 
                      placeholder="Please provide as much detail as possible about your inquiry. Include any specific requirements, order numbers, or questions you may have..."
                    ></textarea>
                    <div className="field-help">Minimum 10 characters required</div>
                  </div>
                </div>
                
                {/* Form Actions */}
                <div className="form-actions">
                  <button type="submit" disabled={contactMutation.isLoading}>
                    <i className="fas fa-paper-plane"></i>
                    {contactMutation.isLoading ? 'Sending...' : 'Send Message'}
                  </button>
                  <p>
                    <i className="fas fa-clock"></i>
                    We typically respond within 24 hours
                  </p>
                </div>
              </form>
            </div>
            
            {/* Contact Information (Right Side) */}
            <div className="contact-info">
              <div className="contact-info-header">
                <h2>
                  <i className="fas fa-phone"></i>
                  Contact Information
                </h2>
                <p>
                  Multiple ways to reach us. Choose what works best for you.
                </p>
              </div>
              
              <div className="contact-methods">
                {/* Phone Contact */}
                <div className="contact-method">
                  <div className="contact-icon">
                    <i className="fas fa-phone"></i>
                  </div>
                  <div className="contact-details">
                    <h3>Phone Support</h3>
                    <p>+91 87806 06280</p>
                    <p className="contact-time">
                      <i className="fas fa-clock"></i>
                      Mon-Fri 9AM-6PM IST
                    </p>
                  </div>
                  <a href="tel:+918780606280" className="contact-action">
                    <i className="fas fa-phone"></i>
                    Call Now
                  </a>
                </div>
                
                {/* Email Contact */}
                <div className="contact-method">
                  <div className="contact-icon">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div className="contact-details">
                    <h3>Email Support</h3>
                    <p>hello@praashibysupal.co.in</p>
                    <p className="contact-time">
                      <i className="fas fa-reply"></i>
                      We'll respond within 24 hours
                    </p>
                  </div>
                  <a href="mailto:hello@praashibysupal.co.in" className="contact-action">
                    <i className="fas fa-envelope"></i>
                    Email Us
                  </a>
                </div>
                
                {/* Address Contact */}
                <div className="contact-method">
                  <div className="contact-icon">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div className="contact-details">
                    <h3>Store Address</h3>
                    <p>203 SF Anikedhya Capital -2<br />
                    Nr Mahalaxmi Cross Road, Paldi<br />
                    Ahmedabad, Gujarat, India-380006</p>
                  </div>
                  <a href="https://maps.google.com/?q=203+SF+ANIKEDHYA+CAPITAL+-2+NR+MAHALAXMI+CROSS+ROAD+PALDI+AHMEDABAD" target="_blank" rel="noopener noreferrer" className="contact-action">
                    <i className="fas fa-directions"></i>
                    Directions
                  </a>
                </div>
              </div>
              
              <div className="social-links">
                <h3>
                  <i className="fas fa-share-alt"></i>
                  Follow Us
                </h3>
                <div className="social-icons">
                  <a href="https://instagram.com/praashibysupal" target="_blank" rel="noopener noreferrer" title="Instagram">
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a href="https://facebook.com/praashibysupal" target="_blank" rel="noopener noreferrer" title="Facebook">
                    <i className="fab fa-facebook"></i>
                  </a>
                  <a href="https://twitter.com/praashibysupal" target="_blank" rel="noopener noreferrer" title="Twitter">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="https://youtube.com/praashibysupal" target="_blank" rel="noopener noreferrer" title="YouTube">
                    <i className="fab fa-youtube"></i>
                  </a>
                  <a href="https://wa.me/918780606280" target="_blank" rel="noopener noreferrer" title="WhatsApp">
                    <i className="fab fa-whatsapp"></i>
                  </a>
                </div>
              </div>
              
              <div className="business-hours">
                <h3>
                  <i className="fas fa-clock"></i>
                  Business Hours
                </h3>
                <div className="hours-content">
                  <p><strong>Monday - Friday:</strong> 10:00 AM - 6:00 PM</p>
                  <p><strong>Saturday:</strong> 10:00 AM - 4:00 PM</p>
                  <p><strong>Sunday:</strong> Closed</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Map Section (Below) */}
          <div className="map-section">
            <div className="location-header">
              <h2>
                <i className="fas fa-map-marker-alt"></i>
                Find Us Here
              </h2>
            </div>
                  
            {/* Enhanced Location Section */}
            <div className="location-section">
              {/* Map and Photo Container */}
              <div className="location-visual-container">
                {/* Main Container with Overlay Effect */}
                <div className="location-main">
                  {/* Background Map */}
                  <div className="map-background">
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.123456789!2d72.123456789!3d19.123456789!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDA3JzI0LjQiTiA3MsKwMDcnMjQuNCJF!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
                      width="100%" 
                      height="100%" 
                      style={{border:0, filter: 'grayscale(20%) brightness(0.9)'}} 
                      allowFullScreen="" 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Praashibysupal Location"
                    />
                  </div>
                  
                  {/* Location Pin */}
                  <div className="location-pin">
                    <i className="fas fa-map-pin"></i>
                    <span>Praashibysupal Showroom</span>
                  </div>
                </div>
                
                {/* Address Card */}
                <div className="address-card">
                  <div className="address-content">
                    {/* Address Info */}
                    <div className="address-info">
                      <h4>
                        <i className="fas fa-building"></i>
                        Store Address
                      </h4>
                      <p>
                        <strong>Praashibysupal Showroom</strong><br />
                        203 SF Anikedhya Capital -2<br />
                        Nr Mahalaxmi Cross Road Paldi<br />
                        Ahmedabad, Gujarat, India-380006
                      </p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="location-actions">
                      <a href="https://maps.google.com/?q=203+SF+ANIKEDHYA+CAPITAL+-2+NR+MAHALAXMI+CROSS+ROAD+PALDI+AHMEDABAD" 
                         target="_blank" 
                         rel="noopener noreferrer"
                      >
                        <i className="fas fa-directions"></i>
                        Get Directions
                      </a>
                      <a href="tel:+918780606280">
                        <i className="fas fa-phone"></i>
                        Call Now
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-container">
            <div className="faq-item">
              <button 
                className="faq-question" 
                onClick={() => toggleFAQ(0)}
              >
                <span>How long does shipping take?</span>
                <i className={`fas fa-chevron-down ${faqOpen === 0 ? 'open' : ''}`}></i>
              </button>
              <div className={`faq-answer ${faqOpen === 0 ? 'open' : ''}`}>
                We offer free shipping on orders above ₹999. Standard delivery takes 3-5 business days, while express delivery takes 1-2 business days. International shipping is also available.
              </div>
            </div>
            
            <div className="faq-item">
              <button 
                className="faq-question" 
                onClick={() => toggleFAQ(1)}
              >
                <span>What is your return policy?</span>
                <i className={`fas fa-chevron-down ${faqOpen === 1 ? 'open' : ''}`}></i>
              </button>
              <div className={`faq-answer ${faqOpen === 1 ? 'open' : ''}`}>
                <p><strong>Return Process:</strong></p>
                <ul>
                  <li>Send us an email within 24 hours of delivery to initiate the exchange process</li>
                  <li>Provide Unboxing Video - Attach a complete unboxing video clearly showing the parcel opening and product received</li>
                </ul>
                <p>We offer a 24-hour return policy for all items in original condition.</p>
              </div>
            </div>
            
            <div className="faq-item">
              <button 
                className="faq-question" 
                onClick={() => toggleFAQ(2)}
              >
                <span>How do I care for my jewelry?</span>
                <i className={`fas fa-chevron-down ${faqOpen === 2 ? 'open' : ''}`}></i>
              </button>
              <div className={`faq-answer ${faqOpen === 2 ? 'open' : ''}`}>
                Store your jewellery in a dry place and clean with a soft cloth. Avoid contact with perfumes, lotions, and water. Each piece comes with detailed care instructions.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
