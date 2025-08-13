'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  DollarSign,
  FileText,
  Clipboard,
  CheckSquare,
  XSquare,
  AlertCircle,
  Download
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useRegistrations } from '@/hooks/useRegistrations';

interface RegistrationForm {
  id: string;
  title: string;
  description: string;
  type: 'player' | 'team' | 'tournament' | 'league' | 'event';
  status: 'active' | 'inactive' | 'draft' | 'archived';
  startDate: string;
  endDate: string;
  maxParticipants: number;
  currentParticipants: number;
  fee: number;
  currency: string;
  requirements: string[];
  createdAt: string;
  updatedAt: string;
}

interface RegistrationApplication {
  id: string;
  formId: string;
  formTitle: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  type: 'player' | 'team' | 'tournament' | 'league' | 'event';
  status: 'pending' | 'approved' | 'rejected' | 'waitlisted';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  amount: number;
  currency: string;
}

export default function RegistrationPage() {
  return (
    <ProtectedRoute>
      <RegistrationContent />
    </ProtectedRoute>
  );
}

function RegistrationContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('registration');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'forms' | 'applications'>('forms');

  const { applications, forms, loading, error, refetch } = useRegistrations();

  const mockForms: RegistrationForm[] = useMemo(() => [
    {
      id: '1',
      title: 'Spring Football League Registration',
      description: 'Registration for the 2024 Spring Football League. Open to all skill levels.',
      type: 'league',
      status: 'active',
      startDate: '2024-02-01',
      endDate: '2024-02-28',
      maxParticipants: 200,
      currentParticipants: 156,
      fee: 50,
      currency: 'USD',
      requirements: ['Age 16+', 'Medical Certificate', 'Emergency Contact'],
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      title: 'Basketball Tournament Entry',
      description: 'Annual basketball tournament for high school teams.',
      type: 'tournament',
      status: 'active',
      startDate: '2024-01-20',
      endDate: '2024-01-25',
      maxParticipants: 32,
      currentParticipants: 28,
      fee: 100,
      currency: 'USD',
      requirements: ['Team Roster', 'Coach Certification', 'Insurance'],
      createdAt: '2024-01-10T14:30:00Z',
      updatedAt: '2024-01-10T14:30:00Z'
    },
    {
      id: '3',
      title: 'Cricket Academy Enrollment',
      description: 'Enrollment for the cricket academy training program.',
      type: 'player',
      status: 'active',
      startDate: '2024-03-01',
      endDate: '2024-03-31',
      maxParticipants: 50,
      currentParticipants: 35,
      fee: 200,
      currency: 'USD',
      requirements: ['Age 12-18', 'Parent Consent', 'Equipment List'],
      createdAt: '2024-01-05T09:15:00Z',
      updatedAt: '2024-01-05T09:15:00Z'
    },
    {
      id: '4',
      title: 'Tennis Club Membership',
      description: 'Annual membership registration for tennis club.',
      type: 'event',
      status: 'inactive',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      maxParticipants: 100,
      currentParticipants: 89,
      fee: 150,
      currency: 'USD',
      requirements: ['Age 18+', 'ID Verification', 'Membership Agreement'],
      createdAt: '2023-12-20T11:45:00Z',
      updatedAt: '2023-12-20T11:45:00Z'
    },
    {
      id: '5',
      title: 'Swimming Team Tryouts',
      description: 'Registration for swimming team tryouts and selection.',
      type: 'team',
      status: 'draft',
      startDate: '2024-04-01',
      endDate: '2024-04-15',
      maxParticipants: 30,
      currentParticipants: 0,
      fee: 25,
      currency: 'USD',
      requirements: ['Swimming Test', 'Medical Clearance', 'Parent Meeting'],
      createdAt: '2024-01-01T16:20:00Z',
      updatedAt: '2024-01-01T16:20:00Z'
    }
  ], []);

  const mockApplications: RegistrationApplication[] = useMemo(() => [
    {
      id: '1',
      formId: '1',
      formTitle: 'Spring Football League Registration',
      applicantName: 'Ahmed Hassan',
      applicantEmail: 'ahmed.hassan@email.com',
      applicantPhone: '+234 801 234 5678',
      type: 'player',
      status: 'approved',
      submittedAt: '2024-01-18T14:30:00Z',
      reviewedAt: '2024-01-19T10:15:00Z',
      reviewedBy: 'John Doe',
      notes: 'All requirements met, payment received',
      paymentStatus: 'paid',
      amount: 50,
      currency: 'USD'
    },
    {
      id: '2',
      formId: '2',
      formTitle: 'Basketball Tournament Entry',
      applicantName: 'Elite Basketball Team',
      applicantEmail: 'coach@elitebasketball.com',
      applicantPhone: '+254 700 123 456',
      type: 'team',
      status: 'pending',
      submittedAt: '2024-01-20T09:45:00Z',
      paymentStatus: 'pending',
      amount: 100,
      currency: 'USD'
    },
    {
      id: '3',
      formId: '3',
      formTitle: 'Cricket Academy Enrollment',
      applicantName: 'Sarah Muthoni',
      applicantEmail: 'sarah.muthoni@email.com',
      applicantPhone: '+254 701 234 567',
      type: 'player',
      status: 'waitlisted',
      submittedAt: '2024-01-22T16:20:00Z',
      reviewedAt: '2024-01-23T11:30:00Z',
      reviewedBy: 'Jane Smith',
      notes: 'Placed on waitlist due to capacity',
      paymentStatus: 'paid',
      amount: 200,
      currency: 'USD'
    },
    {
      id: '4',
      formId: '1',
      formTitle: 'Spring Football League Registration',
      applicantName: 'Kwame Mensah',
      applicantEmail: 'kwame.mensah@email.com',
      applicantPhone: '+233 24 567 8901',
      type: 'player',
      status: 'rejected',
      submittedAt: '2024-01-19T12:15:00Z',
      reviewedAt: '2024-01-20T14:45:00Z',
      reviewedBy: 'John Doe',
      notes: 'Missing medical certificate',
      paymentStatus: 'refunded',
      amount: 50,
      currency: 'USD'
    },
    {
      id: '5',
      formId: '4',
      formTitle: 'Tennis Club Membership',
      applicantName: 'Zara van der Merwe',
      applicantEmail: 'zara.vandermerwe@email.com',
      applicantPhone: '+27 21 123 4567',
      type: 'player',
      status: 'approved',
      submittedAt: '2024-01-15T10:30:00Z',
      reviewedAt: '2024-01-16T09:20:00Z',
      reviewedBy: 'Jane Smith',
      notes: 'Welcome to the club!',
      paymentStatus: 'paid',
      amount: 150,
      currency: 'USD'
    }
  ], []);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
        return 'badge bg-success';
      case 'inactive':
      case 'rejected':
        return 'badge bg-danger';
      case 'draft':
      case 'pending':
        return 'badge bg-warning text-dark';
      case 'archived':
      case 'waitlisted':
        return 'badge bg-secondary';
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
      case 'draft':
        return 'Draft';
      case 'archived':
        return 'Archived';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'pending':
        return 'Pending';
      case 'waitlisted':
        return 'Waitlisted';
      default:
        return status;
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'player':
        return 'badge bg-primary';
      case 'team':
        return 'badge bg-info';
      case 'tournament':
        return 'badge bg-warning text-dark';
      case 'league':
        return 'badge bg-success';
      case 'event':
        return 'badge bg-secondary';
      default:
        return 'badge bg-secondary';
    }
  };

  const getPaymentStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'paid':
        return 'badge bg-success';
      case 'pending':
        return 'badge bg-warning text-dark';
      case 'failed':
        return 'badge bg-danger';
      case 'refunded':
        return 'badge bg-info';
      default:
        return 'badge bg-secondary';
    }
  };

  const handleCreateForm = () => {
    router.push('/registration/create');
  };

  const handleViewForm = (formId: string) => {
    router.push(`/registration/forms/${formId}`);
  };

  const handleEditForm = (formId: string) => {
    router.push(`/registration/forms/${formId}/edit`);
  };

  const handleViewApplication = (applicationId: string) => {
    router.push(`/registration/applications/${applicationId}`);
  };

  const handleReviewApplication = (applicationId: string) => {
    router.push(`/registration/applications/${applicationId}/review`);
  };

  // Filter data based on search and filters
  const apiForms = useMemo(() => (forms || []).map(f => ({
    id: f.key,
    title: f.title,
    description: '',
    type: f.key.toLowerCase() as any,
    status: 'active',
    startDate: new Date().toISOString().slice(0,10),
    endDate: new Date().toISOString().slice(0,10),
    maxParticipants: 0,
    currentParticipants: 0,
    fee: 0,
    currency: 'USD',
    requirements: f.fields.map(fl => fl.label),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })), [forms]);

  const apiApplications = useMemo(() => (applications || []).map(a => ({
    id: a.id,
    formId: a.type,
    formTitle: a.type,
    applicantName: [a.user.firstName, a.user.lastName].filter(Boolean).join(' ') || a.user.email,
    applicantEmail: a.user.email,
    applicantPhone: '',
    type: a.type.toLowerCase(),
    status: a.status.toLowerCase(),
    submittedAt: a.createdAt,
    paymentStatus: (a.payment?.status || 'pending').toLowerCase(),
    amount: a.payment?.amount || 0,
    currency: a.payment?.currency || 'USD',
  })), [applications]);

  const filteredForms = apiForms.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || form.status === statusFilter;
    const matchesType = typeFilter === 'all' || form.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const filteredApplications = apiApplications.filter(app => {
    const matchesSearch = app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.formTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.applicantEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesType = typeFilter === 'all' || app.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate stats
  const totalForms = apiForms.length;
  const activeForms = apiForms.filter(form => form.status === 'active').length;
  const totalApplications = apiApplications.length;
  const pendingApplications = apiApplications.filter(app => app.status === 'pending').length;
  const totalRevenue = apiApplications
    .filter(app => app.paymentStatus === 'paid')
    .reduce((sum, app) => sum + app.amount, 0);

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <Sidebar activeTab="registration" />

      {/* Main Content */}
      <div className="flex-grow-1 bg-light">
        {/* Header */}
        <div className="bg-white border-bottom p-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <h4 className="mb-0 me-3">Registration Management</h4>
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
                onClick={handleCreateForm}
              >
                <Plus size={16} className="me-1" />
                Create Form
              </button>
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="p-4 pb-0">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn ${viewMode === 'forms' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setViewMode('forms')}
            >
              <FileText size={16} className="me-2" />
              Registration Forms
            </button>
            <button
              type="button"
              className={`btn ${viewMode === 'applications' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setViewMode('applications')}
            >
              <Clipboard size={16} className="me-2" />
              Applications
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="p-4 pt-2">
          <div className="row g-4 mb-4">
            <div className="col-xl-3 col-md-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                        <FileText size={24} style={{color: '#4169E1'}} />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="text-muted mb-1">Total Forms</h6>
                      <h4 className="mb-0 fw-bold">{totalForms}</h4>
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
                      <h6 className="text-muted mb-1">Active Forms</h6>
                      <h4 className="mb-0 fw-bold">{activeForms}</h4>
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
                        <Clipboard size={24} className="text-warning" />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="text-muted mb-1">Total Applications</h6>
                      <h4 className="mb-0 fw-bold">{totalApplications}</h4>
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
                        <DollarSign size={24} className="text-info" />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="text-muted mb-1">Total Revenue</h6>
                      <h4 className="mb-0 fw-bold">${totalRevenue}</h4>
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
                      placeholder={viewMode === 'forms' ? "Search forms..." : "Search applications..."}
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
                    {viewMode === 'forms' ? (
                      <>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </>
                    ) : (
                      <>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="waitlisted">Waitlisted</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="col-md-4">
                  <label htmlFor="typeFilter" className="form-label fw-medium">Type</label>
                  <select
                    id="typeFilter"
                    className="form-select"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="player">Player</option>
                    <option value="team">Team</option>
                    <option value="tournament">Tournament</option>
                    <option value="league">League</option>
                    <option value="event">Event</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Content based on view mode */}
          {viewMode === 'forms' ? (
            /* Registration Forms Table */
            <div className="card border-0 shadow-sm">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="border-0 px-4 py-3 fw-medium">Form Title</th>
                        <th className="border-0 px-4 py-3 fw-medium">Type</th>
                        <th className="border-0 px-4 py-3 fw-medium">Status</th>
                        <th className="border-0 px-4 py-3 fw-medium">Participants</th>
                        <th className="border-0 px-4 py-3 fw-medium">Fee</th>
                        <th className="border-0 px-4 py-3 fw-medium">Dates</th>
                        <th className="border-0 px-4 py-3 fw-medium text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredForms.map((form) => (
                        <tr key={form.id}>
                          <td className="px-4 py-3">
                            <div>
                              <div className="fw-medium">{form.title}</div>
                              <small className="text-muted">{form.description}</small>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={getTypeBadgeClass(form.type)}>
                              {form.type.charAt(0).toUpperCase() + form.type.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={getStatusBadgeClass(form.status)}>
                              {getStatusLabel(form.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="small">
                              <div>{form.currentParticipants}/{form.maxParticipants}</div>
                              <div className="progress mt-1" style={{height: '4px'}}>
                                <div 
                                  className="progress-bar" 
                                  style={{
                                    width: `${(form.currentParticipants / form.maxParticipants) * 100}%`,
                                    backgroundColor: '#4169E1'
                                  }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="fw-medium">
                              {form.currency} {form.fee}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="small">
                              <div>Start: {new Date(form.startDate).toLocaleDateString()}</div>
                              <div>End: {new Date(form.endDate).toLocaleDateString()}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-end">
                            <div className="btn-group" role="group">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => handleViewForm(form.id)}
                                title="View Form"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => handleEditForm(form.id)}
                                title="Edit Form"
                              >
                                <Edit size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredForms.length === 0 && (
                  <div className="text-center py-5">
                    <FileText size={48} className="text-muted mb-3" />
                    <h5 className="text-muted">No forms found</h5>
                    <p className="text-muted">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Applications Table */
            <div className="card border-0 shadow-sm">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="border-0 px-4 py-3 fw-medium">Applicant</th>
                        <th className="border-0 px-4 py-3 fw-medium">Form</th>
                        <th className="border-0 px-4 py-3 fw-medium">Type</th>
                        <th className="border-0 px-4 py-3 fw-medium">Status</th>
                        <th className="border-0 px-4 py-3 fw-medium">Payment</th>
                        <th className="border-0 px-4 py-3 fw-medium">Amount</th>
                        <th className="border-0 px-4 py-3 fw-medium">Submitted</th>
                        <th className="border-0 px-4 py-3 fw-medium text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApplications.map((app) => (
                        <tr key={app.id}>
                          <td className="px-4 py-3">
                            <div>
                              <div className="fw-medium">{app.applicantName}</div>
                              <small className="text-muted">{app.applicantEmail}</small>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="small">
                              {app.formTitle}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={getTypeBadgeClass(app.type)}>
                              {app.type.charAt(0).toUpperCase() + app.type.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={getStatusBadgeClass(app.status)}>
                              {getStatusLabel(app.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={getPaymentStatusBadgeClass(app.paymentStatus)}>
                              {app.paymentStatus.charAt(0).toUpperCase() + app.paymentStatus.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="fw-medium">
                              {app.currency} {app.amount}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="small">
                              {new Date(app.submittedAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-end">
                            <div className="btn-group" role="group">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => handleViewApplication(app.id)}
                                title="View Application"
                              >
                                <Eye size={14} />
                              </button>
                              {app.status === 'pending' && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => handleReviewApplication(app.id)}
                                  title="Review Application"
                                >
                                  <CheckSquare size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredApplications.length === 0 && (
                  <div className="text-center py-5">
                    <Clipboard size={48} className="text-muted mb-3" />
                    <h5 className="text-muted">No applications found</h5>
                    <p className="text-muted">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 