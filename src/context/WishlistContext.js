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
    () => wishlistAPI.getAll().then(res => res.data),
    {
      enabled: isAuthenticated,
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.error('Error fetching wishlist:', error);
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
        const message = error.response?.data?.message || 'Failed to add to wishlist';
        if (!message.includes('already')) {
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
    if (!isAuthenticated || !wishlistItems) return false;
    return wishlistItems.some(item => item.product_id === productId || item.product?.id === productId);
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













