import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Validate and filter out invalid items
        if (Array.isArray(parsedCart)) {
          const validCart = parsedCart.filter(item => 
            item && 
            item.id && 
            item.quantity && 
            typeof item.quantity === 'number' && 
            item.quantity > 0 &&
            item.price !== undefined
          );
          setCartItems(validCart);
          // Update localStorage with cleaned data if items were removed
          if (validCart.length !== parsedCart.length) {
            localStorage.setItem('cart', JSON.stringify(validCart));
          }
        } else {
          // Invalid format, clear it
          setCartItems([]);
          localStorage.removeItem('cart');
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('cart');
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }
  }, []);

  // Save cart to localStorage whenever cartItems change and cleanup invalid items
  useEffect(() => {
    // Only save valid cart items
    if (Array.isArray(cartItems)) {
      const validCart = cartItems.filter(item => 
        item && 
        item.id && 
        item.quantity && 
        typeof item.quantity === 'number' && 
        item.quantity > 0 &&
        item.price !== undefined
      );
      
      // If invalid items were filtered out, update state to match
      if (validCart.length !== cartItems.length) {
        setCartItems(validCart);
        return; // Don't save yet, let the next effect cycle handle it
      }
      
      localStorage.setItem('cart', JSON.stringify(validCart));
    } else {
      setCartItems([]);
      localStorage.setItem('cart', JSON.stringify([]));
    }
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        const updatedItems = prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        toast.success(`Updated ${product.name} quantity in cart!`);
        return updatedItems;
      } else {
        const newItem = {
          id: product.id,
          name: product.name,
          price: parseFloat(product.price),
          original_price: parseFloat(product.original_price || product.price),
          image: product.primary_image || product.image,
          slug: product.slug,
          quantity: quantity,
          stock_quantity: product.stock_quantity
        };
        toast.success(`${product.name} added to cart!`);
        return [...prevItems, newItem];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => {
      const item = prevItems.find(item => item.id === productId);
      const updatedItems = prevItems.filter(item => item.id !== productId);
      if (item) {
        toast.success(`${item.name} removed from cart!`);
      }
      return updatedItems;
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prevItems => {
      const updatedItems = prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity: Math.min(quantity, item.stock_quantity || 999) }
          : item
      );
      return updatedItems;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    toast.success('Cart cleared!');
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return 0;
    }
    return cartItems.reduce((total, item) => {
      const quantity = item?.quantity;
      if (typeof quantity === 'number' && quantity > 0) {
        return total + quantity;
      }
      return total;
    }, 0);
  };

  const getCartItem = (productId) => {
    return cartItems.find(item => item.id === productId);
  };

  const isInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
  };

  const getCartQuantity = (productId) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    getCartItem,
    isInCart,
    getCartQuantity
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
