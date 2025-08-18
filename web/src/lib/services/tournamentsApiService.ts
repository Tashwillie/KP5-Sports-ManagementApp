import { apiService, ApiResponse } from '@web/lib/services/apiService';

// Tournament interfaces
export interface Tournament {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxTeams: number;
  minTeams: number;
  currentTeams: number;
  entryFee?: number;
  prizePool?: number;
  format: 'KNOCKOUT' | 'ROUND_ROBIN' | 'GROUP_STAGE' | 'LEAGUE';
  status: 'DRAFT' | 'REGISTRATION_OPEN' | 'REGISTRATION_CLOSED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  venue?: string;
  rules?: string;
  organizerId: string;
  organizer: {
    id: string;
    name: string;
    type: 'CLUB' | 'ORGANIZATION' | 'INDIVIDUAL';
  };
  teams?: TournamentTeam[];
  matches?: TournamentMatch[];
  brackets?: TournamentBracket;
  createdAt: string;
  updatedAt: string;
}

export interface TournamentTeam {
  id: string;
  tournamentId: string;
  teamId: string;
  team: {
    id: string;
    name: string;
    logo?: string;
    club?: {
      id: string;
      name: string;
    };
  };
  registrationDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED';
  seed?: number;
  group?: string;
  finalPosition?: number;
}

export interface TournamentMatch {
  id: string;
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeam: {
    id: string;
    name: string;
    logo?: string;
  };
  awayTeam: {
    id: string;
    name: string;
    logo?: string;
  };
  round: number;
  matchNumber: number;
  scheduledAt: string;
  venue?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  homeScore?: number;
  awayScore?: number;
  winnerId?: string;
  notes?: string;
}

export interface TournamentBracket {
  id: string;
  tournamentId: string;
  rounds: TournamentRound[];
  groups?: TournamentGroup[];
}

export interface TournamentRound {
  id: string;
  name: string;
  number: number;
  matches: TournamentMatch[];
  isGroupStage: boolean;
}

export interface TournamentGroup {
  id: string;
  name: string;
  teams: TournamentTeam[];
  standings: GroupStanding[];
}

export interface GroupStanding {
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  position: number;
}

export interface CreateTournamentRequest {
  name: string;
  description?: string;
  logo?: File;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxTeams: number;
  minTeams: number;
  entryFee?: number;
  prizePool?: number;
  format: 'KNOCKOUT' | 'ROUND_ROBIN' | 'GROUP_STAGE' | 'LEAGUE';
  venue?: string;
  rules?: string;
}

export interface UpdateTournamentRequest extends Partial<CreateTournamentRequest> {
  id: string;
}

export interface TournamentFilters {
  search?: string;
  status?: Tournament['status'];
  format?: Tournament['format'];
  startDate?: string;
  endDate?: string;
  organizerId?: string;
  page?: number;
  limit?: number;
}

