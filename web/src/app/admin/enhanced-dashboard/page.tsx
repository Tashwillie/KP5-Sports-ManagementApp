'use client';

import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Nav, Tab } from 'react-bootstrap';
import { 
  Server, 
  Users, 
  Shield, 
  Activity, 
  Settings, 
  BarChart3, 
  Database,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Download,
  Upload,
  Key,
  Lock,
  Unlock,
  Bell,
  Globe,
  Palette,
  Monitor,
  Smartphone,
  Archive,
  Copy,
  Share,
  ExternalLink,
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  Zap,
  Crown,
  Gavel,
  Target,
  Award,
  Calendar,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Save,
  LogOut
} from 'lucide-react';
import SystemManagementDashboard from '@/components/admin/SystemManagementDashboard';
import EnhancedUserManagementDashboard from '@/components/admin/EnhancedUserManagementDashboard';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalClubs: number;
  totalTeams: number;
  totalTournaments: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  lastBackup: Date;
  securityStatus: 'secure' | 'vulnerable' | 'compromised';
}

export default function EnhancedAdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalUsers: 1250,
    activeUsers: 1180,
    totalClubs: 45,
    totalTeams: 180,
    totalTournaments: 25,
    systemHealth: 'healthy',
    lastBackup: new Date(Date.now() - 1000 * 60 * 60 * 6),
    securityStatus: 'secure'
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'secure':
        return 'success';
      case 'warning':
      case 'vulnerable':
        return 'warning';
      case 'critical':
      case 'compromised':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const handleRefreshStats = () => {
    // Simulate refresh
    setAdminStats(prev => ({
      ...prev,
      totalUsers: prev.totalUsers + Math.floor(Math.random() * 10),
      activeUsers: prev.activeUsers + Math.floor(Math.random() * 5)
    }));
  };

  return (
    <Container fluid className="p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-2">
            <Crown className="me-2" />
            Enhanced Admin Dashboard
          </h1>
          <p className="text-muted mb-0">Comprehensive system administration and management</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={handleRefreshStats}>
            <RefreshCw className="me-2" size={16} />
            Refresh
          </Button>
          <Button variant="outline-success">
            <Download className="me-2" size={16} />
            Export Report
          </Button>
          <Button variant="outline-warning">
            <Shield className="me-2" size={16} />
            Security Scan
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 text-primary" 
                   style={{width: '60px', height: '60px', backgroundColor: 'rgba(var(--bs-primary-rgb), 0.1)'}}>
                <Users size={24} />
              </div>
              <h6 className="mb-1">Total Users</h6>
              <h4 className="mb-2">{adminStats.totalUsers}</h4>
              <small className="text-muted">{adminStats.activeUsers} active</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 text-success" 
                   style={{width: '60px', height: '60px', backgroundColor: 'rgba(var(--bs-success-rgb), 0.1)'}}>
                <Target size={24} />
              </div>
              <h6 className="mb-1">Total Clubs</h6>
              <h4 className="mb-2">{adminStats.totalClubs}</h4>
              <small className="text-muted">{adminStats.totalTeams} teams</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 text-info" 
                   style={{width: '60px', height: '60px', backgroundColor: 'rgba(var(--bs-info-rgb), 0.1)'}}>
                <Award size={24} />
              </div>
              <h6 className="mb-1">Tournaments</h6>
              <h4 className="mb-2">{adminStats.totalTournaments}</h4>
              <small className="text-muted">Active competitions</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <div className={`d-inline-flex align-items-center justify-content-center rounded-circle mb-3 ${getStatusColor(adminStats.systemHealth)}`} 
                   style={{width: '60px', height: '60px', backgroundColor: 'rgba(var(--bs-success-rgb), 0.1)'}}>
                <Server size={24} />
              </div>
              <h6 className="mb-1">System Health</h6>
              <Badge bg={getStatusColor(adminStats.systemHealth)} className="mb-2">
                {adminStats.systemHealth.charAt(0).toUpperCase() + adminStats.systemHealth.slice(1)}
              </Badge>
              <small className="text-muted">Last backup: {adminStats.lastBackup.toLocaleString()}</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Navigation Tabs */}
      <Nav variant="tabs" className="mb-4" onSelect={(k) => setActiveTab(k || 'overview')}>
        <Nav.Item>
          <Nav.Link eventKey="overview" active={activeTab === 'overview'}>
            <BarChart3 className="me-2" size={16} />
            Overview
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="system" active={activeTab === 'system'}>
            <Server className="me-2" size={16} />
            System Management
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="users" active={activeTab === 'users'}>
            <Users className="me-2" size={16} />
            User Management
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="security" active={activeTab === 'security'}>
            <Shield className="me-2" size={16} />
            Security
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="analytics" active={activeTab === 'analytics'}>
            <Activity className="me-2" size={16} />
            Analytics
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="settings" active={activeTab === 'settings'}>
            <Settings className="me-2" size={16} />
            Settings
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
                    <TrendingUp className="me-2" size={16} />
                    System Overview
                  </h6>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <div className="mb-4">
                        <h6 className="mb-3">Quick Actions</h6>
                        <div className="d-grid gap-2">
                          <Button variant="outline-primary" size="sm">
                            <Users className="me-2" size={16} />
                            Manage Users
                          </Button>
                          <Button variant="outline-success" size="sm">
                            <Target className="me-2" size={16} />
                            Manage Clubs
                          </Button>
                          <Button variant="outline-info" size="sm">
                            <Award className="me-2" size={16} />
                            Manage Tournaments
                          </Button>
                          <Button variant="outline-warning" size="sm">
                            <Shield className="me-2" size={16} />
                            Security Settings
                          </Button>
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-4">
                        <h6 className="mb-3">System Status</h6>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span>Database</span>
                          <Badge bg="success">Connected</Badge>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span>Network</span>
                          <Badge bg="success">Online</Badge>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span>Security</span>
                          <Badge bg={getStatusColor(adminStats.securityStatus)}>
                            {adminStats.securityStatus.charAt(0).toUpperCase() + adminStats.securityStatus.slice(1)}
                          </Badge>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span>Last Backup</span>
                          <small className="text-muted">{adminStats.lastBackup.toLocaleString()}</small>
                        </div>
                      </div>
                    </Col>
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
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">New user registered</h6>
                          <small className="text-muted">2 minutes ago</small>
                        </div>
                        <Badge bg="success">Info</Badge>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">Tournament created</h6>
                          <small className="text-muted">15 minutes ago</small>
                        </div>
                        <Badge bg="info">Info</Badge>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">System backup completed</h6>
                          <small className="text-muted">6 hours ago</small>
                        </div>
                        <Badge bg="success">Success</Badge>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab.Pane>

        {/* System Management Tab */}
        <Tab.Pane eventKey="system" active={activeTab === 'system'}>
          <SystemManagementDashboard />
        </Tab.Pane>

        {/* User Management Tab */}
        <Tab.Pane eventKey="users" active={activeTab === 'users'}>
          <EnhancedUserManagementDashboard />
        </Tab.Pane>

        {/* Security Tab */}
        <Tab.Pane eventKey="security" active={activeTab === 'security'}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">
                <Shield className="me-2" size={16} />
                Security Dashboard
              </h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h6 className="mb-3">Security Status</h6>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span>Firewall</span>
                      <Badge bg="success">Active</Badge>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span>SSL Certificate</span>
                      <Badge bg="success">Valid</Badge>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span>Two-Factor Auth</span>
                      <Badge bg="success">Enabled</Badge>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span>Last Security Scan</span>
                      <small className="text-muted">2 hours ago</small>
                    </div>
                  </div>
                  <div className="d-grid gap-2">
                    <Button variant="outline-warning">
                      <Shield className="me-2" size={16} />
                      Run Security Scan
                    </Button>
                    <Button variant="outline-info">
                      <Lock className="me-2" size={16} />
                      Review Permissions
                    </Button>
                  </div>
                </Col>
                <Col md={6}>
                  <h6 className="mb-3">Recent Security Events</h6>
                  <div>
                    <div className="mb-3 p-3 border rounded">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">Failed login attempt</h6>
                          <small className="text-muted">IP: 192.168.1.100 • 30 minutes ago</small>
                        </div>
                        <Badge bg="warning">Medium</Badge>
                      </div>
                    </div>
                    <div className="mb-3 p-3 border rounded">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">Permission change</h6>
                          <small className="text-muted">User: john.doe@example.com • 2 hours ago</small>
                        </div>
                        <Badge bg="info">Low</Badge>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Tab.Pane>

        {/* Analytics Tab */}
        <Tab.Pane eventKey="analytics" active={activeTab === 'analytics'}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">
                <BarChart3 className="me-2" size={16} />
                System Analytics
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
                  <h6 className="mb-3">System Performance</h6>
                  <div className="text-center p-4">
                    <TrendingUp size={48} className="text-muted mb-3" />
                    <p>Performance metrics chart will be displayed here</p>
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

        {/* Settings Tab */}
        <Tab.Pane eventKey="settings" active={activeTab === 'settings'}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">
                <Settings className="me-2" size={16} />
                System Settings
              </h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h6 className="mb-3">General Settings</h6>
                  <div className="mb-3">
                    <label className="form-label">System Name</label>
                    <input type="text" className="form-control" defaultValue="KP5 Academy System" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Timezone</label>
                    <select className="form-select" defaultValue="UTC">
                      <option value="UTC">UTC</option>
                      <option value="EST">Eastern Time</option>
                      <option value="PST">Pacific Time</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Language</label>
                    <select className="form-select" defaultValue="en">
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  </div>
                </Col>
                <Col md={6}>
                  <h6 className="mb-3">Security Settings</h6>
                  <div className="mb-3">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" defaultChecked />
                      <label className="form-check-label">Enable Two-Factor Authentication</label>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" defaultChecked />
                      <label className="form-check-label">Require Strong Passwords</label>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" defaultChecked />
                      <label className="form-check-label">Session Timeout (30 minutes)</label>
                    </div>
                  </div>
                </Col>
              </Row>
              <div className="text-center mt-4">
                <Button variant="primary" className="me-2">
                  <Save className="me-2" size={16} />
                  Save Settings
                </Button>
                <Button variant="outline-secondary">
                  <RefreshCw className="me-2" size={16} />
                  Reset to Defaults
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Tab.Pane>
      </Tab.Content>
    </Container>
  );
}
