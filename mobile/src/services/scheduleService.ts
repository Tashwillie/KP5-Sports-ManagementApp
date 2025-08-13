// Schedule service for PostgreSQL backend - Firebase removed
import { 
  Event, 
  EventType, 
  EventCategory, 
  EventStatus, 
  EventPriority, 
  EventAttendee, 
  AttendeeStatus, 
  AttendeeRole,
  EventLocation,
  EventReminder,
  EventAttachment,
  EventRecurrence,
  RecurringEvent
} from '../../../shared/src/types/schedule';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class ScheduleService {
  private static instance: ScheduleService;
  private baseURL: string;
  private token: string | null = null;

  public static getInstance(): ScheduleService {
    if (!ScheduleService.instance) {
      ScheduleService.instance = new ScheduleService();
    }
    return ScheduleService.instance;
  }

  constructor() {
    this.baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';
    this.loadToken();
  }

  private async loadToken(): Promise<void> {
    try {
      this.token = await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error loading token:', error);
    }
  }

  private async setToken(token: string): Promise<void> {
    try {
      this.token = token;
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  }

  private async clearToken(): Promise<void> {
    try {
      this.token = null;
      await AsyncStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Event Management
  async getEvent(eventId: string): Promise<Event> {
    return this.makeRequest<Event>(`/events/${eventId}`);
  }

  async getEvents(params?: Record<string, any>): Promise<Event[]> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    const response = await this.makeRequest<{ data: Event[] }>(`/events${queryString}`);
    return response.data || [];
  }

  async getEventsByUser(userId: string): Promise<Event[]> {
    return this.makeRequest<Event[]>(`/events?userId=${userId}`);
  }

  async getEventsByTeam(teamId: string): Promise<Event[]> {
    return this.makeRequest<Event[]>(`/events?teamId=${teamId}`);
  }

  async getEventsByClub(clubId: string): Promise<Event[]> {
    return this.makeRequest<Event[]>(`/events?clubId=${clubId}`);
  }

  async createEvent(eventData: Partial<Event>): Promise<Event> {
    return this.makeRequest<Event>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateEvent(eventId: string, eventData: Partial<Event>): Promise<Event> {
    return this.makeRequest<Event>(`/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(eventId: string): Promise<void> {
    await this.makeRequest(`/events/${eventId}`, {
      method: 'DELETE',
    });
  }

  // RSVP Management
  async respondToEvent(eventId: string, userId: string, status: AttendeeStatus, notes?: string): Promise<void> {
    await this.makeRequest(`/events/${eventId}/rsvp`, {
      method: 'POST',
      body: JSON.stringify({ userId, status, notes }),
    });
  }

  async addAttendeeToEvent(eventId: string, attendee: {
    userId: string;
    role: AttendeeRole;
  }): Promise<void> {
    await this.makeRequest(`/events/${eventId}/attendees`, {
      method: 'POST',
      body: JSON.stringify(attendee),
    });
  }

  async removeAttendeeFromEvent(eventId: string, userId: string): Promise<void> {
    await this.makeRequest(`/events/${eventId}/attendees/${userId}`, {
      method: 'DELETE',
    });
  }

  // Real-time Event Listeners (simplified for API-based approach)
  subscribeToEventsByClub(clubId: string, callback: (events: Event[]) => void): () => void {
    // For API-based approach, we'll use polling instead of real-time subscriptions
    const interval = setInterval(async () => {
      try {
        const events = await this.getEventsByClub(clubId);
        callback(events);
      } catch (error) {
        console.error('Error in club events subscription:', error);
        callback([]);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }

  subscribeToEventsByUser(userId: string, callback: (events: Event[]) => void): () => void {
    // For API-based approach, we'll use polling instead of real-time subscriptions
    const interval = setInterval(async () => {
      try {
        const events = await this.getEventsByUser(userId);
        callback(events);
      } catch (error) {
        console.error('Error in user events subscription:', error);
        callback([]);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }

  subscribeToEvent(eventId: string, callback: (event: Event | null) => void): () => void {
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

  // File Upload for Event Attachments
  async uploadEventAttachment(eventId: string, file: File, uploadedBy: string): Promise<{
    id: string;
    url: string;
    name: string;
    type: 'document' | 'image' | 'video' | 'other';
    size: number;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadedBy', uploadedBy);

    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}/events/${eventId}/attachments`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error uploading event attachment:', error);
      throw new Error('Failed to upload attachment');
    }
  }

  private getFileType(extension?: string): 'document' | 'image' | 'video' | 'other' {
    if (!extension) return 'other';
    
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv'];
    const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
    
    const ext = extension.toLowerCase();
    
    if (imageExtensions.includes(ext)) return 'image';
    if (videoExtensions.includes(ext)) return 'video';
    if (documentExtensions.includes(ext)) return 'document';
    
    return 'other';
  }
} 