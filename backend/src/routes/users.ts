import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { requirePermission, requireAnyPermission } from '../middleware/permissions';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserProfile,
  updateUserProfile,
} from '../controllers/users';

const router = Router();

// Validation schemas
const createUserSchema = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('displayName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Display name must be between 2 and 50 characters'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  body('role')
    .optional()
    .isIn(['PLAYER', 'COACH', 'CLUB_ADMIN', 'REFEREE', 'PARENT', 'SUPER_ADMIN'])
    .withMessage('Invalid role specified'),
];

const updateUserSchema = [
  body('displayName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Display name must be between 2 and 50 characters'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  body('role')
    .optional()
    .isIn(['PLAYER', 'COACH', 'CLUB_ADMIN', 'REFEREE', 'PARENT', 'SUPER_ADMIN'])
    .withMessage('Invalid role specified'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

const updateProfileSchema = [
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  body('height')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Height must be a positive number'),
  body('weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a positive number'),
  body('position')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Position must be less than 50 characters'),
  body('jerseyNumber')
    .optional()
    .isInt({ min: 0, max: 99 })
    .withMessage('Jersey number must be between 0 and 99'),
  body('emergencyContact')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Emergency contact must be less than 200 characters'),
  body('medicalInfo')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Medical info must be less than 1000 characters'),
  body('preferences')
    .optional()
    .isObject()
    .withMessage('Preferences must be an object'),
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
  query('role')
    .optional()
    .isIn(['PLAYER', 'COACH', 'CLUB_ADMIN', 'REFEREE', 'PARENT', 'SUPER_ADMIN'])
    .withMessage('Invalid role filter'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive filter must be a boolean'),
];

const paramSchema = [
  param('id')
    .isString()
    .notEmpty()
    .withMessage('User ID is required'),
];

// Routes
router.get('/', querySchema, validateRequest, authenticate, requirePermission('users.view'), getUsers);
router.get('/:id', paramSchema, validateRequest, authenticate, requirePermission('users.view'), getUser);
router.post('/', createUserSchema, validateRequest, authenticate, requirePermission('users.create'), createUser);
router.put('/:id', [...paramSchema, ...updateUserSchema], validateRequest, authenticate, requirePermission('users.edit'), updateUser);
router.delete('/:id', paramSchema, validateRequest, authenticate, requirePermission('users.delete'), deleteUser);
router.get('/:id/profile', paramSchema, validateRequest, authenticate, requireAnyPermission(['profile.view_own', 'profile.view_others']), getUserProfile);
router.put('/:id/profile', [...paramSchema, ...updateProfileSchema], validateRequest, authenticate, requireAnyPermission(['profile.edit_own', 'profile.edit_others']), updateUserProfile);

export default router;
