import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import {
  register,
  login,
  logout,
  refreshToken,
  getCurrentUser,
  updateProfile,
  forgotPassword,
  resetPassword,
  googleAuth,
  sendPhoneOTP,
  verifyPhoneOTP,
  resendPhoneOTP,
  linkPhoneToUser,
  getOAuthAccounts,
  unlinkOAuthAccount,
} from '../controllers/auth';

const router = Router();

// Validation schemas
const registerSchema = [
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
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid phone number (international format: +1234567890)'),
  body('role')
    .optional()
    .isIn(['PLAYER', 'COACH', 'CLUB_ADMIN', 'REFEREE', 'PARENT', 'SUPER_ADMIN'])
    .withMessage('Invalid role specified'),
];

const loginSchema = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const updateProfileSchema = [
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
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid phone number (international format: +1234567890)'),
];

const forgotPasswordSchema = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
];

const resetPasswordSchema = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

// Phone authentication schemas
const sendOTPSchema = [
  body('phone')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid phone number (international format: +1234567890)'),
];

const verifyOTPSchema = [
  body('phone')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid phone number (international format: +1234567890)'),
  body('code')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP code must be 6 digits'),
];

const linkPhoneSchema = [
  body('phone')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid phone number (international format: +1234567890)'),
  body('code')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP code must be 6 digits'),
];

const googleAuthSchema = [
  body('idToken')
    .notEmpty()
    .withMessage('Google ID token is required'),
];

const unlinkOAuthSchema = [
  body('provider')
    .isIn(['google', 'facebook', 'apple'])
    .withMessage('Invalid OAuth provider'),
];

// Routes
router.post('/register', registerSchema, validateRequest, register);
router.post('/login', loginSchema, validateRequest, login);
router.post('/signin', loginSchema, validateRequest, login); // Alias for /login
router.post('/logout', logout);
router.post('/refresh', refreshToken);
router.get('/me', authenticate, getCurrentUser);
router.put('/profile', authenticate, updateProfileSchema, validateRequest, updateProfile);
router.post('/forgot-password', forgotPasswordSchema, validateRequest, forgotPassword);
router.post('/reset-password', resetPasswordSchema, validateRequest, resetPassword);

// OAuth routes
router.post('/google', googleAuthSchema, validateRequest, googleAuth);

// Phone authentication routes
router.post('/phone/send-otp', sendOTPSchema, validateRequest, sendPhoneOTP);
router.post('/phone/verify-otp', verifyOTPSchema, validateRequest, verifyPhoneOTP);
router.post('/phone/resend-otp', sendOTPSchema, validateRequest, resendPhoneOTP);
router.post('/phone/link', authenticate, linkPhoneSchema, validateRequest, linkPhoneToUser);

// OAuth management routes
router.get('/oauth/accounts', authenticate, getOAuthAccounts);
router.post('/oauth/unlink', authenticate, unlinkOAuthSchema, validateRequest, unlinkOAuthAccount);

export default router; 