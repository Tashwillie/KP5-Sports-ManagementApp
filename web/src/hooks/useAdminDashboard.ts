import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminService } from '@/lib/services/adminService';
import { AdminAnalytics, AdminSystemHealth } from '@kp5-academy/shared';

export interface UseAdminDashboardReturn {
  analytics: AdminAnalytics | null;
  systemHealth: AdminSystemHealth | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
  onCreateSampleData: () => Promise<void>;
  onClearSampleData: () => Promise<void>;
  creatingSampleData: boolean;
}

export const useAdminDashboard = (): UseAdminDashboardReturn => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [systemHealth, setSystemHealth] = useState<AdminSystemHealth | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creatingSampleData, setCreatingSampleData] = useState(false);

  const adminService = new AdminService();

  const fetchData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch analytics and system health in parallel
      const [analyticsData, healthData] = await Promise.all([
        adminService.getAnalytics(),
        adminService.getSystemHealth()
      ]);

      setAnalytics(analyticsData);
      setSystemHealth(healthData);
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
      setError(err.message || 'Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    await fetchData();
  };

  const onCreateSampleData = async () => {
    if (!user) return;

    try {
      setCreatingSampleData(true);
      setError(null);
      
      // This would call the backend to create sample data
      // For now, we'll just simulate it
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Refresh data after creating sample data
      await fetchData();
    } catch (err: any) {
      console.error('Error creating sample data:', err);
      setError(err.message || 'Failed to create sample data');
    } finally {
      setCreatingSampleData(false);
    }
  };

  const onClearSampleData = async () => {
    if (!user) return;

    try {
      setError(null);
      
      // This would call the backend to clear sample data
      // For now, we'll just simulate it
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refresh data after clearing sample data
      await fetchData();
    } catch (err: any) {
      console.error('Error clearing sample data:', err);
      setError(err.message || 'Failed to clear sample data');
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  return {
    analytics,
    systemHealth,
    loading,
    error,
    onRefresh,
    onCreateSampleData,
    onClearSampleData,
    creatingSampleData,
  };
};
