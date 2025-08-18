// Enhanced Authentication Hook with robust state management
import { useState, useEffect, useCallback, useRef } from 'react';
import enhancedApiClient from '@/lib/enhancedApiClient';
import TokenManager from '@/lib/tokenManager';
import { 
  User, 
  AuthState, 
  LoginCredentials, 
  RegisterData, 
  UserRole,
  DEFAULT_ROLE_PERMISSIONS 
} from '@shared/types/auth';

export const useEnhancedAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
    isInitialized: false,
  });

  const authCheckRef = useRef<NodeJS.Timeout | null>(null);
  const tokenRefreshRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize authentication state
  useEffect(() => {
    initializeAuth();
    
    // Set up token refresh monitoring
    setupTokenRefreshMonitoring();
    
    // Cleanup on unmount
    return () => {
      if (authCheckRef.current) clearTimeout(authCheckRef.current);
      if (tokenRefreshRef.current) clearTimeout(tokenRefreshRef.current);
    };
  }, []);

  /**
   * Initialize authentication state
   */
  const initializeAuth = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      // Check if we have a valid token
      if (TokenManager.isAuthenticated()) {
        await checkAuthStatus();
      } else {
        // No valid token, user is not authenticated
        setAuthState({
          user: null,
          loading: false,
          error: null,
          isAuthenticated: false,
          isInitialized: true,
        });
      }
    } catch (error: any) {
      console.error('❌ Auth initialization failed:', error);
      setAuthState({
        user: null,
        loading: false,
        error: 'Authentication initialization failed',
        isAuthenticated: false,
        isInitialized: true,
      });
    }
  }, []);

  /**
   * Set up automatic token refresh monitoring
   */
  const setupTokenRefreshMonitoring = useCallback(() => {
    const checkTokenRefresh = () => {
      if (TokenManager.needsRefresh()) {
        console.log('🔄 Token needs refresh, attempting...');
        enhancedApiClient.getCurrentUser().catch(() => {
          // This will trigger the refresh flow
          console.log('🔄 Token refresh triggered');
        });
      }

      // Check again in 1 minute
      tokenRefreshRef.current = setTimeout(checkTokenRefresh, 60000);
    };

    // Start monitoring
    checkTokenRefresh();
  }, []);

  /**
   * Check current authentication status
   */
  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await enhancedApiClient.getCurrentUser();
      
      if (response.success && response.data?.user) {
        setAuthState({
          user: response.data.user,
          loading: false,
          error: null,
          isAuthenticated: true,
          isInitialized: true,
        });
      } else {
        // Token is invalid or user not found
        await logout();
      }
    } catch (error: any) {
      console.error('❌ Auth status check failed:', error);
      await logout();
    }
  }, []);

  /**
   * Login user
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const response = await enhancedApiClient.login({ email, password });
      
      if (response.success && response.data?.user) {
        setAuthState({
          user: response.data.user,
          loading: false,
          error: null,
          isAuthenticated: true,
          isInitialized: true,
        });
        
        return { success: true, user: response.data.user };
      } else {
        const errorMessage = response.message || 'Login failed';
        setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      let errorMessage = error.message || 'Login failed';
      
      // Handle specific HTTP status codes and error types
      if (error.message && error.message.includes('429')) {
        errorMessage = 'Too many login attempts. Please wait a moment and try again.';
      } else if (error.message && error.message.includes('401')) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (error.message && error.message.includes('403')) {
        errorMessage = 'Account access denied. Please contact support.';
      } else if (error.message && error.message.includes('500')) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message && error.message.includes('NON_JSON_RESPONSE')) {
        errorMessage = 'Server returned an unexpected response. Please try again or contact support.';
      } else if (error.message && error.message.includes('JSON_PARSE_ERROR')) {
        errorMessage = 'Unable to process server response. Please try again or contact support.';
      } else if (error.message && error.message.includes('Unable to connect')) {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      }
      
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Register new user
   */
  const register = useCallback(async (userData: RegisterData) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const response = await enhancedApiClient.register(userData);
      
      if (response.success && response.data?.user) {
        setAuthState({
          user: response.data.user,
          loading: false,
          error: null,
          isAuthenticated: true,
          isInitialized: true,
        });
        
        return { success: true, user: response.data.user };
      } else {
        const errorMessage = response.message || 'Registration failed';
        setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      await enhancedApiClient.logout();
    } catch (error) {
      console.error('❌ Logout API call failed:', error);
    } finally {
      // Always clear local state regardless of API call success
      setAuthState({
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false,
        isInitialized: true,
      });
    }
  }, []);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (profileData: Partial<User>) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const response = await enhancedApiClient.put<{ user: User }>(`/auth/profile`, profileData);
      
      if (response.success && response.data?.user) {
        setAuthState(prev => ({
          ...prev,
          user: response.data!.user,
          loading: false,
        }));
        
        return { success: true, user: response.data!.user };
      } else {
        const errorMessage = response.message || 'Profile update failed';
        setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Profile update failed';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  /**
   * Forgot password
   */
  const forgotPassword = useCallback(async (email: string) => {
    try {
      const response = await enhancedApiClient.forgotPassword(email);
      
      if (response.success) {
        return { success: true, message: response.message || 'Password reset email sent' };
      } else {
        const errorMessage = response.message || 'Failed to send password reset email';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send password reset email';
      throw error;
    }
  }, []);

  /**
   * Reset password
   */
  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    try {
      const response = await enhancedApiClient.resetPassword(token, newPassword);
      
      if (response.success) {
        return { success: true, message: response.message || 'Password reset successfully' };
      } else {
        const errorMessage = response.message || 'Failed to reset password';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to reset password';
      throw error;
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Refresh authentication status
   */
  const refreshAuth = useCallback(async () => {
    if (TokenManager.isAuthenticated()) {
      await checkAuthStatus();
    }
  }, [checkAuthStatus]);

  /**
   * Check if user has specific role
   */
  const hasRole = useCallback((role: string | string[]): boolean => {
    if (!authState.user) return false;
    
    const userRole = authState.user.role;
    if (Array.isArray(role)) {
      return role.includes(userRole);
    }
    
    return userRole === role;
  }, [authState.user]);

  /**
   * Check if user has specific permission (basic role-based check)
   */
  const hasPermission = useCallback((permission: string): boolean => {
    if (!authState.user) return false;
    
    const userRole = authState.user.role;
    
    // Basic permission mapping (can be enhanced with backend permissions)
    const rolePermissions: Record<string, string[]> = {
      'SUPER_ADMIN': ['*'],
      'CLUB_ADMIN': ['manage_club', 'manage_teams', 'manage_players', 'view_reports'],
      'COACH': ['manage_team', 'manage_players', 'view_reports'],
      'PLAYER': ['view_schedule', 'view_team', 'update_profile'],
      'PARENT': ['view_child', 'view_schedule', 'view_team'],
      'REFEREE': ['manage_matches', 'view_schedule', 'update_profile'],
    };

    const permissions = rolePermissions[userRole] || [];
    return permissions.includes('*') || permissions.includes(permission);
  }, [authState.user]);

  return {
    // State
    ...authState,
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    forgotPassword,
    resetPassword,
    clearError,
    refreshAuth,
    
    // Utilities
    hasRole,
    hasPermission,
    
    // Token info
    token: TokenManager.getAccessToken(),
    tokenExpiry: TokenManager.getTokenExpiry(),
    timeUntilExpiry: TokenManager.getTimeUntilExpiry(),
  };
};
