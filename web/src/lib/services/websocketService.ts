import { io, Socket } from 'socket.io-client';
import { useEnhancedAuthContext } from '@/contexts/EnhancedAuthContext';

export interface MatchUpdate {
  type: 'MATCH_START' | 'MATCH_PAUSE' | 'MATCH_RESUME' | 'MATCH_END' | 'SCORE_UPDATE' | 'EVENT_ADDED' | 'STATUS_CHANGE';
  matchId: string;
  data: any;
  timestamp: string;
  userId?: string;
}

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: string;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

export interface MatchEvent {
  id: string;
  matchId: string;
  type: 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'substitution' | 'injury' | 'other' | 'corner' | 'foul' | 'shot' | 'save' | 'offside' | 'throw_in' | 'free_kick' | 'penalty' | 'penalty_missed' | 'own_goal' | 'injury_time' | 'period_start' | 'period_end';
  minute: number;
  description: string | null;
  playerId: string | null;
  teamId: string;
  data?: any;
  timestamp: Date;
  secondaryPlayerId?: string | null;
  location?: 'left_wing' | 'center' | 'right_wing' | 'penalty_area' | 'outside_box';
  severity?: 'minor' | 'major' | 'serious';
  cardType?: 'warning' | 'caution' | 'dismissal';
  substitutionType?: 'in' | 'out' | 'tactical' | 'injury' | 'red_card';
  goalType?: 'open_play' | 'penalty' | 'free_kick' | 'corner' | 'own_goal' | 'counter_attack';
  shotType?: 'header' | 'volley' | 'long_range' | 'close_range' | 'one_on_one';
  saveType?: 'catch' | 'punch' | 'deflection' | 'dive' | 'reflex';
}

export interface MatchState {
  matchId: string;
  status: string;
  currentMinute: number;
  homeScore: number;
  awayScore: number;
  events: MatchEvent[];
  lastEventTime: Date;
  isTimerRunning: boolean;
  currentPeriod: 'first_half' | 'halftime' | 'second_half' | 'extra_time' | 'penalties';
  injuryTime: number;
  matchStartTime?: Date;
  totalPlayTime: number;
  pausedTime: number;
  lastPauseTime?: Date;
  periodStartTime?: Date;
  periodDuration: number;
}

export interface EventEntryFormData {
  matchId: string;
  eventType: MatchEvent['type'];
  minute: number;
  teamId: string;
  playerId?: string;
  secondaryPlayerId?: string;
  description?: string;
  location?: MatchEvent['location'];
  severity?: MatchEvent['severity'];
  cardType?: MatchEvent['cardType'];
  substitutionType?: MatchEvent['substitutionType'];
  goalType?: MatchEvent['goalType'];
  shotType?: MatchEvent['shotType'];
  saveType?: MatchEvent['saveType'];
  additionalData?: Record<string, any>;
}

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts: number;
  private reconnectInterval: number;
  private heartbeatInterval: number;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private messageHandlers: Map<string, ((data: any) => void)[]> = new Map();
  private connectionHandlers: ((connected: boolean) => void)[] = [];
  private matchStateHandlers: Map<string, ((state: MatchState) => void)[]> = new Map();
  private matchEventHandlers: Map<string, ((event: MatchEvent) => void)[]> = new Map();
  private isConnecting = false;
  private shouldReconnect = true;
  private config: WebSocketConfig;

  constructor(config: WebSocketConfig) {
    this.config = config;
    this.maxReconnectAttempts = config.maxReconnectAttempts || 5;
    this.reconnectInterval = config.reconnectInterval || 3000;
    this.heartbeatInterval = config.heartbeatInterval || 30000;
  }

  // Connect to Socket.IO server
  async connect(token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket && this.socket.connected) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }

      this.isConnecting = true;

      try {
        // Get token from auth context if not provided
        const authToken = token || this.getAuthToken();
        
        if (!authToken) {
          reject(new Error('Authentication token required'));
          return;
        }

        this.socket = io(this.config.url, {
          auth: {
            token: authToken
          },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectInterval,
          timeout: 20000
        });

        this.socket.on('connect', () => {
          console.log('Socket.IO connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.notifyConnectionChange(true);
          this.setupEventListeners();
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          console.log('Socket.IO disconnected:', reason);
          this.isConnecting = false;
          this.stopHeartbeat();
          this.notifyConnectionChange(false);
          
          if (reason === 'io server disconnect') {
            // Server disconnected us, try to reconnect
            this.socket?.connect();
          }
        });

        this.socket.on('connect_error', (error) => {
          console.error('Socket.IO connection error:', error);
          this.isConnecting = false;
          this.reconnectAttempts++;
          
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            reject(new Error(`Failed to connect after ${this.maxReconnectAttempts} attempts`));
          }
        });

        this.socket.on('reconnect', (attemptNumber) => {
          console.log(`Reconnected to Socket.IO server after ${attemptNumber} attempts`);
          this.reconnectAttempts = 0;
        });

        this.socket.on('reconnect_error', (error) => {
          console.error('Socket.IO reconnection error:', error);
        });

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Match events
    this.socket.on('match-event', (data: MatchEvent) => {
      const handlers = this.matchEventHandlers.get(data.matchId);
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(data);
          } catch (error) {
            console.error('Error in match event handler:', error);
          }
        });
      }
    });

    // Match state updates
    this.socket.on('match-state', (data: MatchState) => {
      const handlers = this.matchStateHandlers.get(data.matchId);
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(data);
          } catch (error) {
            console.error('Error in match state handler:', error);
          }
        });
      }
    });

    // Match status changes
    this.socket.on('match-status-change', (data: any) => {
      this.notifyMessageHandlers('match-status-change', data);
    });

    // Match timer updates
    this.socket.on('match-timer-update', (data: any) => {
      this.notifyMessageHandlers('match-timer-update', data);
    });

    // Event entry responses
    this.socket.on('event-entry-started', (data: any) => {
      this.notifyMessageHandlers('event-entry-started', data);
    });

    this.socket.on('event-entry-ended', (data: any) => {
      this.notifyMessageHandlers('event-entry-ended', data);
    });

    this.socket.on('event-entry-submitted', (data: any) => {
      this.notifyMessageHandlers('event-entry-submitted', data);
    });

    this.socket.on('event-entry-validation', (data: any) => {
      this.notifyMessageHandlers('event-entry-validation', data);
    });

    // Chat messages
    this.socket.on('chat-message', (data: any) => {
      this.notifyMessageHandlers('chat-message', data);
    });

    // Notifications
    this.socket.on('notification', (data: any) => {
      this.notifyMessageHandlers('notification', data);
    });

    // Generic event handler
    this.socket.onAny((eventName: string, data: any) => {
      this.notifyMessageHandlers(eventName, data);
    });
  }

  // Disconnect from Socket.IO server
  disconnect(): void {
    this.shouldReconnect = false;
    this.stopHeartbeat();
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.notifyConnectionChange(false);
  }

  // Join match room for real-time updates
  joinMatch(matchId: string, role: string = 'SPECTATOR', teamId?: string, permissions: string[] = []): void {
    if (!this.socket || !this.socket.connected) {
      console.warn('Socket not connected, cannot join match');
      return;
    }

    this.socket.emit('join-match', { matchId, role, teamId, permissions });
  }

  // Leave match room
  leaveMatch(matchId: string): void {
    if (!this.socket || !this.socket.connected) {
      return;
    }

    this.socket.emit('leave-match', matchId);
  }

  // Join tournament room
  joinTournament(tournamentId: string): void {
    if (!this.socket || !this.socket.connected) {
      return;
    }

    this.socket.emit('join-tournament', tournamentId);
  }

  // Submit match event
  submitMatchEvent(eventData: EventEntryFormData): void {
    if (!this.socket || !this.socket.connected) {
      console.warn('Socket not connected, cannot submit event');
      return;
    }

    this.socket.emit('submit-event-entry', eventData);
  }

  // Start event entry session
  startEventEntry(matchId: string): void {
    if (!this.socket || !this.socket.connected) {
      return;
    }

    this.socket.emit('start-event-entry', { matchId });
  }

  // End event entry session
  endEventEntry(sessionId: string): void {
    if (!this.socket || !this.socket.connected) {
      return;
    }

    this.socket.emit('end-event-entry', { sessionId });
  }

  // Validate event entry
  validateEventEntry(eventData: EventEntryFormData): void {
    if (!this.socket || !this.socket.connected) {
      return;
    }

    this.socket.emit('validate-event-entry', eventData);
  }

  // Control match timer
  controlMatchTimer(matchId: string, action: 'start' | 'pause' | 'resume' | 'stop'): void {
    if (!this.socket || !this.socket.connected) {
      return;
    }

    this.socket.emit('match-timer-control', {
      matchId,
      action,
      timestamp: new Date()
    });
  }

  // Change match status
  changeMatchStatus(matchId: string, status: string, additionalData?: any): void {
    if (!this.socket || !this.socket.connected) {
      return;
    }

    this.socket.emit('match-status-change', {
      matchId,
      status,
      timestamp: new Date(),
      additionalData
    });
  }

  // Send chat message
  sendChatMessage(room: string, message: string, teamId?: string): void {
    if (!this.socket || !this.socket.connected) {
      return;
    }

    this.socket.emit('chat-message', {
      room,
      message,
      teamId,
      timestamp: new Date()
    });
  }

  // Subscribe to match events
  subscribeToMatchEvents(matchId: string, handler: (event: MatchEvent) => void): () => void {
    if (!this.matchEventHandlers.has(matchId)) {
      this.matchEventHandlers.set(matchId, []);
    }
    
    this.matchEventHandlers.get(matchId)!.push(handler);
    
    // Return unsubscribe function
    return () => {
      const handlers = this.matchEventHandlers.get(matchId);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  // Subscribe to match state updates
  subscribeToMatchState(matchId: string, handler: (state: MatchState) => void): () => void {
    if (!this.matchStateHandlers.has(matchId)) {
      this.matchStateHandlers.set(matchId, []);
    }
    
    this.matchStateHandlers.get(matchId)!.push(handler);
    
    // Return unsubscribe function
    return () => {
      const handlers = this.matchStateHandlers.get(matchId);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  // Subscribe to specific message types
  onMessage(type: string, handler: (data: any) => void): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    
    this.messageHandlers.get(type)!.push(handler);
    
    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(type);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  // Subscribe to connection changes
  onConnectionChange(handler: (connected: boolean) => void): () => void {
    this.connectionHandlers.push(handler);
    
    // Return unsubscribe function
    return () => {
      const index = this.connectionHandlers.indexOf(handler);
      if (index > -1) {
        this.connectionHandlers.splice(index, 1);
      }
    };
  }

  // Get connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getConnectionStatus(): 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED' {
    if (!this.socket) return 'CLOSED';
    if (this.socket.connected) return 'OPEN';
    if (this.isConnecting) return 'CONNECTING';
    return 'CLOSED';
  }

  // Private helper methods
  private getAuthToken(): string | null {
    // Try to get token from localStorage or other storage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    }
    return null;
  }

  private notifyMessageHandlers(type: string, data: any): void {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in message handler for ${type}:`, error);
        }
      });
    }
  }

  private notifyConnectionChange(connected: boolean): void {
    this.connectionHandlers.forEach(handler => {
      try {
        handler(connected);
      } catch (error) {
        console.error('Error in connection change handler:', error);
      }
    });
  }

  private startHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
    
    this.heartbeatTimer = setInterval(() => {
      if (this.socket && this.socket.connected) {
        this.socket.emit('ping');
      }
    }, this.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    setTimeout(() => {
      if (this.shouldReconnect) {
        this.connect();
      }
    }, this.reconnectInterval);
  }
}

// Create singleton instance
const websocketService = new WebSocketService({
  url: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3001',
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
  heartbeatInterval: 30000
});

export default websocketService;
