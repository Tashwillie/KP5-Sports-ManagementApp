'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Users,
  Calendar,
  MapPin,
  Trophy,
  DollarSign,
  FileText,
  Settings,
  Bell,
  Search,
  Home,
  Users as UsersIcon,
  Calendar as CalendarIcon,
  Trophy as TrophyIcon,
  MapPin as MapPinIcon,
  FileText as FileTextIcon,
  Settings as SettingsIcon,
  LogOut,
  User,
  Plus,
  Eye,
  Edit,
  BarChart3,
  Target,
  TrendingUp
} from 'lucide-react';

interface LeagueFormData {
  name: string;
  description: string;
  format: LeagueFormat;
  season: string;
  startDate: string;
  endDate: string;
  maxTeams: number;
  venue: string;
  prizePool?: number;
  prizePoolCurrency: string;
  entryFee?: number;
  entryFeeCurrency: string;
  registrationDeadline: string;
  rules?: string;
  isPublic: boolean;
  isActive: boolean;
}

type LeagueFormat = 'round_robin' | 'knockout' | 'group_stage' | 'mixed';

const LEAGUE_FORMATS = [
  { value: 'round_robin', label: 'Round Robin' },
  { value: 'knockout', label: 'Knockout' },
  { value: 'group_stage', label: 'Group Stage' },
  { value: 'mixed', label: 'Mixed Format' }
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

export default function CreateLeaguePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('leagues');
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<LeagueFormData>({
    name: '',
    description: '',
    format: 'round_robin',
    season: '',
    startDate: '',
    endDate: '',
    maxTeams: 16,
    venue: '',
    prizePool: 0,
    prizePoolCurrency: 'USD',
    entryFee: 0,
    entryFeeCurrency: 'USD',
    registrationDeadline: '',
    rules: '',
    isPublic: true,
    isActive: true,
  });

  // Mock user data
  const userData = {
    id: 'user123',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin'
  };

  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'League name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.season.trim()) {
      newErrors.season = 'Season is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (formData.maxTeams < 2) {
      newErrors.maxTeams = 'Minimum 2 teams required';
    }

    if (formData.maxTeams > 100) {
      newErrors.maxTeams = 'Maximum 100 teams allowed';
    }

    if (!formData.venue.trim()) {
      newErrors.venue = 'Venue is required';
    }

    if (!formData.registrationDeadline) {
      newErrors.registrationDeadline = 'Registration deadline is required';
    }

    if (formData.registrationDeadline && formData.startDate && new Date(formData.registrationDeadline) >= new Date(formData.startDate)) {
      newErrors.registrationDeadline = 'Registration deadline must be before start date';
    }

    if (formData.prizePool && formData.prizePool < 0) {
      newErrors.prizePool = 'Prize pool cannot be negative';
    }

    if (formData.entryFee && formData.entryFee < 0) {
      newErrors.entryFee = 'Entry fee cannot be negative';
    }

    return newErrors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));

    // Clear error for this field
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

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const leagueData = {
        ...formData,
        organizer: userData.name,
        organizerId: userData.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Creating league:', leagueData);
      
      // Redirect to leagues page
      router.push('/leagues');
    } catch (error) {
      setSubmitError('Failed to create league. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <div className="bg-white border-end" style={{ width: '280px', minHeight: '100vh' }}>
        <div className="p-3 border-bottom">
          <img 
            src="/images/logo.png" 
            alt="KP5 Academy" 
            className="img-fluid" 
            style={{ maxHeight: '50px' }}
          />
        </div>
        
        <div className="p-3 border-bottom">
          <div className="d-flex align-items-center">
            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
              <User size={20} className="text-muted" />
            </div>
            <div>
              <div className="fw-medium">{userData.name}</div>
              <small className="text-muted">{userData.role}</small>
            </div>
          </div>
        </div>

        <nav className="p-3">
          <div className="nav flex-column">
            <a href="/dashboard" className={`nav-link d-flex align-items-center py-2 px-3 rounded ${activeTab === 'dashboard' ? 'text-white' : 'text-muted'}`} style={activeTab === 'dashboard' ? {backgroundColor: '#4169E1'} : {}}>
              <Home size={18} className="me-3" />
              Dashboard
            </a>
            <a href="/teams" className={`nav-link d-flex align-items-center py-2 px-3 rounded ${activeTab === 'teams' ? 'text-white' : 'text-muted'}`} style={activeTab === 'teams' ? {backgroundColor: '#4169E1'} : {}}>
              <UsersIcon size={18} className="me-3" />
              Teams
            </a>
            <a href="/matches" className={`nav-link d-flex align-items-center py-2 px-3 rounded ${activeTab === 'matches' ? 'text-white' : 'text-muted'}`} style={activeTab === 'matches' ? {backgroundColor: '#4169E1'} : {}}>
              <Target size={18} className="me-3" />
              Matches
            </a>
            <a href="/tournaments" className={`nav-link d-flex align-items-center py-2 px-3 rounded ${activeTab === 'tournaments' ? 'text-white' : 'text-muted'}`} style={activeTab === 'tournaments' ? {backgroundColor: '#4169E1'} : {}}>
              <TrophyIcon size={18} className="me-3" />
              Tournaments
            </a>
            <a href="/leagues" className={`nav-link d-flex align-items-center py-2 px-3 rounded ${activeTab === 'leagues' ? 'text-white' : 'text-muted'}`} style={activeTab === 'leagues' ? {backgroundColor: '#4169E1'} : {}}>
              <BarChart3 size={18} className="me-3" />
              Leagues
            </a>
            <a href="/events" className={`nav-link d-flex align-items-center py-2 px-3 rounded ${activeTab === 'events' ? 'text-white' : 'text-muted'}`} style={activeTab === 'events' ? {backgroundColor: '#4169E1'} : {}}>
              <CalendarIcon size={18} className="me-3" />
              Events
            </a>
            <a href="/settings" className={`nav-link d-flex align-items-center py-2 px-3 rounded ${activeTab === 'settings' ? 'text-white' : 'text-muted'}`} style={activeTab === 'settings' ? {backgroundColor: '#4169E1'} : {}}>
              <SettingsIcon size={18} className="me-3" />
              Settings
            </a>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 bg-light">
        {/* Header */}
        <div className="bg-white border-bottom p-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <h4 className="mb-0 me-3">Create New League</h4>
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
                className="btn btn-outline-secondary btn-sm d-flex align-items-center"
                onClick={() => router.push('/leagues')}
              >
                <ArrowLeft size={16} className="me-1" />
                Back to Leagues
              </button>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row g-4">
                  {/* Basic Information */}
                  <div className="col-12">
                    <h5 className="mb-3" style={{color: '#4169E1'}}>Basic Information</h5>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="name" className="form-label fw-medium">
                      League Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      placeholder="Enter league name"
                    />
                    {errors.name && (
                      <div className="invalid-feedback">{errors.name}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="season" className="form-label fw-medium">
                      Season *
                    </label>
                    <input
                      type="text"
                      id="season"
                      name="season"
                      value={formData.season}
                      onChange={handleInputChange}
                      className={`form-control ${errors.season ? 'is-invalid' : ''}`}
                      placeholder="e.g., 2024 Spring Season"
                    />
                    {errors.season && (
                      <div className="invalid-feedback">{errors.season}</div>
                    )}
                  </div>

                  <div className="col-12">
                    <label htmlFor="description" className="form-label fw-medium">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                      placeholder="Describe the league, its purpose, and what teams can expect"
                    />
                    {errors.description && (
                      <div className="invalid-feedback">{errors.description}</div>
                    )}
                  </div>

                  {/* Format and Structure */}
                  <div className="col-12">
                    <h5 className="mb-3" style={{color: '#4169E1'}}>Format & Structure</h5>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="format" className="form-label fw-medium">
                      League Format *
                    </label>
                    <select
                      id="format"
                      name="format"
                      value={formData.format}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      {LEAGUE_FORMATS.map(format => (
                        <option key={format.value} value={format.value}>
                          {format.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="maxTeams" className="form-label fw-medium">
                      Maximum Teams *
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

                  {/* Dates */}
                  <div className="col-12">
                    <h5 className="mb-3" style={{color: '#4169E1'}}>Schedule</h5>
                  </div>

                  <div className="col-md-4">
                    <label htmlFor="startDate" className="form-label fw-medium">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className={`form-control ${errors.startDate ? 'is-invalid' : ''}`}
                    />
                    {errors.startDate && (
                      <div className="invalid-feedback">{errors.startDate}</div>
                    )}
                  </div>

                  <div className="col-md-4">
                    <label htmlFor="endDate" className="form-label fw-medium">
                      End Date *
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className={`form-control ${errors.endDate ? 'is-invalid' : ''}`}
                    />
                    {errors.endDate && (
                      <div className="invalid-feedback">{errors.endDate}</div>
                    )}
                  </div>

                  <div className="col-md-4">
                    <label htmlFor="registrationDeadline" className="form-label fw-medium">
                      Registration Deadline *
                    </label>
                    <input
                      type="date"
                      id="registrationDeadline"
                      name="registrationDeadline"
                      value={formData.registrationDeadline}
                      onChange={handleInputChange}
                      className={`form-control ${errors.registrationDeadline ? 'is-invalid' : ''}`}
                    />
                    {errors.registrationDeadline && (
                      <div className="invalid-feedback">{errors.registrationDeadline}</div>
                    )}
                  </div>

                  {/* Venue */}
                  <div className="col-12">
                    <h5 className="mb-3" style={{color: '#4169E1'}}>Venue</h5>
                  </div>

                  <div className="col-12">
                    <label htmlFor="venue" className="form-label fw-medium">
                      Venue *
                    </label>
                    <input
                      type="text"
                      id="venue"
                      name="venue"
                      value={formData.venue}
                      onChange={handleInputChange}
                      className={`form-control ${errors.venue ? 'is-invalid' : ''}`}
                      placeholder="Enter venue name or address"
                    />
                    {errors.venue && (
                      <div className="invalid-feedback">{errors.venue}</div>
                    )}
                  </div>

                  {/* Prize Pool */}
                  <div className="col-12">
                    <h5 className="mb-3" style={{color: '#4169E1'}}>Prize Pool (Optional)</h5>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="prizePool" className="form-label fw-medium">
                      Prize Pool Amount
                    </label>
                    <div className="row g-2">
                      <div className="col-4">
                        <select
                          id="prizePoolCurrency"
                          name="prizePoolCurrency"
                          value={formData.prizePoolCurrency}
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
                          id="prizePool"
                          name="prizePool"
                          value={formData.prizePool}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          className={`form-control ${errors.prizePool ? 'is-invalid' : ''}`}
                          placeholder="0.00"
                        />
                        {errors.prizePool && (
                          <div className="invalid-feedback">{errors.prizePool}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Entry Fee */}
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

                  {/* Rules */}
                  <div className="col-12">
                    <h5 className="mb-3" style={{color: '#4169E1'}}>Rules & Settings</h5>
                  </div>

                  <div className="col-12">
                    <label htmlFor="rules" className="form-label fw-medium">
                      League Rules (Optional)
                    </label>
                    <textarea
                      id="rules"
                      name="rules"
                      value={formData.rules}
                      onChange={handleInputChange}
                      rows={4}
                      className="form-control"
                      placeholder="Enter league rules, regulations, and special requirements"
                    />
                  </div>

                  {/* Settings */}
                  <div className="col-12">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        id="isPublic"
                        name="isPublic"
                        checked={formData.isPublic}
                        onChange={handleInputChange}
                        className="form-check-input"
                      />
                      <label htmlFor="isPublic" className="form-check-label">
                        Make this league public (visible to all users)
                      </label>
                    </div>
                  </div>

                  <div className="col-12">
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
                        Activate league immediately after creation
                      </label>
                    </div>
                  </div>

                  {/* Submit Error */}
                  {submitError && (
                    <div className="col-12">
                      <div className="alert alert-danger" role="alert">
                        {submitError}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="col-12">
                    <div className="d-flex gap-3 justify-content-end">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => router.push('/leagues')}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn text-white d-flex align-items-center"
                        style={{backgroundColor: '#4169E1'}}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <div className="spinner-border spinner-border-sm me-2" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            Creating...
                          </>
                        ) : (
                          <>
                            <Save size={16} className="me-2" />
                            Create League
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 