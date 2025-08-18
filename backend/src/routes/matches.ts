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
  startMatch,
  pauseMatch,
  resumeMatch,
  endMatch,
  addMatchParticipant,
  updateMatchParticipant,
  removeMatchParticipant,
  getMatchStatistics,
  updateMatchScore,
} from '../controllers/matches';

const router = Router();

// Validation schemas
const createMatchSchema = [
  body('title').isString().trim().isLength({ min: 1, max: 255 }),
  body('description').optional().isString().trim(),
  body('startTime').isISO8601(),
  body('endTime').optional().isISO8601(),
  body('location').optional().isString().trim(),
  body('address').optional().isString().trim(),
  body('homeTeamId').isUUID(),
  body('awayTeamId').isUUID(),
  body('participants').optional().isArray(),
  body('participants.*.userId').optional().isUUID(),
  body('participants.*.teamId').optional().isUUID(),
  body('participants.*.role').optional().isIn(['PLAYER', 'COACH', 'REFEREE', 'SPECTATOR']),
  body('participants.*.status').optional().isIn(['PENDING', 'CONFIRMED', 'DECLINED']),
];

const updateMatchSchema = [
  body('title').optional().isString().trim().isLength({ min: 1, max: 255 }),
  body('description').optional().isString().trim(),
  body('startTime').optional().isISO8601(),
  body('endTime').optional().isISO8601(),
  body('location').optional().isString().trim(),
  body('address').optional().isString().trim(),
  body('homeTeamId').optional().isUUID(),
  body('awayTeamId').optional().isUUID(),
];

const updateScoreSchema = [
  body('homeScore').optional().isInt({ min: 0 }),
  body('awayScore').optional().isInt({ min: 0 }),
];

const addParticipantSchema = [
  body('userId').isUUID(),
  body('teamId').optional().isUUID(),
  body('role').optional().isIn(['PLAYER', 'COACH', 'REFEREE', 'SPECTATOR']),
  body('status').optional().isIn(['PENDING', 'CONFIRMED', 'DECLINED']),
];

const updateParticipantSchema = [
  body('teamId').optional().isUUID(),
  body('role').optional().isIn(['PLAYER', 'COACH', 'REFEREE', 'SPECTATOR']),
  body('status').optional().isIn(['PENDING', 'CONFIRMED', 'DECLINED']),
];

const querySchema = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['SCHEDULED', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED', 'POSTPONED']),
  query('homeTeamId').optional().isUUID(),
  query('awayTeamId').optional().isUUID(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
];

const paramSchema = [
  param('id').isUUID(),
];

const matchIdParamSchema = [
  param('matchId').isUUID(),
];

const participantParamSchema = [
  param('matchId').isUUID(),
  param('userId').isUUID(),
];

// Routes
router.get('/', querySchema, validateRequest, authenticate, requirePermission('matches.view'), getMatches);
router.get('/:id', paramSchema, validateRequest, authenticate, requirePermission('matches.view'), getMatch);
router.post('/', createMatchSchema, validateRequest, authenticate, requirePermission('matches.create'), createMatch);
router.put('/:id', [...paramSchema, ...updateMatchSchema], validateRequest, authenticate, requirePermission('matches.edit'), updateMatch);
router.delete('/:id', paramSchema, validateRequest, authenticate, requirePermission('matches.delete'), deleteMatch);

// Match control routes
router.post('/:id/start', paramSchema, validateRequest, authenticate, requirePermission('matches.manage'), startMatch);
router.post('/:id/pause', paramSchema, validateRequest, authenticate, requirePermission('matches.manage'), pauseMatch);
router.post('/:id/resume', paramSchema, validateRequest, authenticate, requirePermission('matches.manage'), resumeMatch);
router.post('/:id/end', [...paramSchema, ...updateScoreSchema], validateRequest, authenticate, requirePermission('matches.manage'), endMatch);

// Match score routes
router.put('/:id/score', [...paramSchema, ...updateScoreSchema], validateRequest, authenticate, requirePermission('matches.manage'), updateMatchScore);

// Match participants routes
router.post('/:matchId/participants', [...matchIdParamSchema, ...addParticipantSchema], validateRequest, authenticate, requirePermission('matches.manage'), addMatchParticipant);
router.put('/:matchId/participants/:userId', [...participantParamSchema, ...updateParticipantSchema], validateRequest, authenticate, requirePermission('matches.manage'), updateMatchParticipant);
router.delete('/:matchId/participants/:userId', participantParamSchema, validateRequest, authenticate, requirePermission('matches.manage'), removeMatchParticipant);

// Match statistics routes
router.get('/:matchId/statistics', matchIdParamSchema, validateRequest, authenticate, requirePermission('matches.view'), getMatchStatistics);

export default router;
