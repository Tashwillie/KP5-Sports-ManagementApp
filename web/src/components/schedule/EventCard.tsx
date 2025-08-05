'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Event, EventType, EventStatus } from '../../../../shared/src/types';
import { EventService } from '../../lib/services/eventService';

interface EventCardProps {
  event: Event;
  showActions?: boolean;
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: string) => void;
  onViewDetails?: (eventId: string) => void;
  onRSVP?: (eventId: string, response: 'accepted' | 'declined' | 'maybe') => void;
}

export function EventCard({ 
  event, 
  showActions = false, 
  onEdit, 
  onDelete, 
  onViewDetails,
  onRSVP 
}: EventCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    
    if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      setIsDeleting(true);
      try {
        await onDelete(event.id);
      } catch (error) {
        console.error('Error deleting event:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const getStatusColor = (status: EventStatus): string => {
    const colors: Record<EventStatus, string> = {
      'scheduled': 'bg-blue-100 text-blue-800',
      'in_progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'postponed': 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTimeUntilEvent = (): string => {
    const now = new Date();
    const eventTime = new Date(event.startTime);
    const diffTime = eventTime.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Past';
    } else if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else if (diffDays < 7) {
      return `${diffDays} days`;
    } else {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''}`;
    }
  };

  const isUpcoming = new Date(event.startTime) > new Date();
  const isToday = new Date(event.startTime).toDateString() === new Date().toDateString();

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow duration-200 ${
      isToday ? 'ring-2 ring-blue-500' : ''
    }`}>
      {/* Event Header */}
      <div className={`p-4 ${
        isToday ? 'bg-blue-50' : 'bg-gray-50'
      }`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {event.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {event.description}
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <Badge className={EventService.getEventTypeColor(event.type)}>
              {EventService.getEventTypeDisplayName(event.type)}
            </Badge>
            <Badge className={getStatusColor(event.status)}>
              {EventService.getEventStatusDisplayName(event.status)}
            </Badge>
          </div>
        </div>

        {/* Time and Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="flex items-center gap-2 text-gray-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">
                {EventService.formatEventTime(event.startTime, event.endTime)}
              </span>
            </div>
            <div className="text-gray-600 ml-6">
              {EventService.formatEventDate(event.startTime)}
            </div>
          </div>

          {event.location.name && (
            <div>
              <div className="flex items-center gap-2 text-gray-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium">{event.location.name}</span>
              </div>
              {event.location.address && (
                <div className="text-gray-600 ml-6 text-xs">
                  {event.location.address}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Event Content */}
      <div className="p-4">
        {/* Time Until Event */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Time until event:</span>
            <span className={`text-sm font-medium ${
              isToday ? 'text-blue-600' : 
              new Date(event.startTime) < new Date() ? 'text-gray-500' : 'text-green-600'
            }`}>
              {getTimeUntilEvent()}
            </span>
          </div>
        </div>

        {/* Event Details */}
        <div className="space-y-3">
          {/* Teams */}
          {event.teamIds.length > 0 && (
            <div>
              <span className="text-sm text-gray-600">Teams:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {event.teamIds.map((teamId, index) => (
                  <Badge key={teamId} variant="outline" className="text-xs">
                    Team {index + 1}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Max Participants */}
          {event.maxParticipants > 0 && (
            <div>
              <span className="text-sm text-gray-600">Max Participants:</span>
              <span className="text-sm font-medium ml-2">{event.maxParticipants}</span>
            </div>
          )}

          {/* Public/Private */}
          <div>
            <span className="text-sm text-gray-600">Visibility:</span>
            <Badge variant="outline" className="text-xs ml-2">
              {event.isPublic ? 'Public' : 'Private'}
            </Badge>
          </div>

          {/* RSVP Required */}
          {event.requiresRSVP && (
            <div>
              <span className="text-sm text-gray-600">RSVP:</span>
              <Badge variant="outline" className="text-xs ml-2">
                Required
              </Badge>
            </div>
          )}

          {/* Recurring */}
          {event.recurrence && (
            <div>
              <span className="text-sm text-gray-600">Recurring:</span>
              <span className="text-sm font-medium ml-2">
                {event.recurrence.frequency} ({event.recurrence.interval} {event.recurrence.frequency})
              </span>
            </div>
          )}

          {/* Notes */}
          {event.notes && (
            <div>
              <span className="text-sm text-gray-600">Notes:</span>
              <p className="text-sm text-gray-800 mt-1">{event.notes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t mt-4">
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(event.id)}
              className="flex-1"
            >
              View Details
            </Button>
          )}
          
          {showActions && (
            <>
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(event)}
                >
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              )}
            </>
          )}

          {/* RSVP Actions */}
          {event.requiresRSVP && onRSVP && isUpcoming && (
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRSVP(event.id, 'accepted')}
                className="text-green-600 hover:text-green-700"
              >
                Accept
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRSVP(event.id, 'maybe')}
                className="text-yellow-600 hover:text-yellow-700"
              >
                Maybe
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRSVP(event.id, 'declined')}
                className="text-red-600 hover:text-red-700"
              >
                Decline
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
} 