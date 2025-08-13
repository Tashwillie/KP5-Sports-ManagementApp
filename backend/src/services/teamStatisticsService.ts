import { PrismaClient, Team, TeamMatchStats, TeamSeasonStats, Match, MatchEvent, User } from '@prisma/client';
import { EventEmitter } from 'events';

export interface TeamPerformanceMetrics {
  // Basic Match Stats
  matchesPlayed: number;
  matchesWon: number;
  matchesDrawn: number;
  matchesLost: number;
  points: number;
  winPercentage: number;
  drawPercentage: number;
  lossPercentage: number;

  // Goal Statistics
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  averageGoalsFor: number;
  averageGoalsAgainst: number;
  cleanSheets: number;
  goalsConceded: number;

  // Performance Metrics
  averagePossession: number;
  averageShots: number;
  averageShotsOnTarget: number;
  averageCorners: number;
  averageFouls: number;
  averageYellowCards: number;
  averageRedCards: number;
  averagePasses: number;
  averagePassAccuracy: number;
  averageTackles: number;
  averageInterceptions: number;
  averageOffsides: number;
  averageSaves: number;
  averageClearances: number;
  averageBlocks: number;
  averageDistance: number;
  averageSprints: number;

  // Advanced Metrics
  shotAccuracy: number; // shots on target / total shots
  passAccuracy: number; // completed passes / total passes
  tackleSuccess: number; // successful tackles / total tackles
  savePercentage: number; // saves / (saves + goals conceded)
  possessionEfficiency: number; // goals / possession percentage
  defensiveEfficiency: number; // clean sheets / matches played

  // Form and Trends
  currentForm: 'excellent' | 'good' | 'average' | 'poor' | 'terrible';
  formScore: number; // weighted average of recent performances
  unbeatenStreak: number;
  winningStreak: number;
  losingStreak: number;
  goalsScoredStreak: number;
  cleanSheetStreak: number;

  // Home/Away Performance
  homeStats: {
    matchesPlayed: number;
    matchesWon: number;
    matchesDrawn: number;
    matchesLost: number;
    points: number;
    goalsFor: number;
    goalsAgainst: number;
    winPercentage: number;
  };
  awayStats: {
    matchesPlayed: number;
    matchesWon: number;
    matchesDrawn: number;
    matchesLost: number;
    points: number;
    goalsFor: number;
    goalsAgainst: number;
    winPercentage: number;
  };

  // Season Performance
  seasonProgress: {
    currentPosition: number;
    totalTeams: number;
    pointsFromTop: number;
    pointsFromRelegation: number;
    promotionChance: number;
    relegationRisk: number;
  };

  // Head-to-Head Performance
  headToHeadStats: Array<{
    opponentId: string;
    opponentName: string;
    matchesPlayed: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    lastMeeting: Date;
    lastMeetingResult: 'win' | 'draw' | 'loss';
  }>;
}

export interface TeamComparison {
  teamId: string;
  teamName: string;
  metrics: {
    [key: string]: {
      value: number;
      rank: number;
      percentile: number;
      trend: 'improving' | 'declining' | 'stable';
    };
  };
  overallRank: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface TeamTrend {
  period: string;
  metric: string;
  trend: 'improving' | 'declining' | 'stable';
  change: number;
  changePercentage: number;
  significance: 'high' | 'medium' | 'low';
}

export interface TeamInsights {
  strengths: Array<{
    category: string;
    metric: string;
    value: number;
    benchmark: number;
    description: string;
  }>;
  weaknesses: Array<{
    category: string;
    metric: string;
    value: number;
    benchmark: number;
    description: string;
  }>;
  opportunities: Array<{
    area: string;
    currentValue: number;
    potentialValue: number;
    improvement: number;
    action: string;
  }>;
  threats: Array<{
    area: string;
    currentValue: number;
    riskLevel: 'low' | 'medium' | 'high';
    description: string;
    mitigation: string;
  }>;
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    action: string;
    expectedImpact: string;
    timeline: string;
  }>;
}

