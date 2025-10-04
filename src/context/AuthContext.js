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
  const { data: userData, isLoading: userLoading } = useQuery(
    'userProfile',
    () => api.get('/auth/me').then(res => res.data),
    {
      enabled: !!token,
      retry: false,
      onError: () => {
        logout();
      }
    }
  );

  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [userData]);

  // Login mutation
  const loginMutation = useMutation(
    (credentials) => api.post('/auth/login', credentials),
    {
      onSuccess: (response) => {
        const { token: newToken, user: userInfo } = response.data;
        setToken(newToken);
        setUser(userInfo);
        localStorage.setItem('token', newToken);
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
      onSuccess: () => {
        queryClient.invalidateQueries('userProfile');
        toast.success('Profile updated successfully!');
      },
      onError: (error) => {
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
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    queryClient.clear();
    toast.success('Logged out successfully!');
  };

  const isAuthenticated = !!token && !!user;
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
