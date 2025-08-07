'use client';

import React, { useState, useEffect } from 'react';
import { useFirebase } from '@/contexts/FirebaseContext';
import Sidebar from '@/components/layout/Sidebar';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Trophy, 
  Target, 
  Calendar,
  Activity,
  Download,
  Filter,
  RefreshCw,
  Search,
  Plus,
  Edit,
  Trash2,
  Shield,
  UserCheck,
  UserX,
  Clock,
  MapPin,
  Bell,
  Grid3X3,
  MessageCircle,
  ChevronDown,
  MoreVertical,
  Home,
  Folder,
  GraduationCap,
  ShoppingCart,
  Cloud,
  HelpCircle,
  Mail,
  Flag,
  Maximize2,
  User,
  CheckCircle,
  AlertCircle,
  XCircle,
  GitBranch,
  Award,
  Zap,
  Heart,
  Play,
  Pause,
  Square,
  AlertTriangle,
  TrendingDown,
  DollarSign,
  FileText,
  ImageIcon,
  UserCheck as UserCheckIcon,
  Building
} from 'lucide-react';

interface AnalyticsData {
  totalMatches: number;
  totalTeams: number;
  totalUsers: number;
  totalGoals: number;
  averageGoalsPerMatch: number;
  winRate: number;
  activeUsers: number;
  matchesThisMonth: number;
  topScorers: Array<{
    playerId: string;
    playerName: string;
    goals: number;
    teamId: string;
  }>;
  teamPerformance: Array<{
    teamId: string;
    teamName: string;
    wins: number;
    losses: number;
    draws: number;
    goalsFor: number;
    goalsAgainst: number;
    points: number;
  }>;
  monthlyStats: Array<{
    month: string;
    matches: number;
    goals: number;
    users: number;
  }>;
  matchTypes: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
}

