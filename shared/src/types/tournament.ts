export interface Tournament {
  id: string;
  name: string;
  description?: string;
  type: TournamentType;
  format: TournamentFormat;
  status: TournamentStatus;
  startDate: Date;
  endDate: Date;
  registrationDeadline: Date;
  maxTeams: number;
  minTeams: number;
  currentTeams: number;
  entryFee?: number;
  prizePool?: number;
  location: TournamentLocation;
  organizerId: string;
  clubId: string;
  leagueId?: string;
  rules: TournamentRule[];
  divisions: TournamentDivision[];
  brackets: TournamentBracket[];
  matches: string[]; // Match IDs
  participants: TournamentParticipant[];
  standings: TournamentStanding[];
  sponsors: TournamentSponsor[];
  media: TournamentMedia[];
  settings: TournamentSettings;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isActive: boolean;
}

export type TournamentType = 
  | 'single_elimination'
  | 'double_elimination'
  | 'round_robin'
  | 'swiss_system'
  | 'group_stage'
  | 'knockout'
  | 'league'
  | 'friendly';

export type TournamentFormat = 
  | 'individual'
  | 'team'
  | 'mixed';

export type TournamentStatus = 
  | 'draft'
  | 'registration_open'
  | 'registration_closed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'postponed';

export interface TournamentLocation {
  name: string;
  address: {
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
  venueType: 'field' | 'gym' | 'stadium' | 'complex' | 'other';
  facilities: string[];
  capacity?: number;
  notes?: string;
}

export interface TournamentRule {
  id: string;
  title: string;
  description: string;
  category: 'general' | 'sport_specific' | 'conduct' | 'eligibility';
  isRequired: boolean;
  order: number;
}

export interface TournamentDivision {
  id: string;
  name: string;
  description?: string;
  ageGroup?: {
    min: number;
    max: number;
  };
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  gender: 'male' | 'female' | 'mixed';
  maxTeams: number;
  currentTeams: number;
  teams: string[]; // Team IDs
  brackets: string[]; // Bracket IDs
  standings: TournamentStanding[];
}

export interface TournamentBracket {
  id: string;
  name: string;
  type: BracketType;
  divisionId: string;
  rounds: BracketRound[];
  matches: string[]; // Match IDs
  winner?: string; // Team/Player ID
  runnerUp?: string; // Team/Player ID
  isActive: boolean;
}

export type BracketType = 
  | 'single_elimination'
  | 'double_elimination'
  | 'round_robin'
  | 'swiss'
  | 'group';

export interface BracketRound {
  id: string;
  name: string;
  roundNumber: number;
  matches: string[]; // Match IDs
  isComplete: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface TournamentMatch {
  id: string;
  tournamentId: string;
  bracketId: string;
  roundId: string;
  matchNumber: number;
  homeTeamId: string;
  awayTeamId: string;
  homePlayerId?: string;
  awayPlayerId?: string;
  scheduledDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  status: MatchStatus;
  homeScore: number;
  awayScore: number;
  periods: MatchPeriod[];
  events: MatchEvent[];
  officials: MatchOfficial[];
  venue: MatchVenue;
  notes?: string;
  isLive: boolean;
  streamUrl?: string;
  highlights: TournamentHighlight[];
  createdAt: Date;
  updatedAt: Date;
}

export type MatchStatus = 
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'postponed'
  | 'forfeit';

export interface MatchPeriod {
  id: string;
  periodNumber: number;
  periodType: 'quarter' | 'half' | 'period' | 'set' | 'inning';
  homeScore: number;
  awayScore: number;
  startTime: Date;
  endTime?: Date;
  events: MatchEvent[];
}

export interface MatchEvent {
  id: string;
  type: MatchEventType;
  timestamp: Date;
  periodNumber: number;
  playerId?: string;
  teamId?: string;
  description: string;
  data: Record<string, any>;
  isReversed: boolean;
  reversedAt?: Date;
  reversedBy?: string;
}

export type MatchEventType = 
  | 'goal'
  | 'assist'
  | 'foul'
  | 'yellow_card'
  | 'red_card'
  | 'substitution'
  | 'timeout'
  | 'penalty'
  | 'free_kick'
  | 'corner'
  | 'throw_in'
  | 'goal_kick'
  | 'other';

export interface MatchOfficial {
  id: string;
  userId: string;
  role: 'referee' | 'assistant_referee' | 'fourth_official' | 'var' | 'timekeeper' | 'scorer';
  name: string;
  isAssigned: boolean;
  assignedAt?: Date;
}

export interface MatchVenue {
  name: string;
  fieldNumber?: number;
  courtNumber?: number;
  surface: 'grass' | 'turf' | 'hardwood' | 'concrete' | 'other';
  conditions: 'dry' | 'wet' | 'snow' | 'ice' | 'other';
  temperature?: number;
  weather?: string;
}

export interface TournamentHighlight {
  id: string;
  type: 'goal' | 'save' | 'foul' | 'moment' | 'other';
  timestamp: Date;
  description: string;
  videoUrl?: string;
  imageUrl?: string;
  duration: number; // seconds
  isPublic: boolean;
}

export interface TournamentParticipant {
  id: string;
  tournamentId: string;
  teamId?: string;
  playerId?: string;
  divisionId: string;
  registrationDate: Date;
  status: ParticipantStatus;
  seed?: number;
  groupId?: string;
  stats: ParticipantStats;
  paymentStatus: PaymentStatus;
  waiverSigned: boolean;
  waiverSignedAt?: Date;
  notes?: string;
}

export type ParticipantStatus = 
  | 'registered'
  | 'confirmed'
  | 'waitlisted'
  | 'withdrawn'
  | 'disqualified';

export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'refunded'
  | 'waived';

export interface ParticipantStats {
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  matchesDrawn: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  rank: number;
  streak: number;
  lastMatchDate?: Date;
}

export interface TournamentStanding {
  id: string;
  tournamentId: string;
  divisionId: string;
  teamId?: string;
  playerId?: string;
  position: number;
  stats: ParticipantStats;
  lastUpdated: Date;
}

export interface TournamentSponsor {
  id: string;
  name: string;
  logo: string;
  website?: string;
  sponsorshipLevel: 'platinum' | 'gold' | 'silver' | 'bronze';
  contribution: number;
  benefits: string[];
  isActive: boolean;
}

export interface TournamentMedia {
  id: string;
  type: 'photo' | 'video' | 'document';
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedAt: Date;
  isPublic: boolean;
  tags: string[];
}

export interface TournamentSettings {
  allowSubstitutions: boolean;
  maxSubstitutions: number;
  matchDuration: number; // minutes
  breakDuration: number; // minutes
  overtimeEnabled: boolean;
  overtimeDuration: number; // minutes
  penaltyShootoutEnabled: boolean;
  maxPenaltyRounds: number;
  tiebreakerRules: string[];
  seedingMethod: 'random' | 'ranking' | 'manual';
  groupSize: number;
  advancementRules: string[];
  consolationMatches: boolean;
  thirdPlaceMatch: boolean;
  liveScoring: boolean;
  publicResults: boolean;
  allowSpectators: boolean;
  maxSpectators?: number;
}

export interface League {
  id: string;
  name: string;
  description?: string;
  sport: string;
  season: string;
  status: LeagueStatus;
  startDate: Date;
  endDate: Date;
  registrationDeadline: Date;
  maxTeams: number;
  currentTeams: number;
  entryFee?: number;
  organizerId: string;
  clubId: string;
  divisions: LeagueDivision[];
  teams: LeagueTeam[];
  matches: string[]; // Match IDs
  standings: LeagueStanding[];
  rules: LeagueRule[];
  schedule: LeagueSchedule;
  playoffs?: LeaguePlayoff;
  settings: LeagueSettings;
  sponsors: LeagueSponsor[];
  media: LeagueMedia[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isActive: boolean;
}

export type LeagueStatus = 
  | 'draft'
  | 'registration_open'
  | 'registration_closed'
  | 'in_progress'
  | 'playoffs'
  | 'completed'
  | 'cancelled';

export interface LeagueDivision {
  id: string;
  name: string;
  description?: string;
  ageGroup?: {
    min: number;
    max: number;
  };
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  gender: 'male' | 'female' | 'mixed';
  maxTeams: number;
  currentTeams: number;
  teams: string[]; // Team IDs
  standings: LeagueStanding[];
}

export interface LeagueTeam {
  id: string;
  leagueId: string;
  teamId: string;
  divisionId: string;
  registrationDate: Date;
  status: 'active' | 'inactive' | 'suspended' | 'withdrawn';
  stats: LeagueTeamStats;
  paymentStatus: PaymentStatus;
  waiverSigned: boolean;
  waiverSignedAt?: Date;
}

export interface LeagueTeamStats {
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  matchesDrawn: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  rank: number;
  streak: number;
  homeRecord: { won: number; lost: number; drawn: number };
  awayRecord: { won: number; lost: number; drawn: number };
  lastMatchDate?: Date;
}

export interface LeagueStanding {
  id: string;
  leagueId: string;
  divisionId: string;
  teamId: string;
  position: number;
  stats: LeagueTeamStats;
  lastUpdated: Date;
}

export interface LeagueRule {
  id: string;
  title: string;
  description: string;
  category: 'general' | 'sport_specific' | 'conduct' | 'eligibility';
  isRequired: boolean;
  order: number;
}

export interface LeagueSchedule {
  id: string;
  leagueId: string;
  type: 'round_robin' | 'single_elimination' | 'double_elimination' | 'custom';
  rounds: LeagueRound[];
  matches: string[]; // Match IDs
  isGenerated: boolean;
  generatedAt?: Date;
}

export interface LeagueRound {
  id: string;
  name: string;
  roundNumber: number;
  matches: string[]; // Match IDs
  startDate: Date;
  endDate: Date;
  isComplete: boolean;
}

export interface LeaguePlayoff {
  id: string;
  leagueId: string;
  name: string;
  type: 'single_elimination' | 'double_elimination' | 'best_of_series';
  startDate: Date;
  endDate: Date;
  teams: string[]; // Team IDs
  brackets: TournamentBracket[];
  matches: string[]; // Match IDs
  isActive: boolean;
}

export interface LeagueSettings {
  matchDuration: number; // minutes
  breakDuration: number; // minutes
  pointsForWin: number;
  pointsForDraw: number;
  pointsForLoss: number;
  overtimeEnabled: boolean;
  overtimeDuration: number; // minutes
  penaltyShootoutEnabled: boolean;
  maxPenaltyRounds: number;
  tiebreakerRules: string[];
  homeAndAway: boolean;
  maxMatchesPerWeek: number;
  reschedulePolicy: string;
  forfeitPolicy: string;
  liveScoring: boolean;
  publicResults: boolean;
}

export interface LeagueSponsor {
  id: string;
  name: string;
  logo: string;
  website?: string;
  sponsorshipLevel: 'platinum' | 'gold' | 'silver' | 'bronze';
  contribution: number;
  benefits: string[];
  isActive: boolean;
}

export interface LeagueMedia {
  id: string;
  type: 'photo' | 'video' | 'document';
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedAt: Date;
  isPublic: boolean;
  tags: string[];
}

export interface TournamentRegistration {
  id: string;
  tournamentId: string;
  teamId?: string;
  playerId?: string;
  divisionId: string;
  registrationDate: Date;
  status: 'pending' | 'approved' | 'rejected' | 'waitlisted';
  paymentStatus: PaymentStatus;
  paymentAmount: number;
  paymentMethod?: string;
  paymentDate?: Date;
  waiverSigned: boolean;
  waiverSignedAt?: Date;
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
}

export interface LeagueRegistration {
  id: string;
  leagueId: string;
  teamId: string;
  divisionId: string;
  registrationDate: Date;
  status: 'pending' | 'approved' | 'rejected' | 'waitlisted';
  paymentStatus: PaymentStatus;
  paymentAmount: number;
  paymentMethod?: string;
  paymentDate?: Date;
  waiverSigned: boolean;
  waiverSignedAt?: Date;
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
} 