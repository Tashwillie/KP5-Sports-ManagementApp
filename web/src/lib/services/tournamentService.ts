import enhancedApiClient from '@/lib/enhancedApiClient';

export interface Tournament {
  id: string;
  name: string;
  description: string;
  format: 'ROUND_ROBIN' | 'KNOCKOUT' | 'LEAGUE' | 'GROUPS_KNOCKOUT';
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  location?: string;
  maxTeams: number;
  currentTeams: number;
  season: string;
  logo?: string;
  prizePool?: number;
  registrationDeadline?: string;
  rules?: string;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TournamentStanding {
  position: number;
  previousPosition?: number;
  teamId: string;
  teamName: string;
  teamLogo?: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
  trend: 'up' | 'down' | 'same';
  streak?: {
    type: 'win' | 'draw' | 'loss';
    count: number;
  };
}

export interface TournamentMatch {
  id: string;
  tournamentId: string;
  round: number;
  group?: string;
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
  score?: {
    home: number;
    away: number;
  };
  status: 'scheduled' | 'live' | 'finished' | 'postponed';
  startTime: string;
  venue?: string;
  referee?: string;
}

export interface TournamentStats {
  totalGoals: number;
  totalMatches: number;
  completedMatches: number;
  averageGoalsPerMatch: number;
  topScorer: {
    playerId: string;
    playerName: string;
    goals: number;
    teamName: string;
  };
  topAssist: {
    playerId: string;
    playerName: string;
    assists: number;
    teamName: string;
  };
  mostYellowCards: number;
  mostRedCards: number;
  attendanceStats?: {
    total: number;
    average: number;
    highest: number;
  };
}

class TournamentService {
  // Get all tournaments with filtering
  async getTournaments(filters?: {
    status?: string;
    format?: string;
    season?: string;
    isPublic?: boolean;
    search?: string;
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

      const url = `/tournaments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await enhancedApiClient.get(url);
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      return [];
    }
  }

  // Get tournament by ID
  async getTournament(tournamentId: string): Promise<Tournament | null> {
    try {
      const response = await enhancedApiClient.get(`/tournaments/${tournamentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching tournament ${tournamentId}:`, error);
      return null;
    }
  }

  // Get tournament standings
  async getTournamentStandings(tournamentId: string): Promise<TournamentStanding[]> {
    try {
      const response = await enhancedApiClient.get(`/tournaments/${tournamentId}/standings`);
      
      if (response.data && response.data.length > 0) {
        return response.data;
      }

      // Fallback: calculate standings from matches and teams
      return await this.calculateStandings(tournamentId);
    } catch (error) {
      console.error(`Error fetching standings for tournament ${tournamentId}:`, error);
      return await this.calculateStandings(tournamentId);
    }
  }

  // Calculate standings from match results
  private async calculateStandings(tournamentId: string): Promise<TournamentStanding[]> {
    try {
      // Get tournament teams
      const teamsResponse = await enhancedApiClient.get(`/tournaments/${tournamentId}/teams`);
      const teams = teamsResponse.data || [];

      // Get tournament matches
      const matchesResponse = await enhancedApiClient.get(`/tournaments/${tournamentId}/matches`);
      const matches = matchesResponse.data || [];

      const standings: TournamentStanding[] = teams.map((team: any) => {
        const teamMatches = matches.filter((match: any) => 
          match.homeTeamId === team.id || match.awayTeamId === team.id
        );

        let won = 0, drawn = 0, lost = 0, goalsFor = 0, goalsAgainst = 0;
        const form: ('W' | 'D' | 'L')[] = [];

        teamMatches.forEach((match: any) => {
          if (match.status === 'finished' && match.homeScore !== undefined && match.awayScore !== undefined) {
            const isHome = match.homeTeamId === team.id;
            const teamScore = isHome ? match.homeScore : match.awayScore;
            const opponentScore = isHome ? match.awayScore : match.homeScore;

            goalsFor += teamScore;
            goalsAgainst += opponentScore;

            if (teamScore > opponentScore) {
              won++;
              form.push('W');
            } else if (teamScore < opponentScore) {
              lost++;
              form.push('L');
            } else {
              drawn++;
              form.push('D');
            }
          }
        });

        const points = won * 3 + drawn;
        const played = won + drawn + lost;

        return {
          position: 0, // Will be set after sorting
          teamId: team.id,
          teamName: team.name,
          teamLogo: team.logo,
          played,
          won,
          drawn,
          lost,
          goalsFor,
          goalsAgainst,
          goalDifference: goalsFor - goalsAgainst,
          points,
          form: form.slice(-5), // Last 5 matches
          trend: 'same' as const
        };
      });

      // Sort by points, then goal difference, then goals for
      standings.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
      });

      // Set positions and calculate trends
      return standings.map((standing, index) => ({
        ...standing,
        position: index + 1,
        trend: this.calculateTrend(standing.form)
      }));

    } catch (error) {
      console.error('Error calculating standings:', error);
      return [];
    }
  }

  private calculateTrend(form: ('W' | 'D' | 'L')[]): 'up' | 'down' | 'same' {
    if (form.length < 2) return 'same';
    
    const recent = form.slice(-3);
    const wins = recent.filter(r => r === 'W').length;
    const losses = recent.filter(r => r === 'L').length;
    
    if (wins > losses) return 'up';
    if (losses > wins) return 'down';
    return 'same';
  }

  // Get tournament matches
  async getTournamentMatches(tournamentId: string): Promise<TournamentMatch[]> {
    try {
      const response = await enhancedApiClient.get(`/tournaments/${tournamentId}/matches`);
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching matches for tournament ${tournamentId}:`, error);
      return [];
    }
  }

