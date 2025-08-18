import enhancedApiClient from '@/lib/enhancedApiClient';

export interface UiUser {
  id: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
  // Additional fields for players
  matchesPlayed?: number;
  goalsScored?: number;
  assists?: number;
  rating?: number;
  age?: number;
  teamName?: string;
  status?: 'active' | 'inactive' | 'injured' | 'suspended';
  position?: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'elite';
}

class UsersService {
  async getUsers(params?: { role?: string; isActive?: boolean; search?: string }) {
    try {
      // Build query string from params
      const queryParams = new URLSearchParams();
      if (params?.role) queryParams.append('role', params.role);
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      if (params?.search) queryParams.append('search', params.search);
      
      const endpoint = `/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const resp = await enhancedApiClient.get(endpoint);
      
      console.log('Users service response:', resp);
      
      if (!resp.success) {
        throw new Error(resp.message || 'Failed to fetch users');
      }
      
      // Handle different response structures
      let users = [];
      if (Array.isArray(resp.data)) {
        users = resp.data;
      } else if (resp.data?.users && Array.isArray(resp.data.users)) {
        users = resp.data.users;
      } else if (resp.data?.data && Array.isArray(resp.data.data)) {
        users = resp.data.data;
      } else {
        console.warn('Unexpected users response structure:', resp.data);
        users = [];
      }
      
      return users.map((u: any): UiUser => ({
        id: u.id,
        email: u.email,
        displayName: u.displayName || [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email,
        firstName: u.firstName || undefined,
        lastName: u.lastName || undefined,
        role: (u.role || '').toString().toLowerCase(),
        isActive: !!u.isActive,
        // Add additional fields that might be in the response
        matchesPlayed: u.matchesPlayed || 0,
        goalsScored: u.goalsScored || 0,
        assists: u.assists || 0,
        rating: u.rating || 0,
        age: u.age || 0,
        teamName: u.teamName || u.team?.name || 'Unassigned',
        status: u.status || 'active',
        position: u.position || undefined,
        level: u.level || 'beginner',
      }));
    } catch (error: any) {
      console.error('UsersService error:', error);
      throw new Error(error.message || 'Failed to fetch users');
    }
  }
}

export default new UsersService();

