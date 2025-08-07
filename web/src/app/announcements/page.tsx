'use client';

import { useFirebase } from '@/contexts/FirebaseContext';
import { useState, useEffect } from 'react';

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
  const { userData, loading } = useFirebase();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock data for announcements
  useEffect(() => {
    if (!loading) {
      const mockAnnouncements: Announcement[] = [
        {
          id: '1',
          title: 'Spring Tournament Registration Now Open',
          content: 'We are excited to announce that registration for the Spring Tournament is now open! This year\'s tournament will feature teams from across the region competing in various age groups. Early registration closes on March 15th, so don\'t miss out on the early bird discount.',
          authorId: 'admin-1',
          authorName: 'Club Administrator',
          authorRole: 'Club Admin',
          category: 'tournament',
          priority: 'high',
          targetAudience: 'all',
          attachments: [
            {
              id: 'att-1',
              name: 'tournament-schedule.pdf',
              url: '/documents/tournament-schedule.pdf',
              type: 'document',
              size: 512000,
            }
          ],
          readBy: ['player-1', 'player-2'],
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          isPinned: true,
        },
        {
          id: '2',
          title: 'Field Maintenance Notice',
          content: 'Due to scheduled maintenance, the main field will be closed this weekend (March 8-9). All practices and games have been moved to the secondary field. Please check the updated schedule for your team\'s new practice times.',
          authorId: 'admin-1',
          authorName: 'Facility Manager',
          authorRole: 'Admin',
          category: 'important',
          priority: 'high',
          targetAudience: 'all',
          attachments: [],
          readBy: ['player-1'],
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
          isPinned: false,
        },
        {
          id: '3',
          title: 'New Coach Joining U16 Team',
          content: 'We are pleased to welcome Coach Sarah Martinez to our coaching staff. Coach Martinez brings 10 years of experience coaching youth soccer and will be taking over the U16 Boys team starting next week. Please join us in welcoming her to the KP5 Academy family!',
          authorId: 'admin-1',
          authorName: 'Director of Coaching',
          authorRole: 'Coach',
          category: 'team',
          priority: 'medium',
          targetAudience: 'players',
          attachments: [
            {
              id: 'att-2',
              name: 'coach-martinez-profile.jpg',
              url: '/images/coach-martinez-profile.jpg',
              type: 'image',
              size: 245760,
            }
          ],
          readBy: ['player-1', 'player-2'],
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          isPinned: false,
        },
        {
          id: '4',
          title: 'Parent Meeting - Season Planning',
          content: 'We will be holding a parent meeting next Tuesday at 7 PM in the clubhouse to discuss the upcoming season plans, tournament schedules, and answer any questions you may have. Light refreshments will be provided.',
          authorId: 'admin-1',
          authorName: 'Club Administrator',
          authorRole: 'Club Admin',
          category: 'event',
          priority: 'medium',
          targetAudience: 'parents',
          attachments: [],
          readBy: ['player-1'],
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
          isPinned: false,
        },
        {
          id: '5',
          title: 'Equipment Return Deadline',
          content: 'All borrowed equipment (jerseys, balls, cones) must be returned by Friday, March 15th. Please clean and organize all items before returning them to the equipment room. Any unreturned equipment will result in a charge to your account.',
          authorId: 'admin-1',
          authorName: 'Equipment Manager',
          authorRole: 'Admin',
          category: 'urgent',
          priority: 'urgent',
          targetAudience: 'players',
          attachments: [
            {
              id: 'att-3',
              name: 'equipment-checklist.pdf',
              url: '/documents/equipment-checklist.pdf',
              type: 'document',
              size: 128000,
            }
          ],
          readBy: [],
          createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
          updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          isPinned: true,
        },
      ];
      setAnnouncements(mockAnnouncements);
      setLoadingAnnouncements(false);
    }
  }, [loading]);

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

  const markAsRead = (announcementId: string) => {
    setAnnouncements(prev => 
      prev.map(a => a.id === announcementId ? { ...a, readBy: [...a.readBy, userData?.id || ''] } : a)
    );
  };

  if (loading || loadingAnnouncements) {
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
          <h1 className="h3 mb-0">Announcements</h1>
          <p className="text-muted mb-0">Stay informed with club updates and important news</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <i className="bi bi-plus-circle me-2"></i>
            New Announcement
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
                    <i className="bi bi-megaphone text-primary fs-4"></i>
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
                    <i className="bi bi-pin-angle text-warning fs-4"></i>
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
                    <i className="bi bi-exclamation-triangle text-danger fs-4"></i>
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
                    <i className="bi bi-trophy text-success fs-4"></i>
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
                  <i className="bi bi-search text-muted"></i>
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
            <i className="bi bi-pin-angle text-warning me-2"></i>
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
                          <i className="bi bi-pin-angle me-1"></i>
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
                          <i className="bi bi-person me-1"></i>
                          {announcement.authorName} ({announcement.authorRole})
                        </small>
                        {announcement.attachments.length > 0 && (
                          <small className="text-muted">
                            <i className="bi bi-paperclip me-1"></i>
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
                      <i className="bi bi-person me-1"></i>
                      {announcement.authorName}
                    </small>
                    {announcement.attachments.length > 0 && (
                      <small className="text-muted">
                        <i className="bi bi-paperclip me-1"></i>
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
          <i className="bi bi-megaphone fs-1 text-muted mb-3"></i>
          <h5 className="text-muted">No announcements found</h5>
          <p className="text-muted">There are no announcements matching your current filters.</p>
        </div>
      )}

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
                ></button>
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
                      <i className="bi bi-pin-angle me-1"></i>
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
                                  <i className={`bi bi-${attachment.type === 'image' ? 'image' : attachment.type === 'document' ? 'file-earmark-text' : 'play-circle'} fs-4 text-primary`}></i>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                  <h6 className="mb-1">{attachment.name}</h6>
                                  <small className="text-muted">{formatFileSize(attachment.size)}</small>
                                </div>
                                <div className="flex-shrink-0">
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="bi bi-download"></i>
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
                        <i className="bi bi-person me-1"></i>
                        {selectedAnnouncement.authorName} ({selectedAnnouncement.authorRole})
                      </small>
                    </div>
                    <div className="col-md-6 text-end">
                      <small className="text-muted">
                        <i className="bi bi-calendar me-1"></i>
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