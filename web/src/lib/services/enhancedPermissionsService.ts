// Enhanced Permissions Service with better error handling
import enhancedApiClient from '@web/lib/enhancedApiClient';
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

export class EnhancedPermissionsService {
  /**
   * Get current user's permissions from backend
   */
  static async getCurrentUserPermissions(): Promise<BackendUserPermissions> {
    try {
      const response = await enhancedApiClient.get<BackendUserPermissions>('/permissions/me');
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch user permissions');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to get user permissions:', error);
      throw new Error('Failed to fetch user permissions');
    }
  }

  /**
   * Get permissions for a specific user
   */
  static async getUserPermissions(userId: string): Promise<BackendUserPermissions> {
    try {
      const response = await enhancedApiClient.get<BackendUserPermissions>(`/permissions/users/${userId}`);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch user permissions');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to get user permissions:', error);
      throw new Error('Failed to fetch user permissions');
    }
  }

  /**
   * Check if current user has a specific permission
   */
  static async checkPermission(permission: Permission): Promise<BackendPermissionCheck> {
    try {
      const response = await enhancedApiClient.get<BackendPermissionCheck>(`/permissions/check/${permission}`);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to check permission');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to check permission:', error);
      throw new Error('Failed to check permission');
    }
  }

  /**
   * Get role hierarchy information
   */
  static async getRoleHierarchy(): Promise<BackendRoleHierarchy> {
    try {
      const response = await enhancedApiClient.get<BackendRoleHierarchy>('/permissions/roles/hierarchy');
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch role hierarchy');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to get role hierarchy:', error);
      throw new Error('Failed to fetch role hierarchy');
    }
  }

  /**
   * Get available roles for current user to manage
   */
  static async getAvailableRoles(): Promise<{ userRole: string; availableRoles: string[] }> {
    try {
      const response = await enhancedApiClient.get<{ userRole: string; availableRoles: string[] }>('/permissions/roles/available');
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch available roles');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to get available roles:', error);
      throw new Error('Failed to fetch available roles');
    }
  }

  /**
   * Validate multiple permissions for current user
   */
  static async validatePermissions(permissions: Permission[]): Promise<BackendPermissionValidation> {
    try {
      const response = await enhancedApiClient.post<BackendPermissionValidation>('/permissions/validate', { permissions });
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to validate permissions');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to validate permissions:', error);
      throw new Error('Failed to validate permissions');
    }
  }

  /**
   * Get permission summary for current user
   */
  static async getPermissionSummary(): Promise<BackendPermissionSummary> {
    try {
      const response = await enhancedApiClient.get<BackendPermissionSummary>('/permissions/summary');
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch permission summary');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to get permission summary:', error);
      throw new Error('Failed to fetch permission summary');
    }
  }

  /**
   * Sync frontend permissions with backend
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
      console.error('❌ Failed to sync permissions:', error);
      throw new Error('Permission synchronization failed');
    }
  }

  /**
   * Validate a permission check against the backend
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
      console.error('❌ Failed to validate permission check:', error);
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
      console.error('❌ Failed to get permission audit:', error);
      throw new Error('Permission audit failed');
    }
  }
}

// Export the class directly since all methods are static
export const enhancedPermissionsService = EnhancedPermissionsService;
