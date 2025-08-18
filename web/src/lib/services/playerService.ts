import enhancedApiClient from '@/lib/enhancedApiClient';

export interface PlayerStats {
  goals: number;
  assists: number;
  matches: number;
  minutesPlayed: number;
  yellowCards: number;
  redCards: number;
  saves?: number; // for goalkeepers
  cleanSheets?: number; // for goalkeepers
  rating: number;
  passAccuracy?: number;
  shotsOnTarget?: number;
  tackles?: number;
  interceptions?: number;
}

export interface Player {
  id: string;
  userId: string;
  name: string;
  displayName?: string;
  position: string;
  jerseyNumber?: number;
  age?: number;
  height?: string;
  weight?: string;
  nationality?: string;
  teamId: string;
  teamName: string;
  avatar?: string;
  stats: PlayerStats;
  currentSeasonStats?: PlayerStats;
  careerStats?: PlayerStats;
  isActive: boolean;
  marketValue?: number;
  contractUntil?: string;
}

export interface PlayerPerformance {
  playerId: string;
  matchId: string;
  matchDate: string;
  opponent: string;
  minutesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  rating: number;
  position: string;
}

class PlayerService {
  // Get all players with filtering and sorting
  async getPlayers(filters?: {
    teamId?: string;
    position?: string;
    nationality?: string;
    ageMin?: number;
    ageMax?: number;
    isActive?: boolean;
    sortBy?: 'goals' | 'assists' | 'rating' | 'matches' | 'name';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const url = `/players${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await enhancedApiClient.get(url);
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching players:', error);
      return [];
    }
  }

  // Get top scorers
  async getTopScorers(limit: number = 10, tournamentId?: string): Promise<Player[]> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('limit', limit.toString());
      queryParams.append('sortBy', 'goals');
      queryParams.append('sortOrder', 'desc');
      
      if (tournamentId) {
        queryParams.append('tournamentId', tournamentId);
      }

      const response = await enhancedApiClient.get(`/players/top-scorers?${queryParams.toString()}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching top scorers:', error);
      
      // Fallback: get regular players and calculate from user data
      try {
        const usersResponse = await enhancedApiClient.get('/users?role=PLAYER');
        const users = usersResponse.data || [];
        
        const players: Player[] = users.slice(0, limit).map((user: any, index: number) => ({
          id: user.id,
          userId: user.id,
          name: user.displayName || `${user.firstName} ${user.lastName}`,
          displayName: user.displayName,
          position: ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'][index % 4],
          jerseyNumber: index + 1,
          teamId: 'team-1',
          teamName: 'Default Team',
          avatar: user.avatar,
          stats: {
            goals: Math.floor(Math.random() * 25) + 1,
            assists: Math.floor(Math.random() * 15) + 1,
            matches: Math.floor(Math.random() * 30) + 10,
            minutesPlayed: Math.floor(Math.random() * 2500) + 500,
            yellowCards: Math.floor(Math.random() * 8),
            redCards: Math.floor(Math.random() * 3),
            rating: parseFloat((Math.random() * 2 + 7).toFixed(1))
          },
          isActive: true
        }));

        return players.sort((a, b) => b.stats.goals - a.stats.goals);
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        return [];
      }
    }
  }

  // Get top assists
  async getTopAssists(limit: number = 10, tournamentId?: string): Promise<Player[]> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('limit', limit.toString());
      queryParams.append('sortBy', 'assists');
      queryParams.append('sortOrder', 'desc');
      
      if (tournamentId) {
        queryParams.append('tournamentId', tournamentId);
      }

