'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Users, MapPin, Clock } from 'lucide-react';
import { toast } from 'sonner';
import quickActionsService, { QuickMatchData, QuickTeamData, QuickTournamentData } from '@/lib/services/quickActionsService';

interface QuickMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface QuickTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface QuickTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const QuickMatchModal: React.FC<QuickMatchModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState<any[]>([]);
  const [formData, setFormData] = useState<QuickMatchData>({
    title: '',
    homeTeamId: '',
    awayTeamId: '',
    startTime: '',
    location: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadTeams();
      // Set default start time to tomorrow at 3 PM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(15, 0, 0, 0);
      setFormData(prev => ({
        ...prev,
        startTime: tomorrow.toISOString().slice(0, 16)
      }));
    }
  }, [isOpen]);

  const loadTeams = async () => {
    try {
      const teamsData = await quickActionsService.getAvailableTeams();
      setTeams(teamsData);
    } catch (error) {
      console.error('Failed to load teams:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.homeTeamId || !formData.awayTeamId || !formData.startTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.homeTeamId === formData.awayTeamId) {
      toast.error('Home and away teams must be different');
      return;
    }

    setLoading(true);
    try {
      await quickActionsService.createQuickMatch(formData);
      toast.success('Match created successfully!');
      onSuccess();
      onClose();
      setFormData({
        title: '',
        homeTeamId: '',
        awayTeamId: '',
        startTime: '',
        location: ''
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create match');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Quick Create Match</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Match Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Premier League Match"
                    required
                  />
                </div>
                
                <div className="col-md-6">
                  <label className="form-label">Home Team</label>
                  <select
                    className="form-select"
                    value={formData.homeTeamId}
                    onChange={(e) => setFormData(prev => ({ ...prev, homeTeamId: e.target.value }))}
                    required
                  >
                    <option value="">Select Home Team</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Away Team</label>
                  <select
                    className="form-select"
                    value={formData.awayTeamId}
                    onChange={(e) => setFormData(prev => ({ ...prev, awayTeamId: e.target.value }))}
                    required
                  >
                    <option value="">Select Away Team</option>
                    {teams.filter(team => team.id !== formData.homeTeamId).map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Start Time</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Stadium or field name"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Match'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export const QuickTeamModal: React.FC<QuickTeamModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [clubs, setClubs] = useState<any[]>([]);
  const [formData, setFormData] = useState<QuickTeamData>({
    name: '',
    clubId: '',
    description: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadClubs();
    }
  }, [isOpen]);

  const loadClubs = async () => {
    try {
      const clubsData = await quickActionsService.getAvailableClubs();
      setClubs(clubsData);
    } catch (error) {
      console.error('Failed to load clubs:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.clubId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await quickActionsService.createQuickTeam(formData);
      toast.success('Team created successfully!');
      onSuccess();
      onClose();
      setFormData({
        name: '',
        clubId: '',
        description: ''
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Quick Create Team</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Team Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Under 18 Warriors"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Club</label>
                <select
                  className="form-select"
                  value={formData.clubId}
                  onChange={(e) => setFormData(prev => ({ ...prev, clubId: e.target.value }))}
                  required
                >
                  <option value="">Select Club</option>
                  {clubs.map(club => (
                    <option key={club.id} value={club.id}>{club.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Description (Optional)</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the team"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? 'Creating...' : 'Create Team'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export const QuickTournamentModal: React.FC<QuickTournamentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<QuickTournamentData>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    maxTeams: 16,
    format: 'ROUND_ROBIN'
  });

  useEffect(() => {
    if (isOpen) {
      // Set default dates
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      const nextMonth = new Date();
      nextMonth.setDate(today.getDate() + 30);

      setFormData(prev => ({
        ...prev,
        startDate: nextWeek.toISOString().slice(0, 10),
        endDate: nextMonth.toISOString().slice(0, 10)
      }));
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error('End date must be after start date');
      return;
    }

    setLoading(true);
    try {
      await quickActionsService.createQuickTournament(formData);
      toast.success('Tournament created successfully!');
      onSuccess();
      onClose();
      setFormData({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        maxTeams: 16,
        format: 'ROUND_ROBIN'
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create tournament');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Quick Create Tournament</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Tournament Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Spring Championship 2024"
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Tournament description and rules"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Max Teams</label>
                  <select
                    className="form-select"
                    value={formData.maxTeams}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxTeams: parseInt(e.target.value) }))}
                  >
                    <option value={8}>8 Teams</option>
                    <option value={16}>16 Teams</option>
                    <option value={32}>32 Teams</option>
                    <option value={64}>64 Teams</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Format</label>
                  <select
                    className="form-select"
                    value={formData.format}
                    onChange={(e) => setFormData(prev => ({ ...prev, format: e.target.value as any }))}
                  >
                    <option value="ROUND_ROBIN">Round Robin</option>
                    <option value="KNOCKOUT">Knockout</option>
                    <option value="LEAGUE">League</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-warning" disabled={loading}>
                {loading ? 'Creating...' : 'Create Tournament'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
