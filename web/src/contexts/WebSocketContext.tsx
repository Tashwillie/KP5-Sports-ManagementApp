import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import websocketService, { 
  MatchEvent, 
  MatchState, 
  EventEntryFormData 
} from '@/lib/services/websocketService';

interface WebSocketContextType {
  isConnected: boolean;
  connectionStatus: 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED';
  connect: () => Promise<void>;
  disconnect: () => void;
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
  subscribeToMatchEvents: (matchId: string, handler: (event: MatchEvent) => void) => () => void;
  subscribeToMatchState: (matchId: string, handler: (state: MatchState) => void) => () => void;
  error: string | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED'>('CLOSED');
  const [error, setError] = useState<string | null>(null);

  // Connect to WebSocket when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.token) {
      connect();
    } else {
      disconnect();
    }
  }, [isAuthenticated, user?.token]);

  // Connect to WebSocket server
  const connect = async () => {
    try {
      setError(null);
      setConnectionStatus('CONNECTING');
      
      await websocketService.connect(user?.token);
      
      // Subscribe to connection changes
      websocketService.onConnectionChange((connected) => {
        setIsConnected(connected);
        setConnectionStatus(connected ? 'OPEN' : 'CLOSED');
        setError(null);
      });
      
      setConnectionStatus(websocketService.getConnectionStatus());
      setIsConnected(websocketService.isConnected());
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to WebSocket';
      setError(errorMessage);
      setConnectionStatus('CLOSED');
      setIsConnected(false);
    }
  };

  // Disconnect from WebSocket server
  const disconnect = () => {
    websocketService.disconnect();
    setConnectionStatus('CLOSED');
    setIsConnected(false);
    setError(null);
  };

  // Join match room
  const joinMatch = (matchId: string, role: string = 'SPECTATOR', teamId?: string, permissions: string[] = []) => {
    websocketService.joinMatch(matchId, role, teamId, permissions);
  };

  // Leave match room
  const leaveMatch = (matchId: string) => {
    websocketService.leaveMatch(matchId);
  };

  // Join tournament room
  const joinTournament = (tournamentId: string) => {
    websocketService.joinTournament(tournamentId);
  };

  // Submit match event
  const submitMatchEvent = (eventData: EventEntryFormData) => {
    websocketService.submitMatchEvent(eventData);
  };

  // Start event entry session
  const startEventEntry = (matchId: string) => {
    websocketService.startEventEntry(matchId);
  };

  // End event entry session
  const endEventEntry = (sessionId: string) => {
    websocketService.endEventEntry(sessionId);
  };

  // Validate event entry
  const validateEventEntry = (eventData: EventEntryFormData) => {
    websocketService.validateEventEntry(eventData);
  };

  // Control match timer
  const controlMatchTimer = (matchId: string, action: 'start' | 'pause' | 'resume' | 'stop') => {
    websocketService.controlMatchTimer(matchId, action);
  };

  // Change match status
  const changeMatchStatus = (matchId: string, status: string, additionalData?: any) => {
    websocketService.changeMatchStatus(matchId, status, additionalData);
  };

  // Send chat message
  const sendChatMessage = (room: string, message: string, teamId?: string) => {
    websocketService.sendChatMessage(room, message, teamId);
  };

  // Subscribe to match events
  const subscribeToMatchEvents = (matchId: string, handler: (event: MatchEvent) => void) => {
    return websocketService.subscribeToMatchEvents(matchId, handler);
  };

  // Subscribe to match state
  const subscribeToMatchState = (matchId: string, handler: (state: MatchState) => void) => {
    return websocketService.subscribeToMatchState(matchId, handler);
  };

  const value: WebSocketContextType = {
    isConnected,
    connectionStatus,
    connect,
    disconnect,
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
    subscribeToMatchEvents,
    subscribeToMatchState,
    error
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
}
