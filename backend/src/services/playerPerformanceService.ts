import { PrismaClient, User, PlayerMatchStats, PlayerSeasonStats, Match, Team } from '@prisma/client';
import { EventEmitter } from 'events';

export interface PlayerPerformanceMetrics {
  // Basic Stats
  matchesPlayed: number;
  matchesStarted: number;
  minutesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  
  // Advanced Stats
  goalsPerMatch: number;
  assistsPerMatch: number;
  minutesPerMatch: number;
  goalContribution: number; // goals + assists
  
  // Performance Ratings
  averageRating: number;
  bestRating: number;
  worstRating: number;
  ratingTrend: 'improving' | 'declining' | 'stable';
  
  // Efficiency Metrics
  shotAccuracy: number; // shots on target / total shots
  passAccuracy: number; // completed passes / total passes
  tackleSuccess: number; // successful tackles / total tackles
  
  // Physical Metrics
  totalDistance: number;
  averageDistance: number;
  totalSprints: number;
  averageSprints: number;
  
  // Position-Specific Stats
  goalkeeperStats?: {
    cleanSheets: number;
    goalsConceded: number;
    saves: number;
    savePercentage: number;
    goalsConcededPerMatch: number;
  };
  
  // Form and Consistency
  formScore: number; // weighted average of recent performances
  consistencyRating: number; // standard deviation of ratings
  lastFiveMatches: Array<{
    matchId: string;
    rating: number;
    goals: number;
    assists: number;
    minutesPlayed: number;
    date: Date;
  }>;
}

export interface PerformanceComparison {
  playerId: string;
  playerName: string;
  metrics: PlayerPerformanceMetrics;
  rank: number;
  percentile: number;
  comparison: {
    betterThan: number; // percentage of players this player is better than
    topPercentile: boolean;
    improvement: number; // percentage improvement from last period
  };
}

export interface PerformanceTrend {
  period: string; // 'week', 'month', 'season'
  trend: 'improving' | 'declining' | 'stable';
  change: number; // percentage change
  data: Array<{
    date: string;
    value: number;
    metric: string;
  }>;
}

export interface PerformanceInsights {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  trends: PerformanceTrend[];
  comparisons: PerformanceComparison[];
}

