// API service for PostgreSQL backend - Firebase removed
import { 
  User, 
  Club, 
  Team, 
  Event, 
  Tournament, 
  Payment, 
  Subscription,
  ApiResponse,
  ApiConfig,
  WebSocketConfig,
  RealTimeEvent
} from '../types';

// Define Match type locally since it's not exported from types
interface Match {
  id: string;
  title: string;
  homeTeamId: string;
  awayTeamId: string;
  startTime: Date;
  endTime?: Date;
  status: string;
  score?: {
    home: number;
    away: number;
  };
  events: any[];
  createdAt: Date;
  updatedAt: Date;
}

export class BaseAPI {
  protected baseURL: string;
  protected websocketURL: string;
  protected token: string | null = null;

  constructor(config: ApiConfig) {
    this.baseURL = config.baseUrl;
    this.websocketURL = config.websocketUrl;
    this.loadToken();
  }

  private loadToken(): void {
    if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
      this.token = globalThis.localStorage.getItem('auth_token');
    }
  }

  public setToken(token: string): void {
    this.token = token;
    if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
      globalThis.localStorage.setItem('auth_token', token);
    }
  }

  public clearToken(): void {
    this.token = null;
    if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
      globalThis.localStorage.removeItem('auth_token');
    }
  }

  protected async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json() as ApiResponse<T>;

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  protected async getDocument<T>(endpoint: string): Promise<T | null> {
    try {
      const response = await this.makeRequest<T>(endpoint);
      return response.data || null;
    } catch (error) {
      console.error(`Error getting document from ${endpoint}:`, error);
      return null;
    }
  }

  protected async getDocuments<T>(
    endpoint: string, 
    params?: Record<string, any>
  ): Promise<T[]> {
    try {
      const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
      const response = await this.makeRequest<T[]>(`${endpoint}${queryString}`);
      return response.data || [];
    } catch (error) {
      console.error(`Error getting documents from ${endpoint}:`, error);
      return [];
    }
  }

  protected async addDocument<T>(
    endpoint: string, 
    data: Partial<T>
  ): Promise<string> {
    try {
      const response = await this.makeRequest<{ id: string }>(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!response.data?.id) {
        throw new Error('Response missing document ID');
      }
      return response.data.id;
    } catch (error) {
      console.error(`Error adding document to ${endpoint}:`, error);
      throw new Error(`Failed to add document to ${endpoint}`);
    }
  }

  protected async updateDocument<T>(
    endpoint: string, 
    data: Partial<T>
  ): Promise<void> {
    try {
      await this.makeRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error(`Error updating document in ${endpoint}:`, error);
      throw new Error(`Failed to update document in ${endpoint}`);
    }
  }

  protected async deleteDocument(endpoint: string): Promise<void> {
    try {
      await this.makeRequest(endpoint, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error(`Error deleting document from ${endpoint}:`, error);
      throw new Error(`Failed to delete document from ${endpoint}`);
    }
  }

  // Real-time subscriptions (simplified for API-based approach)
  protected subscribeToDocument<T>(
    endpoint: string, 
    callback: (data: T | null) => void
  ): () => void {
    // For API-based approach, we'll use polling instead of real-time subscriptions
    const interval = setInterval(async () => {
      try {
        const data = await this.getDocument<T>(endpoint);
        callback(data);
      } catch (error) {
        console.error(`Error in document subscription for ${endpoint}:`, error);
        callback(null);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }

  protected subscribeToCollection<T>(
    endpoint: string,
    callback: (data: T[]) => void,
    params?: Record<string, any>
  ): () => void {
    // For API-based approach, we'll use polling instead of real-time subscriptions
    const interval = setInterval(async () => {
      try {
        const data = await this.getDocuments<T>(endpoint, params);
        callback(data);
      } catch (error) {
        console.error(`Error in collection subscription for ${endpoint}:`, error);
        callback([]);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }

  // WebSocket utilities for real-time communication
  protected createWebSocketConnection(
    endpoint: string,
    onMessage: (event: RealTimeEvent) => void,
    onError?: (error: globalThis.Event) => void,
    onClose?: () => void
  ): WebSocket {
    const ws = new WebSocket(`${this.websocketURL}${endpoint}`);
    
    ws.onmessage = (event) => {
      try {
        const data: RealTimeEvent = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    if (onError) ws.onerror = (event) => onError(event);
    if (onClose) ws.onclose = onClose;

    return ws;
  }

  // File upload utilities
  protected async uploadFile(
    endpoint: string, 
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }
}

// Authentication API
export class AuthAPI extends BaseAPI {
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
    try {
      const response = await this.makeRequest<{ user: User; token: string }>('/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      if (response.success && response.data) {
        this.setToken(response.data.token);
        return { success: true, user: response.data.user, token: response.data.token };
      } else {
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
    }
  }

  async register(userData: Partial<User>): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
    try {
      const response = await this.makeRequest<{ user: User; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      
      if (response.success && response.data) {
        this.setToken(response.data.token);
        return { success: true, user: response.data.user, token: response.data.token };
      } else {
        return { success: false, error: response.error || 'Registration failed' };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Registration failed' };
    }
  }

  async logout(): Promise<void> {
    this.clearToken();
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await this.makeRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch (error) {
      console.error('Password reset error:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await this.makeRequest<User>('/auth/me');
      return response.data ?? null;
    } catch (error) {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

// User API
export class UserAPI extends BaseAPI {
  async getUser(userId: string): Promise<User | null> {
    return this.getDocument<User>(`/users/${userId}`);
  }

  async getUsers(constraints: Array<{ field: string; operator: any; value: any }> = []): Promise<User[]> {
    const params: Record<string, any> = {};
    constraints.forEach(constraint => {
      params[constraint.field] = constraint.value;
    });
    return this.getDocuments<User>('/users', params);
  }

  async createUser(userData: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await this.makeRequest<{ user: User; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      
      if (response.success && response.data) {
        this.setToken(response.data.token);
        return { success: true, user: response.data.user };
      } else {
        return { success: false, error: response.error || 'Failed to create user' };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create user' };
    }
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<void> {
    await this.updateDocument<User>(`/users/${userId}`, userData);
  }

  async deleteUser(userId: string): Promise<void> {
    await this.deleteDocument(`/users/${userId}`);
  }

  subscribeToUser(userId: string, callback: (user: User | null) => void): () => void {
    return this.subscribeToDocument<User>(`/users/${userId}`, callback);
  }

  subscribeToUsers(constraints: Array<{ field: string; operator: any; value: any }> = [], callback: (users: User[]) => void): () => void {
    const params: Record<string, any> = {};
    constraints.forEach(constraint => {
      params[constraint.field] = constraint.value;
    });
    return this.subscribeToCollection<User>('/users', callback, params);
  }
}

// Club API
export class ClubAPI extends BaseAPI {
  async getClub(clubId: string): Promise<Club | null> {
    return this.getDocument<Club>(`/clubs/${clubId}`);
  }

  async getClubs(constraints: Array<{ field: string; operator: any; value: any }> = []): Promise<Club[]> {
    const params: Record<string, any> = {};
    constraints.forEach(constraint => {
      params[constraint.field] = constraint.value;
    });
    return this.getDocuments<Club>('/clubs', params);
  }

  async createClub(clubData: Partial<Club>): Promise<string> {
    return this.addDocument<Club>('/clubs', clubData);
  }

  async updateClub(clubId: string, clubData: Partial<Club>): Promise<void> {
    await this.updateDocument<Club>(`/clubs/${clubId}`, clubData);
  }

  async deleteClub(clubId: string): Promise<void> {
    await this.deleteDocument(`/clubs/${clubId}`);
  }

  async uploadClubLogo(clubId: string, file: File): Promise<string> {
    const path = `/clubs/${clubId}/logo`;
    return this.uploadFile(path, file);
  }

  subscribeToClub(clubId: string, callback: (club: Club | null) => void): () => void {
    return this.subscribeToDocument<Club>(`/clubs/${clubId}`, callback);
  }

  subscribeToClubs(constraints: Array<{ field: string; operator: any; value: any }> = [], callback: (clubs: Club[]) => void): () => void {
    const params: Record<string, any> = {};
    constraints.forEach(constraint => {
      params[constraint.field] = constraint.value;
    });
    return this.subscribeToCollection<Club>('/clubs', callback, params);
  }
}

// Team API
export class TeamAPI extends BaseAPI {
  async getTeam(teamId: string): Promise<Team | null> {
    return this.getDocument<Team>(`/teams/${teamId}`);
  }

  async getTeams(constraints: Array<{ field: string; operator: any; value: any }> = []): Promise<Team[]> {
    const params: Record<string, any> = {};
    constraints.forEach(constraint => {
      params[constraint.field] = constraint.value;
    });
    return this.getDocuments<Team>('/teams', params);
  }

  async createTeam(teamData: Partial<Team>): Promise<string> {
    return this.addDocument<Team>('/teams', teamData);
  }

  async updateTeam(teamId: string, teamData: Partial<Team>): Promise<void> {
    await this.updateDocument<Team>(`/teams/${teamId}`, teamData);
  }

  async deleteTeam(teamId: string): Promise<void> {
    await this.deleteDocument(`/teams/${teamId}`);
  }

  async addPlayerToTeam(teamId: string, playerId: string): Promise<void> {
    const team = await this.getTeam(teamId);
    if (!team) throw new Error('Team not found');
    
    const updatedRoster = {
      ...team.roster,
      players: [...team.roster.players, playerId]
    };
    
    await this.updateTeam(teamId, { roster: updatedRoster });
  }

  async removePlayerFromTeam(teamId: string, playerId: string): Promise<void> {
    const team = await this.getTeam(teamId);
    if (!team) throw new Error('Team not found');
    
    const updatedRoster = {
      ...team.roster,
      players: team.roster.players.filter(id => id !== playerId)
    };
    
    await this.updateTeam(teamId, { roster: updatedRoster });
  }

  subscribeToTeam(teamId: string, callback: (team: Team | null) => void): () => void {
    return this.subscribeToDocument<Team>(`/teams/${teamId}`, callback);
  }

  subscribeToTeams(constraints: Array<{ field: string; operator: any; value: any }> = [], callback: (teams: Team[]) => void): () => void {
    const params: Record<string, any> = {};
    constraints.forEach(constraint => {
      params[constraint.field] = constraint.value;
    });
    return this.subscribeToCollection<Team>('/teams', callback, params);
  }
}

// Event API
export class EventAPI extends BaseAPI {
  async getEvent(eventId: string): Promise<Event | null> {
    return this.getDocument<Event>(`/events/${eventId}`);
  }

  async getEvents(constraints: Array<{ field: string; operator: any; value: any }> = []): Promise<Event[]> {
    const params: Record<string, any> = {};
    constraints.forEach(constraint => {
      params[constraint.field] = constraint.value;
    });
    return this.getDocuments<Event>('/events', params);
  }

  async createEvent(eventData: Partial<Event>): Promise<string> {
    return this.addDocument<Event>('/events', eventData);
  }

  async updateEvent(eventId: string, eventData: Partial<Event>): Promise<void> {
    await this.updateDocument<Event>(`/events/${eventId}`, eventData);
  }

  async deleteEvent(eventId: string): Promise<void> {
    await this.deleteDocument(`/events/${eventId}`);
  }

  subscribeToEvent(eventId: string, callback: (event: Event | null) => void): () => void {
    return this.subscribeToDocument<Event>(`/events/${eventId}`, callback);
  }

  subscribeToEvents(constraints: Array<{ field: string; operator: any; value: any }> = [], callback: (events: Event[]) => void): () => void {
    const params: Record<string, any> = {};
    constraints.forEach(constraint => {
      params[constraint.field] = constraint.value;
    });
    return this.subscribeToCollection<Event>('/events', callback, params);
  }
}

// Match API
export class MatchAPI extends BaseAPI {
  async getMatch(matchId: string): Promise<Match | null> {
    return this.getDocument<Match>(`/matches/${matchId}`);
  }

  async getMatches(constraints: Array<{ field: string; operator: any; value: any }> = []): Promise<Match[]> {
    const params: Record<string, any> = {};
    constraints.forEach(constraint => {
      params[constraint.field] = constraint.value;
    });
    return this.getDocuments<Match>('/matches', params);
  }

  async createMatch(matchData: Partial<Match>): Promise<string> {
    return this.addDocument<Match>('/matches', matchData);
  }

  async updateMatch(matchId: string, matchData: Partial<Match>): Promise<void> {
    await this.updateDocument<Match>(`/matches/${matchId}`, matchData);
  }

  async deleteMatch(matchId: string): Promise<void> {
    await this.deleteDocument(`/matches/${matchId}`);
  }

  async addMatchEvent(matchId: string, eventData: any): Promise<void> {
    // This will trigger the Cloud Function to update stats
    await this.makeRequest(`/matches/${matchId}/events`, {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  subscribeToMatch(matchId: string, callback: (match: Match | null) => void): () => void {
    return this.subscribeToDocument<Match>(`/matches/${matchId}`, callback);
  }

  subscribeToMatches(constraints: Array<{ field: string; operator: any; value: any }> = [], callback: (matches: Match[]) => void): () => void {
    const params: Record<string, any> = {};
    constraints.forEach(constraint => {
      params[constraint.field] = constraint.value;
    });
    return this.subscribeToCollection<Match>('/matches', callback, params);
  }
}

// Tournament API
export class TournamentAPI extends BaseAPI {
  async getTournament(tournamentId: string): Promise<Tournament | null> {
    return this.getDocument<Tournament>(`/tournaments/${tournamentId}`);
  }

  async getTournaments(constraints: Array<{ field: string; operator: any; value: any }> = []): Promise<Tournament[]> {
    const params: Record<string, any> = {};
    constraints.forEach(constraint => {
      params[constraint.field] = constraint.value;
    });
    return this.getDocuments<Tournament>('/tournaments', params);
  }

  async createTournament(tournamentData: Partial<Tournament>): Promise<string> {
    return this.addDocument<Tournament>('/tournaments', tournamentData);
  }

  async updateTournament(tournamentId: string, tournamentData: Partial<Tournament>): Promise<void> {
    await this.updateDocument<Tournament>(`/tournaments/${tournamentId}`, tournamentData);
  }

  async deleteTournament(tournamentId: string): Promise<void> {
    await this.deleteDocument(`/tournaments/${tournamentId}`);
  }

  async generateBrackets(tournamentId: string): Promise<void> {
    await this.makeRequest(`/tournaments/${tournamentId}/generate-brackets`, { method: 'POST' });
  }

  subscribeToTournament(tournamentId: string, callback: (tournament: Tournament | null) => void): () => void {
    return this.subscribeToDocument<Tournament>(`/tournaments/${tournamentId}`, callback);
  }

  subscribeToTournaments(constraints: Array<{ field: string; operator: any; value: any }> = [], callback: (tournaments: Tournament[]) => void): () => void {
    const params: Record<string, any> = {};
    constraints.forEach(constraint => {
      params[constraint.field] = constraint.value;
    });
    return this.subscribeToCollection<Tournament>('/tournaments', callback, params);
  }
}

// Message API
export class MessageAPI extends BaseAPI {
  async getMessage(messageId: string): Promise<any | null> { // Changed to any as Message type is removed
    return this.getDocument<any>(`/messages/${messageId}`);
  }

  async getMessages(constraints: Array<{ field: string; operator: any; value: any }> = []): Promise<any[]> { // Changed to any as Message type is removed
    const params: Record<string, any> = {};
    constraints.forEach(constraint => {
      params[constraint.field] = constraint.value;
    });
    return this.getDocuments<any>('/messages', params);
  }

  async sendMessage(messageData: Partial<any>): Promise<string> { // Changed to any as Message type is removed
    return this.addDocument<any>('/messages', messageData);
  }

  async updateMessage(messageId: string, messageData: Partial<any>): Promise<void> { // Changed to any as Message type is removed
    await this.updateDocument<any>(`/messages/${messageId}`, messageData);
  }

  async deleteMessage(messageId: string): Promise<void> {
    await this.deleteDocument(`/messages/${messageId}`);
  }

  async markAsRead(messageId: string, userId: string): Promise<void> {
    const message = await this.getMessage(messageId);
    if (!message) throw new Error('Message not found');
    
    const updatedReadBy = [...message.readBy, userId];
    await this.updateMessage(messageId, { readBy: updatedReadBy });
  }

  subscribeToMessages(constraints: Array<{ field: string; operator: any; value: any }> = [], callback: (messages: any[]) => void): () => void { // Changed to any as Message type is removed
    const params: Record<string, any> = {};
    constraints.forEach(constraint => {
      params[constraint.field] = constraint.value;
    });
    return this.subscribeToCollection<any>('/messages', callback, params);
  }
}

// Payment API
export class PaymentAPI extends BaseAPI {
  async getPayment(paymentId: string): Promise<Payment | null> {
    return this.getDocument<Payment>(`/payments/${paymentId}`);
  }

  async getPayments(constraints: Array<{ field: string; operator: any; value: any }> = []): Promise<Payment[]> {
    const params: Record<string, any> = {};
    constraints.forEach(constraint => {
      params[constraint.field] = constraint.value;
    });
    return this.getDocuments<Payment>('/payments', params);
  }

  async createPayment(paymentData: Partial<Payment>): Promise<string> {
    return this.addDocument<Payment>('/payments', paymentData);
  }

  async updatePayment(paymentId: string, paymentData: Partial<Payment>): Promise<void> {
    await this.updateDocument<Payment>(`/payments/${paymentId}`, paymentData);
  }

  async createPaymentIntent(amount: number, currency: string, description: string): Promise<any> {
    return this.makeRequest<any>('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({ amount, currency, description }),
    });
  }

  async confirmPayment(paymentIntentId: string): Promise<any> {
    return this.makeRequest<any>('/payments/confirm-intent', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId }),
    });
  }

  subscribeToPayments(constraints: Array<{ field: string; operator: any; value: any }> = [], callback: (payments: Payment[]) => void): () => void {
    const params: Record<string, any> = {};
    constraints.forEach(constraint => {
      params[constraint.field] = constraint.value;
    });
    return this.subscribeToCollection<Payment>('/payments', callback, params);
  }
}

// Notification API
export class NotificationAPI extends BaseAPI {
  async getNotification(notificationId: string): Promise<any | null> { // Changed to any as Notification type is removed
    return this.getDocument<any>(`/notifications/${notificationId}`);
  }

  async getNotifications(constraints: Array<{ field: string; operator: any; value: any }> = []): Promise<any[]> { // Changed to any as Notification type is removed
    const params: Record<string, any> = {};
    constraints.forEach(constraint => {
      params[constraint.field] = constraint.value;
    });
    return this.getDocuments<any>('/notifications', params);
  }

  async createNotification(notificationData: Partial<any>): Promise<string> { // Changed to any as Notification type is removed
    return this.addDocument<any>('/notifications', notificationData);
  }

  async updateNotification(notificationId: string, notificationData: Partial<any>): Promise<void> { // Changed to any as Notification type is removed
    await this.updateDocument<any>(`/notifications/${notificationId}`, notificationData);
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.updateDocument<any>(`/notifications/${notificationId}`, { read: true });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.makeRequest(`/notifications/mark-all-read/${userId}`, { method: 'POST' });
  }

  subscribeToNotifications(constraints: Array<{ field: string; operator: any; value: any }> = [], callback: (notifications: any[]) => void): () => void { // Changed to any as Notification type is removed
    const params: Record<string, any> = {};
    constraints.forEach(constraint => {
      params[constraint.field] = constraint.value;
    });
    return this.subscribeToCollection<any>('/notifications', callback, params);
  }
}

// Main API class that combines all services
export class API {
  public auth: AuthAPI;
  public users: UserAPI;
  public clubs: ClubAPI;
  public teams: TeamAPI;
  public events: EventAPI;
  public matches: MatchAPI;
  public tournaments: TournamentAPI;
  public messages: MessageAPI;
  public payments: PaymentAPI;
  public notifications: NotificationAPI;

  constructor(config: ApiConfig) {
    this.auth = new AuthAPI(config);
    this.users = new UserAPI(config);
    this.clubs = new ClubAPI(config);
    this.teams = new TeamAPI(config);
    this.events = new EventAPI(config);
    this.matches = new MatchAPI(config);
    this.tournaments = new TournamentAPI(config);
    this.messages = new MessageAPI(config);
    this.payments = new PaymentAPI(config);
    this.notifications = new NotificationAPI(config);
  }
}

// Export the main API class
export default API; 