'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEnhancedAuthContext } from '@/contexts/EnhancedAuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import { ChevronLeft, GraduationCap, Save } from 'lucide-react';
import { toast } from 'sonner';

interface CoachFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  specialization: string;
  experience: number;
  certification: string;
  level: 'junior' | 'senior' | 'head' | 'assistant';
  nationality: string;
  address: string;
  bio?: string;
  status: 'active' | 'inactive' | 'on_leave' | 'suspended';
}

const SPECIALIZATIONS = [
  'Football',
  'Basketball', 
  'Cricket',
  'Tennis',
  'Swimming',
  'Athletics',
  'Volleyball',
  'Rugby',
  'Hockey',
  'Other'
];

const CERTIFICATIONS = [
  'UEFA A License',
  'UEFA B License', 
  'CAF A License',
  'CAF B License',
  'Youth Coaching Certificate',
  'Fitness Training Certificate',
  'Sports Psychology Certificate',
  'First Aid Certificate',
  'Other'
];

const NATIONALITIES = [
  'Nigerian',
  'Kenyan', 
  'Ghanaian',
  'South African',
  'Tanzanian',
  'Ugandan',
  'Zambian',
  'Other'
];

export default function CreateCoachPage() {
  return (
    <ProtectedRoute>
      <CreateCoachContent />
    </ProtectedRoute>
  );
}

