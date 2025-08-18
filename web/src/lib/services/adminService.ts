import {
  AdminDashboard,
  AdminAnalytics,
  AdminUser,
  AdminAuditLog,
  AdminSystemHealth,
  AdminReport,
  AdminNotification,
  AdminBackup,
  AdminMaintenance,
  AdminBilling,
  AdminSettingsConfig,
  AdminDashboardWidget,
  AdminPermissions,
  AdminSettings,
  UserMetrics,
  ClubMetrics,
  TeamMetrics,
  EventMetrics,
  PaymentMetrics,
  SystemMetrics,
  EngagementMetrics,
  AnalyticsInsight,
} from '@shared/types/admin';
import apiClient from '../apiClient';

export class AdminService {
  // Dashboard Management
  async getAdminDashboard(userId: string): Promise<AdminDashboard | null> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/admin/dashboards/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch admin dashboard');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error getting admin dashboard:', error);
      throw new Error('Failed to get admin dashboard');
    }
  }

  async createAdminDashboard(
    userId: string,
    role: AdminDashboard['role'],
    permissions: AdminPermissions,
    settings: AdminSettings
  ): Promise<string> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/admin/dashboards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
        body: JSON.stringify({
          userId,
          role,
          permissions,
          settings,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create admin dashboard');
      }

      const result = await response.json();
      return result.data.id;
    } catch (error) {
      console.error('Error creating admin dashboard:', error);
      throw new Error('Failed to create admin dashboard');
    }
  }

  async updateAdminDashboard(
    dashboardId: string,
    updates: Partial<AdminDashboard>
  ): Promise<void> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/admin/dashboards/${dashboardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update admin dashboard');
      }
    } catch (error) {
      console.error('Error updating admin dashboard:', error);
      throw new Error('Failed to update admin dashboard');
    }
  }

  async updateLastAccessed(dashboardId: string): Promise<void> {
    try {
      await this.updateAdminDashboard(dashboardId, {
        lastAccessed: new Date(),
      });
    } catch (error) {
      console.error('Error updating last accessed:', error);
      throw new Error('Failed to update last accessed');
    }
  }

  // Analytics Management
  async getAnalytics(
    period: AdminAnalytics['period'] = 'daily',
    date?: Date
  ): Promise<AdminAnalytics | null> {
    try {
      const targetDate = date || new Date();
      const dateString = targetDate.toISOString().split('T')[0];

      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/admin/analytics?period=${period}&date=${dateString}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch analytics');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error getting analytics:', error);
      throw new Error('Failed to get analytics');
    }
  }

  async generateAnalytics(
    period: AdminAnalytics['period'] = 'daily',
    date?: Date
  ): Promise<string> {
    try {
      const targetDate = date || new Date();
      const dateString = targetDate.toISOString().split('T')[0];

      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${apiClient.baseURL}/admin/analytics/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
        body: JSON.stringify({
          period,
          date: dateString,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate analytics');
      }

      const result = await response.json();
      return result.data.id;
    } catch (error) {
      console.error('Error generating analytics:', error);
      throw new Error('Failed to generate analytics');
    }
  }

  // User Management
  async getUsers(filters?: {
    role?: string;
    status?: string;
    limit?: number;
  }): Promise<AdminUser[]> {
    try {
      const response = await apiClient.getUsers();
      let users = response.data || [];

      // Apply filters
      if (filters?.role) {
        users = users.filter(user => user.role === filters.role);
      }

      if (filters?.status) {
        users = users.filter(user => user.status === filters.status);
      }

      if (filters?.limit) {
        users = users.slice(0, filters.limit);
      }

      return users;
    } catch (error) {
      console.error('Error getting users:', error);
      throw new Error('Failed to get users');
    }
  }

  async updateUser(userId: string, updates: Partial<AdminUser>): Promise<void> {
    try {
      await apiClient.updateUser(userId, updates);
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await apiClient.deleteUser(userId);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  // System Health
  async getSystemHealth(): Promise<AdminSystemHealth | null> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${apiClient.baseURL}/admin/system/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch system health');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error getting system health:', error);
      throw new Error('Failed to get system health');
    }
  }

  // Audit Logs
  async getAuditLogs(filters?: {
    userId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<AdminAuditLog[]> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${apiClient.baseURL}/admin/audit-logs`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch audit logs');
      }

      const result = await response.json();
      let logs = result.data || [];

      // Apply filters
      if (filters?.userId) {
        logs = logs.filter(log => log.userId === filters.userId);
      }

      if (filters?.action) {
        logs = logs.filter(log => log.action === filters.action);
      }

      if (filters?.startDate) {
        logs = logs.filter(log => new Date(log.timestamp) >= filters.startDate!);
      }

      if (filters?.endDate) {
        logs = logs.filter(log => new Date(log.timestamp) <= filters.endDate!);
      }

      if (filters?.limit) {
        logs = logs.slice(0, filters.limit);
      }

      return logs;
    } catch (error) {
      console.error('Error getting audit logs:', error);
      throw new Error('Failed to get audit logs');
    }
  }

  // Real-time subscriptions (simplified for API-based approach)
  subscribeToAnalytics(
    period: AdminAnalytics['period'],
    callback: (analytics: AdminAnalytics | null) => void
  ): () => void {
    // For API-based approach, we'll use polling instead of real-time subscriptions
    const interval = setInterval(async () => {
      try {
        const analytics = await this.getAnalytics(period);
        callback(analytics);
      } catch (error) {
        console.error('Error in analytics subscription:', error);
        callback(null);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }

  subscribeToSystemHealth(
    callback: (health: AdminSystemHealth | null) => void
  ): () => void {
    // For API-based approach, we'll use polling instead of real-time subscriptions
    const interval = setInterval(async () => {
      try {
        const health = await this.getSystemHealth();
        callback(health);
      } catch (error) {
        console.error('Error in system health subscription:', error);
        callback(null);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }

  // Utility methods for metrics calculation (simplified)
  private calculateUserMetrics(users: any[]): UserMetrics {
    return {
      total: users.length,
      active: users.filter(u => u.status === 'active').length,
      inactive: users.filter(u => u.status === 'inactive').length,
      newThisMonth: users.filter(u => {
        const createdAt = new Date(u.createdAt);
        const now = new Date();
        return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
      }).length,
    };
  }

  private calculateClubMetrics(clubs: any[]): ClubMetrics {
    return {
      total: clubs.length,
      active: clubs.filter(c => c.isActive).length,
      inactive: clubs.filter(c => !c.isActive).length,
      newThisMonth: clubs.filter(c => {
        const createdAt = new Date(c.createdAt);
        const now = new Date();
        return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
      }).length,
    };
  }

  private calculateTeamMetrics(teams: any[]): TeamMetrics {
    return {
      total: teams.length,
      active: teams.filter(t => t.isActive).length,
      inactive: teams.filter(t => !t.isActive).length,
      averagePlayersPerTeam: teams.reduce((sum, team) => sum + (team.roster?.players?.length || 0), 0) / teams.length || 0,
    };
  }

  private calculateEventMetrics(events: any[]): EventMetrics {
    return {
      total: events.length,
      scheduled: events.filter(e => e.status === 'scheduled').length,
      completed: events.filter(e => e.status === 'completed').length,
      cancelled: events.filter(e => e.status === 'cancelled').length,
    };
  }

  private calculatePaymentMetrics(payments: any[]): PaymentMetrics {
    return {
      total: payments.length,
      successful: payments.filter(p => p.status === 'successful').length,
      failed: payments.filter(p => p.status === 'failed').length,
      totalAmount: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
    };
  }

  private calculateSystemMetrics(systemHealth: AdminSystemHealth): SystemMetrics {
    return {
      uptime: systemHealth.uptime || 0,
      responseTime: systemHealth.responseTime || 0,
      errorRate: systemHealth.errorRate || 0,
      activeConnections: systemHealth.activeConnections || 0,
    };
  }

  private calculateEngagementMetrics(users: any[], events: any[]): EngagementMetrics {
    const activeUsers = users.filter(u => u.status === 'active').length;
    const totalEvents = events.length;
    const completedEvents = events.filter(e => e.status === 'completed').length;

    return {
      activeUsers,
      totalEvents,
      completedEvents,
      averageEventsPerUser: totalEvents / activeUsers || 0,
      userEngagementRate: (activeUsers / users.length) * 100 || 0,
    };
  }

  private generateInsights(
    userMetrics: UserMetrics,
    clubMetrics: ClubMetrics,
    paymentMetrics: PaymentMetrics,
    systemMetrics: SystemMetrics
  ): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];

    // User growth insight
    if (userMetrics.newThisMonth > 0) {
      insights.push({
        id: 'user-growth',
        type: 'positive',
        title: 'User Growth',
        message: `${userMetrics.newThisMonth} new users joined this month`,
        value: userMetrics.newThisMonth,
        trend: 'up',
      });
    }

    // Club activity insight
    if (clubMetrics.active > 0) {
      insights.push({
        id: 'club-activity',
        type: 'info',
        title: 'Active Clubs',
        message: `${clubMetrics.active} clubs are currently active`,
        value: clubMetrics.active,
        trend: 'stable',
      });
    }

    // Payment success insight
    if (paymentMetrics.successful > 0) {
      const successRate = (paymentMetrics.successful / paymentMetrics.total) * 100;
      insights.push({
        id: 'payment-success',
        type: successRate > 90 ? 'positive' : 'warning',
        title: 'Payment Success Rate',
        message: `${successRate.toFixed(1)}% of payments were successful`,
        value: successRate,
        trend: successRate > 90 ? 'up' : 'down',
      });
    }

    // System performance insight
    if (systemMetrics.responseTime > 0) {
      insights.push({
        id: 'system-performance',
        type: systemMetrics.responseTime < 1000 ? 'positive' : 'warning',
        title: 'System Performance',
        message: `Average response time: ${systemMetrics.responseTime}ms`,
        value: systemMetrics.responseTime,
        trend: systemMetrics.responseTime < 1000 ? 'up' : 'down',
      });
    }

    return insights;
  }
} 