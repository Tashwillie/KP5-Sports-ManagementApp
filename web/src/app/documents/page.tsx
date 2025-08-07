'use client';

import { useFirebase } from '@/contexts/FirebaseContext';
import { useState, useEffect } from 'react';

interface Document {
  id: string;
  title: string;
  description?: string;
  type: 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'ppt' | 'pptx' | 'txt';
  url: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  tags: string[];
  category: 'forms' | 'policies' | 'training' | 'tournaments' | 'schedules' | 'reports';
  isPublic: boolean;
  downloads: number;
  lastModified: Date;
  version: string;
}

export default function DocumentsPage() {
  const { userData, loading } = useFirebase();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size' | 'downloads'>('date');

  // Mock data for documents
  useEffect(() => {
    if (!loading) {
      const mockDocuments: Document[] = [
        {
          id: '1',
          title: 'Player Registration Form',
          description: 'Official registration form for new players joining the club',
          type: 'pdf',
          url: '/documents/player-registration-form.pdf',
          size: 512000,
          uploadedBy: 'Club Administrator',
          uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          tags: ['registration', 'form', 'player', 'official'],
          category: 'forms',
          isPublic: true,
          downloads: 156,
          lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          version: '2.1',
        },
        {
          id: '2',
          title: 'Club Policies and Procedures',
          description: 'Complete guide to club policies, rules, and procedures',
          type: 'pdf',
          url: '/documents/club-policies.pdf',
          size: 2048000,
          uploadedBy: 'Club Director',
          uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          tags: ['policies', 'procedures', 'rules', 'guidelines'],
          category: 'policies',
          isPublic: true,
          downloads: 89,
          lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          version: '1.5',
        },
        {
          id: '3',
          title: 'Training Program Schedule',
          description: 'Weekly training program schedule for all age groups',
          type: 'xlsx',
          url: '/documents/training-schedule.xlsx',
          size: 256000,
          uploadedBy: 'Head Coach',
          uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          tags: ['training', 'schedule', 'program', 'weekly'],
          category: 'schedules',
          isPublic: false,
          downloads: 234,
          lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          version: '3.0',
        },
        {
          id: '4',
          title: 'Tournament Rules and Regulations',
          description: 'Official rules and regulations for the Spring Tournament',
          type: 'pdf',
          url: '/documents/tournament-rules.pdf',
          size: 1024000,
          uploadedBy: 'Tournament Director',
          uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          tags: ['tournament', 'rules', 'regulations', 'official'],
          category: 'tournaments',
          isPublic: true,
          downloads: 178,
          lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          version: '1.2',
        },
        {
          id: '5',
          title: 'Coaching Certification Guide',
          description: 'Step-by-step guide for coaches to obtain certifications',
          type: 'docx',
          url: '/documents/coaching-certification-guide.docx',
          size: 768000,
          uploadedBy: 'Director of Coaching',
          uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          tags: ['coaching', 'certification', 'guide', 'training'],
          category: 'training',
          isPublic: false,
          downloads: 45,
          lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          version: '1.0',
        },
        {
          id: '6',
          title: 'Monthly Financial Report',
          description: 'Monthly financial report and budget overview',
          type: 'xlsx',
          url: '/documents/monthly-financial-report.xlsx',
          size: 512000,
          uploadedBy: 'Club Treasurer',
          uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          tags: ['financial', 'report', 'budget', 'monthly'],
          category: 'reports',
          isPublic: false,
          downloads: 23,
          lastModified: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          version: '1.1',
        },
        {
          id: '7',
          title: 'Emergency Contact Form',
          description: 'Emergency contact information form for all players',
          type: 'pdf',
          url: '/documents/emergency-contact-form.pdf',
          size: 256000,
          uploadedBy: 'Club Administrator',
          uploadedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          tags: ['emergency', 'contact', 'form', 'safety'],
          category: 'forms',
          isPublic: true,
          downloads: 312,
          lastModified: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          version: '2.0',
        },
        {
          id: '8',
          title: 'Team Performance Analysis',
          description: 'Detailed analysis of team performance and statistics',
          type: 'pptx',
          url: '/documents/team-performance-analysis.pptx',
          size: 1536000,
          uploadedBy: 'Performance Analyst',
          uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          tags: ['performance', 'analysis', 'statistics', 'team'],
          category: 'reports',
          isPublic: false,
          downloads: 67,
          lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          version: '1.3',
        },
      ];
      setDocuments(mockDocuments);
      setLoadingDocuments(false);
    }
  }, [loading]);

  const filteredDocuments = documents.filter(document => {
    const matchesSearch = document.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         document.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         document.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTab = activeTab === 'all' || document.category === activeTab;
    return matchesSearch && matchesTab;
  });

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return b.uploadedAt.getTime() - a.uploadedAt.getTime();
      case 'name':
        return a.title.localeCompare(b.title);
      case 'size':
        return b.size - a.size;
      case 'downloads':
        return b.downloads - a.downloads;
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
      case 'forms': return 'primary';
      case 'policies': return 'success';
      case 'training': return 'info';
      case 'tournaments': return 'warning';
      case 'schedules': return 'secondary';
      case 'reports': return 'danger';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return 'bi-file-earmark-pdf';
      case 'doc':
      case 'docx': return 'bi-file-earmark-word';
      case 'xls':
      case 'xlsx': return 'bi-file-earmark-excel';
      case 'ppt':
      case 'pptx': return 'bi-file-earmark-ppt';
      case 'txt': return 'bi-file-earmark-text';
      default: return 'bi-file-earmark';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pdf': return 'danger';
      case 'doc':
      case 'docx': return 'primary';
      case 'xls':
      case 'xlsx': return 'success';
      case 'ppt':
      case 'pptx': return 'warning';
      case 'txt': return 'secondary';
      default: return 'secondary';
    }
  };

  const incrementDownloads = (documentId: string) => {
    setDocuments(prev => 
      prev.map(doc => doc.id === documentId ? { ...doc, downloads: doc.downloads + 1 } : doc)
    );
  };

  if (loading || loadingDocuments) {
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
          <h1 className="h3 mb-0">Documents</h1>
          <p className="text-muted mb-0">Manage and access important club documents</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary">
            <i className="bi bi-cloud-upload me-2"></i>
            Upload Document
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
                    <i className="bi bi-file-earmark-text text-primary fs-4"></i>
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
                  <div className="bg-danger bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-file-earmark-pdf text-danger fs-4"></i>
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
                  <div className="bg-success bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-file-earmark-excel text-success fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title mb-1">Spreadsheets</h6>
                  <h4 className="mb-0">{documents.filter(doc => doc.type === 'xls' || doc.type === 'xlsx').length}</h4>
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
                    <i className="bi bi-file-earmark-ppt text-warning fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title mb-1">Presentations</h6>
                  <h4 className="mb-0">{documents.filter(doc => doc.type === 'ppt' || doc.type === 'pptx').length}</h4>
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
                  className={`btn btn-outline-primary ${activeTab === 'forms' ? 'active' : ''}`}
                  onClick={() => setActiveTab('forms')}
                >
                  Forms
                </button>
                <button
                  type="button"
                  className={`btn btn-outline-primary ${activeTab === 'policies' ? 'active' : ''}`}
                  onClick={() => setActiveTab('policies')}
                >
                  Policies
                </button>
                <button
                  type="button"
                  className={`btn btn-outline-primary ${activeTab === 'training' ? 'active' : ''}`}
                  onClick={() => setActiveTab('training')}
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
                  placeholder="Search documents..."
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
                  <option value="downloads">Sort by Downloads</option>
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

      {/* Documents Grid/List */}
      {viewMode === 'grid' ? (
        <div className="row">
          {sortedDocuments.map((document) => (
            <div key={document.id} className="col-md-6 col-lg-4 col-xl-3 mb-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <div className={`bg-${getTypeColor(document.type)} bg-opacity-10 rounded-circle p-3 me-3`}>
                      <i className={`bi ${getTypeIcon(document.type)} text-${getTypeColor(document.type)} fs-4`}></i>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="card-title mb-1">{document.title}</h6>
                      <small className="text-muted">v{document.version}</small>
                    </div>
                  </div>
                  
                  {document.description && (
                    <p className="text-muted small mb-3">{document.description.substring(0, 100)}...</p>
                  )}
                  
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className={`badge bg-${getCategoryColor(document.category)} rounded-pill`}>
                      {document.category}
                    </span>
                    <small className="text-muted">{formatFileSize(document.size)}</small>
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <small className="text-muted">
                      <i className="bi bi-download me-1"></i>
                      {document.downloads} downloads
                    </small>
                    <small className="text-muted">{formatTimeAgo(document.uploadedAt)}</small>
                  </div>
                  
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-sm btn-outline-primary flex-fill"
                      onClick={() => setSelectedDocument(document)}
                    >
                      <i className="bi bi-eye me-1"></i>
                      Preview
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-success flex-fill"
                      onClick={() => incrementDownloads(document.id)}
                    >
                      <i className="bi bi-download me-1"></i>
                      Download
                    </button>
                  </div>
                </div>
                <div className="card-footer bg-transparent">
                  <small className="text-muted">
                    <i className="bi bi-person me-1"></i>
                    {document.uploadedBy}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Document</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Size</th>
                    <th>Downloads</th>
                    <th>Uploaded</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDocuments.map((document) => (
                    <tr key={document.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className={`bg-${getTypeColor(document.type)} bg-opacity-10 rounded-circle p-2 me-3`}>
                            <i className={`bi ${getTypeIcon(document.type)} text-${getTypeColor(document.type)}`}></i>
                          </div>
                          <span className="badge bg-secondary rounded-pill">v{document.version}</span>
                        </div>
                      </td>
                      <td>
                        <div>
                          <h6 className="mb-1">{document.title}</h6>
                          {document.description && (
                            <small className="text-muted">{document.description.substring(0, 50)}...</small>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`badge bg-${getCategoryColor(document.category)} rounded-pill`}>
                          {document.category}
                        </span>
                      </td>
                      <td>{formatFileSize(document.size)}</td>
                      <td>{document.downloads}</td>
                      <td>{formatTimeAgo(document.uploadedAt)}</td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button 
                            className="btn btn-outline-primary"
                            onClick={() => setSelectedDocument(document)}
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button 
                            className="btn btn-outline-success"
                            onClick={() => incrementDownloads(document.id)}
                          >
                            <i className="bi bi-download"></i>
                          </button>
                          <button className="btn btn-outline-secondary">
                            <i className="bi bi-three-dots"></i>
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
          <i className="bi bi-file-earmark-text fs-1 text-muted mb-3"></i>
          <h5 className="text-muted">No documents found</h5>
          <p className="text-muted">There are no documents matching your current filters.</p>
          <button className="btn btn-primary">
            <i className="bi bi-cloud-upload me-2"></i>
            Upload Your First Document
          </button>
        </div>
      )}

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
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-8">
                    <div className="text-center py-5">
                      <div className={`bg-${getTypeColor(selectedDocument.type)} bg-opacity-10 rounded-circle p-4 d-inline-block mb-3`}>
                        <i className={`bi ${getTypeIcon(selectedDocument.type)} text-${getTypeColor(selectedDocument.type)} fs-1`}></i>
                      </div>
                      <h5>Document Preview</h5>
                      <p className="text-muted">Click download to view this document</p>
                      <button 
                        className="btn btn-primary"
                        onClick={() => incrementDownloads(selectedDocument.id)}
                      >
                        <i className="bi bi-download me-2"></i>
                        Download Document
                      </button>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card">
                      <div className="card-body">
                        <h6>Details</h6>
                        <dl className="row mb-0">
                          <dt className="col-sm-4">Type:</dt>
                          <dd className="col-sm-8">
                            <span className={`badge bg-${getTypeColor(selectedDocument.type)} rounded-pill`}>
                              {selectedDocument.type.toUpperCase()}
                            </span>
                          </dd>
                          
                          <dt className="col-sm-4">Category:</dt>
                          <dd className="col-sm-8">
                            <span className={`badge bg-${getCategoryColor(selectedDocument.category)} rounded-pill`}>
                              {selectedDocument.category}
                            </span>
                          </dd>
                          
                          <dt className="col-sm-4">Size:</dt>
                          <dd className="col-sm-8">{formatFileSize(selectedDocument.size)}</dd>
                          
                          <dt className="col-sm-4">Version:</dt>
                          <dd className="col-sm-8">v{selectedDocument.version}</dd>
                          
                          <dt className="col-sm-4">Downloads:</dt>
                          <dd className="col-sm-8">{selectedDocument.downloads}</dd>
                          
                          <dt className="col-sm-4">Uploaded:</dt>
                          <dd className="col-sm-8">{formatTimeAgo(selectedDocument.uploadedAt)}</dd>
                          
                          <dt className="col-sm-4">Modified:</dt>
                          <dd className="col-sm-8">{formatTimeAgo(selectedDocument.lastModified)}</dd>
                          
                          <dt className="col-sm-4">By:</dt>
                          <dd className="col-sm-8">{selectedDocument.uploadedBy}</dd>
                        </dl>
                        
                        {selectedDocument.description && (
                          <>
                            <hr />
                            <h6>Description</h6>
                            <p className="text-muted">{selectedDocument.description}</p>
                          </>
                        )}
                        
                        {selectedDocument.tags.length > 0 && (
                          <>
                            <hr />
                            <h6>Tags</h6>
                            <div className="d-flex flex-wrap gap-1">
                              {selectedDocument.tags.map((tag, index) => (
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
                  onClick={() => setSelectedDocument(null)}
                >
                  Close
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => incrementDownloads(selectedDocument.id)}
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