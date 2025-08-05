import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  QueryConstraint,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../firebase';
import { Event, EventType, EventStatus, EventRecurrence, EventParticipant } from '../../../../shared/src/types';

export class EventService {
  private static eventsCollection = collection(db, 'events');
  private static eventParticipantsCollection = collection(db, 'event_participants');

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

      const docRef = await addDoc(this.eventsCollection, {
        ...event,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating event:', error);
      throw new Error('Failed to create event');
    }
  }

  static async getEvent(eventId: string): Promise<Event | null> {
    try {
      const docRef = doc(this.eventsCollection, eventId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          startTime: data.startTime?.toDate() || new Date(),
          endTime: data.endTime?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Event;
      }

      return null;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw new Error('Failed to fetch event');
    }
  }

  static async updateEvent(eventId: string, updates: Partial<Event>): Promise<void> {
    try {
      const docRef = doc(this.eventsCollection, eventId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating event:', error);
      throw new Error('Failed to update event');
    }
  }

  static async deleteEvent(eventId: string): Promise<void> {
    try {
      const docRef = doc(this.eventsCollection, eventId);
      await deleteDoc(docRef);
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
      const constraints: QueryConstraint[] = [
        where('teamIds', 'array-contains', teamId),
        where('isActive', '==', true),
        orderBy('startTime', 'asc')
      ];

      if (filters?.type) {
        constraints.push(where('type', '==', filters.type));
      }

      if (filters?.status) {
        constraints.push(where('status', '==', filters.status));
      }

      if (filters?.startDate) {
        constraints.push(where('startTime', '>=', filters.startDate));
      }

      if (filters?.endDate) {
        constraints.push(where('endTime', '<=', filters.endDate));
      }

      if (filters?.limit) {
        constraints.push(limit(filters.limit));
      }

      const q = query(this.eventsCollection, ...constraints);
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startTime: data.startTime?.toDate() || new Date(),
          endTime: data.endTime?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Event;
      });
    } catch (error) {
      console.error('Error fetching events by team:', error);
      throw new Error('Failed to fetch events');
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
      const constraints: QueryConstraint[] = [
        where('clubId', '==', clubId),
        where('isActive', '==', true),
        orderBy('startTime', 'asc')
      ];

      if (filters?.type) {
        constraints.push(where('type', '==', filters.type));
      }

      if (filters?.status) {
        constraints.push(where('status', '==', filters.status));
      }

      if (filters?.startDate) {
        constraints.push(where('startTime', '>=', filters.startDate));
      }

      if (filters?.endDate) {
        constraints.push(where('endTime', '<=', filters.endDate));
      }

      if (filters?.limit) {
        constraints.push(limit(filters.limit));
      }

      const q = query(this.eventsCollection, ...constraints);
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startTime: data.startTime?.toDate() || new Date(),
          endTime: data.endTime?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Event;
      });
    } catch (error) {
      console.error('Error fetching events by club:', error);
      throw new Error('Failed to fetch events');
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

  // Event Participants
  static async addEventParticipant(eventId: string, participantData: Omit<EventParticipant, 'id'>): Promise<string> {
    try {
      const participant: Omit<EventParticipant, 'id'> = {
        eventId,
        userId: participantData.userId,
        teamId: participantData.teamId,
        status: participantData.status || 'invited',
        response: participantData.response || 'pending',
        notes: participantData.notes || '',
        joinedAt: new Date(),
        isActive: true,
      };

      const docRef = await addDoc(this.eventParticipantsCollection, {
        ...participant,
        joinedAt: serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Error adding event participant:', error);
      throw new Error('Failed to add event participant');
    }
  }

  static async updateEventParticipant(eventId: string, userId: string, updates: Partial<EventParticipant>): Promise<void> {
    try {
      const participantQuery = query(
        this.eventParticipantsCollection,
        where('eventId', '==', eventId),
        where('userId', '==', userId)
      );
      const participantSnapshot = await getDocs(participantQuery);
      
      if (!participantSnapshot.empty) {
        const participantDoc = participantSnapshot.docs[0];
        await updateDoc(doc(this.eventParticipantsCollection, participantDoc.id), {
          ...updates,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error updating event participant:', error);
      throw new Error('Failed to update event participant');
    }
  }

  static async getEventParticipants(eventId: string): Promise<EventParticipant[]> {
    try {
      const q = query(
        this.eventParticipantsCollection,
        where('eventId', '==', eventId),
        where('isActive', '==', true),
        orderBy('joinedAt', 'asc')
      );
      
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          joinedAt: data.joinedAt?.toDate() || new Date(),
        } as EventParticipant;
      });
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
      let currentDate = new Date(baseEvent.startTime || new Date());

      for (let i = 0; i < occurrences; i++) {
        const eventData = {
          ...baseEvent,
          startTime: new Date(currentDate),
          endTime: new Date(currentDate.getTime() + (baseEvent.endTime!.getTime() - baseEvent.startTime!.getTime())),
          recurrence: i === 0 ? recurrence : null, // Only first event has recurrence info
        };

        const eventId = await this.createEvent(eventData);
        eventIds.push(eventId);

        // Calculate next occurrence
        switch (recurrence.frequency) {
          case 'daily':
            currentDate.setDate(currentDate.getDate() + recurrence.interval);
            break;
          case 'weekly':
            currentDate.setDate(currentDate.getDate() + (7 * recurrence.interval));
            break;
          case 'monthly':
            currentDate.setMonth(currentDate.getMonth() + recurrence.interval);
            break;
        }
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
      console.error('Error fetching calendar events:', error);
      throw new Error('Failed to fetch calendar events');
    }
  }

  // Real-time subscriptions
  static subscribeToTeamEvents(teamId: string, callback: (events: Event[]) => void): () => void {
    const q = query(
      this.eventsCollection,
      where('teamIds', 'array-contains', teamId),
      where('isActive', '==', true),
      orderBy('startTime', 'asc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const events = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startTime: data.startTime?.toDate() || new Date(),
          endTime: data.endTime?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Event;
      });
      callback(events);
    });
  }

  static subscribeToEvent(eventId: string, callback: (event: Event | null) => void): () => void {
    const docRef = doc(this.eventsCollection, eventId);
    
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const event: Event = {
          id: doc.id,
          ...data,
          startTime: data.startTime?.toDate() || new Date(),
          endTime: data.endTime?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Event;
        callback(event);
      } else {
        callback(null);
      }
    });
  }

  // Utility methods
  static getEventTypeDisplayName(type: EventType): string {
    const typeNames: Record<EventType, string> = {
      'practice': 'Practice',
      'game': 'Game',
      'tournament': 'Tournament',
      'meeting': 'Meeting',
      'tryout': 'Tryout',
      'training': 'Training',
      'scrimmage': 'Scrimmage',
      'team_building': 'Team Building',
      'other': 'Other',
    };
    return typeNames[type] || type;
  }

  static getEventStatusDisplayName(status: EventStatus): string {
    const statusNames: Record<EventStatus, string> = {
      'scheduled': 'Scheduled',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'postponed': 'Postponed',
    };
    return statusNames[status] || status;
  }

  static getEventTypeColor(type: EventType): string {
    const colors: Record<EventType, string> = {
      'practice': 'bg-blue-100 text-blue-800',
      'game': 'bg-green-100 text-green-800',
      'tournament': 'bg-purple-100 text-purple-800',
      'meeting': 'bg-gray-100 text-gray-800',
      'tryout': 'bg-yellow-100 text-yellow-800',
      'training': 'bg-indigo-100 text-indigo-800',
      'scrimmage': 'bg-orange-100 text-orange-800',
      'team_building': 'bg-pink-100 text-pink-800',
      'other': 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  }

  static formatEventTime(startTime: Date, endTime: Date): string {
    const start = startTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    const end = endTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    return `${start} - ${end}`;
  }

  static formatEventDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
} 