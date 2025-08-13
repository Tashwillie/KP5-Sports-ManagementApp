'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useEvents } from '@/hooks/useEvents';

type UiStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
type UiType = 'practice' | 'game' | 'meeting' | 'tournament' | 'training' | 'other';

export default function EventsPage() {
  return (
    <ProtectedRoute>
      <EventsContent />
    </ProtectedRoute>
  );
}

function EventsContent() {
  const { events: apiEvents, loading: loadingData, error, refetch } = useEvents();
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Transform API events to UI model
  const events = apiEvents.map(e => {
    const start = new Date(e.startTime);
    const end = new Date(e.endTime);
    const now = new Date();
    let status: UiStatus = 'upcoming';
    if (end < now) status = 'completed';
    else if (start <= now && end >= now) status = 'ongoing';
    else status = 'upcoming';

    const typeMap: Record<string, UiType> = {
      PRACTICE: 'practice',
      GAME: 'game',
      MEETING: 'meeting',
      TOURNAMENT: 'tournament',
      TRAINING: 'training',
      OTHER: 'other',
    };

    const uiType: UiType = typeMap[(e.type || 'OTHER').toString().toUpperCase()] || 'other';

    return {
      id: e.id,
      title: e.title,
      description: e.description || '',
      type: uiType,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      startTime: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      endTime: end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      venue: e.location || '',
      organizer: e.club?.name || e.team?.name || 'Organizer',
      organizerId: e.clubId || e.teamId || '',
      maxParticipants: e.participantsCount ?? 0,
      currentParticipants: e.participantsCount ?? 0,
      status,
      isPublic: true,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      participants: (e.participants || []).map((p: any) => p.user?.id),
      teams: e.team ? [e.team.id] : [],
    };
  });

  // Filter events based on search and filters
  useEffect(() => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => event.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(event => event.type === typeFilter);
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, statusFilter, typeFilter]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-primary';
      case 'ongoing':
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
      case 'practice':
        return 'bg-info';
      case 'game':
        return 'bg-warning';
      case 'meeting':
        return 'bg-secondary';
      case 'tournament':
        return 'bg-danger';
      case 'training':
        return 'bg-success';
      case 'other':
        return 'bg-dark';
      default:
        return 'bg-secondary';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'practice':
        return 'Practice';
      case 'game':
        return 'Game';
      case 'meeting':
        return 'Meeting';
      case 'tournament':
        return 'Tournament';
      case 'training':
        return 'Training';
      case 'other':
        return 'Other';
      default:
        return type;
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

  const handleCreateEvent = () => {
    window.location.href = '/events/create';
  };

  const handleViewEvent = (eventId: string) => {
    window.location.href = `/events/${eventId}`;
  };

  const handleEditEvent = (eventId: string) => {
    window.location.href = `/events/${eventId}/edit`;
  };

  const handleManageEvent = (eventId: string) => {
    window.location.href = `/events/${eventId}/manage`;
  };

  if (loadingData) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading events...</p>
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
      <Sidebar activeTab="events" />

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
                <h5 className="mb-0">Events Management</h5>
                <small className="text-muted">
                  Schedule and manage events and activities
                </small>
              </div>
            </div>
            
            <div className="d-flex align-items-center gap-3">
              <button className="btn btn-sm" style={{backgroundColor: '#4169E1', borderColor: '#4169E1', color: 'white'}} onClick={handleCreateEvent}>
                <i className="bi bi-plus me-1"></i>
                Create Event
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
                  placeholder="Search events..."
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
                <option value="ongoing">Ongoing</option>
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
                <option value="practice">Practice</option>
                <option value="game">Game</option>
                <option value="meeting">Meeting</option>
                <option value="tournament">Tournament</option>
                <option value="training">Training</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Events Grid */}
          <div className="row g-4">
            {filteredEvents.map((event) => (
              <div key={event.id} className="col-md-6 col-lg-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <span className={`badge ${getStatusBadgeClass(event.status)} me-2`}>
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </span>
                        <span className={`badge ${getTypeBadgeClass(event.type)}`}>
                          {getTypeLabel(event.type)}
                        </span>
                      </div>
                      <div className="dropdown">
                        <button className="btn btn-link text-muted p-0" data-bs-toggle="dropdown">
                          <i className="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul className="dropdown-menu">
                          <li><a className="dropdown-item" href="#" onClick={() => handleViewEvent(event.id)}>
                            <i className="bi bi-eye me-2"></i>View
                          </a></li>
                          <li><a className="dropdown-item" href="#" onClick={() => handleEditEvent(event.id)}>
                            <i className="bi bi-pencil me-2"></i>Edit
                          </a></li>
                          <li><a className="dropdown-item" href="#" onClick={() => handleManageEvent(event.id)}>
                            <i className="bi bi-gear me-2"></i>Manage
                          </a></li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="text-center mb-3">
                      <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{width: '60px', height: '60px'}}>
                        <i className="bi bi-calendar-event text-primary fs-4"></i>
                      </div>
                      <h5 className="card-title mb-2">{event.title}</h5>
                      <p className="text-muted small mb-3">{event.description}</p>
                    </div>
                    
                    <div className="row text-center mb-3">
                      <div className="col-4">
                        <div className="text-primary fw-bold">{event.currentParticipants}</div>
                        <small className="text-muted">Attending</small>
                      </div>
                      <div className="col-4">
                        <div className="text-success fw-bold">{event.maxParticipants}</div>
                        <small className="text-muted">Max</small>
                      </div>
                      <div className="col-4">
                        <div className="text-warning fw-bold">{event.teams.length}</div>
                        <small className="text-muted">Teams</small>
                      </div>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <small className="text-muted">Date</small>
                        <div className="fw-bold">{formatDate(event.startDate)}</div>
                      </div>
                      <div className="text-end">
                        <small className="text-muted">Time</small>
                        <div className="fw-bold">{event.startTime} - {event.endTime}</div>
                      </div>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <small className="text-muted">Venue</small>
                        <div className="fw-bold">{event.venue}</div>
                      </div>
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleViewEvent(event.id)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-5">
              <i className="bi bi-calendar-event display-1 text-muted"></i>
              <h4 className="mt-3">No events found</h4>
              <p className="text-muted">Try adjusting your search or filters</p>
              <button 
                className="btn btn-primary"
                onClick={handleCreateEvent}
              >
                Create Your First Event
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 