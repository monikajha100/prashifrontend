import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Addresses from './pages/Addresses';
import CustomerOrders from './pages/CustomerOrders';
import CustomerInvoices from './pages/CustomerInvoices';
import Contact from './pages/Contact';
import About from './pages/About';
import Wishlist from './pages/Wishlist';
import Offers from './pages/Offers';
import Partner from './pages/Partner';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import ShippingInfo from './pages/ShippingInfo';
import ReturnsExchanges from './pages/ReturnsExchanges';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminLogin from './admin/pages/WorkingAdminLogin';
import AdminDashboard from './admin/pages/WorkingAdminDashboard';
import AdminProducts from './admin/pages/EnhancedAdminProducts';
import AdminCategories from './admin/pages/AdminCategories';
import AdminSubcategories from './admin/pages/FullAdminSubcategories';
import InventoryManagement from './admin/pages/InventoryManagement';
import AdminBanners from './admin/pages/AdminBanners';
import AdminPromotionalBanners from './admin/pages/AdminPromotionalBanners';
import AdminOrders from './admin/pages/AdminOrders';
import AdminInvoices from './admin/pages/AdminInvoices';
import AdminCustomers from './admin/pages/AdminCustomers';
import AdminPaymentSettings from './admin/pages/AdminPaymentSettings';
import AdminUsers from './admin/pages/FullAdminUsers';
import AdminPartners from './admin/pages/AdminPartners';
import AdminContracts from './admin/pages/AdminContracts';
import AdminCoupons from './admin/pages/AdminCoupons';
import AdminStorefront from './admin/pages/AdminStorefront';
import AdminInstaShop from './admin/pages/AdminInstaShop';
import AdminFooterPages from './admin/pages/AdminFooterPages';
import AdminContacts from './admin/pages/AdminContacts';
import AdminReports from './admin/pages/AdminReports';
import AdminSpecialOffers from './admin/pages/AdminSpecialOffers';
import AdminSettings from './admin/pages/AdminSettings';
import AdminLayout from './admin/components/WorkingAdminLayout';

