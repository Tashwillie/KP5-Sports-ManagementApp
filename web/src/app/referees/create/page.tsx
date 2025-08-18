'use client';

import React, { useState } from 'react';
import { useEnhancedAuthContext } from '@/contexts/EnhancedAuthContext';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Save,
  Upload,
  Gavel
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';

interface RefereeFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  certifications: string[];
  experience: {
    years: number;
    description: string;
  };
  specializations: string[];
  bio: string;
  photoURL: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
  };
  availability: {
    days: string[];
    hours: string;
  };
  salary: number;
  status: 'active' | 'inactive' | 'pending';
  refereeLevel: 'fifa' | 'national' | 'regional' | 'local';
  sports: string[];
  languages: string[];
}

export default function CreateRefereePage() {
  const { user, loading: authLoading  } = useEnhancedAuthContext();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  const [formData, setFormData] = useState<RefereeFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'male',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    certifications: [],
    experience: {
      years: 0,
      description: '',
    },
    specializations: [],
    bio: '',
    photoURL: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
      email: '',
    },
    availability: {
      days: [],
      hours: '',
    },
    salary: 0,
    status: 'pending',
    refereeLevel: 'local',
    sports: [],
    languages: [],
  });

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof RefereeFormData],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement referee creation logic with Firebase
      console.log('Creating referee:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      router.push('/referees');
    } catch (error) {
      console.error('Error creating referee:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="d-flex">
        <div className="bg-white border-end" style={{width: '280px', minHeight: '100vh'}}>
          <div className="p-3">
            <div className="placeholder-glow">
              <div className="placeholder col-8 mb-4"></div>
              <div className="placeholder col-6 mb-3"></div>
              <div className="placeholder col-10 mb-2"></div>
            </div>
          </div>
        </div>
        <div className="flex-grow-1 bg-light">
          <div className="p-4">
            <div className="placeholder-glow">
              <div className="placeholder col-4 mb-4"></div>
              <div className="placeholder col-8 mb-3"></div>
              <div className="placeholder col-6 mb-2"></div>
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
          <p className="text-muted">Please sign in to access this page.</p>
          <div className="mt-3">
            <button 
              className="btn btn-primary"
              onClick={() => router.push('/auth/signin')}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mock user data for sidebar
  const userData = {
    id: user.id || 'user123',
    name: user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Admin User',
    email: user.email || 'admin@example.com',
    role: user.role || 'Super Admin'
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh', overflow: 'hidden' }}>
      <Sidebar activeTab="referees" userData={userData} />
      
      {/* Main Content */}
      <div className="flex-grow-1 bg-light" style={{ minWidth: 0, overflow: 'auto' }}>
        {/* Top Header */}
        <div className="bg-white border-bottom p-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <button 
                className="btn btn-link text-dark p-0"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h5 className="mb-0">Create New Referee</h5>
                <small className="text-muted">Add a new referee to the system</small>
              </div>
            </div>
            
            <div className="d-flex align-items-center gap-3">
              <button className="btn btn-outline-secondary">
                <Save className="h-4 w-4 me-1" />
                Save Draft
              </button>
              <button 
                className="btn btn-sm" 
                style={{backgroundColor: '#4169E1', borderColor: '#4169E1', color: 'white'}}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 me-1" />
                    Create Referee
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main Form Content */}
        <div className="p-4">
          <div className="row">
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-transparent border-0">
                  <ul className="nav nav-tabs card-header-tabs" role="tablist">
                    <li className="nav-item" role="presentation">
                      <button 
                        className={`nav-link ${activeTab === 'personal' ? 'active' : ''}`}
                        onClick={() => setActiveTab('personal')}
                      >
                        Personal Info
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button 
                        className={`nav-link ${activeTab === 'professional' ? 'active' : ''}`}
                        onClick={() => setActiveTab('professional')}
                      >
                        Professional Details
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button 
                        className={`nav-link ${activeTab === 'contact' ? 'active' : ''}`}
                        onClick={() => setActiveTab('contact')}
                      >
                        Contact & Emergency
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button 
                        className={`nav-link ${activeTab === 'availability' ? 'active' : ''}`}
                        onClick={() => setActiveTab('availability')}
                      >
                        Availability
                      </button>
                    </li>
                  </ul>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    {/* Personal Information Tab */}
                    {activeTab === 'personal' && (
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">First Name *</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Last Name *</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Email *</label>
                          <input
                            type="email"
                            className="form-control"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Phone *</label>
                          <input
                            type="tel"
                            className="form-control"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Date of Birth</label>
                          <input
                            type="date"
                            className="form-control"
                            value={formData.dateOfBirth}
                            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Gender</label>
                          <select
                            className="form-select"
                            value={formData.gender}
                            onChange={(e) => handleInputChange('gender', e.target.value)}
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Referee Level</label>
                          <select
                            className="form-select"
                            value={formData.refereeLevel}
                            onChange={(e) => handleInputChange('refereeLevel', e.target.value)}
                          >
                            <option value="local">Local</option>
                            <option value="regional">Regional</option>
                            <option value="national">National</option>
                            <option value="fifa">FIFA</option>
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Languages</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter languages (comma-separated)"
                            value={formData.languages.join(', ')}
                            onChange={(e) => handleInputChange('languages', e.target.value.split(',').map(s => s.trim()))}
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label">Bio</label>
                          <textarea
                            className="form-control"
                            rows={4}
                            value={formData.bio}
                            onChange={(e) => handleInputChange('bio', e.target.value)}
                            placeholder="Tell us about the referee's background and experience..."
                          />
                        </div>
                      </div>
                    )}

                    {/* Professional Details Tab */}
                    {activeTab === 'professional' && (
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">Years of Experience</label>
                          <input
                            type="number"
                            className="form-control"
                            value={formData.experience.years}
                            onChange={(e) => handleInputChange('experience.years', parseInt(e.target.value))}
                            min="0"
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Salary per Match</label>
                          <div className="input-group">
                            <span className="input-group-text">$</span>
                            <input
                              type="number"
                              className="form-control"
                              value={formData.salary}
                              onChange={(e) => handleInputChange('salary', parseFloat(e.target.value))}
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                        <div className="col-12">
                          <label className="form-label">Experience Description</label>
                          <textarea
                            className="form-control"
                            rows={3}
                            value={formData.experience.description}
                            onChange={(e) => handleInputChange('experience.description', e.target.value)}
                            placeholder="Describe the referee's experience and achievements..."
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label">Certifications</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter certifications (comma-separated)"
                            value={formData.certifications.join(', ')}
                            onChange={(e) => handleInputChange('certifications', e.target.value.split(',').map(s => s.trim()))}
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label">Sports Specializations</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter sports (comma-separated)"
                            value={formData.sports.join(', ')}
                            onChange={(e) => handleInputChange('sports', e.target.value.split(',').map(s => s.trim()))}
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label">Specializations</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter specializations (comma-separated)"
                            value={formData.specializations.join(', ')}
                            onChange={(e) => handleInputChange('specializations', e.target.value.split(',').map(s => s.trim()))}
                          />
                        </div>
                      </div>
                    )}

                    {/* Contact & Emergency Tab */}
                    {activeTab === 'contact' && (
                      <div className="row g-3">
                        <div className="col-12">
                          <h6 className="mb-3">Address Information</h6>
                        </div>
                        <div className="col-12">
                          <label className="form-label">Street Address</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.address.street}
                            onChange={(e) => handleInputChange('address.street', e.target.value)}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">City</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.address.city}
                            onChange={(e) => handleInputChange('address.city', e.target.value)}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">State</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.address.state}
                            onChange={(e) => handleInputChange('address.state', e.target.value)}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">ZIP Code</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.address.zipCode}
                            onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Country</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.address.country}
                            onChange={(e) => handleInputChange('address.country', e.target.value)}
                          />
                        </div>
                        
                        <div className="col-12">
                          <h6 className="mb-3 mt-4">Emergency Contact</h6>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Emergency Contact Name</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.emergencyContact.name}
                            onChange={(e) => handleInputChange('emergencyContact.name', e.target.value)}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Relationship</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.emergencyContact.relationship}
                            onChange={(e) => handleInputChange('emergencyContact.relationship', e.target.value)}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Emergency Phone</label>
                          <input
                            type="tel"
                            className="form-control"
                            value={formData.emergencyContact.phone}
                            onChange={(e) => handleInputChange('emergencyContact.phone', e.target.value)}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Emergency Email</label>
                          <input
                            type="email"
                            className="form-control"
                            value={formData.emergencyContact.email}
                            onChange={(e) => handleInputChange('emergencyContact.email', e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {/* Availability Tab */}
                    {activeTab === 'availability' && (
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="form-label">Available Days</label>
                          <div className="row g-2">
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                              <div key={day} className="col-md-3">
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={`day-${day}`}
                                    checked={formData.availability.days.includes(day)}
                                    onChange={(e) => {
                                      const newDays = e.target.checked
                                        ? [...formData.availability.days, day]
                                        : formData.availability.days.filter(d => d !== day);
                                      handleInputChange('availability.days', newDays);
                                    }}
                                  />
                                  <label className="form-check-label" htmlFor={`day-${day}`}>
                                    {day}
                                  </label>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Available Hours</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.availability.hours}
                            onChange={(e) => handleInputChange('availability.hours', e.target.value)}
                            placeholder="e.g., 9:00 AM - 5:00 PM"
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Status</label>
                          <select
                            className="form-select"
                            value={formData.status}
                            onChange={(e) => handleInputChange('status', e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-transparent border-0">
                  <h6 className="card-title mb-0">Referee Photo</h6>
                </div>
                <div className="card-body text-center">
                  <div className="mb-3">
                    <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center" style={{width: '120px', height: '120px'}}>
                      {formData.photoURL ? (
                        <img 
                          src={formData.photoURL} 
                          alt="Referee" 
                          className="rounded-circle"
                          style={{width: '120px', height: '120px', objectFit: 'cover'}}
                        />
                      ) : (
                        <Gavel className="h-8 w-8 text-muted" />
                      )}
                    </div>
                  </div>
                  <button className="btn btn-outline-secondary btn-sm">
                    <Upload className="h-4 w-4 me-1" />
                    Upload Photo
                  </button>
                </div>
              </div>

              <div className="card border-0 shadow-sm">
                <div className="card-header bg-transparent border-0">
                  <h6 className="card-title mb-0">Form Progress</h6>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <small>Personal Info</small>
                      <small>25%</small>
                    </div>
                    <div className="progress" style={{height: '6px'}}>
                      <div className="progress-bar" style={{width: '25%', backgroundColor: '#4169E1'}}></div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <small>Professional Details</small>
                      <small>0%</small>
                    </div>
                    <div className="progress" style={{height: '6px'}}>
                      <div className="progress-bar" style={{width: '0%', backgroundColor: '#4169E1'}}></div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <small>Contact Info</small>
                      <small>0%</small>
                    </div>
                    <div className="progress" style={{height: '6px'}}>
                      <div className="progress-bar" style={{width: '0%', backgroundColor: '#4169E1'}}></div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <small>Availability</small>
                      <small>0%</small>
                    </div>
                    <div className="progress" style={{height: '6px'}}>
                      <div className="progress-bar" style={{width: '0%', backgroundColor: '#4169E1'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 