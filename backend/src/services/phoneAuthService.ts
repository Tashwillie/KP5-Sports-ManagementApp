import prisma from '../config/database';
import { logger } from '../utils/logger';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export interface PhoneVerificationResult {
  success: boolean;
  message: string;
  verificationId?: string;
}

export interface PhoneLoginResult {
  success: boolean;
  user?: any;
  token?: string;
  message: string;
  isNewUser?: boolean;
}

export class PhoneAuthService {
  // Generate a random 6-digit OTP code
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Generate a secure verification token
  private generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async sendOTP(phone: string): Promise<PhoneVerificationResult> {
    try {
      // Check if there's an existing unexpired verification
      const existingVerification = await prisma.phoneVerification.findFirst({
        where: {
          phone,
          expiresAt: { gt: new Date() },
          verified: false,
        },
      });

      if (existingVerification) {
        return {
          success: false,
          message: 'OTP already sent. Please wait before requesting another one.',
        };
      }

      // Generate new OTP
      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Create verification record
      const verification = await prisma.phoneVerification.create({
        data: {
          phone,
          code: otp,
          expiresAt,
          verified: false,
        },
      });

      // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
      // For now, we'll log the OTP (in production, send via SMS)
      logger.info(`OTP for ${phone}: ${otp}`);

      return {
        success: true,
        message: 'OTP sent successfully',
        verificationId: verification.id,
      };
    } catch (error) {
      logger.error('Failed to send OTP:', error);
      return {
        success: false,
        message: 'Failed to send OTP',
      };
    }
  }

  async verifyOTP(phone: string, code: string): Promise<PhoneVerificationResult> {
    try {
      const verification = await prisma.phoneVerification.findFirst({
        where: {
          phone,
          code,
          expiresAt: { gt: new Date() },
          verified: false,
        },
      });

      if (!verification) {
        return {
          success: false,
          message: 'Invalid or expired OTP',
        };
      }

      // Mark as verified
      await prisma.phoneVerification.update({
        where: { id: verification.id },
        data: { verified: true },
      });

      return {
        success: true,
        message: 'OTP verified successfully',
        verificationId: verification.id,
      };
    } catch (error) {
      logger.error('Failed to verify OTP:', error);
      return {
        success: false,
        message: 'Failed to verify OTP',
      };
    }
  }

  async loginWithPhone(phone: string, code: string): Promise<PhoneLoginResult> {
    try {
      // Verify OTP first
      const verificationResult = await this.verifyOTP(phone, code);
      if (!verificationResult.success) {
        return {
          success: false,
          message: verificationResult.message,
        };
      }

      // Check if user exists
      let user = await prisma.user.findFirst({
        where: { phone },
        include: {
          profile: true,
        },
      });

      if (user) {
        // User exists, generate token
        const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          process.env.JWT_SECRET || 'fallback-secret',
          { expiresIn: '24h' }
        );

        // Mark phone as verified
        await prisma.user.update({
          where: { id: user.id },
          data: { phoneVerified: true },
        });

        return {
          success: true,
          user,
          token,
          message: 'Login successful',
          isNewUser: false,
        };
      } else {
        // Create new user with phone number
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
        const randomPassword = await bcrypt.hash(
          Math.random().toString(36) + Date.now().toString(36),
          saltRounds
        );

        user = await prisma.user.create({
          data: {
            email: `phone_${phone}@temp.kp5academy.com`, // Temporary email for phone users
            phone,
            password: randomPassword, // Random password for phone users
            displayName: `User_${phone.slice(-4)}`, // Generate display name from phone
            role: 'PLAYER',
            phoneVerified: true,
            profile: {
              create: {
                bio: null,
                height: null,
                weight: null,
                position: null,
                jerseyNumber: null,
                emergencyContact: null,
                medicalInfo: null,
                preferences: {},
              },
            },
          },
          include: {
            profile: true,
          },
        });

        // Generate JWT token
        const token = jwt.sign(
          { id: user.id, phone: user.phone, role: user.role },
          process.env.JWT_SECRET || 'fallback-secret',
          { expiresIn: '24h' }
        );

        return {
          success: true,
          user,
          token,
          message: 'Account created and login successful',
          isNewUser: true,
        };
      }
    } catch (error) {
      logger.error('Phone login failed:', error);
      return {
        success: false,
        message: 'Login failed',
      };
    }
  }

  async linkPhoneToExistingUser(userId: string, phone: string, code: string): Promise<PhoneVerificationResult> {
    try {
      // Verify OTP first
      const verificationResult = await this.verifyOTP(phone, code);
      if (!verificationResult.success) {
        return verificationResult;
      }

      // Check if phone is already used by another user
      const existingUser = await prisma.user.findFirst({
        where: { phone },
      });

      if (existingUser && existingUser.id !== userId) {
        return {
          success: false,
          message: 'Phone number is already associated with another account',
        };
      }

      // Update user's phone and mark as verified
      await prisma.user.update({
        where: { id: userId },
        data: {
          phone,
          phoneVerified: true,
        },
      });

      return {
        success: true,
        message: 'Phone number linked successfully',
      };
    } catch (error) {
      logger.error('Failed to link phone:', error);
      return {
        success: false,
        message: 'Failed to link phone number',
      };
    }
  }

  async resendOTP(phone: string): Promise<PhoneVerificationResult> {
    try {
      // Delete any existing unexpired verifications
      await prisma.phoneVerification.deleteMany({
        where: {
          phone,
          expiresAt: { gt: new Date() },
          verified: false,
        },
      });

      // Send new OTP
      return this.sendOTP(phone);
    } catch (error) {
      logger.error('Failed to resend OTP:', error);
      return {
        success: false,
        message: 'Failed to resend OTP',
      };
    }
  }

  async cleanupExpiredVerifications(): Promise<void> {
    try {
      await prisma.phoneVerification.deleteMany({
        where: {
          expiresAt: { lt: new Date() },
        },
      });
    } catch (error) {
      logger.error('Failed to cleanup expired verifications:', error);
    }
  }
}

export default new PhoneAuthService();
