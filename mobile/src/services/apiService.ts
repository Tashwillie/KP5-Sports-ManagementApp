import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
export interface ApiConfig {
  baseUrl: string;
  websocketUrl: string;
  timeout?: number;
}

// Base API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Match Types
export interface Match {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  location?: string;
  address?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
  homeScore: number;
  awayScore: number;
  homeTeamId: string;
  awayTeamId: string;
  homeTeam?: Team;
  awayTeam?: Team;
  events?: MatchEvent[];
  participants?: MatchParticipant[];
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  logo?: string;
  color?: string;
  clubId?: string;
}

export interface MatchEvent {
  id: string;
  type: string;
  minute?: number;
  description?: string;
  playerId?: string;
  teamId?: string;
  data?: any;
  timestamp: string;
}

export interface MatchParticipant {
  id: string;
  userId: string;
  teamId?: string;
  role: 'PLAYER' | 'COACH' | 'REFEREE' | 'SPECTATOR';
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED';
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

// Statistics Types
export interface MatchStatistics {
  matchId: string;
  homeTeam: TeamStats;
  awayTeam: TeamStats;
  possession: {
    home: number;
    away: number;
  };
  shots: {
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
}

export interface TeamStats {
  teamId: string;
  teamName: string;
  score: number;
  possession: number;
  shots: number;
  corners: number;
  fouls: number;
  yellowCards: number;
  redCards: number;
}

export interface PlayerMatchStats {
  playerId: string;
  playerName: string;
  teamId: string;
  matchId: string;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
  shots: number;
  passes: number;
  tackles: number;
}

// Match State Types
export interface MatchState {
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
  currentPeriod: 'FIRST_HALF' | 'HALFTIME' | 'SECOND_HALF' | 'EXTRA_TIME' | 'PENALTIES';
  timeElapsed: number;
  injuryTime: number;
  homeScore: number;
  awayScore: number;
  isTimerRunning: boolean;
  lastEventTime?: string;
}

// Base API Class
class BaseAPI {
  protected baseURL: string;
  protected websocketURL: string;
  protected timeout: number;
  protected token: string | null = null;

  constructor(config: ApiConfig) {
    this.baseURL = config.baseUrl;
    this.websocketURL = config.websocketUrl;
    this.timeout = config.timeout || 10000;
    this.loadToken();
  }

  private async loadToken(): Promise<void> {
    try {
      this.token = await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Failed to load token:', error);
    }
  }

  public async setToken(token: string): Promise<void> {
    this.token = token;
    try {
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Failed to save token:', error);
    }
  }

  public async clearToken(): Promise<void> {
    this.token = null;
    try {
      await AsyncStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Failed to clear token:', error);
    }
  }

  protected async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': `KP5-Academy-Mobile/${Platform.OS}`,
      ...options.headers as Record<string, string>,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json() as ApiResponse<T>;
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  protected async get<T>(endpoint: string): Promise<T> {
    const response = await this.makeRequest<T>(endpoint, { method: 'GET' });
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Request failed');
    }
    return response.data;
  }

  protected async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Request failed');
    }
    return response.data;
  }

  protected async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Request failed');
    }
    return response.data;
  }

  protected async delete<T>(endpoint: string): Promise<T> {
    const response = await this.makeRequest<T>(endpoint, { method: 'DELETE' });
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Request failed');
    }
    return response.data;
  }
}

// Match API
export class MatchAPI extends BaseAPI {
  async getMatch(matchId: string): Promise<Match> {
    return this.get<Match>(`/matches/${matchId}`);
  }

