import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { requirePermission, requireAnyPermission } from '../middleware/permissions';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventParticipants,
  addEventParticipant,
  updateEventParticipant,
  removeEventParticipant,
  getEventRSVPs,
  updateEventRSVP,
} from '../controllers/events';

const router = Router();

// Validation schemas
const createEventSchema = [
  body('title').isString().trim().isLength({ min: 1, max: 255 }),
  body('description').optional().isString().trim(),
  body('type').isIn(['PRACTICE', 'GAME', 'MEETING', 'TOURNAMENT', 'OTHER']),
  body('startTime').isISO8601(),
  body('endTime').isISO8601(),
  body('location').optional().isString().trim(),
  body('clubId').optional().isUUID(),
  body('teamId').optional().isUUID(),
  body('maxParticipants').optional().isInt({ min: 1 }),
];

const updateEventSchema = [
  body('title').optional().isString().trim().isLength({ min: 1, max: 255 }),
  body('description').optional().isString().trim(),
  body('type').optional().isIn(['PRACTICE', 'GAME', 'MEETING', 'TOURNAMENT', 'OTHER']),
  body('startTime').optional().isISO8601(),
  body('endTime').optional().isISO8601(),
  body('location').optional().isString().trim(),
  body('clubId').optional().isUUID(),
  body('teamId').optional().isUUID(),
  body('maxParticipants').optional().isInt({ min: 1 }),
];

const addParticipantSchema = [
  body('userId').isUUID(),
  body('status').isIn(['PENDING', 'CONFIRMED', 'DECLINED']),
];

const updateParticipantSchema = [
  body('status').optional().isIn(['PENDING', 'CONFIRMED', 'DECLINED']),
];

const updateRSVPSchema = [
  body('status').isIn(['PENDING', 'CONFIRMED', 'DECLINED']),
];

const querySchema = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('type').optional().isIn(['PRACTICE', 'GAME', 'MEETING', 'TOURNAMENT', 'OTHER']),
  query('clubId').optional().isUUID(),
  query('teamId').optional().isUUID(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
];

const paramSchema = [
  param('id').isUUID(),
];

const participantParamSchema = [
  param('eventId').isUUID(),
  param('userId').isUUID(),
];

// Routes
router.get('/', querySchema, validateRequest, authenticate, requirePermission('events.view'), getEvents);
router.get('/:id', paramSchema, validateRequest, authenticate, requirePermission('events.view'), getEvent);
router.post('/', createEventSchema, validateRequest, authenticate, requirePermission('events.create'), createEvent);
router.put('/:id', [...paramSchema, ...updateEventSchema], validateRequest, authenticate, requirePermission('events.edit'), updateEvent);
router.delete('/:id', paramSchema, validateRequest, authenticate, requirePermission('events.delete'), deleteEvent);

// Event participants routes
router.get('/:eventId/participants', paramSchema, validateRequest, authenticate, requirePermission('events.view'), getEventParticipants);
router.post('/:eventId/participants', [...paramSchema, ...addParticipantSchema], validateRequest, authenticate, requirePermission('events.manage_registrations'), addEventParticipant);
router.put('/:eventId/participants/:userId', [...participantParamSchema, ...updateParticipantSchema], validateRequest, authenticate, requirePermission('events.manage_registrations'), updateEventParticipant);
router.delete('/:eventId/participants/:userId', participantParamSchema, validateRequest, authenticate, requirePermission('events.manage_registrations'), removeEventParticipant);

// Event RSVP routes
router.get('/:eventId/rsvps', paramSchema, validateRequest, authenticate, requirePermission('events.view'), getEventRSVPs);
router.put('/:eventId/rsvp', [...paramSchema, ...updateRSVPSchema], validateRequest, authenticate, requirePermission('events.manage_registrations'), updateEventRSVP);

export default router;
