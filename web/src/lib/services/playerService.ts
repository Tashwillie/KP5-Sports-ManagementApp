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
  Player, 
  PlayerStats, 
  Team,
  ApiResponse 
} from '../../../../shared/src/types';

export class PlayerService {
  private static instance: PlayerService;
  private playersCollection = collection(db, 'players');
  private teamsCollection = collection(db, 'teams');
  private playerStatsCollection = collection(db, 'playerStats');

  public static getInstance(): PlayerService {
    if (!PlayerService.instance) {
      PlayerService.instance = new PlayerService();
    }
    return PlayerService.instance;
  }

  // Get all players with stats
  async getAllPlayersWithStats(): Promise<Player[]> {
    try {
      const querySnapshot = await getDocs(this.playersCollection);
      const players = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          dateOfBirth: data.dateOfBirth?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Player;
      });

      // Get stats for each player
      const playersWithStats = await Promise.all(
        players.map(async (player) => {
          try {
            const statsDoc = await getDoc(doc(this.playerStatsCollection, player.id));
            if (statsDoc.exists()) {
              const statsData = statsDoc.data();
              player.stats = {
                ...statsData,
                lastUpdated: statsData.lastUpdated?.toDate() || new Date(),
              } as PlayerStats;
            }
          } catch (error) {
            console.error(`Error getting stats for player ${player.id}:`, error);
          }
          return player;
        })
      );

      return playersWithStats;
    } catch (error) {
      console.error('Error getting players with stats:', error);
      throw new Error('Failed to get players with stats');
    }
  }

  // Get player by ID
  async getPlayer(playerId: string): Promise<Player> {
    try {
      const docRef = doc(this.playersCollection, playerId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Player not found');
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        dateOfBirth: data.dateOfBirth?.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Player;
    } catch (error) {
      console.error('Error getting player:', error);
      throw new Error('Failed to get player');
    }
  }

  // Get player stats
  async getPlayerStats(playerId: string): Promise<PlayerStats | null> {
    try {
      const docRef = doc(this.playerStatsCollection, playerId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        ...data,
        lastUpdated: data.lastUpdated?.toDate() || new Date(),
      } as PlayerStats;
    } catch (error) {
      console.error('Error getting player stats:', error);
      throw new Error('Failed to get player stats');
    }
  }

  // Get teams
  async getTeams(): Promise<Team[]> {
    try {
      const querySnapshot = await getDocs(this.teamsCollection);
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
      console.error('Error getting teams:', error);
      throw new Error('Failed to get teams');
    }
  }

  // Create player
  async createPlayer(playerData: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(this.playersCollection, {
        ...playerData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating player:', error);
      throw new Error('Failed to create player');
    }
  }

  // Update player
  async updatePlayer(playerId: string, updates: Partial<Player>): Promise<void> {
    try {
      const docRef = doc(this.playersCollection, playerId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating player:', error);
      throw new Error('Failed to update player');
    }
  }

  // Update player stats
  async updatePlayerStats(playerId: string, stats: Partial<PlayerStats>): Promise<void> {
    try {
      const docRef = doc(this.playerStatsCollection, playerId);
      await updateDoc(docRef, {
        ...stats,
        lastUpdated: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating player stats:', error);
      throw new Error('Failed to update player stats');
    }
  }

  // Delete player
  async deletePlayer(playerId: string): Promise<void> {
    try {
      const docRef = doc(this.playersCollection, playerId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting player:', error);
      throw new Error('Failed to delete player');
    }
  }

  // Subscribe to player updates
  subscribeToPlayer(playerId: string, callback: (player: Player) => void): () => void {
    const docRef = doc(this.playersCollection, playerId);
    
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const player: Player = {
          id: doc.id,
          ...data,
          dateOfBirth: data.dateOfBirth?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Player;
        
        callback(player);
      }
    });
  }

  // Subscribe to player stats updates
  subscribeToPlayerStats(playerId: string, callback: (stats: PlayerStats | null) => void): () => void {
    const docRef = doc(this.playerStatsCollection, playerId);
    
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const stats: PlayerStats = {
          ...data,
          lastUpdated: data.lastUpdated?.toDate() || new Date(),
        } as PlayerStats;
        
        callback(stats);
      } else {
        callback(null);
      }
    });
  }
}

export const playerService = PlayerService.getInstance(); 