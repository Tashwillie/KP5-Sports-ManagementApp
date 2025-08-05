// Export all types
export * from './types';

// Export all utilities
export * from './utils/constants';
export * from './utils/helpers';
export * from './utils/firebase';

// Export authentication types and utilities
export type { AuthState, AuthContextType, FirebaseConfig, FirebaseServices, EmulatorConfig } from './utils/firebase';
export { 
  validateFirebaseConfig, 
  getEmulatorConfig, 
  isNotificationSupported, 
  requestNotificationPermission,
  checkFirebaseServices,
  getFirebaseConfigFromEnv,
  validateEnvironment,
  getAuthErrorMessage,
  isValidUserRole,
  hasPermission
} from './utils/firebase'; 