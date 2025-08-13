import { 
  Club, 
  Team, 
  Event, 
  Player,
  ApiResponse 
} from '../../../../shared/src/types';
import apiClient from '../apiClient';

interface ClubStats {
  totalTeams: number;
  totalPlayers: number;
  totalMatches: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
}

export class PublicService {
  private static instance: PublicService;

  public static getInstance(): PublicService {
    if (!PublicService.instance) {
      PublicService.instance = new PublicService();
    }
    return PublicService.instance;
  }

  // Get public club by slug
  async getPublicClub(clubSlug: string): Promise<Club> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/public/clubs/${clubSlug}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Club not found or not public');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error getting public club:', error);
      throw new Error('Failed to get public club');
    }
  }

  // Get club teams
  async getClubTeams(clubSlug: string): Promise<Team[]> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/public/clubs/${clubSlug}/teams`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch club teams');
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error getting club teams:', error);
      throw new Error('Failed to get club teams');
    }
  }

  // Get club events
  async getClubEvents(clubSlug: string): Promise<Event[]> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/public/clubs/${clubSlug}/events`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch club events');
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error getting club events:', error);
      throw new Error('Failed to get club events');
    }
  }

  // Get club statistics
  async getClubStats(clubSlug: string): Promise<ClubStats> {
    try {
      const [teams, events] = await Promise.all([
        this.getClubTeams(clubSlug),
        this.getClubEvents(clubSlug),
      ]);

      const totalTeams = teams.length;
      const totalPlayers = teams.reduce((sum, team) => sum + (team.roster?.players?.length || 0), 0);
      const totalMatches = events.filter(event => event.type === 'match').length;

      // Calculate wins, losses, draws from match events
      let totalWins = 0;
      let totalLosses = 0;
      let totalDraws = 0;

      events.forEach(event => {
        if (event.type === 'match' && event.homeScore !== undefined && event.awayScore !== undefined) {
          if (event.homeScore > event.awayScore) {
            totalWins++;
          } else if (event.homeScore < event.awayScore) {
            totalLosses++;
          } else {
            totalDraws++;
          }
        }
      });

      return {
        totalTeams,
        totalPlayers,
        totalMatches,
        totalWins,
        totalLosses,
        totalDraws,
      };
    } catch (error) {
      console.error('Error getting club stats:', error);
      throw new Error('Failed to get club stats');
    }
  }

  // Get public team
  async getPublicTeam(teamId: string): Promise<Team> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/public/teams/${teamId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Team not found or not public');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error getting public team:', error);
      throw new Error('Failed to get public team');
    }
  }

  // Get team players
  async getTeamPlayers(teamId: string): Promise<Player[]> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/public/teams/${teamId}/players`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch team players');
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error getting team players:', error);
      throw new Error('Failed to get team players');
    }
  }

  // Get team events
  async getTeamEvents(teamId: string): Promise<Event[]> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/public/teams/${teamId}/events`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch team events');
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error getting team events:', error);
      throw new Error('Failed to get team events');
    }
  }

  // Search public clubs
  async searchPublicClubs(searchTerm: string, filters?: {
    location?: string;
    sport?: string;
    limit?: number;
  }): Promise<Club[]> {
    try {
      // Note: This would need to be implemented in the backend API
      const params = new URLSearchParams({
        search: searchTerm,
        ...(filters?.location && { location: filters.location }),
        ...(filters?.sport && { sport: filters.sport }),
        ...(filters?.limit && { limit: filters.limit.toString() }),
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/public/clubs/search?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to search clubs');
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error searching public clubs:', error);
      throw new Error('Failed to search public clubs');
    }
  }

  // Get featured clubs
  async getFeaturedClubs(limit: number = 6): Promise<Club[]> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/public/clubs/featured?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch featured clubs');
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error getting featured clubs:', error);
      throw new Error('Failed to get featured clubs');
    }
  }

  // Get upcoming public events
  async getUpcomingPublicEvents(limit: number = 10): Promise<Event[]> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/public/events/upcoming?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch upcoming events');
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error getting upcoming public events:', error);
      throw new Error('Failed to get upcoming public events');
    }
  }

  // Real-time subscriptions (simplified for API-based approach)
  subscribeToPublicClub(clubSlug: string, callback: (club: Club) => void): () => void {
    // For API-based approach, we'll use polling instead of real-time subscriptions
    const interval = setInterval(async () => {
      try {
        const club = await this.getPublicClub(clubSlug);
        callback(club);
      } catch (error) {
        console.error('Error in public club subscription:', error);
      }
    }, 30000); // Poll every 30 seconds for public data

    return () => clearInterval(interval);
  }

  subscribeToPublicTeam(teamId: string, callback: (team: Team) => void): () => void {
    // For API-based approach, we'll use polling instead of real-time subscriptions
    const interval = setInterval(async () => {
      try {
        const team = await this.getPublicTeam(teamId);
        callback(team);
      } catch (error) {
        console.error('Error in public team subscription:', error);
      }
    }, 30000); // Poll every 30 seconds for public data

    return () => clearInterval(interval);
  }
}

export const publicService = PublicService.getInstance(); 