import { useState, useEffect, useCallback } from 'react';
import { LiveMatch, LiveMatchEvent, LiveMatchStatus } from '../types';
import LiveMatchService from '../services/LiveMatchService';

interface UseLiveMatchOptions {
  matchId?: string;
  autoSubscribe?: boolean;
}

interface UseLiveMatchReturn {
  // Match data
  match: LiveMatch | null;
  events: LiveMatchEvent[];
  loading: boolean;
  error: string | null;
  
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
  
  // Real-time subscriptions
  subscribeToMatch: (callback: (match: LiveMatch) => void) => () => void;
  subscribeToEvents: (callback: (events: LiveMatchEvent[]) => void) => () => void;
}

export function useLiveMatch(options: UseLiveMatchOptions = {}): UseLiveMatchReturn {
  const { matchId, autoSubscribe = true } = options;
  
  const [match, setMatch] = useState<LiveMatch | null>(null);
  const [events, setEvents] = useState<LiveMatchEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial match data
  useEffect(() => {
    if (!matchId) return;

    const loadMatch = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await LiveMatchService.getMatch(matchId);
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
        const response = await LiveMatchService.getMatchEvents(matchId);
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

    const unsubscribeMatch = LiveMatchService.subscribeToMatch(matchId, (updatedMatch) => {
      setMatch(updatedMatch);
    });

    const unsubscribeEvents = LiveMatchService.subscribeToMatchEvents(matchId, (updatedEvents) => {
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
      const response = await LiveMatchService.createMatch(matchData);
      if (response.success && response.data) {
        setMatch(response.data);
        return true;
      } else {
        setError(response.error || 'Failed to create match');
        return false;
      }
    } catch (err) {
      setError('Failed to create match');
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
      const response = await LiveMatchService.updateMatch(matchId, updates);
      if (response.success) {
        return true;
      } else {
        setError(response.error || 'Failed to update match');
        return false;
      }
    } catch (err) {
      setError('Failed to update match');
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
      const response = await LiveMatchService.startMatch(matchId);
      if (response.success) {
        return true;
      } else {
        setError(response.error || 'Failed to start match');
        return false;
      }
    } catch (err) {
      setError('Failed to start match');
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
      const response = await LiveMatchService.endMatch(matchId);
      if (response.success) {
        return true;
      } else {
        setError(response.error || 'Failed to end match');
        return false;
      }
    } catch (err) {
      setError('Failed to end match');
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
      const response = await LiveMatchService.addMatchEvent({
        matchId,
        type: eventData.type,
        timestamp: new Date(),
        minute: eventData.minute,
        playerId: eventData.playerId,
        teamId: eventData.teamId,
        data: eventData.data || {},
        createdBy: 'current-user', // This should come from auth context
      });
      
      if (response.success) {
        return true;
      } else {
        setError(response.error || 'Failed to add event');
        return false;
      }
    } catch (err) {
      setError('Failed to add event');
      console.error('Error adding event:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  // Manual subscription methods
  const subscribeToMatch = useCallback((callback: (match: LiveMatch) => void) => {
    if (!matchId) return () => {};
    return LiveMatchService.subscribeToMatch(matchId, callback);
  }, [matchId]);

  const subscribeToEvents = useCallback((callback: (events: LiveMatchEvent[]) => void) => {
    if (!matchId) return () => {};
    return LiveMatchService.subscribeToMatchEvents(matchId, callback);
  }, [matchId]);

  return {
    match,
    events,
    loading,
    error,
    createMatch,
    updateMatch,
    startMatch,
    endMatch,
    addEvent,
    subscribeToMatch,
    subscribeToEvents,
  };
}

// Hook for managing multiple matches
export function useLiveMatches(filters?: {
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
      const response = await LiveMatchService.getMatches(filters);
      if (response.success && response.data) {
        setMatches(response.data);
      } else {
        setError(response.error || 'Failed to load matches');
      }
    } catch (err) {
      setError('Failed to load matches');
      console.error('Error loading matches:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Subscribe to live matches
  const subscribeToLiveMatches = useCallback((callback: (matches: LiveMatch[]) => void) => {
    return LiveMatchService.subscribeToLiveMatches(callback);
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