'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Lock, 
  Users, 
  Activity, 
  Download,
  Filter,
  Calendar,
  MapPin,
  Smartphone,
  Monitor,
  Globe,
  UserCheck,
  Key,
  Database,
  Server,
  FileText,
  Clock
} from 'lucide-react';

interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'login' | 'logout' | 'permission_change' | 'data_access' | 'security_alert' | 'failed_login';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user: {
    id: string;
    email: string;
    role: string;
  };
  details: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  status: 'active' | 'resolved' | 'investigating';
}

interface ComplianceMetric {
  id: string;
  name: string;
  description: string;
  status: 'compliant' | 'warning' | 'non_compliant';
  percentage: number;
  lastChecked: string;
  requirements: string[];
  issues?: string[];
}

interface SecurityAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  category: 'authentication' | 'data_breach' | 'suspicious_activity' | 'system_vulnerability';
  status: 'open' | 'investigating' | 'resolved';
  affectedUsers?: number;
  recommendation: string;
}

interface SecurityAuditProps {
  userRole: string;
}

export const SecurityAudit: React.FC<SecurityAuditProps> = ({ userRole }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'audit_log' | 'compliance' | 'alerts'>('overview');
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [complianceMetrics, setComplianceMetrics] = useState<ComplianceMetric[]>([]);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  // Mock data
  useEffect(() => {
    const mockEvents: SecurityEvent[] = [
      {
        id: 'evt-001',
        timestamp: '2024-01-15T14:30:00Z',
        type: 'failed_login',
        severity: 'medium',
        user: {
          id: 'unknown',
          email: 'attempted.user@example.com',
          role: 'unknown'
        },
        details: 'Multiple failed login attempts detected',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        location: 'New York, USA',
        status: 'investigating'
      },
      {
        id: 'evt-002',
        timestamp: '2024-01-15T13:45:00Z',
        type: 'permission_change',
        severity: 'high',
        user: {
          id: 'admin-001',
          email: 'admin@kp5academy.com',
          role: 'SUPER_ADMIN'
        },
        details: 'User role changed from PLAYER to COACH',
        ipAddress: '10.0.0.5',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
        location: 'San Francisco, USA',
        status: 'resolved'
      },
      {
        id: 'evt-003',
        timestamp: '2024-01-15T12:20:00Z',
        type: 'data_access',
        severity: 'low',
        user: {
          id: 'coach-001',
          email: 'coach@kp5academy.com',
          role: 'COACH'
        },
        details: 'Accessed sensitive player data',
        ipAddress: '172.16.0.10',
        userAgent: 'Mozilla/5.0 (Android 10; Mobile)',
        location: 'London, UK',
        status: 'active'
      }
    ];

    const mockAlerts: SecurityAlert[] = [
      {
        id: 'alert-001',
        title: 'Suspicious Login Pattern Detected',
        description: 'Multiple login attempts from different geographical locations within a short time frame.',
        severity: 'high',
        timestamp: '2024-01-15T14:30:00Z',
        category: 'suspicious_activity',
        status: 'investigating',
        affectedUsers: 3,
        recommendation: 'Enable multi-factor authentication for affected accounts'
      },
      {
        id: 'alert-002',
        title: 'Unusual Data Access Pattern',
        description: 'Large volume of player data accessed outside normal business hours.',
        severity: 'medium',
        timestamp: '2024-01-15T02:15:00Z',
        category: 'data_breach',
        status: 'open',
        affectedUsers: 1,
        recommendation: 'Review access logs and implement data access monitoring'
      },
      {
        id: 'alert-003',
        title: 'System Vulnerability Detected',
        description: 'Outdated security patches detected on authentication service.',
        severity: 'critical',
        timestamp: '2024-01-14T18:45:00Z',
        category: 'system_vulnerability',
        status: 'open',
        recommendation: 'Apply security patches immediately'
      }
    ];

    const mockCompliance: ComplianceMetric[] = [
      {
        id: 'gdpr',
        name: 'GDPR Compliance',
        description: 'General Data Protection Regulation compliance',
        status: 'compliant',
        percentage: 95,
        lastChecked: '2024-01-15T09:00:00Z',
        requirements: [
          'Data encryption at rest',
          'User consent management',
          'Right to be forgotten',
          'Data breach notification'
        ]
      },
      {
        id: 'iso27001',
        name: 'ISO 27001',
        description: 'Information Security Management System',
        status: 'warning',
        percentage: 78,
        lastChecked: '2024-01-14T15:30:00Z',
        requirements: [
          'Security policy documentation',
          'Risk assessment procedures',
          'Incident response plan',
          'Security training program'
        ],
        issues: [
          'Security training completion rate below 80%',
          'Incident response plan needs update'
        ]
      },
      {
        id: 'soc2',
        name: 'SOC 2 Type II',
        description: 'Service Organization Control 2',
        status: 'compliant',
        percentage: 92,
        lastChecked: '2024-01-13T12:00:00Z',
        requirements: [
          'Security controls',
          'Availability monitoring',
          'Processing integrity',
          'Confidentiality measures'
        ]
      }
    ];

    setEvents(mockEvents);
    setAlerts(mockAlerts);
    setComplianceMetrics(mockCompliance);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-danger';
      case 'high': return 'text-warning';
      case 'medium': return 'text-info';
      case 'low': return 'text-success';
      default: return 'text-muted';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-danger';
      case 'high': return 'bg-warning';
      case 'medium': return 'bg-info';
      case 'low': return 'bg-success';
      default: return 'bg-secondary';
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-success';
      case 'warning': return 'text-warning';
      case 'non_compliant': return 'text-danger';
      default: return 'text-muted';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login': return <UserCheck size={16} className="text-success" />;
      case 'logout': return <UserCheck size={16} className="text-muted" />;
      case 'failed_login': return <XCircle size={16} className="text-danger" />;
      case 'permission_change': return <Key size={16} className="text-warning" />;
      case 'data_access': return <Database size={16} className="text-info" />;
      case 'security_alert': return <AlertTriangle size={16} className="text-danger" />;
      default: return <Activity size={16} className="text-muted" />;
    }
  };

  const OverviewTab = () => (
    <div>
      {/* Security Metrics */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="p-3 rounded bg-success text-white me-3">
                  <Shield size={24} />
                </div>
                <div>
                  <h3 className="h4 mb-0 text-success">94%</h3>
                  <p className="text-muted mb-0">Security Score</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="p-3 rounded bg-warning text-white me-3">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="h4 mb-0 text-warning">{alerts.filter(a => a.status === 'open').length}</h3>
                  <p className="text-muted mb-0">Active Alerts</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="p-3 rounded bg-info text-white me-3">
                  <Activity size={24} />
                </div>
                <div>
                  <h3 className="h4 mb-0 text-info">{events.length}</h3>
                  <p className="text-muted mb-0">Security Events</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="p-3 rounded bg-primary text-white me-3">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <h3 className="h4 mb-0 text-primary">
                    {complianceMetrics.filter(c => c.status === 'compliant').length}
                  </h3>
                  <p className="text-muted mb-0">Compliance Standards</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent">
              <h5 className="mb-0">Critical Security Alerts</h5>
            </div>
            <div className="card-body">
              {alerts.filter(alert => alert.severity === 'critical' || alert.severity === 'high').map((alert) => (
                <div key={alert.id} className="alert alert-warning d-flex align-items-center">
                  <AlertTriangle size={20} className="me-3" />
                  <div className="flex-grow-1">
                    <strong>{alert.title}</strong>
                    <p className="mb-0 small">{alert.description}</p>
                  </div>
                  <span className={`badge ${getSeverityBadge(alert.severity)} ms-3`}>
                    {alert.severity.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent">
              <h5 className="mb-0">Quick Security Actions</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary">
                  <Shield size={16} className="me-2" />
                  Run Security Scan
                </button>
                <button className="btn btn-outline-info">
                  <Download size={16} className="me-2" />
                  Generate Audit Report
                </button>
                <button className="btn btn-outline-warning">
                  <Lock size={16} className="me-2" />
                  Force Password Reset
                </button>
                <button className="btn btn-outline-danger">
                  <AlertTriangle size={16} className="me-2" />
                  Emergency Lockdown
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent">
              <h5 className="mb-0">System Health</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Database Security</span>
                  <span className="text-success">Healthy</span>
                </div>
                <div className="progress" style={{ height: '4px' }}>
                  <div className="progress-bar bg-success" style={{ width: '95%' }}></div>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>API Security</span>
                  <span className="text-warning">Warning</span>
                </div>
                <div className="progress" style={{ height: '4px' }}>
                  <div className="progress-bar bg-warning" style={{ width: '78%' }}></div>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Authentication</span>
                  <span className="text-success">Secure</span>
                </div>
                <div className="progress" style={{ height: '4px' }}>
                  <div className="progress-bar bg-success" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div>
                <div className="d-flex justify-content-between">
                  <span>Network Security</span>
                  <span className="text-success">Protected</span>
                </div>
                <div className="progress" style={{ height: '4px' }}>
                  <div className="progress-bar bg-success" style={{ width: '88%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const AuditLogTab = () => (
    <div>
      {/* Filters */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value as any)}
                  >
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                  >
                    <option value="all">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <button className="btn btn-outline-primary">
                    <Filter size={16} className="me-1" />
                    Advanced Filters
                  </button>
                </div>
                <div className="col-md-3">
                  <button className="btn btn-primary">
                    <Download size={16} className="me-1" />
                    Export Log
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent">
              <h5 className="mb-0">Security Events</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Time</th>
                      <th>Event</th>
                      <th>User</th>
                      <th>Details</th>
                      <th>Location</th>
                      <th>Severity</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event.id}>
                        <td>
                          <small>{new Date(event.timestamp).toLocaleString()}</small>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            {getEventIcon(event.type)}
                            <span className="ms-2">{event.type.replace('_', ' ')}</span>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div className="fw-medium">{event.user.email}</div>
                            <small className="text-muted">{event.user.role}</small>
                          </div>
                        </td>
                        <td>
                          <span className="small">{event.details}</span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <MapPin size={14} className="me-1" />
                            <small>{event.location || 'Unknown'}</small>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${getSeverityBadge(event.severity)}`}>
                            {event.severity}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${
                            event.status === 'resolved' ? 'bg-success' :
                            event.status === 'investigating' ? 'bg-warning' : 'bg-info'
                          }`}>
                            {event.status}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary">
                            <Eye size={14} />
                          </button>
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

  const ComplianceTab = () => (
    <div className="row">
      {complianceMetrics.map((metric) => (
        <div key={metric.id} className="col-xl-4 col-lg-6 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h6 className="mb-1">{metric.name}</h6>
                  <p className="text-muted small mb-0">{metric.description}</p>
                </div>
                <span className={`badge ${
                  metric.status === 'compliant' ? 'bg-success' :
                  metric.status === 'warning' ? 'bg-warning' : 'bg-danger'
                }`}>
                  {metric.status}
                </span>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="small">Compliance Level</span>
                  <span className="small fw-medium">{metric.percentage}%</span>
                </div>
                <div className="progress">
                  <div
                    className={`progress-bar ${
                      metric.percentage >= 90 ? 'bg-success' :
                      metric.percentage >= 70 ? 'bg-warning' : 'bg-danger'
                    }`}
                    style={{ width: `${metric.percentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block mb-2">Requirements:</small>
                <ul className="list-unstyled mb-0">
                  {metric.requirements.map((req, index) => (
                    <li key={index} className="small mb-1">
                      <CheckCircle size={12} className="text-success me-1" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              {metric.issues && metric.issues.length > 0 && (
                <div className="mb-3">
                  <small className="text-muted d-block mb-2">Issues:</small>
                  <ul className="list-unstyled mb-0">
                    {metric.issues.map((issue, index) => (
                      <li key={index} className="small mb-1 text-warning">
                        <AlertTriangle size={12} className="me-1" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                <small className="text-muted">
                  Last checked: {new Date(metric.lastChecked).toLocaleDateString()}
                </small>
                <button className="btn btn-sm btn-outline-primary">
                  <Eye size={14} className="me-1" />
                  Details
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const AlertsTab = () => (
    <div className="row">
      {alerts.map((alert) => (
        <div key={alert.id} className="col-12 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center mb-2">
                    <AlertTriangle size={20} className={getSeverityColor(alert.severity)} />
                    <h6 className="mb-0 ms-2">{alert.title}</h6>
                    <span className={`badge ${getSeverityBadge(alert.severity)} ms-2`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-muted mb-2">{alert.description}</p>
                  <div className="row">
                    <div className="col-md-3">
                      <small className="text-muted">Category:</small>
                      <div className="fw-medium">{alert.category.replace('_', ' ')}</div>
                    </div>
                    <div className="col-md-3">
                      <small className="text-muted">Status:</small>
                      <div className="fw-medium">{alert.status}</div>
                    </div>
                    <div className="col-md-3">
                      <small className="text-muted">Affected Users:</small>
                      <div className="fw-medium">{alert.affectedUsers || 0}</div>
                    </div>
                    <div className="col-md-3">
                      <small className="text-muted">Time:</small>
                      <div className="fw-medium">{new Date(alert.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-light rounded">
                    <small className="text-muted">Recommendation:</small>
                    <div className="fw-medium">{alert.recommendation}</div>
                  </div>
                </div>
                <div className="ms-3">
                  <div className="btn-group-vertical">
                    <button className="btn btn-sm btn-outline-primary">
                      <Eye size={14} />
                    </button>
                    <button className="btn btn-sm btn-outline-success">
                      <CheckCircle size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="mb-1">Security & Audit</h4>
                  <p className="text-muted mb-0">Enterprise security monitoring and compliance tracking</p>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-outline-primary">
                    <Download size={16} className="me-1" />
                    Export Report
                  </button>
                  <button className="btn btn-danger">
                    <AlertTriangle size={16} className="me-1" />
                    Security Scan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-pills nav-fill">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <Shield size={16} className="me-1" />
                Overview
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'audit_log' ? 'active' : ''}`}
                onClick={() => setActiveTab('audit_log')}
              >
                <Activity size={16} className="me-1" />
                Audit Log
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'compliance' ? 'active' : ''}`}
                onClick={() => setActiveTab('compliance')}
              >
                <CheckCircle size={16} className="me-1" />
                Compliance
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'alerts' ? 'active' : ''}`}
                onClick={() => setActiveTab('alerts')}
              >
                <AlertTriangle size={16} className="me-1" />
                Alerts
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'audit_log' && <AuditLogTab />}
      {activeTab === 'compliance' && <ComplianceTab />}
      {activeTab === 'alerts' && <AlertsTab />}
    </div>
  );
};
