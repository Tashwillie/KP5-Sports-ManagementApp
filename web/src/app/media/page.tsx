'use client';

import { useFirebase } from '@/contexts/FirebaseContext';
import { useState, useEffect } from 'react';

interface MediaItem {
  id: string;
  title: string;
  description?: string;
  type: 'image' | 'video' | 'document' | 'audio';
  url: string;
  thumbnailUrl?: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  tags: string[];
  category: 'game_highlights' | 'team_photos' | 'training_videos' | 'documents' | 'announcements' | 'tournaments';
  isPublic: boolean;
  views: number;
  downloads: number;
}

export default function MediaPage() {
  const { userData, loading } = useFirebase();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock data for media items
  useEffect(() => {
    if (!loading) {
      const mockMediaItems: MediaItem[] = [
        {
          id: '1',
          title: 'Championship Game Highlights',
          description: 'Amazing goals and plays from the championship game',
          type: 'video',
          url: '/media/videos/championship-highlights.mp4',
          thumbnailUrl: '/media/thumbnails/championship-thumb.jpg',
          size: 25600000,
          uploadedBy: 'Coach Johnson',
          uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          tags: ['championship', 'highlights', 'goals'],
          category: 'game_highlights',
          isPublic: true,
          views: 245,
          downloads: 12,
        },
        {
          id: '2',
          title: 'Team Photo - Spring Season',
          description: 'Official team photo for the 2024 Spring Season',
          type: 'image',
          url: '/media/images/team-photo-spring.jpg',
          thumbnailUrl: '/media/thumbnails/team-photo-thumb.jpg',
          size: 2048000,
          uploadedBy: 'Club Photographer',
          uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          tags: ['team', 'photo', 'spring'],
          category: 'team_photos',
          isPublic: true,
          views: 189,
          downloads: 45,
        },
        {
          id: '3',
          title: 'Tournament Rules and Regulations',
          description: 'Official rules for the Spring Tournament',
          type: 'document',
          url: '/media/documents/tournament-rules.pdf',
          thumbnailUrl: '/media/thumbnails/pdf-thumb.jpg',
          size: 512000,
          uploadedBy: 'Tournament Director',
          uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          tags: ['tournament', 'rules', 'regulations'],
          category: 'tournaments',
          isPublic: true,
          views: 156,
          downloads: 89,
        },
      ];
      setMediaItems(mockMediaItems);
      setLoadingMedia(false);
    }
  }, [loading]);

  const filteredMediaItems = mediaItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || item.category === activeTab;
    return matchesSearch && matchesTab;
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
      case 'game_highlights': return 'primary';
      case 'team_photos': return 'success';
      case 'training_videos': return 'info';
      case 'documents': return 'warning';
      case 'tournaments': return 'danger';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return 'bi-image';
      case 'video': return 'bi-play-circle';
      case 'document': return 'bi-file-earmark-text';
      case 'audio': return 'bi-music-note';
      default: return 'bi-file';
    }
  };

  if (loading || loadingMedia) {
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
          <h1 className="h3 mb-0">Media Library</h1>
          <p className="text-muted mb-0">Browse and manage your team's media content</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary">
            <i className="bi bi-cloud-upload me-2"></i>
            Upload Media
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
                    <i className="bi bi-collection text-primary fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title mb-1">Total Items</h6>
                  <h4 className="mb-0">{mediaItems.length}</h4>
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
                    <i className="bi bi-image text-success fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title mb-1">Images</h6>
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
                  <div className="bg-info bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-play-circle text-info fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title mb-1">Videos</h6>
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
                  <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-file-earmark text-warning fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title mb-1">Documents</h6>
                  <h4 className="mb-0">{mediaItems.filter(item => item.type === 'document').length}</h4>
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
                  className={`btn btn-outline-primary ${activeTab === 'game_highlights' ? 'active' : ''}`}
                  onClick={() => setActiveTab('game_highlights')}
                >
                  Highlights
                </button>
                <button
                  type="button"
                  className={`btn btn-outline-primary ${activeTab === 'team_photos' ? 'active' : ''}`}
                  onClick={() => setActiveTab('team_photos')}
                >
                  Photos
                </button>
                <button
                  type="button"
                  className={`btn btn-outline-primary ${activeTab === 'training_videos' ? 'active' : ''}`}
                  onClick={() => setActiveTab('training_videos')}
                >
                  Training
                </button>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex gap-2">
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search media..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className={`btn btn-outline-secondary ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <i className="bi bi-grid"></i>
                  </button>
                  <button
                    type="button"
                    className={`btn btn-outline-secondary ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                  >
                    <i className="bi bi-list"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Media Grid */}
      <div className="row">
        {filteredMediaItems.map((item) => (
          <div key={item.id} className="col-md-6 col-lg-4 col-xl-3 mb-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="position-relative">
                <img
                  src={item.thumbnailUrl || '/media/thumbnails/default-thumb.jpg'}
                  className="card-img-top"
                  alt={item.title}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <div className="position-absolute top-0 end-0 m-2">
                  <span className="badge bg-primary rounded-pill">
                    <i className={`bi ${getTypeIcon(item.type)} me-1`}></i>
                    {item.type}
                  </span>
                </div>
              </div>
              <div className="card-body">
                <h6 className="card-title mb-2">{item.title}</h6>
                {item.description && (
                  <p className="text-muted small mb-3">{item.description.substring(0, 100)}...</p>
                )}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className={`badge bg-${getCategoryColor(item.category)} rounded-pill`}>
                    {item.category.replace('_', ' ')}
                  </span>
                  <small className="text-muted">{formatFileSize(item.size)}</small>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setSelectedItem(item)}
                    >
                      <i className="bi bi-eye me-1"></i>
                      View
                    </button>
                    <button className="btn btn-sm btn-outline-success">
                      <i className="bi bi-download me-1"></i>
                      Download
                    </button>
                  </div>
                  <small className="text-muted">{formatTimeAgo(item.uploadedAt)}</small>
                </div>
              </div>
              <div className="card-footer bg-transparent">
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    <i className="bi bi-eye me-1"></i>
                    {item.views} views
                  </small>
                  <small className="text-muted">
                    <i className="bi bi-download me-1"></i>
                    {item.downloads} downloads
                  </small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredMediaItems.length === 0 && (
        <div className="text-center py-5">
          <i className="bi bi-collection fs-1 text-muted mb-3"></i>
          <h5 className="text-muted">No media found</h5>
          <p className="text-muted">There are no media items matching your current filters.</p>
          <button className="btn btn-primary">
            <i className="bi bi-cloud-upload me-2"></i>
            Upload Your First Media
          </button>
        </div>
      )}

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
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-8">
                    {selectedItem.type === 'image' && (
                      <img 
                        src={selectedItem.url} 
                        alt={selectedItem.title}
                        className="img-fluid rounded"
                      />
                    )}
                    {selectedItem.type === 'video' && (
                      <video 
                        src={selectedItem.url} 
                        controls
                        className="w-100 rounded"
                        poster={selectedItem.thumbnailUrl}
                      >
                        Your browser does not support the video tag.
                      </video>
                    )}
                    {selectedItem.type === 'document' && (
                      <div className="text-center py-5">
                        <i className="bi bi-file-earmark-text fs-1 text-muted mb-3"></i>
                        <h5>Document Preview</h5>
                        <p className="text-muted">Click download to view this document</p>
                        <button className="btn btn-primary">
                          <i className="bi bi-download me-2"></i>
                          Download Document
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="col-md-4">
                    <div className="card">
                      <div className="card-body">
                        <h6>Details</h6>
                        <dl className="row mb-0">
                          <dt className="col-sm-4">Type:</dt>
                          <dd className="col-sm-8">
                            <span className="badge bg-primary rounded-pill">
                              {selectedItem.type}
                            </span>
                          </dd>
                          
                          <dt className="col-sm-4">Category:</dt>
                          <dd className="col-sm-8">
                            <span className={`badge bg-${getCategoryColor(selectedItem.category)} rounded-pill`}>
                              {selectedItem.category.replace('_', ' ')}
                            </span>
                          </dd>
                          
                          <dt className="col-sm-4">Size:</dt>
                          <dd className="col-sm-8">{formatFileSize(selectedItem.size)}</dd>
                          
                          <dt className="col-sm-4">Views:</dt>
                          <dd className="col-sm-8">{selectedItem.views}</dd>
                          
                          <dt className="col-sm-4">Downloads:</dt>
                          <dd className="col-sm-8">{selectedItem.downloads}</dd>
                          
                          <dt className="col-sm-4">Uploaded:</dt>
                          <dd className="col-sm-8">{formatTimeAgo(selectedItem.uploadedAt)}</dd>
                          
                          <dt className="col-sm-4">By:</dt>
                          <dd className="col-sm-8">{selectedItem.uploadedBy}</dd>
                        </dl>
                        
                        {selectedItem.description && (
                          <>
                            <hr />
                            <h6>Description</h6>
                            <p className="text-muted">{selectedItem.description}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
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
                <button className="btn btn-primary">
                  <i className="bi bi-download me-2"></i>
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