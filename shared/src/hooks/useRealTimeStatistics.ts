import { useState, useEffect, useCallback, useRef } from 'react';
import { RealTimeStatisticsService, StatisticsUpdate, PlayerMatchStats, TeamMatchStats, MatchStatistics } from '../services/realTimeStatisticsService';

export interface UseRealTimeStatisticsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableCache?: boolean;
}

export interface UseRealTimeStatisticsReturn {
  // Data states
  playerMatchStats: PlayerMatchStats | null;
  teamMatchStats: TeamMatchStats | null;
  matchStats: MatchStatistics | null;
  topPerformers: any | null;
  teamStandings: any[] | null;
  
  // Loading states
  loading: {
    player: boolean;
    team: boolean;
    match: boolean;
    topPerformers: boolean;
    teamStandings: boolean;
  };
  
  // Error states
  errors: {
    player: string | null;
    team: string | null;
    match: string | null;
    topPerformers: string | null;
    teamStandings: string | null;
  };
  
  // Actions
  subscribeToMatch: (matchId: string, callback?: (update: StatisticsUpdate) => void) => () => void;
  subscribeToPlayer: (playerId: string, callback?: (update: StatisticsUpdate) => void) => () => void;
  subscribeToTeam: (teamId: string, callback?: (update: StatisticsUpdate) => void) => () => void;
  
  // Data fetching
  fetchPlayerMatchStats: (playerId: string, matchId: string) => Promise<void>;
  fetchTeamMatchStats: (teamId: string, matchId: string) => Promise<void>;
  fetchMatchStats: (matchId: string) => Promise<void>;
  fetchTopPerformers: (season: string, limit?: number) => Promise<void>;
  fetchTeamStandings: (season: string) => Promise<void>;
  
  // Cache management
  clearCache: (key?: string) => void;
  clearAllCache: () => void;
  
  // Refresh
  refreshAll: () => Promise<void>;
  
  // Service info
  subscriptionCount: number;
  cacheSize: number;
}

