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
  UserCheck,
  Activity,
  Upload,
  Heart,
  Shield
} from 'lucide-react';

interface PlayerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  position: string;
  jerseyNumber: number;
  teamId?: string;
  clubId?: string;
  status: 'active' | 'inactive' | 'injured' | 'suspended';
  level: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  height: number;
  weight: number;
  nationality: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalInfo?: string;
  photo?: string;
  isActive: boolean;
}

const POSITIONS = [
  'Forward',
  'Midfielder',
  'Defender',
  'Goalkeeper',
  'Winger',
  'Striker',
  'Center Back',
  'Full Back',
  'Central Midfielder',
  'Attacking Midfielder',
  'Defensive Midfielder'
];

const NATIONALITIES = [
  'Nigerian',
  'Kenyan',
  'Ghanaian',
  'South African',
  'Tanzanian',
  'Ugandan',
  'Zambian',
  'Malawian',
  'Botswanan',
  'Namibian',
  'Zimbabwean',
  'Mozambican',
  'Angolan',
  'Cameroonian',
  'Senegalese',
  'Ivorian',
  'Moroccan',
  'Egyptian',
  'Tunisian',
  'Algerian',
  'Other'
];

export default function CreatePlayerPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('players');
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<PlayerFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    position: '',
    jerseyNumber: 1,
    teamId: '',
    clubId: '',
    status: 'active',
    level: 'beginner',
    height: 170,
    weight: 70,
    nationality: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalInfo: '',
    photo: '',
    isActive: true,
  });

  // Mock user data
  const userData = {
    id: 'user123',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin'
  };

  // Mock teams and clubs data
  const mockTeams = [
    { id: 'team1', name: 'Elite FC', clubId: 'club1' },
    { id: 'team2', name: 'Basketball Stars', clubId: 'club2' },
    { id: 'team3', name: 'Cricket Champions', clubId: 'club3' },
    { id: 'team4', name: 'Tennis Excellence', clubId: 'club4' },
    { id: 'team5', name: 'Swimming Dolphins', clubId: 'club5' }
  ];

  const mockClubs = [
    { id: 'club1', name: 'Elite Football Academy' },
    { id: 'club2', name: 'Basketball Stars Club' },
    { id: 'club3', name: 'Cricket Champions' },
    { id: 'club4', name: 'Tennis Excellence' },
    { id: 'club5', name: 'Swimming Dolphins' }
  ];

  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 5 || age > 100) {
        newErrors.dateOfBirth = 'Please enter a valid date of birth';
      }
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    }

    if (formData.jerseyNumber < 1 || formData.jerseyNumber > 99) {
      newErrors.jerseyNumber = 'Jersey number must be between 1 and 99';
    }

    if (formData.height < 100 || formData.height > 250) {
      newErrors.height = 'Height must be between 100 and 250 cm';
    }

    if (formData.weight < 20 || formData.weight > 200) {
      newErrors.weight = 'Weight must be between 20 and 200 kg';
    }

    if (!formData.nationality.trim()) {
      newErrors.nationality = 'Nationality is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.emergencyContact.trim()) {
      newErrors.emergencyContact = 'Emergency contact is required';
    }

    if (!formData.emergencyPhone.trim()) {
      newErrors.emergencyPhone = 'Emergency phone is required';
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

      const playerData = {
        ...formData,
        age: new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear(),
        createdBy: userData.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Creating player:', playerData);
      
      // Redirect to players page
      router.push('/players');
    } catch (error) {
      setSubmitError('Failed to create player. Please try again.');
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
            <a href="/players" className={`nav-link d-flex align-items-center py-2 px-3 rounded ${activeTab === 'players' ? 'text-white' : 'text-muted'}`} style={activeTab === 'players' ? {backgroundColor: '#4169E1'} : {}}>
              <UserCheck size={18} className="me-3" />
              Players
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
              <h4 className="mb-0 me-3">Add New Player</h4>
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
                onClick={() => router.push('/players')}
              >
                <ArrowLeft size={16} className="me-1" />
                Back to Players
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
                    <label htmlFor="firstName" className="form-label fw-medium">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                      placeholder="Enter first name"
                    />
                    {errors.firstName && (
                      <div className="invalid-feedback">{errors.firstName}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="lastName" className="form-label fw-medium">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                      placeholder="Enter last name"
                    />
                    {errors.lastName && (
                      <div className="invalid-feedback">{errors.lastName}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="email" className="form-label fw-medium">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      placeholder="player@email.com"
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="phone" className="form-label fw-medium">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                      placeholder="+234 801 234 5678"
                    />
                    {errors.phone && (
                      <div className="invalid-feedback">{errors.phone}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="dateOfBirth" className="form-label fw-medium">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className={`form-control ${errors.dateOfBirth ? 'is-invalid' : ''}`}
                    />
                    {errors.dateOfBirth && (
                      <div className="invalid-feedback">{errors.dateOfBirth}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="nationality" className="form-label fw-medium">
                      Nationality *
                    </label>
                    <select
                      id="nationality"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      className={`form-select ${errors.nationality ? 'is-invalid' : ''}`}
                    >
                      <option value="">Select nationality</option>
                      {NATIONALITIES.map(nationality => (
                        <option key={nationality} value={nationality}>
                          {nationality}
                        </option>
                      ))}
                    </select>
                    {errors.nationality && (
                      <div className="invalid-feedback">{errors.nationality}</div>
                    )}
                  </div>

                  {/* Sports Information */}
                  <div className="col-12">
                    <h5 className="mb-3" style={{color: '#4169E1'}}>Sports Information</h5>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="position" className="form-label fw-medium">
                      Position *
                    </label>
                    <select
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      className={`form-select ${errors.position ? 'is-invalid' : ''}`}
                    >
                      <option value="">Select position</option>
                      {POSITIONS.map(position => (
                        <option key={position} value={position}>
                          {position}
                        </option>
                      ))}
                    </select>
                    {errors.position && (
                      <div className="invalid-feedback">{errors.position}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="jerseyNumber" className="form-label fw-medium">
                      Jersey Number *
                    </label>
                    <input
                      type="number"
                      id="jerseyNumber"
                      name="jerseyNumber"
                      value={formData.jerseyNumber}
                      onChange={handleInputChange}
                      min="1"
                      max="99"
                      className={`form-control ${errors.jerseyNumber ? 'is-invalid' : ''}`}
                    />
                    {errors.jerseyNumber && (
                      <div className="invalid-feedback">{errors.jerseyNumber}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="level" className="form-label fw-medium">
                      Skill Level *
                    </label>
                    <select
                      id="level"
                      name="level"
                      value={formData.level}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="elite">Elite</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="status" className="form-label fw-medium">
                      Status *
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="injured">Injured</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>

                  {/* Physical Information */}
                  <div className="col-12">
                    <h5 className="mb-3" style={{color: '#4169E1'}}>Physical Information</h5>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="height" className="form-label fw-medium">
                      Height (cm) *
                    </label>
                    <input
                      type="number"
                      id="height"
                      name="height"
                      value={formData.height}
                      onChange={handleInputChange}
                      min="100"
                      max="250"
                      className={`form-control ${errors.height ? 'is-invalid' : ''}`}
                    />
                    {errors.height && (
                      <div className="invalid-feedback">{errors.height}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="weight" className="form-label fw-medium">
                      Weight (kg) *
                    </label>
                    <input
                      type="number"
                      id="weight"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      min="20"
                      max="200"
                      className={`form-control ${errors.weight ? 'is-invalid' : ''}`}
                    />
                    {errors.weight && (
                      <div className="invalid-feedback">{errors.weight}</div>
                    )}
                  </div>

                  {/* Team Assignment */}
                  <div className="col-12">
                    <h5 className="mb-3" style={{color: '#4169E1'}}>Team Assignment</h5>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="clubId" className="form-label fw-medium">
                      Club (Optional)
                    </label>
                    <select
                      id="clubId"
                      name="clubId"
                      value={formData.clubId}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="">Select club</option>
                      {mockClubs.map(club => (
                        <option key={club.id} value={club.id}>
                          {club.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="teamId" className="form-label fw-medium">
                      Team (Optional)
                    </label>
                    <select
                      id="teamId"
                      name="teamId"
                      value={formData.teamId}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="">Select team</option>
                      {mockTeams.map(team => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Contact Information */}
                  <div className="col-12">
                    <h5 className="mb-3" style={{color: '#4169E1'}}>Contact Information</h5>
                  </div>

                  <div className="col-12">
                    <label htmlFor="address" className="form-label fw-medium">
                      Address *
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
                    <label htmlFor="emergencyContact" className="form-label fw-medium">
                      Emergency Contact Name *
                    </label>
                    <input
                      type="text"
                      id="emergencyContact"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleInputChange}
                      className={`form-control ${errors.emergencyContact ? 'is-invalid' : ''}`}
                      placeholder="Emergency contact name"
                    />
                    {errors.emergencyContact && (
                      <div className="invalid-feedback">{errors.emergencyContact}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="emergencyPhone" className="form-label fw-medium">
                      Emergency Contact Phone *
                    </label>
                    <input
                      type="tel"
                      id="emergencyPhone"
                      name="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={handleInputChange}
                      className={`form-control ${errors.emergencyPhone ? 'is-invalid' : ''}`}
                      placeholder="Emergency contact phone"
                    />
                    {errors.emergencyPhone && (
                      <div className="invalid-feedback">{errors.emergencyPhone}</div>
                    )}
                  </div>

                  {/* Medical Information */}
                  <div className="col-12">
                    <h5 className="mb-3" style={{color: '#4169E1'}}>Medical Information</h5>
                  </div>

                  <div className="col-12">
                    <label htmlFor="medicalInfo" className="form-label fw-medium">
                      Medical Information (Optional)
                    </label>
                    <textarea
                      id="medicalInfo"
                      name="medicalInfo"
                      value={formData.medicalInfo}
                      onChange={handleInputChange}
                      rows={3}
                      className="form-control"
                      placeholder="Enter any medical conditions, allergies, or special requirements"
                    />
                  </div>

                  {/* Settings */}
                  <div className="col-12">
                    <h5 className="mb-3" style={{color: '#4169E1'}}>Settings</h5>
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
                        Activate player immediately after creation
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
                        onClick={() => router.push('/players')}
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
                            Create Player
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