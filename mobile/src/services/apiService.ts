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
  goals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  corners: number;
  fouls: number;
  yellowCards: number;
  redCards: number;
  possession: number;
  passes: number;
  passesCompleted: number;
  tackles: number;
  interceptions: number;
  offsides: number;
  saves: number;
  clearances: number;
  blocks: number;
  distance: number;
  sprints: number;
}

// User Types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatar?: string;
  role: string;
  isActive: boolean;
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

// Token Management
class TokenManager {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private static readonly TOKEN_EXPIRY_KEY = 'token_expiry';

  static async storeTokens(accessToken: string, refreshToken?: string): Promise<void> {
    try {
      // Decode JWT to get expiration
      const decoded = this.decodeJWT(accessToken);
      const expiryTime = decoded?.exp ? decoded.exp * 1000 : Date.now() + (24 * 60 * 60 * 1000);

      await AsyncStorage.setItem(this.TOKEN_KEY, accessToken);
      await AsyncStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
      
      if (refreshToken) {
        await AsyncStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
      }
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  }

  static async getAccessToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(this.TOKEN_KEY);
      if (!token) return null;

      // Check if token is expired
      if (this.isTokenExpired(token)) {
        await this.clearTokens();
        return null;
      }

      return token;
    } catch (error) {
      console.error('Failed to load token:', error);
      return null;
    }
  }

  static async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to load refresh token:', error);
      return null;
    }
  }

  static async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.TOKEN_KEY,
        this.REFRESH_TOKEN_KEY,
        this.TOKEN_EXPIRY_KEY,
      ]);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  static isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeJWT(token);
      if (!decoded?.exp) return true;

      const currentTime = Date.now() / 1000;
      const bufferTime = 60; // 1 minute buffer

      return decoded.exp < (currentTime + bufferTime);
    } catch (error) {
      return true;
    }
  }

  private static decodeJWT(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      return null;
    }
  }
}

// Mobile API Service
class MobileApiService {
  private baseURL: string;
  private websocketURL: string;
  private timeout: number;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor(config: ApiConfig) {
    this.baseURL = config.baseUrl;
    this.websocketURL = config.websocketUrl;
    this.timeout = config.timeout || 10000;
  }

  /**
   * Generic request method with automatic token handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Check if token needs refresh before making request
      if (await this.needsTokenRefresh() && !endpoint.includes('/auth/refresh')) {
        await this.refreshToken();
      }

      const token = await TokenManager.getAccessToken();
      const url = `${this.baseURL}${endpoint}`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle token refresh if we get 401
      if (response.status === 401 && !endpoint.includes('/auth/refresh')) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry the request with new token
          return this.request<T>(endpoint, options);
        }
      }

      return this.handleResponse<T>(response);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          message: 'Request timeout',
          error: 'TIMEOUT',
        };
      }

      return {
        success: false,
        message: error.message || 'Network error occurred',
        error: 'NETWORK_ERROR',
      };
    }
  }

  /**
   * Handle API response and extract data
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const responseText = await response.text();
      let data: any;

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        data = { rawResponse: responseText };
      }

      if (!response.ok) {
        return {
          success: false,
          message: data.message || `HTTP ${response.status}: ${response.statusText}`,
          error: data.error || 'HTTP_ERROR',
        };
      }

      return {
        success: data.success !== false,
        message: data.message || 'Request successful',
        data: data.data || data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to process response',
        error: 'RESPONSE_ERROR',
      };
    }
  }

  /**
   * Check if token needs refresh
   */
  private async needsTokenRefresh(): Promise<boolean> {
    const token = await TokenManager.getAccessToken();
    if (!token) return false;

    try {
      const decoded = this.decodeJWT(token);
      if (!decoded?.exp) return true;

      const currentTime = Date.now() / 1000;
      const fiveMinutes = 5 * 60; // 5 minutes in seconds

      return decoded.exp < (currentTime + fiveMinutes);
    } catch (error) {
      return true;
    }
  }

  /**
   * Refresh authentication token
   */
  private async refreshToken(): Promise<boolean> {
    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.refreshSubscribers.push((token: string) => {
          resolve(token !== '');
        });
      });
    }

    this.isRefreshing = true;

    try {
      const refreshToken = await TokenManager.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.token) {
          await TokenManager.storeTokens(data.data.token, data.data.refreshToken);
          
          // Notify subscribers
          this.refreshSubscribers.forEach(callback => callback(data.data.token));
          this.refreshSubscribers = [];
          
          this.isRefreshing = false;
          return true;
        }
      }

      throw new Error('Token refresh failed');
    } catch (error: any) {
      await TokenManager.clearTokens();
      
      // Notify subscribers of failure
      this.refreshSubscribers.forEach(callback => callback(''));
      this.refreshSubscribers = [];
      
      this.isRefreshing = false;
      return false;
    }
  }

  /**
   * Decode JWT payload (without verification)
   */
  private decodeJWT(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      return null;
    }
  }

  // Generic HTTP methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const body = data ? JSON.stringify(data) : undefined;
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    const response = await this.post<AuthResponse>('/auth/signin', credentials);
    
    if (response.success && response.data?.token) {
      await TokenManager.storeTokens(response.data.token, response.data.refreshToken);
    }
    
    return response;
  }

  async register(userData: RegisterData): Promise<ApiResponse<AuthResponse>> {
    const response = await this.post<AuthResponse>('/auth/register', userData);
    
    if (response.success && response.data?.token) {
      await TokenManager.storeTokens(response.data.token, response.data.refreshToken);
    }
    
    return response;
  }

  async logout(): Promise<ApiResponse<void>> {
    try {
      const refreshToken = await TokenManager.getRefreshToken();
      if (refreshToken) {
        await this.post<void>('/auth/logout', { refreshToken });
      }
      await TokenManager.clearTokens();
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      await TokenManager.clearTokens();
      return { success: true, message: 'Logged out (local only)' };
    }
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    return this.get<{ user: User }>('/auth/me');
  }

  // Match management methods
  async getMatches(params?: { page?: number; limit?: number; status?: string; homeTeamId?: string; awayTeamId?: string; startDate?: string; endDate?: string }): Promise<ApiResponse<Match[]>> {
    const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.get<Match[]>(`/matches${queryParams}`);
  }

  async getMatch(matchId: string): Promise<ApiResponse<Match>> {
    return this.get<Match>(`/matches/${matchId}`);
  }

  async createMatch(matchData: any): Promise<ApiResponse<Match>> {
    return this.post<Match>('/matches', matchData);
  }

  async updateMatch(matchId: string, matchData: any): Promise<ApiResponse<Match>> {
    return this.put<Match>(`/matches/${matchId}`, matchData);
  }

  async deleteMatch(matchId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/matches/${matchId}`);
  }

  // Match control methods
  async startMatch(matchId: string): Promise<ApiResponse<Match>> {
    return this.post<Match>(`/matches/${matchId}/start`);
  }

  async pauseMatch(matchId: string): Promise<ApiResponse<Match>> {
    return this.post<Match>(`/matches/${matchId}/pause`);
  }

  async resumeMatch(matchId: string): Promise<ApiResponse<Match>> {
    return this.post<Match>(`/matches/${matchId}/resume`);
  }

  async endMatch(matchId: string, scores?: { homeScore?: number; awayScore?: number }): Promise<ApiResponse<Match>> {
    return this.post<Match>(`/matches/${matchId}/end`, scores);
  }

  async updateMatchScore(matchId: string, scores: { homeScore?: number; awayScore?: number }): Promise<ApiResponse<Match>> {
    return this.put<Match>(`/matches/${matchId}/score`, scores);
  }

  // Match participants methods
  async addMatchParticipant(matchId: string, participantData: any): Promise<ApiResponse<any>> {
    return this.post<any>(`/matches/${matchId}/participants`, participantData);
  }

  async updateMatchParticipant(matchId: string, userId: string, participantData: any): Promise<ApiResponse<any>> {
    return this.put<any>(`/matches/${matchId}/participants/${userId}`, participantData);
  }

  async removeMatchParticipant(matchId: string, userId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/matches/${matchId}/participants/${userId}`);
  }

  // Match statistics methods
  async getMatchStatistics(matchId: string): Promise<ApiResponse<MatchStatistics>> {
    return this.get<MatchStatistics>(`/matches/${matchId}/statistics`);
  }

  // Team management methods
  async getTeams(params?: { page?: number; limit?: number; clubId?: string; search?: string }): Promise<ApiResponse<Team[]>> {
    const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.get<Team[]>(`/teams${queryParams}`);
  }

  async getTeam(teamId: string): Promise<ApiResponse<Team>> {
    return this.get<Team>(`/teams/${teamId}`);
  }

  // Health check method
  async healthCheck(): Promise<ApiResponse<any>> {
    return this.get<any>('/health');
  }

  // Token management methods
  async isAuthenticated(): Promise<boolean> {
    const token = await TokenManager.getAccessToken();
    return token !== null && !TokenManager.isTokenExpired(token);
  }

  async getToken(): Promise<string | null> {
    return TokenManager.getAccessToken();
  }
}

// Export the service
export default MobileApiService;
