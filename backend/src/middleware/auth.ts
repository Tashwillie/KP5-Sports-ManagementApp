import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import redisService from '../services/redisService';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        permissions?: string[];
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
      return;
    }

    // Optionally: Check if token is a refresh token (e.g., UUID format)
    if (token.split('.').length !== 3) {
      res.status(401).json({
        success: false,
        message: 'Access denied. Invalid access token format.',
      });
      return;
    }

    // Check if token is blacklisted
    const isBlacklisted = await redisService.exists(`blacklist:access_token:${token}`);
    if (isBlacklisted) {
      res.status(401).json({
        success: false,
        message: 'Access denied. Token has been revoked.',
      });
      return;
    }

    const decoded = jwt.verify(token, process.env['JWT_SECRET'] || 'fallback-secret') as {
      id: string;
      email: string;
      role: string;
    };

    // Fetch user from database to ensure they still exist
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Access denied. Invalid or inactive user.',
      });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Access denied. Invalid token.',
    });
  }
};

// Helper to blacklist an access token (e.g., on logout/compromise)
export const blacklistAccessToken = async (token: string, expiresInSeconds: number) => {
  await redisService.set(`blacklist:access_token:${token}`, true, { ttl: expiresInSeconds });
};

// Higher-order function to require specific roles
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
      });
      return;
    }

    next();
  };
};

// Specific role requirements
export const requireSuperAdmin = requireRole(['SUPER_ADMIN']);
export const requireClubAdmin = requireRole(['SUPER_ADMIN', 'CLUB_ADMIN']);
export const requireCoach = requireRole(['SUPER_ADMIN', 'CLUB_ADMIN', 'COACH']);
export const requirePlayer = requireRole(['SUPER_ADMIN', 'CLUB_ADMIN', 'COACH', 'PLAYER']);
export const requireParent = requireRole(['SUPER_ADMIN', 'CLUB_ADMIN', 'COACH', 'PLAYER', 'PARENT']);
export const requireReferee = requireRole(['SUPER_ADMIN', 'CLUB_ADMIN', 'COACH', 'REFEREE']); 