import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { requirePermission, requireAnyPermission } from '../middleware/permissions';
import {
  getTournaments,
  getTournament,
  createTournament,
  updateTournament,
  deleteTournament,
  getTournamentTeams,
  addTournamentTeam,
  updateTournamentTeam,
  removeTournamentTeam,
  getTournamentMatches,
  generateBrackets,
  updateTournamentStatus,
} from '../controllers/tournaments';

const router = Router();

// Validation schemas
const createTournamentSchema = [
  body('name').isString().trim().isLength({ min: 1, max: 255 }),
  body('description').optional().isString().trim(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('location').optional().isString().trim(),
  body('format').isIn(['SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'ROUND_ROBIN', 'SWISS']),
  body('maxTeams').optional().isInt({ min: 2 }),
  body('registrationDeadline').optional().isISO8601(),
  body('clubId').optional().isUUID(),
];

const updateTournamentSchema = [
  body('name').optional().isString().trim().isLength({ min: 1, max: 255 }),
  body('description').optional().isString().trim(),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('location').optional().isString().trim(),
  body('format').optional().isIn(['SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'ROUND_ROBIN', 'SWISS']),
  body('status').optional().isIn(['UPCOMING', 'REGISTRATION_OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  body('maxTeams').optional().isInt({ min: 2 }),
  body('registrationDeadline').optional().isISO8601(),
  body('clubId').optional().isUUID(),
];

const addTeamSchema = [
  body('teamId').isUUID(),
  body('seed').optional().isInt({ min: 1 }),
];

const updateTeamSchema = [
  body('status').optional().isIn(['REGISTERED', 'CONFIRMED', 'WITHDRAWN', 'DISQUALIFIED']),
  body('seed').optional().isInt({ min: 1 }),
];

const generateBracketsSchema = [
  body('format').optional().isIn(['SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'ROUND_ROBIN', 'SWISS']),
];

const querySchema = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['UPCOMING', 'REGISTRATION_OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  query('format').optional().isIn(['SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'ROUND_ROBIN', 'SWISS']),
  query('clubId').optional().isUUID(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
];

const paramSchema = [
  param('id').isUUID(),
];

const teamParamSchema = [
  param('tournamentId').isUUID(),
  param('teamId').isUUID(),
];

// Routes
router.get('/', querySchema, validateRequest, authenticate, requirePermission('tournaments.view'), getTournaments);
router.get('/:id', paramSchema, validateRequest, authenticate, requirePermission('tournaments.view'), getTournament);
router.post('/', createTournamentSchema, validateRequest, authenticate, requirePermission('tournaments.create'), createTournament);
router.put('/:id', [...paramSchema, ...updateTournamentSchema], validateRequest, authenticate, requirePermission('tournaments.edit'), updateTournament);
router.delete('/:id', paramSchema, validateRequest, authenticate, requirePermission('tournaments.delete'), deleteTournament);

// Tournament teams routes
router.get('/:tournamentId/teams', paramSchema, validateRequest, authenticate, requirePermission('tournaments.view'), getTournamentTeams);
router.post('/:tournamentId/teams', [...paramSchema, ...addTeamSchema], validateRequest, authenticate, requirePermission('tournaments.manage_brackets'), addTournamentTeam);
router.put('/:tournamentId/teams/:teamId', [...teamParamSchema, ...updateTeamSchema], validateRequest, authenticate, requirePermission('tournaments.manage_brackets'), updateTournamentTeam);
router.delete('/:tournamentId/teams/:teamId', teamParamSchema, validateRequest, authenticate, requirePermission('tournaments.manage_brackets'), removeTournamentTeam);

// Tournament matches routes
router.get('/:tournamentId/matches', paramSchema, validateRequest, authenticate, requirePermission('tournaments.view'), getTournamentMatches);

// Tournament management routes
router.post('/:tournamentId/brackets', [...paramSchema, ...generateBracketsSchema], validateRequest, authenticate, requirePermission('tournaments.manage_brackets'), generateBrackets);
router.put('/:tournamentId/status', paramSchema, validateRequest, authenticate, requirePermission('tournaments.edit'), updateTournamentStatus);

export default router;