export interface TournamentListResponse {
  tournaments: Tournament[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Tournaments API Service
export class TournamentsApiService {
  private baseEndpoint = '/tournaments';

  // Get all tournaments with filters and pagination
  async getTournaments(filters?: TournamentFilters): Promise<ApiResponse<TournamentListResponse>> {
    return apiService.get<TournamentListResponse>(this.baseEndpoint, filters);
  }

  // Get tournament by ID
  async getTournament(id: string): Promise<ApiResponse<Tournament>> {
    return apiService.get<Tournament>(`${this.baseEndpoint}/${id}`);
  }

  // Create new tournament
  async createTournament(data: CreateTournamentRequest): Promise<ApiResponse<Tournament>> {
    if (data.logo) {
      // Handle file upload first
      const uploadResponse = await apiService.upload<{ url: string }>('/upload/tournament-logo', data.logo);
      if (!uploadResponse.success) {
        return uploadResponse;
      }
      
      // Replace file with uploaded URL
      const tournamentData = { ...data, logo: uploadResponse.data?.url };
      return apiService.post<Tournament>(this.baseEndpoint, tournamentData);
    }
    
    return apiService.post<Tournament>(this.baseEndpoint, data);
  }

  // Update tournament
  async updateTournament(id: string, data: UpdateTournamentRequest): Promise<ApiResponse<Tournament>> {
    if (data.logo && data.logo instanceof File) {
      // Handle file upload first
      const uploadResponse = await apiService.upload<{ url: string }>('/upload/tournament-logo', data.logo);
      if (!uploadResponse.success) {
        return uploadResponse;
      }
      
      // Replace file with uploaded URL
      const tournamentData = { ...data, logo: uploadResponse.data?.url };
      return apiService.put<Tournament>(`${this.baseEndpoint}/${id}`, tournamentData);
    }
    
    return apiService.put<Tournament>(`${this.baseEndpoint}/${id}`, data);
  }

  // Delete tournament
  async deleteTournament(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  // Get tournament teams
  async getTournamentTeams(tournamentId: string): Promise<ApiResponse<TournamentTeam[]>> {
    return apiService.get<TournamentTeam[]>(`${this.baseEndpoint}/${tournamentId}/teams`);
  }

  // Register team for tournament
  async registerTeam(tournamentId: string, teamId: string): Promise<ApiResponse<TournamentTeam>> {
    return apiService.post<TournamentTeam>(`${this.baseEndpoint}/${tournamentId}/teams`, { teamId });
  }

  // Withdraw team from tournament
  async withdrawTeam(tournamentId: string, teamId: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/${tournamentId}/teams/${teamId}`);
  }

  // Approve team registration
  async approveTeam(tournamentId: string, teamId: string): Promise<ApiResponse<TournamentTeam>> {
    return apiService.patch<TournamentTeam>(`${this.baseEndpoint}/${tournamentId}/teams/${teamId}`, { 
      status: 'APPROVED' 
    });
  }

  // Reject team registration
  async rejectTeam(tournamentId: string, teamId: string, reason?: string): Promise<ApiResponse<TournamentTeam>> {
    return apiService.patch<TournamentTeam>(`${this.baseEndpoint}/${tournamentId}/teams/${teamId}`, { 
      status: 'REJECTED',
      notes: reason
    });
  }

  // Get tournament matches
  async getTournamentMatches(tournamentId: string, filters?: {
    round?: number;
    status?: TournamentMatch['status'];
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    matches: TournamentMatch[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>> {
    return apiService.get(`${this.baseEndpoint}/${tournamentId}/matches`, filters);
  }

  // Create tournament match
  async createMatch(tournamentId: string, data: {
    homeTeamId: string;
    awayTeamId: string;
    round: number;
    matchNumber: number;
    scheduledAt: string;
    venue?: string;
  }): Promise<ApiResponse<TournamentMatch>> {
    return apiService.post<TournamentMatch>(`${this.baseEndpoint}/${tournamentId}/matches`, data);
  }

  // Update match result
  async updateMatchResult(tournamentId: string, matchId: string, data: {
    homeScore: number;
    awayScore: number;
    winnerId?: string;
    notes?: string;
  }): Promise<ApiResponse<TournamentMatch>> {
    return apiService.patch<TournamentMatch>(`${this.baseEndpoint}/${tournamentId}/matches/${matchId}`, data);
  }

  // Get tournament bracket
  async getTournamentBracket(tournamentId: string): Promise<ApiResponse<TournamentBracket>> {
    return apiService.get<TournamentBracket>(`${this.baseEndpoint}/${tournamentId}/bracket`);
  }

  // Generate tournament bracket
  async generateBracket(tournamentId: string): Promise<ApiResponse<TournamentBracket>> {
    return apiService.post<TournamentBracket>(`${this.baseEndpoint}/${tournamentId}/bracket/generate`);
  }

  // Get tournament standings
  async getTournamentStandings(tournamentId: string): Promise<ApiResponse<{
    overall: GroupStanding[];
    groups?: Record<string, GroupStanding[]>;
  }>> {
    return apiService.get(`${this.baseEndpoint}/${tournamentId}/standings`);
  }

  // Start tournament
  async startTournament(tournamentId: string): Promise<ApiResponse<Tournament>> {
    return apiService.patch<Tournament>(`${this.baseEndpoint}/${tournamentId}/start`);
  }

  // End tournament
  async endTournament(tournamentId: string): Promise<ApiResponse<Tournament>> {
    return apiService.patch<Tournament>(`${this.baseEndpoint}/${tournamentId}/end`);
  }

  // Search tournaments
  async searchTournaments(query: string, filters?: Omit<TournamentFilters, 'search'>): Promise<ApiResponse<TournamentListResponse>> {
    return apiService.get<TournamentListResponse>(`${this.baseEndpoint}/search`, { search: query, ...filters });
  }

  // Get tournaments by organizer
  async getTournamentsByOrganizer(organizerId: string, filters?: Omit<TournamentFilters, 'organizerId'>): Promise<ApiResponse<TournamentListResponse>> {
    return apiService.get<TournamentListResponse>(`${this.baseEndpoint}/organizer/${organizerId}`, filters);
  }

  // Get upcoming tournaments
  async getUpcomingTournaments(limit: number = 10): Promise<ApiResponse<Tournament[]>> {
    return apiService.get<Tournament[]>(`${this.baseEndpoint}/upcoming`, { limit });
  }

  // Get tournaments by status
  async getTournamentsByStatus(status: Tournament['status'], filters?: Omit<TournamentFilters, 'status'>): Promise<ApiResponse<TournamentListResponse>> {
    return apiService.get<TournamentListResponse>(`${this.baseEndpoint}/status/${status}`, filters);
  }

  // Get tournaments by format
  async getTournamentsByFormat(format: Tournament['format'], filters?: Omit<TournamentFilters, 'format'>): Promise<ApiResponse<TournamentListResponse>> {
    return apiService.get<TournamentListResponse>(`${this.baseEndpoint}/format/${format}`, filters);
  }

  // Get tournament statistics
  async getTournamentStats(tournamentId: string): Promise<ApiResponse<{
    totalTeams: number;
    totalMatches: number;
    completedMatches: number;
    totalGoals: number;
    averageGoalsPerMatch: number;
    mostGoals: {
      teamId: string;
      teamName: string;
      goals: number;
    };
    cleanSheets: {
      teamId: string;
      teamName: string;
      count: number;
    }[];
  }>> {
    return apiService.get(`${this.baseEndpoint}/${tournamentId}/stats`);
  }

  // Get tournament participants
  async getTournamentParticipants(tournamentId: string, filters?: {
    status?: TournamentTeam['status'];
    paymentStatus?: TournamentTeam['paymentStatus'];
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    participants: TournamentTeam[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>> {
    return apiService.get(`${this.baseEndpoint}/${tournamentId}/participants`, filters);
  }

  // Update tournament status
  async updateTournamentStatus(tournamentId: string, status: Tournament['status']): Promise<ApiResponse<Tournament>> {
    return apiService.patch<Tournament>(`${this.baseEndpoint}/${tournamentId}/status`, { status });
  }

  // Get tournament rules
  async getTournamentRules(tournamentId: string): Promise<ApiResponse<{
    rules: string;
    updatedAt: string;
  }>> {
    return apiService.get(`${this.baseEndpoint}/${tournamentId}/rules`);
  }

  // Update tournament rules
  async updateTournamentRules(tournamentId: string, rules: string): Promise<ApiResponse<{
    rules: string;
    updatedAt: string;
  }>> {
    return apiService.put(`${this.baseEndpoint}/${tournamentId}/rules`, { rules });
  }

  // Get tournament schedule
  async getTournamentSchedule(tournamentId: string, filters?: {
    startDate?: string;
    endDate?: string;
    venue?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    schedule: Array<{
      date: string;
      matches: TournamentMatch[];
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>> {
    return apiService.get(`${this.baseEndpoint}/${tournamentId}/schedule`, filters);
  }

  // Bulk create matches
  async bulkCreateMatches(tournamentId: string, matches: Array<{
    homeTeamId: string;
    awayTeamId: string;
    round: number;
    matchNumber: number;
    scheduledAt: string;
    venue?: string;
  }>): Promise<ApiResponse<TournamentMatch[]>> {
    return apiService.post<TournamentMatch[]>(`${this.baseEndpoint}/${tournamentId}/matches/bulk`, { matches });
  }

  // Get tournament winners
  async getTournamentWinners(tournamentId: string): Promise<ApiResponse<{
    first: TournamentTeam;
    second: TournamentTeam;
    third: TournamentTeam;
  }>> {
    return apiService.get(`${this.baseEndpoint}/${tournamentId}/winners`);
  }
}

// Export singleton instance
export const tournamentsApiService = new TournamentsApiService();
