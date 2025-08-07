'use client';

import React, { useState, useEffect } from 'react';
import { useFirebase } from '@/contexts/FirebaseContext';
import Sidebar from '@/components/layout/Sidebar';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  UserCheck, 
  UserX,
  Users,
  Calendar,
  Trophy,
  Target,
  TrendingUp,
  Clock,
  MapPin,
  Activity,
  BarChart3,
  Settings,
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
  Play,
  Pause,
  Square,
  AlertTriangle,
  TrendingDown,
  DollarSign,
  FileText,
  ImageIcon,
  UserCheck as UserCheckIcon,
  Building
} from 'lucide-react';
import { User as AppUser, UserRole } from '../../../../shared/src/types';

export default function UserManagementPage() {
  const { userData, loading: authLoading, hasPermission } = useFirebase();

  // State
  const [users, setUsers] = useState<AppUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Permission check
  useEffect(() => {
    if (!authLoading && (!userData || !hasPermission('manage_users'))) {
      return;
    }
  }, [authLoading, userData, hasPermission]);

  // Load users
  useEffect(() => {
    if (!userData || !hasPermission('manage_users')) return;

    const loadUsers = async () => {
      try {
        setLoading(true);
        // This would be implemented in the user service
        // For now, we'll use mock data
        const mockUsers: AppUser[] = [
          {
            id: '1',
            email: 'admin@example.com',
            displayName: 'Super Admin',
            photoURL: '',
            phoneNumber: '+1234567890',
            role: 'super_admin',
            clubId: undefined,
            teamIds: [],
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date(),
            isActive: true,
            preferences: {
              notifications: { email: true, push: true, sms: false },
              language: 'en',
              timezone: 'UTC',
            },
          },
          {
            id: '2',
            email: 'coach@example.com',
            displayName: 'John Coach',
            photoURL: '',
            phoneNumber: '+1234567891',
            role: 'coach',
            clubId: 'club1',
            teamIds: ['team1', 'team2'],
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date(),
            isActive: true,
            preferences: {
              notifications: { email: true, push: true, sms: false },
              language: 'en',
              timezone: 'UTC',
            },
          },
          {
            id: '3',
            email: 'player@example.com',
            displayName: 'Mike Player',
            photoURL: '',
            phoneNumber: '+1234567892',
            role: 'player',
            clubId: 'club1',
            teamIds: ['team1'],
            createdAt: new Date('2024-02-01'),
            updatedAt: new Date(),
            isActive: true,
            preferences: {
              notifications: { email: true, push: true, sms: false },
              language: 'en',
              timezone: 'UTC',
            },
          },
        ];
        setUsers(mockUsers);
        setFilteredUsers(mockUsers);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [userData, hasPermission]);

  // Filter users
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(user => user.isActive === isActive);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return 'badge bg-danger';
      case 'club_admin':
        return 'badge bg-primary';
      case 'coach':
        return 'badge bg-secondary';
      case 'referee':
        return 'badge bg-info';
      case 'player':
        return 'badge bg-success';
      case 'parent':
        return 'badge bg-warning';
      default:
        return 'badge bg-secondary';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'club_admin':
        return 'Club Admin';
      case 'coach':
        return 'Coach';
      case 'referee':
        return 'Referee';
      case 'player':
        return 'Player';
      case 'parent':
        return 'Parent';
      default:
        return role;
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      // This would update the user status in Firebase
      const updatedUsers = users.map(user =>
        user.id === userId ? { ...user, isActive: !currentStatus } : user
      );
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      // This would update the user role in Firebase
      const updatedUsers = users.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      );
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="d-flex">
        <Sidebar activeTab="admin" userData={userData} />
        <div className="flex-grow-1 p-4">
          <div className="d-flex justify-content-center align-items-center" style={{minHeight: '400px'}}>
            <div className="text-center">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p>Loading users...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userData || !hasPermission('manage_users')) {
    return (
      <div className="d-flex">
        <Sidebar activeTab="admin" userData={userData} />
        <div className="flex-grow-1 p-4">
          <div className="alert alert-danger" role="alert">
            <Shield className="h-4 w-4 me-2" />
            You don't have permission to manage users. Please contact your administrator.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <Sidebar activeTab="admin" userData={userData} />
      <div className="flex-grow-1">
        {/* Header */}
        <div className="bg-white border-bottom p-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-1">User Management</h1>
              <p className="text-muted mb-0">
                Manage user accounts, roles, and permissions across the platform.
              </p>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary">
                <Filter className="h-4 w-4 me-2" />
                Export
              </button>
              <button className="btn btn-primary">
                <Plus className="h-4 w-4 me-2" />
                Add User
              </button>
            </div>
          </div>
        </div>

        <div className="p-4">
          {/* Stats Cards */}
          <div className="row g-4 mb-4">
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <p className="text-muted small mb-1">Total Users</p>
                      <h4 className="mb-0 fw-bold">{users.length}</h4>
                    </div>
                    <UserCheck className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <p className="text-muted small mb-1">Active Users</p>
                      <h4 className="mb-0 fw-bold text-success">
                        {users.filter(u => u.isActive).length}
                      </h4>
                    </div>
                    <UserCheck className="h-4 w-4 text-success" />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <p className="text-muted small mb-1">Inactive Users</p>
                      <h4 className="mb-0 fw-bold text-danger">
                        {users.filter(u => !u.isActive).length}
                      </h4>
                    </div>
                    <UserX className="h-4 w-4 text-danger" />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <p className="text-muted small mb-1">Coaches</p>
                      <h4 className="mb-0 fw-bold text-info">
                        {users.filter(u => u.role === 'coach').length}
                      </h4>
                    </div>
                    <Shield className="h-4 w-4 text-info" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">Filters</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="position-relative">
                    <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 h-4 w-4 text-muted" />
                    <input
                      type="text"
                      className="form-control ps-5"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="all">All Roles</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="club_admin">Club Admin</option>
                    <option value="coach">Coach</option>
                    <option value="referee">Referee</option>
                    <option value="player">Player</option>
                    <option value="parent">Parent</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <button className="btn btn-primary w-100">
                    <Plus className="h-4 w-4 me-2" />
                    Add User
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Users ({filteredUsers.length})</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Teams</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3" style={{width: '32px', height: '32px'}}>
                              <User className="h-4 w-4 text-muted" />
                            </div>
                            <div>
                              <p className="fw-medium mb-0">{user.displayName}</p>
                              <small className="text-muted">{user.email}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            style={{width: '120px'}}
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                          >
                            <option value="super_admin">Super Admin</option>
                            <option value="club_admin">Club Admin</option>
                            <option value="coach">Coach</option>
                            <option value="referee">Referee</option>
                            <option value="player">Player</option>
                            <option value="parent">Parent</option>
                          </select>
                        </td>
                        <td>
                          <span className={`badge ${user.isActive ? 'bg-success' : 'bg-secondary'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {user.teamIds.slice(0, 2).map((teamId) => (
                              <span key={teamId} className="badge bg-light text-dark small">
                                Team {teamId}
                              </span>
                            ))}
                            {user.teamIds.length > 2 && (
                              <span className="badge bg-light text-dark small">
                                +{user.teamIds.length - 2} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <small className="text-muted">
                            {user.createdAt.toLocaleDateString()}
                          </small>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleStatusToggle(user.id, user.isActive)}
                              title={user.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {user.isActive ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                            </button>
                            <button className="btn btn-sm btn-outline-secondary" title="Edit">
                              <Edit className="h-3 w-3" />
                            </button>
                            <button className="btn btn-sm btn-outline-danger" title="Delete">
                              <Trash2 className="h-3 w-3" />
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