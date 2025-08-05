import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  writeBatch,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../shared/src/utils/firebase';
import {
  Event,
  Schedule,
  EventTemplate,
  CalendarSettings,
  CalendarView,
  EventConflict,
  EventStatistics,
  CalendarExport,
  EventType,
  EventStatus,
  AttendeeStatus,
  CalendarViewType,
  ReminderType,
} from '../../shared/src/types';

export class ScheduleService {
  private static instance: ScheduleService;

  static getInstance(): ScheduleService {
    if (!ScheduleService.instance) {
      ScheduleService.instance = new ScheduleService();
    }
    return ScheduleService.instance;
  }

  // Event Management
  async createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const eventRef = await addDoc(collection(db, 'events'), {
        ...eventData,
        startDate: Timestamp.fromDate(eventData.startDate),
        endDate: Timestamp.fromDate(eventData.endDate),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return eventRef.id;
    } catch (error) {
      console.error('Error creating event:', error);
      throw new Error('Failed to create event');
    }
  }

  async getEvent(eventId: string): Promise<Event | null> {
    try {
      const eventDoc = await getDoc(doc(db, 'events', eventId));
      if (eventDoc.exists()) {
        const data = eventDoc.data();
        return {
          ...data,
          id: eventDoc.id,
          startDate: data.startDate.toDate(),
          endDate: data.endDate.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Event;
      }
      return null;
    } catch (error) {
      console.error('Error getting event:', error);
      throw new Error('Failed to get event');
    }
  }

  async updateEvent(eventId: string, updates: Partial<Event>): Promise<void> {
    try {
      const updateData: any = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      if (updates.startDate) {
        updateData.startDate = Timestamp.fromDate(updates.startDate);
      }
      if (updates.endDate) {
        updateData.endDate = Timestamp.fromDate(updates.endDate);
      }

      await updateDoc(doc(db, 'events', eventId), updateData);
    } catch (error) {
      console.error('Error updating event:', error);
      throw new Error('Failed to update event');
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'events', eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
      throw new Error('Failed to delete event');
    }
  }

  async getEventsByClub(clubId: string, filters?: {
    type?: EventType;
    status?: EventStatus;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Event[]> {
    try {
      let q = query(
        collection(db, 'events'),
        where('clubId', '==', clubId),
        where('isActive', '==', true),
        orderBy('startDate', 'asc')
      );

      if (filters?.type) {
        q = query(q, where('type', '==', filters.type));
      }
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters?.startDate) {
        q = query(q, where('startDate', '>=', Timestamp.fromDate(filters.startDate)));
      }
      if (filters?.endDate) {
        q = query(q, where('endDate', '<=', Timestamp.fromDate(filters.endDate)));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          startDate: data.startDate.toDate(),
          endDate: data.endDate.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Event;
      });
    } catch (error) {
      console.error('Error getting events by club:', error);
      throw new Error('Failed to get events');
    }
  }

  async getEventsByTeam(teamId: string, filters?: {
    type?: EventType;
    status?: EventStatus;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Event[]> {
    try {
      let q = query(
        collection(db, 'events'),
        where('teamIds', 'array-contains', teamId),
        where('isActive', '==', true),
        orderBy('startDate', 'asc')
      );

      if (filters?.type) {
        q = query(q, where('type', '==', filters.type));
      }
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters?.startDate) {
        q = query(q, where('startDate', '>=', Timestamp.fromDate(filters.startDate)));
      }
      if (filters?.endDate) {
        q = query(q, where('endDate', '<=', Timestamp.fromDate(filters.endDate)));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          startDate: data.startDate.toDate(),
          endDate: data.endDate.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Event;
      });
    } catch (error) {
      console.error('Error getting events by team:', error);
      throw new Error('Failed to get events');
    }
  }

  async getEventsByUser(userId: string, filters?: {
    type?: EventType;
    status?: EventStatus;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Event[]> {
    try {
      let q = query(
        collection(db, 'events'),
        where('attendees', 'array-contains', { userId, status: 'confirmed' }),
        where('isActive', '==', true),
        orderBy('startDate', 'asc')
      );

      if (filters?.type) {
        q = query(q, where('type', '==', filters.type));
      }
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters?.startDate) {
        q = query(q, where('startDate', '>=', Timestamp.fromDate(filters.startDate)));
      }
      if (filters?.endDate) {
        q = query(q, where('endDate', '<=', Timestamp.fromDate(filters.endDate)));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          startDate: data.startDate.toDate(),
          endDate: data.endDate.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Event;
      });
    } catch (error) {
      console.error('Error getting events by user:', error);
      throw new Error('Failed to get events');
    }
  }

  // RSVP Management
  async respondToEvent(eventId: string, userId: string, status: AttendeeStatus, notes?: string): Promise<void> {
    try {
      const eventRef = doc(db, 'events', eventId);
      const eventDoc = await getDoc(eventRef);
      
      if (!eventDoc.exists()) {
        throw new Error('Event not found');
      }

      const event = eventDoc.data() as Event;
      const attendeeIndex = event.attendees.findIndex(a => a.userId === userId);
      
      if (attendeeIndex === -1) {
        throw new Error('User not invited to this event');
      }

      const updatedAttendees = [...event.attendees];
      updatedAttendees[attendeeIndex] = {
        ...updatedAttendees[attendeeIndex],
        status,
        respondedAt: new Date(),
        rsvpNotes: notes,
      };

      await updateDoc(eventRef, {
        attendees: updatedAttendees,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error responding to event:', error);
      throw new Error('Failed to respond to event');
    }
  }

  async addAttendeeToEvent(eventId: string, attendee: {
    userId: string;
    role: 'player' | 'coach' | 'parent' | 'referee' | 'spectator' | 'organizer';
  }): Promise<void> {
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        attendees: arrayUnion({
          userId: attendee.userId,
          status: 'pending',
          role: attendee.role,
          respondedAt: null,
          notes: '',
          rsvpNotes: '',
        }),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error adding attendee to event:', error);
      throw new Error('Failed to add attendee');
    }
  }

  async removeAttendeeFromEvent(eventId: string, userId: string): Promise<void> {
    try {
      const eventRef = doc(db, 'events', eventId);
      const eventDoc = await getDoc(eventRef);
      
      if (!eventDoc.exists()) {
        throw new Error('Event not found');
      }

      const event = eventDoc.data() as Event;
      const updatedAttendees = event.attendees.filter(a => a.userId !== userId);

      await updateDoc(eventRef, {
        attendees: updatedAttendees,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error removing attendee from event:', error);
      throw new Error('Failed to remove attendee');
    }
  }

  // Schedule Management
  async createSchedule(scheduleData: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const scheduleRef = await addDoc(collection(db, 'schedules'), {
        ...scheduleData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return scheduleRef.id;
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw new Error('Failed to create schedule');
    }
  }

  async getSchedule(scheduleId: string): Promise<Schedule | null> {
    try {
      const scheduleDoc = await getDoc(doc(db, 'schedules', scheduleId));
      if (scheduleDoc.exists()) {
        const data = scheduleDoc.data();
        return {
          ...data,
          id: scheduleDoc.id,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Schedule;
      }
      return null;
    } catch (error) {
      console.error('Error getting schedule:', error);
      throw new Error('Failed to get schedule');
    }
  }

  async updateSchedule(scheduleId: string, updates: Partial<Schedule>): Promise<void> {
    try {
      await updateDoc(doc(db, 'schedules', scheduleId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw new Error('Failed to update schedule');
    }
  }

  async deleteSchedule(scheduleId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'schedules', scheduleId));
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw new Error('Failed to delete schedule');
    }
  }

  async getSchedulesByClub(clubId: string): Promise<Schedule[]> {
    try {
      const q = query(
        collection(db, 'schedules'),
        where('clubId', '==', clubId),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Schedule;
      });
    } catch (error) {
      console.error('Error getting schedules by club:', error);
      throw new Error('Failed to get schedules');
    }
  }

  // Event Templates
  async createEventTemplate(templateData: Omit<EventTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const templateRef = await addDoc(collection(db, 'eventTemplates'), {
        ...templateData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return templateRef.id;
    } catch (error) {
      console.error('Error creating event template:', error);
      throw new Error('Failed to create event template');
    }
  }

  async getEventTemplatesByClub(clubId: string): Promise<EventTemplate[]> {
    try {
      const q = query(
        collection(db, 'eventTemplates'),
        where('clubId', '==', clubId),
        orderBy('name', 'asc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as EventTemplate;
      });
    } catch (error) {
      console.error('Error getting event templates:', error);
      throw new Error('Failed to get event templates');
    }
  }

  // Calendar Settings
  async getCalendarSettings(userId: string): Promise<CalendarSettings | null> {
    try {
      const q = query(
        collection(db, 'calendarSettings'),
        where('userId', '==', userId),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        return {
          ...data,
          id: querySnapshot.docs[0].id,
          updatedAt: data.updatedAt.toDate(),
        } as CalendarSettings;
      }
      return null;
    } catch (error) {
      console.error('Error getting calendar settings:', error);
      throw new Error('Failed to get calendar settings');
    }
  }

  async updateCalendarSettings(userId: string, settings: Partial<CalendarSettings>): Promise<void> {
    try {
      const q = query(
        collection(db, 'calendarSettings'),
        where('userId', '==', userId),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        await updateDoc(doc(db, 'calendarSettings', querySnapshot.docs[0].id), {
          ...settings,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'calendarSettings'), {
          userId,
          ...settings,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error updating calendar settings:', error);
      throw new Error('Failed to update calendar settings');
    }
  }

  // Real-time Event Listeners
  subscribeToEventsByClub(clubId: string, callback: (events: Event[]) => void): () => void {
    const q = query(
      collection(db, 'events'),
      where('clubId', '==', clubId),
      where('isActive', '==', true),
      orderBy('startDate', 'asc')
    );

    return onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const events = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          startDate: data.startDate.toDate(),
          endDate: data.endDate.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Event;
      });
      callback(events);
    });
  }

  subscribeToEventsByTeam(teamId: string, callback: (events: Event[]) => void): () => void {
    const q = query(
      collection(db, 'events'),
      where('teamIds', 'array-contains', teamId),
      where('isActive', '==', true),
      orderBy('startDate', 'asc')
    );

    return onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const events = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          startDate: data.startDate.toDate(),
          endDate: data.endDate.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Event;
      });
      callback(events);
    });
  }

