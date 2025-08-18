import { Router } from 'express';
import { param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
// import { requireRole } from '../middleware/roleAuth'; // Temporarily disabled
import { requirePermission } from '../middleware/permissions';
import { StatisticsController } from '../controllers/statistics';

const router = Router();

// Validation schemas
const playerMatchStatsSchema = [
  param('playerId').isString().trim().notEmpty(),
  param('matchId').isString().trim().notEmpty()
];

const teamMatchStatsSchema = [
  param('teamId').isString().trim().notEmpty(),
  param('matchId').isString().trim().notEmpty()
];

const matchStatsSchema = [
  param('matchId').isString().trim().notEmpty()
];

const playerSeasonStatsSchema = [
  param('playerId').isString().trim().notEmpty(),
  param('season').isString().trim().notEmpty()
];

const teamSeasonStatsSchema = [
  param('teamId').isString().trim().notEmpty(),
  param('season').isString().trim().notEmpty()
];

const seasonSchema = [
  param('season').isString().trim().notEmpty()
];

const topPerformersSchema = [
  param('season').isString().trim().notEmpty(),
  query('limit').optional().isInt({ min: 1, max: 100 })
];

const matchOverviewSchema = [
  param('matchId').isString().trim().notEmpty(),
  query('homeTeamId').optional().isString().trim(),
  query('awayTeamId').optional().isString().trim()
];

const playerComparisonSchema = [
  param('season').isString().trim().notEmpty(),
  query('playerIds').isString().trim().notEmpty()
];

const teamComparisonSchema = [
  param('season').isString().trim().notEmpty(),
  query('teamIds').isString().trim().notEmpty()
];

// Player Statistics Routes
router.get(
  '/players/:playerId/matches/:matchId',
  playerMatchStatsSchema,
  validateRequest,
  authenticate,
  requirePermission('analytics.view'),
  StatisticsController.getPlayerMatchStats
);

router.get(
  '/players/:playerId/seasons/:season',
  playerSeasonStatsSchema,
  validateRequest,
  authenticate,
  requirePermission('analytics.view'),
  StatisticsController.getPlayerSeasonStats
);

// Team Statistics Routes
router.get(
  '/teams/:teamId/matches/:matchId',
  teamMatchStatsSchema,
  validateRequest,
  authenticate,
  requirePermission('analytics.view'),
  StatisticsController.getTeamMatchStats
);

router.get(
  '/teams/:teamId/seasons/:season',
  teamSeasonStatsSchema,
  validateRequest,
  authenticate,
  requirePermission('analytics.view'),
  StatisticsController.getTeamSeasonStats
);

// Match Statistics Routes
router.get(
  '/matches/:matchId',
  matchStatsSchema,
  validateRequest,
  authenticate,
  requirePermission('analytics.view'),
  StatisticsController.getMatchStats
);

router.get(
  '/matches/:matchId/overview',
  matchOverviewSchema,
  validateRequest,
  authenticate,
  requirePermission('analytics.view'),
  StatisticsController.getMatchStatisticsOverview
);

// Season Statistics Routes
router.get(
  '/seasons/:season/top-performers',
  topPerformersSchema,
  validateRequest,
  authenticate,
  requirePermission('analytics.view'),
  StatisticsController.getTopPerformers
);

router.get(
  '/seasons/:season/standings',
  seasonSchema,
  validateRequest,
  authenticate,
  requirePermission('analytics.view'),
  StatisticsController.getTeamStandings
);

// Comparison Routes
router.get(
  '/seasons/:season/players/compare',
  playerComparisonSchema,
  validateRequest,
  authenticate,
  requirePermission('analytics.view'),
  StatisticsController.getPlayerPerformanceComparison
);

router.get(
  '/seasons/:season/teams/compare',
  teamComparisonSchema,
  validateRequest,
  authenticate,
  requirePermission('analytics.view'),
  StatisticsController.getTeamPerformanceComparison
);

export default router;
