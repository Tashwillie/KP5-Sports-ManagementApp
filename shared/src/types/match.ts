import { Location } from './index';

// Match and Real-Time Data Entry Types
export interface LiveMatch {
  id: string;
  tournamentId?: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  startTime: Date;
  endTime?: Date;
  status: LiveMatchStatus;
  location: Location;
  refereeId?: string;
  adminId?: string; // Match administrator
  events: LiveMatchEvent[];
  stats: LiveMatchStats;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export type LiveMatchStatus = 
  | 'scheduled'
  | 'in_progress'
  | 'halftime'
  | 'completed'
  | 'cancelled'
  | 'postponed';

export interface LiveMatchEvent {
  id: string;
  matchId: string;
  type: LiveMatchEventType;
  timestamp: Date;
  minute: number; // Game minute when event occurred
  playerId?: string; // Player involved in the event
  teamId: string; // Team the event belongs to
  data: LiveMatchEventData;
  createdBy: string; // Referee or admin who recorded the event
  createdAt: Date;
}

export type LiveMatchEventType = 
  | 'goal'
  | 'assist'
  | 'yellow_card'
  | 'red_card'
  | 'substitution_in'
  | 'substitution_out'
  | 'injury'
  | 'penalty_goal'
  | 'penalty_miss'
  | 'own_goal'
  | 'match_start'
  | 'match_end'
  | 'halftime_start'
  | 'halftime_end'
  | 'injury_time_start'
  | 'injury_time_end';

export interface LiveMatchEventData {
  // Goal specific data
  goalType?: 'open_play' | 'penalty' | 'free_kick' | 'corner' | 'own_goal';
  assistPlayerId?: string;
  
  // Card specific data
  cardReason?: string;
  
  // Substitution specific data
  substitutionPlayerId?: string; // Player being substituted out
  
  // Injury specific data
  injuryType?: string;
  injurySeverity?: 'minor' | 'moderate' | 'severe';
  
  // General event data
  description?: string;
  position?: {
    x: number; // Field position (0-100)
    y: number; // Field position (0-100)
  };
}

export interface LiveMatchStats {
  homeTeam: TeamMatchStats;
  awayTeam: TeamMatchStats;
  possession: {
    home: number; // Percentage
    away: number; // Percentage
  };
  shots: {
    home: number;
    away: number;
  };
  shotsOnTarget: {
    home: number;
    away: number;
  };
  corners: {
    home: number;
    away: number;
  };
  fouls: {
    home: number;
    away: number;
  };
  yellowCards: {
    home: number;
    away: number;
  };
  redCards: {
    home: number;
    away: number;
  };
  offsides: {
    home: number;
    away: number;
  };
}

export interface TeamMatchStats {
  goals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  corners: number;
  fouls: number;
  yellowCards: number;
  redCards: number;
  offsides: number;
  possession: number; // Percentage
}

export interface PlayerMatchStats {
  playerId: string;
  matchId: string;
  teamId: string;
  minutesPlayed: number;
  goals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  yellowCards: number;
  redCards: number;
  fouls: number;
  foulsSuffered: number;
  offsides: number;
  passes: number;
  passesCompleted: number;
  tackles: number;
  tacklesWon: number;
  interceptions: number;
  clearances: number;
  saves?: number; // For goalkeepers
  goalsConceded?: number; // For goalkeepers
  cleanSheet?: boolean; // For goalkeepers
  rating?: number; // Player rating (1-10)
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LiveMatchState {
  matchId: string;
  currentMinute: number;
  isRunning: boolean;
  lastEventTime: Date;
  currentPeriod: 'first_half' | 'halftime' | 'second_half' | 'extra_time' | 'penalties';
  injuryTime: number; // Minutes of injury time
  lastUpdated: Date;
  updatedBy: string;
}

export interface MatchTimer {
  matchId: string;
  startTime: Date;
  currentTime: Date;
  isRunning: boolean;
  pausedTime: number; // Total time paused in milliseconds
  lastPauseTime?: Date;
  totalPlayTime: number; // Total time played in milliseconds
}

export interface MatchFormation {
  teamId: string;
  matchId: string;
  formation: string; // e.g., "4-4-2", "3-5-2"
  players: PlayerPosition[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PlayerPosition {
  playerId: string;
  position: {
    x: number; // Field position (0-100)
    y: number; // Field position (0-100)
  };
  role: string; // e.g., "striker", "midfielder", "defender"
}

export interface MatchReport {
  id: string;
  matchId: string;
  refereeId: string;
  summary: string;
  keyMoments: string[];
  playerOfTheMatch?: string; // Player ID
  weather?: string;
  attendance?: number;
  incidents: MatchIncident[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MatchIncident {
  id: string;
  matchId: string;
  type: 'injury' | 'dispute' | 'weather' | 'equipment' | 'other';
  description: string;
  minute: number;
  playersInvolved?: string[];
  resolution?: string;
  createdAt: Date;
}

export interface MatchBroadcast {
  id: string;
  matchId: string;
  streamUrl?: string;
  isLive: boolean;
  viewers: number;
  chatEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MatchHighlight {
  id: string;
  matchId: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  startTime: number; // Video timestamp in seconds
  endTime: number; // Video timestamp in seconds
  eventType: LiveMatchEventType;
  playerId?: string;
  teamId: string;
  createdAt: Date;
  createdBy: string;
}

// Real-time match data entry interfaces
export interface MatchDataEntry {
  matchId: string;
  eventType: LiveMatchEventType;
  playerId?: string;
  teamId: string;
  minute: number;
  additionalData?: Record<string, any>;
  timestamp: Date;
  enteredBy: string;
}

export interface MatchControlPanel {
  matchId: string;
  isActive: boolean;
  currentMinute: number;
  isTimerRunning: boolean;
  lastEvent: LiveMatchEvent | null;
  pendingEvents: MatchDataEntry[];
  lastUpdated: Date;
  updatedBy: string;
}

// Match statistics aggregation
export interface PlayerSeasonStats {
  playerId: string;
  season: string;
  teamId: string;
  matchesPlayed: number;
  matchesStarted: number;
  minutesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  cleanSheets?: number; // For goalkeepers
  goalsConceded?: number; // For goalkeepers
  saves?: number; // For goalkeepers
  averageRating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamSeasonStats {
  teamId: string;
  season: string;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  position?: number; // League position
  createdAt: Date;
  updatedAt: Date;
} 