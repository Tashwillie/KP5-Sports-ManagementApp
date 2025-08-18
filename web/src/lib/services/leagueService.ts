// Firebase imports removed - will be replaced with API calls
import { 
  League, 
  LeagueStanding, 
  LeagueTeamStats,
  ApiResponse 
} from '@shared/types';
import apiClient from '../apiClient';

export class LeagueService {
  private static instance: LeagueService;

  public static getInstance(): LeagueService {
    if (!LeagueService.instance) {
      LeagueService.instance = new LeagueService();
    }
    return LeagueService.instance;
  }

  // Get league by ID
  async getLeague(leagueId: string): Promise<League> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/leagues/${leagueId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('League not found');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error getting league:', error);
      throw new Error('Failed to get league');
    }
  }

  // Get league standings
  async getLeagueStandings(leagueId: string, divisionId?: string): Promise<LeagueStanding[]> {
    try {
      // Note: This would need to be implemented in the backend API
      const params = new URLSearchParams();
      if (divisionId) {
        params.append('divisionId', divisionId);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/leagues/${leagueId}/standings?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch league standings');
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error getting league standings:', error);
      throw new Error('Failed to get league standings');
    }
  }

  // Create league
  async createLeague(leagueData: Omit<League, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/leagues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
        body: JSON.stringify(leagueData),
      });

      if (!response.ok) {
        throw new Error('Failed to create league');
      }

      const result = await response.json();
      return result.data.id;
    } catch (error) {
      console.error('Error creating league:', error);
      throw new Error('Failed to create league');
    }
  }

  // Update league
  async updateLeague(leagueId: string, updates: Partial<League>): Promise<void> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/leagues/${leagueId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update league');
      }
    } catch (error) {
      console.error('Error updating league:', error);
      throw new Error('Failed to update league');
    }
  }

  // Delete league
  async deleteLeague(leagueId: string): Promise<void> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/leagues/${leagueId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete league');
      }
    } catch (error) {
      console.error('Error deleting league:', error);
      throw new Error('Failed to delete league');
    }
  }

  // Real-time subscriptions (simplified for API-based approach)
  subscribeToLeague(leagueId: string, callback: (league: League) => void): () => void {
    // For API-based approach, we'll use polling instead of real-time subscriptions
    const interval = setInterval(async () => {
      try {
        const league = await this.getLeague(leagueId);
        callback(league);
      } catch (error) {
        console.error('Error in league subscription:', error);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }

  subscribeToLeagueStandings(leagueId: string, divisionId: string | undefined, callback: (standings: LeagueStanding[]) => void): () => void {
    // For API-based approach, we'll use polling instead of real-time subscriptions
    const interval = setInterval(async () => {
      try {
        const standings = await this.getLeagueStandings(leagueId, divisionId);
        callback(standings);
      } catch (error) {
        console.error('Error in league standings subscription:', error);
        callback([]);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }
}

export const leagueService = LeagueService.getInstance(); 