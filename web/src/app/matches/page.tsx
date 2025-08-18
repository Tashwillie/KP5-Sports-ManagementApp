'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useMatches } from '@/hooks/useMatches';

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  date: string;
  time: string;
  venue: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  tournament?: string;
  referee: string;
  createdAt: string;
  updatedAt: string;
}

interface MatchWithStats extends Match {
  homeTeamId: string;
  awayTeamId: string;
  tournamentId?: string;
  spectators: number;
  weather: string;
}

export default function MatchesPage() {
  return (
    <ProtectedRoute>
      <MatchesContent />
    </ProtectedRoute>
  );
}

function MatchesContent() {
  const { matches: apiMatches, loading: loadingData, error, refetch } = useMatches();
  const [filteredMatches, setFilteredMatches] = useState<MatchWithStats[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Transform API matches to match the interface (memoized to prevent infinite re-renders)
  const matches: MatchWithStats[] = useMemo(() => {
    if (!Array.isArray(apiMatches)) return [];
    
    return apiMatches.map(match => ({
      id: match.id,
      homeTeam: match.homeTeam?.name || 'Unknown Team',
      awayTeam: match.awayTeam?.name || 'Unknown Team',
      homeScore: match.homeScore || 0,
      awayScore: match.awayScore || 0,
      date: new Date(match.startTime).toISOString().split('T')[0],
      time: new Date(match.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      venue: match.location || 'Unknown Venue',
      status: match.status === 'SCHEDULED' ? 'scheduled' : 
              match.status === 'IN_PROGRESS' ? 'live' : 
              match.status === 'COMPLETED' ? 'completed' : 'cancelled',
      tournament: match.tournament?.name,
      referee: match.referee?.displayName || 'Unassigned',
      createdAt: match.createdAt,
      updatedAt: match.updatedAt,
      homeTeamId: match.homeTeamId,
      awayTeamId: match.awayTeamId,
      tournamentId: match.tournamentId,
      spectators: 0, // Not available in API
      weather: 'Unknown', // Not available in API
    }));
  }, [apiMatches]);

  // Filter matches based on search and filters
  useEffect(() => {
    let filtered = matches;

    if (searchTerm) {
      filtered = filtered.filter(match =>
        match.homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.awayTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.tournament?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(match => match.status === statusFilter);
    }

    if (dateFilter !== 'all') {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      filtered = filtered.filter(match => {
        const matchDate = new Date(match.date);
        switch (dateFilter) {
          case 'today':
            return matchDate.toDateString() === today.toDateString();
          case 'tomorrow':
            return matchDate.toDateString() === tomorrow.toDateString();
          case 'this-week':
            const weekStart = new Date(today);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            return matchDate >= weekStart && matchDate <= weekEnd;
          case 'upcoming':
            return matchDate > today;
          default:
            return true;
        }
      });
    }

    setFilteredMatches(filtered);
  }, [matches, searchTerm, statusFilter, dateFilter]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-primary';
      case 'live':
        return 'bg-success';
      case 'completed':
        return 'bg-secondary';
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleCreateMatch = () => {
    window.location.href = '/matches/create';
  };

  const handleViewMatch = (matchId: string) => {
    window.location.href = `/matches/${matchId}`;
  };

  const handleEditMatch = (matchId: string) => {
    window.location.href = `/matches/${matchId}/edit`;
  };

  const handleLiveMatch = (matchId: string) => {
    window.location.href = `/matches/${matchId}/live`;
  };

  if (loadingData) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Error loading matches</h4>
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
      <Sidebar activeTab="matches" />

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
                <h5 className="mb-0">Matches Management</h5>
                <small className="text-muted">
                  Schedule and manage matches
                </small>
              </div>
            </div>
            
            <div className="d-flex align-items-center gap-3">
              <button className="btn btn-sm" style={{backgroundColor: '#4169E1', borderColor: '#4169E1', color: 'white'}} onClick={handleCreateMatch}>
                <i className="bi bi-plus me-1"></i>
                Schedule Match
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
                  placeholder="Search matches..."
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
                <option value="scheduled">Scheduled</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="this-week">This Week</option>
                <option value="upcoming">Upcoming</option>
              </select>
            </div>
          </div>

          {/* Matches Grid */}
          <div className="row g-4">
            {filteredMatches.map((match) => (
              <div key={match.id} className="col-md-6 col-lg-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <span className={`badge ${getStatusBadgeClass(match.status)} me-2`}>
                          {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                        </span>
                        {match.status === 'live' && (
                          <span className="badge bg-danger">
                            <i className="bi bi-circle-fill me-1"></i>LIVE
                          </span>
                        )}
                      </div>
                      <div className="dropdown">
                        <button className="btn btn-link text-muted p-0" data-bs-toggle="dropdown">
                          <i className="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul className="dropdown-menu">
                          <li><a className="dropdown-item" href="#" onClick={() => handleViewMatch(match.id)}>
                            <i className="bi bi-eye me-2"></i>View
                          </a></li>
                          {match.status === 'live' && (
                            <li><a className="dropdown-item" href="#" onClick={() => handleLiveMatch(match.id)}>
                              <i className="bi bi-play-circle me-2"></i>Live Control
                            </a></li>
                          )}
                          <li><a className="dropdown-item" href="#" onClick={() => handleEditMatch(match.id)}>
                            <i className="bi bi-pencil me-2"></i>Edit
                          </a></li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="text-center mb-3">
                      <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{width: '60px', height: '60px'}}>
                        <i className="bi bi-calendar text-primary fs-4"></i>
                      </div>
                      <h5 className="card-title mb-1">{match.homeTeam} vs {match.awayTeam}</h5>
                      <p className="text-muted small mb-0">{match.tournament || 'Friendly Match'}</p>
                    </div>
                    
                    <div className="row text-center mb-3">
                      <div className="col-4">
                        <div className="text-primary fw-bold">{match.homeScore}</div>
                        <small className="text-muted">Home</small>
                      </div>
                      <div className="col-4">
                        <div className="text-success fw-bold">{match.awayScore}</div>
                        <small className="text-muted">Away</small>
                      </div>
                      <div className="col-4">
                        <div className="text-warning fw-bold">{match.spectators}</div>
                        <small className="text-muted">Spectators</small>
                      </div>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <small className="text-muted">Date & Time</small>
                        <div className="fw-bold">{formatDate(match.date)} • {match.time}</div>
                      </div>
                      <div className="text-end">
                        <small className="text-muted">Venue</small>
                        <div className="fw-bold">{match.venue}</div>
                      </div>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <small className="text-muted">Referee</small>
                        <div className="fw-bold">{match.referee}</div>
                      </div>
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleViewMatch(match.id)}
                      >
                        {match.status === 'live' ? 'Live View' : 'View Match'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredMatches.length === 0 && (
            <div className="text-center py-5">
              <i className="bi bi-calendar display-1 text-muted"></i>
              <h4 className="mt-3">No matches found</h4>
              <p className="text-muted">Try adjusting your search or filters</p>
              <button 
                className="btn btn-primary"
                onClick={handleCreateMatch}
              >
                Schedule Your First Match
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 