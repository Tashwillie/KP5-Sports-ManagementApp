import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  writeBatch,
  QueryConstraint,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../firebase';
import { Team, Player, TeamMember, TeamInvitation, TeamRole, TeamStats } from '../../../../shared/src/types';

export class TeamService {
  private static teamsCollection = collection(db, 'teams');
  private static playersCollection = collection(db, 'players');
  private static teamMembersCollection = collection(db, 'team_members');
  private static teamInvitationsCollection = collection(db, 'team_invitations');

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

      const docRef = await addDoc(this.teamsCollection, {
        ...team,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const teamId = docRef.id;

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
      const docRef = doc(this.teamsCollection, teamId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Team;
      }

      return null;
    } catch (error) {
      console.error('Error fetching team:', error);
      throw new Error('Failed to fetch team');
    }
  }

  static async updateTeam(teamId: string, updates: Partial<Team>): Promise<void> {
    try {
      const docRef = doc(this.teamsCollection, teamId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating team:', error);
      throw new Error('Failed to update team');
    }
  }

  static async deleteTeam(teamId: string): Promise<void> {
    try {
      const docRef = doc(this.teamsCollection, teamId);
      await deleteDoc(docRef);
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
      const constraints: QueryConstraint[] = [
        where('clubId', '==', clubId),
        orderBy('createdAt', 'desc')
      ];

      if (filters?.isActive !== undefined) {
        constraints.push(where('isActive', '==', filters.isActive));
      }

      if (filters?.division) {
        constraints.push(where('division', '==', filters.division));
      }

      if (filters?.season) {
        constraints.push(where('season', '==', filters.season));
      }

      const q = query(this.teamsCollection, ...constraints);
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Team;
      });
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw new Error('Failed to fetch teams');
    }
  }

  // Team Member Management
  static async addTeamMember(memberData: Omit<TeamMember, 'id'>): Promise<string> {
    try {
      const member: Omit<TeamMember, 'id'> = {
        teamId: memberData.teamId,
        userId: memberData.userId,
        role: memberData.role,
        position: memberData.position || '',
        jerseyNumber: memberData.jerseyNumber || null,
        joinedAt: new Date(),
        isActive: true,
      };

      const docRef = await addDoc(this.teamMembersCollection, {
        ...member,
        joinedAt: serverTimestamp(),
      });

      // Update team roster
      await this.updateTeamRoster(memberData.teamId, memberData.userId, memberData.role, 'add');

      return docRef.id;
    } catch (error) {
      console.error('Error adding team member:', error);
      throw new Error('Failed to add team member');
    }
  }

  static async removeTeamMember(teamId: string, userId: string): Promise<void> {
    try {
      // Get team member to determine role
      const member = await this.getTeamMember(teamId, userId);
      if (!member) {
        throw new Error('Team member not found');
      }

      // Remove from team members collection
      const memberQuery = query(
        this.teamMembersCollection,
        where('teamId', '==', teamId),
        where('userId', '==', userId)
      );
      const memberSnapshot = await getDocs(memberQuery);
      
      if (!memberSnapshot.empty) {
        const memberDoc = memberSnapshot.docs[0];
        await deleteDoc(doc(this.teamMembersCollection, memberDoc.id));
      }

      // Update team roster
      await this.updateTeamRoster(teamId, userId, member.role, 'remove');
    } catch (error) {
      console.error('Error removing team member:', error);
      throw new Error('Failed to remove team member');
    }
  }

  static async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    try {
      const q = query(
        this.teamMembersCollection,
        where('teamId', '==', teamId),
        where('isActive', '==', true),
        orderBy('joinedAt', 'asc')
      );
      
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          joinedAt: data.joinedAt?.toDate() || new Date(),
        } as TeamMember;
      });
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw new Error('Failed to fetch team members');
    }
  }

  static async getTeamMember(teamId: string, userId: string): Promise<TeamMember | null> {
    try {
      const q = query(
        this.teamMembersCollection,
        where('teamId', '==', teamId),
        where('userId', '==', userId),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          joinedAt: data.joinedAt?.toDate() || new Date(),
        } as TeamMember;
      }

      return null;
    } catch (error) {
      console.error('Error fetching team member:', error);
      throw new Error('Failed to fetch team member');
    }
  }

  static async updateTeamMember(teamId: string, userId: string, updates: Partial<TeamMember>): Promise<void> {
    try {
      const memberQuery = query(
        this.teamMembersCollection,
        where('teamId', '==', teamId),
        where('userId', '==', userId)
      );
      const memberSnapshot = await getDocs(memberQuery);
      
      if (!memberSnapshot.empty) {
        const memberDoc = memberSnapshot.docs[0];
        await updateDoc(doc(this.teamMembersCollection, memberDoc.id), {
          ...updates,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error updating team member:', error);
      throw new Error('Failed to update team member');
    }
  }

  // Team Invitations
  static async createTeamInvitation(invitationData: Omit<TeamInvitation, 'id'>): Promise<string> {
    try {
      const invitation: Omit<TeamInvitation, 'id'> = {
        teamId: invitationData.teamId,
        email: invitationData.email,
        role: invitationData.role,
        position: invitationData.position || '',
        invitedBy: invitationData.invitedBy,
        status: 'pending',
        expiresAt: invitationData.expiresAt,
        createdAt: new Date(),
      };

      const docRef = await addDoc(this.teamInvitationsCollection, {
        ...invitation,
        createdAt: serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating team invitation:', error);
      throw new Error('Failed to create team invitation');
    }
  }

  static async getTeamInvitations(teamId: string): Promise<TeamInvitation[]> {
    try {
      const q = query(
        this.teamInvitationsCollection,
        where('teamId', '==', teamId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          expiresAt: data.expiresAt?.toDate() || new Date(),
        } as TeamInvitation;
      });
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
      // This would typically calculate stats from match data
      // For now, return default stats
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

  // Real-time subscriptions
  static subscribeToTeam(teamId: string, callback: (team: Team | null) => void): () => void {
    const docRef = doc(this.teamsCollection, teamId);
    
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const team: Team = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Team;
        callback(team);
      } else {
        callback(null);
      }
    });
  }

  static subscribeToTeamMembers(teamId: string, callback: (members: TeamMember[]) => void): () => void {
    const q = query(
      this.teamMembersCollection,
      where('teamId', '==', teamId),
      where('isActive', '==', true),
      orderBy('joinedAt', 'asc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const members = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          joinedAt: data.joinedAt?.toDate() || new Date(),
        } as TeamMember;
      });
      callback(members);
    });
  }

  // Utility methods
  private static async updateTeamRoster(teamId: string, userId: string, role: TeamRole, action: 'add' | 'remove'): Promise<void> {
    try {
      const team = await this.getTeam(teamId);
      if (!team) return;

      const roster = { ...team.roster };

      if (action === 'add') {
        if (role === 'player') {
          roster.players = [...roster.players, userId];
        } else if (role === 'coach') {
          roster.coaches = [...roster.coaches, userId];
        } else if (role === 'manager') {
          roster.managers = [...roster.managers, userId];
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
    }
  }
} 