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
      projectId: process.env.EAS_PROJECT_ID || "your-eas-project-id"
    },
    
    // PostgreSQL Backend Configuration
    apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001",
    websocketUrl: process.env.EXPO_PUBLIC_WEBSOCKET_URL || "ws://localhost:3001/ws",
    
    // File Upload Configuration
    fileUploadUrl: process.env.EXPO_PUBLIC_FILE_UPLOAD_URL || "http://localhost:3001/api/upload",
    
    // Feature Flags
    enablePushNotifications: process.env.EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS === 'true',
    enableOfflineMode: process.env.EXPO_PUBLIC_ENABLE_OFFLINE_MODE === 'true',
    enableLocationFeatures: process.env.EXPO_PUBLIC_ENABLE_LOCATION_FEATURES === 'true',
    enableCameraFeatures: process.env.EXPO_PUBLIC_ENABLE_CAMERA_FEATURES === 'true',
    enableRealTime: process.env.EXPO_PUBLIC_ENABLE_REAL_TIME === 'true',
    
    // App Settings
    appName: process.env.EXPO_PUBLIC_APP_NAME || "KP5 Academy",
    appVersion: "1.0.0",
    debugMode: process.env.EXPO_PUBLIC_DEBUG_MODE === 'true',
    
    // Database Configuration
    databaseType: "PostgreSQL",
    backendType: "Node.js + Express",
    realtimeType: "WebSocket (Socket.IO)"
  },
  owner: process.env.EXPO_USERNAME || 'your-expo-username',
  runtimeVersion: {
    policy: 'appVersion'
  },
  updates: {
    url: process.env.EXPO_UPDATES_URL || 'https://u.expo.dev/your-project-id'
  }
}); 