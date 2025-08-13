import { apiClient } from './apiClient';

export interface MatchAnalytics {
  matchId: string;
  homeTeam: TeamAnalytics;
  awayTeam: TeamAnalytics;
  overall: OverallAnalytics;
  timeline: TimelineAnalytics;
  performance: PerformanceMetrics;
  insights: MatchInsights;
}

export interface TeamAnalytics {
  teamId: string;
  teamName: string;
  score: number;
  possession: number;
  shots: ShotAnalytics;
  passing: PassingAnalytics;
  defending: DefendingAnalytics;
  discipline: DisciplineAnalytics;
  players: PlayerAnalytics[];
  formation: string;
  tactics: TacticalAnalysis;
}

export interface ShotAnalytics {
  total: number;
  onTarget: number;
  offTarget: number;
  blocked: number;
  goals: number;
  accuracy: number;
  conversionRate: number;
  shotZones: ShotZone[];
}

export interface ShotZone {
  zone: 'left_wing' | 'center' | 'right_wing' | 'penalty_area' | 'outside_box';
  shots: number;
  goals: number;
  accuracy: number;
}

export interface PassingAnalytics {
  total: number;
  completed: number;
  accuracy: number;
  keyPasses: number;
  assists: number;
  passingZones: PassingZone[];
  passingNetworks: PassingNetwork[];
}

export interface PassingZone {
  zone: 'defensive_third' | 'middle_third' | 'attacking_third';
  passes: number;
  accuracy: number;
}

export interface PassingNetwork {
  fromPlayerId: string;
  toPlayerId: string;
  passes: number;
  accuracy: number;
}

export interface DefendingAnalytics {
  tackles: number;
  interceptions: number;
  clearances: number;
  blocks: number;
  fouls: number;
  offsides: number;
  saves: number;
  defensiveActions: DefensiveAction[];
}

export interface DefensiveAction {
  type: 'tackle' | 'interception' | 'clearance' | 'block' | 'save';
  count: number;
  successRate: number;
  location: 'own_half' | 'opponent_half' | 'penalty_area';
}

export interface DisciplineAnalytics {
  yellowCards: number;
  redCards: number;
  fouls: number;
  offsides: number;
  cardsByMinute: CardByMinute[];
}

export interface CardByMinute {
  minute: number;
  yellowCards: number;
  redCards: number;
}

export interface PlayerAnalytics {
  playerId: string;
  playerName: string;
  position: string;
  number: string;
  minutesPlayed: number;
  goals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  passes: number;
  passAccuracy: number;
  tackles: number;
  interceptions: number;
  fouls: number;
  yellowCards: number;
  redCards: number;
  distance: number;
  sprints: number;
  performance: PlayerPerformance;
}

export interface PlayerPerformance {
  rating: number;
  impact: 'high' | 'medium' | 'low';
  keyMoments: KeyMoment[];
  strengths: string[];
  weaknesses: string[];
}

export interface KeyMoment {
  minute: number;
  type: 'goal' | 'assist' | 'key_pass' | 'tackle' | 'save' | 'error';
  description: string;
  impact: number;
}

export interface OverallAnalytics {
  totalEvents: number;
  matchIntensity: number;
  goalEfficiency: number;
  entertainmentValue: number;
  competitiveBalance: number;
  momentum: MomentumAnalysis;
}

export interface MomentumAnalysis {
  homeMomentum: number;
  awayMomentum: number;
  momentumShifts: MomentumShift[];
  keyTurningPoints: TurningPoint[];
}

export interface MomentumShift {
  minute: number;
  fromTeam: 'home' | 'away';
  toTeam: 'home' | 'away';
  trigger: string;
  impact: number;
}

export interface TurningPoint {
  minute: number;
  event: string;
  impact: 'high' | 'medium' | 'low';
  description: string;
}

export interface TimelineAnalytics {
  events: TimelineEvent[];
  periods: PeriodAnalysis[];
  intensity: IntensityAnalysis;
}

