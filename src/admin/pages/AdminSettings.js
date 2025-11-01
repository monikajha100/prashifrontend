import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { adminAPI } from '../../services/api';
import { Helmet } from 'react-helmet-async';
import AdminLayout from '../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import './AdminSettings.css';

const AdminSettings = () => {
  const [formData, setFormData] = useState({});
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery(
    'adminSettings',
    adminAPI.getSettings,
    {
      select: (response) => response.data,
      onSuccess: (data) => {
        setFormData(data);
      }
    }
  );

  const updateSettingsMutation = useMutation(
    (settingsData) => adminAPI.updateSettings(settingsData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminSettings');
        toast.success('Settings updated successfully');
      },
      onError: () => {
        toast.error('Failed to update settings');
      }
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettingsMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <LoadingSpinner text="Loading settings..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <>
        <Helmet>
          <title>Settings - Admin Panel</title>
        </Helmet>

        <div className="admin-settings">
        <div className="page-header">
          <h1>Site Settings</h1>
          <p>Configure your website settings and preferences</p>
        </div>

        <form onSubmit={handleSubmit} className="settings-form">
          <div className="settings-section">
            <h2>General Settings</h2>
            
            <div className="form-group">
              <label htmlFor="site_name" className="form-label">Site Name</label>
              <input
                type="text"
                id="site_name"
                name="site_name"
                value={formData.site_name || ''}
                onChange={handleChange}
                className="form-input"
                placeholder="Praashi by Supal"
              />
            </div>

            <div className="form-group">
              <label htmlFor="site_description" className="form-label">Site Description</label>
              <textarea
                id="site_description"
                name="site_description"
                value={formData.site_description || ''}
                onChange={handleChange}
                className="form-textarea"
                rows="3"
                placeholder="Your go-to destination for trendy imitation jewellery"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact_email" className="form-label">Contact Email</label>
              <input
                type="email"
                id="contact_email"
                name="contact_email"
                value={formData.contact_email || ''}
                onChange={handleChange}
                className="form-input"
                placeholder="hello@praashibysupal.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact_phone" className="form-label">Contact Phone</label>
              <input
                type="tel"
                id="contact_phone"
                name="contact_phone"
                value={formData.contact_phone || ''}
                onChange={handleChange}
                className="form-input"
                placeholder="+91 87806 06280"
              />
            </div>
          </div>

          <div className="settings-section">
            <h2>Shipping Settings</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="shipping_cost" className="form-label">Shipping Cost (₹)</label>
                <input
                  type="number"
                  id="shipping_cost"
                  name="shipping_cost"
                  value={formData.shipping_cost || ''}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="50"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="free_shipping_threshold" className="form-label">Free Shipping Threshold (₹)</label>
                <input
                  type="number"
                  id="free_shipping_threshold"
                  name="free_shipping_threshold"
                  value={formData.free_shipping_threshold || ''}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="999"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h2>Tax Settings</h2>
            
            <div className="form-group">
              <label className="form-label">
                <input
                  type="checkbox"
                  name="tax_enabled"
                  checked={formData.tax_enabled === 'true' || formData.tax_enabled === true}
                  onChange={(e) => handleChange({
                    target: {
                      name: 'tax_enabled',
                      value: e.target.checked ? 'true' : 'false'
                    }
                  })}
                  className="form-checkbox"
                />
                <span style={{ marginLeft: '8px' }}>Enable Tax</span>
              </label>
              <p className="form-help-text">Enable or disable tax calculation on orders</p>
            </div>

            {formData.tax_enabled === 'true' || formData.tax_enabled === true ? (
              <div className="form-group">
                <label htmlFor="tax_rate" className="form-label">Tax Rate (%)</label>
                <input
                  type="number"
                  id="tax_rate"
                  name="tax_rate"
                  value={formData.tax_rate || ''}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="18"
                  min="0"
                  max="100"
                  step="0.01"
                />
                <p className="form-help-text">Enter the tax percentage rate (e.g., 18 for 18% GST)</p>
              </div>
            ) : null}
          </div>

          <div className="settings-section">
            <h2>Currency Settings</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="currency" className="form-label">Currency Code</label>
                <input
                  type="text"
                  id="currency"
                  name="currency"
                  value={formData.currency || ''}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="INR"
                  maxLength="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="currency_symbol" className="form-label">Currency Symbol</label>
                <input
                  type="text"
                  id="currency_symbol"
                  name="currency_symbol"
                  value={formData.currency_symbol || ''}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="₹"
                  maxLength="5"
                />
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h2>Social Media Links</h2>
            
            <div className="form-group">
              <label htmlFor="facebook_url" className="form-label">Facebook URL</label>
              <input
                type="url"
                id="facebook_url"
                name="facebook_url"
                value={formData.facebook_url || ''}
                onChange={handleChange}
                className="form-input"
                placeholder="https://www.facebook.com/yourpage"
              />
            </div>

            <div className="form-group">
              <label htmlFor="instagram_url" className="form-label">Instagram URL</label>
              <input
                type="url"
                id="instagram_url"
                name="instagram_url"
                value={formData.instagram_url || ''}
                onChange={handleChange}
                className="form-input"
                placeholder="https://www.instagram.com/yourpage"
              />
            </div>

            <div className="form-group">
              <label htmlFor="youtube_url" className="form-label">YouTube URL</label>
              <input
                type="url"
                id="youtube_url"
                name="youtube_url"
                value={formData.youtube_url || ''}
                onChange={handleChange}
                className="form-input"
                placeholder="https://www.youtube.com/yourchannel"
              />
            </div>

            <div className="form-group">
              <label htmlFor="linkedin_url" className="form-label">LinkedIn URL</label>
              <input
                type="url"
                id="linkedin_url"
                name="linkedin_url"
                value={formData.linkedin_url || ''}
                onChange={handleChange}
                className="form-input"
                placeholder="https://www.linkedin.com/company/yourcompany"
              />
            </div>
          </div>

          <div className="settings-section">
            <h2>SEO Settings</h2>
            
            <div className="form-group">
              <label htmlFor="meta_keywords" className="form-label">Meta Keywords</label>
              <input
                type="text"
                id="meta_keywords"
                name="meta_keywords"
                value={formData.meta_keywords || ''}
                onChange={handleChange}
                className="form-input"
                placeholder="jewelry, imitation jewelry, fashion accessories"
              />
            </div>

            <div className="form-group">
              <label htmlFor="google_analytics" className="form-label">Google Analytics ID</label>
              <input
                type="text"
                id="google_analytics"
                name="google_analytics"
                value={formData.google_analytics || ''}
                onChange={handleChange}
                className="form-input"
                placeholder="GA-XXXXXXXXX-X"
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={updateSettingsMutation.isLoading}
            >
              {updateSettingsMutation.isLoading ? 'Saving...' : 'Save Settings'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => setFormData(settings)}
            >
              Reset Changes
            </button>
          </div>
        </form>
        </div>
      </>
    </AdminLayout>
  );
};

export default AdminSettings;
