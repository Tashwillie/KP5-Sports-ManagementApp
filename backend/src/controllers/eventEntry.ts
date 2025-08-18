import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import eventEntryService, { EventEntryFormData } from '../services/eventEntryService';
import { authenticate } from '../middleware/auth';

export class EventEntryController {
  // Start a new event entry session
  async startEventEntrySession(req: Request, res: Response, next: NextFunction) {
    try {
      const { matchId } = req.body;
      const userId = (req as any).user.userId;
      const userRole = (req as any).user.userRole;

      if (!matchId) {
        return res.status(400).json({ error: 'Match ID is required' });
      }

      const session = await eventEntryService.startEventEntrySession(matchId, userId, userRole);
      
      res.status(201).json({
        success: true,
        session: {
          id: session.id,
          matchId: session.matchId,
          startTime: session.startTime,
          eventsEntered: session.eventsEntered
        }
      });
    } catch (error) {
      logger.error('Error starting event entry session:', error);
      next(error);
    }
  }

  // End an event entry session
  async endEventEntrySession(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;
      const userId = (req as any).user.userId;

      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
      }

      await eventEntryService.endEventEntrySession(sessionId);
      
      res.json({
        success: true,
        message: 'Event entry session ended successfully'
      });
    } catch (error) {
      logger.error('Error ending event entry session:', error);
      next(error);
    }
  }

  // Submit an event entry
  async submitEventEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const eventData: EventEntryFormData = req.body;
      const userId = (req as any).user.userId;
      const userRole = (req as any).user.userRole;

      if (!eventData.matchId || !eventData.eventType || !eventData.teamId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const processedEvent = await eventEntryService.processEventEntry(eventData, userId, userRole);
      
      if (processedEvent) {
        res.status(201).json({
          success: true,
          event: {
            id: processedEvent.id,
            type: processedEvent.type,
            minute: processedEvent.minute,
            timestamp: processedEvent.timestamp
          },
          message: 'Event successfully recorded'
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Failed to process event entry'
        });
      }
    } catch (error) {
      logger.error('Error submitting event entry:', error);
      next(error);
    }
  }

  // Validate event entry data
  async validateEventEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const eventData: EventEntryFormData = req.body;

      if (!eventData.matchId || !eventData.eventType || !eventData.teamId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const validation = eventEntryService.validateEventEntry(eventData);
      const suggestions = await eventEntryService.getEventEntrySuggestions(
        eventData.matchId, 
        eventData.eventType, 
        eventData
      );

      res.json({
        ...validation,
        suggestions: [...(validation.suggestions || []), ...suggestions]
      });
    } catch (error) {
      logger.error('Error validating event entry:', error);
      next(error);
    }
  }

  // Get event entry suggestions
  async getEventSuggestions(req: Request, res: Response, next: NextFunction) {
    try {
      const { matchId, eventType, context } = req.query;

      if (!matchId || !eventType) {
        return res.status(400).json({ error: 'Match ID and event type are required' });
      }

      const suggestions = await eventEntryService.getEventEntrySuggestions(
        matchId as string, 
        eventType as string, 
        context
      );

      res.json({ suggestions });
    } catch (error) {
      logger.error('Error getting event suggestions:', error);
      next(error);
    }
  }

  // Get event entry session status
  async getEventEntryStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { matchId } = req.params;
      const userId = (req as any).user.userId;

      if (!matchId) {
        return res.status(400).json({ error: 'Match ID is required' });
      }

      const session = eventEntryService.getUserEventEntrySession(matchId, userId);
      
      if (session) {
        res.json({
          sessionId: session.id,
          isActive: session.isActive,
          eventsEntered: session.eventsEntered,
          startTime: session.startTime,
          lastActivity: session.lastActivity
        });
      } else {
        res.json({ isActive: false });
      }
    } catch (error) {
      logger.error('Error getting event entry status:', error);
      next(error);
    }
  }

  // Get event entry session statistics
  async getEventEntryStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { matchId } = req.params;

      if (!matchId) {
        return res.status(400).json({ error: 'Match ID is required' });
      }

      const stats = eventEntryService.getEventEntrySessionStats(matchId);
      
      res.json(stats);
    } catch (error) {
      logger.error('Error getting event entry stats:', error);
      next(error);
    }
  }

  // Get all active event entry sessions for a match
  async getActiveEventEntrySessions(req: Request, res: Response, next: NextFunction) {
    try {
      const { matchId } = req.params;

      if (!matchId) {
        return res.status(400).json({ error: 'Match ID is required' });
      }

      const sessions = eventEntryService.getActiveEventEntrySessions(matchId);
      
      res.json({
        sessions: sessions.map(session => ({
          id: session.id,
          userId: session.userId,
          userRole: session.userRole,
          startTime: session.startTime,
          lastActivity: session.lastActivity,
          eventsEntered: session.eventsEntered
        }))
      });
    } catch (error) {
      logger.error('Error getting active event entry sessions:', error);
      next(error);
    }
  }

  // Force end an event entry session (admin only)
  async forceEndEventEntrySession(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;
      const userRole = (req as any).user.userRole;

      // Only admins can force end sessions
      if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
      }

      const success = await eventEntryService.forceEndEventEntrySession(sessionId);
      
      if (success) {
        res.json({
          success: true,
          message: 'Event entry session force ended successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Failed to force end event entry session'
        });
      }
    } catch (error) {
      logger.error('Error force ending event entry session:', error);
      next(error);
    }
  }

  // Get event entry form configuration
  async getEventEntryFormConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const config = {
        eventTypes: [
          { value: 'goal', label: 'Goal', requiresPlayer: true, requiresSecondary: false },
          { value: 'assist', label: 'Assist', requiresPlayer: true, requiresSecondary: true },
          { value: 'yellow_card', label: 'Yellow Card', requiresPlayer: true, requiresSecondary: false },
          { value: 'red_card', label: 'Red Card', requiresPlayer: true, requiresSecondary: false },
          { value: 'substitution', label: 'Substitution', requiresPlayer: true, requiresSecondary: true },
          { value: 'injury', label: 'Injury', requiresPlayer: true, requiresSecondary: false },
          { value: 'corner', label: 'Corner', requiresPlayer: false, requiresSecondary: false },
          { value: 'foul', label: 'Foul', requiresPlayer: true, requiresSecondary: false },
          { value: 'shot', label: 'Shot', requiresPlayer: true, requiresSecondary: false },
          { value: 'save', label: 'Save', requiresPlayer: true, requiresSecondary: false },
          { value: 'offside', label: 'Offside', requiresPlayer: true, requiresSecondary: false },
          { value: 'throw_in', label: 'Throw In', requiresPlayer: false, requiresSecondary: false },
          { value: 'free_kick', label: 'Free Kick', requiresPlayer: false, requiresSecondary: false },
          { value: 'penalty', label: 'Penalty', requiresPlayer: true, requiresSecondary: false },
          { value: 'penalty_missed', label: 'Penalty Missed', requiresPlayer: true, requiresSecondary: false },
          { value: 'own_goal', label: 'Own Goal', requiresPlayer: true, requiresSecondary: false },
          { value: 'injury_time', label: 'Injury Time', requiresPlayer: false, requiresSecondary: false },
          { value: 'period_start', label: 'Period Start', requiresPlayer: false, requiresSecondary: false },
          { value: 'period_end', label: 'Period End', requiresPlayer: false, requiresSecondary: false }
        ],
        locations: [
          { value: 'left_wing', label: 'Left Wing' },
          { value: 'center', label: 'Center' },
          { value: 'right_wing', label: 'Right Wing' },
          { value: 'penalty_area', label: 'Penalty Area' },
          { value: 'outside_box', label: 'Outside Box' }
        ],
        severities: [
          { value: 'minor', label: 'Minor' },
          { value: 'major', label: 'Major' },
          { value: 'serious', label: 'Serious' }
        ],
        cardTypes: [
          { value: 'warning', label: 'Warning' },
          { value: 'caution', label: 'Caution' },
          { value: 'dismissal', label: 'Dismissal' }
        ],
        substitutionTypes: [
          { value: 'in', label: 'Player In' },
          { value: 'out', label: 'Player Out' },
          { value: 'tactical', label: 'Tactical' },
          { value: 'injury', label: 'Injury' },
          { value: 'red_card', label: 'Red Card' }
        ],
        goalTypes: [
          { value: 'open_play', label: 'Open Play' },
          { value: 'penalty', label: 'Penalty' },
          { value: 'free_kick', label: 'Free Kick' },
          { value: 'corner', label: 'Corner' },
          { value: 'own_goal', label: 'Own Goal' },
          { value: 'counter_attack', label: 'Counter Attack' }
        ],
        shotTypes: [
          { value: 'header', label: 'Header' },
          { value: 'volley', label: 'Volley' },
          { value: 'long_range', label: 'Long Range' },
          { value: 'close_range', label: 'Close Range' },
          { value: 'one_on_one', label: 'One on One' }
        ],
        saveTypes: [
          { value: 'catch', label: 'Catch' },
          { value: 'punch', label: 'Punch' },
          { value: 'deflection', label: 'Deflection' },
          { value: 'dive', label: 'Dive' },
          { value: 'reflex', label: 'Reflex' }
        ]
      };

      res.json(config);
    } catch (error) {
      logger.error('Error getting event entry form config:', error);
      next(error);
    }
  }
}

export default new EventEntryController();
