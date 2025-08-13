import { Event, EventType, EventStatus, EventRecurrence, EventParticipant } from '../../../../shared/src/types';
import { apiClient } from '../apiClient';

export class EventService {
  // Event Management
  static async createEvent(eventData: Partial<Event>): Promise<string> {
    try {
      const event: Omit<Event, 'id'> = {
        title: eventData.title || '',
        description: eventData.description || '',
        type: eventData.type || 'practice',
        status: eventData.status || 'scheduled',
        startTime: eventData.startTime || new Date(),
        endTime: eventData.endTime || new Date(),
        location: eventData.location || {
          name: '',
          address: '',
          coordinates: null,
        },
        teamIds: eventData.teamIds || [],
        clubId: eventData.clubId || '',
        createdBy: eventData.createdBy || '',
        maxParticipants: eventData.maxParticipants || 0,
        isPublic: eventData.isPublic || false,
        requiresRSVP: eventData.requiresRSVP || false,
        recurrence: eventData.recurrence || null,
        notes: eventData.notes || '',
        attachments: eventData.attachments || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };

      const response = await apiClient.createEvent(event);
      return response.data.id;
    } catch (error) {
      console.error('Error creating event:', error);
      throw new Error('Failed to create event');
    }
  }

  static async getEvent(eventId: string): Promise<Event | null> {
    try {
      const response = await apiClient.getEvent(eventId);
      return response.data;
    } catch (error) {
      console.error('Error fetching event:', error);
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw new Error('Failed to fetch event');
    }
  }

