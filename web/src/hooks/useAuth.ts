import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';

interface User {
  id: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
  });

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      if (apiClient.isAuthenticated()) {
        const response = await apiClient.getCurrentUser();
        if (response.success) {
          setAuthState({
            user: response.data.user,
            loading: false,
            error: null,
            isAuthenticated: true,
          });
        } else {
          await logout();
        }
      } else {
        setAuthState({
          user: null,
          loading: false,
          error: null,
          isAuthenticated: false,
        });
      }
    } catch (error: any) {
      console.error('Auth check failed:', error);
      await logout();
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await apiClient.login({ email, password });
      if (response.success) {
        setAuthState({
          user: response.data.user,
          loading: false,
          error: null,
          isAuthenticated: true,
        });
        return response;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    displayName: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: string;
  }) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await apiClient.register(userData);
      if (response.success) {
        setAuthState({
          user: response.data.user,
          loading: false,
          error: null,
          isAuthenticated: true,
        });
        return response;
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthState({
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false,
      });
    }
  };

  const updateProfile = async (profileData: {
    displayName?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await apiClient.updateProfile(profileData);
      if (response.success) {
        setAuthState(prev => ({
          ...prev,
          user: response.data.user,
          loading: false,
        }));
        return response;
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Profile update failed';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  return {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
    clearError,
    checkAuthStatus,
  };
};
