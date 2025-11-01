import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const queryClient = useQueryClient();

  // Set default authorization header
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Fetch user profile
  const { data: userData, isLoading: userLoading, error: profileError } = useQuery(
    'userProfile',
    () => api.get('/auth/profile').then(res => res.data),
    {
      enabled: !!token && !justLoggedIn, // Don't fetch immediately after login
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
      onError: (error) => {
        // Don't logout immediately after login - give it time
        if (justLoggedIn) {
          console.warn('⚠️ Profile fetch error right after login, will retry:', error.message);
          return;
        }
        
        // Only logout if it's a real auth error (401/403), not network errors
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          const message = error?.response?.data?.message || '';
          // Check if it's a token error, not just any 401
          if (message.toLowerCase().includes('invalid') || 
              message.toLowerCase().includes('expired') ||
              message.toLowerCase().includes('token')) {
            console.error('Authentication error, logging out:', error);
            logout();
          } else {
            console.warn('⚠️ 401 error but not a token error, not logging out:', message);
          }
        } else {
          console.error('Error fetching profile (non-auth):', error);
          // Don't logout for network errors or other issues
        }
      }
    }
  );

  useEffect(() => {
    if (userData) {
      setUser(userData);
      console.log('✅ User profile loaded:', userData.email);
    }
  }, [userData]);

  // If profile fetch fails after login, wait a bit before checking
  useEffect(() => {
    if (profileError && token && !justLoggedIn) {
      const status = profileError?.response?.status;
      // Only clear on auth errors, not network errors
      if (status === 401 || status === 403) {
        const message = profileError?.response?.data?.message || '';
        if (message.toLowerCase().includes('invalid') || 
            message.toLowerCase().includes('expired') ||
            message.toLowerCase().includes('token')) {
          console.error('Auth token invalid, logging out');
          logout();
        }
      }
    }
  }, [profileError, token, justLoggedIn]);

  // Login mutation
  const loginMutation = useMutation(
    (credentials) => api.post('/auth/login', credentials),
    {
      onSuccess: (response) => {
        const { token: newToken, user: userInfo } = response.data;
        console.log('✅ Login successful, setting token and user');
        setToken(newToken);
        setUser(userInfo); // Set user immediately from login response
        localStorage.setItem('token', newToken);
        console.log('✅ Token saved to localStorage');
        
        // Set flag to prevent immediate profile fetch
        setJustLoggedIn(true);
        
        // After a short delay, enable profile fetch and clear the flag
        setTimeout(() => {
          setJustLoggedIn(false);
          // Trigger profile fetch after delay
          queryClient.invalidateQueries('userProfile');
        }, 500); // 500ms delay
        
        toast.success('Login successful!');
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Login failed';
        toast.error(message);
      }
    }
  );

  // Register mutation
  const registerMutation = useMutation(
    (userData) => api.post('/auth/register', userData),
    {
      onSuccess: (response) => {
        const { token: newToken, user: userInfo } = response.data;
        setToken(newToken);
        setUser(userInfo);
        localStorage.setItem('token', newToken);
        toast.success('Registration successful!');
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Registration failed';
        toast.error(message);
      }
    }
  );

  // Update profile mutation
  const updateProfileMutation = useMutation(
    (profileData) => api.put('/auth/profile', profileData),
    {
      onSuccess: async (response) => {
        console.log('📥 Profile update response:', response);
        // Update user state immediately with the returned user data
        if (response?.data?.user) {
          const updatedUser = response.data.user;
          console.log('🔄 Setting user state with:', {
            name: updatedUser.name,
            email: updatedUser.email,
            city: updatedUser.city,
            state: updatedUser.state,
            pincode: updatedUser.pincode,
            address: updatedUser.address
          });
          setUser(updatedUser);
          
          // Force a refetch to ensure we have the latest data
          await queryClient.invalidateQueries('userProfile');
          
          // Refetch the profile query
          try {
            const profileData = await queryClient.fetchQuery('userProfile', () => 
              api.get('/auth/profile').then(res => res.data)
            );
            if (profileData) {
              setUser(profileData);
              console.log('✅ User state updated with fresh profile data:', {
                city: profileData.city,
                state: profileData.state,
                pincode: profileData.pincode
              });
            }
          } catch (refetchError) {
            console.warn('⚠️ Profile refetch failed, using response data:', refetchError);
            // Continue with response data
          }
        } else {
          console.warn('⚠️ No user data in response:', response);
          // Still invalidate to trigger refetch
          await queryClient.invalidateQueries('userProfile');
        }
        toast.success('Profile updated successfully!');
      },
      onError: (error) => {
        console.error('Profile update error:', error);
        const message = error.response?.data?.message || 'Profile update failed';
        toast.error(message);
      }
    }
  );

  // Change password mutation
  const changePasswordMutation = useMutation(
    (passwordData) => api.put('/auth/change-password', passwordData),
    {
      onSuccess: () => {
        toast.success('Password changed successfully!');
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Password change failed';
        toast.error(message);
      }
    }
  );

  const login = (credentials) => {
    return loginMutation.mutateAsync(credentials);
  };

  const register = (userData) => {
    return registerMutation.mutateAsync(userData);
  };

  const updateProfile = (profileData) => {
    return updateProfileMutation.mutateAsync(profileData);
  };

  const changePassword = (passwordData) => {
    return changePasswordMutation.mutateAsync(passwordData);
  };

  const logout = () => {
    console.log('🚪 Logging out user');
    setToken(null);
    setUser(null);
    setJustLoggedIn(false);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    queryClient.clear();
    toast.success('Logged out successfully!');
  };

  // User is authenticated if they have a token (user data will load asynchronously)
  // User is authenticated if they have a token OR user data (after login, before profile fetch)
  const isAuthenticated = !!token || !!user;
  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    token,
    isAuthenticated,
    isAdmin,
    isLoading: userLoading || loginMutation.isLoading || registerMutation.isLoading,
    login,
    register,
    updateProfile,
    changePassword,
    logout,
    isUpdatingProfile: updateProfileMutation.isLoading,
    isChangingPassword: changePasswordMutation.isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
