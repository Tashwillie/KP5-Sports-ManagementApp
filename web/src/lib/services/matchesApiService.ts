import { apiService, ApiResponse } from './apiService';

// Match interfaces
export interface Match {
  id: string;
  title: string;
  description?: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeam: {
    id: string;
    name: string;
    logo?: string;
    club?: {
      id: string;
      name: string;
    };
  };
  awayTeam: {
    id: string;
    name: string;
    logo?: string;
    club?: {
      id: string;
      name: string;
    };
  };
  homeScore?: number;
  awayScore?: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
  scheduledAt: string;
  startedAt?: string;
  endedAt?: string;
  venue?: string;
  refereeId?: string;
  referee?: {
    id: string;
    displayName: string;
    email: string;
  };
  tournamentId?: string;
  tournament?: {
    id: string;
    name: string;
    round?: number;
  };
  events?: MatchEvent[];
  statistics?: MatchStatistics;
  createdAt: string;
  updatedAt: string;
}

export interface MatchEvent {
  id: string;
  matchId: string;
  type: 'GOAL' | 'ASSIST' | 'YELLOW_CARD' | 'RED_CARD' | 'SUBSTITUTION' | 'INJURY' | 'OTHER';
  playerId?: string;
  player?: {
    id: string;
    displayName: string;
    teamId: string;
  };
  teamId: string;
  team: {
    id: string;
    name: string;
  };
  minute?: number;
  description?: string;
  timestamp: string;
}

export interface MatchStatistics {
  id: string;
  matchId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  homePossession?: number;
  awayPossession?: number;
  homeShots?: number;
  awayShots?: number;
  homeShotsOnTarget?: number;
  awayShotsOnTarget?: number;
  homeCorners?: number;
  awayCorners?: number;
  homeFouls?: number;
  awayFouls?: number;
  homeYellowCards?: number;
  awayYellowCards?: number;
  homeRedCards?: number;
  awayRedCards?: number;
  homeOffsides?: number;
  awayOffsides?: number;
  updatedAt: string;
}

export interface CreateMatchRequest {
  title: string;
  description?: string;
  homeTeamId: string;
  awayTeamId: string;
  scheduledAt: string;
  venue?: string;
  refereeId?: string;
  tournamentId?: string;
}

export interface UpdateMatchRequest extends Partial<CreateMatchRequest> {
  id: string;
}

