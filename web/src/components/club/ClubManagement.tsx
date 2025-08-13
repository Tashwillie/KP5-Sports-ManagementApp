import React, { useState } from 'react';
import { Plus, Building, Users, MapPin, Phone, Mail, Globe, Edit, Trash2 } from 'lucide-react';

interface Club {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  teams: number;
  members: number;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
}

interface ClubManagementProps {
  clubs: Club[];
  onAddClub: () => void;
  onEditClub: (club: Club) => void;
  onDeleteClub: (clubId: string) => void;
  onViewClub: (club: Club) => void;
}

export const ClubManagement: React.FC<ClubManagementProps> = ({
  clubs,
  onAddClub,
  onEditClub,
  onDeleteClub,
  onViewClub,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         club.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         club.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || club.status === filterStatus;
    const matchesLocation = filterLocation === 'all' || 
                           (filterLocation === 'local' && club.city === 'Local City') ||
                           (filterLocation === 'national' && club.city !== 'Local City');
    
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { class: string; text: string } } = {
      'active': { class: 'bg-success', text: 'Active' },
      'inactive': { class: 'bg-secondary', text: 'Inactive' },
      'pending': { class: 'bg-warning', text: 'Pending' },
    };
    
    const config = statusConfig[status] || statusConfig.inactive;
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1">Club Management</h2>
          <p className="text-muted mb-0">Manage your sports clubs and organizations</p>
        </div>
        <button 
          onClick={onAddClub}
          className="btn btn-primary d-flex align-items-center gap-2"
        >
          <Plus size={20} />
          Add New Club
        </button>
      </div>

      {/* Filters and Search */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search clubs, cities, or descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
          >
            <option value="all">All Locations</option>
            <option value="local">Local</option>
            <option value="national">National</option>
          </select>
        </div>
        <div className="col-md-2">
          <div className="text-end">
            <small className="text-muted">
              {filteredClubs.length} of {clubs.length} clubs
            </small>
          </div>
        </div>
      </div>

      {/* Clubs Grid */}
      <div className="row g-4">
        {filteredClubs.map((club) => (
          <div key={club.id} className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              {/* Club Header */}
              <div className="card-header bg-transparent border-0 pb-0">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="d-flex align-items-center gap-3">
                    {club.logo ? (
                      <img 
                        src={club.logo} 
                        alt={`${club.name} logo`}
                        className="rounded-circle"
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center text-white"
                        style={{ width: '50px', height: '50px', backgroundColor: '#4169E1' }}
                      >
                        <Building size={24} />
                      </div>
                    )}
                    <div>
                      <h6 className="mb-1 fw-bold">{club.name}</h6>
                      <div className="d-flex gap-2">
                        {getStatusBadge(club.status)}
                      </div>
                    </div>
                  </div>
                  <div className="dropdown">
                    <button 
                      className="btn btn-link text-muted p-0"
                      data-bs-toggle="dropdown"
                    >
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                      </svg>
                    </button>
                    <ul className="dropdown-menu">
                      <li><button className="dropdown-item" onClick={() => onViewClub(club)}>View Details</button></li>
                      <li><button className="dropdown-item" onClick={() => onEditClub(club)}>Edit Club</button></li>
                      <li><hr className="dropdown-divider" /></li>
                      <li><button className="dropdown-item text-danger" onClick={() => onDeleteClub(club.id)}>Delete Club</button></li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Club Info */}
              <div className="card-body pt-2">
                {club.description && (
                  <p className="text-muted small mb-3">{club.description}</p>
                )}

                {/* Location */}
                {club.address && (
                  <div className="mb-3">
                    <div className="d-flex align-items-center gap-2 text-muted mb-1">
                      <MapPin size={16} />
                      <small>Location</small>
                    </div>
                    <div className="fw-medium small">
                      {club.address}
                      {club.city && `, ${club.city}`}
                      {club.state && `, ${club.state}`}
                      {club.country && `, ${club.country}`}
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                <div className="row g-2 mb-3">
                  {club.phone && (
                    <div className="col-6">
                      <div className="d-flex align-items-center gap-2 text-muted">
                        <Phone size={16} />
                        <small className="text-truncate">{club.phone}</small>
                      </div>
                    </div>
                  )}
                  {club.email && (
                    <div className="col-6">
                      <div className="d-flex align-items-center gap-2 text-muted">
                        <Mail size={16} />
                        <small className="text-truncate">{club.email}</small>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="row g-2 mb-3">
                  <div className="col-6 text-center">
                    <div className="bg-primary bg-opacity-10 rounded p-2">
                      <div className="fw-bold text-primary">{club.teams}</div>
                      <small className="text-muted">Teams</small>
                    </div>
                  </div>
                  <div className="col-6 text-center">
                    <div className="bg-success bg-opacity-10 rounded p-2">
                      <div className="fw-bold text-success">{club.members}</div>
                      <small className="text-muted">Members</small>
                    </div>
                  </div>
                </div>

                {/* Website */}
                {club.website && (
                  <div className="mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <Globe size={16} className="text-muted" />
                      <a 
                        href={club.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-decoration-none small"
                      >
                        Visit Website
                      </a>
                    </div>
                  </div>
                )}

                <div className="text-center mb-3">
                  <small className="text-muted">
                    Created: {formatDate(club.createdAt)}
                  </small>
                </div>
              </div>

              {/* Card Actions */}
              <div className="card-footer bg-transparent border-0 pt-0">
                <div className="d-grid gap-2">
                  <button 
                    onClick={() => onViewClub(club)}
                    className="btn btn-outline-primary btn-sm"
                  >
                    View Club Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredClubs.length === 0 && (
        <div className="text-center py-5">
          <div className="mb-3">
            <Building size={64} className="text-muted" />
          </div>
          <h5 className="text-muted">No clubs found</h5>
          <p className="text-muted mb-3">
            {searchTerm || filterStatus !== 'all' || filterLocation !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first club'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && filterLocation === 'all' && (
            <button onClick={onAddClub} className="btn btn-primary">
              <Plus size={20} className="me-2" />
              Create Your First Club
            </button>
          )}
        </div>
      )}
    </div>
  );
};
