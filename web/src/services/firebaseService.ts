import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  Timestamp,
  writeBatch,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LiveMatch, LiveMatchEvent, LiveMatchEventType, LiveMatchEventData, PlayerMatchStats } from '../../../shared/src/types';

// Types
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'super_admin' | 'club_admin' | 'coach' | 'player' | 'parent' | 'referee';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  logoURL?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  adminId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  clubId: string;
  sport: string;
  ageGroup: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  coachId: string;
  players: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  tournamentId?: string;
  date: Date;
  venue: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  homeScore?: number;
  awayScore?: number;
  refereeId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  venue: string;
  maxTeams: number;
  currentTeams: number;
  status: 'registration' | 'in_progress' | 'completed' | 'cancelled';
  organizerId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Generic CRUD operations
export class FirebaseService {
  // Create
  static async create<T>(collectionName: string, data: Omit<T, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error creating ${collectionName}:`, error);
      throw error;
    }
  }

  // Read single document
  static async get<T>(collectionName: string, id: string): Promise<T | null> {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      console.error(`Error getting ${collectionName}:`, error);
      throw error;
    }
  }

  // Read multiple documents
  static async getAll<T>(collectionName: string, filters?: Array<{ field: string; operator: any; value: any }>): Promise<T[]> {
    try {
      let q = collection(db, collectionName);
      
      if (filters) {
        filters.forEach(filter => {
          q = query(q, where(filter.field, filter.operator, filter.value));
        });
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    } catch (error) {
      console.error(`Error getting all ${collectionName}:`, error);
      throw error;
    }
  }

  // Update
  static async update<T>(collectionName: string, id: string, data: Partial<T>): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error(`Error updating ${collectionName}:`, error);
      throw error;
    }
  }

  // Delete
  static async delete(collectionName: string, id: string): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting ${collectionName}:`, error);
      throw error;
    }
  }

  // Real-time subscription
  static subscribeToCollection<T>(
    collectionName: string,
    callback: (data: T[]) => void,
    filters?: Array<{ field: string; operator: any; value: any }>
  ) {
    let q = collection(db, collectionName);
    
    if (filters) {
      filters.forEach(filter => {
        q = query(q, where(filter.field, filter.operator, filter.value));
      });
    }
    
    return onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
      callback(data);
    });
  }

  // Batch operations
  static async batchCreate<T>(collectionName: string, items: Omit<T, 'id'>[]): Promise<string[]> {
    try {
      const batch = writeBatch(db);
      const ids: string[] = [];
      
      items.forEach(item => {
        const docRef = doc(collection(db, collectionName));
        batch.set(docRef, {
          ...item,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        ids.push(docRef.id);
      });
      
      await batch.commit();
      return ids;
    } catch (error) {
      console.error(`Error batch creating ${collectionName}:`, error);
      throw error;
    }
  }
}

// Specific service methods for each collection
export const UserService = {
  async createUser(userData: Omit<User, 'uid' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return FirebaseService.create<User>('users', userData);
  },

  async getUser(uid: string): Promise<User | null> {
    return FirebaseService.get<User>('users', uid);
  },

  async getAllUsers(): Promise<User[]> {
    return FirebaseService.getAll<User>('users');
  },

  async updateUser(uid: string, data: Partial<User>): Promise<void> {
    return FirebaseService.update<User>('users', uid, data);
  },

  async deleteUser(uid: string): Promise<void> {
    return FirebaseService.delete('users', uid);
  },

  subscribeToUsers(callback: (users: User[]) => void) {
    return FirebaseService.subscribeToCollection<User>('users', callback);
  }
};

export const ClubService = {
  async createClub(clubData: Omit<Club, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return FirebaseService.create<Club>('clubs', clubData);
  },

  async getClub(id: string): Promise<Club | null> {
    return FirebaseService.get<Club>('clubs', id);
  },

  async getAllClubs(): Promise<Club[]> {
    return FirebaseService.getAll<Club>('clubs');
  },

  async getClubsByAdmin(adminId: string): Promise<Club[]> {
    return FirebaseService.getAll<Club>('clubs', [{ field: 'adminId', operator: '==', value: adminId }]);
  },

  async updateClub(id: string, data: Partial<Club>): Promise<void> {
    return FirebaseService.update<Club>('clubs', id, data);
  },

  async deleteClub(id: string): Promise<void> {
    return FirebaseService.delete('clubs', id);
  },

  subscribeToClubs(callback: (clubs: Club[]) => void) {
    return FirebaseService.subscribeToCollection<Club>('clubs', callback);
  }
};

export const TeamService = {
  async createTeam(teamData: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return FirebaseService.create<Team>('teams', teamData);
  },

  async getTeam(id: string): Promise<Team | null> {
    return FirebaseService.get<Team>('teams', id);
  },

  async getAllTeams(): Promise<Team[]> {
    return FirebaseService.getAll<Team>('teams');
  },

  async getTeamsByClub(clubId: string): Promise<Team[]> {
    return FirebaseService.getAll<Team>('teams', [{ field: 'clubId', operator: '==', value: clubId }]);
  },

  async getTeamsByCoach(coachId: string): Promise<Team[]> {
    return FirebaseService.getAll<Team>('teams', [{ field: 'coachId', operator: '==', value: coachId }]);
  },

  async updateTeam(id: string, data: Partial<Team>): Promise<void> {
    return FirebaseService.update<Team>('teams', id, data);
  },

  async deleteTeam(id: string): Promise<void> {
    return FirebaseService.delete('teams', id);
  },

  subscribeToTeams(callback: (teams: Team[]) => void) {
    return FirebaseService.subscribeToCollection<Team>('teams', callback);
  }
};

export const MatchService = {
  async createMatch(matchData: Omit<Match, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return FirebaseService.create<Match>('matches', matchData);
  },

  async getMatch(id: string): Promise<Match | null> {
    return FirebaseService.get<Match>('matches', id);
  },

  async getAllMatches(): Promise<Match[]> {
    return FirebaseService.getAll<Match>('matches');
  },

  async getMatchesByTeam(teamId: string): Promise<Match[]> {
    return FirebaseService.getAll<Match>('matches', [
      { field: 'homeTeamId', operator: '==', value: teamId }
    ]);
  },

  async getMatchesByTournament(tournamentId: string): Promise<Match[]> {
    return FirebaseService.getAll<Match>('matches', [
      { field: 'tournamentId', operator: '==', value: tournamentId }
    ]);
  },

  async updateMatch(id: string, data: Partial<Match>): Promise<void> {
    return FirebaseService.update<Match>('matches', id, data);
  },

  async deleteMatch(id: string): Promise<void> {
    return FirebaseService.delete('matches', id);
  },

  subscribeToMatches(callback: (matches: Match[]) => void) {
    return FirebaseService.subscribeToCollection<Match>('matches', callback);
  }
};

export const TournamentService = {
  async createTournament(tournamentData: Omit<Tournament, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return FirebaseService.create<Tournament>('tournaments', tournamentData);
  },

  async getTournament(id: string): Promise<Tournament | null> {
    return FirebaseService.get<Tournament>('tournaments', id);
  },

  async getAllTournaments(): Promise<Tournament[]> {
    return FirebaseService.getAll<Tournament>('tournaments');
  },

  async getActiveTournaments(): Promise<Tournament[]> {
    return FirebaseService.getAll<Tournament>('tournaments', [
      { field: 'isActive', operator: '==', value: true }
    ]);
  },

  async updateTournament(id: string, data: Partial<Tournament>): Promise<void> {
    return FirebaseService.update<Tournament>('tournaments', id, data);
  },

  async deleteTournament(id: string): Promise<void> {
    return FirebaseService.delete('tournaments', id);
  },

  subscribeToTournaments(callback: (tournaments: Tournament[]) => void) {
    return FirebaseService.subscribeToCollection<Tournament>('tournaments', callback);
  }
}; 

// Enhanced Match Service with Real-time Support
export const LiveMatchService = {
  // Create a new live match
  async createLiveMatch(matchData: Omit<LiveMatch, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'liveMatches'), {
        ...matchData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        events: [],
        stats: {
          homeTeam: {
            goals: 0,
            assists: 0,
            shots: 0,
            shotsOnTarget: 0,
            corners: 0,
            fouls: 0,
            yellowCards: 0,
            redCards: 0,
            offsides: 0,
            possession: 50,
          },
          awayTeam: {
            goals: 0,
            assists: 0,
            shots: 0,
            shotsOnTarget: 0,
            corners: 0,
            fouls: 0,
            yellowCards: 0,
            redCards: 0,
            offsides: 0,
            possession: 50,
          },
          possession: {
            home: 50,
            away: 50,
          },
          shots: {
            home: 0,
            away: 0,
          },
          shotsOnTarget: {
            home: 0,
            away: 0,
          },
          corners: {
            home: 0,
            away: 0,
          },
          fouls: {
            home: 0,
            away: 0,
          },
          yellowCards: {
            home: 0,
            away: 0,
          },
          redCards: {
            home: 0,
            away: 0,
          },
          offsides: {
            home: 0,
            away: 0,
          },
        },
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating live match:', error);
      throw error;
    }
  },

  // Get live match by ID
  async getLiveMatch(id: string): Promise<LiveMatch | null> {
    try {
      const docRef = doc(db, 'liveMatches', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          startTime: data.startTime?.toDate(),
          endTime: data.endTime?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          events: data.events?.map((event: any) => ({
            ...event,
            timestamp: event.timestamp?.toDate(),
            createdAt: event.createdAt?.toDate(),
          })) || [],
        } as LiveMatch;
      }
      return null;
    } catch (error) {
      console.error('Error getting live match:', error);
      throw error;
    }
  },

  // Get all live matches
  async getAllLiveMatches(): Promise<LiveMatch[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'liveMatches'));
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startTime: data.startTime?.toDate(),
          endTime: data.endTime?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          events: data.events?.map((event: any) => ({
            ...event,
            timestamp: event.timestamp?.toDate(),
            createdAt: event.createdAt?.toDate(),
          })) || [],
        } as LiveMatch;
      });
    } catch (error) {
      console.error('Error getting all live matches:', error);
      throw error;
    }
  },

  // Get active live matches
  async getActiveLiveMatches(): Promise<LiveMatch[]> {
    try {
      const q = query(
        collection(db, 'liveMatches'),
        where('status', '==', 'in_progress')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startTime: data.startTime?.toDate(),
          endTime: data.endTime?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          events: data.events?.map((event: any) => ({
            ...event,
            timestamp: event.timestamp?.toDate(),
            createdAt: event.createdAt?.toDate(),
          })) || [],
        } as LiveMatch;
      });
    } catch (error) {
      console.error('Error getting active live matches:', error);
      throw error;
    }
  },

  // Update live match status
  async updateLiveMatchStatus(id: string, status: LiveMatch['status']): Promise<void> {
    try {
      const docRef = doc(db, 'liveMatches', id);
      await updateDoc(docRef, {
        status,
        updatedAt: serverTimestamp(),
        ...(status === 'completed' && { endTime: serverTimestamp() }),
      });
    } catch (error) {
      console.error('Error updating live match status:', error);
      throw error;
    }
  },

  // Add event to live match
  async addMatchEvent(
    matchId: string, 
    event: Omit<LiveMatchEvent, 'id' | 'matchId' | 'createdAt'>
  ): Promise<string> {
    try {
      const eventId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newEvent: LiveMatchEvent = {
        id: eventId,
        matchId,
        ...event,
        createdAt: new Date(),
      };

      const docRef = doc(db, 'liveMatches', matchId);
      await updateDoc(docRef, {
        events: increment(1),
        updatedAt: serverTimestamp(),
      });

      // Add event to subcollection
      const eventRef = doc(db, 'liveMatches', matchId, 'events', eventId);
      await updateDoc(eventRef, {
        ...newEvent,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp(),
      });

      // Update match stats based on event type
      await this.updateMatchStats(matchId, event);

      return eventId;
    } catch (error) {
      console.error('Error adding match event:', error);
      throw error;
    }
  },

  // Update match statistics based on event
  async updateMatchStats(matchId: string, event: Omit<LiveMatchEvent, 'id' | 'matchId' | 'createdAt'>): Promise<void> {
    try {
      const docRef = doc(db, 'liveMatches', matchId);
      const matchDoc = await getDoc(docRef);
      
      if (!matchDoc.exists()) return;

      const matchData = matchDoc.data();
      const isHomeTeam = event.teamId === matchData.homeTeamId;
      const teamKey = isHomeTeam ? 'homeTeam' : 'awayTeam';

      const updates: any = {
        updatedAt: serverTimestamp(),
      };

      // Update team-specific stats
      switch (event.type) {
        case 'goal':
          updates[`stats.${teamKey}.goals`] = increment(1);
          updates[`stats.${isHomeTeam ? 'homeTeam' : 'awayTeam'}.goals`] = increment(1);
          break;
        case 'assist':
          updates[`stats.${teamKey}.assists`] = increment(1);
          break;
        case 'yellow_card':
          updates[`stats.${teamKey}.yellowCards`] = increment(1);
          break;
        case 'red_card':
          updates[`stats.${teamKey}.redCards`] = increment(1);
          break;
        case 'substitution_in':
        case 'substitution_out':
          // Handle substitutions if needed
          break;
      }

      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating match stats:', error);
      throw error;
    }
  },

  // Subscribe to live match updates
  subscribeToLiveMatch(matchId: string, callback: (match: LiveMatch | null) => void) {
    const docRef = doc(db, 'liveMatches', matchId);
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const match: LiveMatch = {
          id: doc.id,
          ...data,
          startTime: data.startTime?.toDate(),
          endTime: data.endTime?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          events: data.events?.map((event: any) => ({
            ...event,
            timestamp: event.timestamp?.toDate(),
            createdAt: event.createdAt?.toDate(),
          })) || [],
        } as LiveMatch;
        callback(match);
      } else {
        callback(null);
      }
    });
  },

  // Subscribe to all active matches
  subscribeToActiveMatches(callback: (matches: LiveMatch[]) => void) {
    const q = query(
      collection(db, 'liveMatches'),
      where('status', '==', 'in_progress')
    );
    return onSnapshot(q, (querySnapshot) => {
      const matches = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startTime: data.startTime?.toDate(),
          endTime: data.endTime?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          events: data.events?.map((event: any) => ({
            ...event,
            timestamp: event.timestamp?.toDate(),
            createdAt: event.createdAt?.toDate(),
          })) || [],
        } as LiveMatch;
      });
      callback(matches);
    });
  },
};

// Player Statistics Service
export const PlayerStatsService = {
  // Get player match statistics
  async getPlayerMatchStats(playerId: string, matchId: string): Promise<PlayerMatchStats | null> {
    try {
      const docRef = doc(db, 'playerMatchStats', `${playerId}_${matchId}`);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as PlayerMatchStats;
      }
      return null;
    } catch (error) {
      console.error('Error getting player match stats:', error);
      throw error;
    }
  },

  // Update player match statistics
  async updatePlayerMatchStats(
    playerId: string, 
    matchId: string, 
    stats: Partial<PlayerMatchStats>
  ): Promise<void> {
    try {
      const docRef = doc(db, 'playerMatchStats', `${playerId}_${matchId}`);
      await updateDoc(docRef, {
        ...stats,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating player match stats:', error);
      throw error;
    }
  },

  // Get player season statistics
  async getPlayerSeasonStats(playerId: string, season: string): Promise<any> {
    try {
      const q = query(
        collection(db, 'playerSeasonStats'),
        where('playerId', '==', playerId),
        where('season', '==', season)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting player season stats:', error);
      throw error;
    }
  },
}; 