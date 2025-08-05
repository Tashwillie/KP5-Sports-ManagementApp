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
  Tournament, 
  TournamentBracket, 
  TournamentMatch,
  TournamentStanding,
  ApiResponse 
} from '../../../../shared/src/types';

export class TournamentService {
  private static instance: TournamentService;
  private tournamentsCollection = collection(db, 'tournaments');
  private bracketsCollection = collection(db, 'tournamentBrackets');
  private matchesCollection = collection(db, 'tournamentMatches');
  private standingsCollection = collection(db, 'tournamentStandings');

  public static getInstance(): TournamentService {
    if (!TournamentService.instance) {
      TournamentService.instance = new TournamentService();
    }
    return TournamentService.instance;
  }

  // Get tournament by ID
  async getTournament(tournamentId: string): Promise<Tournament> {
    try {
      const docRef = doc(this.tournamentsCollection, tournamentId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Tournament not found');
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
      } as Tournament;
    } catch (error) {
      console.error('Error getting tournament:', error);
      throw new Error('Failed to get tournament');
    }
  }

  // Get tournament brackets
  async getTournamentBrackets(tournamentId: string): Promise<TournamentBracket[]> {
    try {
      const q = query(
        this.bracketsCollection,
        where('tournamentId', '==', tournamentId),
        orderBy('createdAt', 'asc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as TournamentBracket;
      });
    } catch (error) {
      console.error('Error getting tournament brackets:', error);
      throw new Error('Failed to get tournament brackets');
    }
  }

  // Get tournament matches
  async getTournamentMatches(tournamentId: string): Promise<TournamentMatch[]> {
    try {
      const q = query(
        this.matchesCollection,
        where('tournamentId', '==', tournamentId),
        orderBy('scheduledDate', 'asc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          scheduledDate: data.scheduledDate?.toDate() || new Date(),
          actualStartDate: data.actualStartDate?.toDate(),
          actualEndDate: data.actualEndDate?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as TournamentMatch;
      });
    } catch (error) {
      console.error('Error getting tournament matches:', error);
      throw new Error('Failed to get tournament matches');
    }
  }

  // Get tournament standings
  async getTournamentStandings(tournamentId: string): Promise<TournamentStanding[]> {
    try {
      const q = query(
        this.standingsCollection,
        where('tournamentId', '==', tournamentId),
        orderBy('position', 'asc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          lastUpdated: data.lastUpdated?.toDate() || new Date(),
        } as TournamentStanding;
      });
    } catch (error) {
      console.error('Error getting tournament standings:', error);
      throw new Error('Failed to get tournament standings');
    }
  }

  // Create tournament
  async createTournament(tournamentData: Omit<Tournament, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(this.tournamentsCollection, {
        ...tournamentData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating tournament:', error);
      throw new Error('Failed to create tournament');
    }
  }

  // Update tournament
  async updateTournament(tournamentId: string, updates: Partial<Tournament>): Promise<void> {
    try {
      const docRef = doc(this.tournamentsCollection, tournamentId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating tournament:', error);
      throw new Error('Failed to update tournament');
    }
  }

  // Delete tournament
  async deleteTournament(tournamentId: string): Promise<void> {
    try {
      const docRef = doc(this.tournamentsCollection, tournamentId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting tournament:', error);
      throw new Error('Failed to delete tournament');
    }
  }

  // Subscribe to tournament updates
  subscribeToTournament(tournamentId: string, callback: (tournament: Tournament) => void): () => void {
    const docRef = doc(this.tournamentsCollection, tournamentId);
    
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const tournament: Tournament = {
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate() || new Date(),
          registrationDeadline: data.registrationDeadline?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Tournament;
        
        callback(tournament);
      }
    });
  }

  // Subscribe to tournament brackets updates
  subscribeToTournamentBrackets(tournamentId: string, callback: (brackets: TournamentBracket[]) => void): () => void {
    const q = query(
      this.bracketsCollection,
      where('tournamentId', '==', tournamentId),
      orderBy('createdAt', 'asc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const brackets = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as TournamentBracket;
      });
      
      callback(brackets);
    });
  }
}

export const tournamentService = TournamentService.getInstance(); 