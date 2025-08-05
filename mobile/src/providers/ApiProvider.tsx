import React, { createContext, useContext, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initializeAPI } from '../lib/firebase';
import API from '../../../shared/src/services/api';

// Create the API context
interface ApiContextType {
  api: API | null;
  isInitialized: boolean;
}

const ApiContext = createContext<ApiContextType>({
  api: null,
  isInitialized: false,
});

// Custom hook to use the API context
export const useApiContext = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApiContext must be used within an ApiProvider');
  }
  return context;
};

// API Provider component
interface ApiProviderProps {
  children: React.ReactNode;
}

export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const [api, setApi] = useState<API | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          return failureCount < 3;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  }));

  useEffect(() => {
    const initializeApi = async () => {
      try {
        // Initialize the API with Firebase services
        const apiInstance = initializeAPI();
        
        setApi(apiInstance);
        setIsInitialized(true);
        
        console.log('✅ Mobile API initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize Mobile API:', error);
        setIsInitialized(true); // Set to true to prevent infinite loading
      }
    };

    initializeApi();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ApiContext.Provider value={{ api, isInitialized }}>
        {children}
      </ApiContext.Provider>
    </QueryClientProvider>
  );
};

export default ApiProvider; 