import { useEffect, useRef, useState, useCallback } from 'react';
import websocketService, { 
  MatchUpdate, 
  MatchEvent, 
  MatchState, 
  EventEntryFormData 
} from '@/lib/services/websocketService';

export interface UseWebSocketOptions {
  autoConnect?: boolean;
  matchId?: string;
  onMatchUpdate?: (update: MatchUpdate) => void;
  onMatchEvent?: (event: MatchEvent) => void;
  onMatchState?: (state: MatchState) => void;
  onConnectionChange?: (connected: boolean) => void;
}

export interface UseWebSocketReturn {
  isConnected: boolean;
  connectionStatus: 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED';
  connect: () => Promise<void>;
  disconnect: () => void;
  send: (type: string, payload: any) => void;
  subscribeToMatch: (matchId: string, handler: (update: MatchUpdate) => void) => () => void;
  subscribeToMatchEvents: (matchId: string, handler: (event: MatchEvent) => void) => () => void;
  subscribeToMatchState: (matchId: string, handler: (state: MatchState) => void) => () => void;
  joinMatch: (matchId: string, role?: string, teamId?: string, permissions?: string[]) => void;
  leaveMatch: (matchId: string) => void;
  joinTournament: (tournamentId: string) => void;
  submitMatchEvent: (eventData: EventEntryFormData) => void;
  startEventEntry: (matchId: string) => void;
  endEventEntry: (sessionId: string) => void;
  validateEventEntry: (eventData: EventEntryFormData) => void;
  controlMatchTimer: (matchId: string, action: 'start' | 'pause' | 'resume' | 'stop') => void;
  changeMatchStatus: (matchId: string, status: string, additionalData?: any) => void;
  sendChatMessage: (room: string, message: string, teamId?: string) => void;
  error: string | null;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    autoConnect = true,
    matchId,
    onMatchUpdate,
    onMatchEvent,
    onMatchState,
    onConnectionChange
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED'>('CLOSED');
  const [error, setError] = useState<string | null>(null);
  
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const matchUpdateHandlerRef = useRef<((update: MatchUpdate) => void) | null>(null);
  const matchEventHandlerRef = useRef<((event: MatchEvent) => void) | null>(null);
  const matchStateHandlerRef = useRef<((state: MatchState) => void) | null>(null);

  // Connection status handler
  const handleConnectionChange = useCallback((connected: boolean) => {
    setIsConnected(connected);
    setConnectionStatus(connected ? 'OPEN' : 'CLOSED');
    setError(null);
    
    if (onConnectionChange) {
      onConnectionChange(connected);
    }
  }, [onConnectionChange]);

  // Match update handler
  const handleMatchUpdate = useCallback((update: MatchUpdate) => {
    if (onMatchUpdate) {
      onMatchUpdate(update);
    }
  }, [onMatchUpdate]);

  // Match event handler
  const handleMatchEvent = useCallback((event: MatchEvent) => {
    if (onMatchEvent) {
      onMatchEvent(event);
    }
  }, [onMatchEvent]);

  // Match state handler
  const handleMatchState = useCallback((state: MatchState) => {
    if (onMatchState) {
      onMatchState(state);
    }
  }, [onMatchState]);

  // Connect to WebSocket
  const connect = useCallback(async () => {
    try {
      setError(null);
      setConnectionStatus('CONNECTING');
      
      await websocketService.connect();
      
      // Subscribe to connection changes
      const unsubscribeConnection = websocketService.onConnectionChange(handleConnectionChange);
      
      // Subscribe to match updates if matchId is provided
      if (matchId) {
        unsubscribeRef.current = websocketService.subscribeToMatch(matchId, handleMatchUpdate);
      }
      
      // Store connection status
      setConnectionStatus(websocketService.getConnectionStatus());
      setIsConnected(websocketService.isConnected());
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to WebSocket';
      setError(errorMessage);
      setConnectionStatus('CLOSED');
      setIsConnected(false);
      throw err;
    }
  }, [matchId, handleConnectionChange, handleMatchUpdate]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    
    websocketService.disconnect();
    setConnectionStatus('CLOSED');
    setIsConnected(false);
    setError(null);
  }, []);

  // Send message
  const send = useCallback((type: string, payload: any) => {
    if (!isConnected) {
      setError('WebSocket not connected');
      return;
    }
    
    try {
      // Handle different message types
      switch (type) {
        case 'join-match':
          websocketService.joinMatch(payload.matchId, payload.role, payload.teamId, payload.permissions);
          break;
        case 'leave-match':
          websocketService.leaveMatch(payload.matchId);
          break;
        case 'join-tournament':
          websocketService.joinTournament(payload.tournamentId);
          break;
        case 'submit-match-event':
          websocketService.submitMatchEvent(payload);
          break;
        case 'start-event-entry':
          websocketService.startEventEntry(payload.matchId);
          break;
        case 'end-event-entry':
          websocketService.endEventEntry(payload.sessionId);
          break;
        case 'validate-event-entry':
          websocketService.validateEventEntry(payload);
          break;
        case 'match-timer-control':
          websocketService.controlMatchTimer(payload.matchId, payload.action);
          break;
        case 'match-status-change':
          websocketService.changeMatchStatus(payload.matchId, payload.status, payload.additionalData);
          break;
        case 'chat-message':
          websocketService.sendChatMessage(payload.room, payload.message, payload.teamId);
          break;
        default:
          console.warn('Unknown message type:', type);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
    }
  }, [isConnected]);

  // Subscribe to match updates
  const subscribeToMatch = useCallback((matchId: string, handler: (update: MatchUpdate) => void) => {
    matchUpdateHandlerRef.current = handler;
    
    // Subscribe to match events and state updates
    const unsubscribeEvents = websocketService.subscribeToMatchEvents(matchId, (event) => {
      // Convert MatchEvent to MatchUpdate format
      const update: MatchUpdate = {
        type: 'EVENT_ADDED',
        matchId: event.matchId,
        data: event,
        timestamp: event.timestamp.toISOString(),
        userId: event.playerId || undefined
      };
      handler(update);
    });
    
    const unsubscribeState = websocketService.subscribeToMatchState(matchId, (state) => {
      // Convert MatchState to MatchUpdate format
      const update: MatchUpdate = {
        type: 'STATUS_CHANGE',
        matchId: state.matchId,
        data: state,
        timestamp: state.lastEventTime.toISOString()
      };
      handler(update);
    });
    
    // Return unsubscribe function that cleans up both subscriptions
    return () => {
      unsubscribeEvents();
      unsubscribeState();
    };
  }, []);

  // Subscribe to match events
  const subscribeToMatchEvents = useCallback((matchId: string, handler: (event: MatchEvent) => void) => {
    matchEventHandlerRef.current = handler;
    return websocketService.subscribeToMatchEvents(matchId, handler);
  }, []);

  // Subscribe to match state
  const subscribeToMatchState = useCallback((matchId: string, handler: (state: MatchState) => void) => {
    matchStateHandlerRef.current = handler;
    return websocketService.subscribeToMatchState(matchId, handler);
  }, []);

  // Join match room
  const joinMatch = useCallback((matchId: string, role: string = 'SPECTATOR', teamId?: string, permissions: string[] = []) => {
    websocketService.joinMatch(matchId, role, teamId, permissions);
  }, []);

  // Leave match room
  const leaveMatch = useCallback((matchId: string) => {
    websocketService.leaveMatch(matchId);
  }, []);

  // Join tournament room
  const joinTournament = useCallback((tournamentId: string) => {
    websocketService.joinTournament(tournamentId);
  }, []);

  // Submit match event
  const submitMatchEvent = useCallback((eventData: EventEntryFormData) => {
    websocketService.submitMatchEvent(eventData);
  }, []);

  // Start event entry session
  const startEventEntry = useCallback((matchId: string) => {
    websocketService.startEventEntry(matchId);
  }, []);

  // End event entry session
  const endEventEntry = useCallback((sessionId: string) => {
    websocketService.endEventEntry(sessionId);
  }, []);

  // Validate event entry
  const validateEventEntry = useCallback((eventData: EventEntryFormData) => {
    websocketService.validateEventEntry(eventData);
  }, []);

  // Control match timer
  const controlMatchTimer = useCallback((matchId: string, action: 'start' | 'pause' | 'resume' | 'stop') => {
    websocketService.controlMatchTimer(matchId, action);
  }, []);

  // Change match status
  const changeMatchStatus = useCallback((matchId: string, status: string, additionalData?: any) => {
    websocketService.changeMatchStatus(matchId, status, additionalData);
  }, []);

  // Send chat message
  const sendChatMessage = useCallback((room: string, message: string, teamId?: string) => {
    websocketService.sendChatMessage(room, message, teamId);
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect().catch(console.error);
    }
    
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Auto-join match room when matchId changes
  useEffect(() => {
    if (matchId && isConnected) {
      joinMatch(matchId);
      
      return () => {
        leaveMatch(matchId);
      };
    }
  }, [matchId, isConnected, joinMatch, leaveMatch]);

  return {
    isConnected,
    connectionStatus,
    connect,
    disconnect,
    send,
    subscribeToMatch,
    subscribeToMatchEvents,
    subscribeToMatchState,
    joinMatch,
    leaveMatch,
    joinTournament,
    submitMatchEvent,
    startEventEntry,
    endEventEntry,
    validateEventEntry,
    controlMatchTimer,
    changeMatchStatus,
    sendChatMessage,
    error
  };
}
