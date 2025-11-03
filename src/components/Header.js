import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import {
  FaSearch,
  FaUser,
  FaShoppingBag,
  FaBars,
  FaTimes,
  FaUserCircle,
  FaClipboardList,
  FaLock,
} from "react-icons/fa";
import "../live-styles.css";
import "./Header.css";
import api from "../services/api";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [banners, setBanners] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartItemsCount } = useCart();
  const navigate = useNavigate();

  const cartItemsCount = getCartItemsCount();

  // Fetch promotional banners
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await api.get("/promotional-banners");
        const data = response.data;
        setBanners(data);
      } catch (error) {
        console.error("Error fetching promotional banners:", error);
      }
    };

    fetchBanners();
  }, []);

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % banners.length);
      }, 5000); // Change banner every 5 seconds

      return () => clearInterval(interval);
    }
  }, [banners.length]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleMenu = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsMenuOpen(prev => !prev);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (!isMenuOpen) return;
    
    const handleClickOutside = (event) => {
      const target = event.target;
      const menu = document.querySelector('.mobile-menu');
      const toggle = document.querySelector('.mobile-menu-toggle');
      
      if (menu && toggle && 
          !menu.contains(target) && 
          !toggle.contains(target)) {
        closeMenu();
      }
    };

    // Use both touch and mouse events for better mobile support
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isMenuOpen) {
        console.log("Window resized to desktop, closing menu");
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMenuOpen]);

  // Ensure body scroll is locked when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Handle mobile menu item clicks
  const handleMobileMenuItemClick = (path) => {
    console.log("Mobile menu item clicked, navigating to:", path);
    setIsMenuOpen(false);
    navigate(path);
  };

  return (
    <header className="header">
      {/* Promotional Banner */}
      {banners.length > 0 && (
        <div className="promotional-banner-slider">
          <div className="banner-slides">
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className={`banner-slide ${
                  index === currentBannerIndex ? "active" : ""
                }`}
                style={{
                  backgroundColor: banner.background_color || '#D4AF37',
                  color: banner.text_color || '#ffffff',
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  outline: 'none',
                }}
              >
                <div className="container">
                  <div className="banner-content">
                    {banner.link_url ? (
                      <Link to={banner.link_url} className="banner-link">
                        <div className="banner-text-container">
                          <span className="banner-text">{banner.text}</span>
                          {banner.subtitle && (
                            <span className="banner-subtitle">{banner.subtitle}</span>
                          )}
                          {banner.button_text && (
                            <span className="banner-button">{banner.button_text}</span>
                          )}
                        </div>
                      </Link>
                    ) : (
                      <div className="banner-text-container">
                        <span className="banner-text">{banner.text}</span>
                        {banner.subtitle && (
                          <span className="banner-subtitle">{banner.subtitle}</span>
                        )}
                        {banner.button_text && (
                          <span className="banner-button">{banner.button_text}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Header */}
      <div className="main-header">
        <div className="container">
          <div className="header-content">
            {/* Logo */}
            <Link to="/" className="logo-container" onClick={() => setIsMenuOpen(false)}>
              <img
                src="/logo.png"
                alt="Praashi by Supal"
                className="logo-image"
              />
            </Link>

            {/* Navigation */}
            <nav className="navigation d-mobile-none">
              <Link to="/" className="nav-link active">
                Home
              </Link>
              <Link to="/products?category=necklaces" className="nav-link">
                Necklace Sets
              </Link>
              <Link to="/products?category=earrings" className="nav-link">
                Earrings
              </Link>
              <Link to="/products?category=watches" className="nav-link">
                Watches
              </Link>
              <Link to="/products?category=rings" className="nav-link">
                Rings
              </Link>
              <Link to="/products?category=bracelets" className="nav-link">
                Bracelets
              </Link>
              <Link to="/products?category=fragrance" className="nav-link">
                Fragrance
              </Link>
              <Link to="/partner" className="nav-link partner-link">
                Become a Partner
              </Link>
            </nav>

            {/* Header Actions */}
            <div className="header-actions">
              {/* Search */}
              <div className="search-container d-mobile-none">
                <button
                  className="icon-button"
                  onClick={toggleSearch}
                  aria-label="Search"
                >
                  <FaSearch />
                </button>
                {isSearchOpen && (
                  <div className="search-dropdown">
                    <form onSubmit={handleSearch} className="search-form">
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                        autoFocus
                      />
                      <button type="submit" className="search-submit">
                        <FaSearch />
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* User Account */}
              <div className="user-actions d-mobile-none">
                {isAuthenticated ? (
                  <div className="user-dropdown">
                    <button className="icon-button user-button" aria-label="User account" title={user?.name || user?.email}>
                      <FaUser />
                      {user?.name && <span className="user-name-tooltip">{user.name}</span>}
                    </button>
                    <div className="dropdown-menu">
                      <div className="dropdown-header">
                        <div className="user-badge">
                          <FaUser className="user-badge-icon" />
                          <span className="user-badge-name">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                        </div>
                        <div className="user-info">
                          <div className="user-name">{user?.name || 'User'}</div>
                          <div className="user-email">{user?.email}</div>
                        </div>
                      </div>
                      <Link to="/profile" className="dropdown-item" onClick={(e) => e.stopPropagation()}>
                        <FaUserCircle className="dropdown-icon" />
                        <span>Profile</span>
                      </Link>
                      <Link to="/orders" className="dropdown-item" onClick={(e) => e.stopPropagation()}>
                        <FaClipboardList className="dropdown-icon" />
                        <span>My Orders</span>
                      </Link>
                      {user?.role === "admin" && (
                        <Link to="/admin" className="dropdown-item" onClick={(e) => e.stopPropagation()}>
                          <FaLock className="dropdown-icon" />
                          <span>Admin Panel</span>
                        </Link>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); handleLogout(); }} className="dropdown-item logout-button">
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link to="/login" className="icon-button" aria-label="Login">
                    <FaUser />
                  </Link>
                )}
              </div>

              {/* Shopping Cart */}
              <Link
                to="/cart"
                className="icon-button cart-button"
                aria-label="Shopping cart"
              >
                <FaShoppingBag />
                {cartItemsCount > 0 && (
                  <span className="cart-badge">{cartItemsCount}</span>
                )}
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                className="mobile-menu-toggle d-mobile-block"
                onClick={toggleMenu}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  toggleMenu(e);
                }}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMenuOpen}
                type="button"
                data-menu-toggle="true"
              >
                {isMenuOpen ? <FaTimes /> : <FaBars />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Golden Separator Line */}
      <div className="header-separator"></div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="mobile-menu-overlay active" 
          onClick={closeMenu} 
          onTouchStart={closeMenu}
          aria-hidden="true"
        ></div>
      )}

      {/* Mobile Menu */}
      <div 
        className={`mobile-menu ${isMenuOpen ? 'active' : ''}`} 
        role="dialog" 
        aria-label="Mobile navigation menu"
        aria-hidden={!isMenuOpen}
        style={{
          display: 'flex'
        }}
      >
        <div className="mobile-menu-header">
          <Link to="/" className="logo-container" onClick={(e) => {e.preventDefault(); handleMobileMenuItemClick('/');}}>
            <img
              src="/logo.png"
              alt="Praashi by Supal"
              className="logo-image"
            />
          </Link>
          <button 
            className="icon-button mobile-menu-close" 
            onClick={closeMenu} 
            onTouchStart={closeMenu}
            aria-label="Close menu"
            type="button"
          >
            <FaTimes />
          </button>
        </div>

          {/* Mobile Search */}
          <div className="mobile-search">
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSearch(e);
              setIsMenuOpen(false);
            }} className="mobile-search-form">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mobile-search-input"
              />
              <button type="submit" className="mobile-search-submit">
                <FaSearch />
              </button>
            </form>
          </div>

          <div className="mobile-nav-links">
            {user?.role === "admin" && (
              <div
                className="mobile-nav-link"
                onClick={() => handleMobileMenuItemClick('/admin')}
              >
                Admin Panel
              </div>
            )}
            <div className="mobile-nav-link" onClick={() => handleMobileMenuItemClick('/')}>
              Home
            </div>
            <div
              className="mobile-nav-link"
              onClick={() => handleMobileMenuItemClick('/products?category=necklaces')}
            >
              Necklace Sets
            </div>
            <div
              className="mobile-nav-link"
              onClick={() => handleMobileMenuItemClick('/products?category=earrings')}
            >
              Earrings
            </div>
            <div
              className="mobile-nav-link"
              onClick={() => handleMobileMenuItemClick('/products?category=watches')}
            >
              Watches
            </div>
            <div
              className="mobile-nav-link"
              onClick={() => handleMobileMenuItemClick('/products?category=rings')}
            >
              Rings
            </div>
            <div
              className="mobile-nav-link"
              onClick={() => handleMobileMenuItemClick('/products?category=bracelets')}
            >
              Bracelets
            </div>
            <div
              className="mobile-nav-link"
              onClick={() => handleMobileMenuItemClick('/products?category=fragrance')}
            >
              Fragrance
            </div>
            <div
              className="mobile-nav-link partner-link"
              onClick={() => handleMobileMenuItemClick('/partner')}
            >
              Become a Partner
            </div>
          </div>

          {isAuthenticated ? (
            <div className="mobile-user-section">
              <div className="mobile-user-info">
                <div className="mobile-user-badge">
                  <FaUser className="mobile-user-badge-icon" />
                  <span className="mobile-user-badge-name">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                </div>
                <div>
                  <div className="mobile-user-name">{user?.name || 'User'}</div>
                  <div className="mobile-user-email">{user?.email}</div>
                </div>
              </div>
              <div
                className="mobile-nav-link"
                onClick={() => handleMobileMenuItemClick('/profile')}
              >
                <FaUserCircle style={{ marginRight: '10px', color: '#ff69b4', display: 'inline-block' }} />
                Profile
              </div>
              <div
                className="mobile-nav-link"
                onClick={() => handleMobileMenuItemClick('/orders')}
              >
                <FaClipboardList style={{ marginRight: '10px', color: '#ff69b4', display: 'inline-block' }} />
                My Orders
              </div>
              {user?.role === "admin" && (
                <div
                  className="mobile-nav-link"
                  onClick={() => handleMobileMenuItemClick('/admin')}
                >
                  <FaLock style={{ marginRight: '10px', color: '#ff69b4', display: 'inline-block' }} />
                  Admin Panel
                </div>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="mobile-nav-link logout-mobile"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="mobile-user-section">
              <div
                className="mobile-nav-link"
                onClick={() => handleMobileMenuItemClick('/login')}
              >
                Login
              </div>
              <div
                className="mobile-nav-link"
                onClick={() => handleMobileMenuItemClick('/register')}
              >
                Register
              </div>
            </div>
          )}
        </div>
    </header>
  );
};

export default Header;