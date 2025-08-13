'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
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

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    displayName: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: {
    displayName?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 Checking authentication...');
        const hasToken = apiClient.hasValidTokenFormat();
        console.log('🔑 Token present:', hasToken ? 'Yes' : 'No');
        
        if (hasToken) {
          console.log('📡 Fetching current user...');
          try {
            const response = await apiClient.getCurrentUser();
            console.log('👤 Current user response:', response);
            
            if (response.success) {
              console.log('✅ User authenticated:', response.data.user);
              setUser(response.data.user);
            } else {
              console.log('❌ User not authenticated, clearing token');
              await apiClient.logout();
            }
          } catch (err: any) {
            console.log('❌ Token validation failed:', err.message);
            // Only clear token if it's an authentication error
            if (err.message.includes('Authentication required') || 
                err.message.includes('401') ||
                err.message.includes('Unauthorized')) {
              console.log('🔒 Clearing invalid token due to auth error');
              await apiClient.logout();
            }
          }
        } else {
          console.log('❌ No token found');
        }
      } catch (err) {
        console.error('❌ Auth check failed:', err);
        // Don't clear token for general errors
      } finally {
        console.log('🏁 Auth check complete, setting loading to false');
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.login({ email, password });
      if (response.success) {
        setUser(response.data.user);
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
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
      setLoading(true);
      setError(null);
      
      const response = await apiClient.register(userData);
      if (response.success) {
        setUser(response.data.user);
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await apiClient.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Even if logout fails, clear local state
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: {
    displayName?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.updateProfile(profileData);
      if (response.success) {
        setUser(response.data.user);
      } else {
        setError(response.message || 'Profile update failed');
      }
    } catch (err: any) {
      setError(err.message || 'Profile update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 