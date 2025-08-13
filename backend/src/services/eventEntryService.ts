import { logger } from '../utils/logger';
import prisma from '../config/database';

export interface EventEntryFormData {
  matchId: string;
  eventType: string;
  minute: number;
  teamId: string;
  playerId?: string;
  secondaryPlayerId?: string;
  description?: string;
  location?: string;
  severity?: string;
  cardType?: string;
  substitutionType?: string;
  goalType?: string;
  shotType?: string;
  saveType?: string;
  additionalData?: Record<string, any>;
}

export interface EventValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions?: string[];
}

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

export interface MatchEvent {
  id: string;
  matchId: string;
  type: string;
  minute: number;
  description: string | null;
  playerId: string | null;
  teamId: string;
  data?: any;
  timestamp: Date;
  secondaryPlayerId?: string | null;
  location?: string;
  severity?: string;
  cardType?: string;
  substitutionType?: string;
  goalType?: string;
  shotType?: string;
  saveType?: string;
}

export class EventEntryService {
  private eventEntrySessions: Map<string, EventEntrySession> = new Map();
  private matchEventSessions: Map<string, Set<string>> = new Map();

  async startEventEntrySession(matchId: string, userId: string, userRole: string): Promise<EventEntrySession> {
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

  async endEventEntrySession(sessionId: string): Promise<void> {
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

  async updateEventEntrySession(sessionId: string, eventData?: Partial<EventEntryFormData>): Promise<void> {
    const session = this.eventEntrySessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date();
      if (eventData) {
        session.currentEvent = eventData;
      }
    }
  }

  validateEventEntry(eventData: EventEntryFormData): EventValidationResult {
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

  async processEventEntry(eventData: EventEntryFormData, userId: string, userRole: string): Promise<MatchEvent | null> {
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
        severity: eventData.severity || undefined,
        cardType: eventData.cardType || undefined,
        substitutionType: eventData.substitutionType || undefined,
        goalType: eventData.goalType || undefined,
        shotType: eventData.shotType || undefined,
        saveType: eventData.saveType || undefined,
        data: eventData.additionalData || {}
      };

      // Save to database
      const savedEvent = await this.saveMatchEvent(event, userId);
      if (!savedEvent) {
        logger.error('Failed to save event to database');
        return null;
      }

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

  private async saveMatchEvent(eventData: MatchEvent, userId: string): Promise<any> {
    try {
      const event = await prisma.matchEvent.create({
        data: {
          matchId: eventData.matchId,
          type: eventData.type.toUpperCase() as any,
          minute: eventData.minute,
          description: eventData.description,
          playerId: eventData.playerId,
          teamId: eventData.teamId,
          data: {
            ...eventData.data,
            secondaryPlayerId: eventData.secondaryPlayerId,
            location: eventData.location,
            severity: eventData.severity,
            cardType: eventData.cardType,
            substitutionType: eventData.substitutionType,
            goalType: eventData.goalType,
            shotType: eventData.shotType,
            saveType: eventData.saveType
          }
        }
      });
      
      return event;
    } catch (error) {
      logger.error('Error saving match event:', error);
      return null;
    }
  }

  async getEventEntrySuggestions(matchId: string, eventType: string, context?: any): Promise<string[]> {
    const suggestions: string[] = [];

    switch (eventType) {
      case 'goal':
        suggestions.push('Consider adding goal location for better statistics');
        suggestions.push('Specify goal type (open play, penalty, free kick, etc.)');
        break;

      case 'substitution':
        suggestions.push('Consider adding substitution reason (tactical, injury, red card)');
        break;

      case 'injury':
        suggestions.push('Consider adding injury time if significant');
        suggestions.push('Specify injury severity for medical tracking');
        break;

      case 'yellow_card':
      case 'red_card':
        suggestions.push('Consider adding card context (foul type, player reaction)');
        break;

      case 'shot':
        suggestions.push('Consider adding shot type (header, volley, long range)');
        suggestions.push('Specify shot location for tactical analysis');
        break;
    }

    return suggestions;
  }

  // Public methods for external access
  getEventEntrySessions(matchId: string): EventEntrySession[] {
    const sessionIds = this.matchEventSessions.get(matchId);
    if (!sessionIds) return [];
    
    return Array.from(sessionIds)
      .map(id => this.eventEntrySessions.get(id))
      .filter((session): session is EventEntrySession => session !== undefined);
  }

  getActiveEventEntrySessions(matchId: string): EventEntrySession[] {
    return this.getEventEntrySessions(matchId).filter(session => session.isActive);
  }

  getUserEventEntrySession(matchId: string, userId: string): EventEntrySession | null {
    const sessions = this.getEventEntrySessions(matchId);
    return sessions.find(session => session.userId === userId && session.isActive) || null;
  }

  getEventEntrySessionStats(matchId: string): {
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

  async cleanupInactiveEventSessions(): Promise<void> {
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

  async forceEndEventEntrySession(sessionId: string): Promise<boolean> {
    try {
      await this.endEventEntrySession(sessionId);
      return true;
    } catch (error) {
      logger.error('Error force ending event entry session:', error);
      return false;
    }
  }
}

export default new EventEntryService();
