'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Users, Building } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import enhancedApiClient from '@/lib/enhancedApiClient';
import { toast } from 'sonner';
import Sidebar from '@/components/layout/Sidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function CreateTeam() {
  return (
    <ProtectedRoute>
      <CreateTeamContent />
    </ProtectedRoute>
  );
}

function CreateTeamContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [clubs, setClubs] = useState<any[]>([]);
  const [clubsError, setClubsError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clubId: '',
    category: 'senior'
  });

  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async () => {
    try {
      setLoadingClubs(true);
      setClubsError(null);
      
      const response = await enhancedApiClient.get('/clubs');
      console.log('Clubs response:', response);
      
      // Ensure we always set an array
      if (response.success && response.data) {
        const clubsData = Array.isArray(response.data) ? response.data : response.data.clubs || [];
        console.log('Setting clubs data:', clubsData);
        setClubs(clubsData);
      } else {
        console.warn('No clubs data received, using mock data');
        // Provide some mock clubs data as fallback
        const mockClubs = [
          { id: 'mock-1', name: 'KP5 Soccer Academy' },
          { id: 'mock-2', name: 'Youth Football Club' },
          { id: 'mock-3', name: 'Elite Sports Club' }
        ];
        setClubs(mockClubs);
        setClubsError('Using default clubs. Connect to backend for full club list.');
      }
    } catch (error: any) {
      console.error('Error loading clubs:', error);
      // Provide mock clubs even on error to keep the form functional
      const mockClubs = [
        { id: 'mock-1', name: 'KP5 Soccer Academy' },
        { id: 'mock-2', name: 'Youth Football Club' },
        { id: 'mock-3', name: 'Elite Sports Club' }
      ];
      setClubs(mockClubs);
      setClubsError(error.message || 'Failed to load clubs. Using default options.');
    } finally {
      setLoadingClubs(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Team name is required');
      return;
    }

    if (!formData.clubId) {
      toast.error('Please select a club');
      return;
    }

    setLoading(true);

    try {
      const response = await enhancedApiClient.post('/teams', formData);
      
      if (response.success) {
        toast.success('Team created successfully!');
        router.push('/dashboard');
      } else {
        throw new Error(response.message || 'Failed to create team');
      }
    } catch (error: any) {
      console.error('Error creating team:', error);
      toast.error(error.message || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex">
      <Sidebar activeTab="teams" />
      <div className="flex-grow-1 bg-light">
        <div className="bg-white border-bottom shadow-sm">
          <div className="container-fluid py-3">
            <div className="d-flex align-items-center">
              <Link href="/teams" className="btn btn-outline-secondary me-3">
                <ArrowLeft size={16} className="me-1" />
                Back to Teams
              </Link>
              <div>
                <h1 className="h4 mb-0">Create New Team</h1>
                <small className="text-muted">Register a new team in the system</small>
              </div>
            </div>
          </div>
        </div>

        <div className="container-fluid py-4">
          <div className="row justify-content-center">
            <div className="col-lg-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      <Users size={16} className="me-1" />
                      Team Name *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Arsenal FC"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="clubId" className="form-label">
                      <Building size={16} className="me-1" />
                      Club *
                    </label>
                    <select
                      className="form-select"
                      id="clubId"
                      name="clubId"
                      value={formData.clubId}
                      onChange={handleInputChange}
                      required
                      disabled={loadingClubs}
                    >
                      <option value="">
                        {loadingClubs ? 'Loading clubs...' : 'Select Club'}
                      </option>
                      {Array.isArray(clubs) && clubs.length > 0 ? (
                        clubs.map((club: any) => (
                          <option key={club.id} value={club.id}>{club.name}</option>
                        ))
                      ) : !loadingClubs ? (
                        <option value="" disabled>
                          {clubsError ? 'Error loading clubs' : 'No clubs available'}
                        </option>
                      ) : null}
                    </select>
                    {clubsError && (
                      <div className="form-text text-danger">
                        {clubsError}
                        <button 
                          type="button" 
                          className="btn btn-link btn-sm p-0 ms-2"
                          onClick={loadClubs}
                        >
                          Try again
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="category" className="form-label">Category</label>
                    <select
                      className="form-select"
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      <option value="senior">Senior</option>
                      <option value="youth">Youth</option>
                      <option value="women">Women</option>
                      <option value="academy">Academy</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Brief description of the team..."
                    />
                  </div>

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
                          Creating Team...
                        </>
                      ) : (
                        <>
                          <Save size={16} className="me-1" />
                          Create Team
                        </>
                      )}
                    </button>
                    <Link href="/teams" className="btn btn-outline-secondary">
                      Cancel
                    </Link>
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