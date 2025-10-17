import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import './AdminSocial.css';

const AdminSocial = () => {
  const [activeTab, setActiveTab] = useState('instagram');
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  // Mock data for demonstration - replace with actual API calls
  const mockSocialAccounts = [
    {
      id: 1,
      platform: 'instagram',
      username: '@praashibysupal',
      followers: 15420,
      following: 892,
      posts: 156,
      isConnected: true,
      lastSync: '2024-10-16T10:30:00Z',
      profileImage: '/images/instagram-profile.jpg',
      bio: 'Premium home decor & furniture 🏠✨ #HomeDecor #InteriorDesign'
    },
    {
      id: 2,
      platform: 'facebook',
      username: 'Praashi by Supal',
      followers: 8930,
      following: 245,
      posts: 89,
      isConnected: true,
      lastSync: '2024-10-16T09:15:00Z',
      profileImage: '/images/facebook-profile.jpg',
      bio: 'Transform your home with our premium furniture collection'
    },
    {
      id: 3,
      platform: 'tiktok',
      username: '@praashibysupal',
      followers: 12500,
      following: 156,
      posts: 234,
      isConnected: false,
      lastSync: null,
      profileImage: '/images/tiktok-profile.jpg',
      bio: 'Home decor inspiration & DIY tips 🎨'
    }
  ];

  const mockPosts = [
    {
      id: 1,
      platform: 'instagram',
      type: 'post',
      content: 'Transform your living room with our new Victorian collection! ✨',
      image: '/images/posts/victorian-collection.jpg',
      products: [
        { id: 1, name: 'Victorian Sofa Set', price: 45000, position: { x: 120, y: 200 } },
        { id: 2, name: 'Antique Coffee Table', price: 15000, position: { x: 300, y: 350 } }
      ],
      hashtags: ['#VictorianCollection', '#HomeDecor', '#PremiumFurniture'],
      likes: 1240,
      comments: 89,
      shares: 45,
      engagement: 8.7,
      publishedAt: '2024-10-15T14:30:00Z',
      status: 'published'
    },
    {
      id: 2,
      platform: 'instagram',
      type: 'story',
      content: 'Behind the scenes: Crafting our premium furniture 🛠️',
      image: '/images/posts/behind-scenes.jpg',
      products: [],
      hashtags: ['#BehindTheScenes', '#Craftsmanship'],
      views: 3200,
      interactions: 156,
      publishedAt: '2024-10-15T16:45:00Z',
      status: 'published'
    },
    {
      id: 3,
      platform: 'facebook',
      type: 'post',
      content: 'New arrivals this week! Check out our latest collection.',
      image: '/images/posts/new-arrivals.jpg',
      products: [
        { id: 3, name: 'Modern Dining Set', price: 35000, position: { x: 200, y: 150 } }
      ],
      hashtags: ['#NewArrivals', '#Furniture'],
      likes: 456,
      comments: 23,
      shares: 12,
      engagement: 5.2,
      publishedAt: '2024-10-14T11:20:00Z',
      status: 'published'
    }
  ];

  const mockCampaigns = [
    {
      id: 1,
      name: 'Holiday Collection Launch',
      description: 'Promote our new holiday-themed furniture collection',
      platforms: ['instagram', 'facebook'],
      startDate: '2024-12-01',
      endDate: '2024-12-31',
      budget: 50000,
      spent: 12500,
      status: 'active',
      posts: 8,
      reach: 45000,
      engagement: 3200,
      conversions: 45,
      influencers: [
        { id: 1, name: 'Home Decor Influencer', followers: 25000, rate: 15000 },
        { id: 2, name: 'Interior Designer', followers: 18000, rate: 12000 }
      ]
    },
    {
      id: 2,
      name: 'Summer Sale Campaign',
      description: 'Drive sales during summer season',
      platforms: ['instagram', 'facebook', 'tiktok'],
      startDate: '2024-06-01',
      endDate: '2024-08-31',
      budget: 75000,
      spent: 75000,
      status: 'completed',
      posts: 25,
      reach: 125000,
      engagement: 8900,
      conversions: 156,
      influencers: [
        { id: 3, name: 'Lifestyle Blogger', followers: 35000, rate: 20000 }
      ]
    }
  ];

  const mockAnalytics = {
    totalFollowers: 36850,
    totalEngagement: 12.4,
    totalReach: 156000,
    totalImpressions: 234000,
    topPosts: [
      { id: 1, content: 'Victorian Collection Launch', engagement: 8.7, reach: 15420 },
      { id: 2, content: 'Behind the Scenes', engagement: 6.2, reach: 12300 },
      { id: 3, content: 'New Arrivals', engagement: 5.8, reach: 11200 }
    ],
    platformBreakdown: {
      instagram: { followers: 15420, engagement: 8.7, posts: 156 },
      facebook: { followers: 8930, engagement: 5.2, posts: 89 },
      tiktok: { followers: 12500, engagement: 12.1, posts: 234 }
    },
    engagementTrend: [
      { date: '2024-10-10', engagement: 8.2 },
      { date: '2024-10-11', engagement: 9.1 },
      { date: '2024-10-12', engagement: 7.8 },
      { date: '2024-10-13', engagement: 10.3 },
      { date: '2024-10-14', engagement: 11.2 },
      { date: '2024-10-15', engagement: 12.4 }
    ]
  };

  const mockInfluencers = [
    {
      id: 1,
      name: 'Home Decor Influencer',
      username: '@homedecor_expert',
      platform: 'instagram',
      followers: 25000,
      engagement: 6.8,
      category: 'Home & Garden',
      rate: 15000,
      contact: 'contact@homedecor.com',
      status: 'active',
      lastCollaboration: '2024-10-01'
    },
    {
      id: 2,
      name: 'Interior Designer Pro',
      username: '@interior_designer_pro',
      platform: 'instagram',
      followers: 18000,
      engagement: 8.2,
      category: 'Interior Design',
      rate: 12000,
      contact: 'pro@interior.com',
      status: 'active',
      lastCollaboration: '2024-09-15'
    },
    {
      id: 3,
      name: 'Lifestyle Blogger',
      username: '@lifestyle_blogger',
      platform: 'tiktok',
      followers: 35000,
      engagement: 12.5,
      category: 'Lifestyle',
      rate: 20000,
      contact: 'hello@lifestyle.com',
      status: 'pending',
      lastCollaboration: null
    }
  ];

  const handleConnectAccount = (platform) => {
    setSelectedPlatform(platform);
    setShowConnectModal(true);
  };

  const handleCreateCampaign = () => {
    setShowCampaignModal(true);
  };

  const handleCreatePost = () => {
    setShowPostModal(true);
  };

  const handleToggleAccount = (account) => {
    const newStatus = !account.isConnected;
    toast.success(`Account ${newStatus ? 'connected' : 'disconnected'} successfully`);
  };

  const handleSchedulePost = (post) => {
    toast.success('Post scheduled successfully');
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      instagram: '📸',
      facebook: '📘',
      tiktok: '🎵',
      twitter: '🐦',
      youtube: '📺'
    };
    return icons[platform] || '📱';
  };

  const getPlatformColor = (platform) => {
    const colors = {
      instagram: '#E4405F',
      facebook: '#1877F2',
      tiktok: '#000000',
      twitter: '#1DA1F2',
      youtube: '#FF0000'
    };
    return colors[platform] || '#6B7280';
  };

  return (
    <div className="admin-social">
      {/* Header */}
      <div className="social-header">
        <div>
          <h1>📱 Social Media Management</h1>
          <p>Manage your social media presence and campaigns</p>
        </div>
        <div className="header-actions">
          <button 
            className={`preview-btn ${previewMode ? 'active' : ''}`}
            onClick={() => setPreviewMode(!previewMode)}
          >
            👁️ {previewMode ? 'Exit Preview' : 'Preview Posts'}
          </button>
          <button className="btn-primary" onClick={handleCreatePost}>
            📝 Create Post
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="social-tabs">
        <button 
          className={activeTab === 'instagram' ? 'tab-active' : 'tab'}
          onClick={() => setActiveTab('instagram')}
        >
          📸 Instagram
        </button>
        <button 
          className={activeTab === 'accounts' ? 'tab-active' : 'tab'}
          onClick={() => setActiveTab('accounts')}
        >
          🔗 Accounts
        </button>
        <button 
          className={activeTab === 'campaigns' ? 'tab-active' : 'tab'}
          onClick={() => setActiveTab('campaigns')}
        >
          🎯 Campaigns
        </button>
        <button 
          className={activeTab === 'influencers' ? 'tab-active' : 'tab'}
          onClick={() => setActiveTab('influencers')}
        >
          👥 Influencers
        </button>
        <button 
          className={activeTab === 'analytics' ? 'tab-active' : 'tab'}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
      </div>

      {/* Instagram Tab */}
      {activeTab === 'instagram' && (
        <div className="instagram-content">
          <div className="instagram-header">
            <div className="account-info">
              <div className="account-avatar">
                <img src="/images/instagram-profile.jpg" alt="Instagram Profile" />
              </div>
              <div className="account-details">
                <h3>@praashibysupal</h3>
                <p>Premium home decor & furniture 🏠✨</p>
                <div className="account-stats">
                  <span><strong>15.4K</strong> followers</span>
                  <span><strong>892</strong> following</span>
                  <span><strong>156</strong> posts</span>
                </div>
              </div>
            </div>
            <div className="account-actions">
              <button className="btn-secondary">📊 View Insights</button>
              <button className="btn-primary">📝 Create Post</button>
            </div>
          </div>

          <div className="posts-grid">
            {mockPosts.filter(post => post.platform === 'instagram').map((post) => (
              <div key={post.id} className="post-card">
                <div className="post-image">
                  <img src={post.image} alt="Post" />
                  {post.products.length > 0 && (
                    <div className="shopping-tags">
                      {post.products.map((product, index) => (
                        <div 
                          key={index}
                          className="shopping-tag"
                          style={{ 
                            left: `${product.position.x}px`, 
                            top: `${product.position.y}px` 
                          }}
                        >
                          <span className="tag-icon">🛍️</span>
                          <div className="tag-content">
                            <div className="product-name">{product.name}</div>
                            <div className="product-price">{formatCurrency(product.price)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="post-content">
                  <p>{post.content}</p>
                  <div className="post-hashtags">
                    {post.hashtags.map((tag, index) => (
                      <span key={index} className="hashtag">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="post-stats">
                  <div className="stat">
                    <span className="stat-icon">❤️</span>
                    <span>{formatNumber(post.likes || post.views)}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-icon">💬</span>
                    <span>{formatNumber(post.comments || post.interactions)}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-icon">📊</span>
                    <span>{post.engagement}%</span>
                  </div>
                </div>
                <div className="post-actions">
                  <button className="btn-secondary">Edit</button>
                  <button className="btn-primary">Boost</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accounts Tab */}
      {activeTab === 'accounts' && (
        <div className="accounts-content">
          <div className="accounts-grid">
            {mockSocialAccounts.map((account) => (
              <div key={account.id} className={`account-card ${account.isConnected ? 'connected' : 'disconnected'}`}>
                <div className="account-header">
                  <div className="platform-info">
                    <span className="platform-icon" style={{ color: getPlatformColor(account.platform) }}>
                      {getPlatformIcon(account.platform)}
                    </span>
                    <div className="platform-details">
                      <h4>{account.username}</h4>
                      <span className="platform-name">{account.platform}</span>
                    </div>
                  </div>
                  <div className="connection-status">
                    <span className={`status-badge ${account.isConnected ? 'connected' : 'disconnected'}`}>
                      {account.isConnected ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                </div>
                
                <div className="account-stats">
                  <div className="stat">
                    <span className="stat-value">{formatNumber(account.followers)}</span>
                    <span className="stat-label">Followers</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{formatNumber(account.following)}</span>
                    <span className="stat-label">Following</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{account.posts}</span>
                    <span className="stat-label">Posts</span>
                  </div>
                </div>

                <div className="account-bio">
                  <p>{account.bio}</p>
                </div>

                {account.isConnected && account.lastSync && (
                  <div className="last-sync">
                    <span>Last sync: {formatDate(account.lastSync)}</span>
                  </div>
                )}

                <div className="account-actions">
                  {account.isConnected ? (
                    <>
                      <button className="btn-secondary">📊 Analytics</button>
                      <button 
                        className="btn-danger"
                        onClick={() => handleToggleAccount(account)}
                      >
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <button 
                      className="btn-primary"
                      onClick={() => handleConnectAccount(account.platform)}
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="campaigns-content">
          <div className="campaigns-header">
            <h3>Marketing Campaigns</h3>
            <button className="btn-primary" onClick={handleCreateCampaign}>
              ➕ Create Campaign
            </button>
          </div>

          <div className="campaigns-grid">
            {mockCampaigns.map((campaign) => (
              <div key={campaign.id} className={`campaign-card ${campaign.status}`}>
                <div className="campaign-header">
                  <h4>{campaign.name}</h4>
                  <span className={`campaign-status ${campaign.status}`}>
                    {campaign.status}
                  </span>
                </div>
                
                <div className="campaign-description">
                  <p>{campaign.description}</p>
                </div>

                <div className="campaign-platforms">
                  {campaign.platforms.map((platform) => (
                    <span key={platform} className="platform-badge">
                      {getPlatformIcon(platform)} {platform}
                    </span>
                  ))}
                </div>

                <div className="campaign-stats">
                  <div className="stat-row">
                    <span>Budget:</span>
                    <span>{formatCurrency(campaign.budget)}</span>
                  </div>
                  <div className="stat-row">
                    <span>Spent:</span>
                    <span>{formatCurrency(campaign.spent)}</span>
                  </div>
                  <div className="stat-row">
                    <span>Reach:</span>
                    <span>{formatNumber(campaign.reach)}</span>
                  </div>
                  <div className="stat-row">
                    <span>Engagement:</span>
                    <span>{formatNumber(campaign.engagement)}</span>
                  </div>
                  <div className="stat-row">
                    <span>Conversions:</span>
                    <span>{campaign.conversions}</span>
                  </div>
                </div>

                <div className="campaign-dates">
                  <div>Start: {formatDate(campaign.startDate)}</div>
                  <div>End: {formatDate(campaign.endDate)}</div>
                </div>

                <div className="campaign-influencers">
                  <h5>Influencers ({campaign.influencers.length})</h5>
                  <div className="influencer-list">
                    {campaign.influencers.map((influencer) => (
                      <div key={influencer.id} className="influencer-item">
                        <span>{influencer.name}</span>
                        <span>{formatNumber(influencer.followers)} followers</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="campaign-actions">
                  <button className="btn-secondary">View Details</button>
                  <button className="btn-primary">Edit Campaign</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Influencers Tab */}
      {activeTab === 'influencers' && (
        <div className="influencers-content">
          <div className="influencers-header">
            <h3>Influencer Network</h3>
            <button className="btn-primary">
              ➕ Add Influencer
            </button>
          </div>

          <div className="influencers-grid">
            {mockInfluencers.map((influencer) => (
              <div key={influencer.id} className="influencer-card">
                <div className="influencer-header">
                  <div className="influencer-avatar">
                    <img src="/images/influencer-avatar.jpg" alt="Influencer" />
                  </div>
                  <div className="influencer-info">
                    <h4>{influencer.name}</h4>
                    <p>{influencer.username}</p>
                    <span className={`platform-badge ${influencer.platform}`}>
                      {getPlatformIcon(influencer.platform)} {influencer.platform}
                    </span>
                  </div>
                  <div className="influencer-status">
                    <span className={`status-badge ${influencer.status}`}>
                      {influencer.status}
                    </span>
                  </div>
                </div>

                <div className="influencer-stats">
                  <div className="stat">
                    <span className="stat-value">{formatNumber(influencer.followers)}</span>
                    <span className="stat-label">Followers</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{influencer.engagement}%</span>
                    <span className="stat-label">Engagement</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{formatCurrency(influencer.rate)}</span>
                    <span className="stat-label">Rate</span>
                  </div>
                </div>

                <div className="influencer-details">
                  <div className="detail-item">
                    <span className="detail-label">Category:</span>
                    <span className="detail-value">{influencer.category}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Contact:</span>
                    <span className="detail-value">{influencer.contact}</span>
                  </div>
                  {influencer.lastCollaboration && (
                    <div className="detail-item">
                      <span className="detail-label">Last Collaboration:</span>
                      <span className="detail-value">{formatDate(influencer.lastCollaboration)}</span>
                    </div>
                  )}
                </div>

                <div className="influencer-actions">
                  <button className="btn-secondary">View Profile</button>
                  <button className="btn-primary">Contact</button>
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
              <div className="metric-icon">👥</div>
              <div className="metric-info">
                <div className="metric-value">{formatNumber(mockAnalytics.totalFollowers)}</div>
                <div className="metric-label">Total Followers</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">📊</div>
              <div className="metric-info">
                <div className="metric-value">{mockAnalytics.totalEngagement}%</div>
                <div className="metric-label">Avg Engagement</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">👁️</div>
              <div className="metric-info">
                <div className="metric-value">{formatNumber(mockAnalytics.totalReach)}</div>
                <div className="metric-label">Total Reach</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">📈</div>
              <div className="metric-info">
                <div className="metric-value">{formatNumber(mockAnalytics.totalImpressions)}</div>
                <div className="metric-label">Impressions</div>
              </div>
            </div>
          </div>

          <div className="analytics-charts">
            <div className="chart-section">
              <h3>📈 Platform Performance</h3>
              <div className="platform-performance">
                {Object.entries(mockAnalytics.platformBreakdown).map(([platform, data]) => (
                  <div key={platform} className="platform-metric">
                    <div className="platform-header">
                      <span className="platform-icon">{getPlatformIcon(platform)}</span>
                      <span className="platform-name">{platform}</span>
                    </div>
                    <div className="platform-stats">
                      <div className="stat">
                        <span className="stat-value">{formatNumber(data.followers)}</span>
                        <span className="stat-label">Followers</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">{data.engagement}%</span>
                        <span className="stat-label">Engagement</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">{data.posts}</span>
                        <span className="stat-label">Posts</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-section">
              <h3>🔥 Top Performing Posts</h3>
              <div className="top-posts">
                {mockAnalytics.topPosts.map((post, index) => (
                  <div key={post.id} className="top-post-item">
                    <div className="post-rank">#{index + 1}</div>
                    <div className="post-content">
                      <h5>{post.content}</h5>
                      <div className="post-metrics">
                        <span>Engagement: {post.engagement}%</span>
                        <span>Reach: {formatNumber(post.reach)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connect Account Modal */}
      {showConnectModal && selectedPlatform && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>🔗 Connect {selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)}</h3>
              <button onClick={() => setShowConnectModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="connect-instructions">
                <p>To connect your {selectedPlatform} account:</p>
                <ol>
                  <li>Click the "Authorize" button below</li>
                  <li>Log in to your {selectedPlatform} account</li>
                  <li>Grant permission to access your account</li>
                  <li>You'll be redirected back to complete the setup</li>
                </ol>
              </div>
              <div className="modal-actions">
                <button 
                  className="btn-secondary" 
                  onClick={() => setShowConnectModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary"
                  onClick={() => {
                    toast.success(`${selectedPlatform} account connected successfully!`);
                    setShowConnectModal(false);
                  }}
                >
                  Authorize {selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCampaignModal && (
        <div className="modal-overlay">
          <div className="modal campaign-modal">
            <div className="modal-header">
              <h3>🎯 Create New Campaign</h3>
              <button onClick={() => setShowCampaignModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form className="campaign-form">
                <div className="form-group">
                  <label>Campaign Name</label>
                  <input type="text" placeholder="e.g., Holiday Collection Launch" />
                </div>
                
                <div className="form-group">
                  <label>Description</label>
                  <textarea rows="3" placeholder="Describe your campaign goals..."></textarea>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input type="date" />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input type="date" />
                  </div>
                </div>

                <div className="form-group">
                  <label>Platforms</label>
                  <div className="platform-checkboxes">
                    {['instagram', 'facebook', 'tiktok', 'twitter'].map((platform) => (
                      <label key={platform} className="platform-checkbox">
                        <input type="checkbox" />
                        <span>{getPlatformIcon(platform)} {platform}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Budget</label>
                  <input type="number" placeholder="50000" />
                </div>

                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => setShowCampaignModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.success('Campaign created successfully!');
                      setShowCampaignModal(false);
                    }}
                  >
                    Create Campaign
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showPostModal && (
        <div className="modal-overlay">
          <div className="modal post-modal">
            <div className="modal-header">
              <h3>📝 Create New Post</h3>
              <button onClick={() => setShowPostModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form className="post-form">
                <div className="form-group">
                  <label>Platforms</label>
                  <div className="platform-checkboxes">
                    {['instagram', 'facebook', 'tiktok'].map((platform) => (
                      <label key={platform} className="platform-checkbox">
                        <input type="checkbox" defaultChecked={platform === 'instagram'} />
                        <span>{getPlatformIcon(platform)} {platform}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Content</label>
                  <textarea 
                    rows="4" 
                    placeholder="What's on your mind? Share your latest products and updates..."
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Hashtags</label>
                  <input type="text" placeholder="#HomeDecor #Furniture #InteriorDesign" />
                </div>

                <div className="form-group">
                  <label>Add Products (Shopping Tags)</label>
                  <div className="product-tags">
                    <button type="button" className="btn-secondary">
                      ➕ Add Product Tag
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Media</label>
                  <div className="media-upload">
                    <input type="file" accept="image/*,video/*" multiple />
                    <div className="upload-area">
                      <span>📷</span>
                      <p>Click to upload or drag and drop</p>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Schedule</label>
                    <select>
                      <option value="now">Post Now</option>
                      <option value="schedule">Schedule for Later</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date & Time</label>
                    <input type="datetime-local" />
                  </div>
                </div>

                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => setShowPostModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.success('Post created successfully!');
                      setShowPostModal(false);
                    }}
                  >
                    Create Post
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSocial;
