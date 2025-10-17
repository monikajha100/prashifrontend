import React, { useState } from 'react';
import { toAbsoluteImageUrl } from '../services/api';

const ProductSlider = ({ products, title = "Related Products" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = 4; // Number of items to show at once

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
        fontSize: '24px', 
        fontWeight: '600', 
        marginBottom: '20px',
        textAlign: 'center',
        color: '#333'
      }}>
        {title}
      </h3>
      
      <div style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Navigation buttons */}
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

        {/* Slider container */}
        <div style={{
          overflow: 'hidden',
          borderRadius: '10px'
        }}>
          <div style={{
            display: 'flex',
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            transition: 'transform 0.3s ease',
            gap: '20px'
          }}>
            {products.map((product, index) => (
              <div
                key={product.id}
                style={{
                  minWidth: `calc(${100 / itemsPerView}% - ${20 * (itemsPerView - 1) / itemsPerView}px)`,
                  border: '1px solid #e0e0e0',
                  borderRadius: '10px',
                  padding: '15px',
                  textAlign: 'center',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-5px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                onClick={() => window.location.href = `/product/${product.slug || product.id}`}
              >
                <img
                  src={toAbsoluteImageUrl(product.primary_image) || '/placeholder-product.jpg'}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    marginBottom: '10px'
                  }}
                />
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#333',
                  lineHeight: '1.4'
                }}>
                  {product.name}
                </h4>
                <p style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#D4AF37',
                  margin: '0'
                }}>
                  ₹ {product.price}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSlider;