// Enhanced API Client with automatic token management for PostgreSQL backend
import TokenManager from './tokenManager';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

interface ApiError {
  status: number;
  message: string;
  details?: any;
}

interface ExtendedRequestInit extends RequestInit {
  retryCount?: number;
}

class EnhancedApiClient {
  private baseURL: string;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_BASE_URL ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api` : 'http://localhost:3001/api') {
    this.baseURL = baseURL;
  }

  /**
   * Check if the backend is reachable
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  /**
   * Generic request method with automatic token handling
   */
  private async request<T>(
    endpoint: string,
    options: ExtendedRequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Check if token needs refresh before making request
      if (TokenManager.needsRefresh() && !endpoint.includes('/auth/refresh')) {
        await this.refreshToken();
      }

      const token = TokenManager.getAccessToken();
      const url = `${this.baseURL}${endpoint}`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      console.log(`📡 Making ${options.method || 'GET'} request to: ${url}`);
      console.log('📡 Request options:', {
        method: options.method || 'GET',
        headers: headers,
        body: options.body
      });

      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle rate limiting with exponential backoff
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : 2000; // Default 2 seconds
        
        console.log(`⏳ Rate limited. Waiting ${delay}ms before retry...`);
        
        await new Promise(resolve => setTimeout(resolve, Math.min(delay, 10000))); // Max 10 seconds
        
        // Don't retry more than once to avoid infinite loops
        if (!options.retryCount) {
          return this.request<T>(endpoint, { ...options, retryCount: 1 });
        }
      }

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
      console.error('❌ Request failed:', error);
      
      let errorMessage = 'Network error occurred';
      let errorCode = 'NETWORK_ERROR';
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
        errorCode = 'CONNECTION_ERROR';
        
        // Try health check to provide more specific error
        try {
          const isHealthy = await this.checkHealth();
          if (!isHealthy) {
            errorMessage = 'Backend server is not responding. Please try again later.';
            errorCode = 'SERVER_UNREACHABLE';
          }
        } catch (healthError) {
          console.error('Health check also failed:', healthError);
        }
      } else if (error.message && error.message.includes('JSON')) {
        errorMessage = 'Server returned invalid data. Please try again.';
        errorCode = 'INVALID_RESPONSE';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: errorMessage,
        error: errorCode,
      };
    }
  }

  /**
   * Handle API response and extract data
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const responseText = await response.text();
      console.log('🔍 Raw response text:', responseText);
      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()));
      
      let data: any;
      const contentType = response.headers.get('content-type') || '';

      try {
        // Check if response is actually JSON
        if (contentType.includes('application/json') && responseText.trim()) {
          data = JSON.parse(responseText);
          console.log('🔍 Parsed JSON response data:', data);
        } else if (responseText.trim()) {
          // Non-JSON response (HTML error pages, plain text, etc.)
          console.warn('🔍 Non-JSON response received:', {
            contentType,
            status: response.status,
            responseStart: responseText.substring(0, 200)
          });
          
          // Try to extract meaningful error from HTML or plain text
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          
          if (responseText.includes('<title>')) {
            // HTML error page - try to extract title
            const titleMatch = responseText.match(/<title>(.*?)<\/title>/i);
            if (titleMatch) {
              errorMessage = titleMatch[1].trim();
            }
          } else if (responseText.length < 500) {
            // Short plain text response
            errorMessage = responseText.trim();
          }
          
          data = { 
            rawResponse: responseText,
            message: errorMessage,
            error: 'NON_JSON_RESPONSE' 
          };
        } else {
          // Empty response
          data = {};
          console.log('🔍 Empty response received');
        }
      } catch (parseError) {
        console.error('🔍 JSON parse error:', parseError);
        console.error('🔍 Raw response that failed to parse:', responseText.substring(0, 500));
        
        data = { 
          rawResponse: responseText,
          message: `Failed to parse server response: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`,
          error: 'JSON_PARSE_ERROR'
        };
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
      console.error('❌ Response handling failed:', error);
      return {
        success: false,
        message: 'Failed to process response',
        error: 'RESPONSE_ERROR',
      };
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
      const refreshToken = TokenManager.getRefreshToken();
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
          TokenManager.storeTokens(data.data.token, data.data.refreshToken);
          
          // Notify subscribers
          this.refreshSubscribers.forEach(callback => callback(data.data.token));
          this.refreshSubscribers = [];
          
          this.isRefreshing = false;
          return true;
        }
      }

      throw new Error('Token refresh failed');
    } catch (error: any) {
      console.error('❌ Token refresh failed:', error);
      TokenManager.clearTokens();
      
      // Notify subscribers of failure
      this.refreshSubscribers.forEach(callback => callback(''));
      this.refreshSubscribers = [];
      
      this.isRefreshing = false;
      return false;
    }
  }

  // Generic HTTP methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    console.log('🔐 Enhanced API Client: POST request data:', data);
    const body = data ? JSON.stringify(data) : undefined;
    console.log('🔐 Enhanced API Client: POST request body:', body);
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

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Authentication methods
  async login(credentials: { email: string; password: string }): Promise<ApiResponse<{ user: any; accessToken: string; refreshToken?: string }>> {
    console.log('🔐 Enhanced API Client: Login attempt');
    const response = await this.post<{ user: any; accessToken: string; refreshToken?: string }>('/auth/signin', credentials);
    
    console.log('🔐 Enhanced API Client: Login response:', {
      success: response.success,
      hasAccessToken: !!response.data?.accessToken,
      tokenLength: response.data?.accessToken?.length || 0,
      hasRefreshToken: !!response.data?.refreshToken
    });
    
    if (response.success && response.data?.accessToken) {
      console.log('🔐 Enhanced API Client: Calling TokenManager.storeTokens');
      TokenManager.storeTokens(response.data.accessToken, response.data.refreshToken);
    } else {
      console.log('🔐 Enhanced API Client: Not storing tokens - response not successful or no token');
    }
    
    return response;
  }

  async register(userData: {
    email: string;
    password: string;
    displayName: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: string;
  }): Promise<ApiResponse<{ user: any; accessToken: string; refreshToken?: string }>> {
    const response = await this.post<{ user: any; accessToken: string; refreshToken?: string }>('/auth/register', userData);
    
    if (response.success && response.data?.accessToken) {
      TokenManager.storeTokens(response.data.accessToken, response.data.refreshToken);
    }
    
    return response;
  }

  async logout(): Promise<ApiResponse<void>> {
    try {
      const refreshToken = TokenManager.getRefreshToken();
      if (refreshToken) {
        await this.post<void>('/auth/logout', { refreshToken });
      }
      TokenManager.clearTokens();
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      TokenManager.clearTokens();
      return { success: true, message: 'Logged out (local only)' };
    }
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: any }>> {
    return this.get<{ user: any }>('/auth/me');
  }

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    console.log('🔐 Enhanced API Client: Forgot password request');
    return this.post<void>('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse<void>> {
    console.log('🔐 Enhanced API Client: Reset password request');
    return this.post<void>('/auth/reset-password', { token, password });
  }

  // User management methods
  async updateUserProfile(userId: string, profileData: any): Promise<ApiResponse<{ user: any }>> {
    return this.put<{ user: any }>(`/users/${userId}/profile`, profileData);
  }

  async getUserProfile(userId: string): Promise<ApiResponse<{ user: any }>> {
    return this.get<{ user: any }>(`/users/${userId}/profile`);
  }

  // Club management methods
  async getClubs(params?: { page?: number; limit?: number; search?: string }): Promise<ApiResponse<any[]>> {
    const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.get<any[]>(`/clubs${queryParams}`);
  }

  async getClub(clubId: string): Promise<ApiResponse<any>> {
    return this.get<any>(`/clubs/${clubId}`);
  }

  async createClub(clubData: any): Promise<ApiResponse<any>> {
    return this.post<any>('/clubs', clubData);
  }

  async updateClub(clubId: string, clubData: any): Promise<ApiResponse<any>> {
    return this.put<any>(`/clubs/${clubId}`, clubData);
  }

  async deleteClub(clubId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/clubs/${clubId}`);
  }

  // Team management methods
  async getTeams(params?: { page?: number; limit?: number; clubId?: string; search?: string }): Promise<ApiResponse<any[]>> {
    const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.get<any[]>(`/teams${queryParams}`);
  }

  async getTeam(teamId: string): Promise<ApiResponse<any>> {
    return this.get<any>(`/teams/${teamId}`);
  }

  async createTeam(teamData: any): Promise<ApiResponse<any>> {
    return this.post<any>('/teams', teamData);
  }

  async updateTeam(teamId: string, teamData: any): Promise<ApiResponse<any>> {
    return this.put<any>(`/teams/${teamId}`, teamData);
  }

  async deleteTeam(teamId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/teams/${teamId}`);
  }

  // Match management methods
  async getMatches(params?: { page?: number; limit?: number; status?: string; homeTeamId?: string; awayTeamId?: string; startDate?: string; endDate?: string }): Promise<ApiResponse<any[]>> {
    const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.get<any[]>(`/matches${queryParams}`);
  }

  async getMatch(matchId: string): Promise<ApiResponse<any>> {
    return this.get<any>(`/matches/${matchId}`);
  }

  async createMatch(matchData: any): Promise<ApiResponse<any>> {
    return this.post<any>('/matches', matchData);
  }

  async updateMatch(matchId: string, matchData: any): Promise<ApiResponse<any>> {
    return this.put<any>(`/matches/${matchId}`, matchData);
  }

  async deleteMatch(matchId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/matches/${matchId}`);
  }

  // Match control methods
  async startMatch(matchId: string): Promise<ApiResponse<any>> {
    return this.post<any>(`/matches/${matchId}/start`);
  }

  async pauseMatch(matchId: string): Promise<ApiResponse<any>> {
    return this.post<any>(`/matches/${matchId}/pause`);
  }

  async resumeMatch(matchId: string): Promise<ApiResponse<any>> {
    return this.post<any>(`/matches/${matchId}/resume`);
  }

  async endMatch(matchId: string, scores?: { homeScore?: number; awayScore?: number }): Promise<ApiResponse<any>> {
    return this.post<any>(`/matches/${matchId}/end`, scores);
  }

  async updateMatchScore(matchId: string, scores: { homeScore?: number; awayScore?: number }): Promise<ApiResponse<any>> {
    return this.put<any>(`/matches/${matchId}/score`, scores);
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
  async getMatchStatistics(matchId: string): Promise<ApiResponse<any>> {
    return this.get<any>(`/matches/${matchId}/statistics`);
  }

  // Event management methods
  async getEvents(params?: { page?: number; limit?: number; type?: string; clubId?: string; teamId?: string; startDate?: string; endDate?: string }): Promise<ApiResponse<any[]>> {
    const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.get<any[]>(`/events${queryParams}`);
  }

  async getEvent(eventId: string): Promise<ApiResponse<any>> {
    return this.get<any>(`/events/${eventId}`);
  }

  async createEvent(eventData: any): Promise<ApiResponse<any>> {
    return this.post<any>('/events', eventData);
  }

  async updateEvent(eventId: string, eventData: any): Promise<ApiResponse<any>> {
    return this.put<any>(`/events/${eventId}`, eventData);
  }

  async deleteEvent(eventId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/events/${eventId}`);
  }

  // Tournament management methods
  async getTournaments(params?: { page?: number; limit?: number; status?: string; clubId?: string; search?: string }): Promise<ApiResponse<any[]>> {
    const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.get<any[]>(`/tournaments${queryParams}`);
  }

  async getTournament(tournamentId: string): Promise<ApiResponse<any>> {
    return this.get<any>(`/tournaments/${tournamentId}`);
  }

  async createTournament(tournamentData: any): Promise<ApiResponse<any>> {
    return this.post<any>('/tournaments', tournamentData);
  }

  async updateTournament(tournamentId: string, tournamentData: any): Promise<ApiResponse<any>> {
    return this.put<any>(`/tournaments/${tournamentId}`, tournamentData);
  }

  async deleteTournament(tournamentId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/tournaments/${tournamentId}`);
  }

  // Statistics methods
  async getPlayerStatistics(playerId: string, params?: { season?: string; teamId?: string }): Promise<ApiResponse<any>> {
    const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.get<any>(`/statistics/players/${playerId}${queryParams}`);
  }

  async getTeamStatistics(teamId: string, params?: { season?: string }): Promise<ApiResponse<any>> {
    const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.get<any>(`/statistics/teams/${teamId}${queryParams}`);
  }

  async getMatchHistory(params?: { page?: number; limit?: number; teamId?: string; playerId?: string; startDate?: string; endDate?: string }): Promise<ApiResponse<any[]>> {
    const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.get<any[]>(`/match-history${queryParams}`);
  }

  // File upload methods
  async uploadFile(file: File, type: 'avatar' | 'logo' | 'document' | 'media'): Promise<ApiResponse<{ url: string; filename: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.request<{ url: string; filename: string }>('/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set content-type for FormData
    });
  }

  // Health check method
  async healthCheck(): Promise<ApiResponse<any>> {
    return this.get<any>('/health');
  }
}

export default new EnhancedApiClient();
