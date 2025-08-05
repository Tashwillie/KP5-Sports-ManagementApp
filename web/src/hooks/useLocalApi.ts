import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiContext } from '@/providers/ApiProvider';
import { useState, useEffect } from 'react';

// Local API hooks that use the ApiProvider context
export const useLocalClubs = (constraints: Array<{ field: string; operator: any; value: any }> = []) => {
  const { api } = useApiContext();
  
  return useQuery({
    queryKey: ['clubs', constraints],
    queryFn: () => api?.clubs.getClubs(constraints) || Promise.resolve([]),
    enabled: !!api
  });
};

export const useLocalTeams = (constraints: Array<{ field: string; operator: any; value: any }> = []) => {
  const { api } = useApiContext();
  
  return useQuery({
    queryKey: ['teams', constraints],
    queryFn: () => api?.teams.getTeams(constraints) || Promise.resolve([]),
    enabled: !!api
  });
};

export const useLocalEvents = (constraints: Array<{ field: string; operator: any; value: any }> = []) => {
  const { api } = useApiContext();
  
  return useQuery({
    queryKey: ['events', constraints],
    queryFn: () => api?.events.getEvents(constraints) || Promise.resolve([]),
    enabled: !!api
  });
};

export const useLocalMatches = (constraints: Array<{ field: string; operator: any; value: any }> = []) => {
  const { api } = useApiContext();
  
  return useQuery({
    queryKey: ['matches', constraints],
    queryFn: () => api?.matches.getMatches(constraints) || Promise.resolve([]),
    enabled: !!api
  });
};

export const useLocalUsers = (constraints: Array<{ field: string; operator: any; value: any }> = []) => {
  const { api } = useApiContext();
  
  return useQuery({
    queryKey: ['users', constraints],
    queryFn: () => api?.users.getUsers(constraints) || Promise.resolve([]),
    enabled: !!api
  });
};

// Auth hook
export const useLocalAuth = () => {
  const { api } = useApiContext();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!api) return;

    const unsubscribe = api.auth.onAuthStateChanged(async (firebaseUser: any) => {
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

    return () => unsubscribe();
  }, [api]);

  // Authentication functions
  const signIn = async (email: string, password: string) => {
    if (!api) throw new Error('API not initialized');
    return await api.auth.signIn(email, password);
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    if (!api) throw new Error('API not initialized');
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
    
    return firebaseUser;
  };

  const signOut = async () => {
    if (!api) throw new Error('API not initialized');
    return await api.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    if (!api) throw new Error('API not initialized');
    return await api.auth.resetPassword(email);
  };

  return { 
    user, 
    loading, 
    signIn, 
    signUp, 
    signOut, 
    resetPassword 
  };
}; 