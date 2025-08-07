'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/contexts/FirebaseContext';
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
  Stop,
  Crown
} from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';

interface League {
  id: string;
  name: string;
  description: string;
  season: string;
  startDate: string;
  endDate: string;
  maxTeams: number;
  currentTeams: number;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  format: 'round_robin' | 'knockout' | 'group_stage' | 'mixed';
  organizer: string;
  organizerId: string;
  prizePool?: string;
  entryFee?: number;
  entryFeeCurrency: string;
  rules?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface LeagueWithStats extends League {
  teams: string[];
  matches: string[];
  standings: any[];
}

export default function LeaguesPage() {
  const router = useRouter();
  const { userData, loading: authLoading } = useFirebase();
  const [activeTab, setActiveTab] = useState('leagues');
  const [leagues, setLeagues] = useState<LeagueWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formatFilter, setFormatFilter] = useState('all');

  // Mock data for leagues
  const mockLeagues: LeagueWithStats[] = [
    {
      id: '1',
      name: 'Premier League 2024',
      description: 'Top-tier competitive league featuring the best teams in the region',
      season: '2024',
      startDate: '2024-03-01',
      endDate: '2024-08-31',
      maxTeams: 16,
      currentTeams: 12,
      status: 'active',
      format: 'round_robin',
      organizer: 'League Manager',
      organizerId: 'manager1',
      prizePool: '$50,000',
      entryFee: 500,
      entryFeeCurrency: 'USD',
      rules: 'Standard FIFA rules apply with league-specific modifications',
      isPublic: true,
      teams: ['team1', 'team2', 'team3', 'team4'],
      matches: ['match1', 'match2', 'match3'],
      standings: [],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'Youth Development League',
      description: 'Development league for young players under 18 years old',
      season: '2024',
      startDate: '2024-04-01',
      endDate: '2024-07-31',
      maxTeams: 12,
      currentTeams: 8,
      status: 'upcoming',
      format: 'group_stage',
      organizer: 'Youth Coordinator',
      organizerId: 'youth1',
      prizePool: '$10,000',
      entryFee: 200,
      entryFeeCurrency: 'USD',
      rules: 'Modified rules for youth development with focus on skill building',
      isPublic: true,
      teams: ['team5', 'team6', 'team7'],
      matches: [],
      standings: [],
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01')
    },
    {
      id: '3',
      name: 'Amateur Cup',
      description: 'Single elimination cup tournament for amateur teams',
      season: '2024',
      startDate: '2024-05-15',
      endDate: '2024-06-30',
      maxTeams: 32,
      currentTeams: 24,
      status: 'upcoming',
      format: 'knockout',
      organizer: 'Cup Organizer',
      organizerId: 'cup1',
      prizePool: '$25,000',
      entryFee: 300,
      entryFeeCurrency: 'USD',
      rules: 'Single elimination knockout format with consolation matches',
      isPublic: true,
      teams: ['team8', 'team9', 'team10', 'team11'],
      matches: [],
      standings: [],
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date('2024-02-15')
    },
    {
      id: '4',
      name: 'Corporate League',
      description: 'League for corporate teams and company-sponsored clubs',
      season: '2024',
      startDate: '2024-02-01',
      endDate: '2024-05-31',
      maxTeams: 8,
      currentTeams: 6,
      status: 'active',
      format: 'mixed',
      organizer: 'Corporate Sports',
      organizerId: 'corp1',
      prizePool: '$15,000',
      entryFee: 1000,
      entryFeeCurrency: 'USD',
      rules: 'Corporate league rules with modified scheduling for work commitments',
      isPublic: false,
      teams: ['team12', 'team13'],
      matches: ['match4', 'match5'],
      standings: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: '5',
      name: 'Regional Championship',
      description: 'Regional championship featuring teams from multiple districts',
      season: '2024',
      startDate: '2024-06-01',
      endDate: '2024-09-30',
      maxTeams: 20,
      currentTeams: 18,
      status: 'upcoming',
      format: 'group_stage',
      organizer: 'Regional Sports Council',
      organizerId: 'regional1',
      prizePool: '$75,000',
      entryFee: 750,
      entryFeeCurrency: 'USD',
      rules: 'Regional championship format with group stage and knockout rounds',
      isPublic: true,
      teams: ['team14', 'team15', 'team16', 'team17'],
      matches: [],
      standings: [],
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-03-01')
    }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchLeagues = async () => {
      setLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLeagues(mockLeagues);
      setLoading(false);
    };

    fetchLeagues();
  }, []);

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

  const getFormatBadgeClass = (format: string) => {
    switch (format) {
      case 'round_robin':
        return 'bg-info';
      case 'knockout':
        return 'bg-warning';
      case 'group_stage':
        return 'bg-primary';
      case 'mixed':
        return 'bg-dark';
      default:
        return 'bg-secondary';
    }
  };

  const getFormatLabel = (format: string) => {
    switch (format) {
      case 'round_robin':
        return 'Round Robin';
      case 'knockout':
        return 'Knockout';
      case 'group_stage':
        return 'Group Stage';
      case 'mixed':
        return 'Mixed';
      default:
        return 'Other';
    }
  };

  const filteredLeagues = leagues.filter(league => {
    const matchesSearch = league.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         league.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || league.status === statusFilter;
    const matchesFormat = formatFilter === 'all' || league.format === formatFilter;
    
    return matchesSearch && matchesStatus && matchesFormat;
  });

  const handleCreateLeague = () => {
    router.push('/leagues/create');
  };

  const handleViewLeague = (leagueId: string) => {
    router.push(`/leagues/${leagueId}`);
  };

  const handleEditLeague = (leagueId: string) => {
    router.push(`/leagues/${leagueId}/edit`);
  };

  const handleManageStandings = (leagueId: string) => {
    router.push(`/leagues/${leagueId}/standings`);
  };

  const handleManageBrackets = (leagueId: string) => {
    router.push(`/leagues/${leagueId}/brackets`);
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
          <p className="text-muted mb-4">Please sign in to view leagues.</p>
          <Link href="/firebase-test" className="btn" style={{backgroundColor: '#4169E1', borderColor: '#4169E1', color: 'white'}}>
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <Sidebar activeTab="leagues" userData={userData} />

      {/* Main Content */}
      <div className="flex-grow-1 bg-light">
        {/* Top Header */}
        <div className="bg-white border-bottom p-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center">
                <h5 className="mb-0">Leagues Management</h5>
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
                onClick={handleCreateLeague}
                className="btn btn-sm d-flex align-items-center"
                style={{backgroundColor: '#4169E1', borderColor: '#4169E1', color: 'white'}}
              >
                <Plus className="h-4 w-4 me-1" />
                Create League
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
                      <Trophy className="h-5 w-5" style={{color: '#4169E1'}} />
                    </div>
                    <div>
                      <h6 className="card-title mb-1">Total Leagues</h6>
                      <h4 className="mb-0 fw-bold">{leagues.length}</h4>
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
                      <h6 className="card-title mb-1">Active Leagues</h6>
                      <h4 className="mb-0 fw-bold">{leagues.filter(l => l.status === 'active').length}</h4>
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
                      <h6 className="card-title mb-1">Upcoming Leagues</h6>
                      <h4 className="mb-0 fw-bold">{leagues.filter(l => l.status === 'upcoming').length}</h4>
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
                      <h6 className="card-title mb-1">Total Teams</h6>
                      <h4 className="mb-0 fw-bold">{leagues.reduce((sum, league) => sum + league.currentTeams, 0)}</h4>
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
                  <label htmlFor="search" className="form-label fw-medium">Search Leagues</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <Search className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      id="search"
                      className="form-control"
                      placeholder="Search by name, description..."
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
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label htmlFor="formatFilter" className="form-label fw-medium">Format</label>
                  <select
                    id="formatFilter"
                    className="form-select"
                    value={formatFilter}
                    onChange={(e) => setFormatFilter(e.target.value)}
                  >
                    <option value="all">All Formats</option>
                    <option value="round_robin">Round Robin</option>
                    <option value="knockout">Knockout</option>
                    <option value="group_stage">Group Stage</option>
                    <option value="mixed">Mixed</option>
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

          {/* Leagues Table */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent border-0">
              <h6 className="card-title mb-0">Leagues List</h6>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="border-0">League</th>
                      <th className="border-0">Format</th>
                      <th className="border-0">Season & Dates</th>
                      <th className="border-0">Teams</th>
                      <th className="border-0">Prize Pool</th>
                      <th className="border-0">Status</th>
                      <th className="border-0">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeagues.map((league) => (
                      <tr key={league.id}>
                        <td>
                          <div>
                            <div className="fw-medium text-dark">{league.name}</div>
                            <small className="text-muted">{league.description.substring(0, 60)}...</small>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${getFormatBadgeClass(league.format)}`}>
                            {getFormatLabel(league.format)}
                          </span>
                        </td>
                        <td>
                          <div>
                            <div className="fw-medium">Season {league.season}</div>
                            <small className="text-muted">
                              {new Date(league.startDate).toLocaleDateString()} - {new Date(league.endDate).toLocaleDateString()}
                            </small>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div className="fw-medium">{league.currentTeams}/{league.maxTeams}</div>
                            <div className="progress" style={{height: '4px'}}>
                              <div 
                                className="progress-bar" 
                                style={{
                                  width: `${(league.currentTeams / league.maxTeams) * 100}%`,
                                  backgroundColor: '#4169E1'
                                }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div className="fw-medium">{league.prizePool || 'No Prize'}</div>
                            {league.entryFee && (
                              <small className="text-muted">
                                Entry: ${league.entryFee} {league.entryFeeCurrency}
                              </small>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(league.status)}`}>
                            {league.status.charAt(0).toUpperCase() + league.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <button
                              onClick={() => handleViewLeague(league.id)}
                              className="btn btn-sm btn-outline-secondary"
                              title="View League"
                            >
                              <Eye className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleEditLeague(league.id)}
                              className="btn btn-sm btn-outline-primary"
                              title="Edit League"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleManageStandings(league.id)}
                              className="btn btn-sm btn-outline-success"
                              title="Manage Standings"
                            >
                              <BarChart3 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleManageBrackets(league.id)}
                              className="btn btn-sm btn-outline-warning"
                              title="Manage Brackets"
                            >
                              <GitBranch className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredLeagues.length === 0 && (
                <div className="text-center py-5">
                  <Trophy className="h-12 w-12 text-muted mb-3" />
                  <h6 className="text-muted">No leagues found</h6>
                  <p className="text-muted mb-3">Try adjusting your search or filters</p>
                  <button 
                    onClick={handleCreateLeague}
                    className="btn btn-sm"
                    style={{backgroundColor: '#4169E1', borderColor: '#4169E1', color: 'white'}}
                  >
                    <Plus className="h-4 w-4 me-1" />
                    Create First League
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