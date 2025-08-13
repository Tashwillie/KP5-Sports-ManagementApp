import express from 'express';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { getMediaFiles } from '../controllers/media';

const router = express.Router();

// GET /api/media/files - Get all media files with permission check
router.get('/files', authenticate, requirePermission('content.view'), getMediaFiles);

export default router;
