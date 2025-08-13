'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Megaphone, 
  Plus, 
  Settings, 
  Search, 
  Pin, 
  AlertTriangle, 
  Trophy, 
  User, 
  Paperclip, 
  Calendar, 
  Download,
  FileText,
  Image,
  Play,
  X,
  Check
} from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  category: 'general' | 'team' | 'tournament' | 'event' | 'important' | 'urgent';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetAudience: 'all' | 'players' | 'coaches' | 'parents' | 'admins';
  attachments: AnnouncementAttachment[];
  readBy: string[];
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  isPinned: boolean;
}

interface AnnouncementAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'video';
  size: number;
}

export default function AnnouncementsPage() {
  return (
    <ProtectedRoute>
      <AnnouncementsContent />
    </ProtectedRoute>
  );
}

function AnnouncementsContent() {
  const { user, loading  } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load announcements from API (using notifications as proxy for now)
  useEffect(() => {
    const load = async () => {
      if (loading || !user) return;
      try {
        setLoadingAnnouncements(true);
        setError(null);
        const api = (await import('@/lib/apiClient')).default;
        const resp = await api.getNotifications();
        const list = (resp.data.notifications || []).map((n: any) => ({
          id: n.id,
          title: n.title || 'Announcement',
          content: n.message || '',
          authorId: n.senderId || 'system',
          authorName: n.sender?.displayName || 'System',
          authorRole: 'Admin',
          category: 'general',
          priority: 'medium',
          targetAudience: 'all',
          attachments: [],
          readBy: n.isRead ? [user.id] : [],
          createdAt: new Date(n.createdAt),
          updatedAt: new Date(n.readAt || n.createdAt),
          isPinned: false,
        })) as Announcement[];
        setAnnouncements(list);
      } catch (e: any) {
        setError(e.message || 'Failed to load announcements');
        setAnnouncements([]);
      } finally {
        setLoadingAnnouncements(false);
      }
    };
    load();
  }, [loading, user]);

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || announcement.category === activeTab;
    return matchesSearch && matchesTab;
  });

  const pinnedAnnouncements = filteredAnnouncements.filter(a => a.isPinned);
  const regularAnnouncements = filteredAnnouncements.filter(a => !a.isPinned);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) return `${diffInDays}d ago`;
    if (diffInHours > 0) return `${diffInHours}h ago`;
    return 'Just now';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'urgent': return 'danger';
      case 'important': return 'warning';
      case 'tournament': return 'primary';
      case 'team': return 'success';
      case 'event': return 'info';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'primary';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image size={20} />;
      case 'document': return <FileText size={20} />;
      case 'video': return <Play size={20} />;
      default: return <FileText size={20} />;
    }
  };

  const markAsRead = (announcementId: string) => {
    setAnnouncements(prev => 
      prev.map(a => a.id === announcementId ? { ...a, readBy: [...a.readBy, user?.id || ''] } : a)
    );
  };

  // Show loading state while Firebase is initializing or announcements are loading
  if (loading || loadingAnnouncements) {
    return (
      <div className="d-flex">
        <div className="bg-white border-end" style={{width: '280px', minHeight: '100vh'}}>
          <div className="p-3">
            <div className="d-flex align-items-center mb-4">
              <div className="bg-primary rounded p-2 me-3">
                <Megaphone size={24} className="text-white" />
              </div>
              <h5 className="mb-0">KP5 Academy</h5>
            </div>
          </div>
        </div>
        <div className="flex-grow-1 bg-light">
          <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show access denied if no user data
  if (!user) {
    return (
      <div className="d-flex">
        <div className="bg-white border-end" style={{width: '280px', minHeight: '100vh'}}>
          <div className="p-3">
            <div className="d-flex align-items-center mb-4">
              <div className="bg-primary rounded p-2 me-3">
                <Megaphone size={24} className="text-white" />
              </div>
              <h5 className="mb-0">KP5 Academy</h5>
            </div>
          </div>
        </div>
        <div className="flex-grow-1 bg-light">
          <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
            <div className="text-center">
              <h5 className="text-muted">Access Denied</h5>
              <p className="text-muted">Please log in to view announcements.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className="bg-white border-end" style={{width: '280px', minHeight: '100vh'}}>
        <div className="p-3">
          <div className="d-flex align-items-center mb-4">
            <div className="bg-primary rounded p-2 me-3">
              <Megaphone size={24} className="text-white" />
            </div>
            <h5 className="mb-0">KP5 Academy</h5>
          </div>
          
          {/* User Profile */}
          <div className="d-flex align-items-center mb-4 p-3 bg-light rounded">
            <div className="bg-primary rounded-circle p-2 me-3">
              <User size={20} className="text-white" />
            </div>
            <div>
              <h6 className="mb-0">{user?.displayName || 'User'}</h6>
              <small className="text-muted">{user?.role}</small>
            </div>
          </div>

          {/* Navigation */}
          <nav className="nav flex-column">
            <a className="nav-link" href="/dashboard">
              <Megaphone size={20} className="me-2" />
              Dashboard
            </a>
            <a className="nav-link active" href="/announcements">
              <Megaphone size={20} className="me-2" />
              Announcements
            </a>
            <a className="nav-link" href="/messages">
              <Megaphone size={20} className="me-2" />
              Messages
            </a>
            <a className="nav-link" href="/notifications">
              <Megaphone size={20} className="me-2" />
              Notifications
            </a>
            <a className="nav-link" href="/teams">
              <Megaphone size={20} className="me-2" />
              Teams
            </a>
            <a className="nav-link" href="/tournaments">
              <Megaphone size={20} className="me-2" />
              Tournaments
            </a>
            <a className="nav-link" href="/schedule">
              <Megaphone size={20} className="me-2" />
              Schedule
            </a>
            <a className="nav-link" href="/media">
              <Megaphone size={20} className="me-2" />
              Media
            </a>
            <a className="nav-link" href="/documents">
              <Megaphone size={20} className="me-2" />
              Documents
            </a>
            <a className="nav-link" href="/photos">
              <Megaphone size={20} className="me-2" />
              Photos
            </a>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 bg-light">
        {/* Top Header */}
        <div className="bg-white border-bottom p-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="mb-0">Announcements</h4>
              <p className="text-muted mb-0">Stay informed with club updates and important news</p>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                <Plus size={20} className="me-2" />
                New Announcement
              </button>
              <button className="btn btn-outline-secondary">
                <Settings size={20} className="me-2" />
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4">
          {/* Stats Cards */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                        <Megaphone size={24} className="text-primary" />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="card-title mb-1">Total Announcements</h6>
                      <h4 className="mb-0">{announcements.length}</h4>
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
                        <Pin size={24} className="text-warning" />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="card-title mb-1">Pinned</h6>
                      <h4 className="mb-0">{announcements.filter(a => a.isPinned).length}</h4>
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
                        <AlertTriangle size={24} className="text-danger" />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="card-title mb-1">Urgent</h6>
                      <h4 className="mb-0">{announcements.filter(a => a.priority === 'urgent').length}</h4>
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
                        <Trophy size={24} className="text-success" />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="card-title mb-1">Tournaments</h6>
                      <h4 className="mb-0">{announcements.filter(a => a.category === 'tournament').length}</h4>
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
                      className={`btn btn-outline-primary ${activeTab === 'urgent' ? 'active' : ''}`}
                      onClick={() => setActiveTab('urgent')}
                    >
                      Urgent
                    </button>
                    <button
                      type="button"
                      className={`btn btn-outline-primary ${activeTab === 'tournament' ? 'active' : ''}`}
                      onClick={() => setActiveTab('tournament')}
                    >
                      Tournaments
                    </button>
                    <button
                      type="button"
                      className={`btn btn-outline-primary ${activeTab === 'team' ? 'active' : ''}`}
                      onClick={() => setActiveTab('team')}
                    >
                      Team
                    </button>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <Search size={20} className="text-muted" />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Search announcements..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pinned Announcements */}
          {pinnedAnnouncements.length > 0 && (
            <div className="mb-4">
              <h5 className="mb-3">
                <Pin size={20} className="text-warning me-2" />
                Pinned Announcements
              </h5>
              <div className="row">
                {pinnedAnnouncements.map((announcement) => (
                  <div key={announcement.id} className="col-12 mb-3">
                    <div className="card border-warning border-2 shadow-sm">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className="d-flex align-items-center gap-2">
                            <h6 className="mb-0">{announcement.title}</h6>
                            <span className="badge bg-warning rounded-pill">
                              <Pin size={14} className="me-1" />
                              Pinned
                            </span>
                            <span className={`badge bg-${getCategoryColor(announcement.category)} rounded-pill`}>
                              {announcement.category}
                            </span>
                            <span className={`badge bg-${getPriorityColor(announcement.priority)} rounded-pill`}>
                              {announcement.priority}
                            </span>
                          </div>
                          <small className="text-muted">{formatTimeAgo(announcement.createdAt)}</small>
                        </div>
                        <p className="text-muted mb-3">{announcement.content.substring(0, 200)}...</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-3">
                            <small className="text-muted">
                              <User size={14} className="me-1" />
                              {announcement.authorName} ({announcement.authorRole})
                            </small>
                            {announcement.attachments.length > 0 && (
                              <small className="text-muted">
                                <Paperclip size={14} className="me-1" />
                                {announcement.attachments.length} attachment(s)
                              </small>
                            )}
                          </div>
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => setSelectedAnnouncement(announcement)}
                          >
                            Read More
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regular Announcements */}
          <div className="row">
            {regularAnnouncements.map((announcement) => (
              <div key={announcement.id} className="col-md-6 col-lg-4 mb-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <span className={`badge bg-${getCategoryColor(announcement.category)} rounded-pill`}>
                          {announcement.category}
                        </span>
                        <span className={`badge bg-${getPriorityColor(announcement.priority)} rounded-pill`}>
                          {announcement.priority}
                        </span>
                      </div>
                      <small className="text-muted">{formatTimeAgo(announcement.createdAt)}</small>
                    </div>
                    <h6 className="card-title mb-3">{announcement.title}</h6>
                    <p className="text-muted mb-3">{announcement.content.substring(0, 150)}...</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-2">
                        <small className="text-muted">
                          <User size={14} className="me-1" />
                          {announcement.authorName}
                        </small>
                        {announcement.attachments.length > 0 && (
                          <small className="text-muted">
                            <Paperclip size={14} className="me-1" />
                            {announcement.attachments.length}
                          </small>
                        )}
                      </div>
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setSelectedAnnouncement(announcement)}
                      >
                        Read More
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredAnnouncements.length === 0 && (
            <div className="text-center py-5">
              <Megaphone size={64} className="text-muted mb-3" />
              <h5 className="text-muted">No announcements found</h5>
              <p className="text-muted">There are no announcements matching your current filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedAnnouncement.title}</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setSelectedAnnouncement(null)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <span className={`badge bg-${getCategoryColor(selectedAnnouncement.category)} rounded-pill`}>
                    {selectedAnnouncement.category}
                  </span>
                  <span className={`badge bg-${getPriorityColor(selectedAnnouncement.priority)} rounded-pill`}>
                    {selectedAnnouncement.priority}
                  </span>
                  {selectedAnnouncement.isPinned && (
                    <span className="badge bg-warning rounded-pill">
                      <Pin size={14} className="me-1" />
                      Pinned
                    </span>
                  )}
                </div>
                <p className="mb-4">{selectedAnnouncement.content}</p>
                
                {selectedAnnouncement.attachments.length > 0 && (
                  <div className="mb-4">
                    <h6>Attachments</h6>
                    <div className="row">
                      {selectedAnnouncement.attachments.map((attachment) => (
                        <div key={attachment.id} className="col-md-6 mb-3">
                          <div className="card border">
                            <div className="card-body p-3">
                              <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                  <div className="text-primary">
                                    {getAttachmentIcon(attachment.type)}
                                  </div>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                  <h6 className="mb-1">{attachment.name}</h6>
                                  <small className="text-muted">{formatFileSize(attachment.size)}</small>
                                </div>
                                <div className="flex-shrink-0">
                                  <button className="btn btn-sm btn-outline-primary">
                                    <Download size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="border-top pt-3">
                  <div className="row">
                    <div className="col-md-6">
                      <small className="text-muted">
                        <User size={14} className="me-1" />
                        {selectedAnnouncement.authorName} ({selectedAnnouncement.authorRole})
                      </small>
                    </div>
                    <div className="col-md-6 text-end">
                      <small className="text-muted">
                        <Calendar size={14} className="me-1" />
                        {formatTimeAgo(selectedAnnouncement.createdAt)}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setSelectedAnnouncement(null)}
                >
                  Close
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => {
                    markAsRead(selectedAnnouncement.id);
                    setSelectedAnnouncement(null);
                  }}
                >
                  <Check size={16} className="me-1" />
                  Mark as Read
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 