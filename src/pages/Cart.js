import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import { storefrontAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const { 
    cartItems, 
    updateQuantity: updateCartQuantity, 
    removeFromCart,
    getCartItemsCount 
  } = useCart();

  // Get tax settings
  const { data: taxSettings } = useQuery(
    'taxSettings',
    storefrontAPI.getTaxSettings,
    {
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      onError: (error) => {
        console.error('Error loading tax settings:', error);
      }
    }
  );

  const updateQuantity = (id, newQuantity) => {
    updateCartQuantity(id, newQuantity);
  };

  const removeItem = (id) => {
    removeFromCart(id);
  };

  const cartCount = getCartItemsCount();
  const validCartItems = Array.isArray(cartItems) ? cartItems.filter(item => 
    item && 
    item.id && 
    item.quantity && 
    typeof item.quantity === 'number' && 
    item.quantity > 0 &&
    item.price !== undefined
  ) : [];

  const calculateTotals = () => {
    const subtotal = validCartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    const shippingAmount = 0; // Free shipping for all orders
    const taxEnabled = taxSettings?.tax_enabled || false;
    const taxRate = taxSettings?.tax_rate || 18;
    const taxAmount = taxEnabled ? Math.round(subtotal * taxRate / 100) : 0;
    const totalAmount = subtotal + shippingAmount + taxAmount;
    
    return { subtotal, shippingAmount, taxAmount, totalAmount };
  };

  const { subtotal, shippingAmount, taxAmount, totalAmount } = calculateTotals();

  const handleCheckout = () => {
    // Store cart data in localStorage for checkout page
    localStorage.setItem('cartItems', JSON.stringify(validCartItems));
    localStorage.setItem('cartTotals', JSON.stringify({ subtotal, shippingAmount, taxAmount, totalAmount }));
    navigate('/checkout');
  };

  if (validCartItems.length === 0 || cartCount === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="cart-header">
            <h1>Shopping Cart</h1>
            <p>0 items in your cart</p>
          </div>
          
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any items to your cart yet.</p>
            <Link to="/products" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <p>{cartCount} item{cartCount !== 1 ? 's' : ''} in your cart</p>
        </div>

        <div className="cart-content">
          <div className="cart-items-section">
            <div className="cart-items">
              {validCartItems.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="item-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  
                  <div className="item-details">
                    <h3>
                      <Link to={`/product/${item.slug}`}>{item.name}</Link>
                    </h3>
                    <p className="item-price">₹{parseFloat(item.price).toFixed(2)}</p>
                  </div>
                  
                  <div className="item-quantity">
                    <button 
                      className="quantity-btn quantity-btn-minus"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                      type="button"
                    >
                      <FaMinus />
                      <span className="icon-fallback-minus">−</span>
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button 
                      className="quantity-btn quantity-btn-plus"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                      type="button"
                    >
                      <FaPlus />
                      <span className="icon-fallback-plus">+</span>
                    </button>
                  </div>
                  
                  <div className="item-total">
                    <span>₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                  
                  <div className="item-actions">
                    <button 
                      className="remove-btn"
                      onClick={() => removeItem(item.id)}
                      title="Remove item"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cart-summary-section">
            <div className="cart-summary">
              <h3>Order Summary</h3>
              
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              
              <div className="summary-row">
                <span>Shipping:</span>
                <span>{shippingAmount === 0 ? 'Free' : `₹${shippingAmount.toFixed(2)}`}</span>
              </div>
              
              {taxSettings?.tax_enabled && (
                <div className="summary-row">
                  <span>Tax ({taxSettings?.tax_rate || 18}% GST):</span>
                  <span>₹{taxAmount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="summary-row total">
                <span>Total:</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
              
              <button 
                className="checkout-btn"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </button>
              
              <Link to="/products" className="continue-shopping">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;