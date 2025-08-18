import { logger } from '../utils/logger';
import prisma from '../config/database';
import redisService from './redisService';

// Use any types temporarily to get the backend running
export interface PlayerMatchStats {
  [key: string]: any;
}

export interface PlayerSeasonStats {
  [key: string]: any;
}

export interface TeamMatchStats {
  [key: string]: any;
}

export interface TeamSeasonStats {
  [key: string]: any;
}

export interface MatchStatistics {
  [key: string]: any;
}

export interface StatisticsUpdate {
  type: 'player' | 'team' | 'match' | 'tournament';
  entityId: string;
  matchId?: string;
  season?: string;
  data: any;
  timestamp: Date;
}

export class StatisticsService {
  private static instance: StatisticsService;
  private updateCallbacks: Map<string, ((update: StatisticsUpdate) => void)[]> = new Map();
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): StatisticsService {
    if (!StatisticsService.instance) {
      StatisticsService.instance = new StatisticsService();
    }
    return StatisticsService.instance;
  }

  // Subscribe to statistics updates
  public subscribe(entityType: string, entityId: string, callback: (update: StatisticsUpdate) => void): () => void {
    const key = `${entityType}:${entityId}`;
    if (!this.updateCallbacks.has(key)) {
      this.updateCallbacks.set(key, []);
    }
    
    this.updateCallbacks.get(key)!.push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.updateCallbacks.get(key);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  // Notify subscribers of statistics updates
  private notifySubscribers(update: StatisticsUpdate): void {
    const key = `${update.type}:${update.entityId}`;
    const callbacks = this.updateCallbacks.get(key);
    
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(update);
        } catch (error) {
          logger.error(`Error in statistics update callback:`, error);
        }
      });
    }

    // Also notify match-specific subscribers
    if (update.matchId) {
      const matchKey = `match:${update.matchId}`;
      const matchCallbacks = this.updateCallbacks.get(matchKey);
      
      if (matchCallbacks) {
        matchCallbacks.forEach(callback => {
          try {
            callback(update);
          } catch (error) {
            logger.error(`Error in match statistics update callback:`, error);
          }
        });
      }
    }
  }

  // Update player statistics for a match event
  public async updatePlayerStats(
    playerId: string, 
    matchId: string, 
    eventType: string, 
    eventData: any
  ): Promise<void> {
    try {
      const updateData: Partial<PlayerMatchStats> = {};
      
      switch (eventType) {
        case 'GOAL':
          updateData.goals = { increment: 1 };
          break;
        case 'ASSIST':
          updateData.assists = { increment: 1 };
          break;
        case 'YELLOW_CARD':
          updateData.yellowCards = { increment: 1 };
          break;
        case 'RED_CARD':
          updateData.redCards = { increment: 1 };
          break;
        case 'SHOT':
          updateData.shots = { increment: 1 };
          if (eventData.onTarget) {
            updateData.shotsOnTarget = { increment: 1 };
          }
          break;
        case 'PASS':
          updateData.passes = { increment: 1 };
          if (eventData.completed) {
            updateData.passesCompleted = { increment: 1 };
          }
          break;
        case 'TACKLE':
          updateData.tackles = { increment: 1 };
          if (eventData.won) {
            updateData.tacklesWon = { increment: 1 };
          }
          break;
        case 'INTERCEPTION':
          updateData.interceptions = { increment: 1 };
          break;
        case 'CLEARANCE':
          updateData.clearances = { increment: 1 };
          break;
        case 'SAVE':
          updateData.saves = { increment: 1 };
          break;
        case 'FOUL':
          updateData.fouls = { increment: 1 };
          break;
        case 'FOUL_SUFFERED':
          updateData.foulsSuffered = { increment: 1 };
          break;
        case 'OFFSIDE':
          updateData.offsides = { increment: 1 };
          break;
        case 'DISTANCE':
          updateData.distance = { increment: eventData.meters || 0 };
          break;
        case 'SPRINT':
          updateData.sprints = { increment: 1 };
          break;
      }

      if (Object.keys(updateData).length > 0) {
        // Update or create player match stats
        const playerStats = await prisma.playerMatchStats.upsert({
          where: {
            playerId_matchId: {
              playerId,
              matchId
            }
          },
          update: updateData,
          create: {
            playerId,
            matchId,
            teamId: eventData.teamId,
            ...updateData,
            minutesPlayed: 0,
            goals: 0,
            assists: 0,
            shots: 0,
            shotsOnTarget: 0,
            yellowCards: 0,
            redCards: 0,
            fouls: 0,
            foulsSuffered: 0,
            offsides: 0,
            passes: 0,
            passesCompleted: 0,
            tackles: 0,
            tacklesWon: 0,
            interceptions: 0,
            clearances: 0,
            rating: 6.0,
            distance: 0,
            sprints: 0
          }
        });

        // Update season stats
        await this.updatePlayerSeasonStats(playerId, eventData.season || '2024', eventType, eventData);

        // Notify subscribers
        this.notifySubscribers({
          type: 'player',
          entityId: playerId,
          matchId,
          season: eventData.season || '2024',
          data: playerStats,
          timestamp: new Date()
        });

        // Clear cache for this player
        this.clearCache(`player:${playerId}`);
        this.clearCache(`match:${matchId}`);
      }
    } catch (error) {
      logger.error(`Error updating player stats for ${playerId}:`, error);
      throw error;
    }
  }

  // Update team statistics for a match event
  public async updateTeamStats(
    teamId: string, 
    matchId: string, 
    eventType: string, 
    eventData: any
  ): Promise<void> {
    try {
      const updateData: Partial<TeamMatchStats> = {};
      
      switch (eventType) {
        case 'GOAL':
          updateData.goals = { increment: 1 };
          break;
        case 'ASSIST':
          updateData.assists = { increment: 1 };
          break;
        case 'SHOT':
          updateData.shots = { increment: 1 };
          if (eventData.onTarget) {
            updateData.shotsOnTarget = { increment: 1 };
          }
          break;
        case 'CORNER':
          updateData.corners = { increment: 1 };
          break;
        case 'FOUL':
          updateData.fouls = { increment: 1 };
          break;
        case 'YELLOW_CARD':
          updateData.yellowCards = { increment: 1 };
          break;
        case 'RED_CARD':
          updateData.redCards = { increment: 1 };
          break;
        case 'PASS':
          updateData.passes = { increment: 1 };
          if (eventData.completed) {
            updateData.passesCompleted = { increment: 1 };
          }
          break;
        case 'TACKLE':
          updateData.tackles = { increment: 1 };
          break;
        case 'INTERCEPTION':
          updateData.interceptions = { increment: 1 };
          break;
        case 'OFFSIDE':
          updateData.offsides = { increment: 1 };
          break;
        case 'SAVE':
          updateData.saves = { increment: 1 };
          break;
        case 'CLEARANCE':
          updateData.clearances = { increment: 1 };
          break;
        case 'BLOCK':
          updateData.blocks = { increment: 1 };
          break;
        case 'DISTANCE':
          updateData.distance = { increment: eventData.meters || 0 };
          break;
        case 'SPRINT':
          updateData.sprints = { increment: 1 };
          break;
      }

      if (Object.keys(updateData).length > 0) {
        // Update or create team match stats
        const teamStats = await prisma.teamMatchStats.upsert({
          where: {
            teamId_matchId: {
              teamId,
              matchId
            }
          },
          update: updateData,
          create: {
            teamId,
            matchId,
            ...updateData,
            goals: 0,
            assists: 0,
            shots: 0,
            shotsOnTarget: 0,
            corners: 0,
            fouls: 0,
            yellowCards: 0,
            redCards: 0,
            possession: 50,
            passes: 0,
            passesCompleted: 0,
            tackles: 0,
            interceptions: 0,
            offsides: 0,
            saves: 0,
            clearances: 0,
            blocks: 0,
            distance: 0,
            sprints: 0
          }
        });

        // Update season stats
        await this.updateTeamSeasonStats(teamId, eventData.season || '2024', eventType, eventData);

        // Notify subscribers
        this.notifySubscribers({
          type: 'team',
          entityId: teamId,
          matchId,
          season: eventData.season || '2024',
          data: teamStats,
          timestamp: new Date()
        });

        // Clear cache for this team
        this.clearCache(`team:${teamId}`);
        this.clearCache(`match:${matchId}`);
      }
    } catch (error) {
      logger.error(`Error updating team stats for ${teamId}:`, error);
      throw error;
    }
  }

  // Update match statistics
  public async updateMatchStats(matchId: string, eventType: string, eventData: any): Promise<void> {
    try {
      const match = await prisma.match.findUnique({
        where: { id: matchId },
        include: {
          events: true,
          homeTeam: true,
          awayTeam: true
        }
      });

      if (!match) {
        throw new Error(`Match ${matchId} not found`);
      }

      // Calculate match statistics
      const homeTeamEvents = match.events.filter(e => e.teamId === match.homeTeamId);
      const awayTeamEvents = match.events.filter(e => e.teamId === match.awayTeamId);

      const homeTeamStats = {
        goals: homeTeamEvents.filter(e => e.type === 'GOAL').length,
        assists: homeTeamEvents.filter(e => e.type === 'ASSIST').length,
        shots: homeTeamEvents.filter(e => e.type === 'OTHER' && e.description?.includes('shot')).length,
        shotsOnTarget: homeTeamEvents.filter(e => e.type === 'OTHER' && e.description?.includes('shot on target')).length,
        corners: homeTeamEvents.filter(e => e.type === 'OTHER' && e.description?.includes('corner')).length,
        fouls: homeTeamEvents.filter(e => e.type === 'OTHER' && e.description?.includes('foul')).length,
        yellowCards: homeTeamEvents.filter(e => e.type === 'YELLOW_CARD').length,
        redCards: homeTeamEvents.filter(e => e.type === 'RED_CARD').length,
        possession: this.calculatePossession(homeTeamEvents, awayTeamEvents)
      };

      const awayTeamStats = {
        goals: awayTeamEvents.filter(e => e.type === 'GOAL').length,
        assists: awayTeamEvents.filter(e => e.type === 'ASSIST').length,
        shots: awayTeamEvents.filter(e => e.type === 'OTHER' && e.description?.includes('shot')).length,
        shotsOnTarget: awayTeamEvents.filter(e => e.type === 'OTHER' && e.description?.includes('shot on target')).length,
        corners: awayTeamEvents.filter(e => e.type === 'OTHER' && e.description?.includes('corner')).length,
        fouls: awayTeamEvents.filter(e => e.type === 'OTHER' && e.description?.includes('foul')).length,
        yellowCards: awayTeamEvents.filter(e => e.type === 'YELLOW_CARD').length,
        redCards: awayTeamEvents.filter(e => e.type === 'RED_CARD').length,
        possession: 100 - homeTeamStats.possession
      };

      // Update match statistics
      const matchStats = await prisma.matchStatistics.upsert({
        where: { matchId },
        update: {
          homeTeamStats,
          awayTeamStats,
          totalEvents: match.events.length,
          totalGoals: homeTeamStats.goals + awayTeamStats.goals,
          totalCards: homeTeamStats.yellowCards + homeTeamStats.redCards + awayTeamStats.yellowCards + awayTeamStats.redCards,
          totalSubstitutions: match.events.filter(e => e.type === 'SUBSTITUTION').length,
          averagePossession: (homeTeamStats.possession + awayTeamStats.possession) / 2
        },
        create: {
          matchId,
          homeTeamId: match.homeTeamId,
          awayTeamId: match.awayTeamId,
          homeTeamStats,
          awayTeamStats,
          playerStats: [],
          totalEvents: match.events.length,
          totalGoals: homeTeamStats.goals + awayTeamStats.goals,
          totalCards: homeTeamStats.yellowCards + homeTeamStats.redCards + awayTeamStats.yellowCards + awayTeamStats.redCards,
          totalSubstitutions: match.events.filter(e => e.type === 'SUBSTITUTION').length,
          matchDuration: 0,
          averagePossession: (homeTeamStats.possession + awayTeamStats.possession) / 2
        }
      });

      // Notify subscribers
      this.notifySubscribers({
        type: 'match',
        entityId: matchId,
        matchId,
        data: matchStats,
        timestamp: new Date()
      });

      // Clear cache
      this.clearCache(`match:${matchId}`);
    } catch (error) {
      logger.error(`Error updating match stats for ${matchId}:`, error);
      throw error;
    }
  }

  // Calculate possession percentage based on events
  private calculatePossession(homeEvents: any[], awayEvents: any[]): number {
    const totalEvents = homeEvents.length + awayEvents.length;
    if (totalEvents === 0) return 50;
    
    const homeEventWeight = homeEvents.reduce((sum, event) => {
      switch (event.type) {
        case 'PASS': return sum + 1;
        case 'SHOT': return sum + 2;
        case 'GOAL': return sum + 3;
        case 'TACKLE': return sum + 1;
        case 'INTERCEPTION': return sum + 1;
        default: return sum + 0.5;
      }
    }, 0);
    
    const awayEventWeight = awayEvents.reduce((sum, event) => {
      switch (event.type) {
        case 'PASS': return sum + 1;
        case 'SHOT': return sum + 2;
        case 'GOAL': return sum + 3;
        case 'TACKLE': return sum + 1;
        case 'INTERCEPTION': return sum + 1;
        default: return sum + 0.5;
      }
    }, 0);
    
    const totalWeight = homeEventWeight + awayEventWeight;
    if (totalWeight === 0) return 50;
    
    return Math.round((homeEventWeight / totalWeight) * 100);
  }

  // Update player season statistics
  private async updatePlayerSeasonStats(
    playerId: string, 
    season: string, 
    eventType: string, 
    eventData: any
  ): Promise<void> {
    try {
      const updateData: any = {};
      
      switch (eventType) {
        case 'GOAL':
          updateData.goals = { increment: 1 };
          break;
        case 'ASSIST':
          updateData.assists = { increment: 1 };
          break;
        case 'YELLOW_CARD':
          updateData.yellowCards = { increment: 1 };
          break;
        case 'RED_CARD':
          updateData.redCards = { increment: 1 };
          break;
        case 'SAVE':
          updateData.saves = { increment: 1 };
          break;
        case 'GOAL_CONCEDED':
          updateData.goalsConceded = { increment: 1 };
          break;
        case 'CLEAN_SHEET':
          updateData.cleanSheets = { increment: 1 };
          break;
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.playerSeasonStats.upsert({
          where: {
            playerId_season: {
              playerId,
              season
            }
          },
          update: updateData,
          create: {
            playerId,
            season,
            teamId: eventData.teamId,
            ...updateData,
            matchesPlayed: 0,
            matchesStarted: 0,
            minutesPlayed: 0,
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
            cleanSheets: 0,
            goalsConceded: 0,
            saves: 0,
            averageRating: 6.0,
            totalDistance: 0,
            totalSprints: 0
          }
        });
      }
    } catch (error) {
      logger.error(`Error updating player season stats for ${playerId}:`, error);
    }
  }

  // Update team season statistics
  private async updateTeamSeasonStats(
    teamId: string, 
    season: string, 
    eventType: string, 
    eventData: any
  ): Promise<void> {
    try {
      const updateData: any = {};
      
      switch (eventType) {
        case 'GOAL':
          updateData.goalsFor = { increment: 1 };
          break;
        case 'GOAL_CONCEDED':
          updateData.goalsAgainst = { increment: 1 };
          break;
        case 'CLEAN_SHEET':
          updateData.cleanSheets = { increment: 1 };
          break;
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.teamSeasonStats.upsert({
          where: {
            teamId_season: {
              teamId,
              season
            }
          },
          update: updateData,
          create: {
            teamId,
            season,
            ...updateData,
            matchesPlayed: 0,
            matchesWon: 0,
            matchesDrawn: 0,
            matchesLost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            points: 0,
            cleanSheets: 0,
            goalsConceded: 0,
            averageGoalsPerGame: 0,
            averageGoalsAgainstPerGame: 0,
            winPercentage: 0
          }
        });
      }
    } catch (error) {
      logger.error(`Error updating team season stats for ${teamId}:`, error);
    }
  }

  // Get cached statistics or fetch from database
  public async getCachedStats<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    const expiry = this.cacheExpiry.get(key);
    
    if (cached && expiry && Date.now() < expiry) {
      return cached as T;
    }
    
    const data = await fetchFn();
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL);
    
    return data;
  }

  // Clear cache for a specific key
  private clearCache(key: string): void {
    this.cache.delete(key);
    this.cacheExpiry.delete(key);
  }

  // Get player statistics for a match
  public async getPlayerMatchStats(playerId: string, matchId: string): Promise<PlayerMatchStats | null> {
    return this.getCachedStats(`player:${playerId}:match:${matchId}`, async () => {
      return await prisma.playerMatchStats.findUnique({
        where: {
          playerId_matchId: {
            playerId,
            matchId
          }
        }
      });
    });
  }

  // Get team statistics for a match
  public async getTeamMatchStats(teamId: string, matchId: string): Promise<TeamMatchStats | null> {
    return this.getCachedStats(`team:${teamId}:match:${matchId}`, async () => {
      return await prisma.teamMatchStats.findUnique({
        where: {
          teamId_matchId: {
            teamId,
            matchId
          }
        }
      });
    });
  }

  // Get match statistics
  public async getMatchStats(matchId: string): Promise<MatchStatistics | null> {
    return this.getCachedStats(`match:${matchId}`, async () => {
      return await prisma.matchStatistics.findUnique({
        where: { matchId },
        // include: {
        //   playerStats: true // Property not available in current schema
        // }
      });
    });
  }

  // Get player season statistics
  public async getPlayerSeasonStats(playerId: string, season: string): Promise<PlayerSeasonStats | null> {
    return this.getCachedStats(`player:${playerId}:season:${season}`, async () => {
      return await prisma.playerSeasonStats.findUnique({
        where: {
          playerId_season: {
            playerId,
            season
          }
        }
      });
    });
  }

  // Get team season statistics
  public async getTeamSeasonStats(teamId: string, season: string): Promise<TeamSeasonStats | null> {
    return this.getCachedStats(`team:${teamId}:season:${season}`, async () => {
      return await prisma.teamSeasonStats.findUnique({
        where: {
          teamId_season: {
            teamId,
            season
          }
        }
      });
    });
  }

  // Get top performers for a season
  public async getTopPerformers(season: string, limit: number = 10): Promise<{
    topScorers: PlayerSeasonStats[];
    topAssists: PlayerSeasonStats[];
    topGoalkeepers: PlayerSeasonStats[];
  }> {
    const key = `topPerformers:${season}`;
    return this.getCachedStats(key, async () => {
      const [topScorers, topAssists, topGoalkeepers] = await Promise.all([
        prisma.playerSeasonStats.findMany({
          where: { season },
          orderBy: { goals: 'desc' },
          take: limit
        }),
        prisma.playerSeasonStats.findMany({
          where: { season },
          orderBy: { assists: 'desc' },
          take: limit
        }),
        prisma.playerSeasonStats.findMany({
          where: { 
            season,
            saves: { gt: 0 }
          },
          orderBy: { saves: 'desc' },
          take: limit
        })
      ]);

      return { topScorers, topAssists, topGoalkeepers };
    });
  }

  // Get team standings for a season
  public async getTeamStandings(season: string): Promise<TeamSeasonStats[]> {
    const key = `teamStandings:${season}`;
    return this.getCachedStats(key, async () => {
      return await prisma.teamSeasonStats.findMany({
        where: { season },
        orderBy: [
          { points: 'desc' },
          { goalsFor: 'desc' },
          { goalsAgainst: 'asc' }
        ]
      });
    });
  }

  // Cleanup method for graceful shutdown
  public async cleanup(): Promise<void> {
    this.updateCallbacks.clear();
    this.cache.clear();
    this.cacheExpiry.clear();
  }
}

export default StatisticsService.getInstance();
