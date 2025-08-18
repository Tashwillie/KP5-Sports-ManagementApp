'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileBarChart, 
  Download, 
  Filter, 
  Calendar, 
  Share2, 
  Settings, 
  Plus,
  Search,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Target,
  Trophy,
  DollarSign,
  Clock,
  Eye,
  Edit3,
  Trash2,
  Mail,
  Play
} from 'lucide-react';
import { toast } from 'sonner';

interface Report {
  id: string;
  name: string;
  description: string;
  type: 'financial' | 'performance' | 'engagement' | 'operational' | 'custom';
  status: 'active' | 'draft' | 'archived';
  lastUpdated: string;
  createdBy: string;
  tags: string[];
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    recipients: string[];
    enabled: boolean;
  };
  visualizations: {
    charts: number;
    tables: number;
    kpis: number;
  };
  dataSource: string[];
}

interface CustomQuery {
  id: string;
  name: string;
  sql: string;
  parameters: any[];
  results?: any[];
}

interface ExportFormat {
  type: 'pdf' | 'excel' | 'csv' | 'pptx';
  name: string;
  icon: React.ReactNode;
  description: string;
}

interface BusinessIntelligenceProps {
  userRole: string;
}

export const BusinessIntelligence: React.FC<BusinessIntelligenceProps> = ({ userRole }) => {
  const [activeTab, setActiveTab] = useState<'reports' | 'builder' | 'exports' | 'analytics'>('reports');
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showReportBuilder, setShowReportBuilder] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Mock reports data
  useEffect(() => {
    const mockReports: Report[] = [
      {
        id: 'fin-001',
        name: 'Revenue Analysis Q4',
        description: 'Comprehensive revenue breakdown and forecasting',
        type: 'financial',
        status: 'active',
        lastUpdated: '2024-01-15T10:30:00Z',
        createdBy: 'John Smith',
        tags: ['revenue', 'quarterly', 'forecast'],
        schedule: {
          frequency: 'monthly',
          recipients: ['cfo@kp5academy.com', 'admin@kp5academy.com'],
          enabled: true
        },
        visualizations: { charts: 5, tables: 3, kpis: 8 },
        dataSource: ['financial_transactions', 'subscriptions', 'tournaments']
      },
      {
        id: 'perf-001',
        name: 'Player Performance Metrics',
        description: 'Individual and team performance analytics',
        type: 'performance',
        status: 'active',
        lastUpdated: '2024-01-14T15:45:00Z',
        createdBy: 'Sarah Johnson',
        tags: ['players', 'performance', 'statistics'],
        visualizations: { charts: 8, tables: 2, kpis: 12 },
        dataSource: ['matches', 'player_stats', 'team_performance']
      },
      {
        id: 'eng-001',
        name: 'User Engagement Dashboard',
        description: 'User activity, retention, and engagement metrics',
        type: 'engagement',
        status: 'active',
        lastUpdated: '2024-01-13T09:20:00Z',
        createdBy: 'Mike Davis',
        tags: ['users', 'engagement', 'retention'],
        schedule: {
          frequency: 'weekly',
          recipients: ['marketing@kp5academy.com'],
          enabled: true
        },
        visualizations: { charts: 6, tables: 4, kpis: 10 },
        dataSource: ['user_activity', 'sessions', 'events']
      },
      {
        id: 'ops-001',
        name: 'Operational Efficiency Report',
        description: 'System performance and operational metrics',
        type: 'operational',
        status: 'draft',
        lastUpdated: '2024-01-12T14:30:00Z',
        createdBy: 'Alex Wilson',
        tags: ['operations', 'efficiency', 'system'],
        visualizations: { charts: 4, tables: 6, kpis: 6 },
        dataSource: ['system_logs', 'performance_metrics', 'resource_usage']
      },
      {
        id: 'cust-001',
        name: 'Custom Tournament Analysis',
        description: 'Deep dive into tournament participation and outcomes',
        type: 'custom',
        status: 'active',
        lastUpdated: '2024-01-11T11:15:00Z',
        createdBy: 'Emma Brown',
        tags: ['tournaments', 'participation', 'custom'],
        visualizations: { charts: 7, tables: 3, kpis: 5 },
        dataSource: ['tournaments', 'matches', 'registrations']
      }
    ];
    setReports(mockReports);
    setFilteredReports(mockReports);
  }, []);

  // Filter reports based on search and type
  useEffect(() => {
    let filtered = reports;

    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(report => report.type === selectedType);
    }

    setFilteredReports(filtered);
  }, [searchTerm, selectedType, reports]);

  const exportFormats: ExportFormat[] = [
    {
      type: 'pdf',
      name: 'PDF Report',
      icon: <FileBarChart size={20} />,
      description: 'Professional formatted report'
    },
    {
      type: 'excel',
      name: 'Excel Workbook',
      icon: <BarChart3 size={20} />,
      description: 'Interactive spreadsheet with charts'
    },
    {
      type: 'csv',
      name: 'CSV Data',
      icon: <Download size={20} />,
      description: 'Raw data for further analysis'
    },
    {
      type: 'pptx',
      name: 'PowerPoint',
      icon: <PieChart size={20} />,
      description: 'Presentation-ready slides'
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'financial': return 'bg-success';
      case 'performance': return 'bg-primary';
      case 'engagement': return 'bg-info';
      case 'operational': return 'bg-warning';
      case 'custom': return 'bg-secondary';
      default: return 'bg-light';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'financial': return <DollarSign size={16} />;
      case 'performance': return <Target size={16} />;
      case 'engagement': return <Users size={16} />;
      case 'operational': return <Settings size={16} />;
      case 'custom': return <Edit3 size={16} />;
      default: return <BarChart3 size={16} />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success';
      case 'draft': return 'bg-warning';
      case 'archived': return 'bg-secondary';
      default: return 'bg-light';
    }
  };

  const handleExportReport = async (reportId: string, format: string) => {
    toast.success(`Exporting report as ${format.toUpperCase()}...`);
    // Simulate export process
    setTimeout(() => {
      toast.success(`Report exported successfully as ${format.toUpperCase()}`);
    }, 2000);
  };

  const handleScheduleReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      setSelectedReport(report);
      // Open scheduling modal (would be implemented)
      toast.info('Schedule configuration opened');
    }
  };

  const handleRunReport = (reportId: string) => {
    toast.info('Generating report...');
    setTimeout(() => {
      toast.success('Report generated successfully');
    }, 1500);
  };

  const ReportsTab = () => (
    <div>
      {/* Controls */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <div className="input-group">
                    <span className="input-group-text">
                      <Search size={16} />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="financial">Financial</option>
                    <option value="performance">Performance</option>
                    <option value="engagement">Engagement</option>
                    <option value="operational">Operational</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <button
                    className="btn btn-primary w-100"
                    onClick={() => setShowReportBuilder(true)}
                  >
                    <Plus size={16} className="me-1" />
                    New Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="row">
        {filteredReports.map((report) => (
          <div key={report.id} className="col-xl-4 col-lg-6 mb-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="d-flex align-items-center">
                    <div className={`p-2 rounded me-3 ${getTypeColor(report.type)} text-white`}>
                      {getTypeIcon(report.type)}
                    </div>
                    <div>
                      <h6 className="mb-0">{report.name}</h6>
                      <small className="text-muted">by {report.createdBy}</small>
                    </div>
                  </div>
                  <span className={`badge ${getStatusBadge(report.status)}`}>
                    {report.status}
                  </span>
                </div>

                <p className="text-muted small mb-3">{report.description}</p>

                {/* Visualizations Summary */}
                <div className="row text-center mb-3">
                  <div className="col-4">
                    <div className="small text-muted">Charts</div>
                    <div className="fw-medium">{report.visualizations.charts}</div>
                  </div>
                  <div className="col-4">
                    <div className="small text-muted">Tables</div>
                    <div className="fw-medium">{report.visualizations.tables}</div>
                  </div>
                  <div className="col-4">
                    <div className="small text-muted">KPIs</div>
                    <div className="fw-medium">{report.visualizations.kpis}</div>
                  </div>
                </div>

                {/* Tags */}
                <div className="mb-3">
                  {report.tags.map((tag, index) => (
                    <span key={index} className="badge bg-light text-dark me-1 mb-1">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Schedule Info */}
                {report.schedule && (
                  <div className="d-flex align-items-center mb-3 small text-muted">
                    <Clock size={14} className="me-1" />
                    Scheduled {report.schedule.frequency}
                    {report.schedule.enabled && (
                      <span className="badge bg-success ms-2">Active</span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="btn-group w-100" role="group">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => handleRunReport(report.id)}
                  >
                    <Play size={14} className="me-1" />
                    Run
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => {/* View report */}}
                  >
                    <Eye size={14} className="me-1" />
                    View
                  </button>
                  <div className="btn-group" role="group">
                    <button
                      className="btn btn-outline-info btn-sm dropdown-toggle"
                      data-bs-toggle="dropdown"
                    >
                      <Download size={14} />
                    </button>
                    <ul className="dropdown-menu">
                      {exportFormats.map((format) => (
                        <li key={format.type}>
                          <button
                            className="dropdown-item"
                            onClick={() => handleExportReport(report.id, format.type)}
                          >
                            <div className="d-flex align-items-center">
                              {format.icon}
                              <div className="ms-2">
                                <div className="fw-medium">{format.name}</div>
                                <small className="text-muted">{format.description}</small>
                              </div>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="mt-3 pt-3 border-top">
                  <small className="text-muted">
                    Last updated: {new Date(report.lastUpdated).toLocaleDateString()}
                  </small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-5">
          <FileBarChart size={48} className="text-muted mb-3" />
          <h5 className="text-muted">No reports found</h5>
          <p className="text-muted">Try adjusting your search criteria or create a new report.</p>
          <button
            className="btn btn-primary"
            onClick={() => setShowReportBuilder(true)}
          >
            <Plus size={16} className="me-1" />
            Create First Report
          </button>
        </div>
      )}
    </div>
  );

  const ReportBuilderTab = () => (
    <div className="row">
      <div className="col-12">
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <Settings size={48} className="text-muted mb-3" />
            <h5 className="text-muted">Report Builder</h5>
            <p className="text-muted">Drag-and-drop report builder coming soon!</p>
            <p className="small text-muted">
              Create custom reports with visual query builder, data connections, and advanced visualizations.
            </p>
            <button className="btn btn-outline-primary">
              <Plus size={16} className="me-1" />
              Request Access to Beta
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ExportsTab = () => (
    <div className="row">
      {exportFormats.map((format) => (
        <div key={format.type} className="col-xl-3 col-lg-4 col-md-6 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="mb-3">
                {format.icon}
              </div>
              <h6 className="mb-2">{format.name}</h6>
              <p className="text-muted small mb-3">{format.description}</p>
              <button className="btn btn-outline-primary btn-sm w-100">
                Configure Export
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const AnalyticsTab = () => (
    <div className="row">
      <div className="col-12">
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <div className="row text-center">
              <div className="col-md-3 mb-3">
                <div className="h3 text-primary mb-1">{reports.length}</div>
                <div className="text-muted">Total Reports</div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="h3 text-success mb-1">
                  {reports.filter(r => r.status === 'active').length}
                </div>
                <div className="text-muted">Active Reports</div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="h3 text-info mb-1">
                  {reports.filter(r => r.schedule?.enabled).length}
                </div>
                <div className="text-muted">Scheduled Reports</div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="h3 text-warning mb-1">156</div>
                <div className="text-muted">Total Exports</div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
                  <h4 className="mb-1">Business Intelligence</h4>
                  <p className="text-muted mb-0">Custom reports, data exports, and business analytics</p>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-outline-secondary">
                    <Share2 size={16} className="me-1" />
                    Share
                  </button>
                  <button className="btn btn-primary">
                    <Plus size={16} className="me-1" />
                    New Report
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
                className={`nav-link ${activeTab === 'reports' ? 'active' : ''}`}
                onClick={() => setActiveTab('reports')}
              >
                <FileBarChart size={16} className="me-1" />
                Reports
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'builder' ? 'active' : ''}`}
                onClick={() => setActiveTab('builder')}
              >
                <Settings size={16} className="me-1" />
                Builder
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'exports' ? 'active' : ''}`}
                onClick={() => setActiveTab('exports')}
              >
                <Download size={16} className="me-1" />
                Exports
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => setActiveTab('analytics')}
              >
                <TrendingUp size={16} className="me-1" />
                Analytics
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'reports' && <ReportsTab />}
      {activeTab === 'builder' && <ReportBuilderTab />}
      {activeTab === 'exports' && <ExportsTab />}
      {activeTab === 'analytics' && <AnalyticsTab />}
    </div>
  );
};
