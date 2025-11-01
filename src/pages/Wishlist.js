import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaHeart, FaTrash, FaShoppingCart, FaSpinner } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../context/CartContext';
import { toAbsoluteImageUrl } from '../services/api';
import './Wishlist.css';

const Wishlist = () => {
  const { wishlistItems, isLoading, removeFromWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = async (product) => {
    const productData = {
      id: product.product?.id || product.product_id,
      name: product.product?.name || product.name,
      price: product.product?.price || product.price,
      original_price: product.product?.original_price || product.original_price,
      primary_image: product.product?.primary_image || product.image,
      image: product.product?.primary_image || product.image,
      slug: product.product?.slug || product.slug,
      stock_quantity: product.product?.stock_quantity || product.stock_quantity
    };
    addToCart(productData, 1);
    navigate('/cart');
  };

  if (isLoading) {
    return (
      <div className="wishlist-page">
        <div className="container">
          <div className="loading-container">
            <FaSpinner className="spinner" />
            <p>Loading wishlist...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <Helmet>
        <title>My Wishlist - Praashibysupal</title>
      </Helmet>

      <div className="container">
        <div className="wishlist-header">
          <h1>
            <FaHeart /> My Wishlist
          </h1>
          <p className="wishlist-count">
            {wishlistItems?.length || 0} {wishlistItems?.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        {!wishlistItems || wishlistItems.length === 0 ? (
          <div className="wishlist-empty">
            <FaHeart className="empty-icon" />
            <h2>Your wishlist is empty</h2>
            <p>Start adding items you love to your wishlist!</p>
            <Link to="/products" className="btn btn-primary">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlistItems.map((item) => {
              const product = item.product || item;
              const productId = product.id || item.product_id;
              const imageUrl = toAbsoluteImageUrl(
                product.primary_image || 
                product.image || 
                (product.productImages && product.productImages[0]?.image_url) ||
                '/placeholder-image.jpg'
              );

              return (
                <div key={item.id || productId} className="wishlist-item">
                  <div className="wishlist-item-image">
                    <Link to={`/product/${product.slug || `product-${productId}`}`}>
                      <img src={imageUrl} alt={product.name} />
                    </Link>
                    <button
                      className="wishlist-remove-btn"
                      onClick={() => removeFromWishlist(productId)}
                      title="Remove from wishlist"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  <div className="wishlist-item-info">
                    <h3>
                      <Link to={`/product/${product.slug || `product-${productId}`}`}>
                        {product.name}
                      </Link>
                    </h3>
                    <div className="wishlist-item-price">
                      {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) ? (
                        <>
                          <span className="original-price">₹{parseFloat(product.original_price).toFixed(2)}</span>
                          <span className="current-price">₹{parseFloat(product.price).toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="current-price">₹{parseFloat(product.price || 0).toFixed(2)}</span>
                      )}
                    </div>
                    <button
                      className="btn btn-primary btn-add-to-cart"
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.stock_quantity || product.stock_quantity <= 0}
                    >
                      <FaShoppingCart /> Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;

