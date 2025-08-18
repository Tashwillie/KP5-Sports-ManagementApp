import { useState, useEffect } from 'react';
import { useEnhancedAuthContext } from '@/contexts/EnhancedAuthContext';
import dashboardService, { DashboardData } from '@/lib/services/dashboardService';

export interface UseDashboardReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useDashboard = (): UseDashboardReturn => {
  const { user } = useEnhancedAuthContext();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    console.log('🔄 Fetching dashboard data...');
    console.log('👤 User state:', user ? 'Present' : 'Not present');
    
    if (!user) {
      console.log('❌ No user, setting error');
      setError('User not authenticated');
      return;
    }

    try {
      console.log('✅ User authenticated, starting API calls');
      setLoading(true);
      setError(null);
      const dashboardData = await dashboardService.getDashboardData();
      console.log('📊 Dashboard data received:', dashboardData);
      setData(dashboardData);
    } catch (err: any) {
      console.error('❌ Dashboard fetch error:', err);
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 useDashboard useEffect triggered');
    console.log('👤 User changed:', user ? 'Present' : 'Not present');
    
    if (user) {
      console.log('✅ User present, fetching dashboard data');
      fetchDashboardData();
    } else {
      console.log('❌ No user, clearing data');
      setData(null);
      setError(null);
    }
  }, [user]);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboardData
  };
};
