import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { paymentsAPI, ordersAPI, storefrontAPI, couponsAPI } from '../services/api';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    billingAddress: '',
    notes: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartTotals, setCartTotals] = useState({});
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState(null);
  const [couponError, setCouponError] = useState('');

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

  // Calculate cart totals from items
  const calculateCartTotals = (items, taxEnabled = false, taxRate = 18) => {
    if (!items || items.length === 0) {
      return {
        subtotal: 0,
        shippingAmount: 0,
        taxAmount: 0,
        totalAmount: 0
      };
    }
    
    const subtotal = items.reduce((sum, item) => {
      const price = parseFloat(item.price || 0);
      const quantity = parseInt(item.quantity || 1);
      return sum + (price * quantity);
    }, 0);
    
    const shippingAmount = 0; // Free shipping for all orders
    const taxAmount = taxEnabled ? (subtotal * taxRate / 100) : 0;
    const totalAmount = subtotal + shippingAmount + taxAmount;
    
    return {
      subtotal: Math.max(0, subtotal),
      shippingAmount: Math.max(0, shippingAmount),
      taxAmount: Math.max(0, taxAmount),
      totalAmount: Math.max(0, totalAmount)
    };
  };

  // Load cart data from localStorage and recalculate totals when tax settings change
  useEffect(() => {
    const savedCartItems = localStorage.getItem('cartItems');
    
    if (savedCartItems) {
      const items = JSON.parse(savedCartItems);
      setCartItems(items);
      
      // Recalculate totals with current tax settings
      if (taxSettings !== undefined) {
        const totals = calculateCartTotals(
          items,
          taxSettings.tax_enabled || false,
          taxSettings.tax_rate || 18
        );
        setCartTotals(totals);
        // Update localStorage with new totals
        localStorage.setItem('cartTotals', JSON.stringify(totals));
      } else {
        // Fallback: use existing totals if available, otherwise calculate with defaults
        const savedCartTotals = localStorage.getItem('cartTotals');
        if (savedCartTotals) {
          try {
            const parsedTotals = JSON.parse(savedCartTotals);
            setCartTotals({
              subtotal: parsedTotals.subtotal || 0,
              shippingAmount: parsedTotals.shippingAmount ?? 0,
              taxAmount: parsedTotals.taxAmount || 0,
              totalAmount: parsedTotals.totalAmount || 0
            });
          } catch (error) {
            // If parsing fails, calculate fresh totals
            const totals = calculateCartTotals(items, false, 18);
            setCartTotals(totals);
          }
        } else {
          // Calculate with default (no tax)
          const totals = calculateCartTotals(items, false, 18);
          setCartTotals(totals);
        }
      }
    } else {
      // Redirect to cart if no items
      navigate('/cart');
    }
  }, [navigate, taxSettings]);

  // Get payment settings
  const { data: paymentSettings, isLoading: settingsLoading } = useQuery(
    'paymentSettings',
    paymentsAPI.getPaymentSettings,
    {
      onSuccess: (data) => {
        console.log('Payment settings loaded:', data);
      },
      onError: (error) => {
        console.error('Error loading payment settings:', error);
      }
    }
  );

  // Create order mutation
  const createOrderMutation = useMutation(ordersAPI.create, {
    onSuccess: (orderData) => {
      console.log('=== ORDER CREATION SUCCESS ===');
      console.log('Full order creation response:', JSON.stringify(orderData, null, 2));
      console.log('Payment method:', paymentMethod);
      
      if (paymentMethod === 'cod') {
        // For COD, order is created and we're done
        handleOrderSuccess(orderData);
      } else if (paymentMethod === 'razorpay') {
        // For Razorpay, initiate payment
        initiateRazorpayPayment(orderData);
      }
    },
    onError: (error) => {
      console.error('Error creating order:', error);
      setIsProcessing(false);
      
      // Show validation errors to user
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(err => err.msg).join(', ');
        alert(`Validation Error: ${errorMessages}`);
      } else {
        alert('Error creating order. Please try again.');
      }
    }
  });

  // Verify payment mutation
  const verifyPaymentMutation = useMutation(paymentsAPI.verifyPayment, {
    onSuccess: (data) => {
      console.log('Payment verified:', data);
      handleOrderSuccess(data);
    },
    onError: (error) => {
      console.error('Payment verification failed:', error);
      setIsProcessing(false);
      alert('Payment verification failed. Please try again.');
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validate coupon
  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    try {
      setCouponError('');
      const userId = localStorage.getItem('userId') || null;
      const params = {
        orderAmount: cartTotals?.subtotal || 0,
        ...(userId && { userId })
      };

      const response = await couponsAPI.validateCoupon(couponCode.trim().toUpperCase(), params);
      const data = response.data;
      
      if (data.valid) {
        const discountAmount = parseFloat(data.coupon.discount_amount || 0);
        
        // Recalculate totals with discount
        const newTotals = calculateCartTotals(
          cartItems,
          taxSettings?.tax_enabled || false,
          taxSettings?.tax_rate || 18
        );
        
        // Apply discount to subtotal before tax
        const discountedSubtotal = Math.max(0, newTotals.subtotal - discountAmount);
        const newTaxAmount = taxSettings?.tax_enabled 
          ? (discountedSubtotal * (taxSettings?.tax_rate || 18) / 100)
          : 0;
        const newTotalAmount = discountedSubtotal + newTotals.shippingAmount + newTaxAmount;

        setCouponData({
          ...data.coupon,
          discount_amount: discountAmount
        });
        
        setCartTotals({
          ...newTotals,
          subtotal: newTotals.subtotal,
          discountAmount: discountAmount,
          taxAmount: newTaxAmount,
          totalAmount: newTotalAmount
        });
      } else {
        setCouponData(null);
        setCouponError(data.message || 'Invalid coupon code');
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      console.error('Error details:', error.response?.data);
      setCouponData(null);
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.error || 
                      error.message || 
                      'Error validating coupon. Please try again.';
      setCouponError(errorMsg);
    }
  };

  // Remove coupon
  const removeCoupon = () => {
    setCouponCode('');
    setCouponData(null);
    setCouponError('');
    
    // Recalculate totals without discount
    const newTotals = calculateCartTotals(
      cartItems,
      taxSettings?.tax_enabled || false,
      taxSettings?.tax_rate || 18
    );
    
    setCartTotals({
      ...newTotals,
      discountAmount: 0
    });
  };

  const initiateRazorpayPayment = async (orderData) => {
    try {
      console.log('=== RAZORPAY PAYMENT INITIATION DEBUG ===');
      console.log('Full orderData:', JSON.stringify(orderData, null, 2));
      console.log('orderData.data:', orderData.data);
      console.log('orderData.data.order:', orderData.data.order);
      console.log('cartTotals:', cartTotals);
      
      // Extract order ID from the response
      console.log('Full orderData structure:', JSON.stringify(orderData, null, 2));
      
      let orderId = null;
      
      // Try different possible structures
      if (orderData.data?.order?.id) {
        orderId = orderData.data.order.id;
      } else if (orderData.data?.id) {
        orderId = orderData.data.id;
      } else if (orderData.order?.id) {
        orderId = orderData.order.id;
      } else if (orderData.id) {
        orderId = orderData.id;
      }
      
      console.log('Extracted orderId:', orderId);
      console.log('orderId type:', typeof orderId);
      
      if (!orderId) {
        console.error('Order ID not found in response structure');
        console.error('Available keys in orderData:', Object.keys(orderData));
        if (orderData.data) {
          console.error('Available keys in orderData.data:', Object.keys(orderData.data));
        }
        
        // Fallback: use timestamp-based order ID
        orderId = `order_${Date.now()}`;
        console.log('Using fallback orderId:', orderId);
      }
      
      // Calculate totals if not available
      const totals = cartTotals && cartTotals.totalAmount ? cartTotals : calculateCartTotals(cartItems);
      
      // Validate payment data
      if (!totals.totalAmount || totals.totalAmount <= 0) {
        throw new Error('Invalid cart total amount');
      }
      
      // Ensure orderId is a string
      orderId = String(orderId);
      
      const paymentRequest = {
        amount: parseFloat(totals.totalAmount),
        currency: 'INR',
        order_id: orderId
      };
      console.log('Payment request payload:', paymentRequest);
      console.log('cartTotals:', cartTotals);
      console.log('orderId:', orderId);
      console.log('amount type:', typeof cartTotals.totalAmount);
      console.log('amount value:', cartTotals.totalAmount);
      
      // Create Razorpay order
      console.log('Calling paymentsAPI.createRazorpayOrder...');
      const razorpayOrderResponse = await paymentsAPI.createRazorpayOrder(paymentRequest);
      console.log('Razorpay order response:', razorpayOrderResponse);

      const { order, key } = razorpayOrderResponse.data;

      // Proceed with live Razorpay payment

      // Load Razorpay script for real payments
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const options = {
          key: key,
          amount: order.amount,
          currency: order.currency,
          name: 'Praashibysupal',
          description: `Order #${orderData.data?.order?.order_number || orderData.data?.order_number || orderId}`,
          order_id: order.id,
          handler: async function (response) {
            // Verify payment
            await verifyPaymentMutation.mutateAsync({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: orderId
            });
          },
          prefill: {
            name: formData.customerName,
            email: formData.customerEmail,
            contact: formData.customerPhone
          },
          theme: {
            color: '#1A362B'
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (error) {
      console.error('=== RAZORPAY PAYMENT ERROR ===');
      console.error('Error details:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      setIsProcessing(false);
      
      // Show more detailed error message
      let errorMessage = 'Error initiating payment. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Payment Error: ${errorMessage}`);
    }
  };

  const handleOrderSuccess = (orderData) => {
    // Clear cart data
    localStorage.removeItem('cartItems');
    localStorage.removeItem('cartTotals');
    
    // Show success message with more details
    const orderNumber = orderData?.data?.order?.order_number || orderData?.order?.order_number || orderData?.order_number || 'N/A';
    const paymentMethodText = paymentMethod === 'razorpay' ? 'Online Payment' : 'Cash on Delivery';
    
    alert(
      `🎉 Order Placed Successfully!\n\n` +
      `Order Number: ${orderNumber}\n` +
      `Payment Method: ${paymentMethodText}\n` +
      `Invoice: Auto-generated\n\n` +
      `You can view your order details in the orders section.`
    );
    
    navigate('/orders');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      console.log('=== CHECKOUT FORM SUBMISSION ===');
      console.log('Cart items:', cartItems);
      console.log('Cart totals:', cartTotals);
      console.log('Form data:', formData);
      console.log('Payment method:', paymentMethod);
      
      // Validate cart data
      if (!cartItems || cartItems.length === 0) {
        throw new Error('No items in cart');
      }
      
      // Ensure cartTotals is available
      const totals = cartTotals && cartTotals.totalAmount ? cartTotals : calculateCartTotals(cartItems);
      console.log('Using totals:', totals);
      
      // Calculate final totals with coupon discount
      let finalSubtotal = totals.subtotal;
      let finalDiscount = couponData ? parseFloat(couponData.discount_amount || 0) : 0;
      let finalTaxAmount = totals.taxAmount;
      let finalTotalAmount = totals.totalAmount;

      if (couponData && finalDiscount > 0) {
        // Discount is applied to subtotal (before tax)
        finalSubtotal = Math.max(0, totals.subtotal - finalDiscount);
        
        // Recalculate tax on discounted amount if tax is enabled
        if (taxSettings?.tax_enabled) {
          const taxRate = taxSettings?.tax_rate || 18;
          finalTaxAmount = finalSubtotal * (taxRate / 100);
        }
        
        finalTotalAmount = finalSubtotal + totals.shippingAmount + finalTaxAmount;
      }

      const orderData = {
        items: cartItems.map(item => ({
          productId: item.id,
          productName: item.name,
          productPrice: parseFloat(item.price || 0),
          quantity: item.quantity || 1,
          totalPrice: parseFloat(item.price || 0) * (item.quantity || 1)
        })),
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        shippingAddress: formData.shippingAddress,
        billingAddress: formData.billingAddress || formData.shippingAddress,
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        paymentMethod: paymentMethod,
        subtotal: finalSubtotal + finalDiscount, // Original subtotal before discount
        discountAmount: finalDiscount,
        taxAmount: finalTaxAmount,
        shippingAmount: totals.shippingAmount,
        totalAmount: finalTotalAmount,
        notes: formData.notes
      };

      // Add coupon data if available
      if (couponData && finalDiscount > 0) {
        orderData.couponCode = couponData.code;
        orderData.couponDiscount = finalDiscount;
      }

      console.log('Order data being sent:', JSON.stringify(orderData, null, 2));
      await createOrderMutation.mutateAsync(orderData);
    } catch (error) {
      console.error('Error processing order:', error);
      setIsProcessing(false);
    }
  };

  if (settingsLoading) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="loading">Loading payment options...</div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="no-items">
            <h2>No items in cart</h2>
            <p>Please add items to your cart before proceeding to checkout.</p>
            <button className="btn-primary" onClick={() => navigate('/cart')}>
              Go to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-header">
          <h1>Checkout</h1>
          <p>Complete your order</p>
        </div>

        <div className="checkout-content">
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="form-section">
              <h2>Customer Information</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Shipping Address</h2>
              <div className="form-group">
                <label>Address *</label>
                <textarea
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleInputChange}
                  rows="3"
                  required
                />
              </div>
              <div className="form-group">
                <label>Billing Address (if different)</label>
                <textarea
                  name="billingAddress"
                  value={formData.billingAddress}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Leave empty to use shipping address"
                />
              </div>
            </div>

            <div className="form-section">
              <h2>Payment Method</h2>
              <div className="payment-methods">
                {console.log('Payment settings in render:', paymentSettings)}
                {console.log('Razorpay enabled:', paymentSettings?.data?.razorpay_enabled)}
                {console.log('COD enabled:', paymentSettings?.data?.cod_enabled)}
                {paymentSettings?.data?.razorpay_enabled && (
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="payment-info">
                      <span className="payment-name">Online Payment (Razorpay)</span>
                      <span className="payment-desc">Pay securely with cards, UPI, net banking</span>
                    </div>
                  </label>
                )}
                
                {paymentSettings?.data?.cod_enabled && (
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="payment-info">
                      <span className="payment-name">Cash on Delivery</span>
                      <span className="payment-desc">Pay when your order is delivered</span>
                    </div>
                  </label>
                )}
                
                {/* Fallback if no payment methods are enabled */}
                {!paymentSettings?.data?.razorpay_enabled && !paymentSettings?.data?.cod_enabled && (
                  <div className="no-payment-methods">
                    <p>No payment methods available. Please contact support.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="form-section">
              <h2>Coupon Code</h2>
              <div className="coupon-section">
                {couponData ? (
                  <div className="coupon-applied">
                    <div className="coupon-details">
                      <span className="coupon-code">{couponData.code}</span>
                      <span className="discount-amount">-₹{couponData.discount_amount.toFixed(2)}</span>
                    </div>
                    <button 
                      type="button" 
                      className="btn-remove-coupon"
                      onClick={removeCoupon}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="coupon-input-container">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      className="coupon-input"
                    />
                    <button 
                      type="button" 
                      className="btn-apply-coupon"
                      onClick={validateCoupon}
                      disabled={!couponCode.trim()}
                    >
                      Apply
                    </button>
                  </div>
                )}
                {couponError && <div className="coupon-error">{couponError}</div>}
              </div>
            </div>

            <div className="form-section">
              <div className="form-group">
                <label>Order Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Any special instructions for your order..."
                />
              </div>
            </div>

            <div className="checkout-actions">
              <button type="button" className="btn-secondary" onClick={() => navigate('/cart')}>
                Back to Cart
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 
                 paymentMethod === 'razorpay' ? 'Pay Now' : 'Place Order'}
              </button>
            </div>
          </form>

          <div className="order-summary">
            <h2>Order Summary</h2>
            
            <div className="order-items">
              {cartItems && cartItems.length > 0 ? (
                cartItems.map(item => (
                  <div key={item.id || `${item.name}-${item.price}`} className="order-item">
                    <img src={item.image || '/placeholder-image.jpg'} alt={item.name || 'Product'} />
                    <div className="item-info">
                      <h4>{item.name || 'Unnamed Product'}</h4>
                      <p>₹{parseFloat(item.price || 0).toFixed(2)} × {item.quantity || 1}</p>
                    </div>
                    <span className="item-total">₹{(parseFloat(item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <p>No items in cart</p>
              )}
            </div>

            <div className="summary-totals">
              <div className="summary-row">
                <span className="summary-label">Subtotal:</span>
                <span className="summary-value">₹{parseFloat(cartTotals?.subtotal || 0).toFixed(2)}</span>
              </div>
              {couponData && (cartTotals?.discountAmount || couponData.discount_amount || 0) > 0 && (
                <div className="summary-row discount">
                  <span className="summary-label">Discount ({couponData.code}):</span>
                  <span className="summary-value">-₹{parseFloat(cartTotals?.discountAmount || couponData.discount_amount || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="summary-row">
                <span className="summary-label">Shipping:</span>
                <span className="summary-value">
                  {cartTotals?.shippingAmount === 0 || cartTotals?.shippingAmount === undefined || cartTotals?.shippingAmount === null 
                    ? 'Free' 
                    : `₹${parseFloat(cartTotals?.shippingAmount || 0).toFixed(2)}`}
                </span>
              </div>
              {taxSettings?.tax_enabled && (
                <div className="summary-row">
                  <span className="summary-label">Tax ({taxSettings?.tax_rate || 18}%):</span>
                  <span className="summary-value">₹{parseFloat(cartTotals?.taxAmount || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="summary-row total">
                <span className="summary-label">Total:</span>
                <span className="summary-value">₹{parseFloat(cartTotals?.totalAmount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;