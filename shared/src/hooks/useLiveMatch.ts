import { useState, useEffect, useCallback } from 'react';
import { useRealTimeContext } from '../providers/RealTimeProvider';
import LiveMatchService, { AddMatchEventData, GetMatchesFilters } from '../services/LiveMatchService';
import { LiveMatchEvent, LiveMatchEventType, LiveMatchStatus, Match } from '../types';

export interface UseLiveMatchOptions {
  matchId?: string;
  autoSubscribe?: boolean;
  enableRealTime?: boolean;
}

export interface UseLiveMatchReturn {
  match: Match | null;
  events: LiveMatchEvent[];
  participants: any[];
  loading: boolean;
  error: string | null;
  startMatch: () => Promise<void>;
  endMatch: (homeScore?: number, awayScore?: number) => Promise<void>;
  pauseMatch: () => Promise<void>;
  resumeMatch: () => Promise<void>;
  addEvent: (eventData: Omit<AddMatchEventData, 'matchId'>) => Promise<void>;
  refresh: () => void;
}

export interface UseLiveMatchesOptions {
  status?: LiveMatchStatus;
  clubId?: string;
  tournamentId?: string;
  limit?: number;
  enableRealTime?: boolean;
}

export interface UseLiveMatchesReturn {
  matches: Match[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useLiveMatch = (options: UseLiveMatchOptions = {}): UseLiveMatchReturn => {
  const { matchId, autoSubscribe = false, enableRealTime = false } = options;
  const realTime = useRealTimeContext();
  
  const [match, setMatch] = useState<Match | null>(null);
  const [events, setEvents] = useState<LiveMatchEvent[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize LiveMatchService with real-time service
  useEffect(() => {
    if (enableRealTime && realTime.service) {
      LiveMatchService.setRealTimeService(realTime.service);
    }
  }, [enableRealTime, realTime.service]);

  // Load match data
  const loadMatch = useCallback(async () => {
    if (!matchId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [matchResponse, eventsResponse, participantsResponse] = await Promise.all([
        LiveMatchService.getMatch(matchId),
        LiveMatchService.getMatchEvents(matchId),
        LiveMatchService.getMatchParticipants(matchId)
      ]);

      if (matchResponse.success && matchResponse.match) {
        setMatch(matchResponse.match);
      } else {
        setError(matchResponse.error || 'Failed to load match');
      }

      if (eventsResponse.success && eventsResponse.events) {
        setEvents(eventsResponse.events);
      }

      if (participantsResponse.success && participantsResponse.participants) {
        setParticipants(participantsResponse.participants);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  // Load match on mount and when matchId changes
  useEffect(() => {
    if (matchId) {
      loadMatch();
    }
  }, [matchId, loadMatch]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!enableRealTime || !realTime.service || !matchId) return;

    const unsubscribe = realTime.service.on('match-updated', (event) => {
      if (event.data.matchId === matchId) {
        setMatch(event.data.match);
      }
    });

    const unsubscribeEvents = realTime.service.on('match-event-added', (event) => {
      if (event.data.matchId === matchId) {
        setEvents(prev => [...prev, event.data.event]);
      }
    });

    const unsubscribeStatus = realTime.service.on('match-started', (event) => {
      if (event.data.matchId === matchId) {
        loadMatch(); // Refresh match data to get updated status
      }
    });

    const unsubscribePause = realTime.service.on('match-paused', (event) => {
      if (event.data.matchId === matchId) {
        loadMatch(); // Refresh match data to get updated status
      }
    });

    const unsubscribeResume = realTime.service.on('match-resumed', (event) => {
      if (event.data.matchId === matchId) {
        loadMatch(); // Refresh match data to get updated status
      }
    });

    const unsubscribeEnd = realTime.service.on('match-ended', (event) => {
      if (event.data.matchId === matchId) {
        loadMatch(); // Refresh match data to get updated status
      }
    });

    // Join match room
    realTime.service.joinRoom(`match:${matchId}`);

    return () => {
      unsubscribe();
      unsubscribeEvents();
      unsubscribeStatus();
      unsubscribePause();
      unsubscribeResume();
      unsubscribeEnd();
      realTime.service?.leaveRoom(`match:${matchId}`);
    };
  }, [enableRealTime, realTime.service, matchId, loadMatch]);

  // Match control functions
  const startMatch = useCallback(async () => {
    if (!matchId) return;
    
    try {
      const response = await LiveMatchService.startMatch(matchId);
      if (response.success) {
        await loadMatch(); // Refresh match data
      } else {
        setError(response.error || 'Failed to start match');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [matchId, loadMatch]);

  const endMatch = useCallback(async (homeScore?: number, awayScore?: number) => {
    if (!matchId) return;
    
    try {
      const response = await LiveMatchService.endMatch(matchId, homeScore, awayScore);
      if (response.success) {
        await loadMatch(); // Refresh match data
      } else {
        setError(response.error || 'Failed to end match');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [matchId, loadMatch]);

  const pauseMatch = useCallback(async () => {
    if (!matchId) return;
    
    try {
      const response = await LiveMatchService.pauseMatch(matchId);
      if (response.success) {
        await loadMatch(); // Refresh match data
      } else {
        setError(response.error || 'Failed to pause match');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [matchId, loadMatch]);

  const resumeMatch = useCallback(async () => {
    if (!matchId) return;
    
    try {
      const response = await LiveMatchService.resumeMatch(matchId);
      if (response.success) {
        await loadMatch(); // Refresh match data
      } else {
        setError(response.error || 'Failed to resume match');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [matchId, loadMatch]);

  // Add match event
  const addEvent = useCallback(async (eventData: Omit<AddMatchEventData, 'matchId'>) => {
    if (!matchId) return;
    
    try {
      const fullEventData: AddMatchEventData = {
        ...eventData,
        matchId,
        timestamp: new Date()
      };
      
      const response = await LiveMatchService.addMatchEvent(fullEventData);
      if (response.success && response.event) {
        setEvents(prev => [...prev, response.event!]);
      } else {
        setError(response.error || 'Failed to add event');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [matchId]);

  const refresh = useCallback(() => {
    if (matchId) {
      loadMatch();
    }
  }, [matchId, loadMatch]);

  return {
    match,
    events,
    participants,
    loading,
    error,
    startMatch,
    endMatch,
    pauseMatch,
    resumeMatch,
    addEvent,
    refresh
  };
};

export const useLiveMatches = (options: UseLiveMatchesOptions = {}): UseLiveMatchesReturn => {
  const { status, clubId, tournamentId, limit, enableRealTime = false } = options;
  const realTime = useRealTimeContext();
  
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize LiveMatchService with real-time service
  useEffect(() => {
    if (enableRealTime && realTime.service) {
      LiveMatchService.setRealTimeService(realTime.service);
    }
  }, [enableRealTime, realTime.service]);

  // Load matches
  const loadMatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const filters: GetMatchesFilters = {};
      if (status) filters.status = status;
      if (clubId) filters.clubId = clubId;
      if (tournamentId) filters.tournamentId = tournamentId;
      if (limit) filters.limit = limit;

      const response = await LiveMatchService.getMatches(filters);
      if (response.success && response.matches) {
        setMatches(response.matches);
      } else {
        setError(response.error || 'Failed to load matches');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [status, clubId, tournamentId, limit]);

  // Load matches on mount and when filters change
  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!enableRealTime || !realTime.service) return;

    const unsubscribe = realTime.service.on('live-matches-updated', (event) => {
      setMatches(event.data.matches);
    });

    // Join live matches room
    realTime.service.joinRoom('live-matches');

    return () => {
      unsubscribe();
      realTime.service?.leaveRoom('live-matches');
    };
  }, [enableRealTime, realTime.service]);

  const refresh = useCallback(() => {
    loadMatches();
  }, [loadMatches]);

  return {
    matches,
    loading,
    error,
    refresh
  };
}; 