import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { tournamentsApiService } from '@/lib/services/tournamentsApiService';
import { queryKeys, mutationKeys } from '@/lib/react-query';
import { Tournament, CreateTournamentRequest, UpdateTournamentRequest } from '@/lib/services/tournamentsApiService';

// Query hooks
export const useTournaments = (filters?: any) => {
  return useQuery({
    queryKey: queryKeys.tournaments.list(filters),
    queryFn: () => tournamentsApiService.getTournaments(filters),
  });
};

export const useTournamentsInfinite = (filters?: any) => {
  return useQuery({
    queryKey: [...queryKeys.tournaments.list(filters), 'infinite'],
    queryFn: ({ pageParam = 1 }) => tournamentsApiService.getTournaments({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });
};

export const useTournament = (id: string) => {
  return useQuery({
    queryKey: queryKeys.tournaments.detail(id),
    queryFn: () => tournamentsApiService.getTournament(id),
    enabled: !!id,
  });
};

export const useTournamentTeams = (tournamentId: string) => {
  return useQuery({
    queryKey: queryKeys.tournaments.teams(tournamentId),
    queryFn: () => tournamentsApiService.getTournamentTeams(tournamentId),
    enabled: !!tournamentId,
  });
};

export const useTournamentMatches = (tournamentId: string) => {
  return useQuery({
    queryKey: queryKeys.tournaments.matches(tournamentId),
    queryFn: () => tournamentsApiService.getTournamentMatches(tournamentId),
    enabled: !!tournamentId,
  });
};

export const useTournamentStandings = (tournamentId: string) => {
  return useQuery({
    queryKey: queryKeys.tournaments.standings(tournamentId),
    queryFn: () => tournamentsApiService.getTournamentStandings(tournamentId),
    enabled: !!tournamentId,
  });
};

export const useTournamentBracket = (tournamentId: string) => {
  return useQuery({
    queryKey: queryKeys.tournaments.bracket(tournamentId),
    queryFn: () => tournamentsApiService.getTournamentBracket(tournamentId),
    enabled: !!tournamentId,
  });
};

export const useTournamentsBySport = (sport: string) => {
  return useQuery({
    queryKey: [...queryKeys.tournaments.all, 'bySport', sport],
    queryFn: () => tournamentsApiService.getTournamentsBySport(sport),
    enabled: !!sport,
  });
};

export const useTournamentsByLocation = (location: string) => {
  return useQuery({
    queryKey: [...queryKeys.tournaments.all, 'byLocation', location],
    queryFn: () => tournamentsApiService.getTournamentsByLocation(location),
    enabled: !!location,
  });
};

export const useSearchTournaments = (searchTerm: string) => {
  return useQuery({
    queryKey: queryKeys.search.tournaments(searchTerm),
    queryFn: () => tournamentsApiService.searchTournaments(searchTerm),
    enabled: !!searchTerm && searchTerm.length >= 2,
  });
};

export const useUpcomingTournaments = () => {
  return useQuery({
    queryKey: [...queryKeys.tournaments.all, 'upcoming'],
    queryFn: () => tournamentsApiService.getUpcomingTournaments(),
  });
};

export const useActiveTournaments = () => {
  return useQuery({
    queryKey: [...queryKeys.tournaments.all, 'active'],
    queryFn: () => tournamentsApiService.getActiveTournaments(),
  });
};

// Mutation hooks
export const useCreateTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.tournaments.create,
    mutationFn: (data: CreateTournamentRequest) => tournamentsApiService.createTournament(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Tournament created successfully!');
        queryClient.invalidateQueries({ queryKey: queryKeys.tournaments.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.tournaments.lists() });
      } else {
        toast.error(response.message || 'Failed to create tournament');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create tournament');
    },
  });
};

export const useUpdateTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.tournaments.update,
    mutationFn: ({ id, data }: { id: string; data: UpdateTournamentRequest }) =>
      tournamentsApiService.updateTournament(id, data),
    onSuccess: (response, variables) => {
      if (response.success) {
        toast.success('Tournament updated successfully!');
        queryClient.invalidateQueries({ queryKey: queryKeys.tournaments.detail(variables.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.tournaments.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.tournaments.lists() });
      } else {
        toast.error(response.message || 'Failed to update tournament');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update tournament');
    },
  });
};

export const useDeleteTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.tournaments.delete,
    mutationFn: (id: string) => tournamentsApiService.deleteTournament(id),
    onSuccess: (response, id) => {
      if (response.success) {
        toast.success('Tournament deleted successfully!');
        queryClient.invalidateQueries({ queryKey: queryKeys.tournaments.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.tournaments.lists() });
        queryClient.removeQueries({ queryKey: queryKeys.tournaments.detail(id) });
      } else {
        toast.error(response.message || 'Failed to delete tournament');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete tournament');
    },
  });
};

