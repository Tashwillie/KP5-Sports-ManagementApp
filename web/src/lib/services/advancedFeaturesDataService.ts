import { apiService, ApiResponse } from '@web/lib/services/apiService';
import { Tournament, TournamentMatch } from '@web/lib/services/tournamentsApiService';

// Extended interfaces to match backend data structure
export interface BackendTournament {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  format: 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION' | 'ROUND_ROBIN' | 'SWISS';
  status: 'UPCOMING' | 'REGISTRATION_OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  maxTeams?: number;
  registrationDeadline?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  clubId?: string;
  creatorId?: string;
  club?: {
    id: string;
    name: string;
    logo?: string;
  };
  creator?: {
    id: string;
    displayName: string;
  };
}

export interface BackendMatch {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  location?: string;
  address?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
  homeScore?: number;
  awayScore?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  homeTeamId?: string;
  awayTeamId?: string;
  creatorId: string;
  homeTeam?: {
    id: string;
    name: string;
    logo?: string;
  };
  awayTeam?: {
    id: string;
    name: string;
    logo?: string;
  };
  creator?: {
    id: string;
    displayName: string;
  };
}

export interface BackendTournamentMatch {
  id: string;
  tournamentId: string;
  matchId: string;
  round?: number;
  bracket?: string;
  match: BackendMatch;
  tournament: BackendTournament;
}

export interface BackendTeam {
  id: string;
  name: string;
  description?: string;
  ageGroup?: string;
  gender?: string;
  logo?: string;
  clubId?: string;
  createdBy?: string;
  club?: {
    id: string;
    name: string;
    logo?: string;
  };
}

export interface BackendClub {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  creator?: {
    id: string;
    displayName: string;
  };
}

// Data transformation functions
export const transformBackendTournament = (backendTournament: BackendTournament): Tournament => {
  return {
    id: backendTournament.id,
    name: backendTournament.name,
    description: backendTournament.description || '',
    logo: backendTournament.club?.logo || backendTournament.logo,
    startDate: backendTournament.startDate,
    endDate: backendTournament.endDate,
    registrationDeadline: backendTournament.registrationDeadline || backendTournament.startDate,
    maxTeams: backendTournament.maxTeams || 16,
    minTeams: 8,
    currentTeams: 0, // Will be populated separately
    format: mapBackendFormatToFrontend(backendTournament.format),
    status: mapBackendStatusToFrontend(backendTournament.status),
    venue: backendTournament.location || 'TBD',
    rules: 'Standard tournament rules apply',
    organizerId: backendTournament.creatorId || backendTournament.clubId || '',
    organizer: {
      id: backendTournament.creatorId || backendTournament.clubId || '',
      name: backendTournament.creator?.displayName || backendTournament.club?.name || 'Unknown',
      type: backendTournament.creatorId ? 'INDIVIDUAL' : 'CLUB'
    },
    createdAt: backendTournament.createdAt,
    updatedAt: backendTournament.updatedAt
  };
};

export const transformBackendMatch = (backendMatch: BackendMatch): TournamentMatch => {
  return {
    id: backendMatch.id,
    tournamentId: '', // Will be populated when used in tournament context
    homeTeamId: backendMatch.homeTeamId || '',
    awayTeamId: backendMatch.awayTeamId || '',
    homeTeam: backendMatch.homeTeam ? {
      id: backendMatch.homeTeam.id,
      name: backendMatch.homeTeam.name,
      logo: backendMatch.homeTeam.logo
    } : { id: '', name: 'TBD', logo: undefined },
    awayTeam: backendMatch.awayTeam ? {
      id: backendMatch.awayTeam.id,
      name: backendMatch.awayTeam.name,
      logo: backendMatch.awayTeam.logo
    } : { id: '', name: 'TBD', logo: undefined },
    round: 1, // Default round
    matchNumber: 1, // Default match number
    scheduledAt: backendMatch.startTime,
    venue: backendMatch.location || backendMatch.address || 'TBD',
    status: mapBackendMatchStatusToFrontend(backendMatch.status),
    homeScore: backendMatch.homeScore || 0,
    awayScore: backendMatch.awayScore || 0,
    winnerId: backendMatch.status === 'COMPLETED' && backendMatch.homeScore && backendMatch.awayScore
      ? (backendMatch.homeScore > backendMatch.awayScore ? backendMatch.homeTeamId : backendMatch.awayTeamId)
      : undefined
  };
};

// Mapping functions for enums
const mapBackendFormatToFrontend = (backendFormat: BackendTournament['format']): Tournament['format'] => {
  switch (backendFormat) {
    case 'SINGLE_ELIMINATION':
    case 'DOUBLE_ELIMINATION':
      return 'KNOCKOUT';
    case 'ROUND_ROBIN':
      return 'ROUND_ROBIN';
    case 'SWISS':
      return 'GROUP_STAGE';
    default:
      return 'KNOCKOUT';
  }
};

const mapBackendStatusToFrontend = (backendStatus: BackendTournament['status']): Tournament['status'] => {
  switch (backendStatus) {
    case 'UPCOMING':
      return 'DRAFT';
    case 'REGISTRATION_OPEN':
      return 'REGISTRATION_OPEN';
    case 'IN_PROGRESS':
      return 'IN_PROGRESS';
    case 'COMPLETED':
      return 'COMPLETED';
    case 'CANCELLED':
      return 'CANCELLED';
    default:
      return 'DRAFT';
  }
};

