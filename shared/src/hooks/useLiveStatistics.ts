import { useState, useEffect, useCallback, useRef } from 'react';
import { RealTimeStatisticsService } from '../services/realTimeStatisticsService';
import { StatisticsUpdate, PlayerMatchStats, TeamMatchStats, MatchStatistics } from '../services/realTimeStatisticsService';

export interface UseLiveStatisticsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableCache?: boolean;
  enableRealTime?: boolean;
}

export interface UseLiveStatisticsReturn {
  // Data states
  matchStats: MatchStatistics | null;
  playerStats: PlayerMatchStats[];
  homeTeamStats: TeamMatchStats | null;
  awayTeamStats: TeamMatchStats | null;
  
  // Loading states
  loading: {
    match: boolean;
    players: boolean;
    teams: boolean;
  };
  
  // Error states
  errors: {
    match: string | null;
    players: string | null;
    teams: string | null;
  };
  
  // Real-time state
  isConnected: boolean;
  lastUpdate: Date | null;
  updateCount: number;
  
  // Actions
  refreshMatch: () => Promise<void>;
  refreshPlayers: () => Promise<void>;
  refreshTeams: () => Promise<void>;
  refreshAll: () => Promise<void>;
  
  // Subscriptions
  subscribeToMatch: (matchId: string, callback?: (update: StatisticsUpdate) => void) => () => void;
  subscribeToPlayer: (playerId: string, callback?: (update: StatisticsUpdate) => void) => () => void;
  subscribeToTeam: (teamId: string, callback?: (update: StatisticsUpdate) => void) => () => void;
  
  // Utility
  getStatChange: (statName: string, teamId: string) => { current: number; previous: number; change: number };
  getPlayerRanking: (statName: keyof PlayerMatchStats, limit?: number) => PlayerMatchStats[];
  getTeamComparison: (statName: keyof TeamMatchStats) => { home: number; away: number; difference: number };
}

