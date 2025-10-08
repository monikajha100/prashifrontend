import React, { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Helmet } from 'react-helmet-async';
import { productsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import './ProductDetail.css';

const ProductDetail = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState('description');
  const [quantity, setQuantity] = useState(1);

  const identifier = searchParams.get('id') || slug;

  const { data: product, isLoading, error } = useQuery(
    ['product', identifier],
    () => productsAPI.getById(identifier),
    {
      select: (response) => response.data
    }
  );

  const handleAddToCart = () => {
    const qty = Math.max(1, Math.min(10, Number(quantity) || 1));
    addToCart(product, qty);
    toast.success('Product added to cart!');
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading product..." />;
  }

  if (error || !product) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>Product not found</h2>
        <p>The product you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="product-detail">
      <Helmet>
        <title>{product.name} - Praashibysupal</title>
        <meta name="description" content={product.short_description || product.description} />
      </Helmet>

      <div className="container">
        <div className="product-detail-content">
          <div className="product-images">
            <div className="main-image">
              <img 
                src={product.images?.[0]?.image_url || '/placeholder-product.jpg'} 
                alt={product.name}
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="thumbnail-images">
                {product.images.map((image, index) => (
                  <img 
                    key={index}
                    src={image.image_url} 
                    alt={`${product.name} ${index + 1}`}
                    className="thumbnail"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="product-info">
            <h1 className="product-title">{product.name}</h1>
            
            <div className="product-price">
              <span className="current-price">₹ {product.price}</span>
              {product.original_price && product.original_price > product.price && (
                <>
                  <span className="original-price">₹ {product.original_price}</span>
                  <span className="discount">{product.discount_percentage}% Off</span>
                </>
              )}
            </div>

            {product.short_description && (
              <div className="product-short-description">
                <p>{product.short_description}</p>
              </div>
            )}

            {/* Quantity + actions */}
            <div className="product-actions">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <label style={{ fontWeight: 600 }}>Qty:</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  style={{ width: 70, padding: '8px 10px', borderRadius: 8, border: '1px solid #e0e0e0' }}
                />
              </div>
              <button 
                className="btn btn-primary add-to-cart-btn"
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>
              <button className="btn btn-secondary">
                Add to Wishlist
              </button>
            </div>

            {/* Tabs similar to reference */}
            <div className="product-details">
              <div style={{ display: 'flex', gap: 20, borderBottom: '1px solid #e0e0e0', marginBottom: 20 }}>
                {['description','specifications','reviews','shipping'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: '10px 0',
                      cursor: 'pointer',
                      color: activeTab === tab ? '#D4AF37' : '#666',
                      borderBottom: activeTab === tab ? '2px solid #D4AF37' : '2px solid transparent',
                      fontWeight: 600
                    }}
                  >
                    {tab === 'description' ? 'Description' : tab === 'specifications' ? 'Specifications' : tab === 'reviews' ? 'Reviews' : 'Shipping & Returns'}
                  </button>
                ))}
              </div>

              {/* Tab panels */}
              {activeTab === 'description' && (
                <div className="product-description">
                  <h3>Description</h3>
                  <p>{product.description || product.short_description}</p>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div>
                  <h3>Specifications</h3>
                  <div className="details-grid">
                    {product.material && (
                      <div className="detail-item"><strong>Material:</strong> {product.material}</div>
                    )}
                    {product.color && (
                      <div className="detail-item"><strong>Color:</strong> {product.color}</div>
                    )}
                    {product.weight && (
                      <div className="detail-item"><strong>Weight:</strong> {product.weight}g</div>
                    )}
                    {product.dimensions && (
                      <div className="detail-item"><strong>Dimensions:</strong> {product.dimensions}</div>
                    )}
                    <div className="detail-item"><strong>SKU:</strong> {product.sku || 'N/A'}</div>
                    <div className="detail-item"><strong>Stock:</strong> {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}</div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <h3>Customer Reviews</h3>
                  {product.reviews?.length ? (
                    <div className="details-grid">
                      {product.reviews.map((r, i) => (
                        <div key={i} className="detail-item" style={{ display: 'block' }}>
                          <div style={{ fontWeight: 600 }}>{r.name || 'User'}</div>
                          <div style={{ color: '#666', marginTop: 6 }}>{r.comment || r.text}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#666' }}>No reviews yet.</p>
                  )}
                </div>
              )}

              {activeTab === 'shipping' && (
                <div>
                  <h3>Shipping & Returns</h3>
                  <ul style={{ color: '#666', lineHeight: 1.8 }}>
                    <li>Free shipping above ₹999</li>
                    <li>Standard delivery 3-5 business days</li>
                    <li>Easy returns within 30 days</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related products below remains */}

        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div className="related-products">
            <h3>Related Products</h3>
            <div className="related-products-grid">
              {product.relatedProducts.map(relatedProduct => (
                <div key={relatedProduct.id} className="related-product-card">
                  <img 
                    src={relatedProduct.primary_image || '/placeholder-product.jpg'} 
                    alt={relatedProduct.name}
                  />
                  <h4>{relatedProduct.name}</h4>
                  <p>₹ {relatedProduct.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
