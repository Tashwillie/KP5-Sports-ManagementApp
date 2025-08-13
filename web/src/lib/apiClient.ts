// API Client for PostgreSQL Backend
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api') {
    this.baseURL = baseURL;
    // Don't load token in constructor to avoid SSR issues
  }

  // Token management
  private loadToken(): void {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
      console.log('🔑 Token loaded from localStorage:', this.token ? 'Present' : 'Missing');
    }
  }

  private saveToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      console.log('💾 Token saved to localStorage');
    }
  }

  private clearToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      console.log('🗑️ Token cleared from localStorage');
    }
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Load token before each request to ensure it's fresh
    this.loadToken();
    
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
      console.log('🔐 Adding Authorization header for:', endpoint);
    } else {
      console.log('⚠️ No token available for:', endpoint);
    }

    console.log('📡 Making request to:', url);
    console.log('📋 Headers:', headers);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log('📥 Response status:', response.status, 'for:', endpoint);

    if (!response.ok) {
      // Try to get error data, but also capture the raw response text
      let errorData: any = {};
      let responseText = '';
      
      try {
        responseText = await response.text();
        if (responseText) {
          try {
            errorData = JSON.parse(responseText);
          } catch (parseError) {
            // If it's not valid JSON, use the raw text
            errorData = { rawResponse: responseText };
          }
        }
      } catch (textError: any) {
        errorData = { textError: textError.message };
      }
      
      console.error('❌ Request failed:', endpoint, {
        status: response.status,
        statusText: response.statusText,
        errorData,
        responseText,
        url: url,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      // If we get a 401 (Unauthorized), clear the invalid token
      if (response.status === 401) {
        console.log('🔒 Unauthorized request, clearing invalid token');
        this.clearToken();
      }
      
      // Provide more specific error messages
      let errorMessage = errorData.message || errorData.error || errorData.rawResponse;
      if (!errorMessage) {
        switch (response.status) {
          case 401:
            errorMessage = 'Authentication required. Please log in.';
            break;
          case 403:
            errorMessage = 'Access denied. You do not have permission.';
            break;
          case 404:
            errorMessage = 'Endpoint not found. Please check the API URL.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = `HTTP error! status: ${response.status}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Authentication methods
  async register(userData: {
    email: string;
    password: string;
    displayName: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: string;
  }) {
    const response = await this.request<{
      success: boolean;
      message: string;
      data: { user: any; token: string };
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data.token) {
      this.saveToken(response.data.token);
    }

    return response;
  }

  async login(credentials: { email: string; password: string }) {
    const response = await this.request<{
      success: boolean;
      message: string;
      data: { user: any; token: string };
    }>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data.token) {
      this.saveToken(response.data.token);
    }

    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.clearToken();
    }
  }

  async getCurrentUser() {
    return this.request<{
      success: boolean;
      data: { user: any };
    }>('/auth/me');
  }

  async updateProfile(profileData: {
    displayName?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) {
    return this.request<{
      success: boolean;
      message: string;
      data: { user: any };
    }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async refreshToken(token: string) {
    const response = await this.request<{
      success: boolean;
      message: string;
      data: { user: any; token: string };
    }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });

    if (response.success && response.data.token) {
      this.saveToken(response.data.token);
    }

    return response;
  }

  // User management
  async getUsers() {
    return this.request<{
      success: boolean;
      data: { users: any[] };
    }>('/users');
  }

  async getUsersFiltered(params: Record<string, string | number | boolean>) {
    const qs = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ).toString();
    return this.request<{
      success: boolean;
      data: { users: any[] };
    }>(`/users?${qs}`);
  }

  async getUser(id: string) {
    return this.request<{
      success: boolean;
      data: { user: any };
    }>(`/users/${id}`);
  }

  async updateUser(id: string, userData: any) {
    return this.request<{
      success: boolean;
      message: string;
      data: { user: any };
    }>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string) {
    return this.request<{
      success: boolean;
      message: string;
    }>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Club management
  async getClubs() {
    return this.request<{
      success: boolean;
      data: { clubs: any[] };
    }>('/clubs');
  }

  async getClub(id: string) {
    return this.request<{
      success: boolean;
      data: { club: any };
    }>(`/clubs/${id}`);
  }

  async createClub(clubData: any) {
    return this.request<{
      success: boolean;
      message: string;
      data: { club: any };
    }>('/clubs', {
      method: 'POST',
      body: JSON.stringify(clubData),
    });
  }

  async updateClub(id: string, clubData: any) {
    return this.request<{
      success: boolean;
      message: string;
      data: { club: any };
    }>(`/clubs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clubData),
    });
  }

  async deleteClub(id: string) {
    return this.request<{
      success: boolean;
      message: string;
    }>(`/clubs/${id}`, {
      method: 'DELETE',
    });
  }

  // Team management
  async getTeams() {
    return this.request<{
      success: boolean;
      data: { teams: any[] };
    }>('/teams');
  }

  async getTeam(id: string) {
    return this.request<{
      success: boolean;
      data: { team: any };
    }>(`/teams/${id}`);
  }

  async createTeam(teamData: any) {
    return this.request<{
      success: boolean;
      message: string;
      data: { team: any };
    }>('/teams', {
      method: 'POST',
      body: JSON.stringify(teamData),
    });
  }

  async updateTeam(id: string, teamData: any) {
    return this.request<{
      success: boolean;
      message: string;
      data: { team: any };
    }>(`/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(teamData),
    });
  }

  async deleteTeam(id: string) {
    return this.request<{
      success: boolean;
      message: string;
    }>(`/teams/${id}`, {
      method: 'DELETE',
    });
  }

  // Event management
  async getEvents() {
    return this.request<{
      success: boolean;
      data: { events: any[] };
    }>('/events');
  }

  async getEvent(id: string) {
    return this.request<{
      success: boolean;
      data: { event: any };
    }>(`/events/${id}`);
  }

  async createEvent(eventData: any) {
    return this.request<{
      success: boolean;
      message: string;
      data: { event: any };
    }>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateEvent(id: string, eventData: any) {
    return this.request<{
      success: boolean;
      message: string;
      data: { event: any };
    }>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(id: string) {
    return this.request<{
      success: boolean;
      message: string;
    }>(`/events/${id}`, {
      method: 'DELETE',
    });
  }

  // Match management
  async getMatches() {
    return this.request<{
      success: boolean;
      data: { matches: any[] };
    }>('/matches');
  }

  async getMatch(id: string) {
    return this.request<{
      success: boolean;
      data: { match: any };
    }>(`/matches/${id}`);
  }

  async createMatch(matchData: any) {
    return this.request<{
      success: boolean;
      message: string;
      data: { match: any };
    }>('/matches', {
      method: 'POST',
      body: JSON.stringify(matchData),
    });
  }

  async updateMatch(id: string, matchData: any) {
    return this.request<{
      success: boolean;
      message: string;
      data: { match: any };
    }>(`/matches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(matchData),
    });
  }

  async deleteMatch(id: string) {
    return this.request<{
      success: boolean;
      message: string;
    }>(`/matches/${id}`, {
      method: 'DELETE',
    });
  }

  // Tournament management
  async getTournaments() {
    return this.request<{
      success: boolean;
      data: { tournaments: any[] };
    }>('/tournaments');
  }

  async getTournament(id: string) {
    return this.request<{
      success: boolean;
      data: { tournament: any };
    }>(`/tournaments/${id}`);
  }

  async createTournament(tournamentData: any) {
    return this.request<{
      success: boolean;
      message: string;
      data: { tournament: any };
    }>('/tournaments', {
      method: 'POST',
      body: JSON.stringify(tournamentData),
    });
  }

  async updateTournament(id: string, tournamentData: any) {
    return this.request<{
      success: boolean;
      message: string;
      data: { tournament: any };
    }>(`/tournaments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tournamentData),
    });
  }

  async deleteTournament(id: string) {
    return this.request<{
      success: boolean;
      message: string;
    }>(`/tournaments/${id}`, {
      method: 'DELETE',
    });
  }

  // Message management
  async getMessages() {
    return this.request<{
      success: boolean;
      data: { messages: any[] };
    }>('/messages');
  }

  async sendMessage(messageData: any) {
    return this.request<{
      success: boolean;
      message: string;
      data: { message: any };
    }>('/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  // Notification management
  async getNotifications() {
    return this.request<{
      success: boolean;
      data: { notifications: any[] };
    }>('/notifications');
  }

  async markNotificationAsRead(id: string) {
    return this.request<{
      success: boolean;
      message: string;
    }>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  // Payment management
  async getPayments() {
    return this.request<{
      success: boolean;
      data: { payments: any[] };
    }>('/payments');
  }

  async createPayment(paymentData: any) {
    return this.request<{
      success: boolean;
      message: string;
      data: { payment: any };
    }>('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  // Registration management
  async getRegistrations() {
    return this.request<{
      success: boolean;
      data: { registrations: any[] };
    }>('/registrations');
  }

  async createRegistration(registrationData: any) {
    return this.request<{
      success: boolean;
      message: string;
      data: { registration: any };
    }>('/registrations', {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });
  }

  // Utility methods
  isAuthenticated(): boolean {
    this.loadToken(); // Load token before checking
    return !!this.token;
  }

  // Test backend connection (no authentication required)
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Try health endpoint first
      const healthResponse = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (healthResponse.ok) {
        return { success: true, message: 'Backend is running (health endpoint)' };
      }
      
      // If health endpoint doesn't exist, try a simple GET to the base URL
      const baseResponse = await fetch(`${this.baseURL}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (baseResponse.ok) {
        return { success: true, message: 'Backend is running (base endpoint)' };
      }
      
      return { success: false, message: `Backend responded with status: ${baseResponse.status}` };
    } catch (error) {
      return { success: false, message: `Cannot connect to backend: ${error}` };
    }
  }

  getToken(): string | null {
    this.loadToken(); // Load token before getting
    return this.token;
  }

  // Check if token exists and looks valid (basic format check)
  hasValidTokenFormat(): boolean {
    this.loadToken();
    if (!this.token) return false;
    
    // Basic JWT format check (3 parts separated by dots)
    const parts = this.token.split('.');
    return parts.length === 3 && parts.every(part => part.length > 0);
  }

  // Check if auth endpoints are accessible (no authentication required)
  async checkAuthEndpoints(): Promise<{ 
    login: boolean; 
    register: boolean; 
    message: string 
  }> {
    try {
      // Test login endpoint (should return 400 for missing credentials, not 404)
      const loginResponse = await fetch(`${this.baseURL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'test@test.com', password: 'test' }),
      });
      
      // Test register endpoint (should return 400 for missing credentials, not 404)
      const registerResponse = await fetch(`${this.baseURL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'test@test.com', password: 'test', displayName: 'Test' }),
      });
      
      return {
        login: loginResponse.status !== 404,
        register: registerResponse.status !== 404,
        message: `Login endpoint: ${loginResponse.status !== 404 ? 'Available' : 'Not found'}, Register endpoint: ${registerResponse.status !== 404 ? 'Available' : 'Not found'}`
      };
    } catch (error) {
      return {
        login: false,
        register: false,
        message: `Error checking auth endpoints: ${error}`
      };
    }
  }

  // Test the /auth/me endpoint specifically to see what's happening
  async testAuthMeEndpoint(): Promise<{ 
    status: number; 
    statusText: string; 
    responseText: string; 
    headers: Record<string, string>;
    message: string;
  }> {
    try {
      const response = await fetch(`${this.baseURL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const responseText = await response.text();
      const headers = Object.fromEntries(response.headers.entries());
      
      return {
        status: response.status,
        statusText: response.statusText,
        responseText,
        headers,
        message: `Auth /me endpoint responded with status ${response.status}: ${responseText || 'No response body'}`
      };
    } catch (error: any) {
      return {
        status: 0,
        statusText: 'Error',
        responseText: '',
        headers: {},
        message: `Error testing /auth/me endpoint: ${error.message}`
      };
    }
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();

export default apiClient; 