import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { LiveMatch, LiveMatchEvent, LiveMatchStatus } from '../../../shared/src/types';
import MobileLiveMatchService from '../services/LiveMatchService';

interface UseMobileLiveMatchOptions {
  matchId?: string;
  autoSubscribe?: boolean;
  enableOffline?: boolean;
}

interface UseMobileLiveMatchReturn {
  // Match data
  match: LiveMatch | null;
  events: LiveMatchEvent[];
  loading: boolean;
  error: string | null;
  
  // Offline status
  isOnline: boolean;
  offlineQueueCount: number;
  
  // Actions
  createMatch: (matchData: Omit<LiveMatch, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateMatch: (updates: Partial<LiveMatch>) => Promise<boolean>;
  startMatch: () => Promise<boolean>;
  endMatch: () => Promise<boolean>;
  addEvent: (eventData: {
    type: LiveMatchEvent['type'];
    minute: number;
    playerId?: string;
    teamId: string;
    data?: any;
  }) => Promise<boolean>;
  
  // Offline actions
  forceSync: () => Promise<void>;
  
  // Real-time subscriptions
  subscribeToMatch: (callback: (match: LiveMatch) => void) => () => void;
  subscribeToEvents: (callback: (events: LiveMatchEvent[]) => void) => () => void;
}

export function useMobileLiveMatch(options: UseMobileLiveMatchOptions = {}): UseMobileLiveMatchReturn {
  const { matchId, autoSubscribe = true, enableOffline = true } = options;
  
  const [match, setMatch] = useState<LiveMatch | null>(null);
  const [events, setEvents] = useState<LiveMatchEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);

  // Initialize offline support
  useEffect(() => {
    if (enableOffline) {
      MobileLiveMatchService.initializeOfflineSupport();
    }
  }, [enableOffline]);

