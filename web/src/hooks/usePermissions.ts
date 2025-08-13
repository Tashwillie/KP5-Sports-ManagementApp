import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Permission, 
  UserRole, 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions,
  canManageRole,
  getAvailableRoles,
  getRoleDescription,
  getRoleLevel
} from '@/lib/permissions/rolePermissions';

export interface UsePermissionsReturn {
  // Current user info
  userRole: UserRole | null;
  roleLevel: string;
  roleDescription: string;
  
  // Permission checks
  can: (permission: Permission) => boolean;
  canAny: (permissions: Permission[]) => boolean;
  canAll: (permissions: Permission[]) => boolean;
  
  // Role management
  canManageUser: (targetRole: UserRole) => boolean;
  availableRoles: UserRole[];
  
  // Utility functions
  isSuperAdmin: boolean;
  isClubAdmin: boolean;
  isCoach: boolean;
  isPlayer: boolean;
  isReferee: boolean;
  isParent: boolean;
  isModerator: boolean;
  isSupport: boolean;
  
  // Level checks
  isSystemLevel: boolean;
  isClubLevel: boolean;
  isTeamLevel: boolean;
  isIndividualLevel: boolean;
}

export const usePermissions = (): UsePermissionsReturn => {
  const { user } = useAuth();
  
  const userRole = useMemo(() => {
    if (!user?.role) return null;
    return user.role.toUpperCase() as UserRole;
  }, [user?.role]);
  
  const roleLevel = useMemo(() => {
    if (!userRole) return 'individual';
    return getRoleLevel(userRole);
  }, [userRole]);
  
  const roleDescription = useMemo(() => {
    if (!userRole) return 'No role assigned';
    return getRoleDescription(userRole);
  }, [userRole]);
  
  const can = useMemo(() => {
    return (permission: Permission): boolean => {
      if (!userRole) return false;
      return hasPermission(userRole, permission);
    };
  }, [userRole]);
  
  const canAny = useMemo(() => {
    return (permissions: Permission[]): boolean => {
      if (!userRole) return false;
      return hasAnyPermission(userRole, permissions);
    };
  }, [userRole]);
  
  const canAll = useMemo(() => {
    return (permissions: Permission[]): boolean => {
      if (!userRole) return false;
      return hasAllPermissions(userRole, permissions);
    };
  }, [userRole]);
  
  const canManageUser = useMemo(() => {
    return (targetRole: UserRole): boolean => {
      if (!userRole) return false;
      return canManageRole(userRole, targetRole);
    };
  }, [userRole]);
  
  const availableRoles = useMemo(() => {
    if (!userRole) return [];
    return getAvailableRoles(userRole);
  }, [userRole]);
  
  // Role-specific boolean checks
  const isSuperAdmin = useMemo(() => userRole === 'SUPER_ADMIN', [userRole]);
  const isClubAdmin = useMemo(() => userRole === 'CLUB_ADMIN', [userRole]);
  const isCoach = useMemo(() => userRole === 'COACH', [userRole]);
  const isPlayer = useMemo(() => userRole === 'PLAYER', [userRole]);
  const isReferee = useMemo(() => userRole === 'REFEREE', [userRole]);
  const isParent = useMemo(() => userRole === 'PARENT', [userRole]);
  const isModerator = useMemo(() => userRole === 'MODERATOR', [userRole]);
  const isSupport = useMemo(() => userRole === 'SUPPORT', [userRole]);
  
  // Level checks
  const isSystemLevel = useMemo(() => roleLevel === 'system', [roleLevel]);
  const isClubLevel = useMemo(() => roleLevel === 'club', [roleLevel]);
  const isTeamLevel = useMemo(() => roleLevel === 'team', [roleLevel]);
  const isIndividualLevel = useMemo(() => roleLevel === 'individual', [roleLevel]);
  
  return {
    userRole,
    roleLevel,
    roleDescription,
    can,
    canAny,
    canAll,
    canManageUser,
    availableRoles,
    isSuperAdmin,
    isClubAdmin,
    isCoach,
    isPlayer,
    isReferee,
    isParent,
    isModerator,
    isSupport,
    isSystemLevel,
    isClubLevel,
    isTeamLevel,
    isIndividualLevel
  };
};

// Specialized permission hooks for common use cases
export const useUserManagementPermissions = () => {
  const { can, canAny } = usePermissions();
  
  return {
    canViewUsers: can('users.view'),
    canCreateUsers: can('users.create'),
    canEditUsers: can('users.edit'),
    canDeleteUsers: can('users.delete'),
    canAssignRoles: can('users.assign_roles'),
    canManagePermissions: can('users.manage_permissions'),
    canManageUsers: canAny(['users.create', 'users.edit', 'users.delete', 'users.assign_roles'])
  };
};

export const useClubManagementPermissions = () => {
  const { can, canAny } = usePermissions();
  
  return {
    canViewClubs: can('clubs.view'),
    canCreateClubs: can('clubs.create'),
    canEditClubs: can('clubs.edit'),
    canDeleteClubs: can('clubs.delete'),
    canApproveClubs: can('clubs.approve'),
    canManageClubMembers: can('clubs.manage_members'),
    canManageClubs: canAny(['clubs.create', 'clubs.edit', 'clubs.delete', 'clubs.approve'])
  };
};

export const useTeamManagementPermissions = () => {
  const { can, canAny } = usePermissions();
  
  return {
    canViewTeams: can('teams.view'),
    canCreateTeams: can('teams.create'),
    canEditTeams: can('teams.edit'),
    canDeleteTeams: can('teams.delete'),
    canManageTeamPlayers: can('teams.manage_players'),
    canManageTeamCoaches: can('teams.manage_coaches'),
    canViewTeamStats: can('teams.view_stats'),
    canManageTeams: canAny(['teams.create', 'teams.edit', 'teams.delete'])
  };
};

export const useMatchManagementPermissions = () => {
  const { can, canAny } = usePermissions();
  
  return {
    canViewMatches: can('matches.view'),
    canCreateMatches: can('matches.create'),
    canEditMatches: can('matches.edit'),
    canDeleteMatches: can('matches.delete'),
    canManageMatchScores: can('matches.manage_scores'),
    canManageMatchEvents: can('matches.manage_events'),
    canLiveTrackMatches: can('matches.live_tracking'),
    canManageMatches: canAny(['matches.create', 'matches.edit', 'matches.delete'])
  };
};

export const useAnalyticsPermissions = () => {
  const { can, canAny } = usePermissions();
  
  return {
    canViewAnalytics: can('analytics.view'),
    canExportAnalytics: can('analytics.export'),
    canConfigureAnalytics: can('analytics.configure'),
    canViewReports: can('reports.view'),
    canCreateReports: can('reports.create'),
    canExportReports: can('reports.export'),
    canAccessAnalytics: canAny(['analytics.view', 'reports.view'])
  };
};
