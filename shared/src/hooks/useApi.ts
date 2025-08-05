import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '../services/api';
import { User, Club, Team, Event, Tournament, Message, Payment, Notification, LiveMatch } from '../types';

// Hook to get the API instance
export const useApi = () => {
  // Try to get API from globalThis first, then window
  const api = (globalThis as any).api || (typeof globalThis !== 'undefined' && 'window' in globalThis ? (globalThis as any).window?.api : null);
  
  if (!api) {
    throw new Error('API instance not found. Make sure Firebase is properly initialized.');
  }
  
  return api as API;
};

// Generic hook for real-time subscriptions
export const useRealtimeSubscription = <T>(
  subscriptionFn: (callback: (data: T[]) => void) => () => void,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      unsubscribeRef.current = subscriptionFn((newData) => {
        setData(newData);
        setLoading(false);
      });
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, dependencies);

  return { data, loading, error };
};

// Authentication hooks
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    const initializeAuth = async () => {
      try {
        // Try to get the API instance
        const api = (globalThis as any).api || (typeof globalThis !== 'undefined' && 'window' in globalThis ? (globalThis as any).window?.api : null);
        
        if (!api) {
          // If API is not available yet, wait a bit and try again
          setTimeout(initializeAuth, 100);
          return;
        }

        unsubscribe = api.auth.onAuthStateChanged(async (firebaseUser: any) => {
          if (firebaseUser) {
            try {
              const userData = await api.users.getUser(firebaseUser.uid);
              setUser(userData);
            } catch (error) {
              console.error('Error fetching user data:', error);
              setUser(null);
            }
          } else {
            setUser(null);
          }
          setLoading(false);
        });
      } catch (error) {
        console.error('Error initializing auth:', error);
        setError('Failed to initialize authentication');
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const api = useApi();
      await api.auth.signIn(email, password);
    } catch (error) {
      throw error;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    try {
      const api = useApi();
      const firebaseUser = await api.auth.signUp(email, password, displayName);
      // Create user document
      await api.users.createUser({
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: displayName,
        role: 'player',
        teamIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        preferences: {
          notifications: { email: true, push: true, sms: false },
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      });
    } catch (error) {
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const api = useApi();
      await api.auth.signOut();
    } catch (error) {
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const api = useApi();
      await api.auth.resetPassword(email);
    } catch (error) {
      throw error;
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    try {
      const api = useApi();
      if (!user) throw new Error('No user logged in');
      await api.users.updateUser(user.id, updates);
      setUser(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      throw error;
    }
  }, [user]);

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  };
};

// User hooks
export const useUser = (userId: string) => {
  const api = useApi();
  
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => api.users.getUser(userId),
    enabled: !!userId
  });
};

export const useUsers = (constraints: Array<{ field: string; operator: any; value: any }> = []) => {
  const api = useApi();
  
  return useQuery({
    queryKey: ['users', constraints],
    queryFn: () => api.users.getUsers(constraints),
    enabled: true // Allow queries without constraints to fetch all users
  });
};

export const useRealtimeUser = (userId: string) => {
  const api = useApi();
  
  return useRealtimeSubscription(
    (callback) => api.users.subscribeToUser(userId, (user) => callback(user ? [user] : [])),
    [userId]
  );
};

// Club hooks
export const useClub = (clubId: string) => {
  const api = useApi();
  
  return useQuery({
    queryKey: ['club', clubId],
    queryFn: () => api.clubs.getClub(clubId),
    enabled: !!clubId
  });
};

export const useClubs = (constraints: Array<{ field: string; operator: any; value: any }> = []) => {
  const api = useApi();
  
  return useQuery({
    queryKey: ['clubs', constraints],
    queryFn: () => api.clubs.getClubs(constraints),
    enabled: true // Allow queries without constraints to fetch all clubs
  });
};

export const useRealtimeClubs = (constraints: Array<{ field: string; operator: any; value: any }> = []) => {
  const api = useApi();
  
  return useRealtimeSubscription(
    (callback) => api.clubs.subscribeToClubs(constraints, callback),
    [JSON.stringify(constraints)]
  );
};

export const useCreateClub = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (clubData: Partial<Club>) => api.clubs.createClub(clubData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
    }
  });
};

export const useUpdateClub = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ clubId, clubData }: { clubId: string; clubData: Partial<Club> }) => 
      api.clubs.updateClub(clubId, clubData),
    onSuccess: (_, { clubId }) => {
      queryClient.invalidateQueries({ queryKey: ['club', clubId] });
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
    }
  });
};

