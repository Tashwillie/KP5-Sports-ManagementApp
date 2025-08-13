'use client';

import React, { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Upload, X, User, Users, Trophy, MapPin, Calendar } from 'lucide-react';
import { useCreateTeam, useUpdateTeam } from '@/hooks/useTeams';
import { Team, CreateTeamRequest, UpdateTeamRequest } from '@/lib/services/teamsApiService';

// Validation schema
const teamSchema = z.object({
  name: z.string()
    .min(2, 'Team name must be at least 2 characters')
    .max(50, 'Team name must be less than 50 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  foundedYear: z.number()
    .min(1800, 'Founded year must be after 1800')
    .max(new Date().getFullYear(), 'Founded year cannot be in the future')
    .optional(),
  homeGround: z.string()
    .max(100, 'Home ground must be less than 100 characters')
    .optional(),
  clubId: z.string()
    .uuid('Invalid club ID')
    .optional(),
});

type TeamFormData = z.infer<typeof teamSchema>;

interface TeamFormProps {
  team?: Team;
  onSuccess?: (team: Team) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
}

export const TeamForm: React.FC<TeamFormProps> = ({
  team,
  onSuccess,
  onCancel,
  mode = 'create'
}) => {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(team?.logo || null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: team?.name || '',
      description: team?.description || '',
      foundedYear: team?.foundedYear || undefined,
      homeGround: team?.homeGround || '',
      clubId: team?.clubId || '',
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
  const onSubmit = async (data: TeamFormData) => {
    try {
      const formData: CreateTeamRequest | UpdateTeamRequest = {
        ...data,
        logo: logoFile || undefined,
      };

      if (mode === 'create') {
        const response = await createTeam.mutateAsync(formData as CreateTeamRequest);
        if (response.success) {
          toast.success('Team created successfully!');
          onSuccess?.(response.data!);
          reset();
          setLogoFile(null);
          setLogoPreview(null);
        }
      } else if (mode === 'edit' && team) {
        const response = await updateTeam.mutateAsync({
          id: team.id,
          data: formData as UpdateTeamRequest,
        });
        if (response.success) {
          toast.success('Team updated successfully!');
          onSuccess?.(response.data!);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save team');
    }
  };

  const watchedValues = watch();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Logo Upload Section */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Team Logo
        </label>
        
        <div className="flex items-center space-x-4">
          {/* Logo Preview */}
          <div className="relative">
            {logoPreview ? (
              <div className="relative">
                <img
                  src={logoPreview}
                  alt="Team logo preview"
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team Name */}
        <div className="col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Team Name *
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
                placeholder="Enter team name"
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
                placeholder="Enter team description"
              />
            )}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {watchedValues.description?.length || 0}/500 characters
          </p>
        </div>

        {/* Founded Year */}
        <div>
          <label htmlFor="foundedYear" className="block text-sm font-medium text-gray-700">
            Founded Year
          </label>
          <Controller
            name="foundedYear"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="number"
                id="foundedYear"
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.foundedYear ? 'border-red-300' : ''
                }`}
                placeholder="e.g., 1990"
                min="1800"
                max={new Date().getFullYear()}
              />
            )}
          />
          {errors.foundedYear && (
            <p className="mt-1 text-sm text-red-600">{errors.foundedYear.message}</p>
          )}
        </div>

        {/* Home Ground */}
        <div>
          <label htmlFor="homeGround" className="block text-sm font-medium text-gray-700">
            Home Ground
          </label>
          <Controller
            name="homeGround"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                id="homeGround"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.homeGround ? 'border-red-300' : ''
                }`}
                placeholder="e.g., Stadium Name"
              />
            )}
          />
          {errors.homeGround && (
            <p className="mt-1 text-sm text-red-600">{errors.homeGround.message}</p>
          )}
        </div>

        {/* Club ID */}
        <div className="col-span-2">
          <label htmlFor="clubId" className="block text-sm font-medium text-gray-700">
            Club ID
          </label>
          <Controller
            name="clubId"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                id="clubId"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.clubId ? 'border-red-300' : ''
                }`}
                placeholder="Enter club UUID (optional)"
              />
            )}
          />
          {errors.clubId && (
            <p className="mt-1 text-sm text-red-600">{errors.clubId.message}</p>
          )}
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
          disabled={isSubmitting || createTeam.isPending || updateTeam.isPending}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting || createTeam.isPending || updateTeam.isPending ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {mode === 'create' ? 'Creating...' : 'Updating...'}
            </div>
          ) : (
            mode === 'create' ? 'Create Team' : 'Update Team'
          )}
        </button>
      </div>

      {/* Error Display */}
      {(createTeam.error || updateTeam.error) && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <X size={20} className="text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error occurred while saving team
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {createTeam.error?.message || updateTeam.error?.message}
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
