'use client';

import { useState, useEffect } from 'react';
import {
  Image, Upload, Settings, Search, Grid, Grid3X3, Eye, Download, Camera,
  Users, Trophy, MapPin, X, User, Calendar, SortAsc, MoreHorizontal
} from 'lucide-react';
import { useEnhancedAuthContext } from '@/contexts/EnhancedAuthContext';
import useMedia from '@/hooks/useMedia';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/Sidebar';

interface Photo {
  id: string;
  name: string;
  description?: string;
  url: string;
  thumbnail?: string;
  type: 'image' | 'video' | 'document' | 'audio';
  category?: string;
  metadata?: Record<string, any>;
  uploadedBy?: string;
  uploadedAt: Date;
}

export default function PhotosPage() {
  const { user, loading } = useEnhancedAuthContext();
  const { items: photos, loading: loadingPhotos, error } = useMedia();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');

  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = photo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (photo.description && photo.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategory === 'all' || photo.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedPhotos = [...filteredPhotos].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'date':
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      default:
        return 0;
    }
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
      case 'team-photos': return 'primary';
      case 'game-highlights': return 'success';
      case 'tournament': return 'warning';
      case 'training': return 'info';
      case 'events': return 'danger';
      case 'portraits': return 'secondary';
      default: return 'light';
    }
  };

  const incrementViews = (photoId: string) => {
    // This function is not directly used in the current component's logic
    // as the photo object itself doesn't have views/downloads properties.
    // If these were managed in a global state or context, this would be needed.
    // For now, it's kept as a placeholder.
  };

  const incrementDownloads = (photoId: string) => {
    // This function is not directly used in the current component's logic
    // as the photo object itself doesn't have views/downloads properties.
    // If these were managed in a global state or context, this would be needed.
    // For now, it's kept as a placeholder.
  };

  // Show loading state while Firebase is initializing or photos are loading
  if (loading || loadingPhotos) {
    const userData = user ? {
      id: user.id || 'user123',
      name: user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Admin User',
      email: user.email || 'admin@example.com',
      role: user.role || 'Super Admin'
    } : undefined;
    return (
      <div className="d-flex" style={{ minHeight: '100vh', overflow: 'hidden' }}>
        <Sidebar activeTab="photos" userData={userData} />
        <div className="flex-grow-1 bg-light d-flex justify-content-center align-items-center" style={{ minWidth: 0, overflow: 'auto', height: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show access denied if no user data
  if (!user) {
    return (
      <div className="d-flex" style={{ minHeight: '100vh', overflow: 'hidden' }}>
        <Sidebar activeTab="photos" />
        <div className="flex-grow-1 bg-light d-flex justify-content-center align-items-center" style={{ minWidth: 0, overflow: 'auto', height: '400px' }}>
          <div className="text-center">
            <h5 className="text-muted">Access Denied</h5>
            <p className="text-muted">Please log in to view photos.</p>
          </div>
        </div>
      </div>
    );
  }

  const userData = {
    id: user.id || 'user123',
    name: user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Admin User',
    email: user.email || 'admin@example.com',
    role: user.role || 'Super Admin'
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh', overflow: 'hidden' }}>
      <Sidebar activeTab="photos" userData={userData} />
      <div className="flex-grow-1 bg-light" style={{ minWidth: 0, overflow: 'auto' }}>
        {/* Top Header */}
        <div className="bg-white border-bottom p-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="mb-0">Photo Gallery</h4>
              <p className="text-muted mb-0">Browse and manage your photo collection</p>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-primary">
                <Upload size={20} className="me-2" />
                Upload Photos
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
                        <Image size={24} className="text-primary" />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="card-title mb-1">Total Photos</h6>
                      <h4 className="mb-0">{photos.length}</h4>
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
                        <Camera size={24} className="text-success" />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="card-title mb-1">Photographers</h6>
                      <h4 className="mb-0">{new Set(photos.map(p => p.photographer)).size}</h4>
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
                        <Users size={24} className="text-warning" />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="card-title mb-1">Total Views</h6>
                      <h4 className="mb-0">{photos.reduce((sum, photo) => sum + photo.views, 0)}</h4>
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
                        <Trophy size={24} className="text-info" />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="card-title mb-1">Total Downloads</h6>
                      <h4 className="mb-0">{photos.reduce((sum, photo) => sum + photo.downloads, 0)}</h4>
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
                      className={`btn btn-outline-primary ${activeCategory === 'team-photos' ? 'active' : ''}`}
                      onClick={() => setActiveCategory('team-photos')}
                    >
                      Team
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
                      className={`btn btn-outline-primary ${activeCategory === 'tournament' ? 'active' : ''}`}
                      onClick={() => setActiveCategory('tournament')}
                    >
                      Tournament
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
                      placeholder="Search photos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-2">
                  <select 
                    className="form-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                  >
                    <option value="date">Sort by Date</option>
                    <option value="name">Sort by Name</option>
                    <option value="size">Sort by Size</option>
                    <option value="views">Sort by Views</option>
                  </select>
                </div>
                <div className="col-md-2 text-end">
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
                      className={`btn btn-outline-secondary ${viewMode === 'masonry' ? 'active' : ''}`}
                      onClick={() => setViewMode('masonry')}
                    >
                      <Grid3X3 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Photos Grid */}
          <div className="row">
            {sortedPhotos.map((photo) => (
              <div key={photo.id} className="col-md-6 col-lg-4 col-xl-3 mb-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="position-relative">
                    <img
                      src={photo.thumbnailUrl}
                      className="card-img-top"
                      alt={photo.title}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                    <div className="position-absolute top-0 start-0 m-2">
                      <span className={`badge bg-${getCategoryColor(photo.category)}`}>
                        {photo.category.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="position-absolute top-0 end-0 m-2">
                      <div className="d-flex gap-1">
                        <button 
                          className="btn btn-sm btn-light btn-sm"
                          onClick={() => {
                            incrementViews(photo.id);
                            setSelectedPhoto(photo);
                          }}
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          className="btn btn-sm btn-light btn-sm"
                          onClick={() => incrementDownloads(photo.id)}
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="card-body">
                    <h6 className="card-title mb-2">{photo.title}</h6>
                    <p className="card-text text-muted small mb-3">{photo.description}</p>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <small className="text-muted">{formatFileSize(photo.size)}</small>
                      <small className="text-muted">{formatTimeAgo(photo.takenAt)}</small>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-2">
                        <small className="text-muted">
                          <Camera size={14} className="me-1" />
                          {photo.photographer}
                        </small>
                        {photo.location && (
                          <small className="text-muted">
                            <MapPin size={14} className="me-1" />
                            {photo.location}
                          </small>
                        )}
                      </div>
                      <div className="d-flex gap-2 text-muted">
                        <small>{photo.views} views</small>
                        <small>{photo.downloads} downloads</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {sortedPhotos.length === 0 && (
            <div className="text-center py-5">
              <Image size={64} className="text-muted mb-3" />
              <h5 className="text-muted">No photos found</h5>
              <p className="text-muted">There are no photos matching your current filters.</p>
              <button className="btn btn-primary">
                <Upload size={20} className="me-2" />
                Upload Your First Photo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedPhoto.title}</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setSelectedPhoto(null)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <div className="text-center mb-4">
                  <img 
                    src={selectedPhoto.url} 
                    alt={selectedPhoto.title}
                    className="img-fluid rounded"
                    style={{ maxHeight: '500px' }}
                  />
                </div>
                
                <div className="row">
                  <div className="col-md-6">
                    <h6>Photo Details</h6>
                    <ul className="list-unstyled">
                      <li><strong>Title:</strong> {selectedPhoto.title}</li>
                      <li><strong>Category:</strong> {selectedPhoto.category.replace('-', ' ')}</li>
                      <li><strong>Size:</strong> {formatFileSize(selectedPhoto.size)}</li>
                      <li><strong>Dimensions:</strong> {selectedPhoto.width} x {selectedPhoto.height}</li>
                      <li><strong>Photographer:</strong> {selectedPhoto.photographer}</li>
                      {selectedPhoto.location && (
                        <li><strong>Location:</strong> {selectedPhoto.location}</li>
                      )}
                      <li><strong>Taken:</strong> {formatTimeAgo(selectedPhoto.takenAt)}</li>
                      <li><strong>Uploaded:</strong> {formatTimeAgo(selectedPhoto.uploadedAt)}</li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <h6>Statistics</h6>
                    <ul className="list-unstyled">
                      <li><strong>Views:</strong> {selectedPhoto.views}</li>
                      <li><strong>Downloads:</strong> {selectedPhoto.downloads}</li>
                      <li><strong>Public:</strong> {selectedPhoto.isPublic ? 'Yes' : 'No'}</li>
                    </ul>
                    
                    <h6 className="mt-3">Tags</h6>
                    <div className="d-flex flex-wrap gap-1">
                      {selectedPhoto.tags.map((tag, index) => (
                        <span key={index} className="badge bg-light text-dark">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h6>Description</h6>
                  <p>{selectedPhoto.description}</p>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setSelectedPhoto(null)}
                >
                  Close
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => {
                    incrementDownloads(selectedPhoto.id);
                    setSelectedPhoto(null);
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