import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAPI } from '../lib/firebase';
import { 
  User, 
  Club, 
  Team, 
  Event, 
  Tournament, 
  LiveMatch, 
  LiveMatchEvent,
  Notification
} from '../../../shared/src/types';

// Base API hook
export const useMobileApi = () => {
  return getAPI();
};

// Specific subscription hooks for each type
export const useMobileUsersSubscription = (
  constraints: Array<{ field: string; operator: any; value: any }> = [],
  callback: (users: User[]) => void
) => {
  const api = useMobileApi();
  return api.users.subscribeToUsers(constraints, callback);
};

export const useMobileClubsSubscription = (
  constraints: Array<{ field: string; operator: any; value: any }> = [],
  callback: (clubs: Club[]) => void
) => {
  const api = useMobileApi();
  return api.clubs.subscribeToClubs(constraints, callback);
};

export const useMobileTeamsSubscription = (
  constraints: Array<{ field: string; operator: any; value: any }> = [],
  callback: (teams: Team[]) => void
) => {
  const api = useMobileApi();
  return api.teams.subscribeToTeams(constraints, callback);
};

export const useMobileEventsSubscription = (
  constraints: Array<{ field: string; operator: any; value: any }> = [],
  callback: (events: Event[]) => void
) => {
  const api = useMobileApi();
  return api.events.subscribeToEvents(constraints, callback);
};

export const useMobileTournamentsSubscription = (
  constraints: Array<{ field: string; operator: any; value: any }> = [],
  callback: (tournaments: Tournament[]) => void
) => {
  const api = useMobileApi();
  return api.tournaments.subscribeToTournaments(constraints, callback);
};

export const useMobileMatchesSubscription = (
  constraints: Array<{ field: string; operator: any; value: any }> = [],
  callback: (matches: any[]) => void
) => {
  const api = useMobileApi();
  return api.matches.subscribeToMatches(constraints, callback);
};

export const useMobileNotificationsSubscription = (
  constraints: Array<{ field: string; operator: any; value: any }> = [],
  callback: (notifications: Notification[]) => void
) => {
  const api = useMobileApi();
  return api.notifications.subscribeToNotifications(constraints, callback);
};

// Auth hooks
export const useMobileAuth = () => {
  const api = useMobileApi();
  
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: () => api.auth.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const signInMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      api.auth.signIn(email, password),
    onSuccess: () => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
    },
  });

  const signUpMutation = useMutation({
    mutationFn: ({ email, password, displayName }: { email: string; password: string; displayName: string }) => 
      api.auth.signUp(email, password, displayName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
    },
  });

  const signOutMutation = useMutation({
    mutationFn: () => api.auth.signOut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: ({ userId, userData }: { userId: string; userData: Partial<User> }) => 
      api.users.updateUser(userId, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return {
    user,
    loading: isLoading,
    error,
    signIn: signInMutation.mutate,
    signUp: signUpMutation.mutate,
    signOut: signOutMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
    isSigningIn: signInMutation.isPending,
    isSigningUp: signUpMutation.isPending,
    isSigningOut: signOutMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
  };
};

// User hooks
export const useMobileUser = (userId?: string) => {
  const api = useMobileApi();
  
  return useQuery({
    queryKey: ['users', userId],
    queryFn: () => api.users.getUser(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMobileUsers = (filters: Array<{ field: string; operator: any; value: any }> = []) => {
  const api = useMobileApi();
  
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => api.users.getUsers(filters),
    staleTime: 2 * 60 * 1000,
  });
};

export const useMobileCreateUser = () => {
  const api = useMobileApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: Partial<User>) => api.users.createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useMobileUpdateUser = () => {
  const api = useMobileApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, userData }: { userId: string; userData: Partial<User> }) => 
      api.users.updateUser(userId, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// Club hooks
export const useMobileClubs = (filters: Array<{ field: string; operator: any; value: any }> = []) => {
  const api = useMobileApi();
  
  return useQuery({
    queryKey: ['clubs', filters],
    queryFn: () => api.clubs.getClubs(filters),
    staleTime: 2 * 60 * 1000,
  });
};

export const useMobileClub = (clubId?: string) => {
  const api = useMobileApi();
  
  return useQuery({
    queryKey: ['clubs', clubId],
    queryFn: () => api.clubs.getClub(clubId!),
    enabled: !!clubId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMobileCreateClub = () => {
  const api = useMobileApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: Partial<Club>) => api.clubs.createClub(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
    },
  });
};

export const useMobileUpdateClub = () => {
  const api = useMobileApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ clubId, clubData }: { clubId: string; clubData: Partial<Club> }) => 
      api.clubs.updateClub(clubId, clubData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
    },
  });
};

