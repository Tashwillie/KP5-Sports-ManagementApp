'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Badge, Alert, Table, Modal, Form, Nav, Tab, InputGroup } from 'react-bootstrap';
import {
  Users, UserPlus, UserMinus, Shield, Activity, Settings, Eye, Edit, Trash2,
  Search, Filter, Download, Upload, RefreshCw, Lock, Unlock, Mail, Phone,
  MapPin, Calendar, Crown, Gavel, Target, Award, Clock, CheckCircle, XCircle,
  AlertTriangle, MoreHorizontal, Plus, Minus, ArrowUp, ArrowDown, BarChart3,
  PieChart, LineChart, Zap, Building, GraduationCap, Briefcase, Star, UserCheck,
  Globe, Palette, Monitor, Smartphone, Archive, Copy, Share,
  ExternalLink, Save, LogOut, Key, Bell, Database, HardDrive, Cpu, MemoryStick,
  Network, Wifi, WifiOff, Server, FileText
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'club_admin' | 'coach' | 'player' | 'parent' | 'referee';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  lastActive: Date;
  createdAt: Date;
  avatar?: string;
  phone?: string;
  location?: string;
  clubId?: string;
  clubName?: string;
  permissions: string[];
  loginAttempts: number;
  lastLoginAttempt?: Date;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
}

interface UserActivity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  details?: any;
}

interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  pendingUsers: number;
  roleDistribution: { [key: string]: number };
  recentRegistrations: number;
  failedLogins: number;
}

