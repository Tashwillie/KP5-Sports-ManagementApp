export interface Club {
  id: string;
  name: string;
  description: string;
  logoURL: string;
  bannerURL: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
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
  stats: TeamStats;
  schedule: {
    practices: string[]; // Event IDs
    games: string[]; // Event IDs
  };
  settings: TeamSettings;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User ID
  isActive: boolean;
}

export interface TeamStats {
  wins: number;
  losses: number;
  draws: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  matchesPlayed: number;
}

export interface TeamSettings {
  isPublic: boolean;
  allowJoinRequests: boolean;
  requireApproval: boolean;
  maxPlayers: number;
  maxCoaches: number;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  position: string; // e.g., "Forward", "Defender", "Goalkeeper"
  jerseyNumber?: number;
  joinedAt: Date;
  isActive: boolean;
}

export type TeamRole = 'player' | 'coach' | 'manager';

export interface TeamInvitation {
  id: string;
  teamId: string;
  email: string;
  role: TeamRole;
  position?: string;
  invitedBy: string; // User ID
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expiresAt: Date;
  createdAt: Date;
  acceptedAt?: Date;
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