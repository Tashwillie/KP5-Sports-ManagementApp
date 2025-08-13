import { QueryClient } from '@tanstack/react-query';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Global default options for queries
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      // Global default options for mutations
      retry: false,
      retryDelay: 0,
    },
  },
});

// Query keys for consistent caching
export const queryKeys = {
  // Teams
  teams: {
    all: ['teams'] as const,
    lists: () => [...queryKeys.teams.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.teams.lists(), { filters }] as const,
    details: () => [...queryKeys.teams.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.teams.details(), id] as const,
    players: (teamId: string) => [...queryKeys.teams.detail(teamId), 'players'] as const,
    coaches: (teamId: string) => [...queryKeys.teams.detail(teamId), 'coaches'] as const,
    stats: (teamId: string) => [...queryKeys.teams.detail(teamId), 'stats'] as const,
    matches: (teamId: string) => [...queryKeys.teams.detail(teamId), 'matches'] as const,
  },

  // Clubs
  clubs: {
    all: ['clubs'] as const,
    lists: () => [...queryKeys.clubs.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.clubs.lists(), { filters }] as const,
    details: () => [...queryKeys.clubs.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.clubs.details(), id] as const,
    teams: (clubId: string) => [...queryKeys.clubs.detail(clubId), 'teams'] as const,
    members: (clubId: string) => [...queryKeys.clubs.detail(clubId), 'members'] as const,
    events: (clubId: string) => [...queryKeys.clubs.detail(clubId), 'events'] as const,
    news: (clubId: string) => [...queryKeys.clubs.detail(clubId), 'news'] as const,
  },

  // Tournaments
  tournaments: {
    all: ['tournaments'] as const,
    lists: () => [...queryKeys.tournaments.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.tournaments.lists(), { filters }] as const,
    details: () => [...queryKeys.tournaments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.tournaments.details(), id] as const,
    teams: (tournamentId: string) => [...queryKeys.tournaments.detail(tournamentId), 'teams'] as const,
    matches: (tournamentId: string) => [...queryKeys.tournaments.detail(tournamentId), 'matches'] as const,
    bracket: (tournamentId: string) => [...queryKeys.tournaments.detail(tournamentId), 'bracket'] as const,
    standings: (tournamentId: string) => [...queryKeys.tournaments.detail(tournamentId), 'standings'] as const,
    participants: (tournamentId: string) => [...queryKeys.tournaments.detail(tournamentId), 'participants'] as const,
  },

  // Matches
  matches: {
    all: ['matches'] as const,
    lists: () => [...queryKeys.matches.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.matches.lists(), { filters }] as const,
    details: () => [...queryKeys.matches.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.matches.details(), id] as const,
    events: (matchId: string) => [...queryKeys.matches.detail(matchId), 'events'] as const,
    statistics: (matchId: string) => [...queryKeys.matches.detail(matchId), 'statistics'] as const,
    timeline: (matchId: string) => [...queryKeys.matches.detail(matchId), 'timeline'] as const,
    highlights: (matchId: string) => [...queryKeys.matches.detail(matchId), 'highlights'] as const,
    live: ['matches', 'live'] as const,
    upcoming: ['matches', 'upcoming'] as const,
    completed: ['matches', 'completed'] as const,
  },

  // Users
  users: {
    all: ['users'] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    profile: () => [...queryKeys.users.all, 'profile'] as const,
    teams: (userId: string) => [...queryKeys.users.detail(userId), 'teams'] as const,
    matches: (userId: string) => [...queryKeys.users.detail(userId), 'matches'] as const,
  },

  // Auth
  auth: {
    user: ['auth', 'user'] as const,
    permissions: ['auth', 'permissions'] as const,
  },

  // Search
  search: {
    teams: (query: string) => ['search', 'teams', query] as const,
    clubs: (query: string) => ['search', 'clubs', query] as const,
    tournaments: (query: string) => ['search', 'tournaments', query] as const,
    matches: (query: string) => ['search', 'matches', query] as const,
    users: (query: string) => ['search', 'users', query] as const,
  },
};

// Mutation keys for consistent cache invalidation
export const mutationKeys = {
  teams: {
    create: ['teams', 'create'] as const,
    update: (id: string) => ['teams', 'update', id] as const,
    delete: (id: string) => ['teams', 'delete', id] as const,
    addPlayer: (teamId: string) => ['teams', 'addPlayer', teamId] as const,
    removePlayer: (teamId: string, playerId: string) => ['teams', 'removePlayer', teamId, playerId] as const,
  },
  clubs: {
    create: ['clubs', 'create'] as const,
    update: (id: string) => ['clubs', 'update', id] as const,
    delete: (id: string) => ['clubs', 'delete', id] as const,
    addMember: (clubId: string) => ['clubs', 'addMember', clubId] as const,
    removeMember: (clubId: string, memberId: string) => ['clubs', 'removeMember', clubId, memberId] as const,
  },
  tournaments: {
    create: ['tournaments', 'create'] as const,
    update: (id: string) => ['tournaments', 'update', id] as const,
    delete: (id: string) => ['tournaments', 'delete', id] as const,
    registerTeam: (tournamentId: string) => ['tournaments', 'registerTeam', tournamentId] as const,
    start: (tournamentId: string) => ['tournaments', 'start', tournamentId] as const,
    end: (tournamentId: string) => ['tournaments', 'end', tournamentId] as const,
  },
  matches: {
    create: ['matches', 'create'] as const,
    update: (id: string) => ['matches', 'update', id] as const,
    delete: (id: string) => ['matches', 'delete', id] as const,
    start: (id: string) => ['matches', 'start', id] as const,
    pause: (id: string) => ['matches', 'pause', id] as const,
    resume: (id: string) => ['matches', 'resume', id] as const,
    end: (id: string) => ['matches', 'end', id] as const,
    addEvent: (matchId: string) => ['matches', 'addEvent', matchId] as const,
    updateScore: (id: string) => ['matches', 'updateScore', id] as const,
  },
};
