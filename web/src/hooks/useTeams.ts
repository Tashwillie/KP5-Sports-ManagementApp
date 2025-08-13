import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { teamsApiService, Team, CreateTeamRequest, UpdateTeamRequest, TeamFilters, TeamListResponse } from '@/lib/services/teamsApiService';
import { queryKeys, mutationKeys } from '@/lib/react-query';
import { toast } from 'sonner';

// Hook for getting teams with pagination
export function useTeams(filters?: TeamFilters) {
  return useQuery({
    queryKey: queryKeys.teams.list(filters),
    queryFn: () => teamsApiService.getTeams(filters),
    select: (response) => response.data,
  });
}

// Hook for getting teams with infinite scroll
export function useTeamsInfinite(filters?: Omit<TeamFilters, 'page'>) {
  return useInfiniteQuery({
    queryKey: queryKeys.teams.list(filters),
    queryFn: ({ pageParam = 1 }) => 
      teamsApiService.getTeams({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.data?.pagination.currentPage < lastPage.data?.pagination.totalPages) {
        return lastPage.data.pagination.currentPage + 1;
      }
      return undefined;
    },
    select: (data) => ({
      teams: data.pages.flatMap(page => page.data?.teams || []),
      pagination: data.pages[data.pages.length - 1]?.data?.pagination,
    }),
  });
}

// Hook for getting a single team
export function useTeam(id: string) {
  return useQuery({
    queryKey: queryKeys.teams.detail(id),
    queryFn: () => teamsApiService.getTeam(id),
    select: (response) => response.data,
    enabled: !!id,
  });
}

// Hook for getting team players
export function useTeamPlayers(teamId: string) {
  return useQuery({
    queryKey: queryKeys.teams.players(teamId),
    queryFn: () => teamsApiService.getTeamPlayers(teamId),
    select: (response) => response.data,
    enabled: !!teamId,
  });
}

// Hook for getting team coaches
export function useTeamCoaches(teamId: string) {
  return useQuery({
    queryKey: queryKeys.teams.coaches(teamId),
    queryFn: () => teamsApiService.getTeamCoaches(teamId),
    select: (response) => response.data,
    enabled: !!teamId,
  });
}

// Hook for getting team statistics
export function useTeamStats(teamId: string, season?: string) {
  return useQuery({
    queryKey: queryKeys.teams.stats(teamId),
    queryFn: () => teamsApiService.getTeamStats(teamId, season),
    select: (response) => response.data,
    enabled: !!teamId,
  });
}

// Hook for getting team matches
export function useTeamMatches(teamId: string, filters?: {
  status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  season?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.teams.matches(teamId),
    queryFn: () => teamsApiService.getTeamMatches(teamId, filters),
    select: (response) => response.data,
    enabled: !!teamId,
  });
}

// Hook for creating a team
export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.teams.create,
    mutationFn: (data: CreateTeamRequest) => teamsApiService.createTeam(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Team created successfully!');
        // Invalidate and refetch teams list
        queryClient.invalidateQueries({ queryKey: queryKeys.teams.lists() });
        // Add the new team to cache
        queryClient.setQueryData(
          queryKeys.teams.detail(response.data!.id),
          response
        );
      } else {
        toast.error(response.message || 'Failed to create team');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create team');
    },
  });
}

// Hook for updating a team
export function useUpdateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamRequest }) =>
      teamsApiService.updateTeam(id, data),
    onSuccess: (response, { id }) => {
      if (response.success) {
        toast.success('Team updated successfully!');
        // Invalidate and refetch teams list and detail
        queryClient.invalidateQueries({ queryKey: queryKeys.teams.lists() });
        queryClient.invalidateQueries({ queryKey: queryKeys.teams.detail(id) });
        // Update the team in cache
        queryClient.setQueryData(
          queryKeys.teams.detail(id),
          response
        );
      } else {
        toast.error(response.message || 'Failed to update team');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update team');
    },
  });
}

// Hook for deleting a team
export function useDeleteTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => teamsApiService.deleteTeam(id),
    onSuccess: (response, id) => {
      if (response.success) {
        toast.success('Team deleted successfully!');
        // Remove from cache and invalidate lists
        queryClient.removeQueries({ queryKey: queryKeys.teams.detail(id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.teams.lists() });
      } else {
        toast.error(response.message || 'Failed to delete team');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete team');
    },
  });
}

// Hook for adding a player to a team
export function useAddPlayerToTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, playerData }: { 
      teamId: string; 
      playerData: {
        userId: string;
        role: 'PLAYER' | 'CAPTAIN' | 'VICE_CAPTAIN';
        position?: string;
        jerseyNumber?: number;
      };
    }) => teamsApiService.addPlayerToTeam(teamId, playerData),
    onSuccess: (response, { teamId }) => {
      if (response.success) {
        toast.success('Player added to team successfully!');
        // Invalidate team players and team detail
        queryClient.invalidateQueries({ queryKey: queryKeys.teams.players(teamId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.teams.detail(teamId) });
      } else {
        toast.error(response.message || 'Failed to add player to team');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add player to team');
    },
  });
}

