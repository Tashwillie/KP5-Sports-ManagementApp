import { 
  Club, 
  Team, 
  ClubMember, 
  ClubInvitation, 
  ClubRole, 
  ClubPermission,
  User 
} from '@kp5-academy/shared';

export class ClubService {
  private static clubsCollection = firestore().collection('clubs');
  private static teamsCollection = firestore().collection('teams');
  private static membersCollection = firestore().collection('club_members');
  private static invitationsCollection = firestore().collection('club_invitations');

  // Club Management
  static async createClub(clubData: Partial<Club>): Promise<string> {
    try {
      const club: Club = {
        id: '',
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

      const docRef = await this.clubsCollection.add(club);
      const clubId = docRef.id;
      
      // Update the club with the generated ID
      await this.clubsCollection.doc(clubId).update({ id: clubId });
      
      return clubId;
    } catch (error) {
      console.error('Error creating club:', error);
      throw new Error('Failed to create club');
    }
  }

  static async getClub(clubId: string): Promise<Club | null> {
    try {
      const doc = await this.clubsCollection.doc(clubId).get();
      if (doc.exists) {
        return doc.data() as Club;
      }
      return null;
    } catch (error) {
      console.error('Error fetching club:', error);
      throw new Error('Failed to fetch club');
    }
  }

  static async updateClub(clubId: string, updates: Partial<Club>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };
      
      await this.clubsCollection.doc(clubId).update(updateData);
    } catch (error) {
      console.error('Error updating club:', error);
      throw new Error('Failed to update club');
    }
  }

  static async deleteClub(clubId: string): Promise<void> {
    try {
      await this.clubsCollection.doc(clubId).update({
        isActive: false,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error deleting club:', error);
      throw new Error('Failed to delete club');
    }
  }

  static async getClubsByUser(userId: string): Promise<Club[]> {
    try {
      const memberDocs = await this.membersCollection
        .where('userId', '==', userId)
        .where('isActive', '==', true)
        .get();

      const clubIds = memberDocs.docs.map((doc: any) => doc.data().clubId);
      
      if (clubIds.length === 0) return [];

      const clubDocs = await Promise.all(
        clubIds.map(id => this.clubsCollection.doc(id).get())
      );

      return clubDocs
        .map(doc => doc.data() as Club)
        .filter(club => club && club.isActive);
    } catch (error) {
      console.error('Error fetching user clubs:', error);
      throw new Error('Failed to fetch user clubs');
    }
  }

  // Team Management
  static async createTeam(teamData: Partial<Team>): Promise<string> {
    try {
      const team: Team = {
        id: '',
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
        },
        schedule: {
          practices: [],
          games: [],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: teamData.createdBy || '',
        isActive: true,
      };

      const docRef = await this.teamsCollection.add(team);
      const teamId = docRef.id;
      
      // Update the team with the generated ID
      await this.teamsCollection.doc(teamId).update({ id: teamId });
      
      // Update club stats
      await this.updateClubStats(team.clubId);
      
      return teamId;
    } catch (error) {
      console.error('Error creating team:', error);
      throw new Error('Failed to create team');
    }
  }

  static async getTeam(teamId: string): Promise<Team | null> {
    try {
      const doc = await this.teamsCollection.doc(teamId).get();
      if (doc.exists) {
        return doc.data() as Team;
      }
      return null;
    } catch (error) {
      console.error('Error fetching team:', error);
      throw new Error('Failed to fetch team');
    }
  }

  static async updateTeam(teamId: string, updates: Partial<Team>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };
      
      await this.teamsCollection.doc(teamId).update(updateData);
    } catch (error) {
      console.error('Error updating team:', error);
      throw new Error('Failed to update team');
    }
  }

  static async getTeamsByClub(clubId: string): Promise<Team[]> {
    try {
      const snapshot = await this.teamsCollection
        .where('clubId', '==', clubId)
        .where('isActive', '==', true)
        .get();

      return snapshot.docs.map((doc: any) => doc.data() as Team);
    } catch (error) {
      console.error('Error fetching club teams:', error);
      throw new Error('Failed to fetch club teams');
    }
  }

  static async getTeamsByUser(userId: string): Promise<Team[]> {
    try {
      const memberDocs = await this.membersCollection
        .where('userId', '==', userId)
        .where('isActive', '==', true)
        .get();

      const teamIds = memberDocs.docs.flatMap((doc: any) => doc.data().teamIds);
      
      if (teamIds.length === 0) return [];

      const teamDocs = await Promise.all(
        teamIds.map(id => this.teamsCollection.doc(id).get())
      );

      return teamDocs
        .map(doc => doc.data() as Team)
        .filter(team => team && team.isActive);
    } catch (error) {
      console.error('Error fetching user teams:', error);
      throw new Error('Failed to fetch user teams');
    }
  }

  // Member Management
  static async addMemberToClub(clubId: string, userId: string, role: ClubRole): Promise<void> {
    try {
      const member: ClubMember = {
        id: `${clubId}_${userId}`,
        clubId,
        userId,
        role,
        teamIds: [],
        permissions: this.getDefaultPermissions(role),
        joinedAt: new Date(),
        isActive: true,
      };

      await this.membersCollection.doc(member.id).set(member);
      
      // Update club stats
      await this.updateClubStats(clubId);
    } catch (error) {
      console.error('Error adding member to club:', error);
      throw new Error('Failed to add member to club');
    }
  }

  static async removeMemberFromClub(clubId: string, userId: string): Promise<void> {
    try {
      await this.membersCollection.doc(`${clubId}_${userId}`).update({
        isActive: false,
      });
      
      // Update club stats
      await this.updateClubStats(clubId);
    } catch (error) {
      console.error('Error removing member from club:', error);
      throw new Error('Failed to remove member from club');
    }
  }

  static async addMemberToTeam(clubId: string, teamId: string, userId: string): Promise<void> {
    try {
      // Add to team roster
      await this.teamsCollection.doc(teamId).update({
        'roster.players': firestore.FieldValue.arrayUnion(userId),
      });

      // Update member's teamIds
      await this.membersCollection.doc(`${clubId}_${userId}`).update({
        teamIds: firestore.FieldValue.arrayUnion(teamId),
      });
    } catch (error) {
      console.error('Error adding member to team:', error);
      throw new Error('Failed to add member to team');
    }
  }

  static async removeMemberFromTeam(clubId: string, teamId: string, userId: string): Promise<void> {
    try {
      // Remove from team roster
      await this.teamsCollection.doc(teamId).update({
        'roster.players': firestore.FieldValue.arrayRemove(userId),
      });

      // Update member's teamIds
      await this.membersCollection.doc(`${clubId}_${userId}`).update({
        teamIds: firestore.FieldValue.arrayRemove(teamId),
      });
    } catch (error) {
      console.error('Error removing member from team:', error);
      throw new Error('Failed to remove member from team');
    }
  }

  static async getClubMembers(clubId: string): Promise<ClubMember[]> {
    try {
      const snapshot = await this.membersCollection
        .where('clubId', '==', clubId)
        .where('isActive', '==', true)
        .get();

      return snapshot.docs.map((doc: any) => doc.data() as ClubMember);
    } catch (error) {
      console.error('Error fetching club members:', error);
      throw new Error('Failed to fetch club members');
    }
  }

  // Invitation Management
  static async sendInvitation(invitationData: Partial<ClubInvitation>): Promise<string> {
    try {
      const invitation: ClubInvitation = {
        id: '',
        clubId: invitationData.clubId || '',
        teamId: invitationData.teamId,
        email: invitationData.email || '',
        role: invitationData.role || 'player',
        invitedBy: invitationData.invitedBy || '',
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        createdAt: new Date(),
      };

      const docRef = await this.invitationsCollection.add(invitation);
      const invitationId = docRef.id;
      
      await this.invitationsCollection.doc(invitationId).update({ id: invitationId });
      
      return invitationId;
    } catch (error) {
      console.error('Error sending invitation:', error);
      throw new Error('Failed to send invitation');
    }
  }

  static async acceptInvitation(invitationId: string, userId: string): Promise<void> {
    try {
      const invitation = await this.invitationsCollection.doc(invitationId).get();
      if (!invitation.exists) {
        throw new Error('Invitation not found');
      }

      const invitationData = invitation.data() as ClubInvitation;
      
      // Add user to club
      await this.addMemberToClub(invitationData.clubId, userId, invitationData.role);
      
      // Add to team if specified
      if (invitationData.teamId) {
        await this.addMemberToTeam(invitationData.clubId, invitationData.teamId, userId);
      }
      
      // Update invitation status
      await this.invitationsCollection.doc(invitationId).update({
        status: 'accepted',
        acceptedAt: new Date(),
      });
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw new Error('Failed to accept invitation');
    }
  }

  static async getPendingInvitations(email: string): Promise<ClubInvitation[]> {
    try {
      const snapshot = await this.invitationsCollection
        .where('email', '==', email)
        .where('status', '==', 'pending')
        .where('expiresAt', '>', new Date())
        .get();

      return snapshot.docs.map((doc: any) => doc.data() as ClubInvitation);
    } catch (error) {
      console.error('Error fetching pending invitations:', error);
      throw new Error('Failed to fetch pending invitations');
    }
  }

  // Helper Methods
  private static getDefaultPermissions(role: ClubRole): ClubPermission[] {
    switch (role) {
      case 'owner':
        return [
          'manage_club',
          'manage_teams',
          'manage_players',
          'manage_schedule',
          'view_analytics',
          'send_notifications',
          'manage_payments',
          'view_roster',
          'edit_profile',
        ];
      case 'admin':
        return [
          'manage_teams',
          'manage_players',
          'manage_schedule',
          'view_analytics',
          'send_notifications',
          'manage_payments',
          'view_roster',
          'edit_profile',
        ];
      case 'coach':
        return [
          'manage_players',
          'manage_schedule',
          'view_analytics',
          'send_notifications',
          'view_roster',
          'edit_profile',
        ];
      case 'player':
        return [
          'view_roster',
          'edit_profile',
        ];
      case 'parent':
        return [
          'view_roster',
          'edit_profile',
        ];
      case 'referee':
        return [
          'view_roster',
          'edit_profile',
        ];
      case 'spectator':
        return [
          'edit_profile',
        ];
      default:
        return ['edit_profile'];
    }
  }

  private static async updateClubStats(clubId: string): Promise<void> {
    try {
      const teams = await this.getTeamsByClub(clubId);
      const members = await this.getClubMembers(clubId);
      
      const stats = {
        totalTeams: teams.length,
        totalPlayers: members.filter(m => m.role === 'player').length,
        totalCoaches: members.filter(m => m.role === 'coach').length,
        totalMatches: 0, // This will be updated when events are implemented
      };

      await this.clubsCollection.doc(clubId).update({
        stats,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating club stats:', error);
    }
  }
} 