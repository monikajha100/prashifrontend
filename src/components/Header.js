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
} from "react-icons/fa";
import "../live-styles.css";
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

  const toggleMenu = () => {
    console.log("Toggling menu. Current state:", isMenuOpen);
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest(".mobile-menu") && !event.target.closest(".mobile-menu-toggle")) {
        console.log("Click outside detected, closing menu");
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
                  backgroundColor: banner.background_color,
                  color: banner.text_color,
                }}
              >
                <div className="container">
                  <div className="banner-content">
                    <div className="banner-text-container">
                      <span className="banner-text">{banner.text}</span>
                    </div>
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
            <Link to="/" className="logo-container">
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
                    <button className="icon-button" aria-label="User account">
                      <FaUser />
                    </button>
                    <div className="dropdown-menu">
                      <Link to="/profile" className="dropdown-item">
                        Profile
                      </Link>
                      <Link to="/orders" className="dropdown-item">
                        My Orders
                      </Link>
                      {user?.role === "admin" && (
                        <Link to="/admin" className="dropdown-item">
                          Admin Panel
                        </Link>
                      )}
                      <button onClick={handleLogout} className="dropdown-item">
                        Logout
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
                aria-label="Toggle mobile menu"
                aria-expanded={isMenuOpen}
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
        <div className="mobile-menu-overlay active" onClick={toggleMenu} aria-hidden="true"></div>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu active" role="dialog" aria-label="Mobile navigation menu">
          <div className="mobile-menu-header">
            <Link to="/" className="logo-container" onClick={toggleMenu}>
              <img
                src="/logo.png"
                alt="Praashi by Supal"
                className="logo-image"
              />
            </Link>
            <button className="icon-button" onClick={toggleMenu} aria-label="Close menu">
              <FaTimes />
            </button>
          </div>

          {/* Mobile Search */}
          <div className="mobile-search">
            <form onSubmit={(e) => {
              handleSearch(e);
              toggleMenu();
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
              <Link
                to="/admin"
                className="mobile-nav-link"
                onClick={toggleMenu}
              >
                Admin Panel
              </Link>
            )}
            <Link to="/" className="mobile-nav-link" onClick={toggleMenu}>
              Home
            </Link>
            <Link
              to="/products?category=necklaces"
              className="mobile-nav-link"
              onClick={toggleMenu}
            >
              Necklace Sets
            </Link>
            <Link
              to="/products?category=earrings"
              className="mobile-nav-link"
              onClick={toggleMenu}
            >
              Earrings
            </Link>
            <Link
              to="/products?category=watches"
              className="mobile-nav-link"
              onClick={toggleMenu}
            >
              Watches
            </Link>
            <Link
              to="/products?category=rings"
              className="mobile-nav-link"
              onClick={toggleMenu}
            >
              Rings
            </Link>
            <Link
              to="/products?category=bracelets"
              className="mobile-nav-link"
              onClick={toggleMenu}
            >
              Bracelets
            </Link>
            <Link
              to="/products?category=fragrance"
              className="mobile-nav-link"
              onClick={toggleMenu}
            >
              Fragrance
            </Link>
            <Link
              to="/partner"
              className="mobile-nav-link partner-link"
              onClick={toggleMenu}
            >
              Become a Partner
            </Link>
          </div>

          {isAuthenticated ? (
            <div className="mobile-user-section">
              <Link
                to="/profile"
                className="mobile-nav-link"
                onClick={toggleMenu}
              >
                Profile
              </Link>
              <Link
                to="/orders"
                className="mobile-nav-link"
                onClick={toggleMenu}
              >
                My Orders
              </Link>
              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  className="mobile-nav-link"
                  onClick={toggleMenu}
                >
                  Admin Panel
                </Link>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  toggleMenu();
                }}
                className="mobile-nav-link"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="mobile-user-section">
              <Link
                to="/login"
                className="mobile-nav-link"
                onClick={toggleMenu}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="mobile-nav-link"
                onClick={toggleMenu}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;