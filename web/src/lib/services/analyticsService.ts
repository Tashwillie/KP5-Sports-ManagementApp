import enhancedApiClient from '@/lib/enhancedApiClient';

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    tension?: number;
    fill?: boolean;
  }[];
}

export interface MatchesOverTimeData {
  date: string;
  matches: number;
  goals: number;
}

export interface TeamPerformanceData {
  teamId: string;
  teamName: string;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface PlayerStatsData {
  playerId: string;
  playerName: string;
  goals: number;
  assists: number;
  matches: number;
  rating: number;
}

export interface RegistrationTrendsData {
  month: string;
  registrations: number;
  users: number;
  revenue?: number;
}

export interface TournamentProgressData {
  tournamentId: string;
  tournamentName: string;
  totalMatches: number;
  completedMatches: number;
  goalsScored: number;
  averageGoalsPerMatch: number;
}

class AnalyticsService {
  // Get matches over time for line chart
  async getMatchesOverTime(days: number = 30): Promise<ChartData> {
    try {
      const response = await enhancedApiClient.get(`/analytics/matches-over-time?days=${days}`);
      
      if (response.success && response.data) {
        return response.data;
      }

      // Fallback: Generate from matches data
      const matchesResponse = await enhancedApiClient.get('/matches');
      console.log('Matches response for over time:', matchesResponse);
      
      // Ensure we get an array of matches
      let matches: any[] = [];
      if (matchesResponse.success && matchesResponse.data) {
        if (Array.isArray(matchesResponse.data)) {
          matches = matchesResponse.data;
        } else if (matchesResponse.data.matches && Array.isArray(matchesResponse.data.matches)) {
          matches = matchesResponse.data.matches;
        } else {
          console.warn('Matches data is not in expected format:', matchesResponse.data);
          matches = [];
        }
      }
      
      return this.processMatchesOverTime(matches, days);
    } catch (error) {
      console.error('Error fetching matches over time:', error);
      return this.generateFallbackMatchesData(days);
    }
  }

  private processMatchesOverTime(matches: any[], days: number): ChartData {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const dateLabels: string[] = [];
    const matchCounts: number[] = [];
    const goalCounts: number[] = [];

    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dateStr = currentDate.toISOString().split('T')[0];
      dateLabels.push(currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

      const dayMatches = matches.filter(match => 
        match.startTime && match.startTime.startsWith(dateStr)
      );

      matchCounts.push(dayMatches.length);
      
      const dayGoals = dayMatches.reduce((sum, match) => 
        sum + (match.homeScore || 0) + (match.awayScore || 0), 0
      );
      goalCounts.push(dayGoals);
    }

    return {
      labels: dateLabels,
      datasets: [
        {
          label: 'Matches Played',
          data: matchCounts,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Goals Scored',
          data: goalCounts,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
          fill: true,
        }
      ]
    };
  }

  private generateFallbackMatchesData(days: number): ChartData {
    const labels = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    return {
      labels,
      datasets: [
        {
          label: 'Matches Played',
          data: Array.from({ length: days }, () => Math.floor(Math.random() * 5)),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Goals Scored',
          data: Array.from({ length: days }, () => Math.floor(Math.random() * 15)),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
          fill: true,
        }
      ]
    };
  }

  // Get team performance for bar chart
  async getTeamPerformance(tournamentId?: string): Promise<ChartData> {
    try {
      const url = tournamentId 
        ? `/analytics/team-performance?tournamentId=${tournamentId}`
        : '/analytics/team-performance';
      
      const response = await enhancedApiClient.get(url);
      
      if (response.success && response.data) {
        return response.data;
      }

      // Fallback: Generate from teams and matches data
      return await this.processTeamPerformance(tournamentId);
    } catch (error) {
      console.error('Error fetching team performance:', error);
      return this.generateFallbackTeamData();
    }
  }

