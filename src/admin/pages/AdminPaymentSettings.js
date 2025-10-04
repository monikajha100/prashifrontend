import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { paymentsAPI } from '../../services/api';
import './AdminPaymentSettings.css';

const AdminPaymentSettings = () => {
  const [formData, setFormData] = useState({
    razorpay_enabled: true,
    cod_enabled: true,
    razorpay_key_id: '',
    razorpay_key_secret: ''
  });

  const queryClient = useQueryClient();

  // Fetch payment settings
  const { data: paymentSettings, isLoading } = useQuery(
    'paymentSettings',
    paymentsAPI.getPaymentSettings,
    {
      onSuccess: (data) => {
        setFormData({
          razorpay_enabled: data.razorpay_enabled || false,
          cod_enabled: data.cod_enabled || false,
          razorpay_key_id: data.razorpay_key_id || '',
          razorpay_key_secret: data.razorpay_key_secret || ''
        });
      }
    }
  );

  // Update payment settings mutation
  const updateSettingsMutation = useMutation(paymentsAPI.updatePaymentSettings, {
    onSuccess: () => {
      queryClient.invalidateQueries('paymentSettings');
      alert('Payment settings updated successfully!');
    },
    onError: (error) => {
      console.error('Error updating payment settings:', error);
      alert('Error updating payment settings. Please try again.');
    }
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettingsMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="admin-payment-settings">
        <div className="loading">Loading payment settings...</div>
      </div>
    );
  }

  return (
    <div className="admin-payment-settings">
      <div className="settings-header">
        <h1>Payment Settings</h1>
        <p>Configure payment methods and Razorpay integration</p>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-section">
          <h2>Payment Methods</h2>
          
          <div className="setting-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="razorpay_enabled"
                checked={formData.razorpay_enabled}
                onChange={handleInputChange}
              />
              <span className="checkmark"></span>
              <div className="setting-info">
                <span className="setting-name">Enable Razorpay</span>
                <span className="setting-desc">Allow customers to pay online using cards, UPI, net banking</span>
              </div>
            </label>
          </div>

          <div className="setting-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="cod_enabled"
                checked={formData.cod_enabled}
                onChange={handleInputChange}
              />
              <span className="checkmark"></span>
              <div className="setting-info">
                <span className="setting-name">Enable Cash on Delivery</span>
                <span className="setting-desc">Allow customers to pay when the order is delivered</span>
              </div>
            </label>
          </div>
        </div>

        {formData.razorpay_enabled && (
          <div className="form-section">
            <h2>Razorpay Configuration</h2>
            
            <div className="form-group">
              <label htmlFor="razorpay_key_id">Razorpay Key ID</label>
              <input
                type="text"
                id="razorpay_key_id"
                name="razorpay_key_id"
                value={formData.razorpay_key_id}
                onChange={handleInputChange}
                placeholder="rzp_test_..."
                required={formData.razorpay_enabled}
              />
              <small>Your Razorpay Key ID from the dashboard</small>
            </div>

            <div className="form-group">
              <label htmlFor="razorpay_key_secret">Razorpay Key Secret</label>
              <input
                type="password"
                id="razorpay_key_secret"
                name="razorpay_key_secret"
                value={formData.razorpay_key_secret}
                onChange={handleInputChange}
                placeholder="Enter your Razorpay key secret"
                required={formData.razorpay_enabled}
              />
              <small>Your Razorpay Key Secret (keep this secure)</small>
            </div>

            <div className="info-box">
              <h4>Test Credentials (for testing)</h4>
              <p><strong>Key ID:</strong> rzp_test_1DP5mmOlF5G5ag</p>
              <p><strong>Key Secret:</strong> thisisasecret</p>
              <p><em>Use these credentials for testing. Replace with your live credentials for production.</em></p>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-primary"
            disabled={updateSettingsMutation.isLoading}
          >
            {updateSettingsMutation.isLoading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>

      <div className="help-section">
        <h3>Setup Instructions</h3>
        <div className="help-content">
          <div className="help-step">
            <h4>1. Create Razorpay Account</h4>
            <p>Sign up at <a href="https://razorpay.com" target="_blank" rel="noopener noreferrer">razorpay.com</a> and complete the verification process.</p>
          </div>
          
          <div className="help-step">
            <h4>2. Get API Keys</h4>
            <p>Go to Settings → API Keys in your Razorpay dashboard to get your Key ID and Key Secret.</p>
          </div>
          
          <div className="help-step">
            <h4>3. Configure Webhook (Optional)</h4>
            <p>Set up webhooks in Razorpay dashboard to get real-time payment notifications.</p>
          </div>
          
          <div className="help-step">
            <h4>4. Test Integration</h4>
            <p>Use the test credentials provided above to test the payment flow before going live.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentSettings;
