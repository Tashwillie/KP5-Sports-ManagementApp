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
  Award
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';

interface Club {
  id: string;
  name: string;
  description: string;
  location: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  foundedYear: number;
  totalTeams: number;
  totalMembers: number;
  status: 'active' | 'inactive' | 'pending';
  rating: number;
  logo?: string;
  address: string;
  sports: string[];
  createdAt: string;
  updatedAt: string;
}

interface ClubWithStats extends Club {
  activeTeams: number;
  totalPlayers: number;
  upcomingEvents: number;
}

export default function ClubsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('clubs');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sportFilter, setSportFilter] = useState('all');

  // Mock user data
  const userData = {
    id: 'user123',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin'
  };

  // Mock clubs data
  const mockClubs: ClubWithStats[] = [
    {
      id: '1',
      name: 'Elite Football Academy',
      description: 'Premier football training and development academy',
      location: 'Lagos, Nigeria',
      contactEmail: 'info@elitefootball.com',
      contactPhone: '+234 801 234 5678',
      website: 'www.elitefootball.com',
      foundedYear: 2015,
      totalTeams: 12,
      totalMembers: 180,
      status: 'active',
      rating: 4.8,
      address: '123 Sports Complex, Victoria Island, Lagos',
      sports: ['Football', 'Futsal'],
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      activeTeams: 10,
      totalPlayers: 150,
      upcomingEvents: 8
    },
    {
      id: '2',
      name: 'Basketball Stars Club',
      description: 'Professional basketball training and competition',
      location: 'Nairobi, Kenya',
      contactEmail: 'contact@basketballstars.co.ke',
      contactPhone: '+254 700 123 456',
      website: 'www.basketballstars.co.ke',
      foundedYear: 2018,
      totalTeams: 8,
      totalMembers: 120,
      status: 'active',
      rating: 4.6,
      address: '456 Arena Street, Westlands, Nairobi',
      sports: ['Basketball'],
      createdAt: '2024-01-10T14:30:00Z',
      updatedAt: '2024-01-10T14:30:00Z',
      activeTeams: 7,
      totalPlayers: 95,
      upcomingEvents: 5
    },
    {
      id: '3',
      name: 'Cricket Champions',
      description: 'Elite cricket development and training center',
      location: 'Accra, Ghana',
      contactEmail: 'info@cricketchampions.gh',
      contactPhone: '+233 24 567 8901',
      website: 'www.cricketchampions.gh',
      foundedYear: 2020,
      totalTeams: 6,
      totalMembers: 80,
      status: 'active',
      rating: 4.4,
      address: '789 Cricket Ground, East Legon, Accra',
      sports: ['Cricket'],
      createdAt: '2024-01-05T09:15:00Z',
      updatedAt: '2024-01-05T09:15:00Z',
      activeTeams: 5,
      totalPlayers: 65,
      upcomingEvents: 3
    },
    {
      id: '4',
      name: 'Tennis Excellence',
      description: 'Professional tennis coaching and development',
      location: 'Cape Town, South Africa',
      contactEmail: 'hello@tennisexcellence.co.za',
      contactPhone: '+27 21 123 4567',
      website: 'www.tennisexcellence.co.za',
      foundedYear: 2017,
      totalTeams: 4,
      totalMembers: 60,
      status: 'inactive',
      rating: 4.2,
      address: '321 Tennis Court, Green Point, Cape Town',
      sports: ['Tennis'],
      createdAt: '2024-01-01T11:45:00Z',
      updatedAt: '2024-01-01T11:45:00Z',
      activeTeams: 0,
      totalPlayers: 0,
      upcomingEvents: 0
    },
    {
      id: '5',
      name: 'Swimming Dolphins',
      description: 'Competitive swimming and water sports training',
      location: 'Dar es Salaam, Tanzania',
      contactEmail: 'swim@dolphins.co.tz',
      contactPhone: '+255 22 987 6543',
      website: 'www.dolphins.co.tz',
      foundedYear: 2019,
      totalTeams: 3,
      totalMembers: 45,
      status: 'pending',
      rating: 4.0,
      address: '654 Pool Complex, Masaki, Dar es Salaam',
      sports: ['Swimming', 'Water Polo'],
      createdAt: '2023-12-28T16:20:00Z',
      updatedAt: '2023-12-28T16:20:00Z',
      activeTeams: 2,
      totalPlayers: 30,
      upcomingEvents: 2
    }
  ];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'badge bg-success';
      case 'inactive':
        return 'badge bg-secondary';
      case 'pending':
        return 'badge bg-warning text-dark';
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
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  const handleCreateClub = () => {
    router.push('/clubs/create');
  };

  const handleViewClub = (clubId: string) => {
    router.push(`/clubs/${clubId}`);
  };

  const handleEditClub = (clubId: string) => {
    router.push(`/clubs/${clubId}/edit`);
  };

  const handleManageClub = (clubId: string) => {
    router.push(`/clubs/${clubId}/manage`);
  };

  // Filter clubs based on search and filters
  const filteredClubs = mockClubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         club.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         club.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || club.status === statusFilter;
    const matchesSport = sportFilter === 'all' || club.sports.includes(sportFilter);
    
    return matchesSearch && matchesStatus && matchesSport;
  });

  // Calculate stats
  const totalClubs = mockClubs.length;
  const activeClubs = mockClubs.filter(club => club.status === 'active').length;
  const totalTeams = mockClubs.reduce((sum, club) => sum + club.totalTeams, 0);
  const totalMembers = mockClubs.reduce((sum, club) => sum + club.totalMembers, 0);

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <Sidebar activeTab="clubs" userData={userData} />

      {/* Main Content */}
      <div className="flex-grow-1 bg-light">
        {/* Header */}
        <div className="bg-white border-bottom p-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <h4 className="mb-0 me-3">Clubs Management</h4>
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
                onClick={handleCreateClub}
              >
                <Plus size={16} className="me-1" />
                Create Club
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
                        <Building size={24} style={{color: '#4169E1'}} />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="text-muted mb-1">Total Clubs</h6>
                      <h4 className="mb-0 fw-bold">{totalClubs}</h4>
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
                        <Star size={24} className="text-success" />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="text-muted mb-1">Active Clubs</h6>
                      <h4 className="mb-0 fw-bold">{activeClubs}</h4>
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
                      <h6 className="text-muted mb-1">Total Teams</h6>
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
                        <Award size={24} className="text-info" />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="text-muted mb-1">Total Members</h6>
                      <h4 className="mb-0 fw-bold">{totalMembers}</h4>
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
                  <label htmlFor="search" className="form-label fw-medium">Search</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <Search size={16} className="text-muted" />
                    </span>
                    <input
                      type="text"
                      id="search"
                      className="form-control border-start-0"
                      placeholder="Search clubs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-md-4">
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
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label htmlFor="sportFilter" className="form-label fw-medium">Sport</label>
                  <select
                    id="sportFilter"
                    className="form-select"
                    value={sportFilter}
                    onChange={(e) => setSportFilter(e.target.value)}
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

          {/* Clubs Table */}
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="border-0 px-4 py-3 fw-medium">Club</th>
                      <th className="border-0 px-4 py-3 fw-medium">Location</th>
                      <th className="border-0 px-4 py-3 fw-medium">Sports</th>
                      <th className="border-0 px-4 py-3 fw-medium">Teams</th>
                      <th className="border-0 px-4 py-3 fw-medium">Members</th>
                      <th className="border-0 px-4 py-3 fw-medium">Rating</th>
                      <th className="border-0 px-4 py-3 fw-medium">Status</th>
                      <th className="border-0 px-4 py-3 fw-medium text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClubs.map((club) => (
                      <tr key={club.id}>
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center">
                            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                              <Building size={20} className="text-muted" />
                            </div>
                            <div>
                              <div className="fw-medium">{club.name}</div>
                              <small className="text-muted">{club.foundedYear}</small>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center">
                            <MapPin size={16} className="text-muted me-2" />
                            <span>{club.location}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="d-flex flex-wrap gap-1">
                            {club.sports.map((sport, index) => (
                              <span key={index} className="badge bg-light text-dark border">
                                {sport}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center">
                            <Users size={16} className="text-muted me-2" />
                            <span>{club.activeTeams}/{club.totalTeams}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center">
                            <User size={16} className="text-muted me-2" />
                            <span>{club.totalMembers}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center">
                            <Star size={16} className="text-warning me-1" />
                            <span>{club.rating}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={getStatusBadgeClass(club.status)}>
                            {getStatusLabel(club.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-end">
                          <div className="btn-group" role="group">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleViewClub(club.id)}
                              title="View Club"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleEditClub(club.id)}
                              title="Edit Club"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleManageClub(club.id)}
                              title="Manage Club"
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

              {filteredClubs.length === 0 && (
                <div className="text-center py-5">
                  <Building size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">No clubs found</h5>
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