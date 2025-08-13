'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Users, 
  Trophy, 
  Calendar,
  MapPin,
  Shield,
  Eye,
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
  DollarSign,
  FileText,
  ImageIcon,
  BarChart3,
  Settings,
  TrendingUp,
  ArrowLeft,
  Save,
  Clock,
  Target
} from 'lucide-react';
import Link from 'next/link';
import { useMatchSupportData } from '@/hooks/useMatchSupportData';

interface MatchFormData {
  homeTeamId: string;
  awayTeamId: string;
  date: string;
  time: string;
  venue: string;
  tournamentId?: string;
  refereeId?: string;
  notes?: string;
  isActive: boolean;
}

interface Team {
  id: string;
  name: string;
  clubName: string;
}

interface Tournament {
  id: string;
  name: string;
}

interface Referee {
  id: string;
  name: string;
}

const VENUES = [
  'Central Stadium',
  'North Field',
  'South Arena',
  'East Ground',
  'West Complex',
  'Community Center',
  'School Field',
  'University Stadium',
  'Sports Complex',
  'Other'
];

export default function CreateMatchPage() {
  const router = useRouter();
  const { userData, loading  } = useAuth();
  const [activeTab, setActiveTab] = useState('matches');

  // State
  const [teams, setTeams] = useState<Team[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [referees, setReferees] = useState<Referee[]>([]);
  const [formData, setFormData] = useState<MatchFormData>({
    homeTeamId: '',
    awayTeamId: '',
    date: '',
    time: '',
    venue: '',
    tournamentId: '',
    refereeId: '',
    notes: '',
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Load data from API
  const { teams: apiTeams, tournaments: apiTournaments, referees: apiReferees, loading: loadingSupport, error: supportError } = useMatchSupportData();
  useEffect(() => {
    setIsLoadingData(loadingSupport);
    if (supportError) setSubmitError(supportError);
    setTeams(apiTeams as any);
    setTournaments(apiTournaments as any);
    setReferees(apiReferees.map(r => ({ id: r.id, name: r.displayName })) as any);
  }, [apiTeams, apiTournaments, apiReferees, loadingSupport, supportError]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.homeTeamId) {
      newErrors.homeTeamId = 'Please select a home team';
    }

    if (!formData.awayTeamId) {
      newErrors.awayTeamId = 'Please select an away team';
    }

    if (formData.homeTeamId && formData.awayTeamId && formData.homeTeamId === formData.awayTeamId) {
      newErrors.awayTeamId = 'Home and away teams cannot be the same';
    }

    if (!formData.date) {
      newErrors.date = 'Please select a match date';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = 'Match date cannot be in the past';
      }
    }

    if (!formData.time) {
      newErrors.time = 'Please select a match time';
    }

    if (!formData.venue) {
      newErrors.venue = 'Please select a venue';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    if (!userData) {
      setSubmitError('You must be logged in to create a match');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: `${teams.find(t=>t.id===formData.homeTeamId)?.name || 'Home'} vs ${teams.find(t=>t.id===formData.awayTeamId)?.name || 'Away'}`,
        homeTeamId: formData.homeTeamId,
        awayTeamId: formData.awayTeamId,
        startTime: new Date(`${formData.date}T${formData.time}:00`).toISOString(),
        endTime: new Date(new Date(`${formData.date}T${formData.time}:00`).getTime() + 90*60000).toISOString(),
        location: formData.venue,
        tournamentId: formData.tournamentId || undefined,
        refereeId: formData.refereeId || undefined,
        notes: formData.notes,
        isActive: formData.isActive,
      } as any;

      const api = (await import('@/lib/apiClient')).default;
      await api.createMatch(payload);
      router.push('/matches');
    } catch (error) {
      console.error('Error creating match:', error);
      setSubmitError('Failed to create match. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/matches');
  };

  if (authLoading || isLoadingData) {
    return (
      <div className="d-flex">
        {/* Sidebar Skeleton */}
        <div className="bg-white border-end" style={{width: '280px', minHeight: '100vh'}}>
          <div className="p-3">
            <div className="placeholder-glow">
              <div className="placeholder col-8 mb-4"></div>
              <div className="placeholder col-6 mb-3"></div>
              <div className="placeholder col-10 mb-2"></div>
              <div className="placeholder col-8 mb-2"></div>
            </div>
          </div>
        </div>
        
        {/* Main Content Skeleton */}
        <div className="flex-grow-1 bg-light">
          <div className="p-4">
            <div className="placeholder-glow">
              <div className="placeholder col-4 mb-4"></div>
              <div className="card placeholder-glow">
                <div className="card-body">
                  <div className="placeholder col-8 mb-3"></div>
                  <div className="placeholder col-6 mb-2"></div>
                  <div className="placeholder col-10 mb-2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h2 className="h2 fw-bold text-dark mb-3">Access Denied</h2>
          <p className="text-muted mb-4">Please sign in to create a match.</p>
          <Link href="/firebase-test" className="btn" style={{backgroundColor: '#4169E1', borderColor: '#4169E1', color: 'white'}}>
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className="bg-white border-end" style={{width: '280px', minHeight: '100vh'}}>
        <div className="p-3">
          {/* Logo and Top Icons */}
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="d-flex align-items-center">
              <img 
                src="/images/logo.png" 
                alt="KP5 Academy" 
                width={120} 
                height={45} 
                className="me-2"
                style={{maxWidth: '120px'}}
              />
            </div>
            <div className="d-flex gap-2">
              <Bell className="h-4 w-4 text-muted position-relative">
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill" style={{fontSize: '0.6rem', backgroundColor: '#4169E1'}}>3</span>
              </Bell>
              <Search className="h-4 w-4 text-muted" />
            </div>
          </div>

          {/* User Profile */}
          <div className="d-flex align-items-center mb-4 p-3 bg-light rounded">
            <div className="rounded-circle p-2 me-3" style={{backgroundColor: '#4169E1', opacity: 0.1}}>
              <User className="h-4 w-4" style={{color: '#4169E1'}} />
            </div>
            <div>
              <div className="fw-medium text-dark">{userData.displayName || 'User'}</div>
              <small className="text-muted">{userData.email}</small>
            </div>
          </div>

          {/* Navigation */}
          <div className="mb-4">
            <small className="text-muted text-uppercase fw-bold mb-2 d-block">Sports Management</small>
            <div className="d-flex flex-column gap-1">
              <a href="/dashboard" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <BarChart3 className="h-4 w-4 me-2" />
                Dashboard
              </a>
              <a href="/teams" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <Users className="h-4 w-4 me-2" />
                Teams
              </a>
              <a href="/matches" className={`btn btn-sm text-start ${activeTab === 'matches' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'matches' ? '#4169E1' : 'transparent'}}>
                <Calendar className="h-4 w-4 me-2" />
                Matches
              </a>
              <a href="/tournaments" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <Trophy className="h-4 w-4 me-2" />
                Tournaments
              </a>
              <a href="/events" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <Calendar className="h-4 w-4 me-2" />
                Events
              </a>
              <a href="/leagues" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <Trophy className="h-4 w-4 me-2" />
                Leagues
              </a>
            </div>
          </div>

          <div className="mb-4">
            <small className="text-muted text-uppercase fw-bold mb-2 d-block">Management</small>
            <div className="d-flex flex-column gap-1">
              <a href="/clubs" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <GraduationCap className="h-4 w-4 me-2" />
                Clubs
              </a>
              <a href="/players" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <Users className="h-4 w-4 me-2" />
                Players
              </a>
              <a href="/coaches" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <Shield className="h-4 w-4 me-2" />
                Coaches
              </a>
              <a href="/referees" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <Shield className="h-4 w-4 me-2" />
                Referees
              </a>
              <a href="/registration" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <User className="h-4 w-4 me-2" />
                Registration
              </a>
              <a href="/payments" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <DollarSign className="h-4 w-4 me-2" />
                Payments
              </a>
            </div>
          </div>

          <div className="mb-4">
            <small className="text-muted text-uppercase fw-bold mb-2 d-block">Communication</small>
            <div className="d-flex flex-column gap-1">
              <a href="/messages" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <MessageCircle className="h-4 w-4 me-2" />
                Messages
              </a>
              <a href="/notifications" className="btn btn-sm text-start text-muted border-0 text-decoration-none position-relative">
                <Mail className="h-4 w-4 me-2" />
                Notifications
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{fontSize: '0.6rem'}}>5</span>
              </a>
              <a href="/announcements" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <Bell className="h-4 w-4 me-2" />
                Announcements
              </a>
            </div>
          </div>

          <div className="mb-4">
            <small className="text-muted text-uppercase fw-bold mb-2 d-block">Content</small>
            <div className="d-flex flex-column gap-1">
              <a href="/media" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <Cloud className="h-4 w-4 me-2" />
                Media Library
              </a>
              <a href="/documents" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <FileText className="h-4 w-4 me-2" />
                Documents
              </a>
              <a href="/photos" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <ImageIcon className="h-4 w-4 me-2" />
                Photos
              </a>
            </div>
          </div>

          <div className="mb-4">
            <small className="text-muted text-uppercase fw-bold mb-2 d-block">Analytics</small>
            <div className="d-flex flex-column gap-1">
              <a href="/analytics" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <BarChart3 className="h-4 w-4 me-2" />
                Analytics
              </a>
              <a href="/reports" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <FileText className="h-4 w-4 me-2" />
                Reports
              </a>
              <a href="/statistics" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <TrendingUp className="h-4 w-4 me-2" />
                Statistics
              </a>
            </div>
          </div>

          <div className="mb-4">
            <small className="text-muted text-uppercase fw-bold mb-2 d-block">System</small>
            <div className="d-flex flex-column gap-1">
              <a href="/admin" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <Shield className="h-4 w-4 me-2" />
                Admin Panel
              </a>
              <a href="/settings" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <Settings className="h-4 w-4 me-2" />
                Settings
              </a>
              <a href="/profile" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <User className="h-4 w-4 me-2" />
                Profile
              </a>
              <a href="/help" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <HelpCircle className="h-4 w-4 me-2" />
                Help & Support
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 bg-light">
        {/* Top Header */}
        <div className="bg-white border-bottom p-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center">
                <h5 className="mb-0">Create New Match</h5>
              </div>
            </div>
            
            <div className="d-flex align-items-center gap-3">
              <button className="btn btn-link text-muted p-1">
                <Flag className="h-4 w-4" />
              </button>
              <button className="btn btn-link text-muted p-1">
                <Maximize2 className="h-4 w-4" />
              </button>
              <button className="btn btn-link text-muted p-1">
                <Search className="h-4 w-4" />
              </button>
              <button className="btn btn-link text-muted p-1">
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button className="btn btn-link text-muted p-1 position-relative">
                <Bell className="h-4 w-4" />
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill" style={{fontSize: '0.6rem', backgroundColor: '#4169E1'}}>5</span>
              </button>
              <button className="btn btn-link text-muted p-1">
                <MessageCircle className="h-4 w-4" />
              </button>
              <Link href="/matches" className="btn btn-sm btn-outline-secondary">
                <ArrowLeft className="h-4 w-4 me-1" />
                Back to Matches
              </Link>
            </div>
          </div>
        </div>

        {/* Main Form Content */}
        <div className="p-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent border-0">
              <h5 className="card-title mb-0">Match Information</h5>
              <p className="text-muted mb-0 mt-1">Fill in the details below to schedule a new match.</p>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Error Message */}
                {submitError && (
                  <div className="alert alert-danger" role="alert">
                    {submitError}
                  </div>
                )}

                {/* Teams Selection */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="homeTeamId" className="form-label fw-medium">
                      Home Team <span className="text-danger">*</span>
                    </label>
                    <select
                      id="homeTeamId"
                      name="homeTeamId"
                      value={formData.homeTeamId}
                      onChange={handleInputChange}
                      className={`form-select ${errors.homeTeamId ? 'is-invalid' : ''}`}
                    >
                      <option value="">Select home team</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>
                          {team.name} ({team.clubName})
                        </option>
                      ))}
                    </select>
                    {errors.homeTeamId && (
                      <div className="invalid-feedback">{errors.homeTeamId}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="awayTeamId" className="form-label fw-medium">
                      Away Team <span className="text-danger">*</span>
                    </label>
                    <select
                      id="awayTeamId"
                      name="awayTeamId"
                      value={formData.awayTeamId}
                      onChange={handleInputChange}
                      className={`form-select ${errors.awayTeamId ? 'is-invalid' : ''}`}
                    >
                      <option value="">Select away team</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>
                          {team.name} ({team.clubName})
                        </option>
                      ))}
                    </select>
                    {errors.awayTeamId && (
                      <div className="invalid-feedback">{errors.awayTeamId}</div>
                    )}
                  </div>
                </div>

                {/* Date and Time */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="date" className="form-label fw-medium">
                      Match Date <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className={`form-control ${errors.date ? 'is-invalid' : ''}`}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {errors.date && (
                      <div className="invalid-feedback">{errors.date}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="time" className="form-label fw-medium">
                      Match Time <span className="text-danger">*</span>
                    </label>
                    <input
                      type="time"
                      id="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      className={`form-control ${errors.time ? 'is-invalid' : ''}`}
                    />
                    {errors.time && (
                      <div className="invalid-feedback">{errors.time}</div>
                    )}
                  </div>
                </div>

                                 {/* Venue and Tournament */}
                 <div className="row mb-3">
                   <div className="col-md-6">
                     <label htmlFor="venue" className="form-label fw-medium">
                       Venue <span className="text-danger">*</span>
                     </label>
                     <input
                       type="text"
                       id="venue"
                       name="venue"
                       value={formData.venue}
                       onChange={handleInputChange}
                       className={`form-control ${errors.venue ? 'is-invalid' : ''}`}
                       placeholder="Enter venue name (e.g., Central Stadium, Field 1)"
                     />
                     {errors.venue && (
                       <div className="invalid-feedback">{errors.venue}</div>
                     )}
                   </div>

                                     <div className="col-md-6">
                     <label htmlFor="tournamentId" className="form-label fw-medium">
                       Tournament (Optional)
                     </label>
                     <input
                       type="text"
                       id="tournamentId"
                       name="tournamentId"
                       value={formData.tournamentId}
                       onChange={handleInputChange}
                       className="form-control"
                       placeholder="Enter tournament name (e.g., Spring League, Championship Cup)"
                     />
                   </div>
                </div>

                {/* Referee */}
                <div className="mb-3">
                  <label htmlFor="refereeId" className="form-label fw-medium">
                    Referee (Optional)
                  </label>
                  <select
                    id="refereeId"
                    name="refereeId"
                    value={formData.refereeId}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">Select referee (optional)</option>
                    {referees.map(referee => (
                      <option key={referee.id} value={referee.id}>
                        {referee.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div className="mb-3">
                  <label htmlFor="notes" className="form-label fw-medium">
                    Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="form-control"
                    placeholder="Add any additional notes about the match..."
                  />
                </div>

                {/* Active Status */}
                <div className="mb-4">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="form-check-input"
                    />
                    <label htmlFor="isActive" className="form-check-label">
                      Match is confirmed and ready to be scheduled
                    </label>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="d-flex justify-content-end gap-3 pt-3 border-top">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn btn-outline-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn d-flex align-items-center"
                    style={{backgroundColor: '#4169E1', borderColor: '#4169E1', color: 'white'}}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 me-1" />
                        Create Match
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 