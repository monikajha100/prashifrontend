import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { bannersAPI, API_BASE_URL } from '../../services/api';
import toast from 'react-hot-toast';

const FullAdminBanners = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const queryClient = useQueryClient();

  const { data: banners, isLoading } = useQuery(
    'banners',
    bannersAPI.getAll,
    {
      select: (response) => response.data || []
    }
  );

  const deleteMutation = useMutation(
    (id) => bannersAPI.delete(id),
    {
      onSuccess: () => {
        toast.success('Banner deleted successfully!');
        queryClient.invalidateQueries('banners');
      },
      onError: () => {
        toast.error('Failed to delete banner');
      }
    }
  );

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem' }}>⏳</div>
        <p>Loading banners...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', background: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#2C2C2C',
              marginBottom: '10px',
              fontFamily: "'Cormorant Garamond', serif"
            }}>
              Banner Management
            </h1>
            <p style={{ color: '#666', fontSize: '1.1rem' }}>
              Manage homepage banners - Total: {banners?.length || 0}
            </p>
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            style={{
              background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 5px 15px rgba(212, 175, 55, 0.3)'
            }}
          >
            ➕ Add New Banner
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: '20px'
        }}>
          {banners && banners.length > 0 ? (
            banners.map((banner) => (
              <div key={banner.id} style={{
                background: 'white',
                borderRadius: '15px',
                overflow: 'hidden',
                boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
                transition: 'transform 0.2s ease'
              }}>
                {banner.image && (
                  <div style={{
                    width: '100%',
                    height: '200px',
                    background: `url(${banner.image}) center/cover`,
                    backgroundColor: '#f0f0f0'
                  }} />
                )}
                
                <div style={{ padding: '20px' }}>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#2C2C2C',
                    margin: '0 0 10px 0'
                  }}>
                    {banner.title}
                  </h3>
                  
                  {banner.subtitle && (
                    <p style={{ color: '#666', margin: '0 0 10px 0' }}>
                      {banner.subtitle}
                    </p>
                  )}

                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    marginBottom: '15px',
                    fontSize: '0.9rem'
                  }}>
                    <div>
                      <strong>Button:</strong> {banner.button_text || 'N/A'}
                    </div>
                    <div>
                      <strong>Order:</strong> {banner.sort_order}
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <strong>Link:</strong> {banner.link_url || 'N/A'}
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '15px',
                    borderTop: '1px solid #e1e1e1'
                  }}>
                    <span style={{
                      background: banner.is_active ? '#d4edda' : '#f8d7da',
                      color: banner.is_active ? '#155724' : '#721c24',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      fontWeight: '500'
                    }}>
                      {banner.is_active ? '✅ Active' : '❌ Inactive'}
                    </span>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => setEditingBanner(banner)}
                        style={{
                          background: '#007bff',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '0.9rem',
                          cursor: 'pointer'
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(banner.id)}
                        style={{
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '0.9rem',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{
              gridColumn: '1 / -1',
              padding: '40px',
              textAlign: 'center',
              color: '#666',
              background: 'white',
              borderRadius: '15px'
            }}>
              No banners found. Click "Add New Banner" to create one.
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Banner Modal */}
      {(showAddForm || editingBanner) && (
        <BannerFormModal
          banner={editingBanner}
          onClose={() => {
            setShowAddForm(false);
            setEditingBanner(null);
          }}
          onSuccess={() => {
            setShowAddForm(false);
            setEditingBanner(null);
            queryClient.invalidateQueries('banners');
          }}
        />
      )}
    </div>
  );
};

const BannerFormModal = ({ banner, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: banner?.title || '',
    subtitle: banner?.subtitle || '',
    image: banner?.image || '',
    link_url: banner?.link_url || '',
    button_text: banner?.button_text || 'Shop Now',
    sort_order: banner?.sort_order || 0,
    is_active: banner?.is_active !== false
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(banner?.image || '');

  const saveMutation = useMutation(
    (data) => banner ? bannersAPI.update(banner.id, data) : bannersAPI.create(data),
    {
      onSuccess: () => {
        toast.success(banner ? 'Banner updated successfully!' : 'Banner created successfully!');
        onSuccess();
      },
      onError: () => {
        toast.error('Failed to save banner');
      }
    }
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let finalFormData = { ...formData };
    
    // If a new image file was selected, upload it first
    if (imageFile) {
      try {
        const uploadFormData = new FormData();
        uploadFormData.append('image', imageFile);
        
        const response = await fetch(`${API_BASE_URL}/upload/banner`, {
          method: 'POST',
          body: uploadFormData
        });
        
        if (response.ok) {
          const data = await response.json();
          finalFormData.image = data.url; // Use the file URL instead of Base64
          toast.success('Image uploaded successfully!');
        } else {
          toast.error('Failed to upload image');
          return;
        }
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload image');
        return;
      }
    }
    
    saveMutation.mutate(finalFormData);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '30px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#2C2C2C' }}>
          {banner ? 'Edit Banner' : 'Add New Banner'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e1e1e1',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
              placeholder="e.g., Exclusive Victorian Collection"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Subtitle</label>
            <input
              type="text"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e1e1e1',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
              placeholder="e.g., Discover our stunning range of jewelry"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Banner Image</label>
            
            {/* Image Upload */}
            <div style={{
              border: '2px dashed #e1e1e1',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center',
              marginBottom: '10px',
              cursor: 'pointer',
              transition: 'border-color 0.3s'
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = '#D4AF37';
            }}
            onDragLeave={(e) => {
              e.currentTarget.style.borderColor = '#e1e1e1';
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = '#e1e1e1';
              const file = e.dataTransfer.files[0];
              if (file && file.type.startsWith('image/')) {
                handleImageChange({ target: { files: [file] } });
              }
            }}
            onClick={() => document.getElementById('imageUpload').click()}>
              {imagePreview ? (
                <div>
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', marginBottom: '10px' }}
                  />
                  <p style={{ color: '#666', fontSize: '0.9rem', margin: '5px 0' }}>
                    Click or drag to change image
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📸</div>
                  <p style={{ color: '#666', fontSize: '0.9rem', margin: '5px 0' }}>
                    Click to upload or drag and drop
                  </p>
                  <p style={{ color: '#999', fontSize: '0.8rem', margin: '5px 0' }}>
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              )}
            </div>
            
            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            
            {/* OR text input for URL */}
            <div style={{ textAlign: 'center', margin: '10px 0', color: '#999', fontSize: '0.9rem' }}>
              OR enter image URL
            </div>
            
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e1e1e1',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
              placeholder="https://example.com/banner.jpg"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Button Text</label>
              <input
                type="text"
                name="button_text"
                value={formData.button_text}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #e1e1e1',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
                placeholder="Shop Now"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Sort Order</label>
              <input
                type="number"
                name="sort_order"
                value={formData.sort_order}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #e1e1e1',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Link URL</label>
            <input
              type="text"
              name="link_url"
              value={formData.link_url}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e1e1e1',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
              placeholder="/products or https://..."
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ fontWeight: '600' }}>Active (Show on homepage)</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveMutation.isLoading}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              {saveMutation.isLoading ? 'Saving...' : (banner ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FullAdminBanners;
