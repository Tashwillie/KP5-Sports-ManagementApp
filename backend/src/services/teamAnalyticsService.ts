import { PrismaClient, Team } from '@prisma/client';

export interface TeamRanking {
  teamId: string;
  teamName: string;
  position: number;
  points: number;
  matchesPlayed: number;
  matchesWon: number;
  matchesDrawn: number;
  matchesLost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  winPercentage: number;
  form: string; // Last 5 matches: W/D/L
  lastMatch: Date;
  nextMatch?: Date;
}

export interface TeamPerformanceComparison {
  teamId: string;
  teamName: string;
  metrics: {
    [key: string]: {
      value: number;
      rank: number;
      percentile: number;
      leagueAverage: number;
      difference: number;
      trend: 'improving' | 'declining' | 'stable';
    };
  };
  overallRank: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface LeagueTable {
  season: string;
  tournamentId?: string;
  tournamentName?: string;
  lastUpdated: Date;
  rankings: TeamRanking[];
  statistics: {
    totalTeams: number;
    totalMatches: number;
    averageGoalsPerMatch: number;
    averagePointsPerTeam: number;
    mostGoals: number;
    leastGoals: number;
    mostCleanSheets: number;
  };
}

export interface TeamFormAnalysis {
  teamId: string;
  teamName: string;
  currentForm: 'excellent' | 'good' | 'average' | 'poor' | 'terrible';
  formScore: number;
  lastFiveMatches: Array<{
    matchId: string;
    opponent: string;
    result: 'win' | 'draw' | 'loss';
    score: string;
    date: Date;
    performance: number; // 1-10 rating
  }>;
  unbeatenStreak: number;
  winningStreak: number;
  losingStreak: number;
  goalsScoredStreak: number;
  cleanSheetStreak: number;
  formTrend: 'improving' | 'declining' | 'stable';
  nextMatchPrediction: {
    difficulty: 'easy' | 'medium' | 'hard';
    expectedResult: 'win' | 'draw' | 'loss';
    confidence: number;
  };
}

export interface TeamEfficiencyMetrics {
  teamId: string;
  teamName: string;
  attackEfficiency: {
    goalsPerShot: number;
    goalsPerPossession: number;
    conversionRate: number;
    setPieceEfficiency: number;
  };
  defenseEfficiency: {
    tacklesPerGoal: number;
    interceptionsPerGoal: number;
    cleanSheetRate: number;
    savePercentage: number;
  };
  possessionEfficiency: {
    goalsPerPossession: number;
    shotsPerPossession: number;
    passesPerGoal: number;
    possessionRetention: number;
  };
  overallEfficiency: number;
  efficiencyRank: number;
}

export interface TeamTrendAnalysis {
  teamId: string;
  teamName: string;
  period: string;
  trends: Array<{
    metric: string;
    currentValue: number;
    previousValue: number;
    change: number;
    changePercentage: number;
    trend: 'improving' | 'declining' | 'stable';
    significance: 'high' | 'medium' | 'low';
    explanation: string;
  }>;
  summary: {
    improvingMetrics: number;
    decliningMetrics: number;
    stableMetrics: number;
    overallTrend: 'improving' | 'declining' | 'stable';
    confidence: number;
  };
}

export class TeamAnalyticsService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Generate comprehensive league table
   */
  async generateLeagueTable(
    season: string,
    tournamentId?: string
  ): Promise<LeagueTable> {
    try {
      // Get all teams in the season/tournament
      const teams = tournamentId
        ? await this.getTournamentTeams(tournamentId)
        : await this.getAllTeams(season);

      // Get team season stats
      const teamStats = await this.prisma.teamSeasonStats.findMany({
        where: { season },
        include: {
          team: true
        }
      });

      // Calculate rankings
      const rankings = await this.calculateTeamRankings(teamStats, season);

      // Get tournament info if applicable
      let tournamentName: string | undefined;
      if (tournamentId) {
        const tournament = await this.prisma.tournament.findUnique({
          where: { id: tournamentId }
        });
        tournamentName = tournament?.name;
      }

      // Calculate league statistics
      const statistics = this.calculateLeagueStatistics(rankings);

      return {
        season,
        tournamentId,
        tournamentName,
        lastUpdated: new Date(),
        rankings,
        statistics
      };
    } catch (error) {
      console.error('Error generating league table:', error);
      throw error;
    }
  }

