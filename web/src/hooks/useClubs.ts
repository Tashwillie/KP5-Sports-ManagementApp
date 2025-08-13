import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { clubsApiService } from '@/lib/services/clubsApiService';
import { queryKeys, mutationKeys } from '@/lib/react-query';
import { Club, CreateClubRequest, UpdateClubRequest } from '@/lib/services/clubsApiService';

// Query hooks
export const useClubs = (filters?: any) => {
  return useQuery({
    queryKey: queryKeys.clubs.all(filters),
    queryFn: () => clubsApiService.getClubs(filters),
  });
};

export const useClubsInfinite = (filters?: any) => {
  return useQuery({
    queryKey: queryKeys.clubs.infinite(filters),
    queryFn: ({ pageParam = 1 }) => clubsApiService.getClubs({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });
};

export const useClub = (id: string) => {
  return useQuery({
    queryKey: queryKeys.clubs.detail(id),
    queryFn: () => clubsApiService.getClub(id),
    enabled: !!id,
  });
};

export const useClubMembers = (clubId: string) => {
  return useQuery({
    queryKey: queryKeys.clubs.members(clubId),
    queryFn: () => clubsApiService.getClubMembers(clubId),
    enabled: !!clubId,
  });
};

export const useClubTeams = (clubId: string) => {
  return useQuery({
    queryKey: queryKeys.clubs.teams(clubId),
    queryFn: () => clubsApiService.getClubTeams(clubId),
    enabled: !!clubId,
  });
};

export const useClubStats = (clubId: string) => {
  return useQuery({
    queryKey: queryKeys.clubs.stats(clubId),
    queryFn: () => clubsApiService.getClubStats(clubId),
    enabled: !!clubId,
  });
};

export const useClubsByLocation = (location: string) => {
  return useQuery({
    queryKey: queryKeys.clubs.byLocation(location),
    queryFn: () => clubsApiService.getClubsByLocation(location),
    enabled: !!location,
  });
};

export const useSearchClubs = (searchTerm: string) => {
  return useQuery({
    queryKey: queryKeys.clubs.search(searchTerm),
    queryFn: () => clubsApiService.searchClubs(searchTerm),
    enabled: !!searchTerm && searchTerm.length >= 2,
  });
};

// Mutation hooks
export const useCreateClub = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.clubs.create(),
    mutationFn: (data: CreateClubRequest) => clubsApiService.createClub(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Club created successfully!');
        queryClient.invalidateQueries({ queryKey: queryKeys.clubs.all() });
        queryClient.invalidateQueries({ queryKey: queryKeys.clubs.lists() });
      } else {
        toast.error(response.message || 'Failed to create club');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create club');
    },
  });
};

export const useUpdateClub = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.clubs.update(),
    mutationFn: ({ id, data }: { id: string; data: UpdateClubRequest }) =>
      clubsApiService.updateClub(id, data),
    onSuccess: (response, variables) => {
      if (response.success) {
        toast.success('Club updated successfully!');
        queryClient.invalidateQueries({ queryKey: queryKeys.clubs.detail(variables.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.clubs.all() });
        queryClient.invalidateQueries({ queryKey: queryKeys.clubs.lists() });
      } else {
        toast.error(response.message || 'Failed to update club');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update club');
    },
  });
};

export const useDeleteClub = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.clubs.delete(),
    mutationFn: (id: string) => clubsApiService.deleteClub(id),
    onSuccess: (response, id) => {
      if (response.success) {
        toast.success('Club deleted successfully!');
        queryClient.invalidateQueries({ queryKey: queryKeys.clubs.all() });
        queryClient.invalidateQueries({ queryKey: queryKeys.clubs.lists() });
        queryClient.removeQueries({ queryKey: queryKeys.clubs.detail(id) });
      } else {
        toast.error(response.message || 'Failed to delete club');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete club');
    },
  });
};

export const useAddMemberToClub = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.clubs.addMember(),
    mutationFn: ({ clubId, userId, role }: { clubId: string; userId: string; role: string }) =>
      clubsApiService.addMemberToClub(clubId, userId, role),
    onSuccess: (response, variables) => {
      if (response.success) {
        toast.success('Member added to club successfully!');
        queryClient.invalidateQueries({ queryKey: queryKeys.clubs.members(variables.clubId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.clubs.detail(variables.clubId) });
      } else {
        toast.error(response.message || 'Failed to add member to club');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add member to club');
    },
  });
};

export const useRemoveMemberFromClub = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.clubs.removeMember(),
    mutationFn: ({ clubId, userId }: { clubId: string; userId: string }) =>
      clubsApiService.removeMemberFromClub(clubId, userId),
    onSuccess: (response, variables) => {
      if (response.success) {
        toast.success('Member removed from club successfully!');
        queryClient.invalidateQueries({ queryKey: queryKeys.clubs.members(variables.clubId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.clubs.detail(variables.clubId) });
      } else {
        toast.error(response.message || 'Failed to remove member from club');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove member from club');
    },
  });
};

export const useUpdateMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.clubs.updateMemberRole(),
    mutationFn: ({ clubId, userId, role }: { clubId: string; userId: string; role: string }) =>
      clubsApiService.updateMemberRole(clubId, userId, role),
    onSuccess: (response, variables) => {
      if (response.success) {
        toast.success('Member role updated successfully!');
        queryClient.invalidateQueries({ queryKey: queryKeys.clubs.members(variables.clubId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.clubs.detail(variables.clubId) });
      } else {
        toast.error(response.message || 'Failed to update member role');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update member role');
    },
  });
};

export const useUploadClubLogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.clubs.uploadLogo(),
    mutationFn: ({ clubId, logo }: { clubId: string; logo: File }) =>
      clubsApiService.uploadLogo(clubId, logo),
    onSuccess: (response, variables) => {
      if (response.success) {
        toast.success('Club logo uploaded successfully!');
        queryClient.invalidateQueries({ queryKey: queryKeys.clubs.detail(variables.clubId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.clubs.all() });
      } else {
        toast.error(response.message || 'Failed to upload club logo');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to upload club logo');
    },
  });
};

export const useBulkAddMembers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.clubs.bulkAddMembers(),
    mutationFn: ({ clubId, members }: { clubId: string; members: Array<{ userId: string; role: string }> }) =>
      clubsApiService.bulkAddMembers(clubId, members),
    onSuccess: (response, variables) => {
      if (response.success) {
        toast.success(`${response.data?.length || 0} members added to club successfully!`);
        queryClient.invalidateQueries({ queryKey: queryKeys.clubs.members(variables.clubId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.clubs.detail(variables.clubId) });
      } else {
        toast.error(response.message || 'Failed to add members to club');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add members to club');
    },
  });
};

export const useBulkRemoveMembers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.clubs.bulkRemoveMembers(),
    mutationFn: ({ clubId, userIds }: { clubId: string; userIds: string[] }) =>
      clubsApiService.bulkRemoveMembers(clubId, userIds),
    onSuccess: (response, variables) => {
      if (response.success) {
        toast.success(`${variables.userIds.length} members removed from club successfully!`);
        queryClient.invalidateQueries({ queryKey: queryKeys.clubs.members(variables.clubId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.clubs.detail(variables.clubId) });
      } else {
        toast.error(response.message || 'Failed to remove members from club');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove members from club');
    },
  });
};
