import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import API, { 
  Match, 
  MatchEvent, 
  MatchStatistics, 
  MatchState 
} from '../services/apiService';
import { apiConfig } from '../config/api';
import MobileRealTimeService from '../services/realTimeService';

interface UseLiveMatchDataOptions {
  matchId: string;
  userId: string;
  userRole: string;
  autoConnect?: boolean;
  refreshInterval?: number;
}

interface UseLiveMatchDataReturn {
  // Data states
  match: Match | null;
  events: MatchEvent[];
  statistics: MatchStatistics | null;
  matchState: MatchState | null;
  
  // Loading states
  loading: boolean;
  eventsLoading: boolean;
  statsLoading: boolean;
  stateLoading: boolean;
  
  // Error states
  error: string | null;
  eventsError: string | null;
  statsError: string | null;
  stateError: string | null;
  
  // Connection states
  isConnected: boolean;
  isConnecting: boolean;
  
  // Actions
  refreshMatch: () => Promise<void>;
  refreshEvents: () => Promise<void>;
  refreshStatistics: () => Promise<void>;
  refreshMatchState: () => Promise<void>;
  
  // WebSocket actions
  connect: () => Promise<void>;
  disconnect: () => void;
  
  // Match control actions
  startMatch: () => Promise<void>;
  pauseMatch: () => Promise<void>;
  resumeMatch: () => Promise<void>;
  endMatch: (scores?: { homeScore: number; awayScore: number }) => Promise<void>;
  
  // Event actions
  addEvent: (eventData: Partial<MatchEvent>) => Promise<void>;
  
  // Utility functions
  isReferee: boolean;
  isCoach: boolean;
  isPlayer: boolean;
  canControlMatch: boolean;
}