  static async updateEvent(eventId: string, updates: Partial<Event>): Promise<void> {
    try {
      await apiClient.updateEvent(eventId, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating event:', error);
      throw new Error('Failed to update event');
    }
  }

  static async deleteEvent(eventId: string): Promise<void> {
    try {
      await apiClient.deleteEvent(eventId);
    } catch (error) {
      console.error('Error deleting event:', error);
      throw new Error('Failed to delete event');
    }
  }

  // Event Queries
  static async getEventsByTeam(teamId: string, filters?: {
    type?: EventType;
    status?: EventStatus;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<Event[]> {
    try {
      const response = await apiClient.getEvents();
      let events = response.data || [];
      
      // Filter by team
      events = events.filter(event => event.teamIds?.includes(teamId));

      // Apply additional filters
      if (filters?.type) {
        events = events.filter(event => event.type === filters.type);
      }

      if (filters?.status) {
        events = events.filter(event => event.status === filters.status);
      }

      if (filters?.startDate) {
        events = events.filter(event => new Date(event.startTime) >= filters.startDate!);
      }

      if (filters?.endDate) {
        events = events.filter(event => new Date(event.endTime) <= filters.endDate!);
      }

      if (filters?.limit) {
        events = events.slice(0, filters.limit);
      }

      return events;
    } catch (error) {
      console.error('Error fetching events by team:', error);
      throw new Error('Failed to fetch events by team');
    }
  }

  static async getEventsByClub(clubId: string, filters?: {
    type?: EventType;
    status?: EventStatus;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<Event[]> {
    try {
      const response = await apiClient.getEvents();
      let events = response.data || [];
      
      // Filter by club
      events = events.filter(event => event.clubId === clubId);

      // Apply additional filters
      if (filters?.type) {
        events = events.filter(event => event.type === filters.type);
      }

      if (filters?.status) {
        events = events.filter(event => event.status === filters.status);
      }

      if (filters?.startDate) {
        events = events.filter(event => new Date(event.startTime) >= filters.startDate!);
      }

      if (filters?.endDate) {
        events = events.filter(event => new Date(event.endTime) <= filters.endDate!);
      }

      if (filters?.limit) {
        events = events.slice(0, filters.limit);
      }

      return events;
    } catch (error) {
      console.error('Error fetching events by club:', error);
      throw new Error('Failed to fetch events by club');
    }
  }

  static async getUpcomingEvents(teamId: string, days: number = 7): Promise<Event[]> {
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      return await this.getEventsByTeam(teamId, {
        startDate,
        endDate,
        status: 'scheduled',
      });
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      throw new Error('Failed to fetch upcoming events');
    }
  }

  // Event Participant Management
  static async addEventParticipant(eventId: string, participantData: Omit<EventParticipant, 'id'>): Promise<string> {
    try {
      const participant: Omit<EventParticipant, 'id'> = {
        eventId,
        userId: participantData.userId,
        status: participantData.status || 'confirmed',
        response: participantData.response || 'yes',
        notes: participantData.notes || '',
        joinedAt: new Date(),
      };

      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${apiClient.baseURL}/events/${eventId}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
        body: JSON.stringify(participant),
      });

      if (!response.ok) {
        throw new Error('Failed to add event participant');
      }

      const result = await response.json();
      return result.data.id;
    } catch (error) {
      console.error('Error adding event participant:', error);
      throw new Error('Failed to add event participant');
    }
  }

  static async updateEventParticipant(eventId: string, userId: string, updates: Partial<EventParticipant>): Promise<void> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${apiClient.baseURL}/events/${eventId}/participants/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update event participant');
      }
    } catch (error) {
      console.error('Error updating event participant:', error);
      throw new Error('Failed to update event participant');
    }
  }

  static async getEventParticipants(eventId: string): Promise<EventParticipant[]> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${apiClient.baseURL}/events/${eventId}/participants`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch event participants');
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching event participants:', error);
      throw new Error('Failed to fetch event participants');
    }
  }

  // Recurring Events
  static async createRecurringEvents(
    baseEvent: Partial<Event>,
    recurrence: EventRecurrence,
    occurrences: number
  ): Promise<string[]> {
    try {
      const eventIds: string[] = [];
      const startDate = new Date(baseEvent.startTime || new Date());

      for (let i = 0; i < occurrences; i++) {
        const eventStartTime = new Date(startDate);
        const eventEndTime = new Date(baseEvent.endTime || startDate);

        // Calculate next occurrence based on recurrence pattern
        if (recurrence.type === 'daily') {
          eventStartTime.setDate(eventStartTime.getDate() + (i * recurrence.interval));
          eventEndTime.setDate(eventEndTime.getDate() + (i * recurrence.interval));
        } else if (recurrence.type === 'weekly') {
          eventStartTime.setDate(eventStartTime.getDate() + (i * recurrence.interval * 7));
          eventEndTime.setDate(eventEndTime.getDate() + (i * recurrence.interval * 7));
        } else if (recurrence.type === 'monthly') {
          eventStartTime.setMonth(eventStartTime.getMonth() + (i * recurrence.interval));
          eventEndTime.setMonth(eventEndTime.getMonth() + (i * recurrence.interval));
        }

        const eventData = {
          ...baseEvent,
          startTime: eventStartTime,
          endTime: eventEndTime,
          recurrence: i === 0 ? recurrence : null, // Only set recurrence on first event
        };

        const eventId = await this.createEvent(eventData);
        eventIds.push(eventId);
      }

      return eventIds;
    } catch (error) {
      console.error('Error creating recurring events:', error);
      throw new Error('Failed to create recurring events');
    }
  }

  // Calendar Integration
  static async getEventsForCalendar(teamId: string, startDate: Date, endDate: Date): Promise<Event[]> {
    try {
      return await this.getEventsByTeam(teamId, {
        startDate,
        endDate,
      });
    } catch (error) {
      console.error('Error fetching events for calendar:', error);
      throw new Error('Failed to fetch events for calendar');
    }
  }

  // Real-time subscriptions (simplified for API-based approach)
  static subscribeToTeamEvents(teamId: string, callback: (events: Event[]) => void): () => void {
    // For API-based approach, we'll use polling instead of real-time subscriptions
    const interval = setInterval(async () => {
      try {
        const events = await this.getEventsByTeam(teamId);
        callback(events);
      } catch (error) {
        console.error('Error in team events subscription:', error);
        callback([]);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }

  static subscribeToEvent(eventId: string, callback: (event: Event | null) => void): () => void {
    // For API-based approach, we'll use polling instead of real-time subscriptions
    const interval = setInterval(async () => {
      try {
        const event = await this.getEvent(eventId);
        callback(event);
      } catch (error) {
        console.error('Error in event subscription:', error);
        callback(null);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }

  // Utility methods
  static getEventTypeDisplayName(type: EventType): string {
    const typeNames: Record<EventType, string> = {
      practice: 'Practice',
      game: 'Game',
      tournament: 'Tournament',
      meeting: 'Meeting',
      tryout: 'Tryout',
      camp: 'Camp',
      clinic: 'Clinic',
      other: 'Other',
    };
    return typeNames[type] || 'Unknown';
  }

  static getEventStatusDisplayName(status: EventStatus): string {
    const statusNames: Record<EventStatus, string> = {
      scheduled: 'Scheduled',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
      postponed: 'Postponed',
    };
    return statusNames[status] || 'Unknown';
  }

  static getEventTypeColor(type: EventType): string {
    const typeColors: Record<EventType, string> = {
      practice: '#3B82F6', // Blue
      game: '#EF4444', // Red
      tournament: '#8B5CF6', // Purple
      meeting: '#10B981', // Green
      tryout: '#F59E0B', // Yellow
      camp: '#EC4899', // Pink
      clinic: '#06B6D4', // Cyan
      other: '#6B7280', // Gray
    };
    return typeColors[type] || '#6B7280';
  }

  static formatEventTime(startTime: Date, endTime: Date): string {
    const start = new Date(startTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    const end = new Date(endTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `${start} - ${end}`;
  }

  static formatEventDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
} 