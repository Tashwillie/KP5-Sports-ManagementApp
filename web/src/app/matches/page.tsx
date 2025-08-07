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
  Play,
  Square,
  Target
} from 'lucide-react';

// Define Match interface locally
interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  date: Date;
  time: string;
  venue: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  tournament?: string;
  referee?: string;
  notes?: string;
}

interface MatchWithStats extends Match {
  homeTeamId: string;
  awayTeamId: string;
  tournamentId?: string;
  refereeId?: string;
  attendance?: number;
  weather?: string;
}

export default function MatchesPage() {
  const router = useRouter();
  const { userData, loading: authLoading } = useFirebase();
  const [activeTab, setActiveTab] = useState('matches');

  // State
  const [matches, setMatches] = useState<MatchWithStats[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<MatchWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tournamentFilter, setTournamentFilter] = useState<string>('all');

  // Load matches
  useEffect(() => {
    if (!userData || authLoading) return;

    const loadMatches = async () => {
      try {
        setLoading(true);

        // Mock data - in real implementation, this would come from Firebase
        const mockMatches: MatchWithStats[] = [
          {
            id: '1',
            homeTeam: 'Thunder U12',
            awayTeam: 'Lightning U12',
            homeScore: 2,
            awayScore: 1,
            date: new Date('2024-01-15'),
            time: '14:00',
            venue: 'Central Stadium',
            status: 'completed',
            tournament: 'Spring League',
            referee: 'John Smith',
            homeTeamId: 'team1',
            awayTeamId: 'team2',
            tournamentId: 'tournament1',
            refereeId: 'referee1',
            attendance: 150,
            weather: 'Sunny',
          },
          {
            id: '2',
            homeTeam: 'Storm U14',
            awayTeam: 'Thunder U14',
            homeScore: 0,
            awayScore: 0,
            date: new Date('2024-01-20'),
            time: '16:30',
            venue: 'North Field',
            status: 'scheduled',
            tournament: 'Spring League',
            referee: 'Mike Johnson',
            homeTeamId: 'team3',
            awayTeamId: 'team1',
            tournamentId: 'tournament1',
            refereeId: 'referee2',
          },
          {
            id: '3',
            homeTeam: 'Lightning U16',
            awayTeam: 'Storm U16',
            homeScore: 3,
            awayScore: 2,
            date: new Date(),
            time: '15:00',
            venue: 'South Arena',
            status: 'live',
            tournament: 'Championship Cup',
            referee: 'Sarah Wilson',
            homeTeamId: 'team2',
            awayTeamId: 'team3',
            tournamentId: 'tournament2',
            refereeId: 'referee3',
            attendance: 200,
            weather: 'Cloudy',
          },
        ];

        setMatches(mockMatches);
        setFilteredMatches(mockMatches);
      } catch (error) {
        console.error('Error loading matches:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, [userData, authLoading]);

  // Filter matches
  useEffect(() => {
    let filtered = matches;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(match =>
        match.homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.awayTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.venue.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(match => match.status === statusFilter);
    }

    // Tournament filter
    if (tournamentFilter !== 'all') {
      filtered = filtered.filter(match => match.tournament === tournamentFilter);
    }

    setFilteredMatches(filtered);
  }, [matches, searchTerm, statusFilter, tournamentFilter]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'badge bg-secondary';
      case 'live':
        return 'badge bg-danger';
      case 'completed':
        return 'badge bg-success';
      case 'cancelled':
        return 'badge bg-warning';
      default:
        return 'badge bg-secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="h-4 w-4" />;
      case 'live':
        return <Play className="h-4 w-4" />;
      case 'completed':
        return <Square className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleCreateMatch = () => {
    router.push('/matches/create');
  };

  const handleViewMatch = (matchId: string) => {
    router.push(`/matches/${matchId}`);
  };

  const handleEditMatch = (matchId: string) => {
    router.push(`/matches/${matchId}/edit`);
  };

  const handleLiveMatch = (matchId: string) => {
    router.push(`/matches/${matchId}/live`);
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
          <p className="text-muted">Please sign in to view matches.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <Sidebar activeTab="matches" userData={userData} />

      {/* Main Content */}
      <div className="flex-grow-1 bg-light">
        {/* Top Header */}
        <div className="bg-white border-bottom p-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center">
                <h5 className="mb-0">Matches Management</h5>
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
              <button className="btn btn-sm" style={{backgroundColor: '#4169E1', borderColor: '#4169E1', color: 'white'}} onClick={handleCreateMatch}>
                <Plus className="h-4 w-4 me-1" />
                Create Match
              </button>
            </div>
          </div>
        </div>

        {/* Main Matches Content */}
        <div className="p-4">
          {/* Stats Cards */}
          <div className="row g-4 mb-4">
            <div className="col-md-6 col-lg-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="card-subtitle mb-2 text-muted">Total Matches</h6>
                      <h2 className="card-title mb-1 fw-bold" style={{color: '#4169E1'}}>{matches.length}</h2>
                      <small className="text-muted">Matches</small>
                    </div>
                    <Target className="h-6 w-6 text-muted" />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="card-subtitle mb-2 text-muted">Live Matches</h6>
                      <h2 className="card-title mb-1 fw-bold text-danger">{matches.filter(m => m.status === 'live').length}</h2>
                      <small className="text-muted">Currently Live</small>
                    </div>
                    <Play className="h-6 w-6 text-danger" />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="card-subtitle mb-2 text-muted">Scheduled</h6>
                      <h2 className="card-title mb-1 fw-bold text-warning">{matches.filter(m => m.status === 'scheduled').length}</h2>
                      <small className="text-muted">Upcoming</small>
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
                      <h6 className="card-subtitle mb-2 text-muted">Completed</h6>
                      <h2 className="card-title mb-1 fw-bold text-success">{matches.filter(m => m.status === 'completed').length}</h2>
                      <small className="text-muted">Finished</small>
                    </div>
                    <Square className="h-6 w-6 text-success" />
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
                      placeholder="Search matches..."
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
                    <option value="scheduled">Scheduled</option>
                    <option value="live">Live</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="col-md-6 col-lg-4">
                  <select 
                    className="form-select" 
                    value={tournamentFilter} 
                    onChange={(e) => setTournamentFilter(e.target.value)}
                  >
                    <option value="all">All Tournaments</option>
                    <option value="Spring League">Spring League</option>
                    <option value="Championship Cup">Championship Cup</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Matches Table */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent border-0">
              <h5 className="card-title mb-0">Matches ({filteredMatches.length})</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Teams</th>
                      <th>Score</th>
                      <th>Date & Time</th>
                      <th>Venue</th>
                      <th>Status</th>
                      <th>Tournament</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMatches.map((match) => (
                      <tr key={match.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                              <Target className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="fw-medium">{match.homeTeam}</div>
                              <small className="text-muted">vs {match.awayTeam}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="fw-bold">
                            {match.status === 'scheduled' ? 'TBD' : `${match.homeScore} - ${match.awayScore}`}
                          </div>
                        </td>
                        <td>
                          <div>
                            <div className="fw-medium">{formatDate(match.date)}</div>
                            <small className="text-muted">{match.time}</small>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <MapPin className="h-4 w-4 text-muted me-2" />
                            <span>{match.venue}</span>
                          </div>
                        </td>
                        <td>
                          <span className={getStatusBadgeClass(match.status)}>
                            {getStatusIcon(match.status)}
                            <span className="ms-1">{match.status}</span>
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <Trophy className="h-4 w-4 text-warning me-2" />
                            <span>{match.tournament || 'Friendly'}</span>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button 
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleViewMatch(match.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {match.status === 'live' && (
                              <button 
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleLiveMatch(match.id)}
                              >
                                <Play className="h-4 w-4" />
                              </button>
                            )}
                            <button 
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleEditMatch(match.id)}
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