  // Event Conflict Detection
  async detectEventConflicts(eventId: string): Promise<EventConflict[]> {
    try {
      const event = await this.getEvent(eventId);
      if (!event) {
        throw new Error('Event not found');
      }

      const conflicts: EventConflict[] = [];

      // Check for time overlaps
      const timeOverlapQuery = query(
        collection(db, 'events'),
        where('clubId', '==', event.clubId),
        where('isActive', '==', true),
        where('startDate', '<', Timestamp.fromDate(event.endDate)),
        where('endDate', '>', Timestamp.fromDate(event.startDate))
      );

      const timeOverlapSnapshot = await getDocs(timeOverlapQuery);
      timeOverlapSnapshot.docs.forEach(doc => {
        if (doc.id !== eventId) {
          conflicts.push({
            eventId,
            conflictingEventId: doc.id,
            conflictType: 'time_overlap',
            severity: 'high',
            description: 'Time overlap detected',
            detectedAt: new Date(),
            resolved: false,
          });
        }
      });

      // Check for location conflicts
      if (event.location.name) {
        const locationConflictQuery = query(
          collection(db, 'events'),
          where('clubId', '==', event.clubId),
          where('location.name', '==', event.location.name),
          where('isActive', '==', true),
          where('startDate', '<', Timestamp.fromDate(event.endDate)),
          where('endDate', '>', Timestamp.fromDate(event.startDate))
        );

        const locationConflictSnapshot = await getDocs(locationConflictQuery);
        locationConflictSnapshot.docs.forEach(doc => {
          if (doc.id !== eventId) {
            conflicts.push({
              eventId,
              conflictingEventId: doc.id,
              conflictType: 'location_conflict',
              severity: 'medium',
              description: 'Location conflict detected',
              detectedAt: new Date(),
              resolved: false,
            });
          }
        });
      }

      return conflicts;
    } catch (error) {
      console.error('Error detecting event conflicts:', error);
      throw new Error('Failed to detect event conflicts');
    }
  }

