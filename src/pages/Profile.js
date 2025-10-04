import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile, isUpdatingProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      // Error is handled in AuthContext
    }
  };

  return (
    <div className="profile-page">
      <Helmet>
        <title>Profile - Praashibysupal</title>
      </Helmet>

      <div className="container">
        <motion.div 
          className="profile-container"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="page-title">My Profile</h1>
          
          <div className="profile-content">
            <div className="profile-info">
              <h2>Personal Information</h2>
              
              {isEditing ? (
                <form onSubmit={handleSubmit} className="profile-form">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="address" className="form-label">Address</label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="form-textarea"
                      rows="3"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="city" className="form-label">City</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="state" className="form-label">State</label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="pincode" className="form-label">Pincode</label>
                      <input
                        type="text"
                        id="pincode"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={isUpdatingProfile}
                    >
                      {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-details">
                  <div className="detail-item">
                    <strong>Name:</strong> {user?.name}
                  </div>
                  <div className="detail-item">
                    <strong>Email:</strong> {user?.email}
                  </div>
                  <div className="detail-item">
                    <strong>Phone:</strong> {user?.phone || 'Not provided'}
                  </div>
                  <div className="detail-item">
                    <strong>Address:</strong> {user?.address || 'Not provided'}
                  </div>
                  <div className="detail-item">
                    <strong>City:</strong> {user?.city || 'Not provided'}
                  </div>
                  <div className="detail-item">
                    <strong>State:</strong> {user?.state || 'Not provided'}
                  </div>
                  <div className="detail-item">
                    <strong>Pincode:</strong> {user?.pincode || 'Not provided'}
                  </div>
                  <div className="detail-item">
                    <strong>Member Since:</strong> {new Date(user?.created_at).toLocaleDateString()}
                  </div>

                  <button 
                    className="btn btn-primary"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
