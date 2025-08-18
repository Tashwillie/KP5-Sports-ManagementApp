// Unified Authentication Types for KP5 Academy Platform

export interface User {
  id: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 
  | 'SUPER_ADMIN'
  | 'CLUB_ADMIN' 
  | 'COACH'
  | 'PLAYER'
  | 'PARENT'
  | 'REFEREE';

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

export interface AuthContextType {
  // State
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (userData: RegisterData) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<AuthResult>;
  forgotPassword: (email: string) => Promise<AuthResult>;
  resetPassword: (token: string, newPassword: string) => Promise<AuthResult>;
  clearError: () => void;
  refreshAuth?: () => Promise<void>;
  
  // Utilities
  hasRole: (role: UserRole | UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
  
  // Token info (optional for web)
  token?: string | null;
  tokenExpiry?: number | null;
  timeUntilExpiry?: number;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  message?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface AuthApiResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
    refreshToken?: string;
  };
  error?: string;
}

// OAuth specific types
export interface OAuthAccount {
  id: string;
  userId: string;
  provider: 'google' | 'facebook' | 'apple';
  providerAccountId: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  scope?: string;
  tokenType?: string;
  createdAt: string;
  updatedAt: string;
}

// Phone verification types
export interface PhoneVerification {
  phone: string;
  code: string;
  expiresAt: string;
}

// Password reset types
export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetData {
  token: string;
  newPassword: string;
}

// Permission types
export type Permission = 
  | 'READ_USERS'
  | 'WRITE_USERS'
  | 'DELETE_USERS'
  | 'READ_CLUBS'
  | 'WRITE_CLUBS'
  | 'DELETE_CLUBS'
  | 'READ_TEAMS'
  | 'WRITE_TEAMS'
  | 'DELETE_TEAMS'
  | 'READ_MATCHES'
  | 'WRITE_MATCHES'
  | 'DELETE_MATCHES'
  | 'REFEREE_MATCHES'
  | 'MANAGE_TOURNAMENTS'
  | 'VIEW_ANALYTICS'
  | 'MANAGE_PAYMENTS'
  | 'SEND_NOTIFICATIONS';

export interface RolePermissions {
  [key: string]: Permission[];
}

// Default role permissions
export const DEFAULT_ROLE_PERMISSIONS: RolePermissions = {
  SUPER_ADMIN: [
    'READ_USERS', 'WRITE_USERS', 'DELETE_USERS',
    'READ_CLUBS', 'WRITE_CLUBS', 'DELETE_CLUBS',
    'READ_TEAMS', 'WRITE_TEAMS', 'DELETE_TEAMS',
    'READ_MATCHES', 'WRITE_MATCHES', 'DELETE_MATCHES',
    'REFEREE_MATCHES', 'MANAGE_TOURNAMENTS',
    'VIEW_ANALYTICS', 'MANAGE_PAYMENTS', 'SEND_NOTIFICATIONS'
  ],
  CLUB_ADMIN: [
    'READ_USERS', 'WRITE_USERS',
    'READ_CLUBS', 'WRITE_CLUBS',
    'READ_TEAMS', 'WRITE_TEAMS',
    'READ_MATCHES', 'WRITE_MATCHES',
    'MANAGE_TOURNAMENTS', 'VIEW_ANALYTICS',
    'MANAGE_PAYMENTS', 'SEND_NOTIFICATIONS'
  ],
  COACH: [
    'READ_USERS', 'READ_TEAMS', 'WRITE_TEAMS',
    'READ_MATCHES', 'WRITE_MATCHES',
    'VIEW_ANALYTICS'
  ],
  PLAYER: [
    'READ_USERS', 'READ_TEAMS', 'READ_MATCHES'
  ],
  PARENT: [
    'READ_USERS', 'READ_TEAMS', 'READ_MATCHES'
  ],
  REFEREE: [
    'READ_MATCHES', 'REFEREE_MATCHES'
  ]
};