export const useLiveMatchData = (options: UseLiveMatchDataOptions): UseLiveMatchDataReturn => {
  const { 
    matchId, 
    userId, 
    userRole, 
    autoConnect = true, 
    refreshInterval = 30000 
  } = options;

  // API instance
  const apiRef = useRef<API | null>(null);
  
  // Real-time service instance
  const realTimeServiceRef = useRef<MobileRealTimeService | null>(null);
  
  // Data states
  const [match, setMatch] = useState<Match | null>(null);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [statistics, setStatistics] = useState<MatchStatistics | null>(null);
  const [matchState, setMatchState] = useState<MatchState | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [stateLoading, setStateLoading] = useState(false);
  
  // Error states
  const [error, setError] = useState<string | null>(null);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [stateError, setStateError] = useState<string | null>(null);
  
  // Connection states
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Refresh interval
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize API
  useEffect(() => {
    if (!apiRef.current) {
      apiRef.current = new API(apiConfig);
    }
  }, []);
  
  // Initialize real-time service
  useEffect(() => {
    if (!realTimeServiceRef.current) {
      realTimeServiceRef.current = new MobileRealTimeService({
        serverUrl: apiConfig.websocketUrl,
        matchId,
        userId,
        userRole,
        onConnect: () => setIsConnected(true),
        onDisconnect: () => setIsConnected(false),
        onMatchStateUpdate: (newState) => setMatchState(newState),
        onMatchEvent: (event) => {
          setEvents(prev => [event, ...prev.slice(0, 99)]);
        },
        onStatisticsUpdate: (newStats) => setStatistics(newStats),
        onError: (error) => {
          console.error('Real-time service error:', error);
          setError(error.message);
        }
      });
    }
    
    return () => {
      if (realTimeServiceRef.current) {
        realTimeServiceRef.current.disconnect();
      }
    };
  }, [matchId, userId, userRole]);
  
  // Auto-connect if enabled
  useEffect(() => {
    if (autoConnect && realTimeServiceRef.current && !isConnected && !isConnecting) {
      connect();
    }
  }, [autoConnect, isConnected, isConnecting]);
  
  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        if (isConnected) {
          refreshMatch();
        }
      }, refreshInterval);
    }
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [refreshInterval, isConnected]);
  
  // Fetch match data
  const fetchMatch = useCallback(async () => {
    if (!apiRef.current) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const matchData = await apiRef.current.matches.getMatch(matchId);
      setMatch(matchData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch match';
      setError(errorMessage);
      console.error('Error fetching match:', err);
    } finally {
      setLoading(false);
    }
  }, [matchId]);
  
  // Fetch match events
  const fetchEvents = useCallback(async () => {
    if (!apiRef.current) return;
    
    try {
      setEventsLoading(true);
      setEventsError(null);
      
      const eventsData = await apiRef.current.matches.getMatchEvents(matchId);
      setEvents(eventsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch events';
      setEventsError(errorMessage);
      console.error('Error fetching events:', err);
    } finally {
      setEventsLoading(false);
    }
  }, [matchId]);
  
  // Fetch match statistics
  const fetchStatistics = useCallback(async () => {
    if (!apiRef.current) return;
    
    try {
      setStatsLoading(true);
      setStatsError(null);
      
      const statsData = await apiRef.current.statistics.getMatchStatisticsOverview(matchId, {
        homeTeamId: match?.homeTeamId,
        awayTeamId: match?.awayTeamId
      });
      setStatistics(statsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch statistics';
      setStatsError(errorMessage);
      console.error('Error fetching statistics:', err);
    } finally {
      setStatsLoading(false);
    }
  }, [matchId, match?.homeTeamId, match?.awayTeamId]);
  
  // Fetch match state
  const fetchMatchState = useCallback(async () => {
    if (!apiRef.current) return;
    
    try {
      setStateLoading(true);
      setStateError(null);
      
      const stateData = await apiRef.current.matches.getMatchWebSocketStatus(matchId);
      setMatchState(stateData.matchState);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch match state';
      setStateError(errorMessage);
      console.error('Error fetching match state:', err);
    } finally {
      setStateLoading(false);
    }
  }, [matchId]);
  
  // Initial data fetch
  useEffect(() => {
    fetchMatch();
    fetchEvents();
    fetchStatistics();
    fetchMatchState();
  }, [fetchMatch, fetchEvents, fetchStatistics, fetchMatchState]);
  
  // Connect to real-time service
  const connect = useCallback(async () => {
    if (!realTimeServiceRef.current || isConnecting) return;
    
    try {
      setIsConnecting(true);
      await realTimeServiceRef.current.connect();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect';
      setError(errorMessage);
      console.error('Connection error:', err);
      Alert.alert('Connection Error', errorMessage);
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting]);
  
  // Disconnect from real-time service
  const disconnect = useCallback(() => {
    if (realTimeServiceRef.current) {
      realTimeServiceRef.current.disconnect();
    }
  }, []);
  
  // Refresh functions
  const refreshMatch = useCallback(async () => {
    await fetchMatch();
  }, [fetchMatch]);
  
  const refreshEvents = useCallback(async () => {
    await fetchEvents();
  }, [fetchEvents]);
  
  const refreshStatistics = useCallback(async () => {
    await fetchStatistics();
  }, [fetchStatistics]);
  
  const refreshMatchState = useCallback(async () => {
    await fetchMatchState();
  }, [fetchMatchState]);
  
  // Match control functions
  const startMatch = useCallback(async () => {
    if (!apiRef.current) return;
    
    try {
      await apiRef.current.matches.startMatch(matchId);
      await refreshMatchState();
      Alert.alert('Success', 'Match started successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start match';
      Alert.alert('Error', errorMessage);
      console.error('Error starting match:', err);
    }
  }, [matchId, refreshMatchState]);
  
  const pauseMatch = useCallback(async () => {
    if (!apiRef.current) return;
    
    try {
      await apiRef.current.matches.pauseMatch(matchId);
      await refreshMatchState();
      Alert.alert('Success', 'Match paused successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to pause match';
      Alert.alert('Error', errorMessage);
      console.error('Error pausing match:', err);
    }
  }, [matchId, refreshMatchState]);
  
  const resumeMatch = useCallback(async () => {
    if (!apiRef.current) return;
    
    try {
      await apiRef.current.matches.resumeMatch(matchId);
      await refreshMatchState();
      Alert.alert('Success', 'Match resumed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resume match';
      Alert.alert('Error', errorMessage);
      console.error('Error resuming match:', err);
    }
  }, [matchId, refreshMatchState]);
  
  const endMatch = useCallback(async (scores?: { homeScore: number; awayScore: number }) => {
    if (!apiRef.current) return;
    
    try {
      await apiRef.current.matches.endMatch(matchId, scores);
      await refreshMatchState();
      Alert.alert('Success', 'Match ended successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to end match';
      Alert.alert('Error', errorMessage);
      console.error('Error ending match:', err);
    }
  }, [matchId, refreshMatchState]);
  
  // Add event
  const addEvent = useCallback(async (eventData: Partial<MatchEvent>) => {
    if (!apiRef.current) return;
    
    try {
      await apiRef.current.matches.addMatchEvent(matchId, eventData);
      await refreshEvents();
      Alert.alert('Success', 'Event added successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add event';
      Alert.alert('Error', errorMessage);
      console.error('Error adding event:', err);
    }
  }, [matchId, refreshEvents]);
  
  // Utility computed values
  const isReferee = userRole === 'referee';
  const isCoach = userRole === 'coach';
  const isPlayer = userRole === 'player';
  const canControlMatch = isReferee || isCoach;
  
  return {
    // Data states
    match,
    events,
    statistics,
    matchState,
    
    // Loading states
    loading,
    eventsLoading,
    statsLoading,
    stateLoading,
    
    // Error states
    error,
    eventsError,
    statsError,
    stateError,
    
    // Connection states
    isConnected,
    isConnecting,
    
    // Actions
    refreshMatch,
    refreshEvents,
    refreshStatistics,
    refreshMatchState,
    
    // WebSocket actions
    connect,
    disconnect,
    
    // Match control actions
    startMatch,
    pauseMatch,
    resumeMatch,
    endMatch,
    
    // Event actions
    addEvent,
    
    // Utility functions
    isReferee,
    isCoach,
    isPlayer,
    canControlMatch,
  };
};
