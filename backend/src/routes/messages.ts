import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { requirePermission, requireAnyPermission } from '../middleware/permissions';
import {
  getMessages,
  getMessage,
  createMessage,
  updateMessage,
  deleteMessage,
  getConversations,
  getConversation,
  markAsRead,
  markAllAsRead,
} from '../controllers/messages';

const router = Router();

// Validation schemas
const createMessageSchema = [
  body('content').isString().trim().isLength({ min: 1, max: 2000 }),
  body('type').isIn(['TEXT', 'IMAGE', 'FILE', 'SYSTEM']),
  body('recipientId').optional().isUUID(),
  body('teamId').optional().isUUID(),
  body('clubId').optional().isUUID(),
  body('replyToId').optional().isUUID(),
];

const updateMessageSchema = [
  body('content').optional().isString().trim().isLength({ min: 1, max: 2000 }),
  body('isEdited').optional().isBoolean(),
];

const querySchema = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('type').optional().isIn(['TEXT', 'IMAGE', 'FILE', 'SYSTEM']),
  query('teamId').optional().isUUID(),
  query('clubId').optional().isUUID(),
  query('recipientId').optional().isUUID(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
];

const paramSchema = [
  param('id').isUUID(),
];

const conversationParamSchema = [
  param('recipientId').isUUID(),
];

// Routes
router.get('/', querySchema, validateRequest, authenticate, requirePermission('messages.view'), getMessages);
router.get('/:id', paramSchema, validateRequest, authenticate, requirePermission('messages.view'), getMessage);
router.post('/', createMessageSchema, validateRequest, authenticate, requirePermission('messages.send'), createMessage);
router.put('/:id', [...paramSchema, ...updateMessageSchema], validateRequest, authenticate, requirePermission('messages.send'), updateMessage);
router.delete('/:id', paramSchema, validateRequest, authenticate, requirePermission('messages.manage'), deleteMessage);

// Conversation routes
router.get('/conversations/list', validateRequest, authenticate, requirePermission('messages.view'), getConversations);
router.get('/conversations/:recipientId', conversationParamSchema, validateRequest, authenticate, requirePermission('messages.view'), getConversation);

// Message status routes
router.put('/:id/read', paramSchema, validateRequest, authenticate, requirePermission('messages.view'), markAsRead);
router.put('/read/all', validateRequest, authenticate, requirePermission('messages.view'), markAllAsRead);

export default router;
