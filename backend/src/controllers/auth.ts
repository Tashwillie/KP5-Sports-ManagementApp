import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/database';
import { logger } from '../utils/logger';
import oauthService from '../services/oauthService';
import phoneAuthService from '../services/phoneAuthService';
import emailService from '../services/emailService';
import { v4 as uuidv4 } from 'uuid';
import { blacklistAccessToken } from '../middleware/auth';

// Helper to generate tokens
const generateAccessToken = (user: any) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env['JWT_SECRET'] || 'fallback-secret',
    { expiresIn: '15m' }
  );

const generateRefreshToken = () => uuidv4();

// Register new user
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, displayName, firstName, lastName, phone, role = 'PLAYER' } = req.body;

    // Check if user already exists in database
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'User with this email already exists.',
      });
      return;
    }

    // Hash password
    const saltRounds = parseInt(process.env['BCRYPT_ROUNDS'] || '12');
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        displayName,
        firstName,
        lastName,
        phone,
        role,
        isActive: true,
        emailVerified: false,
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken();
    const device = req.headers['user-agent'] || 'unknown';
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await prisma.refreshToken.create({
      data: {
        userId: newUser.id,
        token: refreshToken,
        device,
        expiresAt,
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      },
    });

    logger.info(`New user registered: ${email}`);
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
};

// Login user
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Account is deactivated.',
      });
      return;
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();
    const device = req.headers['user-agent'] || 'unknown';
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        device,
        expiresAt,
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      },
    });

    logger.info(`User ${user.email} logged in successfully`);
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

// Logout user
export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    // Blacklist access token
    const authHeader = req.header('Authorization');
    const accessToken = authHeader?.replace('Bearer ', '');
    if (accessToken && accessToken.split('.').length === 3) {
      // Decode to get expiry
      const decoded: any = jwt.decode(accessToken);
      if (decoded && decoded.exp) {
        const now = Math.floor(Date.now() / 1000);
        const expiresIn = decoded.exp - now;
        if (expiresIn > 0) {
          await blacklistAccessToken(accessToken, expiresIn);
        }
      }
    }
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revoked: true },
      });
    }
    res.status(200).json({
      success: true,
      message: 'Logout successful.',
    });
  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
};

// Refresh token
export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: 'Refresh token is required.',
      });
      return;
    }
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });
    if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token.',
      });
      return;
    }
    // Rotate refresh token
    await prisma.refreshToken.update({
      where: { token: refreshToken },
      data: { revoked: true },
    });
    const newRefreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: {
        userId: storedToken.userId,
        token: newRefreshToken,
        device: storedToken.device,
        expiresAt,
      },
    });
    const accessToken = generateAccessToken(storedToken.user);
    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully.',
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    next(error);
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    // Get user data from database
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        profile: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found.',
      });
      return;
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: {
        user: userWithoutPassword,
      },
    });
  } catch (error) {
    logger.error('Get current user error:', error);
    next(error);
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    const { displayName, firstName, lastName, phone } = req.body;

    const updateData: any = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;

    // const user = await prisma.user.update({
    //   where: { id: req.user.id },
    //   data: updateData,
    //   include: {
    //     profile: true,
    //   },
    // });

    // Remove password from response
    // const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        // user: userWithoutPassword,
      },
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    next(error);
  }
};

// Forgot password
export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    // Find user (do not reveal if not found)
    const user = await prisma.user.findUnique({ where: { email } });
    // Always generate a token (for security)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    let userId = undefined;
    let userName = 'User';
    if (user) {
      userId = user.id;
      userName = user.displayName || user.firstName || user.email;
      // Invalidate previous tokens for this user
      await prisma.passwordResetToken.updateMany({
        where: { userId, used: false, expiresAt: { gt: new Date() } },
        data: { used: true },
      });
      // Store new token
      await prisma.passwordResetToken.create({
        data: { userId, token: resetToken, expiresAt },
      });
    }
    // Generate reset URL
    const resetUrl = `${process.env['FRONTEND_URL'] || 'http://localhost:3003'}/auth/reset-password/${resetToken}`;
    // Send email (always, for security)
    const emailSent = await emailService.sendPasswordResetEmail({
      email,
      resetToken,
      resetUrl,
      userName,
    });
    if (emailSent) {
      res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send password reset email.',
      });
    }
  } catch (error) {
    logger.error('Forgot password error:', error);
    next(error);
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, password } = req.body;
    // Find valid reset token
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() },
        used: false,
      },
    });
    if (!resetToken) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token.',
      });
      return;
    }
    // Hash new password
    const saltRounds = parseInt(process.env['BCRYPT_ROUNDS'] || '12');
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    // Update user password
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });
    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });
    res.status(200).json({
      success: true,
      message: 'Password reset successfully.',
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    next(error);
  }
};

// Google OAuth authentication
export const googleAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      res.status(400).json({
        success: false,
        message: 'Google ID token is required.',
      });
      return;
    }

    const result = await oauthService.authenticateWithGoogle(idToken);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          user: result.user,
          token: result.token,
          isNewUser: result.isNewUser,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    logger.error('Google auth error:', error);
    next(error);
  }
};

// Send phone OTP
export const sendPhoneOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phone } = req.body;

    if (!phone) {
      res.status(400).json({
        success: false,
        message: 'Phone number is required.',
      });
      return;
    }

    const result = await phoneAuthService.sendOTP(phone);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          verificationId: result.verificationId,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    logger.error('Send OTP error:', error);
    next(error);
  }
};

// Verify phone OTP and login
export const verifyPhoneOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      res.status(400).json({
        success: false,
        message: 'Phone number and OTP code are required.',
      });
      return;
    }

    const result = await phoneAuthService.loginWithPhone(phone, code);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          user: result.user,
          token: result.token,
          isNewUser: result.isNewUser,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    logger.error('Verify OTP error:', error);
    next(error);
  }
};

// Resend phone OTP
export const resendPhoneOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phone } = req.body;

    if (!phone) {
      res.status(400).json({
        success: false,
        message: 'Phone number is required.',
      });
      return;
    }

    const result = await phoneAuthService.resendOTP(phone);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          verificationId: result.verificationId,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    logger.error('Resend OTP error:', error);
    next(error);
  }
};

// Link phone to existing user
export const linkPhoneToUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    const { phone, code } = req.body;

    if (!phone || !code) {
      res.status(400).json({
        success: false,
        message: 'Phone number and OTP code are required.',
      });
      return;
    }

    const result = await phoneAuthService.linkPhoneToExistingUser(req.user.id, phone, code);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    logger.error('Link phone error:', error);
    next(error);
  }
};

// Get OAuth accounts for user
export const getOAuthAccounts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    const accounts = await oauthService.getOAuthAccounts(req.user.id);

    res.status(200).json({
      success: true,
      data: { accounts },
    });
  } catch (error) {
    logger.error('Get OAuth accounts error:', error);
    next(error);
  }
};

// Unlink OAuth account
export const unlinkOAuthAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    const { provider } = req.body;

    if (!provider) {
      res.status(400).json({
        success: false,
        message: 'OAuth provider is required.',
      });
      return;
    }

    const success = await oauthService.unlinkOAuthAccount(req.user.id, provider);

    if (success) {
      res.status(200).json({
        success: true,
        message: 'OAuth account unlinked successfully.',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to unlink OAuth account.',
      });
    }
  } catch (error) {
    logger.error('Unlink OAuth account error:', error);
    next(error);
  }
}; 