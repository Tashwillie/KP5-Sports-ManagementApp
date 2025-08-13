import { Team, Player, TeamMember, TeamInvitation, TeamRole, TeamStats } from '../../../../shared/src/types';
import { apiClient } from '../apiClient';

export class TeamService {
  // Team Management
  static async createTeam(teamData: Partial<Team>): Promise<string> {
    try {
      const team: Omit<Team, 'id'> = {
        clubId: teamData.clubId || '',
        name: teamData.name || '',
        description: teamData.description || '',
        logoURL: teamData.logoURL || '',
        jerseyColors: teamData.jerseyColors || {
          primary: '#000000',
          secondary: '#ffffff',
        },
        ageGroup: teamData.ageGroup || {
          minAge: 0,
          maxAge: 100,
          category: 'Adult',
        },
        division: teamData.division || 'Recreation',
        season: teamData.season || '2024',
        roster: {
          players: [],
          coaches: [],
          managers: [],
        },
        stats: {
          wins: 0,
          losses: 0,
          draws: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0,
          matchesPlayed: 0,
        },
        schedule: {
          practices: [],
          games: [],
        },
        settings: teamData.settings || {
          isPublic: false,
          allowJoinRequests: false,
          requireApproval: true,
          maxPlayers: 20,
          maxCoaches: 3,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: teamData.createdBy || '',
        isActive: true,
      };

      const response = await apiClient.createTeam(team);
      const teamId = response.data.id;

      // Add creator as team manager
      if (teamData.createdBy) {
        await this.addTeamMember({
          teamId,
          userId: teamData.createdBy,
          role: 'manager',
          joinedAt: new Date(),
          isActive: true,
        });
      }

      return teamId;
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

  static async getTeamsByClub(clubId: string, filters?: {
    isActive?: boolean;
    division?: string;
    season?: string;
  }): Promise<Team[]> {
    try {
      const response = await apiClient.getTeams();
      let teams = response.data || [];
      
      // Filter by club
      teams = teams.filter(team => team.clubId === clubId);

      // Apply additional filters
      if (filters?.isActive !== undefined) {
        teams = teams.filter(team => team.isActive === filters.isActive);
      }

      if (filters?.division) {
        teams = teams.filter(team => team.division === filters.division);
      }

      if (filters?.season) {
        teams = teams.filter(team => team.season === filters.season);
      }

      return teams;
    } catch (error) {
      console.error('Error fetching teams by club:', error);
      throw new Error('Failed to fetch teams by club');
    }
  }

  // Team Member Management
  static async addTeamMember(memberData: Omit<TeamMember, 'id'>): Promise<string> {
    try {
      const member: Omit<TeamMember, 'id'> = {
        teamId: memberData.teamId,
        userId: memberData.userId,
        role: memberData.role || 'player',
        position: memberData.position || '',
        jerseyNumber: memberData.jerseyNumber || null,
        joinedAt: new Date(),
        isActive: true,
      };

      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${apiClient.baseURL}/teams/${memberData.teamId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
        body: JSON.stringify(member),
      });

      if (!response.ok) {
        throw new Error('Failed to add team member');
      }

      const result = await response.json();
      return result.data.id;
    } catch (error) {
      console.error('Error adding team member:', error);
      throw new Error('Failed to add team member');
    }
  }

  static async removeTeamMember(teamId: string, userId: string): Promise<void> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${apiClient.baseURL}/teams/${teamId}/members/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove team member');
      }
    } catch (error) {
      console.error('Error removing team member:', error);
      throw new Error('Failed to remove team member');
    }
  }

  static async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${apiClient.baseURL}/teams/${teamId}/members`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch team members');
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw new Error('Failed to fetch team members');
    }
  }

  static async getTeamMember(teamId: string, userId: string): Promise<TeamMember | null> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${apiClient.baseURL}/teams/${teamId}/members/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch team member');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching team member:', error);
      throw new Error('Failed to fetch team member');
    }
  }

  static async updateTeamMember(teamId: string, userId: string, updates: Partial<TeamMember>): Promise<void> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${apiClient.baseURL}/teams/${teamId}/members/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update team member');
      }
    } catch (error) {
      console.error('Error updating team member:', error);
      throw new Error('Failed to update team member');
    }
  }

  // Team Invitation Management
  static async createTeamInvitation(invitationData: Omit<TeamInvitation, 'id'>): Promise<string> {
    try {
      const invitation: Omit<TeamInvitation, 'id'> = {
        teamId: invitationData.teamId,
        email: invitationData.email,
        role: invitationData.role || 'player',
        invitedBy: invitationData.invitedBy,
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        createdAt: new Date(),
      };

      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${apiClient.baseURL}/teams/${invitationData.teamId}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
        body: JSON.stringify(invitation),
      });

      if (!response.ok) {
        throw new Error('Failed to create team invitation');
      }

      const result = await response.json();
      return result.data.id;
    } catch (error) {
      console.error('Error creating team invitation:', error);
      throw new Error('Failed to create team invitation');
    }
  }

  static async getTeamInvitations(teamId: string): Promise<TeamInvitation[]> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${apiClient.baseURL}/teams/${teamId}/invitations`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch team invitations');
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching team invitations:', error);
      throw new Error('Failed to fetch team invitations');
    }
  }

  // Team Statistics
  static async updateTeamStats(teamId: string, stats: Partial<TeamStats>): Promise<void> {
    try {
      await this.updateTeam(teamId, { stats });
    } catch (error) {
      console.error('Error updating team stats:', error);
      throw new Error('Failed to update team stats');
    }
  }

  static async calculateTeamStats(teamId: string): Promise<TeamStats> {
    try {
      // Note: This would need to be implemented in the backend API
      // For now, we'll return a default stats object
      return {
        wins: 0,
        losses: 0,
        draws: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
        matchesPlayed: 0,
      };
    } catch (error) {
      console.error('Error calculating team stats:', error);
      throw new Error('Failed to calculate team stats');
    }
  }

  // Real-time subscriptions (simplified for API-based approach)
  static subscribeToTeam(teamId: string, callback: (team: Team | null) => void): () => void {
    // For API-based approach, we'll use polling instead of real-time subscriptions
    const interval = setInterval(async () => {
      try {
        const team = await this.getTeam(teamId);
        callback(team);
      } catch (error) {
        console.error('Error in team subscription:', error);
        callback(null);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }

  static subscribeToTeamMembers(teamId: string, callback: (members: TeamMember[]) => void): () => void {
    // For API-based approach, we'll use polling instead of real-time subscriptions
    const interval = setInterval(async () => {
      try {
        const members = await this.getTeamMembers(teamId);
        callback(members);
      } catch (error) {
        console.error('Error in team members subscription:', error);
        callback([]);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }

  // Helper method to update team roster
  private static async updateTeamRoster(teamId: string, userId: string, role: TeamRole, action: 'add' | 'remove'): Promise<void> {
    try {
      const team = await this.getTeam(teamId);
      if (!team) {
        throw new Error('Team not found');
      }

      const roster = team.roster || { players: [], coaches: [], managers: [] };

      if (action === 'add') {
        if (role === 'player' && !roster.players.includes(userId)) {
          roster.players.push(userId);
        } else if (role === 'coach' && !roster.coaches.includes(userId)) {
          roster.coaches.push(userId);
        } else if (role === 'manager' && !roster.managers.includes(userId)) {
          roster.managers.push(userId);
        }
      } else if (action === 'remove') {
        if (role === 'player') {
          roster.players = roster.players.filter(id => id !== userId);
        } else if (role === 'coach') {
          roster.coaches = roster.coaches.filter(id => id !== userId);
        } else if (role === 'manager') {
          roster.managers = roster.managers.filter(id => id !== userId);
        }
      }

      await this.updateTeam(teamId, { roster });
    } catch (error) {
      console.error('Error updating team roster:', error);
      throw new Error('Failed to update team roster');
    }
  }
} 