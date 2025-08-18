'use client';

import React, { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Upload, X, Trophy, Calendar, Users, MapPin, DollarSign, Award } from 'lucide-react';
import { Tournament, CreateTournamentRequest, UpdateTournamentRequest } from '@/lib/services/tournamentsApiService';
import { useCreateTournament, useUpdateTournament } from '@/hooks/useTournaments';

// Validation schema
const tournamentSchema = z.object({
  name: z.string()
    .min(2, 'Tournament name must be at least 2 characters')
    .max(100, 'Tournament name must be less than 100 characters'),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  startDate: z.string()
    .min(1, 'Start date is required'),
  endDate: z.string()
    .min(1, 'End date is required'),
  registrationDeadline: z.string()
    .min(1, 'Registration deadline is required'),
  maxTeams: z.number()
    .min(2, 'Maximum teams must be at least 2')
    .max(1000, 'Maximum teams cannot exceed 1,000'),
  minTeams: z.number()
    .min(2, 'Minimum teams must be at least 2')
    .max(100, 'Minimum teams cannot exceed 100'),
  entryFee: z.number()
    .min(0, 'Entry fee cannot be negative')
    .max(10000, 'Entry fee cannot exceed $10,000')
    .optional(),
  prizePool: z.number()
    .min(0, 'Prize pool cannot be negative')
    .max(1000000, 'Prize pool cannot exceed $1,000,000')
    .optional(),
  format: z.enum(['KNOCKOUT', 'ROUND_ROBIN', 'GROUP_STAGE', 'LEAGUE'])
    .default('KNOCKOUT'),
  venue: z.string()
    .max(200, 'Venue must be less than 200 characters')
    .optional(),
  rules: z.string()
    .max(2000, 'Rules must be less than 2000 characters')
    .optional(),

});

type TournamentFormData = z.infer<typeof tournamentSchema>;

interface TournamentFormProps {
  tournament?: Tournament;
  onSuccess?: (tournament: Tournament) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
}

