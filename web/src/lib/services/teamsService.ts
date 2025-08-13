import apiClient from '@/lib/apiClient';

export interface Team {
  id: string;
  name: string;
  sport: string;
  ageGroup: string;
  level: string;
  coach: string;
  players: number;
  maxPlayers: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  goalsScored: number;
  goalsConceded: number;
}

export interface TeamWithStats extends Team {
  // Additional stats can be added here
}

class TeamsService {
  async getTeams(): Promise<TeamWithStats[]> {
    try {
      console.log('🔍 Fetching teams...');
      const response = await apiClient.getTeams();
      
      if (!response.success) {
        throw new Error('Failed to fetch teams');
      }

      console.log('✅ Teams fetched successfully:', response.data.teams);
      return response.data.teams.map((team: any) => ({
        id: team.id,
        name: team.name,
        sport: team.sport || 'Football',
        ageGroup: team.ageGroup || 'U12',
        level: team.level || 'beginner',
        coach: team.coach?.displayName || 'Unassigned',
        players: team.players?.length || 0,
        maxPlayers: team.maxPlayers || 20,
        status: team.status || 'active',
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
        matchesPlayed: team.matches?.length || 0,
        wins: team.matches?.filter((m: any) => m.status === 'COMPLETED' && m.winnerId === team.id)?.length || 0,
        losses: team.matches?.filter((m: any) => m.status === 'COMPLETED' && m.loserId === team.id)?.length || 0,
        draws: team.matches?.filter((m: any) => m.status === 'COMPLETED' && !m.winnerId)?.length || 0,
        goalsScored: team.matches?.reduce((total: number, m: any) => total + (m.homeTeamId === team.id ? m.homeScore : m.awayScore), 0) || 0,
        goalsConceded: team.matches?.reduce((total: number, m: any) => total + (m.homeTeamId === team.id ? m.awayScore : m.homeScore), 0) || 0,
      }));
    } catch (error) {
      console.error('❌ Error fetching teams:', error);
      throw error;
    }
  }

  async getTeam(id: string): Promise<TeamWithStats> {
    try {
      console.log('🔍 Fetching team:', id);
      const response = await apiClient.getTeam(id);
      
      if (!response.success) {
        throw new Error('Failed to fetch team');
      }

      const team = response.data.team;
      return {
        id: team.id,
        name: team.name,
        sport: team.sport || 'Football',
        ageGroup: team.ageGroup || 'U12',
        level: team.level || 'beginner',
        coach: team.coach?.displayName || 'Unassigned',
        players: team.players?.length || 0,
        maxPlayers: team.maxPlayers || 20,
        status: team.status || 'active',
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
        matchesPlayed: team.matches?.length || 0,
        wins: team.matches?.filter((m: any) => m.status === 'COMPLETED' && m.winnerId === team.id)?.length || 0,
        losses: team.matches?.filter((m: any) => m.status === 'COMPLETED' && m.loserId === team.id)?.length || 0,
        draws: team.matches?.filter((m: any) => m.status === 'COMPLETED' && !m.winnerId)?.length || 0,
        goalsScored: team.matches?.reduce((total: number, m: any) => total + (m.homeTeamId === team.id ? m.homeScore : m.awayScore), 0) || 0,
        goalsConceded: team.matches?.reduce((total: number, m: any) => total + (m.homeTeamId === team.id ? m.awayScore : m.homeScore), 0) || 0,
      };
    } catch (error) {
      console.error('❌ Error fetching team:', error);
      throw error;
    }
  }

  async createTeam(teamData: any): Promise<TeamWithStats> {
    try {
      console.log('🔍 Creating team:', teamData);
      const response = await apiClient.createTeam(teamData);
      
      if (!response.success) {
        throw new Error('Failed to create team');
      }

      console.log('✅ Team created successfully:', response.data.team);
      return this.getTeam(response.data.team.id);
    } catch (error) {
      console.error('❌ Error creating team:', error);
      throw error;
    }
  }

  async updateTeam(id: string, teamData: any): Promise<TeamWithStats> {
    try {
      console.log('🔍 Updating team:', id, teamData);
      const response = await apiClient.updateTeam(id, teamData);
      
      if (!response.success) {
        throw new Error('Failed to update team');
      }

      console.log('✅ Team updated successfully:', response.data.team);
      return this.getTeam(id);
    } catch (error) {
      console.error('❌ Error updating team:', error);
      throw error;
    }
  }

  async deleteTeam(id: string): Promise<void> {
    try {
      console.log('🔍 Deleting team:', id);
      const response = await apiClient.deleteTeam(id);
      
      if (!response.success) {
        throw new Error('Failed to delete team');
      }

      console.log('✅ Team deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting team:', error);
      throw error;
    }
  }
}

export default new TeamsService();
