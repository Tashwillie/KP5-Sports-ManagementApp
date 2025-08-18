import { apiService, ApiResponse } from '@web/lib/services/apiService';

// Team interfaces
export interface Team {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  foundedYear?: number;
  homeGround?: string;
  clubId?: string;
  club?: {
    id: string;
    name: string;
  };
  players?: TeamPlayer[];
  coaches?: TeamCoach[];
  stats?: TeamStats;
  createdAt: string;
  updatedAt: string;
}

export interface TeamPlayer {
  id: string;
  userId: string;
  teamId: string;
  role: 'PLAYER' | 'CAPTAIN' | 'VICE_CAPTAIN';
  position?: string;
  jerseyNumber?: number;
  joinedAt: string;
  user: {
    id: string;
    displayName: string;
    email: string;
    profilePhoto?: string;
  };
}

export interface TeamCoach {
  id: string;
  userId: string;
  teamId: string;
  role: 'HEAD_COACH' | 'ASSISTANT_COACH' | 'GOALKEEPER_COACH' | 'FITNESS_COACH';
  joinedAt: string;
  user: {
    id: string;
    displayName: string;
    email: string;
    profilePhoto?: string;
  };
}

export interface TeamStats {
  id: string;
  teamId: string;
  matchesPlayed: number;
  matchesWon: number;
  matchesDrawn: number;
  matchesLost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  season?: string;
  updatedAt: string;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
  logo?: File;
  foundedYear?: number;
  homeGround?: string;
  clubId?: string;
}

export interface UpdateTeamRequest extends Partial<CreateTeamRequest> {
  id: string;
}

export interface TeamFilters {
  search?: string;
  clubId?: string;
  hasAvailableSpots?: boolean;
  page?: number;
  limit?: number;
}

