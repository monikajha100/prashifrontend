import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import './AdminInstaShop.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminInstaShop = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const [showPostModal, setShowPostModal] = useState(false);
  const [showProductTagModal, setShowProductTagModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [tagPositions, setTagPositions] = useState([]);
  const [currentImage, setCurrentImage] = useState(null);
  const imageRef = useRef(null);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    caption: '',
    media_url: '',
    media_type: 'IMAGE',
    post_type: 'FEED',
    status: 'DRAFT',
    scheduled_at: '',
    hashtags: [],
    tagged_products: [],
    notes: ''
  });

  // Fetch Instagram posts
  const { data: postsData, isLoading: postsLoading } = useQuery(
    ['instagram-posts', filterStatus, filterType],
    async () => {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterType !== 'all') params.append('type', filterType);
      
      const { data } = await axios.get(`${API_URL}/instagram-shop/posts?${params}`);
      return data;
    },
    {
      onError: (error) => {
        toast.error('Failed to fetch posts');
        console.error('Error fetching posts:', error);
      }
    }
  );

  // Fetch available products for tagging
  const { data: productsData } = useQuery(
    ['products-available', searchQuery],
    async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      params.append('limit', '100');
      
      const { data } = await axios.get(`${API_URL}/instagram-shop/products/available?${params}`);
      return data;
    },
    {
      enabled: showProductTagModal,
      onError: (error) => {
        console.error('Error fetching products:', error);
      }
    }
  );

  // Fetch analytics
  const { data: analyticsData } = useQuery(
    'instagram-analytics',
    async () => {
      const { data } = await axios.get(`${API_URL}/instagram-shop/analytics?period=30d`);
      return data;
    },
    {
      enabled: activeTab === 'analytics',
      onError: (error) => {
        console.error('Error fetching analytics:', error);
      }
    }
  );

  // Create/Update post mutation
  const savePostMutation = useMutation(
    async (postData) => {
      if (selectedPost) {
        return axios.put(`${API_URL}/instagram-shop/posts/${selectedPost.id}`, postData);
      } else {
        return axios.post(`${API_URL}/instagram-shop/posts`, postData);
      }
    },
    {
      onSuccess: () => {
        toast.success(selectedPost ? 'Post updated successfully' : 'Post created successfully');
        queryClient.invalidateQueries('instagram-posts');
        handleCloseModal();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to save post');
      }
    }
  );

  // Delete post mutation
  const deletePostMutation = useMutation(
    async (postId) => {
      return axios.delete(`${API_URL}/instagram-shop/posts/${postId}`);
    },
    {
      onSuccess: () => {
        toast.success('Post deleted successfully');
        queryClient.invalidateQueries('instagram-posts');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete post');
      }
    }
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleHashtagsChange = (e) => {
    const hashtags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({ ...prev, hashtags }));
  };

  const handleCreatePost = () => {
    setSelectedPost(null);
    setFormData({
      caption: '',
      media_url: '',
      media_type: 'IMAGE',
      post_type: 'FEED',
      status: 'DRAFT',
      scheduled_at: '',
      hashtags: [],
      tagged_products: [],
      notes: ''
    });
    setTagPositions([]);
    setSelectedProducts([]);
    setShowPostModal(true);
  };

  const handleEditPost = (post) => {
    setSelectedPost(post);
    setFormData({
      caption: post.caption || '',
      media_url: post.media_url || '',
      media_type: post.media_type || 'IMAGE',
      post_type: post.post_type || 'FEED',
      status: post.status || 'DRAFT',
      scheduled_at: post.scheduled_at || '',
      hashtags: post.hashtags || [],
      tagged_products: post.tagged_products || [],
      notes: post.notes || ''
    });
    setTagPositions(post.tagged_products || []);
    setShowPostModal(true);
  };

  const handleCloseModal = () => {
    setShowPostModal(false);
    setShowProductTagModal(false);
    setSelectedPost(null);
    setTagPositions([]);
    setSelectedProducts([]);
    setCurrentImage(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const postData = {
      ...formData,
      tagged_products: tagPositions
    };

    savePostMutation.mutate(postData);
  };

  const handleDeletePost = (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deletePostMutation.mutate(postId);
    }
  };

  const handleOpenProductTag = () => {
    setCurrentImage(formData.media_url);
    setShowProductTagModal(true);
  };

  const handleImageClick = (e) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (selectedProducts.length === 0) {
      toast.error('Please select a product first');
      return;
    }

    const newTag = {
      product_id: selectedProducts[0].id,
      product_name: selectedProducts[0].name,
      product_price: selectedProducts[0].price,
      position_x: Math.round(x * 10) / 10,
      position_y: Math.round(y * 10) / 10
    };

    setTagPositions(prev => [...prev, newTag]);
    setSelectedProducts([]);
    toast.success('Product tag added');
  };

  const handleRemoveTag = (index) => {
    setTagPositions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSelectProduct = (product) => {
    setSelectedProducts([product]);
  };

  const handleSaveProductTags = () => {
    setFormData(prev => ({ ...prev, tagged_products: tagPositions }));
    setShowProductTagModal(false);
    toast.success(`${tagPositions.length} product(s) tagged`);
  };

  const getStatusBadge = (status) => {
    const styles = {
      DRAFT: 'status-draft',
      SCHEDULED: 'status-scheduled',
      PUBLISHED: 'status-published',
      ARCHIVED: 'status-archived'
    };
    return <span className={`status-badge ${styles[status]}`}>{status}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  return (
    <div className="admin-insta-shop">
      {/* Header */}
      <div className="insta-header">
        <div>
          <h1>📸 Instagram Shop Management</h1>
          <p>Connect Instagram posts to products and enable Buy Now functionality</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={handleCreatePost}>
            <i className="fas fa-plus"></i> Create Post
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="insta-tabs">
        <button 
          className={activeTab === 'posts' ? 'tab-active' : 'tab'}
          onClick={() => setActiveTab('posts')}
        >
          📱 Posts
        </button>
        <button 
          className={activeTab === 'analytics' ? 'tab-active' : 'tab'}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
        <button 
          className={activeTab === 'settings' ? 'tab-active' : 'tab'}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Settings
        </button>
      </div>

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <div className="posts-container">
          {/* Filters */}
          <div className="filters-bar">
            <div className="filter-group">
              <label>Status:</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Type:</label>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">All Types</option>
                <option value="FEED">Feed</option>
                <option value="STORY">Story</option>
                <option value="REEL">Reel</option>
              </select>
            </div>
          </div>

          {/* Posts Grid */}
          <div className="posts-grid">
            {postsLoading ? (
              <div className="loading">Loading posts...</div>
            ) : postsData?.posts?.length > 0 ? (
              postsData.posts.map(post => (
                <div key={post.id} className="post-card">
                  <div className="post-image">
                    <img src={post.media_url} alt={post.caption || 'Instagram post'} />
                    {post.is_shoppable && (
                      <div className="shoppable-badge">
                        <i className="fas fa-shopping-bag"></i>
                      </div>
                    )}
                    <div className="post-type-badge">{post.post_type}</div>
                  </div>
                  <div className="post-details">
                    <div className="post-header">
                      {getStatusBadge(post.status)}
                      <div className="post-actions">
                        <button 
                          className="btn-icon"
                          onClick={() => handleEditPost(post)}
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className="btn-icon danger"
                          onClick={() => handleDeletePost(post.id)}
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                    <p className="post-caption">
                      {post.caption?.substring(0, 100)}{post.caption?.length > 100 ? '...' : ''}
                    </p>
                    <div className="post-stats">
                      <span><i className="fas fa-heart"></i> {formatNumber(post.likes_count)}</span>
                      <span><i className="fas fa-comment"></i> {formatNumber(post.comments_count)}</span>
                      <span><i className="fas fa-share"></i> {formatNumber(post.shares_count)}</span>
                    </div>
                    {post.tagged_products?.length > 0 && (
                      <div className="tagged-products">
                        <i className="fas fa-tag"></i> {post.tagged_products.length} product(s) tagged
                      </div>
                    )}
                    <div className="post-footer">
                      <small>Created: {formatDate(post.created_at)}</small>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📸</div>
                <h3>No Instagram Posts Yet</h3>
                <p>Create your first Instagram post and connect products to enable shopping</p>
                <button className="btn-primary" onClick={handleCreatePost}>
                  <i className="fas fa-plus"></i> Create First Post
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && analyticsData && (
        <div className="analytics-container">
          <div className="analytics-grid">
            <div className="analytics-card">
              <div className="card-icon">📱</div>
              <div className="card-content">
                <h3>{analyticsData.stats.total_posts || 0}</h3>
                <p>Total Posts</p>
              </div>
            </div>
            <div className="analytics-card">
              <div className="card-icon">🛍️</div>
              <div className="card-content">
                <h3>{analyticsData.stats.shoppable_posts || 0}</h3>
                <p>Shoppable Posts</p>
              </div>
            </div>
            <div className="analytics-card">
              <div className="card-icon">❤️</div>
              <div className="card-content">
                <h3>{formatNumber(analyticsData.stats.total_likes)}</h3>
                <p>Total Likes</p>
              </div>
            </div>
            <div className="analytics-card">
              <div className="card-icon">💬</div>
              <div className="card-content">
                <h3>{formatNumber(analyticsData.stats.total_comments)}</h3>
                <p>Total Comments</p>
              </div>
            </div>
            <div className="analytics-card">
              <div className="card-icon">📊</div>
              <div className="card-content">
                <h3>{analyticsData.stats.avg_engagement_rate?.toFixed(2) || 0}%</h3>
                <p>Avg. Engagement</p>
              </div>
            </div>
            <div className="analytics-card">
              <div className="card-icon">👁️</div>
              <div className="card-content">
                <h3>{formatNumber(analyticsData.stats.total_reach)}</h3>
                <p>Total Reach</p>
              </div>
            </div>
          </div>

          {/* Top Performing Posts */}
          <div className="top-posts-section">
            <h2>🏆 Top Performing Posts</h2>
            <div className="top-posts-list">
              {analyticsData.topPosts?.map(post => (
                <div key={post.id} className="top-post-item">
                  <img src={post.media_url} alt="Post" className="post-thumbnail" />
                  <div className="post-info">
                    <p className="post-caption-short">
                      {post.caption?.substring(0, 60)}{post.caption?.length > 60 ? '...' : ''}
                    </p>
                    <div className="post-metrics">
                      <span>💚 {formatNumber(post.likes_count)}</span>
                      <span>💬 {formatNumber(post.comments_count)}</span>
                      <span>📊 {post.engagement_rate?.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="settings-container">
          <div className="settings-card">
            <h2>📸 Instagram Integration</h2>
            <p>Connect your Instagram Business account to enable automatic post syncing and shopping features.</p>
            <div className="integration-status">
              <div className="status-indicator disconnected"></div>
              <span>Not Connected</span>
            </div>
            <button className="btn-primary">
              <i className="fab fa-instagram"></i> Connect Instagram Account
            </button>
          </div>

          <div className="settings-card">
            <h2>🛍️ Shopping Features</h2>
            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-icon">✅</div>
                <div className="feature-info">
                  <h4>Product Tagging</h4>
                  <p>Tag products in your Instagram posts</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🎯</div>
                <div className="feature-info">
                  <h4>Buy Now Buttons</h4>
                  <p>Enable direct purchase from posts</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📊</div>
                <div className="feature-info">
                  <h4>Shopping Analytics</h4>
                  <p>Track performance and conversions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Post Modal */}
      {showPostModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedPost ? '✏️ Edit Post' : '➕ Create New Post'}</h2>
              <button className="close-btn" onClick={handleCloseModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Post Type *</label>
                    <select name="post_type" value={formData.post_type} onChange={handleInputChange} required>
                      <option value="FEED">Feed Post</option>
                      <option value="STORY">Story</option>
                      <option value="REEL">Reel</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Media Type *</label>
                    <select name="media_type" value={formData.media_type} onChange={handleInputChange} required>
                      <option value="IMAGE">Image</option>
                      <option value="VIDEO">Video</option>
                      <option value="CAROUSEL">Carousel</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Media URL *</label>
                  <input
                    type="url"
                    name="media_url"
                    value={formData.media_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                  {formData.media_url && (
                    <div className="media-preview">
                      <img src={formData.media_url} alt="Preview" style={{ maxWidth: '200px', marginTop: '10px' }} />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Caption</label>
                  <textarea
                    name="caption"
                    value={formData.caption}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Write your caption here..."
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Hashtags (comma separated)</label>
                  <input
                    type="text"
                    value={formData.hashtags.join(', ')}
                    onChange={handleHashtagsChange}
                    placeholder="#jewellery, #fashion, #trending"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Status *</label>
                    <select name="status" value={formData.status} onChange={handleInputChange} required>
                      <option value="DRAFT">Draft</option>
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                  {formData.status === 'SCHEDULED' && (
                    <div className="form-group">
                      <label>Schedule Date & Time</label>
                      <input
                        type="datetime-local"
                        name="scheduled_at"
                        value={formData.scheduled_at}
                        onChange={handleInputChange}
                      />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Product Tags ({tagPositions.length})</label>
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={handleOpenProductTag}
                    disabled={!formData.media_url}
                  >
                    <i className="fas fa-tag"></i> Tag Products
                  </button>
                  {tagPositions.length > 0 && (
                    <div className="tagged-products-list">
                      {tagPositions.map((tag, index) => (
                        <div key={index} className="tagged-product-item">
                          <span>{tag.product_name} - ₹{tag.product_price}</span>
                          <button type="button" onClick={() => handleRemoveTag(index)} className="remove-tag-btn">
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="Internal notes..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={savePostMutation.isLoading}>
                  {savePostMutation.isLoading ? 'Saving...' : (selectedPost ? 'Update Post' : 'Create Post')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Tagging Modal */}
      {showProductTagModal && (
        <div className="modal-overlay" onClick={() => setShowProductTagModal(false)}>
          <div className="modal-content extra-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🏷️ Tag Products</h2>
              <button className="close-btn" onClick={() => setShowProductTagModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="product-tagging-container">
                <div className="image-tagger">
                  <p className="instruction">Click on the image to tag products</p>
                  <div className="image-wrapper">
                    <img 
                      ref={imageRef}
                      src={currentImage} 
                      alt="Tag products" 
                      onClick={handleImageClick}
                      style={{ width: '100%', cursor: 'crosshair' }}
                    />
                    {tagPositions.map((tag, index) => (
                      <div
                        key={index}
                        className="product-tag-marker"
                        style={{
                          left: `${tag.position_x}%`,
                          top: `${tag.position_y}%`
                        }}
                      >
                        <div className="tag-icon">🛍️</div>
                        <div className="tag-tooltip">
                          {tag.product_name}<br/>
                          ₹{tag.product_price}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="products-selector">
                  <div className="search-box">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="products-list">
                    {productsData?.products?.map(product => (
                      <div 
                        key={product.id} 
                        className={`product-item ${selectedProducts.find(p => p.id === product.id) ? 'selected' : ''}`}
                        onClick={() => handleSelectProduct(product)}
                      >
                        {product.images && product.images[0] && (
                          <img src={product.images[0]} alt={product.name} className="product-thumb" />
                        )}
                        <div className="product-info">
                          <h4>{product.name}</h4>
                          <p className="product-price">₹{product.price}</p>
                          <p className="product-stock">Stock: {product.stock}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowProductTagModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSaveProductTags}>
                Save Tags ({tagPositions.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInstaShop;
