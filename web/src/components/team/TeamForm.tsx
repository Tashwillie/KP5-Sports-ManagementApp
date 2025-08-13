'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Upload, X, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface TeamFormData {
  name: string;
  description: string;
  ageGroup: string;
  gender: 'MALE' | 'FEMALE' | 'MIXED';
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE';
  sport: string;
  maxPlayers: number;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
}

interface TeamFormProps {
  teamId?: string;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const TeamForm: React.FC<TeamFormProps> = ({
  teamId,
  mode,
  onSuccess,
  onCancel,
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    description: '',
    ageGroup: 'U12',
    gender: 'MALE',
    level: 'BEGINNER',
    sport: 'Football',
    maxPlayers: 20,
    website: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    phone: '',
    email: '',
  });

  const ageGroups = ['U6', 'U8', 'U10', 'U12', 'U14', 'U16', 'U18', 'U21', 'Adult'];
  const sports = ['Football', 'Basketball', 'Baseball', 'Soccer', 'Tennis', 'Volleyball', 'Hockey', 'Cricket', 'Rugby'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxPlayers' ? Number(value) : value,
    }));
  };

  // Basic form structure
  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1">
            {mode === 'create' ? 'Create New Team' : 'Edit Team'}
          </h2>
          <p className="text-muted mb-0">
            {mode === 'create' ? 'Add a new team to your organization' : 'Update team information'}
          </p>
        </div>
        <div className="d-flex gap-2">
          <button onClick={() => router.back()} className="btn btn-outline-secondary">
            <ArrowLeft size={20} className="me-2" />
            Back
          </button>
          <button className="btn btn-primary">
            <Save size={20} className="me-2" />
            {mode === 'create' ? 'Create Team' : 'Update Team'}
          </button>
        </div>
      </div>
      
      <form>
        <div className="row">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Basic Information</h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Team Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="Enter team name"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Sport *</label>
                    <select
                      name="sport"
                      value={formData.sport}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      {sports.map(sport => (
                        <option key={sport} value={sport}>{sport}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Age Group *</label>
                    <select
                      name="ageGroup"
                      value={formData.ageGroup}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      {ageGroups.map(group => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Gender *</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="MIXED">Mixed</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Level *</label>
                    <select
                      name="level"
                      value={formData.level}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                      <option value="ELITE">Elite</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Max Players *</label>
                    <input
                      type="number"
                      name="maxPlayers"
                      value={formData.maxPlayers}
                      onChange={handleInputChange}
                      className="form-control"
                      min="1"
                      max="50"
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="form-control"
                      rows={3}
                      placeholder="Describe the team, goals, and expectations..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header">
                <h5 className="mb-0">Team Logo</h5>
              </div>
              <div className="card-body text-center">
                <div className="border-2 border-dashed border-muted rounded p-4">
                  <Upload size={48} className="text-muted mb-2" />
                  <p className="text-muted mb-2">No logo uploaded</p>
                  <small className="text-muted">Upload a team logo (JPG, PNG, max 5MB)</small>
                </div>
                <div className="d-grid mt-3">
                  <label className="btn btn-outline-primary">
                    <Upload size={16} className="me-2" />
                    Upload Logo
                    <input
                      type="file"
                      accept="image/*"
                      className="d-none"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
