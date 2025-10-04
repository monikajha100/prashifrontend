import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
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
      const tokenInvalid = message.toLowerCase().includes('invalid') || message.toLowerCase().includes('expired');

      if (!isDev && tokenInvalid) {
        if (isAdminRoute) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          window.location.href = '/admin/login';
        } else {
          localStorage.removeItem('token');
          window.location.href = '/login';
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
      : api.get(`/products/by-slug/${identifier}`);
  },
  getFeatured: (limit = 8) => api.get(`/products/featured/list?limit=${limit}`),
  getVictorian: (limit = 20) => api.get(`/products/victorian/list?limit=${limit}`),
  getColorChanging: (limit = 10) => api.get(`/products/color-changing/list?limit=${limit}`),
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
  update: (categoryId, categoryData) => api.put(`/admin/categories/${categoryId}`, categoryData),
  delete: (categoryId) => api.delete(`/admin/categories/${categoryId}`),
};

export const subcategoriesAPI = {
  getAll: () => api.get('/subcategories'),
  getAllAdmin: (params) => api.get('/subcategories/admin', { params }),
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
  getProfile: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
};

export const ordersAPI = {
  create: (orderData) => api.post('/orders', orderData),
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  getById: (orderId) => api.get(`/orders/${orderId}`),
  getOrderDetails: (orderId) => api.get(`/orders/${orderId}/items`),
  updateStatus: (orderId, statusData) => api.put(`/orders/${orderId}/status`, statusData),
  updatePaymentStatus: (orderId, paymentData) => api.put(`/orders/${orderId}/payment-status`, paymentData),
  addTracking: (orderId, trackingData) => api.put(`/orders/${orderId}/tracking`, trackingData),
  getAllOrders: (params) => api.get('/orders', { params }),
};

export const contactAPI = {
  submit: (messageData) => api.post('/contact', messageData),
  subscribeNewsletter: (email) => api.post('/contact/newsletter', { email }),
};

export const usersAPI = {
  getAllUsers: (params) => api.get('/users', { params }),
  getUserById: (userId) => api.get(`/users/${userId}`),
  createUser: (userData) => api.post('/users', userData),
  updateUserStatus: (userId, statusData) => api.put(`/users/${userId}/status`, statusData),
  getUserOrders: (userId, params) => api.get(`/users/${userId}/orders`, { params }),
};

export const inventoryAPI = {
  // Warehouses
  getWarehouses: () => api.get('/inventory/warehouses'),
  createWarehouse: (warehouseData) => api.post('/inventory/warehouses', warehouseData),
  
  // Stock Levels
  getStockLevels: (params) => api.get('/inventory/stock-levels', { params }),
  updateStockLevel: (productId, warehouseId, stockData) => api.put(`/inventory/stock-levels/${productId}/${warehouseId}`, stockData),
  
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
  getAllInvoices: (params) => api.get('/invoices', { params }),
  getMyInvoices: (params) => api.get('/invoices/my-invoices', { params }),
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

export const adminAPI = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),
  
  // Products
  createProduct: (productData) => api.post('/admin/products', productData),
  updateProduct: (productId, productData) => api.put(`/admin/products/${productId}`, productData),
  deleteProduct: (productId) => api.delete(`/admin/products/${productId}`),
  
  // Categories
  createCategory: (categoryData) => api.post('/admin/categories', categoryData),
  updateCategory: (categoryId, categoryData) => api.put(`/admin/categories/${categoryId}`, categoryData),
  deleteCategory: (categoryId) => api.delete(`/admin/categories/${categoryId}`),
  
  // Orders
  getAllOrders: (params) => api.get('/orders', { params }),
  
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
};

export default api;
