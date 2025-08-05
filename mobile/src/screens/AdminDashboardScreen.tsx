import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { adminService } from '../services/adminService';
import { AdminAnalytics, AdminSystemHealth, AnalyticsInsight } from '../../../shared/src/types/admin';

const AdminDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [systemHealth, setSystemHealth] = useState<AdminSystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await adminService.generateAnalytics('daily');
    } catch (error) {
      console.error('Error refreshing analytics:', error);
      Alert.alert('Error', 'Failed to refresh analytics');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const createSampleData = async () => {
    try {
      setCreatingSampleData(true);
      await adminService.createSampleData();
      Alert.alert('Success', 'Sample data created successfully!');
      // Refresh analytics after creating sample data
      await adminService.generateAnalytics('daily');
    } catch (error) {
      console.error('Error creating sample data:', error);
      Alert.alert('Error', 'Failed to create sample data');
    } finally {
      setCreatingSampleData(false);
    }
  };

  const clearSampleData = async () => {
    Alert.alert(
      'Clear Sample Data',
      'Are you sure you want to clear all sample data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminService.clearSampleData();
              Alert.alert('Success', 'Sample data cleared successfully!');
              // Refresh analytics after clearing data
              await adminService.generateAnalytics('daily');
            } catch (error) {
              console.error('Error clearing sample data:', error);
              Alert.alert('Error', 'Failed to clear sample data');
            }
          },
        },
      ]
    );
  };

  const handleNavigation = (screen: string) => {
    switch (screen) {
      case 'users':
        navigation.navigate('UserManagement' as never);
        break;
      case 'clubs':
        navigation.navigate('ClubManagement' as never);
        break;
      case 'settings':
        navigation.navigate('SystemSettings' as never);
        break;
      case 'reports':
        navigation.navigate('Reports' as never);
        break;
      case 'audit':
        navigation.navigate('AuditLogs' as never);
        break;
      case 'backups':
        navigation.navigate('Backups' as never);
        break;
      default:
        Alert.alert('Coming Soon', 'This feature is not yet implemented');
    }
  };

  const renderMetricCard = (title: string, value: string | number, subtitle?: string, icon?: string) => (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        {icon && <Ionicons name={icon as any} size={20} color="#6B7280" />}
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
    </View>
  );

  const renderInsightCard = (insight: AnalyticsInsight) => (
    <View key={insight.id} style={[styles.insightCard, { borderLeftColor: getInsightColor(insight.severity) }]}>
      <View style={styles.insightHeader}>
        <Text style={styles.insightTitle}>{insight.title}</Text>
        <View style={[styles.severityBadge, { backgroundColor: getInsightColor(insight.severity) }]}>
          <Text style={styles.severityText}>{insight.severity}</Text>
        </View>
      </View>
      <Text style={styles.insightDescription}>{insight.description}</Text>
      <Text style={styles.insightCategory}>{insight.category}</Text>
    </View>
  );

  const getInsightColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.sampleButton]}
            onPress={createSampleData}
            disabled={creatingSampleData}
          >
            {creatingSampleData ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="add-circle-outline" size={16} color="#FFFFFF" />
            )}
            <Text style={styles.actionButtonText}>
              {creatingSampleData ? 'Creating...' : 'Sample Data'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.clearButton]}
            onPress={clearSampleData}
          >
            <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Clear Data</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Metrics Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Metrics Overview</Text>
        <View style={styles.metricsGrid}>
          {analytics && (
            <>
              {renderMetricCard(
                'Total Users',
                analytics.metrics.users.total,
                `${analytics.metrics.users.active} active`,
                'people'
              )}
              {renderMetricCard(
                'Total Clubs',
                analytics.metrics.clubs.total,
                `${analytics.metrics.clubs.active} active`,
                'business'
              )}
              {renderMetricCard(
                'Total Teams',
                analytics.metrics.teams.total,
                `${analytics.metrics.teams.active} active`,
                'football'
              )}
              {renderMetricCard(
                'Total Events',
                analytics.metrics.events.total,
                `${analytics.metrics.events.upcoming} upcoming`,
                'calendar'
              )}
              {renderMetricCard(
                'Revenue',
                `$${analytics.metrics.payments.amount.toLocaleString()}`,
                `${analytics.metrics.payments.conversionRate}% conversion`,
                'card'
              )}
              {renderMetricCard(
                'System Uptime',
                `${analytics.metrics.system.uptime}%`,
                `${analytics.metrics.system.responseTime}ms response`,
                'server'
              )}
            </>
          )}
        </View>
      </View>

      {/* System Health */}
      {systemHealth && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Health</Text>
          <View style={styles.healthGrid}>
            <View style={styles.healthCard}>
              <Text style={styles.healthLabel}>CPU Usage</Text>
              <Text style={styles.healthValue}>{systemHealth.performance.cpu}%</Text>
            </View>
            <View style={styles.healthCard}>
              <Text style={styles.healthLabel}>Memory Usage</Text>
              <Text style={styles.healthValue}>{systemHealth.performance.memory}%</Text>
            </View>
            <View style={styles.healthCard}>
              <Text style={styles.healthLabel}>Disk Usage</Text>
              <Text style={styles.healthValue}>{systemHealth.performance.disk}%</Text>
            </View>
            <View style={styles.healthCard}>
              <Text style={styles.healthLabel}>Network</Text>
              <Text style={styles.healthValue}>{systemHealth.performance.network} MB/s</Text>
            </View>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => handleNavigation('users')}>
            <Ionicons name="people" size={24} color="#3B82F6" />
            <Text style={styles.actionCardText}>User Management</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => handleNavigation('clubs')}>
            <Ionicons name="business" size={24} color="#3B82F6" />
            <Text style={styles.actionCardText}>Club Management</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => handleNavigation('settings')}>
            <Ionicons name="settings" size={24} color="#3B82F6" />
            <Text style={styles.actionCardText}>System Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => handleNavigation('reports')}>
            <Ionicons name="document-text" size={24} color="#3B82F6" />
            <Text style={styles.actionCardText}>Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => handleNavigation('audit')}>
            <Ionicons name="shield-checkmark" size={24} color="#3B82F6" />
            <Text style={styles.actionCardText}>Audit Logs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => handleNavigation('backups')}>
            <Ionicons name="cloud-upload" size={24} color="#3B82F6" />
            <Text style={styles.actionCardText}>Backups</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Analytics Insights */}
      {analytics && analytics.insights.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analytics Insights</Text>
          {analytics.insights.map(renderInsightCard)}
        </View>
      )}

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityList}>
          <View style={styles.activityItem}>
            <Ionicons name="time" size={16} color="#6B7280" />
            <Text style={styles.activityText}>Analytics generated for today</Text>
            <Text style={styles.activityTime}>Just now</Text>
          </View>
          <View style={styles.activityItem}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.activityText}>System health check completed</Text>
            <Text style={styles.activityTime}>2 minutes ago</Text>
          </View>
          <View style={styles.activityItem}>
            <Ionicons name="refresh" size={16} color="#3B82F6" />
            <Text style={styles.activityText}>Dashboard data refreshed</Text>
            <Text style={styles.activityTime}>5 minutes ago</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 5,
  },
  sampleButton: {
    backgroundColor: '#10B981',
  },
  clearButton: {
    backgroundColor: '#EF4444',
  },
  section: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  metricSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  healthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  healthCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  healthLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  healthValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#E0E7FF',
    borderRadius: 12,
  },
  actionCardText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111827',
    marginTop: 8,
  },
  insightCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  insightDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  insightCategory: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  activityList: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activityText: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
    marginLeft: 10,
  },
  activityTime: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default AdminDashboardScreen; 