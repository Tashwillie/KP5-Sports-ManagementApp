'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useClubs } from '@/hooks/useClubs';

interface Club {
  id: string;
  name: string;
  description: string;
  location: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  foundedYear: number;
  totalTeams: number;
  totalMembers: number;
  status: string;
  rating: number;
  logo?: string;
  address: string;
  sports: string[];
  createdAt: string;
  updatedAt: string;
}

interface ClubWithStats extends Club {
  activeTeams: number;
  totalPlayers: number;
  upcomingEvents: number;
}

export default function ClubsPage() {
  return (
    <ProtectedRoute>
      <ClubsContent />
    </ProtectedRoute>
  );
}

function ClubsContent() {
  const { clubs, loading: loadingData, error, refetch } = useClubs();
  const [filteredClubs, setFilteredClubs] = useState<ClubWithStats[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sportFilter, setSportFilter] = useState('all');

  // Filter clubs based on search and filters
  useEffect(() => {
    let filtered = clubs;

    if (searchTerm) {
      filtered = filtered.filter(club =>
        club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(club => club.status === statusFilter);
    }

    if (sportFilter !== 'all') {
      filtered = filtered.filter(club => club.sports.includes(sportFilter));
    }

    setFilteredClubs(filtered);
  }, [clubs, searchTerm, statusFilter, sportFilter]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success';
      case 'inactive':
        return 'bg-secondary';
      case 'pending':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  const handleCreateClub = () => {
    window.location.href = '/clubs/create';
  };

  const handleViewClub = (clubId: string) => {
    window.location.href = `/clubs/${clubId}`;
  };

  const handleEditClub = (clubId: string) => {
    window.location.href = `/clubs/${clubId}/edit`;
  };

  const handleManageClub = (clubId: string) => {
    window.location.href = `/clubs/${clubId}/manage`;
  };

  if (loadingData) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading clubs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Error loading clubs</h4>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={refetch}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <Sidebar activeTab="clubs" />

      {/* Main Content */}
      <div className="flex-grow-1 bg-light">
        {/* Top Header */}
        <div className="bg-white border-bottom p-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <button className="btn btn-link text-dark p-0">
                <i className="bi bi-grid-3x3"></i>
              </button>
              <div>
                <h5 className="mb-0">Clubs Management</h5>
                <small className="text-muted">
                  Manage sports clubs and organizations
                </small>
              </div>
            </div>
            
            <div className="d-flex align-items-center gap-3">
              <button className="btn btn-sm" style={{backgroundColor: '#4169E1', borderColor: '#4169E1', color: 'white'}} onClick={handleCreateClub}>
                <i className="bi bi-plus me-1"></i>
                Add Club
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4">
          {/* Filters and Search */}
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search clubs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
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
                value={sportFilter}
                onChange={(e) => setSportFilter(e.target.value)}
              >
                <option value="all">All Sports</option>
                <option value="Football">Football</option>
                <option value="Basketball">Basketball</option>
                <option value="Tennis">Tennis</option>
                <option value="Athletics">Athletics</option>
                <option value="Swimming">Swimming</option>
                <option value="Volleyball">Volleyball</option>
              </select>
            </div>
          </div>

          {/* Clubs Grid */}
          <div className="row g-4">
            {filteredClubs.map((club) => (
              <div key={club.id} className="col-md-6 col-lg-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <span className={`badge ${getStatusBadgeClass(club.status)} me-2`}>
                          {getStatusLabel(club.status)}
                        </span>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-star-fill text-warning me-1"></i>
                          <span className="fw-bold">{club.rating}</span>
                        </div>
                      </div>
                      <div className="dropdown">
                        <button className="btn btn-link text-muted p-0" data-bs-toggle="dropdown">
                          <i className="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul className="dropdown-menu">
                          <li><a className="dropdown-item" href="#" onClick={() => handleViewClub(club.id)}>
                            <i className="bi bi-eye me-2"></i>View
                          </a></li>
                          <li><a className="dropdown-item" href="#" onClick={() => handleEditClub(club.id)}>
                            <i className="bi bi-pencil me-2"></i>Edit
                          </a></li>
                          <li><a className="dropdown-item" href="#" onClick={() => handleManageClub(club.id)}>
                            <i className="bi bi-gear me-2"></i>Manage
                          </a></li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="text-center mb-3">
                      <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{width: '60px', height: '60px'}}>
                        <i className="bi bi-building text-primary fs-4"></i>
                      </div>
                      <h5 className="card-title mb-1">{club.name}</h5>
                      <p className="text-muted small mb-0">{club.location}</p>
                    </div>
                    
                    <p className="text-muted small mb-3">{club.description}</p>
                    
                    <div className="row text-center mb-3">
                      <div className="col-4">
                        <div className="text-primary fw-bold">{club.activeTeams}</div>
                        <small className="text-muted">Teams</small>
                      </div>
                      <div className="col-4">
                        <div className="text-success fw-bold">{club.totalPlayers}</div>
                        <small className="text-muted">Players</small>
                      </div>
                      <div className="col-4">
                        <div className="text-warning fw-bold">{club.upcomingEvents}</div>
                        <small className="text-muted">Events</small>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <small className="text-muted">Sports</small>
                      <div className="d-flex flex-wrap gap-1 mt-1">
                        {club.sports.map((sport, index) => (
                          <span key={index} className="badge bg-light text-dark border">
                            {sport}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <small className="text-muted">Founded</small>
                        <div className="fw-bold">{club.foundedYear}</div>
                      </div>
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleViewClub(club.id)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredClubs.length === 0 && (
            <div className="text-center py-5">
              <i className="bi bi-building display-1 text-muted"></i>
              <h4 className="mt-3">No clubs found</h4>
              <p className="text-muted">Try adjusting your search or filters</p>
              <button 
                className="btn btn-primary"
                onClick={handleCreateClub}
              >
                Add Your First Club
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 