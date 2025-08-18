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
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Logo Upload Section */}
      <div className="mb-4">
        <h5 className="fw-medium text-dark d-flex align-items-center mb-3">
          <Upload size={20} className="me-2" />
          Club Logo
        </h5>

        <div className="d-flex align-items-center gap-3">
          {/* Logo Preview */}
          <div className="position-relative">
            {logoPreview ? (
              <div className="position-relative">
                <img
                  src={logoPreview}
                  alt="Club logo preview"
                  className="rounded"
                  style={{ width: '96px', height: '96px', objectFit: 'cover', border: '2px solid #dee2e6' }}
                />
                <button
                  type="button"
                  onClick={removeLogo}
                  className="btn btn-danger btn-sm position-absolute rounded-circle p-1"
                  style={{ top: '-8px', right: '-8px', width: '24px', height: '24px' }}
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div 
                className="rounded border border-2 border-dashed d-flex align-items-center justify-content-center bg-light"
                style={{ width: '96px', height: '96px', borderColor: '#dee2e6' }}
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
              className="btn btn-outline-secondary d-flex align-items-center"
              style={{ cursor: 'pointer' }}
            >
              <Upload size={16} className="me-2" />
              {logoPreview ? 'Change Logo' : 'Upload Logo'}
            </label>
            <small className="text-muted">
              PNG, JPG, GIF up to 5MB
            </small>
          </div>
        </div>

        {/* Upload Progress */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="progress mt-2" style={{ height: '8px' }}>
            <div
              className="progress-bar bg-primary"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Basic Information */}
      <div className="mb-4">
        <h5 className="fw-medium text-dark d-flex align-items-center mb-3">
          <Building size={20} className="me-2" />
          Basic Information
        </h5>

        <div className="row g-3">
          {/* Club Name */}
          <div className="col-12">
            <label htmlFor="name" className="form-label">
              Club Name <span className="text-danger">*</span>
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
                  placeholder="Enter club name"
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
                  placeholder="Enter club description"
                />
              )}
            />
            {errors.description && (
              <div className="invalid-feedback">{errors.description.message}</div>
            )}
            <small className="text-muted">
              {watchedValues.description?.length || 0}/1000 characters
            </small>
          </div>

          {/* Founded Year */}
          <div className="col-md-6">
            <label htmlFor="foundedYear" className="form-label">
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
                  className={`form-control ${errors.foundedYear ? 'is-invalid' : ''}`}
                  placeholder="e.g., 1990"
                  min="1800"
                  max={new Date().getFullYear()}
                />
              )}
            />
            {errors.foundedYear && (
              <div className="invalid-feedback">{errors.foundedYear.message}</div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="mb-4">
        <h5 className="fw-medium text-dark d-flex align-items-center mb-3">
          <Phone size={20} className="me-2" />
          Contact Information
        </h5>

        <div className="row g-3">
          {/* Phone */}
          <div className="col-md-6">
            <label htmlFor="phone" className="form-label">
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
                  className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                  placeholder="e.g., +1 (555) 123-4567"
                />
              )}
            />
            {errors.phone && (
              <div className="invalid-feedback">{errors.phone.message}</div>
            )}
          </div>

          {/* Email */}
          <div className="col-md-6">
            <label htmlFor="email" className="form-label">
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
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="e.g., info@club.com"
                />
              )}
            />
            {errors.email && (
              <div className="invalid-feedback">{errors.email.message}</div>
            )}
          </div>

          {/* Website */}
          <div className="col-12">
            <label htmlFor="website" className="form-label">
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
                  className={`form-control ${errors.website ? 'is-invalid' : ''}`}
                  placeholder="e.g., https://www.club.com"
                />
              )}
            />
            {errors.website && (
              <div className="invalid-feedback">{errors.website.message}</div>
            )}
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="mb-4">
        <h5 className="fw-medium text-dark d-flex align-items-center mb-3">
          <MapPin size={20} className="me-2" />
          Address Information
        </h5>

        <div className="row g-3">
          {/* Address */}
          <div className="col-12">
            <label htmlFor="address" className="form-label">
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
                  className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                  placeholder="e.g., 123 Main Street"
                />
              )}
            />
            {errors.address && (
              <div className="invalid-feedback">{errors.address.message}</div>
            )}
          </div>

          {/* City */}
          <div className="col-md-6">
            <label htmlFor="city" className="form-label">
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
                  className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                  placeholder="e.g., New York"
                />
              )}
            />
            {errors.city && (
              <div className="invalid-feedback">{errors.city.message}</div>
            )}
          </div>

          {/* State */}
          <div className="col-md-6">
            <label htmlFor="state" className="form-label">
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
                  className={`form-control ${errors.state ? 'is-invalid' : ''}`}
                  placeholder="e.g., NY"
                />
              )}
            />
            {errors.state && (
              <div className="invalid-feedback">{errors.state.message}</div>
            )}
          </div>

          {/* Postal Code */}
          <div className="col-md-6">
            <label htmlFor="postalCode" className="form-label">
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
                  className={`form-control ${errors.postalCode ? 'is-invalid' : ''}`}
                  placeholder="e.g., 10001"
                />
              )}
            />
            {errors.postalCode && (
              <div className="invalid-feedback">{errors.postalCode.message}</div>
            )}
          </div>

          {/* Country */}
          <div className="col-md-6">
            <label htmlFor="country" className="form-label">
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
                  className={`form-control ${errors.country ? 'is-invalid' : ''}`}
                  placeholder="e.g., United States"
                />
              )}
            />
            {errors.country && (
              <div className="invalid-feedback">{errors.country.message}</div>
            )}
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
          disabled={isSubmitting || createClub.isPending || updateClub.isPending}
          className="btn btn-primary"
        >
          {isSubmitting || createClub.isPending || updateClub.isPending ? (
            <div className="d-flex align-items-center">
              <div className="spinner-border spinner-border-sm me-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              {mode === 'create' ? 'Creating...' : 'Updating...'}
            </div>
          ) : (
            mode === 'create' ? 'Create Club' : 'Update Club'
          )}
        </button>
      </div>

      {/* Error Display */}
      {(createClub.error || updateClub.error) && (
        <div className="alert alert-danger mt-3" role="alert">
          <div className="d-flex">
            <div className="flex-shrink-0">
              <X size={20} className="text-danger" />
            </div>
            <div className="ms-3">
              <h6 className="alert-heading mb-1">
                Error occurred while saving club
              </h6>
              <div className="mb-0">
                {createClub.error?.message || updateClub.error?.message}
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
