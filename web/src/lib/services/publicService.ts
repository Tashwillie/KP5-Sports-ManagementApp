import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Club, 
  Team, 
  Event, 
  Player,
  ApiResponse 
} from '../../../../shared/src/types';

interface ClubStats {
  totalTeams: number;
  totalPlayers: number;
  totalMatches: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
}

export class PublicService {
  private static instance: PublicService;
  private clubsCollection = collection(db, 'clubs');
  private teamsCollection = collection(db, 'teams');
  private eventsCollection = collection(db, 'events');
  private playersCollection = collection(db, 'players');

  public static getInstance(): PublicService {
    if (!PublicService.instance) {
      PublicService.instance = new PublicService();
    }
    return PublicService.instance;
  }

  // Get public club by slug
  async getPublicClub(clubSlug: string): Promise<Club> {
    try {
      const q = query(
        this.clubsCollection,
        where('slug', '==', clubSlug),
        where('isPublic', '==', true),
        where('isActive', '==', true)
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Club not found or not public');
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Club;
    } catch (error) {
      console.error('Error getting public club:', error);
      throw new Error('Failed to get public club');
    }
  }

  // Get club teams
  async getClubTeams(clubSlug: string): Promise<Team[]> {
    try {
      const q = query(
        this.teamsCollection,
        where('clubSlug', '==', clubSlug),
        where('isPublic', '==', true),
        orderBy('name', 'asc')
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
      console.error('Error getting club teams:', error);
      throw new Error('Failed to get club teams');
    }
  }

  // Get club events
  async getClubEvents(clubSlug: string): Promise<Event[]> {
    try {
      const q = query(
        this.eventsCollection,
        where('clubSlug', '==', clubSlug),
        where('isPublic', '==', true),
        orderBy('startDate', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Event;
      });
    } catch (error) {
      console.error('Error getting club events:', error);
      throw new Error('Failed to get club events');
    }
  }

  // Get club statistics
  async getClubStats(clubSlug: string): Promise<ClubStats> {
    try {
      const [teams, events] = await Promise.all([
        this.getClubTeams(clubSlug),
        this.getClubEvents(clubSlug)
      ]);

      const totalTeams = teams.length;
      const totalPlayers = teams.reduce((sum, team) => sum + (team.playerCount || 0), 0);
      const totalMatches = events.filter(event => event.type === 'match').length;
      
      // Calculate wins, losses, draws from match events
      let totalWins = 0;
      let totalLosses = 0;
      let totalDraws = 0;

      events.forEach(event => {
        if (event.type === 'match' && event.homeScore !== undefined && event.awayScore !== undefined) {
          if (event.homeScore > event.awayScore) {
            totalWins++;
          } else if (event.homeScore < event.awayScore) {
            totalLosses++;
          } else {
            totalDraws++;
          }
        }
      });

      return {
        totalTeams,
        totalPlayers,
        totalMatches,
        totalWins,
        totalLosses,
        totalDraws,
      };
    } catch (error) {
      console.error('Error getting club stats:', error);
      throw new Error('Failed to get club stats');
    }
  }

  // Get public team by ID
  async getPublicTeam(teamId: string): Promise<Team> {
    try {
      const docRef = doc(this.teamsCollection, teamId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Team not found');
      }

      const data = docSnap.data();
      
      if (!data.isPublic) {
        throw new Error('Team is not public');
      }

      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Team;
    } catch (error) {
      console.error('Error getting public team:', error);
      throw new Error('Failed to get public team');
    }
  }

  // Get team players
  async getTeamPlayers(teamId: string): Promise<Player[]> {
    try {
      const q = query(
        this.playersCollection,
        where('teamIds', 'array-contains', teamId),
        where('isPublic', '==', true),
        orderBy('lastName', 'asc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          dateOfBirth: data.dateOfBirth?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Player;
      });
    } catch (error) {
      console.error('Error getting team players:', error);
      throw new Error('Failed to get team players');
    }
  }

  // Get team events
  async getTeamEvents(teamId: string): Promise<Event[]> {
    try {
      const q = query(
        this.eventsCollection,
        where('teamIds', 'array-contains', teamId),
        where('isPublic', '==', true),
        orderBy('startDate', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Event;
      });
    } catch (error) {
      console.error('Error getting team events:', error);
      throw new Error('Failed to get team events');
    }
  }

  // Search public clubs
  async searchPublicClubs(searchTerm: string, filters?: {
    location?: string;
    sport?: string;
    limit?: number;
  }): Promise<Club[]> {
    try {
      let q = query(
        this.clubsCollection,
        where('isPublic', '==', true),
        where('isActive', '==', true),
        orderBy('name', 'asc')
      );

      if (filters?.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      let clubs = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Club;
      });

      // Filter by search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        clubs = clubs.filter(club =>
          club.name.toLowerCase().includes(term) ||
          club.description?.toLowerCase().includes(term) ||
          club.location?.toLowerCase().includes(term)
        );
      }

      // Filter by location
      if (filters?.location) {
        clubs = clubs.filter(club =>
          club.location?.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }

      // Filter by sport
      if (filters?.sport) {
        clubs = clubs.filter(club =>
          club.sport?.toLowerCase() === filters.sport!.toLowerCase()
        );
      }

      return clubs;
    } catch (error) {
      console.error('Error searching public clubs:', error);
      throw new Error('Failed to search public clubs');
    }
  }

  // Get featured clubs
  async getFeaturedClubs(limit: number = 6): Promise<Club[]> {
    try {
      const q = query(
        this.clubsCollection,
        where('isPublic', '==', true),
        where('isActive', '==', true),
        where('isFeatured', '==', true),
        orderBy('name', 'asc'),
        limit(limit)
      );

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
      console.error('Error getting featured clubs:', error);
      throw new Error('Failed to get featured clubs');
    }
  }

  // Get upcoming public events
  async getUpcomingPublicEvents(limit: number = 10): Promise<Event[]> {
    try {
      const now = new Date();
      const q = query(
        this.eventsCollection,
        where('isPublic', '==', true),
        where('startDate', '>', now),
        orderBy('startDate', 'asc'),
        limit(limit)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Event;
      });
    } catch (error) {
      console.error('Error getting upcoming public events:', error);
      throw new Error('Failed to get upcoming public events');
    }
  }

  // Subscribe to public club updates
  subscribeToPublicClub(clubSlug: string, callback: (club: Club) => void): () => void {
    const q = query(
      this.clubsCollection,
      where('slug', '==', clubSlug),
      where('isPublic', '==', true),
      where('isActive', '==', true)
    );
    
    return onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        const club: Club = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Club;
        
        callback(club);
      }
    });
  }

  // Subscribe to public team updates
  subscribeToPublicTeam(teamId: string, callback: (team: Team) => void): () => void {
    const docRef = doc(this.teamsCollection, teamId);
    
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        
        if (data.isPublic) {
          const team: Team = {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as Team;
          
          callback(team);
        }
      }
    });
  }
}

export const publicService = PublicService.getInstance(); 