  // Event Statistics
  async getEventStatistics(eventId: string): Promise<EventStatistics | null> {
    try {
      const q = query(
        collection(db, 'eventStatistics'),
        where('eventId', '==', eventId),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        return {
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as EventStatistics;
      }
      return null;
    } catch (error) {
      console.error('Error getting event statistics:', error);
      throw new Error('Failed to get event statistics');
    }
  }

  // File Upload for Event Attachments
  async uploadEventAttachment(eventId: string, file: File, uploadedBy: string): Promise<{
    id: string;
    url: string;
    name: string;
    type: 'document' | 'image' | 'video' | 'other';
    size: number;
  }> {
    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${eventId}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `event-attachments/${fileName}`);

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      const attachment = {
        id: Date.now().toString(),
        name: file.name,
        url: downloadURL,
        type: this.getFileType(fileExtension),
        size: file.size,
        uploadedBy,
        uploadedAt: new Date(),
      };

      // Add attachment to event
      await updateDoc(doc(db, 'events', eventId), {
        attachments: arrayUnion(attachment),
        updatedAt: serverTimestamp(),
      });

      return attachment;
    } catch (error) {
      console.error('Error uploading event attachment:', error);
      throw new Error('Failed to upload attachment');
    }
  }

  private getFileType(extension?: string): 'document' | 'image' | 'video' | 'other' {
    if (!extension) return 'other';
    
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
    const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];

    if (imageExtensions.includes(extension)) return 'image';
    if (videoExtensions.includes(extension)) return 'video';
    if (documentExtensions.includes(extension)) return 'document';
    
    return 'other';
  }
}

export default ScheduleService.getInstance(); 