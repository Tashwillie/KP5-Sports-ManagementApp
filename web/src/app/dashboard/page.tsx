'use client';

import { useEnhancedAuthContext } from '@/contexts/EnhancedAuthContext';
import { useDashboard } from '@/hooks/useDashboard';
import Sidebar from '@/components/layout/Sidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { EnhancedDashboard } from '@/components/dashboard/EnhancedDashboard';
import { SportsDashboard } from '@/components/dashboard/SportsDashboard';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user } = useEnhancedAuthContext();
  const { data, loading, error, refetch } = useDashboard();

  return (
    <div className="d-flex">
      <Sidebar activeTab="dashboard" />
      <div className="flex-grow-1 bg-light">
        <div className="container-fluid p-4">
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

          {/* Sports Dashboard Content */}
          {data && user && (
            <SportsDashboard 
              user={user} 
              data={data} 
              onRefresh={refetch} 
            />
          )}

          {/* Fallback to Enhanced Dashboard if needed */}
          {!data && user && !loading && !error && (
            <EnhancedDashboard 
              user={user} 
              data={data || { stats: { totalUsers: 0, totalTeams: 0, totalMatches: 0, totalClubs: 0, totalTournaments: 0, activeMatches: 0, upcomingMatches: 0, completedMatches: 0 }, recentActivities: [], upcomingMatches: [], recentMatches: [] }} 
              loading={loading} 
              onRefresh={refetch} 
            />
          )}
        </div>
      </div>
    </div>
  );
} 