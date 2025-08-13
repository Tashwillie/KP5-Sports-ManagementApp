'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Badge, Alert, ProgressBar, Table, Modal, Form, Nav, Tab } from 'react-bootstrap';
import {
  Server,
  Shield,
  Activity,
  Settings,
  Users,
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
  Unarchive,
  Copy,
  Share,
  ExternalLink,
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  BarChart3,
  PieChart,
  LineChart,
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
  LogOut,
  FileText,
  Filter
} from 'lucide-react';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkStatus: 'online' | 'offline';
  databaseStatus: 'connected' | 'disconnected' | 'error';
  lastBackup: Date;
  securityStatus: 'secure' | 'vulnerable' | 'compromised';
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  threshold: number;
  status: 'normal' | 'warning' | 'critical';
}

interface SecurityAlert {
  id: string;
  type: 'login_attempt' | 'permission_change' | 'data_access' | 'system_change' | 'security_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: Date;
  user?: string;
  ipAddress?: string;
  resolved: boolean;
}

interface SystemLog {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: Date;
  source: string;
  userId?: string;
  details?: any;
}

interface BackupStatus {
  id: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'completed' | 'in_progress' | 'failed' | 'scheduled';
  size: number;
  timestamp: Date;
  duration: number;
  location: string;
}

export default function SystemManagementDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: 'healthy',
    uptime: 7200, // 2 hours in seconds
    cpuUsage: 45,
    memoryUsage: 68,
    diskUsage: 72,
    networkStatus: 'online',
    databaseStatus: 'connected',
    lastBackup: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    securityStatus: 'secure'
  });

  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([
    { name: 'Response Time', value: 245, unit: 'ms', change: -12, trend: 'up', threshold: 500, status: 'normal' },
    { name: 'Throughput', value: 1250, unit: 'req/s', change: 8, trend: 'up', threshold: 1000, status: 'normal' },
    { name: 'Error Rate', value: 0.8, unit: '%', change: -15, trend: 'up', threshold: 2, status: 'normal' },
    { name: 'Active Users', value: 342, unit: 'users', change: 5, trend: 'up', threshold: 500, status: 'normal' }
  ]);

  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([
    {
      id: '1',
      type: 'login_attempt',
      severity: 'medium',
      description: 'Multiple failed login attempts from IP 192.168.1.100',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      ipAddress: '192.168.1.100',
      resolved: false
    },
    {
      id: '2',
      type: 'permission_change',
      severity: 'high',
      description: 'User role changed from Player to Club Admin',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      user: 'john.doe@example.com',
      resolved: false
    }
  ]);

  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([
    {
      id: '1',
      level: 'info',
      message: 'System backup completed successfully',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
      source: 'backup-service'
    },
    {
      id: '2',
      level: 'warning',
      message: 'High memory usage detected',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      source: 'monitoring-service'
    }
  ]);

  const [backupStatus, setBackupStatus] = useState<BackupStatus[]>([
    {
      id: '1',
      type: 'full',
      status: 'completed',
      size: 2048, // MB
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
      duration: 1800, // seconds
      location: '/backups/full_20250115_060000.tar.gz'
    }
  ]);

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'normal':
      case 'online':
      case 'connected':
      case 'secure':
      case 'completed':
        return 'success';
      case 'warning':
      case 'vulnerable':
        return 'warning';
      case 'critical':
      case 'offline':
      case 'disconnected':
      case 'error':
      case 'compromised':
      case 'failed':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'info';
      case 'medium': return 'warning';
      case 'high': return 'danger';
      case 'critical': return 'danger';
      default: return 'secondary';
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const handleRefresh = () => {
    // Simulate refresh
    setSystemHealth(prev => ({
      ...prev,
      uptime: prev.uptime + 60,
      cpuUsage: Math.floor(Math.random() * 30) + 30,
      memoryUsage: Math.floor(Math.random() * 20) + 60
    }));
  };

  const handleBackup = () => {
    setShowBackupModal(true);
  };

  const handleSecurityScan = () => {
    // Simulate security scan
    const newAlert: SecurityAlert = {
      id: Date.now().toString(),
      type: 'security_breach',
      severity: 'low',
      description: 'Security scan completed - no threats detected',
      timestamp: new Date(),
      resolved: true
    };
    setSecurityAlerts(prev => [newAlert, ...prev]);
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <Server className="me-2" />
            System Management Dashboard
          </h2>
          <p className="text-muted mb-0">Monitor and manage system health, performance, and security</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={handleRefresh}>
            <RefreshCw className="me-2" size={16} />
            Refresh
          </Button>
          <Button variant="outline-success" onClick={handleBackup}>
            <Download className="me-2" size={16} />
            Backup
          </Button>
          <Button variant="outline-warning" onClick={handleSecurityScan}>
            <Shield className="me-2" size={16} />
            Security Scan
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <div className={`d-inline-flex align-items-center justify-content-center rounded-circle mb-3 ${getStatusColor(systemHealth.status)}`} 
                   style={{width: '60px', height: '60px', backgroundColor: 'rgba(var(--bs-success-rgb), 0.1)'}}>
                <Server size={24} />
              </div>
              <h6 className="mb-1">System Status</h6>
              <Badge bg={getStatusColor(systemHealth.status)} className="mb-2">
                {systemHealth.status.charAt(0).toUpperCase() + systemHealth.status.slice(1)}
              </Badge>
              <p className="text-muted small mb-0">Uptime: {formatUptime(systemHealth.uptime)}</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 text-primary" 
                   style={{width: '60px', height: '60px', backgroundColor: 'rgba(var(--bs-primary-rgb), 0.1)'}}>
                <Cpu size={24} />
              </div>
              <h6 className="mb-1">CPU Usage</h6>
              <h4 className="mb-2">{systemHealth.cpuUsage}%</h4>
              <ProgressBar 
                now={systemHealth.cpuUsage} 
                variant={systemHealth.cpuUsage > 80 ? 'danger' : systemHealth.cpuUsage > 60 ? 'warning' : 'success'}
                className="mb-2"
              />
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 text-info" 
                   style={{width: '60px', height: '60px', backgroundColor: 'rgba(var(--bs-info-rgb), 0.1)'}}>
                <MemoryStick size={24} />
              </div>
              <h6 className="mb-1">Memory Usage</h6>
              <h4 className="mb-2">{systemHealth.memoryUsage}%</h4>
              <ProgressBar 
                now={systemHealth.memoryUsage} 
                variant={systemHealth.memoryUsage > 80 ? 'danger' : systemHealth.memoryUsage > 60 ? 'warning' : 'success'}
                className="mb-2"
              />
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 text-warning" 
                   style={{width: '60px', height: '60px', backgroundColor: 'rgba(var(--bs-warning-rgb), 0.1)'}}>
                <HardDrive size={24} />
              </div>
              <h6 className="mb-1">Disk Usage</h6>
              <h4 className="mb-2">{systemHealth.diskUsage}%</h4>
              <ProgressBar 
                now={systemHealth.diskUsage} 
                variant={systemHealth.diskUsage > 80 ? 'danger' : systemHealth.diskUsage > 60 ? 'warning' : 'success'}
                className="mb-2"
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Navigation Tabs */}
      <Nav variant="tabs" className="mb-4" onSelect={(k) => setActiveTab(k || 'overview')}>
        <Nav.Item>
          <Nav.Link eventKey="overview" active={activeTab === 'overview'}>
            <Activity className="me-2" size={16} />
            Overview
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="performance" active={activeTab === 'performance'}>
            <BarChart3 className="me-2" size={16} />
            Performance
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="security" active={activeTab === 'security'}>
            <Shield className="me-2" size={16} />
            Security
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="backups" active={activeTab === 'backups'}>
            <Download className="me-2" size={16} />
            Backups
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="logs" active={activeTab === 'logs'}>
            <FileText className="me-2" size={16} />
            System Logs
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
                    Performance Metrics
                  </h6>
                </Card.Header>
                <Card.Body>
                  <Row>
                    {performanceMetrics.map((metric, index) => (
                      <Col md={6} key={index} className="mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-1">{metric.name}</h6>
                            <h4 className="mb-0">{metric.value} {metric.unit}</h4>
                          </div>
                          <div className="text-end">
                            <Badge bg={getStatusColor(metric.status)} className="mb-2">
                              {metric.status}
                            </Badge>
                            <div className={`d-flex align-items-center ${metric.trend === 'up' ? 'text-success' : metric.trend === 'down' ? 'text-danger' : 'text-muted'}`}>
                              {metric.trend === 'up' ? <ArrowUp size={16} /> : metric.trend === 'down' ? <ArrowDown size={16} /> : <Minus size={16} />}
                              <span className="ms-1">{Math.abs(metric.change)}%</span>
                            </div>
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
                    <Shield className="me-2" size={16} />
                    Security Status
                  </h6>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span>Database</span>
                      <Badge bg={getStatusColor(systemHealth.databaseStatus)}>
                        {systemHealth.databaseStatus}
                      </Badge>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span>Network</span>
                      <Badge bg={getStatusColor(systemHealth.networkStatus)}>
                        {systemHealth.networkStatus}
                      </Badge>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span>Security</span>
                      <Badge bg={getStatusColor(systemHealth.securityStatus)}>
                        {systemHealth.securityStatus}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-center">
                    <small className="text-muted">
                      Last backup: {systemHealth.lastBackup.toLocaleString()}
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab.Pane>

        {/* Performance Tab */}
        <Tab.Pane eventKey="performance" active={activeTab === 'performance'}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">
                <BarChart3 className="me-2" size={16} />
                Detailed Performance Metrics
              </h6>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Current Value</th>
                    <th>Threshold</th>
                    <th>Status</th>
                    <th>Trend</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceMetrics.map((metric, index) => (
                    <tr key={index}>
                      <td>{metric.name}</td>
                      <td>{metric.value} {metric.unit}</td>
                      <td>{metric.threshold} {metric.unit}</td>
                      <td>
                        <Badge bg={getStatusColor(metric.status)}>
                          {metric.status}
                        </Badge>
                      </td>
                      <td>
                        <div className={`d-flex align-items-center ${metric.trend === 'up' ? 'text-success' : metric.trend === 'down' ? 'text-danger' : 'text-muted'}`}>
                          {metric.trend === 'up' ? <ArrowUp size={16} /> : metric.trend === 'down' ? <ArrowDown size={16} /> : <Minus size={16} />}
                          <span className="ms-1">{Math.abs(metric.change)}%</span>
                        </div>
                      </td>
                      <td>
                        <Button variant="outline-primary" size="sm">
                          <Eye size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab.Pane>

        {/* Security Tab */}
        <Tab.Pane eventKey="security" active={activeTab === 'security'}>
          <Row>
            <Col md={8}>
              <Card className="mb-4">
                <Card.Header>
                  <h6 className="mb-0">
                    <AlertTriangle className="me-2" size={16} />
                    Security Alerts
                  </h6>
                </Card.Header>
                <Card.Body>
                  {securityAlerts.length === 0 ? (
                    <Alert variant="success">
                      <CheckCircle className="me-2" />
                      No security alerts at this time
                    </Alert>
                  ) : (
                    <div>
                      {securityAlerts.map(alert => (
                        <Alert key={alert.id} variant={getSeverityColor(alert.severity)} className="mb-3">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h6 className="mb-1">{alert.description}</h6>
                              <small className="text-muted">
                                {alert.timestamp.toLocaleString()} • {alert.type.replace('_', ' ')}
                                {alert.user && ` • User: ${alert.user}`}
                                {alert.ipAddress && ` • IP: ${alert.ipAddress}`}
                              </small>
                            </div>
                            <div>
                              <Badge bg={getSeverityColor(alert.severity)} className="me-2">
                                {alert.severity}
                              </Badge>
                              {!alert.resolved && (
                                <Button variant="outline-success" size="sm">
                                  <CheckCircle size={14} />
                                </Button>
                              )}
                            </div>
                          </div>
                        </Alert>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Header>
                  <h6 className="mb-0">
                    <Shield className="me-2" size={16} />
                    Security Actions
                  </h6>
                </Card.Header>
                <Card.Body>
                  <div className="d-grid gap-2">
                    <Button variant="outline-warning" onClick={handleSecurityScan}>
                      <Shield className="me-2" size={16} />
                      Run Security Scan
                    </Button>
                    <Button variant="outline-info">
                      <Users className="me-2" size={16} />
                      Review Permissions
                    </Button>
                    <Button variant="outline-secondary">
                      <Lock className="me-2" size={16} />
                      Access Logs
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab.Pane>

        {/* Backups Tab */}
        <Tab.Pane eventKey="backups" active={activeTab === 'backups'}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                <Download className="me-2" size={16} />
                Backup Status
              </h6>
              <Button variant="primary" size="sm" onClick={handleBackup}>
                <Plus className="me-2" size={16} />
                New Backup
              </Button>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Size</th>
                    <th>Duration</th>
                    <th>Timestamp</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {backupStatus.map(backup => (
                    <tr key={backup.id}>
                      <td>
                        <Badge bg="info">{backup.type}</Badge>
                      </td>
                      <td>
                        <Badge bg={getStatusColor(backup.status)}>
                          {backup.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td>{formatFileSize(backup.size * 1024 * 1024)}</td>
                      <td>{Math.floor(backup.duration / 60)}m {backup.duration % 60}s</td>
                      <td>{backup.timestamp.toLocaleString()}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button variant="outline-primary" size="sm">
                            <Download size={14} />
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

        {/* System Logs Tab */}
        <Tab.Pane eventKey="logs" active={activeTab === 'logs'}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">
                <FileText className="me-2" size={16} />
                System Logs
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
              <div>
                {systemLogs.map(log => (
                  <div key={log.id} className={`p-3 mb-2 rounded border-start border-${getStatusColor(log.level)}`} 
                       style={{borderLeftWidth: '4px', backgroundColor: 'rgba(var(--bs-light-rgb), 0.5)'}}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="mb-1">{log.message}</h6>
                        <small className="text-muted">
                          {log.timestamp.toLocaleString()} • {log.source} • {log.level}
                        </small>
                      </div>
                      <Badge bg={getStatusColor(log.level)}>
                        {log.level}
                      </Badge>
                    </div>
                  </div>
                ))}
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
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>System Name</Form.Label>
                      <Form.Control type="text" defaultValue="KP5 Academy System" />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Timezone</Form.Label>
                      <Form.Select defaultValue="UTC">
                        <option value="UTC">UTC</option>
                        <option value="EST">Eastern Time</option>
                        <option value="PST">Pacific Time</option>
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Language</Form.Label>
                      <Form.Select defaultValue="en">
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                      </Form.Select>
                    </Form.Group>
                  </Form>
                </Col>
                <Col md={6}>
                  <h6 className="mb-3">Monitoring Settings</h6>
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>CPU Warning Threshold (%)</Form.Label>
                      <Form.Control type="number" defaultValue={80} min={50} max={95} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Memory Warning Threshold (%)</Form.Label>
                      <Form.Control type="number" defaultValue={80} min={50} max={95} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Disk Warning Threshold (%)</Form.Label>
                      <Form.Control type="number" defaultValue={80} min={50} max={95} />
                    </Form.Group>
                  </Form>
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

      {/* Modals */}
      <Modal show={showBackupModal} onHide={() => setShowBackupModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <Download className="me-2" size={16} />
            Create New Backup
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Backup Type</Form.Label>
              <Form.Select>
                <option value="full">Full Backup</option>
                <option value="incremental">Incremental Backup</option>
                <option value="differential">Differential Backup</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Include Database</Form.Label>
              <Form.Check type="checkbox" defaultChecked />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Include User Files</Form.Label>
              <Form.Check type="checkbox" defaultChecked />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Compression Level</Form.Label>
              <Form.Select defaultValue="medium">
                <option value="low">Low (Faster)</option>
                <option value="medium">Medium (Balanced)</option>
                <option value="high">High (Smaller)</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBackupModal(false)}>
            Cancel
          </Button>
          <Button variant="primary">
            <Download className="me-2" size={16} />
            Start Backup
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
