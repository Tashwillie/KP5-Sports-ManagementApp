import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../../shared/src/types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, firstName?: string, lastName?: string, phone?: string, role?: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithPhone: (phoneNumber: string) => Promise<void>;
  verifyOTP: (verificationId: string, code: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
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
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is already authenticated
      const isAuthenticated = await authService.isAuthenticated();
      if (isAuthenticated) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error: any) {
      console.error('Error initializing auth:', error);
      setError('Failed to initialize authentication');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.signIn(email, password);
      if (response.success && response.data?.user) {
        setUser(response.data.user);
      } else {
        throw new Error(response.message || 'Sign in failed');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string, firstName?: string, lastName?: string, phone?: string, role?: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.signUp(email, password, displayName, firstName, lastName, phone, role);
      if (response.success && response.data?.user) {
        setUser(response.data.user);
      } else {
        throw new Error(response.message || 'Sign up failed');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to sign up');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      await authService.signOut();
      setUser(null);
    } catch (error: any) {
      setError(error.message || 'Failed to sign out');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      // TODO: Implement Google OAuth with PostgreSQL backend API
      throw new Error('Google sign-in not implemented yet');
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with Google');
      throw error;
    }
  };

  const signInWithPhone = async (phoneNumber: string) => {
    try {
      setError(null);
      // TODO: Implement phone authentication with PostgreSQL backend API
      throw new Error('Phone sign-in not implemented yet');
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with phone');
      throw error;
    }
  };

  const verifyOTP = async (phone: string, code: string) => {
    try {
      setError(null);
      setLoading(true);
      
      // Call backend OTP verification endpoint
      const result = await authService.verifyPhoneOTP(phone, code);
      
      if (result.success && result.user) {
        setUser(result.user);
        return result;
      } else {
        throw new Error(result.error || 'OTP verification failed');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to verify OTP');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await authService.resetPassword(email);
    } catch (error: any) {
      setError(error.message || 'Failed to reset password');
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      setError(null);
      if (!user) {
        throw new Error('No user logged in');
      }
      
      const updatedUser = await authService.updateUser(user.id, updates);
      setUser(updatedUser);
    } catch (error: any) {
      setError(error.message || 'Failed to update profile');
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      setError(null);
      if (!user) {
        return;
      }
      
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error: any) {
      setError(error.message || 'Failed to refresh user');
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithPhone,
    verifyOTP,
    resetPassword,
    updateProfile,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 