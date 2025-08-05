'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Upload, 
  X, 
  Loader2, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useCreateTeam } from '../../../../shared/src/hooks/useApi';
import { Team } from '../../../../shared/src/types';
import { toast } from 'sonner';

interface CreateTeamFormProps {
  clubId?: string;
  onSuccess?: (teamId: string) => void;
  onCancel?: () => void;
}

export const CreateTeamForm: React.FC<CreateTeamFormProps> = ({ 
  clubId,
  onSuccess, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ageGroup: '',
    gender: 'mixed',
    level: 'recreational',
    maxPlayers: 20,
    coachName: '',
    coachEmail: '',
    coachPhone: '',
    homeVenue: '',
    trainingSchedule: ''
  });
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createTeamMutation = useCreateTeam();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user makes selection
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleNumberChange = (name: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData(prev => ({
      ...prev,
      [name]: numValue
    }));
    
    // Clear error when user makes selection
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Team name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.ageGroup.trim()) {
      newErrors.ageGroup = 'Age group is required';
    }
    
    if (!formData.coachName.trim()) {
      newErrors.coachName = 'Coach name is required';
    }
    
    if (!formData.coachEmail.trim()) {
      newErrors.coachEmail = 'Coach email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.coachEmail)) {
      newErrors.coachEmail = 'Please enter a valid email address';
    }
    
    if (formData.maxPlayers < 5) {
      newErrors.maxPlayers = 'Minimum 5 players required';
    } else if (formData.maxPlayers > 30) {
      newErrors.maxPlayers = 'Maximum 30 players allowed';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setUploading(true);
    
    try {
      // Prepare team data
      const teamData: Partial<Team> = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        ageGroup: formData.ageGroup.trim(),
        gender: formData.gender as 'male' | 'female' | 'mixed',
        level: formData.level as 'recreational' | 'competitive' | 'elite',
        maxPlayers: formData.maxPlayers,
        coachName: formData.coachName.trim(),
        coachEmail: formData.coachEmail.trim(),
        coachPhone: formData.coachPhone.trim(),
        homeVenue: formData.homeVenue.trim(),
        trainingSchedule: formData.trainingSchedule.trim(),
        logoURL: '', // Will be updated after upload
        clubId: clubId || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        playerCount: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        points: 0
      };
      
      // Create team first
      const teamId = await createTeamMutation.mutateAsync(teamData);
      
      // Upload logo if provided
      if (logoFile && teamId) {
        try {
          const api = (globalThis as any).api;
          const logoURL = await api.teams.uploadTeamLogo(teamId, logoFile);
          
          // Update team with logo URL
          await api.teams.updateTeam(teamId, { logoURL });
          
          toast.success('Team created successfully with logo!');
        } catch (uploadError) {
          console.error('Logo upload failed:', uploadError);
          toast.warning('Team created successfully, but logo upload failed');
        }
      } else {
        toast.success('Team created successfully!');
      }
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        ageGroup: '',
        gender: 'mixed',
        level: 'recreational',
        maxPlayers: 20,
        coachName: '',
        coachEmail: '',
        coachPhone: '',
        homeVenue: '',
        trainingSchedule: ''
      });
      setLogoFile(null);
      setLogoPreview(null);
      setErrors({});
      
      // Call success callback
      if (onSuccess) {
        onSuccess(teamId);
      }
      
    } catch (error: any) {
      console.error('Error creating team:', error);
      toast.error(error.message || 'Failed to create team');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Team</CardTitle>
        <CardDescription>
          Add a new team to your club
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo Upload */}
          <div className="space-y-2">
            <Label htmlFor="logo">Team Logo</Label>
            <div className="flex items-center space-x-4">
              {logoPreview ? (
                <div className="relative">
                  <img 
                    src={logoPreview} 
                    alt="Logo preview" 
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <Upload className="h-8 w-8 text-gray-400" />
                </div>
              )}
              
              <div className="flex-1">
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('logo')?.click()}
                  disabled={uploading}
                >
                  {logoFile ? 'Change Logo' : 'Upload Logo'}
                </Button>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG up to 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Team Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter team name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ageGroup">Age Group *</Label>
              <Select 
                value={formData.ageGroup} 
                onValueChange={(value) => handleSelectChange('ageGroup', value)}
              >
                <SelectTrigger className={errors.ageGroup ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select age group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="U6">Under 6</SelectItem>
                  <SelectItem value="U8">Under 8</SelectItem>
                  <SelectItem value="U10">Under 10</SelectItem>
                  <SelectItem value="U12">Under 12</SelectItem>
                  <SelectItem value="U14">Under 14</SelectItem>
                  <SelectItem value="U16">Under 16</SelectItem>
                  <SelectItem value="U18">Under 18</SelectItem>
                  <SelectItem value="U21">Under 21</SelectItem>
                  <SelectItem value="Senior">Senior</SelectItem>
                  <SelectItem value="Masters">Masters</SelectItem>
                </SelectContent>
              </Select>
              {errors.ageGroup && (
                <p className="text-sm text-red-600">{errors.ageGroup}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the team and its goals"
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select 
                value={formData.gender} 
                onValueChange={(value) => handleSelectChange('gender', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="level">Competition Level</Label>
              <Select 
                value={formData.level} 
                onValueChange={(value) => handleSelectChange('level', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recreational">Recreational</SelectItem>
                  <SelectItem value="competitive">Competitive</SelectItem>
                  <SelectItem value="elite">Elite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxPlayers">Max Players *</Label>
              <Input
                id="maxPlayers"
                name="maxPlayers"
                type="number"
                value={formData.maxPlayers}
                onChange={(e) => handleNumberChange('maxPlayers', e.target.value)}
                min="5"
                max="30"
                className={errors.maxPlayers ? 'border-red-500' : ''}
              />
              {errors.maxPlayers && (
                <p className="text-sm text-red-600">{errors.maxPlayers}</p>
              )}
            </div>
          </div>

          {/* Coach Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Coach Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coachName">Coach Name *</Label>
                <Input
                  id="coachName"
                  name="coachName"
                  value={formData.coachName}
                  onChange={handleInputChange}
                  placeholder="Enter coach name"
                  className={errors.coachName ? 'border-red-500' : ''}
                />
                {errors.coachName && (
                  <p className="text-sm text-red-600">{errors.coachName}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="coachEmail">Coach Email *</Label>
                <Input
                  id="coachEmail"
                  name="coachEmail"
                  type="email"
                  value={formData.coachEmail}
                  onChange={handleInputChange}
                  placeholder="coach@example.com"
                  className={errors.coachEmail ? 'border-red-500' : ''}
                />
                {errors.coachEmail && (
                  <p className="text-sm text-red-600">{errors.coachEmail}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="coachPhone">Coach Phone</Label>
              <Input
                id="coachPhone"
                name="coachPhone"
                type="tel"
                value={formData.coachPhone}
                onChange={handleInputChange}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          {/* Venue and Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="homeVenue">Home Venue</Label>
              <Input
                id="homeVenue"
                name="homeVenue"
                value={formData.homeVenue}
                onChange={handleInputChange}
                placeholder="Home stadium or field"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="trainingSchedule">Training Schedule</Label>
              <Input
                id="trainingSchedule"
                name="trainingSchedule"
                value={formData.trainingSchedule}
                onChange={handleInputChange}
                placeholder="e.g., Mon/Wed/Fri 6-8 PM"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={uploading}
              >
                Cancel
              </Button>
            )}
            
            <Button
              type="submit"
              disabled={uploading || createTeamMutation.isPending}
              className="min-w-[120px]"
            >
              {uploading || createTeamMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Create Team
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}; 