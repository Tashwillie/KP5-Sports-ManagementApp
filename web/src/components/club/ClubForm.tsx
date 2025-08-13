'use client';

import React, { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Upload, X, Building, MapPin, Phone, Mail, Globe, Users } from 'lucide-react';
import { Club, CreateClubRequest, UpdateClubRequest } from '@/lib/services/clubsApiService';
import { useCreateClub, useUpdateClub } from '@/hooks/useClubs';

// Validation schema
const clubSchema = z.object({
  name: z.string()
    .min(2, 'Club name must be at least 2 characters')
    .max(100, 'Club name must be less than 100 characters'),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  foundedYear: z.number()
    .min(1800, 'Founded year must be after 1800')
    .max(new Date().getFullYear(), 'Founded year cannot be in the future')
    .optional(),
  address: z.string()
    .max(200, 'Address must be less than 200 characters')
    .optional(),
  city: z.string()
    .max(100, 'City must be less than 100 characters')
    .optional(),
  state: z.string()
    .max(100, 'State must be less than 100 characters')
    .optional(),
  postalCode: z.string()
    .max(20, 'Postal code must be less than 20 characters')
    .optional(),
  country: z.string()
    .max(100, 'Country must be less than 100 characters')
    .optional(),
  phone: z.string()
    .max(20, 'Phone number must be less than 20 characters')
    .optional(),
  email: z.string()
    .email('Invalid email address')
    .max(100, 'Email must be less than 100 characters')
    .optional(),
  website: z.string()
    .url('Invalid website URL')
    .max(200, 'Website URL must be less than 200 characters')
    .optional(),
});

type ClubFormData = z.infer<typeof clubSchema>;

interface ClubFormProps {
  club?: Club;
  onSuccess?: (club: Club) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
}

export const ClubForm: React.FC<ClubFormProps> = ({
  club,
  onSuccess,
  onCancel,
  mode = 'create'
}) => {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(club?.logo || null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const createClub = useCreateClub();
  const updateClub = useUpdateClub();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<ClubFormData>({
    resolver: zodResolver(clubSchema),
    defaultValues: {
      name: club?.name || '',
      description: club?.description || '',
      foundedYear: club?.foundedYear || undefined,
      address: club?.address || '',
      city: club?.city || '',
      state: club?.state || '',
      postalCode: club?.postalCode || '',
      country: club?.country || '',
      phone: club?.phone || '',
      email: club?.email || '',
      website: club?.website || '',
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
  const onSubmit = async (data: ClubFormData) => {
    try {
      const formData: CreateClubRequest | UpdateClubRequest = {
        ...data,
        logo: logoFile || undefined,
      };

      if (mode === 'create') {
        const response = await createClub.mutateAsync(formData as CreateClubRequest);
        if (response.success) {
          toast.success('Club created successfully!');
          onSuccess?.(response.data!);
          reset();
          setLogoFile(null);
          setLogoPreview(null);
        }
      } else if (mode === 'edit' && club) {
        const response = await updateClub.mutateAsync({
          id: club.id,
          data: formData as UpdateClubRequest,
        });
        if (response.success) {
          toast.success('Club updated successfully!');
          onSuccess?.(response.data!);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save club');
    }
  };

  const watchedValues = watch();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Logo Upload Section */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Club Logo
        </label>

        <div className="flex items-center space-x-4">
          {/* Logo Preview */}
          <div className="relative">
            {logoPreview ? (
              <div className="relative">
                <img
                  src={logoPreview}
                  alt="Club logo preview"
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
          <Building className="h-5 w-5 mr-2" />
          Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Club Name */}
          <div className="col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Club Name *
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
                  placeholder="Enter club name"
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
                  placeholder="Enter club description"
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


        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Phone className="h-5 w-5 mr-2" />
          Contact Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="tel"
                  id="phone"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.phone ? 'border-red-300' : ''
                  }`}
                  placeholder="e.g., +1 (555) 123-4567"
                />
              )}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="email"
                  id="email"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.email ? 'border-red-300' : ''
                  }`}
                  placeholder="e.g., info@club.com"
                />
              )}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Website */}
          <div className="col-span-2">
            <label htmlFor="website" className="block text-sm font-medium text-gray-700">
              Website
            </label>
            <Controller
              name="website"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="url"
                  id="website"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.website ? 'border-red-300' : ''
                  }`}
                  placeholder="e.g., https://www.club.com"
                />
              )}
            />
            {errors.website && (
              <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Address Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Address */}
          <div className="col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Street Address
            </label>
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  id="address"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.address ? 'border-red-300' : ''
                  }`}
                  placeholder="e.g., 123 Main Street"
                />
              )}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>

          {/* City */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City
            </label>
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  id="city"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.city ? 'border-red-300' : ''
                  }`}
                  placeholder="e.g., New York"
                />
              )}
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
            )}
          </div>

          {/* State */}
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
              State/Province
            </label>
            <Controller
              name="state"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  id="state"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.state ? 'border-red-300' : ''
                  }`}
                  placeholder="e.g., NY"
                />
              )}
            />
            {errors.state && (
              <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
            )}
          </div>

          {/* Postal Code */}
          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
              Zip/Postal Code
            </label>
            <Controller
              name="postalCode"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  id="postalCode"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.postalCode ? 'border-red-300' : ''
                  }`}
                  placeholder="e.g., 10001"
                />
              )}
            />
            {errors.postalCode && (
              <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>
            )}
          </div>

          {/* Country */}
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
              Country
            </label>
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  id="country"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.country ? 'border-red-300' : ''
                  }`}
                  placeholder="e.g., United States"
                />
              )}
            />
            {errors.country && (
              <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
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
          disabled={isSubmitting || createClub.isPending || updateClub.isPending}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting || createClub.isPending || updateClub.isPending ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {mode === 'create' ? 'Creating...' : 'Updating...'}
            </div>
          ) : (
            mode === 'create' ? 'Create Club' : 'Update Club'
          )}
        </button>
      </div>

      {/* Error Display */}
      {(createClub.error || updateClub.error) && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <X size={20} className="text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error occurred while saving club
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {createClub.error?.message || updateClub.error?.message}
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