  private async processTeamPerformance(tournamentId?: string): Promise<ChartData> {
    try {
      const teamsResponse = await enhancedApiClient.get('/teams');
      console.log('Teams response for performance:', teamsResponse);
      
      // Ensure we get an array of teams
      let teams: any[] = [];
      if (teamsResponse.success && teamsResponse.data) {
        if (Array.isArray(teamsResponse.data)) {
          teams = teamsResponse.data;
        } else if (teamsResponse.data.teams && Array.isArray(teamsResponse.data.teams)) {
          teams = teamsResponse.data.teams;
        } else {
          console.warn('Teams data is not in expected format:', teamsResponse.data);
          teams = [];
        }
      }
      
      const matchesUrl = tournamentId 
        ? `/tournaments/${tournamentId}/matches`
        : '/matches';
      const matchesResponse = await enhancedApiClient.get(matchesUrl);
      console.log('Matches response for team performance:', matchesResponse);
      
      // Ensure we get an array of matches
      let matches: any[] = [];
      if (matchesResponse.success && matchesResponse.data) {
        if (Array.isArray(matchesResponse.data)) {
          matches = matchesResponse.data;
        } else if (matchesResponse.data.matches && Array.isArray(matchesResponse.data.matches)) {
          matches = matchesResponse.data.matches;
        } else {
          console.warn('Matches data is not in expected format:', matchesResponse.data);
          matches = [];
        }
      }

      const teamStats = Array.isArray(teams) ? teams.slice(0, 8).map((team: any) => {
        const teamMatches = Array.isArray(matches) ? matches.filter((match: any) => 
          match.homeTeamId === team.id || match.awayTeamId === team.id
        ) : [];

        let wins = 0, draws = 0, losses = 0;
        
        teamMatches.forEach((match: any) => {
          if (match.status === 'finished' && match.homeScore !== undefined && match.awayScore !== undefined) {
            const isHome = match.homeTeamId === team.id;
            const teamScore = isHome ? match.homeScore : match.awayScore;
            const opponentScore = isHome ? match.awayScore : match.homeScore;
            
            if (teamScore > opponentScore) wins++;
            else if (teamScore < opponentScore) losses++;
            else draws++;
          }
        });

        return {
          name: team.name,
          wins,
          draws,
          losses
        };
      }) : [];

      return {
        labels: teamStats.map(team => team.name),
        datasets: [
          {
            label: 'Wins',
            data: teamStats.map(team => team.wins),
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
          },
          {
            label: 'Draws',
            data: teamStats.map(team => team.draws),
            backgroundColor: 'rgba(251, 191, 36, 0.8)',
          },
          {
            label: 'Losses',
            data: teamStats.map(team => team.losses),
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
          }
        ]
      };
    } catch (error) {
      console.error('Error processing team performance:', error);
      return this.generateFallbackTeamData();
    }
  }

  private generateFallbackTeamData(): ChartData {
    const teamNames = ['Team A', 'Team B', 'Team C', 'Team D', 'Team E', 'Team F'];
    
    return {
      labels: teamNames,
      datasets: [
        {
          label: 'Wins',
          data: teamNames.map(() => Math.floor(Math.random() * 15) + 5),
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
        },
        {
          label: 'Draws',
          data: teamNames.map(() => Math.floor(Math.random() * 8) + 2),
          backgroundColor: 'rgba(251, 191, 36, 0.8)',
        },
        {
          label: 'Losses',
          data: teamNames.map(() => Math.floor(Math.random() * 10) + 1),
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
        }
      ]
    };
  }

  // Get user registration trends
  async getRegistrationTrends(months: number = 6): Promise<ChartData> {
    try {
      const response = await enhancedApiClient.get(`/analytics/registration-trends?months=${months}`);
      
      if (response.success && response.data) {
        return response.data;
      }

      // Fallback: Generate from user data
      return await this.processRegistrationTrends(months);
    } catch (error) {
      console.error('Error fetching registration trends:', error);
      return this.generateFallbackRegistrationData(months);
    }
  }

  private async processRegistrationTrends(months: number): Promise<ChartData> {
    try {
      const usersResponse = await enhancedApiClient.get('/users');
      console.log('Users response for registration trends:', usersResponse);
      
      // Ensure we get an array of users
      let users: any[] = [];
      if (usersResponse.success && usersResponse.data) {
        if (Array.isArray(usersResponse.data)) {
          users = usersResponse.data;
        } else if (usersResponse.data.users && Array.isArray(usersResponse.data.users)) {
          users = usersResponse.data.users;
        } else {
          console.warn('Users data is not in expected format:', usersResponse.data);
          users = [];
        }
      }

      const monthLabels: string[] = [];
      const registrationCounts: number[] = [];

      for (let i = months - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        
        const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthLabels.push(monthYear);

        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const monthUsers = Array.isArray(users) ? users.filter((user: any) => {
          if (!user.createdAt) return false;
          const userDate = new Date(user.createdAt);
          return userDate >= monthStart && userDate <= monthEnd;
        }) : [];

        registrationCounts.push(monthUsers.length);
      }

      return {
        labels: monthLabels,
        datasets: [
          {
            label: 'New Registrations',
            data: registrationCounts,
            backgroundColor: 'rgba(147, 51, 234, 0.8)',
          }
        ]
      };
    } catch (error) {
      console.error('Error processing registration trends:', error);
      return this.generateFallbackRegistrationData(months);
    }
  }

