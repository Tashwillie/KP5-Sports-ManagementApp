// Firebase configuration types and utilities
// This file provides types and utilities for Firebase configuration
// without direct Firebase imports to avoid dependency issues

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface FirebaseServices {
  auth: any;
  firestore: any;
  storage: any;
  functions: any;
  messaging: any;
}

// Authentication types
export interface AuthState {
  user: any;
  loading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithPhone: (phoneNumber: string) => Promise<string>;
  verifyOTP: (verificationId: string, code: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: any) => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Environment validation utilities
export const validateFirebaseConfig = (config: Partial<FirebaseConfig>): string[] => {
  const requiredFields: (keyof FirebaseConfig)[] = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  const missingFields = requiredFields.filter(field => !config[field]);
  return missingFields;
};

// Emulator configuration
export interface EmulatorConfig {
  useEmulators: boolean;
  authHost?: string;
  firestoreHost?: string;
  storageHost?: string;
  functionsHost?: string;
}

export const getEmulatorConfig = (): EmulatorConfig => {
  return {
    useEmulators: process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true',
    authHost: process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST,
    firestoreHost: process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST,
    storageHost: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST,
    functionsHost: process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST,
  };
};

// Notification utilities
export const isNotificationSupported = (): boolean => {
  return typeof globalThis !== 'undefined' && 'Notification' in globalThis;
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNotificationSupported()) {
    console.warn('Notification API not available');
    return false;
  }

  try {
    const permission = await (globalThis as any).Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Firebase service status check
export const checkFirebaseServices = (services: FirebaseServices) => {
  const status = {
    auth: !!services.auth,
    firestore: !!services.firestore,
    storage: !!services.storage,
    functions: !!services.functions,
    messaging: !!services.messaging,
  };

  console.log('🔍 Firebase services status:', status);
  return status;
};

// Environment variable helpers
export const getFirebaseConfigFromEnv = (): FirebaseConfig => {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  };
};

// Validation and error reporting
export const validateEnvironment = (): { isValid: boolean; errors: string[] } => {
  const config = getFirebaseConfigFromEnv();
  const missingFields = validateFirebaseConfig(config);
  
  const errors: string[] = [];
  
  if (missingFields.length > 0) {
    errors.push(`Missing required Firebase environment variables: ${missingFields.join(', ')}`);
  }

  if (!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY) {
    errors.push('Missing Firebase VAPID key for push notifications');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Authentication error handling
export const getAuthErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password should be at least 6 characters long.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/operation-not-allowed': 'This operation is not allowed.',
    'auth/invalid-credential': 'Invalid credentials. Please try again.',
    'auth/account-exists-with-different-credential': 'An account already exists with the same email address but different sign-in credentials.',
    'auth/requires-recent-login': 'This operation requires recent authentication. Please sign in again.',
    'auth/invalid-verification-code': 'Invalid verification code. Please try again.',
    'auth/invalid-verification-id': 'Invalid verification ID. Please try again.',
    'auth/quota-exceeded': 'Quota exceeded. Please try again later.',
  };

  return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
};

// User role validation
export const isValidUserRole = (role: string): boolean => {
  const validRoles = ['super_admin', 'club_admin', 'coach', 'player', 'parent', 'referee'];
  return validRoles.includes(role);
};

// Permission checking utilities
export const hasPermission = (userRole: string, requiredRole: string): boolean => {
  const roleHierarchy = {
    'super_admin': 6,
    'club_admin': 5,
    'coach': 4,
    'referee': 3,
    'player': 2,
    'parent': 1,
  };

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

  return userLevel >= requiredLevel;
};

// Export placeholder functions for Firebase services
// These will be overridden by the actual implementations in web and mobile
export const auth = null;
export const db = null;
export const storage = null;
export const functions = null;
export const onMessageListener = () => () => {}; 