import { useMemo, useEffect, useState } from 'react';
import { useEnhancedAuthContext } from '@/contexts/EnhancedAuthContext';
import { usePermissions } from '@web/hooks/usePermissions';
import { useCurrentUserPermissions, usePermissionAudit, useSyncPermissions } from '@web/hooks/usePermissionsApi';
import { Permission, UserRole } from '@/types/permissions';
import { toast } from 'sonner';

export interface UseEnhancedPermissionsReturn {
  // Frontend permission system
  frontendPermissions: ReturnType<typeof usePermissions>;
  
  // Backend permission system
  backendPermissions: {
    data: any;
    isLoading: boolean;
    error: any;
    refetch: () => void;
  };
  
  // Synchronization
  syncStatus: {
    isSynced: boolean;
    isSyncing: boolean;
    lastSync: Date | null;
    differences: Permission[];
  };
  
  // Enhanced permission checks with backend validation
  can: (permission: Permission) => boolean;
  canAny: (permissions: Permission[]) => boolean;
  canAll: (permissions: Permission[]) => boolean;
  
  // Backend validation
  validatePermission: (permission: Permission) => Promise<boolean>;
  validatePermissions: (permissions: Permission[]) => Promise<boolean[]>;
  
  // Utility functions
  syncWithBackend: () => Promise<void>;
  getPermissionAudit: () => Promise<any>;
  isBackendAvailable: boolean;
}

export const useEnhancedPermissions = (): UseEnhancedPermissionsReturn => {
  const { user, isAuthenticated } = useEnhancedAuthContext();
  const frontendPermissions = usePermissions();
  
  // Backend permission hooks - only enable when user is authenticated
  const backendPermissions = useCurrentUserPermissions();
  const permissionAudit = usePermissionAudit();
  const syncPermissions = useSyncPermissions();
  
  // Local state for synchronization
  const [syncStatus, setSyncStatus] = useState({
    isSynced: false,
    isSyncing: false,
    lastSync: null as Date | null,
    differences: [] as Permission[],
  });
  
  const [isBackendAvailable, setIsBackendAvailable] = useState(true);

  // Enable backend permissions query when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      backendPermissions.refetch();
    }
  }, [isAuthenticated, user, backendPermissions.refetch]);

  // Check if backend is available
  useEffect(() => {
    if (backendPermissions.error) {
      setIsBackendAvailable(false);
    } else {
      setIsBackendAvailable(true);
    }
  }, [backendPermissions.error]);

  // Auto-sync permissions when backend data changes
  useEffect(() => {
    if (backendPermissions.data && frontendPermissions.userRole) {
      const frontendPerms = frontendPermissions.userRole ? 
        frontendPermissions.can ? 
          // Extract permissions from frontend system
          Object.keys(frontendPermissions).filter(key => 
            key.startsWith('can') && typeof frontendPermissions[key as keyof typeof frontendPermissions] === 'function'
          ).map(key => key.replace('can', '').toLowerCase()) as Permission[]
        : []
      : [];
      
      const backendPerms = backendPermissions.data.permissions || [];
      
      const differences = frontendPerms.filter(
        perm => !backendPerms.includes(perm)
      ).concat(
        backendPerms.filter(
          perm => !frontendPerms.includes(perm)
        )
      );

      setSyncStatus(prev => ({
        ...prev,
        isSynced: differences.length === 0,
        differences,
      }));
    }
  }, [backendPermissions.data, frontendPermissions.userRole]);

  // Enhanced permission checking with backend validation
  const can = useMemo(() => {
    return (permission: Permission): boolean => {
      // First check frontend permissions
      const frontendResult = frontendPermissions.can(permission);
      
      // If backend is available and user is authenticated, validate against it
      if (isAuthenticated && isBackendAvailable && backendPermissions.data) {
        const backendResult = backendPermissions.data.permissions.includes(permission);
        
        // Log any mismatches for debugging
        if (frontendResult !== backendResult) {
          console.warn(`Permission mismatch for ${permission}:`, {
            frontend: frontendResult,
            backend: backendResult,
          });
        }
        
        // For now, trust the backend as the source of truth
        return backendResult;
      }
      
      // Fall back to frontend permissions if backend is unavailable or user not authenticated
      return frontendResult;
    };
  }, [frontendPermissions.can, isAuthenticated, isBackendAvailable, backendPermissions.data]);

  const canAny = useMemo(() => {
    return (permissions: Permission[]): boolean => {
      return permissions.some(permission => can(permission));
    };
  }, [can]);

  const canAll = useMemo(() => {
    return (permissions: Permission[]): boolean => {
      return permissions.every(permission => can(permission));
    };
  }, [can]);

  // Backend validation functions
  const validatePermission = async (permission: Permission): Promise<boolean> => {
    if (!isBackendAvailable) {
      return frontendPermissions.can(permission);
    }
    
    try {
      // This would call the backend validation endpoint
      // For now, we'll use the cached backend data
      return backendPermissions.data?.permissions.includes(permission) || false;
    } catch (error) {
      console.error('Failed to validate permission with backend:', error);
      return frontendPermissions.can(permission);
    }
  };

  const validatePermissions = async (permissions: Permission[]): Promise<boolean[]> => {
    if (!isBackendAvailable) {
      return permissions.map(permission => frontendPermissions.can(permission));
    }
    
    try {
      return permissions.map(permission => 
        backendPermissions.data?.permissions.includes(permission) || false
      );
    } catch (error) {
      console.error('Failed to validate permissions with backend:', error);
      return permissions.map(permission => frontendPermissions.can(permission));
    }
  };

  // Synchronization functions
  const syncWithBackend = async (): Promise<void> => {
    if (!isBackendAvailable) {
      toast.error('Backend is not available for synchronization');
      return;
    }

    setSyncStatus(prev => ({ ...prev, isSyncing: true }));
    
    try {
      await syncPermissions.mutateAsync();
      
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSync: new Date(),
        isSynced: true,
        differences: [],
      }));
      
      toast.success('Permissions synchronized with backend');
    } catch (error) {
      setSyncStatus(prev => ({ ...prev, isSyncing: false }));
      toast.error('Failed to synchronize permissions');
      console.error('Permission sync failed:', error);
    }
  };

  const getPermissionAudit = async (): Promise<any> => {
    if (!isBackendAvailable) {
      throw new Error('Backend is not available');
    }
    
    try {
      await permissionAudit.refetch();
      return permissionAudit.data;
    } catch (error) {
      console.error('Failed to get permission audit:', error);
      throw error;
    }
  };

  // Auto-sync when component mounts
  useEffect(() => {
    if (isBackendAvailable && user) {
      syncWithBackend();
    }
  }, [isBackendAvailable, user]);

  return {
    frontendPermissions,
    backendPermissions,
    syncStatus,
    can,
    canAny,
    canAll,
    validatePermission,
    validatePermissions,
    syncWithBackend,
    getPermissionAudit,
    isBackendAvailable,
  };
};