// Hook for removing a player from a team
export function useRemovePlayerFromTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, playerId }: { teamId: string; playerId: string }) =>
      teamsApiService.removePlayerFromTeam(teamId, playerId),
    onSuccess: (response, { teamId }) => {
      if (response.success) {
        toast.success('Player removed from team successfully!');
        // Invalidate team players and team detail
        queryClient.invalidateQueries({ queryKey: queryKeys.teams.players(teamId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.teams.detail(teamId) });
      } else {
        toast.error(response.message || 'Failed to remove player from team');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove player from team');
    },
  });
}

// Hook for updating player role
export function useUpdatePlayerRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, playerId, role }: { 
      teamId: string; 
      playerId: string; 
      role: 'PLAYER' | 'CAPTAIN' | 'VICE_CAPTAIN';
    }) => teamsApiService.updatePlayerRole(teamId, playerId, role),
    onSuccess: (response, { teamId }) => {
      if (response.success) {
        toast.success('Player role updated successfully!');
        // Invalidate team players and team detail
        queryClient.invalidateQueries({ queryKey: queryKeys.teams.players(teamId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.teams.detail(teamId) });
      } else {
        toast.error(response.message || 'Failed to update player role');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update player role');
    },
  });
}

// Hook for adding a coach to a team
export function useAddCoachToTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, coachData }: { 
      teamId: string; 
      coachData: {
        userId: string;
        role: 'HEAD_COACH' | 'ASSISTANT_COACH' | 'GOALKEEPER_COACH' | 'FITNESS_COACH';
      };
    }) => teamsApiService.addCoachToTeam(teamId, coachData),
    onSuccess: (response, { teamId }) => {
      if (response.success) {
        toast.success('Coach added to team successfully!');
        // Invalidate team coaches and team detail
        queryClient.invalidateQueries({ queryKey: queryKeys.teams.coaches(teamId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.teams.detail(teamId) });
      } else {
        toast.error(response.message || 'Failed to add coach to team');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add coach to team');
    },
  });
}

// Hook for removing a coach from a team
export function useRemoveCoachFromTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, coachId }: { teamId: string; coachId: string }) =>
      teamsApiService.removeCoachFromTeam(teamId, coachId),
    onSuccess: (response, { teamId }) => {
      if (response.success) {
        toast.success('Coach removed from team successfully!');
        // Invalidate team coaches and team detail
        queryClient.invalidateQueries({ queryKey: queryKeys.teams.coaches(teamId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.teams.detail(teamId) });
      } else {
        toast.error(response.message || 'Failed to remove coach from team');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove coach from team');
    },
  });
}

// Hook for getting available players for a team
export function useAvailablePlayers(teamId: string, filters?: {
  position?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['teams', teamId, 'available-players', filters],
    queryFn: () => teamsApiService.getAvailablePlayers(teamId, filters),
    select: (response) => response.data,
    enabled: !!teamId,
  });
}

// Hook for searching teams
export function useSearchTeams(query: string, filters?: Omit<TeamFilters, 'search'>) {
  return useQuery({
    queryKey: queryKeys.search.teams(query),
    queryFn: () => teamsApiService.searchTeams(query, filters),
    select: (response) => response.data,
    enabled: !!query && query.length > 2,
  });
}

// Hook for getting teams by club
export function useTeamsByClub(clubId: string, filters?: Omit<TeamFilters, 'clubId'>) {
  return useQuery({
    queryKey: ['teams', 'club', clubId, filters],
    queryFn: () => teamsApiService.getTeamsByClub(clubId, filters),
    select: (response) => response.data,
    enabled: !!clubId,
  });
}

// Hook for bulk adding players to a team
export function useBulkAddPlayers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, players }: { 
      teamId: string; 
      players: Array<{
        userId: string;
        role: 'PLAYER' | 'CAPTAIN' | 'VICE_CAPTAIN';
        position?: string;
        jerseyNumber?: number;
      }>;
    }) => teamsApiService.bulkAddPlayers(teamId, players),
    onSuccess: (response, { teamId }) => {
      if (response.success) {
        toast.success(`${response.data?.length || 0} players added to team successfully!`);
        // Invalidate team players and team detail
        queryClient.invalidateQueries({ queryKey: queryKeys.teams.players(teamId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.teams.detail(teamId) });
      } else {
        toast.error(response.message || 'Failed to add players to team');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add players to team');
    },
  });
}

// Hook for bulk removing players from a team
export function useBulkRemovePlayers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, playerIds }: { teamId: string; playerIds: string[] }) =>
      teamsApiService.bulkRemovePlayers(teamId, playerIds),
    onSuccess: (response, { teamId }) => {
      if (response.success) {
        toast.success('Players removed from team successfully!');
        // Invalidate team players and team detail
        queryClient.invalidateQueries({ queryKey: queryKeys.teams.players(teamId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.teams.detail(teamId) });
      } else {
        toast.error(response.message || 'Failed to remove players from team');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove players from team');
    },
  });
}