export interface TimelineEvent {
  minute: number;
  second: number;
  type: string;
  team: 'home' | 'away';
  player: string;
  description: string;
  impact: number;
}

export interface PeriodAnalysis {
  period: 'first_half' | 'second_half' | 'extra_time';
  startMinute: number;
  endMinute: number;
  homeScore: number;
  awayScore: number;
  intensity: number;
  keyEvents: number;
}

export interface IntensityAnalysis {
  averageIntensity: number;
  peakIntensity: number;
  intensityByMinute: IntensityByMinute[];
  quietPeriods: QuietPeriod[];
}

export interface IntensityByMinute {
  minute: number;
  intensity: number;
  events: number;
}

export interface QuietPeriod {
  startMinute: number;
  endMinute: number;
  duration: number;
  events: number;
}

export interface PerformanceMetrics {
  technical: TechnicalMetrics;
  physical: PhysicalMetrics;
  tactical: TacticalMetrics;
  mental: MentalMetrics;
}

export interface TechnicalMetrics {
  ballControl: number;
  passing: number;
  shooting: number;
  tackling: number;
  setPieces: number;
}

export interface PhysicalMetrics {
  speed: number;
  stamina: number;
  strength: number;
  agility: number;
  recovery: number;
}

export interface TacticalMetrics {
  positioning: number;
  awareness: number;
  decisionMaking: number;
  teamwork: number;
  adaptability: number;
}

export interface MentalMetrics {
  concentration: number;
  composure: number;
  leadership: number;
  pressure: number;
  motivation: number;
}

export interface MatchInsights {
  keyFactors: KeyFactor[];
  recommendations: Recommendation[];
  trends: Trend[];
  predictions: Prediction[];
}

export interface KeyFactor {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
  evidence: string[];
}

export interface Recommendation {
  type: 'immediate' | 'short_term' | 'long_term';
  target: 'home_team' | 'away_team' | 'both';
  action: string;
  rationale: string;
  expectedOutcome: string;
}

export interface Trend {
  pattern: string;
  direction: 'increasing' | 'decreasing' | 'stable';
  significance: 'high' | 'medium' | 'low';
  description: string;
}

export interface Prediction {
  type: 'score' | 'performance' | 'outcome';
  prediction: string;
  confidence: number;
  factors: string[];
}

export class MatchAnalyticsService {
  private static instance: MatchAnalyticsService;

  private constructor() {}

  public static getInstance(): MatchAnalyticsService {
    if (!MatchAnalyticsService.instance) {
      MatchAnalyticsService.instance = new MatchAnalyticsService();
    }
    return MatchAnalyticsService.instance;
  }

