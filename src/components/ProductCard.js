import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart, isInCart, getCartQuantity } = useCart();
  const cartQuantity = getCartQuantity(product.id);
  const inCart = isInCart(product.id);
  const [selectedColorImage, setSelectedColorImage] = useState(null);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <motion.div
      className="product-card w-mobile-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      <Link to={`/product/${product.slug}`} className="product-link">
        <div className="product-image">
          {product.discount_percentage > 0 && (
            <div className="sale-badge">Sale</div>
          )}
          <img 
            src={selectedColorImage || product.primary_image || '/placeholder-product.jpg'} 
            alt={product.name}
            onError={(e) => {
              e.target.src = '/placeholder-product.jpg';
            }}
          />
        </div>
        
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          
          {/* Color Variants */}
          {product.colors && product.colors.length > 0 && (
            <div className="color-variants">
              <div className="color-options">
                {product.colors.slice(0, 4).map((color, index) => (
                  <div
                    key={index}
                    className={`color-option ${color.is_primary ? 'primary' : ''}`}
                    style={{
                      backgroundColor: color.color_code || '#ddd',
                      border: color.color_code ? '2px solid #333' : '2px solid #ddd'
                    }}
                    title={color.color_name}
                    onMouseEnter={() => {
                      if (color.color_image) {
                        setSelectedColorImage(color.color_image);
                      }
                    }}
                    onMouseLeave={() => {
                      setSelectedColorImage(null);
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (color.color_image) {
                        setSelectedColorImage(color.color_image);
                      }
                    }}
                  />
                ))}
                {product.colors.length > 4 && (
                  <div className="color-more" title={`+${product.colors.length - 4} more colors`}>
                    +{product.colors.length - 4}
                  </div>
                )}
              </div>
            </div>
          )}
          
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
            className={`add-to-cart-btn ${inCart ? 'in-cart' : ''}`}
            onClick={handleAddToCart}
          >
            {inCart ? `In Cart (${cartQuantity})` : 'Add to Cart'}
          </button>
          <Link to={`/product/${product.slug || product.id}`} className="view-details-btn">
            View Details
          </Link>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
