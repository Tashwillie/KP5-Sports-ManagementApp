'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Bell,
  Home,
  Users as UsersIcon,
  Calendar as CalendarIcon,
  Trophy as TrophyIcon,
  MapPin as MapPinIcon,
  FileText as FileTextIcon,
  Settings as SettingsIcon,
  BarChart3,
  Target,
  User,
  Building,
  Users,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Award,
  UserCheck,
  Activity,
  Trophy,
  Calendar,
  GraduationCap,
  Briefcase,
  Clock,
  CheckCircle,
  Gavel,
  Shield,
  Zap,
  DollarSign,
  Save,
  Lock,
  Palette,
  Database,
  Shield as SecurityIcon,
  Bell as NotificationIcon,
  Globe as LanguageIcon,
  Monitor,
  Smartphone,
  Download,
  Upload,
  Key,
  Eye as VisibilityIcon,
  EyeOff,
  Wifi,
  WifiOff,
  Crown,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Server,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Database as DatabaseIcon,
  FileText,
  Shield as ShieldIcon,
  Users as UsersIcon2,
  Activity as ActivityIcon,
  BarChart,
  PieChart,
  LineChart,
  AlertCircle,
  CheckCircle as CheckCircleIcon,
  XCircle,
  Clock as ClockIcon,
  Calendar as CalendarIcon2,
  DollarSign as DollarSignIcon,
  Settings as SettingsIcon2,
  LogOut,
  RefreshCw,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Trash2 as TrashIcon,
  Edit as EditIcon,
  Eye as EyeIcon,
  MoreHorizontal,
  Plus as PlusIcon,
  Minus,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Copy,
  Share,
  Archive,
  Unarchive,
  Lock as LockIcon,
  Unlock,
  UserPlus,
  UserMinus,
  UserCheck as UserCheckIcon,
  UserX,
  Mail as MailIcon,
  MessageSquare,
  Phone as PhoneIcon,
  Video,
  Camera,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Battery,
  BatteryCharging,
  Power,
  PowerOff,
  Play,
  Pause,
  Stop,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Maximize,
  Minimize,
  Move,
  Grid,
  List,
  Columns,
  Sidebar,
  SidebarClose,
  Menu,
  X,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  CornerUpLeft,
  CornerUpRight,
  CornerDownLeft,
  CornerDownRight,
  Move as MoveIcon,
  MousePointer,
  Type,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link,
  Image,
  Video as VideoIcon,
  Music,
  File,
  Folder,
  FolderOpen,
  FolderPlus,
  FolderMinus,
  FilePlus,
  FileMinus,
  FileText as FileTextIcon2,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  FileSpreadsheet,
  FilePresentation,
  FilePdf,
  FileWord,
  FileExcel,
  FilePowerpoint,
  FileZip,
  FileX,
  FileCheck,
  FileSearch,
  FileEdit,
  FileLock,
  FileUnlock,
  FileDownload,
  FileUpload,
  FileHeart,
  FileWarning,
  FileInfo,
  FileMinus as FileMinusIcon,
  FilePlus as FilePlusIcon,
  FileX as FileXIcon,
  FileCheck as FileCheckIcon,
  FileSearch as FileSearchIcon,
  FileEdit as FileEditIcon,
  FileLock as FileLockIcon,
  FileUnlock as FileUnlockIcon,
  FileDownload as FileDownloadIcon,
  FileUpload as FileUploadIcon,
  FileHeart as FileHeartIcon,
  FileWarning as FileWarningIcon,
  FileInfo as FileInfoIcon
} from 'lucide-react';

interface SystemMetric {
  id: string;
  title: string;
  value: string;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: React.ReactNode;
  color: string;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  permissions: string[];
  avatar?: string;
}

interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface RecentActivity {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('admin');
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  // Mock user data
  const userData = {
    id: 'admin123',
    name: 'Admin User',
    email: 'admin@kp5academy.com',
    role: 'Super Admin'
  };

  // System metrics data
  const systemMetrics: SystemMetric[] = [
    {
      id: '1',
      title: 'Total Users',
      value: '2,847',
      change: 12.5,
      changeType: 'increase',
      icon: <Users size={24} />,
      color: '#4169E1'
    },
    {
      id: '2',
      title: 'Active Sessions',
      value: '1,234',
      change: -3.2,
      changeType: 'decrease',
      icon: <Activity size={24} />,
      color: '#28a745'
    },
    {
      id: '3',
      title: 'System Load',
      value: '67%',
      change: 8.1,
      changeType: 'increase',
      icon: <Cpu size={24} />,
      color: '#ffc107'
    },
    {
      id: '4',
      title: 'Storage Used',
      value: '78%',
      change: 2.3,
      changeType: 'increase',
      icon: <HardDrive size={24} />,
      color: '#dc3545'
    },
    {
      id: '5',
      title: 'Revenue (MTD)',
      value: '$45,678',
      change: 15.7,
      changeType: 'increase',
      icon: <DollarSign size={24} />,
      color: '#20c997'
    },
    {
      id: '6',
      title: 'API Requests',
      value: '89.2K',
      change: -1.8,
      changeType: 'decrease',
      icon: <Server size={24} />,
      color: '#6f42c1'
    }
  ];

  // Admin users data
  const adminUsers: AdminUser[] = [
    {
      id: '1',
      name: 'John Admin',
      email: 'john.admin@kp5academy.com',
      role: 'Super Admin',
      status: 'active',
      lastLogin: '2024-01-20T15:30:00Z',
      permissions: ['all']
    },
    {
      id: '2',
      name: 'Sarah Manager',
      email: 'sarah.manager@kp5academy.com',
      role: 'Club Admin',
      status: 'active',
      lastLogin: '2024-01-20T14:15:00Z',
      permissions: ['clubs', 'teams', 'players', 'matches']
    },
    {
      id: '3',
      name: 'Mike Coach',
      email: 'mike.coach@kp5academy.com',
      role: 'Coach',
      status: 'active',
      lastLogin: '2024-01-20T13:45:00Z',
      permissions: ['teams', 'players', 'matches']
    },
    {
      id: '4',
      name: 'Lisa Referee',
      email: 'lisa.referee@kp5academy.com',
      role: 'Referee',
      status: 'inactive',
      lastLogin: '2024-01-19T16:20:00Z',
      permissions: ['matches']
    },
    {
      id: '5',
      name: 'David Support',
      email: 'david.support@kp5academy.com',
      role: 'Support',
      status: 'suspended',
      lastLogin: '2024-01-18T10:30:00Z',
      permissions: ['support', 'users']
    }
  ];

  // System alerts data
  const systemAlerts: SystemAlert[] = [
    {
      id: '1',
      type: 'warning',
      title: 'High CPU Usage',
      message: 'Server CPU usage has exceeded 80% for the last 10 minutes',
      timestamp: '2024-01-20T15:45:00Z',
      priority: 'high'
    },
    {
      id: '2',
      type: 'error',
      title: 'Database Connection Failed',
      message: 'Failed to connect to primary database server',
      timestamp: '2024-01-20T15:30:00Z',
      priority: 'critical'
    },
    {
      id: '3',
      type: 'info',
      title: 'Backup Completed',
      message: 'Daily backup completed successfully at 02:00 AM',
      timestamp: '2024-01-20T02:00:00Z',
      priority: 'low'
    },
    {
      id: '4',
      type: 'success',
      title: 'Security Update',
      message: 'Latest security patches have been applied successfully',
      timestamp: '2024-01-20T01:30:00Z',
      priority: 'medium'
    }
  ];

  // Recent activity data
  const recentActivity: RecentActivity[] = [
    {
      id: '1',
      user: 'john.admin@kp5academy.com',
      action: 'Created new tournament',
      target: 'Summer League 2024',
      timestamp: '2024-01-20T15:45:00Z',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    },
    {
      id: '2',
      user: 'sarah.manager@kp5academy.com',
      action: 'Updated team roster',
      target: 'Elite FC',
      timestamp: '2024-01-20T15:30:00Z',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    },
    {
      id: '3',
      user: 'mike.coach@kp5academy.com',
      action: 'Scheduled match',
      target: 'Elite FC vs Champions FC',
      timestamp: '2024-01-20T15:15:00Z',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'
    },
    {
      id: '4',
      user: 'lisa.referee@kp5academy.com',
      action: 'Updated match result',
      target: 'Match #1234',
      timestamp: '2024-01-20T15:00:00Z',
      ipAddress: '192.168.1.103',
      userAgent: 'Mozilla/5.0 (Android 13; Mobile)'
    },
    {
      id: '5',
      user: 'david.support@kp5academy.com',
      action: 'Resolved support ticket',
      target: 'Ticket #5678',
      timestamp: '2024-01-20T14:45:00Z',
      ipAddress: '192.168.1.104',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  ];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'badge bg-success';
      case 'inactive':
        return 'badge bg-secondary';
      case 'suspended':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <AlertCircle size={16} className="text-info" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-warning" />;
      case 'error':
        return <XCircle size={16} className="text-danger" />;
      case 'success':
        return <CheckCircleIcon size={16} className="text-success" />;
      default:
        return <AlertCircle size={16} className="text-info" />;
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'badge bg-secondary';
      case 'medium':
        return 'badge bg-info';
      case 'high':
        return 'badge bg-warning text-dark';
      case 'critical':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleRefreshMetrics = () => {
    // Mock refresh functionality
    console.log('Refreshing system metrics...');
  };

  const handleExportData = () => {
    // Mock export functionality
    console.log('Exporting admin data...');
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <div className="bg-white border-end" style={{ width: '280px', minHeight: '100vh' }}>
        <div className="p-3 border-bottom">
          <img 
            src="/images/logo.png" 
            alt="KP5 Academy" 
            className="img-fluid" 
            style={{ maxHeight: '50px' }}
          />
        </div>
        
        <div className="p-3 border-bottom">
          <div className="d-flex align-items-center">
            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
              <Crown size={20} className="text-warning" />
            </div>
            <div>
              <div className="fw-medium">{userData.name}</div>
              <small className="text-muted">{userData.role}</small>
            </div>
          </div>
        </div>

        <nav className="p-3">
          <div className="nav flex-column">
            <a href="/dashboard" className={`nav-link d-flex align-items-center py-2 px-3 rounded ${activeTab === 'dashboard' ? 'text-white' : 'text-muted'}`} style={activeTab === 'dashboard' ? {backgroundColor: '#4169E1'} : {}}>
              <Home size={18} className="me-3" />
              Dashboard
            </a>
            <a href="/teams" className={`nav-link d-flex align-items-center py-2 px-3 rounded ${activeTab === 'teams' ? 'text-white' : 'text-muted'}`} style={activeTab === 'teams' ? {backgroundColor: '#4169E1'} : {}}>
              <UsersIcon size={18} className="me-3" />
              Teams
            </a>
            <a href="/matches" className={`nav-link d-flex align-items-center py-2 px-3 rounded ${activeTab === 'matches' ? 'text-white' : 'text-muted'}`} style={activeTab === 'matches' ? {backgroundColor: '#4169E1'} : {}}>
              <Target size={18} className="me-3" />
              Matches
            </a>
            <a href="/tournaments" className={`nav-link d-flex align-items-center py-2 px-3 rounded ${activeTab === 'tournaments' ? 'text-white' : 'text-muted'}`} style={activeTab === 'tournaments' ? {backgroundColor: '#4169E1'} : {}}>
              <TrophyIcon size={18} className="me-3" />
              Tournaments
            </a>
            <a href="/leagues" className={`nav-link d-flex align-items-center py-2 px-3 rounded ${activeTab === 'leagues' ? 'text-white' : 'text-muted'}`} style={activeTab === 'leagues' ? {backgroundColor: '#4169E1'} : {}}>
              <BarChart3 size={18} className="me-3" />
              Leagues
            </a>
            <a href="/events" className={`nav-link d-flex align-items-center py-2 px-3 rounded ${activeTab === 'events' ? 'text-white' : 'text-muted'}`} style={activeTab === 'events' ? {backgroundColor: '#4169E1'} : {}}>
              <CalendarIcon size={18} className="me-3" />
              Events
            </a>
            <a href="/clubs" className={`nav-link d-flex align-items-center py-2 px-3 rounded ${activeTab === 'clubs' ? 'text-white' : 'text-muted'}`} style={activeTab === 'clubs' ? {backgroundColor: '#4169E1'} : {}}>
              <Building size={18} className="me-3" />
              Clubs
            </a>
            <a href="/players" className={`nav-link d-flex align-items-center py-2 px-3 rounded ${activeTab === 'players' ? 'text-white' : 'text-muted'}`} style={activeTab === 'players' ? {backgroundColor: '#4169E1'} : {}}>
              <UserCheck size={18} className="me-3" />
              Players
            </a>
            <a href="/coaches" className={`nav-link d-flex align-items-center py-2 px-3 rounded ${activeTab === 'coaches' ? 'text-white' : 'text-muted'}`} style={activeTab === 'coaches' ? {backgroundColor: '#4169E1'} : {}}>
              <GraduationCap size={18} className="me-3" />
              Coaches
            </a>
            <a href="/referees" className={`nav-link d-flex align-items-center py-2 px-3 rounded ${activeTab === 'referees' ? 'text-white' : 'text-muted'}`} style={activeTab === 'referees' ? {backgroundColor: '#4169E1'} : {}}>
              <Award size={18} className="me-3" />
              Referees
            </a>
            <a href="/registration" className={`nav-link d-flex align-items-center py-2 px-3 rounded ${activeTab === 'registration' ? 'text-white' : 'text-muted'}`} style={activeTab === 'registration' ? {backgroundColor: '#4169E1'} : {}}>
              <FileTextIcon size={18} className="me-3" />
              Registration
            </a>
            <a href="/payments" className={`nav-link d-flex align-items-center py-2 px-3 rounded ${activeTab === 'payments' ? 'text-white' : 'text-muted'}`} style={activeTab === 'payments' ? {backgroundColor: '#4169E1'} : {}}>
              <DollarSign size={18} className="me-3" />
              Payments
            </a>
            <a href="/settings" className={`nav-link d-flex align-items-center py-2 px-3 rounded ${activeTab === 'settings' ? 'text-white' : 'text-muted'}`} style={activeTab === 'settings' ? {backgroundColor: '#4169E1'} : {}}>
              <SettingsIcon size={18} className="me-3" />
              Settings
            </a>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 bg-light">
        {/* Header */}
        <div className="bg-white border-bottom p-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <h4 className="mb-0 me-3">Admin Dashboard</h4>
              <span className="badge bg-warning text-dark">Super Admin</span>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary btn-sm d-flex align-items-center" onClick={handleRefreshMetrics}>
                <RefreshCw size={16} className="me-1" />
                Refresh
              </button>
              <button className="btn btn-outline-secondary btn-sm d-flex align-items-center" onClick={handleExportData}>
                <DownloadIcon size={16} className="me-1" />
                Export
              </button>
              <button className="btn btn-outline-secondary btn-sm d-flex align-items-center">
                <Bell size={16} className="me-1" />
                Notifications
              </button>
            </div>
          </div>
        </div>

        {/* Admin Content */}
        <div className="p-4">
          {/* Time Range Selector */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">System Overview</h5>
              <select 
                className="form-select form-select-sm" 
                style={{ width: 'auto' }}
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
          </div>

          {/* System Metrics */}
          <div className="row g-4 mb-4">
            {systemMetrics.map((metric) => (
              <div key={metric.id} className="col-xl-4 col-md-6">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="flex-grow-1">
                        <h6 className="text-muted mb-1">{metric.title}</h6>
                        <h4 className="mb-1 fw-bold">{metric.value}</h4>
                        <div className="d-flex align-items-center">
                          {metric.changeType === 'increase' ? (
                            <TrendingUp size={16} className="text-success me-1" />
                          ) : (
                            <TrendingDown size={16} className="text-danger me-1" />
                          )}
                          <small className={metric.changeType === 'increase' ? 'text-success' : 'text-danger'}>
                            {metric.change > 0 ? '+' : ''}{metric.change}%
                          </small>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <div 
                          className="rounded-circle d-flex align-items-center justify-content-center" 
                          style={{ 
                            width: '48px', 
                            height: '48px', 
                            backgroundColor: `${metric.color}20`,
                            color: metric.color
                          }}
                        >
                          {metric.icon}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-4">
            {/* Admin Users */}
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">Admin Users</h6>
                    <button className="btn btn-sm btn-outline-primary">
                      <Plus size={16} className="me-1" />
                      Add Admin
                    </button>
                  </div>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th className="border-0 px-3 py-2 fw-medium">User</th>
                          <th className="border-0 px-3 py-2 fw-medium">Role</th>
                          <th className="border-0 px-3 py-2 fw-medium">Status</th>
                          <th className="border-0 px-3 py-2 fw-medium">Last Login</th>
                          <th className="border-0 px-3 py-2 fw-medium text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminUsers.map((user) => (
                          <tr key={user.id}>
                            <td className="px-3 py-2">
                              <div className="d-flex align-items-center">
                                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
                                  <User size={16} className="text-muted" />
                                </div>
                                <div>
                                  <div className="fw-medium small">{user.name}</div>
                                  <small className="text-muted">{user.email}</small>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <small className="text-muted">{user.role}</small>
                            </td>
                            <td className="px-3 py-2">
                              <span className={getStatusBadgeClass(user.status)}>
                                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              <small className="text-muted">{formatTimestamp(user.lastLogin)}</small>
                            </td>
                            <td className="px-3 py-2 text-end">
                              <div className="btn-group" role="group">
                                <button className="btn btn-sm btn-outline-secondary" title="View">
                                  <Eye size={12} />
                                </button>
                                <button className="btn btn-sm btn-outline-secondary" title="Edit">
                                  <Edit size={12} />
                                </button>
                                <button className="btn btn-sm btn-outline-secondary" title="More">
                                  <MoreHorizontal size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* System Alerts */}
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">System Alerts</h6>
                    <button className="btn btn-sm btn-outline-secondary">
                      <Eye size={16} className="me-1" />
                      View All
                    </button>
                  </div>
                </div>
                <div className="card-body p-0">
                  <div className="list-group list-group-flush">
                    {systemAlerts.map((alert) => (
                      <div key={alert.id} className="list-group-item border-0 py-3">
                        <div className="d-flex align-items-start">
                          <div className="flex-shrink-0 me-3">
                            {getAlertIcon(alert.type)}
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start mb-1">
                              <h6 className="mb-1 small fw-medium">{alert.title}</h6>
                              <span className={getPriorityBadgeClass(alert.priority)}>
                                {alert.priority}
                              </span>
                            </div>
                            <p className="text-muted small mb-1">{alert.message}</p>
                            <small className="text-muted">{formatTimestamp(alert.timestamp)}</small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">Recent Activity</h6>
                    <button className="btn btn-sm btn-outline-secondary">
                      <Activity size={16} className="me-1" />
                      View All
                    </button>
                  </div>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th className="border-0 px-3 py-2 fw-medium">User</th>
                          <th className="border-0 px-3 py-2 fw-medium">Action</th>
                          <th className="border-0 px-3 py-2 fw-medium">Target</th>
                          <th className="border-0 px-3 py-2 fw-medium">IP Address</th>
                          <th className="border-0 px-3 py-2 fw-medium">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentActivity.map((activity) => (
                          <tr key={activity.id}>
                            <td className="px-3 py-2">
                              <small className="text-muted">{activity.user}</small>
                            </td>
                            <td className="px-3 py-2">
                              <span className="badge bg-light text-dark">{activity.action}</span>
                            </td>
                            <td className="px-3 py-2">
                              <small className="text-muted">{activity.target}</small>
                            </td>
                            <td className="px-3 py-2">
                              <small className="text-muted">{activity.ipAddress}</small>
                            </td>
                            <td className="px-3 py-2">
                              <small className="text-muted">{formatTimestamp(activity.timestamp)}</small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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