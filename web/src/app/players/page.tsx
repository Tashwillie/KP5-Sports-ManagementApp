'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Bell,
  Home,
  Users as UsersIcon,
  Calendar as CalendarIcon,
  Trophy as TrophyIcon,
  MapPin as MapPinIcon,
  FileText as FileTextIcon,
  Settings as SettingsIcon,
  BarChart3,
  Target,
  User,
  Building,
  Users,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Award,
  UserCheck,
  Activity,
  Trophy,
  Calendar
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';

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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('players');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  // Mock user data
  const userData = {
    id: 'user123',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin'
  };

  // Mock players data
  const mockPlayers: PlayerWithStats[] = [
    {
      id: '1',
      firstName: 'Ahmed',
      lastName: 'Hassan',
      email: 'ahmed.hassan@email.com',
      phone: '+234 801 234 5678',
      dateOfBirth: '2000-05-15',
      age: 23,
      position: 'Forward',
      jerseyNumber: 10,
      teamId: 'team1',
      teamName: 'Elite FC',
      clubId: 'club1',
      clubName: 'Elite Football Academy',
      status: 'active',
      level: 'elite',
      height: 180,
      weight: 75,
      nationality: 'Nigerian',
      address: 'Lagos, Nigeria',
      emergencyContact: 'Fatima Hassan',
      emergencyPhone: '+234 802 345 6789',
      medicalInfo: 'No known allergies',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      matchesPlayed: 25,
      goalsScored: 18,
      assists: 12,
      yellowCards: 2,
      redCards: 0,
      minutesPlayed: 2250,
      rating: 4.8
    },
    {
      id: '2',
      firstName: 'Sarah',
      lastName: 'Muthoni',
      email: 'sarah.muthoni@email.com',
      phone: '+254 700 123 456',
      dateOfBirth: '2002-08-22',
      age: 21,
      position: 'Midfielder',
      jerseyNumber: 8,
      teamId: 'team2',
      teamName: 'Basketball Stars',
      clubId: 'club2',
      clubName: 'Basketball Stars Club',
      status: 'active',
      level: 'advanced',
      height: 165,
      weight: 58,
      nationality: 'Kenyan',
      address: 'Nairobi, Kenya',
      emergencyContact: 'John Muthoni',
      emergencyPhone: '+254 701 234 567',
      medicalInfo: 'Asthma - uses inhaler',
      createdAt: '2024-01-10T14:30:00Z',
      updatedAt: '2024-01-10T14:30:00Z',
      matchesPlayed: 20,
      goalsScored: 8,
      assists: 15,
      yellowCards: 1,
      redCards: 0,
      minutesPlayed: 1800,
      rating: 4.5
    },
    {
      id: '3',
      firstName: 'Kwame',
      lastName: 'Mensah',
      email: 'kwame.mensah@email.com',
      phone: '+233 24 567 8901',
      dateOfBirth: '1999-12-03',
      age: 24,
      position: 'Defender',
      jerseyNumber: 4,
      teamId: 'team3',
      teamName: 'Cricket Champions',
      clubId: 'club3',
      clubName: 'Cricket Champions',
      status: 'injured',
      level: 'intermediate',
      height: 175,
      weight: 70,
      nationality: 'Ghanaian',
      address: 'Accra, Ghana',
      emergencyContact: 'Ama Mensah',
      emergencyPhone: '+233 25 678 9012',
      medicalInfo: 'Recovering from ankle injury',
      createdAt: '2024-01-05T09:15:00Z',
      updatedAt: '2024-01-05T09:15:00Z',
      matchesPlayed: 15,
      goalsScored: 2,
      assists: 5,
      yellowCards: 3,
      redCards: 1,
      minutesPlayed: 1350,
      rating: 3.8
    },
    {
      id: '4',
      firstName: 'Zara',
      lastName: 'van der Merwe',
      email: 'zara.vandermerwe@email.com',
      phone: '+27 21 123 4567',
      dateOfBirth: '2001-03-18',
      age: 22,
      position: 'Goalkeeper',
      jerseyNumber: 1,
      teamId: 'team4',
      teamName: 'Tennis Excellence',
      clubId: 'club4',
      clubName: 'Tennis Excellence',
      status: 'inactive',
      level: 'beginner',
      height: 170,
      weight: 62,
      nationality: 'South African',
      address: 'Cape Town, South Africa',
      emergencyContact: 'Pieter van der Merwe',
      emergencyPhone: '+27 22 234 5678',
      medicalInfo: 'No medical issues',
      createdAt: '2024-01-01T11:45:00Z',
      updatedAt: '2024-01-01T11:45:00Z',
      matchesPlayed: 8,
      goalsScored: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      minutesPlayed: 720,
      rating: 3.2
    },
    {
      id: '5',
      firstName: 'Juma',
      lastName: 'Mkamba',
      email: 'juma.mkamba@email.com',
      phone: '+255 22 987 6543',
      dateOfBirth: '2003-07-10',
      age: 20,
      position: 'Forward',
      jerseyNumber: 11,
      teamId: 'team5',
      teamName: 'Swimming Dolphins',
      clubId: 'club5',
      clubName: 'Swimming Dolphins',
      status: 'suspended',
      level: 'advanced',
      height: 178,
      weight: 68,
      nationality: 'Tanzanian',
      address: 'Dar es Salaam, Tanzania',
      emergencyContact: 'Mama Mkamba',
      emergencyPhone: '+255 23 876 5432',
      medicalInfo: 'No medical issues',
      createdAt: '2023-12-28T16:20:00Z',
      updatedAt: '2023-12-28T16:20:00Z',
      matchesPlayed: 12,
      goalsScored: 7,
      assists: 3,
      yellowCards: 4,
      redCards: 1,
      minutesPlayed: 1080,
      rating: 3.9
    }
  ];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'badge bg-success';
      case 'inactive':
        return 'badge bg-secondary';
      case 'injured':
        return 'badge bg-warning text-dark';
      case 'suspended':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
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
      case 'elite':
        return 'badge bg-primary';
      case 'advanced':
        return 'badge bg-info';
      case 'intermediate':
        return 'badge bg-warning text-dark';
      case 'beginner':
        return 'badge bg-secondary';
      default:
        return 'badge bg-secondary';
    }
  };

  const handleCreatePlayer = () => {
    router.push('/players/create');
  };

  const handleViewPlayer = (playerId: string) => {
    router.push(`/players/${playerId}`);
  };

  const handleEditPlayer = (playerId: string) => {
    router.push(`/players/${playerId}/edit`);
  };

  const handleManagePlayer = (playerId: string) => {
    router.push(`/players/${playerId}/manage`);
  };

  // Filter players based on search and filters
  const filteredPlayers = mockPlayers.filter(player => {
    const fullName = `${player.firstName} ${player.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         player.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.teamName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || player.status === statusFilter;
    const matchesPosition = positionFilter === 'all' || player.position === positionFilter;
    const matchesLevel = levelFilter === 'all' || player.level === levelFilter;
    
    return matchesSearch && matchesStatus && matchesPosition && matchesLevel;
  });

  // Calculate stats
  const totalPlayers = mockPlayers.length;
  const activePlayers = mockPlayers.filter(player => player.status === 'active').length;
  const totalGoals = mockPlayers.reduce((sum, player) => sum + player.goalsScored, 0);
  const totalMatches = mockPlayers.reduce((sum, player) => sum + player.matchesPlayed, 0);

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <Sidebar activeTab="players" userData={userData} />

      {/* Main Content */}
      <div className="flex-grow-1 bg-light">
        {/* Header */}
        <div className="bg-white border-bottom p-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <h4 className="mb-0 me-3">Players Management</h4>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary btn-sm d-flex align-items-center">
                <Search size={16} className="me-1" />
                Search
              </button>
              <button className="btn btn-outline-secondary btn-sm d-flex align-items-center">
                <Bell size={16} className="me-1" />
                Notifications
              </button>
              <button 
                className="btn text-white btn-sm d-flex align-items-center"
                style={{backgroundColor: '#4169E1'}}
                onClick={handleCreatePlayer}
              >
                <Plus size={16} className="me-1" />
                Add Player
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="p-4">
          <div className="row g-4 mb-4">
            <div className="col-xl-3 col-md-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                        <UserCheck size={24} style={{color: '#4169E1'}} />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="text-muted mb-1">Total Players</h6>
                      <h4 className="mb-0 fw-bold">{totalPlayers}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                        <Activity size={24} className="text-success" />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="text-muted mb-1">Active Players</h6>
                      <h4 className="mb-0 fw-bold">{activePlayers}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div className="bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                        <Trophy size={24} className="text-warning" />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="text-muted mb-1">Total Goals</h6>
                      <h4 className="mb-0 fw-bold">{totalGoals}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                        <Calendar size={24} className="text-info" />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="text-muted mb-1">Total Matches</h6>
                      <h4 className="mb-0 fw-bold">{totalMatches}</h4>
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
                <div className="col-md-3">
                  <label htmlFor="search" className="form-label fw-medium">Search</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <Search size={16} className="text-muted" />
                    </span>
                    <input
                      type="text"
                      id="search"
                      className="form-control border-start-0"
                      placeholder="Search players..."
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
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="injured">Injured</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div className="col-md-3">
                  <label htmlFor="positionFilter" className="form-label fw-medium">Position</label>
                  <select
                    id="positionFilter"
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

                <div className="col-md-3">
                  <label htmlFor="levelFilter" className="form-label fw-medium">Level</label>
                  <select
                    id="levelFilter"
                    className="form-select"
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                  >
                    <option value="all">All Levels</option>
                    <option value="elite">Elite</option>
                    <option value="advanced">Advanced</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="beginner">Beginner</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Players Table */}
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="border-0 px-4 py-3 fw-medium">Player</th>
                      <th className="border-0 px-4 py-3 fw-medium">Position</th>
                      <th className="border-0 px-4 py-3 fw-medium">Team</th>
                      <th className="border-0 px-4 py-3 fw-medium">Age</th>
                      <th className="border-0 px-4 py-3 fw-medium">Stats</th>
                      <th className="border-0 px-4 py-3 fw-medium">Rating</th>
                      <th className="border-0 px-4 py-3 fw-medium">Status</th>
                      <th className="border-0 px-4 py-3 fw-medium">Level</th>
                      <th className="border-0 px-4 py-3 fw-medium text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlayers.map((player) => (
                      <tr key={player.id}>
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center">
                            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                              <User size={20} className="text-muted" />
                            </div>
                            <div>
                              <div className="fw-medium">{player.firstName} {player.lastName}</div>
                              <small className="text-muted">#{player.jerseyNumber}</small>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="badge bg-light text-dark border">
                            {player.position}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center">
                            <Users size={16} className="text-muted me-2" />
                            <span>{player.teamName || 'No Team'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span>{player.age} years</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="small">
                            <div>Matches: {player.matchesPlayed}</div>
                            <div>Goals: {player.goalsScored}</div>
                            <div>Assists: {player.assists}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center">
                            <Star size={16} className="text-warning me-1" />
                            <span>{player.rating}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={getStatusBadgeClass(player.status)}>
                            {getStatusLabel(player.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={getLevelBadgeClass(player.level)}>
                            {player.level.charAt(0).toUpperCase() + player.level.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-end">
                          <div className="btn-group" role="group">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleViewPlayer(player.id)}
                              title="View Player"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleEditPlayer(player.id)}
                              title="Edit Player"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleManagePlayer(player.id)}
                              title="Manage Player"
                            >
                              <SettingsIcon size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredPlayers.length === 0 && (
                <div className="text-center py-5">
                  <UserCheck size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">No players found</h5>
                  <p className="text-muted">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 