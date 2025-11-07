import axios from 'axios';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Convert relative asset paths (e.g., /uploads/...) to absolute URLs against the API origin
// Leaves fully qualified URLs (http/https) untouched
export const toAbsoluteImageUrl = (pathOrUrl) => {
  if (!pathOrUrl) return pathOrUrl;
  const asString = String(pathOrUrl).trim();

  // Already absolute or non-HTTP assets (data/blob)
  if (/^https?:\/\//i.test(asString)) return asString;
  if (/^(data:|blob:)/i.test(asString)) return asString;

  // Only rewrite backend-hosted assets that live under /uploads
  const isUploadsAsset = /^\/?uploads(\/|$)/i.test(asString);
  if (!isUploadsAsset) {
    // Frontend public assets should remain relative to the frontend origin
    return asString.startsWith('/') ? asString : `/${asString}`;
  }

  const assetBase = API_BASE_URL.replace(/\/api$/i, '');
  const normalizedPath = asString.startsWith('/') ? asString : `/${asString}`;
  return `${assetBase}${normalizedPath}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Check for both regular token and admin token
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const isAdminRoute = window.location.pathname.startsWith('/admin');

    // In development, avoid auto logout to prevent losing context during CRUD retries
    const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

    if (status === 401) {
      const message = error.response?.data?.message || '';
      const tokenInvalid = message.toLowerCase().includes('invalid') || 
                          message.toLowerCase().includes('expired') ||
                          message.toLowerCase().includes('token');

      // Only auto-logout on token errors, not on other 401 errors (like invalid credentials)
      // and only in production or if explicitly a token error
      if (tokenInvalid) {
        if (isAdminRoute) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          if (!isDev) {
          window.location.href = '/admin/login';
          }
        } else {
          localStorage.removeItem('token');
          // Don't redirect immediately - let AuthContext handle it
          console.warn('Token invalid, will be cleared by AuthContext');
        }
      }
    }

    // Do not force logout on 403; let pages show error UI
    return Promise.reject(error);
  }
);

// API endpoints
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (identifier) => {
    const isNumeric = /^\d+$/.test(String(identifier));
    return isNumeric
      ? api.get(`/products/${identifier}`)
      : api.get(`/products/slug/${identifier}`);
  },
  getFeatured: (limit = 8) => api.get(`/products/featured/list?limit=${limit}`),
  getNecklaces: (limit = 20) => api.get(`/products/category/necklaces?limit=${limit}`),
  getEarrings: (limit = 10) => api.get(`/products/category/earrings?limit=${limit}`),
  getByCategory: (categorySlug, params) => api.get(`/products/category/${categorySlug}`, { params }),
  search: (query, params) => api.get(`/products/search/${query}`, { params }),
  create: (productData) => api.post('/admin/products', productData),
  update: (productId, productData) => api.put(`/admin/products/${productId}`, productData),
  delete: (productId) => api.delete(`/admin/products/${productId}`),
};

export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getAllAdmin: () => api.get('/categories/admin'),
  getBySlug: (slug) => api.get(`/categories/${slug}`),
  create: (categoryData) => api.post('/admin/categories', categoryData),
  createCategory: (categoryData) => api.post('/admin/categories', categoryData),
  update: (categoryId, categoryData) => api.put(`/admin/categories/${categoryId}`, categoryData),
  updateCategory: (categoryId, categoryData) => api.put(`/admin/categories/${categoryId}`, categoryData),
  delete: (categoryId) => api.delete(`/admin/categories/${categoryId}`),
  deleteCategory: (categoryId) => api.delete(`/admin/categories/${categoryId}`),
};

export const subcategoriesAPI = {
  getAll: () => api.get('/subcategories'),
  getAllAdmin: (params) => api.get('/subcategories/admin/all', { params }),
  getByCategory: (categorySlug) => api.get(`/subcategories/category/${categorySlug}`),
  create: (subcategoryData) => api.post('/admin/subcategories', subcategoryData),
  update: (subcategoryId, subcategoryData) => api.put(`/admin/subcategories/${subcategoryId}`, subcategoryData),
  delete: (subcategoryId) => api.delete(`/admin/subcategories/${subcategoryId}`),
};

export const bannersAPI = {
  getAll: () => api.get('/banners'),
  getActive: () => api.get('/banners/active'),
  getById: (id) => api.get(`/banners/${id}`),
  create: (bannerData) => api.post('/admin/banners', bannerData),
  update: (bannerId, bannerData) => api.put(`/admin/banners/${bannerId}`, bannerData),
  delete: (bannerId) => api.delete(`/admin/banners/${bannerId}`),
};

export const settingsAPI = {
  getAll: () => api.get('/settings'),
  update: (settingKey, value) => api.put(`/admin/settings/${settingKey}`, { value }),
};

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
};

export const addressesAPI = {
  getAll: () => api.get('/addresses'),
  getById: (id) => api.get(`/addresses/${id}`),
  create: (addressData) => api.post('/addresses', addressData),
  update: (id, addressData) => api.put(`/addresses/${id}`, addressData),
  delete: (id) => api.delete(`/addresses/${id}`),
  setDefault: (id) => api.put(`/addresses/${id}/set-default`),
};

export const wishlistAPI = {
  getAll: () => api.get('/wishlist'),
  add: (productId) => api.post('/wishlist', { product_id: productId }),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
  check: (productId) => api.get(`/wishlist/check/${productId}`),
  clear: () => api.delete('/wishlist'),
};

export const promotionalOffersAPI = {
  getAll: () => api.get('/promotional-offers'),
  getById: (id) => api.get(`/promotional-offers/${id}`),
  getAllAdmin: (params) => api.get('/admin/promotional-offers/admin/all', { params }),
  create: (offerData) => api.post('/admin/promotional-offers', offerData),
  update: (id, offerData) => api.put(`/admin/promotional-offers/${id}`, offerData),
  delete: (id) => api.delete(`/admin/promotional-offers/${id}`),
};

export const cashbackAPI = {
  getBalance: () => api.get('/cashback/balance'),
  getOffers: () => api.get('/cashback/offers'),
  apply: (data) => api.post('/cashback/apply', data),
};

export const ordersAPI = {
  create: (orderData) => api.post('/orders', orderData),
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  getById: (orderId) => api.get(`/orders/${orderId}`),
  getOrderDetails: (orderId) => api.get(`/orders/${orderId}`), // Changed from /orders/:id/items to /orders/:id
  updateStatus: (orderId, statusData) => api.put(`/orders/${orderId}/status`, statusData),
  updatePaymentStatus: (orderId, paymentData) => api.put(`/orders/${orderId}/payment-status`, paymentData),
  addTracking: (orderId, trackingData) => api.put(`/orders/${orderId}/tracking`, trackingData),
  getAllOrders: async (params) => {
    console.log('🔶 ordersAPI.getAllOrders called with params:', params);
    try {
      const response = await api.get('/orders/admin/all', { params });
      console.log('🔶 ordersAPI.getAllOrders response.data:', response.data);
      return response.data;
    } catch (error) {
      console.error('🔶 ordersAPI.getAllOrders error:', error);
      throw error;
    }
  },
};

export const contactAPI = {
  submit: (messageData) => api.post('/contact', messageData),
  subscribeNewsletter: (email) => api.post('/contact/newsletter', { email }),
  // Admin endpoints
  getAllMessages: (params) => api.get('/contact/admin/messages', { params }),
  getMessageById: (id) => api.get(`/contact/admin/messages/${id}`),
  getStatistics: () => api.get('/contact/admin/statistics'),
  markAsRead: (id) => api.put(`/contact/admin/messages/${id}/read`),
  updateStatus: (id, status) => api.put(`/contact/admin/messages/${id}/status`, { status }),
  updatePriority: (id, priority) => api.put(`/contact/admin/messages/${id}/priority`, { priority }),
  addNotes: (id, notes) => api.put(`/contact/admin/messages/${id}/notes`, { notes }),
  deleteMessage: (id) => api.delete(`/contact/admin/messages/${id}`)
};

export const usersAPI = {
  getAllUsers: (params) => api.get('/users', { params }),
  getUserById: (userId) => api.get(`/users/${userId}`),
  createUser: (userData) => api.post('/users', userData),
  updateUserStatus: (userId, statusData) => api.put(`/users/${userId}/status`, statusData),
  getUserOrders: (userId, params) => api.get(`/users/${userId}/orders`, { params }),
};

export const inventoryAPI = {
  // Stock Levels
  getStockLevels: (params) => api.get('/inventory/stock-levels', { params }),
  updateStockLevel: (productId, stockData) => api.put(`/inventory/stock-levels/${productId}`, stockData),
  
  // Stock Movements
  getStockMovements: (params) => api.get('/inventory/stock-movements', { params }),
  createStockMovement: (movementData) => api.post('/inventory/stock-movements', movementData),
  
  // Stock Adjustments
  getStockAdjustments: (params) => api.get('/inventory/stock-adjustments', { params }),
  createStockAdjustment: (adjustmentData) => api.post('/inventory/stock-adjustments', adjustmentData),
  approveStockAdjustment: (adjustmentId, approvalData) => api.put(`/inventory/stock-adjustments/${adjustmentId}/approve`, approvalData),
  
  // Low Stock Alerts
  getLowStockAlerts: (params) => api.get('/inventory/low-stock-alerts', { params }),
  resolveLowStockAlert: (alertId, resolveData) => api.put(`/inventory/low-stock-alerts/${alertId}/resolve`, resolveData),
  
  // Reports
  getInventorySummary: (params) => api.get('/inventory/reports/summary', { params }),
};

export const invoicesAPI = {
  getAllInvoices: async (params) => {
    console.log('🔶 invoicesAPI.getAllInvoices called with params:', params);
    try {
      const response = await api.get('/invoices', { params });
      console.log('🔶 invoicesAPI.getAllInvoices response:', response);
      console.log('🔶 invoicesAPI.getAllInvoices response.data:', response.data);
      return response.data;
    } catch (error) {
      console.error('🔶 invoicesAPI.getAllInvoices error:', error);
      throw error;
    }
  },
  getMyInvoices: (params) => api.get('/invoices/my-invoices', { params }),
  getInvoiceByOrderId: (orderId) => api.get(`/invoices/order/${orderId}`),
  getInvoiceDetails: (invoiceId) => api.get(`/invoices/${invoiceId}`),
  createInvoice: (orderId) => api.post(`/invoices/create/${orderId}`),
  sendInvoiceEmail: (invoiceId) => api.post(`/invoices/${invoiceId}/send-email`),
  updatePaymentStatus: (invoiceId, paymentData) => api.put(`/invoices/${invoiceId}/payment-status`, paymentData),
  getCompanySettings: () => api.get('/invoices/admin/company-settings'),
  updateCompanySettings: (settings) => api.put('/invoices/admin/company-settings', settings)
};

export const paymentsAPI = {
  getPaymentSettings: () => api.get('/payments/settings'),
  createRazorpayOrder: (orderData) => api.post('/payments/create-order', orderData),
  verifyPayment: (paymentData) => api.post('/payments/verify-payment', paymentData),
  updatePaymentSettings: (settings) => api.put('/payments/settings', settings)
};

export const customersAPI = {
  getAllCustomers: async (params) => {
    console.log('🔶 customersAPI.getAllCustomers called with params:', params);
    try {
      const response = await api.get('/customers', { params });
      console.log('🔶 customersAPI.getAllCustomers response.data:', response.data);
      return response.data;
    } catch (error) {
      console.error('🔶 customersAPI.getAllCustomers error:', error);
      throw error;
    }
  },
  getCustomerDetails: (customerId) => api.get(`/customers/${customerId}`)
};

export const partnersAPI = {
  // Public endpoint - apply for partnership
  apply: (formData) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    return api.post('/partners/apply', formData, config);
  },
  
  // Admin endpoints
  getAllApplications: () => api.get('/admin/partners/applications'),
  getApplicationById: (id) => api.get(`/admin/partners/applications/${id}`),
  updateApplicationStatus: (id, status) => api.put(`/admin/partners/applications/${id}/status`, { status }),
  deleteApplication: (id) => api.delete(`/admin/partners/applications/${id}`),
  getStats: () => api.get('/admin/partners/stats'),
  
  // Admin partner management
  createPartner: (formData) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    return api.post('/admin/partners/admin/create', formData, config);
  },
  updatePartner: (id, formData) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    return api.put(`/admin/partners/admin/${id}`, formData, config);
  },
};

export const contractsAPI = {
  getAllContracts: (params) => api.get('/contracts', { params }),
  getContractById: (contractId) => api.get(`/contracts/${contractId}`),
  createContract: (contractData) => api.post('/contracts', contractData),
  updateContract: (contractId, contractData) => api.put(`/contracts/${contractId}`, contractData),
  addSignature: (contractId, signatureData) => api.post(`/contracts/${contractId}/signature`, signatureData),
  sendReminder: (contractId) => api.post(`/contracts/${contractId}/reminder`),
  getTemplates: () => api.get('/contracts/templates/all'),
  createTemplate: (templateData) => api.post('/contracts/templates', templateData),
  getAnalytics: () => api.get('/contracts/analytics/overview')
};

export const couponsAPI = {
  getAllCoupons: (params) => api.get('/admin/coupons', { params }),
  getCouponById: (couponId) => api.get(`/admin/coupons/${couponId}`),
  createCoupon: (couponData) => api.post('/admin/coupons', couponData),
  updateCoupon: (couponId, couponData) => api.put(`/admin/coupons/${couponId}`, couponData),
  deleteCoupon: (couponId) => api.delete(`/admin/coupons/${couponId}`),
  toggleCouponStatus: (couponId) => api.patch(`/admin/coupons/${couponId}/toggle-status`),
  validateCoupon: (code, params) => api.get(`/coupons/validate/${code}`, { params }),
  applyCoupon: (couponData) => api.post('/coupons/apply', couponData),
  getUsageHistory: (params) => api.get('/admin/coupons/usage', { params }),
  getAnalytics: () => api.get('/admin/coupons/analytics/overview'),
  getCampaigns: () => api.get('/admin/coupons/campaigns/all'),
  createCampaign: (campaignData) => api.post('/admin/coupons/campaigns', campaignData)
};

export const storefrontAPI = {
  getSettings: () => api.get('/storefront/settings'),
  updateSettings: (settingsData) => api.put('/storefront/settings', settingsData),
  getTaxSettings: () => api.get('/storefront/tax-settings'),
  getThemes: () => api.get('/storefront/themes'),
  createTheme: (themeData) => api.post('/storefront/themes', themeData),
  getSections: () => api.get('/storefront/sections'),
  updateSection: (sectionId, sectionData) => api.put(`/storefront/sections/${sectionId}`, sectionData),
  createSection: (sectionData) => api.post('/storefront/sections', sectionData),
  getWidgets: () => api.get('/storefront/widgets'),
  updateWidget: (widgetId, widgetData) => api.put(`/storefront/widgets/${widgetId}`, widgetData),
  getAnalytics: (params) => api.get('/storefront/analytics', { params }),
  uploadAsset: (fileData) => api.post('/storefront/upload', fileData)
};

export const socialAPI = {
  getAccounts: () => api.get('/social/accounts'),
  connectAccount: (accountData) => api.post('/social/accounts/connect', accountData),
  disconnectAccount: (accountId) => api.delete(`/social/accounts/${accountId}`),
  getPosts: (params) => api.get('/social/posts', { params }),
  createPost: (postData) => api.post('/social/posts', postData),
  updatePost: (postId, postData) => api.put(`/social/posts/${postId}`, postData),
  getCampaigns: (params) => api.get('/social/campaigns', { params }),
  createCampaign: (campaignData) => api.post('/social/campaigns', campaignData),
  getInfluencers: (params) => api.get('/social/influencers', { params }),
  createInfluencer: (influencerData) => api.post('/social/influencers', influencerData),
  getAnalytics: (params) => api.get('/social/analytics', { params }),
  syncAccount: (accountId) => api.post(`/social/sync/${accountId}`),
  uploadMedia: (fileData) => api.post('/social/upload', fileData)
};

export const adminAPI = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),
  
  // Products
  getProducts: () => api.get('/admin/products'),
  getProduct: (productId) => api.get(`/admin/products/${productId}`),
  createProduct: (productData) => api.post('/admin/products', productData),
  updateProduct: (productId, productData) => api.put(`/admin/products/${productId}`, productData),
  deleteProduct: (productId) => api.delete(`/admin/products/${productId}`),
  deleteProductImage: (imageId) => api.delete(`/admin/products/images/${imageId}`),
  
  // Categories
  createCategory: (categoryData) => api.post('/admin/categories', categoryData),
  updateCategory: (categoryId, categoryData) => api.put(`/admin/categories/${categoryId}`, categoryData),
  deleteCategory: (categoryId) => api.delete(`/admin/categories/${categoryId}`),
  
  // Orders
  getAllOrders: (params) => api.get('/orders/admin/all', { params }),
  
  // Contracts
  ...contractsAPI,
  
  // Coupons
  ...couponsAPI,
  
  // Storefront
  ...storefrontAPI,
  
  // Social Media
  ...socialAPI,
  
  // Users
  getAllUsers: (params) => api.get('/users', { params }),
  getUserById: (userId) => api.get(`/users/${userId}`),
  createUser: (userData) => api.post('/users', userData),
  updateUserStatus: (userId, statusData) => api.put(`/users/${userId}/status`, statusData),
  getUserOrders: (userId, params) => api.get(`/users/${userId}/orders`, { params }),
  
  // Inventory
  ...inventoryAPI,
  
  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (settingsData) => api.put('/admin/settings', settingsData),
  
  // Partners
  ...partnersAPI,
};

export default api;