  // Monitor offline status
  useEffect(() => {
    const interval = setInterval(() => {
      const status = MobileLiveMatchService.getOfflineQueueStatus();
      setIsOnline(status.isOnline);
      setOfflineQueueCount(status.count);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Load initial match data
  useEffect(() => {
    if (!matchId) return;

    const loadMatch = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await MobileLiveMatchService.getMatch(matchId);
        if (response.success && response.data) {
          setMatch(response.data);
        } else {
          setError(response.error || 'Failed to load match');
        }
      } catch (err) {
        setError('Failed to load match');
        console.error('Error loading match:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMatch();
  }, [matchId]);

  // Load initial events data
  useEffect(() => {
    if (!matchId) return;

    const loadEvents = async () => {
      try {
        const response = await MobileLiveMatchService.getMatchEvents(matchId);
        if (response.success && response.data) {
          setEvents(response.data);
        }
      } catch (err) {
        console.error('Error loading events:', err);
      }
    };

    loadEvents();
  }, [matchId]);

  // Auto-subscribe to real-time updates
  useEffect(() => {
    if (!matchId || !autoSubscribe) return;

    const unsubscribeMatch = MobileLiveMatchService.subscribeToMatch(matchId, (updatedMatch) => {
      setMatch(updatedMatch);
    });

    const unsubscribeEvents = MobileLiveMatchService.subscribeToMatchEvents(matchId, (updatedEvents) => {
      setEvents(updatedEvents);
    });

    return () => {
      unsubscribeMatch();
      unsubscribeEvents();
    };
  }, [matchId, autoSubscribe]);

  // Actions
  const createMatch = useCallback(async (matchData: Omit<LiveMatch, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await MobileLiveMatchService.createMatch(matchData);
      if (response.success && response.data) {
        setMatch(response.data);
        Alert.alert('Success', 'Match created successfully');
        return true;
      } else {
        setError(response.error || 'Failed to create match');
        Alert.alert('Error', response.error || 'Failed to create match');
        return false;
      }
    } catch (err) {
      setError('Failed to create match');
      Alert.alert('Error', 'Failed to create match');
      console.error('Error creating match:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMatch = useCallback(async (updates: Partial<LiveMatch>): Promise<boolean> => {
    if (!matchId) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await MobileLiveMatchService.updateMatch(matchId, updates);
      if (response.success) {
        return true;
      } else {
        setError(response.error || 'Failed to update match');
        Alert.alert('Error', response.error || 'Failed to update match');
        return false;
      }
    } catch (err) {
      setError('Failed to update match');
      Alert.alert('Error', 'Failed to update match');
      console.error('Error updating match:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  const startMatch = useCallback(async (): Promise<boolean> => {
    if (!matchId) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await MobileLiveMatchService.startMatch(matchId);
      if (response.success) {
        Alert.alert('Match Started', 'The match has begun!');
        return true;
      } else {
        setError(response.error || 'Failed to start match');
        Alert.alert('Error', response.error || 'Failed to start match');
        return false;
      }
    } catch (err) {
      setError('Failed to start match');
      Alert.alert('Error', 'Failed to start match');
      console.error('Error starting match:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  const endMatch = useCallback(async (): Promise<boolean> => {
    if (!matchId) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await MobileLiveMatchService.endMatch(matchId);
      if (response.success) {
        Alert.alert('Match Ended', 'The match has finished!');
        return true;
      } else {
        setError(response.error || 'Failed to end match');
        Alert.alert('Error', response.error || 'Failed to end match');
        return false;
      }
    } catch (err) {
      setError('Failed to end match');
      Alert.alert('Error', 'Failed to end match');
      console.error('Error ending match:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  const addEvent = useCallback(async (eventData: {
    type: LiveMatchEvent['type'];
    minute: number;
    playerId?: string;
    teamId: string;
    data?: any;
  }): Promise<boolean> => {
    if (!matchId) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await MobileLiveMatchService.addMatchEvent({
        matchId,
        type: eventData.type,
        timestamp: new Date(),
        minute: eventData.minute,
        playerId: eventData.playerId,
        teamId: eventData.teamId,
        data: eventData.data || {},
      });
      
      if (response.success) {
        // Show success feedback for important events
        if (['goal', 'red_card', 'penalty_goal'].includes(eventData.type)) {
          Alert.alert('Event Added', `${eventData.type.replace('_', ' ')} recorded at ${eventData.minute}'`);
        }
        return true;
      } else {
        setError(response.error || 'Failed to add event');
        Alert.alert('Error', response.error || 'Failed to add event');
        return false;
      }
    } catch (err) {
      setError('Failed to add event');
      Alert.alert('Error', 'Failed to add event');
      console.error('Error adding event:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  // Force sync offline queue
  const forceSync = useCallback(async (): Promise<void> => {
    try {
      await MobileLiveMatchService.forceSync();
      Alert.alert('Sync Complete', 'Offline data has been synchronized');
    } catch (error) {
      Alert.alert('Sync Error', 'Failed to synchronize offline data');
      console.error('Error syncing offline data:', error);
    }
  }, []);

  // Manual subscription methods
  const subscribeToMatch = useCallback((callback: (match: LiveMatch) => void) => {
    if (!matchId) return () => {};
    return MobileLiveMatchService.subscribeToMatch(matchId, callback);
  }, [matchId]);

  const subscribeToEvents = useCallback((callback: (events: LiveMatchEvent[]) => void) => {
    if (!matchId) return () => {};
    return MobileLiveMatchService.subscribeToMatchEvents(matchId, callback);
  }, [matchId]);

  return {
    match,
    events,
    loading,
    error,
    isOnline,
    offlineQueueCount,
    createMatch,
    updateMatch,
    startMatch,
    endMatch,
    addEvent,
    forceSync,
    subscribeToMatch,
    subscribeToEvents,
  };
}

// Hook for managing multiple matches
export function useMobileLiveMatches(filters?: {
  status?: LiveMatchStatus;
  clubId?: string;
  tournamentId?: string;
  limit?: number;
}) {
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load matches
  const loadMatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await MobileLiveMatchService.getMatches(filters);
      if (response.success && response.data) {
        setMatches(response.data);
      } else {
        setError(response.error || 'Failed to load matches');
        Alert.alert('Error', response.error || 'Failed to load matches');
      }
    } catch (err) {
      setError('Failed to load matches');
      Alert.alert('Error', 'Failed to load matches');
      console.error('Error loading matches:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Subscribe to live matches
  const subscribeToLiveMatches = useCallback((callback: (matches: LiveMatch[]) => void) => {
    return MobileLiveMatchService.subscribeToLiveMatches(callback);
  }, []);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  return {
    matches,
    loading,
    error,
    loadMatches,
    subscribeToLiveMatches,
  };
} 