'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';

export default function AdminPage() {
  const {
    analytics,
    systemHealth,
    loading,
    error,
    onRefresh,
    onCreateSampleData,
    onClearSampleData,
    creatingSampleData,
  } = useAdminDashboard();

  if (loading) {
    return (
      <ProtectedRoute requiredRole="SUPER_ADMIN">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requiredRole="SUPER_ADMIN">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="SUPER_ADMIN">
      <AdminDashboard
        analytics={analytics}
        systemHealth={systemHealth}
        onRefresh={onRefresh}
        onCreateSampleData={onCreateSampleData}
        onClearSampleData={onClearSampleData}
        creatingSampleData={creatingSampleData}
      />
    </ProtectedRoute>
  );
} 