export default function EnhancedUserManagementDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedClub, setSelectedClub] = useState<string>('all');
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userStatistics, setUserStatistics] = useState<UserStatistics>({
    totalUsers: 1250,
    activeUsers: 1180,
    inactiveUsers: 45,
    suspendedUsers: 15,
    pendingUsers: 10,
    roleDistribution: {
      super_admin: 3,
      club_admin: 45,
      coach: 120,
      player: 850,
      parent: 200,
      referee: 32
    },
    recentRegistrations: 25,
    failedLogins: 8
  });

  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [showBulkActionsModal, setShowBulkActionsModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Mock data
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@example.com',
        role: 'super_admin',
        status: 'active',
        lastActive: new Date(Date.now() - 1000 * 60 * 30),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
        phone: '+1 (555) 123-4567',
        location: 'New York, NY',
        permissions: ['all'],
        loginAttempts: 0,
        twoFactorEnabled: true,
        emailVerified: true,
        phoneVerified: true
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        role: 'club_admin',
        status: 'active',
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
        phone: '+1 (555) 234-5678',
        location: 'Los Angeles, CA',
        clubId: 'club-1',
        clubName: 'LA Soccer Club',
        permissions: ['users:read', 'clubs:manage', 'teams:manage'],
        loginAttempts: 0,
        twoFactorEnabled: false,
        emailVerified: true,
        phoneVerified: false
      }
    ];

    setUsers(mockUsers);
    setFilteredUsers(mockUsers);

    const mockActivities: UserActivity[] = [
      {
        id: '1',
        userId: '1',
        userName: 'John Smith',
        action: 'User login',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        success: true
      }
    ];

    setUserActivities(mockActivities);
  }, []);

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(user => user.status === selectedStatus);
    }

    if (selectedClub !== 'all') {
      filtered = filtered.filter(user => user.clubId === selectedClub);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, selectedRole, selectedStatus, selectedClub]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'danger';
      case 'club_admin': return 'warning';
      case 'coach': return 'info';
      case 'player': return 'success';
      case 'parent': return 'secondary';
      case 'referee': return 'primary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'suspended': return 'danger';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return <Crown size={16} />;
      case 'club_admin': return <Building size={16} />;
      case 'coach': return <GraduationCap size={16} />;
      case 'player': return <Target size={16} />;
      case 'parent': return <Users size={16} />;
      case 'referee': return <Gavel size={16} />;
      default: return <Users size={16} />;
    }
  };

  const handleCreateUser = () => {
    setShowCreateUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditUserModal(true);
  };

  const handleViewUserDetails = (user: User) => {
    setSelectedUser(user);
    setShowUserDetailsModal(true);
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} for users:`, selectedUsers);
    setShowBulkActionsModal(false);
    setSelectedUsers([]);
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAllUsers = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <Users className="me-2" />
            User Management Dashboard
          </h2>
          <p className="text-muted mb-0">Manage users, roles, permissions, and monitor user activity</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={() => setShowBulkActionsModal(true)} disabled={selectedUsers.length === 0}>
            <MoreHorizontal className="me-2" size={16} />
            Bulk Actions ({selectedUsers.length})
          </Button>
          <Button variant="primary" onClick={handleCreateUser}>
            <UserPlus className="me-2" size={16} />
            Create User
          </Button>
        </div>
      </div>

      {/* User Statistics */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 text-primary" 
                   style={{width: '60px', height: '60px', backgroundColor: 'rgba(var(--bs-primary-rgb), 0.1)'}}>
                <Users size={24} />
              </div>
              <h6 className="mb-1">Total Users</h6>
              <h4 className="mb-2">{userStatistics.totalUsers}</h4>
              <small className="text-muted">+{userStatistics.recentRegistrations} this week</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 text-success" 
                   style={{width: '60px', height: '60px', backgroundColor: 'rgba(var(--bs-success-rgb), 0.1)'}}>
                <UserCheck size={24} />
              </div>
              <h6 className="mb-1">Active Users</h6>
              <h4 className="mb-2">{userStatistics.activeUsers}</h4>
              <small className="text-muted">{Math.round((userStatistics.activeUsers / userStatistics.totalUsers) * 100)}% of total</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 text-warning" 
                   style={{width: '60px', height: '60px', backgroundColor: 'rgba(var(--bs-warning-rgb), 0.1)'}}>
                <AlertTriangle size={24} />
              </div>
              <h6 className="mb-1">Suspended Users</h6>
              <h4 className="mb-2">{userStatistics.suspendedUsers}</h4>
              <small className="text-muted">{userStatistics.failedLogins} failed logins today</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 text-info" 
                   style={{width: '60px', height: '60px', backgroundColor: 'rgba(var(--bs-info-rgb), 0.1)'}}>
                <Clock size={24} />
              </div>
              <h6 className="mb-1">Pending Users</h6>
              <h4 className="mb-2">{userStatistics.pendingUsers}</h4>
              <small className="text-muted">Awaiting approval</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters and Search */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <Search size={16} />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={2}>
              <Form.Select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                <option value="all">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="club_admin">Club Admin</option>
                <option value="coach">Coach</option>
                <option value="player">Player</option>
                <option value="parent">Parent</option>
                <option value="referee">Referee</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select value={selectedClub} onChange={(e) => setSelectedClub(e.target.value)}>
                <option value="all">All Clubs</option>
                <option value="club-1">LA Soccer Club</option>
                <option value="club-2">Windy City FC</option>
                <option value="club-3">Miami United</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button variant="outline-secondary" className="w-100">
                <Filter className="me-2" size={16} />
                More Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Navigation Tabs */}
      <Nav variant="tabs" className="mb-4" onSelect={(k) => setActiveTab(k || 'overview')}>
        <Nav.Item>
          <Nav.Link eventKey="overview" active={activeTab === 'overview'}>
            <Activity className="me-2" size={16} />
            Overview
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="users" active={activeTab === 'users'}>
            <Users className="me-2" size={16} />
            Users
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="roles" active={activeTab === 'roles'}>
            <Shield className="me-2" size={16} />
            Roles & Permissions
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="activity" active={activeTab === 'activity'}>
            <Activity className="me-2" size={16} />
            User Activity
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="reports" active={activeTab === 'reports'}>
            <BarChart3 className="me-2" size={16} />
            Reports
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {/* Tab Content */}
      <Tab.Content>
        {/* Overview Tab */}
        <Tab.Pane eventKey="overview" active={activeTab === 'overview'}>
          <Row>
            <Col md={8}>
              <Card className="mb-4">
                <Card.Header>
                  <h6 className="mb-0">
                    <BarChart3 className="me-2" size={16} />
                    Role Distribution
                  </h6>
                </Card.Header>
                <Card.Body>
                  <Row>
                    {Object.entries(userStatistics.roleDistribution).map(([role, count]) => (
                      <Col md={4} key={role} className="mb-3">
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            {getRoleIcon(role as any)}
                          </div>
                          <div>
                            <h6 className="mb-1">{role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h6>
                            <h4 className="mb-0">{count}</h4>
                            <small className="text-muted">{Math.round((count / userStatistics.totalUsers) * 100)}%</small>
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="mb-4">
                <Card.Header>
                  <h6 className="mb-0">
                    <Activity className="me-2" size={16} />
                    Recent Activity
                  </h6>
                </Card.Header>
                <Card.Body>
                  <div>
                    {userActivities.slice(0, 5).map(activity => (
                      <div key={activity.id} className="mb-3">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1">{activity.userName}</h6>
                            <small className="text-muted">{activity.action}</small>
                          </div>
                          <Badge bg={activity.success ? 'success' : 'danger'}>
                            {activity.success ? 'Success' : 'Failed'}
                          </Badge>
                        </div>
                        <small className="text-muted">
                          {activity.timestamp.toLocaleString()} • {activity.ipAddress}
                        </small>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab.Pane>

        {/* Users Tab */}
        <Tab.Pane eventKey="users" active={activeTab === 'users'}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">
                <Users className="me-2" size={16} />
                User List ({filteredUsers.length} users)
              </h6>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>
                      <Form.Check
                        type="checkbox"
                        checked={selectedUsers.length === filteredUsers.length}
                        onChange={(e) => handleSelectAllUsers(e.target.checked)}
                      />
                    </th>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Club</th>
                    <th>Last Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                        />
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-3" 
                               style={{width: '40px', height: '40px'}}>
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <h6 className="mb-1">{user.name}</h6>
                            <small className="text-muted">{user.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge bg={getRoleColor(user.role)} className="d-flex align-items-center gap-1">
                          {getRoleIcon(user.role)}
                          {user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={getStatusColor(user.status)}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </Badge>
                      </td>
                      <td>
                        {user.clubName || '-'}
                      </td>
                      <td>
                        <small className="text-muted">
                          {user.lastActive.toLocaleString()}
                        </small>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button variant="outline-primary" size="sm" onClick={() => handleViewUserDetails(user)}>
                            <Eye size={14} />
                          </Button>
                          <Button variant="outline-warning" size="sm" onClick={() => handleEditUser(user)}>
                            <Edit size={14} />
                          </Button>
                          <Button variant="outline-danger" size="sm">
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab.Pane>

        {/* Roles & Permissions Tab */}
        <Tab.Pane eventKey="roles" active={activeTab === 'roles'}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">
                <Shield className="me-2" size={16} />
                Role Management
              </h6>
            </Card.Header>
            <Card.Body>
              <Row>
                {Object.entries(userStatistics.roleDistribution).map(([role, count]) => (
                  <Col md={6} key={role} className="mb-4">
                    <Card>
                      <Card.Header className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          {getRoleIcon(role as any)}
                          <h6 className="mb-0 ms-2">{role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h6>
                        </div>
                        <Badge bg="secondary">{count} users</Badge>
                      </Card.Header>
                      <Card.Body>
                        <div className="mb-3">
                          <h6>Permissions:</h6>
                          <div className="d-flex flex-wrap gap-1">
                            {role === 'super_admin' && (
                              <>
                                <Badge bg="success">All Permissions</Badge>
                              </>
                            )}
                            {role === 'club_admin' && (
                              <>
                                <Badge bg="info">Users: Read</Badge>
                                <Badge bg="info">Clubs: Manage</Badge>
                                <Badge bg="info">Teams: Manage</Badge>
                              </>
                            )}
                            {role === 'coach' && (
                              <>
                                <Badge bg="info">Teams: Read</Badge>
                                <Badge bg="info">Players: Manage</Badge>
                              </>
                            )}
                            {role === 'player' && (
                              <>
                                <Badge bg="info">Profile: Manage</Badge>
                                <Badge bg="info">Matches: Read</Badge>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="d-flex gap-2">
                          <Button variant="outline-primary" size="sm">
                            <Edit size={14} />
                            Edit Role
                          </Button>
                          <Button variant="outline-secondary" size="sm">
                            <Users size={14} />
                            View Users
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Tab.Pane>

        {/* User Activity Tab */}
        <Tab.Pane eventKey="activity" active={activeTab === 'activity'}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">
                <Activity className="me-2" size={16} />
                User Activity Log
              </h6>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex gap-2">
                  <Button variant="outline-secondary" size="sm">
                    <Filter className="me-2" size={16} />
                    Filter
                  </Button>
                  <Button variant="outline-secondary" size="sm">
                    <Download className="me-2" size={16} />
                    Export
                  </Button>
                </div>
              </div>
              <Table responsive>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Action</th>
                    <th>Timestamp</th>
                    <th>IP Address</th>
                    <th>Status</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {userActivities.map(activity => (
                    <tr key={activity.id}>
                      <td>{activity.userName}</td>
                      <td>{activity.action}</td>
                      <td>{activity.timestamp.toLocaleString()}</td>
                      <td>{activity.ipAddress}</td>
                      <td>
                        <Badge bg={activity.success ? 'success' : 'danger'}>
                          {activity.success ? 'Success' : 'Failed'}
                        </Badge>
                      </td>
                      <td>
                        {activity.details && (
                          <Button variant="outline-info" size="sm">
                            <Eye size={14} />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab.Pane>

        {/* Reports Tab */}
        <Tab.Pane eventKey="reports" active={activeTab === 'reports'}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">
                <BarChart3 className="me-2" size={16} />
                User Reports & Analytics
              </h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h6 className="mb-3">User Growth</h6>
                  <div className="text-center p-4">
                    <BarChart3 size={48} className="text-muted mb-3" />
                    <p>User growth chart will be displayed here</p>
                  </div>
                </Col>
                <Col md={6}>
                  <h6 className="mb-3">Role Distribution</h6>
                  <div className="text-center p-4">
                    <PieChart size={48} className="text-muted mb-3" />
                    <p>Role distribution chart will be displayed here</p>
                  </div>
                </Col>
              </Row>
              <div className="text-center mt-4">
                <Button variant="primary" className="me-2">
                  <Download className="me-2" size={16} />
                  Generate Report
                </Button>
                <Button variant="outline-secondary">
                  <Calendar className="me-2" size={16} />
                  Schedule Report
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Tab.Pane>
      </Tab.Content>

      {/* Modals */}
      <Modal show={showCreateUserModal} onHide={() => setShowCreateUserModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <UserPlus className="me-2" size={16} />
            Create New User
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control type="text" placeholder="Enter full name" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" placeholder="Enter email address" />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Select>
                    <option value="">Select role</option>
                    <option value="club_admin">Club Admin</option>
                    <option value="coach">Coach</option>
                    <option value="player">Player</option>
                    <option value="parent">Parent</option>
                    <option value="referee">Referee</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Club</Form.Label>
                  <Form.Select>
                    <option value="">Select club</option>
                    <option value="club-1">LA Soccer Club</option>
                    <option value="club-2">Windy City FC</option>
                    <option value="club-3">Miami United</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateUserModal(false)}>
            Cancel
          </Button>
          <Button variant="primary">
            <UserPlus className="me-2" size={16} />
            Create User
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showBulkActionsModal} onHide={() => setShowBulkActionsModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <MoreHorizontal className="me-2" size={16} />
            Bulk Actions ({selectedUsers.length} users)
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-grid gap-2">
            <Button variant="outline-success" onClick={() => handleBulkAction('activate')}>
              <CheckCircle className="me-2" size={16} />
              Activate Users
            </Button>
            <Button variant="outline-warning" onClick={() => handleBulkAction('suspend')}>
              <AlertTriangle className="me-2" size={16} />
              Suspend Users
            </Button>
            <Button variant="outline-info" onClick={() => handleBulkAction('export')}>
              <Download className="me-2" size={16} />
              Export User Data
            </Button>
            <Button variant="outline-danger" onClick={() => handleBulkAction('delete')}>
              <Trash2 className="me-2" size={16} />
              Delete Users
            </Button>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBulkActionsModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
