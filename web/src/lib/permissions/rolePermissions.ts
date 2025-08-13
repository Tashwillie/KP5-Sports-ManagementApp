export type Permission = 
  // User Management
  | 'users.view'
  | 'users.create'
  | 'users.edit'
  | 'users.delete'
  | 'users.assign_roles'
  | 'users.manage_permissions'
  
  // Club Management
  | 'clubs.view'
  | 'clubs.create'
  | 'clubs.edit'
  | 'clubs.delete'
  | 'clubs.approve'
  | 'clubs.manage_members'
  
  // Team Management
  | 'teams.view'
  | 'teams.create'
  | 'teams.edit'
  | 'teams.delete'
  | 'teams.manage_players'
  | 'teams.manage_coaches'
  | 'teams.view_stats'
  
  // Player Management
  | 'players.view'
  | 'players.create'
  | 'players.edit'
  | 'players.delete'
  | 'players.manage_profile'
  | 'players.view_medical'
  | 'players.manage_documents'
  
  // Event Management
  | 'events.view'
  | 'events.create'
  | 'events.edit'
  | 'events.delete'
  | 'events.manage_registrations'
  | 'events.manage_schedules'
  
  // Tournament Management
  | 'tournaments.view'
  | 'tournaments.create'
  | 'tournaments.edit'
  | 'tournaments.delete'
  | 'tournaments.manage_brackets'
  | 'tournaments.manage_standings'
  
  // Match Management
  | 'matches.view'
  | 'matches.create'
  | 'matches.edit'
  | 'matches.delete'
  | 'matches.manage_scores'
  | 'matches.manage_events'
  | 'matches.live_tracking'
  
  // Payment Management
  | 'payments.view'
  | 'payments.process'
  | 'payments.refund'
  | 'payments.manage_subscriptions'
  | 'payments.view_reports'
  
  // Analytics & Reporting
  | 'analytics.view'
  | 'analytics.export'
  | 'analytics.configure'
  | 'reports.view'
  | 'reports.create'
  | 'reports.export'
  
  // System Management
  | 'system.view'
  | 'system.configure'
  | 'system.backup'
  | 'system.restore'
  | 'system.logs'
  | 'system.maintenance'
  
  // Content Management
  | 'content.view'
  | 'content.create'
  | 'content.edit'
  | 'content.delete'
  | 'content.moderate'
  | 'content.publish'
  
  // Communication
  | 'messages.send'
  | 'messages.view'
  | 'messages.manage'
  | 'notifications.send'
  | 'notifications.manage'
  
  // Profile Management
  | 'profile.view_own'
  | 'profile.edit_own'
  | 'profile.view_others'
  | 'profile.edit_others';

