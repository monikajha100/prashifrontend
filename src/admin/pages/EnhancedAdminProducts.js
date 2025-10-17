import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import axios from 'axios';
import api, { adminAPI, API_BASE_URL } from '../../services/api';

const EnhancedAdminProducts = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const queryClient = useQueryClient();

  // Fetch products
  const { data: products, isLoading } = useQuery('adminProducts', async () => {
    const response = await adminAPI.getProducts();
    return response.data;
  });

  // Fetch categories
  const { data: categories } = useQuery('categories', async () => {
    const response = await axios.get(`${API_BASE_URL}/categories`);
    return response.data;
  });

  // Fetch subcategories
  const { data: subcategories } = useQuery('subcategories', async () => {
    const response = await axios.get(`${API_BASE_URL}/subcategories`);
    return response.data;
  });

  const deleteMutation = useMutation(
    (productId) => adminAPI.deleteProduct(productId),
    {
      onSuccess: () => {
        toast.success('Product deleted successfully!');
        queryClient.invalidateQueries('adminProducts');
      },
      onError: () => {
        toast.error('Failed to delete product');
      }
    }
  );

  const handleDelete = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(productId);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem' }}>⏳</div>
        <p>Loading products...</p>
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
              Products Management
            </h1>
            <p style={{ color: '#666', fontSize: '1.1rem' }}>
              Manage products with images, videos & subcategories - Total: {products?.length || 0}
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
            ➕ Add New Product
          </button>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '20px',
          boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e1e1e1' }}>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Image</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Name</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Category</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Price</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Stock</th>
                <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products && products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '15px' }}>
                      {product.primary_image ? (
                        <img 
                          src={product.primary_image} 
                          alt={product.name}
                          style={{
                            width: '60px',
                            height: '60px',
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '60px',
                          height: '60px',
                          background: '#f0f0f0',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          📷
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '15px', fontWeight: '500' }}>{product.name}</td>
                    <td style={{ padding: '15px' }}>{product.category_name || 'N/A'}</td>
                    <td style={{ padding: '15px', fontWeight: '600', color: '#D4AF37' }}>
                      ₹{product.price}
                    </td>
                    <td style={{ padding: '15px' }}>{product.stock_quantity || 0}</td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setShowAddForm(true);
                        }}
                        style={{
                          background: '#28a745',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          marginRight: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        style={{
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                    No products found. Click "Add New Product" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showAddForm && (
        <ProductFormModal
          product={editingProduct}
          categories={categories}
          subcategories={subcategories}
          onClose={() => {
            setShowAddForm(false);
            setEditingProduct(null);
          }}
          onSuccess={() => {
            setShowAddForm(false);
            setEditingProduct(null);
            queryClient.invalidateQueries('adminProducts');
          }}
        />
      )}
    </div>
  );
};

const ProductFormModal = ({ product, categories, subcategories, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    price: product?.price || '',
    original_price: product?.original_price || '',
    category_id: product?.category_id || '',
    subcategory_id: product?.subcategory_id || '',
    stock_quantity: product?.stock_quantity || 0,
    sku: product?.sku || '',
    is_featured: product?.is_featured || false,
    homepage_section: product?.homepage_section || 'none',
    is_active: product?.is_active !== false
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videos, setVideos] = useState([
    { url: '', type: 'youtube', title: '' }
  ]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [colors, setColors] = useState([
    { color_name: '', color_code: '', color_image: '', is_primary: true, sort_order: 1 }
  ]);
  const [colorImages, setColorImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Initialize colors when editing a product
  React.useEffect(() => {
    if (product && product.colors && product.colors.length > 0) {
      setColors(product.colors.map(color => ({
        color_name: color.color_name,
        color_code: color.color_code || '',
        color_image: color.color_image || '',
        is_primary: color.is_primary,
        sort_order: color.sort_order
      })));
    } else {
      setColors([{ color_name: '', color_code: '', color_image: '', is_primary: true, sort_order: 1 }]);
    }
  }, [product]);

  const saveMutation = useMutation(
    async (data) => {
      // Get the current token
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      if (product) {
        return adminAPI.updateProduct(product.id, data);
      } else {
        // Use direct axios call with proper headers for create
        const response = await axios.post(`${API_BASE_URL}/admin/products`, data, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        return response;
      }
    },
    {
      onSuccess: () => {
        toast.success(product ? 'Product updated!' : 'Product created!');
        onSuccess();
      },
      onError: (error) => {
        console.error('Save error:', error);
        toast.error('Failed to save product: ' + (error.response?.data?.message || error.message));
      }
    }
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-generate slug from name
    if (name === 'name' && !product) {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleVideoChange = (index, field, value) => {
    setVideos(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addVideoField = () => {
    setVideos(prev => [...prev, { url: '', type: 'youtube', title: '' }]);
  };

  const removeVideo = (index) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
  };

  const handleVideoFileChange = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/x-flv', 'video/x-ms-wmv', 'video/x-m4v'];
    
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large. Maximum size is 50MB.`);
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        toast.error(`File ${file.name} is not a supported video format.`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setVideoFiles(prev => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} video file(s) selected`);
    }
  };

  const removeVideoFile = (index) => {
    setVideoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleColorChange = (index, field, value) => {
    setColors(prev => prev.map((color, i) => 
      i === index ? { ...color, [field]: value } : color
    ));
  };

  const addColor = () => {
    setColors(prev => [...prev, { 
      color_name: '', 
      color_code: '', 
      color_image: '',
      is_primary: false, 
      sort_order: prev.length + 1 
    }]);
  };

  const removeColor = (index) => {
    if (colors.length > 1) {
      setColors(prev => prev.filter((_, i) => i !== index));
    }
  };

  const setPrimaryColor = (index) => {
    setColors(prev => prev.map((color, i) => ({
      ...color,
      is_primary: i === index
    })));
  };

  const handleColorImageChange = (colorIndex, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleColorChange(colorIndex, 'color_image', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      // Create FormData for the product
      const productFormData = new FormData();
      
      // Add basic product data
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          productFormData.append(key, formData[key]);
        }
      });

      // Add images directly to FormData
      images.forEach((image, index) => {
        productFormData.append('images', image);
      });

      // Add video files
      videoFiles.forEach((videoFile) => {
        productFormData.append('videos', videoFile);
      });

      // Add video URLs as JSON
      const videoUrls = videos.filter(v => v.url);
      if (videoUrls.length > 0) {
        productFormData.append('video_urls', JSON.stringify(videoUrls));
      }

      // Add colors as JSON
      const validColors = colors.filter(c => c.color_name && c.color_name.trim() !== '');
      if (validColors.length > 0) {
        productFormData.append('colors', JSON.stringify(validColors));
      }

      saveMutation.mutate(productFormData);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit product');
    } finally {
      setUploading(false);
    }
  };

  const filteredSubcategories = subcategories?.filter(
    sub => sub.category_id === parseInt(formData.category_id)
  ) || [];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      overflow: 'auto',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '15px',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          padding: '25px',
          borderBottom: '2px solid #e1e1e1',
          position: 'sticky',
          top: 0,
          background: 'white',
          zIndex: 1
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#2C2C2C',
            margin: 0,
            fontFamily: "'Cormorant Garamond', serif"
          }}>
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '25px' }}>
          {/* Basic Info */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
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
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
              Slug *
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
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
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e1e1e1',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Price Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                Price (₹) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
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
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                Original Price (₹)
              </label>
              <input
                type="number"
                name="original_price"
                value={formData.original_price}
                onChange={handleChange}
                min="0"
                step="0.01"
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

          {/* Category & Subcategory */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                Category *
              </label>
              <select
                name="category_id"
                value={formData.category_id}
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
              >
                <option value="">Select Category</option>
                {categories && categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                Subcategory
              </label>
              <select
                name="subcategory_id"
                value={formData.subcategory_id}
                onChange={handleChange}
                disabled={!formData.category_id}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #e1e1e1',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  opacity: !formData.category_id ? 0.5 : 1
                }}
              >
                <option value="">Select Subcategory</option>
                {filteredSubcategories.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Stock & SKU */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                Stock Quantity
              </label>
              <input
                type="number"
                name="stock_quantity"
                value={formData.stock_quantity}
                onChange={handleChange}
                min="0"
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
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                SKU
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
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

          {/* Image Upload Section */}
          <div style={{ marginBottom: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', fontSize: '1.1rem' }}>
              📷 Product Images
            </label>
            
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              style={{ marginBottom: '15px' }}
            />

            {imagePreviews.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                {imagePreviews.map((preview, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <img 
                      src={preview} 
                      alt={`Preview ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100px',
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '25px',
                        height: '25px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      ✕
                    </button>
                    {index === 0 && (
                      <div style={{
                        position: 'absolute',
                        bottom: '5px',
                        left: '5px',
                        background: '#D4AF37',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        Primary
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
              First image will be set as primary. You can upload multiple images.
            </p>
          </div>

          {/* Video URLs Section */}
          <div style={{ marginBottom: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', fontSize: '1.1rem' }}>
              🎬 Product Videos
            </label>
            
            {videos.map((video, index) => (
              <div key={index} style={{
                marginBottom: '15px',
                padding: '15px',
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #e1e1e1'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr auto', gap: '10px', marginBottom: '10px' }}>
                  <select
                    value={video.type}
                    onChange={(e) => handleVideoChange(index, 'type', e.target.value)}
                    style={{
                      padding: '8px',
                      border: '2px solid #e1e1e1',
                      borderRadius: '6px',
                      fontSize: '0.9rem'
                    }}
                  >
                    <option value="youtube">YouTube</option>
                    <option value="vimeo">Vimeo</option>
                    <option value="file">Upload File</option>
                    <option value="other">Other URL</option>
                  </select>
                  <input
                    type="text"
                    placeholder={`${video.type === 'youtube' ? 'YouTube' : video.type === 'vimeo' ? 'Vimeo' : 'Video'} URL`}
                    value={video.url}
                    onChange={(e) => handleVideoChange(index, 'url', e.target.value)}
                    style={{
                      padding: '8px',
                      border: '2px solid #e1e1e1',
                      borderRadius: '6px',
                      fontSize: '0.9rem'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeVideo(index)}
                    style={{
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Video title (optional)"
                  value={video.title}
                  onChange={(e) => handleVideoChange(index, 'title', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '2px solid #e1e1e1',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            ))}
            
            <button
              type="button"
              onClick={addVideoField}
              style={{
                background: '#28a745',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              ➕ Add Another Video
            </button>
          </div>

          {/* Video File Upload Section */}
          <div style={{ marginBottom: '20px', padding: '20px', background: '#f0f8ff', borderRadius: '8px', border: '2px dashed #007bff' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', fontSize: '1.1rem' }}>
              📁 Upload Video Files
            </label>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '15px' }}>
              Upload video files directly (Max: 50MB each) - Supported: MP4, WebM, MOV, AVI, MKV, FLV, WMV, M4V
            </p>
            
            <input
              type="file"
              multiple
              accept="video/*"
              onChange={handleVideoFileChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #007bff',
                borderRadius: '4px',
                background: 'white',
                marginBottom: '15px'
              }}
            />

            {videoFiles.length > 0 && (
              <div style={{ marginTop: '15px' }}>
                <h4 style={{ marginBottom: '10px', color: '#333' }}>Selected Video Files:</h4>
                {videoFiles.map((file, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px',
                    background: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginBottom: '8px'
                  }}>
                    <div>
                      <strong>{file.name}</strong>
                      <span style={{ color: '#666', marginLeft: '10px' }}>
                        ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVideoFile(index)}
                      style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Homepage Section */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Homepage Section
            </label>
            <select
              name="homepage_section"
              value={formData.homepage_section}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: 'white'
              }}
            >
              <option value="none">Don't show on homepage</option>
              <option value="featured">⭐ Featured Products</option>
              <option value="victorian">📿 Timeless Jewels (Victorian)</option>
              <option value="color-changing">🌈 Magic Collection (Color Changing)</option>
            </select>
          </div>

          {/* Color Variants */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <label style={{ fontWeight: '500', fontSize: '16px' }}>
                🎨 Color Variants
              </label>
              <button
                type="button"
                onClick={addColor}
                style={{
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                + Add Color
              </button>
            </div>
            
            {colors.map((color, index) => (
              <div key={index} style={{ 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                padding: '15px', 
                marginBottom: '10px',
                backgroundColor: '#f9f9f9'
              }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Color Name */}
                  <div style={{ flex: '1', minWidth: '150px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
                      Color Name *
                    </label>
                    <input
                      type="text"
                      value={color.color_name}
                      onChange={(e) => handleColorChange(index, 'color_name', e.target.value)}
                      placeholder="e.g., Gold, Silver, Rose Gold"
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  {/* Color Code */}
                  <div style={{ flex: '1', minWidth: '120px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
                      Color Code
                    </label>
                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={color.color_code || '#000000'}
                        onChange={(e) => handleColorChange(index, 'color_code', e.target.value)}
                        style={{
                          width: '40px',
                          height: '35px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      />
                      <input
                        type="text"
                        value={color.color_code}
                        onChange={(e) => handleColorChange(index, 'color_code', e.target.value)}
                        placeholder="#FFD700"
                        style={{
                          flex: '1',
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>

                  {/* Color Image */}
                  <div style={{ flex: '1', minWidth: '150px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
                      Color Image
                    </label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            handleColorImageChange(index, file);
                          }
                        }}
                        style={{
                          flex: '1',
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                      {color.color_image && (
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '4px',
                          overflow: 'hidden',
                          border: '2px solid #ddd'
                        }}>
                          <img 
                            src={color.color_image} 
                            alt={color.color_name}
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover' 
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Primary Color */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={color.is_primary}
                        onChange={() => setPrimaryColor(index)}
                        style={{ marginRight: '5px' }}
                      />
                      <span style={{ fontSize: '14px' }}>Primary</span>
                    </label>
                  </div>

                  {/* Remove Button */}
                  {colors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeColor(index)}
                      style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {colors.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                padding: '20px', 
                border: '2px dashed #ddd', 
                borderRadius: '8px',
                color: '#666'
              }}>
                No color variants added. Click "Add Color" to add color options for this product.
              </div>
            )}
          </div>

          {/* Checkboxes */}
          <div style={{ marginBottom: '20px', display: 'flex', gap: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleChange}
                style={{ marginRight: '8px', width: '18px', height: '18px' }}
              />
              <span style={{ fontWeight: '500' }}>Featured Product</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                style={{ marginRight: '8px', width: '18px', height: '18px' }}
              />
              <span style={{ fontWeight: '500' }}>Active</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '30px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              style={{
                padding: '12px 30px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: uploading ? 'not-allowed' : 'pointer',
                opacity: uploading ? 0.5 : 1
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              style={{
                padding: '12px 30px',
                background: uploading ? '#ccc' : 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: uploading ? 'not-allowed' : 'pointer',
                boxShadow: uploading ? 'none' : '0 5px 15px rgba(212, 175, 55, 0.3)'
              }}
            >
              {uploading ? 'Uploading...' : (product ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnhancedAdminProducts;
