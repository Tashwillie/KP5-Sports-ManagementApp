// Tournament service for PostgreSQL backend - Firebase removed
import { 
  Tournament, 
  TournamentType, 
  TournamentFormat, 
  TournamentStatus, 
  TournamentDivision, 
  TournamentBracket, 
  TournamentParticipant, 
  TournamentStanding,
  LeagueStanding
} from '../../../shared/src/types/tournament';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class TournamentService {
  private static instance: TournamentService;
  private baseURL: string;
  private token: string | null = null;

  public static getInstance(): TournamentService {
    if (!TournamentService.instance) {
      TournamentService.instance = new TournamentService();
    }
    return TournamentService.instance;
  }

  constructor() {
    this.baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';
    this.loadToken();
  }

  private async loadToken(): Promise<void> {
    try {
      this.token = await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error loading token:', error);
    }
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Tournament Management
  async getTournament(tournamentId: string): Promise<Tournament> {
    return this.makeRequest<Tournament>(`/tournaments/${tournamentId}`);
  }

  async getTournaments(params?: Record<string, any>): Promise<Tournament[]> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    const response = await this.makeRequest<{ data: Tournament[] }>(`/tournaments${queryString}`);
    return response.data || [];
  }

  async getTournamentsByClub(clubId: string): Promise<Tournament[]> {
    return this.makeRequest<Tournament[]>(`/tournaments?clubId=${clubId}`);
  }

  async createTournament(tournamentData: Partial<Tournament>): Promise<Tournament> {
    return this.makeRequest<Tournament>('/tournaments', {
      method: 'POST',
      body: JSON.stringify(tournamentData),
    });
  }

  async updateTournament(tournamentId: string, tournamentData: Partial<Tournament>): Promise<Tournament> {
    return this.makeRequest<Tournament>(`/tournaments/${tournamentId}`, {
      method: 'PUT',
      body: JSON.stringify(tournamentData),
    });
  }

  async deleteTournament(tournamentId: string): Promise<void> {
    await this.makeRequest(`/tournaments/${tournamentId}`, {
      method: 'DELETE',
    });
  }

  // Tournament Registration
  async registerTeam(tournamentId: string, teamId: string, divisionId?: string): Promise<void> {
    await this.makeRequest(`/tournaments/${tournamentId}/register`, {
      method: 'POST',
      body: JSON.stringify({ teamId, divisionId }),
    });
  }

  async unregisterTeam(tournamentId: string, teamId: string): Promise<void> {
    await this.makeRequest(`/tournaments/${tournamentId}/unregister`, {
      method: 'POST',
      body: JSON.stringify({ teamId }),
    });
  }

  async getParticipants(tournamentId: string): Promise<TournamentParticipant[]> {
    return this.makeRequest<TournamentParticipant[]>(`/tournaments/${tournamentId}/participants`);
  }

  // Tournament Divisions
  async getDivisions(tournamentId: string): Promise<TournamentDivision[]> {
    return this.makeRequest<TournamentDivision[]>(`/tournaments/${tournamentId}/divisions`);
  }

  async createDivision(tournamentId: string, divisionData: Partial<TournamentDivision>): Promise<TournamentDivision> {
    return this.makeRequest<TournamentDivision>(`/tournaments/${tournamentId}/divisions`, {
      method: 'POST',
      body: JSON.stringify(divisionData),
    });
  }

  async updateDivision(tournamentId: string, divisionId: string, divisionData: Partial<TournamentDivision>): Promise<TournamentDivision> {
    return this.makeRequest<TournamentDivision>(`/tournaments/${tournamentId}/divisions/${divisionId}`, {
      method: 'PUT',
      body: JSON.stringify(divisionData),
    });
  }

  async deleteDivision(tournamentId: string, divisionId: string): Promise<void> {
    await this.makeRequest(`/tournaments/${tournamentId}/divisions/${divisionId}`, {
      method: 'DELETE',
    });
  }

  // Tournament Brackets
  async getBrackets(tournamentId: string, divisionId?: string): Promise<TournamentBracket[]> {
    const params = divisionId ? `?divisionId=${divisionId}` : '';
    return this.makeRequest<TournamentBracket[]>(`/tournaments/${tournamentId}/brackets${params}`);
  }

  async generateBrackets(tournamentId: string, divisionId: string, teams: string[]): Promise<void> {
    await this.makeRequest(`/tournaments/${tournamentId}/divisions/${divisionId}/generate-brackets`, {
      method: 'POST',
      body: JSON.stringify({ teams }),
    });
  }

  async updateBracket(tournamentId: string, bracketId: string, bracketData: Partial<TournamentBracket>): Promise<TournamentBracket> {
    return this.makeRequest<TournamentBracket>(`/tournaments/${tournamentId}/brackets/${bracketId}`, {
      method: 'PUT',
      body: JSON.stringify(bracketData),
    });
  }

  // Tournament Standings
  async getTournamentStandings(tournamentId: string, divisionId?: string): Promise<TournamentStanding[]> {
    const params = divisionId ? `?divisionId=${divisionId}` : '';
    return this.makeRequest<TournamentStanding[]>(`/tournaments/${tournamentId}/standings${params}`);
  }

  async getLeagueStandings(leagueId: string, divisionId?: string): Promise<LeagueStanding[]> {
    const params = divisionId ? `?divisionId=${divisionId}` : '';
    return this.makeRequest<LeagueStanding[]>(`/leagues/${leagueId}/standings${params}`);
  }

  // Real-time subscriptions (simplified for API-based approach)
  subscribeToTournament(tournamentId: string, callback: (tournament: Tournament) => void): () => void {
    // For API-based approach, we'll use polling instead of real-time subscriptions
    const interval = setInterval(async () => {
      try {
        const tournament = await this.getTournament(tournamentId);
        callback(tournament);
      } catch (error) {
        console.error('Error in tournament subscription:', error);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }

  subscribeToTournaments(params: Record<string, any>, callback: (tournaments: Tournament[]) => void): () => void {
    // For API-based approach, we'll use polling instead of real-time subscriptions
    const interval = setInterval(async () => {
      try {
        const tournaments = await this.getTournaments(params);
        callback(tournaments);
      } catch (error) {
        console.error('Error in tournaments subscription:', error);
        callback([]);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }

  subscribeToStandings(tournamentId: string, divisionId: string, callback: (standings: TournamentStanding[]) => void): () => void {
    // For API-based approach, we'll use polling instead of real-time subscriptions
    const interval = setInterval(async () => {
      try {
        const standings = await this.getTournamentStandings(tournamentId, divisionId);
        callback(standings);
      } catch (error) {
        console.error('Error in standings subscription:', error);
        callback([]);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }

  // File Upload for Tournament Media
  async uploadTournamentMedia(tournamentId: string, file: File, uploadedBy: string, mediaData: {
    title: string;
    description?: string;
    type: 'photo' | 'video' | 'document';
    tags: string[];
    isPublic: boolean;
  }): Promise<{
    id: string;
    url: string;
    thumbnailUrl?: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadedBy', uploadedBy);
    formData.append('mediaData', JSON.stringify(mediaData));

    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}/tournaments/${tournamentId}/media`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error uploading tournament media:', error);
      throw new Error('Failed to upload media');
    }
  }
} 