import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { requirePermission, requireAnyPermission } from '../middleware/permissions';
import {
  getMatches,
  getMatch,
  createMatch,
  updateMatch,
  deleteMatch,
  getMatchParticipants,
  addMatchParticipant,
  updateMatchParticipant,
  removeMatchParticipant,
  getMatchEvents,
  addMatchEvent,
  updateMatchEvent,
  deleteMatchEvent,
  startMatch,
  pauseMatch,
  resumeMatch,
  endMatch,
} from '../controllers/matches';
import { webSocketService } from '../index';

const router = Router();

// Validation schemas
const createMatchSchema = [
  body('title').isString().trim().isLength({ min: 1, max: 255 }),
  body('description').optional().isString().trim(),
  body('startTime').isISO8601(),
  body('endTime').optional().isISO8601(),
  body('location').optional().isString().trim(),
  body('address').optional().isString().trim(),
  body('homeTeamId').optional().isUUID(),
  body('awayTeamId').optional().isUUID(),
];

const updateMatchSchema = [
  body('title').optional().isString().trim().isLength({ min: 1, max: 255 }),
  body('description').optional().isString().trim(),
  body('startTime').optional().isISO8601(),
  body('endTime').optional().isISO8601(),
  body('location').optional().isString().trim(),
  body('address').optional().isString().trim(),
  body('status').optional().isIn(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED']),
  body('homeScore').optional().isInt({ min: 0 }),
  body('awayScore').optional().isInt({ min: 0 }),
  body('homeTeamId').optional().isUUID(),
  body('awayTeamId').optional().isUUID(),
];

const addParticipantSchema = [
  body('userId').isUUID(),
  body('teamId').optional().isUUID(),
  body('role').isIn(['PLAYER', 'COACH', 'REFEREE', 'SPECTATOR']),
  body('status').isIn(['PENDING', 'CONFIRMED', 'DECLINED']),
];

const updateParticipantSchema = [
  body('teamId').optional().isUUID(),
  body('role').optional().isIn(['PLAYER', 'COACH', 'REFEREE', 'SPECTATOR']),
  body('status').optional().isIn(['PENDING', 'CONFIRMED', 'DECLINED']),
];

const addMatchEventSchema = [
  body('type').isIn(['GOAL', 'ASSIST', 'YELLOW_CARD', 'RED_CARD', 'SUBSTITUTION', 'INJURY', 'OTHER']),
  body('minute').optional().isInt({ min: 0, max: 120 }),
  body('description').optional().isString().trim(),
  body('playerId').optional().isUUID(),
  body('teamId').optional().isUUID(),
  body('data').optional().isObject(),
];

const updateMatchEventSchema = [
  body('type').optional().isIn(['GOAL', 'ASSIST', 'YELLOW_CARD', 'RED_CARD', 'SUBSTITUTION', 'INJURY', 'OTHER']),
  body('minute').optional().isInt({ min: 0, max: 120 }),
  body('description').optional().isString().trim(),
  body('playerId').optional().isUUID(),
  body('teamId').optional().isUUID(),
  body('data').optional().isObject(),
];

const querySchema = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED']),
  query('homeTeamId').optional().isUUID(),
  query('awayTeamId').optional().isUUID(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
];

const paramSchema = [
  param('id').isUUID(),
];

const participantParamSchema = [
  param('matchId').isUUID(),
  param('userId').isUUID(),
];

const eventParamSchema = [
  param('matchId').isUUID(),
  param('eventId').isUUID(),
];

// WebSocket-specific validation schemas
const matchTimerControlSchema = [
  body('action').isIn(['start', 'pause', 'resume', 'stop']),
  body('timestamp').isISO8601(),
];

const matchStatusChangeSchema = [
  body('status').isIn(['scheduled', 'in_progress', 'paused', 'completed', 'cancelled', 'postponed']),
  body('timestamp').isISO8601(),
  body('additionalData').optional().isObject(),
];

// Routes
router.get('/', querySchema, validateRequest, authenticate, requirePermission('matches.view'), getMatches);
router.get('/:id', paramSchema, validateRequest, authenticate, requirePermission('matches.view'), getMatch);
router.post('/', createMatchSchema, validateRequest, authenticate, requirePermission('matches.create'), createMatch);
router.put('/:id', [...paramSchema, ...updateMatchSchema], validateRequest, authenticate, requirePermission('matches.edit'), updateMatch);
router.delete('/:id', paramSchema, validateRequest, authenticate, requirePermission('matches.delete'), deleteMatch);

// Match participants routes
router.get('/:matchId/participants', paramSchema, validateRequest, authenticate, requirePermission('matches.view'), getMatchParticipants);
router.post('/:matchId/participants', [...paramSchema, ...addParticipantSchema], validateRequest, authenticate, requirePermission('matches.manage_events'), addMatchParticipant);
router.put('/:matchId/participants/:userId', [...participantParamSchema, ...updateParticipantSchema], validateRequest, authenticate, requirePermission('matches.manage_events'), updateMatchParticipant);
router.delete('/:matchId/participants/:userId', participantParamSchema, validateRequest, authenticate, requirePermission('matches.manage_events'), removeMatchParticipant);

// Match events routes
router.get('/:matchId/events', paramSchema, validateRequest, authenticate, requirePermission('matches.view'), getMatchEvents);
router.post('/:matchId/events', [...paramSchema, ...addMatchEventSchema], validateRequest, authenticate, requirePermission('matches.manage_events'), addMatchEvent);
router.put('/:matchId/events/:eventId', [...eventParamSchema, ...updateMatchEventSchema], validateRequest, authenticate, requirePermission('matches.manage_events'), updateMatchEvent);
router.delete('/:matchId/events/:eventId', eventParamSchema, validateRequest, authenticate, requirePermission('matches.manage_events'), deleteMatchEvent);

// Match control routes
router.post('/:id/start', paramSchema, validateRequest, authenticate, requirePermission('matches.live_tracking'), startMatch);
router.post('/:id/pause', paramSchema, validateRequest, authenticate, requirePermission('matches.live_tracking'), pauseMatch);
router.post('/:id/resume', paramSchema, validateRequest, authenticate, requirePermission('matches.live_tracking'), resumeMatch);
router.post('/:id/end', [...paramSchema, body('homeScore').optional().isInt({ min: 0 }), body('awayScore').optional().isInt({ min: 0 })], validateRequest, authenticate, requirePermission('matches.live_tracking'), endMatch);

// WebSocket-specific routes for real-time match control
router.get('/:id/websocket-status', paramSchema, validateRequest, authenticate, (req, res) => {
  try {
    const { id: matchId } = req.params;
    const roomInfo = webSocketService.getMatchRoomInfo(matchId);
    const matchState = webSocketService.getMatchState(matchId);
    
    res.json({
      success: true,
      data: {
        roomInfo,
        matchState,
        connectedUsers: roomInfo.users.length,
        isActive: roomInfo.userCount > 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get WebSocket status'
    });
  }
});

router.post('/:id/websocket/join', paramSchema, validateRequest, authenticate, (req, res) => {
  try {
    const { id: matchId } = req.params;
    const userId = (req as any).user.id;
    
    // This endpoint is for documentation purposes
    // Actual joining happens via WebSocket connection
    res.json({
      success: true,
      message: 'Use WebSocket connection to join match room',
      instructions: [
        'Connect to WebSocket server',
        'Emit "join-match" event with matchId',
        'Listen for "match-event", "match-status-change", and "match-state" events'
      ],
      matchId,
      userId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to process join request'
    });
  }
});

router.post('/:id/websocket/refresh-state', paramSchema, validateRequest, authenticate, async (req, res) => {
  try {
    const { id: matchId } = req.params;
    
    // Force refresh match state from database
    await webSocketService.refreshMatchState(matchId);
    
    res.json({
      success: true,
      message: 'Match state refreshed successfully',
      matchId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to refresh match state'
    });
  }
});

router.get('/websocket/status', authenticate, (req, res) => {
  try {
    const matchRooms = webSocketService.getMatchRooms();
    const allMatchStates = webSocketService.getAllMatchStates();
    
    res.json({
      success: true,
      data: {
        totalConnectedUsers: webSocketService.getUserCount(),
        activeMatchRooms: Array.from(matchRooms.entries()).map(([matchId, info]) => ({
          matchId,
          ...info
        })),
        matchStates: Array.from(allMatchStates.entries()).map(([matchId, state]) => ({
          matchId,
          status: state.status,
          currentMinute: state.currentMinute,
          homeScore: state.homeScore,
          awayScore: state.awayScore,
          eventsCount: state.events.length,
          lastEventTime: state.lastEventTime,
          isTimerRunning: state.isTimerRunning
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get WebSocket status'
    });
  }
});

export default router;
