'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { auth, db, storage, functions } from '@/lib/firebase';
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
        // Wait for Firebase to be ready
        await new Promise<void>((resolve) => {
          const unsubscribe = auth.onAuthStateChanged(() => {
            unsubscribe();
            resolve();
          });
        });

        // Initialize the API with Firebase services
        const apiInstance = new API(db, storage, functions, auth);
        
        // Make it available globally for the hooks
        (globalThis as any).api = apiInstance;
        
        setApi(apiInstance);
        setIsInitialized(true);
        
        console.log('✅ API initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize API:', error);
        setIsInitialized(true); // Set to true to prevent infinite loading
      }
    };

    initializeApi();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ApiContext.Provider value={{ api, isInitialized }}>
        {children}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </ApiContext.Provider>
    </QueryClientProvider>
  );
};

// Higher-order component to wrap components that need API access
export const withApi = <P extends object>(
  Component: React.ComponentType<P>
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    const { isInitialized } = useApiContext();
    
    if (!isInitialized) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Initializing application...</p>
          </div>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
  
  return WrappedComponent;
};

export default ApiProvider; 