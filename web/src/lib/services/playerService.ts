import { 
  Player, 
  PlayerStats, 
  Team,
  ApiResponse 
} from '../../../../shared/src/types';
import apiClient from '../apiClient';

export class PlayerService {
  private static instance: PlayerService;

  public static getInstance(): PlayerService {
    if (!PlayerService.instance) {
      PlayerService.instance = new PlayerService();
    }
    return PlayerService.instance;
  }

  // Get all players with stats
  async getAllPlayersWithStats(): Promise<Player[]> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${apiClient.baseURL}/players`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch players');
      }

      const result = await response.json();
      const players = result.data || [];

      // Get stats for each player
      const playersWithStats = await Promise.all(
        players.map(async (player: Player) => {
          try {
            const statsResponse = await fetch(`${apiClient.baseURL}/players/${player.id}/stats`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${apiClient.getToken()}`,
              },
            });

            if (statsResponse.ok) {
              const statsResult = await statsResponse.json();
              player.stats = statsResult.data;
            }
          } catch (error) {
            console.error(`Error getting stats for player ${player.id}:`, error);
          }
          return player;
        })
      );

      return playersWithStats;
    } catch (error) {
      console.error('Error getting players with stats:', error);
      throw new Error('Failed to get players with stats');
    }
  }

  // Get player by ID
  async getPlayer(playerId: string): Promise<Player> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${apiClient.baseURL}/players/${playerId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Player not found');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error getting player:', error);
      throw new Error('Failed to get player');
    }
  }

  // Get player stats
  async getPlayerStats(playerId: string): Promise<PlayerStats | null> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${apiClient.baseURL}/players/${playerId}/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch player stats');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error getting player stats:', error);
      throw new Error('Failed to get player stats');
    }
  }

  // Get teams (for player context)
  async getTeams(): Promise<Team[]> {
    try {
      const response = await apiClient.getTeams();
      return response.data || [];
    } catch (error) {
      console.error('Error getting teams:', error);
      throw new Error('Failed to get teams');
    }
  }

  // Create player
  async createPlayer(playerData: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${apiClient.baseURL}/players`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
        body: JSON.stringify(playerData),
      });

      if (!response.ok) {
        throw new Error('Failed to create player');
      }

      const result = await response.json();
      return result.data.id;
    } catch (error) {
      console.error('Error creating player:', error);
      throw new Error('Failed to create player');
    }
  }

  // Update player
  async updatePlayer(playerId: string, updates: Partial<Player>): Promise<void> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${apiClient.baseURL}/players/${playerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update player');
      }
    } catch (error) {
      console.error('Error updating player:', error);
      throw new Error('Failed to update player');
    }
  }

  // Update player stats
  async updatePlayerStats(playerId: string, stats: Partial<PlayerStats>): Promise<void> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${apiClient.baseURL}/players/${playerId}/stats`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
        body: JSON.stringify(stats),
      });

      if (!response.ok) {
        throw new Error('Failed to update player stats');
      }
    } catch (error) {
      console.error('Error updating player stats:', error);
      throw new Error('Failed to update player stats');
    }
  }

  // Delete player
  async deletePlayer(playerId: string): Promise<void> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${apiClient.baseURL}/players/${playerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete player');
      }
    } catch (error) {
      console.error('Error deleting player:', error);
      throw new Error('Failed to delete player');
    }
  }

  // Real-time subscriptions (simplified for API-based approach)
  subscribeToPlayer(playerId: string, callback: (player: Player) => void): () => void {
    // For API-based approach, we'll use polling instead of real-time subscriptions
    const interval = setInterval(async () => {
      try {
        const player = await this.getPlayer(playerId);
        callback(player);
      } catch (error) {
        console.error('Error in player subscription:', error);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }

  subscribeToPlayerStats(playerId: string, callback: (stats: PlayerStats | null) => void): () => void {
    // For API-based approach, we'll use polling instead of real-time subscriptions
    const interval = setInterval(async () => {
      try {
        const stats = await this.getPlayerStats(playerId);
        callback(stats);
      } catch (error) {
        console.error('Error in player stats subscription:', error);
        callback(null);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }
}

export const playerService = PlayerService.getInstance(); 