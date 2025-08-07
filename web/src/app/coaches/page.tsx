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
  Calendar,
  GraduationCap,
  Briefcase,
  Clock,
  CheckCircle,
  DollarSign
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';

interface Coach {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  age: number;
  specialization: string;
  experience: number;
  certification: string;
  teamId?: string;
  teamName?: string;
  clubId?: string;
  clubName?: string;
  status: 'active' | 'inactive' | 'on_leave' | 'suspended';
  level: 'junior' | 'senior' | 'head' | 'assistant';
  nationality: string;
  address: string;
  bio?: string;
  photo?: string;
  createdAt: string;
  updatedAt: string;
}

interface CoachWithStats extends Coach {
  teamsCoached: number;
  totalMatches: number;
  winRate: number;
  rating: number;
  activePlayers: number;
}

export default function CoachesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('coaches');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [specializationFilter, setSpecializationFilter] = useState('all');

  // Mock user data
  const userData = {
    id: 'user123',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin'
  };

  // Mock coaches data
  const mockCoaches: CoachWithStats[] = [
    {
      id: '1',
      firstName: 'Michael',
      lastName: 'Okechukwu',
      email: 'michael.okechukwu@email.com',
      phone: '+234 801 234 5678',
      dateOfBirth: '1985-03-15',
      age: 38,
      specialization: 'Football',
      experience: 12,
      certification: 'UEFA Pro License',
      teamId: 'team1',
      teamName: 'Elite FC',
      clubId: 'club1',
      clubName: 'Elite Football Academy',
      status: 'active',
      level: 'head',
      nationality: 'Nigerian',
      address: 'Lagos, Nigeria',
      bio: 'Experienced football coach with 12 years of professional coaching experience.',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      teamsCoached: 8,
      totalMatches: 156,
      winRate: 68.5,
      rating: 4.8,
      activePlayers: 25
    },
    {
      id: '2',
      firstName: 'Sarah',
      lastName: 'Kamau',
      email: 'sarah.kamau@email.com',
      phone: '+254 700 123 456',
      dateOfBirth: '1990-08-22',
      age: 33,
      specialization: 'Basketball',
      experience: 8,
      certification: 'FIBA Level 3',
      teamId: 'team2',
      teamName: 'Basketball Stars',
      clubId: 'club2',
      clubName: 'Basketball Stars Club',
      status: 'active',
      level: 'senior',
      nationality: 'Kenyan',
      address: 'Nairobi, Kenya',
      bio: 'Former professional basketball player turned coach.',
      createdAt: '2024-01-10T14:30:00Z',
      updatedAt: '2024-01-10T14:30:00Z',
      teamsCoached: 5,
      totalMatches: 89,
      winRate: 72.3,
      rating: 4.6,
      activePlayers: 18
    },
    {
      id: '3',
      firstName: 'Kwame',
      lastName: 'Mensah',
      email: 'kwame.mensah@email.com',
      phone: '+233 24 567 8901',
      dateOfBirth: '1988-12-03',
      age: 35,
      specialization: 'Cricket',
      experience: 10,
      certification: 'ICC Level 2',
      teamId: 'team3',
      teamName: 'Cricket Champions',
      clubId: 'club3',
      clubName: 'Cricket Champions',
      status: 'on_leave',
      level: 'head',
      nationality: 'Ghanaian',
      address: 'Accra, Ghana',
      bio: 'Cricket specialist with international coaching experience.',
      createdAt: '2024-01-05T09:15:00Z',
      updatedAt: '2024-01-05T09:15:00Z',
      teamsCoached: 6,
      totalMatches: 112,
      winRate: 65.8,
      rating: 4.4,
      activePlayers: 22
    },
    {
      id: '4',
      firstName: 'Zara',
      lastName: 'van der Merwe',
      email: 'zara.vandermerwe@email.com',
      phone: '+27 21 123 4567',
      dateOfBirth: '1992-03-18',
      age: 31,
      specialization: 'Tennis',
      experience: 6,
      certification: 'ITF Level 2',
      teamId: 'team4',
      teamName: 'Tennis Excellence',
      clubId: 'club4',
      clubName: 'Tennis Excellence',
      status: 'inactive',
      level: 'assistant',
      nationality: 'South African',
      address: 'Cape Town, South Africa',
      bio: 'Former tennis player with coaching certification.',
      createdAt: '2024-01-01T11:45:00Z',
      updatedAt: '2024-01-01T11:45:00Z',
      teamsCoached: 3,
      totalMatches: 45,
      winRate: 58.2,
      rating: 4.1,
      activePlayers: 12
    },
    {
      id: '5',
      firstName: 'Juma',
      lastName: 'Mkamba',
      email: 'juma.mkamba@email.com',
      phone: '+255 22 987 6543',
      dateOfBirth: '1987-07-10',
      age: 36,
      specialization: 'Swimming',
      experience: 9,
      certification: 'FINA Level 3',
      teamId: 'team5',
      teamName: 'Swimming Dolphins',
      clubId: 'club5',
      clubName: 'Swimming Dolphins',
      status: 'suspended',
      level: 'senior',
      nationality: 'Tanzanian',
      address: 'Dar es Salaam, Tanzania',
      bio: 'Swimming coach with Olympic training experience.',
      createdAt: '2023-12-28T16:20:00Z',
      updatedAt: '2023-12-28T16:20:00Z',
      teamsCoached: 7,
      totalMatches: 78,
      winRate: 71.4,
      rating: 4.3,
      activePlayers: 15
    }
  ];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'badge bg-success';
      case 'inactive':
        return 'badge bg-secondary';
      case 'on_leave':
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
      case 'on_leave':
        return 'On Leave';
      case 'suspended':
        return 'Suspended';
      default:
        return status;
    }
  };

  const getLevelBadgeClass = (level: string) => {
    switch (level) {
      case 'head':
        return 'badge bg-primary';
      case 'senior':
        return 'badge bg-info';
      case 'assistant':
        return 'badge bg-warning text-dark';
      case 'junior':
        return 'badge bg-secondary';
      default:
        return 'badge bg-secondary';
    }
  };

  const handleCreateCoach = () => {
    router.push('/coaches/create');
  };

  const handleViewCoach = (coachId: string) => {
    router.push(`/coaches/${coachId}`);
  };

  const handleEditCoach = (coachId: string) => {
    router.push(`/coaches/${coachId}/edit`);
  };

  const handleManageCoach = (coachId: string) => {
    router.push(`/coaches/${coachId}/manage`);
  };

  // Filter coaches based on search and filters
  const filteredCoaches = mockCoaches.filter(coach => {
    const fullName = `${coach.firstName} ${coach.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         coach.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coach.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coach.teamName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || coach.status === statusFilter;
    const matchesLevel = levelFilter === 'all' || coach.level === levelFilter;
    const matchesSpecialization = specializationFilter === 'all' || coach.specialization === specializationFilter;
    
    return matchesSearch && matchesStatus && matchesLevel && matchesSpecialization;
  });

  // Calculate stats
  const totalCoaches = mockCoaches.length;
  const activeCoaches = mockCoaches.filter(coach => coach.status === 'active').length;
  const totalTeams = mockCoaches.reduce((sum, coach) => sum + coach.teamsCoached, 0);
  const avgWinRate = mockCoaches.reduce((sum, coach) => sum + coach.winRate, 0) / mockCoaches.length;

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <Sidebar activeTab="coaches" userData={userData} />

      {/* Main Content */}
      <div className="flex-grow-1 bg-light">
        {/* Header */}
        <div className="bg-white border-bottom p-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <h4 className="mb-0 me-3">Coaches Management</h4>
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
                onClick={handleCreateCoach}
              >
                <Plus size={16} className="me-1" />
                Add Coach
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
                        <GraduationCap size={24} style={{color: '#4169E1'}} />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="text-muted mb-1">Total Coaches</h6>
                      <h4 className="mb-0 fw-bold">{totalCoaches}</h4>
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
                      <h6 className="text-muted mb-1">Active Coaches</h6>
                      <h4 className="mb-0 fw-bold">{activeCoaches}</h4>
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
                        <Users size={24} className="text-warning" />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="text-muted mb-1">Teams Coached</h6>
                      <h4 className="mb-0 fw-bold">{totalTeams}</h4>
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
                        <Trophy size={24} className="text-info" />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="text-muted mb-1">Avg Win Rate</h6>
                      <h4 className="mb-0 fw-bold">{avgWinRate.toFixed(1)}%</h4>
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
                      placeholder="Search coaches..."
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
                    <option value="on_leave">On Leave</option>
                    <option value="suspended">Suspended</option>
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
                    <option value="head">Head Coach</option>
                    <option value="senior">Senior Coach</option>
                    <option value="assistant">Assistant Coach</option>
                    <option value="junior">Junior Coach</option>
                  </select>
                </div>

                <div className="col-md-3">
                  <label htmlFor="specializationFilter" className="form-label fw-medium">Specialization</label>
                  <select
                    id="specializationFilter"
                    className="form-select"
                    value={specializationFilter}
                    onChange={(e) => setSpecializationFilter(e.target.value)}
                  >
                    <option value="all">All Sports</option>
                    <option value="Football">Football</option>
                    <option value="Basketball">Basketball</option>
                    <option value="Cricket">Cricket</option>
                    <option value="Tennis">Tennis</option>
                    <option value="Swimming">Swimming</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Coaches Table */}
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="border-0 px-4 py-3 fw-medium">Coach</th>
                      <th className="border-0 px-4 py-3 fw-medium">Specialization</th>
                      <th className="border-0 px-4 py-3 fw-medium">Team</th>
                      <th className="border-0 px-4 py-3 fw-medium">Experience</th>
                      <th className="border-0 px-4 py-3 fw-medium">Stats</th>
                      <th className="border-0 px-4 py-3 fw-medium">Rating</th>
                      <th className="border-0 px-4 py-3 fw-medium">Status</th>
                      <th className="border-0 px-4 py-3 fw-medium">Level</th>
                      <th className="border-0 px-4 py-3 fw-medium text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCoaches.map((coach) => (
                      <tr key={coach.id}>
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center">
                            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                              <GraduationCap size={20} className="text-muted" />
                            </div>
                            <div>
                              <div className="fw-medium">{coach.firstName} {coach.lastName}</div>
                              <small className="text-muted">{coach.email}</small>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="badge bg-light text-dark border">
                            {coach.specialization}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center">
                            <Users size={16} className="text-muted me-2" />
                            <span>{coach.teamName || 'No Team'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center">
                            <Clock size={16} className="text-muted me-2" />
                            <span>{coach.experience} years</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="small">
                            <div>Teams: {coach.teamsCoached}</div>
                            <div>Matches: {coach.totalMatches}</div>
                            <div>Win Rate: {coach.winRate}%</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center">
                            <Star size={16} className="text-warning me-1" />
                            <span>{coach.rating}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={getStatusBadgeClass(coach.status)}>
                            {getStatusLabel(coach.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={getLevelBadgeClass(coach.level)}>
                            {coach.level.charAt(0).toUpperCase() + coach.level.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-end">
                          <div className="btn-group" role="group">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleViewCoach(coach.id)}
                              title="View Coach"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleEditCoach(coach.id)}
                              title="Edit Coach"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleManageCoach(coach.id)}
                              title="Manage Coach"
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

              {filteredCoaches.length === 0 && (
                <div className="text-center py-5">
                  <GraduationCap size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">No coaches found</h5>
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