'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
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
  ImageIcon,
  Trash2,
  Archive,
  Star,
  Eye,
  EyeOff,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';

import { useNotifications } from '@/hooks/useNotifications';
import { useEnhancedAuthContext } from '@/contexts/EnhancedAuthContext';

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <NotificationsContent />
    </ProtectedRoute>
  );
}

function NotificationsContent() {
  const { user, loading  } = useEnhancedAuthContext();
  const { notifications, loading: loadingNotifications, error, refetch } = useNotifications();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'unread') return matchesSearch && !notification.isRead;
    if (activeTab === 'high') return matchesSearch; // no priority value from API
    if (activeTab === 'event_reminder') return matchesSearch && notification.type === 'EVENT';
    if (activeTab === 'message') return matchesSearch && notification.type === 'INFO';
    if (activeTab === 'payment') return matchesSearch && notification.type === 'INFO';
    
    return matchesSearch;
  });

  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    if (sortBy === 'date') {
      return sortOrder === 'asc' 
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return 0;
    }
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const highPriorityCount = 0;

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const diffInMs = now.getTime() - new Date(date).getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) return `${diffInDays}d ago`;
    if (diffInHours > 0) return `${diffInHours}h ago`;
    if (diffInMinutes > 0) return `${diffInMinutes}m ago`;
    return 'Just now';
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'EVENT': return <Calendar className="h-4 w-4" />;
      case 'MATCH': return <Calendar className="h-4 w-4" />;
      case 'TEAM': return <Users className="h-4 w-4" />;
      case 'CLUB': return <GraduationCap className="h-4 w-4" />;
      case 'INFO': return <Bell className="h-4 w-4" />;
      case 'ERROR': return <AlertTriangle className="h-4 w-4" />;
      case 'WARNING': return <AlertTriangle className="h-4 w-4" />;
      case 'SUCCESS': return <CheckCircle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'EVENT': return 'text-primary';
      case 'MATCH': return 'text-success';
      case 'TEAM': return 'text-secondary';
      case 'CLUB': return 'text-info';
      case 'ERROR': return 'text-danger';
      case 'WARNING': return 'text-warning';
      case 'SUCCESS': return 'text-success';
      case 'INFO': return 'text-muted';
      default: return 'text-muted';
    }
  };

  const getPriorityColor = (_priority: string) => 'text-muted';

  const markAsRead = (_notificationId: string) => {};
  const markAllAsRead = () => {};
  const deleteNotification = (_notificationId: string) => {};

  if (loading || loadingNotifications) {
    return (
      <div className="d-flex">
        <div className="bg-white border-end" style={{width: '280px', minHeight: '100vh'}}>
          <div className="p-3">
            <div className="placeholder-glow">
              <div className="placeholder col-8 mb-4"></div>
              <div className="placeholder col-6 mb-3"></div>
              <div className="placeholder col-10 mb-2"></div>
            </div>
          </div>
        </div>
        <div className="flex-grow-1 bg-light">
          <div className="p-4">
            <div className="placeholder-glow">
              <div className="placeholder col-4 mb-4"></div>
              <div className="placeholder col-8 mb-3"></div>
              <div className="placeholder col-6 mb-2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <p className="text-danger mb-3">{error}</p>
          <button className="btn btn-primary" onClick={refetch}>Try Again</button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h2 className="h2 fw-bold text-dark mb-3">Access Denied</h2>
          <p className="text-muted">Please sign in to access notifications.</p>
        </div>
      </div>
    );
  }

  // Prepare userData for Sidebar
  const userData = {
    id: user.id || 'user123',
    name: user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Admin User',
    email: user.email || 'admin@example.com',
    role: user.role || 'Super Admin'
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh', overflow: 'hidden' }}>
      <Sidebar activeTab="notifications" userData={userData} />
      <div className="flex-grow-1 bg-light" style={{ minWidth: 0, overflow: 'auto' }}>
        {/* Top Header */}
        <div className="bg-white border-bottom p-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div>
                <h5 className="mb-0">Notifications</h5>
                <small className="text-muted">
                  <Bell className="h-3 w-3 me-1" />
                  {unreadCount} unread, {highPriorityCount} high priority
                </small>
              </div>
            </div>
            <div className="d-flex align-items-center gap-3">
              <div className="input-group" style={{width: '300px'}}>
                <span className="input-group-text bg-white border-end-0">
                  <Search className="h-4 w-4 text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="btn-group btn-group-sm">
                <button 
                  className={`btn ${sortBy === 'date' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setSortBy('date')}
                >
                  Date
                </button>
                <button 
                  className={`btn ${sortBy === 'priority' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setSortBy('priority')}
                >
                  Priority
                </button>
              </div>
              <button 
                className={`btn btn-sm ${sortOrder === 'desc' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'desc' ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
              </button>
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={markAllAsRead}
              >
                <CheckCircle className="h-4 w-4 me-1" />
                Mark All Read
              </button>
            </div>
          </div>
        </div>
        {/* Main Notifications Content */}
        <div className="p-4">
          <div className="row">
            {/* Filter Tabs */}
            <div className="col-12 mb-4">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-transparent border-0">
                  <ul className="nav nav-tabs card-header-tabs" role="tablist">
                    <li className="nav-item" role="presentation">
                      <button 
                        className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                      >
                        All ({notifications.length})
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button 
                        className={`nav-link ${activeTab === 'unread' ? 'active' : ''}`}
                        onClick={() => setActiveTab('unread')}
                      >
                        Unread ({unreadCount})
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button 
                        className={`nav-link ${activeTab === 'high' ? 'active' : ''}`}
                        onClick={() => setActiveTab('high')}
                      >
                        High Priority ({highPriorityCount})
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button 
                        className={`nav-link ${activeTab === 'event_reminder' ? 'active' : ''}`}
                        onClick={() => setActiveTab('event_reminder')}
                      >
                        Events
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button 
                        className={`nav-link ${activeTab === 'message' ? 'active' : ''}`}
                        onClick={() => setActiveTab('message')}
                      >
                        Messages
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button 
                        className={`nav-link ${activeTab === 'payment' ? 'active' : ''}`}
                        onClick={() => setActiveTab('payment')}
                      >
                        Payments
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            {/* Notifications List */}
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                  {sortedNotifications.length > 0 ? (
                    <div className="list-group list-group-flush">
                      {sortedNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`list-group-item border-0 ${!notification.read ? 'bg-light' : ''}`}
                        >
                          <div className="d-flex align-items-start">
                            <div className="flex-shrink-0 me-3">
                              <div className={`bg-light rounded-circle d-flex align-items-center justify-content-center ${getNotificationColor(notification.type)}`} style={{width: '40px', height: '40px'}}>
                                {getNotificationIcon(notification.type)}
                              </div>
                            </div>
                            <div className="flex-grow-1 min-w-0">
                              <div className="d-flex justify-content-between align-items-start">
                                <div>
                                  <h6 className={`mb-1 ${!notification.read ? 'fw-bold' : ''}`}>
                                    {notification.title}
                                    {!notification.read && (
                                      <span className="badge bg-primary ms-2">New</span>
                                    )}
                                  </h6>
                                  <p className="mb-2 text-muted">{notification.body}</p>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                  <small className={`${getPriorityColor(notification.priority)}`}>
                                    {notification.priority}
                                  </small>
                                  <small className="text-muted">{formatTimeAgo(notification.createdAt)}</small>
                                </div>
                              </div>
                              <div className="d-flex align-items-center gap-2">
                                <button 
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => markAsRead(notification.id)}
                                  title={notification.read ? 'Mark as unread' : 'Mark as read'}
                                >
                                  {notification.read ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                </button>
                                <button 
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => deleteNotification(notification.id)}
                                  title="Delete notification"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                                <button 
                                  className="btn btn-sm btn-outline-secondary"
                                  title="Archive notification"
                                >
                                  <Archive className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <Bell className="h-12 w-12 text-muted mb-3" />
                      <h5 className="text-muted">No notifications found</h5>
                      <p className="text-muted">You're all caught up! No new notifications to display.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 