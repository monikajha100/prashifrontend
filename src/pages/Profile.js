import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { addressesAPI, ordersAPI, wishlistAPI, cashbackAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FaEdit, FaTrash, FaPlus, FaMapMarkerAlt, FaLock, FaUser, FaHome, FaBuilding, FaEllipsisH, FaClipboardList, FaHeart, FaGift, FaCheckCircle, FaClock, FaTruck, FaTimesCircle, FaRupeeSign } from 'react-icons/fa';
import toast from 'react-hot-toast';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile, changePassword, isUpdatingProfile, isChangingPassword } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'addresses', 'orders', 'wishlist', 'cashback', 'password'
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [addressForm, setAddressForm] = useState({
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    address_type: 'home',
    is_default: false
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Load user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || ''
      });
    }
  }, [user]);

  // Fetch addresses
  const { data: addresses = [], isLoading: addressesLoading } = useQuery(
    'addresses',
    async () => {
      try {
        const response = await addressesAPI.getAll();
        return response.data || [];
      } catch (error) {
        console.error('Error fetching addresses:', error);
        return [];
      }
    },
    {
      enabled: activeTab === 'addresses',
      refetchOnWindowFocus: false
    }
  );

  // Create address mutation
  const createAddressMutation = useMutation(
    (data) => addressesAPI.create(data),
    {
      onSuccess: (response) => {
        console.log('✅ Address created successfully:', response);
        queryClient.invalidateQueries('addresses');
        queryClient.invalidateQueries('userProfile');
        setIsAddingAddress(false);
        resetAddressForm();
        toast.success('Address added successfully!');
      },
      onError: (error) => {
        console.error('❌ Address creation error:', error);
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.errors?.[0]?.msg || 
                            'Failed to add address. Please check all required fields.';
        toast.error(errorMessage);
      }
    }
  );

  // Update address mutation
  const updateAddressMutation = useMutation(
    ({ id, data }) => addressesAPI.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('addresses');
        queryClient.invalidateQueries('userProfile');
        setEditingAddressId(null);
        setIsAddingAddress(false);
        resetAddressForm();
        toast.success('Address updated successfully!');
      },
      onError: (error) => {
        console.error('❌ Address update error:', error);
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.errors?.[0]?.msg || 
                            'Failed to update address. Please check all required fields.';
        toast.error(errorMessage);
      }
    }
  );

  // Delete address mutation
  const deleteAddressMutation = useMutation(
    (id) => addressesAPI.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('addresses');
        queryClient.invalidateQueries('userProfile');
        toast.success('Address deleted successfully!');
      },
      onError: (error) => {
        console.error('❌ Address delete error:', error);
        const errorMessage = error.response?.data?.message || 'Failed to delete address';
        toast.error(errorMessage);
      }
    }
  );

  // Set default address mutation
  const setDefaultAddressMutation = useMutation(
    (id) => addressesAPI.setDefault(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('addresses');
        queryClient.invalidateQueries('userProfile');
        toast.success('Default address updated!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to set default address');
      }
    }
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm({
      ...addressForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    console.log('📤 Submitting profile update:', formData);
    try {
      const response = await updateProfile(formData);
      console.log('✅ Profile update response:', response);
      // Update formData with the response to ensure it reflects changes
      if (response?.data?.user) {
        const updatedUser = response.data.user;
        const newFormData = {
          name: updatedUser.name || '',
          phone: updatedUser.phone || '',
          address: updatedUser.address || '',
          city: updatedUser.city || '',
          state: updatedUser.state || '',
          pincode: updatedUser.pincode || ''
        };
        setFormData(newFormData);
        console.log('🔄 Form data updated:', newFormData);
      }
      setIsEditing(false);
    } catch (error) {
      // Error is handled in AuthContext
      console.error('❌ Profile update error:', error);
      console.error('Error response:', error.response?.data);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    console.log('📤 Submitting address form:', addressForm);
    
    // Prepare data
    const data = {
      ...addressForm,
      phone: addressForm.phone || user?.phone || null // Send null instead of empty string
    };
    
    // Remove empty strings and convert to null for optional fields
    Object.keys(data).forEach(key => {
      if (data[key] === '') {
        if (['address_line2', 'landmark'].includes(key)) {
          data[key] = null;
        } else if (key !== 'full_name' && key !== 'address_line1' && key !== 'city' && key !== 'state' && key !== 'pincode') {
          // Keep required fields, but others can be null
        }
      }
    });
    
    console.log('📤 Final address data:', data);
    
    try {
      if (editingAddressId) {
        await updateAddressMutation.mutateAsync({ id: editingAddressId, data });
      } else {
        await createAddressMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error('❌ Address submit error:', error);
      // Error is handled in mutation
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.new_password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordForm.current_password,
        newPassword: passwordForm.new_password
      });
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setShowPasswordForm(false);
    } catch (error) {
      // Error is handled in AuthContext
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      full_name: user?.name || '',
      phone: user?.phone || '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      pincode: '',
      landmark: '',
      address_type: 'home',
      is_default: addresses.length === 0
    });
  };

  const handleEditAddress = (address) => {
    setEditingAddressId(address.id);
    setAddressForm({
      full_name: address.full_name || '',
      phone: address.phone || '',
      address_line1: address.address_line1 || '',
      address_line2: address.address_line2 || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || '',
      landmark: address.landmark || '',
      address_type: address.address_type || 'home',
      is_default: address.is_default || false
    });
    setIsAddingAddress(true);
  };

  const handleDeleteAddress = (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      deleteAddressMutation.mutate(id);
    }
  };

  const handleCancelAddress = () => {
    setIsAddingAddress(false);
    setEditingAddressId(null);
    resetAddressForm();
  };

  const getAddressTypeIcon = (type) => {
    switch (type) {
      case 'home': return <FaHome />;
      case 'work': return <FaBuilding />;
      default: return <FaMapMarkerAlt />;
    }
  };

  const getAddressTypeLabel = (type) => {
    switch (type) {
      case 'home': return 'Home';
      case 'work': return 'Work';
      default: return 'Other';
    }
  };

  // Orders Tab Component
  const OrdersTabContent = () => {
    const { data: orders, isLoading: ordersLoading } = useQuery(
      'userOrders',
      async () => {
        try {
          const response = await ordersAPI.getMyOrders();
          const ordersData = response?.data || response;
          return Array.isArray(ordersData) ? ordersData : [];
        } catch (err) {
          console.error('Error fetching orders:', err);
          return [];
        }
      },
      {
        enabled: activeTab === 'orders',
        refetchOnWindowFocus: false
      }
    );

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      const options = { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };
      return date.toLocaleDateString('en-IN', options);
    };

    const getStatusBadge = (status) => {
      const statusLower = status?.toLowerCase() || 'pending';
      switch (statusLower) {
        case 'delivered':
          return { label: 'Delivered', class: 'delivered', icon: FaCheckCircle };
        case 'shipped':
        case 'out_for_delivery':
          return { label: 'Shipped', class: 'shipped', icon: FaTruck };
        case 'processing':
        case 'confirmed':
          return { label: 'Processing', class: 'processing', icon: FaClock };
        case 'cancelled':
        case 'canceled':
          return { label: 'Cancelled', class: 'cancelled', icon: FaTimesCircle };
        default:
          return { label: 'Pending', class: 'pending', icon: FaClock };
      }
    };

    if (ordersLoading) {
      return (
        <div className="profile-content">
          <div className="loading-container">
            <p>Loading orders...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="profile-content">
        <div className="profile-section">
          <div className="section-header">
            <h2>My Orders</h2>
            <Link to="/orders" className="btn btn-secondary btn-icon">
              <FaClipboardList /> View All Orders
            </Link>
          </div>

          {orders && orders.length > 0 ? (
            <div className="orders-list-profile">
              {orders.slice(0, 5).map((order) => {
                const statusBadge = getStatusBadge(order.status || order.order_status);
                const StatusIcon = statusBadge.icon;
                const itemsSummary = order.items_summary || 
                  (order.items && order.items.length > 0 
                    ? order.items.map(item => `${item.product_name || item.name} (Qty: ${item.quantity || 1})`).join(', ')
                    : 'No items');

                return (
                  <motion.div
                    key={order.id}
                    className="order-card-profile"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="order-header-profile">
                      <div className="order-info-profile">
                        <h3>Order #{order.order_number || order.id}</h3>
                        <p className="order-date-profile">
                          <FaClock style={{ marginRight: '5px', fontSize: '0.85rem' }} />
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className={`status-badge-profile ${statusBadge.class}`}>
                        <StatusIcon style={{ marginRight: '5px' }} />
                        {statusBadge.label}
                      </div>
                    </div>
                    <div className="order-body-profile">
                      <p className="order-items-profile">
                        <strong>Items:</strong> {itemsSummary}
                      </p>
                      <div className="order-total-profile">
                        <FaRupeeSign style={{ fontSize: '0.9rem' }} />
                        <strong>{order.total_amount || order.total || 0}</strong>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {orders.length > 5 && (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <Link to="/orders" className="btn btn-primary">
                    View All {orders.length} Orders
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="no-addresses">
              <FaClipboardList className="no-addresses-icon" style={{ color: '#D4AF37' }} />
              <h2>No Orders Yet</h2>
              <p>You haven't placed any orders yet. Start shopping to see your orders here.</p>
              <Link to="/products" className="btn btn-primary">
                <FaPlus /> Start Shopping
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Wishlist Tab Component
  const WishlistTabContent = () => {
    const { data: wishlistItems = [], isLoading: wishlistLoading } = useQuery(
      'wishlist',
      async () => {
        try {
          const response = await wishlistAPI.getAll();
          return response.data || [];
        } catch (err) {
          console.error('Error fetching wishlist:', err);
          return [];
        }
      },
      {
        enabled: activeTab === 'wishlist',
        refetchOnWindowFocus: false
      }
    );

    const removeFromWishlistMutation = useMutation(
      (productId) => wishlistAPI.remove(productId),
      {
        onSuccess: () => {
          queryClient.invalidateQueries('wishlist');
          toast.success('Removed from wishlist');
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || 'Failed to remove from wishlist');
        }
      }
    );

    const handleRemove = (productId) => {
      if (window.confirm('Remove this item from wishlist?')) {
        removeFromWishlistMutation.mutate(productId);
      }
    };

    if (wishlistLoading) {
      return (
        <div className="profile-content">
          <div className="loading-container">
            <p>Loading wishlist...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="profile-content">
        <div className="profile-section">
          <div className="section-header">
            <h2>My Wishlist</h2>
            {wishlistItems.length > 0 && (
              <span className="wishlist-count">{wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}</span>
            )}
          </div>

          {wishlistItems.length > 0 ? (
            <div className="wishlist-grid">
              {wishlistItems.map((item) => (
                <motion.div
                  key={item.id}
                  className="wishlist-item-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link to={`/products/${item.product_slug || item.product_id}`} className="wishlist-item-link">
                    <div className="wishlist-item-image">
                      <img 
                        src={item.product_image || '/placeholder-product.jpg'} 
                        alt={item.product_name}
                        onError={(e) => {
                          e.target.src = '/placeholder-product.jpg';
                        }}
                      />
                      <button
                        className="wishlist-remove-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemove(item.product_id);
                        }}
                        title="Remove from wishlist"
                      >
                        <FaTrash />
                      </button>
                    </div>
                    <div className="wishlist-item-info">
                      <h3>{item.product_name}</h3>
                      <div className="wishlist-item-price">
                        <span className="price">₹{item.product_price}</span>
                        {item.product_original_price && item.product_original_price > item.product_price && (
                          <span className="original-price">₹{item.product_original_price}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="no-addresses">
              <FaHeart className="no-addresses-icon" style={{ color: '#ff69b4' }} />
              <h2>Your Wishlist is Empty</h2>
              <p>Add items you love to your wishlist and keep track of them.</p>
              <Link to="/products" className="btn btn-primary">
                <FaPlus /> Explore Products
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Cashback Tab Component
  const CashbackTabContent = () => {
    const { data: cashbackData, isLoading: cashbackLoading } = useQuery(
      'cashbackBalance',
      async () => {
        try {
          const response = await cashbackAPI.getBalance();
          return response.data || { balance: 0, history: [] };
        } catch (err) {
          console.error('Error fetching cashback:', err);
          return { balance: 0, history: [] };
        }
      },
      {
        enabled: activeTab === 'cashback',
        refetchOnWindowFocus: false
      }
    );

    const { data: offers = [], isLoading: offersLoading } = useQuery(
      'cashbackOffers',
      async () => {
        try {
          const response = await cashbackAPI.getOffers();
          return response.data || [];
        } catch (err) {
          console.error('Error fetching offers:', err);
          return [];
        }
      },
      {
        enabled: activeTab === 'cashback',
        refetchOnWindowFocus: false
      }
    );

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    };

    if (cashbackLoading || offersLoading) {
      return (
        <div className="profile-content">
          <div className="loading-container">
            <p>Loading cashback & offers...</p>
          </div>
        </div>
      );
    }

    const balance = cashbackData?.balance || 0;
    const history = cashbackData?.history || [];

    return (
      <div className="profile-content">
        <div className="profile-section">
          <div className="section-header">
            <h2>Cashback & Offers</h2>
          </div>

          {/* Cashback Balance Card */}
          <div className="cashback-balance-card">
            <div className="cashback-balance-header">
              <FaGift style={{ fontSize: '2rem', color: 'white' }} />
              <div>
                <h3>Available Cashback</h3>
                <p className="cashback-amount">₹{balance.toFixed(2)}</p>
              </div>
            </div>
            <p className="cashback-info">Use your cashback on your next purchase!</p>
          </div>

          {/* Available Offers */}
          {offers.length > 0 && (
            <div className="offers-section">
              <h3 className="offers-title">Available Offers</h3>
              <div className="offers-grid">
                {offers.map((offer) => (
                  <motion.div
                    key={offer.id}
                    className="offer-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="offer-header">
                      <FaGift className="offer-icon" />
                      <h4>{offer.title}</h4>
                    </div>
                    <p className="offer-description">{offer.description}</p>
                    <div className="offer-details">
                      {offer.discount_percent && (
                        <span className="offer-badge">Get {offer.discount_percent}% Off</span>
                      )}
                      {offer.cashback_percent && (
                        <span className="offer-badge">Earn {offer.cashback_percent}% Cashback</span>
                      )}
                      {offer.min_purchase_amount > 0 && (
                        <p className="offer-min">Min. Purchase: ₹{offer.min_purchase_amount}</p>
                      )}
                      {offer.coupon_code && (
                        <div className="offer-coupon">
                          <strong>Code: </strong>
                          <code>{offer.coupon_code}</code>
                        </div>
                      )}
                    </div>
                    <p className="offer-validity">
                      Valid until: {formatDate(offer.valid_to)}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Cashback History */}
          {history.length > 0 && (
            <div className="cashback-history-section">
              <h3 className="history-title">Cashback History</h3>
              <div className="cashback-history-list">
                {history.map((item) => (
                  <div key={item.id} className="cashback-history-item">
                    <div className="history-item-main">
                      <span className="history-amount">{item.amount > 0 ? '+' : ''}₹{Math.abs(item.amount).toFixed(2)}</span>
                      <span className={`history-status status-${item.status}`}>{item.status}</span>
                    </div>
                    <p className="history-description">{item.description || 'Cashback transaction'}</p>
                    {item.order_number && (
                      <p className="history-order">Order: #{item.order_number}</p>
                    )}
                    <p className="history-date">{formatDate(item.created_at)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {offers.length === 0 && history.length === 0 && balance === 0 && (
            <div className="no-addresses">
              <FaGift className="no-addresses-icon" style={{ color: '#D4AF37' }} />
              <h2>No Cashback or Offers Available</h2>
              <p>Check back later for exciting cashback and special offers!</p>
              <Link to="/products" className="btn btn-primary">
                <FaPlus /> Discover Deals
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="loading-container">
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Helmet>
        <title>My Profile - Praashibysupal</title>
      </Helmet>

      <div className="container">
        <motion.div 
          className="profile-container"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="page-title">
            <FaUser className="title-icon" />
            My Profile
          </h1>
          
          {/* Tabs */}
          <div className="profile-tabs">
            <button
              className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <FaUser /> Profile
            </button>
            <button
              className={`tab-btn ${activeTab === 'addresses' ? 'active' : ''}`}
              onClick={() => setActiveTab('addresses')}
            >
              <FaMapMarkerAlt /> Addresses
            </button>
            <button
              className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <FaClipboardList /> My Orders
            </button>
            <button
              className={`tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
              onClick={() => setActiveTab('wishlist')}
            >
              <FaHeart /> Wishlist
            </button>
            <button
              className={`tab-btn ${activeTab === 'cashback' ? 'active' : ''}`}
              onClick={() => setActiveTab('cashback')}
            >
              <FaGift /> Cashback/Offers
            </button>
            <button
              className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              <FaLock /> Change Password
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
          <div className="profile-content">
              <div className="profile-section">
                <div className="section-header">
              <h2>Personal Information</h2>
                  {!isEditing && (
                    <button 
                      className="btn btn-primary btn-icon"
                      onClick={() => setIsEditing(true)}
                    >
                      <FaEdit /> Edit Profile
                    </button>
                  )}
                </div>
              
              {isEditing ? (
                  <form onSubmit={handleProfileSubmit} className="profile-form">
                  <div className="form-group">
                      <label htmlFor="name" className="form-label">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="form-input"
                      required
                        placeholder="Enter your full name"
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
                        placeholder="Enter your phone number"
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
                        placeholder="Enter your address"
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
                          placeholder="City"
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
                          placeholder="State"
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
                          placeholder="Pincode"
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
                        onClick={() => {
                          setIsEditing(false);
                          // Reset form data
                          if (user) {
                            setFormData({
                              name: user.name || '',
                              phone: user.phone || '',
                              address: user.address || '',
                              city: user.city || '',
                              state: user.state || '',
                              pincode: user.pincode || ''
                            });
                          }
                        }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-details">
                  <div className="detail-item">
                      <strong>Name:</strong>
                      <span>{user.name || 'Not provided'}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Email:</strong>
                      <span>{user.email}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Phone:</strong>
                      <span>{user.phone || 'Not provided'}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Address:</strong>
                      <span>{user.address || 'Not provided'}</span>
                    </div>
                    <div className="detail-item">
                      <strong>City:</strong>
                      <span>{user.city ? user.city : 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                      <strong>State:</strong>
                      <span>{user.state ? user.state : 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                      <strong>Pincode:</strong>
                      <span>{user.pincode ? user.pincode : 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                      <strong>Member Since:</strong>
                      <span>{new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="profile-content">
              <div className="profile-section">
                <div className="section-header">
                  <h2>My Addresses</h2>
                  {!isAddingAddress && (
                    <button 
                      className="btn btn-primary btn-icon"
                      onClick={() => {
                        resetAddressForm();
                        setIsAddingAddress(true);
                      }}
                    >
                      <FaPlus /> Add Address
                    </button>
                  )}
                </div>

                {isAddingAddress && (
                  <form onSubmit={handleAddressSubmit} className="address-form">
                    <div className="form-group">
                      <label htmlFor="full_name" className="form-label">Full Name *</label>
                      <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        value={addressForm.full_name}
                        onChange={handleAddressChange}
                        className="form-input"
                        required
                        placeholder="Enter full name"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="address_phone" className="form-label">Phone Number *</label>
                      <input
                        type="tel"
                        id="address_phone"
                        name="phone"
                        value={addressForm.phone}
                        onChange={handleAddressChange}
                        className="form-input"
                        required
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="address_line1" className="form-label">Address Line 1 *</label>
                      <input
                        type="text"
                        id="address_line1"
                        name="address_line1"
                        value={addressForm.address_line1}
                        onChange={handleAddressChange}
                        className="form-input"
                        required
                        placeholder="House/Flat No., Building Name"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="address_line2" className="form-label">Address Line 2</label>
                      <input
                        type="text"
                        id="address_line2"
                        name="address_line2"
                        value={addressForm.address_line2}
                        onChange={handleAddressChange}
                        className="form-input"
                        placeholder="Street, Area, Colony"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="address_city" className="form-label">City *</label>
                        <input
                          type="text"
                          id="address_city"
                          name="city"
                          value={addressForm.city}
                          onChange={handleAddressChange}
                          className="form-input"
                          required
                          placeholder="City"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="address_state" className="form-label">State *</label>
                        <input
                          type="text"
                          id="address_state"
                          name="state"
                          value={addressForm.state}
                          onChange={handleAddressChange}
                          className="form-input"
                          required
                          placeholder="State"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="address_pincode" className="form-label">Pincode *</label>
                        <input
                          type="text"
                          id="address_pincode"
                          name="pincode"
                          value={addressForm.pincode}
                          onChange={handleAddressChange}
                          className="form-input"
                          required
                          placeholder="Pincode"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="landmark" className="form-label">Landmark</label>
                      <input
                        type="text"
                        id="landmark"
                        name="landmark"
                        value={addressForm.landmark}
                        onChange={handleAddressChange}
                        className="form-input"
                        placeholder="Nearby landmark"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="address_type" className="form-label">Address Type</label>
                        <select
                          id="address_type"
                          name="address_type"
                          value={addressForm.address_type}
                          onChange={handleAddressChange}
                          className="form-input"
                        >
                          <option value="home">Home</option>
                          <option value="work">Work</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            name="is_default"
                            checked={addressForm.is_default}
                            onChange={handleAddressChange}
                          />
                          <span>Set as default address</span>
                        </label>
                      </div>
                    </div>

                    <div className="form-actions">
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={createAddressMutation.isLoading || updateAddressMutation.isLoading}
                      >
                        {createAddressMutation.isLoading || updateAddressMutation.isLoading 
                          ? 'Saving...' 
                          : editingAddressId ? 'Update Address' : 'Add Address'}
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={handleCancelAddress}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {addressesLoading ? (
                  <div className="loading-container">
                    <p>Loading addresses...</p>
                  </div>
                ) : addresses.length === 0 && !isAddingAddress ? (
                  <div className="empty-state">
                    <FaMapMarkerAlt className="empty-icon" />
                    <p>No addresses saved yet</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => {
                        resetAddressForm();
                        setIsAddingAddress(true);
                      }}
                    >
                      <FaPlus /> Add Your First Address
                    </button>
                  </div>
                ) : (
                  <div className="addresses-list">
                    {addresses.map((address) => (
                      <div key={address.id} className={`address-card ${address.is_default ? 'default' : ''}`}>
                        {address.is_default && <div className="default-badge">Default</div>}
                        <div className="address-header">
                          <div className="address-type">
                            {getAddressTypeIcon(address.address_type)}
                            <span>{getAddressTypeLabel(address.address_type)}</span>
                          </div>
                          <div className="address-actions">
                            {!address.is_default && (
                              <button
                                className="btn-icon-small"
                                onClick={() => setDefaultAddressMutation.mutate(address.id)}
                                title="Set as default"
                              >
                                Set Default
                              </button>
                            )}
                            <button
                              className="btn-icon-small"
                              onClick={() => handleEditAddress(address)}
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn-icon-small danger"
                              onClick={() => handleDeleteAddress(address.id)}
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                        <div className="address-body">
                          <p className="address-name">{address.full_name}</p>
                          <p className="address-phone">{address.phone}</p>
                          <p className="address-lines">
                            {address.address_line1}
                            {address.address_line2 && `, ${address.address_line2}`}
                          </p>
                          <p className="address-location">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                          {address.landmark && (
                            <p className="address-landmark">Landmark: {address.landmark}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* My Orders Tab */}
          {activeTab === 'orders' && (
            <OrdersTabContent />
          )}

          {/* Wishlist Tab */}
          {activeTab === 'wishlist' && (
            <WishlistTabContent />
          )}

          {/* Cashback/Offers Tab */}
          {activeTab === 'cashback' && (
            <CashbackTabContent />
          )}

          {/* Change Password Tab */}
          {activeTab === 'password' && (
            <div className="profile-content">
              <div className="profile-section">
                <div className="section-header">
                  <h2>Change Password</h2>
                </div>

                {!showPasswordForm ? (
                  <div className="password-info">
                    <FaLock className="info-icon" />
                    <p>Keep your account secure by changing your password regularly.</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowPasswordForm(true)}
                    >
                      Change Password
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handlePasswordSubmit} className="password-form">
                    <div className="form-group">
                      <label htmlFor="current_password" className="form-label">Current Password *</label>
                      <input
                        type="password"
                        id="current_password"
                        name="current_password"
                        value={passwordForm.current_password}
                        onChange={handlePasswordChange}
                        className="form-input"
                        required
                        placeholder="Enter current password"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="new_password" className="form-label">New Password *</label>
                      <input
                        type="password"
                        id="new_password"
                        name="new_password"
                        value={passwordForm.new_password}
                        onChange={handlePasswordChange}
                        className="form-input"
                        required
                        minLength="6"
                        placeholder="Enter new password (min. 6 characters)"
                      />
                      <small className="form-hint">Password must be at least 6 characters long</small>
                    </div>

                    <div className="form-group">
                      <label htmlFor="confirm_password" className="form-label">Confirm New Password *</label>
                      <input
                        type="password"
                        id="confirm_password"
                        name="confirm_password"
                        value={passwordForm.confirm_password}
                        onChange={handlePasswordChange}
                        className="form-input"
                        required
                        minLength="6"
                        placeholder="Confirm new password"
                      />
                  </div>

                    <div className="form-actions">
                  <button 
                        type="submit" 
                    className="btn btn-primary"
                        disabled={isChangingPassword}
                      >
                        {isChangingPassword ? 'Changing...' : 'Change Password'}
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPasswordForm({
                            current_password: '',
                            new_password: '',
                            confirm_password: ''
                          });
                        }}
                  >
                        Cancel
                  </button>
                </div>
                  </form>
              )}
            </div>
          </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
