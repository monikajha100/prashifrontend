import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaPlus, FaMinus, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { paymentsAPI, ordersAPI, storefrontAPI, couponsAPI } from '../services/api';
import api from '../services/api';
import './Checkout.css';


const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const offerId = searchParams.get('offer');
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
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [offerDiscount, setOfferDiscount] = useState(0);
  const [discountedItems, setDiscountedItems] = useState([]); // Store item-level discount info
  const [availableOffers, setAvailableOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(false);

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
  const calculateCartTotals = (items, taxEnabled = false, taxRate = 18, discountedSubtotal = null) => {
    if (!items || items.length === 0) {
      return {
        subtotal: 0,
        shippingAmount: 0,
        taxAmount: 0,
        totalAmount: 0
      };
    }
    
    const subtotal = discountedSubtotal !== null ? discountedSubtotal : items.reduce((sum, item) => {
      const price = parseFloat(item.price || 0);
      const quantity = parseInt(item.quantity || 1);
      return sum + (price * quantity);
    }, 0);
    
    // Shipping: Free if subtotal >= 999, otherwise Rs 70
    const shippingAmount = subtotal >= 999 ? 0 : 70;
    const taxAmount = taxEnabled ? (subtotal * taxRate / 100) : 0;
    const totalAmount = subtotal + shippingAmount + taxAmount;
    
    return {
      subtotal: Math.max(0, subtotal),
      shippingAmount: Math.max(0, shippingAmount),
      taxAmount: Math.max(0, taxAmount),
      totalAmount: Math.max(0, totalAmount)
    };
  };

  // Fetch all available special offers (show all active offers)
  useEffect(() => {
    const fetchOffers = async () => {
      setLoadingOffers(true);
      try {
        // Fetch all special offers (not just date-filtered ones) for checkout
        const response = await api.get('/special-offers?show_all=true');
        console.log('=== SPECIAL OFFERS FETCH DEBUG ===');
        console.log('Full response:', response);
        console.log('Response data:', response.data);
        console.log('Response data type:', Array.isArray(response.data) ? 'Array' : typeof response.data);
        console.log('Response data length:', Array.isArray(response.data) ? response.data.length : 'Not an array');
        
        let offers = [];
        if (Array.isArray(response.data)) {
          offers = response.data;
        } else if (response.data && typeof response.data === 'object') {
          // Handle case where data might be wrapped
          if (Array.isArray(response.data.offers)) {
            offers = response.data.offers;
          } else if (Array.isArray(response.data.data)) {
            offers = response.data.data;
          } else {
            // If it's an object with an array inside, try to extract it
            offers = Object.values(response.data).find(val => Array.isArray(val)) || [];
          }
        }
        
        console.log(`Final offers array length: ${offers.length}`);
        console.log('Final offers:', offers);
        console.log('Offer IDs:', offers.map(o => o.id));
        console.log('Offer titles:', offers.map(o => o.title));
        console.log('Offer is_active:', offers.map(o => o.is_active));
        
        setAvailableOffers(offers);
      } catch (error) {
        console.error('Error fetching special offers:', error);
        console.error('Error response:', error.response);
        // Fallback to regular endpoint if query param doesn't work
        try {
          const fallbackResponse = await api.get('/special-offers');
          console.log('Fallback response:', fallbackResponse.data);
          const fallbackOffers = Array.isArray(fallbackResponse.data) 
            ? fallbackResponse.data 
            : (fallbackResponse.data?.offers || fallbackResponse.data?.data || []);
          console.log(`Fallback offers count: ${fallbackOffers.length}`);
          setAvailableOffers(fallbackOffers);
        } catch (fallbackError) {
          console.error('Error fetching offers (fallback):', fallbackError);
        }
      } finally {
        setLoadingOffers(false);
      }
    };
    fetchOffers();
  }, []);

  // Fetch offer details if offer ID is provided via URL
  useEffect(() => {
    if (offerId && !selectedOffer) {
      const fetchOffer = async () => {
        try {
          const response = await api.get(`/special-offers/${offerId}`);
          const offer = response.data;
          applyOffer(offer);
        } catch (error) {
          console.error('Error fetching offer:', error);
        }
      };
      fetchOffer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offerId]);

  // Apply an offer - automatically removes previous offer
  const applyOffer = async (offer) => {
    console.log('applyOffer called with:', offer);
    
    if (!offer) {
      console.error('No offer provided');
      toast.error('No offer selected');
      return;
    }
    
    // Remove previous offer if any (only one offer at a time)
    if (selectedOffer) {
      console.log('Removing previous offer:', selectedOffer.title);
      removeOffer();
    }
    
    // Get cart items
    const itemsToUse = cartItems.length > 0 ? cartItems : (() => {
      const savedCartItems = localStorage.getItem('cartItems');
      return savedCartItems ? JSON.parse(savedCartItems) : [];
    })();
    
    if (!itemsToUse || itemsToUse.length === 0) {
      console.error('No cart items found');
      toast.error('Your cart is empty. Please add items to your cart first.');
      return;
    }
    
    // Show loading toast
    const loadingToast = toast.loading('Applying offer...');
    
    try {
      console.log('Calling API with offer_id:', offer.id);
      console.log('Cart items:', itemsToUse.map(item => ({
        id: item.id || item.product_id,
        product_id: item.product_id || item.id,
        category_id: item.category_id || item.categoryId,
        price: parseFloat(item.price || 0),
        quantity: parseInt(item.quantity || 1)
      })));
      
      // Call backend to calculate discount (handles all offer types)
      const response = await api.post('/special-offers/calculate', {
        offer_id: offer.id,
        cart_items: itemsToUse.map(item => ({
          id: item.id || item.product_id,
          product_id: item.product_id || item.id,
          category_id: item.category_id || item.categoryId,
          price: parseFloat(item.price || 0),
          quantity: parseInt(item.quantity || 1)
        }))
      });
      
      console.log('API Response:', response.data);
      
      if (!response.data.success) {
        toast.dismiss(loadingToast);
        toast.error(response.data.message || 'This offer cannot be applied to your cart.');
        return;
      }
      
      const discount = parseFloat(response.data.discount || 0);
      const message = response.data.message || 'Offer applied';
      const discountedItemsData = response.data.discounted_items || [];
      
      console.log('Offer calculated:', offer.title, 'Discount:', discount, message);
      console.log('Discounted items:', discountedItemsData);
      
      if (discount <= 0) {
        toast.dismiss(loadingToast);
        // Use backend message if available, otherwise show generic message
        const errorMessage = message && message !== 'Offer applied' 
          ? message 
          : 'No discount available for this offer with your current cart items.';
        toast.error(errorMessage);
        return;
      }
      
      // Calculate base subtotal
      const baseSubtotal = itemsToUse.reduce((sum, item) => {
        const price = parseFloat(item.price || 0);
        const quantity = parseInt(item.quantity || 1);
        return sum + (price * quantity);
      }, 0);
      
      // Update state
      setSelectedOffer(offer);
      setOfferDiscount(discount);
      setDiscountedItems(discountedItemsData); // Store item-level discount info
      setCouponData(null); // Remove coupon if offer is applied
      setCouponCode('');
      setCouponError('');
      
      // Get tax settings
      const taxEnabled = taxSettings?.tax_enabled || false;
      const taxRate = taxSettings?.tax_rate || 18;
      
      // Calculate base totals
      const baseTotals = calculateCartTotals(itemsToUse, taxEnabled, taxRate);
      
      // Apply discount
      const finalSubtotal = Math.max(0, baseSubtotal - discount);
      let finalTaxAmount = 0;
      
      // Recalculate tax on discounted amount if tax is enabled
      if (taxEnabled) {
        finalTaxAmount = finalSubtotal * (taxRate / 100);
      }
      
      // Recalculate shipping based on discounted subtotal
      const finalShippingAmount = finalSubtotal >= 999 ? 0 : 70;
      const finalTotalAmount = finalSubtotal + finalShippingAmount + finalTaxAmount;
      
      // Update cart totals
      const updatedTotals = {
        ...baseTotals,
        subtotal: finalSubtotal,
        shippingAmount: finalShippingAmount,
        taxAmount: finalTaxAmount,
        totalAmount: finalTotalAmount,
        discountAmount: discount,
        originalSubtotal: baseSubtotal
      };
      
      console.log('Updated totals with offer:', updatedTotals);
      
      setCartTotals(updatedTotals);
      
      // Update localStorage
      localStorage.setItem('cartTotals', JSON.stringify(updatedTotals));
      localStorage.setItem('selectedOffer', JSON.stringify(offer));
      localStorage.setItem('offerDiscount', discount.toString());
      
      // Show success feedback
      toast.dismiss(loadingToast);
      toast.success(`🎉 ${offer.title} applied! You saved ₹${discount.toFixed(2)}`);
      console.log('Offer applied successfully!', message);
      
    } catch (error) {
      console.error('Error calculating offer:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      toast.dismiss(loadingToast);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to apply offer. Please try again.';
      toast.error(errorMessage);
    }
  };

  // Remove offer
  const removeOffer = () => {
    const offerTitle = selectedOffer?.title || 'Offer';
    setSelectedOffer(null);
    setOfferDiscount(0);
    setDiscountedItems([]); // Clear discounted items
    localStorage.removeItem('selectedOffer');
    localStorage.removeItem('offerDiscount');
    
    // Recalculate totals without offer
    const itemsToUse = cartItems.length > 0 ? cartItems : (() => {
      const savedCartItems = localStorage.getItem('cartItems');
      return savedCartItems ? JSON.parse(savedCartItems) : [];
    })();
    
    if (!itemsToUse || itemsToUse.length === 0) {
      return;
    }
    
    const taxEnabled = taxSettings?.tax_enabled || false;
    const taxRate = taxSettings?.tax_rate || 18;
    
    const totals = calculateCartTotals(itemsToUse, taxEnabled, taxRate);
    
    const updatedTotals = {
      ...totals,
      discountAmount: 0,
      originalSubtotal: totals.subtotal
    };
    
    setCartTotals(updatedTotals);
    localStorage.setItem('cartTotals', JSON.stringify(updatedTotals));
    
    toast.success(`${offerTitle} removed`);
  };

  // Load cart data from localStorage and recalculate totals when tax settings change
  useEffect(() => {
    const savedCartItems = localStorage.getItem('cartItems');
    
    // Restore selected offer from localStorage
    const savedOffer = localStorage.getItem('selectedOffer');
    const savedDiscount = localStorage.getItem('offerDiscount');
    if (savedOffer && !selectedOffer) {
      try {
        const offer = JSON.parse(savedOffer);
        setSelectedOffer(offer);
        if (savedDiscount) {
          setOfferDiscount(parseFloat(savedDiscount));
        }
      } catch (error) {
        console.error('Error parsing saved offer:', error);
        localStorage.removeItem('selectedOffer');
        localStorage.removeItem('offerDiscount');
      }
    }
    
    if (savedCartItems) {
      const items = JSON.parse(savedCartItems);
      setCartItems(items);
      
      // Recalculate totals with current tax settings and offer discount
      if (taxSettings !== undefined) {
        const baseTotals = calculateCartTotals(
          items,
          taxSettings.tax_enabled || false,
          taxSettings.tax_rate || 18
        );
        
        // Apply offer discount if available
        let finalSubtotal = baseTotals.subtotal;
        let finalTaxAmount = baseTotals.taxAmount;
        let finalShippingAmount = baseTotals.shippingAmount;
        let finalTotalAmount = baseTotals.totalAmount;
        let discount = 0;
        
        // Use saved discount if available, otherwise calculate from selectedOffer
        if (savedDiscount) {
          discount = parseFloat(savedDiscount);
        } else if (selectedOffer && selectedOffer.discount_percentage) {
          discount = (baseTotals.subtotal * selectedOffer.discount_percentage) / 100;
        }
        
        if (discount > 0) {
          finalSubtotal = Math.max(0, baseTotals.subtotal - discount);
          
          // Recalculate tax on discounted amount if tax is enabled
          if (taxSettings.tax_enabled) {
            const taxRate = taxSettings.tax_rate || 18;
            finalTaxAmount = finalSubtotal * (taxRate / 100);
          }
          
          // Recalculate shipping based on discounted subtotal
          finalShippingAmount = finalSubtotal >= 999 ? 0 : 70;
          finalTotalAmount = finalSubtotal + finalShippingAmount + finalTaxAmount;
        }
        
        setCartTotals({
          ...baseTotals,
          subtotal: finalSubtotal,
          shippingAmount: finalShippingAmount,
          taxAmount: finalTaxAmount,
          totalAmount: finalTotalAmount,
          discountAmount: discount || offerDiscount || 0,
          originalSubtotal: baseTotals.subtotal
        });
        
        // Update localStorage with new totals
        localStorage.setItem('cartTotals', JSON.stringify({
          ...baseTotals,
          subtotal: finalSubtotal,
          shippingAmount: finalShippingAmount,
          taxAmount: finalTaxAmount,
          totalAmount: finalTotalAmount,
          discountAmount: discount || offerDiscount || 0,
          originalSubtotal: baseTotals.subtotal
        }));
      } else {
        // Fallback: use existing totals if available, otherwise calculate with defaults
        const savedCartTotals = localStorage.getItem('cartTotals');
        if (savedCartTotals) {
          try {
            const parsedTotals = JSON.parse(savedCartTotals);
            // Preserve originalSubtotal if it exists, otherwise calculate it
            let originalSubtotal = parsedTotals.originalSubtotal;
            if (!originalSubtotal && parsedTotals.discountAmount && parsedTotals.subtotal) {
              // Reconstruct original: discounted subtotal + discount amount
              originalSubtotal = parsedTotals.subtotal + parsedTotals.discountAmount;
            } else if (!originalSubtotal) {
              // Calculate from cart items
              originalSubtotal = items.reduce((sum, item) => {
                const price = parseFloat(item.price || 0);
                const quantity = parseInt(item.quantity || 1);
                return sum + (price * quantity);
              }, 0);
              // If calculation gives 0, use subtotal as fallback
              if (originalSubtotal === 0) {
                originalSubtotal = parsedTotals.subtotal || 0;
              }
            }
            
            setCartTotals({
              subtotal: parsedTotals.subtotal || 0,
              shippingAmount: parsedTotals.shippingAmount ?? 0,
              taxAmount: parsedTotals.taxAmount || 0,
              totalAmount: parsedTotals.totalAmount || 0,
              discountAmount: parsedTotals.discountAmount || 0,
              originalSubtotal: originalSubtotal
            });
          } catch (error) {
            // If parsing fails, calculate fresh totals
            const totals = calculateCartTotals(items, false, 18);
            // Calculate original subtotal from items
            const originalSubtotal = items.reduce((sum, item) => {
              const price = parseFloat(item.price || 0);
              const quantity = parseInt(item.quantity || 1);
              return sum + (price * quantity);
            }, 0);
            setCartTotals({
              ...totals,
              originalSubtotal: originalSubtotal || totals.subtotal
            });
          }
        } else {
          // Calculate with default (no tax)
          const totals = calculateCartTotals(items, false, 18);
          // Calculate original subtotal from items
          const originalSubtotal = items.reduce((sum, item) => {
            const price = parseFloat(item.price || 0);
            const quantity = parseInt(item.quantity || 1);
            return sum + (price * quantity);
          }, 0);
          setCartTotals({
            ...totals,
            originalSubtotal: originalSubtotal || totals.subtotal
          });
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

  // Update quantity for a cart item
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }
    
    const updatedItems = cartItems.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
    
    // Recalculate totals
    if (taxSettings !== undefined) {
      const totals = calculateCartTotals(
        updatedItems,
        taxSettings.tax_enabled || false,
        taxSettings.tax_rate || 18
      );
      
      // If there's a discount applied, we need to recalculate it
      // For now, preserve the discount amount and recalculate original subtotal
      const currentDiscount = cartTotals?.discountAmount || 0;
      const originalSubtotal = totals.subtotal; // New original subtotal from updated items
      
      // If discount exists, recalculate discounted subtotal
      let finalSubtotal = originalSubtotal;
      let finalTaxAmount = totals.taxAmount;
      let finalShippingAmount = totals.shippingAmount;
      let finalTotalAmount = totals.totalAmount;
      
      if (currentDiscount > 0) {
        finalSubtotal = Math.max(0, originalSubtotal - currentDiscount);
        
        // Recalculate tax on discounted amount if tax is enabled
        if (taxSettings.tax_enabled) {
          const taxRate = taxSettings.tax_rate || 18;
          finalTaxAmount = finalSubtotal * (taxRate / 100);
        }
        
        // Recalculate shipping based on discounted subtotal
        finalShippingAmount = finalSubtotal >= 999 ? 0 : 70;
        finalTotalAmount = finalSubtotal + finalShippingAmount + finalTaxAmount;
      }
      
      const updatedTotals = {
        ...totals,
        subtotal: finalSubtotal,
        shippingAmount: finalShippingAmount,
        taxAmount: finalTaxAmount,
        totalAmount: finalTotalAmount,
        discountAmount: currentDiscount,
        originalSubtotal: originalSubtotal
      };
      
      setCartTotals(updatedTotals);
      localStorage.setItem('cartTotals', JSON.stringify(updatedTotals));
    }
  };

  // Remove item from cart
  const removeItem = (itemId) => {
    const updatedItems = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
    
    // If cart is empty, redirect to cart page
    if (updatedItems.length === 0) {
      navigate('/cart');
      return;
    }
    
    // Recalculate totals
    if (taxSettings !== undefined) {
      const totals = calculateCartTotals(
        updatedItems,
        taxSettings.tax_enabled || false,
        taxSettings.tax_rate || 18
      );
      
      // If there's a discount applied, we need to recalculate it
      const currentDiscount = cartTotals?.discountAmount || 0;
      const originalSubtotal = totals.subtotal; // New original subtotal from updated items
      
      // If discount exists, recalculate discounted subtotal
      let finalSubtotal = originalSubtotal;
      let finalTaxAmount = totals.taxAmount;
      let finalShippingAmount = totals.shippingAmount;
      let finalTotalAmount = totals.totalAmount;
      
      if (currentDiscount > 0) {
        finalSubtotal = Math.max(0, originalSubtotal - currentDiscount);
        
        // Recalculate tax on discounted amount if tax is enabled
        if (taxSettings.tax_enabled) {
          const taxRate = taxSettings.tax_rate || 18;
          finalTaxAmount = finalSubtotal * (taxRate / 100);
        }
        
        // Recalculate shipping based on discounted subtotal
        finalShippingAmount = finalSubtotal >= 999 ? 0 : 70;
        finalTotalAmount = finalSubtotal + finalShippingAmount + finalTaxAmount;
      }
      
      const updatedTotals = {
        ...totals,
        subtotal: finalSubtotal,
        shippingAmount: finalShippingAmount,
        taxAmount: finalTaxAmount,
        totalAmount: finalTotalAmount,
        discountAmount: currentDiscount,
        originalSubtotal: originalSubtotal
      };
      
      setCartTotals(updatedTotals);
      localStorage.setItem('cartTotals', JSON.stringify(updatedTotals));
    }
  };

  // Clear entire cart
  const clearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      localStorage.removeItem('cartItems');
      localStorage.removeItem('cartTotals');
      navigate('/cart');
    }
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
        // Remove offer if coupon is applied
        if (selectedOffer) {
          removeOffer();
        }
        
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
        // Recalculate shipping based on discounted subtotal
        const newShippingAmount = discountedSubtotal >= 999 ? 0 : 70;
        const newTotalAmount = discountedSubtotal + newShippingAmount + newTaxAmount;

        setCouponData({
          ...data.coupon,
          discount_amount: discountAmount
        });
        
        setCartTotals({
          ...newTotals,
          subtotal: discountedSubtotal,
          shippingAmount: newShippingAmount,
          discountAmount: discountAmount,
          taxAmount: newTaxAmount,
          totalAmount: newTotalAmount,
          originalSubtotal: newTotals.subtotal
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
      discountAmount: 0,
      originalSubtotal: newTotals.subtotal
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
      
      // Calculate final totals with coupon or offer discount
      let finalSubtotal = totals.originalSubtotal || totals.subtotal;
      let finalDiscount = 0;
      let finalTaxAmount = totals.taxAmount;
      let finalShippingAmount = totals.shippingAmount || 0;
      let finalTotalAmount = totals.totalAmount;

      // Prioritize offer discount if available, otherwise use coupon
      if (selectedOffer && offerDiscount > 0) {
        finalDiscount = offerDiscount;
        finalSubtotal = Math.max(0, (totals.originalSubtotal || totals.subtotal) - finalDiscount);
        
        // Recalculate tax on discounted amount if tax is enabled
        if (taxSettings?.tax_enabled) {
          const taxRate = taxSettings?.tax_rate || 18;
          finalTaxAmount = finalSubtotal * (taxRate / 100);
        }
        
        // Recalculate shipping based on discounted subtotal
        finalShippingAmount = finalSubtotal >= 999 ? 0 : 70;
        finalTotalAmount = finalSubtotal + finalShippingAmount + finalTaxAmount;
      } else if (couponData) {
        finalDiscount = parseFloat(couponData.discount_amount || 0);
        // Discount is applied to subtotal (before tax)
        finalSubtotal = Math.max(0, (totals.originalSubtotal || totals.subtotal) - finalDiscount);
        
        // Recalculate tax on discounted amount if tax is enabled
        if (taxSettings?.tax_enabled) {
          const taxRate = taxSettings?.tax_rate || 18;
          finalTaxAmount = finalSubtotal * (taxRate / 100);
        }
        
        // Recalculate shipping based on discounted subtotal
        finalShippingAmount = finalSubtotal >= 999 ? 0 : 70;
        finalTotalAmount = finalSubtotal + finalShippingAmount + finalTaxAmount;
      } else {
        // No discount applied, recalculate shipping based on current subtotal
        finalShippingAmount = finalSubtotal >= 999 ? 0 : 70;
        finalTotalAmount = finalSubtotal + finalShippingAmount + finalTaxAmount;
      }

      // Map cart items with item-level discounts if available
      const orderItems = cartItems.map(item => {
        const itemId = item.id || item.product_id;
        const discountedItem = discountedItems.find(di => 
          (di.id === itemId || di.product_id === itemId)
        );
        
        const basePrice = parseFloat(item.price || 0);
        const quantity = parseInt(item.quantity || 1);
        
        // If this item has a discount, apply it
        if (discountedItem && discountedItem.quantity > 0) {
          // Calculate how many units get discounted
          const discountedQty = Math.min(discountedItem.quantity, quantity);
          const fullPriceQty = quantity - discountedQty;
          const discountPerUnit = discountedItem.discount / discountedItem.quantity;
          
          const discountedPrice = basePrice - discountPerUnit;
          const totalPrice = (basePrice * fullPriceQty) + (discountedPrice * discountedQty);
          
          return {
            productId: item.id,
            productName: item.name,
            productPrice: basePrice,
            quantity: quantity,
            totalPrice: totalPrice,
            discountedQuantity: discountedQty,
            discountPerUnit: discountPerUnit,
            discountPercentage: discountedItem.discountPercentage || 0
          };
        }
        
        // No discount for this item
        return {
          productId: item.id,
          productName: item.name,
          productPrice: basePrice,
          quantity: quantity,
          totalPrice: basePrice * quantity
        };
      });
      
      const orderData = {
        items: orderItems,
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
        shippingAmount: finalShippingAmount, // Shipping calculated based on discounted subtotal
        totalAmount: finalTotalAmount,
        notes: formData.notes
      };

      // Add coupon data if available
      if (couponData && finalDiscount > 0) {
        orderData.couponCode = couponData.code;
        orderData.couponDiscount = finalDiscount;
      }

      // Add offer ID if available
      if (selectedOffer && selectedOffer.id) {
        orderData.offerId = parseInt(selectedOffer.id);
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
              <h2>Special Offers {availableOffers.length > 0 && <span className="offers-count">({availableOffers.length} available)</span>}</h2>
              <div className="offers-section">
                {loadingOffers ? (
                  <div className="loading-offers">Loading offers...</div>
                ) : selectedOffer ? (
                  <div className="offer-applied">
                    <div className="offer-details">
                      <span className="offer-icon">{selectedOffer.icon || '🎁'}</span>
                      <div className="offer-info">
                        <span className="offer-title">{selectedOffer.title}</span>
                        <span className="discount-amount">-₹{offerDiscount.toFixed(2)} {
                          selectedOffer.discount_percentage 
                            ? `(${selectedOffer.discount_percentage}% OFF)`
                            : selectedOffer.offer_type === 'buy_x_get_y'
                            ? `(Buy ${selectedOffer.buy_quantity} Get ${selectedOffer.get_quantity} Free)`
                            : selectedOffer.offer_type === 'fixed_amount'
                            ? `(₹${selectedOffer.discount_amount} OFF)`
                            : '(Discount Applied)'
                        }</span>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      className="btn-remove-offer"
                      onClick={removeOffer}
                    >
                      Remove
                    </button>
                  </div>
                ) : availableOffers.length > 0 ? (
                  <div className="offers-list">
                    {/* Debug: Show count */}
                    {console.log('Rendering offers list:', availableOffers.length, 'offers')}
                    {availableOffers.map((offer, index) => {
                      console.log(`Rendering offer ${index + 1}:`, offer.id, offer.title, 'is_active:', offer.is_active);
                      
                      // Parse offer description for conditions (e.g., "Buy any 3 items")
                      const itemsToUse = cartItems.length > 0 ? cartItems : (() => {
                        const savedCartItems = localStorage.getItem('cartItems');
                        return savedCartItems ? JSON.parse(savedCartItems) : [];
                      })();
                      
                      // Filter eligible items based on product_ids or category_ids (same logic as backend)
                      let eligibleItems = itemsToUse;
                      
                      // Filter by product IDs if specified
                      if (offer.product_ids) {
                        const productIdArray = offer.product_ids.split(',').map(id => parseInt(id.trim()));
                        eligibleItems = itemsToUse.filter(item => 
                          productIdArray.includes(parseInt(item.id)) || 
                          productIdArray.includes(parseInt(item.product_id))
                        );
                      }
                      
                      // Filter by category IDs if specified
                      if (offer.category_ids && eligibleItems.length > 0) {
                        const categoryIdArray = offer.category_ids.split(',').map(id => parseInt(id.trim()));
                        eligibleItems = eligibleItems.filter(item => {
                          const itemCategoryId = parseInt(item.category_id || item.categoryId || 0);
                          return categoryIdArray.includes(itemCategoryId);
                        });
                      }
                      
                      // Calculate total quantity of ELIGIBLE items only (not all cart items)
                      const totalEligibleItems = eligibleItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
                      const totalCartItems = itemsToUse.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
                      
                      // Check if offer has any discount mechanism
                      // Allow offers with explicit discount fields OR offer types that suggest discounts
                      const normalizedOfferType = (offer.offer_type || '').toString().trim().toLowerCase();
                      const isPercentageType = ['percentage', 'flash_sale', 'discount_percentage', 'new_arrival', 'referral', 'minimum_purchase'].includes(normalizedOfferType);
                      const isFixedType = ['fixed_amount', 'discount_fixed'].includes(normalizedOfferType);
                      const isBOGOType = normalizedOfferType === 'buy_x_get_y';
                      
                      const hasPercentage = (offer.discount_percentage && offer.discount_percentage > 0) || (isPercentageType && !isBOGOType);
                      const hasFixedAmount = (offer.discount_amount && parseFloat(offer.discount_amount) > 0) || isFixedType;
                      const hasBOGO = isBOGOType && offer.buy_quantity && offer.get_quantity;
                      const hasMinimumPurchase = offer.minimum_purchase_amount && parseFloat(offer.minimum_purchase_amount) > 0;
                      
                      // Calculate cart subtotal for minimum purchase check
                      const cartSubtotal = itemsToUse.reduce((sum, item) => {
                        return sum + (parseFloat(item.price || 0) * (parseInt(item.quantity) || 1));
                      }, 0);
                      
                      // Check conditions
                      let meetsCondition = true;
                      let conditionText = '';
                      
                      // Check minimum purchase amount
                      if (hasMinimumPurchase) {
                        const minAmount = parseFloat(offer.minimum_purchase_amount);
                        meetsCondition = cartSubtotal >= minAmount;
                        conditionText = meetsCondition 
                          ? `✓ Order value ₹${cartSubtotal.toFixed(2)} (Min ₹${minAmount})`
                          : `✗ Minimum order ₹${minAmount} required (You have ₹${cartSubtotal.toFixed(2)})`;
                      }
                      
                      // Check BOGO conditions - use ELIGIBLE items count, not total cart items
                      if (hasBOGO) {
                        const requiredQty = parseInt(offer.buy_quantity) + parseInt(offer.get_quantity);
                        // For BOGO, only count eligible items (e.g., only earrings if offer is for earrings)
                        const eligibleQty = totalEligibleItems;
                        meetsCondition = meetsCondition && eligibleQty >= requiredQty;
                        
                        // Build condition text with eligible items info
                        const itemType = offer.product_ids ? 'eligible product(s)' : 
                                       offer.category_ids ? 'eligible item(s)' : 'item(s)';
                        
                        if (!meetsCondition && !conditionText) {
                          conditionText = `✗ Buy ${offer.buy_quantity} Get ${offer.get_quantity} Free - Need ${requiredQty} ${itemType} (You have ${eligibleQty} eligible, ${totalCartItems} total)`;
                        } else if (!meetsCondition) {
                          conditionText += ` | Need ${requiredQty} ${itemType} for BOGO (You have ${eligibleQty} eligible)`;
                        } else {
                          // Condition met - show success message
                          conditionText = conditionText || `✓ ${eligibleQty} eligible ${itemType} (Need ${requiredQty})`;
                        }
                      }
                      
                      // Check product/category restrictions
                      if (offer.product_ids || offer.category_ids) {
                        // This will be checked by backend, just show info
                        conditionText += conditionText ? ' | Product/Category specific' : 'Product/Category specific offer';
                      }
                      
                      // Consider offer as having discount if:
                      // 1. Has explicit discount fields, OR
                      // 2. Has a valid offer_type that suggests discount, OR
                      // 3. Is a BOGO offer
                      const hasDiscount = hasPercentage || hasFixedAmount || hasBOGO || 
                                         normalizedOfferType === 'free_shipping' ||
                                         (isPercentageType && offer.is_active);
                      
                      // Allow applying if offer has discount mechanism OR if it's active and has a valid type
                      // The backend will validate and calculate the actual discount
                      const canApply = (hasDiscount || (offer.is_active && normalizedOfferType !== '')) && meetsCondition;
                      
                      return (
                        <div key={`offer-${offer.id}-${index}`} className="offer-item">
                          <div className="offer-item-content">
                            <span className="offer-item-icon">{offer.icon || '🎁'}</span>
                            <div className="offer-item-info">
                              <div className="offer-item-title">{offer.title}</div>
                              <div className="offer-item-description">{offer.description}</div>
                              {offer.discount_text && (
                                <div className="offer-item-discount-text">{offer.discount_text}</div>
                              )}
                              {(hasPercentage || hasFixedAmount || hasBOGO) && (
                                <div className="offer-item-discount">
                                  {hasPercentage && `${offer.discount_percentage}% OFF`}
                                  {hasFixedAmount && !hasPercentage && `₹${offer.discount_amount} OFF`}
                                  {hasBOGO && !hasPercentage && !hasFixedAmount && `Buy ${offer.buy_quantity} Get ${offer.get_quantity} Free`}
                                  {offer.offer_type === 'referral' && offer.referral_code && `Referral: ${offer.referral_code}`}
                                </div>
                              )}
                              {conditionText && (
                                <div className={`offer-item-condition ${meetsCondition ? 'condition-met' : 'condition-not-met'}`}>
                                  {conditionText}
                                </div>
                              )}
                              {!hasDiscount && !conditionText && (
                                <div className="offer-item-note">(Information only - no discount)</div>
                              )}
                            </div>
                          </div>
                          {canApply ? (
                            <button 
                              type="button" 
                              className="btn-apply-offer"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Apply button clicked for offer:', offer);
                                // Apply offer (handles all types)
                                applyOffer(offer);
                              }}
                            >
                              Apply
                            </button>
                          ) : hasDiscount && !meetsCondition ? (
                            <button 
                              type="button" 
                              className="btn-apply-offer"
                              disabled
                              title={conditionText || "Conditions not met"}
                            >
                              Not Eligible
                            </button>
                          ) : (
                            <button 
                              type="button" 
                              className="btn-apply-offer"
                              disabled
                              title="This offer does not have a discount percentage set"
                            >
                              No Discount
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="no-offers">No special offers available at the moment.</div>
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
                      disabled={!!selectedOffer}
                    />
                    <button 
                      type="button" 
                      className="btn-apply-coupon"
                      onClick={validateCoupon}
                      disabled={!couponCode.trim() || !!selectedOffer}
                    >
                      Apply
                    </button>
                  </div>
                )}
                {couponError && <div className="coupon-error">{couponError}</div>}
                {selectedOffer && (
                  <div className="coupon-info">
                    Note: You can only use either a special offer or a coupon code, not both.
                  </div>
                )}
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
            <div className="order-summary-header">
              <h2>Order Summary</h2>
              <button 
                type="button" 
                className="btn-clear-cart"
                onClick={clearCart}
                title="Clear cart"
              >
                <FaTrash /> Clear Cart
              </button>
            </div>
            
            <div className="order-items">
              {cartItems && cartItems.length > 0 ? (
                cartItems.map(item => (
                  <div key={item.id || `${item.name}-${item.price}`} className="order-item">
                    <img src={item.image || '/placeholder-image.jpg'} alt={item.name || 'Product'} />
                    <div className="item-info">
                      <h4>{item.name || 'Unnamed Product'}</h4>
                      <p className="item-price-single">₹{parseFloat(item.price || 0).toFixed(2)}</p>
                      <div className="item-quantity-controls">
                        <button 
                          className="quantity-btn quantity-btn-minus"
                          onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                          aria-label="Decrease quantity"
                          type="button"
                        >
                          <FaMinus />
                          <span className="icon-fallback-minus">−</span>
                        </button>
                        <span className="quantity-display">{item.quantity || 1}</span>
                        <button 
                          className="quantity-btn quantity-btn-plus"
                          onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                          aria-label="Increase quantity"
                          type="button"
                        >
                          <FaPlus />
                          <span className="icon-fallback-plus">+</span>
                        </button>
                      </div>
                    </div>
                    <div className="item-total-section">
                      <span className="item-total">₹{(parseFloat(item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                      <button 
                        className="remove-item-btn"
                        onClick={() => removeItem(item.id)}
                        title="Remove item"
                        type="button"
                        aria-label="Remove item"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>No items in cart</p>
              )}
            </div>

            <div className="summary-totals">
              {/* Calculate original subtotal (before discount) - use stored value if available */}
              {(() => {
                // Use stored originalSubtotal if available (set when offer/coupon is applied)
                // Otherwise, calculate from cart items or use current subtotal
                let originalSubtotal = 0;
                
                if (cartTotals?.originalSubtotal !== undefined && cartTotals?.originalSubtotal !== null) {
                  // Use stored original subtotal (before discount)
                  originalSubtotal = cartTotals.originalSubtotal;
                } else if (cartTotals?.discountAmount && cartTotals?.subtotal) {
                  // Reconstruct original: discounted subtotal + discount amount
                  originalSubtotal = cartTotals.subtotal + cartTotals.discountAmount;
                } else {
                  // Recalculate from cart items as fallback
                  originalSubtotal = cartItems.reduce((sum, item) => {
                    const price = parseFloat(item.price || 0);
                    const quantity = parseInt(item.quantity || 1);
                    return sum + (price * quantity);
                  }, 0);
                  
                  // If recalculation gives 0 but we have a subtotal, use that
                  if (originalSubtotal === 0 && cartTotals?.subtotal) {
                    originalSubtotal = cartTotals.subtotal;
                  }
                }
                
                // Calculate discounted subtotal (after discount)
                const discountedSubtotal = cartTotals?.subtotal || 0;
                
                // Calculate final total: discounted subtotal + shipping + tax
                const finalTotal = discountedSubtotal + 
                  (cartTotals?.shippingAmount || 0) + 
                  (cartTotals?.taxAmount || 0);
                
                return (
                  <>
                    <div className="summary-row">
                      <span className="summary-label">Subtotal:</span>
                      <span className="summary-value">₹{parseFloat(originalSubtotal).toFixed(2)}</span>
                    </div>
                    {selectedOffer && offerDiscount > 0 && (
                      <div className="summary-row discount">
                        <span className="summary-label">Special Offer Discount ({selectedOffer.title}):</span>
                        <span className="summary-value">-₹{parseFloat(offerDiscount).toFixed(2)}</span>
                      </div>
                    )}
                    {couponData && (cartTotals?.discountAmount || couponData.discount_amount || 0) > 0 && !selectedOffer && (
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
                      <span className="summary-value">₹{parseFloat(finalTotal).toFixed(2)}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;