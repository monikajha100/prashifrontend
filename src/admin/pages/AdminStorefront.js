import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import './AdminStorefront.css';

const AdminStorefront = () => {
  const [activeTab, setActiveTab] = useState('themes');
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const [showWidgetModal, setShowWidgetModal] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  // Mock data for demonstration - replace with actual API calls
  const mockThemes = [
    {
      id: 1,
      name: 'Modern Minimal',
      description: 'Clean and modern design with focus on content',
      colors: {
        primary: '#10b981',
        secondary: '#6b7280',
        accent: '#f59e0b',
        background: '#ffffff',
        text: '#1f2937'
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter'
      },
      layout: 'grid',
      isActive: true,
      preview: '/images/themes/modern-minimal.jpg'
    },
    {
      id: 2,
      name: 'Classic Elegance',
      description: 'Traditional design with elegant typography',
      colors: {
        primary: '#7c3aed',
        secondary: '#64748b',
        accent: '#f97316',
        background: '#fefefe',
        text: '#0f172a'
      },
      fonts: {
        heading: 'Playfair Display',
        body: 'Source Sans Pro'
      },
      layout: 'sidebar',
      isActive: false,
      preview: '/images/themes/classic-elegance.jpg'
    },
    {
      id: 3,
      name: 'Bold & Bright',
      description: 'Vibrant colors and bold design elements',
      colors: {
        primary: '#ef4444',
        secondary: '#8b5cf6',
        accent: '#06b6d4',
        background: '#ffffff',
        text: '#111827'
      },
      fonts: {
        heading: 'Poppins',
        body: 'Open Sans'
      },
      layout: 'masonry',
      isActive: false,
      preview: '/images/themes/bold-bright.jpg'
    }
  ];

  const mockHomepageSections = [
    {
      id: 1,
      name: 'Hero Banner',
      type: 'banner',
      position: 1,
      isActive: true,
      content: {
        title: 'Welcome to Praashi by Supal',
        subtitle: 'Premium home decor and furniture',
        image: '/images/hero-banner.jpg',
        buttonText: 'Shop Now',
        buttonLink: '/products'
      }
    },
    {
      id: 2,
      name: 'Featured Products',
      type: 'products',
      position: 2,
      isActive: true,
      content: {
        title: 'Featured Products',
        subtitle: 'Handpicked items for your home',
        productCount: 8,
        category: 'featured'
      }
    },
    {
      id: 3,
      name: 'Categories Grid',
      type: 'categories',
      position: 3,
      isActive: true,
      content: {
        title: 'Shop by Category',
        subtitle: 'Find exactly what you need',
        layout: 'grid',
        showCount: true
      }
    },
    {
      id: 4,
      name: 'Testimonials',
      type: 'testimonials',
      position: 4,
      isActive: false,
      content: {
        title: 'What Our Customers Say',
        subtitle: 'Real reviews from real customers',
        testimonials: []
      }
    }
  ];

  const mockWidgets = [
    {
      id: 1,
      name: 'Search Bar',
      type: 'search',
      position: 'header',
      isActive: true,
      settings: {
        placeholder: 'Search products...',
        showSuggestions: true,
        maxSuggestions: 5
      }
    },
    {
      id: 2,
      name: 'Shopping Cart',
      type: 'cart',
      position: 'header',
      isActive: true,
      settings: {
        showItemCount: true,
        showTotal: true,
        animation: 'slide'
      }
    },
    {
      id: 3,
      name: 'Newsletter Signup',
      type: 'newsletter',
      position: 'footer',
      isActive: true,
      settings: {
        title: 'Subscribe to our newsletter',
        description: 'Get updates on new products and offers',
        buttonText: 'Subscribe'
      }
    },
    {
      id: 4,
      name: 'Social Media Links',
      type: 'social',
      position: 'footer',
      isActive: true,
      settings: {
        platforms: ['facebook', 'instagram', 'twitter', 'youtube'],
        showLabels: false,
        iconSize: 'medium'
      }
    }
  ];

  const mockAnalytics = {
    pageViews: 15420,
    uniqueVisitors: 8930,
    bounceRate: 42.5,
    avgSessionDuration: '3:24',
    topPages: [
      { page: '/', views: 5420, percentage: 35.1 },
      { page: '/products', views: 3210, percentage: 20.8 },
      { page: '/categories', views: 2890, percentage: 18.7 },
      { page: '/about', views: 1560, percentage: 10.1 },
      { page: '/contact', views: 1340, percentage: 8.7 }
    ],
    deviceBreakdown: {
      desktop: 65.2,
      mobile: 28.7,
      tablet: 6.1
    },
    trafficSources: {
      direct: 45.3,
      search: 32.1,
      social: 15.2,
      referral: 7.4
    }
  };

  const handleThemeSelect = (theme) => {
    setSelectedTheme(theme);
    setShowThemeModal(true);
  };

  const handleApplyTheme = (theme) => {
    toast.success(`Theme "${theme.name}" applied successfully!`);
    setShowThemeModal(false);
  };

  const handleSectionToggle = (section) => {
    const newStatus = !section.isActive;
    toast.success(`Section "${section.name}" ${newStatus ? 'enabled' : 'disabled'}`);
  };

  const handleSectionReorder = (dragIndex, hoverIndex) => {
    toast.success('Section order updated');
  };

  const handleWidgetToggle = (widget) => {
    const newStatus = !widget.isActive;
    toast.success(`Widget "${widget.name}" ${newStatus ? 'enabled' : 'disabled'}`);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const formatPercentage = (num) => {
    return `${num.toFixed(1)}%`;
  };

  return (
    <div className="admin-storefront">
      {/* Header */}
      <div className="storefront-header">
        <div>
          <h1>🏬 Storefront Management</h1>
          <p>Customize and manage your online store appearance</p>
        </div>
        <div className="header-actions">
          <button 
            className={`preview-btn ${previewMode ? 'active' : ''}`}
            onClick={() => setPreviewMode(!previewMode)}
          >
            👁️ {previewMode ? 'Exit Preview' : 'Preview Store'}
          </button>
          <button className="btn-primary">
            💾 Save Changes
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="storefront-tabs">
        <button 
          className={activeTab === 'themes' ? 'tab-active' : 'tab'}
          onClick={() => setActiveTab('themes')}
        >
          🎨 Themes
        </button>
        <button 
          className={activeTab === 'homepage' ? 'tab-active' : 'tab'}
          onClick={() => setActiveTab('homepage')}
        >
          🏠 Homepage
        </button>
        <button 
          className={activeTab === 'widgets' ? 'tab-active' : 'tab'}
          onClick={() => setActiveTab('widgets')}
        >
          🔧 Widgets
        </button>
        <button 
          className={activeTab === 'analytics' ? 'tab-active' : 'tab'}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
      </div>

      {/* Themes Tab */}
      {activeTab === 'themes' && (
        <div className="themes-content">
          <div className="themes-grid">
            {mockThemes.map((theme) => (
              <div key={theme.id} className={`theme-card ${theme.isActive ? 'active' : ''}`}>
                <div className="theme-preview">
                  <div className="theme-preview-image">
                    <div className="color-palette">
                      {Object.entries(theme.colors).map(([key, color]) => (
                        <div 
                          key={key} 
                          className="color-swatch" 
                          style={{ backgroundColor: color }}
                          title={`${key}: ${color}`}
                        ></div>
                      ))}
                    </div>
                  </div>
                  <div className="theme-status">
                    {theme.isActive && <span className="active-badge">Active</span>}
                  </div>
                </div>
                <div className="theme-info">
                  <h3>{theme.name}</h3>
                  <p>{theme.description}</p>
                  <div className="theme-details">
                    <div className="detail-item">
                      <span className="detail-label">Layout:</span>
                      <span className="detail-value">{theme.layout}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Fonts:</span>
                      <span className="detail-value">{theme.fonts.heading}, {theme.fonts.body}</span>
                    </div>
                  </div>
                </div>
                <div className="theme-actions">
                  <button 
                    className="btn-primary"
                    onClick={() => handleThemeSelect(theme)}
                  >
                    {theme.isActive ? 'Customize' : 'Apply Theme'}
                  </button>
                  <button className="btn-secondary">
                    Preview
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Homepage Tab */}
      {activeTab === 'homepage' && (
        <div className="homepage-content">
          <div className="sections-list">
            {mockHomepageSections.map((section, index) => (
              <div key={section.id} className={`section-item ${section.isActive ? 'active' : 'inactive'}`}>
                <div className="section-handle">
                  <span className="drag-handle">⋮⋮</span>
                  <span className="section-position">{section.position}</span>
                </div>
                <div className="section-info">
                  <div className="section-header">
                    <h4>{section.name}</h4>
                    <span className={`section-type ${section.type}`}>{section.type}</span>
                  </div>
                  <div className="section-content">
                    {section.type === 'banner' && (
                      <div className="content-preview">
                        <strong>{section.content.title}</strong>
                        <p>{section.content.subtitle}</p>
                      </div>
                    )}
                    {section.type === 'products' && (
                      <div className="content-preview">
                        <strong>{section.content.title}</strong>
                        <p>Show {section.content.productCount} products</p>
                      </div>
                    )}
                    {section.type === 'categories' && (
                      <div className="content-preview">
                        <strong>{section.content.title}</strong>
                        <p>Grid layout with category counts</p>
                      </div>
                    )}
                    {section.type === 'testimonials' && (
                      <div className="content-preview">
                        <strong>{section.content.title}</strong>
                        <p>Customer testimonials section</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="section-actions">
                  <button 
                    className={`toggle-btn ${section.isActive ? 'active' : ''}`}
                    onClick={() => handleSectionToggle(section)}
                  >
                    {section.isActive ? 'Disable' : 'Enable'}
                  </button>
                  <button className="edit-btn">Edit</button>
                  <button className="settings-btn">⚙️</button>
                </div>
              </div>
            ))}
          </div>
          <div className="add-section">
            <button className="btn-primary">
              ➕ Add New Section
            </button>
          </div>
        </div>
      )}

      {/* Widgets Tab */}
      {activeTab === 'widgets' && (
        <div className="widgets-content">
          <div className="widgets-grid">
            {mockWidgets.map((widget) => (
              <div key={widget.id} className={`widget-card ${widget.isActive ? 'active' : 'inactive'}`}>
                <div className="widget-header">
                  <div className="widget-icon">
                    {widget.type === 'search' && '🔍'}
                    {widget.type === 'cart' && '🛒'}
                    {widget.type === 'newsletter' && '📧'}
                    {widget.type === 'social' && '📱'}
                  </div>
                  <div className="widget-info">
                    <h4>{widget.name}</h4>
                    <span className="widget-position">{widget.position}</span>
                  </div>
                  <div className="widget-status">
                    <span className={`status-badge ${widget.isActive ? 'active' : 'inactive'}`}>
                      {widget.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="widget-settings">
                  {widget.type === 'search' && (
                    <div className="setting-item">
                      <span>Placeholder: "{widget.settings.placeholder}"</span>
                    </div>
                  )}
                  {widget.type === 'cart' && (
                    <div className="setting-item">
                      <span>Show item count: {widget.settings.showItemCount ? 'Yes' : 'No'}</span>
                    </div>
                  )}
                  {widget.type === 'newsletter' && (
                    <div className="setting-item">
                      <span>Title: "{widget.settings.title}"</span>
                    </div>
                  )}
                  {widget.type === 'social' && (
                    <div className="setting-item">
                      <span>Platforms: {widget.settings.platforms.join(', ')}</span>
                    </div>
                  )}
                </div>
                <div className="widget-actions">
                  <button 
                    className={`toggle-btn ${widget.isActive ? 'active' : ''}`}
                    onClick={() => handleWidgetToggle(widget)}
                  >
                    {widget.isActive ? 'Disable' : 'Enable'}
                  </button>
                  <button className="edit-btn">Edit</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="analytics-content">
          <div className="analytics-overview">
            <div className="metric-card">
              <div className="metric-icon">👁️</div>
              <div className="metric-info">
                <div className="metric-value">{formatNumber(mockAnalytics.pageViews)}</div>
                <div className="metric-label">Page Views</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">👥</div>
              <div className="metric-info">
                <div className="metric-value">{formatNumber(mockAnalytics.uniqueVisitors)}</div>
                <div className="metric-label">Unique Visitors</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">📊</div>
              <div className="metric-info">
                <div className="metric-value">{formatPercentage(mockAnalytics.bounceRate)}</div>
                <div className="metric-label">Bounce Rate</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">⏱️</div>
              <div className="metric-info">
                <div className="metric-value">{mockAnalytics.avgSessionDuration}</div>
                <div className="metric-label">Avg Session</div>
              </div>
            </div>
          </div>

          <div className="analytics-charts">
            <div className="chart-section">
              <h3>📄 Top Pages</h3>
              <div className="pages-list">
                {mockAnalytics.topPages.map((page, index) => (
                  <div key={index} className="page-item">
                    <div className="page-info">
                      <span className="page-url">{page.page}</span>
                      <span className="page-views">{formatNumber(page.views)} views</span>
                    </div>
                    <div className="page-bar">
                      <div 
                        className="page-fill"
                        style={{ width: `${page.percentage}%` }}
                      ></div>
                    </div>
                    <span className="page-percentage">{formatPercentage(page.percentage)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-section">
              <h3>📱 Device Breakdown</h3>
              <div className="device-breakdown">
                <div className="device-item">
                  <span className="device-label">Desktop</span>
                  <div className="device-bar">
                    <div 
                      className="device-fill desktop"
                      style={{ width: `${mockAnalytics.deviceBreakdown.desktop}%` }}
                    ></div>
                  </div>
                  <span className="device-percentage">{formatPercentage(mockAnalytics.deviceBreakdown.desktop)}</span>
                </div>
                <div className="device-item">
                  <span className="device-label">Mobile</span>
                  <div className="device-bar">
                    <div 
                      className="device-fill mobile"
                      style={{ width: `${mockAnalytics.deviceBreakdown.mobile}%` }}
                    ></div>
                  </div>
                  <span className="device-percentage">{formatPercentage(mockAnalytics.deviceBreakdown.mobile)}</span>
                </div>
                <div className="device-item">
                  <span className="device-label">Tablet</span>
                  <div className="device-bar">
                    <div 
                      className="device-fill tablet"
                      style={{ width: `${mockAnalytics.deviceBreakdown.tablet}%` }}
                    ></div>
                  </div>
                  <span className="device-percentage">{formatPercentage(mockAnalytics.deviceBreakdown.tablet)}</span>
                </div>
              </div>
            </div>

            <div className="chart-section">
              <h3>🌐 Traffic Sources</h3>
              <div className="traffic-sources">
                <div className="source-item">
                  <span className="source-label">Direct</span>
                  <span className="source-percentage">{formatPercentage(mockAnalytics.trafficSources.direct)}</span>
                </div>
                <div className="source-item">
                  <span className="source-label">Search</span>
                  <span className="source-percentage">{formatPercentage(mockAnalytics.trafficSources.search)}</span>
                </div>
                <div className="source-item">
                  <span className="source-label">Social</span>
                  <span className="source-percentage">{formatPercentage(mockAnalytics.trafficSources.social)}</span>
                </div>
                <div className="source-item">
                  <span className="source-label">Referral</span>
                  <span className="source-percentage">{formatPercentage(mockAnalytics.trafficSources.referral)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Theme Customization Modal */}
      {showThemeModal && selectedTheme && (
        <div className="modal-overlay">
          <div className="modal theme-modal">
            <div className="modal-header">
              <h3>🎨 Customize Theme: {selectedTheme.name}</h3>
              <button onClick={() => setShowThemeModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="theme-customizer">
                <div className="color-customizer">
                  <h4>🎨 Colors</h4>
                  <div className="color-inputs">
                    {Object.entries(selectedTheme.colors).map(([key, color]) => (
                      <div key={key} className="color-input-group">
                        <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                        <div className="color-input-wrapper">
                          <input 
                            type="color" 
                            value={color}
                            className="color-picker"
                          />
                          <input 
                            type="text" 
                            value={color}
                            className="color-text"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="font-customizer">
                  <h4>🔤 Fonts</h4>
                  <div className="font-inputs">
                    <div className="font-input-group">
                      <label>Heading Font</label>
                      <select value={selectedTheme.fonts.heading}>
                        <option value="Inter">Inter</option>
                        <option value="Playfair Display">Playfair Display</option>
                        <option value="Poppins">Poppins</option>
                        <option value="Roboto">Roboto</option>
                      </select>
                    </div>
                    <div className="font-input-group">
                      <label>Body Font</label>
                      <select value={selectedTheme.fonts.body}>
                        <option value="Inter">Inter</option>
                        <option value="Source Sans Pro">Source Sans Pro</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Roboto">Roboto</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="layout-customizer">
                  <h4>📐 Layout</h4>
                  <div className="layout-options">
                    <label className="layout-option">
                      <input type="radio" name="layout" value="grid" defaultChecked={selectedTheme.layout === 'grid'} />
                      <span>Grid Layout</span>
                    </label>
                    <label className="layout-option">
                      <input type="radio" name="layout" value="sidebar" defaultChecked={selectedTheme.layout === 'sidebar'} />
                      <span>Sidebar Layout</span>
                    </label>
                    <label className="layout-option">
                      <input type="radio" name="layout" value="masonry" defaultChecked={selectedTheme.layout === 'masonry'} />
                      <span>Masonry Layout</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  className="btn-secondary" 
                  onClick={() => setShowThemeModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary"
                  onClick={() => handleApplyTheme(selectedTheme)}
                >
                  Apply Theme
                </button>
              </div>
            </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default AdminStorefront;
