'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFirebase } from '@/contexts/FirebaseContext';
import { TeamService, ClubService } from '@/services/firebaseService';
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
  Save
} from 'lucide-react';
import Link from 'next/link';

interface TeamFormData {
  name: string;
  clubId: string;
  sport: string;
  ageGroup: string;
  level: TeamLevel;
  coachId: string;
  description?: string;
  isActive: boolean;
}

interface Club {
  id: string;
  name: string;
}

const SPORTS = [
  'Football',
  'Basketball',
  'Soccer',
  'Baseball',
  'Tennis',
  'Volleyball',
  'Hockey',
  'Cricket',
  'Rugby',
  'Athletics',
  'Swimming',
  'Golf',
  'Badminton',
  'Table Tennis',
  'Other'
];

const AGE_GROUPS = [
  'U6', 'U8', 'U10', 'U12', 'U14', 'U16', 'U18', 'U21', 'Senior', 'Masters'
];

const LEVELS = [
  'beginner',
  'intermediate',
  'advanced',
  'elite'
] as const;

type TeamLevel = typeof LEVELS[number];

export default function CreateTeamPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useFirebase();
  const [activeTab, setActiveTab] = useState('teams');
  const [clubs, setClubs] = useState<Club[]>([]);
  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    clubId: searchParams.get('clubId') || '',
    sport: '',
    ageGroup: '',
    level: 'beginner',
    coachId: '',
    description: '',
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isLoadingClubs, setIsLoadingClubs] = useState(true);

  useEffect(() => {
    if (user) {
      loadClubs();
    }
  }, [user]);

  const loadClubs = async () => {
    try {
      setIsLoadingClubs(true);
      const clubsData = await ClubService.getAllClubs();
      setClubs(clubsData);
    } catch (error) {
      console.error('Error loading clubs:', error);
      setSubmitError('Failed to load clubs');
    } finally {
      setIsLoadingClubs(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Team name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Team name must be at least 2 characters';
    }

    if (!formData.clubId) {
      newErrors.clubId = 'Please select a club';
    }

    if (!formData.sport) {
      newErrors.sport = 'Please select a sport';
    }

    if (!formData.ageGroup) {
      newErrors.ageGroup = 'Please select an age group';
    }

    if (!formData.level || !LEVELS.includes(formData.level)) {
      newErrors.level = 'Please select a valid level';
    }

    if (!formData.coachId) {
      newErrors.coachId = 'Please select a coach';
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

    if (!user) {
      setSubmitError('You must be logged in to create a team');
      return;
    }

    setIsSubmitting(true);

    try {
      const teamData = {
        ...formData,
        players: [], // Start with empty roster
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const teamId = await TeamService.createTeam(teamData);
      
      // Redirect to the new team's page
      router.push(`/teams/${teamId}`);
    } catch (error) {
      console.error('Error creating team:', error);
      setSubmitError('Failed to create team. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (formData.clubId) {
      router.push(`/clubs/${formData.clubId}`);
    } else {
      router.push('/teams');
    }
  };

  if (loading) {
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

  if (!user) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h2 className="h2 fw-bold text-dark mb-3">Access Denied</h2>
          <p className="text-muted mb-4">Please sign in to create a team.</p>
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
              <div className="fw-medium text-dark">{user.displayName || 'User'}</div>
              <small className="text-muted">{user.email}</small>
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
              <a href="/teams" className={`btn btn-sm text-start ${activeTab === 'teams' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'teams' ? '#4169E1' : 'transparent'}}>
                <Users className="h-4 w-4 me-2" />
                Teams
              </a>
              <a href="/matches" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
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
                <h5 className="mb-0">Create New Team</h5>
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
              <Link href="/teams" className="btn btn-sm btn-outline-secondary">
                <ArrowLeft className="h-4 w-4 me-1" />
                Back to Teams
              </Link>
            </div>
          </div>
        </div>

        {/* Main Form Content */}
        <div className="p-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent border-0">
              <h5 className="card-title mb-0">Team Information</h5>
              <p className="text-muted mb-0 mt-1">Fill in the details below to create your new sports team.</p>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Error Message */}
                {submitError && (
                  <div className="alert alert-danger" role="alert">
                    {submitError}
                  </div>
                )}

                {/* Team Name */}
                <div className="mb-3">
                  <label htmlFor="name" className="form-label fw-medium">
                    Team Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    placeholder="Enter team name"
                  />
                  {errors.name && (
                    <div className="invalid-feedback">{errors.name}</div>
                  )}
                </div>

                {/* Club Selection */}
                <div className="mb-3">
                  <label htmlFor="clubId" className="form-label fw-medium">
                    Club <span className="text-danger">*</span>
                  </label>
                  {isLoadingClubs ? (
                    <div className="form-control bg-light">
                      <div className="placeholder-glow">
                        <span className="placeholder col-8">Loading clubs...</span>
                      </div>
                    </div>
                  ) : (
                    <select
                      id="clubId"
                      name="clubId"
                      value={formData.clubId}
                      onChange={handleInputChange}
                      className={`form-select ${errors.clubId ? 'is-invalid' : ''}`}
                    >
                      <option value="">Select a club</option>
                      {clubs.map(club => (
                        <option key={club.id} value={club.id}>
                          {club.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.clubId && (
                    <div className="invalid-feedback">{errors.clubId}</div>
                  )}
                </div>

                {/* Sport and Age Group */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="sport" className="form-label fw-medium">
                      Sport <span className="text-danger">*</span>
                    </label>
                    <select
                      id="sport"
                      name="sport"
                      value={formData.sport}
                      onChange={handleInputChange}
                      className={`form-select ${errors.sport ? 'is-invalid' : ''}`}
                    >
                      <option value="">Select a sport</option>
                      {SPORTS.map(sport => (
                        <option key={sport} value={sport}>
                          {sport}
                        </option>
                      ))}
                    </select>
                    {errors.sport && (
                      <div className="invalid-feedback">{errors.sport}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="ageGroup" className="form-label fw-medium">
                      Age Group <span className="text-danger">*</span>
                    </label>
                    <select
                      id="ageGroup"
                      name="ageGroup"
                      value={formData.ageGroup}
                      onChange={handleInputChange}
                      className={`form-select ${errors.ageGroup ? 'is-invalid' : ''}`}
                    >
                      <option value="">Select age group</option>
                      {AGE_GROUPS.map(ageGroup => (
                        <option key={ageGroup} value={ageGroup}>
                          {ageGroup}
                        </option>
                      ))}
                    </select>
                    {errors.ageGroup && (
                      <div className="invalid-feedback">{errors.ageGroup}</div>
                    )}
                  </div>
                </div>

                {/* Level and Coach */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="level" className="form-label fw-medium">
                      Level <span className="text-danger">*</span>
                    </label>
                    <select
                      id="level"
                      name="level"
                      value={formData.level}
                      onChange={handleInputChange}
                      className={`form-select ${errors.level ? 'is-invalid' : ''}`}
                    >
                      <option value="">Select level</option>
                      {LEVELS.map(level => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                    {errors.level && (
                      <div className="invalid-feedback">{errors.level}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="coachId" className="form-label fw-medium">
                      Coach <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="coachId"
                      name="coachId"
                      value={formData.coachId}
                      onChange={handleInputChange}
                      className={`form-control ${errors.coachId ? 'is-invalid' : ''}`}
                      placeholder="Enter coach name or ID"
                    />
                    {errors.coachId && (
                      <div className="invalid-feedback">{errors.coachId}</div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="mb-3">
                  <label htmlFor="description" className="form-label fw-medium">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="form-control"
                    placeholder="Describe the team, its goals, or any special requirements"
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
                      Team is active and accepting new players
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
                        Create Team
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