import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaUpload } from 'react-icons/fa';
import './PartnerForm.css';

const PartnerForm = ({ partner, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    business: '',
    partnershipType: 'franchise',
    experience: '',
    status: 'approved',
    documents: null
  });
  const [documentPreview, setDocumentPreview] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (partner) {
      setFormData({
        name: partner.name || '',
        email: partner.email || '',
        phone: partner.phone || '',
        business: partner.business || '',
        partnershipType: partner.partnership_type || 'franchise',
        experience: partner.experience || '',
        status: partner.status || 'approved',
        documents: partner.documents || null
      });
      
      if (partner.documents) {
        setDocumentPreview(partner.documents);
      }
    }
  }, [partner]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        documents: file
      }));
      
      // Create preview for documents
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setDocumentPreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        setDocumentPreview(file.name);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }
    
    if (!formData.business.trim()) {
      newErrors.business = 'Business name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('business', formData.business);
      formDataToSend.append('partnershipType', formData.partnershipType);
      formDataToSend.append('experience', formData.experience);
      formDataToSend.append('status', formData.status);
      
      if (formData.documents && typeof formData.documents !== 'string') {
        formDataToSend.append('documents', formData.documents);
      }
      
      onSave(formDataToSend);
    }
  };

  return (
    <div className="partner-form-overlay">
      <div className="partner-form-modal">
        <div className="modal-header">
          <h2>{partner ? 'Edit Partner' : 'Create New Partner'}</h2>
          <button className="close-btn" onClick={onCancel}>
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="partner-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Partner Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
                placeholder="Enter partner name"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                placeholder="Enter email address"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? 'error' : ''}
                placeholder="Enter phone number"
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="business">Business Name *</label>
              <input
                type="text"
                id="business"
                name="business"
                value={formData.business}
                onChange={handleChange}
                className={errors.business ? 'error' : ''}
                placeholder="Enter business name"
              />
              {errors.business && <span className="error-message">{errors.business}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="partnershipType">Partnership Type *</label>
              <select
                id="partnershipType"
                name="partnershipType"
                value={formData.partnershipType}
                onChange={handleChange}
              >
                <option value="franchise">Franchise</option>
                <option value="agency">Agency</option>
                <option value="reseller">Reseller</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="status">Status *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          
          <div className="form-group full-width">
            <label htmlFor="experience">Business Experience</label>
            <textarea
              id="experience"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              rows="4"
              placeholder="Describe business experience and qualifications..."
            />
          </div>
          
          <div className="form-group full-width">
            <label htmlFor="documents">Documents</label>
            <div className="file-upload">
              <input
                type="file"
                id="documents"
                name="documents"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <label htmlFor="documents" className="file-upload-label">
                <FaUpload /> Choose File
              </label>
              {documentPreview && (
                <div className="file-preview">
                  {typeof documentPreview === 'string' && documentPreview.includes('data:image') ? (
                    <img src={documentPreview} alt="Document preview" className="preview-image" />
                  ) : (
                    <span className="file-name">{documentPreview}</span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>
              <FaTimes /> Cancel
            </button>
            <button type="submit" className="btn-primary">
              <FaSave /> {partner ? 'Update Partner' : 'Create Partner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PartnerForm;