export const useRegisterTeamForTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.tournaments.registerTeam,
    mutationFn: ({ tournamentId, teamId, registrationData }: { tournamentId: string; teamId: string; registrationData?: any }) =>
      tournamentsApiService.registerTeamForTournament(tournamentId, teamId, registrationData),
    onSuccess: (response, variables) => {
      if (response.success) {
        toast.success('Team registered for tournament successfully!');
        queryClient.invalidateQueries({ queryKey: queryKeys.tournaments.teams(variables.tournamentId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.tournaments.detail(variables.tournamentId) });
      } else {
        toast.error(response.message || 'Failed to register team for tournament');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to register team for tournament');
    },
  });
};

export const useUnregisterTeamFromTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...mutationKeys.tournaments.delete, 'unregisterTeam'],
    mutationFn: ({ tournamentId, teamId }: { tournamentId: string; teamId: string }) =>
      tournamentsApiService.unregisterTeamFromTournament(tournamentId, teamId),
    onSuccess: (response, variables) => {
      if (response.success) {
        toast.success('Team unregistered from tournament successfully!');
        queryClient.invalidateQueries({ queryKey: queryKeys.tournaments.teams(variables.tournamentId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.tournaments.detail(variables.tournamentId) });
      } else {
        toast.error(response.message || 'Failed to unregister team from tournament');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to unregister team from tournament');
    },
  });
};

export const useGenerateTournamentBracket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...mutationKeys.tournaments.update, 'generateBracket'],
    mutationFn: (tournamentId: string) => tournamentsApiService.generateTournamentBracket(tournamentId),
    onSuccess: (response, tournamentId) => {
      if (response.success) {
        toast.success('Tournament bracket generated successfully!');
        queryClient.invalidateQueries({ queryKey: queryKeys.tournaments.bracket(tournamentId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.tournaments.detail(tournamentId) });
      } else {
        toast.error(response.message || 'Failed to generate tournament bracket');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to generate tournament bracket');
    },
  });
};

export const useUpdateTournamentStandings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...mutationKeys.tournaments.update, 'updateStandings'],
    mutationFn: (tournamentId: string) => tournamentsApiService.updateTournamentStandings(tournamentId),
    onSuccess: (response, tournamentId) => {
      if (response.success) {
        toast.success('Tournament standings updated successfully!');
        queryClient.invalidateQueries({ queryKey: queryKeys.tournaments.standings(tournamentId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.tournaments.detail(tournamentId) });
      } else {
        toast.error(response.message || 'Failed to update tournament standings');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update tournament standings');
    },
  });
};

export const useUploadTournamentLogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...mutationKeys.tournaments.update, 'uploadLogo'],
    mutationFn: ({ tournamentId, logo }: { tournamentId: string; logo: File }) =>
      tournamentsApiService.uploadLogo(tournamentId, logo),
    onSuccess: (response, variables) => {
      if (response.success) {
        toast.success('Tournament logo uploaded successfully!');
        queryClient.invalidateQueries({ queryKey: queryKeys.tournaments.detail(variables.tournamentId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.tournaments.all });
      } else {
        toast.error(response.message || 'Failed to upload tournament logo');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to upload tournament logo');
    },
  });
};

export const useBulkRegisterTeams = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...mutationKeys.tournaments.create, 'bulkRegisterTeams'],
    mutationFn: ({ tournamentId, teamIds, registrationData }: { tournamentId: string; teamIds: string[]; registrationData?: any }) =>
      tournamentsApiService.bulkRegisterTeams(tournamentId, teamIds, registrationData),
    onSuccess: (response, variables) => {
      if (response.success) {
        toast.success(`${response.data?.length || 0} teams registered for tournament successfully!`);
        queryClient.invalidateQueries({ queryKey: queryKeys.tournaments.teams(variables.tournamentId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.tournaments.detail(variables.tournamentId) });
      } else {
        toast.error(response.message || 'Failed to register teams for tournament');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to register teams for tournament');
    },
  });
};

export const useBulkUnregisterTeams = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...mutationKeys.tournaments.delete, 'bulkUnregisterTeams'],
    mutationFn: ({ tournamentId, teamIds }: { tournamentId: string; teamIds: string[] }) =>
      tournamentsApiService.bulkUnregisterTeams(tournamentId, teamIds),
    onSuccess: (response, variables) => {
      if (response.success) {
        toast.success(`${variables.teamIds.length} teams unregistered from tournament successfully!`);
        queryClient.invalidateQueries({ queryKey: queryKeys.tournaments.teams(variables.tournamentId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.tournaments.detail(variables.tournamentId) });
      } else {
        toast.error(response.message || 'Failed to unregister teams from tournament');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to unregister teams from tournament');
    },
  });
};
