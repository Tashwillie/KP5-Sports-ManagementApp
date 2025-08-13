import { PrismaClient, Match, MatchEvent, MatchParticipant, Team, User, Tournament, TournamentMatch, PlayerMatchStats, TeamMatchStats } from '@prisma/client';
import { EventEmitter } from 'events';

export interface MatchHistoryFilters {
  startDate?: Date;
  endDate?: Date;
  teamId?: string;
  playerId?: string;
  tournamentId?: string;
  matchStatus?: string[];
  eventTypes?: string[];
  location?: string;
  limit?: number;
  offset?: number;
}

export interface MatchSummary {
  id: string;
  title: string;
  startTime: Date;
  endTime?: Date;
  status: string;
  homeTeam?: {
    id: string;
    name: string;
    logo?: string;
    score?: number;
  };
  awayTeam?: {
    id: string;
    name: string;
    logo?: string;
    score?: number;
  };
  location?: string;
  totalEvents: number;
  totalParticipants: number;
  duration?: number; // in minutes
  tournament?: {
    id: string;
    name: string;
    round?: number;
  };
}

export interface MatchDetail extends MatchSummary {
  events: Array<{
    id: string;
    type: string;
    minute?: number;
    description?: string;
    player?: {
      id: string;
      name: string;
      teamId: string;
    };
    team?: {
      id: string;
      name: string;
    };
    data?: any;
    timestamp: Date;
  }>;
  participants: Array<{
    id: string;
    userId: string;
    userName: string;
    role: string;
    status: string;
    teamId?: string;
    teamName?: string;
  }>;
  statistics?: {
    homeTeam: any;
    awayTeam: any;
    players: any[];
  };
  notes?: string;
}

export interface MatchReport {
  summary: {
    totalMatches: number;
    completedMatches: number;
    cancelledMatches: number;
    postponedMatches: number;
    totalGoals: number;
    averageGoalsPerMatch: number;
    totalParticipants: number;
    averageParticipantsPerMatch: number;
    totalDuration: number; // in minutes
    averageMatchDuration: number;
  };
  teamPerformance: Array<{
    teamId: string;
    teamName: string;
    matchesPlayed: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    winPercentage: number;
  }>;
  playerPerformance: Array<{
    playerId: string;
    playerName: string;
    teamName: string;
    matchesPlayed: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    averageRating: number;
  }>;
  eventAnalysis: {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsByMinute: Array<{
      minute: number;
      count: number;
      percentage: number;
    }>;
    mostActivePlayers: Array<{
      playerId: string;
      playerName: string;
      eventCount: number;
    }>;
  };
  trends: {
    matchesByMonth: Array<{
      month: string;
      count: number;
      averageGoals: number;
    }>;
    performanceByPeriod: Array<{
      period: string;
      averageGoals: number;
      averageDuration: number;
      winPercentage: number;
    }>;
  };
}

export interface HistoricalTrends {
  period: 'week' | 'month' | 'quarter' | 'year';
  data: Array<{
    period: string;
    matchesPlayed: number;
    totalGoals: number;
    averageGoals: number;
    totalParticipants: number;
    averageDuration: number;
    winPercentage: number;
  }>;
}

export interface MatchComparison {
  match1: MatchDetail;
  match2: MatchDetail;
  similarities: {
    totalGoals: number;
    duration: number;
    eventTypes: string[];
    participantCount: number;
  };
  differences: {
    goals: number;
    duration: number;
    eventTypes: string[];
    participantCount: number;
  };
  analysis: {
    style: 'similar' | 'different' | 'mixed';
    keyFactors: string[];
    recommendations: string[];
  };
}

