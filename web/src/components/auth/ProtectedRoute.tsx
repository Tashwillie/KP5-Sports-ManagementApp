// Enhanced Protected Route Component
'use client';

import React from 'react';
import { useEnhancedAuthContext } from '@/contexts/EnhancedAuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  requiredPermission?: string;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermission,
  fallback,
  redirectTo = '/auth/signin',
}) => {
  const { user, loading, isAuthenticated, isInitialized, hasRole, hasPermission } = useEnhancedAuthContext();

  // Show loading state while initializing
  if (!isInitialized || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    if (redirectTo) {
      // Redirect to login page
      window.location.href = redirectTo;
      return null;
    }
    
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to access this page.</p>
          <a
            href="/auth/signin"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // Check role requirements
  if (requiredRole && !hasRole(requiredRole)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have the required role to access this page.
          </p>
          <p className="text-sm text-gray-500">
            Required: {Array.isArray(requiredRole) ? requiredRole.join(' or ') : requiredRole}
            <br />
            Your role: {user.role}
          </p>
        </div>
      </div>
    );
  }

  // Check permission requirements
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have the required permission to access this page.
          </p>
          <p className="text-sm text-gray-500">
            Required permission: {requiredPermission}
          </p>
        </div>
      </div>
    );
  }

  // User has access, render children
  return <>{children}</>;
};

// Convenience components for common use cases
export const AdminRoute: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <ProtectedRoute requiredRole={['SUPER_ADMIN', 'CLUB_ADMIN']} fallback={fallback}>
    {children}
  </ProtectedRoute>
);

export const CoachRoute: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <ProtectedRoute requiredRole={['SUPER_ADMIN', 'CLUB_ADMIN', 'COACH']} fallback={fallback}>
    {children}
  </ProtectedRoute>
);

export const PlayerRoute: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <ProtectedRoute requiredRole={['SUPER_ADMIN', 'CLUB_ADMIN', 'COACH', 'PLAYER']} fallback={fallback}>
    {children}
  </ProtectedRoute>
);
