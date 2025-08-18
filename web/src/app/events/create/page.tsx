'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEnhancedAuthContext } from '@/contexts/EnhancedAuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import { ChevronLeft, Calendar, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface EventFormData {
  title: string;
  description: string;
  type: 'practice' | 'game' | 'meeting' | 'tournament' | 'training' | 'other';
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  maxParticipants: number;
  isPublic: boolean;
  requiresRegistration: boolean;
  notes?: string;
}

const EVENT_TYPES = [
  { value: 'practice', label: 'Practice' },
  { value: 'game', label: 'Game' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'tournament', label: 'Tournament' },
  { value: 'training', label: 'Training' },
  { value: 'other', label: 'Other' }
] as const;

export default function CreateEventPage() {
  return (
    <ProtectedRoute>
      <CreateEventContent />
    </ProtectedRoute>
  );
}

function CreateEventContent() {
  const router = useRouter();
  const { user } = useEnhancedAuthContext();
  
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    type: 'practice',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    venue: '',
    maxParticipants: 25,
    isPublic: true,
    requiresRegistration: true,
    notes: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    }

    if (!formData.type) {
      newErrors.type = 'Event type is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (!formData.venue.trim()) {
      newErrors.venue = 'Venue is required';
    }

    if (formData.maxParticipants < 1) {
      newErrors.maxParticipants = 'Max participants must be at least 1';
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
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
      toast.error('You must be logged in to create an event');
      return;
    }

    setIsSubmitting(true);

    try {
      const eventData = {
        ...formData,
        status: 'upcoming',
        currentParticipants: 0,
        organizer: user.displayName || 'Unknown',
        organizerId: user.id || 'unknown',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock API call - in real implementation, this would call the backend
      console.log('Creating event:', eventData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Event created successfully!');
      router.push('/events');
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/events');
  };

  return (
    <div className="d-flex">
      <Sidebar activeTab="events" />
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
                      <a href="/events" className="text-decoration-none">Events</a>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">Create</li>
                  </ol>
                </nav>
                <h1 className="h3 mb-0 d-flex align-items-center">
                  <Calendar className="me-2 text-primary" size={24} />
                  Create New Event
                </h1>
                <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                  Schedule a new practice, game, or other team event
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
                        <Calendar size={20} className="me-2" />
                        Basic Information
                      </h5>

                      <div className="row g-3">
                        {/* Event Title */}
                        <div className="col-12">
                          <label htmlFor="title" className="form-label">
                            Event Title <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            id="title"
                            name="title"
                            className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Enter event title"
                          />
                          {errors.title && (
                            <div className="invalid-feedback">{errors.title}</div>
                          )}
                        </div>

                        {/* Description */}
                        <div className="col-12">
                          <label htmlFor="description" className="form-label">
                            Description
                          </label>
                          <textarea
                            id="description"
                            name="description"
                            rows={3}
                            className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Enter event description"
                          />
                          {errors.description && (
                            <div className="invalid-feedback">{errors.description}</div>
                          )}
                        </div>

                        {/* Event Type */}
                        <div className="col-md-6">
                          <label htmlFor="type" className="form-label">
                            Event Type <span className="text-danger">*</span>
                          </label>
                          <select
                            id="type"
                            name="type"
                            className={`form-select ${errors.type ? 'is-invalid' : ''}`}
                            value={formData.type}
                            onChange={handleInputChange}
                          >
                            {EVENT_TYPES.map(type => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                          {errors.type && (
                            <div className="invalid-feedback">{errors.type}</div>
                          )}
                        </div>

                        {/* Venue */}
                        <div className="col-md-6">
                          <label htmlFor="venue" className="form-label">
                            Venue <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            id="venue"
                            name="venue"
                            className={`form-control ${errors.venue ? 'is-invalid' : ''}`}
                            value={formData.venue}
                            onChange={handleInputChange}
                            placeholder="Enter venue location"
                          />
                          {errors.venue && (
                            <div className="invalid-feedback">{errors.venue}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Date and Time */}
                    <div className="mb-4">
                      <h5 className="fw-medium text-dark mb-3">Date and Time</h5>

                      <div className="row g-3">
                        {/* Start Date */}
                        <div className="col-md-6">
                          <label htmlFor="startDate" className="form-label">
                            Start Date <span className="text-danger">*</span>
                          </label>
                          <input
                            type="date"
                            id="startDate"
                            name="startDate"
                            className={`form-control ${errors.startDate ? 'is-invalid' : ''}`}
                            value={formData.startDate}
                            onChange={handleInputChange}
                          />
                          {errors.startDate && (
                            <div className="invalid-feedback">{errors.startDate}</div>
                          )}
                        </div>

                        {/* End Date */}
                        <div className="col-md-6">
                          <label htmlFor="endDate" className="form-label">
                            End Date <span className="text-danger">*</span>
                          </label>
                          <input
                            type="date"
                            id="endDate"
                            name="endDate"
                            className={`form-control ${errors.endDate ? 'is-invalid' : ''}`}
                            value={formData.endDate}
                            onChange={handleInputChange}
                          />
                          {errors.endDate && (
                            <div className="invalid-feedback">{errors.endDate}</div>
                          )}
                        </div>

                        {/* Start Time */}
                        <div className="col-md-6">
                          <label htmlFor="startTime" className="form-label">
                            Start Time <span className="text-danger">*</span>
                          </label>
                          <input
                            type="time"
                            id="startTime"
                            name="startTime"
                            className={`form-control ${errors.startTime ? 'is-invalid' : ''}`}
                            value={formData.startTime}
                            onChange={handleInputChange}
                          />
                          {errors.startTime && (
                            <div className="invalid-feedback">{errors.startTime}</div>
                          )}
                        </div>

                        {/* End Time */}
                        <div className="col-md-6">
                          <label htmlFor="endTime" className="form-label">
                            End Time <span className="text-danger">*</span>
                          </label>
                          <input
                            type="time"
                            id="endTime"
                            name="endTime"
                            className={`form-control ${errors.endTime ? 'is-invalid' : ''}`}
                            value={formData.endTime}
                            onChange={handleInputChange}
                          />
                          {errors.endTime && (
                            <div className="invalid-feedback">{errors.endTime}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Settings */}
                    <div className="mb-4">
                      <h5 className="fw-medium text-dark mb-3">Settings</h5>

                      <div className="row g-3">
                        {/* Max Participants */}
                        <div className="col-md-6">
                          <label htmlFor="maxParticipants" className="form-label">
                            Max Participants
                          </label>
                          <input
                            type="number"
                            id="maxParticipants"
                            name="maxParticipants"
                            className={`form-control ${errors.maxParticipants ? 'is-invalid' : ''}`}
                            value={formData.maxParticipants}
                            onChange={handleInputChange}
                            min="1"
                          />
                          {errors.maxParticipants && (
                            <div className="invalid-feedback">{errors.maxParticipants}</div>
                          )}
                        </div>

                        {/* Options */}
                        <div className="col-md-6">
                          <label className="form-label">Options</label>
                          <div className="mt-2">
                            <div className="form-check mb-2">
                              <input
                                type="checkbox"
                                id="isPublic"
                                name="isPublic"
                                className="form-check-input"
                                checked={formData.isPublic}
                                onChange={handleInputChange}
                              />
                              <label className="form-check-label" htmlFor="isPublic">
                                Public Event
                              </label>
                            </div>
                            <div className="form-check">
                              <input
                                type="checkbox"
                                id="requiresRegistration"
                                name="requiresRegistration"
                                className="form-check-input"
                                checked={formData.requiresRegistration}
                                onChange={handleInputChange}
                              />
                              <label className="form-check-label" htmlFor="requiresRegistration">
                                Requires Registration
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Notes */}
                        <div className="col-12">
                          <label htmlFor="notes" className="form-label">
                            Additional Notes
                          </label>
                          <textarea
                            id="notes"
                            name="notes"
                            rows={3}
                            className="form-control"
                            value={formData.notes}
                            onChange={handleInputChange}
                            placeholder="Enter any additional notes or instructions"
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
                            Create Event
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
