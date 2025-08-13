import apiClient from '@/lib/apiClient';

export interface Club {
  id: string;
  name: string;
  description: string;
  location: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  foundedYear: number;
  totalTeams: number;
  totalMembers: number;
  status: string;
  rating: number;
  address: string;
  sports: string[];
  createdAt: string;
  updatedAt: string;
  activeTeams: number;
  totalPlayers: number;
  upcomingEvents: number;
}

export interface ClubWithStats extends Club {
  // Additional stats can be added here
}

class ClubsService {
  async getClubs(): Promise<ClubWithStats[]> {
    try {
      console.log('🔍 Fetching clubs...');
      const response = await apiClient.getClubs();
      
      if (!response.success) {
        throw new Error('Failed to fetch clubs');
      }

      console.log('✅ Clubs fetched successfully:', response.data.clubs);
      return response.data.clubs.map((club: any) => ({
        id: club.id,
        name: club.name,
        description: club.description || '',
        location: club.location || '',
        contactEmail: club.contactEmail || '',
        contactPhone: club.contactPhone || '',
        website: club.website || '',
        foundedYear: club.foundedYear || new Date().getFullYear(),
        totalTeams: club.teams?.length || 0,
        totalMembers: club.members?.length || 0,
        status: club.status || 'active',
        rating: club.rating || 0,
        address: club.address || '',
        sports: club.sports || ['Football'],
        createdAt: club.createdAt,
        updatedAt: club.updatedAt,
        activeTeams: club.teams?.filter((t: any) => t.status === 'active')?.length || 0,
        totalPlayers: club.teams?.reduce((total: number, team: any) => total + (team.players?.length || 0), 0) || 0,
        upcomingEvents: club.events?.filter((e: any) => new Date(e.startDate) > new Date())?.length || 0,
      }));
    } catch (error) {
      console.error('❌ Error fetching clubs:', error);
      throw error;
    }
  }

  async getClub(id: string): Promise<ClubWithStats> {
    try {
      console.log('🔍 Fetching club:', id);
      const response = await apiClient.getClub(id);
      
      if (!response.success) {
        throw new Error('Failed to fetch club');
      }

      const club = response.data.club;
      return {
        id: club.id,
        name: club.name,
        description: club.description || '',
        location: club.location || '',
        contactEmail: club.contactEmail || '',
        contactPhone: club.contactPhone || '',
        website: club.website || '',
        foundedYear: club.foundedYear || new Date().getFullYear(),
        totalTeams: club.teams?.length || 0,
        totalMembers: club.members?.length || 0,
        status: club.status || 'active',
        rating: club.rating || 0,
        address: club.address || '',
        sports: club.sports || ['Football'],
        createdAt: club.createdAt,
        updatedAt: club.updatedAt,
        activeTeams: club.teams?.filter((t: any) => t.status === 'active')?.length || 0,
        totalPlayers: club.teams?.reduce((total: number, team: any) => total + (team.players?.length || 0), 0) || 0,
        upcomingEvents: club.events?.filter((e: any) => new Date(e.startDate) > new Date())?.length || 0,
      };
    } catch (error) {
      console.error('❌ Error fetching club:', error);
      throw error;
    }
  }

  async createClub(clubData: any): Promise<ClubWithStats> {
    try {
      console.log('🔍 Creating club:', clubData);
      const response = await apiClient.createClub(clubData);
      
      if (!response.success) {
        throw new Error('Failed to create club');
      }

      console.log('✅ Club created successfully:', response.data.club);
      return this.getClub(response.data.club.id);
    } catch (error) {
      console.error('❌ Error creating club:', error);
      throw error;
    }
  }

  async updateClub(id: string, clubData: any): Promise<ClubWithStats> {
    try {
      console.log('🔍 Updating club:', id, clubData);
      const response = await apiClient.updateClub(id, clubData);
      
      if (!response.success) {
        throw new Error('Failed to update club');
      }

      console.log('✅ Club updated successfully:', response.data.club);
      return this.getClub(id);
    } catch (error) {
      console.error('❌ Error updating club:', error);
      throw error;
    }
  }

  async deleteClub(id: string): Promise<void> {
    try {
      console.log('🔍 Deleting club:', id);
      const response = await apiClient.deleteClub(id);
      
      if (!response.success) {
        throw new Error('Failed to delete club');
      }

      console.log('✅ Club deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting club:', error);
      throw error;
    }
  }
}

export default new ClubsService();
