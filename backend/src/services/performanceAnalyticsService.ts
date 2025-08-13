import { PrismaClient, User, PlayerMatchStats, TeamMatchStats, Match, Team } from '@prisma/client';
import { PlayerPerformanceMetrics, PerformanceComparison, PerformanceTrend, PerformanceInsights } from './playerPerformanceService';

export interface PerformanceAnalytics {
  // Player Rankings
  topScorers: Array<{
    playerId: string;
    playerName: string;
    teamName: string;
    goals: number;
    assists: number;
    goalContribution: number;
    rating: number;
  }>;
  
  topAssists: Array<{
    playerId: string;
    playerName: string;
    teamName: string;
    assists: number;
    goals: number;
    rating: number;
  }>;
  
  topRated: Array<{
    playerId: string;
    playerName: string;
    teamName: string;
    averageRating: number;
    matchesPlayed: number;
    goals: number;
    assists: number;
  }>;
  
  // Team Performance
  teamRankings: Array<{
    teamId: string;
    teamName: string;
    matchesPlayed: number;
    wins: number;
    draws: number;
    losses: number;
    points: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    winPercentage: number;
  }>;
  
  // Performance Trends
  performanceTrends: Array<{
    period: string;
    metric: string;
    trend: 'improving' | 'declining' | 'stable';
    change: number;
    players: Array<{
      playerId: string;
      playerName: string;
      change: number;
    }>;
  }>;
  
  // Statistical Insights
  statisticalInsights: Array<{
    category: string;
    insight: string;
    value: number;
    benchmark: number;
    significance: 'high' | 'medium' | 'low';
  }>;
}

export interface AnalyticsFilters {
  season?: string;
  teamId?: string;
  position?: string;
  minMatches?: number;
  startDate?: Date;
  endDate?: Date;
  leagueId?: string;
  tournamentId?: string;
}

export interface PerformanceReport {
  summary: {
    totalPlayers: number;
    totalMatches: number;
    totalTeams: number;
    period: string;
    generatedAt: Date;
  };
  analytics: PerformanceAnalytics;
  insights: PerformanceInsights[];
  recommendations: string[];
}

