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
  tournamentType: z.enum(['KNOCKOUT', 'ROUND_ROBIN', 'GROUP_STAGE', 'SWISS', 'CUSTOM'])
    .default('KNOCKOUT'),
  ageGroup: z.enum(['U8', 'U10', 'U12', 'U14', 'U16', 'U18', 'U21', 'SENIOR', 'MASTERS', 'OPEN'])
    .optional(),
  gender: z.enum(['MALE', 'FEMALE', 'MIXED'])
    .default('MIXED'),
  location: z.string()
    .max(200, 'Location must be less than 200 characters')
    .optional(),
  venue: z.string()
    .max(200, 'Venue must be less than 200 characters')
    .optional(),
  rules: z.string()
    .max(2000, 'Rules must be less than 2000 characters')
    .optional(),
  contactEmail: z.string()
    .email('Invalid email address')
    .max(100, 'Email must be less than 100 characters')
    .optional(),
  contactPhone: z.string()
    .max(20, 'Phone number must be less than 20 characters')
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
      tournamentType: tournament?.tournamentType || 'KNOCKOUT',
      ageGroup: tournament?.ageGroup || undefined,
      gender: tournament?.gender || 'MIXED',
      location: tournament?.location || '',
      venue: tournament?.venue || '',
      rules: tournament?.rules || '',
      contactEmail: tournament?.contactEmail || '',
      contactPhone: tournament?.contactPhone || '',
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
    setValue('logo', undefined);
  }, [setValue]);

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Logo Upload Section */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Tournament Logo
        </label>

        <div className="flex items-center space-x-4">
          {/* Logo Preview */}
          <div className="relative">
            {logoPreview ? (
              <div className="relative">
                <img
                  src={logoPreview}
                  alt="Tournament logo preview"
                  className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={removeLogo}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                <Upload size={24} className="text-gray-400" />
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div className="flex-1">
            <input
              type="file"
              id="logo"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
            <label
              htmlFor="logo"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Upload size={16} className="mr-2" />
              {logoPreview ? 'Change Logo' : 'Upload Logo'}
            </label>
            <p className="mt-1 text-xs text-gray-500">
              PNG, JPG, GIF up to 5MB
            </p>
          </div>
        </div>

        {/* Upload Progress */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Basic Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Trophy className="h-5 w-5 mr-2" />
          Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tournament Name */}
          <div className="col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Tournament Name *
            </label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  id="name"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.name ? 'border-red-300' : ''
                  }`}
                  placeholder="Enter tournament name"
                />
              )}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
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
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.description ? 'border-red-300' : ''
                  }`}
                  placeholder="Enter tournament description"
                />
              )}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {watchedValues.description?.length || 0}/1000 characters
            </p>
          </div>

          {/* Tournament Type */}
          <div>
            <label htmlFor="tournamentType" className="block text-sm font-medium text-gray-700">
              Tournament Type *
            </label>
            <Controller
              name="tournamentType"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  id="tournamentType"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.tournamentType ? 'border-red-300' : ''
                  }`}
                >
                  <option value="KNOCKOUT">Knockout</option>
                  <option value="ROUND_ROBIN">Round Robin</option>
                  <option value="GROUP_STAGE">Group Stage</option>
                  <option value="SWISS">Swiss System</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              )}
            />
            {errors.tournamentType && (
              <p className="mt-1 text-sm text-red-600">{errors.tournamentType.message}</p>
            )}
          </div>

          {/* Age Group */}
          <div>
            <label htmlFor="ageGroup" className="block text-sm font-medium text-gray-700">
              Age Group
            </label>
            <Controller
              name="ageGroup"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  id="ageGroup"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.ageGroup ? 'border-red-300' : ''
                  }`}
                >
                  <option value="">Select Age Group</option>
                  <option value="U8">Under 8</option>
                  <option value="U10">Under 10</option>
                  <option value="U12">Under 12</option>
                  <option value="U14">Under 14</option>
                  <option value="U16">Under 16</option>
                  <option value="U18">Under 18</option>
                  <option value="U21">Under 21</option>
                  <option value="SENIOR">Senior</option>
                  <option value="MASTERS">Masters</option>
                  <option value="OPEN">Open</option>
                </select>
              )}
            />
            {errors.ageGroup && (
              <p className="mt-1 text-sm text-red-600">{errors.ageGroup.message}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
              Gender *
            </label>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  id="gender"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.gender ? 'border-red-300' : ''
                  }`}
                >
                  <option value="MIXED">Mixed</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              )}
            />
            {errors.gender && (
              <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Dates and Registration */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Dates and Registration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Start Date */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Start Date *
            </label>
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="date"
                  id="startDate"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.startDate ? 'border-red-300' : ''
                  }`}
                />
              )}
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
            )}
          </div>

          {/* End Date */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              End Date *
            </label>
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="date"
                  id="endDate"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.endDate ? 'border-red-300' : ''
                  }`}
                />
              )}
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
            )}
          </div>

          {/* Registration Deadline */}
          <div>
            <label htmlFor="registrationDeadline" className="block text-sm font-medium text-gray-700">
              Registration Deadline *
            </label>
            <Controller
              name="registrationDeadline"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="date"
                  id="registrationDeadline"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.registrationDeadline ? 'border-red-300' : ''
                  }`}
                />
              )}
            />
            {errors.registrationDeadline && (
              <p className="mt-1 text-sm text-red-600">{errors.registrationDeadline.message}</p>
            )}
          </div>

          {/* Min Teams */}
          <div>
            <label htmlFor="minTeams" className="block text-sm font-medium text-gray-700">
              Minimum Teams *
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
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.minTeams ? 'border-red-300' : ''
                  }`}
                  placeholder="e.g., 4"
                  min="2"
                  max="100"
                />
              )}
            />
            {errors.minTeams && (
              <p className="mt-1 text-sm text-red-600">{errors.minTeams.message}</p>
            )}
          </div>

          {/* Max Teams */}
          <div>
            <label htmlFor="maxTeams" className="block text-sm font-medium text-gray-700">
              Maximum Teams *
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
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.maxTeams ? 'border-red-300' : ''
                  }`}
                  placeholder="e.g., 16"
                  min="2"
                  max="1000"
                />
              )}
            />
            {errors.maxTeams && (
              <p className="mt-1 text-sm text-red-600">{errors.maxTeams.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Financial Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          Financial Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Entry Fee */}
          <div>
            <label htmlFor="entryFee" className="block text-sm font-medium text-gray-700">
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
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.entryFee ? 'border-red-300' : ''
                  }`}
                  placeholder="e.g., 50.00"
                  min="0"
                  max="10000"
                  step="0.01"
                />
              )}
            />
            {errors.entryFee && (
              <p className="mt-1 text-sm text-red-600">{errors.entryFee.message}</p>
            )}
          </div>

          {/* Prize Pool */}
          <div>
            <label htmlFor="prizePool" className="block text-sm font-medium text-gray-700">
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
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.prizePool ? 'border-red-300' : ''
                  }`}
                  placeholder="e.g., 1000.00"
                  min="0"
                  max="1000000"
                  step="0.01"
                />
              )}
            />
            {errors.prizePool && (
              <p className="mt-1 text-sm text-red-600">{errors.prizePool.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Location and Venue */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Location and Venue
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  id="location"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.location ? 'border-red-300' : ''
                  }`}
                  placeholder="e.g., New York City"
                />
              )}
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
            )}
          </div>

          {/* Venue */}
          <div>
            <label htmlFor="venue" className="block text-sm font-medium text-gray-700">
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
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.venue ? 'border-red-300' : ''
                  }`}
                  placeholder="e.g., Central Park Soccer Fields"
                />
              )}
            />
            {errors.venue && (
              <p className="mt-1 text-sm text-red-600">{errors.venue.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Rules and Contact */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Award className="h-5 w-5 mr-2" />
          Rules and Contact
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rules */}
          <div className="col-span-2">
            <label htmlFor="rules" className="block text-sm font-medium text-gray-700">
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
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.rules ? 'border-red-300' : ''
                  }`}
                  placeholder="Enter tournament rules and regulations"
                />
              )}
            />
            {errors.rules && (
              <p className="mt-1 text-sm text-red-600">{errors.rules.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {watchedValues.rules?.length || 0}/2000 characters
            </p>
          </div>

          {/* Contact Email */}
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
              Contact Email
            </label>
            <Controller
              name="contactEmail"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="email"
                  id="contactEmail"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.contactEmail ? 'border-red-300' : ''
                  }`}
                  placeholder="e.g., info@tournament.com"
                />
              )}
            />
            {errors.contactEmail && (
              <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message}</p>
            )}
          </div>

          {/* Contact Phone */}
          <div>
            <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
              Contact Phone
            </label>
            <Controller
              name="contactPhone"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="tel"
                  id="contactPhone"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.contactPhone ? 'border-red-300' : ''
                  }`}
                  placeholder="e.g., +1 (555) 123-4567"
                />
              )}
            />
            {errors.contactPhone && (
              <p className="mt-1 text-sm text-red-600">{errors.contactPhone.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting || createTournament.isPending || updateTournament.isPending}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting || createTournament.isPending || updateTournament.isPending ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {mode === 'create' ? 'Creating...' : 'Updating...'}
            </div>
          ) : (
            mode === 'create' ? 'Create Tournament' : 'Update Tournament'
          )}
        </button>
      </div>

      {/* Error Display */}
      {(createTournament.error || updateTournament.error) && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <X size={20} className="text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error occurred while saving tournament
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {createTournament.error?.message || updateTournament.error?.message}
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