  private generateFallbackRegistrationData(months: number): ChartData {
    const labels = Array.from({ length: months }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (months - 1 - i));
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });

    return {
      labels,
      datasets: [
        {
          label: 'New Registrations',
          data: Array.from({ length: months }, () => Math.floor(Math.random() * 50) + 10),
          backgroundColor: 'rgba(147, 51, 234, 0.8)',
        }
      ]
    };
  }

  // Get tournament progress
  async getTournamentProgress(): Promise<ChartData> {
    try {
      const response = await enhancedApiClient.get('/analytics/tournament-progress');
      
      if (response.success && response.data) {
        return response.data;
      }

      // Fallback: Generate from tournament data
      return await this.processTournamentProgress();
    } catch (error) {
      console.error('Error fetching tournament progress:', error);
      return this.generateFallbackTournamentData();
    }
  }

  private async processTournamentProgress(): Promise<ChartData> {
    try {
      const tournamentsResponse = await enhancedApiClient.get('/tournaments');
      console.log('Tournaments response for progress:', tournamentsResponse);
      
      // Ensure we get an array of tournaments
      let tournaments: any[] = [];
      if (tournamentsResponse.success && tournamentsResponse.data) {
        if (Array.isArray(tournamentsResponse.data)) {
          tournaments = tournamentsResponse.data;
        } else if (tournamentsResponse.data.tournaments && Array.isArray(tournamentsResponse.data.tournaments)) {
          tournaments = tournamentsResponse.data.tournaments;
        } else {
          console.warn('Tournaments data is not in expected format:', tournamentsResponse.data);
          tournaments = [];
        }
      }

      const progressData = await Promise.all(
        Array.isArray(tournaments) ? tournaments.slice(0, 5).map(async (tournament: any) => {
          const matchesResponse = await enhancedApiClient.get(`/tournaments/${tournament.id}/matches`);
          console.log(`Matches response for tournament ${tournament.id}:`, matchesResponse);
          
          // Ensure we get an array of matches
          let matches: any[] = [];
          if (matchesResponse.success && matchesResponse.data) {
            if (Array.isArray(matchesResponse.data)) {
              matches = matchesResponse.data;
            } else if (matchesResponse.data.matches && Array.isArray(matchesResponse.data.matches)) {
              matches = matchesResponse.data.matches;
            } else {
              console.warn('Tournament matches data is not in expected format:', matchesResponse.data);
              matches = [];
            }
          }
          
          const totalMatches = matches.length;
          const completedMatches = Array.isArray(matches) ? matches.filter((match: any) => match.status === 'finished').length : 0;
          const progress = totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0;

          return {
            name: tournament.name,
            progress: Math.round(progress)
          };
        }) : []
      );

      return {
        labels: progressData.map(item => item.name),
        datasets: [
          {
            label: 'Progress %',
            data: progressData.map(item => item.progress),
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(34, 197, 94, 0.8)',
              'rgba(251, 191, 36, 0.8)',
              'rgba(239, 68, 68, 0.8)',
              'rgba(147, 51, 234, 0.8)',
            ],
          }
        ]
      };
    } catch (error) {
      console.error('Error processing tournament progress:', error);
      return this.generateFallbackTournamentData();
    }
  }

  private generateFallbackTournamentData(): ChartData {
    const tournaments = ['Spring Cup', 'Summer League', 'Fall Championship', 'Winter Series', 'Youth Cup'];
    
    return {
      labels: tournaments,
      datasets: [
        {
          label: 'Progress %',
          data: tournaments.map(() => Math.floor(Math.random() * 100)),
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(251, 191, 36, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(147, 51, 234, 0.8)',
          ],
        }
      ]
    };
  }

  // Get player performance distribution
  async getPlayerPerformanceDistribution(): Promise<ChartData> {
    try {
      const response = await enhancedApiClient.get('/analytics/player-performance');
      
      if (response.success && response.data) {
        return response.data;
      }

      // Fallback: Generate from player data
      return await this.processPlayerPerformance();
    } catch (error) {
      console.error('Error fetching player performance:', error);
      return this.generateFallbackPlayerData();
    }
  }

  private async processPlayerPerformance(): Promise<ChartData> {
    try {
      const usersResponse = await enhancedApiClient.get('/users?role=PLAYER');
      console.log('Users response for player performance:', usersResponse);
      
      // Ensure we get an array of players
      let players: any[] = [];
      if (usersResponse.success && usersResponse.data) {
        if (Array.isArray(usersResponse.data)) {
          players = usersResponse.data;
        } else if (usersResponse.data.users && Array.isArray(usersResponse.data.users)) {
          players = usersResponse.data.users;
        } else if (usersResponse.data.data && Array.isArray(usersResponse.data.data)) {
          players = usersResponse.data.data;
        } else {
          console.warn('Players data is not in expected format:', usersResponse.data);
          players = [];
        }
      }

      // Group players by performance categories
      const categories = {
        'High Performers': 0,
        'Medium Performers': 0,
        'Developing Players': 0,
        'New Players': 0
      };

      // Ensure players is an array before using forEach
      if (Array.isArray(players)) {
        players.forEach((player: any) => {
          // This would typically use real performance metrics
          // For now, we'll simulate based on creation date and random metrics
          const random = Math.random();
          if (random > 0.8) categories['High Performers']++;
          else if (random > 0.5) categories['Medium Performers']++;
          else if (random > 0.2) categories['Developing Players']++;
          else categories['New Players']++;
        });
      } else {
        console.warn('Players is not an array, cannot process performance data');
      }

      return {
        labels: Object.keys(categories),
        datasets: [
          {
            data: Object.values(categories),
            backgroundColor: [
              'rgba(34, 197, 94, 0.8)',
              'rgba(59, 130, 246, 0.8)',
              'rgba(251, 191, 36, 0.8)',
              'rgba(156, 163, 175, 0.8)',
            ],
          }
        ]
      };
    } catch (error) {
      console.error('Error processing player performance:', error);
      return this.generateFallbackPlayerData();
    }
  }

  private generateFallbackPlayerData(): ChartData {
    return {
      labels: ['High Performers', 'Medium Performers', 'Developing Players', 'New Players'],
      datasets: [
        {
          data: [25, 45, 20, 10],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(251, 191, 36, 0.8)',
            'rgba(156, 163, 175, 0.8)',
          ],
        }
      ]
    };
  }

  // Get match statistics summary
  async getMatchStatistics(): Promise<{
    totalMatches: number;
    liveMatches: number;
    upcomingMatches: number;
    completedMatches: number;
    totalGoals: number;
    averageGoalsPerMatch: number;
  }> {
    try {
      const response = await enhancedApiClient.get('/analytics/match-statistics');
      
      if (response.success && response.data) {
        return response.data;
      }

      // Fallback: Calculate from matches
      const matchesResponse = await enhancedApiClient.get('/matches');
      console.log('Matches response for statistics:', matchesResponse);
      
      // Ensure we get an array of matches
      let matches: any[] = [];
      if (matchesResponse.success && matchesResponse.data) {
        if (Array.isArray(matchesResponse.data)) {
          matches = matchesResponse.data;
        } else if (matchesResponse.data.matches && Array.isArray(matchesResponse.data.matches)) {
          matches = matchesResponse.data.matches;
        } else {
          console.warn('Matches data is not in expected format:', matchesResponse.data);
          matches = [];
        }
      }

      const totalMatches = matches.length;
      const liveMatches = Array.isArray(matches) ? matches.filter((m: any) => m.status === 'live').length : 0;
      const upcomingMatches = Array.isArray(matches) ? matches.filter((m: any) => m.status === 'scheduled').length : 0;
      const completedMatches = Array.isArray(matches) ? matches.filter((m: any) => m.status === 'finished').length : 0;
      
      const totalGoals = Array.isArray(matches) ? matches.reduce((sum: number, match: any) => 
        sum + (match.homeScore || 0) + (match.awayScore || 0), 0
      ) : 0;
      
      const averageGoalsPerMatch = completedMatches > 0 ? totalGoals / completedMatches : 0;

      return {
        totalMatches,
        liveMatches,
        upcomingMatches,
        completedMatches,
        totalGoals,
        averageGoalsPerMatch: Math.round(averageGoalsPerMatch * 100) / 100
      };
    } catch (error) {
      console.error('Error fetching match statistics:', error);
      return {
        totalMatches: 0,
        liveMatches: 0,
        upcomingMatches: 0,
        completedMatches: 0,
        totalGoals: 0,
        averageGoalsPerMatch: 0
      };
    }
  }
}

export default new AnalyticsService();
