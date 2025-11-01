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

            <div className="info-box warning">
              <h4>⚠️ Important: Get Your Own Test Keys</h4>
              <p><strong>The credentials shown below are PLACEHOLDERS only - they will NOT work!</strong></p>
              <p>You need to get your <strong>own test keys</strong> from your Razorpay account:</p>
              <ol style={{ marginLeft: '20px', marginTop: '10px' }}>
                <li>Go to <a href="https://dashboard.razorpay.com" target="_blank" rel="noopener noreferrer">Razorpay Dashboard</a></li>
                <li>Settings → API Keys → Test Keys</li>
                <li>Copy your <strong>Key ID</strong> (starts with <code>rzp_test_</code>)</li>
                <li>Click <strong>"Reveal"</strong> to see and copy your <strong>Key Secret</strong></li>
                <li>Paste them in the fields above</li>
              </ol>
              <p style={{ marginTop: '10px', color: '#e74c3c', fontWeight: 'bold' }}>
                ❌ Do NOT use placeholder values - they will cause authentication errors!
              </p>
              <details style={{ marginTop: '15px' }}>
                <summary style={{ cursor: 'pointer', color: '#666' }}>Example format (NOT real keys)</summary>
                <p style={{ marginTop: '10px', fontFamily: 'monospace', fontSize: '12px' }}>
                  Key ID: rzp_test_xxxxxxxxxxxxx<br/>
                  Key Secret: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (30+ characters, no spaces)
                </p>
              </details>
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
            <p>Use your actual test keys from Razorpay dashboard (not placeholders) to test the payment flow before going live.</p>
            <p><strong>⚠️ Recommended: Use UPI for Testing</strong></p>
            <p>In Razorpay checkout, select "UPI" and use: <code>test@razorpay</code></p>
            <p><strong>If testing with cards:</strong></p>
            <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
              <li>Mastercard: <code>5267 3181 8797 5449</code> (CVV: 123, Expiry: 12/25)</li>
              <li>If you see "International cards not supported" error, use UPI instead!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentSettings;
