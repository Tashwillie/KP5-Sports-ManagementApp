import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { requirePermission, requireAnyPermission } from '../middleware/permissions';
import {
  getNotifications,
  getNotification,
  createNotification,
  updateNotification,
  deleteNotification,
  markAsRead,
  markAllAsRead,
  getNotificationPreferences,
  updateNotificationPreferences,
  sendPushNotification,
} from '../controllers/notifications';

const router = Router();

// Validation schemas
const createNotificationSchema = [
  body('title').isString().trim().isLength({ min: 1, max: 255 }),
  body('message').isString().trim().isLength({ min: 1, max: 1000 }),
  body('type').isIn(['INFO', 'WARNING', 'ERROR', 'SUCCESS', 'EVENT', 'MATCH', 'TEAM', 'CLUB']),
  body('recipientId').optional().isUUID(),
  body('teamId').optional().isUUID(),
  body('clubId').optional().isUUID(),
  body('eventId').optional().isUUID(),
  body('matchId').optional().isUUID(),
  body('data').optional().isObject(),
];

const updateNotificationSchema = [
  body('title').optional().isString().trim().isLength({ min: 1, max: 255 }),
  body('message').optional().isString().trim().isLength({ min: 1, max: 1000 }),
  body('type').optional().isIn(['INFO', 'WARNING', 'ERROR', 'SUCCESS', 'EVENT', 'MATCH', 'TEAM', 'CLUB']),
  body('isRead').optional().isBoolean(),
];

const updatePreferencesSchema = [
  body('emailNotifications').optional().isBoolean(),
  body('pushNotifications').optional().isBoolean(),
  body('smsNotifications').optional().isBoolean(),
  body('eventReminders').optional().isBoolean(),
  body('matchUpdates').optional().isBoolean(),
  body('teamMessages').optional().isBoolean(),
  body('clubAnnouncements').optional().isBoolean(),
  body('tournamentUpdates').optional().isBoolean(),
];

const sendPushNotificationSchema = [
  body('title').isString().trim().isLength({ min: 1, max: 255 }),
  body('message').isString().trim().isLength({ min: 1, max: 1000 }),
  body('recipientIds').optional().isArray(),
  body('teamId').optional().isUUID(),
  body('clubId').optional().isUUID(),
  body('data').optional().isObject(),
];

const querySchema = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('type').optional().isIn(['INFO', 'WARNING', 'ERROR', 'SUCCESS', 'EVENT', 'MATCH', 'TEAM', 'CLUB']),
  query('isRead').optional().isBoolean(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
];

const paramSchema = [
  param('id').isUUID(),
];

// Routes
router.get('/', querySchema, validateRequest, authenticate, requirePermission('notifications.view'), getNotifications);
router.get('/:id', paramSchema, validateRequest, authenticate, requirePermission('notifications.view'), getNotification);
router.post('/', createNotificationSchema, validateRequest, authenticate, requirePermission('notifications.send'), createNotification);
router.put('/:id', [...paramSchema, ...updateNotificationSchema], validateRequest, authenticate, requirePermission('notifications.send'), updateNotification);
router.delete('/:id', paramSchema, validateRequest, authenticate, requirePermission('notifications.manage'), deleteNotification);

// Notification status routes
router.put('/:id/read', paramSchema, validateRequest, authenticate, requirePermission('notifications.view'), markAsRead);
router.put('/read/all', validateRequest, authenticate, requirePermission('notifications.view'), markAllAsRead);

// Notification preferences routes
router.get('/preferences', validateRequest, authenticate, requirePermission('notifications.view'), getNotificationPreferences);
router.put('/preferences', updatePreferencesSchema, validateRequest, authenticate, requirePermission('notifications.view'), updateNotificationPreferences);

// Push notification routes
router.post('/push', sendPushNotificationSchema, validateRequest, authenticate, requirePermission('notifications.send'), sendPushNotification);

export default router;