  /**
   * Get comprehensive analytics for a specific match
   */
  async getMatchAnalytics(matchId: string): Promise<MatchAnalytics> {
    try {
      const response = await apiClient.get(`/matches/${matchId}/analytics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching match analytics:', error);
      throw new Error('Failed to fetch match analytics');
    }
  }

  /**
   * Get real-time analytics updates for a live match
   */
  async getLiveMatchAnalytics(matchId: string): Promise<Partial<MatchAnalytics>> {
    try {
      const response = await apiClient.get(`/matches/${matchId}/analytics/live`);
      return response.data;
    } catch (error) {
      console.error('Error fetching live match analytics:', error);
      throw new Error('Failed to fetch live match analytics');
    }
  }

  /**
   * Get player performance analytics for a specific match
   */
  async getPlayerMatchAnalytics(matchId: string, playerId: string): Promise<PlayerAnalytics> {
    try {
      const response = await apiClient.get(`/matches/${matchId}/players/${playerId}/analytics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching player match analytics:', error);
      throw new Error('Failed to fetch player match analytics');
    }
  }

  /**
   * Get team performance comparison for a match
   */
  async getTeamComparison(matchId: string): Promise<{
    homeTeam: TeamAnalytics;
    awayTeam: TeamAnalytics;
    comparison: any;
  }> {
    try {
      const response = await apiClient.get(`/matches/${matchId}/comparison`);
      return response.data;
    } catch (error) {
      console.error('Error fetching team comparison:', error);
      throw new Error('Failed to fetch team comparison');
    }
  }

  /**
   * Get match timeline with detailed event analysis
   */
  async getMatchTimeline(matchId: string): Promise<TimelineAnalytics> {
    try {
      const response = await apiClient.get(`/matches/${matchId}/timeline`);
      return response.data;
    } catch (error) {
      console.error('Error fetching match timeline:', error);
      throw new Error('Failed to fetch match timeline');
    }
  }

  /**
   * Get performance insights and recommendations
   */
  async getMatchInsights(matchId: string): Promise<MatchInsights> {
    try {
      const response = await apiClient.get(`/matches/${matchId}/insights`);
      return response.data;
    } catch (error) {
      console.error('Error fetching match insights:', error);
      throw new Error('Failed to fetch match insights');
    }
  }

  /**
   * Get historical performance data for trend analysis
   */
  async getHistoricalPerformance(
    teamId: string,
    period: 'last_5' | 'last_10' | 'last_month' | 'last_season'
  ): Promise<{
    matches: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    performance: PerformanceMetrics;
    trends: Trend[];
  }> {
    try {
      const response = await apiClient.get(`/teams/${teamId}/performance/historical`, {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching historical performance:', error);
      throw new Error('Failed to fetch historical performance');
    }
  }

  /**
   * Get head-to-head statistics between two teams
   */
  async getHeadToHead(team1Id: string, team2Id: string): Promise<{
    totalMatches: number;
    team1Wins: number;
    team2Wins: number;
    draws: number;
    team1Goals: number;
    team2Goals: number;
    recentForm: {
      team1: string[];
      team2: string[];
    };
    keyStats: any;
  }> {
    try {
      const response = await apiClient.get(`/teams/head-to-head`, {
        params: { team1: team1Id, team2: team2Id }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching head-to-head statistics:', error);
      throw new Error('Failed to fetch head-to-head statistics');
    }
  }

  /**
   * Generate custom analytics report
   */
  async generateCustomReport(matchId: string, options: {
    includePlayerStats: boolean;
    includeTacticalAnalysis: boolean;
    includePerformanceMetrics: boolean;
    includeInsights: boolean;
    format: 'json' | 'pdf' | 'csv';
  }): Promise<any> {
    try {
      const response = await apiClient.post(`/matches/${matchId}/analytics/report`, options);
      return response.data;
    } catch (error) {
      console.error('Error generating custom report:', error);
      throw new Error('Failed to generate custom report');
    }
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(matchId: string, format: 'json' | 'csv' | 'excel'): Promise<Blob> {
    try {
      const response = await apiClient.get(`/matches/${matchId}/analytics/export`, {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting analytics:', error);
      throw new Error('Failed to export analytics');
    }
  }

  /**
   * Subscribe to real-time analytics updates
   */
  subscribeToAnalytics(matchId: string, callback: (analytics: Partial<MatchAnalytics>) => void): () => void {
    // Implementation would depend on your real-time service (WebSocket, Server-Sent Events, etc.)
    // This is a placeholder for the subscription logic
    const interval = setInterval(async () => {
      try {
        const analytics = await this.getLiveMatchAnalytics(matchId);
        callback(analytics);
      } catch (error) {
        console.error('Error in analytics subscription:', error);
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }

  /**
   * Calculate match momentum based on events
   */
  calculateMomentum(events: any[]): { home: number; away: number } {
    if (events.length === 0) return { home: 50, away: 50 };

    const recentEvents = events.slice(-10); // Last 10 events
    let homeMomentum = 0;
    let awayMomentum = 0;

    const eventWeights = {
      goal: 3,
      shot: 2,
      corner: 1,
      foul: -0.5,
      yellow_card: -1,
      red_card: -2
    };

    recentEvents.forEach(event => {
      const weight = eventWeights[event.type] || 1;
      if (event.team === 'home') {
        homeMomentum += weight;
      } else {
        awayMomentum += weight;
      }
    });

    const total = homeMomentum + awayMomentum;
    return {
      home: total > 0 ? Math.round((homeMomentum / total) * 100) : 50,
      away: total > 0 ? Math.round((awayMomentum / total) * 100) : 50
    };
  }

  /**
   * Calculate player performance rating
   */
  calculatePlayerRating(playerStats: any): number {
    const weights = {
      goals: 3,
      assists: 2,
      shots: 0.5,
      passes: 0.1,
      passAccuracy: 0.2,
      tackles: 1,
      interceptions: 1,
      minutesPlayed: 0.01
    };

    let rating = 0;
    Object.entries(weights).forEach(([stat, weight]) => {
      if (playerStats[stat] !== undefined) {
        rating += playerStats[stat] * weight;
      }
    });

    // Normalize to 0-10 scale
    return Math.min(10, Math.max(0, rating / 10));
  }

  /**
   * Generate match insights based on analytics data
   */
  generateInsights(analytics: MatchAnalytics): MatchInsights {
    const insights: MatchInsights = {
      keyFactors: [],
      recommendations: [],
      trends: [],
      predictions: []
    };

    // Analyze key factors
    if (analytics.homeTeam.shots.accuracy > analytics.awayTeam.shots.accuracy) {
      insights.keyFactors.push({
        factor: 'Shot Accuracy',
        impact: 'positive',
        description: `${analytics.homeTeam.teamName} showed superior shot accuracy`,
        evidence: [`${analytics.homeTeam.teamName}: ${analytics.homeTeam.shots.accuracy}%`, `${analytics.awayTeam.teamName}: ${analytics.awayTeam.shots.accuracy}%`]
      });
    }

    // Generate recommendations
    if (analytics.awayTeam.possession < 40) {
      insights.recommendations.push({
        type: 'immediate',
        target: 'away_team',
        action: 'Improve ball retention and possession play',
        rationale: 'Low possession percentage indicates difficulty maintaining control',
        expectedOutcome: 'Increased attacking opportunities and reduced defensive pressure'
      });
    }

    // Identify trends
    const intensityTrend = this.analyzeIntensityTrend(analytics.timeline.intensity.intensityByMinute);
    insights.trends.push(intensityTrend);

    // Make predictions
    insights.predictions.push({
      type: 'performance',
      prediction: `${analytics.homeTeam.teamName} likely to maintain dominance in possession`,
      confidence: 0.75,
      factors: ['Superior passing accuracy', 'Better ball retention', 'Higher possession percentage']
    });

    return insights;
  }

  private analyzeIntensityTrend(intensityData: IntensityByMinute[]): Trend {
    // Simple trend analysis - could be enhanced with more sophisticated algorithms
    const firstHalf = intensityData.filter(d => d.minute <= 45);
    const secondHalf = intensityData.filter(d => d.minute > 45);

    const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.intensity, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.intensity, 0) / secondHalf.length;

    let direction: 'increasing' | 'decreasing' | 'stable';
    let significance: 'high' | 'medium' | 'low';

    if (Math.abs(secondHalfAvg - firstHalfAvg) > 20) {
      significance = 'high';
    } else if (Math.abs(secondHalfAvg - firstHalfAvg) > 10) {
      significance = 'medium';
    } else {
      significance = 'low';
    }

    if (secondHalfAvg > firstHalfAvg + 5) {
      direction = 'increasing';
    } else if (secondHalfAvg < firstHalfAvg - 5) {
      direction = 'decreasing';
    } else {
      direction = 'stable';
    }

    return {
      pattern: 'Match intensity trend',
      direction,
      significance,
      description: `Match intensity ${direction} from first half (${firstHalfAvg.toFixed(1)}) to second half (${secondHalfAvg.toFixed(1)})`
    };
  }
}

export default MatchAnalyticsService.getInstance();