// Team hooks
export const useMobileTeams = (filters: Array<{ field: string; operator: any; value: any }> = []) => {
  const api = useMobileApi();
  
  return useQuery({
    queryKey: ['teams', filters],
    queryFn: () => api.teams.getTeams(filters),
    staleTime: 2 * 60 * 1000,
  });
};

export const useMobileTeam = (teamId?: string) => {
  const api = useMobileApi();
  
  return useQuery({
    queryKey: ['teams', teamId],
    queryFn: () => api.teams.getTeam(teamId!),
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMobileCreateTeam = () => {
  const api = useMobileApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: Partial<Team>) => api.teams.createTeam(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

export const useMobileUpdateTeam = () => {
  const api = useMobileApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ teamId, teamData }: { teamId: string; teamData: Partial<Team> }) => 
      api.teams.updateTeam(teamId, teamData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

// Event hooks
export const useMobileEvents = (filters: Array<{ field: string; operator: any; value: any }> = []) => {
  const api = useMobileApi();
  
  return useQuery({
    queryKey: ['events', filters],
    queryFn: () => api.events.getEvents(filters),
    staleTime: 2 * 60 * 1000,
  });
};

export const useMobileEvent = (eventId?: string) => {
  const api = useMobileApi();
  
  return useQuery({
    queryKey: ['events', eventId],
    queryFn: () => api.events.getEvent(eventId!),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMobileCreateEvent = () => {
  const api = useMobileApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: Partial<Event>) => api.events.createEvent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useMobileUpdateEvent = () => {
  const api = useMobileApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ eventId, eventData }: { eventId: string; eventData: Partial<Event> }) => 
      api.events.updateEvent(eventId, eventData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

// Tournament hooks
export const useMobileTournaments = (filters: Array<{ field: string; operator: any; value: any }> = []) => {
  const api = useMobileApi();
  
  return useQuery({
    queryKey: ['tournaments', filters],
    queryFn: () => api.tournaments.getTournaments(filters),
    staleTime: 2 * 60 * 1000,
  });
};

export const useMobileTournament = (tournamentId?: string) => {
  const api = useMobileApi();
  
  return useQuery({
    queryKey: ['tournaments', tournamentId],
    queryFn: () => api.tournaments.getTournament(tournamentId!),
    enabled: !!tournamentId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMobileCreateTournament = () => {
  const api = useMobileApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: Partial<Tournament>) => api.tournaments.createTournament(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    },
  });
};

export const useMobileUpdateTournament = () => {
  const api = useMobileApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ tournamentId, tournamentData }: { tournamentId: string; tournamentData: Partial<Tournament> }) => 
      api.tournaments.updateTournament(tournamentId, tournamentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    },
  });
};

// Live Match hooks
export const useMobileLiveMatch = (params: { matchId: string }) => {
  const api = useMobileApi();
  
  return useQuery({
    queryKey: ['liveMatch', params.matchId],
    queryFn: () => api.matches.getMatch(params.matchId),
    enabled: !!params.matchId,
    staleTime: 0, // Always fresh for live matches
    refetchInterval: 5000, // Refetch every 5 seconds for live updates
  });
};

export const useMobileMatches = (filters: Array<{ field: string; operator: any; value: any }> = []) => {
  const api = useMobileApi();
  
  return useQuery({
    queryKey: ['matches', filters],
    queryFn: () => api.matches.getMatches(filters),
    staleTime: 2 * 60 * 1000,
  });
};

export const useMobileCreateMatch = () => {
  const api = useMobileApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: any) => api.matches.createMatch(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
};

export const useMobileAddMatchEvent = () => {
  const api = useMobileApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ matchId, event }: { matchId: string; event: LiveMatchEvent }) =>
      api.matches.addMatchEvent(matchId, event),
    onSuccess: (_, { matchId }) => {
      queryClient.invalidateQueries({ queryKey: ['liveMatch', matchId] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
};

// Notification hooks
export const useMobileNotifications = (filters: Array<{ field: string; operator: any; value: any }> = []) => {
  const api = useMobileApi();
  
  return useQuery({
    queryKey: ['notifications', filters],
    queryFn: () => api.notifications.getNotifications(filters),
    staleTime: 1 * 60 * 1000, // 1 minute for notifications
  });
};

export const useMobileMarkNotificationAsRead = () => {
  const api = useMobileApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (notificationId: string) => api.notifications.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMobileMarkAllNotificationsAsRead = () => {
  const api = useMobileApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => api.notifications.markAllAsRead(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// File upload hooks - using club logo upload as an example
export const useMobileFileUpload = () => {
  const api = useMobileApi();
  
  return useMutation({
    mutationFn: ({ file, clubId }: { file: File; clubId: string }) =>
      api.clubs.uploadClubLogo(clubId, file),
  });
};

// Query client for manual invalidation
const queryClient = useQueryClient(); 