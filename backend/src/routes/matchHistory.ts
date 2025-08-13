import { Router } from 'express';
import MatchHistoryController from '../controllers/matchHistory';
import { authenticateToken } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';

const router = Router();
const matchHistoryController = new MatchHistoryController();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// General match history routes
router.get('/', requirePermission('matches.view'), matchHistoryController.getMatchHistory);
router.get('/summary', requirePermission('analytics.view'), matchHistoryController.getMatchStatisticsSummary);
router.get('/report', requirePermission('analytics.view'), matchHistoryController.generateMatchReport);

// Specific match routes
router.get('/match/:matchId', requirePermission('matches.view'), matchHistoryController.getMatchDetail);

// Historical trends routes
router.get('/trends/:period', requirePermission('analytics.view'), matchHistoryController.getHistoricalTrends);

// Match comparison routes
router.get('/compare/:matchId1/:matchId2', requirePermission('analytics.view'), matchHistoryController.compareMatches);

// Search routes
router.get('/search/:query', requirePermission('matches.view'), matchHistoryController.searchMatches);

// Export routes
router.get('/export/:format', requirePermission('analytics.export'), matchHistoryController.exportMatchData);

// Team-specific routes
router.get('/team/:teamId', requirePermission('teams.view_stats'), matchHistoryController.getTeamMatchHistory);

// Player-specific routes
router.get('/player/:playerId', requirePermission('analytics.view'), matchHistoryController.getPlayerMatchHistory);

// Tournament-specific routes
router.get('/tournament/:tournamentId', requirePermission('tournaments.view'), matchHistoryController.getTournamentMatchHistory);

export default router;
