import { Router } from 'express';
import PlayerPerformanceController from '../controllers/playerPerformance';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';

const router = Router();
const playerPerformanceController = new PlayerPerformanceController();

// Apply authentication middleware to all routes
router.use(authenticate);

// Player Performance Routes
router.get('/player/:playerId', requirePermission('analytics.view'), playerPerformanceController.getPlayerPerformance);
router.get('/player/:playerId/comparison', requirePermission('analytics.view'), playerPerformanceController.getPlayerComparison);
router.get('/player/:playerId/insights', requirePermission('analytics.view'), playerPerformanceController.getPlayerInsights);
router.get('/player/:playerId/history', requirePermission('analytics.view'), playerPerformanceController.getPlayerPerformanceHistory);
router.get('/player/:playerId/season-stats', requirePermission('analytics.view'), playerPerformanceController.getPlayerSeasonStats);

// Team Performance Routes
router.get('/team/:teamId/analytics', requirePermission('analytics.view'), playerPerformanceController.getTeamPerformanceAnalytics);

// League/Tournament Performance Routes
router.get('/league/analytics', requirePermission('analytics.view'), playerPerformanceController.getLeaguePerformanceAnalytics);
router.get('/leaderboards', requirePermission('analytics.view'), playerPerformanceController.getPerformanceLeaderboards);

// Performance Reports and Analytics
router.get('/report', requirePermission('analytics.view'), playerPerformanceController.getPerformanceReport);
router.post('/compare-players', requirePermission('analytics.view'), playerPerformanceController.comparePlayers);
router.get('/export', requirePermission('analytics.export'), playerPerformanceController.exportAnalytics);

// Performance Update Routes (triggered by match events)
router.post('/update', requirePermission('matches.manage_events'), playerPerformanceController.updatePlayerPerformance);

export default router;
