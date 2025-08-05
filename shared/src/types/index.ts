// Re-export all types for convenience
export * from './auth';
export * from './club';
export * from './player';
export * from './tournament';
export * from './communication';
export * from './registration';
export * from './payment';
export * from './forms';
export * from './media';
export * from './schedule';
export * from './admin';
export * from './public';
export * from './match';

// User and Authentication Types
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  role: UserRole;
  clubId?: string;
  teamIds: string[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  preferences: UserPreferences;
}

export type UserRole = 
  | 'super_admin'
  | 'club_admin'
  | 'coach'
  | 'player'
  | 'parent'
  | 'referee';

export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  language: string;
  timezone: string;
}

// Club and Team Types
export interface Club {
  id: string;
  name: string;
  description: string;
  logoURL: string;
  bannerURL: string;
  address: Address;
  contact: {
    email: string;
    phone: string;
    website: string;
  };
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  settings: {
    isPublic: boolean;
    allowRegistration: boolean;
    requireApproval: boolean;
    maxTeams: number;
    maxPlayersPerTeam: number;
  };
  stats: {
    totalTeams: number;
    totalPlayers: number;
    totalCoaches: number;
    totalMatches: number;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User ID
  isActive: boolean;
}

export interface Team {
  id: string;
  clubId: string;
  name: string;
  description: string;
  logoURL: string;
  jerseyColors: {
    primary: string;
    secondary: string;
  };
  ageGroup: {
    minAge: number;
    maxAge: number;
    category: string; // e.g., "U12", "U14", "Senior"
  };
  division: string; // e.g., "Premier", "Division 1", "Recreation"
  season: string; // e.g., "2024 Spring", "2024 Fall"
  roster: {
    players: string[]; // User IDs
    coaches: string[]; // User IDs
    managers: string[]; // User IDs
  };
  stats: {
    wins: number;
    losses: number;
    draws: number;
    goalsFor: number;
    goalsAgainst: number;
    points: number;
  };
  schedule: {
    practices: string[]; // Event IDs
    games: string[]; // Event IDs
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User ID
  isActive: boolean;
}

export interface ClubMember {
  id: string;
  clubId: string;
  userId: string;
  role: ClubRole;
  teamIds: string[]; // Teams they belong to within the club
  permissions: ClubPermission[];
  joinedAt: Date;
  isActive: boolean;
}

export type ClubRole = 
  | 'owner'
  | 'admin'
  | 'coach'
  | 'player'
  | 'parent'
  | 'referee'
  | 'spectator';

export type ClubPermission = 
  | 'manage_club'
  | 'manage_teams'
  | 'manage_players'
  | 'manage_schedule'
  | 'view_analytics'
  | 'send_notifications'
  | 'manage_payments'
  | 'view_roster'
  | 'edit_profile';

export interface ClubInvitation {
  id: string;
  clubId: string;
  teamId?: string; // Optional, if inviting to specific team
  email: string;
  role: ClubRole;
  invitedBy: string; // User ID
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expiresAt: Date;
  createdAt: Date;
  acceptedAt?: Date;
}

export interface ClubSettings {
  id: string;
  clubId: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    showRoster: boolean;
    showSchedule: boolean;
    showStats: boolean;
    allowPublicRegistration: boolean;
  };
  features: {
    enablePayments: boolean;
    enableTournaments: boolean;
    enableAnalytics: boolean;
    enableMessaging: boolean;
  };
  updatedAt: Date;
  updatedBy: string; // User ID
}

// Player Types
export interface Player {
  id: string;
  userId: string;
  teamId: string;
  jerseyNumber: number;
  position: PlayerPosition;
  dateOfBirth: Date;
  height?: number;
  weight?: number;
  emergencyContact: EmergencyContact;
  medicalInfo: MedicalInfo;
  stats: PlayerStats;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export type PlayerPosition = 
  | 'goalkeeper'
  | 'defender'
  | 'midfielder'
  | 'forward'
  | 'utility';

export interface PlayerStats {
  gamesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
}

// Event and Scheduling Types
export interface Event {
  id: string;
  title: string;
  description?: string;
  type: EventType;
  startDate: Date;
  endDate: Date;
  location: Location;
  teamIds: string[];
  playerIds: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  status: EventStatus;
  attendees: EventAttendee[];
  reminders: EventReminder[];
}

export type EventType = 
  | 'game'
  | 'practice'
  | 'tournament'
  | 'meeting'
  | 'tryout'
  | 'other';

export type EventStatus = 
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'postponed';

export interface EventAttendee {
  userId: string;
  status: 'confirmed' | 'declined' | 'pending' | 'maybe';
  respondedAt?: Date;
  notes?: string;
}

export interface EventReminder {
  type: 'email' | 'push' | 'sms';
  timeBeforeEvent: number; // minutes
  sent: boolean;
  sentAt?: Date;
}

// Tournament and League Types
export interface Tournament {
  id: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location: Location;
  teams: TournamentTeam[];
  brackets: TournamentBracket[];
  status: TournamentStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TournamentStatus = 
  | 'registration'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface TournamentTeam {
  teamId: string;
  seed?: number;
  group?: string;
  eliminated: boolean;
  finalPosition?: number;
}

export interface TournamentBracket {
  id: string;
  name: string;
  type: 'single_elimination' | 'double_elimination' | 'round_robin';
  matches: TournamentMatch[];
}

export interface TournamentMatch {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore?: number;
  awayScore?: number;
  scheduledTime?: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  winnerId?: string;
  notes?: string;
}

// Communication Types
export interface Message {
  id: string;
  senderId: string;
  recipientIds: string[];
  type: MessageType;
  content: string;
  attachments: MessageAttachment[];
  readBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type MessageType = 
  | 'direct'
  | 'team'
  | 'club'
  | 'announcement'
  | 'system';

export interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'video';
  size: number;
}

// Registration and Payment Types
export interface Registration {
  id: string;
  playerId: string;
  teamId: string;
  season: string;
  status: RegistrationStatus;
  formData: Record<string, any>;
  waivers: Waiver[];
  paymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type RegistrationStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'waitlist'
  | 'cancelled';

export interface Waiver {
  id: string;
  name: string;
  content: string;
  signed: boolean;
  signedAt?: Date;
  signedBy?: string;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  description: string;
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  invoiceUrl?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'refunded';

// Utility Types
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface ContactInfo {
  email: string;
  phone?: string;
  website?: string;
}

export interface Location {
  name: string;
  address: Address;
  facilities?: string[];
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface MedicalInfo {
  allergies: string[];
  medications: string[];
  conditions: string[];
  emergencyNotes?: string;
}

export type Sport = 
  | 'soccer'
  | 'basketball'
  | 'baseball'
  | 'football'
  | 'volleyball'
  | 'tennis'
  | 'swimming'
  | 'track'
  | 'other';

export type AgeGroup = 
  | 'u6'
  | 'u8'
  | 'u10'
  | 'u12'
  | 'u14'
  | 'u16'
  | 'u18'
  | 'adult';

export type Gender = 
  | 'male'
  | 'female'
  | 'coed';

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Firebase Types
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

export type NotificationType = 
  | 'event_reminder'
  | 'message'
  | 'registration_update'
  | 'payment_reminder'
  | 'team_update'
  | 'system';

// Export all types
export * from './auth';
export * from './club';
export * from './forms';
export * from './player';
export * from './schedule';
export * from './tournament';
export * from './communication';
export * from './registration';
export * from './payment';
export * from './media';
export * from './public';
export * from './admin';
export * from './match';

// Alias for backward compatibility
export type Match = LiveMatch; 