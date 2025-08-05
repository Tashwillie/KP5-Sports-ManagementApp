import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator, FirebaseStorage } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator, Functions } from 'firebase/functions';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { API } from '../../../shared/src/services/api';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

// Check if we're in development mode and provide fallback values
const isDevelopment = process.env.NODE_ENV === 'development';
const hasFirebaseConfig = requiredEnvVars.every(envVar => process.env[envVar]);

// Initialize Firebase with proper typing
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let functions: Functions;
let messaging: Messaging | null = null;

try {
  if (!hasFirebaseConfig) {
    if (isDevelopment) {
      console.warn('Firebase environment variables not found. Using development fallback configuration.');
      // Use fallback values for development
      const fallbackConfig = {
        apiKey: 'dev-api-key',
        authDomain: 'dev-project.firebaseapp.com',
        projectId: 'dev-project-id',
        storageBucket: 'dev-project.appspot.com',
        messagingSenderId: '123456789',
        appId: 'dev-app-id',
      };
      app = getApps().length === 0 ? initializeApp(fallbackConfig) : getApp();
    } else {
      throw new Error(`Missing required environment variables: ${requiredEnvVars.filter(envVar => !process.env[envVar]).join(', ')}`);
    }
  } else {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  }
  
  // Initialize Firebase services with proper typing
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  functions = getFunctions(app);

  // Initialize messaging only in browser
  if (typeof window !== 'undefined') {
    try {
      messaging = getMessaging(app);
    } catch (error) {
      console.warn('Firebase messaging not available:', error);
    }
  }

  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  
  // In development, create mock services with proper typing
  if (isDevelopment) {
    console.warn('Using mock Firebase services for development');
    
    // Create mock app and services
    app = { name: '[DEFAULT]' } as FirebaseApp;
    auth = {
      currentUser: null,
      onAuthStateChanged: () => () => {},
      signInWithEmailAndPassword: () => Promise.resolve({ user: null }),
      signOut: () => Promise.resolve(),
    } as unknown as Auth;
    db = {
      collection: () => ({
        add: () => Promise.resolve({ id: 'mock-id' }),
        doc: () => ({
          get: () => Promise.resolve({ exists: false, data: () => null }),
          set: () => Promise.resolve(),
          update: () => Promise.resolve(),
        }),
        onSnapshot: () => () => {},
      }),
    } as unknown as Firestore;
    storage = {
      ref: () => ({
        put: () => Promise.resolve({ ref: { getDownloadURL: () => Promise.resolve('mock-url') } }),
      }),
    } as unknown as FirebaseStorage;
    functions = {
      httpsCallable: () => () => Promise.resolve({ data: {} }),
    } as unknown as Functions;
    messaging = null;
  } else {
    throw error;
  }
}

export { auth, db, storage, functions, messaging };

// Initialize API instance and make it globally available
let apiInstance: API | null = null;

export const initializeAPI = () => {
  if (!apiInstance) {
    apiInstance = new API(db, storage, functions, auth);
    // Make it available globally for the shared hooks
    if (typeof window !== 'undefined') {
      (window as any).api = apiInstance;
    }
    if (typeof globalThis !== 'undefined') {
      (globalThis as any).api = apiInstance;
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
if (isDevelopment) {
  const useEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true';
  
  if (useEmulators) {
    try {
      // Auth emulator
      if (process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST) {
        connectAuthEmulator(
          auth,
          `http://${process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST}`
        );
      }

      // Firestore emulator
      if (process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST) {
        connectFirestoreEmulator(
          db,
          'localhost',
          parseInt(process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST)
        );
      }

      // Storage emulator
      if (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST) {
        connectStorageEmulator(
          storage,
          'localhost',
          parseInt(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST)
        );
      }

      // Functions emulator
      if (process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST) {
        connectFunctionsEmulator(
          functions,
          'localhost',
          parseInt(process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST)
        );
      }

      console.log('🔧 Connected to Firebase emulators');
    } catch (error) {
      console.warn('Failed to connect to Firebase emulators:', error);
    }
  }
}

// Messaging utilities
export const requestNotificationPermission = async (): Promise<string | null> => {
  if (!messaging) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });
      return token;
    }
    return null;
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