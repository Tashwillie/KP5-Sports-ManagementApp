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
    all: (filters?: any) => filters ? ['teams', 'list', { filters }] : ['teams'] as const,
    lists: () => ['teams', 'list'] as const,
    list: (filters?: any) => filters ? ['teams', 'list', { filters }] : ['teams', 'list'] as const,
    details: () => ['teams', 'detail'] as const,
    detail: (id: string) => ['teams', 'detail', id] as const,
    players: (teamId: string) => [...queryKeys.teams.detail(teamId), 'players'] as const,
    coaches: (teamId: string) => [...queryKeys.teams.detail(teamId), 'coaches'] as const,
    stats: (teamId: string) => [...queryKeys.teams.detail(teamId), 'stats'] as const,
    matches: (teamId: string) => [...queryKeys.teams.detail(teamId), 'matches'] as const,
    infinite: (filters?: any) => ['teams', 'infinite', { filters }] as const,
    byClub: (clubId: string) => ['teams', 'byClub', clubId] as const,
    search: (searchTerm: string) => ['teams', 'search', searchTerm] as const,
    byCategory: (category: string) => ['teams', 'byCategory', category] as const,
  },

  // Clubs
  clubs: {
    all: (filters?: any) => filters ? ['clubs', 'list', { filters }] : ['clubs'] as const,
    lists: () => ['clubs', 'list'] as const,
    list: (filters: any) => ['clubs', 'list', { filters }] as const,
    details: () => ['clubs', 'detail'] as const,
    detail: (id: string) => ['clubs', 'detail', id] as const,
    teams: (clubId: string) => [...queryKeys.clubs.detail(clubId), 'teams'] as const,
    members: (clubId: string) => [...queryKeys.clubs.detail(clubId), 'members'] as const,
    events: (clubId: string) => [...queryKeys.clubs.detail(clubId), 'events'] as const,
    news: (clubId: string) => [...queryKeys.clubs.detail(clubId), 'news'] as const,
    stats: (clubId: string) => [...queryKeys.clubs.detail(clubId), 'stats'] as const,
    infinite: (filters?: any) => ['clubs', 'infinite', { filters }] as const,
    byLocation: (location: string) => ['clubs', 'byLocation', location] as const,
    search: (searchTerm: string) => ['clubs', 'search', searchTerm] as const,
  },

  // Tournaments
  tournaments: {
    all: (filters?: any) => filters ? ['tournaments', 'list', { filters }] : ['tournaments'] as const,
    lists: () => ['tournaments', 'list'] as const,
    list: (filters?: any) => filters ? ['tournaments', 'list', { filters }] : ['tournaments', 'list'] as const,
    details: () => ['tournaments', 'detail'] as const,
    detail: (id: string) => ['tournaments', 'detail', id] as const,
    teams: (tournamentId: string) => [...queryKeys.tournaments.detail(tournamentId), 'teams'] as const,
    matches: (tournamentId: string) => [...queryKeys.tournaments.detail(tournamentId), 'matches'] as const,
    bracket: (tournamentId: string) => [...queryKeys.tournaments.detail(tournamentId), 'bracket'] as const,
    standings: (tournamentId: string) => [...queryKeys.tournaments.detail(tournamentId), 'standings'] as const,
    participants: (tournamentId: string) => [...queryKeys.tournaments.detail(tournamentId), 'participants'] as const,
    infinite: (filters?: any) => ['tournaments', 'infinite', { filters }] as const,
    byLocation: (location: string) => ['tournaments', 'byLocation', location] as const,
    search: (searchTerm: string) => ['tournaments', 'search', searchTerm] as const,
    byStatus: (status: string) => ['tournaments', 'byStatus', status] as const,
    upcoming: () => ['tournaments', 'upcoming'] as const,
    completed: () => ['tournaments', 'completed'] as const,
    ongoing: () => ['tournaments', 'ongoing'] as const,
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
    create: () => ['teams', 'create'] as const,
    update: () => ['teams', 'update'] as const,
    delete: () => ['teams', 'delete'] as const,
    addPlayer: () => ['teams', 'addPlayer'] as const,
    removePlayer: () => ['teams', 'removePlayer'] as const,
    updatePlayer: () => ['teams', 'updatePlayer'] as const,
    addCoach: () => ['teams', 'addCoach'] as const,
    removeCoach: () => ['teams', 'removeCoach'] as const,
    bulkAddPlayers: () => ['teams', 'bulkAddPlayers'] as const,
    bulkRemovePlayers: () => ['teams', 'bulkRemovePlayers'] as const,
  },
  clubs: {
    create: () => ['clubs', 'create'] as const,
    update: () => ['clubs', 'update'] as const,
    delete: () => ['clubs', 'delete'] as const,
    addMember: () => ['clubs', 'addMember'] as const,
    removeMember: () => ['clubs', 'removeMember'] as const,
    updateMemberRole: () => ['clubs', 'updateMemberRole'] as const,
    uploadLogo: () => ['clubs', 'uploadLogo'] as const,
    bulkAddMembers: () => ['clubs', 'bulkAddMembers'] as const,
    bulkRemoveMembers: () => ['clubs', 'bulkRemoveMembers'] as const,
  },
  tournaments: {
    create: () => ['tournaments', 'create'] as const,
    update: () => ['tournaments', 'update'] as const,
    delete: () => ['tournaments', 'delete'] as const,
    registerTeam: () => ['tournaments', 'registerTeam'] as const,
    unregisterTeam: () => ['tournaments', 'unregisterTeam'] as const,
    start: () => ['tournaments', 'start'] as const,
    pause: () => ['tournaments', 'pause'] as const,
    resume: () => ['tournaments', 'resume'] as const,
    end: () => ['tournaments', 'end'] as const,
    generateBracket: () => ['tournaments', 'generateBracket'] as const,
    updateBracket: () => ['tournaments', 'updateBracket'] as const,
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
