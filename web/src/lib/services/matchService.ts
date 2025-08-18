import enhancedApiClient from '@/lib/enhancedApiClient';

export interface MatchStats {
  possession: {
    home: number;
    away: number;
  };
  shots: {
    home: number;
    away: number;
  };
  shotsOnTarget: {
    home: number;
    away: number;
  };
  corners: {
    home: number;
    away: number;
  };
  fouls: {
    home: number;
    away: number;
  };
  yellowCards: {
    home: number;
    away: number;
  };
  redCards: {
    home: number;
    away: number;
  };
}

export interface MatchEvent {
  id: string;
  matchId: string;
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'half_time' | 'full_time';
  minute: number;
  player: {
    id: string;
    name: string;
  };
  team: 'home' | 'away';
  description: string;
  timestamp: string;
}

export interface LiveMatch {
  id: string;
  title: string;
  homeTeam: {
    id: string;
    name: string;
    logo?: string;
  };
  awayTeam: {
    id: string;
    name: string;
    logo?: string;
  };
  score: {
    home: number;
    away: number;
  };
  status: 'live' | 'halftime' | 'finished';
  minute: number;
  period: 'first_half' | 'second_half' | 'extra_time' | 'penalties';
  events: MatchEvent[];
  stats?: MatchStats;
  venue?: string;
  startTime: string;
}

class MatchService {
  // Get all matches with filtering
  async getMatches(filters?: {
    status?: string;
    date?: string;
    teamId?: string;
    tournamentId?: string;
    limit?: number;
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

      const url = `/matches${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await enhancedApiClient.get(url);
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching matches:', error);
      return [];
    }
  }

  // Get live matches
  async getLiveMatches(): Promise<LiveMatch[]> {
    try {
      const response = await enhancedApiClient.get('/matches?status=live');
      const matches = response.data || [];

      // Enhance matches with live data
      const liveMatches = await Promise.all(
        matches.map(async (match: any) => {
          const events = await this.getMatchEvents(match.id);
          const stats = await this.getMatchStats(match.id);

          return {
            id: match.id,
            title: match.title,
            homeTeam: {
              id: match.homeTeamId,
              name: match.homeTeam?.name || 'Home Team',
              logo: match.homeTeam?.logo
            },
            awayTeam: {
              id: match.awayTeamId,
              name: match.awayTeam?.name || 'Away Team',
              logo: match.awayTeam?.logo
            },
            score: {
              home: match.homeScore || 0,
              away: match.awayScore || 0
            },
            status: match.status,
            minute: match.minute || 0,
            period: match.period || 'first_half',
            events,
            stats,
            venue: match.location,
            startTime: match.startTime
          };
        })
      );

      return liveMatches;
    } catch (error) {
      console.error('Error fetching live matches:', error);
      return [];
    }
  }

  // Get upcoming matches
  async getUpcomingMatches(limit: number = 10) {
    try {
      const response = await enhancedApiClient.get(`/matches?status=scheduled&limit=${limit}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching upcoming matches:', error);
      return [];
    }
  }

  // Get recent matches
  async getRecentMatches(limit: number = 10) {
    try {
      const response = await enhancedApiClient.get(`/matches?status=finished&limit=${limit}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching recent matches:', error);
      return [];
    }
  }

  // Get match events
  async getMatchEvents(matchId: string): Promise<MatchEvent[]> {
    try {
      const response = await enhancedApiClient.get(`/matches/${matchId}/events`);
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching events for match ${matchId}:`, error);
      return [];
    }
  }

  // Get match statistics
  async getMatchStats(matchId: string): Promise<MatchStats | undefined> {
    try {
      const response = await enhancedApiClient.get(`/matches/${matchId}/stats`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching stats for match ${matchId}:`, error);
      return undefined;
    }
  }

  // Get match details
  async getMatch(matchId: string) {
    try {
      const response = await enhancedApiClient.get(`/matches/${matchId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching match ${matchId}:`, error);
      return null;
    }
  }

  // Create a new match
  async createMatch(matchData: {
    title: string;
    homeTeamId: string;
    awayTeamId: string;
    startTime: string;
    location?: string;
    tournamentId?: string;
  }) {
    try {
      const response = await enhancedApiClient.post('/matches', matchData);
      return response;
    } catch (error) {
      console.error('Error creating match:', error);
      throw error;
    }
  }

  // Update match score
  async updateMatchScore(matchId: string, homeScore: number, awayScore: number) {
    try {
      const response = await enhancedApiClient.put(`/matches/${matchId}/score`, {
        homeScore,
        awayScore
      });
      return response;
    } catch (error) {
      console.error('Error updating match score:', error);
      throw error;
    }
  }

  // Start match (set to live)
  async startMatch(matchId: string) {
    try {
      const response = await enhancedApiClient.put(`/matches/${matchId}/start`, {
        status: 'live',
        minute: 0
      });
      return response;
    } catch (error) {
      console.error('Error starting match:', error);
      throw error;
    }
  }

  // End match
  async endMatch(matchId: string) {
    try {
      const response = await enhancedApiClient.put(`/matches/${matchId}/end`, {
        status: 'finished'
      });
      return response;
    } catch (error) {
      console.error('Error ending match:', error);
      throw error;
    }
  }

  // Add match event
  async addMatchEvent(matchId: string, event: {
    type: string;
    minute: number;
    playerId: string;
    team: 'home' | 'away';
    description: string;
  }) {
    try {
      const response = await enhancedApiClient.post(`/matches/${matchId}/events`, event);
      return response;
    } catch (error) {
      console.error('Error adding match event:', error);
      throw error;
    }
  }

  // Get matches by tournament
  async getMatchesByTournament(tournamentId: string) {
    try {
      const response = await enhancedApiClient.get(`/tournaments/${tournamentId}/matches`);
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching matches for tournament ${tournamentId}:`, error);
      return [];
    }
  }

  // Get matches by team
  async getMatchesByTeam(teamId: string) {
    try {
      const response = await enhancedApiClient.get(`/teams/${teamId}/matches`);
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching matches for team ${teamId}:`, error);
      return [];
    }
  }

  // Get head-to-head record
  async getHeadToHead(team1Id: string, team2Id: string) {
    try {
      const response = await enhancedApiClient.get(`/matches/head-to-head?team1=${team1Id}&team2=${team2Id}`);
      return response.data || { matches: [], summary: { team1Wins: 0, team2Wins: 0, draws: 0 } };
    } catch (error) {
      console.error('Error fetching head-to-head data:', error);
      return { matches: [], summary: { team1Wins: 0, team2Wins: 0, draws: 0 } };
    }
  }
}

export default new MatchService();