export class PlayerPerformanceService extends EventEmitter {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    super();
    this.prisma = prisma;
  }

  /**
   * Calculate comprehensive performance metrics for a player
   */
  async calculatePlayerPerformance(
    playerId: string,
    season?: string,
    period?: { startDate: Date; endDate: Date }
  ): Promise<PlayerPerformanceMetrics> {
    try {
      // Get player's match stats for the specified period
      const whereClause: any = { playerId };
      
      if (season) {
        whereClause.match = { season };
      }
      
      if (period) {
        whereClause.match = {
          ...whereClause.match,
          date: {
            gte: period.startDate,
            lte: period.endDate
          }
        };
      }

      const matchStats = await this.prisma.playerMatchStats.findMany({
        where: whereClause,
        include: {
          match: true,
          team: true
        },
        orderBy: {
          match: { date: 'desc' }
        }
      });

      if (matchStats.length === 0) {
        return this.getDefaultPerformanceMetrics();
      }

      // Calculate basic metrics
      const basicMetrics = this.calculateBasicMetrics(matchStats);
      
      // Calculate advanced metrics
      const advancedMetrics = this.calculateAdvancedMetrics(matchStats);
      
      // Calculate performance ratings
      const ratingMetrics = this.calculateRatingMetrics(matchStats);
      
      // Calculate efficiency metrics
      const efficiencyMetrics = this.calculateEfficiencyMetrics(matchStats);
      
      // Calculate physical metrics
      const physicalMetrics = this.calculatePhysicalMetrics(matchStats);
      
      // Calculate goalkeeper-specific stats if applicable
      const goalkeeperStats = this.calculateGoalkeeperStats(matchStats);
      
      // Calculate form and consistency
      const formMetrics = this.calculateFormMetrics(matchStats);
      
      // Calculate last five matches
      const lastFiveMatches = this.getLastFiveMatches(matchStats);

      return {
        ...basicMetrics,
        ...advancedMetrics,
        ...ratingMetrics,
        ...efficiencyMetrics,
        ...physicalMetrics,
        ...goalkeeperStats,
        ...formMetrics,
        lastFiveMatches
      };
    } catch (error) {
      console.error('Error calculating player performance:', error);
      throw new Error('Failed to calculate player performance');
    }
  }

  /**
   * Calculate basic performance metrics
   */
  private calculateBasicMetrics(matchStats: PlayerMatchStats[]): any {
    const total = matchStats.reduce((acc, stat) => {
      return {
        matchesPlayed: acc.matchesPlayed + 1,
        matchesStarted: acc.matchesStarted + (stat.minutesPlayed > 0 ? 1 : 0),
        minutesPlayed: acc.minutesPlayed + stat.minutesPlayed,
        goals: acc.goals + stat.goals,
        assists: acc.assists + stat.assists,
        yellowCards: acc.yellowCards + stat.yellowCards,
        redCards: acc.redCards + stat.redCards
      };
    }, {
      matchesPlayed: 0,
      matchesStarted: 0,
      minutesPlayed: 0,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0
    });

    return {
      ...total,
      goalsPerMatch: total.matchesPlayed > 0 ? total.goals / total.matchesPlayed : 0,
      assistsPerMatch: total.matchesPlayed > 0 ? total.assists / total.matchesPlayed : 0,
      minutesPerMatch: total.matchesPlayed > 0 ? total.minutesPlayed / total.matchesPlayed : 0,
      goalContribution: total.goals + total.assists
    };
  }

  /**
   * Calculate advanced performance metrics
   */
  private calculateAdvancedMetrics(matchStats: PlayerMatchStats[]): any {
    const total = matchStats.reduce((acc, stat) => {
      return {
        shots: acc.shots + stat.shots,
        shotsOnTarget: acc.shotsOnTarget + stat.shotsOnTarget,
        passes: acc.passes + stat.passes,
        passesCompleted: acc.passesCompleted + stat.passesCompleted,
        tackles: acc.tackles + stat.tackles,
        tacklesWon: acc.tacklesWon + stat.tacklesWon,
        interceptions: acc.interceptions + stat.interceptions,
        clearances: acc.clearances + stat.clearances,
        fouls: acc.fouls + stat.fouls,
        foulsSuffered: acc.foulsSuffered + stat.foulsSuffered,
        offsides: acc.offsides + stat.offsides
      };
    }, {
      shots: 0, shotsOnTarget: 0, passes: 0, passesCompleted: 0,
      tackles: 0, tacklesWon: 0, interceptions: 0, clearances: 0,
      fouls: 0, foulsSuffered: 0, offsides: 0
    });

    return {
      shotAccuracy: total.shots > 0 ? (total.shotsOnTarget / total.shots) * 100 : 0,
      passAccuracy: total.passes > 0 ? (total.passesCompleted / total.passes) * 100 : 0,
      tackleSuccess: total.tackles > 0 ? (total.tacklesWon / total.tackles) * 100 : 0
    };
  }

  /**
   * Calculate performance rating metrics
   */
  private calculateRatingMetrics(matchStats: PlayerMatchStats[]): any {
    const ratings = matchStats.map(stat => stat.rating).filter(r => r > 0);
    
    if (ratings.length === 0) {
      return {
        averageRating: 6.0,
        bestRating: 6.0,
        worstRating: 6.0,
        ratingTrend: 'stable' as const
      };
    }

    const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    const bestRating = Math.max(...ratings);
    const worstRating = Math.min(...ratings);

    // Calculate rating trend (last 5 matches vs previous 5)
    let ratingTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (ratings.length >= 10) {
      const recentRatings = ratings.slice(0, 5);
      const previousRatings = ratings.slice(5, 10);
      const recentAvg = recentRatings.reduce((sum, r) => sum + r, 0) / recentRatings.length;
      const previousAvg = previousRatings.reduce((sum, r) => sum + r, 0) / previousRatings.length;
      
      if (recentAvg > previousAvg + 0.5) ratingTrend = 'improving';
      else if (recentAvg < previousAvg - 0.5) ratingTrend = 'declining';
    }

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      bestRating: Math.round(bestRating * 10) / 10,
      worstRating: Math.round(worstRating * 10) / 10,
      ratingTrend
    };
  }

  /**
   * Calculate efficiency metrics
   */
  private calculateEfficiencyMetrics(matchStats: PlayerMatchStats[]): any {
    const total = matchStats.reduce((acc, stat) => {
      return {
        shots: acc.shots + stat.shots,
        shotsOnTarget: acc.shotsOnTarget + stat.shotsOnTarget,
        passes: acc.passes + stat.passes,
        passesCompleted: acc.passesCompleted + stat.passesCompleted,
        tackles: acc.tackles + stat.tackles,
        tacklesWon: acc.tacklesWon + stat.tacklesWon
      };
    }, {
      shots: 0, shotsOnTarget: 0, passes: 0, passesCompleted: 0,
      tackles: 0, tacklesWon: 0
    });

    return {
      shotAccuracy: total.shots > 0 ? (total.shotsOnTarget / total.shots) * 100 : 0,
      passAccuracy: total.passes > 0 ? (total.passesCompleted / total.passes) * 100 : 0,
      tackleSuccess: total.tackles > 0 ? (total.tacklesWon / total.tackles) * 100 : 0
    };
  }

  /**
   * Calculate physical metrics
   */
  private calculatePhysicalMetrics(matchStats: PlayerMatchStats[]): any {
    const total = matchStats.reduce((acc, stat) => {
      return {
        distance: acc.distance + stat.distance,
        sprints: acc.sprints + stat.sprints
      };
    }, { distance: 0, sprints: 0 });

    return {
      totalDistance: total.distance,
      averageDistance: matchStats.length > 0 ? total.distance / matchStats.length : 0,
      totalSprints: total.sprints,
      averageSprints: matchStats.length > 0 ? total.sprints / matchStats.length : 0
    };
  }

  /**
   * Calculate goalkeeper-specific statistics
   */
  private calculateGoalkeeperStats(matchStats: PlayerMatchStats[]): any {
    const goalkeeperStats = matchStats.filter(stat => stat.saves !== null);
    
    if (goalkeeperStats.length === 0) return {};

    const total = goalkeeperStats.reduce((acc, stat) => {
      return {
        cleanSheets: acc.cleanSheets + (stat.cleanSheet ? 1 : 0),
        goalsConceded: acc.goalsConceded + (stat.goalsConceded || 0),
        saves: acc.saves + (stat.saves || 0)
      };
    }, { cleanSheets: 0, goalsConceded: 0, saves: 0 });

    const totalGoals = goalkeeperStats.reduce((sum, stat) => sum + (stat.goalsConceded || 0), 0);
    const totalShots = goalkeeperStats.reduce((sum, stat) => sum + (stat.shots || 0), 0);

    return {
      cleanSheets: total.cleanSheets,
      goalsConceded: total.goalsConceded,
      saves: total.saves,
      savePercentage: totalGoals > 0 ? ((totalShots - totalGoals) / totalShots) * 100 : 0,
      goalsConcededPerMatch: goalkeeperStats.length > 0 ? total.goalsConceded / goalkeeperStats.length : 0
    };
  }

  /**
   * Calculate form and consistency metrics
   */
  private calculateFormMetrics(matchStats: PlayerMatchStats[]): any {
    if (matchStats.length < 3) {
      return {
        formScore: 6.0,
        consistencyRating: 0
      };
    }

    // Calculate form score (weighted average of recent performances)
    const recentMatches = matchStats.slice(0, 5);
    let formScore = 0;
    let totalWeight = 0;
    
    recentMatches.forEach((stat, index) => {
      const weight = 5 - index; // More recent matches have higher weight
      formScore += stat.rating * weight;
      totalWeight += weight;
    });

    formScore = totalWeight > 0 ? formScore / totalWeight : 6.0;

    // Calculate consistency rating (lower standard deviation = more consistent)
    const ratings = recentMatches.map(stat => stat.rating);
    const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    const variance = ratings.reduce((sum, r) => sum + Math.pow(r - avgRating, 2), 0) / ratings.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Convert to consistency rating (0-10, where 10 is most consistent)
    const consistencyRating = Math.max(0, 10 - standardDeviation);

    return {
      formScore: Math.round(formScore * 10) / 10,
      consistencyRating: Math.round(consistencyRating * 10) / 10
    };
  }

  /**
   * Get last five matches data
   */
  private getLastFiveMatches(matchStats: PlayerMatchStats[]): any[] {
    return matchStats.slice(0, 5).map(stat => ({
      matchId: stat.matchId,
      rating: stat.rating,
      goals: stat.goals,
      assists: stat.assists,
      minutesPlayed: stat.minutesPlayed,
      date: stat.match.date
    }));
  }

  /**
   * Get default performance metrics for new players
   */
  private getDefaultPerformanceMetrics(): PlayerPerformanceMetrics {
    return {
      matchesPlayed: 0,
      matchesStarted: 0,
      minutesPlayed: 0,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      goalsPerMatch: 0,
      assistsPerMatch: 0,
      minutesPerMatch: 0,
      goalContribution: 0,
      averageRating: 6.0,
      bestRating: 6.0,
      worstRating: 6.0,
      ratingTrend: 'stable',
      shotAccuracy: 0,
      passAccuracy: 0,
      tackleSuccess: 0,
      totalDistance: 0,
      averageDistance: 0,
      totalSprints: 0,
      averageSprints: 0,
      formScore: 6.0,
      consistencyRating: 0,
      lastFiveMatches: []
    };
  }

  /**
   * Compare player performance with team/league averages
   */
  async comparePlayerPerformance(
    playerId: string,
    comparisonType: 'team' | 'league' | 'position',
    season?: string
  ): Promise<PerformanceComparison> {
    try {
      const playerMetrics = await this.calculatePlayerPerformance(playerId, season);
      
      // Get comparison group based on type
      let comparisonGroup: PlayerPerformanceMetrics[] = [];
      
      switch (comparisonType) {
        case 'team':
          comparisonGroup = await this.getTeamPlayerMetrics(playerId, season);
          break;
        case 'league':
          comparisonGroup = await this.getLeaguePlayerMetrics(playerId, season);
          break;
        case 'position':
          comparisonGroup = await this.getPositionPlayerMetrics(playerId, season);
          break;
      }

      if (comparisonGroup.length === 0) {
        return this.getDefaultComparison(playerId, playerMetrics);
      }

      // Calculate rankings and percentiles
      const rankings = this.calculateRankings(playerMetrics, comparisonGroup);
      
      return {
        playerId,
        playerName: '', // Will be populated by caller
        metrics: playerMetrics,
        rank: rankings.rank,
        percentile: rankings.percentile,
        comparison: {
          betterThan: rankings.betterThan,
          topPercentile: rankings.percentile >= 90,
          improvement: 0 // Will be calculated if historical data available
        }
      };
    } catch (error) {
      console.error('Error comparing player performance:', error);
      throw new Error('Failed to compare player performance');
    }
  }

  /**
   * Get performance insights and recommendations
   */
  async getPerformanceInsights(
    playerId: string,
    season?: string
  ): Promise<PerformanceInsights> {
    try {
      const metrics = await this.calculatePlayerPerformance(playerId, season);
      
      const strengths = this.identifyStrengths(metrics);
      const weaknesses = this.identifyWeaknesses(metrics);
      const recommendations = this.generateRecommendations(metrics, weaknesses);
      const trends = await this.calculatePerformanceTrends(playerId, season);
      const comparisons = await this.getPerformanceComparisons(playerId, season);

      return {
        strengths,
        weaknesses,
        recommendations,
        trends,
        comparisons
      };
    } catch (error) {
      console.error('Error getting performance insights:', error);
      throw new Error('Failed to get performance insights');
    }
  }

  /**
   * Identify player strengths based on metrics
   */
  private identifyStrengths(metrics: PlayerPerformanceMetrics): string[] {
    const strengths: string[] = [];

    if (metrics.goalsPerMatch > 0.5) strengths.push('Goal scoring');
    if (metrics.assistsPerMatch > 0.3) strengths.push('Playmaking');
    if (metrics.averageRating > 7.5) strengths.push('Overall performance');
    if (metrics.passAccuracy > 85) strengths.push('Passing accuracy');
    if (metrics.shotAccuracy > 60) strengths.push('Shot accuracy');
    if (metrics.tackleSuccess > 80) strengths.push('Defensive efficiency');
    if (metrics.consistencyRating > 7) strengths.push('Performance consistency');
    if (metrics.averageDistance > 8000) strengths.push('Work rate');

    return strengths;
  }

  /**
   * Identify player weaknesses based on metrics
   */
  private identifyWeaknesses(metrics: PlayerPerformanceMetrics): string[] {
    const weaknesses: string[] = [];

    if (metrics.averageRating < 6.0) weaknesses.push('Overall performance');
    if (metrics.passAccuracy < 70) weaknesses.push('Passing accuracy');
    if (metrics.shotAccuracy < 40) weaknesses.push('Shot accuracy');
    if (metrics.tackleSuccess < 60) weaknesses.push('Defensive efficiency');
    if (metrics.yellowCards > 3) weaknesses.push('Discipline');
    if (metrics.consistencyRating < 5) weaknesses.push('Performance consistency');
    if (metrics.averageDistance < 5000) weaknesses.push('Work rate');

    return weaknesses;
  }

  /**
   * Generate performance improvement recommendations
   */
  private generateRecommendations(
    metrics: PlayerPerformanceMetrics,
    weaknesses: string[]
  ): string[] {
    const recommendations: string[] = [];

    if (weaknesses.includes('Passing accuracy')) {
      recommendations.push('Focus on improving passing technique and decision making');
    }
    if (weaknesses.includes('Shot accuracy')) {
      recommendations.push('Practice shooting drills and improve finishing technique');
    }
    if (weaknesses.includes('Defensive efficiency')) {
      recommendations.push('Work on positioning and tackling technique');
    }
    if (weaknesses.includes('Discipline')) {
      recommendations.push('Improve decision making to avoid unnecessary cards');
    }
    if (weaknesses.includes('Performance consistency')) {
      recommendations.push('Develop mental preparation routines for consistent performance');
    }
    if (weaknesses.includes('Work rate')) {
      recommendations.push('Improve fitness and endurance through conditioning');
    }

    return recommendations;
  }

  /**
   * Calculate performance trends over time
   */
  private async calculatePerformanceTrends(
    playerId: string,
    season?: string
  ): Promise<PerformanceTrend[]> {
    // Implementation for calculating trends over different time periods
    // This would analyze performance changes over weeks, months, and seasons
    return [];
  }

  /**
   * Get performance comparisons with other players
   */
  private async getPerformanceComparisons(
    playerId: string,
    season?: string
  ): Promise<PerformanceComparison[]> {
    // Implementation for comparing with other players
    // This would provide rankings and percentiles
    return [];
  }

  /**
   * Helper methods for comparison calculations
   */
  private async getTeamPlayerMetrics(playerId: string, season?: string): Promise<PlayerPerformanceMetrics[]> {
    // Implementation to get metrics for all players in the same team
    return [];
  }

  private async getLeaguePlayerMetrics(playerId: string, season?: string): Promise<PlayerPerformanceMetrics[]> {
    // Implementation to get metrics for all players in the same league
    return [];
  }

  private async getPositionPlayerMetrics(playerId: string, season?: string): Promise<PlayerPerformanceMetrics[]> {
    // Implementation to get metrics for all players in the same position
    return [];
  }

  private calculateRankings(playerMetrics: PlayerPerformanceMetrics, comparisonGroup: PlayerPerformanceMetrics[]): any {
    // Implementation to calculate rank, percentile, and better-than percentage
    return {
      rank: 1,
      percentile: 90,
      betterThan: 90
    };
  }

  private getDefaultComparison(playerId: string, metrics: PlayerPerformanceMetrics): PerformanceComparison {
    return {
      playerId,
      playerName: '',
      metrics,
      rank: 1,
      percentile: 50,
      comparison: {
        betterThan: 50,
        topPercentile: false,
        improvement: 0
      }
    };
  }

  /**
   * Update player performance metrics when new match data is available
   */
  async updatePlayerPerformance(playerId: string, matchId: string): Promise<void> {
    try {
      // Recalculate performance metrics
      const metrics = await this.calculatePlayerPerformance(playerId);
      
      // Emit performance update event
      this.emit('performanceUpdated', {
        playerId,
        matchId,
        metrics
      });

      // Update season stats if applicable
      await this.updateSeasonStats(playerId, matchId);
    } catch (error) {
      console.error('Error updating player performance:', error);
      throw new Error('Failed to update player performance');
    }
  }

  /**
   * Update season statistics
   */
  private async updateSeasonStats(playerId: string, matchId: string): Promise<void> {
    try {
      const match = await this.prisma.match.findUnique({
        where: { id: matchId },
        select: { season: true, date: true }
      });

      if (!match?.season) return;

      const matchStats = await this.prisma.playerMatchStats.findMany({
        where: {
          playerId,
          match: { season: match.season }
        }
      });

      if (matchStats.length === 0) return;

      // Calculate season totals
      const seasonTotals = matchStats.reduce((acc, stat) => {
        return {
          matchesPlayed: acc.matchesPlayed + 1,
          matchesStarted: acc.matchesStarted + (stat.minutesPlayed > 0 ? 1 : 0),
          minutesPlayed: acc.minutesPlayed + stat.minutesPlayed,
          goals: acc.goals + stat.goals,
          assists: acc.assists + stat.assists,
          yellowCards: acc.yellowCards + stat.yellowCards,
          redCards: acc.redCards + stat.redCards,
          cleanSheets: acc.cleanSheets + (stat.cleanSheet ? 1 : 0),
          goalsConceded: acc.goalsConceded + (stat.goalsConceded || 0),
          saves: acc.saves + (stat.saves || 0),
          totalDistance: acc.totalDistance + stat.distance,
          totalSprints: acc.totalSprints + stat.sprints
        };
      }, {
        matchesPlayed: 0, matchesStarted: 0, minutesPlayed: 0,
        goals: 0, assists: 0, yellowCards: 0, redCards: 0,
        cleanSheets: 0, goalsConceded: 0, saves: 0,
        totalDistance: 0, totalSprints: 0
      });

      const averageRating = matchStats.reduce((sum, stat) => sum + stat.rating, 0) / matchStats.length;

      // Upsert season stats
      await this.prisma.playerSeasonStats.upsert({
        where: {
          playerId_season: {
            playerId,
            season: match.season
          }
        },
        update: {
          matchesPlayed: seasonTotals.matchesPlayed,
          matchesStarted: seasonTotals.matchesStarted,
          minutesPlayed: seasonTotals.minutesPlayed,
          goals: seasonTotals.goals,
          assists: seasonTotals.assists,
          yellowCards: seasonTotals.yellowCards,
          redCards: seasonTotals.redCards,
          cleanSheets: seasonTotals.cleanSheets,
          goalsConceded: seasonTotals.goalsConceded,
          saves: seasonTotals.saves,
          averageRating: Math.round(averageRating * 10) / 10,
          totalDistance: seasonTotals.totalDistance,
          totalSprints: seasonTotals.totalSprints
        },
        create: {
          playerId,
          season: match.season,
          teamId: matchStats[0].teamId,
          matchesPlayed: seasonTotals.matchesPlayed,
          matchesStarted: seasonTotals.matchesStarted,
          minutesPlayed: seasonTotals.minutesPlayed,
          goals: seasonTotals.goals,
          assists: seasonTotals.assists,
          yellowCards: seasonTotals.yellowCards,
          redCards: seasonTotals.redCards,
          cleanSheets: seasonTotals.cleanSheets,
          goalsConceded: seasonTotals.goalsConceded,
          saves: seasonTotals.saves,
          averageRating: Math.round(averageRating * 10) / 10,
          totalDistance: seasonTotals.totalDistance,
          totalSprints: seasonTotals.totalSprints
        }
      });
    } catch (error) {
      console.error('Error updating season stats:', error);
      throw new Error('Failed to update season stats');
    }
  }
}

export default PlayerPerformanceService;
