import { OAuth2Client } from 'google-auth-library';
import prisma from '../config/database';
import { logger } from '../utils/logger';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import emailService from './emailService';

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  verified_email: boolean;
}

export interface OAuthResult {
  success: boolean;
  user?: any;
  token?: string;
  message: string;
  isNewUser?: boolean;
}

export class OAuthService {
  private googleClient: OAuth2Client;

  constructor() {
    this.googleClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
  }

  async verifyGoogleToken(idToken: string): Promise<GoogleUserInfo | null> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        return null;
      }

      return {
        id: payload.sub,
        email: payload.email!,
        name: payload.name!,
        given_name: payload.given_name!,
        family_name: payload.family_name!,
        picture: payload.picture!,
        verified_email: payload.email_verified!,
      };
    } catch (error) {
      logger.error('Google token verification failed:', error);
      return null;
    }
  }

  async authenticateWithGoogle(idToken: string): Promise<OAuthResult> {
    try {
      const googleUser = await this.verifyGoogleToken(idToken);
      if (!googleUser) {
        return {
          success: false,
          message: 'Invalid Google token',
        };
      }

      if (!googleUser.verified_email) {
        return {
          success: false,
          message: 'Google email not verified',
        };
      }

      // Check if user already exists
      let user = await prisma.user.findUnique({
        where: { email: googleUser.email },
        include: {
          profile: true,
          oauthAccounts: {
            where: { provider: 'google' },
          },
        },
      });

      if (user) {
        // User exists, check if they have Google OAuth account
        const hasGoogleAccount = user.oauthAccounts.some(
          (account) => account.provider === 'google'
        );

        if (!hasGoogleAccount) {
          // Link existing account with Google
          await prisma.oAuthAccount.create({
            data: {
              userId: user.id,
              provider: 'google',
              providerAccountId: googleUser.id,
            },
          });
        }

        // Generate JWT token
        const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          process.env.JWT_SECRET || 'fallback-secret',
          { expiresIn: '24h' }
        );

        return {
          success: true,
          user,
          token,
          message: 'Login successful',
          isNewUser: false,
        };
      } else {
        // Create new user
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
        const randomPassword = await bcrypt.hash(
          Math.random().toString(36) + Date.now().toString(36),
          saltRounds
        );

        user = await prisma.user.create({
          data: {
            email: googleUser.email,
            password: randomPassword, // Random password for OAuth users
            displayName: googleUser.name,
            firstName: googleUser.given_name,
            lastName: googleUser.family_name,
            avatar: googleUser.picture,
            emailVerified: true,
            role: 'PLAYER',
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
            oauthAccounts: {
              create: {
                provider: 'google',
                providerAccountId: googleUser.id,
              },
            },
          },
          include: {
            profile: true,
            oauthAccounts: true,
          },
        });

        // Generate JWT token
        const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
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
      logger.error('Google authentication failed:', error);
      return {
        success: false,
        message: 'Authentication failed',
      };
    }
  }

  async linkOAuthAccount(
    userId: string,
    provider: string,
    providerAccountId: string,
    accessToken?: string,
    refreshToken?: string
  ): Promise<boolean> {
    try {
      await prisma.oAuthAccount.create({
        data: {
          userId,
          provider,
          providerAccountId,
          accessToken,
          refreshToken,
        },
      });
      return true;
    } catch (error) {
      logger.error('Failed to link OAuth account:', error);
      return false;
    }
  }

  async unlinkOAuthAccount(userId: string, provider: string): Promise<boolean> {
    try {
      await prisma.oAuthAccount.deleteMany({
        where: {
          userId,
          provider,
        },
      });
      return true;
    } catch (error) {
      logger.error('Failed to unlink OAuth account:', error);
      return false;
    }
  }

  async getOAuthAccounts(userId: string): Promise<any[]> {
    try {
      return await prisma.oAuthAccount.findMany({
        where: { userId },
        select: {
          id: true,
          provider: true,
          providerAccountId: true,
          createdAt: true,
        },
      });
    } catch (error) {
      logger.error('Failed to get OAuth accounts:', error);
      return [];
    }
  }
}

export default new OAuthService();
