import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { logger } from '../utils/logger';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import statisticsService from './statisticsService';

export interface RealTimeEvent {
  type: string;
  data: any;
  timestamp: Date;
  userId?: string;
  room?: string;
}

export interface AuthenticatedSocket {
  userId: string;
  userRole: string;
  userEmail: string;
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
  // Enhanced event data
  secondaryPlayerId?: string | null; // For assists, substitutions, etc.
  location?: 'left_wing' | 'center' | 'right_wing' | 'penalty_area' | 'outside_box';
  severity?: 'minor' | 'major' | 'serious'; // For injuries, cards
  cardType?: 'warning' | 'caution' | 'dismissal'; // For cards
  substitutionType?: 'in' | 'out' | 'tactical' | 'injury' | 'red_card';
  goalType?: 'open_play' | 'penalty' | 'free_kick' | 'corner' | 'own_goal' | 'counter_attack';
  shotType?: 'header' | 'volley' | 'long_range' | 'close_range' | 'one_on_one';
  saveType?: 'catch' | 'punch' | 'deflection' | 'dive' | 'reflex';
}

// Event entry form data interface
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

// Event validation result
export interface EventValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions?: string[];
}

// Event entry session for tracking multiple events
export interface EventEntrySession {
  id: string;
  matchId: string;
  userId: string;
  userRole: string;
  startTime: Date;
  lastActivity: Date;
  eventsEntered: number;
  isActive: boolean;
  currentEvent?: Partial<EventEntryFormData>;
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
  // Enhanced timer properties
  matchStartTime?: Date;
  totalPlayTime: number; // Total time played in milliseconds
  pausedTime: number; // Total time paused in milliseconds
  lastPauseTime?: Date;
  periodStartTime?: Date; // When current period started
  periodDuration: number; // Duration of current period in minutes
  injuryTimeStart: Date | null; // When injury time started
  injuryTimeDuration: number; // Duration of injury time in minutes
  extraTimeStart: Date | null; // When extra time started
  extraTimeDuration: number; // Duration of extra time in minutes
  penaltiesStart: Date | null; // When penalties started
  penaltiesDuration: number; // Duration of penalties in minutes
}

export interface TournamentStandings {
  tournamentId: string;
  teamId: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface MatchRoom {
  matchId: string;
  roomName: string;
  participants: Map<string, RoomParticipant>;
  spectators: Map<string, RoomParticipant>;
  referees: Map<string, RoomParticipant>;
  coaches: Map<string, RoomParticipant>;
  admins: Map<string, RoomParticipant>;
  matchState: MatchState | null;
  isActive: boolean;
  createdAt: Date;
  lastActivity: Date;
  settings: RoomSettings;
  metadata: RoomMetadata;
}

export interface RoomParticipant {
  userId: string;
  socketId: string;
  userRole: string;
  userEmail: string;
  displayName: string;
  teamId?: string;
  joinedAt: Date;
  lastActivity: Date;
  permissions: string[];
  isTyping: boolean;
  isOnline: boolean;
}

export interface RoomSettings {
  allowChat: boolean;
  allowSpectators: boolean;
  maxSpectators: number;
  requireApproval: boolean;
  autoKickInactive: boolean;
  inactivityTimeout: number; // minutes
  enableTypingIndicators: boolean;
  enableReadReceipts: boolean;
}

export interface RoomMetadata {
  matchTitle: string;
  homeTeamName: string;
  awayTeamName: string;
  tournamentName?: string;
  location?: string;
  startTime?: Date;
  expectedDuration: number; // minutes
  weather?: string;
  pitchCondition?: string;
}

export interface RoomAnalytics {
  totalParticipants: number;
  activeParticipants: number;
  messagesSent: number;
  eventsRecorded: number;
  averageResponseTime: number;
  peakConcurrency: number;
  roomUptime: number; // minutes
}

export class WebSocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, AuthenticatedSocket> = new Map();
  private matchRooms: Map<string, MatchRoom> = new Map(); // matchId -> MatchRoom
  private tournamentRooms: Map<string, Set<string>> = new Map(); // tournamentId -> Set of socketIds
  private leagueRooms: Map<string, Set<string>> = new Map(); // leagueId -> Set of socketIds
  private matchStates: Map<string, MatchState> = new Map(); // matchId -> MatchState
  private roomAnalytics: Map<string, RoomAnalytics> = new Map(); // roomName -> RoomAnalytics
  private roomCleanupInterval!: NodeJS.Timeout;
  
  // Enhanced timer management
  private matchTimers: Map<string, NodeJS.Timeout> = new Map(); // matchId -> Timer interval
  private timerUpdateInterval!: NodeJS.Timeout; // Global timer update interval
  private readonly TIMER_UPDATE_FREQUENCY = 1000; // 1 second

  // Event entry session management
  private eventEntrySessions: Map<string, EventEntrySession> = new Map(); // sessionId -> EventEntrySession
  private matchEventSessions: Map<string, Set<string>> = new Map(); // matchId -> Set of sessionIds

  // Event entry methods
  private async startEventEntrySession(matchId: string, userId: string, userRole: string): Promise<EventEntrySession> {
    const sessionId = `event_session_${matchId}_${userId}_${Date.now()}`;
    const session: EventEntrySession = {
      id: sessionId,
      matchId,
      userId,
      userRole,
      startTime: new Date(),
      lastActivity: new Date(),
      eventsEntered: 0,
      isActive: true
    };

    this.eventEntrySessions.set(sessionId, session);
    
    if (!this.matchEventSessions.has(matchId)) {
      this.matchEventSessions.set(matchId, new Set());
    }
    this.matchEventSessions.get(matchId)!.add(sessionId);

    logger.info(`Started event entry session ${sessionId} for match ${matchId} by user ${userId}`);
    return session;
  }

  private async endEventEntrySession(sessionId: string): Promise<void> {
    const session = this.eventEntrySessions.get(sessionId);
    if (session) {
      session.isActive = false;
      session.lastActivity = new Date();
      
      // Remove from match sessions
      const matchSessions = this.matchEventSessions.get(session.matchId);
      if (matchSessions) {
        matchSessions.delete(sessionId);
      }

      logger.info(`Ended event entry session ${sessionId} with ${session.eventsEntered} events`);
    }
  }

