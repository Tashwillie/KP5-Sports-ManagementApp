import { Router } from 'express';
import TeamStatisticsController from '../controllers/teamStatistics';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';

const router = Router();
const teamStatisticsController = new TeamStatisticsController();

// Apply authentication middleware to all routes
router.use(authenticate);

// Team Performance Routes
router.get('/team/:teamId/performance', requirePermission('teams.view_stats'), teamStatisticsController.getTeamPerformance);
router.get('/team/:teamId/comparison', requirePermission('teams.view_stats'), teamStatisticsController.compareTeamPerformance);
router.get('/team/:teamId/insights', requirePermission('teams.view_stats'), teamStatisticsController.getTeamInsights);
router.get('/team/:teamId/trends', requirePermission('teams.view_stats'), teamStatisticsController.getTeamTrends);
router.get('/team/:teamId/report', requirePermission('analytics.view'), teamStatisticsController.generateTeamReport);
router.get('/team/:teamId/efficiency', requirePermission('teams.view_stats'), teamStatisticsController.calculateTeamEfficiency);
router.get('/team/:teamId/league-comparison', requirePermission('teams.view_stats'), teamStatisticsController.compareTeamWithLeague);
router.get('/team/:teamId/summary', requirePermission('teams.view_stats'), teamStatisticsController.getTeamStatisticsSummary);
router.get('/team/:teamId/export', requirePermission('analytics.export'), teamStatisticsController.exportTeamStatistics);

// League and Tournament Routes
router.get('/league/table', requirePermission('tournaments.view'), teamStatisticsController.getLeagueTable);
router.get('/league/top-teams', requirePermission('tournaments.view'), teamStatisticsController.getTopTeams);

// Team Form Analysis Routes
router.get('/team/:teamId/form', requirePermission('teams.view_stats'), teamStatisticsController.analyzeTeamForm);

// Team Comparison Routes
router.post('/teams/compare', requirePermission('analytics.view'), teamStatisticsController.compareMultipleTeams);

// Team Statistics Update Routes (triggered by match events)
router.post('/team/update', requirePermission('matches.manage_events'), teamStatisticsController.updateTeamStatistics);

export default router;