export interface TeamListResponse {
  teams: Team[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Teams API Service
export class TeamsApiService {
  private baseEndpoint = '/teams';

  // Get all teams with filters and pagination
  async getTeams(filters?: TeamFilters): Promise<ApiResponse<TeamListResponse>> {
    return apiService.get<TeamListResponse>(this.baseEndpoint, filters);
  }

  // Get team by ID
  async getTeam(id: string): Promise<ApiResponse<Team>> {
    return apiService.get<Team>(`${this.baseEndpoint}/${id}`);
  }

  // Create new team
  async createTeam(data: CreateTeamRequest): Promise<ApiResponse<Team>> {
    if (data.logo) {
      // Handle file upload first
      const uploadResponse = await apiService.upload<{ url: string }>('/upload/team-logo', data.logo);
      if (!uploadResponse.success) {
        return uploadResponse;
      }
      
      // Replace file with uploaded URL
      const teamData = { ...data, logo: uploadResponse.data?.url };
      return apiService.post<Team>(this.baseEndpoint, teamData);
    }
    
    return apiService.post<Team>(this.baseEndpoint, data);
  }

  // Update team
  async updateTeam(id: string, data: UpdateTeamRequest): Promise<ApiResponse<Team>> {
    if (data.logo && data.logo instanceof File) {
      // Handle file upload first
      const uploadResponse = await apiService.upload<{ url: string }>('/upload/team-logo', data.logo);
      if (!uploadResponse.success) {
        return uploadResponse;
      }
      
      // Replace file with uploaded URL
      const teamData = { ...data, logo: uploadResponse.data?.url };
      return apiService.put<Team>(`${this.baseEndpoint}/${id}`, teamData);
    }
    
    return apiService.put<Team>(`${this.baseEndpoint}/${id}`, data);
  }

  // Delete team
  async deleteTeam(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  // Get team players
  async getTeamPlayers(teamId: string): Promise<ApiResponse<TeamPlayer[]>> {
    return apiService.get<TeamPlayer[]>(`${this.baseEndpoint}/${teamId}/players`);
  }

  // Add player to team
  async addPlayerToTeam(teamId: string, playerData: {
    userId: string;
    role: 'PLAYER' | 'CAPTAIN' | 'VICE_CAPTAIN';
    position?: string;
    jerseyNumber?: number;
  }): Promise<ApiResponse<TeamPlayer>> {
    return apiService.post<TeamPlayer>(`${this.baseEndpoint}/${teamId}/players`, playerData);
  }

  // Remove player from team
  async removePlayerFromTeam(teamId: string, playerId: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/${teamId}/players/${playerId}`);
  }

  // Update player role
  async updatePlayerRole(teamId: string, playerId: string, role: 'PLAYER' | 'CAPTAIN' | 'VICE_CAPTAIN'): Promise<ApiResponse<TeamPlayer>> {
    return apiService.patch<TeamPlayer>(`${this.baseEndpoint}/${teamId}/players/${playerId}`, { role });
  }

  // Get team coaches
  async getTeamCoaches(teamId: string): Promise<ApiResponse<TeamCoach[]>> {
    return apiService.get<TeamCoach[]>(`${this.baseEndpoint}/${teamId}/coaches`);
  }

  // Add coach to team
  async addCoachToTeam(teamId: string, coachData: {
    userId: string;
    role: 'HEAD_COACH' | 'ASSISTANT_COACH' | 'GOALKEEPER_COACH' | 'FITNESS_COACH';
  }): Promise<ApiResponse<TeamCoach>> {
    return apiService.post<TeamCoach>(`${this.baseEndpoint}/${teamId}/coaches`, coachData);
  }

  // Remove coach from team
  async removeCoachFromTeam(teamId: string, coachId: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/${teamId}/coaches/${coachId}`);
  }

  // Get team statistics
  async getTeamStats(teamId: string, season?: string): Promise<ApiResponse<TeamStats>> {
    const params = season ? { season } : {};
    return apiService.get<TeamStats>(`${this.baseEndpoint}/${teamId}/stats`, params);
  }

  // Get available players for team
  async getAvailablePlayers(teamId: string, filters?: {
    position?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    players: Array<{
      id: string;
      displayName: string;
      email: string;
      profilePhoto?: string;
      position?: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>> {
    return apiService.get(`${this.baseEndpoint}/${teamId}/available-players`, filters);
  }

  // Get team matches
  async getTeamMatches(teamId: string, filters?: {
    status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    season?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    matches: Array<{
      id: string;
      homeTeam: { id: string; name: string; score?: number };
      awayTeam: { id: string; name: string; score?: number };
      status: string;
      scheduledAt: string;
      venue?: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>> {
    return apiService.get(`${this.baseEndpoint}/${teamId}/matches`, filters);
  }

  // Search teams
  async searchTeams(query: string, filters?: Omit<TeamFilters, 'search'>): Promise<ApiResponse<TeamListResponse>> {
    return apiService.get<TeamListResponse>(`${this.baseEndpoint}/search`, { search: query, ...filters });
  }

  // Get teams by club
  async getTeamsByClub(clubId: string, filters?: Omit<TeamFilters, 'clubId'>): Promise<ApiResponse<TeamListResponse>> {
    return apiService.get<TeamListResponse>(`${this.baseEndpoint}/club/${clubId}`, filters);
  }

  // Bulk operations
  async bulkAddPlayers(teamId: string, players: Array<{
    userId: string;
    role: 'PLAYER' | 'CAPTAIN' | 'VICE_CAPTAIN';
    position?: string;
    jerseyNumber?: number;
  }>): Promise<ApiResponse<TeamPlayer[]>> {
    return apiService.post<TeamPlayer[]>(`${this.baseEndpoint}/${teamId}/players/bulk`, { players });
  }

  async bulkRemovePlayers(teamId: string, playerIds: string[]): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/${teamId}/players/bulk`, { data: { playerIds } });
  }
}

// Export singleton instance
export const teamsApiService = new TeamsApiService();
