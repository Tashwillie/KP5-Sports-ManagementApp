'use client';

import React, { useState, useEffect } from 'react';
import { useFirebase } from '@/contexts/FirebaseContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);
import { 
  Users, 
  Calendar, 
  Trophy, 
  Target, 
  TrendingUp, 
  Clock, 
  MapPin, 
  Plus,
  Activity,
  BarChart3,
  Settings,
  Bell,
  Search,
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
  Shield,
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
  Image as ImageIcon
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalTeams: number;
  totalMatches: number;
  activeMatches: number;
  upcomingMatches: number;
  completedMatches: number;
  winRate: number;
  totalGoals: number;
}

interface RecentActivity {
  id: string;
  type: 'match_created' | 'match_completed' | 'user_joined' | 'goal_scored' | 'team_created';
  title: string;
  description: string;
  timestamp: Date;
  userId?: string;
  userName?: string;
}

export default function DashboardPage() {
  const { userData, loading: authLoading } = useFirebase();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeFilter, setTimeFilter] = useState('this-week');

  // State
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalTeams: 0,
    totalMatches: 0,
    activeMatches: 0,
    upcomingMatches: 0,
    completedMatches: 0,
    winRate: 0,
    totalGoals: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Chart data
  const matchPerformanceData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'],
    datasets: [
      {
        label: 'Goals Scored',
        data: [12, 19, 15, 25, 22, 30, 28],
        borderColor: '#4169E1',
        backgroundColor: 'rgba(65, 105, 225, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Goals Conceded',
        data: [8, 12, 10, 18, 15, 22, 20],
        borderColor: '#dc3545',
        backgroundColor: 'rgba(220, 53, 69, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const teamPerformanceData = {
    labels: ['U16 Boys', 'U16 Girls', 'U14 Boys', 'U14 Girls', 'U12 Boys', 'U12 Girls'],
    datasets: [
      {
        data: [85, 78, 92, 88, 76, 82],
        backgroundColor: [
          '#4169E1',
          '#28a745',
          '#ffc107',
          '#dc3545',
          '#6f42c1',
          '#fd7e14',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  // Load dashboard data
  useEffect(() => {
    if (!userData || authLoading) return;

    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Mock data - in real implementation, this would come from Firebase
        const mockStats: DashboardStats = {
          totalUsers: 156,
          totalTeams: 24,
          totalMatches: 89,
          activeMatches: 3,
          upcomingMatches: 12,
          completedMatches: 74,
          winRate: 68.5,
          totalGoals: 234,
        };

        const mockActivities: RecentActivity[] = [
          {
            id: '1',
            type: 'match_created',
            title: 'New Match Scheduled',
            description: 'U16 Boys vs U16 Girls - Tomorrow 3:00 PM',
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
            userId: 'user1',
            userName: 'Coach Johnson',
          },
          {
            id: '2',
            type: 'goal_scored',
            title: 'Goal Scored!',
            description: 'Player #10 scored in the 45th minute',
            timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
            userId: 'user2',
            userName: 'Mike Player',
          },
          {
            id: '3',
            type: 'team_created',
            title: 'New Team Registered',
            description: 'U14 Girls team has been created',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            userId: 'user3',
            userName: 'Sarah Admin',
          },
        ];

        setStats(mockStats);
        setRecentActivities(mockActivities);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [userData, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="d-flex">
        {/* Sidebar Skeleton */}
        <div className="bg-white border-end" style={{width: '280px', minHeight: '100vh'}}>
          <div className="p-3">
            <div className="placeholder-glow">
              <div className="placeholder col-8 mb-4"></div>
              <div className="placeholder col-6 mb-3"></div>
              <div className="placeholder col-10 mb-2"></div>
              <div className="placeholder col-8 mb-2"></div>
            </div>
          </div>
        </div>
        
        {/* Main Content Skeleton */}
        <div className="flex-grow-1 bg-light">
          <div className="p-4">
            <div className="placeholder-glow">
              <div className="placeholder col-4 mb-4"></div>
              <div className="row g-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="col-md-6 col-lg-3">
                    <div className="card placeholder-glow">
                      <div className="card-body">
                        <div className="placeholder col-8"></div>
                        <div className="placeholder col-4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h2 className="h2 fw-bold text-dark mb-3">Access Denied</h2>
          <p className="text-muted">Please sign in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className="bg-white border-end" style={{width: '280px', minHeight: '100vh'}}>
        <div className="p-3">
          {/* Logo and Top Icons */}
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="d-flex align-items-center">
              <img 
                src="/images/logo.png" 
                alt="KP5 Academy" 
                width={120} 
                height={45} 
                className="me-2"
                style={{maxWidth: '120px'}}
              />
            </div>
            <div className="d-flex gap-2">
              <Bell className="h-4 w-4 text-muted position-relative">
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success" style={{fontSize: '0.6rem'}}>3</span>
              </Bell>
              <Search className="h-4 w-4 text-muted" />
            </div>
          </div>

          {/* User Profile */}
          <div className="d-flex align-items-center mb-4 p-3 bg-light rounded">
            <div className="rounded-circle p-2 me-3" style={{backgroundColor: '#4169E1', opacity: 0.1}}>
              <User className="h-4 w-4" style={{color: '#4169E1'}} />
            </div>
            <div>
              <div className="fw-medium text-dark">{userData.displayName || 'User'}</div>
              <small className="text-muted">{userData.email}</small>
            </div>
          </div>

          {/* Navigation */}
          <div className="mb-4">
            <small className="text-muted text-uppercase fw-bold mb-2 d-block">Sports Management</small>
            <div className="d-flex flex-column gap-1">
              <a href="/dashboard" className={`btn btn-sm text-start ${activeTab === 'overview' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'overview' ? '#4169E1' : 'transparent'}}>
                <BarChart3 className="h-4 w-4 me-2" />
                Dashboard
              </a>
              <a href="/teams" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <Users className="h-4 w-4 me-2" />
                Teams
              </a>
              <a href="/matches" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <Calendar className="h-4 w-4 me-2" />
                Matches
              </a>
              <a href="/tournaments" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <Trophy className="h-4 w-4 me-2" />
                Tournaments
              </a>
              <a href="/events" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <Calendar className="h-4 w-4 me-2" />
                Events
              </a>
              <a href="/leagues" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <Trophy className="h-4 w-4 me-2" />
                Leagues
              </a>
            </div>
          </div>

          <div className="mb-4">
            <small className="text-muted text-uppercase fw-bold mb-2 d-block">Management</small>
            <div className="d-flex flex-column gap-1">
              <a href="/clubs" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <GraduationCap className="h-4 w-4 me-2" />
                Clubs
              </a>
              <a href="/players" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <Users className="h-4 w-4 me-2" />
                Players
              </a>
              <a href="/coaches" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <Shield className="h-4 w-4 me-2" />
                Coaches
              </a>
              <a href="/referees" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <Shield className="h-4 w-4 me-2" />
                Referees
              </a>
              <a href="/registration" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <User className="h-4 w-4 me-2" />
                Registration
              </a>
              <a href="/payments" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <DollarSign className="h-4 w-4 me-2" />
                Payments
              </a>
            </div>
          </div>

          <div className="mb-4">
            <small className="text-muted text-uppercase fw-bold mb-2 d-block">Communication</small>
            <div className="d-flex flex-column gap-1">
              <a href="/messages" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <MessageCircle className="h-4 w-4 me-2" />
                Messages
              </a>
              <a href="/notifications" className="btn btn-sm text-start text-muted border-0 text-decoration-none position-relative">
                <Mail className="h-4 w-4 me-2" />
                Notifications
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{fontSize: '0.6rem'}}>5</span>
              </a>
              <a href="/announcements" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <Bell className="h-4 w-4 me-2" />
                Announcements
              </a>
            </div>
          </div>

          <div className="mb-4">
            <small className="text-muted text-uppercase fw-bold mb-2 d-block">Content</small>
            <div className="d-flex flex-column gap-1">
              <a href="/media" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <Cloud className="h-4 w-4 me-2" />
                Media Library
              </a>
              <a href="/documents" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <FileText className="h-4 w-4 me-2" />
                Documents
              </a>
              <a href="/photos" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <ImageIcon className="h-4 w-4 me-2" />
                Photos
              </a>
            </div>
          </div>

          <div className="mb-4">
            <small className="text-muted text-uppercase fw-bold mb-2 d-block">Analytics</small>
            <div className="d-flex flex-column gap-1">
              <a href="/analytics" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <BarChart3 className="h-4 w-4 me-2" />
                Analytics
              </a>
              <a href="/reports" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <FileText className="h-4 w-4 me-2" />
                Reports
              </a>
              <a href="/statistics" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <TrendingUp className="h-4 w-4 me-2" />
                Statistics
              </a>
            </div>
          </div>

          <div className="mb-4">
            <small className="text-muted text-uppercase fw-bold mb-2 d-block">System</small>
            <div className="d-flex flex-column gap-1">
              <a href="/admin" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <Shield className="h-4 w-4 me-2" />
                Admin Panel
              </a>
              <a href="/settings" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <Settings className="h-4 w-4 me-2" />
                Settings
              </a>
              <a href="/profile" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <User className="h-4 w-4 me-2" />
                Profile
              </a>
              <a href="/help" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <HelpCircle className="h-4 w-4 me-2" />
                Help & Support
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 bg-light">
        {/* Top Header */}
        <div className="bg-white border-bottom p-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <button className="btn btn-link text-dark p-0">
                <Grid3X3 className="h-5 w-5" />
              </button>
              <div>
                <h5 className="mb-0">Welcome back, {userData.displayName || 'User'}!</h5>
                <small className="text-muted">
                  <Bell className="h-3 w-3 me-1" />
                  You have 2 new messages and 3 upcoming matches
                </small>
              </div>
            </div>
            
            <div className="d-flex align-items-center gap-3">
              <button className="btn btn-link text-muted p-1">
                <Flag className="h-4 w-4" />
              </button>
              <button className="btn btn-link text-muted p-1">
                <Maximize2 className="h-4 w-4" />
              </button>
              <button className="btn btn-link text-muted p-1">
                <Search className="h-4 w-4" />
              </button>
              <button className="btn btn-link text-muted p-1">
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button className="btn btn-link text-muted p-1 position-relative">
                <Bell className="h-4 w-4" />
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill" style={{fontSize: '0.6rem', backgroundColor: '#4169E1'}}>5</span>
              </button>
              <button className="btn btn-link text-muted p-1">
                <MessageCircle className="h-4 w-4" />
              </button>
              <button className="btn btn-sm" style={{backgroundColor: '#4169E1', borderColor: '#4169E1', color: 'white'}}>
                <Mail className="h-4 w-4 me-1" />
                Messages
              </button>
              <button className="btn btn-sm" style={{backgroundColor: '#4169E1', borderColor: '#4169E1', color: 'white'}}>
                <Settings className="h-4 w-4 me-1" />
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="p-4">

          {/* Key Metrics Cards */}
          <div className="row g-4 mb-4">
            <div className="col-md-6 col-lg-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="card-subtitle mb-2 text-muted">Active Teams</h6>
                      <h2 className="card-title mb-1 fw-bold" style={{color: '#4169E1'}}>{stats.totalTeams}</h2>
                      <small className="text-muted">Teams</small>
                      <div className="mt-2">
                        <small className="text-success">+3 new this month</small>
                      </div>
                    </div>
                    <button className="btn btn-link text-muted p-0">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="card-subtitle mb-2 text-muted">Upcoming Matches</h6>
                      <h2 className="card-title mb-1 fw-bold text-danger">{stats.upcomingMatches}</h2>
                      <small className="text-muted">Scheduled</small>
                      <div className="mt-2">
                        <small className="text-muted">Next match in 2 days</small>
                      </div>
                    </div>
                    <button className="btn btn-link text-muted p-0">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="card-subtitle mb-2 text-muted">Total Players</h6>
                      <h2 className="card-title mb-1 fw-bold text-warning">{stats.totalUsers}</h2>
                      <small className="text-muted">Registered</small>
                      <div className="mt-2">
                        <small className="text-success">+12 this week</small>
                      </div>
                    </div>
                    <button className="btn btn-link text-muted p-0">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="card-subtitle mb-2 text-muted">Win Rate</h6>
                      <h2 className="card-title mb-1 fw-bold text-success">{stats.winRate}%</h2>
                      <small className="text-muted">Overall</small>
                      <div className="mt-2">
                        <small className="text-success">+5% from last season</small>
                      </div>
                    </div>
                    <button className="btn btn-link text-muted p-0">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts and Overview Section */}
          <div className="row g-4 mb-4">
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-transparent border-0">
                  <h5 className="card-title mb-0">Match Performance Summary</h5>
                  <small className="text-muted">Goals Scored vs. Goals Conceded</small>
                </div>
                <div className="card-body">
                  <div style={{ height: '300px' }}>
                    <Line data={matchPerformanceData} options={chartOptions} />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-transparent border-0">
                  <h5 className="card-title mb-0">Season Overview</h5>
                  <div className="btn-group btn-group-sm" role="group">
                    <button 
                      type="button" 
                      className={`btn ${timeFilter === 'last-week' ? '' : 'btn-outline-secondary'}`}
                      style={timeFilter === 'last-week' ? {backgroundColor: '#4169E1', borderColor: '#4169E1', color: 'white'} : {}}
                      onClick={() => setTimeFilter('last-week')}
                    >
                      Last Week
                    </button>
                    <button 
                      type="button" 
                      className={`btn ${timeFilter === 'this-week' ? '' : 'btn-outline-secondary'}`}
                      style={timeFilter === 'this-week' ? {backgroundColor: '#4169E1', borderColor: '#4169E1', color: 'white'} : {}}
                      onClick={() => setTimeFilter('this-week')}
                    >
                      This Week
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <div className="row g-2">
                    <div className="col-6">
                                              <div className="card text-white" style={{backgroundColor: '#4169E1'}}>
                          <div className="card-body p-3">
                            <h6 className="mb-1">{stats.totalGoals}</h6>
                            <small>Goals Scored</small>
                          </div>
                        </div>
                    </div>
                    <div className="col-6">
                      <div className="card bg-success text-white">
                        <div className="card-body p-3">
                          <h6 className="mb-1">{stats.completedMatches}</h6>
                          <small>Matches Played</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="card bg-info text-white">
                        <div className="card-body p-2">
                          <h6 className="mb-0">{stats.activeMatches}</h6>
                          <small>Live Matches</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="card bg-warning text-white">
                        <div className="card-body p-2">
                          <h6 className="mb-0">{stats.totalTeams}</h6>
                          <small>Active Teams</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="card bg-danger text-white">
                        <div className="card-body p-2">
                          <h6 className="mb-0">24</h6>
                          <small>Injuries</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="card bg-secondary text-white">
                        <div className="card-body p-2">
                          <h6 className="mb-0">8</h6>
                          <small>Coaches</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Team Performance and Schedule */}
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-transparent border-0">
                  <h5 className="card-title mb-0">Team Performance Distribution</h5>
                  <div className="btn-group btn-group-sm" role="group">
                    <button type="button" className="btn btn-outline-secondary">Last Month</button>
                    <button type="button" className="btn btn-sm" style={{backgroundColor: '#4169E1', borderColor: '#4169E1', color: 'white'}}>This Month</button>
                  </div>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-8">
                      <div style={{ height: '250px' }}>
                        <Doughnut data={teamPerformanceData} options={chartOptions} />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="d-flex flex-column justify-content-center h-100">
                        <div className="text-center mb-3">
                          <h4 className="fw-bold" style={{color: '#4169E1'}}>{stats.totalMatches}</h4>
                          <small className="text-muted">Total matches</small>
                        </div>
                        <div className="text-center">
                          <h4 className="fw-bold text-success">{stats.winRate}%</h4>
                          <small className="text-muted">Win percentage</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-transparent border-0">
                  <h5 className="card-title mb-0">Today's Schedule</h5>
                  <div className="btn-group btn-group-sm" role="group">
                    <button type="button" className="btn btn-sm" style={{backgroundColor: '#4169E1', borderColor: '#4169E1', color: 'white'}}>Today</button>
                    <button type="button" className="btn btn-outline-secondary">Tomorrow</button>
                  </div>
                </div>
                <div className="card-body">
                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-primary bg-opacity-10 p-2 rounded me-3">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1">U16 Boys vs U16 Girls</h6>
                        <small className="text-muted">in 32 minutes • Main Field</small>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted" />
                    </div>
                    
                    <div className="d-flex align-items-center">
                      <div className="bg-success bg-opacity-10 p-2 rounded me-3">
                        <CheckCircle className="h-4 w-4 text-success" />
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1">Team Practice</h6>
                        <small className="text-muted">10:30 AM • Practice Field</small>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted" />
                    </div>
                    
                    <div className="d-flex align-items-center">
                      <div className="bg-warning bg-opacity-10 p-2 rounded me-3">
                        <AlertCircle className="h-4 w-4 text-warning" />
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1">Coach Meeting</h6>
                        <small className="text-muted">11:00 AM • Conference Room</small>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted" />
                    </div>
                    
                    <div className="d-flex align-items-center">
                      <div className="bg-info bg-opacity-10 p-2 rounded me-3">
                        <Clock className="h-4 w-4 text-info" />
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1">U14 Girls Practice</h6>
                        <small className="text-muted">2:00 PM • Field 2</small>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Match Tracker Section */}
          <div className="row g-4 mt-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-transparent border-0">
                  <h5 className="card-title mb-0">Live Match Tracker</h5>
                  <small className="text-muted">Real-time match data entry and statistics</small>
                </div>
                <div className="card-body">
                  <div className="row g-4">
                    {/* Match Control Panel */}
                    <div className="col-lg-4">
                      <div className="card bg-light border-0">
                        <div className="card-body">
                          <h6 className="card-title mb-3">Match Control</h6>
                          <div className="d-flex justify-content-center mb-3">
                            <div className="text-center">
                              <div className="h2 fw-bold" style={{color: '#4169E1'}}>45:23</div>
                              <small className="text-muted">Match Time</small>
                            </div>
                          </div>
                          <div className="d-flex justify-content-center gap-2 mb-3">
                            <button className="btn btn-sm btn-success">
                              <Play className="h-4 w-4 me-1" />
                              Start
                            </button>
                            <button className="btn btn-sm btn-warning">
                              <Pause className="h-4 w-4 me-1" />
                              Pause
                            </button>
                            <button className="btn btn-sm btn-danger">
                              <Square className="h-4 w-4 me-1" />
                              End
                            </button>
                          </div>
                          <div className="row text-center">
                            <div className="col-6">
                              <h5 className="fw-bold">2</h5>
                              <small className="text-muted">Team A</small>
                            </div>
                            <div className="col-6">
                              <h5 className="fw-bold">1</h5>
                              <small className="text-muted">Team B</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Event Entry */}
                    <div className="col-lg-4">
                      <div className="card bg-light border-0">
                        <div className="card-body">
                          <h6 className="card-title mb-3">Quick Event Entry</h6>
                          <div className="d-grid gap-2">
                            <button className="btn btn-sm btn-outline-success">
                              <Target className="h-4 w-4 me-1" />
                              Goal
                            </button>
                            <button className="btn btn-sm btn-outline-warning">
                              <AlertTriangle className="h-4 w-4 me-1" />
                              Yellow Card
                            </button>
                            <button className="btn btn-sm btn-outline-danger">
                              <AlertTriangle className="h-4 w-4 me-1" />
                              Red Card
                            </button>
                            <button className="btn btn-sm btn-outline-info">
                              <Users className="h-4 w-4 me-1" />
                              Substitution
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Match Statistics */}
                    <div className="col-lg-4">
                      <div className="card bg-light border-0">
                        <div className="card-body">
                          <h6 className="card-title mb-3">Match Statistics</h6>
                          <div className="row text-center">
                            <div className="col-6 mb-2">
                              <div className="bg-white rounded p-2">
                                <h6 className="mb-0">3</h6>
                                <small className="text-muted">Goals</small>
                              </div>
                            </div>
                            <div className="col-6 mb-2">
                              <div className="bg-white rounded p-2">
                                <h6 className="mb-0">2</h6>
                                <small className="text-muted">Cards</small>
                              </div>
                            </div>
                            <div className="col-6 mb-2">
                              <div className="bg-white rounded p-2">
                                <h6 className="mb-0">4</h6>
                                <small className="text-muted">Subs</small>
                              </div>
                            </div>
                            <div className="col-6 mb-2">
                              <div className="bg-white rounded p-2">
                                <h6 className="mb-0">1</h6>
                                <small className="text-muted">Injuries</small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Analytics Section */}
          <div className="row g-4 mt-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-transparent border-0">
                  <h5 className="card-title mb-0">Advanced Analytics</h5>
                  <div className="btn-group btn-group-sm" role="group">
                    <button type="button" className="btn btn-outline-secondary">Last 7 Days</button>
                    <button type="button" className="btn btn-sm" style={{backgroundColor: '#4169E1', borderColor: '#4169E1', color: 'white'}}>Last 30 Days</button>
                    <button type="button" className="btn btn-outline-secondary">Last 90 Days</button>
                  </div>
                </div>
                <div className="card-body">
                  <div className="row g-4">
                    {/* Performance Metrics */}
                    <div className="col-md-6 col-lg-3">
                      <div className="card border-0 bg-light">
                        <div className="card-body text-center">
                          <div className="mb-2">
                            <TrendingUp className="h-6 w-6 text-success" />
                          </div>
                          <h4 className="fw-bold">12.5%</h4>
                          <small className="text-muted">User Growth</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 col-lg-3">
                      <div className="card border-0 bg-light">
                        <div className="card-body text-center">
                          <div className="mb-2">
                            <Activity className="h-6 w-6" style={{color: '#4169E1'}} />
                          </div>
                          <h4 className="fw-bold">8.2%</h4>
                          <small className="text-muted">Team Growth</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 col-lg-3">
                      <div className="card border-0 bg-light">
                        <div className="card-body text-center">
                          <div className="mb-2">
                            <TrendingDown className="h-6 w-6 text-danger" />
                          </div>
                          <h4 className="fw-bold">-3.1%</h4>
                          <small className="text-muted">Match Decline</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 col-lg-3">
                      <div className="card border-0 bg-light">
                        <div className="card-body text-center">
                          <div className="mb-2">
                            <Award className="h-6 w-6 text-warning" />
                          </div>
                          <h4 className="fw-bold">15.7%</h4>
                          <small className="text-muted">Revenue Growth</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Tools & User Management */}
          <div className="row g-4 mt-4">
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-transparent border-0">
                  <h5 className="card-title mb-0">User Management</h5>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-secondary">
                      <Search className="h-4 w-4 me-1" />
                      Search
                    </button>
                    <button className="btn btn-sm" style={{backgroundColor: '#4169E1', borderColor: '#4169E1', color: 'white'}}>
                      <User className="h-4 w-4 me-1" />
                      Add User
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>Last Active</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <div className="fw-medium">John Smith</div>
                                <small className="text-muted">john.smith@example.com</small>
                              </div>
                            </div>
                          </td>
                          <td><span className="badge bg-primary">Super Admin</span></td>
                          <td><span className="badge bg-success">Active</span></td>
                          <td><small className="text-muted">2 hours ago</small></td>
                          <td>
                            <button className="btn btn-sm btn-outline-secondary">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="bg-success bg-opacity-10 rounded-circle p-2 me-2">
                                <User className="h-4 w-4 text-success" />
                              </div>
                              <div>
                                <div className="fw-medium">Sarah Johnson</div>
                                <small className="text-muted">sarah.johnson@example.com</small>
                              </div>
                            </div>
                          </td>
                          <td><span className="badge bg-info">Club Admin</span></td>
                          <td><span className="badge bg-success">Active</span></td>
                          <td><small className="text-muted">1 day ago</small></td>
                          <td>
                            <button className="btn btn-sm btn-outline-secondary">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="bg-warning bg-opacity-10 rounded-circle p-2 me-2">
                                <User className="h-4 w-4 text-warning" />
                              </div>
                              <div>
                                <div className="fw-medium">Mike Coach</div>
                                <small className="text-muted">mike.coach@example.com</small>
                              </div>
                            </div>
                          </td>
                          <td><span className="badge bg-warning">Coach</span></td>
                          <td><span className="badge bg-warning">Pending</span></td>
                          <td><small className="text-muted">3 days ago</small></td>
                          <td>
                            <button className="btn btn-sm btn-outline-secondary">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-transparent border-0">
                  <h5 className="card-title mb-0">System Health</h5>
                </div>
                <div className="card-body">
                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">CPU Usage</h6>
                        <small className="text-muted">System performance</small>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold text-success">23%</div>
                        <small className="text-muted">Normal</small>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">Memory Usage</h6>
                        <small className="text-muted">RAM utilization</small>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold text-warning">67%</div>
                        <small className="text-muted">Moderate</small>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">Database</h6>
                        <small className="text-muted">Connection status</small>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold text-success">Connected</div>
                        <small className="text-muted">Healthy</small>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">Uptime</h6>
                        <small className="text-muted">System availability</small>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold text-success">99.9%</div>
                        <small className="text-muted">Excellent</small>
                      </div>
                    </div>
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