  async getMatches(params?: {
    status?: string;
    homeTeamId?: string;
    awayTeamId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Match[]; pagination: any }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/matches${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.get<{ data: Match[]; pagination: any }>(endpoint);
  }

  async getMatchEvents(matchId: string): Promise<MatchEvent[]> {
    return this.get<MatchEvent[]>(`/matches/${matchId}/events`);
  }

  async addMatchEvent(matchId: string, eventData: Partial<MatchEvent>): Promise<void> {
    return this.post<void>(`/matches/${matchId}/events`, eventData);
  }

  async startMatch(matchId: string): Promise<void> {
    return this.post<void>(`/matches/${matchId}/start`);
  }

  async pauseMatch(matchId: string): Promise<void> {
    return this.post<void>(`/matches/${matchId}/pause`);
  }

  async resumeMatch(matchId: string): Promise<void> {
    return this.post<void>(`/matches/${matchId}/resume`);
  }

  async endMatch(matchId: string, scores?: { homeScore: number; awayScore: number }): Promise<void> {
    return this.post<void>(`/matches/${matchId}/end`, scores);
  }

  async getMatchWebSocketStatus(matchId: string): Promise<{
    roomInfo: any;
    matchState: MatchState;
    connectedUsers: number;
    isActive: boolean;
  }> {
    return this.get(`/matches/${matchId}/websocket-status`);
  }

  async refreshMatchState(matchId: string): Promise<void> {
    return this.post<void>(`/matches/${matchId}/websocket/refresh-state`);
  }
}

// Statistics API
export class StatisticsAPI extends BaseAPI {
  async getMatchStats(matchId: string): Promise<MatchStatistics> {
    return this.get<MatchStatistics>(`/statistics/matches/${matchId}`);
  }

  async getMatchStatisticsOverview(matchId: string, params?: {
    homeTeamId?: string;
    awayTeamId?: string;
  }): Promise<MatchStatistics> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/statistics/matches/${matchId}/overview${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.get<MatchStatistics>(endpoint);
  }

  async getPlayerMatchStats(playerId: string, matchId: string): Promise<PlayerMatchStats> {
    return this.get<PlayerMatchStats>(`/statistics/players/${playerId}/matches/${matchId}`);
  }

  async getTeamMatchStats(teamId: string, matchId: string): Promise<TeamStats> {
    return this.get<TeamStats>(`/statistics/teams/${teamId}/matches/${matchId}`);
  }
}

// Event Entry API
export class EventEntryAPI extends BaseAPI {
  async startEventEntrySession(matchId: string, userId: string): Promise<{
    sessionId: string;
    status: string;
    matchId: string;
    userId: string;
  }> {
    return this.post(`/event-entry/sessions/start`, { matchId, userId });
  }

  async endEventEntrySession(sessionId: string): Promise<void> {
    return this.post(`/event-entry/sessions/${sessionId}/end`);
  }

  async submitEventEntry(sessionId: string, eventData: any): Promise<{
    success: boolean;
    eventId?: string;
    validation?: any;
  }> {
    return this.post(`/event-entry/sessions/${sessionId}/submit`, eventData);
  }

  async validateEventEntry(eventData: any): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  }> {
    return this.post(`/event-entry/validate`, eventData);
  }

  async getEventEntrySuggestions(matchId: string, eventType: string): Promise<{
    suggestions: string[];
    commonEvents: any[];
  }> {
    return this.get(`/event-entry/suggestions?matchId=${matchId}&eventType=${eventType}`);
  }
}

// Main API Class
export class API {
  public matches: MatchAPI;
  public statistics: StatisticsAPI;
  public eventEntry: EventEntryAPI;

  constructor(config: ApiConfig) {
    this.matches = new MatchAPI(config);
    this.statistics = new StatisticsAPI(config);
    this.eventEntry = new EventEntryAPI(config);
  }

  public async setToken(token: string): Promise<void> {
    await Promise.all([
      this.matches.setToken(token),
      this.statistics.setToken(token),
      this.eventEntry.setToken(token),
    ]);
  }

  public async clearToken(): Promise<void> {
    await Promise.all([
      this.matches.clearToken(token),
      this.statistics.clearToken(token),
      this.eventEntry.clearToken(token),
    ]);
  }
}

export default API;