  /**
   * Analyze team form and performance trends
   */
  async analyzeTeamForm(
    teamId: string,
    season: string,
    tournamentId?: string
  ): Promise<TeamFormAnalysis> {
    try {
      // Get team's recent matches
      const recentMatches = await this.getTeamRecentMatches(teamId, season, 10);
      
      // Calculate form metrics
      const formMetrics = this.calculateFormMetrics(recentMatches, teamId);
      
      // Analyze form trend
      const formTrend = this.analyzeFormTrend(recentMatches);
      
      // Predict next match
      const nextMatchPrediction = await this.predictNextMatch(teamId, season, tournamentId);

      return {
        teamId,
        teamName: formMetrics.teamName,
        currentForm: formMetrics.currentForm,
        formScore: formMetrics.formScore,
        lastFiveMatches: formMetrics.lastFiveMatches,
        unbeatenStreak: formMetrics.unbeatenStreak,
        winningStreak: formMetrics.winningStreak,
        losingStreak: formMetrics.losingStreak,
        goalsScoredStreak: formMetrics.goalsScoredStreak,
        cleanSheetStreak: formMetrics.cleanSheetStreak,
        formTrend,
        nextMatchPrediction
      };
    } catch (error) {
      console.error(`Error analyzing team form for ${teamId}:`, error);
      throw error;
    }
  }

  /**
   * Calculate team efficiency metrics
   */
  async calculateTeamEfficiency(
    teamId: string,
    season: string
  ): Promise<TeamEfficiencyMetrics> {
    try {
      // Get team match statistics
      const matchStats = await this.prisma.teamMatchStats.findMany({
        where: { teamId },
        include: {
          match: true
        }
      });

      // Filter by season
      const seasonStats = matchStats.filter(stat => 
        stat.match.createdAt.getFullYear().toString() === season
      );

      if (seasonStats.length === 0) {
        throw new Error(`No match statistics found for team ${teamId} in season ${season}`);
      }

      // Calculate efficiency metrics
      const attackEfficiency = this.calculateAttackEfficiency(seasonStats);
      const defenseEfficiency = this.calculateDefenseEfficiency(seasonStats);
      const possessionEfficiency = this.calculatePossessionEfficiency(seasonStats);
      
      // Calculate overall efficiency
      const overallEfficiency = this.calculateOverallEfficiency(
        attackEfficiency,
        defenseEfficiency,
        possessionEfficiency
      );

      // Get team name
      const team = await this.prisma.team.findUnique({
        where: { id: teamId }
      });

      return {
        teamId,
        teamName: team?.name || 'Unknown Team',
        attackEfficiency,
        defenseEfficiency,
        possessionEfficiency,
        overallEfficiency,
        efficiencyRank: 0 // Will be calculated when comparing with other teams
      };
    } catch (error) {
      console.error(`Error calculating team efficiency for ${teamId}:`, error);
      throw error;
    }
  }

  /**
   * Compare team performance with league averages
   */
  async compareTeamWithLeague(
    teamId: string,
    season: string,
    tournamentId?: string
  ): Promise<TeamPerformanceComparison> {
    try {
      // Get team performance
      const teamPerformance = await this.calculateTeamPerformance(teamId, season);
      
      // Get league averages
      const leagueAverages = await this.calculateLeagueAverages(season, tournamentId);
      
      // Get all teams for ranking
      const allTeams = await this.getAllTeamsInLeague(season, tournamentId);
      
      // Calculate comparison metrics
      const comparison = this.calculateComparisonMetrics(
        teamPerformance,
        leagueAverages,
        allTeams
      );

      return comparison;
    } catch (error) {
      console.error(`Error comparing team with league for ${teamId}:`, error);
      throw error;
    }
  }

  /**
   * Analyze team performance trends
   */
  async analyzeTeamTrends(
    teamId: string,
    season: string,
    period: 'week' | 'month' | 'quarter' = 'month'
  ): Promise<TeamTrendAnalysis> {
    try {
      // Get historical data
      const historicalData = await this.getHistoricalTeamData(teamId, season, period);
      
      // Calculate trends for key metrics
      const trends = this.calculateMetricTrends(historicalData);
      
      // Analyze overall trend
      const summary = this.analyzeTrendSummary(trends);

      // Get team name
      const team = await this.prisma.team.findUnique({
        where: { id: teamId }
      });

      return {
        teamId,
        teamName: team?.name || 'Unknown Team',
        period,
        trends,
        summary
      };
    } catch (error) {
      console.error(`Error analyzing team trends for ${teamId}:`, error);
      throw error;
    }
  }

