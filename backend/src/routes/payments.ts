import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { requirePermission, requireAnyPermission } from '../middleware/permissions';
import {
  getPayments,
  getPayment,
  createPayment,
  updatePayment,
  deletePayment,
  processStripePayment,
  refundPayment,
  getPaymentHistory,
} from '../controllers/payments';

const router = Router();

// Validation schemas
const createPaymentSchema = [
  body('amount').isFloat({ min: 0.01 }),
  body('currency').optional().isString().isLength({ min: 3, max: 3 }),
  body('method').optional().isIn(['CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'CASH', 'CHECK']),
  body('description').optional().isString().trim().isLength({ max: 500 }),
  body('metadata').optional().isObject(),
];

const updatePaymentSchema = [
  body('status').optional().isIn(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED']),
  body('method').optional().isIn(['CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'CASH', 'CHECK']),
  body('description').optional().isString().trim().isLength({ max: 500 }),
  body('metadata').optional().isObject(),
];

const stripePaymentSchema = [
  body('amount').isFloat({ min: 0.01 }),
  body('currency').optional().isString().isLength({ min: 3, max: 3 }),
  body('paymentMethodId').isString().trim(),
  body('description').optional().isString().trim().isLength({ max: 500 }),
  body('metadata').optional().isObject(),
];

const refundPaymentSchema = [
  body('amount').optional().isFloat({ min: 0.01 }),
  body('reason').optional().isString().trim().isLength({ max: 500 }),
];

const querySchema = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED']),
  query('method').optional().isIn(['CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'CASH', 'CHECK']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('minAmount').optional().isFloat({ min: 0 }),
  query('maxAmount').optional().isFloat({ min: 0 }),
];

const paramSchema = [
  param('id').isUUID(),
];

// Routes
router.get('/', querySchema, validateRequest, authenticate, requirePermission('payments.view'), getPayments);
router.get('/:id', paramSchema, validateRequest, authenticate, requirePermission('payments.view'), getPayment);
router.post('/', createPaymentSchema, validateRequest, authenticate, requirePermission('payments.process'), createPayment);
router.put('/:id', [...paramSchema, ...updatePaymentSchema], validateRequest, authenticate, requirePermission('payments.process'), updatePayment);
router.delete('/:id', paramSchema, validateRequest, authenticate, requirePermission('payments.process'), deletePayment);

// Stripe integration routes
router.post('/stripe/process', stripePaymentSchema, validateRequest, authenticate, requirePermission('payments.process'), processStripePayment);
router.post('/:id/refund', [...paramSchema, ...refundPaymentSchema], validateRequest, authenticate, requirePermission('payments.refund'), refundPayment);

// Payment history and analytics
router.get('/history/summary', validateRequest, authenticate, requirePermission('payments.view_reports'), getPaymentHistory);

export default router;
