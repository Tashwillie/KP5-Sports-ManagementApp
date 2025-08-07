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
  Gavel,
  Shield,
  Zap,
  DollarSign
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';

interface Referee {
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
  licenseNumber: string;
  status: 'active' | 'inactive' | 'on_leave' | 'suspended';
  level: 'junior' | 'senior' | 'international' | 'assistant';
  nationality: string;
  address: string;
  bio?: string;
  photo?: string;
  createdAt: string;
  updatedAt: string;
}

interface RefereeWithStats extends Referee {
  matchesOfficiated: number;
  totalCards: number;
  accuracyRate: number;
  rating: number;
  lastMatch: string;
}

export default function RefereesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('referees');
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

  // Mock referees data
  const mockReferees: RefereeWithStats[] = [
    {
      id: '1',
      firstName: 'David',
      lastName: 'Oluwaseun',
      email: 'david.oluwaseun@email.com',
      phone: '+234 801 234 5678',
      dateOfBirth: '1980-05-15',
      age: 43,
      specialization: 'Football',
      experience: 15,
      certification: 'FIFA International',
      licenseNumber: 'REF-001-2024',
      status: 'active',
      level: 'international',
      nationality: 'Nigerian',
      address: 'Lagos, Nigeria',
      bio: 'Experienced FIFA international referee with 15 years of officiating experience.',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      matchesOfficiated: 245,
      totalCards: 156,
      accuracyRate: 94.2,
      rating: 4.9,
      lastMatch: '2024-01-20T15:30:00Z'
    },
    {
      id: '2',
      firstName: 'Grace',
      lastName: 'Wanjiku',
      email: 'grace.wanjiku@email.com',
      phone: '+254 700 123 456',
      dateOfBirth: '1985-08-22',
      age: 38,
      specialization: 'Basketball',
      experience: 12,
      certification: 'FIBA International',
      licenseNumber: 'REF-002-2024',
      status: 'active',
      level: 'senior',
      nationality: 'Kenyan',
      address: 'Nairobi, Kenya',
      bio: 'FIBA certified basketball referee with international experience.',
      createdAt: '2024-01-10T14:30:00Z',
      updatedAt: '2024-01-10T14:30:00Z',
      matchesOfficiated: 189,
      totalCards: 89,
      accuracyRate: 91.8,
      rating: 4.7,
      lastMatch: '2024-01-18T19:00:00Z'
    },
    {
      id: '3',
      firstName: 'Kofi',
      lastName: 'Addo',
      email: 'kofi.addo@email.com',
      phone: '+233 24 567 8901',
      dateOfBirth: '1982-12-03',
      age: 41,
      specialization: 'Cricket',
      experience: 18,
      certification: 'ICC Elite Panel',
      licenseNumber: 'REF-003-2024',
      status: 'on_leave',
      level: 'international',
      nationality: 'Ghanaian',
      address: 'Accra, Ghana',
      bio: 'ICC Elite Panel cricket umpire with extensive international experience.',
      createdAt: '2024-01-05T09:15:00Z',
      updatedAt: '2024-01-05T09:15:00Z',
      matchesOfficiated: 312,
      totalCards: 45,
      accuracyRate: 96.5,
      rating: 4.8,
      lastMatch: '2024-01-15T10:00:00Z'
    },
    {
      id: '4',
      firstName: 'Thabo',
      lastName: 'Molefe',
      email: 'thabo.molefe@email.com',
      phone: '+27 21 123 4567',
      dateOfBirth: '1988-03-18',
      age: 35,
      specialization: 'Rugby',
      experience: 8,
      certification: 'World Rugby Level 2',
      licenseNumber: 'REF-004-2024',
      status: 'inactive',
      level: 'senior',
      nationality: 'South African',
      address: 'Cape Town, South Africa',
      bio: 'World Rugby certified referee specializing in rugby union.',
      createdAt: '2024-01-01T11:45:00Z',
      updatedAt: '2024-01-01T11:45:00Z',
      matchesOfficiated: 134,
      totalCards: 67,
      accuracyRate: 88.9,
      rating: 4.2,
      lastMatch: '2024-01-10T14:00:00Z'
    },
    {
      id: '5',
      firstName: 'Aisha',
      lastName: 'Hassan',
      email: 'aisha.hassan@email.com',
      phone: '+255 22 987 6543',
      dateOfBirth: '1990-07-10',
      age: 33,
      specialization: 'Volleyball',
      experience: 6,
      certification: 'FIVB International',
      licenseNumber: 'REF-005-2024',
      status: 'suspended',
      level: 'junior',
      nationality: 'Tanzanian',
      address: 'Dar es Salaam, Tanzania',
      bio: 'FIVB certified volleyball referee with regional experience.',
      createdAt: '2023-12-28T16:20:00Z',
      updatedAt: '2023-12-28T16:20:00Z',
      matchesOfficiated: 78,
      totalCards: 23,
      accuracyRate: 85.4,
      rating: 3.9,
      lastMatch: '2024-01-05T16:30:00Z'
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
      case 'international':
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

  const handleCreateReferee = () => {
    router.push('/referees/create');
  };

  const handleViewReferee = (refereeId: string) => {
    router.push(`/referees/${refereeId}`);
  };

  const handleEditReferee = (refereeId: string) => {
    router.push(`/referees/${refereeId}/edit`);
  };

  const handleManageReferee = (refereeId: string) => {
    router.push(`/referees/${refereeId}/manage`);
  };

  // Filter referees based on search and filters
  const filteredReferees = mockReferees.filter(referee => {
    const fullName = `${referee.firstName} ${referee.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         referee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         referee.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         referee.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || referee.status === statusFilter;
    const matchesLevel = levelFilter === 'all' || referee.level === levelFilter;
    const matchesSpecialization = specializationFilter === 'all' || referee.specialization === specializationFilter;
    
    return matchesSearch && matchesStatus && matchesLevel && matchesSpecialization;
  });

  // Calculate stats
  const totalReferees = mockReferees.length;
  const activeReferees = mockReferees.filter(referee => referee.status === 'active').length;
  const totalMatches = mockReferees.reduce((sum, referee) => sum + referee.matchesOfficiated, 0);
  const avgAccuracy = mockReferees.reduce((sum, referee) => sum + referee.accuracyRate, 0) / mockReferees.length;

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <Sidebar activeTab="referees" userData={userData} />

      {/* Main Content */}
      <div className="flex-grow-1 bg-light">
        {/* Header */}
        <div className="bg-white border-bottom p-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <h4 className="mb-0 me-3">Referees Management</h4>
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
                onClick={handleCreateReferee}
              >
                <Plus size={16} className="me-1" />
                Add Referee
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
                        <Award size={24} style={{color: '#4169E1'}} />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="text-muted mb-1">Total Referees</h6>
                      <h4 className="mb-0 fw-bold">{totalReferees}</h4>
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
                      <h6 className="text-muted mb-1">Active Referees</h6>
                      <h4 className="mb-0 fw-bold">{activeReferees}</h4>
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
                        <Target size={24} className="text-warning" />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="text-muted mb-1">Matches Officiated</h6>
                      <h4 className="mb-0 fw-bold">{totalMatches}</h4>
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
                        <CheckCircle size={24} className="text-info" />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="text-muted mb-1">Avg Accuracy</h6>
                      <h4 className="mb-0 fw-bold">{avgAccuracy.toFixed(1)}%</h4>
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
                      placeholder="Search referees..."
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
                    <option value="international">International</option>
                    <option value="senior">Senior</option>
                    <option value="assistant">Assistant</option>
                    <option value="junior">Junior</option>
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
                    <option value="Rugby">Rugby</option>
                    <option value="Volleyball">Volleyball</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Referees Table */}
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="border-0 px-4 py-3 fw-medium">Referee</th>
                      <th className="border-0 px-4 py-3 fw-medium">Specialization</th>
                      <th className="border-0 px-4 py-3 fw-medium">License</th>
                      <th className="border-0 px-4 py-3 fw-medium">Experience</th>
                      <th className="border-0 px-4 py-3 fw-medium">Stats</th>
                      <th className="border-0 px-4 py-3 fw-medium">Rating</th>
                      <th className="border-0 px-4 py-3 fw-medium">Status</th>
                      <th className="border-0 px-4 py-3 fw-medium">Level</th>
                      <th className="border-0 px-4 py-3 fw-medium text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReferees.map((referee) => (
                      <tr key={referee.id}>
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center">
                            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                              <Award size={20} className="text-muted" />
                            </div>
                            <div>
                              <div className="fw-medium">{referee.firstName} {referee.lastName}</div>
                              <small className="text-muted">{referee.email}</small>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="badge bg-light text-dark border">
                            {referee.specialization}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center">
                            <Shield size={16} className="text-muted me-2" />
                            <span className="small">{referee.licenseNumber}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center">
                            <Clock size={16} className="text-muted me-2" />
                            <span>{referee.experience} years</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="small">
                            <div>Matches: {referee.matchesOfficiated}</div>
                            <div>Cards: {referee.totalCards}</div>
                            <div>Accuracy: {referee.accuracyRate}%</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center">
                            <Star size={16} className="text-warning me-1" />
                            <span>{referee.rating}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={getStatusBadgeClass(referee.status)}>
                            {getStatusLabel(referee.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={getLevelBadgeClass(referee.level)}>
                            {referee.level.charAt(0).toUpperCase() + referee.level.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-end">
                          <div className="btn-group" role="group">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleViewReferee(referee.id)}
                              title="View Referee"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleEditReferee(referee.id)}
                              title="Edit Referee"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleManageReferee(referee.id)}
                              title="Manage Referee"
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

              {filteredReferees.length === 0 && (
                <div className="text-center py-5">
                  <Award size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">No referees found</h5>
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