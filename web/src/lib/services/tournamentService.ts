// Firebase imports removed - will be replaced with API calls
import { 
  Tournament, 
  TournamentBracket, 
  TournamentMatch,
  TournamentStanding,
  ApiResponse 
} from '../../../../shared/src/types';
import apiClient from '../apiClient';

export class TournamentService {
  private static instance: TournamentService;

  public static getInstance(): TournamentService {
    if (!TournamentService.instance) {
      TournamentService.instance = new TournamentService();
    }
    return TournamentService.instance;
  }

  // Get tournament by ID
  async getTournament(tournamentId: string): Promise<Tournament> {
    try {
      const response = await apiClient.getTournament(tournamentId);
      return response.data;
    } catch (error) {
      console.error('Error getting tournament:', error);
      throw new Error('Failed to get tournament');
    }
  }

  // Get tournament brackets
  async getTournamentBrackets(tournamentId: string): Promise<TournamentBracket[]> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${apiClient.baseURL}/tournaments/${tournamentId}/brackets`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tournament brackets');
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error getting tournament brackets:', error);
      throw new Error('Failed to get tournament brackets');
    }
  }

  // Get tournament matches
  async getTournamentMatches(tournamentId: string): Promise<TournamentMatch[]> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${apiClient.baseURL}/tournaments/${tournamentId}/matches`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tournament matches');
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error getting tournament matches:', error);
      throw new Error('Failed to get tournament matches');
    }
  }

  // Get tournament standings
  async getTournamentStandings(tournamentId: string): Promise<TournamentStanding[]> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${apiClient.baseURL}/tournaments/${tournamentId}/standings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tournament standings');
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error getting tournament standings:', error);
      throw new Error('Failed to get tournament standings');
    }
  }

  // Create tournament
  async createTournament(tournamentData: Omit<Tournament, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const response = await apiClient.createTournament(tournamentData);
      return response.data.id;
    } catch (error) {
      console.error('Error creating tournament:', error);
      throw new Error('Failed to create tournament');
    }
  }

  // Update tournament
  async updateTournament(tournamentId: string, updates: Partial<Tournament>): Promise<void> {
    try {
      await apiClient.updateTournament(tournamentId, updates);
    } catch (error) {
      console.error('Error updating tournament:', error);
      throw new Error('Failed to update tournament');
    }
  }

  // Delete tournament
  async deleteTournament(tournamentId: string): Promise<void> {
    try {
      await apiClient.deleteTournament(tournamentId);
    } catch (error) {
      console.error('Error deleting tournament:', error);
      throw new Error('Failed to delete tournament');
    }
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

  subscribeToTournamentBrackets(tournamentId: string, callback: (brackets: TournamentBracket[]) => void): () => void {
    // For API-based approach, we'll use polling instead of real-time subscriptions
    const interval = setInterval(async () => {
      try {
        const brackets = await this.getTournamentBrackets(tournamentId);
        callback(brackets);
      } catch (error) {
        console.error('Error in tournament brackets subscription:', error);
        callback([]);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }

  subscribeToTournamentMatches(tournamentId: string, callback: (matches: TournamentMatch[]) => void): () => void {
    // For API-based approach, we'll use polling instead of real-time subscriptions
    const interval = setInterval(async () => {
      try {
        const matches = await this.getTournamentMatches(tournamentId);
        callback(matches);
      } catch (error) {
        console.error('Error in tournament matches subscription:', error);
        callback([]);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }

  subscribeToTournamentStandings(tournamentId: string, callback: (standings: TournamentStanding[]) => void): () => void {
    // For API-based approach, we'll use polling instead of real-time subscriptions
    const interval = setInterval(async () => {
      try {
        const standings = await this.getTournamentStandings(tournamentId);
        callback(standings);
      } catch (error) {
        console.error('Error in tournament standings subscription:', error);
        callback([]);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }
}

export const tournamentService = TournamentService.getInstance(); 