export const TournamentForm: React.FC<TournamentFormProps> = ({
  tournament,
  onSuccess,
  onCancel,
  mode = 'create'
}) => {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(tournament?.logo || null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const createTournament = useCreateTournament();
  const updateTournament = useUpdateTournament();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<TournamentFormData>({
    resolver: zodResolver(tournamentSchema),
    defaultValues: {
      name: tournament?.name || '',
      description: tournament?.description || '',
      startDate: tournament?.startDate ? new Date(tournament.startDate).toISOString().split('T')[0] : '',
      endDate: tournament?.endDate ? new Date(tournament.endDate).toISOString().split('T')[0] : '',
      registrationDeadline: tournament?.registrationDeadline ? new Date(tournament.registrationDeadline).toISOString().split('T')[0] : '',
      maxTeams: tournament?.maxTeams || 16,
      minTeams: tournament?.minTeams || 4,
      entryFee: tournament?.entryFee || undefined,
      prizePool: tournament?.prizePool || undefined,
      format: tournament?.format || 'KNOCKOUT',
      venue: tournament?.venue || '',
      rules: tournament?.rules || '',
    },
  });

  // Handle logo file selection
  const handleLogoChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Logo file size must be less than 5MB');
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
  }, []);

  // Remove logo
  const removeLogo = useCallback(() => {
    setLogoFile(null);
    setLogoPreview(null);
  }, []);

  // Handle form submission
  const onSubmit = async (data: TournamentFormData) => {
    try {
      const formData: CreateTournamentRequest | UpdateTournamentRequest = {
        ...data,
        logo: logoFile || undefined,
      };

      if (mode === 'create') {
        const response = await createTournament.mutateAsync(formData as CreateTournamentRequest);
        if (response.success) {
          toast.success('Tournament created successfully!');
          onSuccess?.(response.data!);
          reset();
          setLogoFile(null);
          setLogoPreview(null);
        }
      } else if (mode === 'edit' && tournament) {
        const response = await updateTournament.mutateAsync({
          id: tournament.id,
          data: formData as UpdateTournamentRequest,
        });
        if (response.success) {
          toast.success('Tournament updated successfully!');
          onSuccess?.(response.data!);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save tournament');
    }
  };

  const watchedValues = watch();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Logo Upload Section */}
      <div className="mb-4">
        <label className="form-label fw-medium">
          Tournament Logo
        </label>

        <div className="d-flex align-items-center gap-3">
          {/* Logo Preview */}
          <div className="position-relative">
            {logoPreview ? (
              <div className="position-relative">
                <img
                  src={logoPreview}
                  alt="Tournament logo preview"
                  className="rounded"
                  style={{ width: '96px', height: '96px', objectFit: 'cover', border: '2px solid #dee2e6' }}
                />
                <button
                  type="button"
                  onClick={removeLogo}
                  className="btn btn-danger btn-sm position-absolute"
                  style={{ top: '-8px', right: '-8px', width: '24px', height: '24px', padding: '0', borderRadius: '50%' }}
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div 
                className="rounded d-flex align-items-center justify-content-center bg-light"
                style={{ 
                  width: '96px', 
                  height: '96px', 
                  border: '2px dashed #dee2e6'
                }}
              >
                <Upload size={24} className="text-muted" />
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div className="flex-grow-1">
            <input
              type="file"
              id="logo"
              accept="image/*"
              onChange={handleLogoChange}
              className="d-none"
            />
            <label
              htmlFor="logo"
              className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center"
              style={{ cursor: 'pointer' }}
            >
              <Upload size={16} className="me-2" />
              {logoPreview ? 'Change Logo' : 'Upload Logo'}
            </label>
            <div className="form-text">
              PNG, JPG, GIF up to 5MB
            </div>
          </div>
        </div>

        {/* Upload Progress */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="progress mt-2" style={{ height: '8px' }}>
            <div
              className="progress-bar bg-primary"
              role="progressbar"
              style={{ width: `${uploadProgress}%` }}
              aria-valuenow={uploadProgress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        )}
      </div>

      {/* Basic Information */}
      <div className="mb-4">
        <h3 className="h5 fw-medium text-dark d-flex align-items-center mb-3">
          <Trophy size={20} className="me-2" />
          Basic Information
        </h3>

        <div className="row g-3">
          {/* Tournament Name */}
          <div className="col-12">
            <label htmlFor="name" className="form-label">
              Tournament Name <span className="text-danger">*</span>
            </label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  id="name"
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  placeholder="Enter tournament name"
                />
              )}
            />
            {errors.name && (
              <div className="invalid-feedback">{errors.name.message}</div>
            )}
          </div>

          {/* Description */}
          <div className="col-12">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  id="description"
                  rows={3}
                  className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                  placeholder="Enter tournament description"
                />
              )}
            />
            {errors.description && (
              <div className="invalid-feedback">{errors.description.message}</div>
            )}
            <div className="form-text">
              {watchedValues.description?.length || 0}/1000 characters
            </div>
          </div>

          {/* Tournament Format */}
          <div className="col-md-6">
            <label htmlFor="format" className="form-label">
              Tournament Format <span className="text-danger">*</span>
            </label>
            <Controller
              name="format"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  id="format"
                  className={`form-select ${errors.format ? 'is-invalid' : ''}`}
                >
                  <option value="KNOCKOUT">Knockout</option>
                  <option value="ROUND_ROBIN">Round Robin</option>
                  <option value="GROUP_STAGE">Group Stage</option>
                  <option value="LEAGUE">League</option>
                </select>
              )}
            />
            {errors.format && (
              <div className="invalid-feedback">{errors.format.message}</div>
            )}
          </div>
        </div>
      </div>

      {/* Dates and Registration */}
      <div className="mb-4">
        <h3 className="h5 fw-medium text-dark d-flex align-items-center mb-3">
          <Calendar size={20} className="me-2" />
          Dates and Registration
        </h3>

        <div className="row g-3">
          {/* Start Date */}
          <div className="col-md-6">
            <label htmlFor="startDate" className="form-label">
              Start Date <span className="text-danger">*</span>
            </label>
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="date"
                  id="startDate"
                  className={`form-control ${errors.startDate ? 'is-invalid' : ''
                  }`}
                />
              )}
            />
            {errors.startDate && (
              <div className="invalid-feedback">{errors.startDate.message}</div>
            )}
          </div>

          {/* End Date */}
          <div className="col-md-6">
            <label htmlFor="endDate" className="form-label">
              End Date <span className="text-danger">*</span>
            </label>
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="date"
                  id="endDate"
                  className={`form-control ${errors.endDate ? 'is-invalid' : ''
                  }`}
                />
              )}
            />
            {errors.endDate && (
              <div className="invalid-feedback">{errors.endDate.message}</div>
            )}
          </div>

          {/* Registration Deadline */}
          <div className="col-md-6">
            <label htmlFor="registrationDeadline" className="form-label">
              Registration Deadline <span className="text-danger">*</span>
            </label>
            <Controller
              name="registrationDeadline"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="date"
                  id="registrationDeadline"
                  className={`form-control ${errors.registrationDeadline ? 'is-invalid' : ''
                  }`}
                />
              )}
            />
            {errors.registrationDeadline && (
              <div className="invalid-feedback">{errors.registrationDeadline.message}</div>
            )}
          </div>

          {/* Min Teams */}
          <div className="col-md-6">
            <label htmlFor="minTeams" className="form-label">
              Minimum Teams <span className="text-danger">*</span>
            </label>
            <Controller
              name="minTeams"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  id="minTeams"
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  className={`form-control ${errors.minTeams ? 'is-invalid' : ''
                  }`}
                  placeholder="e.g., 4"
                  min="2"
                  max="100"
                />
              )}
            />
            {errors.minTeams && (
              <div className="invalid-feedback">{errors.minTeams.message}</div>
            )}
          </div>

          {/* Max Teams */}
          <div className="col-md-6">
            <label htmlFor="maxTeams" className="form-label">
              Maximum Teams <span className="text-danger">*</span>
            </label>
            <Controller
              name="maxTeams"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  id="maxTeams"
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  className={`form-control ${errors.maxTeams ? 'is-invalid' : ''
                  }`}
                  placeholder="e.g., 16"
                  min="2"
                  max="1000"
                />
              )}
            />
            {errors.maxTeams && (
              <div className="invalid-feedback">{errors.maxTeams.message}</div>
            )}
          </div>
        </div>
      </div>

      {/* Financial Information */}
      <div className="mb-4">
        <h3 className="h5 fw-medium text-dark d-flex align-items-center mb-3">
          <DollarSign size={20} className="me-2" />
          Financial Information
        </h3>

        <div className="row g-3">
          {/* Entry Fee */}
          <div className="col-md-6">
            <label htmlFor="entryFee" className="form-label">
              Entry Fee ($)
            </label>
            <Controller
              name="entryFee"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  id="entryFee"
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className={`form-control ${errors.entryFee ? 'is-invalid' : ''
                  }`}
                  placeholder="e.g., 50.00"
                  min="0"
                  max="10000"
                  step="0.01"
                />
              )}
            />
            {errors.entryFee && (
              <div className="invalid-feedback">{errors.entryFee.message}</div>
            )}
          </div>

          {/* Prize Pool */}
          <div className="col-md-6">
            <label htmlFor="prizePool" className="form-label">
              Prize Pool ($)
            </label>
            <Controller
              name="prizePool"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  id="prizePool"
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className={`form-control ${errors.prizePool ? 'is-invalid' : ''
                  }`}
                  placeholder="e.g., 1000.00"
                  min="0"
                  max="1000000"
                  step="0.01"
                />
              )}
            />
            {errors.prizePool && (
              <div className="invalid-feedback">{errors.prizePool.message}</div>
            )}
          </div>
        </div>
      </div>

      {/* Venue and Rules */}
      <div className="mb-4">
        <h3 className="h5 fw-medium text-dark d-flex align-items-center mb-3">
          <Award size={20} className="me-2" />
          Venue and Rules
        </h3>

        <div className="row g-3">


          {/* Venue */}
          <div className="col-md-6">
            <label htmlFor="venue" className="form-label">
              Venue
            </label>
            <Controller
              name="venue"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  id="venue"
                  className={`form-control ${errors.venue ? 'is-invalid' : ''
                  }`}
                  placeholder="e.g., Central Park Soccer Fields"
                />
              )}
            />
            {errors.venue && (
              <div className="invalid-feedback">{errors.venue.message}</div>
            )}
          </div>

          {/* Rules */}
          <div className="col-12">
            <label htmlFor="rules" className="form-label">
              Tournament Rules
            </label>
            <Controller
              name="rules"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  id="rules"
                  rows={4}
                  className={`form-control ${errors.rules ? 'is-invalid' : ''
                  }`}
                  placeholder="Enter tournament rules and regulations"
                />
              )}
            />
            {errors.rules && (
              <div className="invalid-feedback">{errors.rules.message}</div>
            )}
            <div className="form-text">
              {watchedValues.rules?.length || 0}/2000 characters
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="d-flex justify-content-end gap-2 pt-4 border-top">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-outline-secondary"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting || createTournament.isPending || updateTournament.isPending}
          className="btn btn-primary"
        >
          {isSubmitting || createTournament.isPending || updateTournament.isPending ? (
            <div className="d-flex align-items-center">
              <div className="spinner-border spinner-border-sm me-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              {mode === 'create' ? 'Creating...' : 'Updating...'}
            </div>
          ) : (
            mode === 'create' ? 'Create Tournament' : 'Update Tournament'
          )}
        </button>
      </div>

      {/* Error Display */}
      {(createTournament.error || updateTournament.error) && (
        <div className="alert alert-danger mt-3" role="alert">
          <div className="d-flex">
            <div className="flex-shrink-0">
              <X size={20} className="text-danger" />
            </div>
            <div className="ms-3">
              <h6 className="alert-heading">
                Error occurred while saving tournament
              </h6>
              <div>
                {createTournament.error?.message || updateTournament.error?.message}
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
