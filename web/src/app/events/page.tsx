'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/contexts/FirebaseContext';
import Sidebar from '@/components/layout/Sidebar';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Users, 
  Trophy, 
  Calendar,
  MapPin,
  Shield,
  Eye,
  Bell,
  Grid3X3,
  MessageCircle,
  ChevronDown,
  MoreVertical,
  Home,
  Folder,
  GraduationCap,
  ShoppingCart,
  Cloud,
  HelpCircle,
  Mail,
  Flag,
  Maximize2,
  User,
  CheckCircle,
  AlertCircle,
  XCircle,
  GitBranch,
  Award,
  Zap,
  Heart,
  DollarSign,
  FileText,
  ImageIcon,
  BarChart3,
  Settings,
  TrendingUp,
  ArrowLeft,
  Save,
  Clock,
  Target,
  Star,
  Users2,
  Play,
  Pause,
  Stop
} from 'lucide-react';
import Link from 'next/link';

interface Event {
  id: string;
  title: string;
  description: string;
  type: 'practice' | 'game' | 'meeting' | 'tournament' | 'training' | 'other';
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  organizer: string;
  organizerId: string;
  maxParticipants: number;
  currentParticipants: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface EventWithStats extends Event {
  participants: string[];
  teams: string[];
}

export default function EventsPage() {
  const router = useRouter();
  const { userData, loading: authLoading } = useFirebase();
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState<EventWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Mock data for events
  const mockEvents: EventWithStats[] = [
    {
      id: '1',
      title: 'Team Practice Session',
      description: 'Regular team practice focusing on passing and shooting drills',
      type: 'practice',
      startDate: '2024-02-15',
      endDate: '2024-02-15',
      startTime: '14:00',
      endTime: '16:00',
      venue: 'Central Stadium',
      organizer: 'Coach Johnson',
      organizerId: 'coach1',
      maxParticipants: 25,
      currentParticipants: 18,
      status: 'upcoming',
      isPublic: false,
      participants: ['player1', 'player2', 'player3'],
      teams: ['team1'],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      title: 'Friendly Match vs Eagles',
      description: 'Friendly match against Eagles FC to test new formations',
      type: 'game',
      startDate: '2024-02-18',
      endDate: '2024-02-18',
      startTime: '15:30',
      endTime: '17:30',
      venue: 'Sports Complex',
      organizer: 'Team Manager',
      organizerId: 'manager1',
      maxParticipants: 30,
      currentParticipants: 22,
      status: 'upcoming',
      isPublic: true,
      participants: ['player1', 'player2', 'player4', 'player5'],
      teams: ['team1', 'team2'],
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20')
    },
    {
      id: '3',
      title: 'Team Strategy Meeting',
      description: 'Pre-match strategy discussion and team briefing',
      type: 'meeting',
      startDate: '2024-02-17',
      endDate: '2024-02-17',
      startTime: '19:00',
      endTime: '20:00',
      venue: 'Club House',
      organizer: 'Coach Johnson',
      organizerId: 'coach1',
      maxParticipants: 20,
      currentParticipants: 15,
      status: 'upcoming',
      isPublic: false,
      participants: ['player1', 'player2', 'player3'],
      teams: ['team1'],
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date('2024-01-18')
    },
    {
      id: '4',
      title: 'Fitness Training',
      description: 'Intensive fitness and conditioning session',
      type: 'training',
      startDate: '2024-02-14',
      endDate: '2024-02-14',
      startTime: '06:00',
      endTime: '08:00',
      venue: 'Training Ground',
      organizer: 'Fitness Coach',
      organizerId: 'fitness1',
      maxParticipants: 30,
      currentParticipants: 25,
      status: 'ongoing',
      isPublic: true,
      participants: ['player1', 'player2', 'player3', 'player4'],
      teams: ['team1'],
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10')
    },
    {
      id: '5',
      title: 'Tournament Final',
      description: 'Championship final match of the season',
      type: 'tournament',
      startDate: '2024-02-25',
      endDate: '2024-02-25',
      startTime: '16:00',
      endTime: '18:00',
      venue: 'National Stadium',
      organizer: 'League Manager',
      organizerId: 'league1',
      maxParticipants: 50,
      currentParticipants: 45,
      status: 'upcoming',
      isPublic: true,
      participants: ['player1', 'player2', 'player3', 'player4', 'player5'],
      teams: ['team1', 'team2', 'team3'],
      createdAt: new Date('2024-01-25'),
      updatedAt: new Date('2024-01-25')
    }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchEvents = async () => {
      setLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEvents(mockEvents);
      setLoading(false);
    };

    fetchEvents();
  }, []);

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
        return 'bg-primary';
      case 'tournament':
        return 'bg-success';
      case 'training':
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
      default:
        return 'Other';
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.venue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesType = typeFilter === 'all' || event.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleCreateEvent = () => {
    router.push('/events/create');
  };

