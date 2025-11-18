import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { wishlistAPI } from '../services/api';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Fetch wishlist items
  const { data: wishlistItems = [], isLoading } = useQuery(
    'wishlist',
    () => wishlistAPI.getAll().then(res => {
      // Handle both array response and object with data property
      if (Array.isArray(res.data)) {
        return res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return [];
    }),
    {
      enabled: isAuthenticated,
      refetchOnWindowFocus: false,
      retry: 1,
      onError: (error) => {
        console.error('Error fetching wishlist:', error);
        console.error('Error response:', error.response);
        // Don't show error toast for 401 (not authenticated)
        if (error.response?.status !== 401) {
          toast.error('Failed to load wishlist');
        }
      }
    }
  );

  // Add to wishlist mutation
  const addToWishlistMutation = useMutation(
    (productId) => wishlistAPI.add(productId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('wishlist');
        toast.success('Added to wishlist!');
      },
      onError: (error) => {
        console.error('Wishlist add error:', error);
        console.error('Error response:', error.response);
        console.error('Error response data:', error.response?.data);
        
        // Extract error message safely
        let message = 'Failed to add to wishlist';
        if (error.response?.data) {
          if (typeof error.response.data === 'string') {
            message = error.response.data;
          } else if (error.response.data.message) {
            message = error.response.data.message;
          } else if (error.response.data.error) {
            message = error.response.data.error;
          }
        } else if (error.message) {
          message = error.message;
        }
        
        // Don't show error if already in wishlist (silent success)
        if (message.toLowerCase().includes('already') || message.toLowerCase().includes('duplicate')) {
          // Silently update the wishlist state
          queryClient.invalidateQueries('wishlist');
        } else {
          toast.error(message);
        }
      }
    }
  );

  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation(
    (productId) => wishlistAPI.remove(productId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('wishlist');
        toast.success('Removed from wishlist!');
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Failed to remove from wishlist';
        toast.error(message);
      }
    }
  );

  // Toggle wishlist item
  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    // Check if already in wishlist
    try {
      const response = await wishlistAPI.check(productId);
      const isInWishlist = response.data.inWishlist;

      if (isInWishlist) {
        await removeFromWishlistMutation.mutateAsync(productId);
      } else {
        await addToWishlistMutation.mutateAsync(productId);
      }
    } catch (error) {
      // If check fails, try to add
      await addToWishlistMutation.mutateAsync(productId);
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    if (!isAuthenticated || !wishlistItems || !Array.isArray(wishlistItems)) return false;
    const productIdNum = typeof productId === 'string' ? parseInt(productId) : productId;
    return wishlistItems.some(item => {
      const itemProductId = item.product_id || item.product?.id;
      return itemProductId === productIdNum || itemProductId === productId;
    });
  };

  // Get wishlist count
  const getWishlistCount = () => {
    return wishlistItems?.length || 0;
  };

  const value = {
    wishlistItems,
    isLoading,
    addToWishlist: (productId) => addToWishlistMutation.mutateAsync(productId),
    removeFromWishlist: (productId) => removeFromWishlistMutation.mutateAsync(productId),
    toggleWishlist,
    isInWishlist,
    getWishlistCount,
    clearWishlist: () => {
      // Implement if needed
    }
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};