export class TeamStatisticsService extends EventEmitter {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    super();
    this.prisma = prisma;
  }

  /**
   * Calculate comprehensive team performance metrics
   */
  async calculateTeamPerformance(
    teamId: string,
    season?: string,
    period?: { startDate: Date; endDate: Date }
  ): Promise<TeamPerformanceMetrics> {
    try {
      const whereClause: any = { teamId };
      if (season) whereClause.season = season;
      if (period) {
        whereClause.createdAt = {
          gte: period.startDate,
          lte: period.endDate
        };
      }

      // Get team season stats
      const seasonStats = await this.prisma.teamSeasonStats.findMany({
        where: whereClause
      });

      // Get team match stats
      const matchStats = await this.prisma.teamMatchStats.findMany({
        where: whereClause,
        include: {
          match: true
        }
      });

      // Get team info
      const team = await this.prisma.team.findUnique({
        where: { id: teamId }
      });

      if (!team) {
        throw new Error(`Team not found: ${teamId}`);
      }

      // Calculate basic metrics
      const basicMetrics = this.calculateBasicMetrics(seasonStats, matchStats);
      
      // Calculate performance metrics
      const performanceMetrics = this.calculatePerformanceMetrics(matchStats);
      
      // Calculate form and trends
      const formMetrics = this.calculateFormMetrics(matchStats);
      
      // Calculate home/away performance
      const homeAwayStats = this.calculateHomeAwayStats(matchStats);
      
      // Calculate season progress
      const seasonProgress = await this.calculateSeasonProgress(teamId, season);
      
      // Calculate head-to-head stats
      const headToHeadStats = await this.calculateHeadToHeadStats(teamId, season);

      return {
        ...basicMetrics,
        ...performanceMetrics,
        ...formMetrics,
        homeStats: homeAwayStats.home,
        awayStats: homeAwayStats.away,
        seasonProgress,
        headToHeadStats
      };
    } catch (error) {
      console.error(`Error calculating team performance for ${teamId}:`, error);
      throw error;
    }
  }

  /**
   * Compare team performance with other teams
   */
  async compareTeamPerformance(
    teamId: string,
    comparisonType: 'league' | 'division' | 'tournament',
    season?: string
  ): Promise<TeamComparison> {
    try {
      // Get all teams in the same league/division/tournament
      const teams = await this.getTeamsByType(comparisonType, season);
      
      // Calculate performance for all teams
      const teamPerformances = await Promise.all(
        teams.map(async (team) => {
          const metrics = await this.calculateTeamPerformance(team.id, season);
          return { teamId: team.id, teamName: team.name, metrics };
        })
      );

      // Find the target team
      const targetTeam = teamPerformances.find(t => t.teamId === teamId);
      if (!targetTeam) {
        throw new Error(`Team not found in comparison: ${teamId}`);
      }

      // Calculate rankings and percentiles
      const comparison = this.calculateComparison(targetTeam, teamPerformances);

      return comparison;
    } catch (error) {
      console.error(`Error comparing team performance for ${teamId}:`, error);
      throw error;
    }
  }

  /**
   * Get team performance insights
   */
  async getTeamInsights(
    teamId: string,
    season?: string
  ): Promise<TeamInsights> {
    try {
      const metrics = await this.calculateTeamPerformance(teamId, season);
      
      // Get league averages for benchmarking
      const leagueAverages = await this.getLeagueAverages(season);
      
      // Analyze strengths and weaknesses
      const strengths = this.analyzeStrengths(metrics, leagueAverages);
      const weaknesses = this.analyzeWeaknesses(metrics, leagueAverages);
      
      // Identify opportunities and threats
      const opportunities = this.identifyOpportunities(metrics, leagueAverages);
      const threats = this.identifyThreats(metrics, leagueAverages);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(metrics, strengths, weaknesses, opportunities, threats);

      return {
        strengths,
        weaknesses,
        opportunities,
        threats,
        recommendations
      };
    } catch (error) {
      console.error(`Error getting team insights for ${teamId}:`, error);
      throw error;
    }
  }

  /**
   * Update team statistics when new match data is available
   */
  async updateTeamStatistics(teamId: string, matchId: string): Promise<void> {
    try {
      // Get match details
      const match = await this.prisma.match.findUnique({
        where: { id: matchId },
        include: {
          homeTeam: true,
          awayTeam: true,
          events: true
        }
      });

      if (!match) {
        throw new Error(`Match not found: ${matchId}`);
      }

      // Determine if team is home or away
      const isHomeTeam = match.homeTeamId === teamId;
      const opponentId = isHomeTeam ? match.awayTeamId : match.homeTeamId;
      
      // Get match result
      const result = this.calculateMatchResult(match, isHomeTeam);
      
      // Update team season stats
      await this.updateTeamSeasonStats(teamId, match, result);
      
      // Update team match stats
      await this.updateTeamMatchStats(teamId, matchId, match.events);
      
      // Emit update event
      this.emit('teamStatisticsUpdated', {
        teamId,
        matchId,
        timestamp: new Date(),
        data: { result, matchId }
      });
    } catch (error) {
      console.error(`Error updating team statistics for ${teamId}:`, error);
      throw error;
    }
  }

  /**
   * Get team performance trends over time
   */
  async getTeamTrends(
    teamId: string,
    season?: string,
    period: 'week' | 'month' | 'quarter' = 'month'
  ): Promise<TeamTrend[]> {
    try {
      const metrics = await this.calculateTeamPerformance(teamId, season);
      
      // Get historical data for trend analysis
      const historicalData = await this.getHistoricalTeamData(teamId, season, period);
      
      // Calculate trends for key metrics
      const trends: TeamTrend[] = [];
      
      const keyMetrics = ['goalsFor', 'goalsAgainst', 'points', 'winPercentage', 'averagePossession'];
      
      for (const metric of keyMetrics) {
        const trend = this.calculateMetricTrend(historicalData, metric);
        if (trend) {
          trends.push(trend);
        }
      }

      return trends;
    } catch (error) {
      console.error(`Error getting team trends for ${teamId}:`, error);
      throw error;
    }
  }

  /**
   * Generate team performance report
   */
  async generateTeamReport(
    teamId: string,
    season?: string,
    includeRecommendations: boolean = true
  ): Promise<{
    team: Team;
    performance: TeamPerformanceMetrics;
    insights: TeamInsights;
    trends: TeamTrend[];
    recommendations: string[];
  }> {
    try {
      const [team, performance, insights, trends] = await Promise.all([
        this.prisma.team.findUnique({ where: { id: teamId } }),
        this.calculateTeamPerformance(teamId, season),
        this.getTeamInsights(teamId, season),
        this.getTeamTrends(teamId, season)
      ]);

      if (!team) {
        throw new Error(`Team not found: ${teamId}`);
      }

      const recommendations = includeRecommendations 
        ? insights.recommendations.map(r => r.action)
        : [];

      return {
        team,
        performance,
        insights,
        trends,
        recommendations
      };
    } catch (error) {
      console.error(`Error generating team report for ${teamId}:`, error);
      throw error;
    }
  }

  // Private helper methods
  private calculateBasicMetrics(seasonStats: TeamSeasonStats[], matchStats: any[]) {
    const totalMatches = matchStats.length;
    const totalWins = seasonStats.reduce((sum, stat) => sum + stat.matchesWon, 0);
    const totalDraws = seasonStats.reduce((sum, stat) => sum + stat.matchesDrawn, 0);
    const totalLosses = seasonStats.reduce((sum, stat) => sum + stat.matchesLost, 0);
    const totalPoints = seasonStats.reduce((sum, stat) => sum + stat.points, 0);
    const totalGoalsFor = seasonStats.reduce((sum, stat) => sum + stat.goalsFor, 0);
    const totalGoalsAgainst = seasonStats.reduce((sum, stat) => sum + stat.goalsAgainst, 0);
    const totalCleanSheets = seasonStats.reduce((sum, stat) => sum + stat.cleanSheets, 0);

    return {
      matchesPlayed: totalMatches,
      matchesWon: totalWins,
      matchesDrawn: totalDraws,
      matchesLost: totalLosses,
      points: totalPoints,
      winPercentage: totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0,
      drawPercentage: totalMatches > 0 ? (totalDraws / totalMatches) * 100 : 0,
      lossPercentage: totalMatches > 0 ? (totalLosses / totalMatches) * 100 : 0,
      goalsFor: totalGoalsFor,
      goalsAgainst: totalGoalsAgainst,
      goalDifference: totalGoalsFor - totalGoalsAgainst,
      averageGoalsFor: totalMatches > 0 ? totalGoalsFor / totalMatches : 0,
      averageGoalsAgainst: totalMatches > 0 ? totalGoalsAgainst / totalMatches : 0,
      cleanSheets: totalCleanSheets,
      goalsConceded: totalGoalsAgainst
    };
  }

  private calculatePerformanceMetrics(matchStats: any[]) {
    if (matchStats.length === 0) {
      return this.getDefaultPerformanceMetrics();
    }

    const totals = matchStats.reduce((acc, stat) => {
      acc.possession += stat.possession || 0;
      acc.shots += stat.shots || 0;
      acc.shotsOnTarget += stat.shotsOnTarget || 0;
      acc.corners += stat.corners || 0;
      acc.fouls += stat.fouls || 0;
      acc.yellowCards += stat.yellowCards || 0;
      acc.redCards += stat.redCards || 0;
      acc.passes += stat.passes || 0;
      acc.passesCompleted += stat.passesCompleted || 0;
      acc.tackles += stat.tackles || 0;
      acc.interceptions += stat.interceptions || 0;
      acc.offsides += stat.offsides || 0;
      acc.saves += stat.saves || 0;
      acc.clearances += stat.clearances || 0;
      acc.blocks += stat.blocks || 0;
      acc.distance += stat.distance || 0;
      acc.sprints += stat.sprints || 0;
      return acc;
    }, {
      possession: 0, shots: 0, shotsOnTarget: 0, corners: 0, fouls: 0,
      yellowCards: 0, redCards: 0, passes: 0, passesCompleted: 0, tackles: 0,
      interceptions: 0, offsides: 0, saves: 0, clearances: 0, blocks: 0,
      distance: 0, sprints: 0
    });

    const matchCount = matchStats.length;

    return {
      averagePossession: totals.possession / matchCount,
      averageShots: totals.shots / matchCount,
      averageShotsOnTarget: totals.shotsOnTarget / matchCount,
      averageCorners: totals.corners / matchCount,
      averageFouls: totals.fouls / matchCount,
      averageYellowCards: totals.yellowCards / matchCount,
      averageRedCards: totals.redCards / matchCount,
      averagePasses: totals.passes / matchCount,
      averagePassAccuracy: totals.passes > 0 ? (totals.passesCompleted / totals.passes) * 100 : 0,
      averageTackles: totals.tackles / matchCount,
      averageInterceptions: totals.interceptions / matchCount,
      averageOffsides: totals.offsides / matchCount,
      averageSaves: totals.saves / matchCount,
      averageClearances: totals.clearances / matchCount,
      averageBlocks: totals.blocks / matchCount,
      averageDistance: totals.distance / matchCount,
      averageSprints: totals.sprints / matchCount,
      shotAccuracy: totals.shots > 0 ? (totals.shotsOnTarget / totals.shots) * 100 : 0,
      passAccuracy: totals.passes > 0 ? (totals.passesCompleted / totals.passes) * 100 : 0,
      tackleSuccess: totals.tackles > 0 ? (totals.tackles / totals.tackles) * 100 : 0, // Simplified
      savePercentage: totals.saves > 0 ? (totals.saves / (totals.saves + totals.shotsOnTarget)) * 100 : 0,
      possessionEfficiency: totals.possession > 0 ? (totals.shots / (totals.possession / 100)) : 0,
      defensiveEfficiency: matchCount > 0 ? (totals.saves / matchCount) : 0
    };
  }

  private getDefaultPerformanceMetrics() {
    return {
      averagePossession: 50, averageShots: 0, averageShotsOnTarget: 0, averageCorners: 0,
      averageFouls: 0, averageYellowCards: 0, averageRedCards: 0, averagePasses: 0,
      averagePassAccuracy: 0, averageTackles: 0, averageInterceptions: 0, averageOffsides: 0,
      averageSaves: 0, averageClearances: 0, averageBlocks: 0, averageDistance: 0,
      averageSprints: 0, shotAccuracy: 0, passAccuracy: 0, tackleSuccess: 0,
      savePercentage: 0, possessionEfficiency: 0, defensiveEfficiency: 0
    };
  }

  private calculateFormMetrics(matchStats: any[]) {
    if (matchStats.length === 0) {
      return {
        currentForm: 'average' as const,
        formScore: 0,
        unbeatenStreak: 0,
        winningStreak: 0,
        losingStreak: 0,
        goalsScoredStreak: 0,
        cleanSheetStreak: 0
      };
    }

    // Sort by date (most recent first)
    const sortedStats = matchStats.sort((a, b) => 
      new Date(b.match.createdAt).getTime() - new Date(a.match.createdAt).getTime()
    );

    // Calculate streaks
    let unbeatenStreak = 0;
    let winningStreak = 0;
    let losingStreak = 0;
    let goalsScoredStreak = 0;
    let cleanSheetStreak = 0;

    for (const stat of sortedStats) {
      if (stat.goals > 0) {
        goalsScoredStreak++;
      } else {
        break;
      }
    }

    // Calculate form score (weighted average of last 5 matches)
    const recentMatches = sortedStats.slice(0, 5);
    let formScore = 0;
    let totalWeight = 0;

    recentMatches.forEach((stat, index) => {
      const weight = 5 - index; // More recent matches have higher weight
      const matchScore = this.calculateMatchScore(stat);
      formScore += matchScore * weight;
      totalWeight += weight;
    });

    formScore = totalWeight > 0 ? formScore / totalWeight : 0;

    // Determine current form
    let currentForm: 'excellent' | 'good' | 'average' | 'poor' | 'terrible';
    if (formScore >= 8) currentForm = 'excellent';
    else if (formScore >= 6) currentForm = 'good';
    else if (formScore >= 4) currentForm = 'average';
    else if (formScore >= 2) currentForm = 'poor';
    else currentForm = 'terrible';

    return {
      currentForm,
      formScore,
      unbeatenStreak,
      winningStreak,
      losingStreak,
      goalsScoredStreak,
      cleanSheetStreak
    };
  }

  private calculateMatchScore(stat: any): number {
    // Simplified match score calculation
    let score = 5; // Base score
    
    if (stat.goals > 0) score += 2;
    if (stat.shotsOnTarget > stat.shots * 0.5) score += 1;
    if (stat.passesCompleted > stat.passes * 0.8) score += 1;
    if (stat.tackles > 0) score += 1;
    
    return Math.min(10, Math.max(1, score));
  }

  private calculateHomeAwayStats(matchStats: any[]) {
    const homeStats = { matchesPlayed: 0, matchesWon: 0, matchesDrawn: 0, matchesLost: 0, points: 0, goalsFor: 0, goalsAgainst: 0, winPercentage: 0 };
    const awayStats = { matchesPlayed: 0, matchesWon: 0, matchesDrawn: 0, matchesLost: 0, points: 0, goalsFor: 0, goalsAgainst: 0, winPercentage: 0 };

    // This would need to be enhanced with actual home/away logic
    // For now, returning default values
    return { home: homeStats, away: awayStats };
  }

  private async calculateSeasonProgress(teamId: string, season?: string) {
    // This would calculate current position, points from top, etc.
    return {
      currentPosition: 0,
      totalTeams: 0,
      pointsFromTop: 0,
      pointsFromRelegation: 0,
      promotionChance: 0,
      relegationRisk: 0
    };
  }

  private async calculateHeadToHeadStats(teamId: string, season?: string) {
    // This would calculate head-to-head performance against other teams
    return [];
  }

  private async getTeamsByType(type: string, season?: string) {
    // This would get teams by league/division/tournament
    return await this.prisma.team.findMany({ take: 20 });
  }

  private calculateComparison(targetTeam: any, allTeams: any[]): TeamComparison {
    // Simplified comparison calculation
    return {
      teamId: targetTeam.teamId,
      teamName: targetTeam.teamName,
      metrics: {},
      overallRank: 1,
      strengths: [],
      weaknesses: [],
      recommendations: []
    };
  }

  private async getLeagueAverages(season?: string) {
    // This would get league averages for benchmarking
    return {};
  }

  private analyzeStrengths(metrics: any, leagueAverages: any) {
    // This would analyze team strengths
    return [];
  }

  private analyzeWeaknesses(metrics: any, leagueAverages: any) {
    // This would analyze team weaknesses
    return [];
  }

  private identifyOpportunities(metrics: any, leagueAverages: any) {
    // This would identify improvement opportunities
    return [];
  }

  private identifyThreats(metrics: any, leagueAverages: any) {
    // This would identify potential threats
    return [];
  }

  private generateRecommendations(metrics: any, strengths: any[], weaknesses: any[], opportunities: any[], threats: any[]) {
    // This would generate actionable recommendations
    return [];
  }

  private calculateMatchResult(match: any, isHomeTeam: boolean) {
    // This would calculate match result (win/draw/loss)
    return 'draw';
  }

  private async updateTeamSeasonStats(teamId: string, match: any, result: string) {
    // This would update team season statistics
  }

  private async updateTeamMatchStats(teamId: string, matchId: string, events: any[]) {
    // This would update team match statistics
  }

  private async getHistoricalTeamData(teamId: string, season?: string, period: string) {
    // This would get historical team data for trend analysis
    return [];
  }

  private calculateMetricTrend(historicalData: any[], metric: string): TeamTrend | null {
    // This would calculate trend for a specific metric
    return null;
  }
}

export default TeamStatisticsService;
