import { ApiConfig } from '../services/apiService';

// Development configuration
const devConfig: ApiConfig = {
  baseUrl: 'http://localhost:3001/api',
  websocketUrl: 'ws://localhost:3001',
  timeout: 10000,
};

// Staging configuration
const stagingConfig: ApiConfig = {
  baseUrl: 'https://staging-api.kp5-academy.com/api',
  websocketUrl: 'wss://staging-api.kp5-academy.com',
  timeout: 15000,
};

// Production configuration
const productionConfig: ApiConfig = {
  baseUrl: 'https://api.kp5-academy.com/api',
  websocketUrl: 'wss://api.kp5-academy.com',
  timeout: 20000,
};

// Get configuration based on environment
const getConfig = (): ApiConfig => {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return productionConfig;
    case 'staging':
      return stagingConfig;
    case 'development':
    default:
      return devConfig;
  }
};

// Export configuration
export const apiConfig = getConfig();

// Export individual configs for testing
export { devConfig, stagingConfig, productionConfig };

// Environment variables for runtime configuration
export const getRuntimeConfig = (): ApiConfig => {
  // Check for runtime environment variables
  const runtimeBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  const runtimeWebsocketUrl = process.env.EXPO_PUBLIC_WEBSOCKET_URL;
  
  if (runtimeBaseUrl || runtimeWebsocketUrl) {
    return {
      baseUrl: runtimeBaseUrl || apiConfig.baseUrl,
      websocketUrl: runtimeWebsocketUrl || apiConfig.websocketUrl,
      timeout: apiConfig.timeout,
    };
  }
  
  return apiConfig;
};

export default apiConfig;
