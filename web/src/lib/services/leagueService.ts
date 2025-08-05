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
  writeBatch,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  League, 
  LeagueStanding, 
  LeagueTeamStats,
  ApiResponse 
} from '../../../../shared/src/types';

export class LeagueService {
  private static instance: LeagueService;
  private leaguesCollection = collection(db, 'leagues');
  private standingsCollection = collection(db, 'leagueStandings');

  public static getInstance(): LeagueService {
    if (!LeagueService.instance) {
      LeagueService.instance = new LeagueService();
    }
    return LeagueService.instance;
  }

  // Get league by ID
  async getLeague(leagueId: string): Promise<League> {
    try {
      const docRef = doc(this.leaguesCollection, leagueId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('League not found');
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        startDate: data.startDate?.toDate() || new Date(),
        endDate: data.endDate?.toDate() || new Date(),
        registrationDeadline: data.registrationDeadline?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as League;
    } catch (error) {
      console.error('Error getting league:', error);
      throw new Error('Failed to get league');
    }
  }

  // Get league standings
  async getLeagueStandings(leagueId: string, divisionId?: string): Promise<LeagueStanding[]> {
    try {
      let q = query(
        this.standingsCollection,
        where('leagueId', '==', leagueId),
        orderBy('position', 'asc')
      );

      if (divisionId) {
        q = query(q, where('divisionId', '==', divisionId));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          lastUpdated: data.lastUpdated?.toDate() || new Date(),
        } as LeagueStanding;
      });
    } catch (error) {
      console.error('Error getting league standings:', error);
      throw new Error('Failed to get league standings');
    }
  }

  // Create league
  async createLeague(leagueData: Omit<League, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(this.leaguesCollection, {
        ...leagueData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating league:', error);
      throw new Error('Failed to create league');
    }
  }

  // Update league
  async updateLeague(leagueId: string, updates: Partial<League>): Promise<void> {
    try {
      const docRef = doc(this.leaguesCollection, leagueId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating league:', error);
      throw new Error('Failed to update league');
    }
  }

  // Delete league
  async deleteLeague(leagueId: string): Promise<void> {
    try {
      const docRef = doc(this.leaguesCollection, leagueId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting league:', error);
      throw new Error('Failed to delete league');
    }
  }

  // Subscribe to league updates
  subscribeToLeague(leagueId: string, callback: (league: League) => void): () => void {
    const docRef = doc(this.leaguesCollection, leagueId);
    
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const league: League = {
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate() || new Date(),
          registrationDeadline: data.registrationDeadline?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as League;
        
        callback(league);
      }
    });
  }

  // Subscribe to league standings updates
  subscribeToLeagueStandings(leagueId: string, divisionId: string | undefined, callback: (standings: LeagueStanding[]) => void): () => void {
    let q = query(
      this.standingsCollection,
      where('leagueId', '==', leagueId),
      orderBy('position', 'asc')
    );

    if (divisionId) {
      q = query(q, where('divisionId', '==', divisionId));
    }
    
    return onSnapshot(q, (querySnapshot) => {
      const standings = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          lastUpdated: data.lastUpdated?.toDate() || new Date(),
        } as LeagueStanding;
      });
      
      callback(standings);
    });
  }
}

export const leagueService = LeagueService.getInstance(); 