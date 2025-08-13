// Firebase imports removed - will be replaced with API calls
import { Club, Team, ClubMember, ClubInvitation, ClubRole, ClubPermission } from '../../../../shared/src/types';
import { apiClient } from '../apiClient';

export class ClubService {
  // Club Management
  static async createClub(clubData: Partial<Club>): Promise<string> {
    try {
      const club: Omit<Club, 'id'> = {
        name: clubData.name || '',
        description: clubData.description || '',
        logoURL: clubData.logoURL || '',
        bannerURL: clubData.bannerURL || '',
        address: clubData.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
        contact: clubData.contact || {
          email: '',
          phone: '',
          website: '',
        },
        socialMedia: clubData.socialMedia || {},
        settings: clubData.settings || {
          isPublic: false,
          allowRegistration: false,
          requireApproval: true,
          maxTeams: 10,
          maxPlayersPerTeam: 20,
        },
        stats: {
          totalTeams: 0,
          totalPlayers: 0,
          totalCoaches: 0,
          totalMatches: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: clubData.createdBy || '',
        isActive: true,
      };

      const response = await apiClient.createClub(club);
      return response.data.id;
    } catch (error) {
      console.error('Error creating club:', error);
      throw new Error('Failed to create club');
    }
  }

  static async getClub(clubId: string): Promise<Club | null> {
    try {
      const response = await apiClient.getClub(clubId);
      return response.data;
    } catch (error) {
      console.error('Error fetching club:', error);
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw new Error('Failed to fetch club');
    }
  }

  static async updateClub(clubId: string, updates: Partial<Club>): Promise<void> {
    try {
      await apiClient.updateClub(clubId, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating club:', error);
      throw new Error('Failed to update club');
    }
  }

  static async deleteClub(clubId: string): Promise<void> {
    try {
      await apiClient.deleteClub(clubId);
    } catch (error) {
      console.error('Error deleting club:', error);
      throw new Error('Failed to delete club');
    }
  }

  static async getClubs(filters?: {
    isPublic?: boolean;
    createdBy?: string;
    limit?: number;
  }): Promise<Club[]> {
    try {
      const response = await apiClient.getClubs();
      let clubs = response.data || [];

      // Apply filters
      if (filters?.isPublic !== undefined) {
        clubs = clubs.filter(club => club.settings?.isPublic === filters.isPublic);
      }

      if (filters?.createdBy) {
        clubs = clubs.filter(club => club.createdBy === filters.createdBy);
      }

      if (filters?.limit) {
        clubs = clubs.slice(0, filters.limit);
      }

      return clubs;
    } catch (error) {
      console.error('Error fetching clubs:', error);
      throw new Error('Failed to fetch clubs');
    }
  }

  // Team Management
  static async createTeam(teamData: Partial<Team>): Promise<string> {
    try {
      const team: Omit<Team, 'id'> = {
        name: teamData.name || '',
        description: teamData.description || '',
        logoURL: teamData.logoURL || '',
        clubId: teamData.clubId || '',
        sport: teamData.sport || 'soccer',
        ageGroup: teamData.ageGroup || '',
        gender: teamData.gender || 'mixed',
        level: teamData.level || 'recreational',
        season: teamData.season || '',
        year: teamData.year || new Date().getFullYear(),
        roster: teamData.roster || [],
        coaches: teamData.coaches || [],
        stats: {
          wins: 0,
          losses: 0,
          draws: 0,
          goalsFor: 0,
          goalsAgainst: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: teamData.createdBy || '',
        isActive: true,
      };

      const response = await apiClient.createTeam(team);
      return response.data.id;
    } catch (error) {
      console.error('Error creating team:', error);
      throw new Error('Failed to create team');
    }
  }

  static async getTeam(teamId: string): Promise<Team | null> {
    try {
      const response = await apiClient.getTeam(teamId);
      return response.data;
    } catch (error) {
      console.error('Error fetching team:', error);
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw new Error('Failed to fetch team');
    }
  }

  static async updateTeam(teamId: string, updates: Partial<Team>): Promise<void> {
    try {
      await apiClient.updateTeam(teamId, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating team:', error);
      throw new Error('Failed to update team');
    }
  }

  static async deleteTeam(teamId: string): Promise<void> {
    try {
      await apiClient.deleteTeam(teamId);
    } catch (error) {
      console.error('Error deleting team:', error);
      throw new Error('Failed to delete team');
    }
  }

  static async getTeamsByClub(clubId: string): Promise<Team[]> {
    try {
      const response = await apiClient.getTeams();
      const teams = response.data || [];
      return teams.filter(team => team.clubId === clubId);
    } catch (error) {
      console.error('Error fetching teams by club:', error);
      throw new Error('Failed to fetch teams by club');
    }
  }

  // Club Member Management
  static async addClubMember(memberData: Omit<ClubMember, 'id'>): Promise<string> {
    try {
      const member: Omit<ClubMember, 'id'> = {
        clubId: memberData.clubId,
        userId: memberData.userId,
        role: memberData.role || 'member',
        permissions: memberData.permissions || [],
        joinedAt: new Date(),
        isActive: true,
      };

      // Note: This would need to be implemented in the backend API
      // For now, we'll use a generic API call
      const response = await fetch(`${apiClient.baseURL}/clubs/${memberData.clubId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
        body: JSON.stringify(member),
      });

      if (!response.ok) {
        throw new Error('Failed to add club member');
      }

      const result = await response.json();
      return result.data.id;
    } catch (error) {
      console.error('Error adding club member:', error);
      throw new Error('Failed to add club member');
    }
  }

  static async getClubMembers(clubId: string): Promise<ClubMember[]> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${apiClient.baseURL}/clubs/${clubId}/members`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch club members');
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching club members:', error);
      throw new Error('Failed to fetch club members');
    }
  }

  // Club Invitation Management
  static async createClubInvitation(invitationData: Omit<ClubInvitation, 'id'>): Promise<string> {
    try {
      const invitation: Omit<ClubInvitation, 'id'> = {
        clubId: invitationData.clubId,
        email: invitationData.email,
        role: invitationData.role || 'member',
        invitedBy: invitationData.invitedBy,
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        createdAt: new Date(),
      };

      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${apiClient.baseURL}/clubs/${invitationData.clubId}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
        body: JSON.stringify(invitation),
      });

      if (!response.ok) {
        throw new Error('Failed to create club invitation');
      }

      const result = await response.json();
      return result.data.id;
    } catch (error) {
      console.error('Error creating club invitation:', error);
      throw new Error('Failed to create club invitation');
    }
  }

  // Real-time subscriptions (simplified for API-based approach)
  static subscribeToClub(clubId: string, callback: (club: Club | null) => void): () => void {
    // For API-based approach, we'll use polling instead of real-time subscriptions
    const interval = setInterval(async () => {
      try {
        const club = await this.getClub(clubId);
        callback(club);
      } catch (error) {
        console.error('Error in club subscription:', error);
        callback(null);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }

  static subscribeToClubTeams(clubId: string, callback: (teams: Team[]) => void): () => void {
    // For API-based approach, we'll use polling instead of real-time subscriptions
    const interval = setInterval(async () => {
      try {
        const teams = await this.getTeamsByClub(clubId);
        callback(teams);
      } catch (error) {
        console.error('Error in club teams subscription:', error);
        callback([]);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }

  // Helper method to update club statistics
  private static async updateClubStats(clubId: string): Promise<void> {
    try {
      const teams = await this.getTeamsByClub(clubId);
      const members = await this.getClubMembers(clubId);

      const stats = {
        totalTeams: teams.length,
        totalPlayers: teams.reduce((sum, team) => sum + (team.roster?.length || 0), 0),
        totalCoaches: teams.reduce((sum, team) => sum + (team.coaches?.length || 0), 0),
        totalMatches: teams.reduce((sum, team) => sum + (team.stats?.wins || 0) + (team.stats?.losses || 0) + (team.stats?.draws || 0), 0),
      };

      await this.updateClub(clubId, { stats });
    } catch (error) {
      console.error('Error updating club stats:', error);
    }
  }
} 