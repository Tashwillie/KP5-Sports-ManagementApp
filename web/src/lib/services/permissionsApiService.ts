import apiClient from '../apiClient';
import { Permission, UserPermissions, PermissionCheck } from '@/types/permissions';

export interface BackendPermissionCheck {
  hasPermission: boolean;
  userRole: string;
  requiredPermission: Permission;
  userPermissions: Permission[];
}

export interface BackendUserPermissions {
  userId: string;
  userRole: string;
  permissions: Permission[];
  roleLevel: string;
  roleDescription: string;
  canManageRoles: string[];
}

export interface BackendRoleHierarchy {
  [role: string]: {
    level: number;
    canManage: string[];
  };
}

export interface BackendPermissionSummary {
  role: string;
  level: string;
  description: string;
  totalPermissions: number;
  permissionCategories: Record<string, number>;
}

export interface BackendPermissionValidation {
  hasAllPermissions: boolean;
  missingPermissions: Permission[];
  userPermissions: Permission[];
}

export class PermissionsApiService {
  /**
   * Get current user's permissions from backend
   */
  static async getCurrentUserPermissions(): Promise<BackendUserPermissions> {
    const response = await apiClient.get('/permissions/me');
    return response.data;
  }

  /**
   * Get permissions for a specific user
   */
  static async getUserPermissions(userId: string): Promise<BackendUserPermissions> {
    const response = await apiClient.get(`/permissions/users/${userId}`);
    return response.data;
  }

  /**
   * Check if current user has a specific permission
   */
  static async checkPermission(permission: Permission): Promise<BackendPermissionCheck> {
    const response = await apiClient.get(`/permissions/check/${permission}`);
    return response.data;
  }

  /**
   * Get role hierarchy information
   */
  static async getRoleHierarchy(): Promise<BackendRoleHierarchy> {
    const response = await apiClient.get('/permissions/roles/hierarchy');
    return response.data;
  }

  /**
   * Get available roles for current user to manage
   */
  static async getAvailableRoles(): Promise<{ userRole: string; availableRoles: string[] }> {
    const response = await apiClient.get('/permissions/roles/available');
    return response.data;
  }

  /**
   * Validate multiple permissions for current user
   */
  static async validatePermissions(permissions: Permission[]): Promise<BackendPermissionValidation> {
    const response = await apiClient.post('/permissions/validate', { permissions });
    return response.data;
  }

  /**
   * Get permission summary for current user
   */
  static async getPermissionSummary(): Promise<BackendPermissionSummary> {
    const response = await apiClient.get('/permissions/summary');
    return response.data;
  }

  /**
   * Sync frontend permissions with backend
   * This ensures the frontend permission system matches the backend validation
   */
  static async syncPermissions(): Promise<{
    frontendPermissions: Permission[];
    backendPermissions: Permission[];
    isSynced: boolean;
    differences: Permission[];
  }> {
    try {
      const backendPermissions = await this.getCurrentUserPermissions();
      
      // Get frontend permissions from the current user's role
      // This would need to be passed in or retrieved from context
      const frontendPermissions: Permission[] = []; // TODO: Get from current user context
      
      const differences = frontendPermissions.filter(
        perm => !backendPermissions.permissions.includes(perm)
      ).concat(
        backendPermissions.permissions.filter(
          perm => !frontendPermissions.includes(perm)
        )
      );

      return {
        frontendPermissions,
        backendPermissions: backendPermissions.permissions,
        isSynced: differences.length === 0,
        differences,
      };
    } catch (error) {
      console.error('Failed to sync permissions:', error);
      throw new Error('Permission synchronization failed');
    }
  }

  /**
   * Validate a permission check against the backend
   * This provides real-time validation of frontend permission checks
   */
  static async validatePermissionCheck(
    permission: Permission,
    expectedResult: boolean
  ): Promise<{
    isValid: boolean;
    backendResult: boolean;
    frontendResult: boolean;
    message: string;
  }> {
    try {
      const backendCheck = await this.checkPermission(permission);
      
      const isValid = backendCheck.hasPermission === expectedResult;
      
      return {
        isValid,
        backendResult: backendCheck.hasPermission,
        frontendResult: expectedResult,
        message: isValid 
          ? 'Permission check validated successfully' 
          : `Permission mismatch: Frontend expects ${expectedResult}, Backend returns ${backendCheck.hasPermission}`,
      };
    } catch (error) {
      console.error('Failed to validate permission check:', error);
      throw new Error('Permission validation failed');
    }
  }

  /**
   * Get comprehensive permission audit for current user
   */
  static async getPermissionAudit(): Promise<{
    userInfo: BackendUserPermissions;
    summary: BackendPermissionSummary;
    hierarchy: BackendRoleHierarchy;
    availableRoles: string[];
  }> {
    try {
      const [userInfo, summary, hierarchy, availableRolesData] = await Promise.all([
        this.getCurrentUserPermissions(),
        this.getPermissionSummary(),
        this.getRoleHierarchy(),
        this.getAvailableRoles(),
      ]);

      return {
        userInfo,
        summary,
        hierarchy,
        availableRoles: availableRolesData.availableRoles,
      };
    } catch (error) {
      console.error('Failed to get permission audit:', error);
      throw new Error('Permission audit failed');
    }
  }
}

// Export the class directly since all methods are static
export const permissionsApiService = PermissionsApiService;
