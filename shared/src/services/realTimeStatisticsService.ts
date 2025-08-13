import { RealTimeService } from './realTimeService';

export interface PlayerMatchStats {
  playerId: string;
  matchId: string;
  teamId: string;
  minutesPlayed: number;
  goals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  yellowCards: number;
  redCards: number;
  fouls: number;
  foulsSuffered: number;
  offsides: number;
  passes: number;
  passesCompleted: number;
  tackles: number;
  tacklesWon: number;
  interceptions: number;
  clearances: number;
  saves?: number;
  goalsConceded?: number;
  cleanSheet?: boolean;
  rating?: number;
  distance?: number;
  sprints?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMatchStats {
  teamId: string;
  matchId: string;
  goals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  corners: number;
  fouls: number;
  yellowCards: number;
  redCards: number;
  possession: number;
  passes: number;
  passesCompleted: number;
  tackles: number;
  interceptions: number;
  offsides: number;
  saves: number;
  clearances: number;
  blocks: number;
  distance: number;
  sprints: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MatchStatistics {
  matchId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamStats: TeamMatchStats;
  awayTeamStats: TeamMatchStats;
  playerStats: PlayerMatchStats[];
  totalEvents: number;
  totalGoals: number;
  totalCards: number;
  totalSubstitutions: number;
  matchDuration: number;
  averagePossession: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StatisticsUpdate {
  type: 'player' | 'team' | 'match' | 'tournament';
  entityId: string;
  matchId?: string;
  season?: string;
  data: any;
  timestamp: Date;
}

export interface StatisticsSubscription {
  entityType: string;
  entityId: string;
  callback: (update: StatisticsUpdate) => void;
  unsubscribe: () => void;
}

export class RealTimeStatisticsService {
  private realTimeService: RealTimeService;
  private subscriptions: Map<string, StatisticsSubscription> = new Map();
  private statisticsCache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(realTimeService: RealTimeService) {
    this.realTimeService = realTimeService;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Listen for statistics updates from the server
    this.realTimeService.on('statistics-update', (update: StatisticsUpdate) => {
      this.handleStatisticsUpdate(update);
    });

    // Listen for match statistics updates
    this.realTimeService.on('match-statistics-update', (update: StatisticsUpdate) => {
      this.handleStatisticsUpdate(update);
    });

    // Listen for player statistics updates
    this.realTimeService.on('player-statistics-update', (update: StatisticsUpdate) => {
      this.handleStatisticsUpdate(update);
    });

    // Listen for team statistics updates
    this.realTimeService.on('team-statistics-update', (update: StatisticsUpdate) => {
      this.handleStatisticsUpdate(update);
    });
  }

  private handleStatisticsUpdate(update: StatisticsUpdate): void {
    // Update cache
    const cacheKey = `${update.type}:${update.entityId}`;
    this.statisticsCache.set(cacheKey, update.data);
    this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL);

    // Notify subscribers
    const subscription = this.subscriptions.get(cacheKey);
    if (subscription) {
      subscription.callback(update);
    }

    // Also notify match-specific subscribers
    if (update.matchId) {
      const matchKey = `match:${update.matchId}`;
      const matchSubscription = this.subscriptions.get(matchKey);
      if (matchSubscription) {
        matchSubscription.callback(update);
      }
    }
  }

  // Subscribe to real-time statistics updates
  public subscribe(
    entityType: string,
    entityId: string,
    callback: (update: StatisticsUpdate) => void
  ): () => void {
    const key = `${entityType}:${entityId}`;
    
    // Unsubscribe from existing subscription if any
    if (this.subscriptions.has(key)) {
      this.subscriptions.get(key)!.unsubscribe();
    }

    // Create new subscription
    const subscription: StatisticsSubscription = {
      entityType,
      entityId,
      callback,
      unsubscribe: () => {
        this.subscriptions.delete(key);
      }
    };

    this.subscriptions.set(key, subscription);

    // Join the appropriate room for real-time updates
    if (entityType === 'match') {
      this.realTimeService.joinMatch(entityId);
    } else if (entityType === 'player') {
      this.realTimeService.emit('join-player-stats', { playerId: entityId });
    } else if (entityType === 'team') {
      this.realTimeService.emit('join-team-stats', { teamId: entityId });
    }

    // Return unsubscribe function
    return () => {
      subscription.unsubscribe();
    };
  }

  // Subscribe to match statistics
  public subscribeToMatch(matchId: string, callback: (update: StatisticsUpdate) => void): () => void {
    return this.subscribe('match', matchId, callback);
  }

  // Subscribe to player statistics
  public subscribeToPlayer(playerId: string, callback: (update: StatisticsUpdate) => void): () => void {
    return this.subscribe('player', playerId, callback);
  }

  // Subscribe to team statistics
  public subscribeToTeam(teamId: string, callback: (update: StatisticsUpdate) => void): () => void {
    return this.subscribe('team', teamId, callback);
  }

  // Get cached statistics or fetch from server
  public async getCachedStats<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    const cached = this.statisticsCache.get(key);
    const expiry = this.cacheExpiry.get(key);
    
    if (cached && expiry && Date.now() < expiry) {
      return cached as T;
    }
    
    const data = await fetchFn();
    this.statisticsCache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL);
    
    return data;
  }

  // Clear cache for a specific key
  public clearCache(key: string): void {
    this.statisticsCache.delete(key);
    this.cacheExpiry.delete(key);
  }

  // Clear all cache
  public clearAllCache(): void {
    this.statisticsCache.clear();
    this.cacheExpiry.clear();
  }