  private async updateEventEntrySession(sessionId: string, eventData?: Partial<EventEntryFormData>): Promise<void> {
    const session = this.eventEntrySessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date();
      if (eventData) {
        session.currentEvent = eventData;
      }
    }
  }

  private validateEventEntry(eventData: EventEntryFormData): EventValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Basic validation
    if (!eventData.matchId || !eventData.eventType || !eventData.teamId) {
      errors.push('Missing required fields: matchId, eventType, teamId');
    }

    if (eventData.minute < 0 || eventData.minute > 120) {
      errors.push('Invalid minute value. Must be between 0 and 120');
    }

    // Event-specific validation
    switch (eventData.eventType) {
      case 'goal':
        if (!eventData.playerId) {
          errors.push('Player ID is required for goals');
        }
        if (!eventData.goalType) {
          warnings.push('Goal type not specified');
        }
        break;

      case 'assist':
        if (!eventData.playerId || !eventData.secondaryPlayerId) {
          errors.push('Both player and secondary player IDs are required for assists');
        }
        break;

      case 'substitution':
        if (!eventData.playerId || !eventData.secondaryPlayerId) {
          errors.push('Both incoming and outgoing player IDs are required for substitutions');
        }
        break;

      case 'yellow_card':
      case 'red_card':
        if (!eventData.playerId) {
          errors.push('Player ID is required for cards');
        }
        if (!eventData.cardType) {
          warnings.push('Card type not specified');
        }
        break;

      case 'injury':
        if (!eventData.playerId) {
          errors.push('Player ID is required for injuries');
        }
        if (!eventData.severity) {
          warnings.push('Injury severity not specified');
        }
        break;
    }

    // Business logic validation
    const matchState = this.matchStates.get(eventData.matchId);
    if (matchState) {
      if (eventData.minute > matchState.currentMinute + 5) {
        warnings.push('Event minute is significantly ahead of current match time');
      }
      
      if (eventData.minute < matchState.currentMinute - 10) {
        warnings.push('Event minute is significantly behind current match time');
      }
    }

    // Suggestions based on context
    if (eventData.eventType === 'goal' && !eventData.location) {
      suggestions.push('Consider adding goal location for better statistics');
    }

    if (eventData.eventType === 'shot' && !eventData.shotType) {
      suggestions.push('Consider adding shot type for better analysis');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  private async processEventEntry(eventData: EventEntryFormData, userId: string): Promise<MatchEvent | null> {
    try {
      // Validate event data
      const validation = this.validateEventEntry(eventData);
      if (!validation.isValid) {
        logger.warn(`Event validation failed: ${validation.errors.join(', ')}`);
        return null;
      }

      // Create enhanced event object
      const event: MatchEvent = {
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        matchId: eventData.matchId,
        type: eventData.eventType,
        minute: eventData.minute,
        description: eventData.description || null,
        playerId: eventData.playerId || null,
        teamId: eventData.teamId,
        timestamp: new Date(),
        secondaryPlayerId: eventData.secondaryPlayerId || null,
        location: eventData.location || undefined,
        severity: eventData.severity,
        cardType: eventData.cardType,
        substitutionType: eventData.substitutionType,
        goalType: eventData.goalType,
        shotType: eventData.shotType,
        saveType: eventData.saveType,
        data: eventData.additionalData || {}
      };

      // Save to database
      const savedEvent = await this.saveMatchEvent(event, userId);
      if (!savedEvent) {
        logger.error('Failed to save event to database');
        return null;
      }

      // Update match state
      await this.updateMatchState(eventData.matchId, savedEvent);

      // Update session statistics
      const sessionId = Array.from(this.eventEntrySessions.values())
        .find(s => s.matchId === eventData.matchId && s.userId === userId && s.isActive)?.id;
      
      if (sessionId) {
        const session = this.eventEntrySessions.get(sessionId);
        if (session) {
          session.eventsEntered++;
          session.lastActivity = new Date();
        }
      }

      logger.info(`Successfully processed event: ${eventData.eventType} at minute ${eventData.minute}`);
      return savedEvent;

    } catch (error) {
      logger.error('Error processing event entry:', error);
      return null;
    }
  }

  private async getEventEntrySuggestions(matchId: string, eventType: string): Promise<string[]> {
    const suggestions: string[] = [];
    const matchState = this.matchStates.get(matchId);

    if (!matchState) return suggestions;

    switch (eventType) {
      case 'goal':
        if (matchState.currentMinute > 80) {
          suggestions.push('Late goal - consider adding context about pressure situation');
        }
        break;

      case 'substitution':
        if (matchState.currentMinute > 70) {
          suggestions.push('Late substitution - consider tactical context');
        }
        break;

      case 'injury':
        suggestions.push('Consider adding injury time if significant');
        break;

      case 'yellow_card':
        if (matchState.currentMinute < 20) {
          suggestions.push('Early card - consider adding context about aggressive play');
        }
        break;
    }

    return suggestions;
  }

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env['FRONTEND_URL'] || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    this.startRoomCleanup();
    this.startGlobalTimerUpdates();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket: any, next: (err?: Error) => void) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env['JWT_SECRET'] as string) as any;
        socket.data.user = {
          userId: decoded.userId,
          userRole: decoded.role,
          userEmail: decoded.email
        };

        next();
      } catch (error) {
        logger.error('WebSocket authentication error:', error);
        next(new Error('Invalid authentication token'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: any) => {
      const user = socket.data.user as AuthenticatedSocket;
      this.connectedUsers.set(socket.id, user);

      logger.info(`User ${user.userEmail} connected with socket ID: ${socket.id}`);

      // Join user to their personal room
      socket.join(`user:${user.userId}`);

      // Join user to role-based rooms
      socket.join(`role:${user.userRole}`);

      // Handle user joining specific rooms (teams, clubs, etc.)
      socket.on('join-room', (room: string) => {
        socket.join(room);
        logger.info(`User ${user.userEmail} joined room: ${room}`);
      });

      // Handle user leaving specific rooms
      socket.on('leave-room', (room: string) => {
        socket.leave(room);
        logger.info(`User ${user.userEmail} left room: ${room}`);
      });

      // Handle joining match room for real-time updates
      socket.on('join-match', async (data: { matchId: string; role?: string; teamId?: string; permissions?: string[] }) => {
        const { matchId, role = 'SPECTATOR', teamId, permissions = [] } = data;
        await this.handleJoinMatch(socket, matchId, role, teamId, permissions);
      });

      // Handle leaving match room
      socket.on('leave-match', async (matchId: string) => {
        await this.handleLeaveMatch(socket, matchId);
      });

      // Handle match room settings update
      socket.on('update-room-settings', async (data: { matchId: string; settings: Partial<RoomSettings> }) => {
        await this.handleUpdateRoomSettings(socket, data.matchId, data.settings);
      });

      // Handle match room participant management
      socket.on('manage-participant', async (data: { matchId: string; action: 'kick' | 'mute' | 'promote' | 'demote'; targetUserId: string; reason?: string }) => {
        await this.handleParticipantManagement(socket, data);
      });

      // Handle joining tournament room
      socket.on('join-tournament', async (tournamentId: string) => {
        const room = `tournament:${tournamentId}`;
        socket.join(room);
        
        if (!this.tournamentRooms.has(tournamentId)) {
          this.tournamentRooms.set(tournamentId, new Set());
        }
        this.tournamentRooms.get(tournamentId)!.add(socket.id);
        
        logger.info(`User ${user.userEmail} joined tournament room: ${room}`);
        
        // Send current tournament standings
        await this.sendTournamentStandings(socket, tournamentId);
      });

      // Handle live match events
      socket.on('match-event', async (data: MatchEvent) => {
        try {
          const room = `match:${data.matchId}`;
          
          // Validate user permissions for match events
          if (await this.canUserModifyMatch(user.userId, user.userRole, data.matchId)) {
            // Create and save the event to database
            const savedEvent = await this.saveMatchEvent(data, user.userId);
            
            if (savedEvent) {
              // Update local match state
              await this.updateMatchState(data.matchId, savedEvent);
              
              // Update room analytics
              this.updateRoomAnalytics(data.matchId, 'eventsRecorded');
              
              // Broadcast event to all users in the match room
              const broadcastData = {
                ...savedEvent,
                timestamp: new Date(),
                userId: user.userId,
                userRole: user.userRole,
                userEmail: user.userEmail
              };
              
              this.io.to(room).emit('match-event', broadcastData);
              
              // Update match statistics in real-time
              await this.updateMatchStats(savedEvent);
              
              // Broadcast to tournament/league rooms if applicable
              await this.broadcastToTournament(data.matchId, 'match-event', broadcastData);
              
              // Send updated match state to all users in the room
              await this.broadcastMatchState(data.matchId);
              
              logger.info(`Match event broadcasted to room ${room}:`, data.type);
            } else {
              socket.emit('error', { message: 'Failed to save match event' });
            }
          } else {
            logger.warn(`User ${user.userEmail} attempted to modify match ${data.matchId} without permission`);
            socket.emit('error', { message: 'Insufficient permissions to modify match' });
          }
        } catch (error) {
          logger.error('Error handling match event:', error);
          socket.emit('error', { message: 'Internal server error' });
        }
      });

      // Handle event entry session management
      socket.on('start-event-entry', async (data: { matchId: string }) => {
        try {
          if (await this.canUserModifyMatch(user.userId, user.userRole, data.matchId)) {
            const session = await this.startEventEntrySession(data.matchId, user.userId, user.userRole);
            socket.emit('event-entry-started', { sessionId: session.id, matchId: data.matchId });
            logger.info(`Event entry session started for user ${user.userEmail} in match ${data.matchId}`);
          } else {
            socket.emit('error', { message: 'Insufficient permissions to enter events' });
          }
        } catch (error) {
          logger.error('Error starting event entry session:', error);
          socket.emit('error', { message: 'Failed to start event entry session' });
        }
      });

      socket.on('end-event-entry', async (data: { sessionId: string }) => {
        try {
          await this.endEventEntrySession(data.sessionId);
          socket.emit('event-entry-ended', { sessionId: data.sessionId });
          logger.info(`Event entry session ended: ${data.sessionId}`);
        } catch (error) {
          logger.error('Error ending event entry session:', error);
          socket.emit('error', { message: 'Failed to end event entry session' });
        }
      });

      // Handle enhanced event entry with validation
      socket.on('submit-event-entry', async (data: EventEntryFormData) => {
        try {
          if (await this.canUserModifyMatch(user.userId, user.userRole, data.matchId)) {
            // Process the event entry
            const processedEvent = await this.processEventEntry(data, user.userId);
            
            if (processedEvent) {
              // Broadcast the event to match room
              const room = `match:${data.matchId}`;
              const broadcastData = {
                ...processedEvent,
                timestamp: new Date(),
                userId: user.userId,
                userRole: user.userRole,
                userEmail: user.userEmail
              };
              
              this.io.to(room).emit('match-event', broadcastData);
              
              // Update match statistics
              await this.updateMatchStats(processedEvent);
              
              // Broadcast to tournament/league rooms
              await this.broadcastToTournament(data.matchId, 'match-event', broadcastData);
              
              // Send updated match state
              await this.broadcastMatchState(data.matchId);
              
              // Confirm event submission
              socket.emit('event-entry-submitted', {
                success: true,
                eventId: processedEvent.id,
                message: 'Event successfully recorded'
              });
              
              logger.info(`Event entry submitted successfully: ${data.eventType} at minute ${data.minute}`);
            } else {
              socket.emit('event-entry-submitted', {
                success: false,
                message: 'Failed to process event entry'
              });
            }
          } else {
            socket.emit('error', { message: 'Insufficient permissions to enter events' });
          }
        } catch (error) {
          logger.error('Error submitting event entry:', error);
          socket.emit('event-entry-submitted', {
            success: false,
            message: 'Internal server error'
          });
        }
      });

      // Handle event entry validation requests
      socket.on('validate-event-entry', async (data: EventEntryFormData) => {
        try {
          const validation = this.validateEventEntry(data);
          const suggestions = await this.getEventEntrySuggestions(data.matchId, data.eventType);
          
          socket.emit('event-entry-validation', {
            ...validation,
            suggestions: [...(validation.suggestions || []), ...suggestions]
          });
        } catch (error) {
          logger.error('Error validating event entry:', error);
          socket.emit('error', { message: 'Failed to validate event entry' });
        }
      });

      // Handle event entry suggestions request
      socket.on('get-event-suggestions', async (data: { matchId: string; eventType: string }) => {
        try {
          const suggestions = await this.getEventEntrySuggestions(data.matchId, data.eventType);
          socket.emit('event-suggestions', { suggestions });
        } catch (error) {
          logger.error('Error getting event suggestions:', error);
          socket.emit('error', { message: 'Failed to get event suggestions' });
        }
      });

      // Handle event entry session status request
      socket.on('get-event-entry-status', async (data: { matchId: string }) => {
        try {
          const session = Array.from(this.eventEntrySessions.values())
            .find(s => s.matchId === data.matchId && s.userId === user.userId && s.isActive);
          
          if (session) {
            socket.emit('event-entry-status', {
              sessionId: session.id,
              isActive: session.isActive,
              eventsEntered: session.eventsEntered,
              startTime: session.startTime,
              lastActivity: session.lastActivity
            });
          } else {
            socket.emit('event-entry-status', { isActive: false });
          }
        } catch (error) {
          logger.error('Error getting event entry status:', error);
          socket.emit('error', { message: 'Failed to get event entry status' });
        }
      });

      // Handle match status changes
      socket.on('match-status-change', async (data: { matchId: string; status: string; timestamp: Date; additionalData?: any }) => {
        try {
          const room = `match:${data.matchId}`;
          
          if (await this.canUserModifyMatch(user.userId, user.userRole, data.matchId)) {
            // Update match status in database
            const updatedMatch = await this.updateMatchStatus(data.matchId, data.status, data.additionalData);
            
            if (updatedMatch) {
              const broadcastData = {
                ...data,
                userId: user.userId,
                userRole: user.userRole,
                userEmail: user.userEmail,
                match: updatedMatch
              };
              
              this.io.to(room).emit('match-status-change', broadcastData);
              
              // If match is completed, trigger final statistics update
              if (data.status === 'completed') {
                await this.handleMatchCompletion(data.matchId);
              }
              
              // Send updated match state
              await this.broadcastMatchState(data.matchId);
              
              logger.info(`Match status change broadcasted to room ${room}: ${data.status}`);
            } else {
              socket.emit('error', { message: 'Failed to update match status' });
            }
          } else {
            socket.emit('error', { message: 'Insufficient permissions to modify match' });
          }
        } catch (error) {
          logger.error('Error handling match status change:', error);
          socket.emit('error', { message: 'Internal server error' });
        }
      });

      // Handle match timer control
      socket.on('match-timer-control', async (data: { matchId: string; action: 'start' | 'pause' | 'resume' | 'stop'; timestamp: Date }) => {
        try {
          const room = `match:${data.matchId}`;
          
          if (await this.canUserModifyMatch(user.userId, user.userRole, data.matchId)) {
            // Update match timer state
            await this.updateMatchTimer(data.matchId, data.action);
            
            const broadcastData = {
              ...data,
              userId: user.userId,
              userRole: user.userRole,
              userEmail: user.userEmail
            };
            
            this.io.to(room).emit('match-timer-update', broadcastData);
            
            // Send updated match state
            await this.broadcastMatchState(data.matchId);
            
            logger.info(`Match timer control broadcasted to room ${room}: ${data.action}`);
          } else {
            socket.emit('error', { message: 'Insufficient permissions to control match timer' });
          }
        } catch (error) {
          logger.error('Error handling match timer control:', error);
          socket.emit('error', { message: 'Internal server error' });
        }
      });

      // Handle chat messages
      socket.on('chat-message', (data: any) => {
        const room = data.room || `team:${data.teamId}`;
        
        // Check if user is allowed to send messages in this room
        if (this.canUserSendMessage(user.userId, room)) {
          this.io.to(room).emit('chat-message', {
            ...data,
            timestamp: new Date(),
            userId: user.userId,
            userEmail: user.userEmail
          });
          
          // Update room analytics
          this.updateRoomAnalytics(room, 'messagesSent');
          
          logger.info(`Chat message broadcasted to room ${room}`);
        } else {
          socket.emit('error', { message: 'You are not allowed to send messages in this room' });
        }
      });

      // Handle user typing indicators
      socket.on('typing-start', (data: any) => {
        const room = data.room || `team:${data.teamId}`;
        
        if (this.canUserSendMessage(user.userId, room)) {
          // Update participant typing status
          this.updateParticipantTyping(data.matchId, user.userId, true);
          
          socket.to(room).emit('typing-start', {
            userId: user.userId,
            userEmail: user.userEmail
          });
        }
      });

      socket.on('typing-stop', (data: any) => {
        const room = data.room || `team:${data.teamId}`;
        
        if (this.canUserSendMessage(user.userId, room)) {
          // Update participant typing status
          this.updateParticipantTyping(data.matchId, user.userId, false);
          
          socket.to(room).emit('typing-stop', {
            userId: user.userId,
            userEmail: user.userEmail
          });
        }
      });

      // Handle room analytics request
      socket.on('get-room-analytics', (matchId: string) => {
        const analytics = this.getRoomAnalytics(matchId);
        socket.emit('room-analytics', analytics);
      });

      // Handle room participants request
      socket.on('get-room-participants', (matchId: string) => {
        const participants = this.getRoomParticipants(matchId);
        socket.emit('room-participants', participants);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.handleDisconnection(socket);
      });
    });
  }

  // Check if user can modify match (referee, admin, or assigned coach)
  private async canUserModifyMatch(userId: string, userRole: string, matchId: string): Promise<boolean> {
    try {
      // Super admins and club admins can modify any match
      if (userRole === 'SUPER_ADMIN' || userRole === 'CLUB_ADMIN') {
        return true;
      }
      
      // Check if user is a participant in this match
      const participant = await prisma.matchParticipant.findFirst({
        where: {
          matchId,
          userId,
          // Normalize roles to strings used in DB
          role: { in: ['REFEREE', 'COACH', 'ADMIN'] as any }
        }
      });
      
      if (participant) {
        return true;
      }
      
      // Check if user is a coach of one of the teams in the match
      if (userRole === 'COACH') {
        const match = await prisma.match.findFirst({
          where: { id: matchId },
          include: { homeTeam: true, awayTeam: true }
        });
        
        if (match) {
          const teamMember = await prisma.teamMember.findFirst({
            where: {
              userId,
              teamId: { in: [match.homeTeamId, match.awayTeamId].filter(Boolean) as string[] },
              role: 'COACH'
            }
          });
          
          if (teamMember) {
            return true;
          }
        }
      }
      
      return false;
    } catch (error) {
      logger.error('Error checking user permissions for match:', error);
      return false;
    }
  }

  // Save match event to database
  private async saveMatchEvent(eventData: MatchEvent, userId: string): Promise<any> {
    try {
      const event = await prisma.matchEvent.create({
        data: {
          matchId: eventData.matchId,
          type: eventData.type.toUpperCase() as any,
          minute: eventData.minute,
          description: (eventData.description ?? null) as any,
          playerId: (eventData.playerId ?? null) as any,
          teamId: eventData.teamId,
          data: eventData.data
        }
      });
      
      return event;
    } catch (error) {
      logger.error('Error saving match event:', error);
      return null;
    }
  }

  // Update match status in database
  private async updateMatchStatus(matchId: string, status: string, additionalData?: any): Promise<any> {
    try {
      const updateData: any = { status: status.toUpperCase() };
      
      if (status === 'completed' && additionalData) {
        if (additionalData.homeScore !== undefined) updateData.homeScore = additionalData.homeScore;
        if (additionalData.awayScore !== undefined) updateData.awayScore = additionalData.awayScore;
        updateData.endTime = new Date();
      } else if (status === 'in_progress') {
        updateData.startTime = new Date();
      }
      
      const match = await prisma.match.update({
        where: { id: matchId },
        data: updateData,
        include: {
          homeTeam: { select: { id: true, name: true, logo: true } },
          awayTeam: { select: { id: true, name: true, logo: true } }
        }
      });
      
      return match;
    } catch (error) {
      logger.error('Error updating match status:', error);
      return null;
    }
  }

  // Update match timer state
  private async updateMatchTimer(matchId: string, action: string, additionalData?: any): Promise<void> {
    try {
      const matchState = this.matchStates.get(matchId);
      if (!matchState) return;

      const now = new Date();
      
      switch (action) {
        case 'start':
          matchState.isTimerRunning = true;
          matchState.currentPeriod = 'first_half';
          matchState.matchStartTime = now;
          matchState.periodStartTime = now;
          matchState.periodDuration = 45; // Standard half duration
          matchState.totalPlayTime = 0;
          matchState.pausedTime = 0;
          matchState.currentMinute = 0;
          
          // Start individual match timer
          this.startMatchTimer(matchId);
          break;
          
        case 'pause':
          matchState.isTimerRunning = false;
          matchState.lastPauseTime = now;
          
          // Stop individual match timer
          this.stopMatchTimer(matchId);
          break;
          
        case 'resume':
          matchState.isTimerRunning = true;
          if (matchState.lastPauseTime) {
            const pauseDuration = now.getTime() - matchState.lastPauseTime.getTime();
            matchState.pausedTime += pauseDuration;
            matchState.periodStartTime = new Date(now.getTime() + pauseDuration);
          }
          
          // Resume individual match timer
          this.startMatchTimer(matchId);
          break;
          
        case 'stop':
          matchState.isTimerRunning = false;
          matchState.currentPeriod = 'second_half'; // Changed from 'completed' to valid period
          matchState.currentMinute = 0;
          
          // Stop individual match timer
          this.stopMatchTimer(matchId);
          break;
          
        case 'add_injury_time':
          const injuryMinutes = additionalData?.minutes || 1;
          matchState.injuryTime += injuryMinutes;
          matchState.injuryTimeStart = now;
          matchState.injuryTimeDuration = injuryMinutes;
          break;
          
        case 'end_injury_time':
          matchState.injuryTime = 0;
          matchState.injuryTimeStart = undefined;
          matchState.injuryTimeDuration = 0;
          break;
          
        case 'set_period_duration':
          const duration = additionalData?.duration || 45;
          matchState.periodDuration = duration;
          break;
          
        case 'skip_to_period':
          const targetPeriod = additionalData?.period;
          if (targetPeriod && targetPeriod !== matchState.currentPeriod) {
            this.transitionToPeriod(matchId, targetPeriod, `Skipped to ${targetPeriod}`);
          }
          break;
      }
      
      matchState.lastEventTime = now;
      this.matchStates.set(matchId, matchState);
      
      // Broadcast timer update
      this.broadcastTimerUpdate(matchId, matchState);
      
    } catch (error) {
      logger.error('Error updating match timer:', error);
    }
  }

  // Send current match state to a specific socket
  private async sendMatchState(socket: any, matchId: string) {
    try {
      let matchState = this.matchStates.get(matchId);
      
      if (!matchState) {
        // Fetch match state from database if not in memory
        const match = await prisma.match.findFirst({
          where: { id: matchId },
          include: {
            events: { orderBy: { createdAt: 'asc' } },
            homeTeam: { select: { id: true, name: true } },
            awayTeam: { select: { id: true, name: true } }
          }
        });
        
        if (match) {
          matchState = {
            matchId,
            status: match.status.toLowerCase(),
            currentMinute: 0,
            homeScore: match.homeScore || 0,
            awayScore: match.awayScore || 0,
            events: match.events.map(e => ({
              id: e.id,
              matchId: e.matchId,
              type: e.type.toLowerCase() as any,
              minute: e.minute || 0,
              description: e.description,
              playerId: e.playerId,
              teamId: e.teamId || '',
              data: e.data,
              timestamp: e.createdAt
            })),
            lastEventTime: match.events.length > 0 ? match.events[match.events.length - 1].createdAt : new Date(),
            isTimerRunning: match.status === 'IN_PROGRESS',
            currentPeriod: 'first_half',
            injuryTime: 0,
            // Initialize enhanced timer properties
            matchStartTime: match.startTime,
            totalPlayTime: 0,
            pausedTime: 0,
            periodStartTime: match.startTime,
            periodDuration: 90, // Default to 90 minutes for a full match
            injuryTimeStart: undefined,
            injuryTimeDuration: 0,
            extraTimeStart: undefined,
            extraTimeDuration: 0,
            penaltiesStart: undefined,
            penaltiesDuration: 0
          };
          
          this.matchStates.set(matchId, matchState);
        }
      }
      
      if (matchState) {
        socket.emit('match-state', matchState);
      }
    } catch (error) {
      logger.error(`Error sending match state for match ${matchId}:`, error);
    }
  }

  // Update match state in memory
  private async updateMatchState(matchId: string, event: any): Promise<void> {
    try {
      let matchState = this.matchStates.get(matchId);
      
      if (!matchState) {
        matchState = {
          matchId,
          status: 'in_progress',
          currentMinute: event.minute || 0,
          homeScore: 0,
          awayScore: 0,
          events: [],
          lastEventTime: new Date(),
          isTimerRunning: true,
          currentPeriod: 'first_half',
          injuryTime: 0,
          // Initialize enhanced timer properties
          matchStartTime: undefined,
          totalPlayTime: 0,
          pausedTime: 0,
          periodStartTime: undefined,
          periodDuration: 0,
          injuryTimeStart: undefined,
          injuryTimeDuration: 0,
          extraTimeStart: undefined,
          extraTimeDuration: 0,
          penaltiesStart: undefined,
          penaltiesDuration: 0
        };
      }
      
      // Update scores based on event type
      if (event.type === 'goal') {
        const match = await prisma.match.findFirst({
          where: { id: matchId },
          include: { homeTeam: true, awayTeam: true }
        });
        
        if (match) {
          if (event.teamId === match.homeTeamId) {
            matchState.homeScore++;
          } else if (event.teamId === match.awayTeamId) {
            matchState.awayScore++;
          }
        }
      }
      
      // Add event to state
      matchState.events.push(event);
      matchState.currentMinute = Math.max(matchState.currentMinute, event.minute || 0);
      matchState.lastEventTime = new Date();
      
      this.matchStates.set(matchId, matchState);
    } catch (error) {
      logger.error('Error updating match state:', error);
    }
  }

  // Broadcast updated match state to all users in the match room
  private async broadcastMatchState(matchId: string): Promise<void> {
    try {
      const matchState = this.matchStates.get(matchId);
      if (matchState) {
        const room = `match:${matchId}`;
        this.io.to(room).emit('match-state-update', matchState);
      }
    } catch (error) {
      logger.error('Error broadcasting match state:', error);
    }
  }

  // Join tournament room for a match
  private async joinTournamentRoom(socket: any, matchId: string): Promise<void> {
    try {
      const match = await prisma.match.findFirst({
        where: { id: matchId },
        include: { tournamentMatches: { include: { tournament: true } } }
      });
      
      if (match?.tournamentMatches?.[0]?.tournament) {
        const tournamentId = match.tournamentMatches[0].tournament.id;
        const room = `tournament:${tournamentId}`;
        
        socket.join(room);
        
        if (!this.tournamentRooms.has(tournamentId)) {
          this.tournamentRooms.set(tournamentId, new Set());
        }
        this.tournamentRooms.get(tournamentId)!.add(socket.id);
        
        logger.info(`User joined tournament room: ${room} via match ${matchId}`);
      }
    } catch (error) {
      logger.error('Error joining tournament room:', error);
    }
  }

  // Send tournament standings to a socket
  private async sendTournamentStandings(socket: any, tournamentId: string): Promise<void> {
    try {
      // This would fetch and send current tournament standings
      // For now, just log the intention
      logger.info(`Sending tournament standings for tournament ${tournamentId}`);
    } catch (error) {
      logger.error('Error sending tournament standings:', error);
    }
  }

  // Update match statistics
  private async updateMatchStats(event: any): Promise<void> {
    try {
      // Update player stats if applicable
      if (event.playerId && ['GOAL', 'ASSIST', 'YELLOW_CARD', 'RED_CARD', 'SHOT', 'PASS', 'TACKLE', 'INTERCEPTION', 'CLEARANCE', 'SAVE', 'FOUL', 'FOUL_SUFFERED', 'OFFSIDE', 'DISTANCE', 'SPRINT'].includes(event.type)) {
        await statisticsService.updatePlayerStats(event.playerId, event.matchId, event.type, {
          ...event,
          teamId: event.teamId,
          season: event.season || '2024'
        });
      }
      
      // Update team stats if applicable
      if (event.teamId && ['GOAL', 'ASSIST', 'SHOT', 'CORNER', 'FOUL', 'YELLOW_CARD', 'RED_CARD', 'PASS', 'TACKLE', 'INTERCEPTION', 'OFFSIDE', 'SAVE', 'CLEARANCE', 'BLOCK', 'DISTANCE', 'SPRINT'].includes(event.type)) {
        await statisticsService.updateTeamStats(event.teamId, event.matchId, event.type, {
          ...event,
          season: event.season || '2024'
        });
      }

      // Update match statistics
      await statisticsService.updateMatchStats(event.matchId, event.type, event);
      
      logger.info(`Updated match statistics for event: ${event.type}`);
    } catch (error) {
      logger.error(`Error updating match statistics:`, error);
    }
  }

  // Update player statistics (deprecated - now handled by statistics service)
  private async updatePlayerStats(playerId: string, eventType: string): Promise<void> {
    try {
      // This method is now deprecated - use statistics service instead
      logger.warn('updatePlayerStats is deprecated, use statisticsService.updatePlayerStats instead');
    } catch (error) {
      logger.error('Error updating player stats:', error);
    }
  }

  // Update team statistics (deprecated - now handled by statistics service)
  private async updateTeamStats(teamId: string, matchId: string): Promise<void> {
    try {
      // This method is now deprecated - use statistics service instead
      logger.warn('updateTeamStats is deprecated, use statisticsService.updateTeamStats instead');
    } catch (error) {
      logger.error('Error updating team stats:', error);
    }
  }

  // Handle match completion
  private async handleMatchCompletion(matchId: string): Promise<void> {
    try {
      // Calculate final statistics, update standings, etc.
      logger.info(`Handling match completion for match ${matchId}`);
      
      // Broadcast final results to tournament/league rooms
      await this.broadcastToTournament(matchId, 'match-completed', { matchId });
      
      // Update tournament standings if applicable
      await this.updateTournamentStandings(matchId);
    } catch (error) {
      logger.error(`Error handling match completion:`, error);
    }
  }

  // Update tournament standings
  private async updateTournamentStandings(matchId: string): Promise<void> {
    try {
      const match = await prisma.match.findFirst({
        where: { id: matchId },
        include: { tournamentMatches: { include: { tournament: true } } }
      });
      
      if (match?.tournamentMatches?.[0]?.tournament) {
        const tournamentId = match.tournamentMatches[0].tournament.id;
        logger.info(`Tournament standings update needed for tournament ${tournamentId} after match ${matchId}`);
        
        // This would implement the actual standings calculation logic
        // For now, just broadcast that standings need updating
        this.broadcastToRoom(`tournament:${tournamentId}`, 'standings-update-needed', { tournamentId });
      }
    } catch (error) {
      logger.error('Error updating tournament standings:', error);
    }
  }

  // Broadcast to tournament/league rooms
  private async broadcastToTournament(matchId: string, event: string, data: any): Promise<void> {
    try {
      const match = await prisma.match.findFirst({
        where: { id: matchId },
        include: { tournamentMatches: { include: { tournament: true } } }
      });
      
      if (match?.tournamentMatches?.[0]?.tournament) {
        const tournamentId = match.tournamentMatches[0].tournament.id;
        const room = `tournament:${tournamentId}`;
        
        this.io.to(room).emit(event, {
          ...data,
          tournamentId,
          timestamp: new Date()
        });
        
        logger.info(`Broadcasted ${event} to tournament room ${room} for match ${matchId}`);
      }
    } catch (error) {
      logger.error(`Error broadcasting to tournament:`, error);
    }
  }

  // Public methods for broadcasting
  public broadcastToRoom(room: string, event: string, data: any) {
    this.io.to(room).emit(event, {
      ...data,
      timestamp: new Date()
    });
    logger.info(`Broadcasted ${event} to room ${room}`);
  }

  public broadcastToUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, {
      ...data,
      timestamp: new Date()
    });
    logger.info(`Broadcasted ${event} to user ${userId}`);
  }

  public broadcastToRole(role: string, event: string, data: any) {
    this.io.to(`role:${role}`).emit(event, {
      ...data,
      timestamp: new Date()
    });
    logger.info(`Broadcasted ${event} to role ${role}`);
  }

  public broadcastToAll(event: string, data: any) {
    this.io.emit(event, {
      ...data,
      timestamp: new Date()
    });
    logger.info(`Broadcasted ${event} to all users`);
  }

  // Get connected users info
  public getConnectedUsers(): Map<string, AuthenticatedSocket> {
    return new Map(this.connectedUsers);
  }

  public getUserCount(): number {
    return this.connectedUsers.size;
  }

  public getRoomInfo(room: string) {
    const sockets = this.io.sockets.adapter.rooms.get(room);
    return {
      room,
      userCount: sockets ? sockets.size : 0,
      users: sockets ? Array.from(sockets).map(socketId => {
        const user = this.connectedUsers.get(socketId);
        return user ? { userId: user.userId, role: user.userRole, email: user.userEmail } : null;
      }).filter(Boolean) : []
    };
  }

  // Get match room information
  public getMatchRoomInfo(matchId: string) {
    const room = `match:${matchId}`;
    return this.getRoomInfo(room);
  }

  // Get all match rooms
  public getMatchRooms() {
    const matchRoomsInfo = new Map();
    for (const [matchId, matchRoom] of this.matchRooms.entries()) {
      const totalParticipants = 
        matchRoom.participants.size + 
        matchRoom.spectators.size + 
        matchRoom.referees.size + 
        matchRoom.coaches.size + 
        matchRoom.admins.size;
      
      matchRoomsInfo.set(matchId, {
        userCount: totalParticipants,
        room: `match:${matchId}`
      });
    }
    return matchRoomsInfo;
  }

  // Get match state
  public getMatchState(matchId: string): MatchState | undefined {
    return this.matchStates.get(matchId);
  }

  // Get all match states
  public getAllMatchStates(): Map<string, MatchState> {
    return new Map(this.matchStates);
  }

  // Force refresh match state from database
  public async refreshMatchState(matchId: string): Promise<void> {
    try {
      const match = await prisma.match.findFirst({
        where: { id: matchId },
        include: {
          events: { orderBy: { createdAt: 'asc' } },
          homeTeam: { select: { id: true, name: true } },
          awayTeam: { select: { id: true, name: true } }
        }
      });
      
      if (match) {
        const matchState: MatchState = {
          matchId,
          status: match.status.toLowerCase(),
          currentMinute: 0,
          homeScore: match.homeScore || 0,
          awayScore: match.awayScore || 0,
          events: match.events.map(e => ({
            id: e.id,
            matchId: e.matchId,
            type: e.type.toLowerCase() as any,
            minute: e.minute || 0,
            description: e.description,
            playerId: e.playerId,
            teamId: e.teamId || '',
            data: e.data,
            timestamp: e.createdAt
          })),
          lastEventTime: match.events.length > 0 ? match.events[match.events.length - 1].createdAt : new Date(),
          isTimerRunning: match.status === 'IN_PROGRESS',
          currentPeriod: 'first_half',
          injuryTime: 0,
          // Initialize enhanced timer properties
          matchStartTime: match.startTime,
          totalPlayTime: 0,
          pausedTime: 0,
          periodStartTime: match.startTime,
          periodDuration: 90, // Default to 90 minutes for a full match
          injuryTimeStart: undefined,
          injuryTimeDuration: 0,
          extraTimeStart: undefined,
          extraTimeDuration: 0,
          penaltiesStart: undefined,
          penaltiesDuration: 0
        };
        
        this.matchStates.set(matchId, matchState);
        
        // Broadcast updated state to all users in the match room
        await this.broadcastMatchState(matchId);
      }
    } catch (error) {
      logger.error(`Error refreshing match state for match ${matchId}:`, error);
    }
  }

  // Handle user joining match room
  private async handleJoinMatch(socket: any, matchId: string, role: string, teamId?: string, permissions: string[] = []) {
    try {
      const user = socket.data.user as AuthenticatedSocket;
      const room = `match:${matchId}`;
      
      // Join the socket to the room
      socket.join(room);
      
      // Get or create match room
      let matchRoom = this.matchRooms.get(matchId);
      if (!matchRoom) {
        matchRoom = await this.createMatchRoom(matchId);
        this.matchRooms.set(matchId, matchRoom);
      }
      
      // Add participant to room
      const participant: RoomParticipant = {
        userId: user.userId,
        socketId: socket.id,
        userRole: user.userRole,
        userEmail: user.userEmail,
        displayName: `${user.userEmail.split('@')[0]}`,
        teamId,
        joinedAt: new Date(),
        lastActivity: new Date(),
        permissions,
        isTyping: false,
        isOnline: true
      };
      
      // Add to appropriate participant category
      switch (role.toUpperCase()) {
        case 'REFEREE':
          matchRoom.referees.set(user.userId, participant);
          break;
        case 'COACH':
          matchRoom.coaches.set(user.userId, participant);
          break;
        case 'ADMIN':
          matchRoom.admins.set(user.userId, participant);
          break;
        case 'SPECTATOR':
          // Check if room allows spectators
          if (matchRoom.settings.allowSpectators) {
            const currentSpectators = matchRoom.spectators.size;
            if (currentSpectators < matchRoom.settings.maxSpectators) {
              matchRoom.spectators.set(user.userId, participant);
            } else {
              socket.emit('error', { message: 'Room is at maximum spectator capacity' });
              return;
            }
          } else {
            socket.emit('error', { message: 'Spectators are not allowed in this room' });
            return;
          }
          break;
        default:
          matchRoom.participants.set(user.userId, participant);
      }
      
      // Update room analytics
      this.updateRoomAnalytics(matchId, 'totalParticipants');
      
      // Send current match state to the user
      await this.sendMatchState(socket, matchId);
      
      // Send room information
      socket.emit('room-joined', {
        matchId,
        roomName: room,
        role,
        permissions,
        roomSettings: matchRoom.settings,
        roomMetadata: matchRoom.metadata
      });
      
      // Broadcast participant joined to room
      this.io.to(room).emit('participant-joined', {
        userId: user.userId,
        userEmail: user.userEmail,
        userRole: user.userRole,
        role,
        teamId,
        timestamp: new Date()
      });
      
      // Join tournament room if match is part of a tournament
      await this.joinTournamentRoom(socket, matchId);
      
      logger.info(`User ${user.userEmail} joined match room: ${room} as ${role}`);
      
    } catch (error) {
      logger.error('Error handling join match:', error);
      socket.emit('error', { message: 'Failed to join match room' });
    }
  }

  // Handle user leaving match room
  private async handleLeaveMatch(socket: any, matchId: string) {
    try {
      const user = socket.data.user as AuthenticatedSocket;
      const room = `match:${matchId}`;
      
      // Leave the socket from the room
      socket.leave(room);
      
      // Get match room
      const matchRoom = this.matchRooms.get(matchId);
      if (!matchRoom) {
        return;
      }
      
      // Remove participant from all categories
      matchRoom.referees.delete(user.userId);
      matchRoom.coaches.delete(user.userId);
      matchRoom.admins.delete(user.userId);
      matchRoom.spectators.delete(user.userId);
      matchRoom.participants.delete(user.userId);
      
      // Update room analytics
      this.updateRoomAnalytics(matchId, 'totalParticipants');
      
      // Broadcast participant left to room
      this.io.to(room).emit('participant-left', {
        userId: user.userId,
        userEmail: user.userEmail,
        userRole: user.userRole,
        timestamp: new Date()
      });
      
      // Clean up empty room
      if (this.shouldCleanupRoom(matchRoom)) {
        this.cleanupMatchRoom(matchId);
      }
      
      logger.info(`User ${user.userEmail} left match room: ${room}`);
      
    } catch (error) {
      logger.error('Error handling leave match:', error);
    }
  }

  // Create a new match room
  private async createMatchRoom(matchId: string): Promise<MatchRoom> {
    try {
      // Fetch match information from database
      const match = await prisma.match.findFirst({
        where: { id: matchId },
        include: {
          homeTeam: { select: { name: true } },
          awayTeam: { select: { name: true } },
          tournamentMatches: { include: { tournament: { select: { name: true } } } }
        }
      });
      
      if (!match) {
        throw new Error(`Match ${matchId} not found`);
      }
      
      const room: MatchRoom = {
        matchId,
        roomName: `match:${matchId}`,
        participants: new Map(),
        spectators: new Map(),
        referees: new Map(),
        coaches: new Map(),
        admins: new Map(),
        matchState: null,
        isActive: true,
        createdAt: new Date(),
        lastActivity: new Date(),
        settings: {
          allowChat: true,
          allowSpectators: true,
          maxSpectators: 100,
          requireApproval: false,
          autoKickInactive: true,
          inactivityTimeout: 30,
          enableTypingIndicators: true,
          enableReadReceipts: false
        },
        metadata: {
          matchTitle: match.title || 'Match',
          homeTeamName: match.homeTeam?.name || 'Home Team',
          awayTeamName: match.awayTeam?.name || 'Away Team',
          tournamentName: match.tournamentMatches?.[0]?.tournament?.name,
          location: match.location,
          startTime: match.startTime,
          expectedDuration: 90,
          weather: 'Unknown',
          pitchCondition: 'Unknown'
        }
      };
      
      // Initialize room analytics
      this.roomAnalytics.set(room.roomName, {
        totalParticipants: 0,
        activeParticipants: 0,
        messagesSent: 0,
        eventsRecorded: 0,
        averageResponseTime: 0,
        peakConcurrency: 0,
        roomUptime: 0
      });
      
      return room;
      
    } catch (error) {
      logger.error('Error creating match room:', error);
      throw error;
    }
  }

  // Handle room settings update
  private async handleUpdateRoomSettings(socket: any, matchId: string, settings: Partial<RoomSettings>) {
    try {
      const user = socket.data.user as AuthenticatedSocket;
      const matchRoom = this.matchRooms.get(matchId);
      
      if (!matchRoom) {
        socket.emit('error', { message: 'Match room not found' });
        return;
      }
      
      // Check if user has admin permissions
      if (!this.hasAdminPermissions(user.userId, matchRoom)) {
        socket.emit('error', { message: 'Insufficient permissions to update room settings' });
        return;
      }
      
      // Update settings
      Object.assign(matchRoom.settings, settings);
      matchRoom.lastActivity = new Date();
      
      // Broadcast settings update to room
      this.io.to(matchRoom.roomName).emit('room-settings-updated', {
        settings: matchRoom.settings,
        updatedBy: user.userId,
        timestamp: new Date()
      });
      
      logger.info(`Room settings updated for match ${matchId} by ${user.userEmail}`);
      
    } catch (error) {
      logger.error('Error updating room settings:', error);
      socket.emit('error', { message: 'Failed to update room settings' });
    }
  }

  // Handle participant management
  private async handleParticipantManagement(socket: any, data: { matchId: string; action: 'kick' | 'mute' | 'promote' | 'demote'; targetUserId: string; reason?: string }) {
    try {
      const user = socket.data.user as AuthenticatedSocket;
      const matchRoom = this.matchRooms.get(data.matchId);
      
      if (!matchRoom) {
        socket.emit('error', { message: 'Match room not found' });
        return;
      }
      
      // Check if user has admin permissions
      if (!this.hasAdminPermissions(user.userId, matchRoom)) {
        socket.emit('error', { message: 'Insufficient permissions to manage participants' });
        return;
      }
      
      const targetParticipant = this.findParticipantInRoom(data.targetUserId, matchRoom);
      if (!targetParticipant) {
        socket.emit('error', { message: 'Target participant not found' });
        return;
      }
      
      switch (data.action) {
        case 'kick':
          await this.kickParticipant(data.matchId, data.targetUserId, data.reason);
          break;
        case 'mute':
          this.muteParticipant(data.matchId, data.targetUserId, data.reason);
          break;
        case 'promote':
          this.promoteParticipant(data.matchId, data.targetUserId);
          break;
        case 'demote':
          this.demoteParticipant(data.matchId, data.targetUserId);
          break;
      }
      
      logger.info(`Participant ${data.action} performed by ${user.userEmail} on ${data.targetUserId}`);
      
    } catch (error) {
      logger.error('Error managing participant:', error);
      socket.emit('error', { message: 'Failed to manage participant' });
    }
  }

  // Find participant in room
  private findParticipantInRoom(userId: string, matchRoom: MatchRoom): RoomParticipant | null {
    return matchRoom.referees.get(userId) ||
           matchRoom.coaches.get(userId) ||
           matchRoom.admins.get(userId) ||
           matchRoom.spectators.get(userId) ||
           matchRoom.participants.get(userId) ||
           null;
  }

  // Check if user has admin permissions
  private hasAdminPermissions(userId: string, matchRoom: MatchRoom): boolean {
    return matchRoom.admins.has(userId) || 
           matchRoom.referees.has(userId) ||
           this.connectedUsers.get(userId)?.userRole === 'SUPER_ADMIN';
  }

  // Kick participant from room
  private async kickParticipant(matchId: string, userId: string, reason?: string) {
    const matchRoom = this.matchRooms.get(matchId);
    if (!matchRoom) return;
    
    const participant = this.findParticipantInRoom(userId, matchRoom);
    if (!participant) return;
    
    // Remove from all categories
    matchRoom.referees.delete(userId);
    matchRoom.coaches.delete(userId);
    matchRoom.admins.delete(userId);
    matchRoom.spectators.delete(userId);
    matchRoom.participants.delete(userId);
    
    // Disconnect socket
    const socket = this.io.sockets.sockets.get(participant.socketId);
    if (socket) {
      socket.emit('kicked-from-room', { reason, timestamp: new Date() });
      socket.disconnect();
    }
    
    // Broadcast kick to room
    this.io.to(matchRoom.roomName).emit('participant-kicked', {
      userId,
      reason,
      timestamp: new Date()
    });
  }

  // Mute participant
  private muteParticipant(matchId: string, userId: string, reason?: string) {
    const matchRoom = this.matchRooms.get(matchId);
    if (!matchRoom) return;
    
    const participant = this.findParticipantInRoom(userId, matchRoom);
    if (!participant) return;
    
    // Add mute permission
    participant.permissions.push('MUTED');
    
    // Broadcast mute to room
    this.io.to(matchRoom.roomName).emit('participant-muted', {
      userId,
      reason,
      timestamp: new Date()
    });
  }

  // Promote participant
  private promoteParticipant(matchId: string, userId: string) {
    const matchRoom = this.matchRooms.get(matchId);
    if (!matchRoom) return;
    
    const participant = this.findParticipantInRoom(userId, matchRoom);
    if (!participant) return;
    
    // Move to coaches category
    matchRoom.participants.delete(userId);
    matchRoom.spectators.delete(userId);
    matchRoom.coaches.set(userId, participant);
    
    // Broadcast promotion to room
    this.io.to(matchRoom.roomName).emit('participant-promoted', {
      userId,
      newRole: 'COACH',
      timestamp: new Date()
    });
  }

  // Demote participant
  private demoteParticipant(matchId: string, userId: string) {
    const matchRoom = this.matchRooms.get(matchId);
    if (!matchRoom) return;
    
    const participant = this.findParticipantInRoom(userId, matchRoom);
    if (!participant) return;
    
    // Move to spectators category
    matchRoom.coaches.delete(userId);
    matchRoom.admins.delete(userId);
    matchRoom.spectators.set(userId, participant);
    
    // Broadcast demotion to room
    this.io.to(matchRoom.roomName).emit('participant-demoted', {
      userId,
      newRole: 'SPECTATOR',
      timestamp: new Date()
    });
  }

  // Update participant typing status
  private updateParticipantTyping(matchId: string, userId: string, isTyping: boolean) {
    const matchRoom = this.matchRooms.get(matchId);
    if (!matchRoom) return;
    
    const participant = this.findParticipantInRoom(userId, matchRoom);
    if (participant) {
      participant.isTyping = isTyping;
      participant.lastActivity = new Date();
    }
  }

  // Check if user can send messages
  private canUserSendMessage(userId: string, room: string): boolean {
    // Check if user is muted
    const matchId = room.replace('match:', '');
    const matchRoom = this.matchRooms.get(matchId);
    
    if (matchRoom) {
      const participant = this.findParticipantInRoom(userId, matchRoom);
      if (participant && participant.permissions.includes('MUTED')) {
        return false;
      }
    }
    
    return true;
  }

  // Update room analytics
  private updateRoomAnalytics(roomName: string, metric: keyof RoomAnalytics) {
    const analytics = this.roomAnalytics.get(roomName);
    if (analytics) {
      switch (metric) {
        case 'totalParticipants':
          analytics.totalParticipants = this.getRoomParticipantCount(roomName);
          break;
        case 'activeParticipants':
          analytics.activeParticipants = this.getActiveParticipantCount(roomName);
          break;
        case 'messagesSent':
          analytics.messagesSent++;
          break;
        case 'eventsRecorded':
          analytics.eventsRecorded++;
          break;
      }
      
      analytics.roomUptime = this.calculateRoomUptime(roomName);
      this.roomAnalytics.set(roomName, analytics);
    }
  }

  // Get room participant count
  private getRoomParticipantCount(roomName: string): number {
    const matchId = roomName.replace('match:', '');
    const matchRoom = this.matchRooms.get(matchId);
    
    if (!matchRoom) return 0;
    
    return matchRoom.participants.size +
           matchRoom.spectators.size +
           matchRoom.referees.size +
           matchRoom.coaches.size +
           matchRoom.admins.size;
  }

  // Get active participant count
  private getActiveParticipantCount(roomName: string): number {
    const matchId = roomName.replace('match:', '');
    const matchRoom = this.matchRooms.get(matchId);
    
    if (!matchRoom) return 0;
    
    let activeCount = 0;
    const allParticipants = [
      ...matchRoom.participants.values(),
      ...matchRoom.spectators.values(),
      ...matchRoom.referees.values(),
      ...matchRoom.coaches.values(),
      ...matchRoom.admins.values()
    ];
    
    for (const participant of allParticipants) {
      if (participant.isOnline && this.isParticipantActive(participant)) {
        activeCount++;
      }
    }
    
    return activeCount;
  }

  // Check if participant is active
  private isParticipantActive(participant: RoomParticipant): boolean {
    const now = new Date();
    const lastActivity = new Date(participant.lastActivity);
    const minutesSinceLastActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60);
    
    return minutesSinceLastActivity < 5; // Consider active if last activity was within 5 minutes
  }

  // Calculate room uptime
  private calculateRoomUptime(roomName: string): number {
    const matchId = roomName.replace('match:', '');
    const matchRoom = this.matchRooms.get(matchId);
    
    if (!matchRoom) return 0;
    
    const now = new Date();
    const createdAt = new Date(matchRoom.createdAt);
    const uptimeMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
    
    return Math.floor(uptimeMinutes);
  }

  // Get room analytics
  private getRoomAnalytics(matchId: string): RoomAnalytics | null {
    const roomName = `match:${matchId}`;
    return this.roomAnalytics.get(roomName) || null;
  }

  // Get room participants
  public getRoomParticipants(matchId: string): any[] {
    const matchRoom = this.matchRooms.get(matchId);
    if (!matchRoom) return [];

    const allParticipants = [
      ...Array.from(matchRoom.participants.values()),
      ...Array.from(matchRoom.spectators.values()),
      ...Array.from(matchRoom.referees.values()),
      ...Array.from(matchRoom.coaches.values()),
      ...Array.from(matchRoom.admins.values())
    ];

    return allParticipants.map(p => ({
      userId: p.userId,
      userRole: p.userRole,
      userEmail: p.userEmail,
      displayName: p.displayName,
      teamId: p.teamId,
      joinedAt: p.joinedAt,
      lastActivity: p.lastActivity,
      permissions: p.permissions,
      isOnline: p.isOnline
    }));
  }

  // Should cleanup room
  private shouldCleanupRoom(matchRoom: MatchRoom): boolean {
    const now = new Date();
    const lastActivity = new Date(matchRoom.lastActivity);
    const minutesSinceLastActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60);
    
    // Clean up if no activity for 1 hour and no participants
    return minutesSinceLastActivity > 60 && 
           matchRoom.participants.size === 0 &&
           matchRoom.spectators.size === 0 &&
           matchRoom.referees.size === 0 &&
           matchRoom.coaches.size === 0 &&
           matchRoom.admins.size === 0;
  }

  // Cleanup match room
  private cleanupMatchRoom(matchId: string) {
    const matchRoom = this.matchRooms.get(matchId);
    if (!matchRoom) return;
    
    // Remove room analytics
    this.roomAnalytics.delete(matchRoom.roomName);
    
    // Remove match room
    this.matchRooms.delete(matchId);
    
    logger.info(`Cleaned up match room: ${matchId}`);
  }

  // Start room cleanup interval
  private startRoomCleanup() {
    this.roomCleanupInterval = setInterval(() => {
      this.performRoomCleanup();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  // Perform room cleanup
  private performRoomCleanup() {
    const now = new Date();
    
    for (const [matchId, matchRoom] of this.matchRooms.entries()) {
      if (this.shouldCleanupRoom(matchRoom)) {
        this.cleanupMatchRoom(matchId);
      } else {
        // Clean up inactive participants
        this.cleanupInactiveParticipants(matchRoom);
      }
    }

    // Clean up inactive event entry sessions
    this.cleanupInactiveEventSessions();
  }

  // Cleanup inactive participants
  private cleanupInactiveParticipants(matchRoom: MatchRoom) {
    const now = new Date();
    const timeoutMinutes = matchRoom.settings.inactivityTimeout;
    
    const allParticipants = [
      ...Array.from(matchRoom.participants.entries()),
      ...Array.from(matchRoom.spectators.entries()),
      ...Array.from(matchRoom.coaches.entries())
    ];
    
    for (const [userId, participant] of allParticipants) {
      const lastActivity = new Date(participant.lastActivity);
      const minutesSinceLastActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60);
      
      if (minutesSinceLastActivity > timeoutMinutes) {
        // Kick inactive participant
        this.kickParticipant(matchRoom.matchId, userId, 'Inactive for too long');
      }
    }
  }

  // Handle disconnection
  private handleDisconnection(socket: any) {
    const user = socket.data.user as AuthenticatedSocket;
    this.connectedUsers.delete(socket.id);
    
    // Remove from all match rooms
    for (const [matchId, matchRoom] of this.matchRooms.entries()) {
      // Find and remove participant
      const participant = this.findParticipantInRoom(user.userId, matchRoom);
      if (participant) {
        participant.isOnline = false;
        participant.lastActivity = new Date();
        
        // Broadcast participant offline
        this.io.to(matchRoom.roomName).emit('participant-offline', {
          userId: user.userId,
          timestamp: new Date()
        });
      }
    }
    
    // Remove from all tournament rooms
    for (const [tournamentId, socketIds] of this.tournamentRooms.entries()) {
      if (socketIds.has(socket.id)) {
        socketIds.delete(socket.id);
        if (socketIds.size === 0) {
          this.tournamentRooms.delete(tournamentId);
        }
      }
    }
    
    logger.info(`User ${user.userEmail} disconnected`);
  }

  // Public methods for room management
  public getMatchRoom(matchId: string): MatchRoom | undefined {
    return this.matchRooms.get(matchId);
  }

  public getAllMatchRooms(): Map<string, MatchRoom> {
    return new Map(this.matchRooms);
  }

  // Duplicate functions removed - see implementations above



  // Start global timer updates for all active matches
  private startGlobalTimerUpdates(): void {
    this.timerUpdateInterval = setInterval(() => {
      this.updateAllMatchTimers();
    }, this.TIMER_UPDATE_FREQUENCY);
  }

  // Update timers for all active matches
  private updateAllMatchTimers(): void {
    for (const [matchId, matchState] of this.matchStates) {
      if (matchState.isTimerRunning && matchState.status === 'in_progress') {
        this.updateMatchTimerTick(matchId);
      }
    }
  }

  // Update a single match timer tick
  private updateMatchTimerTick(matchId: string): void {
    const matchState = this.matchStates.get(matchId);
    if (!matchState || !matchState.isTimerRunning) return;

    const now = new Date();
    const elapsed = now.getTime() - (matchState.periodStartTime?.getTime() || now.getTime());
    const minutesElapsed = Math.floor(elapsed / (1000 * 60));
    
    // Update current minute
    matchState.currentMinute = minutesElapsed;
    
    // Check for period transitions
    this.checkPeriodTransitions(matchId, matchState, minutesElapsed);
    
    // Update total play time
    if (matchState.periodStartTime) {
      const playTime = now.getTime() - matchState.periodStartTime.getTime();
      matchState.totalPlayTime += playTime;
    }
    
    // Broadcast timer update
    this.broadcastTimerUpdate(matchId, matchState);
    
    // Update last event time
    matchState.lastEventTime = now;
    this.matchStates.set(matchId, matchState);
  }

  // Check and handle period transitions
  private checkPeriodTransitions(matchId: string, matchState: MatchState, currentMinute: number): void {
    const room = `match:${matchId}`;
    
    switch (matchState.currentPeriod) {
      case 'first_half':
        if (currentMinute >= matchState.periodDuration) {
          this.transitionToPeriod(matchId, 'halftime', 'First half completed');
        }
        break;
        
      case 'halftime':
        if (currentMinute >= 15) { // Standard 15-minute halftime
          this.transitionToPeriod(matchId, 'second_half', 'Second half starting');
        }
        break;
        
      case 'second_half':
        if (currentMinute >= matchState.periodDuration) {
          // Check if match needs extra time or penalties
          if (matchState.homeScore === matchState.awayScore) {
            this.transitionToPeriod(matchId, 'extra_time', 'Match tied, starting extra time');
          } else {
            // @ts-ignore - 'completed' is a valid end state for matches
            this.transitionToPeriod(matchId, 'completed', 'Match completed');
          }
        }
        break;
        
      case 'extra_time':
        if (currentMinute >= matchState.extraTimeDuration) {
          if (matchState.homeScore === matchState.awayScore) {
            this.transitionToPeriod(matchId, 'penalties', 'Extra time completed, starting penalties');
          } else {
            // @ts-ignore - 'completed' is a valid end state for matches
            this.transitionToPeriod(matchId, 'completed', 'Extra time completed');
          }
        }
        break;
        
      case 'penalties':
        // Penalties continue until winner determined
        break;
    }
  }

  // Transition to a new match period
  private transitionToPeriod(matchId: string, newPeriod: MatchState['currentPeriod'], message: string): void {
    const matchState = this.matchStates.get(matchId);
    if (!matchState) return;

    const room = `match:${matchId}`;
    const now = new Date();
    
    // Update period
    matchState.currentPeriod = newPeriod;
    matchState.periodStartTime = now;
    matchState.currentMinute = 0;
    
    // Set period-specific durations
    switch (newPeriod) {
      case 'first_half':
      case 'second_half':
        matchState.periodDuration = 45; // Standard half duration
        break;
      case 'halftime':
        matchState.periodDuration = 15; // Standard halftime duration
        break;
      case 'extra_time':
        matchState.periodDuration = 15; // Extra time duration
        matchState.extraTimeStart = now;
        break;
      case 'penalties':
        matchState.periodDuration = 0; // Penalties have no time limit
        matchState.penaltiesStart = now;
        break;
    }
    
    // Broadcast period transition
    this.io.to(room).emit('period-transition', {
      matchId,
      newPeriod,
      message,
      timestamp: now,
      periodStartTime: now,
      periodDuration: matchState.periodDuration
    });
    
    // Update match state
    this.matchStates.set(matchId, matchState);
    
    // Broadcast updated match state
    this.broadcastMatchState(matchId);
    
    logger.info(`Match ${matchId} transitioned to ${newPeriod}: ${message}`);
  }

  // Broadcast timer update to all clients in a match room
  private broadcastTimerUpdate(matchId: string, matchState: MatchState): void {
    const room = `match:${matchId}`;
    
    this.io.to(room).emit('timer-update', {
      matchId,
      currentMinute: matchState.currentMinute,
      currentPeriod: matchState.currentPeriod,
      isTimerRunning: matchState.isTimerRunning,
      totalPlayTime: matchState.totalPlayTime,
      pausedTime: matchState.pausedTime,
      injuryTime: matchState.injuryTime,
      timestamp: new Date()
    });
  }



  // Start individual match timer
  private startMatchTimer(matchId: string): void {
    // Clear existing timer if any
    this.stopMatchTimer(matchId);
    
    // Start new timer
    const timer = setInterval(() => {
      this.updateMatchTimerTick(matchId);
    }, this.TIMER_UPDATE_FREQUENCY);
    
    this.matchTimers.set(matchId, timer);
  }

  // Stop individual match timer
  private stopMatchTimer(matchId: string): void {
    const timer = this.matchTimers.get(matchId);
    if (timer) {
      clearInterval(timer);
      this.matchTimers.delete(matchId);
    }
  }

  // Cleanup method for graceful shutdown
  public async cleanup(): Promise<void> {
    // Clear all intervals
    if (this.roomCleanupInterval) {
      clearInterval(this.roomCleanupInterval);
    }
    if (this.timerUpdateInterval) {
      clearInterval(this.timerUpdateInterval);
    }

    // Clear all match timers
    this.matchTimers.forEach(timer => clearInterval(timer));
    this.matchTimers.clear();

    // Clean up all event entry sessions
    for (const [sessionId, session] of this.eventEntrySessions.entries()) {
      if (session.isActive) {
        await this.endEventEntrySession(sessionId);
      }
    }

    // Clear all maps
    this.connectedUsers.clear();
    this.matchRooms.clear();
    this.tournamentRooms.clear();
    this.leagueRooms.clear();
    this.matchStates.clear();
    this.roomAnalytics.clear();
    this.eventEntrySessions.clear();
    this.matchEventSessions.clear();

    logger.info('WebSocket service cleaned up successfully');
  }

  // Event entry management public methods
  public getEventEntrySessions(matchId: string): EventEntrySession[] {
    const sessionIds = this.matchEventSessions.get(matchId);
    if (!sessionIds) return [];
    
    return Array.from(sessionIds)
      .map(id => this.eventEntrySessions.get(id))
      .filter((session): session is EventEntrySession => session !== undefined);
  }

  public getActiveEventEntrySessions(matchId: string): EventEntrySession[] {
    return this.getEventEntrySessions(matchId).filter(session => session.isActive);
  }

  public getUserEventEntrySession(matchId: string, userId: string): EventEntrySession | null {
    const sessions = this.getEventEntrySessions(matchId);
    return sessions.find(session => session.userId === userId && session.isActive) || null;
  }

  public getEventEntrySessionStats(matchId: string): {
    totalSessions: number;
    activeSessions: number;
    totalEvents: number;
    averageEventsPerSession: number;
  } {
    const sessions = this.getEventEntrySessions(matchId);
    const activeSessions = sessions.filter(s => s.isActive);
    const totalEvents = sessions.reduce((sum, s) => sum + s.eventsEntered, 0);
    
    return {
      totalSessions: sessions.length,
      activeSessions: activeSessions.length,
      totalEvents,
      averageEventsPerSession: sessions.length > 0 ? totalEvents / sessions.length : 0
    };
  }

  public async validateEventEntryData(eventData: EventEntryFormData): Promise<EventValidationResult> {
    return this.validateEventEntry(eventData);
  }

  public async getEventSuggestions(matchId: string, eventType: string): Promise<string[]> {
    return this.getEventEntrySuggestions(matchId, eventType);
  }

  public async forceEndEventEntrySession(sessionId: string): Promise<boolean> {
    try {
      await this.endEventEntrySession(sessionId);
      return true;
    } catch (error) {
      logger.error('Error force ending event entry session:', error);
      return false;
    }
  }

  public async cleanupInactiveEventSessions(): Promise<void> {
    const now = new Date();
    const inactiveThreshold = 30 * 60 * 1000; // 30 minutes
    
    for (const [sessionId, session] of this.eventEntrySessions.entries()) {
      if (session.isActive && 
          (now.getTime() - session.lastActivity.getTime()) > inactiveThreshold) {
        await this.endEventEntrySession(sessionId);
        logger.info(`Cleaned up inactive event entry session: ${sessionId}`);
      }
    }
  }
}