export interface MatchFilters {
  search?: string;
  status?: Match['status'];
  homeTeamId?: string;
  awayTeamId?: string;
  tournamentId?: string;
  refereeId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface MatchListResponse {
  matches: Match[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LiveMatchUpdate {
  matchId: string;
  type: 'MATCH_START' | 'MATCH_PAUSE' | 'MATCH_RESUME' | 'MATCH_END' | 'SCORE_UPDATE' | 'EVENT_ADDED' | 'STATUS_CHANGE';
  data: any;
  timestamp: string;
  userId?: string;
}

// Matches API Service
export class MatchesApiService {
  private baseEndpoint = '/matches';

  // Get all matches with filters and pagination
  async getMatches(filters?: MatchFilters): Promise<ApiResponse<MatchListResponse>> {
    return apiService.get<MatchListResponse>(this.baseEndpoint, filters);
  }

  // Get match by ID
  async getMatch(id: string): Promise<ApiResponse<Match>> {
    return apiService.get<Match>(`${this.baseEndpoint}/${id}`);
  }

  // Create new match
  async createMatch(data: CreateMatchRequest): Promise<ApiResponse<Match>> {
    return apiService.post<Match>(this.baseEndpoint, data);
  }

  // Update match
  async updateMatch(id: string, data: UpdateMatchRequest): Promise<ApiResponse<Match>> {
    return apiService.put<Match>(`${this.baseEndpoint}/${id}`, data);
  }

  // Delete match
  async deleteMatch(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  // Start match
  async startMatch(id: string): Promise<ApiResponse<Match>> {
    return apiService.patch<Match>(`${this.baseEndpoint}/${id}/start`);
  }

  // Pause match
  async pauseMatch(id: string): Promise<ApiResponse<Match>> {
    return apiService.patch<Match>(`${this.baseEndpoint}/${id}/pause`);
  }

  // Resume match
  async resumeMatch(id: string): Promise<ApiResponse<Match>> {
    return apiService.patch<Match>(`${this.baseEndpoint}/${id}/resume`);
  }

  // End match
  async endMatch(id: string, data: {
    homeScore: number;
    awayScore: number;
    notes?: string;
  }): Promise<ApiResponse<Match>> {
    return apiService.patch<Match>(`${this.baseEndpoint}/${id}/end`, data);
  }

  // Update match score
  async updateScore(id: string, data: {
    homeScore: number;
    awayScore: number;
  }): Promise<ApiResponse<Match>> {
    return apiService.patch<Match>(`${this.baseEndpoint}/${id}/score`, data);
  }

  // Get match events
  async getMatchEvents(matchId: string): Promise<ApiResponse<MatchEvent[]>> {
    return apiService.get<MatchEvent[]>(`${this.baseEndpoint}/${matchId}/events`);
  }

  // Add match event
  async addMatchEvent(matchId: string, data: {
    type: MatchEvent['type'];
    playerId?: string;
    teamId: string;
    minute?: number;
    description?: string;
  }): Promise<ApiResponse<MatchEvent>> {
    return apiService.post<MatchEvent>(`${this.baseEndpoint}/${matchId}/events`, data);
  }

  // Update match event
  async updateMatchEvent(matchId: string, eventId: string, data: Partial<MatchEvent>): Promise<ApiResponse<MatchEvent>> {
    return apiService.put<MatchEvent>(`${this.baseEndpoint}/${matchId}/events/${eventId}`, data);
  }

  // Delete match event
  async deleteMatchEvent(matchId: string, eventId: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/${matchId}/events/${eventId}`);
  }

  // Get match statistics
  async getMatchStatistics(matchId: string): Promise<ApiResponse<MatchStatistics>> {
    return apiService.get<MatchStatistics>(`${this.baseEndpoint}/${matchId}/statistics`);
  }

  // Update match statistics
  async updateMatchStatistics(matchId: string, data: Partial<MatchStatistics>): Promise<ApiResponse<MatchStatistics>> {
    return apiService.put<MatchStatistics>(`${this.baseEndpoint}/${matchId}/statistics`, data);
  }

  // Get live matches
  async getLiveMatches(): Promise<ApiResponse<Match[]>> {
    return apiService.get<Match[]>(`${this.baseEndpoint}/live`);
  }

  // Get upcoming matches
  async getUpcomingMatches(limit: number = 10): Promise<ApiResponse<Match[]>> {
    return apiService.get<Match[]>(`${this.baseEndpoint}/upcoming`, { limit });
  }

  // Get completed matches
  async getCompletedMatches(filters?: {
    startDate?: string;
    endDate?: string;
    tournamentId?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<MatchListResponse>> {
    return apiService.get<MatchListResponse>(`${this.baseEndpoint}/completed`, filters);
  }

  // Search matches
  async searchMatches(query: string, filters?: Omit<MatchFilters, 'search'>): Promise<ApiResponse<MatchListResponse>> {
    return apiService.get<MatchListResponse>(`${this.baseEndpoint}/search`, { search: query, ...filters });
  }

  // Get matches by team
  async getMatchesByTeam(teamId: string, filters?: {
    status?: Match['status'];
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<MatchListResponse>> {
    return apiService.get<MatchListResponse>(`${this.baseEndpoint}/team/${teamId}`, filters);
  }

  // Get matches by tournament
  async getMatchesByTournament(tournamentId: string, filters?: {
    status?: Match['status'];
    round?: number;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<MatchListResponse>> {
    return apiService.get<MatchListResponse>(`${this.baseEndpoint}/tournament/${tournamentId}`, filters);
  }

  // Get matches by referee
  async getMatchesByReferee(refereeId: string, filters?: {
    status?: Match['status'];
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<MatchListResponse>> {
    return apiService.get<MatchListResponse>(`${this.baseEndpoint}/referee/${refereeId}`, filters);
  }

  // Get match timeline
  async getMatchTimeline(matchId: string): Promise<ApiResponse<{
    events: MatchEvent[];
    timeline: Array<{
      minute: number;
      events: MatchEvent[];
    }>;
  }>> {
    return apiService.get(`${this.baseEndpoint}/${matchId}/timeline`);
  }

  // Get match highlights
  async getMatchHighlights(matchId: string): Promise<ApiResponse<{
    goals: MatchEvent[];
    cards: MatchEvent[];
    substitutions: MatchEvent[];
    other: MatchEvent[];
  }>> {
    return apiService.get(`${this.baseEndpoint}/${matchId}/highlights`);
  }

  // Get head-to-head statistics
  async getHeadToHead(team1Id: string, team2Id: string): Promise<ApiResponse<{
    totalMatches: number;
    team1Wins: number;
    team2Wins: number;
    draws: number;
    team1Goals: number;
    team2Goals: number;
    lastMatches: Match[];
  }>> {
    return apiService.get(`${this.baseEndpoint}/head-to-head`, { team1Id, team2Id });
  }

  // Get match predictions
  async getMatchPredictions(matchId: string): Promise<ApiResponse<{
    homeWinProbability: number;
    awayWinProbability: number;
    drawProbability: number;
    predictedScore: {
      home: number;
      away: number;
    };
    factors: string[];
  }>> {
    return apiService.get(`${this.baseEndpoint}/${matchId}/predictions`);
  }

  // Bulk create matches
  async bulkCreateMatches(matches: CreateMatchRequest[]): Promise<ApiResponse<Match[]>> {
    return apiService.post<Match[]>(`${this.baseEndpoint}/bulk`, { matches });
  }

  // Bulk update match results
  async bulkUpdateResults(results: Array<{
    matchId: string;
    homeScore: number;
    awayScore: number;
    status: Match['status'];
  }>): Promise<ApiResponse<Match[]>> {
    return apiService.patch<Match[]>(`${this.baseEndpoint}/bulk-results`, { results });
  }

  // Get match analytics
  async getMatchAnalytics(matchId: string): Promise<ApiResponse<{
    possession: {
      home: number;
      away: number;
    };
    shots: {
      home: number;
      away: number;
    };
    passes: {
      home: number;
      away: number;
    };
    tackles: {
      home: number;
      away: number;
    };
    fouls: {
      home: number;
      away: number;
    };
    cards: {
      home: {
        yellow: number;
        red: number;
      };
      away: {
        yellow: number;
        red: number;
      };
    };
  }>> {
    return apiService.get(`${this.baseEndpoint}/${matchId}/analytics`);
  }

  // Get match report
  async getMatchReport(matchId: string): Promise<ApiResponse<{
    summary: string;
    keyEvents: MatchEvent[];
    statistics: MatchStatistics;
    playerRatings: Array<{
      playerId: string;
      playerName: string;
      teamId: string;
      rating: number;
      goals: number;
      assists: number;
      yellowCards: number;
      redCards: number;
    }>;
    highlights: string[];
  }>> {
    return apiService.get(`${this.baseEndpoint}/${matchId}/report`);
  }

  // Subscribe to live match updates
  async subscribeToLiveMatch(matchId: string): Promise<ApiResponse<{
    subscriptionId: string;
    message: string;
  }>> {
    return apiService.post(`${this.baseEndpoint}/${matchId}/subscribe`);
  }

  // Unsubscribe from live match updates
  async unsubscribeFromLiveMatch(matchId: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/${matchId}/subscribe`);
  }

  // Get match weather
  async getMatchWeather(matchId: string): Promise<ApiResponse<{
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    precipitation: number;
  }>> {
    return apiService.get(`${this.baseEndpoint}/${matchId}/weather`);
  }

  // Get match venue information
  async getMatchVenue(matchId: string): Promise<ApiResponse<{
    name: string;
    address: string;
    city: string;
    capacity: number;
    surface: string;
    facilities: string[];
    parking: boolean;
    accessibility: boolean;
  }>> {
    return apiService.get(`${this.baseEndpoint}/${matchId}/venue`);
  }
}

// Export singleton instance
export const matchesApiService = new MatchesApiService();