// Team hooks
export const useTeam = (teamId: string) => {
  const api = useApi();
  
  return useQuery({
    queryKey: ['team', teamId],
    queryFn: () => api.teams.getTeam(teamId),
    enabled: !!teamId
  });
};

export const useTeams = (constraints: Array<{ field: string; operator: any; value: any }> = []) => {
  const api = useApi();
  
  return useQuery({
    queryKey: ['teams', constraints],
    queryFn: () => api.teams.getTeams(constraints),
    enabled: true // Allow queries without constraints to fetch all teams
  });
};

export const useRealtimeTeams = (constraints: Array<{ field: string; operator: any; value: any }> = []) => {
  const api = useApi();
  
  return useRealtimeSubscription(
    (callback) => api.teams.subscribeToTeams(constraints, callback),
    [JSON.stringify(constraints)]
  );
};

export const useCreateTeam = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (teamData: Partial<Team>) => api.teams.createTeam(teamData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    }
  });
};

export const useUpdateTeam = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ teamId, teamData }: { teamId: string; teamData: Partial<Team> }) => 
      api.teams.updateTeam(teamId, teamData),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    }
  });
};

// Event hooks
export const useEvent = (eventId: string) => {
  const api = useApi();
  
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: () => api.events.getEvent(eventId),
    enabled: !!eventId
  });
};

export const useEvents = (constraints: Array<{ field: string; operator: any; value: any }> = []) => {
  const api = useApi();
  
  return useQuery({
    queryKey: ['events', constraints],
    queryFn: () => api.events.getEvents(constraints),
    enabled: true // Allow queries without constraints to fetch all events
  });
};

export const useRealtimeEvents = (constraints: Array<{ field: string; operator: any; value: any }> = []) => {
  const api = useApi();
  
  return useRealtimeSubscription(
    (callback) => api.events.subscribeToEvents(constraints, callback),
    [JSON.stringify(constraints)]
  );
};

export const useCreateEvent = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (eventData: Partial<Event>) => api.events.createEvent(eventData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    }
  });
};

// Match hooks
export const useMatch = (matchId: string) => {
  const api = useApi();
  
  return useQuery({
    queryKey: ['match', matchId],
    queryFn: () => api.matches.getMatch(matchId),
    enabled: !!matchId
  });
};

export const useMatches = (constraints: Array<{ field: string; operator: any; value: any }> = []) => {
  const api = useApi();
  
  return useQuery({
    queryKey: ['matches', constraints],
    queryFn: () => api.matches.getMatches(constraints),
    enabled: true // Allow queries without constraints to fetch all matches
  });
};

export const useRealtimeMatch = (matchId: string) => {
  const api = useApi();
  
  return useRealtimeSubscription(
    (callback) => api.matches.subscribeToMatch(matchId, (match) => callback(match ? [match] : [])),
    [matchId]
  );
};

export const useCreateMatch = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (matchData: Partial<LiveMatch>) => api.matches.createMatch(matchData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    }
  });
};

export const useUpdateMatch = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ matchId, matchData }: { matchId: string; matchData: Partial<LiveMatch> }) => 
      api.matches.updateMatch(matchId, matchData),
    onSuccess: (_, { matchId }) => {
      queryClient.invalidateQueries({ queryKey: ['match', matchId] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    }
  });
};

export const useAddMatchEvent = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ matchId, eventData }: { matchId: string; eventData: any }) => 
      api.matches.addMatchEvent(matchId, eventData),
    onSuccess: (_, { matchId }) => {
      queryClient.invalidateQueries({ queryKey: ['match', matchId] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    }
  });
};

// Tournament hooks
export const useTournament = (tournamentId: string) => {
  const api = useApi();
  
  return useQuery({
    queryKey: ['tournament', tournamentId],
    queryFn: () => api.tournaments.getTournament(tournamentId),
    enabled: !!tournamentId
  });
};

export const useTournaments = (constraints: Array<{ field: string; operator: any; value: any }> = []) => {
  const api = useApi();
  
  return useQuery({
    queryKey: ['tournaments', constraints],
    queryFn: () => api.tournaments.getTournaments(constraints),
    enabled: true // Allow queries without constraints to fetch all tournaments
  });
};