export default function AnalyticsPage() {
  const { userData, loading: authLoading, hasPermission } = useFirebase();

  // State
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('overview');

  // Load analytics data
  useEffect(() => {
    if (!userData || authLoading) return;

    const loadAnalytics = async () => {
      try {
        setLoading(true);

        // Mock analytics data - in real implementation, this would come from Firebase
        const mockData: AnalyticsData = {
          totalMatches: 156,
          totalTeams: 24,
          totalUsers: 342,
          totalGoals: 487,
          averageGoalsPerMatch: 3.12,
          winRate: 68.5,
          activeUsers: 289,
          matchesThisMonth: 23,
          topScorers: [
            { playerId: '1', playerName: 'John Smith', goals: 15, teamId: 'team1' },
            { playerId: '2', playerName: 'Mike Johnson', goals: 12, teamId: 'team2' },
            { playerId: '3', playerName: 'David Wilson', goals: 10, teamId: 'team3' },
            { playerId: '4', playerName: 'Chris Brown', goals: 9, teamId: 'team1' },
            { playerId: '5', playerName: 'Alex Davis', goals: 8, teamId: 'team4' },
          ],
          teamPerformance: [
            { teamId: 'team1', teamName: 'Thunder FC', wins: 12, losses: 3, draws: 2, goalsFor: 45, goalsAgainst: 18, points: 38 },
            { teamId: 'team2', teamName: 'Lightning SC', wins: 10, losses: 5, draws: 2, goalsFor: 38, goalsAgainst: 22, points: 32 },
            { teamId: 'team3', teamName: 'Storm United', wins: 8, losses: 7, draws: 2, goalsFor: 32, goalsAgainst: 28, points: 26 },
            { teamId: 'team4', teamName: 'Hurricane FC', wins: 7, losses: 8, draws: 2, goalsFor: 29, goalsAgainst: 31, points: 23 },
          ],
          monthlyStats: [
            { month: 'Jan', matches: 12, goals: 38, users: 45 },
            { month: 'Feb', matches: 15, goals: 47, users: 52 },
            { month: 'Mar', matches: 18, goals: 56, users: 61 },
            { month: 'Apr', matches: 14, goals: 43, users: 58 },
            { month: 'May', matches: 20, goals: 62, users: 67 },
            { month: 'Jun', matches: 16, goals: 49, users: 63 },
          ],
          matchTypes: [
            { type: 'Friendly', count: 45, percentage: 28.8 },
            { type: 'League', count: 67, percentage: 42.9 },
            { type: 'Tournament', count: 32, percentage: 20.5 },
            { type: 'Cup', count: 12, percentage: 7.7 },
          ],
        };

        setAnalyticsData(mockData);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [userData, authLoading, timeRange, selectedTeam]);

  const exportReport = async () => {
    try {
      // Mock export functionality
      console.log('Export started');
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    // Simulate refresh
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  if (authLoading || loading) {
    return (
      <div className="d-flex">
        <Sidebar activeTab="analytics" userData={userData} />
        <div className="flex-grow-1 p-4">
          <div className="d-flex justify-content-center align-items-center" style={{minHeight: '400px'}}>
            <div className="text-center">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p>Loading analytics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userData || !hasPermission('view_analytics')) {
    return (
      <div className="d-flex">
        <Sidebar activeTab="analytics" userData={userData} />
        <div className="flex-grow-1 p-4">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 text-muted mx-auto mb-4" />
            <h2 className="h4 fw-bold text-dark mb-2">Access Denied</h2>
            <p className="text-muted">You don't have permission to view analytics.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="d-flex">
        <Sidebar activeTab="analytics" userData={userData} />
        <div className="flex-grow-1 p-4">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 text-muted mx-auto mb-4" />
            <h2 className="h4 fw-bold text-dark mb-2">No Data Available</h2>
            <p className="text-muted">Analytics data is not available at the moment.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <Sidebar activeTab="analytics" userData={userData} />
      <div className="flex-grow-1">
        {/* Header */}
        <div className="bg-white border-bottom p-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-1">Analytics Dashboard</h1>
              <p className="text-muted mb-0">
                Comprehensive insights into your sports organization's performance.
              </p>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary" onClick={refreshData} disabled={loading}>
                <RefreshCw className="h-4 w-4 me-2" />
                Refresh
              </button>
              <button className="btn btn-primary" onClick={exportReport}>
                <Download className="h-4 w-4 me-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        <div className="p-4">
          {/* Filters */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0 d-flex align-items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label small fw-medium text-muted mb-2">Time Range</label>
                  <select
                    className="form-select"
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                  >
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                    <option value="1y">Last Year</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-medium text-muted mb-2">Team</label>
                  <select
                    className="form-select"
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                  >
                    <option value="all">All Teams</option>
                    {analyticsData.teamPerformance.map((team) => (
                      <option key={team.teamId} value={team.teamId}>
                        {team.teamName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-medium text-muted mb-2">Metric</label>
                  <select
                    className="form-select"
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value)}
                  >
                    <option value="overview">Overview</option>
                    <option value="performance">Performance</option>
                    <option value="engagement">Engagement</option>
                    <option value="goals">Goals & Scoring</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="row g-4 mb-4">
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <p className="text-muted small mb-1">Total Matches</p>
                      <h4 className="mb-0 fw-bold">{analyticsData.totalMatches}</h4>
                      <p className="text-success small mt-1">
                        <TrendingUp className="h-3 w-3 me-1" />
                        +12% this month
                      </p>
                    </div>
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <p className="text-muted small mb-1">Total Goals</p>
                      <h4 className="mb-0 fw-bold">{analyticsData.totalGoals}</h4>
                      <p className="text-success small mt-1">
                        <TrendingUp className="h-3 w-3 me-1" />
                        {analyticsData.averageGoalsPerMatch.toFixed(1)} per match
                      </p>
                    </div>
                    <Target className="h-4 w-4 text-danger" />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <p className="text-muted small mb-1">Active Users</p>
                      <h4 className="mb-0 fw-bold">{analyticsData.activeUsers}</h4>
                      <p className="text-success small mt-1">
                        <TrendingUp className="h-3 w-3 me-1" />
                        +8% this month
                      </p>
                    </div>
                    <Users className="h-4 w-4 text-success" />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <p className="text-muted small mb-1">Win Rate</p>
                      <h4 className="mb-0 fw-bold">{analyticsData.winRate}%</h4>
                      <div className="mt-2">
                        <div className="progress" style={{height: '8px'}}>
                          <div 
                            className="progress-bar" 
                            style={{width: `${analyticsData.winRate}%`}}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <Trophy className="h-4 w-4 text-warning" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {/* Top Scorers */}
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Top Scorers</h5>
                </div>
                <div className="card-body">
                  <div className="d-flex flex-column gap-3">
                    {analyticsData.topScorers.map((scorer, index) => (
                      <div key={scorer.playerId} className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <div className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3" style={{width: '32px', height: '32px'}}>
                            <span className="small fw-bold text-muted">{index + 1}</span>
                          </div>
                          <div>
                            <p className="fw-medium mb-0">{scorer.playerName}</p>
                            <p className="small text-muted mb-0">
                              {analyticsData.teamPerformance.find(t => t.teamId === scorer.teamId)?.teamName}
                            </p>
                          </div>
                        </div>
                        <span className="badge bg-secondary">{scorer.goals} goals</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Team Performance */}
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Team Performance</h5>
                </div>
                <div className="card-body">
                  <div className="d-flex flex-column gap-3">
                    {analyticsData.teamPerformance.map((team) => (
                      <div key={team.teamId} className="border rounded p-3">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <h6 className="fw-medium mb-0">{team.teamName}</h6>
                          <span className="badge bg-light text-dark">{team.points} pts</span>
                        </div>
                        <div className="row g-2 text-center">
                          <div className="col-4">
                            <p className="small text-muted mb-1">Wins</p>
                            <p className="fw-semibold text-success mb-0">{team.wins}</p>
                          </div>
                          <div className="col-4">
                            <p className="small text-muted mb-1">Losses</p>
                            <p className="fw-semibold text-danger mb-0">{team.losses}</p>
                          </div>
                          <div className="col-4">
                            <p className="small text-muted mb-1">Draws</p>
                            <p className="fw-semibold text-warning mb-0">{team.draws}</p>
                          </div>
                        </div>
                        <div className="mt-2 small text-muted">
                          Goals: {team.goalsFor} - {team.goalsAgainst}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Match Types Distribution */}
          <div className="card border-0 shadow-sm mt-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">Match Types Distribution</h5>
            </div>
            <div className="card-body">
              <div className="row g-4">
                {analyticsData.matchTypes.map((type) => (
                  <div key={type.type} className="col-md-3 text-center">
                    <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center mx-auto mb-2" style={{width: '64px', height: '64px'}}>
                      <span className="h4 fw-bold text-primary mb-0">{type.count}</span>
                    </div>
                    <p className="fw-medium mb-1">{type.type}</p>
                    <p className="small text-muted mb-0">{type.percentage}%</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly Trends */}
          <div className="card border-0 shadow-sm mt-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">Monthly Trends</h5>
            </div>
            <div className="card-body">
              <div className="row g-4">
                <div className="col-md-4">
                  <h6 className="fw-medium mb-3">Matches</h6>
                  <div className="d-flex flex-column gap-2">
                    {analyticsData.monthlyStats.map((stat) => (
                      <div key={stat.month} className="d-flex align-items-center justify-content-between">
                        <span className="small text-muted">{stat.month}</span>
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-light rounded" style={{width: '80px', height: '8px'}}>
                            <div 
                              className="bg-primary rounded" 
                              style={{ width: `${(stat.matches / 20) * 100}%`, height: '100%' }}
                            ></div>
                          </div>
                          <span className="small fw-medium">{stat.matches}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-md-4">
                  <h6 className="fw-medium mb-3">Goals</h6>
                  <div className="d-flex flex-column gap-2">
                    {analyticsData.monthlyStats.map((stat) => (
                      <div key={stat.month} className="d-flex align-items-center justify-content-between">
                        <span className="small text-muted">{stat.month}</span>
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-light rounded" style={{width: '80px', height: '8px'}}>
                            <div 
                              className="bg-danger rounded" 
                              style={{ width: `${(stat.goals / 62) * 100}%`, height: '100%' }}
                            ></div>
                          </div>
                          <span className="small fw-medium">{stat.goals}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-md-4">
                  <h6 className="fw-medium mb-3">Users</h6>
                  <div className="d-flex flex-column gap-2">
                    {analyticsData.monthlyStats.map((stat) => (
                      <div key={stat.month} className="d-flex align-items-center justify-content-between">
                        <span className="small text-muted">{stat.month}</span>
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-light rounded" style={{width: '80px', height: '8px'}}>
                            <div 
                              className="bg-success rounded" 
                              style={{ width: `${(stat.users / 67) * 100}%`, height: '100%' }}
                            ></div>
                          </div>
                          <span className="small fw-medium">{stat.users}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 