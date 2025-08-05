import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import Constants from 'expo-constants';
import { API } from '../../../shared/src/services/api';

// Firebase configuration
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey || process.env.FIREBASE_API_KEY,
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain || process.env.FIREBASE_AUTH_DOMAIN,
  projectId: Constants.expoConfig?.extra?.firebaseProjectId || process.env.FIREBASE_PROJECT_ID,
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket || process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId || process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: Constants.expoConfig?.extra?.firebaseAppId || process.env.FIREBASE_APP_ID,
};

// Validate required configuration
const requiredConfig = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
];

for (const key of requiredConfig) {
  if (!firebaseConfig[key as keyof typeof firebaseConfig]) {
    throw new Error(`Missing required Firebase configuration: ${key}`);
  }
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Initialize messaging
let messaging: any = null;
try {
  messaging = getMessaging(app);
} catch (error) {
  console.warn('Firebase messaging not available:', error);
}

// Initialize API instance and make it globally available
let apiInstance: API | null = null;

export const initializeAPI = () => {
  if (!apiInstance) {
    apiInstance = new API(db, storage, functions, auth);
    // Make it available globally for the shared hooks
    if (typeof global !== 'undefined') {
      (global as any).api = apiInstance;
    }
  }
  return apiInstance;
};

export const getAPI = (): API => {
  if (!apiInstance) {
    return initializeAPI();
  }
  return apiInstance;
};

// Initialize API immediately
initializeAPI();

// Connect to emulators in development
if (__DEV__) {
  const useEmulators = Constants.expoConfig?.extra?.useFirebaseEmulators === 'true' || process.env.USE_FIREBASE_EMULATORS === 'true';
  
  if (useEmulators) {
    try {
      // Auth emulator
      const authHost = Constants.expoConfig?.extra?.firebaseAuthEmulatorHost || process.env.FIREBASE_AUTH_EMULATOR_HOST;
      if (authHost) {
        connectAuthEmulator(auth, `http://${authHost}`);
      }

      // Firestore emulator
      const firestoreHost = Constants.expoConfig?.extra?.firebaseFirestoreEmulatorHost || process.env.FIREBASE_FIRESTORE_EMULATOR_HOST;
      if (firestoreHost) {
        connectFirestoreEmulator(db, 'localhost', parseInt(firestoreHost));
      }

      // Storage emulator
      const storageHost = Constants.expoConfig?.extra?.firebaseStorageEmulatorHost || process.env.FIREBASE_STORAGE_EMULATOR_HOST;
      if (storageHost) {
        connectStorageEmulator(storage, 'localhost', parseInt(storageHost));
      }

      // Functions emulator
      const functionsHost = Constants.expoConfig?.extra?.firebaseFunctionsEmulatorHost || process.env.FIREBASE_FUNCTIONS_EMULATOR_HOST;
      if (functionsHost) {
        connectFunctionsEmulator(functions, 'localhost', parseInt(functionsHost));
      }
    } catch (error) {
      console.warn('Failed to connect to Firebase emulators:', error);
    }
  }
}

// Messaging utilities
export const requestNotificationPermission = async (): Promise<string | null> => {
  if (!messaging) return null;

  try {
    const token = await getToken(messaging, {
      vapidKey: Constants.expoConfig?.extra?.firebaseVapidKey || process.env.FIREBASE_VAPID_KEY,
    });
    return token;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

export const onMessageListener = (callback: (payload: any) => void) => {
  if (!messaging) return () => {};

  return onMessage(messaging, callback);
};

// Export the app instance
export { app };
export default app; 