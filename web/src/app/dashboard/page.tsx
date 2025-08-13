'use client';

import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/hooks/useDashboard';
import Sidebar from '@/components/layout/Sidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RoleBasedDashboard } from '@/components/dashboard/RoleBasedDashboard';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useDashboard();

  return (
    <div className="d-flex">
      <Sidebar activeTab="dashboard" />
      <div className="flex-grow-1 bg-light">
        <div className="container-fluid p-4">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h3 mb-1">Dashboard</h1>
              <small className="text-muted">
                Welcome back, {user?.displayName || user?.firstName || 'User'}! Here's what's happening today.
              </small>
            </div>
            <button 
              onClick={refetch} 
              className="btn btn-outline-primary btn-sm"
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {/* Error State */}
          {error && (
            <div className="alert alert-danger" role="alert">
              <strong>Error loading dashboard:</strong> {error}
            </div>
          )}

          {/* Loading State */}
          {loading && !data && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading dashboard data...</p>
            </div>
          )}

          {/* Dashboard Content */}
          {data && (
            <RoleBasedDashboard user={user} />
          )}
        </div>
      </div>
    </div>
  );
} 