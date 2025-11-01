import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { couponsAPI } from '../services/api';
import toast from 'react-hot-toast';
import './CouponCheckout.css';

const CouponCheckout = ({ orderAmount, onCouponApplied, appliedCoupon, onRemoveCoupon }) => {
  const [couponCode, setCouponCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const validateCouponMutation = useMutation(
    (code) => couponsAPI.validateCoupon(code, { orderAmount }),
    {
      onSuccess: (data) => {
        if (data.valid) {
          toast.success(`Coupon "${data.coupon.code}" applied successfully!`);
          onCouponApplied(data.coupon);
        } else {
          toast.error(data.message || 'Invalid coupon code');
        }
        setIsValidating(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error validating coupon');
        setIsValidating(false);
      }
    }
  );

  const applyCouponMutation = useMutation(
    (couponData) => couponsAPI.applyCoupon(couponData),
    {
      onSuccess: (data) => {
        toast.success('Coupon applied to order!');
        onCouponApplied(data.discount);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error applying coupon');
      }
    }
  );

  const handleValidateCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsValidating(true);
    validateCouponMutation.mutate(couponCode.trim().toUpperCase());
  };

  const handleRemoveCoupon = () => {
    onRemoveCoupon();
    toast.success('Coupon removed');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="coupon-checkout">
      <div className="coupon-section">
        <h3>🎫 Apply Coupon</h3>
        
        {!appliedCoupon ? (
          <form onSubmit={handleValidateCoupon} className="coupon-form">
            <div className="coupon-input-group">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="coupon-input"
                disabled={isValidating}
              />
              <button 
                type="submit" 
                className="apply-coupon-btn"
                disabled={isValidating || !couponCode.trim()}
              >
                {isValidating ? 'Validating...' : 'Apply'}
              </button>
            </div>
          </form>
        ) : (
          <div className="applied-coupon">
            <div className="coupon-info">
              <div className="coupon-details">
                <strong>{appliedCoupon.code || appliedCoupon.coupon_code}</strong>
                <span className="coupon-name">{appliedCoupon.name || appliedCoupon.coupon_name}</span>
              </div>
              <div className="discount-amount">
                -{formatCurrency(appliedCoupon.discount_amount || appliedCoupon.value)}
              </div>
            </div>
            <button 
              onClick={handleRemoveCoupon}
              className="remove-coupon-btn"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="order-summary">
        <h3>Order Summary</h3>
        <div className="summary-row">
          <span>Subtotal:</span>
          <span>{formatCurrency(orderAmount)}</span>
        </div>
        
        {appliedCoupon && (
          <div className="summary-row discount-row">
            <span>Discount ({appliedCoupon.code || appliedCoupon.coupon_code}):</span>
            <span>-{formatCurrency(appliedCoupon.discount_amount || appliedCoupon.value)}</span>
          </div>
        )}
        
        <div className="summary-row total-row">
          <span>Total:</span>
          <span>
            {formatCurrency(
              orderAmount - (appliedCoupon ? (appliedCoupon.discount_amount || appliedCoupon.value) : 0)
            )}
          </span>
        </div>
      </div>

      {/* Coupon Benefits */}
      <div className="coupon-benefits">
        <h4>💡 Coupon Benefits</h4>
        <ul>
          <li>✅ Instant discount on your order</li>
          <li>✅ No minimum purchase for most coupons</li>
          <li>✅ Valid for limited time only</li>
          <li>✅ One coupon per order</li>
        </ul>
      </div>

      {/* Popular Coupons */}
      <div className="popular-coupons">
        <h4>🔥 Popular Coupons</h4>
        <div className="coupon-suggestions">
          <div className="suggestion-item">
            <span className="suggestion-code">WELCOME20</span>
            <span className="suggestion-desc">20% off for new customers</span>
          </div>
          <div className="suggestion-item">
            <span className="suggestion-code">FLASH50</span>
            <span className="suggestion-desc">₹50 off on orders above ₹200</span>
          </div>
          <div className="suggestion-item">
            <span className="suggestion-code">VIP15</span>
            <span className="suggestion-desc">15% off for VIP customers</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponCheckout;




