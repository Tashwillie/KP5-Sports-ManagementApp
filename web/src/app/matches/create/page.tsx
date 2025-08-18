'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import enhancedApiClient from '@/lib/enhancedApiClient';
import { toast } from 'sonner';
import Sidebar from '@/components/layout/Sidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

interface Team {
  id: string;
  name: string;
}

interface Tournament {
  id: string;
  name: string;
}

export default function CreateMatch() {
  return (
    <ProtectedRoute>
      <CreateMatchContent />
    </ProtectedRoute>
  );
}

function CreateMatchContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    homeTeamId: '',
    awayTeamId: '',
    startTime: '',
    location: '',
    tournamentId: '',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [teamsResponse, tournamentsResponse] = await Promise.all([
        enhancedApiClient.get('/teams'),
        enhancedApiClient.get('/tournaments')
      ]);

      // Ensure arrays are always set
      const teamsData = Array.isArray(teamsResponse.data) ? teamsResponse.data : (teamsResponse.data as any)?.teams || [];
      const tournamentsData = Array.isArray(tournamentsResponse.data) ? tournamentsResponse.data : (tournamentsResponse.data as any)?.tournaments || [];

      setTeams(teamsData);
      setTournaments(tournamentsData);
    } catch (error) {
      console.error('Error loading data:', error);
      // Set empty arrays on error to prevent runtime errors
      setTeams([]);
      setTournaments([]);
      toast.error('Failed to load teams and tournaments');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-generate title when teams are selected
    if ((name === 'homeTeamId' || name === 'awayTeamId') && !formData.title && Array.isArray(teams)) {
      const homeTeam = teams.find(t => t.id === (name === 'homeTeamId' ? value : formData.homeTeamId));
      const awayTeam = teams.find(t => t.id === (name === 'awayTeamId' ? value : formData.awayTeamId));
      
      if (homeTeam && awayTeam) {
        setFormData(prev => ({
          ...prev,
          title: `${homeTeam.name} vs ${awayTeam.name}`
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.homeTeamId || !formData.awayTeamId) {
      toast.error('Please select both teams');
      return;
    }

    if (formData.homeTeamId === formData.awayTeamId) {
      toast.error('Home and away teams must be different');
      return;
    }

    if (!formData.startTime) {
      toast.error('Please select match date and time');
      return;
    }

    setLoading(true);

    try {
      const response = await enhancedApiClient.post('/matches', {
        title: formData.title || `${Array.isArray(teams) ? teams.find(t => t.id === formData.homeTeamId)?.name : 'Team'} vs ${Array.isArray(teams) ? teams.find(t => t.id === formData.awayTeamId)?.name : 'Team'}`,
        homeTeamId: formData.homeTeamId,
        awayTeamId: formData.awayTeamId,
        startTime: formData.startTime,
        location: formData.location || 'TBD',
        tournamentId: formData.tournamentId || undefined,
        description: formData.description
      });

      if (response.success) {
        toast.success('Match created successfully!');
        router.push('/dashboard');
      } else {
        throw new Error(response.message || 'Failed to create match');
      }
    } catch (error: any) {
      console.error('Error creating match:', error);
      toast.error(error.message || 'Failed to create match');
    } finally {
      setLoading(false);
    }
  };

  // Generate time slots for today and next 30 days
  const generateTimeSlots = (): Array<{value: string; label: string}> => {
    const slots: Array<{value: string; label: string}> = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Common match times
      const times = ['09:00', '11:00', '14:00', '16:00', '18:00', '20:00'];
      
      times.forEach(time => {
        const dateTime = new Date(date);
        const [hours, minutes] = time.split(':');
        dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        if (dateTime > new Date()) { // Only future times
          slots.push({
            value: dateTime.toISOString().slice(0, 16),
            label: `${dateTime.toLocaleDateString()} at ${time}`
          });
        }
      });
    }
    
    return slots.slice(0, 50); // Limit to 50 slots
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="d-flex">
      <Sidebar activeTab="matches" />
      <div className="flex-grow-1 bg-light">
        {/* Header */}
        <div className="bg-white border-bottom shadow-sm">
          <div className="container-fluid py-3">
              <div className="d-flex align-items-center">
              <Link href="/dashboard" className="btn btn-outline-secondary me-3">
                <ArrowLeft size={16} className="me-1" />
                Back to Dashboard
              </Link>
              <div>
                <h1 className="h4 mb-0">Create New Match</h1>
                <small className="text-muted">Schedule a new match between teams</small>
              </div>
            </div>
          </div>
        </div>

        <div className="container-fluid py-4">
          <div className="row justify-content-center">
            <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                  {/* Match Title */}
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                      <Users size={16} className="me-1" />
                      Match Title
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Arsenal vs Chelsea (auto-generated when teams selected)"
                    />
                  </div>

                {/* Teams Selection */}
                <div className="row mb-3">
                  <div className="col-md-6">
                      <label htmlFor="homeTeamId" className="form-label">Home Team *</label>
                    <select
                        className="form-select"
                      id="homeTeamId"
                      name="homeTeamId"
                      value={formData.homeTeamId}
                      onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Home Team</option>
                        {Array.isArray(teams) ? teams.map(team => (
                          <option key={team.id} value={team.id}>{team.name}</option>
                        )) : null}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="awayTeamId" className="form-label">Away Team *</label>
                      <select
                        className="form-select"
                        id="awayTeamId"
                        name="awayTeamId"
                        value={formData.awayTeamId}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Away Team</option>
                        {Array.isArray(teams) ? teams.filter(team => team.id !== formData.homeTeamId).map(team => (
                          <option key={team.id} value={team.id}>{team.name}</option>
                        )) : null}
                    </select>
                    </div>
                  </div>

                  {/* Date and Time */}
                  <div className="mb-3">
                    <label htmlFor="startTime" className="form-label">
                      <Calendar size={16} className="me-1" />
                      Match Date & Time *
                    </label>
                    <select
                      className="form-select"
                      id="startTime"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Date & Time</option>
                      {timeSlots.map(slot => (
                        <option key={slot.value} value={slot.value}>{slot.label}</option>
                      ))}
                    </select>
                    <div className="form-text">
                      Or use custom date: 
                    <input
                        type="datetime-local"
                        className="form-control mt-2"
                        name="startTime"
                        value={formData.startTime}
                      onChange={handleInputChange}
                        min={new Date().toISOString().slice(0, 16)}
                    />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="mb-3">
                    <label htmlFor="location" className="form-label">
                      <MapPin size={16} className="me-1" />
                      Venue/Location
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g., Emirates Stadium, London"
                    />
                </div>

                  {/* Tournament */}
                  <div className="mb-3">
                    <label htmlFor="tournamentId" className="form-label">
                      <svg className="me-1" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 2h12v2H6V2zM5 6h14v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6zm3 3v2h8V9H8zm0 4v2h6v-2H8z"/>
                      </svg>
                       Tournament (Optional)
                     </label>
                    <select
                      className="form-select"
                       id="tournamentId"
                       name="tournamentId"
                       value={formData.tournamentId}
                       onChange={handleInputChange}
                    >
                      <option value="">Select Tournament (Optional)</option>
                      {Array.isArray(tournaments) ? tournaments.map(tournament => (
                        <option key={tournament.id} value={tournament.id}>{tournament.name}</option>
                      )) : null}
                  </select>
                </div>

                  {/* Description */}
                  <div className="mb-4">
                    <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                      className="form-control"
                      id="description"
                      name="description"
                    rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Additional match details, rules, or notes..."
                    />
                </div>

                  {/* Submit Buttons */}
                  <div className="d-flex gap-3">
                  <button
                    type="submit"
                      className="btn btn-primary flex-grow-1"
                      disabled={loading}
                  >
                      {loading ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                          Creating Match...
                      </>
                    ) : (
                      <>
                          <Save size={16} className="me-1" />
                        Create Match
                      </>
                    )}
                  </button>
                    <Link href="/dashboard" className="btn btn-outline-secondary">
                      Cancel
                    </Link>
                </div>
              </form>
              </div>
            </div>

            {/* Preview */}
            {formData.homeTeamId && formData.awayTeamId && (
              <div className="card border-0 shadow-sm mt-4">
                <div className="card-header bg-transparent">
                  <h6 className="mb-0">Match Preview</h6>
                </div>
                <div className="card-body">
                  <div className="row align-items-center text-center">
                    <div className="col-4">
                      <div className="bg-primary rounded-circle mx-auto mb-2" style={{width: '40px', height: '40px'}}></div>
                      <div className="fw-bold">{Array.isArray(teams) ? teams.find(t => t.id === formData.homeTeamId)?.name || 'Home Team' : 'Home Team'}</div>
                      <small className="text-muted">Home</small>
                    </div>
                    <div className="col-4">
                      <div className="text-muted">VS</div>
                      {formData.startTime && (
                        <div className="mt-2">
                          <Clock size={14} className="me-1" />
                          <small>{new Date(formData.startTime).toLocaleDateString()} at {new Date(formData.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                        </div>
                      )}
                      {formData.location && (
                        <div className="mt-1">
                          <MapPin size={14} className="me-1" />
                          <small>{formData.location}</small>
                        </div>
                      )}
                    </div>
                    <div className="col-4">
                      <div className="bg-danger rounded-circle mx-auto mb-2" style={{width: '40px', height: '40px'}}></div>
                      <div className="fw-bold">{Array.isArray(teams) ? teams.find(t => t.id === formData.awayTeamId)?.name || 'Away Team' : 'Away Team'}</div>
                      <small className="text-muted">Away</small>
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 