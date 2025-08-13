// Permission types for the KP5 Academy system
export type Permission = 
  // User management
  | 'users.view'
  | 'users.create'
  | 'users.edit'
  | 'users.delete'
  | 'users.manage_roles'
  
  // Club management
  | 'clubs.view'
  | 'clubs.create'
  | 'clubs.edit'
  | 'clubs.delete'
  | 'clubs.manage_members'
  | 'clubs.manage_teams'
  
  // Team management
  | 'teams.view'
  | 'teams.create'
  | 'teams.edit'
  | 'teams.delete'
  | 'teams.manage_players'
  | 'teams.manage_coaches'
  
  // Player management
  | 'players.view'
  | 'players.create'
  | 'players.edit'
  | 'players.delete'
  | 'players.manage_stats'
  
  // Match management
  | 'matches.view'
  | 'matches.create'
  | 'matches.edit'
  | 'matches.delete'
  | 'matches.manage_events'
  | 'matches.manage_statistics'
  
  // Tournament management
  | 'tournaments.view'
  | 'tournaments.create'
  | 'tournaments.edit'
  | 'tournaments.delete'
  | 'tournaments.manage_brackets'
  | 'tournaments.manage_standings'
  
  // Event management
  | 'events.view'
  | 'events.create'
  | 'events.edit'
  | 'events.delete'
  | 'events.manage_rsvp'
  
  // Analytics and reporting
  | 'analytics.view'
  | 'analytics.export'
  | 'analytics.manage'
  
  // System administration
  | 'system.configure'
  | 'system.monitor'
  | 'system.backup'
  | 'system.logs'
  
  // Financial management
  | 'payments.view'
  | 'payments.process'
  | 'payments.refund'
  | 'payments.manage_plans'
  
  // Communication
  | 'messaging.send'
  | 'messaging.broadcast'
  | 'messaging.manage_templates'
  
  // Media management
  | 'media.upload'
  | 'media.manage'
  | 'media.delete';

export interface UserPermissions {
  userId: string;
  userRole: string;
  permissions: Permission[];
  roleLevel: string;
  roleDescription: string;
  canManageRoles: string[];
}

export interface PermissionCheck {
  hasPermission: boolean;
  userRole: string;
  requiredPermission: Permission;
  userPermissions: Permission[];
}

export interface RoleHierarchy {
  [role: string]: {
    level: number;
    canManage: string[];
  };
}

export interface PermissionSummary {
  role: string;
  level: string;
  description: string;
  totalPermissions: number;
  permissionCategories: Record<string, number>;
}

export interface PermissionValidation {
  hasAllPermissions: boolean;
  missingPermissions: Permission[];
  userPermissions: Permission[];
}
