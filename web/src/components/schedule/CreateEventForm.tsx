'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Event, EventType, EventRecurrence } from '../../../../shared/src/types';
import { EventService } from '../../lib/services/eventService';
import { useEnhancedAuthContext } from '@/contexts/EnhancedAuthContext';

const createEventSchema = z.object({
  title: z.string().min(2, 'Event title must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.enum(['practice', 'game', 'tournament', 'meeting', 'tryout', 'training', 'scrimmage', 'team_building', 'other']),
  startDate: z.string().min(1, 'Start date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endDate: z.string().min(1, 'End date is required'),
  endTime: z.string().min(1, 'End time is required'),
  locationName: z.string().min(1, 'Location name is required'),
  locationAddress: z.string().optional(),
  maxParticipants: z.number().min(0, 'Max participants must be 0 or greater').optional(),
  isPublic: z.boolean(),
  requiresRSVP: z.boolean(),
  isRecurring: z.boolean(),
  recurrenceFrequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  recurrenceInterval: z.number().min(1, 'Interval must be at least 1').optional(),
  recurrenceOccurrences: z.number().min(1, 'Occurrences must be at least 1').optional(),
  notes: z.string().optional(),
});

type CreateEventFormData = z.infer<typeof createEventSchema>;

interface CreateEventFormProps {
  teamId: string;
  clubId: string;
  onSuccess?: (eventId: string) => void;
  onCancel?: () => void;
}

export function CreateEventForm({ teamId, clubId, onSuccess, onCancel }: CreateEventFormProps) {
  const { user } = useEnhancedAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      type: 'practice',
      startDate: new Date().toISOString().split('T')[0],
      startTime: '18:00',
      endDate: new Date().toISOString().split('T')[0],
      endTime: '19:30',
      isPublic: false,
      requiresRSVP: false,
      isRecurring: false,
      recurrenceFrequency: 'weekly',
      recurrenceInterval: 1,
      recurrenceOccurrences: 4,
    },
  });

  const watchedValues = watch();

  const onSubmit = async (data: CreateEventFormData) => {
    if (!user) {
      alert('You must be logged in to create an event');
      return;
    }

    setIsSubmitting(true);
    try {
      // Combine date and time
      const startDateTime = new Date(`${data.startDate}T${data.startTime}`);
      const endDateTime = new Date(`${data.endDate}T${data.endTime}`);

      // Validate end time is after start time
      if (endDateTime <= startDateTime) {
        alert('End time must be after start time');
        return;
      }

      // Create event data
      const eventData: Partial<Event> = {
        title: data.title,
        description: data.description,
        type: data.type,
        startTime: startDateTime,
        endTime: endDateTime,
        startDate: startDateTime,
        endDate: endDateTime,
        allDay: false,
        location: {
          name: data.locationName,
          address: data.locationAddress || '',
          coordinates: null,
          venueType: 'field',
        },
        teamIds: [teamId],
        clubId,
        maxParticipants: data.maxParticipants || 0,
        isPublic: data.isPublic,
        requiresRSVP: data.requiresRSVP,
        notes: data.notes,
        createdBy: user.id,
        status: 'scheduled',
        priority: 'medium',
        color: '#3B82F6',
        recurring: {
          isRecurring: data.isRecurring,
          pattern: 'weekly',
          exceptions: [],
        },
        attendees: [],
        reminders: [],
        attachments: [],
      };

      // Add recurrence if enabled
      if (data.isRecurring && data.recurrenceFrequency && data.recurrenceInterval && data.recurrenceOccurrences) {
        const recurrence: EventRecurrence = {
          frequency: data.recurrenceFrequency,
          interval: data.recurrenceInterval,
          maxOccurrences: data.recurrenceOccurrences,
        };
        eventData.recurrence = recurrence;
      }

      let eventId: string;

      if (data.isRecurring && data.recurrenceFrequency && data.recurrenceInterval && data.recurrenceOccurrences) {
        // Create recurring events
        const recurrence: EventRecurrence = {
          frequency: data.recurrenceFrequency,
          interval: data.recurrenceInterval,
          maxOccurrences: data.recurrenceOccurrences,
        };
        
        const eventIds = await EventService.createRecurringEvents(
          eventData,
          recurrence,
          data.recurrenceOccurrences
        );
        eventId = eventIds[0]; // Return first event ID
      } else {
        // Create single event
        eventId = await EventService.createEvent(eventData);
      }
      
      if (onSuccess) {
        onSuccess(eventId);
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create New Event</h2>
        <p className="text-gray-600">Schedule a new event for your team</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
          
          <div>
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter event title"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe the event, what to bring, etc."
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="type">Event Type *</Label>
            <select
              id="type"
              {...register('type')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="practice">Practice</option>
              <option value="game">Game</option>
              <option value="tournament">Tournament</option>
              <option value="meeting">Meeting</option>
              <option value="tryout">Tryout</option>
              <option value="training">Training</option>
              <option value="scrimmage">Scrimmage</option>
              <option value="team_building">Team Building</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Date and Time */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Date and Time</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                {...register('startDate')}
                className={errors.startDate ? 'border-red-500' : ''}
              />
              {errors.startDate && (
                <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="time"
                {...register('startTime')}
                className={errors.startTime ? 'border-red-500' : ''}
              />
              {errors.startTime && (
                <p className="text-red-500 text-sm mt-1">{errors.startTime.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                {...register('endDate')}
                className={errors.endDate ? 'border-red-500' : ''}
              />
              {errors.endDate && (
                <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="endTime">End Time *</Label>
              <Input
                id="endTime"
                type="time"
                {...register('endTime')}
                className={errors.endTime ? 'border-red-500' : ''}
              />
              {errors.endTime && (
                <p className="text-red-500 text-sm mt-1">{errors.endTime.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Location</h3>
          
          <div>
            <Label htmlFor="locationName">Location Name *</Label>
            <Input
              id="locationName"
              {...register('locationName')}
              placeholder="e.g., Main Field, Practice Field A"
              className={errors.locationName ? 'border-red-500' : ''}
            />
            {errors.locationName && (
              <p className="text-red-500 text-sm mt-1">{errors.locationName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="locationAddress">Address (Optional)</Label>
            <Input
              id="locationAddress"
              {...register('locationAddress')}
              placeholder="Full address"
            />
          </div>
        </div>

        {/* Event Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Event Settings</h3>
          
          <div>
            <Label htmlFor="maxParticipants">Maximum Participants (Optional)</Label>
            <Input
              id="maxParticipants"
              type="number"
              {...register('maxParticipants', { valueAsNumber: true })}
              placeholder="Leave empty for unlimited"
              min="0"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isPublic">Public Event</Label>
                <p className="text-sm text-gray-500">
                  Allow anyone to view this event
                </p>
              </div>
              <Switch
                id="isPublic"
                checked={watchedValues.isPublic}
                onCheckedChange={(checked) => setValue('isPublic', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="requiresRSVP">Require RSVP</Label>
                <p className="text-sm text-gray-500">
                  Ask participants to confirm attendance
                </p>
              </div>
              <Switch
                id="requiresRSVP"
                checked={watchedValues.requiresRSVP}
                onCheckedChange={(checked) => setValue('requiresRSVP', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isRecurring">Recurring Event</Label>
                <p className="text-sm text-gray-500">
                  Create multiple occurrences of this event
                </p>
              </div>
              <Switch
                id="isRecurring"
                checked={watchedValues.isRecurring}
                onCheckedChange={(checked) => {
                  setValue('isRecurring', checked);
                  setIsRecurring(checked);
                }}
              />
            </div>
          </div>

          {/* Recurrence Settings */}
          {isRecurring && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">Recurrence Settings</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="recurrenceFrequency">Frequency</Label>
                  <select
                    id="recurrenceFrequency"
                    {...register('recurrenceFrequency')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="recurrenceInterval">Interval</Label>
                  <Input
                    id="recurrenceInterval"
                    type="number"
                    {...register('recurrenceInterval', { valueAsNumber: true })}
                    min="1"
                    placeholder="1"
                  />
                </div>

                <div>
                  <Label htmlFor="recurrenceOccurrences">Number of Occurrences</Label>
                  <Input
                    id="recurrenceOccurrences"
                    type="number"
                    {...register('recurrenceOccurrences', { valueAsNumber: true })}
                    min="1"
                    placeholder="4"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Additional Notes */}
        <div>
          <Label htmlFor="notes">Additional Notes (Optional)</Label>
          <Textarea
            id="notes"
            {...register('notes')}
            placeholder="Any additional information for participants"
            rows={3}
          />
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 pt-6 border-t">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Creating Event...' : 'Create Event'}
          </Button>
          
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
} 