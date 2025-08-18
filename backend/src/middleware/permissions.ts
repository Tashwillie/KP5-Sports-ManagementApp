import { Request, Response, NextFunction } from 'express';
import { Permission } from '../types/permissions';
import { logger } from '../utils/logger';

// Extend Express Request interface to include permissions
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

// Helper functions - defined first to avoid hoisting issues
export const getRolePermissions = (userRole: string) => {
  const rolePermissionsMap: Record<string, { permissions: Permission[]; description: string; level: string }> = {
    SUPER_ADMIN: {
      level: 'system',
      description: 'Full system access with all permissions',
      permissions: [
        'users.view', 'users.create', 'users.edit', 'users.delete', 'users.assign_roles', 'users.manage_permissions',
        'clubs.view', 'clubs.create', 'clubs.edit', 'clubs.delete', 'clubs.approve', 'clubs.manage_members',
        'teams.view', 'teams.create', 'teams.edit', 'teams.delete', 'teams.manage_players', 'teams.manage_coaches', 'teams.view_stats',
        'players.view', 'players.create', 'players.edit', 'players.delete', 'players.manage_profile', 'players.view_medical', 'players.manage_documents',
        'events.view', 'events.create', 'events.edit', 'events.delete', 'events.manage_registrations', 'events.manage_schedules',
        'tournaments.view', 'tournaments.create', 'tournaments.edit', 'tournaments.delete', 'tournaments.manage_brackets', 'tournaments.manage_standings',
        'matches.view', 'matches.create', 'matches.edit', 'matches.delete', 'matches.manage_scores', 'matches.manage_events', 'matches.live_tracking',
        'payments.view', 'payments.process', 'payments.refund', 'payments.manage_subscriptions', 'payments.view_reports',
        'analytics.view', 'analytics.export', 'analytics.configure', 'reports.view', 'reports.create', 'reports.export',
        'system.view', 'system.configure', 'system.backup', 'system.restore', 'system.logs', 'system.maintenance',
        'content.view', 'content.create', 'content.edit', 'content.delete', 'content.moderate', 'content.publish',
        'messages.send', 'messages.view', 'messages.manage', 'notifications.view', 'notifications.send', 'notifications.manage',
        'profile.view_own', 'profile.edit_own', 'profile.view_others', 'profile.edit_others'
      ]
    },
    CLUB_ADMIN: {
      level: 'club',
      description: 'Club-level administration with team and player management',
      permissions: [
        'users.view', 'users.create', 'users.edit',
        'clubs.view', 'clubs.edit', 'clubs.manage_members',
        'teams.view', 'teams.create', 'teams.edit', 'teams.delete', 'teams.manage_players', 'teams.manage_coaches', 'teams.view_stats',
        'players.view', 'players.create', 'players.edit', 'players.delete', 'players.manage_profile', 'players.view_medical', 'players.manage_documents',
        'events.view', 'events.create', 'events.edit', 'events.delete', 'events.manage_registrations', 'events.manage_schedules',
        'tournaments.view', 'tournaments.create', 'tournaments.edit', 'tournaments.delete', 'tournaments.manage_brackets', 'tournaments.manage_standings',
        'matches.view', 'matches.create', 'matches.edit', 'matches.delete', 'matches.manage_scores', 'matches.manage_events', 'matches.live_tracking',
        'payments.view', 'payments.process', 'payments.refund', 'payments.manage_subscriptions', 'payments.view_reports',
        'analytics.view', 'analytics.export', 'reports.view', 'reports.create', 'reports.export',
        'content.view', 'content.create', 'content.edit', 'content.delete',
        'messages.send', 'messages.view', 'messages.manage', 'notifications.view', 'notifications.send', 'notifications.manage',
        'profile.view_own', 'profile.edit_own', 'profile.view_others', 'profile.edit_others'
      ]
    },
    COACH: {
      level: 'team',
      description: 'Team management with player oversight',
      permissions: [
        'teams.view', 'teams.edit', 'teams.manage_players', 'teams.view_stats',
        'players.view', 'players.edit', 'players.manage_profile', 'players.view_medical',
        'events.view', 'events.create', 'events.edit', 'events.manage_registrations', 'events.manage_schedules',
        'tournaments.view',
        'matches.view', 'matches.create', 'matches.edit', 'matches.manage_scores', 'matches.manage_events', 'matches.live_tracking',
        'analytics.view', 'reports.view',
        'content.view', 'content.create', 'content.edit',
        'messages.send', 'messages.view', 'notifications.view', 'notifications.send',
        'profile.view_own', 'profile.edit_own', 'profile.view_others'
      ]
    },
    REFEREE: {
      level: 'individual',
      description: 'Match officiating and event management',
      permissions: [
        'events.view',
        'matches.view', 'matches.manage_scores', 'matches.manage_events', 'matches.live_tracking',
        'content.view',
        'messages.send', 'messages.view',
        'profile.view_own', 'profile.edit_own'
      ]
    },
    PLAYER: {
      level: 'individual',
      description: 'Individual player with limited access',
      permissions: [
        'teams.view', 'teams.view_stats',
        'players.view', 'players.manage_profile',
        'events.view',
        'tournaments.view',
        'matches.view',
        'analytics.view',
        'content.view',
        'messages.send', 'messages.view',
        'profile.view_own', 'profile.edit_own'
      ]
    },
    PARENT: {
      level: 'individual',
      description: 'Parent with child oversight',
      permissions: [
        'teams.view',
        'players.view', 'players.manage_profile',
        'events.view',
        'tournaments.view',
        'matches.view',
        'content.view',
        'messages.view',
        'profile.view_own', 'profile.edit_own'
      ]
    }
  };

  return rolePermissionsMap[userRole] || null;
};

