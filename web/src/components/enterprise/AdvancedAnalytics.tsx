'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  Users, 
  Calendar,
  PieChart,
  BarChart3,
  LineChart,
  Download,
  Filter,
  RefreshCw,
  Zap,
  Eye,
  Activity
} from 'lucide-react';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface KPI {
  id: string;
  name: string;
  value: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  unit: string;
  category: 'performance' | 'engagement' | 'growth' | 'financial';
  severity: 'critical' | 'warning' | 'good' | 'excellent';
}

interface PredictiveInsight {
  id: string;
  title: string;
  description: string;
  probability: number;
  impact: 'high' | 'medium' | 'low';
  timeframe: string;
  category: string;
  actionable: boolean;
  recommendations: string[];
}

interface AdvancedAnalyticsProps {
  timeRange: '24h' | '7d' | '30d' | '90d' | '1y';
  onTimeRangeChange: (range: string) => void;
  onExport: (data: any) => void;
}

export const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({
  timeRange,
  onTimeRangeChange,
  onExport
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [loading, setLoading] = useState(false);

  // Mock KPI data - in real app, this would come from API
  const kpis: KPI[] = [
    {
      id: 'revenue_growth',
      name: 'Revenue Growth',
      value: 15.2,
      target: 12.0,
      trend: 'up',
      change: 3.4,
      unit: '%',
      category: 'financial',
      severity: 'excellent'
    },
    {
      id: 'user_engagement',
      name: 'User Engagement',
      value: 78.5,
      target: 80.0,
      trend: 'down',
      change: -2.1,
      unit: '%',
      category: 'engagement',
      severity: 'warning'
    },
    {
      id: 'match_completion_rate',
      name: 'Match Completion',
      value: 94.8,
      target: 95.0,
      trend: 'stable',
      change: 0.3,
      unit: '%',
      category: 'performance',
      severity: 'good'
    },
    {
      id: 'new_registrations',
      name: 'New Registrations',
      value: 156,
      target: 150,
      trend: 'up',
      change: 12.8,
      unit: '',
      category: 'growth',
      severity: 'good'
    },
    {
      id: 'player_retention',
      name: 'Player Retention',
      value: 89.2,
      target: 85.0,
      trend: 'up',
      change: 4.7,
      unit: '%',
      category: 'engagement',
      severity: 'excellent'
    },
    {
      id: 'tournament_participation',
      name: 'Tournament Participation',
      value: 67.3,
      target: 70.0,
      trend: 'down',
      change: -1.8,
      unit: '%',
      category: 'engagement',
      severity: 'warning'
    }
  ];

  // Mock predictive insights
  const insights: PredictiveInsight[] = [
    {
      id: 'seasonal_growth',
      title: 'Seasonal Growth Spike Expected',
      description: 'Historical data suggests a 25% increase in registrations during spring season.',
      probability: 87,
      impact: 'high',
      timeframe: 'Next 30 days',
      category: 'growth',
      actionable: true,
      recommendations: [
        'Increase server capacity by 20%',
        'Prepare additional coaching staff',
        'Stock up on equipment and merchandise'
      ]
    },
    {
      id: 'engagement_risk',
      title: 'User Engagement Decline Risk',
      description: 'Current trends indicate potential engagement drop if tournament participation continues declining.',
      probability: 72,
      impact: 'medium',
      timeframe: 'Next 60 days',
      category: 'engagement',
      actionable: true,
      recommendations: [
        'Launch engagement campaign',
        'Introduce new tournament formats',
        'Offer incentives for participation'
      ]
    },
    {
      id: 'revenue_opportunity',
      title: 'Premium Membership Opportunity',
      description: 'High-engagement users show 68% likelihood to upgrade to premium membership.',
      probability: 68,
      impact: 'high',
      timeframe: 'Next 45 days',
      category: 'financial',
      actionable: true,
      recommendations: [
        'Target high-engagement users with premium offers',
        'Create exclusive premium content',
        'Implement tiered pricing strategy'
      ]
    }
  ];

  // Advanced chart configurations
  const performanceTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Match Performance',
        data: [85, 87, 88, 89, 91, 93, 94, 92, 94, 95, 94, 96],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'User Satisfaction',
        data: [78, 79, 81, 83, 85, 87, 86, 88, 89, 87, 89, 91],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Revenue Growth',
        data: [10, 12, 11, 13, 15, 14, 16, 17, 15, 18, 16, 19],
        borderColor: 'rgb(251, 191, 36)',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const predictiveModelData = {
    labels: ['Current', '+30d', '+60d', '+90d', '+120d', '+150d'],
    datasets: [
      {
        label: 'Predicted Users',
        data: [1250, 1320, 1410, 1520, 1650, 1800],
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        borderDash: [5, 5],
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Confidence Range',
        data: [1250, 1290, 1360, 1460, 1580, 1720],
        borderColor: 'rgba(147, 51, 234, 0.3)',
        backgroundColor: 'rgba(147, 51, 234, 0.05)',
        borderDash: [2, 2],
        tension: 0.4,
        fill: '+1',
      }
    ]
  };

  const cohortAnalysisData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    datasets: [
      {
        label: 'Jan Cohort',
        data: [100, 85, 72, 65, 58, 54],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Feb Cohort',
        data: [100, 88, 78, 70, 64, 59],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
      {
        label: 'Mar Cohort',
        data: [100, 92, 84, 78, 72, 68],
        backgroundColor: 'rgba(251, 191, 36, 0.8)',
      }
    ]
  };

  const radarData = {
    labels: ['Performance', 'Engagement', 'Growth', 'Retention', 'Satisfaction', 'Revenue'],
    datasets: [
      {
        label: 'Current Quarter',
        data: [85, 78, 92, 89, 87, 94],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgb(59, 130, 246)',
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(59, 130, 246)',
      },
      {
        label: 'Target',
        data: [90, 85, 88, 85, 90, 95],
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderColor: 'rgb(34, 197, 94)',
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(34, 197, 94)',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
        }
      },
      y: {
        display: true,
        title: {
          display: true,
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          display: false
        },
        suggestedMin: 0,
        suggestedMax: 100
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
      }
    }
  };

  const filteredKPIs = useMemo(() => {
    if (selectedCategory === 'all') return kpis;
    return kpis.filter(kpi => kpi.category === selectedCategory);
  }, [selectedCategory]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'excellent': return 'text-success';
      case 'good': return 'text-info';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-danger';
      default: return 'text-muted';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'excellent': return 'bg-success';
      case 'good': return 'bg-info';
      case 'warning': return 'bg-warning';
      case 'critical': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-danger';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-muted';
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const handleExport = () => {
    const exportData = {
      kpis: filteredKPIs,
      insights,
      timeRange,
      generatedAt: new Date().toISOString()
    };
    onExport(exportData);
  };

  return (
    <div className="container-fluid">
      {/* Header Controls */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                  <h4 className="mb-1">Advanced Analytics</h4>
                  <p className="text-muted mb-0">AI-powered insights and predictive analytics</p>
                </div>
                
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  {/* Time Range Selector */}
                  <div className="btn-group" role="group">
                    {['24h', '7d', '30d', '90d', '1y'].map((range) => (
                      <button
                        key={range}
                        type="button"
                        className={`btn btn-sm ${timeRange === range ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => onTimeRangeChange(range)}
                      >
                        {range}
                      </button>
                    ))}
                  </div>

                  {/* Category Filter */}
                  <select
                    className="form-select form-select-sm"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{ width: 'auto' }}
                  >
                    <option value="all">All Categories</option>
                    <option value="performance">Performance</option>
                    <option value="engagement">Engagement</option>
                    <option value="growth">Growth</option>
                    <option value="financial">Financial</option>
                  </select>

                  {/* Action Buttons */}
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={handleRefresh}
                    disabled={loading}
                  >
                    <RefreshCw size={16} className={loading ? 'spinner-border spinner-border-sm' : ''} />
                  </button>

                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={handleExport}
                  >
                    <Download size={16} className="me-1" />
                    Export
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="row mb-4">
        {filteredKPIs.map((kpi) => (
          <div key={kpi.id} className="col-xl-2 col-lg-3 col-md-4 col-sm-6 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className={`badge ${getSeverityBadge(kpi.severity)} badge-sm`}>
                    {kpi.severity.toUpperCase()}
                  </span>
                  {kpi.trend === 'up' ? (
                    <TrendingUp size={16} className="text-success" />
                  ) : kpi.trend === 'down' ? (
                    <TrendingDown size={16} className="text-danger" />
                  ) : (
                    <div className="bg-muted rounded" style={{ width: '16px', height: '2px' }}></div>
                  )}
                </div>
                
                <h3 className={`h5 mb-1 ${getSeverityColor(kpi.severity)}`}>
                  {kpi.value}{kpi.unit}
                </h3>
                <p className="text-muted small mb-2">{kpi.name}</p>
                
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    Target: {kpi.target}{kpi.unit}
                  </small>
                  <small className={kpi.change >= 0 ? 'text-success' : 'text-danger'}>
                    {kpi.change >= 0 ? '+' : ''}{kpi.change}%
                  </small>
                </div>

                {/* Progress bar */}
                <div className="mt-2">
                  <div className="progress" style={{ height: '3px' }}>
                    <div
                      className={`progress-bar ${getSeverityBadge(kpi.severity).replace('bg-', 'bg-')}`}
                      style={{ width: `${Math.min((kpi.value / kpi.target) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="row mb-4">
        {/* Performance Trends */}
        <div className="col-xl-8 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Performance Trends</h5>
                <div className="d-flex align-items-center gap-2">
                  <Eye size={16} className="text-muted" />
                  <small className="text-muted">Live Updates</small>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div style={{ height: '350px' }}>
                <Line data={performanceTrendData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>

        {/* KPI Radar */}
        <div className="col-xl-4 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent">
              <h5 className="mb-0">Performance Radar</h5>
            </div>
            <div className="card-body">
              <div style={{ height: '350px' }}>
                <Radar data={radarData} options={radarOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Predictive Analytics */}
      <div className="row mb-4">
        <div className="col-xl-8 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Predictive Growth Model</h5>
                <span className="badge bg-primary">AI-Powered</span>
              </div>
            </div>
            <div className="card-body">
              <div style={{ height: '300px' }}>
                <Line data={predictiveModelData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent">
              <h5 className="mb-0">User Retention Cohorts</h5>
            </div>
            <div className="card-body">
              <div style={{ height: '300px' }}>
                <Bar data={cohortAnalysisData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Predictive Insights */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">AI-Powered Insights</h5>
                <span className="badge bg-info">
                  <Zap size={14} className="me-1" />
                  {insights.length} Active Insights
                </span>
              </div>
            </div>
            <div className="card-body">
              <div className="row">
                {insights.map((insight) => (
                  <div key={insight.id} className="col-xl-4 col-lg-6 mb-3">
                    <div className="card border-start border-4 border-primary h-100">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="mb-0">{insight.title}</h6>
                          <span className={`badge ${getImpactColor(insight.impact).replace('text-', 'bg-')}`}>
                            {insight.impact}
                          </span>
                        </div>
                        
                        <p className="text-muted small mb-3">{insight.description}</p>
                        
                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <small className="text-muted">Confidence</small>
                            <small className="fw-medium">{insight.probability}%</small>
                          </div>
                          <div className="progress" style={{ height: '4px' }}>
                            <div
                              className="progress-bar bg-success"
                              style={{ width: `${insight.probability}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <small className="text-muted">Timeframe</small>
                          <small className="fw-medium">{insight.timeframe}</small>
                        </div>

                        {insight.actionable && (
                          <div>
                            <small className="text-muted d-block mb-2">Recommendations:</small>
                            <ul className="list-unstyled mb-0">
                              {insight.recommendations.slice(0, 2).map((rec, index) => (
                                <li key={index} className="small text-muted mb-1">
                                  • {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