  // Get tournament statistics
  async getTournamentStats(tournamentId: string): Promise<TournamentStats | null> {
    try {
      const response = await enhancedApiClient.get(`/tournaments/${tournamentId}/stats`);
      
      if (response.data) {
        return response.data;
      }

      // Calculate stats from available data
      return await this.calculateTournamentStats(tournamentId);
    } catch (error) {
      console.error(`Error fetching stats for tournament ${tournamentId}:`, error);
      return await this.calculateTournamentStats(tournamentId);
    }
  }

  private async calculateTournamentStats(tournamentId: string): Promise<TournamentStats | null> {
    try {
      const matches = await this.getTournamentMatches(tournamentId);
      const finishedMatches = matches.filter(m => m.status === 'finished');
      
      const totalGoals = finishedMatches.reduce((sum, match) => {
        return sum + (match.score?.home || 0) + (match.score?.away || 0);
      }, 0);

      return {
        totalGoals,
        totalMatches: matches.length,
        completedMatches: finishedMatches.length,
        averageGoalsPerMatch: finishedMatches.length > 0 ? totalGoals / finishedMatches.length : 0,
        topScorer: {
          playerId: '',
          playerName: 'TBD',
          goals: 0,
          teamName: ''
        },
        topAssist: {
          playerId: '',
          playerName: 'TBD',
          assists: 0,
          teamName: ''
        },
        mostYellowCards: 0,
        mostRedCards: 0
      };
    } catch (error) {
      console.error('Error calculating tournament stats:', error);
      return null;
    }
  }

  // Get tournament teams
  async getTournamentTeams(tournamentId: string) {
    try {
      const response = await enhancedApiClient.get(`/tournaments/${tournamentId}/teams`);
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching teams for tournament ${tournamentId}:`, error);
      return [];
    }
  }

  // Create tournament
  async createTournament(tournamentData: {
    name: string;
    description: string;
    format: string;
    startDate: string;
    endDate: string;
    maxTeams: number;
    location?: string;
    isPublic?: boolean;
    prizePool?: number;
    rules?: string;
  }) {
    try {
      const response = await enhancedApiClient.post('/tournaments', tournamentData);
      return response;
    } catch (error) {
      console.error('Error creating tournament:', error);
      throw error;
    }
  }

  // Update tournament
  async updateTournament(tournamentId: string, updates: Partial<Tournament>) {
    try {
      const response = await enhancedApiClient.put(`/tournaments/${tournamentId}`, updates);
      return response;
    } catch (error) {
      console.error('Error updating tournament:', error);
      throw error;
    }
  }

  // Delete tournament
  async deleteTournament(tournamentId: string) {
    try {
      const response = await enhancedApiClient.delete(`/tournaments/${tournamentId}`);
      return response;
    } catch (error) {
      console.error('Error deleting tournament:', error);
      throw error;
    }
  }

  // Register team for tournament
  async registerTeam(tournamentId: string, teamId: string) {
    try {
      const response = await enhancedApiClient.post(`/tournaments/${tournamentId}/teams`, {
        teamId
      });
      return response;
    } catch (error) {
      console.error('Error registering team for tournament:', error);
      throw error;
    }
  }

  // Remove team from tournament
  async removeTeam(tournamentId: string, teamId: string) {
    try {
      const response = await enhancedApiClient.delete(`/tournaments/${tournamentId}/teams/${teamId}`);
      return response;
    } catch (error) {
      console.error('Error removing team from tournament:', error);
      throw error;
    }
  }

  // Generate tournament fixtures
  async generateFixtures(tournamentId: string) {
    try {
      const response = await enhancedApiClient.post(`/tournaments/${tournamentId}/generate-fixtures`);
      return response;
    } catch (error) {
      console.error('Error generating tournament fixtures:', error);
      throw error;
    }
  }

  // Start tournament
  async startTournament(tournamentId: string) {
    try {
      const response = await enhancedApiClient.put(`/tournaments/${tournamentId}/start`);
      return response;
    } catch (error) {
      console.error('Error starting tournament:', error);
      throw error;
    }
  }

  // End tournament
  async endTournament(tournamentId: string) {
    try {
      const response = await enhancedApiClient.put(`/tournaments/${tournamentId}/end`);
      return response;
    } catch (error) {
      console.error('Error ending tournament:', error);
      throw error;
    }
  }

  // Get tournament bracket (for knockout tournaments)
  async getTournamentBracket(tournamentId: string) {
    try {
      const response = await enhancedApiClient.get(`/tournaments/${tournamentId}/bracket`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching bracket for tournament ${tournamentId}:`, error);
      return null;
    }
  }

  // Get upcoming tournaments
  async getUpcomingTournaments(limit: number = 10) {
    try {
      const response = await enhancedApiClient.get(`/tournaments?status=upcoming&limit=${limit}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching upcoming tournaments:', error);
      return [];
    }
  }

  // Get active tournaments
  async getActiveTournaments(limit: number = 10) {
    try {
      const response = await enhancedApiClient.get(`/tournaments?status=active&limit=${limit}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching active tournaments:', error);
      return [];
    }
  }

  // Search tournaments
  async searchTournaments(query: string, filters?: {
    status?: string;
    format?: string;
    limit?: number;
  }) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('search', query);
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const response = await enhancedApiClient.get(`/tournaments?${queryParams.toString()}`);
      return response.data || [];
    } catch (error) {
      console.error('Error searching tournaments:', error);
      return [];
    }
  }
}

export default new TournamentService();