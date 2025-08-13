import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import {
  getCurrentUserPermissions,
  getUserPermissions,
  checkPermission,
  getRoleHierarchy,
  getAvailableRoles,
  validatePermissions,
  getPermissionSummary,
} from '../controllers/permissions';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get current user's permissions
router.get('/me', getCurrentUserPermissions);

// Get permissions for a specific user (requires users.view permission)
router.get('/users/:userId', requirePermission('users.view'), getUserPermissions);

// Check if current user has a specific permission
router.get('/check/:permission', checkPermission);

// Get role hierarchy (requires system.view permission)
router.get('/roles/hierarchy', requirePermission('system.view'), getRoleHierarchy);

// Get available roles for current user to manage
router.get('/roles/available', getAvailableRoles);

// Validate multiple permissions for current user
router.post('/validate', validatePermissions);

// Get permission summary for current user
router.get('/summary', getPermissionSummary);

export default router;
