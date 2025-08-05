import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Sports Management',
  slug: 'sports-management',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.sportsmanagement.app',
    infoPlist: {
      NSPhotoLibraryUsageDescription: 'This app accesses your photo library to upload images for profiles and match content.'
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#FFFFFF'
    },
    package: 'com.sportsmanagement.app',
    permissions: [
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.INTERNET',
      'android.permission.WAKE_LOCK',
      'android.permission.VIBRATE'
    ]
  },
  web: {
    favicon: './assets/favicon.png'
  },
  plugins: [
    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: '#ffffff',
        sounds: ['./assets/notification-sound.wav']
      }
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'Allow Sports Management to access your photo library to upload images for profiles and match content.'
      }
    ]
  ],
  extra: {
    // Firebase configuration
    firebaseApiKey: process.env.FIREBASE_API_KEY || "your-api-key",
    firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID || "your-project-id",
    firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
    firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789",
    firebaseAppId: process.env.FIREBASE_APP_ID || "your-app-id",
    
    // App configuration
    eas: {
      projectId: "your-eas-project-id"
    }
  },
  owner: 'your-expo-username',
  runtimeVersion: {
    policy: 'appVersion'
  },
  updates: {
    url: 'https://u.expo.dev/your-project-id'
  }
}); 