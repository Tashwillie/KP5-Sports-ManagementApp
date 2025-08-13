'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  UsersIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ServerIcon,
  ChartBarIcon,
  PlusIcon,
  TrashIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { AdminAnalytics, AdminSystemHealth, AnalyticsInsight } from '@kp5-academy/shared';

interface AdminDashboardProps {
  analytics: AdminAnalytics | null;
  systemHealth: AdminSystemHealth | null;
  onRefresh: () => void;
  onCreateSampleData: () => void;
  onClearSampleData: () => void;
  creatingSampleData: boolean;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function AdminDashboard({
  analytics,
  systemHealth,
  onRefresh,
  onCreateSampleData,
  onClearSampleData,
  creatingSampleData,
}: AdminDashboardProps) {
  const getInsightColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const renderMetricCard = (
    title: string,
    value: string | number,
    subtitle?: string,
    icon?: React.ComponentType<{ className?: string }>,
    trend?: { value: number; positive: boolean }
  ) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          {icon && (
            <div className="flex-shrink-0">
              <icon className="h-6 w-6 text-gray-400" />
            </div>
          )}
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                {trend && (
                  <div
                    className={`ml-2 flex items-baseline text-sm font-semibold ${
                      trend.positive ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {trend.positive ? '+' : ''}{trend.value}%
                  </div>
                )}
              </dd>
              {subtitle && (
                <dd className="text-sm text-gray-500 mt-1">{subtitle}</dd>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInsightCard = (insight: AnalyticsInsight) => (
    <div
      key={insight.id}
      className="bg-white overflow-hidden shadow rounded-lg border-l-4"
      style={{ borderLeftColor: getInsightColor(insight.severity) }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">{insight.title}</h3>
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={{ backgroundColor: getInsightColor(insight.severity), color: 'white' }}
          >
            {insight.severity}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">{insight.description}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-gray-400">{insight.category}</span>
          {insight.actionable && (
            <button className="text-xs text-blue-600 hover:text-blue-800">
              View Details →
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No analytics data</h3>
        <p className="mt-1 text-sm text-gray-500">
          Generate analytics to see your dashboard data.
        </p>
        <div className="mt-6">
          <button
            onClick={onRefresh}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowPathIcon className="-ml-1 mr-2 h-4 w-4" />
            Generate Analytics
          </button>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const userRoleData = Object.entries(analytics.metrics.users.byRole).map(([role, count]) => ({
    name: role.charAt(0).toUpperCase() + role.slice(1),
    value: count,
  }));

  const clubLevelData = Object.entries(analytics.metrics.clubs.byLevel).map(([level, count]) => ({
    name: level.charAt(0).toUpperCase() + level.slice(1),
    value: count,
  }));

  const eventTypeData = Object.entries(analytics.metrics.events.byType).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count,
  }));

  const paymentMethodData = Object.entries(analytics.metrics.payments.byMethod).map(([method, count]) => ({
    name: method.charAt(0).toUpperCase() + method.slice(1),
    value: count,
  }));

  const engagementData = [
    { name: 'Page Views', value: analytics.metrics.engagement.pageViews },
    { name: 'Unique Visitors', value: analytics.metrics.engagement.uniqueVisitors },
    { name: 'Returning Visitors', value: analytics.metrics.engagement.returningVisitors },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Real-time analytics and system monitoring
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onCreateSampleData}
            disabled={creatingSampleData}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            {creatingSampleData ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : (
              <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
            )}
            {creatingSampleData ? 'Creating...' : 'Sample Data'}
          </button>
          <button
            onClick={onClearSampleData}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            <TrashIcon className="-ml-1 mr-2 h-4 w-4" />
            Clear Data
          </button>
          <button
            onClick={onRefresh}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowPathIcon className="-ml-1 mr-2 h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {renderMetricCard(
          'Total Users',
          formatNumber(analytics.metrics.users.total),
          `${analytics.metrics.users.active} active`,
          UsersIcon,
          { value: analytics.metrics.users.growth, positive: analytics.metrics.users.growth > 0 }
        )}
        {renderMetricCard(
          'Total Clubs',
          formatNumber(analytics.metrics.clubs.total),
          `${analytics.metrics.clubs.active} active`,
          BuildingOfficeIcon,
          { value: analytics.metrics.clubs.growth, positive: analytics.metrics.clubs.growth > 0 }
        )}
        {renderMetricCard(
          'Total Teams',
          formatNumber(analytics.metrics.teams.total),
          `${analytics.metrics.teams.active} active`,
          ChartBarIcon
        )}
        {renderMetricCard(
          'Total Events',
          formatNumber(analytics.metrics.events.total),
          `${analytics.metrics.events.upcoming} upcoming`,
          CalendarIcon
        )}
        {renderMetricCard(
          'Revenue',
          formatCurrency(analytics.metrics.payments.amount),
          `${analytics.metrics.payments.conversionRate}% conversion`,
          CurrencyDollarIcon
        )}
        {renderMetricCard(
          'System Uptime',
          `${analytics.metrics.system.uptime}%`,
          `${analytics.metrics.system.responseTime}ms response`,
          ServerIcon
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Roles Distribution */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">User Roles Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userRoleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userRoleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Club Levels Distribution */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Club Levels Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={clubLevelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Event Types */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Event Types</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Methods</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* System Health */}
      {systemHealth && (
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{systemHealth.performance.cpu}%</div>
                <div className="text-sm text-gray-500">CPU Usage</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{systemHealth.performance.memory}%</div>
                <div className="text-sm text-gray-500">Memory Usage</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{systemHealth.performance.disk}%</div>
                <div className="text-sm text-gray-500">Disk Usage</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{systemHealth.performance.network} MB/s</div>
                <div className="text-sm text-gray-500">Network</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Insights */}
      {analytics.insights.length > 0 && (
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analytics.insights.map(renderInsightCard)}
            </div>
          </div>
        </div>
      )}

      {/* Engagement Metrics */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Engagement Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
} 