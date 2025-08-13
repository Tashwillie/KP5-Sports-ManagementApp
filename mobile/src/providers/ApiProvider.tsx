import React, { createContext, useContext, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create the API context
interface ApiContextType {
  api: any | null;
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

// Simple API client for mobile
class MobileApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';
  }

  private async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem('authToken');
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = await this.getToken();
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth methods
  auth = {
    signIn: (email: string, password: string) => 
      this.makeRequest('/auth/signin', { method: 'POST', body: JSON.stringify({ email, password }) }),
    signUp: (email: string, password: string, displayName: string) => 
      this.makeRequest('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, displayName }) }),
    getCurrentUser: () => this.makeRequest('/auth/me'),
    resetPassword: (email: string) => 
      this.makeRequest('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  };

  // User methods
  users = {
    getUser: (userId: string) => this.makeRequest(`/users/${userId}`),
    updateUser: (userId: string, updates: any) => 
      this.makeRequest(`/users/${userId}`, { method: 'PUT', body: JSON.stringify(updates) }),
    createUser: (userData: any) => 
      this.makeRequest('/users', { method: 'POST', body: JSON.stringify(userData) }),
  };

  // Club methods
  clubs = {
    getClubs: () => this.makeRequest('/clubs'),
    getClub: (clubId: string) => this.makeRequest(`/clubs/${clubId}`),
    createClub: (clubData: any) => 
      this.makeRequest('/clubs', { method: 'POST', body: JSON.stringify(clubData) }),
    updateClub: (clubId: string, updates: any) => 
      this.makeRequest(`/clubs/${clubId}`, { method: 'PUT', body: JSON.stringify(updates) }),
    deleteClub: (clubId: string) => 
      this.makeRequest(`/clubs/${clubId}`, { method: 'DELETE' }),
  };

  // Team methods
  teams = {
    getTeams: () => this.makeRequest('/teams'),
    getTeam: (teamId: string) => this.makeRequest(`/teams/${teamId}`),
    createTeam: (teamData: any) => 
      this.makeRequest('/teams', { method: 'POST', body: JSON.stringify(teamData) }),
    updateTeam: (teamId: string, updates: any) => 
      this.makeRequest(`/teams/${teamId}`, { method: 'PUT', body: JSON.stringify(updates) }),
    deleteTeam: (teamId: string) => 
      this.makeRequest(`/teams/${teamId}`, { method: 'DELETE' }),
  };

  // Event methods
  events = {
    getEvents: () => this.makeRequest('/events'),
    getEvent: (eventId: string) => this.makeRequest(`/events/${eventId}`),
    createEvent: (eventData: any) => 
      this.makeRequest('/events', { method: 'POST', body: JSON.stringify(eventData) }),
    updateEvent: (eventId: string, updates: any) => 
      this.makeRequest(`/events/${eventId}`, { method: 'PUT', body: JSON.stringify(updates) }),
    deleteEvent: (eventId: string) => 
      this.makeRequest(`/events/${eventId}`, { method: 'DELETE' }),
  };

  // Tournament methods
  tournaments = {
    getTournaments: () => this.makeRequest('/tournaments'),
    getTournament: (tournamentId: string) => this.makeRequest(`/tournaments/${tournamentId}`),
    createTournament: (tournamentData: any) => 
      this.makeRequest('/tournaments', { method: 'POST', body: JSON.stringify(tournamentData) }),
    updateTournament: (tournamentId: string, updates: any) => 
      this.makeRequest(`/tournaments/${tournamentId}`, { method: 'PUT', body: JSON.stringify(updates) }),
    deleteTournament: (tournamentId: string) => 
      this.makeRequest(`/tournaments/${tournamentId}`, { method: 'DELETE' }),
  };
}

// API Provider component
interface ApiProviderProps {
  children: React.ReactNode;
}

export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const [api, setApi] = useState<any | null>(null);
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
        // Initialize the API client
        const apiInstance = new MobileApiClient();
        
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