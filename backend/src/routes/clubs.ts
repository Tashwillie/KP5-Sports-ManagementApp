import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { requirePermission, requireAnyPermission } from '../middleware/permissions';
import {
  getClubs,
  getClub,
  createClub,
  updateClub,
  deleteClub,
  getClubMembers,
  addClubMember,
  updateClubMember,
  removeClubMember,
} from '../controllers/clubs';

const router = Router();

// Validation schemas
const createClubSchema = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Club name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('website')
    .optional()
    .isURL()
    .withMessage('Website must be a valid URL'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address must be less than 200 characters'),
  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City must be less than 100 characters'),
  body('state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State must be less than 100 characters'),
  body('country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country must be less than 100 characters'),
  body('postalCode')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Postal code must be less than 20 characters'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
];

const updateClubSchema = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Club name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('website')
    .optional()
    .isURL()
    .withMessage('Website must be a valid URL'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address must be less than 200 characters'),
  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City must be less than 100 characters'),
  body('state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State must be less than 100 characters'),
  body('country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country must be less than 100 characters'),
  body('postalCode')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Postal code must be less than 20 characters'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

const addMemberSchema = [
  body('userId')
    .isString()
    .notEmpty()
    .withMessage('User ID is required'),
  body('role')
    .optional()
    .isIn(['OWNER', 'ADMIN', 'COACH', 'MEMBER'])
    .withMessage('Invalid role specified'),
];

const updateMemberSchema = [
  body('role')
    .isIn(['OWNER', 'ADMIN', 'COACH', 'MEMBER'])
    .withMessage('Invalid role specified'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

const querySchema = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
  query('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City filter must be less than 100 characters'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive filter must be a boolean'),
];

const paramSchema = [
  param('id')
    .isString()
    .notEmpty()
    .withMessage('Club ID is required'),
];

const memberParamSchema = [
  param('clubId')
    .isString()
    .notEmpty()
    .withMessage('Club ID is required'),
  param('userId')
    .isString()
    .notEmpty()
    .withMessage('User ID is required'),
];

// Routes
router.get('/', querySchema, validateRequest, authenticate, requirePermission('clubs.view'), getClubs);
router.get('/:id', paramSchema, validateRequest, authenticate, requirePermission('clubs.view'), getClub);
router.post('/', createClubSchema, validateRequest, authenticate, requirePermission('clubs.create'), createClub);
router.put('/:id', [...paramSchema, ...updateClubSchema], validateRequest, authenticate, requirePermission('clubs.edit'), updateClub);
router.delete('/:id', paramSchema, validateRequest, authenticate, requirePermission('clubs.delete'), deleteClub);

// Club members routes
router.get('/:clubId/members', paramSchema, validateRequest, authenticate, requirePermission('clubs.view'), getClubMembers);
router.post('/:clubId/members', [...paramSchema, ...addMemberSchema], validateRequest, authenticate, requirePermission('clubs.manage_members'), addClubMember);
router.put('/:clubId/members/:userId', [...memberParamSchema, ...updateMemberSchema], validateRequest, authenticate, requirePermission('clubs.manage_members'), updateClubMember);
router.delete('/:clubId/members/:userId', memberParamSchema, validateRequest, authenticate, requirePermission('clubs.manage_members'), removeClubMember);

export default router;