  // Get player match statistics
  public async getPlayerMatchStats(playerId: string, matchId: string): Promise<PlayerMatchStats | null> {
    const key = `player:${playerId}:match:${matchId}`;
    return this.getCachedStats(key, async () => {
      try {
        const response = await fetch(`/api/statistics/players/${playerId}/matches/${matchId}`);
        if (!response.ok) return null;
        const result = await response.json();
        return result.success ? result.data : null;
      } catch (error) {
        console.error('Error fetching player match stats:', error);
        return null;
      }
    });
  }

  // Get team match statistics
  public async getTeamMatchStats(teamId: string, matchId: string): Promise<TeamMatchStats | null> {
    const key = `team:${teamId}:match:${matchId}`;
    return this.getCachedStats(key, async () => {
      try {
        const response = await fetch(`/api/statistics/teams/${teamId}/matches/${matchId}`);
        if (!response.ok) return null;
        const result = await response.json();
        return result.success ? result.data : null;
      } catch (error) {
        console.error('Error fetching team match stats:', error);
        return null;
      }
    });
  }

  // Get match statistics
  public async getMatchStats(matchId: string): Promise<MatchStatistics | null> {
    const key = `match:${matchId}`;
    return this.getCachedStats(key, async () => {
      try {
        const response = await fetch(`/api/statistics/matches/${matchId}`);
        if (!response.ok) return null;
        const result = await response.json();
        return result.success ? result.data : null;
      } catch (error) {
        console.error('Error fetching match stats:', error);
        return null;
      }
    });
  }

  // Get match statistics overview
  public async getMatchStatisticsOverview(matchId: string, homeTeamId?: string, awayTeamId?: string): Promise<any> {
    const key = `match:${matchId}:overview`;
    return this.getCachedStats(key, async () => {
      try {
        const params = new URLSearchParams();
        if (homeTeamId) params.append('homeTeamId', homeTeamId);
        if (awayTeamId) params.append('awayTeamId', awayTeamId);
        
        const response = await fetch(`/api/statistics/matches/${matchId}/overview?${params}`);
        if (!response.ok) return null;
        const result = await response.json();
        return result.success ? result.data : null;
      } catch (error) {
        console.error('Error fetching match statistics overview:', error);
        return null;
      }
    });
  }

  // Get top performers for a season
  public async getTopPerformers(season: string, limit: number = 10): Promise<any> {
    const key = `topPerformers:${season}:${limit}`;
    return this.getCachedStats(key, async () => {
      try {
        const response = await fetch(`/api/statistics/seasons/${season}/top-performers?limit=${limit}`);
        if (!response.ok) return null;
        const result = await response.json();
        return result.success ? result.data : null;
      } catch (error) {
        console.error('Error fetching top performers:', error);
        return null;
      }
    });
  }

  // Get team standings for a season
  public async getTeamStandings(season: string): Promise<any[]> {
    const key = `teamStandings:${season}`;
    return this.getCachedStats(key, async () => {
      try {
        const response = await fetch(`/api/statistics/seasons/${season}/standings`);
        if (!response.ok) return [];
        const result = await response.json();
        return result.success ? result.data : [];
      } catch (error) {
        console.error('Error fetching team standings:', error);
        return [];
      }
    });
  }

  // Get player performance comparison
  public async getPlayerPerformanceComparison(playerIds: string[], season: string): Promise<any> {
    const key = `playerComparison:${season}:${playerIds.sort().join(',')}`;
    return this.getCachedStats(key, async () => {
      try {
        const response = await fetch(`/api/statistics/seasons/${season}/players/compare?playerIds=${playerIds.join(',')}`);
        if (!response.ok) return null;
        const result = await response.json();
        return result.success ? result.data : null;
      } catch (error) {
        console.error('Error fetching player performance comparison:', error);
        return null;
      }
    });
  }

  // Get team performance comparison
  public async getTeamPerformanceComparison(teamIds: string[], season: string): Promise<any> {
    const key = `teamComparison:${season}:${teamIds.sort().join(',')}`;
    return this.getCachedStats(key, async () => {
      try {
        const response = await fetch(`/api/statistics/seasons/${season}/teams/compare?teamIds=${teamIds.join(',')}`);
        if (!response.ok) return null;
        const result = await response.json();
        return result.success ? result.data : null;
      } catch (error) {
        console.error('Error fetching team performance comparison:', error);
        return null;
      }
    });
  }

  // Refresh statistics for a specific entity
  public async refreshStats(entityType: string, entityId: string): Promise<void> {
    const key = `${entityType}:${entityId}`;
    this.clearCache(key);
    
    // Emit refresh request to server
    this.realTimeService.emit('refresh-statistics', { entityType, entityId });
  }

  // Refresh match statistics
  public async refreshMatchStats(matchId: string): Promise<void> {
    await this.refreshStats('match', matchId);
  }

  // Refresh player statistics
  public async refreshPlayerStats(playerId: string): Promise<void> {
    await this.refreshStats('player', playerId);
  }

  // Refresh team statistics
  public async refreshTeamStats(teamId: string): Promise<void> {
    await this.refreshStats('team', teamId);
  }

  // Get subscription count
  public getSubscriptionCount(): number {
    return this.subscriptions.size;
  }

  // Get cache size
  public getCacheSize(): number {
    return this.statisticsCache.size;
  }

  // Cleanup method
  public cleanup(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();

    // Clear all cache
    this.clearAllCache();
  }
}
