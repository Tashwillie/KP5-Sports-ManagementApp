import { Router } from 'express';
import eventEntryController from '../controllers/eventEntry';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Event entry session management
router.post('/sessions/start', requirePermission('matches.live_tracking'), eventEntryController.startEventEntrySession);
router.delete('/sessions/:sessionId', requirePermission('matches.live_tracking'), eventEntryController.endEventEntrySession);
router.get('/sessions/status/:matchId', requirePermission('matches.view'), eventEntryController.getEventEntryStatus);
router.get('/sessions/stats/:matchId', requirePermission('analytics.view'), eventEntryController.getEventEntryStats);
router.get('/sessions/active/:matchId', requirePermission('matches.view'), eventEntryController.getActiveEventEntrySessions);

// Event entry operations
router.post('/submit', requirePermission('matches.manage_events'), eventEntryController.submitEventEntry);
router.post('/validate', requirePermission('matches.manage_events'), eventEntryController.validateEventEntry);
router.get('/suggestions', requirePermission('matches.view'), eventEntryController.getEventSuggestions);

// Form configuration
router.get('/config', requirePermission('matches.view'), eventEntryController.getEventEntryFormConfig);

// Admin operations (require admin role)
router.delete('/sessions/:sessionId/force', requirePermission('matches.manage_events'), eventEntryController.forceEndEventEntrySession);

export default router;