  const handleViewEvent = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const handleEditEvent = (eventId: string) => {
    router.push(`/events/${eventId}/edit`);
  };

  const handleManageEvent = (eventId: string) => {
    router.push(`/events/${eventId}/manage`);
  };

  if (authLoading || loading) {
    return (
      <div className="d-flex">
        {/* Sidebar Skeleton */}
        <div className="bg-white border-end" style={{width: '280px', minHeight: '100vh'}}>
          <div className="p-3">
            <div className="placeholder-glow">
              <div className="placeholder col-8 mb-4"></div>
              <div className="placeholder col-6 mb-3"></div>
              <div className="placeholder col-10 mb-2"></div>
              <div className="placeholder col-8 mb-2"></div>
            </div>
          </div>
        </div>
        
        {/* Main Content Skeleton */}
        <div className="flex-grow-1 bg-light">
          <div className="p-4">
            <div className="placeholder-glow">
              <div className="placeholder col-4 mb-4"></div>
              <div className="row g-4 mb-4">
                <div className="col-md-3">
                  <div className="card placeholder-glow">
                    <div className="card-body">
                      <div className="placeholder col-8 mb-2"></div>
                      <div className="placeholder col-4"></div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card placeholder-glow">
                    <div className="card-body">
                      <div className="placeholder col-8 mb-2"></div>
                      <div className="placeholder col-4"></div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card placeholder-glow">
                    <div className="card-body">
                      <div className="placeholder col-8 mb-2"></div>
                      <div className="placeholder col-4"></div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card placeholder-glow">
                    <div className="card-body">
                      <div className="placeholder col-8 mb-2"></div>
                      <div className="placeholder col-4"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card placeholder-glow">
                <div className="card-body">
                  <div className="placeholder col-8 mb-3"></div>
                  <div className="placeholder col-6 mb-2"></div>
                  <div className="placeholder col-10 mb-2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h2 className="h2 fw-bold text-dark mb-3">Access Denied</h2>
          <p className="text-muted mb-4">Please sign in to view events.</p>
          <Link href="/firebase-test" className="btn" style={{backgroundColor: '#4169E1', borderColor: '#4169E1', color: 'white'}}>
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <Sidebar activeTab="events" userData={userData} />

      {/* Main Content */}
      <div className="flex-grow-1 bg-light">
        {/* Top Header */}
        <div className="bg-white border-bottom p-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center">
                <h5 className="mb-0">Events Management</h5>
              </div>
            </div>
            
            <div className="d-flex align-items-center gap-3">
              <button className="btn btn-link text-muted p-1">
                <Flag className="h-4 w-4" />
              </button>
              <button className="btn btn-link text-muted p-1">
                <Maximize2 className="h-4 w-4" />
              </button>
              <button className="btn btn-link text-muted p-1">
                <Search className="h-4 w-4" />
              </button>
              <button className="btn btn-link text-muted p-1">
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button className="btn btn-link text-muted p-1 position-relative">
                <Bell className="h-4 w-4" />
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill" style={{fontSize: '0.6rem', backgroundColor: '#4169E1'}}>5</span>
              </button>
              <button className="btn btn-link text-muted p-1">
                <MessageCircle className="h-4 w-4" />
              </button>
              <button 
                onClick={handleCreateEvent}
                className="btn btn-sm d-flex align-items-center"
                style={{backgroundColor: '#4169E1', borderColor: '#4169E1', color: 'white'}}
              >
                <Plus className="h-4 w-4 me-1" />
                Create Event
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4">
          {/* Stats Cards */}
          <div className="row g-4 mb-4">
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle p-3 me-3" style={{backgroundColor: '#4169E1', opacity: 0.1}}>
                      <Calendar className="h-5 w-5" style={{color: '#4169E1'}} />
                    </div>
                    <div>
                      <h6 className="card-title mb-1">Total Events</h6>
                      <h4 className="mb-0 fw-bold">{events.length}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle p-3 me-3" style={{backgroundColor: '#28a745', opacity: 0.1}}>
                      <Play className="h-5 w-5" style={{color: '#28a745'}} />
                    </div>
                    <div>
                      <h6 className="card-title mb-1">Ongoing Events</h6>
                      <h4 className="mb-0 fw-bold">{events.filter(e => e.status === 'ongoing').length}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle p-3 me-3" style={{backgroundColor: '#ffc107', opacity: 0.1}}>
                      <Clock className="h-5 w-5" style={{color: '#ffc107'}} />
                    </div>
                    <div>
                      <h6 className="card-title mb-1">Upcoming Events</h6>
                      <h4 className="mb-0 fw-bold">{events.filter(e => e.status === 'upcoming').length}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle p-3 me-3" style={{backgroundColor: '#6c757d', opacity: 0.1}}>
                      <Users2 className="h-5 w-5" style={{color: '#6c757d'}} />
                    </div>
                    <div>
                      <h6 className="card-title mb-1">Total Participants</h6>
                      <h4 className="mb-0 fw-bold">{events.reduce((sum, event) => sum + event.currentParticipants, 0)}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label htmlFor="search" className="form-label fw-medium">Search Events</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <Search className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      id="search"
                      className="form-control"
                      placeholder="Search by title, description, or venue..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <label htmlFor="statusFilter" className="form-label fw-medium">Status</label>
                  <select
                    id="statusFilter"
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
                  <label htmlFor="typeFilter" className="form-label fw-medium">Type</label>
                  <select
                    id="typeFilter"
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
                <div className="col-md-2 d-flex align-items-end">
                  <button className="btn btn-outline-secondary w-100">
                    <Filter className="h-4 w-4 me-1" />
                    Filter
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Events Table */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent border-0">
              <h6 className="card-title mb-0">Events List</h6>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="border-0">Event</th>
                      <th className="border-0">Type</th>
                      <th className="border-0">Date & Time</th>
                      <th className="border-0">Venue</th>
                      <th className="border-0">Participants</th>
                      <th className="border-0">Status</th>
                      <th className="border-0">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.map((event) => (
                      <tr key={event.id}>
                        <td>
                          <div>
                            <div className="fw-medium text-dark">{event.title}</div>
                            <small className="text-muted">{event.description.substring(0, 50)}...</small>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${getTypeBadgeClass(event.type)}`}>
                            {getTypeLabel(event.type)}
                          </span>
                        </td>
                        <td>
                          <div>
                            <div className="fw-medium">{new Date(event.startDate).toLocaleDateString()}</div>
                            <small className="text-muted">{event.startTime} - {event.endTime}</small>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <MapPin className="h-4 w-4 text-muted me-1" />
                            <span>{event.venue}</span>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div className="fw-medium">{event.currentParticipants}/{event.maxParticipants}</div>
                            <div className="progress" style={{height: '4px'}}>
                              <div 
                                className="progress-bar" 
                                style={{
                                  width: `${(event.currentParticipants / event.maxParticipants) * 100}%`,
                                  backgroundColor: '#4169E1'
                                }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(event.status)}`}>
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <button
                              onClick={() => handleViewEvent(event.id)}
                              className="btn btn-sm btn-outline-secondary"
                              title="View Event"
                            >
                              <Eye className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleEditEvent(event.id)}
                              className="btn btn-sm btn-outline-primary"
                              title="Edit Event"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleManageEvent(event.id)}
                              className="btn btn-sm btn-outline-success"
                              title="Manage Event"
                            >
                              <Settings className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredEvents.length === 0 && (
                <div className="text-center py-5">
                  <Calendar className="h-12 w-12 text-muted mb-3" />
                  <h6 className="text-muted">No events found</h6>
                  <p className="text-muted mb-3">Try adjusting your search or filters</p>
                  <button 
                    onClick={handleCreateEvent}
                    className="btn btn-sm"
                    style={{backgroundColor: '#4169E1', borderColor: '#4169E1', color: 'white'}}
                  >
                    <Plus className="h-4 w-4 me-1" />
                    Create First Event
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 