// Specialized hooks for common use cases
export const useEnhancedUserManagementPermissions = () => {
  const { can, canAny, isBackendAvailable } = useEnhancedPermissions();
  
  return {
    canViewUsers: can('users.view'),
    canCreateUsers: can('users.create'),
    canEditUsers: can('users.edit'),
    canDeleteUsers: can('users.delete'),
    canAssignRoles: can('users.assign_roles'),
    canManagePermissions: can('users.manage_permissions'),
    canManageUsers: canAny(['users.create', 'users.edit', 'users.delete', 'users.assign_roles']),
    isBackendAvailable,
  };
};

export const useEnhancedClubManagementPermissions = () => {
  const { can, canAny, isBackendAvailable } = useEnhancedPermissions();
  
  return {
    canViewClubs: can('clubs.view'),
    canCreateClubs: can('clubs.create'),
    canEditClubs: can('clubs.edit'),
    canDeleteClubs: can('clubs.delete'),
    canApproveClubs: can('clubs.approve'),
    canManageClubMembers: can('clubs.manage_members'),
    canManageClubs: canAny(['clubs.create', 'clubs.edit', 'clubs.delete', 'clubs.approve']),
    isBackendAvailable,
  };
};

export const useEnhancedTeamManagementPermissions = () => {
  const { can, canAny, isBackendAvailable } = useEnhancedPermissions();
  
  return {
    canViewTeams: can('teams.view'),
    canCreateTeams: can('teams.create'),
    canEditTeams: can('teams.edit'),
    canDeleteTeams: can('teams.delete'),
    canManageTeamPlayers: can('teams.manage_players'),
    canManageTeamCoaches: can('teams.manage_coaches'),
    canViewTeamStats: can('teams.view_stats'),
    canManageTeams: canAny(['teams.create', 'teams.edit', 'teams.delete']),
    isBackendAvailable,
  };
};