export const hasPermission = (userRole: string, permission: Permission): boolean => {
  const rolePermissions = getRolePermissions(userRole);
  if (!rolePermissions) return false;
  
  return rolePermissions.permissions.includes(permission);
};

export const hasAnyPermission = (userRole: string, permissions: Permission[]): boolean => {
  return permissions.some(permission => hasPermission(userRole, permission));
};

export const hasAllPermissions = (userRole: string, permissions: Permission[]): boolean => {
  return permissions.every(permission => hasPermission(userRole, permission));
};

// Permission checking middleware
export const requirePermission = (permission: Permission) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.',
      });
      return;
    }

    // Check if user has the required permission
    if (!hasPermission(req.user.role, permission)) {
      logger.warn('Permission denied', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredPermission: permission,
        endpoint: req.originalUrl,
        method: req.method,
      });

      res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
        requiredPermission: permission,
        userRole: req.user.role,
      });
      return;
    }

    next();
  };
};

// Multiple permissions middleware
export const requireAnyPermission = (permissions: Permission[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.',
      });
      return;
    }

    // Check if user has any of the required permissions
    if (!hasAnyPermission(req.user.role, permissions)) {
      logger.warn('Permission denied (any)', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredPermissions: permissions,
        endpoint: req.originalUrl,
        method: req.method,
      });

      res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
        requiredPermissions: permissions,
        userRole: req.user.role,
      });
      return;
    }

    next();
  };
};

export const requireAllPermissions = (permissions: Permission[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.',
      });
      return;
    }

    // Check if user has all of the required permissions
    if (!hasAllPermissions(req.user.role, permissions)) {
      logger.warn('Permission denied (all)', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredPermissions: permissions,
        endpoint: req.originalUrl,
        method: req.method,
      });

      res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
        requiredPermissions: permissions,
        userRole: req.user.role,
      });
      return;
    }

    next();
  };
};

// Role-based middleware
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
      logger.warn('Role access denied', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        endpoint: req.originalUrl,
        method: req.method,
      });

      res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient role.',
        requiredRoles: roles,
        userRole: req.user.role,
      });
      return;
    }

    next();
  };
};

// Helper function to get user permissions for a specific user
export const getUserPermissions = (userRole: string): Permission[] => {
  const rolePermissions = getRolePermissions(userRole);
  return rolePermissions?.permissions || [];
};

// Helper function to check if a user can manage another user's role
export const canManageRole = (managerRole: string, targetRole: string): boolean => {
  const managerLevel = getRolePermissions(managerRole)?.level || 'individual';
  const targetLevel = getRolePermissions(targetRole)?.level || 'individual';
  
  const levelHierarchy = {
    'system': 3,
    'club': 2,
    'team': 1,
    'individual': 0
  };
  
  return levelHierarchy[managerLevel as keyof typeof levelHierarchy] >= levelHierarchy[targetLevel as keyof typeof levelHierarchy];
};

// Helper function to get available roles a user can manage
export const getAvailableRoles = (managerRole: string): string[] => {
  const allRoles = ['SUPER_ADMIN', 'CLUB_ADMIN', 'COACH', 'PLAYER', 'PARENT', 'REFEREE'];
  return allRoles.filter(role => canManageRole(managerRole, role));
};

export const getRoleDescription = (userRole: string): string => {
  return getRolePermissions(userRole)?.description || 'No description available';
};