export function useLiveStatistics(
  statisticsService: RealTimeStatisticsService,
  matchId: string,
  options: UseLiveStatisticsOptions = {}
): UseLiveStatisticsReturn {
  const {
    autoRefresh = true,
    refreshInterval = 5000,
    enableCache = true,
    enableRealTime = true
  } = options;

  // Data states
  const [matchStats, setMatchStats] = useState<MatchStatistics | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerMatchStats[]>([]);
  const [homeTeamStats, setHomeTeamStats] = useState<TeamMatchStats | null>(null);
  const [awayTeamStats, setAwayTeamStats] = useState<TeamMatchStats | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState({
    match: false,
    players: false,
    teams: false
  });
  
  // Error states
  const [errors, setErrors] = useState({
    match: null,
    players: null,
    teams: null
  });
  
  // Real-time state
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updateCount, setUpdateCount] = useState(0);
  
  // Refs for tracking previous values
  const previousStats = useRef<{
    match: MatchStatistics | null;
    players: PlayerMatchStats[];
    homeTeam: TeamMatchStats | null;
    awayTeam: TeamMatchStats | null;
  }>({
    match: null,
    players: [],
    homeTeam: null,
    awayTeam: null
  });
  
  // Auto-refresh interval
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Fetch match statistics
  const fetchMatchStats = useCallback(async () => {
    if (!matchId) return;
    
    setLoading(prev => ({ ...prev, match: true }));
    setErrors(prev => ({ ...prev, match: null }));
    
    try {
      const stats = await statisticsService.getMatchStats(matchId);
      if (stats) {
        previousStats.current.match = matchStats;
        setMatchStats(stats);
        setLastUpdate(new Date());
        setUpdateCount(prev => prev + 1);
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, match: error instanceof Error ? error.message : 'Failed to fetch match stats' }));
    } finally {
      setLoading(prev => ({ ...prev, match: false }));
    }
  }, [matchId, statisticsService, matchStats]);
  
  // Fetch player statistics
  const fetchPlayerStats = useCallback(async () => {
    if (!matchId) return;
    
    setLoading(prev => ({ ...prev, players: true }));
    setErrors(prev => ({ ...prev, players: null }));
    
    try {
      const stats = await statisticsService.getMatchStats(matchId);
      if (stats && stats.playerStats) {
        previousStats.current.players = playerStats;
        setPlayerStats(stats.playerStats);
        setLastUpdate(new Date());
        setUpdateCount(prev => prev + 1);
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, players: error instanceof Error ? error.message : 'Failed to fetch player stats' }));
    } finally {
      setLoading(prev => ({ ...prev, players: false }));
    }
  }, [matchId, statisticsService, playerStats]);
  
  // Fetch team statistics
  const fetchTeamStats = useCallback(async () => {
    if (!matchStats) return;
    
    setLoading(prev => ({ ...prev, teams: true }));
    setErrors(prev => ({ ...prev, teams: null }));
    
    try {
      if (matchStats.homeTeamStats) {
        previousStats.current.homeTeam = homeTeamStats;
        setHomeTeamStats(matchStats.homeTeamStats);
      }
      if (matchStats.awayTeamStats) {
        previousStats.current.awayTeam = awayTeamStats;
        setAwayTeamStats(matchStats.awayTeamStats);
      }
      setLastUpdate(new Date());
      setUpdateCount(prev => prev + 1);
    } catch (error) {
      setErrors(prev => ({ ...prev, teams: error instanceof Error ? error.message : 'Failed to fetch team stats' }));
    } finally {
      setLoading(prev => ({ ...prev, teams: false }));
    }
  }, [matchStats, homeTeamStats, awayTeamStats]);
  
  // Refresh functions
  const refreshMatch = useCallback(async () => {
    await fetchMatchStats();
  }, [fetchMatchStats]);
  
  const refreshPlayers = useCallback(async () => {
    await fetchPlayerStats();
  }, [fetchPlayerStats]);
  
  const refreshTeams = useCallback(async () => {
    await fetchTeamStats();
  }, [fetchTeamStats]);
  
  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchMatchStats(),
      fetchPlayerStats(),
      fetchTeamStats()
    ]);
  }, [fetchMatchStats, fetchPlayerStats, fetchTeamStats]);
  
  // Subscription functions
  const subscribeToMatch = useCallback((matchId: string, callback?: (update: StatisticsUpdate) => void) => {
    if (!enableRealTime) return () => {};
    
    return statisticsService.subscribeToMatch(matchId, (update) => {
      if (update.type === 'match' && update.data) {
        previousStats.current.match = matchStats;
        setMatchStats(update.data);
        setLastUpdate(new Date());
        setUpdateCount(prev => prev + 1);
        callback?.(update);
      }
    });
  }, [statisticsService, enableRealTime, matchStats]);
  
  const subscribeToPlayer = useCallback((playerId: string, callback?: (update: StatisticsUpdate) => void) => {
    if (!enableRealTime) return () => {};
    
    return statisticsService.subscribeToPlayer(playerId, (update) => {
      if (update.type === 'player' && update.data) {
        // Update specific player stats
        setPlayerStats(prev => 
          prev.map(player => 
            player.playerId === playerId ? { ...player, ...update.data } : player
          )
        );
        setLastUpdate(new Date());
        setUpdateCount(prev => prev + 1);
        callback?.(update);
      }
    });
  }, [statisticsService, enableRealTime]);
  
  const subscribeToTeam = useCallback((teamId: string, callback?: (update: StatisticsUpdate) => void) => {
    if (!enableRealTime) return () => {};
    
    return statisticsService.subscribeToTeam(teamId, (update) => {
      if (update.type === 'team' && update.data) {
        if (teamId === matchStats?.homeTeamId) {
          previousStats.current.homeTeam = homeTeamStats;
          setHomeTeamStats(update.data);
        } else if (teamId === matchStats?.awayTeamId) {
          previousStats.current.awayTeam = awayTeamStats;
          setAwayTeamStats(update.data);
        }
        setLastUpdate(new Date());
        setUpdateCount(prev => prev + 1);
        callback?.(update);
      }
    });
  }, [statisticsService, enableRealTime, matchStats, homeTeamStats, awayTeamStats]);
  
  // Utility functions
  const getStatChange = useCallback((statName: string, teamId: string) => {
    const current = teamId === matchStats?.homeTeamId ? homeTeamStats : awayTeamStats;
    const previous = teamId === matchStats?.homeTeamId ? previousStats.current.homeTeam : previousStats.current.awayTeam;
    
    if (!current || !previous) {
      return { current: 0, previous: 0, change: 0 };
    }
    
    const currentValue = (current as any)[statName] || 0;
    const previousValue = (previous as any)[statName] || 0;
    
    return {
      current: currentValue,
      previous: previousValue,
      change: currentValue - previousValue
    };
  }, [matchStats, homeTeamStats, awayTeamStats]);
  
  const getPlayerRanking = useCallback((statName: keyof PlayerMatchStats, limit = 5) => {
    return [...playerStats]
      .sort((a, b) => {
        const aValue = (a[statName] as number) || 0;
        const bValue = (b[statName] as number) || 0;
        return bValue - aValue;
      })
      .slice(0, limit);
  }, [playerStats]);
  
  const getTeamComparison = useCallback((statName: keyof TeamMatchStats) => {
    const homeValue = (homeTeamStats as any)?.[statName] || 0;
    const awayValue = (awayTeamStats as any)?.[statName] || 0;
    
    return {
      home: homeValue,
      away: awayValue,
      difference: homeValue - awayValue
    };
  }, [homeTeamStats, awayTeamStats]);
  
  // Setup auto-refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        refreshAll();
      }, refreshInterval);
    }
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, refreshAll]);
  
  // Initial data fetch
  useEffect(() => {
    if (matchId) {
      fetchMatchStats();
    }
  }, [matchId, fetchMatchStats]);
  
  // Update team stats when match stats change
  useEffect(() => {
    if (matchStats) {
      fetchTeamStats();
    }
  }, [matchStats, fetchTeamStats]);
  
  // Update player stats when match stats change
  useEffect(() => {
    if (matchStats) {
      fetchPlayerStats();
    }
  }, [matchStats, fetchPlayerStats]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);
  
  return {
    // Data states
    matchStats,
    playerStats,
    homeTeamStats,
    awayTeamStats,
    
    // Loading states
    loading,
    
    // Error states
    errors,
    
    // Real-time state
    isConnected,
    lastUpdate,
    updateCount,
    
    // Actions
    refreshMatch,
    refreshPlayers,
    refreshTeams,
    refreshAll,
    
    // Subscriptions
    subscribeToMatch,
    subscribeToPlayer,
    subscribeToTeam,
    
    // Utility
    getStatChange,
    getPlayerRanking,
    getTeamComparison
  };
}