export const useRealtimeTournaments = (constraints: Array<{ field: string; operator: any; value: any }> = []) => {
  const api = useApi();
  
  return useRealtimeSubscription(
    (callback) => api.tournaments.subscribeToTournaments(constraints, callback),
    [JSON.stringify(constraints)]
  );
};

export const useCreateTournament = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (tournamentData: Partial<Tournament>) => api.tournaments.createTournament(tournamentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    }
  });
};

export const useGenerateBrackets = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (tournamentId: string) => api.tournaments.generateBrackets(tournamentId),
    onSuccess: (_, tournamentId) => {
      queryClient.invalidateQueries({ queryKey: ['tournament', tournamentId] });
    }
  });
};

// Message hooks
export const useMessages = (constraints: Array<{ field: string; operator: any; value: any }> = []) => {
  const api = useApi();
  
  return useQuery({
    queryKey: ['messages', constraints],
    queryFn: () => api.messages.getMessages(constraints),
    enabled: true // Allow queries without constraints to fetch all messages
  });
};

export const useRealtimeMessages = (constraints: Array<{ field: string; operator: any; value: any }> = []) => {
  const api = useApi();
  
  return useRealtimeSubscription(
    (callback) => api.messages.subscribeToMessages(constraints, callback),
    [JSON.stringify(constraints)]
  );
};

export const useSendMessage = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (messageData: Partial<Message>) => api.messages.sendMessage(messageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    }
  });
};

export const useMarkMessageAsRead = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ messageId, userId }: { messageId: string; userId: string }) => 
      api.messages.markAsRead(messageId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    }
  });
};

// Payment hooks
export const usePayments = (constraints: Array<{ field: string; operator: any; value: any }> = []) => {
  const api = useApi();
  
  return useQuery({
    queryKey: ['payments', constraints],
    queryFn: () => api.payments.getPayments(constraints),
    enabled: true // Allow queries without constraints to fetch all payments
  });
};

export const useRealtimePayments = (constraints: Array<{ field: string; operator: any; value: any }> = []) => {
  const api = useApi();
  
  return useRealtimeSubscription(
    (callback) => api.payments.subscribeToPayments(constraints, callback),
    [JSON.stringify(constraints)]
  );
};

export const useCreatePaymentIntent = () => {
  const api = useApi();
  
  return useMutation({
    mutationFn: ({ amount, currency, description }: { amount: number; currency: string; description: string }) => 
      api.payments.createPaymentIntent(amount, currency, description)
  });
};

// Notification hooks
export const useNotifications = (constraints: Array<{ field: string; operator: any; value: any }> = []) => {
  const api = useApi();
  
  return useQuery({
    queryKey: ['notifications', constraints],
    queryFn: () => api.notifications.getNotifications(constraints),
    enabled: true // Allow queries without constraints to fetch all notifications
  });
};

export const useRealtimeNotifications = (constraints: Array<{ field: string; operator: any; value: any }> = []) => {
  const api = useApi();
  
  return useRealtimeSubscription(
    (callback) => api.notifications.subscribeToNotifications(constraints, callback),
    [JSON.stringify(constraints)]
  );
};

export const useMarkNotificationAsRead = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (notificationId: string) => api.notifications.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => api.notifications.markAllAsRead(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
};

// File upload hooks
export const useFileUpload = () => {
  const api = useApi();
  
  return useMutation({
    mutationFn: ({ path, file, metadata }: { path: string; file: File; metadata?: any }) => 
      api.clubs.uploadClubLogo('temp', file) // Use a public method instead of protected uploadFile
  });
};

// Custom hook for pagination
export const usePaginatedQuery = <T>(
  queryKey: string[],
  queryFn: (page: number, limit: number) => Promise<T[]>,
  page: number = 1,
  limit: number = 10
) => {
  return useQuery({
    queryKey: [...queryKey, page, limit],
    queryFn: () => queryFn(page, limit),
    placeholderData: (previousData) => previousData // Replace keepPreviousData with placeholderData
  });
};

// Hook for optimistic updates
export const useOptimisticUpdate = <T>(
  queryKey: string[],
  updateFn: (oldData: T | undefined, newData: Partial<T>) => T
) => {
  const queryClient = useQueryClient();
  
  return useCallback((newData: Partial<T>) => {
    queryClient.setQueryData(queryKey, (oldData: T | undefined) => 
      updateFn(oldData, newData)
    );
  }, [queryClient, queryKey, updateFn]);
}; 