// Context
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
        <div className="App">
          <Helmet>
            <title>Praashibysupal - Luxury Jewelry Store</title>
            <meta name="description" content="Discover our exclusive collection of Victorian jewelry sets, color-changing jewelry, and designer pieces. Premium quality at affordable prices." />
          </Helmet>
          
          <ScrollToTop />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={
              <>
                <Header />
                <Home />
                <Footer />
              </>
            } />
            
            <Route path="/products" element={
              <>
                <Header />
                <Products />
                <Footer />
              </>
            } />
            
            <Route path="/product/:slug" element={
              <>
                <Header />
                <ProductDetail />
                <Footer />
              </>
            } />
            
            <Route path="/cart" element={
              <>
                <Header />
                <Cart />
                <Footer />
              </>
            } />
            
            <Route path="/checkout" element={
              <>
                <Header />
                <Checkout />
                <Footer />
              </>
            } />
            
            <Route path="/login" element={
              <>
                <Header />
                <Login />
                <Footer />
              </>
            } />
            
            <Route path="/register" element={
              <>
                <Header />
                <Register />
                <Footer />
              </>
            } />
            
            <Route path="/profile" element={
              <>
                <Header />
                <Profile />
                <Footer />
              </>
            } />
            
            <Route path="/wishlist" element={
              <>
                <Header />
                <Wishlist />
                <Footer />
              </>
            } />
            
            <Route path="/offers" element={
              <>
                <Header />
                <Offers />
                <Footer />
              </>
            } />
            
            <Route path="/addresses" element={
              <>
                <Header />
                <Addresses />
                <Footer />
              </>
            } />
            
            <Route path="/orders" element={
              <>
                <Header />
                <CustomerOrders />
                <Footer />
              </>
            } />
            
        <Route path="/invoices" element={
          <>
            <Header />
            <CustomerInvoices />
            <Footer />
          </>
        } />
        <Route path="/cart" element={
          <>
            <Header />
            <Cart />
            <Footer />
          </>
        } />
        <Route path="/checkout" element={
          <>
            <Header />
            <Checkout />
            <Footer />
          </>
        } />
            
            <Route path="/contact" element={
              <>
                <Header />
                <Contact />
                <Footer />
              </>
            } />
            
            <Route path="/about" element={
              <>
                <Header />
                <About />
                <Footer />
              </>
            } />
            
            <Route path="/partner" element={
              <>
                <Header />
                <Partner />
                <Footer />
              </>
            } />
            
            <Route path="/privacy-policy" element={
              <>
                <Header />
                <PrivacyPolicy />
                <Footer />
              </>
            } />
            
            <Route path="/terms-of-service" element={
              <>
                <Header />
                <TermsOfService />
                <Footer />
              </>
            } />
            
            <Route path="/shipping-info" element={
              <>
                <Header />
                <ShippingInfo />
                <Footer />
              </>
            } />
            
            <Route path="/returns-exchanges" element={
              <>
                <Header />
                <ReturnsExchanges />
                <Footer />
              </>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            } />
            <Route path="/admin/dashboard" element={
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            } />
            <Route path="/admin/products" element={
              <AdminLayout>
                <AdminProducts />
              </AdminLayout>
            } />
            <Route path="/admin/categories" element={
              <AdminLayout>
                <AdminCategories />
              </AdminLayout>
            } />
            <Route path="/admin/subcategories" element={
              <AdminLayout>
                <AdminSubcategories />
              </AdminLayout>
            } />
            <Route path="/admin/inventory" element={
              <AdminLayout>
                <InventoryManagement />
              </AdminLayout>
            } />
            <Route path="/admin/banners" element={
              <AdminLayout>
                <AdminBanners />
              </AdminLayout>
            } />
            <Route path="/admin/promotional-banners" element={
              <AdminLayout>
                <AdminPromotionalBanners />
              </AdminLayout>
            } />
            <Route path="/admin/special-offers" element={
              <AdminLayout>
                <AdminSpecialOffers />
              </AdminLayout>
            } />
            <Route path="/admin/orders" element={
              <AdminLayout>
                <AdminOrders />
              </AdminLayout>
            } />
        <Route path="/admin/invoices" element={
          <AdminLayout>
            <AdminInvoices />
          </AdminLayout>
        } />
        <Route path="/admin/customers" element={
          <AdminLayout>
            <AdminCustomers />
          </AdminLayout>
        } />
        <Route path="/admin/payment-settings" element={
          <AdminLayout>
            <AdminPaymentSettings />
          </AdminLayout>
        } />
            <Route path="/admin/users" element={
              <AdminLayout>
                <AdminUsers />
              </AdminLayout>
            } />
            <Route path="/admin/partners" element={
              <AdminLayout>
                <AdminPartners />
              </AdminLayout>
            } />
            <Route path="/admin/contracts" element={
              <AdminLayout>
                <AdminContracts />
              </AdminLayout>
            } />
            <Route path="/admin/coupons" element={
              <AdminLayout>
                <AdminCoupons />
              </AdminLayout>
            } />
            <Route path="/admin/storefront" element={
              <AdminLayout>
                <AdminStorefront />
              </AdminLayout>
            } />
            <Route path="/admin/insta-shop" element={
              <AdminLayout>
                <AdminInstaShop />
              </AdminLayout>
            } />
            <Route path="/admin/footer-pages" element={
              <AdminLayout>
                <AdminFooterPages />
              </AdminLayout>
            } />
            <Route path="/admin/contacts" element={
              <AdminLayout>
                <AdminContacts />
              </AdminLayout>
            } />
            <Route path="/admin/reports" element={
              <AdminLayout>
                <AdminReports />
              </AdminLayout>
            } />
            <Route path="/admin/settings" element={
              <AdminLayout>
                <AdminSettings />
              </AdminLayout>
            } />
            
            {/* 404 Route */}
            <Route path="*" element={
              <>
                <Header />
                <NotFound />
                <Footer />
              </>
            } />
          </Routes>
        </div>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
