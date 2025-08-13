import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { requirePermission, requireAnyPermission } from '../middleware/permissions';
import {
  getTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  getTeamMembers,
  addTeamMember,
  updateTeamMember,
  removeTeamMember,
} from '../controllers/teams';

const router = Router();

// Validation schemas
const createTeamSchema = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Team name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('ageGroup')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Age group must be less than 50 characters'),
  body('gender')
    .optional()
    .isIn(['MALE', 'FEMALE', 'OTHER'])
    .withMessage('Invalid gender specified'),
  body('level')
    .optional()
    .isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL'])
    .withMessage('Invalid level specified'),
  body('clubId')
    .optional()
    .isString()
    .withMessage('Club ID must be a string'),
];

const updateTeamSchema = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Team name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('ageGroup')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Age group must be less than 50 characters'),
  body('gender')
    .optional()
    .isIn(['MALE', 'FEMALE', 'OTHER'])
    .withMessage('Invalid gender specified'),
  body('level')
    .optional()
    .isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL'])
    .withMessage('Invalid level specified'),
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
    .isIn(['COACH', 'PLAYER', 'MANAGER'])
    .withMessage('Invalid role specified'),
  body('jerseyNumber')
    .optional()
    .isInt({ min: 0, max: 99 })
    .withMessage('Jersey number must be between 0 and 99'),
];

const updateMemberSchema = [
  body('role')
    .isIn(['COACH', 'PLAYER', 'MANAGER'])
    .withMessage('Invalid role specified'),
  body('jerseyNumber')
    .optional()
    .isInt({ min: 0, max: 99 })
    .withMessage('Jersey number must be between 0 and 99'),
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
  query('clubId')
    .optional()
    .isString()
    .withMessage('Club ID filter must be a string'),
  query('level')
    .optional()
    .isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL'])
    .withMessage('Invalid level filter'),
  query('gender')
    .optional()
    .isIn(['MALE', 'FEMALE', 'OTHER'])
    .withMessage('Invalid gender filter'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive filter must be a boolean'),
];

const paramSchema = [
  param('id')
    .isString()
    .notEmpty()
    .withMessage('Team ID is required'),
];

const memberParamSchema = [
  param('teamId')
    .isString()
    .notEmpty()
    .withMessage('Team ID is required'),
  param('userId')
    .isString()
    .notEmpty()
    .withMessage('User ID is required'),
];

// Routes
router.get('/', querySchema, validateRequest, authenticate, requirePermission('teams.view'), getTeams);
router.get('/:id', paramSchema, validateRequest, authenticate, requirePermission('teams.view'), getTeam);
router.post('/', createTeamSchema, validateRequest, authenticate, requirePermission('teams.create'), createTeam);
router.put('/:id', [...paramSchema, ...updateTeamSchema], validateRequest, authenticate, requirePermission('teams.edit'), updateTeam);
router.delete('/:id', paramSchema, validateRequest, authenticate, requirePermission('teams.delete'), deleteTeam);

// Team members routes
router.get('/:teamId/members', paramSchema, validateRequest, authenticate, requirePermission('teams.view'), getTeamMembers);
router.post('/:teamId/members', [...paramSchema, ...addMemberSchema], validateRequest, authenticate, requirePermission('teams.manage_players'), addTeamMember);
router.put('/:teamId/members/:userId', [...memberParamSchema, ...updateMemberSchema], validateRequest, authenticate, requirePermission('teams.manage_players'), updateTeamMember);
router.delete('/:teamId/members/:userId', memberParamSchema, validateRequest, authenticate, requirePermission('teams.manage_players'), removeTeamMember);

export default router;