export class MatchHistoryService extends EventEmitter {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    super();
    this.prisma = prisma;
  }

  /**
   * Get match history with filters
   */
  async getMatchHistory(filters: MatchHistoryFilters): Promise<MatchSummary[]> {
    try {
      const where: any = {
        isActive: true,
      };

      if (filters.startDate || filters.endDate) {
        where.startTime = {};
        if (filters.startDate) where.startTime.gte = filters.startDate;
        if (filters.endDate) where.startTime.lte = filters.endDate;
      }

      if (filters.teamId) {
        where.OR = [
          { homeTeamId: filters.teamId },
          { awayTeamId: filters.teamId },
        ];
      }

      if (filters.matchStatus && filters.matchStatus.length > 0) {
        where.status = { in: filters.matchStatus };
      }

      if (filters.location) {
        where.location = { contains: filters.location, mode: 'insensitive' };
      }

      const matches = await this.prisma.match.findMany({
        where,
        include: {
          homeTeam: { select: { id: true, name: true, logo: true } },
          awayTeam: { select: { id: true, name: true, logo: true } },
          events: { select: { id: true } },
          participants: { select: { id: true } },
          tournamentMatches: {
            include: {
              tournament: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { startTime: 'desc' },
        take: filters.limit || 50,
        skip: filters.offset || 0,
      });

      return matches.map(match => this.mapToMatchSummary(match));
    } catch (error) {
      console.error('Error fetching match history:', error);
      throw new Error('Failed to fetch match history');
    }
  }

  /**
   * Get detailed match information
   */
  async getMatchDetail(matchId: string): Promise<MatchDetail | null> {
    try {
      const match = await this.prisma.match.findUnique({
        where: { id: matchId },
        include: {
          homeTeam: { select: { id: true, name: true, logo: true } },
          awayTeam: { select: { id: true, name: true, logo: true } },
          events: {
            include: {
              player: { select: { id: true, displayName: true } },
              team: { select: { id: true, name: true } },
            },
            orderBy: { minute: 'asc' },
          },
          participants: {
            include: {
              user: { select: { id: true, displayName: true } },
              team: { select: { id: true, name: true } },
            },
          },
          tournamentMatches: {
            include: {
              tournament: { select: { id: true, name: true } },
            },
          },
          matchStatistics: true,
        },
      });

      if (!match) return null;

      return this.mapToMatchDetail(match);
    } catch (error) {
      console.error('Error fetching match detail:', error);
      throw new Error('Failed to fetch match detail');
    }
  }

  /**
   * Generate comprehensive match report
   */
  async generateMatchReport(filters: MatchHistoryFilters): Promise<MatchReport> {
    try {
      const where: any = {
        isActive: true,
      };

      if (filters.startDate || filters.endDate) {
        where.startTime = {};
        if (filters.startDate) where.startTime.gte = filters.startDate;
        if (filters.endDate) where.startTime.lte = filters.endDate;
      }

      if (filters.teamId) {
        where.OR = [
          { homeTeamId: filters.teamId },
          { awayTeamId: filters.teamId },
        ];
      }

      if (filters.tournamentId) {
        where.tournamentMatches = {
          some: { tournamentId: filters.tournamentId },
        };
      }

      // Get matches with related data
      const matches = await this.prisma.match.findMany({
        where,
        include: {
          homeTeam: { select: { id: true, name: true } },
          awayTeam: { select: { id: true, name: true } },
          events: true,
          participants: true,
          matchStatistics: true,
        },
        orderBy: { startTime: 'desc' },
      });

      if (matches.length === 0) {
        return this.getEmptyReport();
      }

      const report = await this.buildMatchReport(matches);
      this.emit('reportGenerated', { filters, report });
      return report;
    } catch (error) {
      console.error('Error generating match report:', error);
      throw new Error('Failed to generate match report');
    }
  }

  /**
   * Get historical trends
   */
  async getHistoricalTrends(
    period: 'week' | 'month' | 'quarter' | 'year',
    filters: Omit<MatchHistoryFilters, 'limit' | 'offset'>
  ): Promise<HistoricalTrends> {
    try {
      const where: any = {
        isActive: true,
        status: 'COMPLETED',
      };

      if (filters.startDate || filters.endDate) {
        where.startTime = {};
        if (filters.startDate) where.startTime.gte = filters.startDate;
        if (filters.endDate) where.startTime.lte = filters.endDate;
      }

      if (filters.teamId) {
        where.OR = [
          { homeTeamId: filters.teamId },
          { awayTeamId: filters.teamId },
        ];
      }

      const matches = await this.prisma.match.findMany({
        where,
        include: {
          homeTeam: { select: { id: true, name: true } },
          awayTeam: { select: { id: true, name: true } },
          events: true,
          participants: true,
        },
        orderBy: { startTime: 'asc' },
      });

      const trends = this.calculateHistoricalTrends(matches, period);
      this.emit('trendsCalculated', { period, filters, trends });
      return trends;
    } catch (error) {
      console.error('Error calculating historical trends:', error);
      throw new Error('Failed to calculate historical trends');
    }
  }

  /**
   * Compare two matches
   */
  async compareMatches(matchId1: string, matchId2: string): Promise<MatchComparison> {
    try {
      const [match1, match2] = await Promise.all([
        this.getMatchDetail(matchId1),
        this.getMatchDetail(matchId2),
      ]);

      if (!match1 || !match2) {
        throw new Error('One or both matches not found');
      }

      const comparison = this.analyzeMatchComparison(match1, match2);
      this.emit('matchesCompared', { matchId1, matchId2, comparison });
      return comparison;
    } catch (error) {
      console.error('Error comparing matches:', error);
      throw new Error('Failed to compare matches');
    }
  }

  /**
   * Search matches by various criteria
   */
  async searchMatches(query: string, filters: MatchHistoryFilters): Promise<MatchSummary[]> {
    try {
      const where: any = {
        isActive: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { location: { contains: query, mode: 'insensitive' } },
        ],
      };

      if (filters.startDate || filters.endDate) {
        where.startTime = {};
        if (filters.startDate) where.startTime.gte = filters.startDate;
        if (filters.endDate) where.startTime.lte = filters.endDate;
      }

      if (filters.teamId) {
        where.OR.push(
          { homeTeamId: filters.teamId },
          { awayTeamId: filters.teamId }
        );
      }

      const matches = await this.prisma.match.findMany({
        where,
        include: {
          homeTeam: { select: { id: true, name: true, logo: true } },
          awayTeam: { select: { id: true, name: true, logo: true } },
          events: { select: { id: true } },
          participants: { select: { id: true } },
          tournamentMatches: {
            include: {
              tournament: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { startTime: 'desc' },
        take: filters.limit || 50,
        skip: filters.offset || 0,
      });

      return matches.map(match => this.mapToMatchSummary(match));
    } catch (error) {
      console.error('Error searching matches:', error);
      throw new Error('Failed to search matches');
    }
  }

  /**
   * Export match data
   */
  async exportMatchData(
    filters: MatchHistoryFilters,
    format: 'csv' | 'json' | 'pdf'
  ): Promise<string | Buffer> {
    try {
      const matches = await this.getMatchHistory(filters);
      
      switch (format) {
        case 'csv':
          return this.convertToCSV(matches);
        case 'json':
          return JSON.stringify(matches, null, 2);
        case 'pdf':
          return this.convertToPDF(matches);
        default:
          throw new Error('Unsupported export format');
      }
    } catch (error) {
      console.error('Error exporting match data:', error);
      throw new Error('Failed to export match data');
    }
  }

  // Private helper methods

  private mapToMatchSummary(match: any): MatchSummary {
    const duration = match.endTime && match.startTime
      ? Math.round((new Date(match.endTime).getTime() - new Date(match.startTime).getTime()) / (1000 * 60))
      : undefined;

    return {
      id: match.id,
      title: match.title,
      startTime: match.startTime,
      endTime: match.endTime,
      status: match.status,
      homeTeam: match.homeTeam ? {
        id: match.homeTeam.id,
        name: match.homeTeam.name,
        logo: match.homeTeam.logo,
        score: match.homeScore,
      } : undefined,
      awayTeam: match.awayTeam ? {
        id: match.awayTeam.id,
        name: match.awayTeam.name,
        logo: match.awayTeam.logo,
        score: match.awayScore,
      } : undefined,
      location: match.location,
      totalEvents: match.events.length,
      totalParticipants: match.participants.length,
      duration,
      tournament: match.tournamentMatches[0] ? {
        id: match.tournamentMatches[0].tournament.id,
        name: match.tournamentMatches[0].tournament.name,
        round: match.tournamentMatches[0].round,
      } : undefined,
    };
  }

  private mapToMatchDetail(match: any): MatchDetail {
    const summary = this.mapToMatchSummary(match);
    
    return {
      ...summary,
      events: match.events.map((event: any) => ({
        id: event.id,
        type: event.type,
        minute: event.minute,
        description: event.description,
        player: event.player ? {
          id: event.player.id,
          name: event.player.displayName || 'Unknown Player',
          teamId: event.teamId,
        } : undefined,
        team: event.team ? {
          id: event.team.id,
          name: event.team.name,
        } : undefined,
        data: event.data,
        timestamp: event.createdAt,
      })),
      participants: match.participants.map((participant: any) => ({
        id: participant.id,
        userId: participant.userId,
        userName: participant.user.displayName || 'Unknown User',
        role: participant.role,
        status: participant.status,
        teamId: participant.teamId,
        teamName: participant.team?.name,
      })),
      statistics: match.matchStatistics ? {
        homeTeam: match.matchStatistics.homeTeamStats || {},
        awayTeam: match.matchStatistics.awayTeamStats || {},
        players: match.matchStatistics.playerStats || [],
      } : undefined,
    };
  }

  private async buildMatchReport(matches: any[]): Promise<MatchReport> {
    const summary = this.calculateReportSummary(matches);
    const teamPerformance = await this.calculateTeamPerformance(matches);
    const playerPerformance = await this.calculatePlayerPerformance(matches);
    const eventAnalysis = this.analyzeEvents(matches);
    const trends = this.calculateTrends(matches);

    return {
      summary,
      teamPerformance,
      playerPerformance,
      eventAnalysis,
      trends,
    };
  }

  private calculateReportSummary(matches: any[]): MatchReport['summary'] {
    const totalMatches = matches.length;
    const completedMatches = matches.filter(m => m.status === 'COMPLETED').length;
    const cancelledMatches = matches.filter(m => m.status === 'CANCELLED').length;
    const postponedMatches = matches.filter(m => m.status === 'POSTPONED').length;
    
    const totalGoals = matches.reduce((sum, m) => sum + (m.homeScore || 0) + (m.awayScore || 0), 0);
    const averageGoalsPerMatch = totalMatches > 0 ? totalGoals / totalMatches : 0;
    
    const totalParticipants = matches.reduce((sum, m) => sum + m.participants.length, 0);
    const averageParticipantsPerMatch = totalMatches > 0 ? totalParticipants / totalMatches : 0;
    
    const totalDuration = matches.reduce((sum, m) => {
      if (m.startTime && m.endTime) {
        return sum + Math.round((new Date(m.endTime).getTime() - new Date(m.startTime).getTime()) / (1000 * 60));
      }
      return sum;
    }, 0);
    const averageMatchDuration = totalMatches > 0 ? totalDuration / totalMatches : 0;

    return {
      totalMatches,
      completedMatches,
      cancelledMatches,
      postponedMatches,
      totalGoals,
      averageGoalsPerMatch: Math.round(averageGoalsPerMatch * 100) / 100,
      totalParticipants,
      averageParticipantsPerMatch: Math.round(averageParticipantsPerMatch * 100) / 100,
      totalDuration,
      averageMatchDuration: Math.round(averageMatchDuration * 100) / 100,
    };
  }

  private async calculateTeamPerformance(matches: any[]): Promise<MatchReport['teamPerformance']> {
    const teamStats = new Map<string, any>();

    for (const match of matches) {
      if (match.status !== 'COMPLETED' || !match.homeTeam || !match.awayTeam) continue;

      const homeTeamId = match.homeTeam.id;
      const awayTeamId = match.awayTeam.id;
      const homeScore = match.homeScore || 0;
      const awayScore = match.awayScore || 0;

      // Initialize team stats if not exists
      if (!teamStats.has(homeTeamId)) {
        teamStats.set(homeTeamId, {
          teamId: homeTeamId,
          teamName: match.homeTeam.name,
          matchesPlayed: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
        });
      }

      if (!teamStats.has(awayTeamId)) {
        teamStats.set(awayTeamId, {
          teamId: awayTeamId,
          teamName: match.awayTeam.name,
          matchesPlayed: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
        });
      }

      const homeStats = teamStats.get(homeTeamId);
      const awayStats = teamStats.get(awayTeamId);

      // Update stats
      homeStats.matchesPlayed++;
      awayStats.matchesPlayed++;
      homeStats.goalsFor += homeScore;
      homeStats.goalsAgainst += awayScore;
      awayStats.goalsFor += awayScore;
      awayStats.goalsAgainst += homeScore;

      if (homeScore > awayScore) {
        homeStats.wins++;
        awayStats.losses++;
      } else if (homeScore < awayScore) {
        awayStats.wins++;
        homeStats.losses++;
      } else {
        homeStats.draws++;
        awayStats.draws++;
      }
    }

    return Array.from(teamStats.values()).map(stats => ({
      ...stats,
      winPercentage: stats.matchesPlayed > 0 
        ? Math.round((stats.wins / stats.matchesPlayed) * 10000) / 100
        : 0,
    }));
  }

  private async calculatePlayerPerformance(matches: any[]): Promise<MatchReport['playerPerformance']> {
    const playerStats = new Map<string, any>();

    for (const match of matches) {
      if (match.status !== 'COMPLETED') continue;

      for (const participant of match.participants) {
        if (participant.role !== 'PLAYER') continue;

        const playerId = participant.userId;
        if (!playerStats.has(playerId)) {
          playerStats.set(playerId, {
            playerId,
            playerName: participant.user.displayName || 'Unknown Player',
            teamName: participant.team?.name || 'Unknown Team',
            matchesPlayed: 0,
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
            totalRating: 0,
          });
        }

        const stats = playerStats.get(playerId);
        stats.matchesPlayed++;

        // Count events for this player
        const playerEvents = match.events.filter((e: any) => e.playerId === playerId);
        for (const event of playerEvents) {
          switch (event.type) {
            case 'goal':
              stats.goals++;
              break;
            case 'assist':
              stats.assists++;
              break;
            case 'yellow_card':
              stats.yellowCards++;
              break;
            case 'red_card':
              stats.redCards++;
              break;
          }
        }
      }
    }

    return Array.from(playerStats.values()).map(stats => ({
      ...stats,
      averageRating: stats.matchesPlayed > 0 
        ? Math.round((stats.totalRating / stats.matchesPlayed) * 100) / 100
        : 0,
    }));
  }

  private analyzeEvents(matches: any[]): MatchReport['eventAnalysis'] {
    const eventsByType = new Map<string, number>();
    const eventsByMinute = new Map<number, number>();
    const playerEventCounts = new Map<string, number>();

    let totalEvents = 0;

    for (const match of matches) {
      for (const event of match.events) {
        totalEvents++;
        
        // Count by type
        eventsByType.set(event.type, (eventsByType.get(event.type) || 0) + 1);
        
        // Count by minute
        if (event.minute !== null) {
          eventsByMinute.set(event.minute, (eventsByMinute.get(event.minute) || 0) + 1);
        }
        
        // Count by player
        if (event.playerId) {
          playerEventCounts.set(event.playerId, (playerEventCounts.get(event.playerId) || 0) + 1);
        }
      }
    }

    // Convert to arrays and sort
    const eventsByTypeArray = Array.from(eventsByType.entries()).map(([type, count]) => ({
      type,
      count,
    }));

    const eventsByMinuteArray = Array.from(eventsByMinute.entries())
      .map(([minute, count]) => ({
        minute,
        count,
        percentage: totalEvents > 0 ? Math.round((count / totalEvents) * 10000) / 100 : 0,
      }))
      .sort((a, b) => a.minute - b.minute);

    const mostActivePlayers = Array.from(playerEventCounts.entries())
      .map(([playerId, count]) => ({
        playerId,
        playerName: this.getPlayerName(playerId, matches),
        eventCount: count,
      }))
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, 10);

    return {
      totalEvents,
      eventsByType: Object.fromEntries(eventsByType),
      eventsByMinute: eventsByMinuteArray,
      mostActivePlayers,
    };
  }

  private calculateTrends(matches: any[]): MatchReport['trends'] {
    const monthlyStats = new Map<string, any>();
    const periodStats = new Map<string, any>();

    for (const match of matches) {
      if (match.status !== 'COMPLETED') continue;

      const date = new Date(match.startTime);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const periodKey = this.getPeriodKey(date);

      // Monthly stats
      if (!monthlyStats.has(monthKey)) {
        monthlyStats.set(monthKey, {
          month: monthKey,
          count: 0,
          totalGoals: 0,
        });
      }
      const monthStats = monthlyStats.get(monthKey);
      monthStats.count++;
      monthStats.totalGoals += (match.homeScore || 0) + (match.awayScore || 0);

      // Period stats
      if (!periodStats.has(periodKey)) {
        periodStats.set(periodKey, {
          period: periodKey,
          totalGoals: 0,
          totalDuration: 0,
          wins: 0,
          totalMatches: 0,
        });
      }
      const periodStat = periodStats.get(periodKey);
      periodStat.totalGoals += (match.homeScore || 0) + (match.awayScore || 0);
      periodStat.totalMatches++;
      if (match.homeScore !== match.awayScore) periodStat.wins++;
      
      if (match.startTime && match.endTime) {
        periodStat.totalDuration += Math.round(
          (new Date(match.endTime).getTime() - new Date(match.startTime).getTime()) / (1000 * 60)
        );
      }
    }

    const matchesByMonth = Array.from(monthlyStats.values()).map(stats => ({
      month: stats.month,
      count: stats.count,
      averageGoals: stats.count > 0 ? Math.round((stats.totalGoals / stats.count) * 100) / 100 : 0,
    }));

    const performanceByPeriod = Array.from(periodStats.values()).map(stats => ({
      period: stats.period,
      averageGoals: stats.totalMatches > 0 ? Math.round((stats.totalGoals / stats.totalMatches) * 100) / 100 : 0,
      averageDuration: stats.totalMatches > 0 ? Math.round((stats.totalDuration / stats.totalMatches) * 100) / 100 : 0,
      winPercentage: stats.totalMatches > 0 ? Math.round((stats.wins / stats.totalMatches) * 10000) / 100 : 0,
    }));

    return {
      matchesByMonth,
      performanceByPeriod,
    };
  }

  private calculateHistoricalTrends(matches: any[], period: string): HistoricalTrends {
    const periodStats = new Map<string, any>();

    for (const match of matches) {
      if (match.status !== 'COMPLETED') continue;

      const date = new Date(match.startTime);
      const periodKey = this.getPeriodKey(date, period);

      if (!periodStats.has(periodKey)) {
        periodStats.set(periodKey, {
          period: periodKey,
          matchesPlayed: 0,
          totalGoals: 0,
          totalParticipants: 0,
          totalDuration: 0,
          wins: 0,
          totalMatches: 0,
        });
      }

      const stats = periodStats.get(periodKey);
      stats.matchesPlayed++;
      stats.totalGoals += (match.homeScore || 0) + (match.awayScore || 0);
      stats.totalParticipants += match.participants.length;
      
      if (match.startTime && match.endTime) {
        stats.totalDuration += Math.round(
          (new Date(match.endTime).getTime() - new Date(match.startTime).getTime()) / (1000 * 60)
        );
      }

      if (match.homeScore !== match.awayScore) {
        stats.wins++;
      }
      stats.totalMatches++;
    }

    const data = Array.from(periodStats.values()).map(stats => ({
      period: stats.period,
      matchesPlayed: stats.matchesPlayed,
      totalGoals: stats.totalGoals,
      averageGoals: stats.matchesPlayed > 0 ? Math.round((stats.totalGoals / stats.matchesPlayed) * 100) / 100 : 0,
      totalParticipants: stats.totalParticipants,
      averageDuration: stats.matchesPlayed > 0 ? Math.round((stats.totalDuration / stats.matchesPlayed) * 100) / 100 : 0,
      winPercentage: stats.totalMatches > 0 ? Math.round((stats.wins / stats.totalMatches) * 10000) / 100 : 0,
    }));

    return { period, data };
  }

  private analyzeMatchComparison(match1: MatchDetail, match2: MatchDetail): MatchComparison {
    const similarities = {
      totalGoals: Math.abs((match1.homeTeam?.score || 0) + (match1.awayTeam?.score || 0) - 
                          (match2.homeTeam?.score || 0) - (match2.awayTeam?.score || 0)),
      duration: Math.abs((match1.duration || 0) - (match2.duration || 0)),
      eventTypes: this.getCommonEventTypes(match1.events, match2.events),
      participantCount: Math.abs((match1.totalParticipants || 0) - (match2.totalParticipants || 0)),
    };

    const differences = {
      goals: Math.abs((match1.homeTeam?.score || 0) + (match1.awayTeam?.score || 0) - 
                     (match2.homeTeam?.score || 0) - (match2.awayTeam?.score || 0)),
      duration: Math.abs((match1.duration || 0) - (match2.duration || 0)),
      eventTypes: this.getDifferentEventTypes(match1.events, match2.events),
      participantCount: Math.abs((match1.totalParticipants || 0) - (match2.totalParticipants || 0)),
    };

    const analysis = this.generateComparisonAnalysis(similarities, differences);

    return {
      match1,
      match2,
      similarities,
      differences,
      analysis,
    };
  }

  private getPeriodKey(date: Date, period: string = 'month'): string {
    switch (period) {
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        return `${weekStart.getFullYear()}-W${String(Math.ceil((date.getDate() + date.getDay()) / 7)).padStart(2, '0')}`;
      case 'month':
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      case 'quarter':
        const quarter = Math.ceil((date.getMonth() + 1) / 3);
        return `${date.getFullYear()}-Q${quarter}`;
      case 'year':
        return `${date.getFullYear()}`;
      default:
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
  }

  private getPlayerName(playerId: string, matches: any[]): string {
    for (const match of matches) {
      for (const participant of match.participants) {
        if (participant.userId === playerId) {
          return participant.user.displayName || 'Unknown Player';
        }
      }
    }
    return 'Unknown Player';
  }

  private getCommonEventTypes(events1: any[], events2: any[]): string[] {
    const types1 = new Set(events1.map(e => e.type));
    const types2 = new Set(events2.map(e => e.type));
    return Array.from(types1).filter(type => types2.has(type));
  }

  private getDifferentEventTypes(events1: any[], events2: any[]): string[] {
    const types1 = new Set(events1.map(e => e.type));
    const types2 = new Set(events2.map(e => e.type));
    return Array.from(new Set([...types1, ...types2])).filter(type => 
      types1.has(type) !== types2.has(type)
    );
  }

  private generateComparisonAnalysis(similarities: any, differences: any): any {
    const totalSimilarity = similarities.totalGoals + similarities.duration + similarities.participantCount;
    const totalDifference = differences.totalGoals + differences.duration + differences.participantCount;
    
    let style: 'similar' | 'different' | 'mixed';
    if (totalSimilarity < totalDifference * 0.3) {
      style = 'similar';
    } else if (totalDifference < totalSimilarity * 0.3) {
      style = 'different';
    } else {
      style = 'mixed';
    }

    const keyFactors = [];
    if (differences.goals > 5) keyFactors.push('Goal scoring patterns');
    if (differences.duration > 30) keyFactors.push('Match duration');
    if (differences.participantCount > 10) keyFactors.push('Team composition');

    const recommendations = [];
    if (style === 'similar') {
      recommendations.push('Consider varying match strategies');
      recommendations.push('Analyze common patterns for improvement');
    } else if (style === 'different') {
      recommendations.push('Identify factors causing variations');
      recommendations.push('Standardize successful approaches');
    } else {
      recommendations.push('Balance consistency with adaptability');
      recommendations.push('Focus on key performance indicators');
    }

    return { style, keyFactors, recommendations };
  }

  private getEmptyReport(): MatchReport {
    return {
      summary: {
        totalMatches: 0,
        completedMatches: 0,
        cancelledMatches: 0,
        postponedMatches: 0,
        totalGoals: 0,
        averageGoalsPerMatch: 0,
        totalParticipants: 0,
        averageParticipantsPerMatch: 0,
        totalDuration: 0,
        averageMatchDuration: 0,
      },
      teamPerformance: [],
      playerPerformance: [],
      eventAnalysis: {
        totalEvents: 0,
        eventsByType: {},
        eventsByMinute: [],
        mostActivePlayers: [],
      },
      trends: {
        matchesByMonth: [],
        performanceByPeriod: [],
      },
    };
  }

  private convertToCSV(matches: MatchSummary[]): string {
    const headers = ['ID', 'Title', 'Start Time', 'End Time', 'Status', 'Home Team', 'Home Score', 'Away Team', 'Away Score', 'Location', 'Total Events', 'Total Participants', 'Duration (min)', 'Tournament'];
    
    const rows = matches.map(match => [
      match.id,
      match.title,
      match.startTime.toISOString(),
      match.endTime?.toISOString() || '',
      match.status,
      match.homeTeam?.name || '',
      match.homeTeam?.score || '',
      match.awayTeam?.name || '',
      match.awayTeam?.score || '',
      match.location || '',
      match.totalEvents,
      match.totalParticipants,
      match.duration || '',
      match.tournament?.name || '',
    ]);

    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }

  private convertToPDF(matches: MatchSummary[]): Buffer {
    // This is a placeholder - in a real implementation, you would use a PDF library
    // like pdfkit or puppeteer to generate actual PDF content
    const content = `Match History Report\nGenerated on ${new Date().toISOString()}\n\n${matches.length} matches found`;
    return Buffer.from(content, 'utf-8');
  }
}

export default MatchHistoryService;
