// Authentication Types
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  phoneNumber: string | null;
  isAnonymous: boolean;
  metadata: {
    creationTime: string;
    lastSignInTime: string;
  };
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  displayName: string;
  phoneNumber?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface OTPVerification {
  phoneNumber: string;
  code: string;
}

export interface GoogleSignInResult {
  user: AuthUser;
  credential: any;
}

export interface AuthError {
  code: string;
  message: string;
}

// Permission Types
export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface RolePermissions {
  role: string;
  permissions: Permission[];
}

// Session Types
export interface UserSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  deviceInfo: DeviceInfo;
  createdAt: Date;
}

export interface DeviceInfo {
  userAgent: string;
  ipAddress: string;
  deviceType: 'web' | 'mobile' | 'tablet';
  platform: string;
} 