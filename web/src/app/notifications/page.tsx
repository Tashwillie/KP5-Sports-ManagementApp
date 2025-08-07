'use client';

import { useFirebase } from '@/contexts/FirebaseContext';
import { useState, useEffect } from 'react';

interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'event_reminder' | 'message' | 'registration_update' | 'payment_reminder' | 'team_update' | 'system';
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
  priority: 'low' | 'medium' | 'high';
}

export default function NotificationsPage() {
  const { userData, loading } = useFirebase();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  // Mock data for notifications
  useEffect(() => {
    if (!loading) {
      const mockNotifications: Notification[] = [
        {
          id: '1',
          userId: 'player-1',
          title: 'Practice Reminder',
          body: 'You have a team practice session in 2 hours at the main field.',
          type: 'event_reminder',
          data: { eventId: 'event-1', eventType: 'practice' },
          read: false,
          createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          priority: 'high',
        },
        {
          id: '2',
          userId: 'player-1',
          title: 'New Message from Coach',
          body: 'Coach Johnson sent you a direct message about tomorrow\'s game strategy.',
          type: 'message',
          data: { messageId: 'msg-1', senderId: 'coach-1' },
          read: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          priority: 'medium',
        },
        {
          id: '3',
          userId: 'player-1',
          title: 'Registration Approved',
          body: 'Your registration for the Spring Tournament has been approved. Welcome to the team!',
          type: 'registration_update',
          data: { tournamentId: 'tournament-1', status: 'approved' },
          read: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          priority: 'medium',
        },
        {
          id: '4',
          userId: 'player-1',
          title: 'Payment Due',
          body: 'Your monthly membership fee is due in 3 days. Please complete your payment.',
          type: 'payment_reminder',
          data: { amount: 50, dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
          read: false,
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          priority: 'high',
        },
        {
          id: '5',
          userId: 'player-1',
          title: 'Team Roster Updated',
          body: 'The team roster has been updated. Check out the new players joining your team.',
          type: 'team_update',
          data: { teamId: 'team-1', action: 'roster_updated' },
          read: true,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          priority: 'low',
        },
        {
          id: '6',
          userId: 'player-1',
          title: 'System Maintenance',
          body: 'Scheduled maintenance will occur tonight from 2-4 AM. Some features may be temporarily unavailable.',
          type: 'system',
          data: { maintenanceWindow: '2-4 AM' },
          read: true,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          priority: 'low',
        },
      ];
      setNotifications(mockNotifications);
      setLoadingNotifications(false);
    }
  }, [loading]);

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.body.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || notification.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const highPriorityCount = notifications.filter(n => n.priority === 'high' && !n.read).length;

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) return `${diffInDays}d ago`;
    if (diffInHours > 0) return `${diffInHours}h ago`;
    if (diffInMinutes > 0) return `${diffInMinutes}m ago`;
    return 'Just now';
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'event_reminder': return 'bi-calendar-event';
      case 'message': return 'bi-envelope';
      case 'registration_update': return 'bi-person-check';
      case 'payment_reminder': return 'bi-credit-card';
      case 'team_update': return 'bi-people';
      case 'system': return 'bi-gear';
      default: return 'bi-bell';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'event_reminder': return 'primary';
      case 'message': return 'info';
      case 'registration_update': return 'success';
      case 'payment_reminder': return 'warning';
      case 'team_update': return 'secondary';
      case 'system': return 'dark';
      default: return 'primary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  if (loading || loadingNotifications) {
    return (
      <div className="container-fluid">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Notifications</h1>
          <p className="text-muted mb-0">Stay updated with important alerts and updates</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary" onClick={markAllAsRead}>
            <i className="bi bi-check-all me-2"></i>
            Mark All Read
          </button>
          <button className="btn btn-outline-secondary">
            <i className="bi bi-gear me-2"></i>
            Settings
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-bell text-primary fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title mb-1">Total Notifications</h6>
                  <h4 className="mb-0">{notifications.length}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-exclamation-triangle text-warning fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title mb-1">Unread</h6>
                  <h4 className="mb-0">{unreadCount}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-danger bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-exclamation-circle text-danger fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title mb-1">High Priority</h6>
                  <h4 className="mb-0">{highPriorityCount}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-success bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-calendar-event text-success fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title mb-1">Event Reminders</h6>
                  <h4 className="mb-0">{notifications.filter(n => n.type === 'event_reminder').length}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="btn-group" role="group">
                <button
                  type="button"
                  className={`btn btn-outline-primary ${activeTab === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveTab('all')}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`btn btn-outline-primary ${activeTab === 'event_reminder' ? 'active' : ''}`}
                  onClick={() => setActiveTab('event_reminder')}
                >
                  Events
                </button>
                <button
                  type="button"
                  className={`btn btn-outline-primary ${activeTab === 'message' ? 'active' : ''}`}
                  onClick={() => setActiveTab('message')}
                >
                  Messages
                </button>
                <button
                  type="button"
                  className={`btn btn-outline-primary ${activeTab === 'payment_reminder' ? 'active' : ''}`}
                  onClick={() => setActiveTab('payment_reminder')}
                >
                  Payments
                </button>
              </div>
            </div>
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-bell-slash fs-1 text-muted mb-3"></i>
              <h5 className="text-muted">No notifications found</h5>
              <p className="text-muted">You're all caught up! No new notifications to display.</p>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`list-group-item list-group-item-action border-0 px-4 py-3 ${
                    !notification.read ? 'bg-light' : ''
                  }`}
                >
                  <div className="d-flex align-items-start">
                    <div className="flex-shrink-0 me-3">
                      <div className={`bg-${getNotificationColor(notification.type)} bg-opacity-10 rounded-circle p-2`}>
                        <i className={`bi ${getNotificationIcon(notification.type)} text-${getNotificationColor(notification.type)} fs-5`}></i>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <h6 className={`mb-0 ${!notification.read ? 'fw-bold' : ''}`}>
                            {notification.title}
                          </h6>
                          {!notification.read && (
                            <span className="badge bg-primary rounded-pill">New</span>
                          )}
                          <span className={`badge bg-${getPriorityColor(notification.priority)} rounded-pill`}>
                            {notification.priority}
                          </span>
                        </div>
                        <div className="dropdown">
                          <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                            <i className="bi bi-three-dots"></i>
                          </button>
                          <ul className="dropdown-menu">
                            {!notification.read && (
                              <li><button className="dropdown-item" onClick={() => markAsRead(notification.id)}>Mark as Read</button></li>
                            )}
                            <li><button className="dropdown-item">View Details</button></li>
                            <li><hr className="dropdown-divider" /></li>
                            <li><button className="dropdown-item text-danger" onClick={() => deleteNotification(notification.id)}>Delete</button></li>
                          </ul>
                        </div>
                      </div>
                      <p className="text-muted mb-2">{notification.body}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">{formatTimeAgo(notification.createdAt)}</small>
                        <div className="d-flex gap-2">
                          {notification.data && (
                            <button className="btn btn-sm btn-outline-primary">
                              <i className="bi bi-eye me-1"></i>
                              View Details
                            </button>
                          )}
                          {!notification.read && (
                            <button className="btn btn-sm btn-outline-success" onClick={() => markAsRead(notification.id)}>
                              <i className="bi bi-check me-1"></i>
                              Mark Read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 