export class PerformanceAnalyticsService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Generate comprehensive performance analytics
   */
  async generatePerformanceAnalytics(filters: AnalyticsFilters): Promise<PerformanceAnalytics> {
    try {
      const [
        topScorers,
        topAssists,
        topRated,
        teamRankings,
        performanceTrends,
        statisticalInsights
      ] = await Promise.all([
        this.getTopScorers(filters),
        this.getTopAssists(filters),
        this.getTopRated(filters),
        this.getTeamRankings(filters),
        this.getPerformanceTrends(filters),
        this.getStatisticalInsights(filters)
      ]);

      return {
        topScorers,
        topAssists,
        topRated,
        teamRankings,
        performanceTrends,
        statisticalInsights
      };
    } catch (error) {
      console.error('Error generating performance analytics:', error);
      throw new Error('Failed to generate performance analytics');
    }
  }

  /**
   * Get top goal scorers
   */
  private async getTopScorers(filters: AnalyticsFilters): Promise<any[]> {
    const whereClause = this.buildWhereClause(filters);
    
    const topScorers = await this.prisma.playerMatchStats.groupBy({
      by: ['playerId'],
      where: whereClause,
      _sum: {
        goals: true,
        assists: true,
        rating: true
      },
      _count: {
        matchId: true
      },
      orderBy: {
        _sum: {
          goals: 'desc'
        }
      },
      take: 20
    });

    // Get player and team details
    const playerDetails = await this.getPlayerDetails(
      topScorers.map(stat => stat.playerId)
    );

    return topScorers.map((stat, index) => {
      const player = playerDetails.find(p => p.id === stat.playerId);
      return {
        playerId: stat.playerId,
        playerName: player?.displayName || 'Unknown Player',
        teamName: player?.teams[0]?.team?.name || 'Unknown Team',
        goals: stat._sum.goals || 0,
        assists: stat._sum.assists || 0,
        goalContribution: (stat._sum.goals || 0) + (stat._sum.assists || 0),
        rating: stat._sum.rating ? (stat._sum.rating / (stat._count.matchId || 1)) : 0,
        rank: index + 1
      };
    });
  }

  /**
   * Get top assist providers
   */
  private async getTopAssists(filters: AnalyticsFilters): Promise<any[]> {
    const whereClause = this.buildWhereClause(filters);
    
    const topAssists = await this.prisma.playerMatchStats.groupBy({
      by: ['playerId'],
      where: whereClause,
      _sum: {
        assists: true,
        goals: true,
        rating: true
      },
      _count: {
        matchId: true
      },
      orderBy: {
        _sum: {
          assists: 'desc'
        }
      },
      take: 20
    });

    const playerDetails = await this.getPlayerDetails(
      topAssists.map(stat => stat.playerId)
    );

    return topAssists.map((stat, index) => {
      const player = playerDetails.find(p => p.id === stat.playerId);
      return {
        playerId: stat.playerId,
        playerName: player?.displayName || 'Unknown Player',
        teamName: player?.teams[0]?.team?.name || 'Unknown Team',
        assists: stat._sum.assists || 0,
        goals: stat._sum.goals || 0,
        rating: stat._sum.rating ? (stat._sum.rating / (stat._count.matchId || 1)) : 0,
        rank: index + 1
      };
    });
  }

  /**
   * Get top rated players
   */
  private async getTopRated(filters: AnalyticsFilters): Promise<any[]> {
    const whereClause = this.buildWhereClause(filters);
    
    // Get players with minimum matches played
    const minMatches = filters.minMatches || 3;
    
    const topRated = await this.prisma.playerMatchStats.groupBy({
      by: ['playerId'],
      where: {
        ...whereClause,
        match: {
          ...whereClause.match,
          // Ensure minimum matches played
        }
      },
      _sum: {
        rating: true,
        goals: true,
        assists: true
      },
      _count: {
        matchId: true
      },
      having: {
        matchId: {
          _count: {
            gte: minMatches
          }
        }
      },
      orderBy: {
        _sum: {
          rating: 'desc'
        }
      },
      take: 20
    });

    const playerDetails = await this.getPlayerDetails(
      topRated.map(stat => stat.playerId)
    );

    return topRated.map((stat, index) => {
      const player = playerDetails.find(p => p.id === stat.playerId);
      const matchesPlayed = stat._count.matchId || 1;
      return {
        playerId: stat.playerId,
        playerName: player?.displayName || 'Unknown Player',
        teamName: player?.teams[0]?.team?.name || 'Unknown Team',
        averageRating: Math.round((stat._sum.rating || 0) / matchesPlayed * 10) / 10,
        matchesPlayed,
        goals: stat._sum.goals || 0,
        assists: stat._sum.assists || 0,
        rank: index + 1
      };
    });
  }

  /**
   * Get team rankings
   */
  private async getTeamRankings(filters: AnalyticsFilters): Promise<any[]> {
    const whereClause = this.buildWhereClause(filters);
    
    const teamStats = await this.prisma.teamMatchStats.groupBy({
      by: ['teamId'],
      where: whereClause,
      _sum: {
        goals: true
      },
      _count: {
        matchId: true
      }
    });

    // Get team details and calculate win/loss/draw records
    const teamDetails = await this.prisma.team.findMany({
      where: {
        id: { in: teamStats.map(stat => stat.teamId) }
      },
      include: {
        matches: {
          where: whereClause.match,
          include: {
            homeTeam: true,
            awayTeam: true
          }
        }
      }
    });

    const rankings = teamDetails.map(team => {
      const stats = teamStats.find(s => s.teamId === team.id);
      const matches = team.matches;
      
      let wins = 0, draws = 0, losses = 0;
      let goalsFor = 0, goalsAgainst = 0;
      
      matches.forEach(match => {
        if (match.homeTeamId === team.id) {
          goalsFor += match.homeScore || 0;
          goalsAgainst += match.awayScore || 0;
          
          if ((match.homeScore || 0) > (match.awayScore || 0)) wins++;
          else if ((match.homeScore || 0) === (match.awayScore || 0)) draws++;
          else losses++;
        } else {
          goalsFor += match.awayScore || 0;
          goalsAgainst += match.homeScore || 0;
          
          if ((match.awayScore || 0) > (match.homeScore || 0)) wins++;
          else if ((match.awayScore || 0) === (match.homeScore || 0)) draws++;
          else losses++;
        }
      });

      const points = wins * 3 + draws;
      const goalDifference = goalsFor - goalsAgainst;
      const winPercentage = matches.length > 0 ? (wins / matches.length) * 100 : 0;

      return {
        teamId: team.id,
        teamName: team.name,
        matchesPlayed: matches.length,
        wins,
        draws,
        losses,
        points,
        goalsFor,
        goalsAgainst,
        goalDifference,
        winPercentage: Math.round(winPercentage * 10) / 10
      };
    });

    // Sort by points, then goal difference, then goals for
    return rankings.sort((a, b) => {
      if (a.points !== b.points) return b.points - a.points;
      if (a.goalDifference !== b.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });
  }

  /**
   * Get performance trends over time
   */
  private async getPerformanceTrends(filters: AnalyticsFilters): Promise<any[]> {
    // This would analyze performance changes over different time periods
    // For now, return a basic structure
    return [
      {
        period: 'Last 5 matches',
        metric: 'Average Rating',
        trend: 'improving' as const,
        change: 0.3,
        players: []
      }
    ];
  }

  /**
   * Get statistical insights
   */
  private async getStatisticalInsights(filters: AnalyticsFilters): Promise<any[]> {
    const whereClause = this.buildWhereClause(filters);
    
    // Calculate various statistics
    const [
      totalGoals,
      totalAssists,
      totalMatches,
      averageRating,
      totalDistance
    ] = await Promise.all([
      this.prisma.playerMatchStats.aggregate({
        where: whereClause,
        _sum: { goals: true }
      }),
      this.prisma.playerMatchStats.aggregate({
        where: whereClause,
        _sum: { assists: true }
      }),
      this.prisma.match.count({
        where: whereClause.match
      }),
      this.prisma.playerMatchStats.aggregate({
        where: whereClause,
        _avg: { rating: true }
      }),
      this.prisma.playerMatchStats.aggregate({
        where: whereClause,
        _sum: { distance: true }
      })
    ]);

    const insights: any[] = [];

    // Goals per match insight
    if (totalMatches > 0) {
      const goalsPerMatch = (totalGoals._sum.goals || 0) / totalMatches;
      insights.push({
        category: 'Scoring',
        insight: `Average goals per match: ${Math.round(goalsPerMatch * 10) / 10}`,
        value: goalsPerMatch,
        benchmark: 2.5,
        significance: goalsPerMatch > 3 ? 'high' : goalsPerMatch > 2 ? 'medium' : 'low'
      });
    }

    // Assists per match insight
    if (totalMatches > 0) {
      const assistsPerMatch = (totalAssists._sum.assists || 0) / totalMatches;
      insights.push({
        category: 'Playmaking',
        insight: `Average assists per match: ${Math.round(assistsPerMatch * 10) / 10}`,
        value: assistsPerMatch,
        benchmark: 1.5,
        significance: assistsPerMatch > 2 ? 'high' : assistsPerMatch > 1.5 ? 'medium' : 'low'
      });
    }

    // Average rating insight
    if (averageRating._avg.rating) {
      insights.push({
        category: 'Performance',
        insight: `Overall average player rating: ${Math.round(averageRating._avg.rating * 10) / 10}`,
        value: averageRating._avg.rating,
        benchmark: 6.5,
        significance: averageRating._avg.rating > 7 ? 'high' : averageRating._avg.rating > 6.5 ? 'medium' : 'low'
      });
    }

    // Distance covered insight
    if (totalDistance._sum.distance && totalMatches > 0) {
      const avgDistance = totalDistance._sum.distance / totalMatches;
      insights.push({
        category: 'Fitness',
        insight: `Average distance covered per match: ${Math.round(avgDistance / 1000 * 10) / 10}km`,
        value: avgDistance,
        benchmark: 8000,
        significance: avgDistance > 10000 ? 'high' : avgDistance > 8000 ? 'medium' : 'low'
      });
    }

    return insights;
  }

  /**
   * Generate comprehensive performance report
   */
  async generatePerformanceReport(filters: AnalyticsFilters): Promise<PerformanceReport> {
    try {
      const analytics = await this.generatePerformanceAnalytics(filters);
      
      // Generate insights for top players
      const topPlayerIds = [
        ...analytics.topScorers.slice(0, 5).map(p => p.playerId),
        ...analytics.topAssists.slice(0, 5).map(p => p.playerId),
        ...analytics.topRated.slice(0, 5).map(p => p.playerId)
      ];

      const uniquePlayerIds = [...new Set(topPlayerIds)];
      const insights = await Promise.all(
        uniquePlayerIds.map(async (playerId) => {
          // This would call the PlayerPerformanceService to get insights
          // For now, return a basic structure
          return {
            playerId,
            strengths: ['Goal scoring', 'Team play'],
            weaknesses: ['Defensive positioning'],
            recommendations: ['Focus on defensive drills'],
            trends: [],
            comparisons: []
          };
        })
      );

      const recommendations = this.generateSystemRecommendations(analytics);

      return {
        summary: {
          totalPlayers: uniquePlayerIds.length,
          totalMatches: analytics.teamRankings.reduce((sum, team) => sum + team.matchesPlayed, 0),
          totalTeams: analytics.teamRankings.length,
          period: this.getPeriodDescription(filters),
          generatedAt: new Date()
        },
        analytics,
        insights,
        recommendations
      };
    } catch (error) {
      console.error('Error generating performance report:', error);
      throw new Error('Failed to generate performance report');
    }
  }

  /**
   * Build where clause for database queries
   */
  private buildWhereClause(filters: AnalyticsFilters): any {
    const whereClause: any = {};

    if (filters.season) {
      whereClause.match = { ...whereClause.match, season: filters.season };
    }

    if (filters.teamId) {
      whereClause.teamId = filters.teamId;
    }

    if (filters.startDate || filters.endDate) {
      whereClause.match = {
        ...whereClause.match,
        date: {}
      };
      
      if (filters.startDate) {
        whereClause.match.date.gte = filters.startDate;
      }
      
      if (filters.endDate) {
        whereClause.match.date.lte = filters.endDate;
      }
    }

    return whereClause;
  }

  /**
   * Get player details with team information
   */
  private async getPlayerDetails(playerIds: string[]): Promise<any[]> {
    return await this.prisma.user.findMany({
      where: { id: { in: playerIds } },
      include: {
        teams: {
          include: {
            team: true
          }
        }
      }
    });
  }

  /**
   * Generate system-wide recommendations
   */
  private generateSystemRecommendations(analytics: PerformanceAnalytics): string[] {
    const recommendations: string[] = [];

    // Analyze team performance
    const lowPerformingTeams = analytics.teamRankings.filter(team => team.winPercentage < 30);
    if (lowPerformingTeams.length > 0) {
      recommendations.push(`Focus on improving performance for ${lowPerformingTeams.length} struggling teams`);
    }

    // Analyze scoring patterns
    const avgGoalsPerMatch = analytics.teamRankings.reduce((sum, team) => 
      sum + team.goalsFor, 0) / analytics.teamRankings.reduce((sum, team) => sum + team.matchesPlayed, 0);
    
    if (avgGoalsPerMatch < 2.0) {
      recommendations.push('Consider implementing attacking drills to improve goal-scoring efficiency');
    }

    // Analyze defensive performance
    const highConcedingTeams = analytics.teamRankings.filter(team => 
      team.goalsAgainst / team.matchesPlayed > 2.5);
    
    if (highConcedingTeams.length > 0) {
      recommendations.push(`Focus on defensive training for ${highConcedingTeams.length} teams with high goals conceded`);
    }

    return recommendations;
  }

  /**
   * Get period description for filters
   */
  private getPeriodDescription(filters: AnalyticsFilters): string {
    if (filters.season) {
      return `Season ${filters.season}`;
    }
    
    if (filters.startDate && filters.endDate) {
      return `${filters.startDate.toLocaleDateString()} - ${filters.endDate.toLocaleDateString()}`;
    }
    
    return 'All time';
  }

  /**
   * Get performance comparison between players
   */
  async comparePlayers(
    playerIds: string[],
    metrics: string[],
    filters: AnalyticsFilters
  ): Promise<PerformanceComparison[]> {
    try {
      const comparisons: PerformanceComparison[] = [];

      for (const playerId of playerIds) {
        // This would call the PlayerPerformanceService to get detailed metrics
        // For now, return a basic structure
        comparisons.push({
          playerId,
          playerName: 'Player Name', // Would be populated from database
          metrics: {} as PlayerPerformanceMetrics, // Would be populated from PlayerPerformanceService
          rank: 1,
          percentile: 75,
          comparison: {
            betterThan: 75,
            topPercentile: false,
            improvement: 5
          }
        });
      }

      return comparisons;
    } catch (error) {
      console.error('Error comparing players:', error);
      throw new Error('Failed to compare players');
    }
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(
    filters: AnalyticsFilters,
    format: 'csv' | 'json' | 'pdf'
  ): Promise<string | Buffer> {
    try {
      const analytics = await this.generatePerformanceAnalytics(filters);
      
      switch (format) {
        case 'json':
          return JSON.stringify(analytics, null, 2);
        
        case 'csv':
          return this.convertToCSV(analytics);
        
        case 'pdf':
          // This would generate a PDF report
          // For now, return a placeholder
          return Buffer.from('PDF report placeholder');
        
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      console.error('Error exporting analytics:', error);
      throw new Error('Failed to export analytics');
    }
  }

  /**
   * Convert analytics data to CSV format
   */
  private convertToCSV(analytics: PerformanceAnalytics): string {
    const csvRows: string[] = [];
    
    // Add headers
    csvRows.push('Category,Player/Team,Metric,Value,Rank');
    
    // Add top scorers
    analytics.topScorers.forEach((scorer, index) => {
      csvRows.push(`Top Scorers,${scorer.playerName},Goals,${scorer.goals},${index + 1}`);
    });
    
    // Add top assists
    analytics.topAssists.forEach((assist, index) => {
      csvRows.push(`Top Assists,${assist.playerName},Assists,${assist.assists},${index + 1}`);
    });
    
    // Add team rankings
    analytics.teamRankings.forEach((team, index) => {
      csvRows.push(`Team Rankings,${team.teamName},Points,${team.points},${index + 1}`);
    });
    
    return csvRows.join('\n');
  }
}

export default PerformanceAnalyticsService;
