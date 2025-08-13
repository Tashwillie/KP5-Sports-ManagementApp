// Firebase imports removed - will be replaced with API calls
import { User, Club, Team, Event, Tournament, Message, Notification, Payment, Registration } from '../types';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = 'http://localhost:3001/api') {
    this.baseUrl = baseUrl;
    this.loadToken();
  }

  // Token management
  private loadToken(): void {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  private saveToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  private clearToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private setAuthHeaders(headers: HeadersInit): HeadersInit {
    if (this.token) {
      return {
        ...headers,
        Authorization: `Bearer ${this.token}`
      };
    }
    return headers;
  }

  // HTTP methods
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const finalHeaders = this.setAuthHeaders(headers);

    try {
      const response = await fetch(url, {
        ...options,
        headers: finalHeaders,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async register(userData: {
    email: string;
    password: string;
    displayName: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data?.token) {
      this.saveToken(response.data.token);
    }

    return response;
  }

  async login(credentials: { email: string; password: string }): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data?.token) {
      this.saveToken(response.data.token);
    }

    return response;
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });

    this.clearToken();
    return response;
  }

  async refreshToken(): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>('/auth/refresh-token', {
      method: 'POST',
    });

    if (response.success && response.data?.token) {
      this.saveToken(response.data.token);
    }

    return response;
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/auth/me');
  }

  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Users
  async getUsers(params?: { page?: number; limit?: number; role?: string }): Promise<PaginatedResponse<User>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.role) queryParams.append('role', params.role);

    return this.request<User[]>(`/users?${queryParams}`);
  }

  async getUser(id: string): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>(`/users/${id}`);
  }

  async updateUser(id: string, userData: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string): Promise<ApiResponse> {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Clubs
  async getClubs(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Club>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return this.request<Club[]>(`/clubs?${queryParams}`);
  }

  async getClub(id: string): Promise<ApiResponse<{ club: Club }>> {
    return this.request<{ club: Club }>(`/clubs/${id}`);
  }

  async createClub(clubData: Partial<Club>): Promise<ApiResponse<{ club: Club }>> {
    return this.request<{ club: Club }>('/clubs', {
      method: 'POST',
      body: JSON.stringify(clubData),
    });
  }

  async updateClub(id: string, clubData: Partial<Club>): Promise<ApiResponse<{ club: Club }>> {
    return this.request<{ club: Club }>(`/clubs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clubData),
    });
  }

  async deleteClub(id: string): Promise<ApiResponse> {
    return this.request(`/clubs/${id}`, {
      method: 'DELETE',
    });
  }

  // Teams
  async getTeams(params?: { page?: number; limit?: number; clubId?: string }): Promise<PaginatedResponse<Team>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.clubId) queryParams.append('clubId', params.clubId);

    return this.request<Team[]>(`/teams?${queryParams}`);
  }

  async getTeam(id: string): Promise<ApiResponse<{ team: Team }>> {
    return this.request<{ team: Team }>(`/teams/${id}`);
  }

  async createTeam(teamData: Partial<Team>): Promise<ApiResponse<{ team: Team }>> {
    return this.request<{ team: Team }>('/teams', {
      method: 'POST',
      body: JSON.stringify(teamData),
    });
  }

  async updateTeam(id: string, teamData: Partial<Team>): Promise<ApiResponse<{ team: Team }>> {
    return this.request<{ team: Team }>(`/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(teamData),
    });
  }

  async deleteTeam(id: string): Promise<ApiResponse> {
    return this.request(`/teams/${id}`, {
      method: 'DELETE',
    });
  }

  // Events
  async getEvents(params?: { page?: number; limit?: number; teamId?: string; clubId?: string }): Promise<PaginatedResponse<Event>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.teamId) queryParams.append('teamId', params.teamId);
    if (params?.clubId) queryParams.append('clubId', params.clubId);

    return this.request<Event[]>(`/events?${queryParams}`);
  }

  async getEvent(id: string): Promise<ApiResponse<{ event: Event }>> {
    return this.request<{ event: Event }>(`/events/${id}`);
  }

  async createEvent(eventData: Partial<Event>): Promise<ApiResponse<{ event: Event }>> {
    return this.request<{ event: Event }>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateEvent(id: string, eventData: Partial<Event>): Promise<ApiResponse<{ event: Event }>> {
    return this.request<{ event: Event }>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(id: string): Promise<ApiResponse> {
    return this.request(`/events/${id}`, {
      method: 'DELETE',
    });
  }

  // Tournaments
  async getTournaments(params?: { page?: number; limit?: number; clubId?: string; status?: string }): Promise<PaginatedResponse<Tournament>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.clubId) queryParams.append('clubId', params.clubId);
    if (params?.status) queryParams.append('status', params.status);

    return this.request<Tournament[]>(`/tournaments?${queryParams}`);
  }

  async getTournament(id: string): Promise<ApiResponse<{ tournament: Tournament }>> {
    return this.request<{ tournament: Tournament }>(`/tournaments/${id}`);
  }

  async createTournament(tournamentData: Partial<Tournament>): Promise<ApiResponse<{ tournament: Tournament }>> {
    return this.request<{ tournament: Tournament }>('/tournaments', {
      method: 'POST',
      body: JSON.stringify(tournamentData),
    });
  }

  async updateTournament(id: string, tournamentData: Partial<Tournament>): Promise<ApiResponse<{ tournament: Tournament }>> {
    return this.request<{ tournament: Tournament }>(`/tournaments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tournamentData),
    });
  }

  async deleteTournament(id: string): Promise<ApiResponse> {
    return this.request(`/tournaments/${id}`, {
      method: 'DELETE',
    });
  }

  // Messages
  async getMessages(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Message>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return this.request<Message[]>(`/messages?${queryParams}`);
  }

  async sendMessage(messageData: Partial<Message>): Promise<ApiResponse<{ message: Message }>> {
    return this.request<{ message: Message }>('/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  // Notifications
  async getNotifications(params?: { page?: number; limit?: number; read?: boolean }): Promise<PaginatedResponse<Notification>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.read !== undefined) queryParams.append('read', params.read.toString());

    return this.request<Notification[]>(`/notifications?${queryParams}`);
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse> {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  // Payments
  async getPayments(params?: { page?: number; limit?: number; status?: string }): Promise<PaginatedResponse<Payment>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    return this.request<Payment[]>(`/payments?${queryParams}`);
  }

  async createPayment(paymentData: Partial<Payment>): Promise<ApiResponse<{ payment: Payment }>> {
    return this.request<{ payment: Payment }>('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  // Registrations
  async getRegistrations(params?: { page?: number; limit?: number; type?: string; status?: string }): Promise<PaginatedResponse<Registration>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);

    return this.request<Registration[]>(`/registrations?${queryParams}`);
  }

  async createRegistration(registrationData: Partial<Registration>): Promise<ApiResponse<{ registration: Registration }>> {
    return this.request<{ registration: Registration }>('/registrations', {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Export the class for testing or custom instances
export { ApiClient }; 