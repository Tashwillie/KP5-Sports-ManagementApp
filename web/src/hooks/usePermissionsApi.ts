import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { permissionsApiService } from '@/lib/services/permissionsApiService';
import { Permission } from '@/types/permissions';

// Query keys for permissions
export const permissionQueryKeys = {
  all: ['permissions'] as const,
  currentUser: () => [...permissionQueryKeys.all, 'currentUser'] as const,
  user: (userId: string) => [...permissionQueryKeys.all, 'user', userId] as const,
  check: (permission: Permission) => [...permissionQueryKeys.all, 'check', permission] as const,
  hierarchy: () => [...permissionQueryKeys.all, 'hierarchy'] as const,
  availableRoles: () => [...permissionQueryKeys.all, 'availableRoles'] as const,
  summary: () => [...permissionQueryKeys.all, 'summary'] as const,
  audit: () => [...permissionQueryKeys.all, 'audit'] as const,
};

// Hook to get current user's permissions
export const useCurrentUserPermissions = () => {
  return useQuery({
    queryKey: permissionQueryKeys.currentUser(),
    queryFn: permissionsApiService.getCurrentUserPermissions,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Don't retry on failure
    enabled: false, // Disable by default, enable when needed
  });
};

// Hook to get permissions for a specific user
export const useUserPermissions = (userId: string) => {
  return useQuery({
    queryKey: permissionQueryKeys.user(userId),
    queryFn: () => permissionsApiService.getUserPermissions(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to check if current user has a specific permission
export const useCheckPermission = (permission: Permission) => {
  return useQuery({
    queryKey: permissionQueryKeys.check(permission),
    queryFn: () => permissionsApiService.checkPermission(permission),
    enabled: !!permission,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get role hierarchy
export const useRoleHierarchy = () => {
  return useQuery({
    queryKey: permissionQueryKeys.hierarchy(),
    queryFn: permissionsApiService.getRoleHierarchy,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: false,
    enabled: false,
  });
};

// Hook to get available roles for current user
export const useAvailableRoles = () => {
  return useQuery({
    queryKey: permissionQueryKeys.availableRoles(),
    queryFn: permissionsApiService.getAvailableRoles,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
    enabled: false,
  });
};

// Hook to get permission summary
export const usePermissionSummary = () => {
  return useQuery({
    queryKey: permissionQueryKeys.summary(),
    queryFn: permissionsApiService.getPermissionSummary,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
    enabled: false,
  });
};

// Hook to get comprehensive permission audit
export const usePermissionAudit = () => {
  return useQuery({
    queryKey: permissionQueryKeys.audit(),
    queryFn: permissionsApiService.getPermissionAudit,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
    enabled: false,
  });
};

// Hook to validate multiple permissions
export const useValidatePermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (permissions: Permission[]) => 
      permissionsApiService.validatePermissions(permissions),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: permissionQueryKeys.currentUser() });
    },
  });
};

// Hook to sync permissions between frontend and backend
export const useSyncPermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: permissionsApiService.syncPermissions,
    onSuccess: () => {
      // Invalidate all permission queries
      queryClient.invalidateQueries({ queryKey: permissionQueryKeys.all });
    },
  });
};

// Hook to validate a permission check
export const useValidatePermissionCheck = () => {
  return useMutation({
    mutationFn: ({ permission, expectedResult }: { permission: Permission; expectedResult: boolean }) =>
      permissionsApiService.validatePermissionCheck(permission, expectedResult),
  });
};

// Hook to get permissions with real-time updates
export const usePermissionsWithRealtime = () => {
  const currentUserPermissions = useCurrentUserPermissions();
  const permissionSummary = usePermissionSummary();
  const availableRoles = useAvailableRoles();

  return {
    currentUserPermissions: currentUserPermissions.data,
    permissionSummary: permissionSummary.data,
    availableRoles: availableRoles.data?.availableRoles || [],
    isLoading: currentUserPermissions.isLoading || permissionSummary.isLoading || availableRoles.isLoading,
    error: currentUserPermissions.error || permissionSummary.error || availableRoles.error,
    refetch: () => {
      currentUserPermissions.refetch();
      permissionSummary.refetch();
      availableRoles.refetch();
    },
  };
};

// Hook to check multiple permissions efficiently
export const useCheckMultiplePermissions = (permissions: Permission[]) => {
  const queries = permissions.map(permission => 
    useCheckPermission(permission)
  );

  const isLoading = queries.some(query => query.isLoading);
  const error = queries.find(query => query.error)?.error;
  const data = queries.map(query => query.data);

  const hasAllPermissions = data.every(result => result?.hasPermission);
  const hasAnyPermission = data.some(result => result?.hasPermission);
  const missingPermissions = permissions.filter((_, index) => !data[index]?.hasPermission);

  return {
    isLoading,
    error,
    data,
    hasAllPermissions,
    hasAnyPermission,
    missingPermissions,
    refetch: () => queries.forEach(query => query.refetch()),
  };
};

// Default export for convenience
export default {
  useCurrentUserPermissions,
  useUserPermissions,
  useCheckPermission,
  useRoleHierarchy,
  useAvailableRoles,
  usePermissionSummary,
  usePermissionAudit,
  useValidatePermissions,
  useSyncPermissions,
  useValidatePermissionCheck,
  usePermissionsWithRealtime,
  useCheckMultiplePermissions,
  permissionQueryKeys,
};
