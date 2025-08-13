import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { getDashboardStats } from '../controllers/dashboard';

const router = Router();

// Dashboard endpoint with permission check
router.get('/stats', authenticate, requirePermission('analytics.view'), getDashboardStats);

export default router;
