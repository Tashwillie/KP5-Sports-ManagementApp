import { Request, Response, NextFunction } from 'express';
import { PermissionService } from '../services/permissionService';
import { logger } from '../utils/logger';

// Get current user's permissions
export const getCurrentUserPermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    const userPermissions = PermissionService.getUserPermissionsInfo(
      req.user.id,
      req.user.role
    );

    res.status(200).json({
      success: true,
      data: userPermissions,
    });
  } catch (error) {
    logger.error('Get current user permissions error:', error);
    next(error);
  }
};

// Get permissions for a specific user (admin only)
export const getUserPermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    const { userId } = req.params;

    // Check if current user can view other users' permissions
    if (!PermissionService.canAccessResource(req.user.role, 'users', 'view', userId, req.user.id)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
      });
      return;
    }

    // Get user from database to get their role
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found.',
      });
      return;
    }

    const userPermissions = PermissionService.getUserPermissionsInfo(
      user.id,
      user.role
    );

    res.status(200).json({
      success: true,
      data: userPermissions,
    });
  } catch (error) {
    logger.error('Get user permissions error:', error);
    next(error);
  }
};

// Check if current user has a specific permission
export const checkPermission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    const { permission } = req.params;

    if (!permission) {
      res.status(400).json({
        success: false,
        message: 'Permission parameter is required.',
      });
      return;
    }

    const permissionCheck = PermissionService.checkPermission(
      req.user.role,
      permission as any
    );

    res.status(200).json({
      success: true,
      data: permissionCheck,
    });
  } catch (error) {
    logger.error('Check permission error:', error);
    next(error);
  }
};

// Get role hierarchy information
export const getRoleHierarchy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    // Check if user can view system information
    if (!PermissionService.canAccessResource(req.user.role, 'system', 'view')) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
      });
      return;
    }

    const roleHierarchy = PermissionService.getRoleHierarchy();

    res.status(200).json({
      success: true,
      data: roleHierarchy,
    });
  } catch (error) {
    logger.error('Get role hierarchy error:', error);
    next(error);
  }
};

// Get available roles for current user to manage
export const getAvailableRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    const availableRoles = PermissionService.getAvailableRolesForUser(req.user.role);

    res.status(200).json({
      success: true,
      data: {
        userRole: req.user.role,
        availableRoles,
      },
    });
  } catch (error) {
    logger.error('Get available roles error:', error);
    next(error);
  }
};

// Validate multiple permissions for current user
export const validatePermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
      res.status(400).json({
        success: false,
        message: 'Permissions must be an array.',
      });
      return;
    }

    const validation = PermissionService.validatePermissions(
      req.user.role,
      permissions
    );

    res.status(200).json({
      success: true,
      data: validation,
    });
  } catch (error) {
    logger.error('Validate permissions error:', error);
    next(error);
  }
};

// Get permission summary for current user
export const getPermissionSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    const summary = PermissionService.getPermissionSummary(req.user.role);

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    logger.error('Get permission summary error:', error);
    next(error);
  }
};
