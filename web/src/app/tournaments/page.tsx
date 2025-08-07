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
  Clock,
  Target,
  Star,
  Users2
} from 'lucide-react';

// Define Tournament interface locally
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
  const router = useRouter();
  const { userData, loading: authLoading } = useFirebase();
  const [activeTab, setActiveTab] = useState('tournaments');

  // State
  const [tournaments, setTournaments] = useState<TournamentWithStats[]>([]);
  const [filteredTournaments, setFilteredTournaments] = useState<TournamentWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Load tournaments
  useEffect(() => {
    if (!userData || authLoading) return;

    const loadTournaments = async () => {
      try {
        setLoading(true);

        // Mock data - in real implementation, this would come from Firebase
        const mockTournaments: TournamentWithStats[] = [
          {
            id: '1',
            name: 'Spring League 2024',
            description: 'Annual spring soccer league for all age groups',
            startDate: new Date('2024-03-01'),
            endDate: new Date('2024-05-31'),
            status: 'active',
            type: 'league',
            maxTeams: 16,
            currentTeams: 12,
            venue: 'Central Stadium',
            prize: '$5,000',
            organizer: 'KP5 Academy',
            organizerId: 'org1',
            registrationDeadline: new Date('2024-02-15'),
            entryFee: 250,
          },
          {
            id: '2',
            name: 'Championship Cup',
            description: 'Elite tournament for top-performing teams',
            startDate: new Date('2024-06-15'),
            endDate: new Date('2024-07-15'),
            status: 'upcoming',
            type: 'cup',
            maxTeams: 8,
            currentTeams: 6,
            venue: 'National Arena',
            prize: '$10,000',
            organizer: 'Sports Federation',
            organizerId: 'org2',
            registrationDeadline: new Date('2024-05-30'),
            entryFee: 500,
          },
          {
            id: '3',
            name: 'Friendly Series',
            description: 'Casual tournament for skill development',
            startDate: new Date('2024-02-10'),
            endDate: new Date('2024-02-25'),
            status: 'completed',
            type: 'friendly',
            maxTeams: 12,
            currentTeams: 12,
            venue: 'Community Center',
            prize: '$1,000',
            organizer: 'Local Sports Club',
            organizerId: 'org3',
            registrationDeadline: new Date('2024-01-25'),
            entryFee: 100,
          },
          {
            id: '4',
            name: 'Regional Championship',
            description: 'Regional championship for state teams',
            startDate: new Date('2024-08-01'),
            endDate: new Date('2024-09-30'),
            status: 'upcoming',
            type: 'championship',
            maxTeams: 24,
            currentTeams: 18,
            venue: 'Regional Complex',
            prize: '$15,000',
            organizer: 'Regional Sports Council',
            organizerId: 'org4',
            registrationDeadline: new Date('2024-07-15'),
            entryFee: 750,
          },
        ];

        setTournaments(mockTournaments);
        setFilteredTournaments(mockTournaments);
      } catch (error) {
        console.error('Error loading tournaments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTournaments();
  }, [userData, authLoading]);

  // Filter tournaments
  useEffect(() => {
    let filtered = tournaments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(tournament =>
        tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tournament.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tournament.organizer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tournament => tournament.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(tournament => tournament.type === typeFilter);
    }

    setFilteredTournaments(filtered);
  }, [tournaments, searchTerm, statusFilter, typeFilter]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'badge bg-secondary';
      case 'active':
        return 'badge bg-success';
      case 'completed':
        return 'badge bg-info';
      case 'cancelled':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'league':
        return 'badge bg-primary';
      case 'cup':
        return 'badge bg-warning';
      case 'friendly':
        return 'badge bg-info';
      case 'championship':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
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
    router.push('/tournaments/create');
  };

  const handleViewTournament = (tournamentId: string) => {
    router.push(`/tournaments/${tournamentId}`);
  };

  const handleEditTournament = (tournamentId: string) => {
    router.push(`/tournaments/${tournamentId}/edit`);
  };

  const handleManageBrackets = (tournamentId: string) => {
    router.push(`/tournaments/${tournamentId}/brackets`);
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
              <div className="row g-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="col-md-6 col-lg-3">
                    <div className="card placeholder-glow">
                      <div className="card-body">
                        <div className="placeholder col-8"></div>
                        <div className="placeholder col-4"></div>
                      </div>
                    </div>
                  </div>
                ))}
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
          <p className="text-muted">Please sign in to view tournaments.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <Sidebar activeTab="tournaments" userData={userData} />

      {/* Main Content */}
      <div className="flex-grow-1 bg-light">
        {/* Top Header */}
        <div className="bg-white border-bottom p-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center">
                <h5 className="mb-0">Tournaments Management</h5>
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
              <button className="btn btn-sm" style={{backgroundColor: '#4169E1', borderColor: '#4169E1', color: 'white'}} onClick={handleCreateTournament}>
                <Plus className="h-4 w-4 me-1" />
                Create Tournament
              </button>
            </div>
          </div>
        </div>

        {/* Main Tournaments Content */}
        <div className="p-4">
          {/* Stats Cards */}
          <div className="row g-4 mb-4">
            <div className="col-md-6 col-lg-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="card-subtitle mb-2 text-muted">Total Tournaments</h6>
                      <h2 className="card-title mb-1 fw-bold" style={{color: '#4169E1'}}>{tournaments.length}</h2>
                      <small className="text-muted">Tournaments</small>
                    </div>
                    <Trophy className="h-6 w-6 text-muted" />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="card-subtitle mb-2 text-muted">Active Tournaments</h6>
                      <h2 className="card-title mb-1 fw-bold text-success">{tournaments.filter(t => t.status === 'active').length}</h2>
                      <small className="text-muted">Currently Running</small>
                    </div>
                    <Star className="h-6 w-6 text-success" />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="card-subtitle mb-2 text-muted">Upcoming</h6>
                      <h2 className="card-title mb-1 fw-bold text-warning">{tournaments.filter(t => t.status === 'upcoming').length}</h2>
                      <small className="text-muted">Scheduled</small>
                    </div>
                    <Clock className="h-6 w-6 text-warning" />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="card-subtitle mb-2 text-muted">Total Teams</h6>
                      <h2 className="card-title mb-1 fw-bold text-info">{tournaments.reduce((sum, t) => sum + t.currentTeams, 0)}</h2>
                      <small className="text-muted">Registered</small>
                    </div>
                    <Users2 className="h-6 w-6 text-info" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-transparent border-0">
              <h5 className="card-title mb-0">Filters</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6 col-lg-4">
                  <div className="position-relative">
                    <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 h-4 w-4 text-muted" />
                    <input
                      type="text"
                      className="form-control ps-5"
                      placeholder="Search tournaments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-6 col-lg-4">
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
                <div className="col-md-6 col-lg-4">
                  <select 
                    className="form-select" 
                    value={typeFilter} 
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="league">League</option>
                    <option value="cup">Cup</option>
                    <option value="friendly">Friendly</option>
                    <option value="championship">Championship</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Tournaments Table */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent border-0">
              <h5 className="card-title mb-0">Tournaments ({filteredTournaments.length})</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Tournament</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Teams</th>
                      <th>Dates</th>
                      <th>Prize</th>
                      <th>Organizer</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTournaments.map((tournament) => (
                      <tr key={tournament.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="bg-warning bg-opacity-10 rounded-circle p-2 me-3">
                              <Trophy className="h-4 w-4 text-warning" />
                            </div>
                            <div>
                              <div className="fw-medium">{tournament.name}</div>
                              <small className="text-muted">{tournament.description}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={getTypeBadgeClass(tournament.type)}>
                            {tournament.type}
                          </span>
                        </td>
                        <td>
                          <span className={getStatusBadgeClass(tournament.status)}>
                            {tournament.status}
                          </span>
                        </td>
                        <td>
                          <div>
                            <div className="fw-medium">{tournament.currentTeams}/{tournament.maxTeams}</div>
                            <small className="text-muted">Teams</small>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div className="fw-medium">{formatDate(tournament.startDate)}</div>
                            <small className="text-muted">to {formatDate(tournament.endDate)}</small>
                          </div>
                        </td>
                        <td>
                          <div className="fw-medium text-success">
                            {tournament.prize || 'N/A'}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <User className="h-4 w-4 text-muted me-2" />
                            <span>{tournament.organizer}</span>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button 
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleViewTournament(tournament.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {tournament.status === 'active' && (
                              <button 
                                className="btn btn-sm btn-outline-success"
                                onClick={() => handleManageBrackets(tournament.id)}
                              >
                                <Trophy className="h-4 w-4" />
                              </button>
                            )}
                            <button 
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleEditTournament(tournament.id)}
                            >
                              <Edit className="h-4 w-4" />
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
        </div>
      </div>
    </div>
  );
} 