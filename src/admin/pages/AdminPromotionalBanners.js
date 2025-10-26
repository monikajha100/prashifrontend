import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaEye, FaEyeSlash, FaBullhorn } from 'react-icons/fa';
import './AdminPromotionalBanners.css';

const AdminPromotionalBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    text: '',
    background_color: '#000000',
    text_color: '#FFFFFF',
    sort_order: 0,
    display_duration: 5000,
    is_active: true
  });

  // Fetch promotional banners
  const fetchBanners = async () => {
    try {
      console.log('Fetching promotional banners from /api/admin/promotional-banners/admin');
      const response = await fetch('/api/admin/promotional-banners/admin');
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (response.ok) {
        const text = await response.text();
        console.log('Raw response text:', text.substring(0, 200));
        
        try {
          const data = JSON.parse(text);
          console.log('Parsed data:', data);
          setBanners(data);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          console.error('Response text that failed to parse:', text);
          setError('Failed to parse response from server');
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch promotional banners:', response.status, response.statusText);
        console.error('Error response:', errorText);
        setError(`Server error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching promotional banners:', error);
      setError('Network error: Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingBanner 
        ? `/api/admin/promotional-banners/${editingBanner.id}`
        : '/api/admin/promotional-banners';
      
      const method = editingBanner ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingBanner(null);
        setFormData({
          text: '',
          background_color: '#000000',
          text_color: '#FFFFFF',
          sort_order: 0,
          display_duration: 5000,
          is_active: true
        });
        fetchBanners();
      }
    } catch (error) {
      console.error('Error saving promotional banner:', error);
    }
  };

  // Handle edit
  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      text: banner.text,
      background_color: banner.background_color || '#000000',
      text_color: banner.text_color || '#FFFFFF',
      sort_order: banner.sort_order || 0,
      display_duration: banner.display_duration || 5000,
      is_active: banner.is_active
    });
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this promotional banner?')) {
      try {
        const response = await fetch(`/api/admin/promotional-banners/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchBanners();
        }
      } catch (error) {
        console.error('Error deleting promotional banner:', error);
      }
    }
  };

  // Handle toggle active status
  const handleToggleActive = async (id) => {
    try {
      const response = await fetch(`/api/admin/promotional-banners/${id}/toggle`, {
        method: 'PATCH',
      });

      if (response.ok) {
        fetchBanners();
      }
    } catch (error) {
      console.error('Error toggling promotional banner status:', error);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Open modal for new banner
  const openNewBannerModal = () => {
    setEditingBanner(null);
    setFormData({
      text: '',
      background_color: '#000000',
      text_color: '#FFFFFF',
      sort_order: 0,
      display_duration: 5000,
      is_active: true
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="admin-promotional-banners">
        <div className="loading">Loading promotional banners...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-promotional-banners">
        <div className="error">
          <h2>Error Loading Promotional Banners</h2>
          <p>{error}</p>
          <button onClick={fetchBanners} className="btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-promotional-banners">
      <div className="admin-promotional-banners-header">
        <div className="header-content">
          <div className="header-title">
            <FaBullhorn className="header-icon" />
            <h1>Promotional Banners</h1>
          </div>
          <p className="header-description">
            Manage promotional banners that appear in the website header. These banners rotate automatically and can include links to specific pages.
          </p>
        </div>
        <button className="btn-primary" onClick={openNewBannerModal}>
          <FaPlus /> Add New Promotional Banner
        </button>
      </div>

      <div className="banners-grid">
        {banners.map((banner) => (
          <div key={banner.id} className={`banner-card ${!banner.is_active ? 'inactive' : ''}`}>
            <div className="banner-preview" style={{ backgroundColor: banner.background_color, color: banner.text_color }}>
              <div className="banner-text-preview">
                {banner.text}
              </div>
              <div className="banner-overlay">
                <div className="banner-status">
                  {banner.is_active ? (
                    <span className="status-active">
                      <FaEye /> Active
                    </span>
                  ) : (
                    <span className="status-inactive">
                      <FaEyeSlash /> Inactive
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="banner-content">
              <h3>{banner.text}</h3>
              <div className="banner-colors">
                <div className="color-info">
                  <span className="color-label">Background:</span>
                  <span className="color-value" style={{ backgroundColor: banner.background_color }}></span>
                  <span className="color-text">{banner.background_color}</span>
                </div>
                <div className="color-info">
                  <span className="color-label">Text:</span>
                  <span className="color-value" style={{ backgroundColor: banner.text_color }}></span>
                  <span className="color-text">{banner.text_color}</span>
                </div>
              </div>
              <div className="banner-meta">
                <span>Order: {banner.sort_order}</span>
                <span>Duration: {banner.display_duration}ms</span>
                <span>Created: {new Date(banner.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="banner-actions">
              <button 
                className="btn-toggle" 
                onClick={() => handleToggleActive(banner.id)}
                title={banner.is_active ? 'Deactivate' : 'Activate'}
              >
                {banner.is_active ? <FaToggleOn /> : <FaToggleOff />}
              </button>
              <button 
                className="btn-edit" 
                onClick={() => handleEdit(banner)}
                title="Edit Banner"
              >
                <FaEdit />
              </button>
              <button 
                className="btn-delete" 
                onClick={() => handleDelete(banner.id)}
                title="Delete Banner"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {banners.length === 0 && (
        <div className="no-banners">
          <FaBullhorn className="no-banners-icon" />
          <h3>No Promotional Banners</h3>
          <p>Create your first promotional banner to start promoting your offers!</p>
          <button className="btn-primary" onClick={openNewBannerModal}>
            <FaPlus /> Create First Banner
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingBanner ? 'Edit Promotional Banner' : 'Add New Promotional Banner'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="banner-form">
              <div className="form-group">
                <label htmlFor="text">Banner Text *</label>
                <input
                  type="text"
                  id="text"
                  name="text"
                  value={formData.text}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Free Shipping On Orders ₹ 999 & Above"
                />
                <small className="form-help">
                  The text that will be displayed in the promotional banner
                </small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="background_color">Background Color</label>
                  <input
                    type="color"
                    id="background_color"
                    name="background_color"
                    value={formData.background_color}
                    onChange={handleInputChange}
                  />
                  <small className="form-help">
                    Choose the background color for the banner
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="text_color">Text Color</label>
                  <input
                    type="color"
                    id="text_color"
                    name="text_color"
                    value={formData.text_color}
                    onChange={handleInputChange}
                  />
                  <small className="form-help">
                    Choose the text color for the banner
                  </small>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="sort_order">Sort Order</label>
                  <input
                    type="number"
                    id="sort_order"
                    name="sort_order"
                    value={formData.sort_order}
                    onChange={handleInputChange}
                    min="0"
                  />
                  <small className="form-help">
                    Lower numbers appear first
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="display_duration">Display Duration (ms)</label>
                  <input
                    type="number"
                    id="display_duration"
                    name="display_duration"
                    value={formData.display_duration}
                    onChange={handleInputChange}
                    min="1000"
                    step="1000"
                  />
                  <small className="form-help">
                    How long to display this banner (in milliseconds)
                  </small>
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  Active Banner
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingBanner ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPromotionalBanners;