export type UserRole = 
  | 'SUPER_ADMIN'
  | 'CLUB_ADMIN'
  | 'COACH'
  | 'PLAYER'
  | 'PARENT'
  | 'REFEREE'
  | 'SYSTEM_ADMIN'
  | 'MODERATOR'
  | 'SUPPORT';

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
  description: string;
  level: 'system' | 'club' | 'team' | 'individual';
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  SUPER_ADMIN: {
    role: 'SUPER_ADMIN',
    level: 'system',
    description: 'Full system access with all permissions',
    permissions: [
      // All permissions
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
      'messages.send', 'messages.view', 'messages.manage', 'notifications.send', 'notifications.manage',
      'profile.view_own', 'profile.edit_own', 'profile.view_others', 'profile.edit_others'
    ]
  },

  SYSTEM_ADMIN: {
    role: 'SYSTEM_ADMIN',
    level: 'system',
    description: 'System administration with technical permissions',
    permissions: [
      'users.view', 'users.create', 'users.edit', 'users.delete', 'users.assign_roles',
      'clubs.view', 'clubs.create', 'clubs.edit', 'clubs.delete', 'clubs.approve',
      'teams.view', 'teams.create', 'teams.edit', 'teams.delete',
      'players.view', 'players.create', 'players.edit', 'players.delete',
      'events.view', 'events.create', 'events.edit', 'events.delete',
      'tournaments.view', 'tournaments.create', 'tournaments.edit', 'tournaments.delete',
      'matches.view', 'matches.create', 'matches.edit', 'matches.delete',
      'payments.view', 'payments.process', 'payments.refund',
      'analytics.view', 'analytics.export', 'reports.view', 'reports.create', 'reports.export',
      'system.view', 'system.configure', 'system.backup', 'system.restore', 'system.logs',
      'content.view', 'content.create', 'content.edit', 'content.delete', 'content.moderate',
      'messages.view', 'messages.manage', 'notifications.manage',
      'profile.view_own', 'profile.edit_own', 'profile.view_others', 'profile.edit_others'
    ]
  },

  CLUB_ADMIN: {
    role: 'CLUB_ADMIN',
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
      'messages.send', 'messages.view', 'messages.manage', 'notifications.send', 'notifications.manage',
      'profile.view_own', 'profile.edit_own', 'profile.view_others', 'profile.edit_others'
    ]
  },

  COACH: {
    role: 'COACH',
    level: 'team',
    description: 'Team management with player oversight',
    permissions: [
      'teams.view', 'teams.edit', 'teams.manage_players', 'teams.view_stats',
      'players.view', 'players.edit', 'players.manage_profile', 'players.view_medical',
      'events.view', 'events.create', 'events.edit', 'events.manage_registrations', 'events.manage_schedules',
      'tournaments.view', 'tournaments.view',
      'matches.view', 'matches.create', 'matches.edit', 'matches.manage_scores', 'matches.manage_events', 'matches.live_tracking',
      'analytics.view', 'reports.view',
      'content.view', 'content.create', 'content.edit',
      'messages.send', 'messages.view', 'notifications.send',
      'profile.view_own', 'profile.edit_own', 'profile.view_others'
    ]
  },

  REFEREE: {
    role: 'REFEREE',
    level: 'individual',
    description: 'Match officiating and event management',
    permissions: [
      'events.view', 'events.view',
      'matches.view', 'matches.manage_scores', 'matches.manage_events', 'matches.live_tracking',
      'content.view',
      'messages.send', 'messages.view',
      'profile.view_own', 'profile.edit_own'
    ]
  },

  PLAYER: {
    role: 'PLAYER',
    level: 'individual',
    description: 'Individual player with limited access',
    permissions: [
      'teams.view', 'teams.view_stats',
      'players.view', 'players.manage_profile',
      'events.view', 'events.view',
      'tournaments.view',
      'matches.view',
      'analytics.view',
      'content.view',
      'messages.send', 'messages.view',
      'profile.view_own', 'profile.edit_own'
    ]
  },

  PARENT: {
    role: 'PARENT',
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
  },

  MODERATOR: {
    role: 'MODERATOR',
    level: 'system',
    description: 'Content moderation and user support',
    permissions: [
      'users.view', 'users.edit',
      'content.view', 'content.create', 'content.edit', 'content.delete', 'content.moderate',
      'messages.view', 'messages.manage',
      'notifications.send',
      'profile.view_own', 'profile.edit_own', 'profile.view_others'
    ]
  },

  SUPPORT: {
    role: 'SUPPORT',
    level: 'system',
    description: 'User support and basic assistance',
    permissions: [
      'users.view',
      'content.view',
      'messages.view', 'messages.send',
      'notifications.send',
      'profile.view_own', 'profile.edit_own'
    ]
  }
};

// Helper functions
export const hasPermission = (userRole: UserRole, permission: Permission): boolean => {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  if (!rolePermissions) return false;
  
  return rolePermissions.permissions.includes(permission);
};

export const hasAnyPermission = (userRole: UserRole, permissions: Permission[]): boolean => {
  return permissions.some(permission => hasPermission(userRole, permission));
};

export const hasAllPermissions = (userRole: UserRole, permissions: Permission[]): boolean => {
  return permissions.every(permission => hasPermission(userRole, permission));
};

export const getRoleLevel = (userRole: UserRole): string => {
  return ROLE_PERMISSIONS[userRole]?.level || 'individual';
};

export const canManageRole = (managerRole: UserRole, targetRole: UserRole): boolean => {
  const managerLevel = getRoleLevel(managerRole);
  const targetLevel = getRoleLevel(targetRole);
  
  const levelHierarchy = {
    'system': 3,
    'club': 2,
    'team': 1,
    'individual': 0
  };
  
  return levelHierarchy[managerLevel as keyof typeof levelHierarchy] >= levelHierarchy[targetLevel as keyof typeof levelHierarchy];
};

export const getAvailableRoles = (managerRole: UserRole): UserRole[] => {
  return Object.values(ROLE_PERMISSIONS)
    .filter(role => canManageRole(managerRole, role.role))
    .map(role => role.role);
};

export const getRoleDescription = (userRole: UserRole): string => {
  return ROLE_PERMISSIONS[userRole]?.description || 'No description available';
};