  /**
   * Get top performing teams by various metrics
   */
  async getTopTeams(
    season: string,
    metric: 'points' | 'goals' | 'cleanSheets' | 'winPercentage' | 'efficiency',
    limit: number = 10,
    tournamentId?: string
  ): Promise<Array<{
    teamId: string;
    teamName: string;
    value: number;
    rank: number;
    additionalMetrics: Record<string, number>;
  }>> {
    try {
      let topTeams: any[] = [];

      switch (metric) {
        case 'points':
          topTeams = await this.getTopTeamsByPoints(season, limit, tournamentId);
          break;
        case 'goals':
          topTeams = await this.getTopTeamsByGoals(season, limit, tournamentId);
          break;
        case 'cleanSheets':
          topTeams = await this.getTopTeamsByCleanSheets(season, limit, tournamentId);
          break;
        case 'winPercentage':
          topTeams = await this.getTopTeamsByWinPercentage(season, limit, tournamentId);
          break;
        case 'efficiency':
          topTeams = await this.getTopTeamsByEfficiency(season, limit, tournamentId);
          break;
      }

      return topTeams;
    } catch (error) {
      console.error(`Error getting top teams by ${metric}:`, error);
      throw error;
    }
  }

  // Private helper methods
  private async getTournamentTeams(tournamentId: string): Promise<Team[]> {
    const tournamentTeams = await this.prisma.tournamentTeam.findMany({
      where: { tournamentId },
      include: { team: true }
    });
    return tournamentTeams.map(tt => tt.team);
  }

  private async getAllTeams(season: string): Promise<Team[]> {
    return await this.prisma.team.findMany();
  }

  private async getAllTeamsInLeague(season: string, tournamentId?: string): Promise<Team[]> {
    if (tournamentId) {
      return this.getTournamentTeams(tournamentId);
    }
    return this.getAllTeams(season);
  }

