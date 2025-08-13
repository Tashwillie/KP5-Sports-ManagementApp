// Permission Types - Mirror frontend permission system
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

export interface RolePermissions {
  role: string;
  permissions: Permission[];
  description: string;
  level: 'system' | 'club' | 'team' | 'individual';
}

export interface PermissionCheck {
  hasPermission: boolean;
  userRole: string;
  requiredPermission: Permission;
  userPermissions: Permission[];
}

export interface UserPermissions {
  userId: string;
  userRole: string;
  permissions: Permission[];
  roleLevel: string;
  roleDescription: string;
  canManageRoles: string[];
}