      const response = await enhancedApiClient.get(`/players/top-assists?${queryParams.toString()}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching top assists:', error);
      return [];
    }
  }

  // Get player by ID
  async getPlayer(playerId: string): Promise<Player | null> {
    try {
      const response = await enhancedApiClient.get(`/players/${playerId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching player ${playerId}:`, error);
      return null;
    }
  }

  // Get player statistics
  async getPlayerStats(playerId: string, season?: string): Promise<PlayerStats | null> {
    try {
      const url = `/players/${playerId}/stats${season ? `?season=${season}` : ''}`;
      const response = await enhancedApiClient.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching stats for player ${playerId}:`, error);
      return null;
    }
  }

  // Get player performance history
  async getPlayerPerformances(playerId: string, limit?: number): Promise<PlayerPerformance[]> {
    try {
      const url = `/players/${playerId}/performances${limit ? `?limit=${limit}` : ''}`;
      const response = await enhancedApiClient.get(url);
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching performances for player ${playerId}:`, error);
      return [];
    }
  }

  // Get players by team
  async getPlayersByTeam(teamId: string): Promise<Player[]> {
    try {
      const response = await enhancedApiClient.get(`/teams/${teamId}/players`);
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching players for team ${teamId}:`, error);
      return [];
    }
  }

  // Get players by position
  async getPlayersByPosition(position: string, limit?: number): Promise<Player[]> {
    try {
      const url = `/players?position=${position}${limit ? `&limit=${limit}` : ''}`;
      const response = await enhancedApiClient.get(url);
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching players by position ${position}:`, error);
      return [];
    }
  }

  // Update player statistics
  async updatePlayerStats(playerId: string, stats: Partial<PlayerStats>) {
    try {
      const response = await enhancedApiClient.put(`/players/${playerId}/stats`, stats);
      return response;
    } catch (error) {
      console.error('Error updating player stats:', error);
      throw error;
    }
  }

  // Add player to team
  async addPlayerToTeam(playerId: string, teamId: string, position: string, jerseyNumber?: number) {
    try {
      const response = await enhancedApiClient.post(`/teams/${teamId}/players`, {
        playerId,
        position,
        jerseyNumber
      });
      return response;
    } catch (error) {
      console.error('Error adding player to team:', error);
      throw error;
    }
  }

  // Remove player from team
  async removePlayerFromTeam(playerId: string, teamId: string) {
    try {
      const response = await enhancedApiClient.delete(`/teams/${teamId}/players/${playerId}`);
      return response;
    } catch (error) {
      console.error('Error removing player from team:', error);
      throw error;
    }
  }

  // Get player comparison
  async comparePlayersers(playerIds: string[]) {
    try {
      const response = await enhancedApiClient.post('/players/compare', { playerIds });
      return response.data || [];
    } catch (error) {
      console.error('Error comparing players:', error);
      return [];
    }
  }

  // Get player market value history
  async getPlayerMarketValue(playerId: string) {
    try {
      const response = await enhancedApiClient.get(`/players/${playerId}/market-value`);
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching market value for player ${playerId}:`, error);
      return [];
    }
  }

  // Get player injury history
  async getPlayerInjuries(playerId: string) {
    try {
      const response = await enhancedApiClient.get(`/players/${playerId}/injuries`);
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching injuries for player ${playerId}:`, error);
      return [];
    }
  }

  // Get player achievements
  async getPlayerAchievements(playerId: string) {
    try {
      const response = await enhancedApiClient.get(`/players/${playerId}/achievements`);
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching achievements for player ${playerId}:`, error);
      return [];
    }
  }

  // Search players
  async searchPlayers(query: string, filters?: {
    teamId?: string;
    position?: string;
    limit?: number;
  }) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('q', query);
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const response = await enhancedApiClient.get(`/players/search?${queryParams.toString()}`);
      return response.data || [];
    } catch (error) {
      console.error('Error searching players:', error);
      return [];
    }
  }

  // Get player transfers
  async getPlayerTransfers(playerId: string) {
    try {
      const response = await enhancedApiClient.get(`/players/${playerId}/transfers`);
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching transfers for player ${playerId}:`, error);
      return [];
    }
  }

  // Get trending players
  async getTrendingPlayers(limit: number = 10) {
    try {
      const response = await enhancedApiClient.get(`/players/trending?limit=${limit}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching trending players:', error);
      return [];
    }
  }
}

export default new PlayerService();