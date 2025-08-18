'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Target, 
  Trophy, 
  Calendar, 
  Plus,
  TrendingUp,
  Activity,
  AlertCircle,
  BarChart3,
  PieChart,
  Clock,
  MapPin,
  Play,
  CheckCircle
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { DashboardData } from '@/lib/services/dashboardService';
import { User } from '@shared/types/auth';
import { QuickMatchModal, QuickTeamModal, QuickTournamentModal } from './QuickActionModals';
import realTimeDashboardService, { DashboardUpdate } from '@/lib/services/realTimeDashboardService';
import { AdvancedAnalytics } from '../enterprise/AdvancedAnalytics';
import { BusinessIntelligence } from '../enterprise/BusinessIntelligence';
import { SecurityAudit } from '../enterprise/SecurityAudit';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

interface EnhancedDashboardProps {
  user: User;
  data: DashboardData;
  loading: boolean;
  onRefresh: () => void;
}

interface StatCard {
  title: string;
  value: string | number;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  color: string;
  disabled?: boolean;
}

export const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({ 
  user, 
  data, 
  loading, 
  onRefresh 
}) => {
  const router = useRouter();
  const [activeTimeRange, setActiveTimeRange] = useState('7d');
  const [showQuickMatchModal, setShowQuickMatchModal] = useState(false);
  const [showQuickTeamModal, setShowQuickTeamModal] = useState(false);
  const [showQuickTournamentModal, setShowQuickTournamentModal] = useState(false);
  const [realTimeUpdates, setRealTimeUpdates] = useState<DashboardUpdate[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [enterpriseView, setEnterpriseView] = useState<'overview' | 'analytics' | 'intelligence' | 'security'>('overview');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d' | '1y'>('7d');

  // Set up real-time dashboard updates
  useEffect(() => {
    const subscriptionId = `dashboard-${user.id}`;
    
    setConnectionStatus('connecting');
    
    realTimeDashboardService.subscribe(subscriptionId, (update: DashboardUpdate) => {
      console.log('📈 Real-time dashboard update:', update);
      setRealTimeUpdates(prev => [update, ...prev.slice(0, 9)]); // Keep last 10 updates
      
      // Trigger data refresh for certain update types
      if (update.type === 'STATS_UPDATE' || update.type === 'NEW_ACTIVITY') {
        onRefresh();
      }
    });

    // Check connection status periodically
    const statusInterval = setInterval(() => {
      const isConnected = realTimeDashboardService.isConnected();
      setConnectionStatus(isConnected ? 'connected' : 'disconnected');
    }, 2000);

    return () => {
      realTimeDashboardService.unsubscribe(subscriptionId);
      clearInterval(statusInterval);
    };
  }, [user.id, onRefresh]);

  // Generate mock chart data based on real data
  const generateChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    return {
      matchActivity: {
        labels: last7Days,
        datasets: [{
          label: 'Matches Played',
          data: [2, 4, 3, 5, 2, 6, 4],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
        }]
      },
      teamPerformance: {
        labels: ['Wins', 'Draws', 'Losses'],
        datasets: [{
          data: [65, 20, 15],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(251, 191, 36, 0.8)',
            'rgba(239, 68, 68, 0.8)',
          ],
          borderWidth: 0,
        }]
      },
      registrationTrends: {
        labels: last7Days,
        datasets: [{
          label: 'New Registrations',
          data: [12, 8, 15, 20, 10, 18, 25],
          backgroundColor: 'rgba(147, 51, 234, 0.8)',
          borderRadius: 4,
        }]
      }
    };
  };

  const chartData = generateChartData();

  // Generate stat cards based on real data
  const getStatCards = (): StatCard[] => {
    const stats = data.stats;
    
    return [
      {
        title: 'Total Users',
        value: stats.totalUsers,
        change: '+12%',
        changeType: 'increase',
        icon: <Users size={24} />,
        color: 'bg-blue-500'
      },
      {
        title: 'Active Matches',
        value: stats.activeMatches,
        change: '+5%',
        changeType: 'increase',
        icon: <Target size={24} />,
        color: 'bg-green-500'
      },
      {
        title: 'Total Teams',
        value: stats.totalTeams,
        change: '+8%',
        changeType: 'increase',
        icon: <Users size={24} />,
        color: 'bg-purple-500'
      },
      {
        title: 'Tournaments',
        value: stats.totalTournaments,
        change: '0%',
        changeType: 'neutral',
        icon: <Trophy size={24} />,
        color: 'bg-yellow-500'
      }
    ];
  };

  // Handle modal success - refresh data
  const handleModalSuccess = () => {
    onRefresh();
  };

  // Generate quick actions based on user role
  const getQuickActions = (): QuickAction[] => {
    const baseActions: QuickAction[] = [
      {
        title: 'Quick Match',
        description: 'Create match instantly',
        icon: <Plus size={20} />,
        action: () => setShowQuickMatchModal(true),
        color: 'btn-primary'
      },
      {
        title: 'Quick Team',
        description: 'Add team quickly',
        icon: <Users size={20} />,
        action: () => setShowQuickTeamModal(true),
        color: 'btn-success'
      },
      {
        title: 'Live Match',
        description: 'Start live match tracking',
        icon: <Play size={20} />,
        action: () => router.push('/live-match-demo'),
        color: 'btn-danger'
      },
      {
        title: 'Analytics',
        description: 'View detailed reports',
        icon: <BarChart3 size={20} />,
        action: () => router.push('/analytics'),
        color: 'btn-info'
      }
    ];

    // Add role-specific actions
    if (user.role === 'SUPER_ADMIN' || user.role === 'CLUB_ADMIN') {
      baseActions.push({
        title: 'Quick Tournament',
        description: 'Set up tournament fast',
        icon: <Trophy size={20} />,
        action: () => setShowQuickTournamentModal(true),
        color: 'btn-warning'
      });
    }

    if (user.role === 'SUPER_ADMIN') {
      baseActions.push({
        title: 'System Settings',
        description: 'Configure system',
        icon: <Activity size={20} />,
        action: () => router.push('/settings'),
        color: 'btn-secondary'
      });
    }

    // Add enterprise features for eligible users
    if (hasEnterpriseAccess) {
      baseActions.push({
        title: 'Advanced Analytics',
        description: 'AI-powered insights',
        icon: <BarChart3 size={20} />,
        action: () => setEnterpriseView('analytics'),
        color: 'btn-outline-primary'
      });
      
      baseActions.push({
        title: 'Business Intelligence',
        description: 'Custom reports & BI',
        icon: <PieChart size={20} />,
        action: () => setEnterpriseView('intelligence'),
        color: 'btn-outline-info'
      });

      if (user.role === 'SUPER_ADMIN') {
        baseActions.push({
          title: 'Security & Audit',
          description: 'Enterprise security',
          icon: <Activity size={20} />,
          action: () => setEnterpriseView('security'),
          color: 'btn-outline-warning'
        });
      }
    }

    return baseActions;
  };

  // Check if user has enterprise permissions
  const hasEnterpriseAccess = user.role === 'SUPER_ADMIN' || user.role === 'CLUB_ADMIN';

  // Handle enterprise view data export
  const handleEnterpriseExport = (data: any) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enterprise-data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const statCards = getStatCards();
  const quickActions = getQuickActions();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  // Render enterprise views
  if (hasEnterpriseAccess && enterpriseView !== 'overview') {
    return (
      <div className="container-fluid">
        {/* Enterprise Navigation */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h4 className="mb-1">Enterprise Dashboard</h4>
                    <p className="text-muted mb-0">Advanced analytics and business intelligence</p>
                  </div>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => setEnterpriseView('overview')}
                  >
                    ← Back to Overview
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enterprise Navigation Tabs */}
        <div className="row mb-4">
          <div className="col-12">
            <ul className="nav nav-pills nav-fill">
              <li className="nav-item">
                <button
                  className={`nav-link ${enterpriseView === 'analytics' ? 'active' : ''}`}
                  onClick={() => setEnterpriseView('analytics')}
                >
                  <BarChart3 size={16} className="me-1" />
                  Advanced Analytics
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${enterpriseView === 'intelligence' ? 'active' : ''}`}
                  onClick={() => setEnterpriseView('intelligence')}
                >
                  <PieChart size={16} className="me-1" />
                  Business Intelligence
                </button>
              </li>
              {user.role === 'SUPER_ADMIN' && (
                <li className="nav-item">
                  <button
                    className={`nav-link ${enterpriseView === 'security' ? 'active' : ''}`}
                    onClick={() => setEnterpriseView('security')}
                  >
                    <Activity size={16} className="me-1" />
                    Security & Audit
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Enterprise Content */}
        {enterpriseView === 'analytics' && (
          <AdvancedAnalytics
            timeRange={timeRange}
            onTimeRangeChange={(range) => setTimeRange(range as any)}
            onExport={handleEnterpriseExport}
          />
        )}
        {enterpriseView === 'intelligence' && (
          <BusinessIntelligence userRole={user.role} />
        )}
        {enterpriseView === 'security' && user.role === 'SUPER_ADMIN' && (
          <SecurityAudit userRole={user.role} />
        )}
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Time Range Selector */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <div className="d-flex align-items-center">
            <h2 className="h4 mb-1 me-3">Dashboard Overview</h2>
            <div className="d-flex align-items-center">
              <div 
                className={`rounded-circle me-2`} 
                style={{
                  width: '8px', 
                  height: '8px', 
                  backgroundColor: connectionStatus === 'connected' ? '#22c55e' : 
                                   connectionStatus === 'connecting' ? '#f59e0b' : '#ef4444'
                }}
              ></div>
              <small className="text-muted">
                {connectionStatus === 'connected' ? 'Live' : 
                 connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}
              </small>
            </div>
          </div>
          <p className="text-muted mb-0">Real-time insights and quick actions</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="btn-group" role="group">
            {['7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                type="button"
                className={`btn btn-sm ${activeTimeRange === range ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveTimeRange(range)}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
          {realTimeUpdates.length > 0 && (
            <div className="btn btn-sm btn-outline-info position-relative">
              <Activity size={16} />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {realTimeUpdates.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        {statCards.map((stat, index) => (
          <div key={index} className="col-xl-3 col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className={`p-3 rounded ${stat.color.replace('bg-', 'text-white bg-')}`}>
                    {stat.icon}
                  </div>
                  <div className="ms-3 flex-grow-1">
                    <h3 className="h4 mb-0">{stat.value}</h3>
                    <p className="text-muted mb-1">{stat.title}</p>
                    <span className={`small ${
                      stat.changeType === 'increase' ? 'text-success' : 
                      stat.changeType === 'decrease' ? 'text-danger' : 'text-muted'
                    }`}>
                      <TrendingUp size={14} className="me-1" />
                      {stat.change} from last period
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4 mb-4">
        {/* Match Activity Chart */}
        <div className="col-xl-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Match Activity</h5>
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={onRefresh}
                  disabled={loading}
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>
            <div className="card-body">
              <div style={{ height: '300px' }}>
                <Line data={chartData.matchActivity} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>

        {/* Team Performance Pie Chart */}
        <div className="col-xl-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent">
              <h5 className="mb-0">Team Performance</h5>
            </div>
            <div className="card-body">
              <div style={{ height: '300px' }}>
                <Doughnut data={chartData.teamPerformance} options={doughnutOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Registration Trends */}
        <div className="col-xl-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent">
              <h5 className="mb-0">Registration Trends</h5>
            </div>
            <div className="card-body">
              <div style={{ height: '250px' }}>
                <Bar data={chartData.registrationTrends} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-xl-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent">
              <h5 className="mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    className={`btn ${action.color} d-flex align-items-center justify-content-start`}
                    onClick={action.action}
                    disabled={action.disabled}
                  >
                    {action.icon}
                    <div className="ms-3 text-start">
                      <div className="fw-medium">{action.title}</div>
                      <small className="opacity-75">{action.description}</small>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities and Upcoming Matches */}
      <div className="row g-4">
        {/* Recent Activities */}
        <div className="col-xl-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent">
              <h5 className="mb-0">Recent Activities</h5>
            </div>
            <div className="card-body">
              {data.recentActivities && data.recentActivities.length > 0 ? (
                <div className="list-group list-group-flush">
                  {data.recentActivities.slice(0, 5).map((activity, index) => (
                    <div key={index} className="list-group-item px-0 py-3 border-0">
                      <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 p-2 rounded me-3">
                          <Activity size={16} className="text-primary" />
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{activity.title}</h6>
                          <p className="text-muted mb-0 small">{activity.description}</p>
                          <small className="text-muted">
                            <Clock size={12} className="me-1" />
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <AlertCircle size={48} className="text-muted mb-3" />
                  <p className="text-muted">No recent activities</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Matches */}
        <div className="col-xl-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent">
              <h5 className="mb-0">Upcoming Matches</h5>
            </div>
            <div className="card-body">
              {data.upcomingMatches && data.upcomingMatches.length > 0 ? (
                <div className="list-group list-group-flush">
                  {data.upcomingMatches.slice(0, 5).map((match, index) => (
                    <div key={index} className="list-group-item px-0 py-3 border-0">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center flex-grow-1">
                          <div className="bg-success bg-opacity-10 p-2 rounded me-3">
                            <Target size={16} className="text-success" />
                          </div>
                          <div>
                            <h6 className="mb-1">{match.title}</h6>
                            <p className="text-muted mb-0 small">
                              <MapPin size={12} className="me-1" />
                              {match.location}
                            </p>
                            <small className="text-muted">
                              <Calendar size={12} className="me-1" />
                              {new Date(match.startTime).toLocaleDateString()}
                            </small>
                          </div>
                        </div>
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => router.push(`/matches/${match.id}`)}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Calendar size={48} className="text-muted mb-3" />
                  <p className="text-muted">No upcoming matches</p>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => router.push('/matches/create')}
                  >
                    Schedule Match
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Modals */}
      <QuickMatchModal
        isOpen={showQuickMatchModal}
        onClose={() => setShowQuickMatchModal(false)}
        onSuccess={handleModalSuccess}
      />
      <QuickTeamModal
        isOpen={showQuickTeamModal}
        onClose={() => setShowQuickTeamModal(false)}
        onSuccess={handleModalSuccess}
      />
      <QuickTournamentModal
        isOpen={showQuickTournamentModal}
        onClose={() => setShowQuickTournamentModal(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};
