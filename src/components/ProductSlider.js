import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toAbsoluteImageUrl } from '../services/api';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { FaHeart } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ProductSlider = ({ products, title = "Related Products" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4); // Number of items to show at once
  const { isAuthenticated } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Responsive items per view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 480) {
        setItemsPerView(1);
      } else if (window.innerWidth < 768) {
        setItemsPerView(2);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(3);
      } else {
        setItemsPerView(4);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex + itemsPerView >= products.length ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? Math.max(0, products.length - itemsPerView) : prevIndex - 1
    );
  };

  if (!products || !Array.isArray(products) || products.length === 0) {
    return null;
  }

  return (
    <div className="product-slider" style={{ marginTop: '40px', padding: '20px 0' }}>
      <h3 style={{ 
        fontSize: window.innerWidth < 768 ? '20px' : '24px', 
        fontWeight: '600', 
        marginBottom: '20px',
        textAlign: 'center',
        color: '#333'
      }}>
        {title}
      </h3>
      
      <div style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {/* Navigation buttons - hidden on mobile */}
        {window.innerWidth >= 768 && (
          <>
            <button
              onClick={prevSlide}
              style={{
                position: 'absolute',
                left: '-50px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#D4AF37',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '16px',
                zIndex: 10,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              ←
            </button>
            
            <button
              onClick={nextSlide}
              style={{
                position: 'absolute',
                right: '-50px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#D4AF37',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '16px',
                zIndex: 10,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              →
            </button>
          </>
        )}

        {/* Mobile navigation buttons */}
        {window.innerWidth < 768 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <button
              onClick={prevSlide}
              style={{
                background: '#D4AF37',
                border: 'none',
                borderRadius: '25px',
                width: '44px',
                height: '44px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '18px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              ←
            </button>
            
            <button
              onClick={nextSlide}
              style={{
                background: '#D4AF37',
                border: 'none',
                borderRadius: '25px',
                width: '44px',
                height: '44px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '18px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              →
            </button>
          </div>
        )}

        {/* Slider container */}
        <div style={{
          overflow: 'hidden',
          borderRadius: '10px'
        }}>
          <div style={{
            display: 'flex',
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            transition: 'transform 0.3s ease',
            gap: window.innerWidth < 768 ? '15px' : '20px'
          }}>
            {products.map((product, index) => {
              const inWishlist = isInWishlist(product.id);
              
              const handleWishlistClick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isAuthenticated) {
                  toast.error('Please login to add items to wishlist');
                  return;
                }
                toggleWishlist(product.id);
              };

              return (
                <div
                  key={product.id}
                  style={{
                    position: 'relative',
                    minWidth: `calc(${100 / itemsPerView}% - ${(window.innerWidth < 768 ? 15 : 20) * (itemsPerView - 1) / itemsPerView}px)`,
                    border: '1px solid #e0e0e0',
                    borderRadius: '10px',
                    padding: window.innerWidth < 768 ? '12px' : '15px',
                    textAlign: 'center',
                    backgroundColor: 'white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  onClick={() => window.location.href = `/product/${product.slug || product.id}`}
                >
                  <div style={{ position: 'relative' }}>
                    <button
                      className={`wishlist-btn ${inWishlist ? 'active' : ''}`}
                      onClick={handleWishlistClick}
                      title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '44px',
                        height: '44px',
                        border: 'none',
                        borderRadius: '50%',
                        background: '#28a745',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
                        transition: 'all 0.3s ease',
                        outline: 'none',
                        padding: 0,
                        minWidth: '44px',
                        minHeight: '44px'
                      }}
                    >
                      <FaHeart style={{ 
                        fontSize: '20px',
                        width: '20px',
                        height: '20px',
                        minWidth: '20px',
                        minHeight: '20px',
                        color: '#ffffff', 
                        fill: '#ffffff',
                        stroke: 'none',
                        display: 'block',
                        opacity: 1,
                        visibility: 'visible',
                        pointerEvents: 'none'
                      }} />
                    </button>
                    <img
                      src={toAbsoluteImageUrl(product.primary_image) || '/placeholder-product.jpg'}
                      alt={product.name}
                      style={{
                        width: '100%',
                        height: window.innerWidth < 768 ? '150px' : '200px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        marginBottom: '10px'
                      }}
                    />
                  </div>
                  <h4 style={{
                    fontSize: window.innerWidth < 768 ? '14px' : '16px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#333',
                    lineHeight: '1.4'
                  }}>
                    {product.name}
                  </h4>
                  <p style={{
                    fontSize: window.innerWidth < 768 ? '16px' : '18px',
                    fontWeight: '600',
                    color: '#D4AF37',
                    margin: '0'
                  }}>
                    ₹ {product.price}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSlider;