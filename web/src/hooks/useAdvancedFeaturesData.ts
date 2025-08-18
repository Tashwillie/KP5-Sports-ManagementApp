import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  advancedFeaturesDataService, 
  BackendTournament, 
  BackendMatch, 
  BackendTournamentMatch,
  transformBackendTournament,
  transformBackendMatch
} from '@/lib/services/advancedFeaturesDataService';
import { Tournament, TournamentMatch } from '@/lib/services/tournamentsApiService';
import { queryKeys } from '@/lib/react-query';

// Query hooks for tournaments
export const useAdvancedTournaments = () => {
  return useQuery({
    queryKey: ['advanced-features', 'tournaments'],
    queryFn: async () => {
      const response = await advancedFeaturesDataService.getTournaments();
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch tournaments');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAdvancedTournament = (tournamentId: string) => {
  return useQuery({
    queryKey: ['advanced-features', 'tournament', tournamentId],
    queryFn: async () => {
      const response = await advancedFeaturesDataService.getTournament(tournamentId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch tournament');
      }
      return response.data;
    },
    enabled: !!tournamentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Query hooks for matches
export const useAdvancedMatches = () => {
  return useQuery({
    queryKey: ['advanced-features', 'matches'],
    queryFn: async () => {
      const response = await advancedFeaturesDataService.getMatches();
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch matches');
      }
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useAdvancedLiveMatches = () => {
  return useQuery({
    queryKey: ['advanced-features', 'matches', 'live'],
    queryFn: async () => {
      const response = await advancedFeaturesDataService.getLiveMatches();
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch live matches');
      }
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds for live data
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

export const useAdvancedUpcomingMatches = () => {
  return useQuery({
    queryKey: ['advanced-features', 'matches', 'upcoming'],
    queryFn: async () => {
      const response = await advancedFeaturesDataService.getUpcomingMatches();
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch upcoming matches');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAdvancedCompletedMatches = () => {
  return useQuery({
    queryKey: ['advanced-features', 'matches', 'completed'],
    queryFn: async () => {
      const response = await advancedFeaturesDataService.getCompletedMatches();
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch completed matches');
      }
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Query hook for tournament matches
export const useAdvancedTournamentMatches = (tournamentId: string) => {
  return useQuery({
    queryKey: ['advanced-features', 'tournament', tournamentId, 'matches'],
    queryFn: async () => {
      const response = await advancedFeaturesDataService.getTournamentMatches(tournamentId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch tournament matches');
      }
      return response.data;
    },
    enabled: !!tournamentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Query hooks for teams and clubs
export const useAdvancedTeams = () => {
  return useQuery({
    queryKey: ['advanced-features', 'teams'],
    queryFn: async () => {
      const response = await advancedFeaturesDataService.getTeams();
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch teams');
      }
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useAdvancedClubs = () => {
  return useQuery({
    queryKey: ['advanced-features', 'clubs'],
    queryFn: async () => {
      const response = await advancedFeaturesDataService.getClubs();
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch clubs');
      }
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Mutation hooks for updating data
export const useUpdateMatchStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ matchId, status }: { matchId: string; status: BackendMatch['status'] }) => {
      const response = await advancedFeaturesDataService.updateMatchStatus(matchId, status);
      if (!response.success) {
        throw new Error(response.message || 'Failed to update match status');
      }
      return response;
    },
    onSuccess: (_, { matchId }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['advanced-features', 'matches'] });
      queryClient.invalidateQueries({ queryKey: ['advanced-features', 'matches', 'live'] });
      queryClient.invalidateQueries({ queryKey: ['advanced-features', 'matches', 'upcoming'] });
      queryClient.invalidateQueries({ queryKey: ['advanced-features', 'matches', 'completed'] });
      
      // Invalidate specific match queries
      queryClient.invalidateQueries({ queryKey: ['advanced-features', 'match', matchId] });
      
      toast.success('Match status updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update match status: ${error.message}`);
    },
  });
};

export const useUpdateMatchScore = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ matchId, homeScore, awayScore }: { 
      matchId: string; 
      homeScore: number; 
      awayScore: number; 
    }) => {
      const response = await advancedFeaturesDataService.updateMatchScore(matchId, homeScore, awayScore);
      if (!response.success) {
        throw new Error(response.message || 'Failed to update match score');
      }
      return response;
    },
    onSuccess: (_, { matchId }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['advanced-features', 'matches'] });
      queryClient.invalidateQueries({ queryKey: ['advanced-features', 'matches', 'live'] });
      queryClient.invalidateQueries({ queryKey: ['advanced-features', 'matches', 'upcoming'] });
      queryClient.invalidateQueries({ queryKey: ['advanced-features', 'matches', 'completed'] });
      
      // Invalidate specific match queries
      queryClient.invalidateQueries({ queryKey: ['advanced-features', 'match', matchId] });
      
      toast.success('Match score updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update match score: ${error.message}`);
    },
  });
};

export const useAddMatchEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ matchId, eventData }: {
      matchId: string;
      eventData: {
        type: 'GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'SUBSTITUTION' | 'INJURY' | 'OTHER';
        minute?: number;
        description?: string;
        playerId?: string;
        teamId?: string;
        data?: any;
      };
    }) => {
      const response = await advancedFeaturesDataService.addMatchEvent(matchId, eventData);
      if (!response.success) {
        throw new Error(response.message || 'Failed to add match event');
      }
      return response;
    },
    onSuccess: (_, { matchId }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['advanced-features', 'matches'] });
      queryClient.invalidateQueries({ queryKey: ['advanced-features', 'matches', 'live'] });
      
      // Invalidate specific match queries
      queryClient.invalidateQueries({ queryKey: ['advanced-features', 'match', matchId] });
      
      toast.success('Match event added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add match event: ${error.message}`);
    },
  });
};

// Utility hooks for transformed data
export const useTransformedTournaments = () => {
  const { data: backendTournaments, isLoading, error, refetch } = useAdvancedTournaments();
  
  const transformedTournaments: Tournament[] = backendTournaments?.map(transformBackendTournament) || [];
  
  return {
    tournaments: transformedTournaments,
    isLoading,
    error,
    refetch,
  };
};

export const useTransformedMatches = () => {
  const { data: backendMatches, isLoading, error, refetch } = useAdvancedMatches();
  
  const transformedMatches: TournamentMatch[] = backendMatches?.map(transformBackendMatch) || [];
  
  return {
    matches: transformedMatches,
    isLoading,
    error,
    refetch,
  };
};

export const useTransformedLiveMatches = () => {
  const { data: backendMatches, isLoading, error, refetch } = useAdvancedLiveMatches();
  
  const transformedMatches: TournamentMatch[] = backendMatches?.map(transformBackendMatch) || [];
  
  return {
    matches: transformedMatches,
    isLoading,
    error,
    refetch,
  };
};

export const useTransformedTournamentMatches = (tournamentId: string) => {
  const { data: backendTournamentMatches, isLoading, error, refetch } = useAdvancedTournamentMatches(tournamentId);
  
  const transformedMatches: TournamentMatch[] = backendTournamentMatches?.map(tm => ({
    ...transformBackendMatch(tm.match),
    tournamentId: tm.tournamentId,
    round: tm.round || 1,
    matchNumber: parseInt(tm.bracket || '1') || 1,
  })) || [];
  
  return {
    matches: transformedMatches,
    isLoading,
    error,
    refetch,
  };
};

// Hook for demo data with fallback to real data
export const useDemoData = () => {
  const { tournaments: realTournaments, isLoading: tournamentsLoading, error: tournamentsError } = useTransformedTournaments();
  const { matches: realMatches, isLoading: matchesLoading, error: matchesError } = useTransformedMatches();
  
  // Check if we have real data
  const hasRealData = realTournaments.length > 0 || realMatches.length > 0;
  
  // If no real data, return loading state
  if (!hasRealData && (tournamentsLoading || matchesLoading)) {
    return {
      hasRealData: false,
      isLoading: true,
      error: null,
      tournaments: [],
      matches: [],
      refetch: () => {},
    };
  }
  
  // If there's an error and no real data, return error state
  if (!hasRealData && (tournamentsError || matchesError)) {
    return {
      hasRealData: false,
      isLoading: false,
      error: tournamentsError || matchesError,
      tournaments: [],
      matches: [],
      refetch: () => {},
    };
  }
  
  // Return real data if available
  if (hasRealData) {
    return {
      hasRealData: true,
      isLoading: false,
      error: null,
      tournaments: realTournaments,
      matches: realMatches,
      refetch: () => {},
    };
  }
  
  // Fallback to empty state
  return {
    hasRealData: false,
    isLoading: false,
    error: null,
    tournaments: [],
    matches: [],
    refetch: () => {},
  };
};