function CreateCoachContent() {
  const router = useRouter();
  const { user } = useEnhancedAuthContext();
  
  const [formData, setFormData] = useState<CoachFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    specialization: '',
    experience: 0,
    certification: '',
    level: 'assistant',
    nationality: '',
    address: '',
    bio: '',
    status: 'active',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: name === 'experience' ? parseInt(value) || 0 : value,
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

  const validateForm = (): boolean => {
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
    }

    if (!formData.specialization) {
      newErrors.specialization = 'Specialization is required';
    }

    if (!formData.certification) {
      newErrors.certification = 'Certification is required';
    }

    if (formData.experience < 0) {
      newErrors.experience = 'Experience cannot be negative';
    }

    if (!formData.nationality) {
      newErrors.nationality = 'Nationality is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user) {
      toast.error('You must be logged in to create a coach');
      return;
    }

    setIsSubmitting(true);

    try {
      const coachData = {
        ...formData,
        age: new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock API call - in real implementation, this would call the backend
      console.log('Creating coach:', coachData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Coach created successfully!');
      router.push('/coaches');
    } catch (error) {
      console.error('Error creating coach:', error);
      toast.error('Failed to create coach. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/coaches');
  };

  return (
    <div className="d-flex">
      <Sidebar activeTab="coaches" />
      <div className="flex-grow-1 bg-light">
        <div className="container-fluid p-4">
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="d-flex align-items-center">
              <button
                onClick={() => router.back()}
                className="btn btn-link text-decoration-none p-0 me-3"
                style={{ color: '#6c757d' }}
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <nav aria-label="breadcrumb" className="mb-1">
                  <ol className="breadcrumb mb-0" style={{ fontSize: '14px' }}>
                    <li className="breadcrumb-item">
                      <a href="/dashboard" className="text-decoration-none">Dashboard</a>
                    </li>
                    <li className="breadcrumb-item">
                      <a href="/coaches" className="text-decoration-none">Coaches</a>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">Create</li>
                  </ol>
                </nav>
                <h1 className="h3 mb-0 d-flex align-items-center">
                  <GraduationCap className="me-2 text-primary" size={24} />
                  Create New Coach
                </h1>
                <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                  Add a new coach to the system
                </p>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button
                onClick={handleCancel}
                className="btn btn-outline-secondary btn-sm"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Form Container */}
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    {/* Basic Information */}
                    <div className="mb-4">
                      <h5 className="fw-medium text-dark d-flex align-items-center mb-3">
                        <GraduationCap size={20} className="me-2" />
                        Basic Information
                      </h5>

                      <div className="row g-3">
                        {/* First Name */}
                        <div className="col-md-6">
                          <label htmlFor="firstName" className="form-label">
                            First Name <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                            value={formData.firstName}
                            onChange={handleInputChange}
                            placeholder="Enter first name"
                          />
                          {errors.firstName && (
                            <div className="invalid-feedback">{errors.firstName}</div>
                          )}
                        </div>

                        {/* Last Name */}
                        <div className="col-md-6">
                          <label htmlFor="lastName" className="form-label">
                            Last Name <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                            value={formData.lastName}
                            onChange={handleInputChange}
                            placeholder="Enter last name"
                          />
                          {errors.lastName && (
                            <div className="invalid-feedback">{errors.lastName}</div>
                          )}
                        </div>

                        {/* Email */}
                        <div className="col-md-6">
                          <label htmlFor="email" className="form-label">
                            Email <span className="text-danger">*</span>
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="coach@email.com"
                          />
                          {errors.email && (
                            <div className="invalid-feedback">{errors.email}</div>
                          )}
                        </div>

                        {/* Phone */}
                        <div className="col-md-6">
                          <label htmlFor="phone" className="form-label">
                            Phone <span className="text-danger">*</span>
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+234 801 234 5678"
                          />
                          {errors.phone && (
                            <div className="invalid-feedback">{errors.phone}</div>
                          )}
                        </div>

                        {/* Date of Birth */}
                        <div className="col-md-6">
                          <label htmlFor="dateOfBirth" className="form-label">
                            Date of Birth <span className="text-danger">*</span>
                          </label>
                          <input
                            type="date"
                            id="dateOfBirth"
                            name="dateOfBirth"
                            className={`form-control ${errors.dateOfBirth ? 'is-invalid' : ''}`}
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                          />
                          {errors.dateOfBirth && (
                            <div className="invalid-feedback">{errors.dateOfBirth}</div>
                          )}
                        </div>

                        {/* Nationality */}
                        <div className="col-md-6">
                          <label htmlFor="nationality" className="form-label">
                            Nationality <span className="text-danger">*</span>
                          </label>
                          <select
                            id="nationality"
                            name="nationality"
                            className={`form-select ${errors.nationality ? 'is-invalid' : ''}`}
                            value={formData.nationality}
                            onChange={handleInputChange}
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

                        {/* Address */}
                        <div className="col-12">
                          <label htmlFor="address" className="form-label">
                            Address <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            id="address"
                            name="address"
                            className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Enter complete address"
                          />
                          {errors.address && (
                            <div className="invalid-feedback">{errors.address}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Professional Information */}
                    <div className="mb-4">
                      <h5 className="fw-medium text-dark mb-3">Professional Information</h5>

                      <div className="row g-3">
                        {/* Specialization */}
                        <div className="col-md-6">
                          <label htmlFor="specialization" className="form-label">
                            Specialization <span className="text-danger">*</span>
                          </label>
                          <select
                            id="specialization"
                            name="specialization"
                            className={`form-select ${errors.specialization ? 'is-invalid' : ''}`}
                            value={formData.specialization}
                            onChange={handleInputChange}
                          >
                            <option value="">Select specialization</option>
                            {SPECIALIZATIONS.map(spec => (
                              <option key={spec} value={spec}>
                                {spec}
                              </option>
                            ))}
                          </select>
                          {errors.specialization && (
                            <div className="invalid-feedback">{errors.specialization}</div>
                          )}
                        </div>

                        {/* Level */}
                        <div className="col-md-6">
                          <label htmlFor="level" className="form-label">
                            Level <span className="text-danger">*</span>
                          </label>
                          <select
                            id="level"
                            name="level"
                            className="form-select"
                            value={formData.level}
                            onChange={handleInputChange}
                          >
                            <option value="assistant">Assistant Coach</option>
                            <option value="junior">Junior Coach</option>
                            <option value="senior">Senior Coach</option>
                            <option value="head">Head Coach</option>
                          </select>
                        </div>

                        {/* Experience */}
                        <div className="col-md-6">
                          <label htmlFor="experience" className="form-label">
                            Years of Experience
                          </label>
                          <input
                            type="number"
                            id="experience"
                            name="experience"
                            className={`form-control ${errors.experience ? 'is-invalid' : ''}`}
                            value={formData.experience}
                            onChange={handleInputChange}
                            min="0"
                            max="50"
                            placeholder="0"
                          />
                          {errors.experience && (
                            <div className="invalid-feedback">{errors.experience}</div>
                          )}
                        </div>

                        {/* Certification */}
                        <div className="col-md-6">
                          <label htmlFor="certification" className="form-label">
                            Primary Certification <span className="text-danger">*</span>
                          </label>
                          <select
                            id="certification"
                            name="certification"
                            className={`form-select ${errors.certification ? 'is-invalid' : ''}`}
                            value={formData.certification}
                            onChange={handleInputChange}
                          >
                            <option value="">Select certification</option>
                            {CERTIFICATIONS.map(cert => (
                              <option key={cert} value={cert}>
                                {cert}
                              </option>
                            ))}
                          </select>
                          {errors.certification && (
                            <div className="invalid-feedback">{errors.certification}</div>
                          )}
                        </div>

                        {/* Status */}
                        <div className="col-md-6">
                          <label htmlFor="status" className="form-label">
                            Status
                          </label>
                          <select
                            id="status"
                            name="status"
                            className="form-select"
                            value={formData.status}
                            onChange={handleInputChange}
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="on_leave">On Leave</option>
                            <option value="suspended">Suspended</option>
                          </select>
                        </div>

                        {/* Bio */}
                        <div className="col-12">
                          <label htmlFor="bio" className="form-label">
                            Biography
                          </label>
                          <textarea
                            id="bio"
                            name="bio"
                            rows={3}
                            className="form-control"
                            value={formData.bio}
                            onChange={handleInputChange}
                            placeholder="Enter coach biography and background"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="d-flex justify-content-end gap-2 pt-4 border-top">
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
                        className="btn btn-primary"
                      >
                        {isSubmitting ? (
                          <div className="d-flex align-items-center">
                            <div className="spinner-border spinner-border-sm me-2" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            Creating...
                          </div>
                        ) : (
                          <>
                            <Save size={16} className="me-2" />
                            Create Coach
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
      </div>
    </div>
  );
}
