'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useTournaments } from '@/hooks/useTournaments';

interface Tournament {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  type: 'league' | 'cup' | 'friendly' | 'championship';
  maxTeams: number;
  currentTeams: number;
  venue?: string;
  prize?: string;
  organizer: string;
}

interface TournamentWithStats extends Tournament {
  organizerId: string;
  registrationDeadline: Date;
  entryFee?: number;
  rules?: string;
  brackets?: any[];
  standings?: any[];
}

export default function TournamentsPage() {
  return (
    <ProtectedRoute>
      <TournamentsContent />
    </ProtectedRoute>
  );
}

function TournamentsContent() {
  const { data: apiResponse, isLoading: loadingData, error, refetch } = useTournaments();
  const [filteredTournaments, setFilteredTournaments] = useState<TournamentWithStats[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Transform API tournaments to match the interface
  const tournaments: TournamentWithStats[] = (apiResponse?.data?.tournaments || []).map((tournament: any) => ({
    id: tournament.id,
    name: tournament.name,
    description: tournament.description || '',
    startDate: tournament.startDate,
    endDate: tournament.endDate,
    status: tournament.status === 'upcoming' ? 'upcoming' : 
            tournament.status === 'active' ? 'active' : 
            tournament.status === 'completed' ? 'completed' : 'cancelled',
    type: tournament.type === 'league' ? 'league' : 
          tournament.type === 'cup' ? 'cup' : 
          tournament.type === 'friendly' ? 'friendly' : 'championship',
    maxTeams: tournament.maxTeams,
    currentTeams: tournament.currentTeams,
    venue: tournament.venue || '',
    prize: tournament.prize || '',
    organizer: tournament.organizer,
    organizerId: tournament.organizerId,
    registrationDeadline: tournament.registrationDeadline,
    entryFee: tournament.entryFee,
    rules: tournament.rules || '',
    brackets: [],
    standings: [],
  }));

  // Filter tournaments based on search and filters
  useEffect(() => {
    let filtered = tournaments;

    if (searchTerm) {
      filtered = filtered.filter(tournament =>
        tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tournament.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tournament.organizer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(tournament => tournament.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(tournament => tournament.type === typeFilter);
    }

    setFilteredTournaments(filtered);
  }, [tournaments, searchTerm, statusFilter, typeFilter]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-primary';
      case 'active':
        return 'bg-success';
      case 'completed':
        return 'bg-secondary';
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'league':
        return 'bg-info';
      case 'cup':
        return 'bg-warning';
      case 'championship':
        return 'bg-danger';
      case 'friendly':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysUntil = (date: Date) => {
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleCreateTournament = () => {
    window.location.href = '/tournaments/create';
  };

  const handleViewTournament = (tournamentId: string) => {
    window.location.href = `/tournaments/${tournamentId}`;
  };

  const handleEditTournament = (tournamentId: string) => {
    window.location.href = `/tournaments/${tournamentId}/edit`;
  };

  const handleManageBrackets = (tournamentId: string) => {
    window.location.href = `/tournaments/${tournamentId}/brackets`;
  };

  if (loadingData) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading tournaments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Error loading tournaments</h4>
            <p>{error.message || 'Failed to load tournaments'}</p>
            <button className="btn btn-primary" onClick={() => refetch()}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <Sidebar activeTab="tournaments" />

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
                <h5 className="mb-0">Tournaments Management</h5>
                <small className="text-muted">
                  Manage tournaments and competitions
                </small>
              </div>
            </div>
            
            <div className="d-flex align-items-center gap-3">
              <button className="btn btn-sm" style={{backgroundColor: '#4169E1', borderColor: '#4169E1', color: 'white'}} onClick={handleCreateTournament}>
                <i className="bi bi-plus me-1"></i>
                Create Tournament
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
                  placeholder="Search tournaments..."
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
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="league">League</option>
                <option value="cup">Cup</option>
                <option value="championship">Championship</option>
                <option value="friendly">Friendly</option>
              </select>
            </div>
          </div>

          {/* Tournaments Grid */}
          <div className="row g-4">
            {filteredTournaments.map((tournament) => (
              <div key={tournament.id} className="col-md-6 col-lg-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <span className={`badge ${getStatusBadgeClass(tournament.status)} me-2`}>
                          {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                        </span>
                        <span className={`badge ${getTypeBadgeClass(tournament.type)}`}>
                          {tournament.type.charAt(0).toUpperCase() + tournament.type.slice(1)}
                        </span>
                      </div>
                      <div className="dropdown">
                        <button className="btn btn-link text-muted p-0" data-bs-toggle="dropdown">
                          <i className="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul className="dropdown-menu">
                          <li><a className="dropdown-item" href="#" onClick={() => handleViewTournament(tournament.id)}>
                            <i className="bi bi-eye me-2"></i>View
                          </a></li>
                          <li><a className="dropdown-item" href="#" onClick={() => handleEditTournament(tournament.id)}>
                            <i className="bi bi-pencil me-2"></i>Edit
                          </a></li>
                          <li><a className="dropdown-item" href="#" onClick={() => handleManageBrackets(tournament.id)}>
                            <i className="bi bi-diagram-3 me-2"></i>Brackets
                          </a></li>
                          <li><a className="dropdown-item" href={`/tournaments/${tournament.id}/brackets`}>
                            <i className="bi bi-eye me-2"></i>View Brackets
                          </a></li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="text-center mb-3">
                      <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{width: '60px', height: '60px'}}>
                        <i className="bi bi-trophy text-primary fs-4"></i>
                      </div>
                      <h5 className="card-title mb-2">{tournament.name}</h5>
                      <p className="text-muted small mb-3">{tournament.description}</p>
                    </div>
                    
                    <div className="row text-center mb-3">
                      <div className="col-4">
                        <div className="text-primary fw-bold">{tournament.currentTeams}</div>
                        <small className="text-muted">Teams</small>
                      </div>
                      <div className="col-4">
                        <div className="text-success fw-bold">{tournament.maxTeams}</div>
                        <small className="text-muted">Max</small>
                      </div>
                      <div className="col-4">
                        <div className="text-warning fw-bold">{tournament.entryFee ? `$${tournament.entryFee}` : 'Free'}</div>
                        <small className="text-muted">Entry Fee</small>
                      </div>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <small className="text-muted">Start Date</small>
                        <div className="fw-bold">{formatDate(tournament.startDate)}</div>
                      </div>
                      <div className="text-end">
                        <small className="text-muted">End Date</small>
                        <div className="fw-bold">{formatDate(tournament.endDate)}</div>
                      </div>
                    </div>
                    
                    {tournament.status === 'upcoming' && (
                      <div className="alert alert-info small mb-3">
                        <i className="bi bi-clock me-1"></i>
                        {getDaysUntil(tournament.startDate)} days until start
                      </div>
                    )}
                    
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <small className="text-muted">Organizer</small>
                        <div className="fw-bold">{tournament.organizer}</div>
                      </div>
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleViewTournament(tournament.id)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTournaments.length === 0 && (
            <div className="text-center py-5">
              <i className="bi bi-trophy display-1 text-muted"></i>
              <h4 className="mt-3">No tournaments found</h4>
              <p className="text-muted">Try adjusting your search or filters</p>
              <button 
                className="btn btn-primary"
                onClick={handleCreateTournament}
              >
                Create Your First Tournament
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 