export function useRealTimeStatistics(
  statisticsService: RealTimeStatisticsService,
  options: UseRealTimeStatisticsOptions = {}
): UseRealTimeStatisticsReturn {
  const {
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
    enableCache = true
  } = options;

  // Data states
  const [playerMatchStats, setPlayerMatchStats] = useState<PlayerMatchStats | null>(null);
  const [teamMatchStats, setTeamMatchStats] = useState<TeamMatchStats | null>(null);
  const [matchStats, setMatchStats] = useState<MatchStatistics | null>(null);
  const [topPerformers, setTopPerformers] = useState<any | null>(null);
  const [teamStandings, setTeamStandings] = useState<any[] | null>(null);

  // Loading states
  const [loading, setLoading] = useState({
    player: false,
    team: false,
    match: false,
    topPerformers: false,
    teamStandings: false
  });

  // Error states
  const [errors, setErrors] = useState({
    player: null,
    team: null,
    match: null,
    topPerformers: null,
    teamStandings: null
  });

  // Refs for current data
  const currentMatchId = useRef<string | null>(null);
  const currentPlayerId = useRef<string | null>(null);
  const currentTeamId = useRef<string | null>(null);
  const currentSeason = useRef<string | null>(null);

  // Auto-refresh interval
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
  }, [autoRefresh, refreshInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  // Helper function to set loading state
  const setLoadingState = useCallback((key: keyof typeof loading, value: boolean) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  }, []);

  // Helper function to set error state
  const setErrorState = useCallback((key: keyof typeof errors, value: string | null) => {
    setErrors(prev => ({ ...prev, [key]: value }));
  }, []);

  // Fetch player match statistics
  const fetchPlayerMatchStats = useCallback(async (playerId: string, matchId: string) => {
    try {
      setLoadingState('player', true);
      setErrorState('player', null);
      
      const stats = await statisticsService.getPlayerMatchStats(playerId, matchId);
      setPlayerMatchStats(stats);
      currentPlayerId.current = playerId;
    } catch (error) {
      setErrorState('player', error instanceof Error ? error.message : 'Failed to fetch player stats');
    } finally {
      setLoadingState('player', false);
    }
  }, [statisticsService, setLoadingState, setErrorState]);

  // Fetch team match statistics
  const fetchTeamMatchStats = useCallback(async (teamId: string, matchId: string) => {
    try {
      setLoadingState('team', true);
      setErrorState('team', null);
      
      const stats = await statisticsService.getTeamMatchStats(teamId, matchId);
      setTeamMatchStats(stats);
      currentTeamId.current = teamId;
    } catch (error) {
      setErrorState('team', error instanceof Error ? error.message : 'Failed to fetch team stats');
    } finally {
      setLoadingState('team', false);
    }
  }, [statisticsService, setLoadingState, setErrorState]);

  // Fetch match statistics
  const fetchMatchStats = useCallback(async (matchId: string) => {
    try {
      setLoadingState('match', true);
      setErrorState('match', null);
      
      const stats = await statisticsService.getMatchStats(matchId);
      setMatchStats(stats);
      currentMatchId.current = matchId;
    } catch (error) {
      setErrorState('match', error instanceof Error ? error.message : 'Failed to fetch match stats');
    } finally {
      setLoadingState('match', false);
    }
  }, [statisticsService, setLoadingState, setErrorState]);

  // Fetch top performers
  const fetchTopPerformers = useCallback(async (season: string, limit: number = 10) => {
    try {
      setLoadingState('topPerformers', true);
      setErrorState('topPerformers', null);
      
      const performers = await statisticsService.getTopPerformers(season, limit);
      setTopPerformers(performers);
      currentSeason.current = season;
    } catch (error) {
      setErrorState('topPerformers', error instanceof Error ? error.message : 'Failed to fetch top performers');
    } finally {
      setLoadingState('topPerformers', false);
    }
  }, [statisticsService, setLoadingState, setErrorState]);

  // Fetch team standings
  const fetchTeamStandings = useCallback(async (season: string) => {
    try {
      setLoadingState('teamStandings', true);
      setErrorState('teamStandings', null);
      
      const standings = await statisticsService.getTeamStandings(season);
      setTeamStandings(standings);
      currentSeason.current = season;
    } catch (error) {
      setErrorState('teamStandings', error instanceof Error ? error.message : 'Failed to fetch team standings');
    } finally {
      setLoadingState('teamStandings', false);
    }
  }, [statisticsService, setLoadingState, setErrorState]);

  // Subscribe to match statistics
  const subscribeToMatch = useCallback((matchId: string, callback?: (update: StatisticsUpdate) => void) => {
    return statisticsService.subscribeToMatch(matchId, (update) => {
      if (update.type === 'match' && update.data) {
        setMatchStats(update.data);
      }
      callback?.(update);
    });
  }, [statisticsService]);

  // Subscribe to player statistics
  const subscribeToPlayer = useCallback((playerId: string, callback?: (update: StatisticsUpdate) => void) => {
    return statisticsService.subscribeToPlayer(playerId, (update) => {
      if (update.type === 'player' && update.data) {
        setPlayerMatchStats(update.data);
      }
      callback?.(update);
    });
  }, [statisticsService]);

  // Subscribe to team statistics
  const subscribeToTeam = useCallback((teamId: string, callback?: (update: StatisticsUpdate) => void) => {
    return statisticsService.subscribeToTeam(teamId, (update) => {
      if (update.type === 'team' && update.data) {
        setTeamMatchStats(update.data);
      }
      callback?.(update);
    });
  }, [statisticsService]);

  // Clear cache
  const clearCache = useCallback((key?: string) => {
    if (key) {
      statisticsService.clearCache(key);
    } else {
      statisticsService.clearAllCache();
    }
  }, [statisticsService]);

  // Clear all cache
  const clearAllCache = useCallback(() => {
    statisticsService.clearAllCache();
  }, [statisticsService]);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    const promises: Promise<void>[] = [];

    if (currentMatchId.current) {
      promises.push(fetchMatchStats(currentMatchId.current));
    }

    if (currentPlayerId.current && currentMatchId.current) {
      promises.push(fetchPlayerMatchStats(currentPlayerId.current, currentMatchId.current));
    }

    if (currentTeamId.current && currentMatchId.current) {
      promises.push(fetchTeamMatchStats(currentTeamId.current, currentMatchId.current));
    }

    if (currentSeason.current) {
      promises.push(fetchTopPerformers(currentSeason.current));
      promises.push(fetchTeamStandings(currentSeason.current));
    }

    if (promises.length > 0) {
      await Promise.all(promises);
    }
  }, [
    fetchMatchStats,
    fetchPlayerMatchStats,
    fetchTeamMatchStats,
    fetchTopPerformers,
    fetchTeamStandings
  ]);

  return {
    // Data states
    playerMatchStats,
    teamMatchStats,
    matchStats,
    topPerformers,
    teamStandings,
    
    // Loading states
    loading,
    
    // Error states
    errors,
    
    // Actions
    subscribeToMatch,
    subscribeToPlayer,
    subscribeToTeam,
    
    // Data fetching
    fetchPlayerMatchStats,
    fetchTeamMatchStats,
    fetchMatchStats,
    fetchTopPerformers,
    fetchTeamStandings,
    
    // Cache management
    clearCache,
    clearAllCache,
    
    // Refresh
    refreshAll,
    
    // Service info
    subscriptionCount: statisticsService.getSubscriptionCount(),
    cacheSize: statisticsService.getCacheSize()
  };
}
