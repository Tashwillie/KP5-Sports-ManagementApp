'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useEnhancedPermissions } from '@/hooks/useEnhancedPermissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  requiredPermission
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const { can, isLoading: permissionsLoading, error: permissionsError } = useEnhancedPermissions();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/auth/signin');
        return;
      }

      // Check role-based access
      if (requiredRole && user?.role !== requiredRole) {
        // Redirect to appropriate page based on user role
        switch (user?.role) {
          case 'SUPER_ADMIN':
            router.push('/admin');
            break;
          case 'CLUB_ADMIN':
            router.push('/dashboard');
            break;
          case 'COACH':
            router.push('/dashboard');
            break;
          case 'PLAYER':
            router.push('/dashboard');
            break;
          case 'REFEREE':
            router.push('/dashboard');
            break;
          default:
            router.push('/dashboard');
        }
        return;
      }

      // Check permission-based access
      if (requiredPermission && !can(requiredPermission)) {
        router.push('/dashboard');
        return;
      }
    }
  }, [loading, isAuthenticated, user, requiredRole, requiredPermission, can, router]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show access denied if user doesn't have required role
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="mb-3">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-danger">
              <path d="M18.364 18.364A9 9 0 1 1 5.636 5.636a9 9 0 0 1 12.728 12.728zM12 8v4m0 4h.01" />
            </svg>
          </div>
          <h4 className="text-danger mb-3">Access Denied</h4>
          <p className="text-muted mb-4">
            You don't have permission to access this page. 
            Required role: <strong>{requiredRole.replace('_', ' ')}</strong>
          </p>
          <button 
            onClick={() => router.back()} 
            className="btn btn-outline-primary me-2"
          >
            Go Back
          </button>
          <button 
            onClick={() => router.push('/dashboard')} 
            className="btn btn-primary"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Show children if user is authenticated and has required role
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // This should never be reached, but just in case
  return null;
};
