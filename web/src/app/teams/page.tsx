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
  TrendingUp
} from 'lucide-react';
// Define Team interface locally since the import path is incorrect
interface Team {
  id: string;
  name: string;
  clubId: string;
  sport: string;
  ageGroup: string;
  level: string;
  coachId: string;
  players: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface TeamWithStats extends Team {
  playerCount: number;
  coachCount: number;
  upcomingMatches: number;
  winRate: number;
}

export default function TeamsPage() {
  const router = useRouter();
  const { userData, loading: authLoading, hasPermission } = useFirebase();
  const [activeTab, setActiveTab] = useState('teams');

  // State
  const [teams, setTeams] = useState<TeamWithStats[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<TeamWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [clubFilter, setClubFilter] = useState<string>('all');
  const [ageGroupFilter, setAgeGroupFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  // Load teams
  useEffect(() => {
    if (!userData || authLoading) return;

    const loadTeams = async () => {
      try {
        setLoading(true);

        // Mock data - in real implementation, this would come from Firebase
        const mockTeams: TeamWithStats[] = [
          {
            id: '1',
            name: 'Thunder U12',
            clubId: 'club1',
            sport: 'soccer',
            ageGroup: 'u12',
            level: 'intermediate',
            coachId: 'coach1',
            players: ['player1', 'player2', 'player3', 'player4', 'player5'],
            isActive: true,
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date(),
            playerCount: 15,
            coachCount: 2,
            upcomingMatches: 3,
            winRate: 75.5,
          },
          {
            id: '2',
            name: 'Lightning U14',
            clubId: 'club1',
            sport: 'soccer',
            ageGroup: 'u14',
            level: 'advanced',
            coachId: 'coach2',
            players: ['player6', 'player7', 'player8', 'player9', 'player10'],
            isActive: true,
            createdAt: new Date('2024-02-01'),
            updatedAt: new Date(),
            playerCount: 18,
            coachCount: 1,
            upcomingMatches: 2,
            winRate: 82.3,
          },
          {
            id: '3',
            name: 'Storm U16',
            clubId: 'club2',
            sport: 'soccer',
            ageGroup: 'u16',
            level: 'elite',
            coachId: 'coach3',
            players: ['player11', 'player12', 'player13', 'player14', 'player15'],
            isActive: true,
            createdAt: new Date('2024-01-20'),
            updatedAt: new Date(),
            playerCount: 20,
            coachCount: 3,
            upcomingMatches: 5,
            winRate: 68.7,
          },
        ];

        setTeams(mockTeams);
        setFilteredTeams(mockTeams);
      } catch (error) {
        console.error('Error loading teams:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTeams();
  }, [userData, authLoading]);

  // Filter teams
  useEffect(() => {
    let filtered = teams;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(team =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Club filter
    if (clubFilter !== 'all') {
      filtered = filtered.filter(team => team.clubId === clubFilter);
    }

    // Age group filter
    if (ageGroupFilter !== 'all') {
      filtered = filtered.filter(team => team.ageGroup === ageGroupFilter);
    }

    // Level filter
    if (levelFilter !== 'all') {
      filtered = filtered.filter(team => team.level === levelFilter);
    }

    setFilteredTeams(filtered);
  }, [teams, searchTerm, clubFilter, ageGroupFilter, levelFilter]);

  const getLevelBadgeClass = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'badge bg-secondary';
      case 'intermediate':
        return 'badge bg-primary';
      case 'advanced':
        return 'badge bg-warning';
      case 'elite':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  };

  const getAgeGroupDisplay = (ageGroup: string) => {
    const ageGroupMap: { [key: string]: string } = {
      'u6': 'U6',
      'u8': 'U8',
      'u10': 'U10',
      'u12': 'U12',
      'u14': 'U14',
      'u16': 'U16',
      'u18': 'U18',
      'adult': 'Adult',
    };
    return ageGroupMap[ageGroup] || ageGroup;
  };

  const handleCreateTeam = () => {
    router.push('/teams/create');
  };

  const handleViewTeam = (teamId: string) => {
    router.push(`/teams/${teamId}`);
  };

  const handleEditTeam = (teamId: string) => {
    router.push(`/teams/${teamId}/edit`);
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
          <p className="text-muted">Please sign in to view teams.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <Sidebar activeTab="teams" userData={userData} />

      {/* Main Content */}
      <div className="flex-grow-1 bg-light">
        {/* Top Header */}
        <div className="bg-white border-bottom p-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center">
                <h5 className="mb-0">Teams Management</h5>
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
              <button className="btn btn-sm" style={{backgroundColor: '#4169E1', borderColor: '#4169E1', color: 'white'}} onClick={handleCreateTeam}>
                <Plus className="h-4 w-4 me-1" />
                Create Team
              </button>
            </div>
          </div>
        </div>

        {/* Main Teams Content */}
        <div className="p-4">
          {/* Stats Cards */}
          <div className="row g-4 mb-4">
            <div className="col-md-6 col-lg-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="card-subtitle mb-2 text-muted">Total Teams</h6>
                      <h2 className="card-title mb-1 fw-bold" style={{color: '#4169E1'}}>{teams.length}</h2>
                      <small className="text-muted">Teams</small>
                    </div>
                    <Users className="h-6 w-6 text-muted" />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="card-subtitle mb-2 text-muted">Active Teams</h6>
                      <h2 className="card-title mb-1 fw-bold text-success">{teams.filter(t => t.isActive).length}</h2>
                      <small className="text-muted">Active</small>
                    </div>
                    <Shield className="h-6 w-6 text-success" />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="card-subtitle mb-2 text-muted">Total Players</h6>
                      <h2 className="card-title mb-1 fw-bold text-warning">{teams.reduce((sum, team) => sum + team.playerCount, 0)}</h2>
                      <small className="text-muted">Players</small>
                    </div>
                    <Users className="h-6 w-6 text-warning" />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="card-subtitle mb-2 text-muted">Upcoming Matches</h6>
                      <h2 className="card-title mb-1 fw-bold text-danger">{teams.reduce((sum, team) => sum + team.upcomingMatches, 0)}</h2>
                      <small className="text-muted">Matches</small>
                    </div>
                    <Calendar className="h-6 w-6 text-danger" />
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
                <div className="col-md-6 col-lg-3">
                  <div className="position-relative">
                    <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 h-4 w-4 text-muted" />
                    <input
                      type="text"
                      className="form-control ps-5"
                      placeholder="Search teams..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-6 col-lg-3">
                  <select 
                    className="form-select" 
                    value={clubFilter} 
                    onChange={(e) => setClubFilter(e.target.value)}
                  >
                    <option value="all">All Clubs</option>
                    <option value="club1">Club 1</option>
                    <option value="club2">Club 2</option>
                  </select>
                </div>
                <div className="col-md-6 col-lg-3">
                  <select 
                    className="form-select" 
                    value={ageGroupFilter} 
                    onChange={(e) => setAgeGroupFilter(e.target.value)}
                  >
                    <option value="all">All Age Groups</option>
                    <option value="u12">U12</option>
                    <option value="u14">U14</option>
                    <option value="u16">U16</option>
                    <option value="u18">U18</option>
                    <option value="adult">Adult</option>
                  </select>
                </div>
                <div className="col-md-6 col-lg-3">
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
            </div>
          </div>

          {/* Teams Table */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent border-0">
              <h5 className="card-title mb-0">Teams ({filteredTeams.length})</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Team</th>
                      <th>Age Group</th>
                      <th>Level</th>
                      <th>Players</th>
                      <th>Coaches</th>
                      <th>Win Rate</th>
                      <th>Upcoming</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeams.map((team) => (
                      <tr key={team.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                              <Users className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="fw-medium">{team.name}</div>
                              <small className="text-muted text-capitalize">{team.sport}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-outline-secondary">
                            {getAgeGroupDisplay(team.ageGroup)}
                          </span>
                        </td>
                        <td>
                          <span className={getLevelBadgeClass(team.level)}>
                            {team.level}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <Users className="h-4 w-4 text-muted me-2" />
                            <span>{team.playerCount}</span>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <Shield className="h-4 w-4 text-muted me-2" />
                            <span>{team.coachCount}</span>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <Trophy className="h-4 w-4 text-warning me-2" />
                            <span>{team.winRate}%</span>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <Calendar className="h-4 w-4 text-primary me-2" />
                            <span>{team.upcomingMatches}</span>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button 
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleViewTeam(team.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleEditTeam(team.id)}
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