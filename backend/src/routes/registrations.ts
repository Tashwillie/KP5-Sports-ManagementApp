import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { requirePermission, requireAnyPermission } from '../middleware/permissions';
import {
  getRegistrations,
  getRegistration,
  createRegistration,
  updateRegistration,
  deleteRegistration,
  approveRegistration,
  rejectRegistration,
  signWaiver,
  getRegistrationForms,
  submitRegistrationForm,
} from '../controllers/registrations';

const router = Router();

// Validation schemas
const createRegistrationSchema = [
  body('type').isIn(['PLAYER', 'TEAM', 'TOURNAMENT', 'EVENT']),
  body('formData').optional().isObject(),
  body('waiverSigned').optional().isBoolean(),
  body('paymentId').optional().isUUID(),
];

const updateRegistrationSchema = [
  body('type').optional().isIn(['PLAYER', 'TEAM', 'TOURNAMENT', 'EVENT']),
  body('status').optional().isIn(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']),
  body('formData').optional().isObject(),
  body('waiverSigned').optional().isBoolean(),
  body('paymentId').optional().isUUID(),
];

const submitFormSchema = [
  body('type').isIn(['PLAYER', 'TEAM', 'TOURNAMENT', 'EVENT']),
  body('formData').isObject(),
  body('waiverSigned').isBoolean(),
];

const signWaiverSchema = [
  body('waiverText').optional().isString().trim(),
  body('signature').optional().isString().trim(),
];

const querySchema = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('type').optional().isIn(['PLAYER', 'TEAM', 'TOURNAMENT', 'EVENT']),
  query('status').optional().isIn(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']),
  query('waiverSigned').optional().isBoolean(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
];

const paramSchema = [
  param('id').isUUID(),
];

// Routes
router.get('/', querySchema, validateRequest, authenticate, requirePermission('events.manage_registrations'), getRegistrations);
router.get('/:id', paramSchema, validateRequest, authenticate, requirePermission('events.manage_registrations'), getRegistration);
router.post('/', createRegistrationSchema, validateRequest, authenticate, requirePermission('events.manage_registrations'), createRegistration);
router.put('/:id', [...paramSchema, ...updateRegistrationSchema], validateRequest, authenticate, requirePermission('events.manage_registrations'), updateRegistration);
router.delete('/:id', paramSchema, validateRequest, authenticate, requirePermission('events.manage_registrations'), deleteRegistration);

// Registration management routes
router.put('/:id/approve', paramSchema, validateRequest, authenticate, requirePermission('events.manage_registrations'), approveRegistration);
router.put('/:id/reject', paramSchema, validateRequest, authenticate, requirePermission('events.manage_registrations'), rejectRegistration);
router.put('/:id/waiver', [...paramSchema, ...signWaiverSchema], validateRequest, authenticate, requirePermission('events.manage_registrations'), signWaiver);

// Form management routes
router.get('/forms/templates', validateRequest, authenticate, requirePermission('events.manage_registrations'), getRegistrationForms);
router.post('/forms/submit', submitFormSchema, validateRequest, authenticate, requirePermission('events.manage_registrations'), submitRegistrationForm);

export default router;
