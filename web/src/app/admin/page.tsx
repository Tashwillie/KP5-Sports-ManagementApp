'use client';

import React, { useState, useEffect } from 'react';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { adminService } from '@/lib/services/adminService';
import { AdminAnalytics, AdminSystemHealth } from '@kp5-academy/shared';
import { toast } from 'react-hot-toast';

export default function AdminPage() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [systemHealth, setSystemHealth] = useState<AdminSystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingSampleData, setCreatingSampleData] = useState(false);

  useEffect(() => {
    loadDashboard();
    setupRealTimeListeners();
  }, []);

  const setupRealTimeListeners = () => {
    const unsubscribeAnalytics = adminService.subscribeToAnalytics('daily', (data) => {
      setAnalytics(data);
    });

    const unsubscribeHealth = adminService.subscribeToSystemHealth((health) => {
      setSystemHealth(health);
    });

    return () => {
      unsubscribeAnalytics();
      unsubscribeHealth();
    };
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      // Try to get existing analytics or generate new ones
      let existingAnalytics = await adminService.getAnalytics('daily');
      if (!existingAnalytics) {
        await adminService.generateAnalytics('daily');
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalytics = async () => {
    try {
      await adminService.generateAnalytics('daily');
      toast.success('Analytics refreshed successfully');
    } catch (error) {
      console.error('Error refreshing analytics:', error);
      toast.error('Failed to refresh analytics');
    }
  };

  const createSampleData = async () => {
    try {
      setCreatingSampleData(true);
      await adminService.createSampleData();
      toast.success('Sample data created successfully!');
      // Refresh analytics after creating sample data
      await adminService.generateAnalytics('daily');
    } catch (error) {
      console.error('Error creating sample data:', error);
      toast.error('Failed to create sample data');
    } finally {
      setCreatingSampleData(false);
    }
  };

  const clearSampleData = async () => {
    if (confirm('Are you sure you want to clear all sample data? This action cannot be undone.')) {
      try {
        await adminService.clearSampleData();
        toast.success('Sample data cleared successfully!');
        // Refresh analytics after clearing data
        await adminService.generateAnalytics('daily');
      } catch (error) {
        console.error('Error clearing sample data:', error);
        toast.error('Failed to clear sample data');
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <AdminDashboard
        analytics={analytics}
        systemHealth={systemHealth}
        onRefresh={refreshAnalytics}
        onCreateSampleData={createSampleData}
        onClearSampleData={clearSampleData}
        creatingSampleData={creatingSampleData}
      />
    </AdminLayout>
  );
} 