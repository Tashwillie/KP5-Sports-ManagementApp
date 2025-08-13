import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'KP5 Academy',
  slug: 'kp5-academy',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#3b82f6'
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.kp5academy.app'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#3b82f6'
    },
    package: 'com.kp5academy.app'
  },
  web: {
    favicon: './assets/favicon.png'
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-file-system',
    'expo-image-picker',
    'expo-media-library',
    'expo-camera',
    'expo-location',
    'expo-notifications',
    'expo-device',
    'expo-constants',
    'expo-linking',
    'expo-splash-screen',
    'expo-status-bar',
    'expo-updates'
  ],
  extra: {
    // App configuration
    eas: {
      projectId: "your-eas-project-id"
    },
    
    // API Configuration
    apiUrl: process.env.EXPO_PUBLIC_API_URL || "https://your-api-url.com",
    websocketUrl: process.env.EXPO_PUBLIC_WEBSOCKET_URL || "wss://your-api-url.com",
    
    // File Upload Configuration
    fileUploadUrl: process.env.EXPO_PUBLIC_FILE_UPLOAD_URL || "https://your-api-url.com/api/upload",
    cloudStorageUrl: process.env.EXPO_PUBLIC_CLOUD_STORAGE_URL || "https://your-storage-bucket.s3.amazonaws.com",
    
    // Feature Flags
    enablePushNotifications: process.env.EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS === 'true',
    enableOfflineMode: process.env.EXPO_PUBLIC_ENABLE_OFFLINE_MODE === 'true',
    enableLocationFeatures: process.env.EXPO_PUBLIC_ENABLE_LOCATION_FEATURES === 'true',
    enableCameraFeatures: process.env.EXPO_PUBLIC_ENABLE_CAMERA_FEATURES === 'true',
    enableRealTime: process.env.EXPO_PUBLIC_ENABLE_REAL_TIME === 'true',
    
    // App Settings
    appName: process.env.EXPO_PUBLIC_APP_NAME || "KP5 Academy",
    appVersion: "1.0.0",
    debugMode: process.env.EXPO_PUBLIC_DEBUG_MODE === 'true'
  },
  owner: 'your-expo-username',
  runtimeVersion: {
    policy: 'appVersion'
  },
  updates: {
    url: 'https://u.expo.dev/your-project-id'
  }
}); 