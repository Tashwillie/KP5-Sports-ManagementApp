import { io, Socket } from 'socket.io-client';
import { RealTimeEvent } from '../types';

export interface RealTimeConfig {
  url: string;
  token: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export interface RealTimeCallback {
  (event: RealTimeEvent): void;
}

export interface MatchState {
  matchId: string;
  status: string;
  currentMinute: number;
  homeScore: number;
  awayScore: number;
  events: any[];
  lastEventTime: Date;
  isTimerRunning: boolean;
  currentPeriod: 'first_half' | 'halftime' | 'second_half' | 'extra_time' | 'penalties';
  injuryTime: number;
}

export class RealTimeService {
  private socket: Socket | null = null;
  private config: RealTimeConfig;
  private reconnectAttempts = 0;
  private maxReconnectAttempts: number;
  private reconnectInterval: number;
  private eventCallbacks: Map<string, RealTimeCallback[]> = new Map();
  private roomCallbacks: Map<string, RealTimeCallback[]> = new Map();
  private matchStateCallbacks: Map<string, ((state: MatchState) => void)[]> = new Map();

  constructor(config: RealTimeConfig) {
    this.config = config;
    this.maxReconnectAttempts = config.maxReconnectAttempts || 5;
    this.reconnectInterval = config.reconnectInterval || 5000;
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(this.config.url, {
          auth: {
            token: this.config.token
          },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectInterval,
          timeout: 20000
        });

        this.socket.on('connect', () => {
          console.log('Connected to WebSocket server');
          this.reconnectAttempts = 0;
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          console.log('Disconnected from WebSocket server:', reason);
          if (reason === 'io server disconnect') {
            // Server disconnected us, try to reconnect
            this.socket?.connect();
          }
        });

        this.socket.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error);
          this.reconnectAttempts++;
          
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            reject(new Error(`Failed to connect after ${this.maxReconnectAttempts} attempts`));
          }
        });

        this.socket.on('reconnect', (attemptNumber) => {
          console.log(`Reconnected to WebSocket server after ${attemptNumber} attempts`);
          this.reconnectAttempts = 0;
        });

        this.socket.on('reconnect_error', (error) => {
          console.error('WebSocket reconnection error:', error);
        });

        // Set up event listeners
        this.setupEventListeners();

      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
        reject(error);
      }
    });
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Generic event listener
    this.socket.onAny((eventName: string, data: any) => {
      const callbacks = this.eventCallbacks.get(eventName);
      if (callbacks) {
        const realTimeEvent: RealTimeEvent = {
          type: eventName,
          data,
          timestamp: new Date(data.timestamp || Date.now()),
          userId: data.userId,
          room: data.room
        };
        
        callbacks.forEach(callback => {
          try {
            callback(realTimeEvent);
          } catch (error) {
            console.error(`Error in event callback for ${eventName}:`, error);
          }
        });
      }
    });

    // Specific event listeners for common events
    const commonEvents = [
      'match-event',
      'match-status-change',
      'match-state',
      'match-state-update',
      'match-timer-update',
      'timer-update',
      'period-transition',
      'chat-message', 
      'notification',
      'user-status-change',
      'team-update',
      'tournament-update',
      'event-reminder'
    ];

    commonEvents.forEach(eventName => {
      this.socket!.on(eventName, (data: any) => {
        const callbacks = this.eventCallbacks.get(eventName);
        if (callbacks) {
          const realTimeEvent: RealTimeEvent = {
            type: eventName,
            data,
            timestamp: new Date(data.timestamp || Date.now()),
            userId: data.userId,
            room: data.room
          };
          
          callbacks.forEach(callback => {
            try {
              callback(realTimeEvent);
            } catch (error) {
              console.error(`Error in ${eventName} callback:`, error);
            }
          });
        }
      });
    });

    // Special handling for match state events
    this.socket.on('match-state', (data: MatchState) => {
      const callbacks = this.matchStateCallbacks.get(data.matchId);
      if (callbacks) {
        callbacks.forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error(`Error in match state callback for match ${data.matchId}:`, error);
          }
        });
      }
    });

    this.socket.on('match-state-update', (data: MatchState) => {
      const callbacks = this.matchStateCallbacks.get(data.matchId);
      if (callbacks) {
        callbacks.forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error(`Error in match state update callback for match ${data.matchId}:`, error);
          }
        });
      }
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.eventCallbacks.clear();
    this.roomCallbacks.clear();
    this.matchStateCallbacks.clear();
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Event subscription methods
  public on(eventName: string, callback: RealTimeCallback): () => void {
    if (!this.eventCallbacks.has(eventName)) {
      this.eventCallbacks.set(eventName, []);
    }
    this.eventCallbacks.get(eventName)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.eventCallbacks.get(eventName);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
        if (callbacks.length === 0) {
          this.eventCallbacks.delete(eventName);
        }
      }
    };
  }

  public off(eventName: string, callback: RealTimeCallback): void {
    const callbacks = this.eventCallbacks.get(eventName);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
      if (callbacks.length === 0) {
        this.eventCallbacks.delete(eventName);
      }
    }
  }

  // Match state subscription methods
  public onMatchState(matchId: string, callback: (state: MatchState) => void): () => void {
    if (!this.matchStateCallbacks.has(matchId)) {
      this.matchStateCallbacks.set(matchId, []);
    }
    this.matchStateCallbacks.get(matchId)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.matchStateCallbacks.get(matchId);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
        if (callbacks.length === 0) {
          this.matchStateCallbacks.delete(matchId);
        }
      }
    };
  }

  // Room management methods
  public joinRoom(room: string): void {
    if (this.socket && this.isConnected()) {
      this.socket.emit('join-room', room);
      console.log(`Joined room: ${room}`);
    }
  }

  public leaveRoom(room: string): void {
    if (this.socket && this.isConnected()) {
      this.socket.emit('leave-room', room);
      console.log(`Left room: ${room}`);
    }
  }

  // Match-specific room management
  public joinMatch(matchId: string): void {
    if (this.socket && this.isConnected()) {
      this.socket.emit('join-match', { matchId });
      console.log(`Joined match room: ${matchId}`);
    }
  }

  public leaveMatch(matchId: string): void {
    if (this.socket && this.isConnected()) {
      this.socket.emit('leave-match', matchId);
      console.log(`Left match room: ${matchId}`);
    }
  }

  public joinTournament(tournamentId: string): void {
    if (this.socket && this.isConnected()) {
      this.socket.emit('join-tournament', tournamentId);
      console.log(`Joined tournament room: ${tournamentId}`);
    }
  }

  // Emit methods for sending events
  public emit(eventName: string, data: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit(eventName, {
        data,
        timestamp: new Date()
      });
    }
  }

  // Specific emit methods for common events
  public emitMatchEvent(matchId: string, eventData: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('match-event', {
        matchId,
        ...eventData,
        timestamp: new Date()
      });
    }
  }

  public emitMatchStatusChange(matchId: string, status: string, additionalData?: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('match-status-change', {
        matchId,
        status,
        additionalData,
        timestamp: new Date()
      });
    }
  }

  public emitMatchTimerControl(matchId: string, action: 'start' | 'pause' | 'resume' | 'stop' | 'add_injury_time' | 'end_injury_time' | 'set_period_duration' | 'skip_to_period', additionalData?: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('match-timer-control', {
        matchId,
        action,
        additionalData,
        timestamp: new Date()
      });
    }
  }

  public emitChatMessage(roomId: string, message: string, metadata?: any): void {
    this.emit('chat-message', {
      roomId,
      message,
      ...metadata
    });
  }

  public emitNotification(targetUserId: string, notification: any): void {
    this.emit('notification', {
      targetUserId,
      ...notification
    });
  }

  // Utility methods
  public getSocketId(): string | undefined {
    return this.socket?.id;
  }

  public getConnectionState(): string {
    if (!this.socket) return 'disconnected';
    return this.socket.connected ? 'connected' : 'connecting';
  }

  // Match event helpers
  public emitGoal(matchId: string, playerId: string, teamId: string, minute: number, description?: string): void {
    this.emitMatchEvent(matchId, {
      type: 'goal',
      playerId,
      teamId,
      minute,
      description
    });
  }

  public emitCard(matchId: string, playerId: string, teamId: string, cardType: 'yellow_card' | 'red_card', minute: number, reason?: string): void {
    this.emitMatchEvent(matchId, {
      type: cardType,
      playerId,
      teamId,
      minute,
      description: reason
    });
  }

  public emitSubstitution(matchId: string, playerOutId: string, playerInId: string, teamId: string, minute: number): void {
    this.emitMatchEvent(matchId, {
      type: 'substitution',
      playerId: playerInId,
      teamId,
      minute,
      data: { playerOutId, playerInId }
    });
  }

  public emitInjury(matchId: string, playerId: string, teamId: string, minute: number, injuryType?: string): void {
    this.emitMatchEvent(matchId, {
      type: 'injury',
      playerId,
      teamId,
      minute,
      data: { injuryType }
    });
  }
}
