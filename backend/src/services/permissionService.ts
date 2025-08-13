import { Permission, UserPermissions, PermissionCheck } from '../types/permissions';
import { getUserPermissions, hasPermission, canManageRole, getAvailableRoles } from '../middleware/permissions';
import { logger } from '../utils/logger';

export class PermissionService {
  /**
   * Check if a user has a specific permission
   */
  static checkPermission(userRole: string, permission: Permission): PermissionCheck {
    const userPermissions = getUserPermissions(userRole);
    const hasPermissionResult = hasPermission(userRole, permission);

    return {
      hasPermission: hasPermissionResult,
      userRole,
      requiredPermission: permission,
      userPermissions,
    };
  }

  /**
   * Get comprehensive user permissions information
   */
  static getUserPermissionsInfo(userId: string, userRole: string): UserPermissions {
    const permissions = getUserPermissions(userRole);
    const canManageRoles = getAvailableRoles(userRole);
    
    // Get role level and description from the permissions middleware
    const rolePermissions = require('../middleware/permissions').getRolePermissions(userRole);
    const roleLevel = rolePermissions?.level || 'individual';
    const roleDescription = rolePermissions?.description || 'No description available';

    return {
      userId,
      userRole,
      permissions,
      roleLevel,
      roleDescription,
      canManageRoles,
    };
  }

  /**
   * Check if a user can manage another user's role
   */
  static canManageUserRole(managerRole: string, targetRole: string): boolean {
    return canManageRole(managerRole, targetRole);
  }

  /**
   * Get all available roles a user can manage
   */
  static getAvailableRolesForUser(userRole: string): string[] {
    return getAvailableRoles(userRole);
  }

  /**
   * Validate multiple permissions for a user
   */
  static validatePermissions(userRole: string, requiredPermissions: Permission[]): {
    hasAllPermissions: boolean;
    missingPermissions: Permission[];
    userPermissions: Permission[];
  } {
    const userPermissions = getUserPermissions(userRole);
    const missingPermissions: Permission[] = [];

    for (const permission of requiredPermissions) {
      if (!hasPermission(userRole, permission)) {
        missingPermissions.push(permission);
      }
    }

    return {
      hasAllPermissions: missingPermissions.length === 0,
      missingPermissions,
      userPermissions,
    };
  }

  /**
   * Check if user has any of the required permissions
   */
  static hasAnyPermission(userRole: string, requiredPermissions: Permission[]): boolean {
    return requiredPermissions.some(permission => hasPermission(userRole, permission));
  }

  /**
   * Get permission summary for a user
   */
  static getPermissionSummary(userRole: string): {
    role: string;
    level: string;
    description: string;
    totalPermissions: number;
    permissionCategories: Record<string, number>;
  } {
    const rolePermissions = require('../middleware/permissions').getRolePermissions(userRole);
    if (!rolePermissions) {
      return {
        role: userRole,
        level: 'individual',
        description: 'Unknown role',
        totalPermissions: 0,
        permissionCategories: {},
      };
    }

    const permissionCategories: Record<string, number> = {};
    rolePermissions.permissions.forEach(permission => {
      const category = permission.split('.')[0];
      permissionCategories[category] = (permissionCategories[category] || 0) + 1;
    });

    return {
      role: userRole,
      level: rolePermissions.level,
      description: rolePermissions.description,
      totalPermissions: rolePermissions.permissions.length,
      permissionCategories,
    };
  }

  /**
   * Log permission check for audit purposes
   */
  static logPermissionCheck(
    userId: string,
    userRole: string,
    permission: Permission,
    resource: string,
    action: string,
    granted: boolean
  ): void {
    logger.info('Permission check', {
      userId,
      userRole,
      permission,
      resource,
      action,
      granted,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Check if user can access a specific resource
   */
  static canAccessResource(
    userRole: string,
    resource: string,
    action: string,
    resourceOwnerId?: string,
    userId?: string
  ): boolean {
    const permission = `${resource}.${action}` as Permission;
    
    // Check if user has the basic permission
    if (!hasPermission(userRole, permission)) {
      return false;
    }

    // Special handling for profile access
    if (resource === 'profile') {
      if (action === 'view_others' || action === 'edit_others') {
        // Users can always view/edit their own profile
        if (resourceOwnerId === userId) {
          return true;
        }
        // Check if user has permission to view/edit other profiles
        return hasPermission(userRole, permission);
      }
      // For own profile access, always allow
      return true;
    }

    // For other resources, check the basic permission
    return hasPermission(userRole, permission);
  }

  /**
   * Get role hierarchy information
   */
  static getRoleHierarchy(): Record<string, { level: number; canManage: string[] }> {
    const roles = ['SUPER_ADMIN', 'CLUB_ADMIN', 'COACH', 'PLAYER', 'PARENT', 'REFEREE'];
    const hierarchy: Record<string, { level: number; canManage: string[] }> = {};

    roles.forEach(role => {
      const rolePermissions = require('../middleware/permissions').getRolePermissions(role);
      const level = rolePermissions?.level || 'individual';
      
      const levelHierarchy = {
        'system': 3,
        'club': 2,
        'team': 1,
        'individual': 0
      };

      const levelNumber = levelHierarchy[level as keyof typeof levelHierarchy] || 0;
      const canManage = getAvailableRoles(role);

      hierarchy[role] = {
        level: levelNumber,
        canManage,
      };
    });

    return hierarchy;
  }
}
