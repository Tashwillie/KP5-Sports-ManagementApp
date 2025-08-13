'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import AdvancedAnalyticsDashboard from '@/components/analytics/AdvancedAnalyticsDashboard';

export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <AdvancedAnalyticsDashboard />
    </ProtectedRoute>
  );
} 