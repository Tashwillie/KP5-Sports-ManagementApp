'use client';

import React, { useState, useEffect } from 'react';
import { useEnhancedAuthContext } from '@/contexts/EnhancedAuthContext';
import { useRouter } from 'next/navigation';
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
import enhancedApiClient from '@/lib/enhancedApiClient';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

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
  return (
    <ProtectedRoute>
      <LeaguesContent />
    </ProtectedRoute>
  );
}

function LeaguesContent() {
  const router = useRouter();
  const { user, loading } = useEnhancedAuthContext();
  const [activeTab, setActiveTab] = useState('leagues');
  const [leagues, setLeagues] = useState<LeagueWithStats[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formatFilter, setFormatFilter] = useState('all');

  // Load tournaments as leagues proxy
  useEffect(() => {
    const load = async () => {
      if (loading) return;
      try {
        setLoadingData(true);
        const resp = await enhancedApiClient.get('/tournaments');
        const items = (resp.data.tournaments || []).map((t: any) => ({
          id: t.id,
          name: t.name,
          description: t.description || '',
          season: new Date(t.startDate).getFullYear().toString(),
          startDate: t.startDate,
          endDate: t.endDate,
          maxTeams: t.maxTeams || 0,
          currentTeams: t.teams?.length || t._count?.teams || 0,
          status: (t.status || 'UPCOMING').toLowerCase(),
          format: (t.format || 'ROUND_ROBIN').toLowerCase(),
          organizer: t.club?.name || 'Organizer',
          organizerId: t.clubId || '',
          prizePool: '',
          entryFee: 0,
          entryFeeCurrency: 'USD',
          rules: '',
          isPublic: true,
          teams: (t.teams || []).map((tt: any) => tt.teamId),
          matches: (t.matches || []).map((m: any) => m.matchId),
          standings: [],
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt),
        }));
        setLeagues(items);
      } catch (e) {
        setLeagues([]);
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [loading]);

  // Remove this redundant useEffect since data loading is handled above

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

  if (loading || loadingData) {
    const userData = user ? {
      id: user.id || 'user123',
      name: user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Admin User',
      email: user.email || 'admin@example.com',
      role: user.role || 'Super Admin'
    } : undefined;
    return (
      <div className="d-flex" style={{ minHeight: '100vh', overflow: 'hidden' }}>
        <Sidebar activeTab="leagues" userData={userData} />
        <div className="flex-grow-1 bg-light d-flex align-items-center justify-content-center" style={{ minWidth: 0, overflow: 'auto' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="text-muted">Loading leagues...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="d-flex" style={{ minHeight: '100vh', overflow: 'hidden' }}>
        <Sidebar activeTab="leagues" />
        <div className="flex-grow-1 bg-light d-flex align-items-center justify-content-center" style={{ minWidth: 0, overflow: 'auto' }}>
          <div className="text-center">
            <h2 className="h2 fw-bold text-dark mb-3">Access Denied</h2>
            <p className="text-muted mb-4">Please sign in to view leagues.</p>
            <Link href="/auth/signin" className="btn" style={{backgroundColor: '#4169E1', borderColor: '#4169E1', color: 'white'}}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const userData = {
    id: user.id || 'user123',
    name: user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Admin User',
    email: user.email || 'admin@example.com',
    role: user.role || 'Super Admin'
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh', overflow: 'hidden' }}>
      <Sidebar activeTab="leagues" userData={userData} />
      <div className="flex-grow-1 bg-light" style={{ minWidth: 0, overflow: 'auto' }}>
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