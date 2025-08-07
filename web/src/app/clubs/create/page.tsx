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
  TrendingUp,
  Building,
  Phone,
  Mail,
  Globe,
  Star,
  Award,
  Upload
} from 'lucide-react';

interface ClubFormData {
  name: string;
  description: string;
  location: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  foundedYear: number;
  sports: string[];
  logo?: string;
  isActive: boolean;
  isPublic: boolean;
  maxTeams: number;
  maxMembers: number;
  facilities: string;
  membershipFee?: number;
  membershipFeeCurrency: string;
  rules?: string;
  notes?: string;
}

const SPORTS_OPTIONS = [
  'Football',
  'Basketball',
  'Cricket',
  'Tennis',
  'Swimming',
  'Athletics',
  'Volleyball',
  'Hockey',
  'Rugby',
  'Golf',
  'Table Tennis',
  'Badminton',
  'Boxing',
  'Martial Arts',
  'Cycling',
  'Futsal',
  'Water Polo',
  'Squash',
  'Rowing',
  'Archery'
];

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

export default function CreateClubPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('clubs');
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<ClubFormData>({
    name: '',
    description: '',
    location: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    foundedYear: new Date().getFullYear(),
    sports: [],
    logo: '',
    isActive: true,
    isPublic: true,
    maxTeams: 10,
    maxMembers: 100,
    facilities: '',
    membershipFee: 0,
    membershipFeeCurrency: 'USD',
    rules: '',
    notes: '',
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
      newErrors.name = 'Club name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Contact email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }

    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'Contact phone is required';
    }

    if (formData.foundedYear < 1900 || formData.foundedYear > new Date().getFullYear()) {
      newErrors.foundedYear = 'Please enter a valid founding year';
    }

    if (formData.sports.length === 0) {
      newErrors.sports = 'Please select at least one sport';
    }

    if (formData.maxTeams < 1) {
      newErrors.maxTeams = 'Maximum teams must be at least 1';
    }

    if (formData.maxMembers < 1) {
      newErrors.maxMembers = 'Maximum members must be at least 1';
    }

    if (formData.membershipFee && formData.membershipFee < 0) {
      newErrors.membershipFee = 'Membership fee cannot be negative';
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

  const handleSportChange = (sport: string) => {
    setFormData(prev => ({
      ...prev,
      sports: prev.sports.includes(sport)
        ? prev.sports.filter(s => s !== sport)
        : [...prev.sports, sport]
    }));

    // Clear sports error if sports are selected
    if (errors.sports && formData.sports.length > 0) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.sports;
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

      const clubData = {
        ...formData,
        adminId: userData.id,
        adminName: userData.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Creating club:', clubData);
      
      // Redirect to clubs page
      router.push('/clubs');
    } catch (error) {
      setSubmitError('Failed to create club. Please try again.');
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
            <a href="/clubs" className={`nav-link d-flex align-items-center py-2 px-3 rounded ${activeTab === 'clubs' ? 'text-white' : 'text-muted'}`} style={activeTab === 'clubs' ? {backgroundColor: '#4169E1'} : {}}>
              <Building size={18} className="me-3" />
              Clubs
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
              <h4 className="mb-0 me-3">Create New Club</h4>
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
                onClick={() => router.push('/clubs')}
              >
                <ArrowLeft size={16} className="me-1" />
                Back to Clubs
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
                      Club Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      placeholder="Enter club name"
                    />
                    {errors.name && (
                      <div className="invalid-feedback">{errors.name}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="foundedYear" className="form-label fw-medium">
                      Founded Year *
                    </label>
                    <input
                      type="number"
                      id="foundedYear"
                      name="foundedYear"
                      value={formData.foundedYear}
                      onChange={handleInputChange}
                      min="1900"
                      max={new Date().getFullYear()}
                      className={`form-control ${errors.foundedYear ? 'is-invalid' : ''}`}
                    />
                    {errors.foundedYear && (
                      <div className="invalid-feedback">{errors.foundedYear}</div>
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
                      placeholder="Describe the club, its mission, and what it offers"
                    />
                    {errors.description && (
                      <div className="invalid-feedback">{errors.description}</div>
                    )}
                  </div>

                  {/* Location & Contact */}
                  <div className="col-12">
                    <h5 className="mb-3" style={{color: '#4169E1'}}>Location & Contact</h5>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="location" className="form-label fw-medium">
                      Location (City, Country) *
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className={`form-control ${errors.location ? 'is-invalid' : ''}`}
                      placeholder="e.g., Lagos, Nigeria"
                    />
                    {errors.location && (
                      <div className="invalid-feedback">{errors.location}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="address" className="form-label fw-medium">
                      Full Address *
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                      placeholder="Enter complete address"
                    />
                    {errors.address && (
                      <div className="invalid-feedback">{errors.address}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="contactEmail" className="form-label fw-medium">
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      id="contactEmail"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      className={`form-control ${errors.contactEmail ? 'is-invalid' : ''}`}
                      placeholder="info@clubname.com"
                    />
                    {errors.contactEmail && (
                      <div className="invalid-feedback">{errors.contactEmail}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="contactPhone" className="form-label fw-medium">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      id="contactPhone"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                      className={`form-control ${errors.contactPhone ? 'is-invalid' : ''}`}
                      placeholder="+234 801 234 5678"
                    />
                    {errors.contactPhone && (
                      <div className="invalid-feedback">{errors.contactPhone}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="website" className="form-label fw-medium">
                      Website (Optional)
                    </label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="https://www.clubname.com"
                    />
                  </div>

                  {/* Sports & Capacity */}
                  <div className="col-12">
                    <h5 className="mb-3" style={{color: '#4169E1'}}>Sports & Capacity</h5>
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-medium">
                      Sports Offered *
                    </label>
                    <div className={`border rounded p-3 ${errors.sports ? 'border-danger' : 'border-secondary'}`}>
                      <div className="row g-2">
                        {SPORTS_OPTIONS.map((sport) => (
                          <div key={sport} className="col-md-4 col-sm-6">
                            <div className="form-check">
                              <input
                                type="checkbox"
                                id={`sport-${sport}`}
                                className="form-check-input"
                                checked={formData.sports.includes(sport)}
                                onChange={() => handleSportChange(sport)}
                              />
                              <label htmlFor={`sport-${sport}`} className="form-check-label">
                                {sport}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {errors.sports && (
                      <div className="text-danger small mt-1">{errors.sports}</div>
                    )}
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
                      min="1"
                      className={`form-control ${errors.maxTeams ? 'is-invalid' : ''}`}
                    />
                    {errors.maxTeams && (
                      <div className="invalid-feedback">{errors.maxTeams}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="maxMembers" className="form-label fw-medium">
                      Maximum Members *
                    </label>
                    <input
                      type="number"
                      id="maxMembers"
                      name="maxMembers"
                      value={formData.maxMembers}
                      onChange={handleInputChange}
                      min="1"
                      className={`form-control ${errors.maxMembers ? 'is-invalid' : ''}`}
                    />
                    {errors.maxMembers && (
                      <div className="invalid-feedback">{errors.maxMembers}</div>
                    )}
                  </div>

                  {/* Facilities & Membership */}
                  <div className="col-12">
                    <h5 className="mb-3" style={{color: '#4169E1'}}>Facilities & Membership</h5>
                  </div>

                  <div className="col-12">
                    <label htmlFor="facilities" className="form-label fw-medium">
                      Facilities Description
                    </label>
                    <textarea
                      id="facilities"
                      name="facilities"
                      value={formData.facilities}
                      onChange={handleInputChange}
                      rows={3}
                      className="form-control"
                      placeholder="Describe the facilities available (fields, courts, equipment, etc.)"
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="membershipFee" className="form-label fw-medium">
                      Membership Fee (Optional)
                    </label>
                    <div className="row g-2">
                      <div className="col-4">
                        <select
                          id="membershipFeeCurrency"
                          name="membershipFeeCurrency"
                          value={formData.membershipFeeCurrency}
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
                          id="membershipFee"
                          name="membershipFee"
                          value={formData.membershipFee}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          className={`form-control ${errors.membershipFee ? 'is-invalid' : ''}`}
                          placeholder="0.00"
                        />
                        {errors.membershipFee && (
                          <div className="invalid-feedback">{errors.membershipFee}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rules & Settings */}
                  <div className="col-12">
                    <h5 className="mb-3" style={{color: '#4169E1'}}>Rules & Settings</h5>
                  </div>

                  <div className="col-12">
                    <label htmlFor="rules" className="form-label fw-medium">
                      Club Rules (Optional)
                    </label>
                    <textarea
                      id="rules"
                      name="rules"
                      value={formData.rules}
                      onChange={handleInputChange}
                      rows={4}
                      className="form-control"
                      placeholder="Enter club rules, regulations, and policies"
                    />
                  </div>

                  <div className="col-12">
                    <label htmlFor="notes" className="form-label fw-medium">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="form-control"
                      placeholder="Any additional information about the club"
                    />
                  </div>

                  {/* Settings */}
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
                        Activate club immediately after creation
                      </label>
                    </div>
                  </div>

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
                        Make this club public (visible to all users)
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
                        onClick={() => router.push('/clubs')}
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
                            Create Club
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