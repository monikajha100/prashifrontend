import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { productsAPI, categoriesAPI, bannersAPI, toAbsoluteImageUrl } from '../services/api';
import ProductSlider from '../components/ProductSlider';
import Newsletter from '../components/Newsletter';
import LoadingSpinner from '../components/LoadingSpinner';
import '../live-styles.css';

const Home = () => {
  const [isApiAvailable, setIsApiAvailable] = useState(true);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Fallback data for when API is not available
  const fallbackCategories = [
    { id: 1, name: 'Rings', slug: 'rings' },
    { id: 2, name: 'Necklaces', slug: 'necklaces' },
    { id: 3, name: 'Earrings', slug: 'earrings' },
    { id: 4, name: 'Bracelets', slug: 'bracelets' }
  ];

  const fallbackBanners = [
    {
      id: 1,
      title: 'Exclusive Victorian Collection',
      subtitle: 'Discover our stunning range of Victorian jewelry sets',
      image: '/banner.jpg',
      link_url: '/products',
      button_text: 'Shop Now',
      is_active: true
    }
  ];

  const fallbackProducts = [
    {
      id: 1,
      name: 'Sparkle Textured Rose Gold Earrings',
      slug: 'sparkle-textured-rose-gold-earrings',
      price: 199,
      original_price: 399,
      discount_percentage: 50,
      primary_image: '/placeholder-product.jpg'
    },
    {
      id: 2,
      name: 'Sparkling Pave Heart Stud Earrings',
      slug: 'sparkling-pave-heart-stud-earrings',
      price: 349,
      original_price: 700,
      discount_percentage: 50,
      primary_image: '/placeholder-product.jpg'
    },
    {
      id: 3,
      name: 'Floral Drop Statement Earrings',
      slug: 'floral-drop-statement-earrings',
      price: 179,
      original_price: 360,
      discount_percentage: 50,
      primary_image: '/placeholder-product.jpg'
    },
    {
      id: 4,
      name: 'Everyday Rose Gold Stud Earrings',
      slug: 'everyday-rose-gold-stud-earrings',
      price: 219,
      original_price: 440,
      discount_percentage: 50,
      primary_image: '/placeholder-product.jpg'
    }
  ];

  // Fetch featured products with error handling
  const { data: featuredProducts, isLoading: featuredLoading, error: featuredError } = useQuery(
    'featuredProducts',
    () => productsAPI.getFeatured(8),
    {
      select: (response) => response.data,
      retry: 1,
      retryDelay: 1000,
      onError: () => setIsApiAvailable(false)
    }
  );

  // Fetch categories with error handling
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useQuery(
    'categories',
    categoriesAPI.getAll,
    {
      select: (response) => response.data,
      retry: 1,
      retryDelay: 1000,
      onError: () => setIsApiAvailable(false)
    }
  );

  // Fetch Victorian products with error handling
  const { data: necklacesProducts, isLoading: necklacesLoading, error: necklacesError } = useQuery(
    'necklacesProducts',
    () => productsAPI.getNecklaces(20),
    {
      select: (response) => response.data,
      retry: 1,
      retryDelay: 1000,
      onError: () => setIsApiAvailable(false)
    }
  );  

  // Fetch color changing products with error handling
  const { data: earringsProducts, isLoading: earringsLoading, error: earringsError } = useQuery(
    'earringsProducts',
    () => productsAPI.getEarrings(10),
    {
      select: (response) => response.data,
      retry: 1,
      retryDelay: 1000,
      onError: () => setIsApiAvailable(false)
    }
  );

  // Fetch banners with error handling
  const { data: banners, isLoading: bannersLoading } = useQuery(
    'activeBanners',
    bannersAPI.getAll,
    {
      select: (response) => {
        // Handle both array and object responses
        if (Array.isArray(response.data)) {
          return response.data;
        } else if (Array.isArray(response)) {
          return response;
        }
        return [];
      },
      retry: 1,
      retryDelay: 1000,
      onError: (err) => {
        console.error('Banners fetch error:', err);
        setIsApiAvailable(false);
      }
    }
  );

  // Use fallback data if API is not available - ensure arrays
  const displayCategories = categories || fallbackCategories;
  const displayFeaturedProducts = Array.isArray(featuredProducts) ? featuredProducts : [];
  const displayNecklacesProducts = Array.isArray(necklacesProducts) ? necklacesProducts : [];
  const displayEarringsProducts = Array.isArray(earringsProducts) ? earringsProducts : [];
  const displayBanners = Array.isArray(banners) ? banners : (banners ? [banners] : fallbackBanners);

  // Banner slider effect
  useEffect(() => {
    if (displayBanners && displayBanners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % displayBanners.length);
      }, 5000); // Change banner every 5 seconds
      
      return () => clearInterval(interval);
    }
  }, [displayBanners]);

  const nextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % displayBanners.length);
  };

  const prevBanner = () => {
    setCurrentBannerIndex((prev) => (prev - 1 + displayBanners.length) % displayBanners.length);
  };

  const goToBanner = (index) => {
    setCurrentBannerIndex(index);
  };

  // Show loading only for a short time, then show content with fallback data
  const isLoading = (featuredLoading || categoriesLoading) && isApiAvailable;

  return (
    <div className="home">
      <Helmet>
        <title>Praashibysupal - Luxury Jewelry Store</title>
        <meta name="description" content="Discover our exclusive collection of Victorian jewelry sets, color-changing jewelry, and designer pieces. Premium quality at affordable prices." />
      </Helmet>

      {/* Hero Banner */}
      {/* Hero Banner Slider */}
      <section className="hero-banner-slider" style={{position: 'relative', overflow: 'hidden', height: '600px'}}>
        {displayBanners && displayBanners.map((banner, index) => (
          <div 
            key={banner.id}
            className={`banner-slide ${index === currentBannerIndex ? 'active' : ''}`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: index === currentBannerIndex ? 1 : 0,
              transition: 'opacity 1s ease-in-out',
              background: banner.image ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${toAbsoluteImageUrl(banner.image)}) center/cover no-repeat` : 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              textAlign: 'center'
            }}
          >
            <div className="container">
              <div className="hero-content">
                <h1 className="hero-title text-mobile-center" style={{
                  fontFamily: "'Cormorant Garamond', serif", 
                  fontSize: '3.5rem', 
                  fontWeight: '700', 
                  marginBottom: '20px',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                }}>
                  {banner.title}
                </h1>
                {banner.subtitle && (
                  <p className="hero-subtitle" style={{
                    fontSize: '1.2rem', 
                    marginBottom: '30px', 
                    maxWidth: '600px', 
                    marginLeft: 'auto', 
                    marginRight: 'auto', 
                    lineHeight: '1.6',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                  }}>
                    {banner.subtitle}
                  </p>
                )}
                <Link 
                  to={banner.link_url || '/products'} 
                  className="hero-btn" 
                  style={{
                    background: '#D4AF37', 
                    color: 'white', 
                    padding: '15px 30px', 
                    borderRadius: '25px', 
                    textDecoration: 'none', 
                    fontWeight: '600', 
                    display: 'inline-block', 
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                  }}
                >
                  {banner.button_text || 'Shop Now'}
                </Link>
              </div>
            </div>
          </div>
        ))}
        
        {/* Navigation Arrows */}
        {displayBanners && displayBanners.length > 1 && (
          <>
            <button 
              onClick={prevBanner}
              className="banner-nav banner-prev"
              style={{
                position: 'absolute',
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.3)',
                border: 'none',
                color: 'white',
                fontSize: '2rem',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                zIndex: 10
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.5)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
            >
              ‹
            </button>
            <button 
              onClick={nextBanner}
              className="banner-nav banner-next"
              style={{
                position: 'absolute',
                right: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.3)',
                border: 'none',
                color: 'white',
                fontSize: '2rem',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                zIndex: 10
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.5)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
            >
              ›
            </button>
            
            {/* Dots Indicator */}
            <div className="banner-dots" style={{
              position: 'absolute',
              bottom: '30px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '10px',
              zIndex: 10
            }}>
              {displayBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToBanner(index)}
                  className={`banner-dot ${index === currentBannerIndex ? 'active' : ''}`}
                  style={{
                    width: index === currentBannerIndex ? '30px' : '10px',
                    height: '10px',
                    borderRadius: '5px',
                    background: index === currentBannerIndex ? '#D4AF37' : 'rgba(255,255,255,0.5)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Promotional Offers Section */}
      <section className="promotional-offers">
        <div className="container">
          <div className="offers-header">
            <h2>🎉 Special Offers & Promotions</h2>
            <p>Limited time offers on our premium jewelry collections</p>
          </div>
          
          <div className="offers-grid">
            <div className="offer-card">
              <div className="offer-icon">🔥</div>
              <h3>Flash Sale</h3>
              <p>Up to 70% OFF on selected Victorian sets</p>
              <div className="offer-timer">
                <p>⏰ Ends in 24 hours!</p>
              </div>
              <Link to="/products?category=victorian&sale=true" className="offer-btn">Shop Now</Link>
            </div>
            
            <div className="offer-card">
              <div className="offer-icon">🎁</div>
              <h3>Buy 2 Get 1 Free</h3>
              <p>Color changing jewelry collection</p>
              <div className="offer-highlight">
                <p>✨ Mix & Match Any 3 Items</p>
              </div>
              <Link to="/products?category=color-changing&offer=b2g1" className="offer-btn">Shop Now</Link>
            </div>
            
            <div className="offer-card">
              <div className="offer-icon">💎</div>
              <h3>New Arrival</h3>
              <p>Exclusive bridal collection with 50% OFF</p>
              <div className="offer-badge">
                <p>👑 Premium Quality Guaranteed</p>
              </div>
              <Link to="/products?category=bridal&new=true" className="offer-btn">Shop Now</Link>
            </div>
          </div>
          
          <div className="offers-footer">
            <h4>🚚 Free Shipping on Orders Above ₹999</h4>
            <p>*Terms and conditions apply. Valid for prepaid orders only.</p>
          </div>
        </div>
      </section>

      {/* Top Trending Collections */}
      <section className="trending-section">
        <div className="container">
          <h2 className="section-title">Top Trending Collections</h2>
          <div className="collections-grid">
            <div className="collection-card">
              <div className="collection-icon">💍</div>
              <h3 className="collection-name">Rings</h3>
              <p className="collection-subtitle">Designer Rings</p>
            </div>
            <div className="collection-card">
              <div className="collection-icon">📿</div>
              <h3 className="collection-name">Necklaces</h3>
              <p className="collection-subtitle">Statement Necklaces</p>
            </div>
            <div className="collection-card">
              <div className="collection-icon">💎</div>
              <h3 className="collection-name">Earrings</h3>
              <p className="collection-subtitle">Exclusive Earrings</p>
            </div>
            <div className="collection-card">
              <div className="collection-icon">🌈</div>
              <h3 className="collection-name">Bracelets</h3>
              <p className="collection-subtitle">Complete Range</p>
            </div>
          </div>
        </div>
      </section>

      {/* Necklaces Sets Section */}
      <section className="product-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title-left">NECKLACES COLLECTION</h2>
            <Link to="/products?category=necklaces" className="view-all-btn">View all</Link>
          </div>
          
          <ProductSlider 
            products={displayNecklacesProducts || []} 
            category="necklaces"
            title=''
          />
        </div>
      </section>

      {/* Featured Products Section */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="product-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title-left">⭐ FEATURED PRODUCTS</h2>
              <Link to="/products?featured=true" className="view-all-btn">View all</Link>
            </div>
            
            <ProductSlider 
              products={displayFeaturedProducts} 
              category="featured"
            />
          </div>
        </section>
      )}

      {/* Earrings Section */}
      <section className="product-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title-left">EARRINGS COLLECTION</h2>
            <Link to="/products?category=earrings" className="view-all-btn">View all</Link>
          </div>
          
          <ProductSlider 
            products={displayEarringsProducts || []} 
            category="earrings"
            title=''
          />
        </div>
      </section>

      {/* Newsletter Section */}
      <Newsletter />
    </div>
  );
};

export default Home;