  private async calculateTeamRankings(
    teamStats: any[],
    season: string
  ): Promise<TeamRanking[]> {
    // Sort by points, then goal difference, then goals for
    const sortedStats = teamStats.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalsFor - b.goalsAgainst !== a.goalsFor - a.goalsAgainst) {
        return (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst);
      }
      return b.goalsFor - a.goalsFor;
    });

    // Calculate rankings and form
    const rankings: TeamRanking[] = [];
    
    for (let i = 0; i < sortedStats.length; i++) {
      const stat = sortedStats[i];
      const form = await this.calculateTeamForm(stat.teamId, season);
      const lastMatch = await this.getTeamLastMatch(stat.teamId, season);
      const nextMatch = await this.getTeamNextMatch(stat.teamId, season);

      rankings.push({
        teamId: stat.teamId,
        teamName: stat.team.name,
        position: i + 1,
        points: stat.points,
        matchesPlayed: stat.matchesPlayed,
        matchesWon: stat.matchesWon,
        matchesDrawn: stat.matchesDrawn,
        matchesLost: stat.matchesLost,
        goalsFor: stat.goalsFor,
        goalsAgainst: stat.goalsAgainst,
        goalDifference: stat.goalsFor - stat.goalsAgainst,
        winPercentage: stat.matchesPlayed > 0 ? (stat.matchesWon / stat.matchesPlayed) * 100 : 0,
        form: form.form,
        lastMatch,
        nextMatch
      });
    }

    return rankings;
  }

  private calculateLeagueStatistics(rankings: TeamRanking[]) {
    const totalTeams = rankings.length;
    const totalMatches = rankings.reduce((sum, team) => sum + team.matchesPlayed, 0);
    const totalGoals = rankings.reduce((sum, team) => sum + team.goalsFor, 0);
    const totalPoints = rankings.reduce((sum, team) => sum + team.points, 0);

    return {
      totalTeams,
      totalMatches,
      averageGoalsPerMatch: totalMatches > 0 ? totalGoals / totalMatches : 0,
      averagePointsPerTeam: totalTeams > 0 ? totalPoints / totalTeams : 0,
      mostGoals: Math.max(...rankings.map(team => team.goalsFor)),
      leastGoals: Math.min(...rankings.map(team => team.goalsFor)),
      mostCleanSheets: 0 // Would need to be calculated from match data
    };
  }

  private async getTeamRecentMatches(teamId: string, season: string, limit: number) {
    // This would get recent matches for a team
    return [];
  }

  private calculateFormMetrics(matches: any[], teamId: string) {
    // This would calculate form metrics from matches
    return {
      teamName: 'Unknown Team',
      currentForm: 'average' as const,
      formScore: 0,
      lastFiveMatches: [],
      unbeatenStreak: 0,
      winningStreak: 0,
      losingStreak: 0,
      goalsScoredStreak: 0,
      cleanSheetStreak: 0
    };
  }

  private analyzeFormTrend(matches: any[]) {
    // This would analyze form trend
    return 'stable' as const;
  }

  private async predictNextMatch(teamId: string, season: string, tournamentId?: string) {
    // This would predict next match outcome
    return {
      difficulty: 'medium' as const,
      expectedResult: 'draw' as const,
      confidence: 0.5
    };
  }

  private calculateAttackEfficiency(stats: any[]) {
    // This would calculate attack efficiency metrics
    return {
      goalsPerShot: 0,
      goalsPerPossession: 0,
      conversionRate: 0,
      setPieceEfficiency: 0
    };
  }

  private calculateDefenseEfficiency(stats: any[]) {
    // This would calculate defense efficiency metrics
    return {
      tacklesPerGoal: 0,
      interceptionsPerGoal: 0,
      cleanSheetRate: 0,
      savePercentage: 0
    };
  }

  private calculatePossessionEfficiency(stats: any[]) {
    // This would calculate possession efficiency metrics
    return {
      goalsPerPossession: 0,
      shotsPerPossession: 0,
      passesPerGoal: 0,
      possessionRetention: 0
    };
  }

  private calculateOverallEfficiency(attack: any, defense: any, possession: any) {
    // This would calculate overall efficiency
    return 0;
  }

  private async calculateTeamPerformance(teamId: string, season: string) {
    // This would calculate team performance metrics
    return {};
  }

  private async calculateLeagueAverages(season: string, tournamentId?: string) {
    // This would calculate league averages
    return {};
  }

  private calculateComparisonMetrics(teamPerformance: any, leagueAverages: any, allTeams: any[]) {
    // This would calculate comparison metrics
    return {
      teamId: '',
      teamName: '',
      metrics: {},
      overallRank: 0,
      strengths: [],
      weaknesses: [],
      recommendations: []
    };
  }

  private async getHistoricalTeamData(teamId: string, season: string, period: string) {
    // This would get historical team data
    return [];
  }

  private calculateMetricTrends(historicalData: any[]) {
    // This would calculate metric trends
    return [];
  }

  private analyzeTrendSummary(trends: any[]) {
    // This would analyze trend summary
    return {
      improvingMetrics: 0,
      decliningMetrics: 0,
      stableMetrics: 0,
      overallTrend: 'stable' as const,
      confidence: 0
    };
  }

  private async getTopTeamsByPoints(season: string, limit: number, tournamentId?: string) {
    // This would get top teams by points
    return [];
  }

  private async getTopTeamsByGoals(season: string, limit: number, tournamentId?: string) {
    // This would get top teams by goals
    return [];
  }

  private async getTopTeamsByCleanSheets(season: string, limit: number, tournamentId?: string) {
    // This would get top teams by clean sheets
    return [];
  }

  private async getTopTeamsByWinPercentage(season: string, limit: number, tournamentId?: string) {
    // This would get top teams by win percentage
    return [];
  }

  private async getTopTeamsByEfficiency(season: string, limit: number, tournamentId?: string) {
    // This would get top teams by efficiency
    return [];
  }

  private async calculateTeamForm(teamId: string, season: string) {
    // This would calculate team form
    return 'WDLWD';
  }

  private async getTeamLastMatch(teamId: string, season: string) {
    // This would get team's last match
    return new Date();
  }

  private async getTeamNextMatch(teamId: string, season: string) {
    // This would get team's next match
    return undefined;
  }
}

export default TeamAnalyticsService;
