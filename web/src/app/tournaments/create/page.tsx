'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/contexts/FirebaseContext';
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
  Target,
  Star,
  Users2
} from 'lucide-react';
import Link from 'next/link';

interface TournamentFormData {
  name: string;
  description: string;
  type: 'league' | 'cup' | 'friendly' | 'championship';
  startDate: string;
  endDate: string;
  maxTeams: number;
  venue: string;
  prize?: string;
  entryFee?: number;
  entryFeeCurrency: string;
  registrationDeadline: string;
  rules?: string;
  isActive: boolean;
}

const TOURNAMENT_TYPES = [
  { value: 'league', label: 'League' },
  { value: 'cup', label: 'Cup' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'championship', label: 'Championship' }
] as const;

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi' },
  { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling' },
  { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling' },
  { code: 'ZMW', symbol: 'ZK', name: 'Zambian Kwacha' },
  { code: 'MWK', symbol: 'MK', name: 'Malawian Kwacha' },
  { code: 'BWP', symbol: 'P', name: 'Botswana Pula' },
  { code: 'NAD', symbol: 'N$', name: 'Namibian Dollar' }
];

export default function CreateTournamentPage() {
  const router = useRouter();
  const { userData, loading: authLoading } = useFirebase();
  const [activeTab, setActiveTab] = useState('tournaments');

  // State
  const [formData, setFormData] = useState<TournamentFormData>({
    name: '',
    description: '',
    type: 'league',
    startDate: '',
    endDate: '',
    maxTeams: 8,
    venue: '',
    prize: '',
    entryFee: 0,
    entryFeeCurrency: 'USD',
    registrationDeadline: '',
    rules: '',
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tournament name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    } else {
      const startDate = new Date(formData.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        newErrors.startDate = 'Start date cannot be in the past';
      }
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (endDate <= startDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (formData.maxTeams < 2) {
      newErrors.maxTeams = 'Minimum 2 teams required';
    }

    if (!formData.venue.trim()) {
      newErrors.venue = 'Venue is required';
    }

    if (!formData.registrationDeadline) {
      newErrors.registrationDeadline = 'Registration deadline is required';
    } else if (formData.startDate && formData.registrationDeadline) {
      const startDate = new Date(formData.startDate);
      const deadline = new Date(formData.registrationDeadline);
      
      if (deadline >= startDate) {
        newErrors.registrationDeadline = 'Registration deadline must be before start date';
      }
    }

    if (formData.entryFee && formData.entryFee < 0) {
      newErrors.entryFee = 'Entry fee cannot be negative';
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
      setSubmitError('You must be logged in to create a tournament');
      return;
    }

    setIsSubmitting(true);

    try {
      const tournamentData = {
        ...formData,
        status: 'upcoming',
        currentTeams: 0,
        organizer: userData.displayName || 'Unknown',
        organizerId: userData.id || 'unknown',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock API call - in real implementation, this would call Firebase
      console.log('Creating tournament:', tournamentData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to tournaments page
      router.push('/tournaments');
    } catch (error) {
      console.error('Error creating tournament:', error);
      setSubmitError('Failed to create tournament. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/tournaments');
  };

  if (authLoading) {
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
          <p className="text-muted mb-4">Please sign in to create a tournament.</p>
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
              <a href="/matches" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <Calendar className="h-4 w-4 me-2" />
                Matches
              </a>
              <a href="/tournaments" className={`btn btn-sm text-start ${activeTab === 'tournaments' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'tournaments' ? '#4169E1' : 'transparent'}}>
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
                <h5 className="mb-0">Create New Tournament</h5>
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
              <Link href="/tournaments" className="btn btn-sm btn-outline-secondary">
                <ArrowLeft className="h-4 w-4 me-1" />
                Back to Tournaments
              </Link>
            </div>
          </div>
        </div>

        {/* Main Form Content */}
        <div className="p-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent border-0">
              <h5 className="card-title mb-0">Tournament Information</h5>
              <p className="text-muted mb-0 mt-1">Fill in the details below to create a new tournament.</p>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Error Message */}
                {submitError && (
                  <div className="alert alert-danger" role="alert">
                    {submitError}
                  </div>
                )}

                {/* Basic Information */}
                <div className="row mb-3">
                  <div className="col-md-8">
                    <label htmlFor="name" className="form-label fw-medium">
                      Tournament Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      placeholder="Enter tournament name (e.g., Spring League 2024)"
                    />
                    {errors.name && (
                      <div className="invalid-feedback">{errors.name}</div>
                    )}
                  </div>

                  <div className="col-md-4">
                    <label htmlFor="type" className="form-label fw-medium">
                      Tournament Type <span className="text-danger">*</span>
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      {TOURNAMENT_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-3">
                  <label htmlFor="description" className="form-label fw-medium">
                    Description <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                    placeholder="Describe the tournament, its purpose, and any special requirements..."
                  />
                  {errors.description && (
                    <div className="invalid-feedback">{errors.description}</div>
                  )}
                </div>

                {/* Dates */}
                <div className="row mb-3">
                  <div className="col-md-4">
                    <label htmlFor="startDate" className="form-label fw-medium">
                      Start Date <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className={`form-control ${errors.startDate ? 'is-invalid' : ''}`}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {errors.startDate && (
                      <div className="invalid-feedback">{errors.startDate}</div>
                    )}
                  </div>

                  <div className="col-md-4">
                    <label htmlFor="endDate" className="form-label fw-medium">
                      End Date <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className={`form-control ${errors.endDate ? 'is-invalid' : ''}`}
                      min={formData.startDate || new Date().toISOString().split('T')[0]}
                    />
                    {errors.endDate && (
                      <div className="invalid-feedback">{errors.endDate}</div>
                    )}
                  </div>

                  <div className="col-md-4">
                    <label htmlFor="registrationDeadline" className="form-label fw-medium">
                      Registration Deadline <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      id="registrationDeadline"
                      name="registrationDeadline"
                      value={formData.registrationDeadline}
                      onChange={handleInputChange}
                      className={`form-control ${errors.registrationDeadline ? 'is-invalid' : ''}`}
                      max={formData.startDate || undefined}
                    />
                    {errors.registrationDeadline && (
                      <div className="invalid-feedback">{errors.registrationDeadline}</div>
                    )}
                  </div>
                </div>

                {/* Teams and Venue */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="maxTeams" className="form-label fw-medium">
                      Maximum Teams <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      id="maxTeams"
                      name="maxTeams"
                      value={formData.maxTeams}
                      onChange={handleInputChange}
                      min="2"
                      max="100"
                      className={`form-control ${errors.maxTeams ? 'is-invalid' : ''}`}
                    />
                    {errors.maxTeams && (
                      <div className="invalid-feedback">{errors.maxTeams}</div>
                    )}
                  </div>

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
                      placeholder="Enter venue name (e.g., Central Stadium)"
                    />
                    {errors.venue && (
                      <div className="invalid-feedback">{errors.venue}</div>
                    )}
                  </div>
                </div>

                {/* Prize and Entry Fee */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="prize" className="form-label fw-medium">
                      Prize Pool (Optional)
                    </label>
                    <input
                      type="text"
                      id="prize"
                      name="prize"
                      value={formData.prize}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="Enter prize amount (e.g., $5,000)"
                    />
                  </div>

                                     <div className="col-md-6">
                     <label htmlFor="entryFee" className="form-label fw-medium">
                       Entry Fee (Optional)
                     </label>
                     <div className="row g-2">
                       <div className="col-4">
                         <select
                           id="entryFeeCurrency"
                           name="entryFeeCurrency"
                           value={formData.entryFeeCurrency}
                           onChange={handleInputChange}
                           className="form-select"
                         >
                           {CURRENCIES.map(currency => (
                             <option key={currency.code} value={currency.code}>
                               {currency.symbol} {currency.code}
                             </option>
                           ))}
                         </select>
                       </div>
                       <div className="col-8">
                         <input
                           type="number"
                           id="entryFee"
                           name="entryFee"
                           value={formData.entryFee}
                           onChange={handleInputChange}
                           min="0"
                           step="0.01"
                           className={`form-control ${errors.entryFee ? 'is-invalid' : ''}`}
                           placeholder="0.00"
                         />
                         {errors.entryFee && (
                           <div className="invalid-feedback">{errors.entryFee}</div>
                         )}
                       </div>
                     </div>
                   </div>
                </div>

                {/* Rules */}
                <div className="mb-3">
                  <label htmlFor="rules" className="form-label fw-medium">
                    Tournament Rules (Optional)
                  </label>
                  <textarea
                    id="rules"
                    name="rules"
                    value={formData.rules}
                    onChange={handleInputChange}
                    rows={4}
                    className="form-control"
                    placeholder="Enter tournament rules, format, and any special requirements..."
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
                      Tournament is confirmed and ready to accept registrations
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
                        Create Tournament
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