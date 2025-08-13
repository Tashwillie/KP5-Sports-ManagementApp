'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { usePlayers } from '@/hooks/usePlayers';

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  age: number;
  position: string;
  jerseyNumber: number;
  teamId?: string;
  teamName?: string;
  clubId?: string;
  clubName?: string;
  status: 'active' | 'inactive' | 'injured' | 'suspended';
  level: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  height: number;
  weight: number;
  nationality: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalInfo?: string;
  photo?: string;
  createdAt: string;
  updatedAt: string;
}

interface PlayerWithStats extends Player {
  matchesPlayed: number;
  goalsScored: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
  rating: number;
}

export default function PlayersPage() {
  return (
    <ProtectedRoute>
      <PlayersContent />
    </ProtectedRoute>
  );
}

function PlayersContent() {
  const { players, loading: loadingData, error, refetch } = usePlayers();
  const [filteredPlayers, setFilteredPlayers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  // Load players (replace mock with API data)
  useEffect(() => {
    // When API players change, just mirror to filtered
    setFilteredPlayers(players as any[]);
  }, [players]);


  // Filter players based on search and filters
  useEffect(() => {
    let filtered = players;

    if (searchTerm) {
      filtered = filtered.filter(player =>
        (player as any).firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (player as any).lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (player as any).teamName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.displayName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPlayers(filtered);
  }, [players, searchTerm, statusFilter, positionFilter, levelFilter]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success';
      case 'inactive':
        return 'bg-secondary';
      case 'injured':
        return 'bg-warning';
      case 'suspended':
        return 'bg-danger';
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
      case 'injured':
        return 'Injured';
      case 'suspended':
        return 'Suspended';
      default:
        return status;
    }
  };

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

  const handleCreatePlayer = () => {
    window.location.href = '/players/create';
  };

  const handleViewPlayer = (playerId: string) => {
    window.location.href = `/players/${playerId}`;
  };

  const handleEditPlayer = (playerId: string) => {
    window.location.href = `/players/${playerId}/edit`;
  };

  const handleManagePlayer = (playerId: string) => {
    window.location.href = `/players/${playerId}/manage`;
  };

  if (loadingData) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading players...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <p className="text-danger mb-3">{error}</p>
          <button className="btn btn-primary" onClick={refetch}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <Sidebar activeTab="players" />

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
                <h5 className="mb-0">Players Management</h5>
                <small className="text-muted">
                  Manage player profiles and statistics
                </small>
              </div>
            </div>
            
            <div className="d-flex align-items-center gap-3">
              <button className="btn btn-sm" style={{backgroundColor: '#4169E1', borderColor: '#4169E1', color: 'white'}} onClick={handleCreatePlayer}>
                <i className="bi bi-plus me-1"></i>
                Add Player
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
                  placeholder="Search players..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="injured">Injured</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
              >
                <option value="all">All Positions</option>
                <option value="Forward">Forward</option>
                <option value="Midfielder">Midfielder</option>
                <option value="Defender">Defender</option>
                <option value="Goalkeeper">Goalkeeper</option>
              </select>
            </div>
            <div className="col-md-2">
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

          {/* Players Grid */}
          <div className="row g-4">
            {filteredPlayers.map((player) => (
              <div key={player.id} className="col-md-6 col-lg-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <span className={`badge ${getStatusBadgeClass('active')} me-2`}>
                          {getStatusLabel('active')}
                        </span>
                        <span className={`badge ${getLevelBadgeClass('beginner')}`}>
                          Beginner
                        </span>
                      </div>
                      <div className="dropdown">
                        <button className="btn btn-link text-muted p-0" data-bs-toggle="dropdown">
                          <i className="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul className="dropdown-menu">
                          <li><a className="dropdown-item" href="#" onClick={() => handleViewPlayer(player.id)}>
                            <i className="bi bi-eye me-2"></i>View
                          </a></li>
                          <li><a className="dropdown-item" href="#" onClick={() => handleEditPlayer(player.id)}>
                            <i className="bi bi-pencil me-2"></i>Edit
                          </a></li>
                          <li><a className="dropdown-item" href="#" onClick={() => handleManagePlayer(player.id)}>
                            <i className="bi bi-gear me-2"></i>Manage
                          </a></li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="text-center mb-3">
                      <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{width: '60px', height: '60px'}}>
                        <i className="bi bi-person text-primary fs-4"></i>
                      </div>
                      <h5 className="card-title mb-1">{player.displayName}</h5>
                      <p className="text-muted small mb-0">{player.email}</p>
                    </div>
                    
                    <div className="row text-center mb-3">
                      <div className="col-4">
                        <div className="text-primary fw-bold">{player.matchesPlayed}</div>
                        <small className="text-muted">Matches</small>
                      </div>
                      <div className="col-4">
                        <div className="text-success fw-bold">{player.goalsScored}</div>
                        <small className="text-muted">Goals</small>
                      </div>
                      <div className="col-4">
                        <div className="text-warning fw-bold">{player.rating}</div>
                        <small className="text-muted">Rating</small>
                      </div>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <small className="text-muted">Team</small>
                        <div className="fw-bold">{player.teamName || 'Unassigned'}</div>
                      </div>
                      <div className="text-end">
                        <small className="text-muted">Age</small>
                        <div className="fw-bold">{player.age}</div>
                      </div>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <small className="text-muted">Contact</small>
                        <div className="fw-bold">{player.email}</div>
                      </div>
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleViewPlayer(player.id)}
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPlayers.length === 0 && (
            <div className="text-center py-5">
              <i className="bi bi-people display-1 text-muted"></i>
              <h4 className="mt-3">No players found</h4>
              <p className="text-muted">Try adjusting your search or filters</p>
              <button 
                className="btn btn-primary"
                onClick={handleCreatePlayer}
              >
                Add Your First Player
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 