const mapBackendMatchStatusToFrontend = (backendStatus: BackendMatch['status']): TournamentMatch['status'] => {
  switch (backendStatus) {
    case 'SCHEDULED':
      return 'SCHEDULED';
    case 'IN_PROGRESS':
      return 'IN_PROGRESS';
    case 'PAUSED':
      return 'IN_PROGRESS'; // Map to IN_PROGRESS for frontend
    case 'COMPLETED':
      return 'COMPLETED';
    case 'CANCELLED':
    case 'POSTPONED':
      return 'CANCELLED';
    default:
      return 'SCHEDULED';
  }
};

// Main data service class
export class AdvancedFeaturesDataService {
  private baseEndpoint = '/api';

  // Fetch all tournaments
  async getTournaments(): Promise<ApiResponse<BackendTournament[]>> {
    try {
      const response = await apiService.get<BackendTournament[]>(`${this.baseEndpoint}/tournaments`);
      return response;
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      throw error;
    }
  }

  // Fetch a specific tournament
  async getTournament(tournamentId: string): Promise<ApiResponse<BackendTournament>> {
    try {
      const response = await apiService.get<BackendTournament>(`${this.baseEndpoint}/tournaments/${tournamentId}`);
      return response;
    } catch (error) {
      console.error('Error fetching tournament:', error);
      throw error;
    }
  }

  // Fetch all matches
  async getMatches(): Promise<ApiResponse<BackendMatch[]>> {
    try {
      const response = await apiService.get<BackendMatch[]>(`${this.baseEndpoint}/matches`);
      return response;
    } catch (error) {
      console.error('Error fetching matches:', error);
      throw error;
    }
  }

  // Fetch matches for a specific tournament
  async getTournamentMatches(tournamentId: string): Promise<ApiResponse<BackendTournamentMatch[]>> {
    try {
      const response = await apiService.get<BackendTournamentMatch[]>(`${this.baseEndpoint}/tournaments/${tournamentId}/matches`);
      return response;
    } catch (error) {
      console.error('Error fetching tournament matches:', error);
      throw error;
    }
  }

  // Fetch all teams
  async getTeams(): Promise<ApiResponse<BackendTeam[]>> {
    try {
      const response = await apiService.get<BackendTeam[]>(`${this.baseEndpoint}/teams`);
      return response;
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  }

  // Fetch all clubs
  async getClubs(): Promise<ApiResponse<BackendClub[]>> {
    try {
      const response = await apiService.get<BackendClub[]>(`${this.baseEndpoint}/clubs`);
      return response;
    } catch (error) {
      console.error('Error fetching clubs:', error);
      throw error;
    }
  }

  // Fetch live/active matches
  async getLiveMatches(): Promise<ApiResponse<BackendMatch[]>> {
    try {
      const response = await apiService.get<BackendMatch[]>(`${this.baseEndpoint}/matches?status=IN_PROGRESS`);
      return response;
    } catch (error) {
      console.error('Error fetching live matches:', error);
      throw error;
    }
  }

  // Fetch upcoming matches
  async getUpcomingMatches(): Promise<ApiResponse<BackendMatch[]>> {
    try {
      const response = await apiService.get<BackendMatch[]>(`${this.baseEndpoint}/matches?status=SCHEDULED`);
      return response;
    } catch (error) {
      console.error('Error fetching upcoming matches:', error);
      throw error;
    }
  }

  // Fetch completed matches
  async getCompletedMatches(): Promise<ApiResponse<BackendMatch[]>> {
    try {
      const response = await apiService.get<BackendMatch[]>(`${this.baseEndpoint}/matches?status=COMPLETED`);
      return response;
    } catch (error) {
      console.error('Error fetching completed matches:', error);
      throw error;
    }
  }

  // Update match status
  async updateMatchStatus(matchId: string, status: BackendMatch['status']): Promise<ApiResponse<void>> {
    try {
      const response = await apiService.patch<void>(`${this.baseEndpoint}/matches/${matchId}`, { status });
      return response;
    } catch (error) {
      console.error('Error updating match status:', error);
      throw error;
    }
  }

  // Update match score
  async updateMatchScore(matchId: string, homeScore: number, awayScore: number): Promise<ApiResponse<void>> {
    try {
      const response = await apiService.patch<void>(`${this.baseEndpoint}/matches/${matchId}`, { 
        homeScore, 
        awayScore 
      });
      return response;
    } catch (error) {
      console.error('Error updating match score:', error);
      throw error;
    }
  }

  // Add match event
  async addMatchEvent(matchId: string, eventData: {
    type: 'GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'SUBSTITUTION' | 'INJURY' | 'OTHER';
    minute?: number;
    description?: string;
    playerId?: string;
    teamId?: string;
    data?: any;
  }): Promise<ApiResponse<void>> {
    try {
      const response = await apiService.post<void>(`${this.baseEndpoint}/matches/${matchId}/events`, eventData);
      return response;
    } catch (error) {
      console.error('Error adding match event:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const advancedFeaturesDataService = new AdvancedFeaturesDataService();
