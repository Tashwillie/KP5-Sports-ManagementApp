'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import {
  Video, Upload, Settings, Search, Grid, List, Eye, Download, Image, FileText, Music, File,
  X, User, Calendar, Play
} from 'lucide-react';

interface MediaItem {
  id: string;
  title: string;
  description: string;
  type: 'image' | 'video' | 'document' | 'audio';
  url: string;
  thumbnailUrl?: string;
  size: number;
  duration?: number;
  category: 'game-highlights' | 'team-photos' | 'training-videos' | 'documents' | 'presentations';
  tags: string[];
  uploadedBy: string;
  uploadedAt: Date;
  views: number;
  downloads: number;
  isPublic: boolean;
  teamId?: string;
  tournamentId?: string;
}

export default function MediaPage() {
  return (
    <ProtectedRoute>
      <MediaContent />
    </ProtectedRoute>
  );
}

function MediaContent() {
  const { user, loading  } = useAuth();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!user) { setLoadingMedia(false); return; }
      try {
        setLoadingMedia(true);
        setError(null);
        const api = (await import('@/hooks/useMedia')).default;
        // call hook-like function indirectly won't work; instead fetch via service directly here
      } catch (e) {}
    };
    load();
    return () => { isMounted = false; };
  }, [user]);

  useEffect(() => {
    const load = async () => {
      try {
        if (!loading && user) {
          const svc = (await import('@/lib/services/mediaService')).default;
          const data = await svc.getMedia();
          setMediaItems(data as any);
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load media');
      } finally {
        setLoadingMedia(false);
      }
    };
    load();
  }, [loading, user]);

  const filteredItems = mediaItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) return `${diffInDays}d ago`;
    if (diffInHours > 0) return `${diffInHours}h ago`;
    return 'Just now';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'game-highlights': return 'primary';
      case 'team-photos': return 'success';
      case 'training-videos': return 'warning';
      case 'documents': return 'info';
      case 'presentations': return 'secondary';
      default: return 'light';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image size={20} />;
      case 'video': return <Play size={20} />;
      case 'document': return <FileText size={20} />;
      case 'audio': return <Music size={20} />;
      default: return <File size={20} />;
    }
  };

  const incrementViews = (itemId: string) => {
    setMediaItems(prev => 
      prev.map(item => item.id === itemId ? { ...item, views: item.views + 1 } : item)
    );
  };

  const incrementDownloads = (itemId: string) => {
    setMediaItems(prev => 
      prev.map(item => item.id === itemId ? { ...item, downloads: item.downloads + 1 } : item)
    );
  };

  // Show loading state while Firebase is initializing or media is loading
  if (loading || loadingMedia) {
    return (
      <div className="d-flex">
        <div className="bg-white border-end" style={{width: '280px', minHeight: '100vh'}}>
          <div className="p-3">
            <div className="d-flex align-items-center mb-4">
              <div className="bg-primary rounded p-2 me-3">
                <Video size={24} className="text-white" />
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
                <Video size={24} className="text-white" />
              </div>
              <h5 className="mb-0">KP5 Academy</h5>
            </div>
          </div>
        </div>
        <div className="flex-grow-1 bg-light">
          <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
            <div className="text-center">
              <h5 className="text-muted">Access Denied</h5>
              <p className="text-muted">Please log in to view media library.</p>
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
              <Video size={24} className="text-white" />
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
              <Video size={20} className="me-2" />
              Dashboard
            </a>
            <a className="nav-link" href="/announcements">
              <Video size={20} className="me-2" />
              Announcements
            </a>
            <a className="nav-link" href="/messages">
              <Video size={20} className="me-2" />
              Messages
            </a>
            <a className="nav-link" href="/notifications">
              <Video size={20} className="me-2" />
              Notifications
            </a>
            <a className="nav-link" href="/teams">
              <Video size={20} className="me-2" />
              Teams
            </a>
            <a className="nav-link" href="/tournaments">
              <Video size={20} className="me-2" />
              Tournaments
            </a>
            <a className="nav-link" href="/schedule">
              <Video size={20} className="me-2" />
              Schedule
            </a>
            <a className="nav-link active" href="/media">
              <Video size={20} className="me-2" />
              Media
            </a>
            <a className="nav-link" href="/documents">
              <Video size={20} className="me-2" />
              Documents
            </a>
            <a className="nav-link" href="/photos">
              <Video size={20} className="me-2" />
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
              <h4 className="mb-0">Media Library</h4>
              <p className="text-muted mb-0">Manage and organize your media files</p>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-primary">
                <Upload size={20} className="me-2" />
                Upload Media
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
                        <Video size={24} className="text-primary" />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="card-title mb-1">Total Videos</h6>
                      <h4 className="mb-0">{mediaItems.filter(item => item.type === 'video').length}</h4>
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
                        <Image size={24} className="text-success" />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="card-title mb-1">Total Images</h6>
                      <h4 className="mb-0">{mediaItems.filter(item => item.type === 'image').length}</h4>
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
                        <Play size={24} className="text-warning" />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="card-title mb-1">Total Views</h6>
                      <h4 className="mb-0">{mediaItems.reduce((sum, item) => sum + item.views, 0)}</h4>
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
                      <div className="bg-info bg-opacity-10 rounded-circle p-3">
                        <FileText size={24} className="text-info" />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="card-title mb-1">Total Downloads</h6>
                      <h4 className="mb-0">{mediaItems.reduce((sum, item) => sum + item.downloads, 0)}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-4">
                  <div className="btn-group" role="group">
                    <button
                      type="button"
                      className={`btn btn-outline-primary ${activeCategory === 'all' ? 'active' : ''}`}
                      onClick={() => setActiveCategory('all')}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      className={`btn btn-outline-primary ${activeCategory === 'game-highlights' ? 'active' : ''}`}
                      onClick={() => setActiveCategory('game-highlights')}
                    >
                      Highlights
                    </button>
                    <button
                      type="button"
                      className={`btn btn-outline-primary ${activeCategory === 'team-photos' ? 'active' : ''}`}
                      onClick={() => setActiveCategory('team-photos')}
                    >
                      Photos
                    </button>
                    <button
                      type="button"
                      className={`btn btn-outline-primary ${activeCategory === 'training-videos' ? 'active' : ''}`}
                      onClick={() => setActiveCategory('training-videos')}
                    >
                      Training
                    </button>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <Search size={20} className="text-muted" />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Search media..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-4 text-end">
                  <div className="btn-group" role="group">
                    <button
                      type="button"
                      className={`btn btn-outline-secondary ${viewMode === 'grid' ? 'active' : ''}`}
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid size={20} />
                    </button>
                    <button
                      type="button"
                      className={`btn btn-outline-secondary ${viewMode === 'list' ? 'active' : ''}`}
                      onClick={() => setViewMode('list')}
                    >
                      <List size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Media Grid */}
          {viewMode === 'grid' ? (
            <div className="row">
              {filteredItems.map((item) => (
                <div key={item.id} className="col-md-6 col-lg-4 col-xl-3 mb-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="position-relative">
                      <div className="card-img-top bg-light d-flex align-items-center justify-content-center" style={{ height: '200px' }}>
                        {item.thumbnailUrl ? (
                          <img src={item.thumbnailUrl} alt={item.title} className="img-fluid" style={{ maxHeight: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div className="text-center">
                            {getTypeIcon(item.type)}
                            <div className="mt-2">
                              <small className="text-muted">{item.type.toUpperCase()}</small>
                            </div>
                          </div>
                        )}
                        {item.type === 'video' && item.duration && (
                          <div className="position-absolute bottom-0 end-0 m-2">
                            <span className="badge bg-dark bg-opacity-75">{formatDuration(item.duration)}</span>
                          </div>
                        )}
                      </div>
                      <div className="position-absolute top-0 start-0 m-2">
                        <span className={`badge bg-${getCategoryColor(item.category)}`}>
                          {item.category.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="card-body">
                      <h6 className="card-title mb-2">{item.title}</h6>
                      <p className="card-text text-muted small mb-3">{item.description}</p>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <small className="text-muted">{formatFileSize(item.size)}</small>
                        <small className="text-muted">{formatTimeAgo(item.uploadedAt)}</small>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => {
                              incrementViews(item.id);
                              setSelectedItem(item);
                            }}
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-success"
                            onClick={() => incrementDownloads(item.id)}
                          >
                            <Download size={16} />
                          </button>
                        </div>
                        <div className="d-flex gap-2 text-muted">
                          <small>{item.views} views</small>
                          <small>{item.downloads} downloads</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Media</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Size</th>
                        <th>Views</th>
                        <th>Downloads</th>
                        <th>Uploaded</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="bg-light rounded p-2 me-3">
                                {getTypeIcon(item.type)}
                              </div>
                              <div>
                                <div className="fw-medium">{item.title}</div>
                                <small className="text-muted">{item.type}</small>
                              </div>
                            </div>
                          </td>
                          <td>{item.title}</td>
                          <td>
                            <span className={`badge bg-${getCategoryColor(item.category)}`}>
                              {item.category.replace('-', ' ')}
                            </span>
                          </td>
                          <td>{formatFileSize(item.size)}</td>
                          <td>{item.views}</td>
                          <td>{item.downloads}</td>
                          <td>{formatTimeAgo(item.uploadedAt)}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => {
                                  incrementViews(item.id);
                                  setSelectedItem(item);
                                }}
                              >
                                <Eye size={16} />
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-success"
                                onClick={() => incrementDownloads(item.id)}
                              >
                                <Download size={16} />
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
          )}

          {/* Empty State */}
          {filteredItems.length === 0 && (
            <div className="text-center py-5">
              <Video size={64} className="text-muted mb-3" />
              <h5 className="text-muted">No media found</h5>
              <p className="text-muted">There are no media items matching your current filters.</p>
              <button className="btn btn-primary">
                <Upload size={20} className="me-2" />
                Upload Your First Media
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Media Detail Modal */}
      {selectedItem && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedItem.title}</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setSelectedItem(null)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <div className="text-center mb-4">
                  {selectedItem.type === 'video' ? (
                    <video 
                      controls 
                      className="img-fluid rounded"
                      style={{ maxHeight: '400px' }}
                    >
                      <source src={selectedItem.url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : selectedItem.type === 'image' ? (
                    <img 
                      src={selectedItem.url} 
                      alt={selectedItem.title}
                      className="img-fluid rounded"
                      style={{ maxHeight: '400px' }}
                    />
                  ) : (
                    <div className="bg-light rounded p-5">
                      <FileText size={64} className="text-muted mb-3" />
                      <h6 className="text-muted">{selectedItem.title}</h6>
                      <p className="text-muted">{selectedItem.description}</p>
                    </div>
                  )}
                </div>
                
                <div className="row">
                  <div className="col-md-6">
                    <h6>Details</h6>
                    <ul className="list-unstyled">
                      <li><strong>Type:</strong> {selectedItem.type}</li>
                      <li><strong>Size:</strong> {formatFileSize(selectedItem.size)}</li>
                      {selectedItem.duration && (
                        <li><strong>Duration:</strong> {formatDuration(selectedItem.duration)}</li>
                      )}
                      <li><strong>Category:</strong> {selectedItem.category}</li>
                      <li><strong>Uploaded by:</strong> {selectedItem.uploadedBy}</li>
                      <li><strong>Uploaded:</strong> {formatTimeAgo(selectedItem.uploadedAt)}</li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <h6>Statistics</h6>
                    <ul className="list-unstyled">
                      <li><strong>Views:</strong> {selectedItem.views}</li>
                      <li><strong>Downloads:</strong> {selectedItem.downloads}</li>
                      <li><strong>Public:</strong> {selectedItem.isPublic ? 'Yes' : 'No'}</li>
                    </ul>
                    
                    <h6 className="mt-3">Tags</h6>
                    <div className="d-flex flex-wrap gap-1">
                      {selectedItem.tags.map((tag, index) => (
                        <span key={index} className="badge bg-light text-dark">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h6>Description</h6>
                  <p>{selectedItem.description}</p>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setSelectedItem(null)}
                >
                  Close
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => {
                    incrementDownloads(selectedItem.id);
                    setSelectedItem(null);
                  }}
                >
                  <Download size={16} className="me-1" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 