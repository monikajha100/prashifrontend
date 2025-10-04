import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  
  // Load cart items from localStorage or start empty
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Sync cart state when component mounts
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
        setCartItems([]);
      }
    }
  }, []);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }
    
    const updatedItems = cartItems.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
  };

  const removeItem = (id) => {
    const updatedItems = cartItems.filter(item => item.id !== id);
    setCartItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
  };

  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    const shippingAmount = subtotal > 1000 ? 0 : 100; // Free shipping above ₹1000
    const taxAmount = Math.round(subtotal * 0.18); // 18% GST
    const totalAmount = subtotal + shippingAmount + taxAmount;
    
    return { subtotal, shippingAmount, taxAmount, totalAmount };
  };

  const { subtotal, shippingAmount, taxAmount, totalAmount } = calculateTotals();

  const handleCheckout = () => {
    // Store cart data in localStorage for checkout page
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    localStorage.setItem('cartTotals', JSON.stringify({ subtotal, shippingAmount, taxAmount, totalAmount }));
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="cart-header">
            <h1>Shopping Cart</h1>
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
          <p>{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart</p>
        </div>

        <div className="cart-content">
          <div className="cart-items-section">
            <div className="cart-items">
              {cartItems.map(item => (
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
                      className="quantity-btn"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <FaMinus />
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button 
                      className="quantity-btn"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <FaPlus />
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
              
              <div className="summary-row">
                <span>Tax (GST):</span>
                <span>₹{taxAmount.toFixed(2)}</span>
              </div>
              
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