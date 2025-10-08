import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import '../live-styles.css';

const ProductSlider = ({ products, category }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const { addToCart } = useCart();

  // Calculate items per view based on screen size
  useEffect(() => {
    const updateItemsPerView = () => {
      const width = window.innerWidth;
      if (width < 480) {
        setItemsPerView(1);
      } else if (width < 768) {
        setItemsPerView(2);
      } else if (width < 1024) {
        setItemsPerView(3);
      } else {
        setItemsPerView(4);
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  const maxIndex = Math.max(0, products.length - itemsPerView);

  const nextSlide = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  if (!products || products.length === 0) {
    return (
      <div className="no-products">
        <p>No products available in this category.</p>
      </div>
    );
  }

  return (
    <div className="product-slider-container">
      <button 
        className="slider-button" 
        onClick={prevSlide}
        disabled={currentIndex === 0}
        aria-label="Previous products"
      >
        <FaChevronLeft />
      </button>
      
      <div className="product-slider">
        <div 
          className="product-slider-track"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`
          }}
        >
          {products.map((product, index) => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                {product.discount_percentage > 0 && (
                  <div className="sale-badge">Sale</div>
                )}
                <img 
                  src={product.primary_image || '/placeholder-product.jpg'} 
                  alt={product.name}
                />
              </div>
              
              <div className="product-info">
                <h3 className="product-title">{product.name}</h3>
                
                <div className="product-price">
                  <span className="current-price">₹ {product.price}</span>
                  {product.original_price && product.original_price > product.price && (
                    <>
                      <span className="original-price">₹ {product.original_price}</span>
                      <span className="discount">{product.discount_percentage}% Off</span>
                    </>
                  )}
                </div>
                
                <button 
                  className="add-to-cart-btn"
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart
                </button>
                <Link to={`/products/${product.slug}`} className="view-details-btn">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <button 
        className="slider-button" 
        onClick={nextSlide}
        disabled={currentIndex >= maxIndex}
        aria-label="Next products"
      >
        <FaChevronRight />
      </button>
    </div>
  );
};

export default ProductSlider;
