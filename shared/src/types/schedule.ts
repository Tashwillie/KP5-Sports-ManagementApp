export interface Event {
  id: string;
  title: string;
  description?: string;
  type: EventType;
  category: EventCategory;
  startDate: Date;
  endDate: Date;
  startTime: Date; // Alias for startDate for compatibility
  endTime: Date; // Alias for endDate for compatibility
  allDay: boolean;
  location: EventLocation;
  organizerId: string;
  clubId: string;
  teamIds: string[];
  playerIds: string[];
  maxAttendees?: number;
  maxParticipants?: number; // Alias for maxAttendees
  minAttendees?: number;
  status: EventStatus;
  priority: EventPriority;
  color: string;
  recurring: RecurringEvent;
  recurrence?: EventRecurrence; // Simplified recurrence for compatibility
  attendees: EventAttendee[];
  reminders: EventReminder[];
  attachments: EventAttachment[];
  notes?: string;
  isPublic?: boolean;
  requiresRSVP?: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isActive: boolean;
}

export type EventType = 
  | 'game'
  | 'practice'
  | 'tournament'
  | 'meeting'
  | 'tryout'
  | 'training'
  | 'scrimmage'
  | 'team_building'
  | 'social'
  | 'other';

export type EventCategory = 
  | 'team_event'
  | 'club_event'
  | 'league_event'
  | 'tournament_event'
  | 'personal'
  | 'administrative';

export type EventStatus = 
  | 'draft'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'postponed';

export type EventPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent';

export interface EventLocation {
  name: string;
  address: string | {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  venueType?: 'field' | 'gym' | 'office' | 'home' | 'other';
  facilities?: string[];
  notes?: string;
}

export interface RecurringEvent {
  isRecurring: boolean;
  pattern: RecurringPattern;
  endDate?: Date;
  maxOccurrences?: number;
  exceptions: Date[]; // Dates to exclude from recurring pattern
}

export interface EventRecurrence {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  endDate?: Date;
  maxOccurrences?: number;
}

export type RecurringPattern = 
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'yearly';

export interface EventAttendee {
  userId: string;
  status: AttendeeStatus;
  role: AttendeeRole;
  respondedAt?: Date;
  notes?: string;
  rsvpNotes?: string;
}

export interface EventParticipant {
  id: string;
  eventId: string;
  userId: string;
  teamId: string;
  status: 'invited' | 'confirmed' | 'declined' | 'maybe';
  response: 'pending' | 'accepted' | 'declined' | 'maybe';
  notes?: string;
  joinedAt: Date;
  isActive: boolean;
}

export type AttendeeStatus = 
  | 'confirmed'
  | 'declined'
  | 'pending'
  | 'maybe'
  | 'no_response';

export type AttendeeRole = 
  | 'player'
  | 'coach'
  | 'parent'
  | 'referee'
  | 'spectator'
  | 'organizer';

export interface EventReminder {
  id: string;
  type: ScheduleReminderType;
  timeBeforeEvent: number; // minutes
  message: string;
  sent: boolean;
  sentAt?: Date;
  recipients: string[]; // User IDs
}

export type ScheduleReminderType = 
  | 'email'
  | 'push'
  | 'sms'
  | 'in_app';

export interface EventAttachment {
  id: string;
  name: string;
  url: string;
  type: 'document' | 'image' | 'video' | 'other';
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface Schedule {
  id: string;
  clubId: string;
  teamId?: string;
  name: string;
  description?: string;
  season: string;
  events: string[]; // Event IDs
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isActive: boolean;
}

export interface CalendarView {
  id: string;
  userId: string;
  name: string;
  type: CalendarViewType;
  filters: CalendarFilter[];
  colorScheme: CalendarColorScheme;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CalendarViewType = 
  | 'month'
  | 'week'
  | 'day'
  | 'agenda'
  | 'list';

export interface CalendarFilter {
  type: 'event_type' | 'team' | 'club' | 'status' | 'priority';
  value: string;
  enabled: boolean;
}

export interface CalendarColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface CalendarSettings {
  id: string;
  userId: string;
  defaultView: CalendarViewType;
  startDay: 'monday' | 'sunday';
  timeFormat: '12h' | '24h';
  dateFormat: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  reminderDefaults: {
    defaultReminderTime: number; // minutes
    defaultReminderType: ScheduleReminderType;
  };
  syncSettings: {
    syncWithGoogle: boolean;
    syncWithOutlook: boolean;
    syncWithApple: boolean;
  };
  updatedAt: Date;
}

export interface EventTemplate {
  id: string;
  name: string;
  description?: string;
  type: EventType;
  category: EventCategory;
  duration: number; // minutes
  location?: EventLocation;
  defaultReminders: EventReminder[];
  defaultAttendees: string[]; // User IDs
  color: string;
  isPublic: boolean;
  clubId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventConflict {
  eventId: string;
  conflictingEventId: string;
  conflictType: 'time_overlap' | 'location_conflict' | 'attendee_conflict';
  severity: 'low' | 'medium' | 'high';
  description: string;
  detectedAt: Date;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface EventStatistics {
  eventId: string;
  totalInvited: number;
  totalConfirmed: number;
  totalDeclined: number;
  totalPending: number;
  attendanceRate: number; // percentage
  averageResponseTime: number; // minutes
  reminderSentCount: number;
  reminderOpenRate: number; // percentage
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarExport {
  id: string;
  userId: string;
  format: 'ics' | 'csv' | 'json';
  dateRange: {
    start: Date;
    end: Date;
  };
  filters: CalendarFilter[];
  includeAttachments: boolean;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  expiresAt: Date;
  createdAt: Date;
  completedAt?: Date;
} 