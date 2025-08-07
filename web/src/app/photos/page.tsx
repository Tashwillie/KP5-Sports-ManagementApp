'use client';

import { useFirebase } from '@/contexts/FirebaseContext';
import { useState, useEffect } from 'react';

interface Photo {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  tags: string[];
  category: 'team_photos' | 'game_photos' | 'training_photos' | 'events' | 'tournaments' | 'awards';
  isPublic: boolean;
  views: number;
  downloads: number;
  dimensions: { width: number; height: number };
  location?: string;
  dateTaken?: Date;
}

export default function PhotosPage() {
  const { userData, loading } = useFirebase();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size' | 'views'>('date');

  // Mock data for photos
  useEffect(() => {
    if (!loading) {
      const mockPhotos: Photo[] = [
        {
          id: '1',
          title: 'Championship Team Photo',
          description: 'Official team photo after winning the championship',
          url: '/photos/championship-team.jpg',
          thumbnailUrl: '/photos/thumbnails/championship-team-thumb.jpg',
          size: 2048000,
          uploadedBy: 'Club Photographer',
          uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          tags: ['championship', 'team', 'victory', 'celebration'],
          category: 'team_photos',
          isPublic: true,
          views: 456,
          downloads: 89,
          dimensions: { width: 4000, height: 3000 },
          location: 'Main Stadium',
          dateTaken: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          id: '2',
          title: 'Goal Celebration',
          description: 'Amazing goal celebration moment during the final game',
          url: '/photos/goal-celebration.jpg',
          thumbnailUrl: '/photos/thumbnails/goal-celebration-thumb.jpg',
          size: 1536000,
          uploadedBy: 'Sports Photographer',
          uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          tags: ['goal', 'celebration', 'moment', 'excitement'],
          category: 'game_photos',
          isPublic: true,
          views: 234,
          downloads: 45,
          dimensions: { width: 3000, height: 2000 },
          location: 'Main Stadium',
          dateTaken: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          id: '3',
          title: 'Training Session',
          description: 'Team training session focusing on passing drills',
          url: '/photos/training-session.jpg',
          thumbnailUrl: '/photos/thumbnails/training-session-thumb.jpg',
          size: 1024000,
          uploadedBy: 'Coach Johnson',
          uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          tags: ['training', 'practice', 'drills', 'teamwork'],
          category: 'training_photos',
          isPublic: false,
          views: 123,
          downloads: 23,
          dimensions: { width: 2500, height: 1800 },
          location: 'Training Ground',
          dateTaken: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
        {
          id: '4',
          title: 'Tournament Trophy Presentation',
          description: 'Trophy presentation ceremony at the tournament',
          url: '/photos/trophy-presentation.jpg',
          thumbnailUrl: '/photos/thumbnails/trophy-presentation-thumb.jpg',
          size: 3072000,
          uploadedBy: 'Event Photographer',
          uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          tags: ['trophy', 'presentation', 'ceremony', 'achievement'],
          category: 'tournaments',
          isPublic: true,
          views: 345,
          downloads: 67,
          dimensions: { width: 3500, height: 2500 },
          location: 'Tournament Venue',
          dateTaken: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        {
          id: '5',
          title: 'Team Building Event',
          description: 'Team building activities during the off-season',
          url: '/photos/team-building.jpg',
          thumbnailUrl: '/photos/thumbnails/team-building-thumb.jpg',
          size: 2048000,
          uploadedBy: 'Club Administrator',
          uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          tags: ['team-building', 'off-season', 'activities', 'bonding'],
          category: 'events',
          isPublic: true,
          views: 189,
          downloads: 34,
          dimensions: { width: 3000, height: 2000 },
          location: 'Team Retreat Center',
          dateTaken: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          id: '6',
          title: 'Player of the Month Award',
          description: 'Player receiving the monthly award recognition',
          url: '/photos/player-award.jpg',
          thumbnailUrl: '/photos/thumbnails/player-award-thumb.jpg',
          size: 1536000,
          uploadedBy: 'Club Director',
          uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          tags: ['award', 'recognition', 'player', 'achievement'],
          category: 'awards',
          isPublic: true,
          views: 278,
          downloads: 56,
          dimensions: { width: 2800, height: 2100 },
          location: 'Club House',
          dateTaken: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        },
        {
          id: '7',
          title: 'Pre-Game Warm-up',
          description: 'Team warming up before an important match',
          url: '/photos/pre-game-warmup.jpg',
          thumbnailUrl: '/photos/thumbnails/pre-game-warmup-thumb.jpg',
          size: 1024000,
          uploadedBy: 'Sports Photographer',
          uploadedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          tags: ['warm-up', 'pre-game', 'preparation', 'focus'],
          category: 'game_photos',
          isPublic: false,
          views: 145,
          downloads: 28,
          dimensions: { width: 2400, height: 1600 },
          location: 'Stadium',
          dateTaken: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        },
        {
          id: '8',
          title: 'Coaching Session',
          description: 'Coach providing tactical instructions to the team',
          url: '/photos/coaching-session.jpg',
          thumbnailUrl: '/photos/thumbnails/coaching-session-thumb.jpg',
          size: 2048000,
          uploadedBy: 'Assistant Coach',
          uploadedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
          tags: ['coaching', 'tactics', 'instruction', 'learning'],
          category: 'training_photos',
          isPublic: false,
          views: 98,
          downloads: 19,
          dimensions: { width: 3200, height: 2400 },
          location: 'Training Ground',
          dateTaken: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        },
      ];
      setPhotos(mockPhotos);
      setLoadingPhotos(false);
    }
  }, [loading]);

  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = photo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         photo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         photo.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTab = activeTab === 'all' || photo.category === activeTab;
    return matchesSearch && matchesTab;
  });

  const sortedPhotos = [...filteredPhotos].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return b.uploadedAt.getTime() - a.uploadedAt.getTime();
      case 'name':
        return a.title.localeCompare(b.title);
      case 'size':
        return b.size - a.size;
      case 'views':
        return b.views - a.views;
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
      case 'team_photos': return 'primary';
      case 'game_photos': return 'success';
      case 'training_photos': return 'info';
      case 'events': return 'warning';
      case 'tournaments': return 'danger';
      case 'awards': return 'secondary';
      default: return 'secondary';
    }
  };

  const incrementViews = (photoId: string) => {
    setPhotos(prev => 
      prev.map(photo => photo.id === photoId ? { ...photo, views: photo.views + 1 } : photo)
    );
  };

  const incrementDownloads = (photoId: string) => {
    setPhotos(prev => 
      prev.map(photo => photo.id === photoId ? { ...photo, downloads: photo.downloads + 1 } : photo)
    );
  };

  if (loading || loadingPhotos) {
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
          <h1 className="h3 mb-0">Photo Gallery</h1>
          <p className="text-muted mb-0">Browse and manage team photos and memories</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary">
            <i className="bi bi-cloud-upload me-2"></i>
            Upload Photos
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
                    <i className="bi bi-images text-primary fs-4"></i>
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
                    <i className="bi bi-camera text-success fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title mb-1">Game Photos</h6>
                  <h4 className="mb-0">{photos.filter(photo => photo.category === 'game_photos').length}</h4>
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
                    <i className="bi bi-people text-info fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title mb-1">Team Photos</h6>
                  <h4 className="mb-0">{photos.filter(photo => photo.category === 'team_photos').length}</h4>
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
                    <i className="bi bi-trophy text-warning fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title mb-1">Awards</h6>
                  <h4 className="mb-0">{photos.filter(photo => photo.category === 'awards').length}</h4>
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
                  className={`btn btn-outline-primary ${activeTab === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveTab('all')}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`btn btn-outline-primary ${activeTab === 'team_photos' ? 'active' : ''}`}
                  onClick={() => setActiveTab('team_photos')}
                >
                  Team
                </button>
                <button
                  type="button"
                  className={`btn btn-outline-primary ${activeTab === 'game_photos' ? 'active' : ''}`}
                  onClick={() => setActiveTab('game_photos')}
                >
                  Games
                </button>
                <button
                  type="button"
                  className={`btn btn-outline-primary ${activeTab === 'training_photos' ? 'active' : ''}`}
                  onClick={() => setActiveTab('training_photos')}
                >
                  Training
                </button>
              </div>
            </div>
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search text-muted"></i>
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
            <div className="col-md-4">
              <div className="d-flex gap-2 justify-content-end">
                <select 
                  className="form-select" 
                  style={{ width: 'auto' }}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <option value="date">Sort by Date</option>
                  <option value="name">Sort by Name</option>
                  <option value="size">Sort by Size</option>
                  <option value="views">Sort by Views</option>
                </select>
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
                    className={`btn btn-outline-secondary ${viewMode === 'masonry' ? 'active' : ''}`}
                    onClick={() => setViewMode('masonry')}
                  >
                    <i className="bi bi-grid-3x3"></i>
                  </button>
                </div>
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
                  style={{ height: '250px', objectFit: 'cover' }}
                  onClick={() => {
                    setSelectedPhoto(photo);
                    incrementViews(photo.id);
                  }}
                  role="button"
                />
                <div className="position-absolute top-0 end-0 m-2">
                  <span className={`badge bg-${getCategoryColor(photo.category)} rounded-pill`}>
                    {photo.category.replace('_', ' ')}
                  </span>
                </div>
                <div className="position-absolute bottom-0 start-0 end-0 p-3" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
                  <h6 className="text-white mb-1">{photo.title}</h6>
                  {photo.location && (
                    <small className="text-white-50">
                      <i className="bi bi-geo-alt me-1"></i>
                      {photo.location}
                    </small>
                  )}
                </div>
              </div>
              <div className="card-body">
                {photo.description && (
                  <p className="text-muted small mb-3">{photo.description.substring(0, 100)}...</p>
                )}
                
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <small className="text-muted">
                    <i className="bi bi-eye me-1"></i>
                    {photo.views} views
                  </small>
                  <small className="text-muted">
                    <i className="bi bi-download me-1"></i>
                    {photo.downloads} downloads
                  </small>
                </div>
                
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-sm btn-outline-primary flex-fill"
                    onClick={() => {
                      setSelectedPhoto(photo);
                      incrementViews(photo.id);
                    }}
                  >
                    <i className="bi bi-eye me-1"></i>
                    View
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-success flex-fill"
                    onClick={() => incrementDownloads(photo.id)}
                  >
                    <i className="bi bi-download me-1"></i>
                    Download
                  </button>
                </div>
              </div>
              <div className="card-footer bg-transparent">
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    <i className="bi bi-person me-1"></i>
                    {photo.uploadedBy}
                  </small>
                  <small className="text-muted">{formatTimeAgo(photo.uploadedAt)}</small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {sortedPhotos.length === 0 && (
        <div className="text-center py-5">
          <i className="bi bi-images fs-1 text-muted mb-3"></i>
          <h5 className="text-muted">No photos found</h5>
          <p className="text-muted">There are no photos matching your current filters.</p>
          <button className="btn btn-primary">
            <i className="bi bi-cloud-upload me-2"></i>
            Upload Your First Photo
          </button>
        </div>
      )}

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
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-8">
                    <img 
                      src={selectedPhoto.url} 
                      alt={selectedPhoto.title}
                      className="img-fluid rounded"
                    />
                  </div>
                  <div className="col-md-4">
                    <div className="card">
                      <div className="card-body">
                        <h6>Details</h6>
                        <dl className="row mb-0">
                          <dt className="col-sm-4">Category:</dt>
                          <dd className="col-sm-8">
                            <span className={`badge bg-${getCategoryColor(selectedPhoto.category)} rounded-pill`}>
                              {selectedPhoto.category.replace('_', ' ')}
                            </span>
                          </dd>
                          
                          <dt className="col-sm-4">Size:</dt>
                          <dd className="col-sm-8">{formatFileSize(selectedPhoto.size)}</dd>
                          
                          <dt className="col-sm-4">Dimensions:</dt>
                          <dd className="col-sm-8">{selectedPhoto.dimensions.width} × {selectedPhoto.dimensions.height}</dd>
                          
                          <dt className="col-sm-4">Views:</dt>
                          <dd className="col-sm-8">{selectedPhoto.views}</dd>
                          
                          <dt className="col-sm-4">Downloads:</dt>
                          <dd className="col-sm-8">{selectedPhoto.downloads}</dd>
                          
                          <dt className="col-sm-4">Uploaded:</dt>
                          <dd className="col-sm-8">{formatTimeAgo(selectedPhoto.uploadedAt)}</dd>
                          
                          <dt className="col-sm-4">By:</dt>
                          <dd className="col-sm-8">{selectedPhoto.uploadedBy}</dd>
                          
                          {selectedPhoto.location && (
                            <>
                              <dt className="col-sm-4">Location:</dt>
                              <dd className="col-sm-8">{selectedPhoto.location}</dd>
                            </>
                          )}
                          
                          {selectedPhoto.dateTaken && (
                            <>
                              <dt className="col-sm-4">Date Taken:</dt>
                              <dd className="col-sm-8">{formatTimeAgo(selectedPhoto.dateTaken)}</dd>
                            </>
                          )}
                        </dl>
                        
                        {selectedPhoto.description && (
                          <>
                            <hr />
                            <h6>Description</h6>
                            <p className="text-muted">{selectedPhoto.description}</p>
                          </>
                        )}
                        
                        {selectedPhoto.tags.length > 0 && (
                          <>
                            <hr />
                            <h6>Tags</h6>
                            <div className="d-flex flex-wrap gap-1">
                              {selectedPhoto.tags.map((tag, index) => (
                                <span key={index} className="badge bg-light text-dark rounded-pill">
                                  {tag}
                                </span>
                              ))}
                            </div>
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
                  onClick={() => setSelectedPhoto(null)}
                >
                  Close
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => incrementDownloads(selectedPhoto.id)}
                >
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