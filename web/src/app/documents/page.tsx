'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/apiClient';
import {
  FileText, Upload, Settings, Search, Grid, List, Eye, Download, File,
  FileSpreadsheet, Presentation, FileType, X, User, Calendar, SortAsc, MoreHorizontal
} from 'lucide-react';

interface Document {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'ppt' | 'pptx' | 'txt';
  url: string;
  size: number;
  category: 'rules' | 'forms' | 'reports' | 'presentations' | 'contracts' | 'manuals';
  tags: string[];
  uploadedBy: string;
  uploadedAt: Date;
  lastModified: Date;
  views: number;
  downloads: number;
  isPublic: boolean;
  teamId?: string;
  tournamentId?: string;
  version: string;
}

export default function DocumentsPage() {
  const { user: userData, loading  } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'views'>('date');
  const [loadingDocuments, setLoadingDocuments] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (loading || !userData) return;
      try {
        setLoadingDocuments(true);
        const resp = await apiClient.getEvents();
        // Map events with type 'document' if such exists; backend lacks dedicated documents API.
        const docs: Document[] = (resp.data.events || [])
          .filter((e: any) => (e.type || '').toLowerCase() === 'document')
          .map((e: any) => ({
            id: e.id,
            title: e.title,
            description: e.description || '',
            type: 'pdf',
            url: '#',
            size: 0,
            category: 'manuals',
            tags: [],
            uploadedBy: e.creatorId || 'System',
            uploadedAt: new Date(e.createdAt),
            lastModified: new Date(e.updatedAt),
            views: 0,
            downloads: 0,
            isPublic: true,
            version: '1.0',
          }));
        setDocuments(docs);
      } catch (e) {
        setDocuments([]);
      } finally {
        setLoadingDocuments(false);
      }
    };
    load();
  }, [loading, userData]);

  const filteredDocuments = documents.filter(document => {
    const matchesSearch = document.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         document.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         document.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategory === 'all' || document.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.title.localeCompare(b.title);
      case 'date':
        return b.lastModified.getTime() - a.lastModified.getTime();
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
      case 'rules': return 'primary';
      case 'forms': return 'success';
      case 'reports': return 'info';
      case 'presentations': return 'warning';
      case 'contracts': return 'danger';
      case 'manuals': return 'secondary';
      default: return 'light';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText size={20} />;
      case 'doc': case 'docx': return <File size={20} />;
      case 'xls': case 'xlsx': return <FileSpreadsheet size={20} />;
      case 'ppt': case 'pptx': return <Presentation size={20} />;
      case 'txt': return <FileType size={20} />;
      default: return <File size={20} />;
    }
  };

  const incrementViews = (documentId: string) => {
    setDocuments(prev => 
      prev.map(doc => doc.id === documentId ? { ...doc, views: doc.views + 1 } : doc)
    );
  };

  const incrementDownloads = (documentId: string) => {
    setDocuments(prev => 
      prev.map(doc => doc.id === documentId ? { ...doc, downloads: doc.downloads + 1 } : doc)
    );
  };

  // Show loading state while Firebase is initializing or documents are loading
  if (loading || loadingDocuments) {
    return (
      <div className="d-flex">
        <div className="bg-white border-end" style={{width: '280px', minHeight: '100vh'}}>
          <div className="p-3">
            <div className="d-flex align-items-center mb-4">
              <div className="bg-primary rounded p-2 me-3">
                <FileText size={24} className="text-white" />
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
  if (!userData) {
    return (
      <div className="d-flex">
        <div className="bg-white border-end" style={{width: '280px', minHeight: '100vh'}}>
          <div className="p-3">
            <div className="d-flex align-items-center mb-4">
              <div className="bg-primary rounded p-2 me-3">
                <FileText size={24} className="text-white" />
              </div>
              <h5 className="mb-0">KP5 Academy</h5>
            </div>
          </div>
        </div>
        <div className="flex-grow-1 bg-light">
          <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
            <div className="text-center">
              <h5 className="text-muted">Access Denied</h5>
              <p className="text-muted">Please log in to view documents.</p>
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
              <FileText size={24} className="text-white" />
            </div>
            <h5 className="mb-0">KP5 Academy</h5>
          </div>
          
          {/* User Profile */}
          <div className="d-flex align-items-center mb-4 p-3 bg-light rounded">
            <div className="bg-primary rounded-circle p-2 me-3">
              <User size={20} className="text-white" />
            </div>
            <div>
              <h6 className="mb-0">{userData.displayName || 'User'}</h6>
              <small className="text-muted">{userData.role}</small>
            </div>
          </div>

          {/* Navigation */}
          <nav className="nav flex-column">
            <a className="nav-link" href="/dashboard">
              <FileText size={20} className="me-2" />
              Dashboard
            </a>
            <a className="nav-link" href="/announcements">
              <FileText size={20} className="me-2" />
              Announcements
            </a>
            <a className="nav-link" href="/messages">
              <FileText size={20} className="me-2" />
              Messages
            </a>
            <a className="nav-link" href="/notifications">
              <FileText size={20} className="me-2" />
              Notifications
            </a>
            <a className="nav-link" href="/teams">
              <FileText size={20} className="me-2" />
              Teams
            </a>
            <a className="nav-link" href="/tournaments">
              <FileText size={20} className="me-2" />
              Tournaments
            </a>
            <a className="nav-link" href="/schedule">
              <FileText size={20} className="me-2" />
              Schedule
            </a>
            <a className="nav-link" href="/media">
              <FileText size={20} className="me-2" />
              Media
            </a>
            <a className="nav-link active" href="/documents">
              <FileText size={20} className="me-2" />
              Documents
            </a>
            <a className="nav-link" href="/photos">
              <FileText size={20} className="me-2" />
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
              <h4 className="mb-0">Documents</h4>
              <p className="text-muted mb-0">Manage and organize your documents</p>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-primary">
                <Upload size={20} className="me-2" />
                Upload Document
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
                        <FileText size={24} className="text-primary" />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="card-title mb-1">Total Documents</h6>
                      <h4 className="mb-0">{documents.length}</h4>
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
                        <FileText size={24} className="text-success" />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="card-title mb-1">PDF Files</h6>
                      <h4 className="mb-0">{documents.filter(doc => doc.type === 'pdf').length}</h4>
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
                        <FileSpreadsheet size={24} className="text-warning" />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="card-title mb-1">Spreadsheets</h6>
                      <h4 className="mb-0">{documents.filter(doc => doc.type === 'xlsx' || doc.type === 'xls').length}</h4>
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
                        <Presentation size={24} className="text-info" />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="card-title mb-1">Presentations</h6>
                      <h4 className="mb-0">{documents.filter(doc => doc.type === 'pptx' || doc.type === 'ppt').length}</h4>
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
                <div className="col-md-3">
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
                      className={`btn btn-outline-primary ${activeCategory === 'rules' ? 'active' : ''}`}
                      onClick={() => setActiveCategory('rules')}
                    >
                      Rules
                    </button>
                    <button
                      type="button"
                      className={`btn btn-outline-primary ${activeCategory === 'forms' ? 'active' : ''}`}
                      onClick={() => setActiveCategory('forms')}
                    >
                      Forms
                    </button>
                    <button
                      type="button"
                      className={`btn btn-outline-primary ${activeCategory === 'reports' ? 'active' : ''}`}
                      onClick={() => setActiveCategory('reports')}
                    >
                      Reports
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
                      placeholder="Search documents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-3">
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

          {/* Documents Grid/List */}
          {viewMode === 'grid' ? (
            <div className="row">
              {sortedDocuments.map((document) => (
                <div key={document.id} className="col-md-6 col-lg-4 col-xl-3 mb-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-start mb-3">
                        <div className="flex-shrink-0">
                          <div className="bg-light rounded p-3">
                            {getTypeIcon(document.type)}
                          </div>
                        </div>
                        <div className="flex-grow-1 ms-3">
                          <h6 className="card-title mb-1">{document.title}</h6>
                          <span className={`badge bg-${getCategoryColor(document.category)} rounded-pill`}>
                            {document.category}
                          </span>
                        </div>
                      </div>
                      <p className="card-text text-muted small mb-3">{document.description}</p>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <small className="text-muted">{formatFileSize(document.size)}</small>
                        <small className="text-muted">v{document.version}</small>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => {
                              incrementViews(document.id);
                              setSelectedDocument(document);
                            }}
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-success"
                            onClick={() => incrementDownloads(document.id)}
                          >
                            <Download size={16} />
                          </button>
                        </div>
                        <div className="d-flex gap-2 text-muted">
                          <small>{document.views} views</small>
                          <small>{document.downloads} downloads</small>
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
                        <th>Document</th>
                        <th>Category</th>
                        <th>Size</th>
                        <th>Version</th>
                        <th>Views</th>
                        <th>Downloads</th>
                        <th>Modified</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedDocuments.map((document) => (
                        <tr key={document.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="bg-light rounded p-2 me-3">
                                {getTypeIcon(document.type)}
                              </div>
                              <div>
                                <div className="fw-medium">{document.title}</div>
                                <small className="text-muted">{document.type.toUpperCase()}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`badge bg-${getCategoryColor(document.category)}`}>
                              {document.category}
                            </span>
                          </td>
                          <td>{formatFileSize(document.size)}</td>
                          <td>v{document.version}</td>
                          <td>{document.views}</td>
                          <td>{document.downloads}</td>
                          <td>{formatTimeAgo(document.lastModified)}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => {
                                  incrementViews(document.id);
                                  setSelectedDocument(document);
                                }}
                              >
                                <Eye size={16} />
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-success"
                                onClick={() => incrementDownloads(document.id)}
                              >
                                <Download size={16} />
                              </button>
                              <button className="btn btn-sm btn-outline-secondary">
                                <MoreHorizontal size={16} />
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
          {sortedDocuments.length === 0 && (
            <div className="text-center py-5">
              <FileText size={64} className="text-muted mb-3" />
              <h5 className="text-muted">No documents found</h5>
              <p className="text-muted">There are no documents matching your current filters.</p>
              <button className="btn btn-primary">
                <Upload size={20} className="me-2" />
                Upload Your First Document
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Document Detail Modal */}
      {selectedDocument && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedDocument.title}</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setSelectedDocument(null)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <div className="text-center mb-4">
                  <div className="bg-light rounded p-5">
                    <FileText size={64} className="text-muted mb-3" />
                    <h6 className="text-muted">{selectedDocument.title}</h6>
                    <p className="text-muted">{selectedDocument.description}</p>
                    <div className="d-flex justify-content-center gap-2">
                      <span className={`badge bg-${getCategoryColor(selectedDocument.category)}`}>
                        {selectedDocument.category}
                      </span>
                      <span className="badge bg-secondary">
                        {selectedDocument.type.toUpperCase()}
                      </span>
                      <span className="badge bg-info">
                        v{selectedDocument.version}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-6">
                    <h6>Document Details</h6>
                    <ul className="list-unstyled">
                      <li><strong>Type:</strong> {selectedDocument.type.toUpperCase()}</li>
                      <li><strong>Size:</strong> {formatFileSize(selectedDocument.size)}</li>
                      <li><strong>Category:</strong> {selectedDocument.category}</li>
                      <li><strong>Version:</strong> {selectedDocument.version}</li>
                      <li><strong>Uploaded by:</strong> {selectedDocument.uploadedBy}</li>
                      <li><strong>Uploaded:</strong> {formatTimeAgo(selectedDocument.uploadedAt)}</li>
                      <li><strong>Modified:</strong> {formatTimeAgo(selectedDocument.lastModified)}</li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <h6>Statistics</h6>
                    <ul className="list-unstyled">
                      <li><strong>Views:</strong> {selectedDocument.views}</li>
                      <li><strong>Downloads:</strong> {selectedDocument.downloads}</li>
                      <li><strong>Public:</strong> {selectedDocument.isPublic ? 'Yes' : 'No'}</li>
                    </ul>
                    
                    <h6 className="mt-3">Tags</h6>
                    <div className="d-flex flex-wrap gap-1">
                      {selectedDocument.tags.map((tag, index) => (
                        <span key={index} className="badge bg-light text-dark">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h6>Description</h6>
                  <p>{selectedDocument.description}</p>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setSelectedDocument(null)}
                >
                  Close
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => {
                    incrementDownloads(selectedDocument.id);
                    setSelectedDocument(null);
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