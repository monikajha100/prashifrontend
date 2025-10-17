import React, { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Helmet } from 'react-helmet-async';
import { productsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ProductSlider from '../components/ProductSlider';
import toast from 'react-hot-toast';
import './ProductDetail.css';

const ProductDetail = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState('description');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const identifier = searchParams.get('id') || slug;

  const { data: product, isLoading, error } = useQuery(
    ['product', identifier],
    () => productsAPI.getById(identifier),
    {
      select: (response) => response.data
    }
  );

  const handleAddToCart = () => {
    console.log('Add to cart clicked!', product, quantity);
    const qty = Math.max(1, Math.min(10, Number(quantity) || 1));
    addToCart(product, qty);
    toast.success('Product added to cart!');
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading product..." />;
  }

  if (error || !product) {
    console.log('Product error or not found:', error, product);
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>Product not found</h2>
        <p>The product you're looking for doesn't exist.</p>
        {error && <p>Error: {error.message}</p>}
      </div>
    );
  }

  console.log('Product loaded successfully:', product);
  console.log('Rendering buttons and related products...');

  return (
    <div className="product-detail">
      <Helmet>
        <title>{product.name} - Praashibysupal</title>
        <meta name="description" content={product.short_description || product.description} />
      </Helmet>

      <div className="container">
        {/* Product Image Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '40px'
        }}>
          {/* Main Image */}
          <div style={{
            width: '100%',
            maxWidth: '500px',
            height: '400px',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#f5f5f5',
            marginBottom: '20px'
          }}>
            <img 
              src={(product.images || product.productImages)?.[selectedImageIndex]?.image_url || product.primary_image || '/placeholder-product.jpg'} 
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                cursor: 'pointer',
                transition: 'transform 0.3s ease'
              }}
              onClick={() => {
                const images = product.images || product.productImages || [];
                if (images.length > 1) {
                  setSelectedImageIndex((prev) => (prev + 1) % images.length);
                }
              }}
            />
          </div>

          {/* Thumbnail Images */}
          {(product.images || product.productImages) && (product.images?.length > 1 || product.productImages?.length > 1) && (
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              maxWidth: '500px'
            }}>
              {(product.images || product.productImages).map((image, index) => (
                <div
                  key={index}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: selectedImageIndex === index ? '3px solid #D4AF37' : '2px solid #e0e0e0',
                    transition: 'all 0.3s ease',
                    boxShadow: selectedImageIndex === index ? '0 4px 12px rgba(212, 175, 55, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                  onClick={() => setSelectedImageIndex(index)}
                  onMouseOver={(e) => {
                    if (selectedImageIndex !== index) {
                      e.target.style.border = '2px solid #D4AF37';
                      e.target.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (selectedImageIndex !== index) {
                      e.target.style.border = '2px solid #e0e0e0';
                      e.target.style.transform = 'scale(1)';
                    }
                  }}
                >
                  <img 
                    src={image.image_url} 
                    alt={`${product.name} ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Image Counter */}
          {(product.images || product.productImages)?.length > 1 && (
            <p style={{ 
              marginTop: '15px', 
              fontSize: '14px', 
              color: '#666',
              textAlign: 'center'
            }}>
              Image {selectedImageIndex + 1} of {(product.images || product.productImages)?.length}
            </p>
          )}
        </div>

        {/* Product Info Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#333',
            margin: '0 0 20px 0',
            lineHeight: '1.2'
          }}>{product.name}</h1>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px',
            flexWrap: 'wrap',
            marginBottom: '30px'
          }}>
            <span style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#D4AF37'
            }}>₹ {product.price}</span>
            {product.original_price && product.original_price > product.price && (
              <>
                <span style={{ fontSize: '20px', color: '#999', textDecoration: 'line-through' }}>₹ {product.original_price}</span>
                <span style={{ background: '#ff4757', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: '600' }}>{product.discount_percentage}% Off</span>
              </>
            )}
          </div>

          {/* Product Actions */}
          <div style={{
            padding: '30px',
            margin: '30px auto',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            border: '1px solid #e9ecef',
            maxWidth: '600px'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 15, 
              marginBottom: '25px',
              justifyContent: 'center'
            }}>
              <label style={{ 
                fontWeight: 600, 
                fontSize: '16px',
                color: '#333'
              }}>Quantity:</label>
              <input
                type="number"
                min={1}
                max={10}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                style={{ 
                  width: 80, 
                  padding: '8px 12px', 
                  borderRadius: 6, 
                  border: '1px solid #ddd',
                  fontSize: '16px',
                  textAlign: 'center'
                }}
              />
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: '15px', 
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <button 
                onClick={handleAddToCart}
                style={{
                  padding: '15px 30px',
                  fontSize: '16px',
                  fontWeight: '600',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
                  color: 'white',
                  minWidth: '150px',
                  boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.3)';
                }}
              >
                Add to Cart
              </button>
              
              <button 
                onClick={() => {
                  handleAddToCart();
                  window.location.href = '/checkout';
                }}
                style={{ 
                  padding: '15px 30px',
                  fontSize: '16px',
                  fontWeight: '600',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                  color: 'white',
                  minWidth: '150px',
                  boxShadow: '0 4px 15px rgba(44, 62, 80, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(44, 62, 80, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(44, 62, 80, 0.3)';
                }}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '30px',
          borderRadius: '12px',
          marginTop: '30px'
        }}>
          <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid #e0e0e0', marginBottom: 20, flexWrap: 'wrap' }}>
            {['description','specifications','reviews','shipping'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: activeTab === tab ? '#D4AF37' : '#2c3e50',
                  border: 'none',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  color: 'white',
                  fontWeight: 600,
                  borderRadius: '8px',
                  fontSize: '14px',
                  minWidth: '120px',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                onMouseOver={(e) => {
                  if (activeTab !== tab) {
                    e.target.style.background = '#34495e';
                  }
                }}
                onMouseOut={(e) => {
                  if (activeTab !== tab) {
                    e.target.style.background = '#2c3e50';
                  }
                }}
              >
                {tab === 'description' ? 'Description' : 
                 tab === 'specifications' ? 'Specifications' : 
                 tab === 'reviews' ? 'Reviews' : 
                 'Shipping & Returns'}
              </button>
            ))}
          </div>

          {/* Tab panels */}
          {activeTab === 'description' && (
            <div style={{ padding: '30px 0' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px', color: '#333' }}>Product Description</h3>
              <div style={{ 
                fontSize: '18px', 
                lineHeight: '1.8', 
                color: '#444',
                whiteSpace: 'pre-wrap',
                backgroundColor: '#f8f9fa',
                padding: '25px',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                {product.description || product.short_description || 'No description available.'}
              </div>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div>
              <h3>Specifications</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                {product.material && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e0e0e0' }}><strong>Material:</strong> {product.material}</div>
                )}
                {product.color && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e0e0e0' }}><strong>Color:</strong> {product.color}</div>
                )}
                {product.weight && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e0e0e0' }}><strong>Weight:</strong> {product.weight}g</div>
                )}
                {product.dimensions && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e0e0e0' }}><strong>Dimensions:</strong> {product.dimensions}</div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e0e0e0' }}><strong>SKU:</strong> {product.sku || 'N/A'}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e0e0e0' }}><strong>Stock:</strong> {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}</div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <h3>Customer Reviews</h3>
              {product.reviews?.length ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  {product.reviews.map((r, i) => (
                    <div key={i} style={{ display: 'block', padding: '10px 0', borderBottom: '1px solid #e0e0e0' }}>
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
                <li>Free shipping on all orders</li>
                <li>Standard delivery 3-5 business days</li>
                <li>Easy returns within 30 days</li>
              </ul>
            </div>
          )}
        </div>

        {/* Related Products Slider */}
        <div style={{
          marginTop: '60px',
          padding: '20px',
          border: '2px solid #e0e0e0',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa'
        }}>
          <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
            Related Products
          </h3>
          <div style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
            Debug: {product.relatedProducts?.length || 0} related products found
          </div>
          {product.relatedProducts && product.relatedProducts.length > 0 ? (
            <ProductSlider 
              products={product.relatedProducts} 
              title="Related Products" 
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              No related products available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
