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
  QueryConstraint
} from 'firebase/firestore';
import { db } from '../firebase';
import { Club, Team, ClubMember, ClubInvitation, ClubRole, ClubPermission } from '../../../../shared/src/types';

export class ClubService {
  private static clubsCollection = collection(db, 'clubs');
  private static teamsCollection = collection(db, 'teams');
  private static membersCollection = collection(db, 'club_members');
  private static invitationsCollection = collection(db, 'club_invitations');

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

      const docRef = await addDoc(this.clubsCollection, {
        ...club,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating club:', error);
      throw new Error('Failed to create club');
    }
  }

  static async getClub(clubId: string): Promise<Club | null> {
    try {
      const docRef = doc(this.clubsCollection, clubId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Club;
      }

      return null;
    } catch (error) {
      console.error('Error fetching club:', error);
      throw new Error('Failed to fetch club');
    }
  }

  static async updateClub(clubId: string, updates: Partial<Club>): Promise<void> {
    try {
      const docRef = doc(this.clubsCollection, clubId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating club:', error);
      throw new Error('Failed to update club');
    }
  }

  static async deleteClub(clubId: string): Promise<void> {
    try {
      const docRef = doc(this.clubsCollection, clubId);
      await deleteDoc(docRef);
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
      const constraints: QueryConstraint[] = [];
      
      if (filters?.isPublic !== undefined) {
        constraints.push(where('settings.isPublic', '==', filters.isPublic));
      }
      
      if (filters?.createdBy) {
        constraints.push(where('createdBy', '==', filters.createdBy));
      }
      
      constraints.push(orderBy('createdAt', 'desc'));
      
      if (filters?.limit) {
        constraints.push(limit(filters.limit));
      }

      const q = query(this.clubsCollection, ...constraints);
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Club;
      });
    } catch (error) {
      console.error('Error fetching clubs:', error);
      throw new Error('Failed to fetch clubs');
    }
  }

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

      const docRef = await addDoc(this.teamsCollection, {
        ...team,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const teamId = docRef.id;

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

  static async getTeamsByClub(clubId: string): Promise<Team[]> {
    try {
      const q = query(
        this.teamsCollection,
        where('clubId', '==', clubId),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );
      
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

  // Club Member Management
  static async addClubMember(memberData: Omit<ClubMember, 'id'>): Promise<string> {
    try {
      const member: Omit<ClubMember, 'id'> = {
        clubId: memberData.clubId,
        userId: memberData.userId,
        role: memberData.role,
        teamIds: memberData.teamIds || [],
        permissions: memberData.permissions || [],
        joinedAt: new Date(),
        isActive: true,
      };

      const docRef = await addDoc(this.membersCollection, {
        ...member,
        joinedAt: serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Error adding club member:', error);
      throw new Error('Failed to add club member');
    }
  }

  static async getClubMembers(clubId: string): Promise<ClubMember[]> {
    try {
      const q = query(
        this.membersCollection,
        where('clubId', '==', clubId),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          joinedAt: data.joinedAt?.toDate() || new Date(),
        } as ClubMember;
      });
    } catch (error) {
      console.error('Error fetching club members:', error);
      throw new Error('Failed to fetch club members');
    }
  }

  // Club Invitations
  static async createClubInvitation(invitationData: Omit<ClubInvitation, 'id'>): Promise<string> {
    try {
      const invitation: Omit<ClubInvitation, 'id'> = {
        clubId: invitationData.clubId,
        teamId: invitationData.teamId,
        email: invitationData.email,
        role: invitationData.role,
        invitedBy: invitationData.invitedBy,
        status: 'pending',
        expiresAt: invitationData.expiresAt,
        createdAt: new Date(),
      };

      const docRef = await addDoc(this.invitationsCollection, {
        ...invitation,
        createdAt: serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating club invitation:', error);
      throw new Error('Failed to create club invitation');
    }
  }

  // Real-time subscriptions
  static subscribeToClub(clubId: string, callback: (club: Club | null) => void): () => void {
    const docRef = doc(this.clubsCollection, clubId);
    
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const club: Club = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Club;
        callback(club);
      } else {
        callback(null);
      }
    });
  }

  static subscribeToClubTeams(clubId: string, callback: (teams: Team[]) => void): () => void {
    const q = query(
      this.teamsCollection,
      where('clubId', '==', clubId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const teams = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Team;
      });
      callback(teams);
    });
  }

  // Utility methods
  private static async updateClubStats(clubId: string): Promise<void> {
    try {
      const teams = await this.getTeamsByClub(clubId);
      const members = await this.getClubMembers(clubId);

      const stats = {
        totalTeams: teams.length,
        totalPlayers: teams.reduce((acc, team) => acc + team.roster.players.length, 0),
        totalCoaches: teams.reduce((acc, team) => acc + team.roster.coaches.length, 0),
        totalMatches: 0, // This would be calculated from matches collection
      };

      await this.updateClub(clubId, { stats });
    } catch (error) {
      console.error('Error updating club stats:', error);
    }
  }
} 