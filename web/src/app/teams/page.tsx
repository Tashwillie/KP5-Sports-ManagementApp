'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useTeams } from '@/hooks/useTeams';

interface Team {
  id: string;
  name: string;
  sport: string;
  ageGroup: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  coach: string;
  players: number;
  maxPlayers: number;
  status: 'active' | 'inactive' | 'training';
  createdAt: string;
  updatedAt: string;
}

interface TeamWithStats extends Team {
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  goalsScored: number;
  goalsConceded: number;
}

export default function TeamsPage() {
  return (
    <ProtectedRoute>
      <TeamsContent />
    </ProtectedRoute>
  );
}

function TeamsContent() {
  const { teams, loading: loadingData, error, refetch } = useTeams();
  const [filteredTeams, setFilteredTeams] = useState<TeamWithStats[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sportFilter, setSportFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  // Filter teams based on search and filters
  useEffect(() => {
    let filtered = teams;

    if (searchTerm) {
      filtered = filtered.filter(team =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.coach.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.sport.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sportFilter !== 'all') {
      filtered = filtered.filter(team => team.sport === sportFilter);
    }

    if (levelFilter !== 'all') {
      filtered = filtered.filter(team => team.level === levelFilter);
    }

    setFilteredTeams(filtered);
  }, [teams, searchTerm, sportFilter, levelFilter]);

  const getLevelBadgeClass = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-info';
      case 'intermediate':
        return 'bg-primary';
      case 'advanced':
        return 'bg-warning';
      case 'elite':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  const getAgeGroupDisplay = (ageGroup: string) => {
    return ageGroup.replace('U', 'Under ');
  };

  const handleCreateTeam = () => {
    window.location.href = '/teams/create';
  };

  const handleViewTeam = (teamId: string) => {
    window.location.href = `/teams/${teamId}`;
  };

  const handleEditTeam = (teamId: string) => {
    window.location.href = `/teams/${teamId}/edit`;
  };

  const handleManageTeam = (teamId: string) => {
    window.location.href = `/teams/${teamId}/manage`;
  };

  if (loadingData) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading teams...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Error loading teams</h4>
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
      <Sidebar activeTab="teams" />

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
                <h5 className="mb-0">Teams Management</h5>
                <small className="text-muted">
                  Manage teams and rosters
                </small>
              </div>
            </div>
            
            <div className="d-flex align-items-center gap-3">
              <button className="btn btn-sm" style={{backgroundColor: '#4169E1', borderColor: '#4169E1', color: 'white'}} onClick={handleCreateTeam}>
                <i className="bi bi-plus me-1"></i>
                Create Team
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
                  placeholder="Search teams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
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
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="elite">Elite</option>
              </select>
            </div>
          </div>

          {/* Teams Grid */}
          <div className="row g-4">
            {filteredTeams.map((team) => (
              <div key={team.id} className="col-md-6 col-lg-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <span className={`badge ${getLevelBadgeClass(team.level)} me-2`}>
                          {team.level.charAt(0).toUpperCase() + team.level.slice(1)}
                        </span>
                        <span className="badge bg-secondary">
                          {team.status.charAt(0).toUpperCase() + team.status.slice(1)}
                        </span>
                      </div>
                      <div className="dropdown">
                        <button className="btn btn-link text-muted p-0" data-bs-toggle="dropdown">
                          <i className="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul className="dropdown-menu">
                          <li><a className="dropdown-item" href="#" onClick={() => handleViewTeam(team.id)}>
                            <i className="bi bi-eye me-2"></i>View
                          </a></li>
                          <li><a className="dropdown-item" href="#" onClick={() => handleEditTeam(team.id)}>
                            <i className="bi bi-pencil me-2"></i>Edit
                          </a></li>
                          <li><a className="dropdown-item" href="#" onClick={() => handleManageTeam(team.id)}>
                            <i className="bi bi-gear me-2"></i>Manage
                          </a></li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="text-center mb-3">
                      <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{width: '60px', height: '60px'}}>
                        <i className="bi bi-people text-primary fs-4"></i>
                      </div>
                      <h5 className="card-title mb-1">{team.name}</h5>
                      <p className="text-muted small mb-0">{team.sport} • {getAgeGroupDisplay(team.ageGroup)}</p>
                    </div>
                    
                    <div className="row text-center mb-3">
                      <div className="col-4">
                        <div className="text-primary fw-bold">{team.players}</div>
                        <small className="text-muted">Players</small>
                      </div>
                      <div className="col-4">
                        <div className="text-success fw-bold">{team.wins}</div>
                        <small className="text-muted">Wins</small>
                      </div>
                      <div className="col-4">
                        <div className="text-warning fw-bold">{team.matchesPlayed}</div>
                        <small className="text-muted">Matches</small>
                      </div>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <small className="text-muted">Coach</small>
                        <div className="fw-bold">{team.coach}</div>
                      </div>
                      <div className="text-end">
                        <small className="text-muted">Win Rate</small>
                        <div className="fw-bold">{team.matchesPlayed > 0 ? Math.round((team.wins / team.matchesPlayed) * 100) : 0}%</div>
                      </div>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <small className="text-muted">Goals</small>
                        <div className="fw-bold">{team.goalsScored} - {team.goalsConceded}</div>
                      </div>
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleViewTeam(team.id)}
                      >
                        View Team
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTeams.length === 0 && (
            <div className="text-center py-5">
              <i className="bi bi-people display-1 text-muted"></i>
              <h4 className="mt-3">No teams found</h4>
              <p className="text-muted">Try adjusting your search or filters</p>
              <button 
                className="btn btn-primary"
                onClick={handleCreateTeam}
              >
                Create Your First Team
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 