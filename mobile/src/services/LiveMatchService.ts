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
  enableNetwork,
  disableNetwork,
  enableIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  LiveMatch, 
  LiveMatchEvent, 
  LiveMatchEventType, 
  LiveMatchStatus,
  PlayerMatchStats,
  TeamSeasonStats,
  ApiResponse 
} from '../../../shared/src/types';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class MobileLiveMatchService {
  private static instance: MobileLiveMatchService;
  private matchesCollection = collection(db, 'liveMatches');
  private eventsCollection = collection(db, 'matchEvents');
  private playerStatsCollection = collection(db, 'playerMatchStats');
  private teamStatsCollection = collection(db, 'teamSeasonStats');
  private offlineQueue: Array<{ action: string; data: any; timestamp: number }> = [];
  private isOnline = true;

  public static getInstance(): MobileLiveMatchService {
    if (!MobileLiveMatchService.instance) {
      MobileLiveMatchService.instance = new MobileLiveMatchService();
    }
    return MobileLiveMatchService.instance;
  }

  // Initialize offline support
  async initializeOfflineSupport(): Promise<void> {
    try {
      // Enable offline persistence
      await enableIndexedDbPersistence(db);
      
      // Load offline queue
      await this.loadOfflineQueue();
      
      // Set up network status monitoring
      this.setupNetworkMonitoring();
      
      console.log('Offline support initialized');
    } catch (error) {
      console.error('Error initializing offline support:', error);
    }
  }

  // Set up network monitoring
  private setupNetworkMonitoring(): void {
    // Monitor network status changes
    const unsubscribe = onSnapshot(doc(db, '_network', 'status'), (doc) => {
      const wasOnline = this.isOnline;
      this.isOnline = doc.exists();
      
      if (!wasOnline && this.isOnline) {
        // Came back online - process offline queue
        this.processOfflineQueue();
      }
    });

    // Fallback network detection
    setInterval(() => {
      this.checkNetworkStatus();
    }, 5000);
  }

  // Check network status
  private async checkNetworkStatus(): Promise<void> {
    try {
      await enableNetwork(db);
      this.isOnline = true;
    } catch (error) {
      this.isOnline = false;
    }
  }

  // Load offline queue from storage
  private async loadOfflineQueue(): Promise<void> {
    try {
      const queueData = await AsyncStorage.getItem('offlineQueue');
      if (queueData) {
        this.offlineQueue = JSON.parse(queueData);
      }
    } catch (error) {
      console.error('Error loading offline queue:', error);
    }
  }

  // Save offline queue to storage
  private async saveOfflineQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem('offlineQueue', JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  }

  // Add action to offline queue
  private async addToOfflineQueue(action: string, data: any): Promise<void> {
    this.offlineQueue.push({
      action,
      data,
      timestamp: Date.now()
    });
    await this.saveOfflineQueue();
  }

  // Process offline queue when back online
  private async processOfflineQueue(): Promise<void> {
    if (this.offlineQueue.length === 0) return;

    console.log(`Processing ${this.offlineQueue.length} offline actions`);

    for (const item of this.offlineQueue) {
      try {
        switch (item.action) {
          case 'addEvent':
            await this.addMatchEvent(item.data);
            break;
          case 'updateMatch':
            await this.updateMatch(item.data.matchId, item.data.updates);
            break;
          case 'startMatch':
            await this.startMatch(item.data.matchId);
            break;
          case 'endMatch':
            await this.endMatch(item.data.matchId);
            break;
        }
      } catch (error) {
        console.error(`Error processing offline action ${item.action}:`, error);
      }
    }

    // Clear processed queue
    this.offlineQueue = [];
    await this.saveOfflineQueue();
  }

  // Create a new match
  async createMatch(matchData: Omit<LiveMatch, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<LiveMatch>> {
    try {
      const docRef = await addDoc(this.matchesCollection, {
        ...matchData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const newMatch: LiveMatch = {
        ...matchData,
        id: docRef.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return { success: true, data: newMatch };
    } catch (error) {
      console.error('Error creating match:', error);
      return { success: false, error: 'Failed to create match' };
    }
  }

  // Get a single match by ID
  async getMatch(matchId: string): Promise<ApiResponse<LiveMatch>> {
    try {
      const docRef = doc(this.matchesCollection, matchId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return { success: false, error: 'Match not found' };
      }

      const matchData = docSnap.data();
      const match: LiveMatch = {
        id: docSnap.id,
        ...matchData,
        startTime: matchData.startTime?.toDate() || new Date(),
        endTime: matchData.endTime?.toDate(),
        createdAt: matchData.createdAt?.toDate() || new Date(),
        updatedAt: matchData.updatedAt?.toDate() || new Date(),
      } as LiveMatch;

      return { success: true, data: match };
    } catch (error) {
      console.error('Error getting match:', error);
      return { success: false, error: 'Failed to get match' };
    }
  }

  // Get all matches with optional filters
  async getMatches(filters?: {
    status?: LiveMatchStatus;
    clubId?: string;
    tournamentId?: string;
    limit?: number;
  }): Promise<ApiResponse<LiveMatch[]>> {
    try {
      let q = query(this.matchesCollection, orderBy('startTime', 'desc'));

      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }

      if (filters?.clubId) {
        q = query(q, where('clubId', '==', filters.clubId));
      }

      if (filters?.tournamentId) {
        q = query(q, where('tournamentId', '==', filters.tournamentId));
      }

      if (filters?.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      const matches: LiveMatch[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        matches.push({
          id: doc.id,
          ...data,
          startTime: data.startTime?.toDate() || new Date(),
          endTime: data.endTime?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as LiveMatch);
      });

      return { success: true, data: matches };
    } catch (error) {
      console.error('Error getting matches:', error);
      return { success: false, error: 'Failed to get matches' };
    }
  }

  // Update match status and basic info
  async updateMatch(matchId: string, updates: Partial<LiveMatch>): Promise<ApiResponse<void>> {
    try {
      const docRef = doc(this.matchesCollection, matchId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating match:', error);
      
      // Add to offline queue if offline
      if (!this.isOnline) {
        await this.addToOfflineQueue('updateMatch', { matchId, updates });
        return { success: true }; // Return success for offline operations
      }
      
      return { success: false, error: 'Failed to update match' };
    }
  }

  // Start a match
  async startMatch(matchId: string): Promise<ApiResponse<void>> {
    try {
      const docRef = doc(this.matchesCollection, matchId);
      await updateDoc(docRef, {
        status: 'in_progress',
        startTime: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Send local notification
      await this.sendLocalNotification('Match Started', 'The match has begun!');

      return { success: true };
    } catch (error) {
      console.error('Error starting match:', error);
      
      if (!this.isOnline) {
        await this.addToOfflineQueue('startMatch', { matchId });
        return { success: true };
      }
      
      return { success: false, error: 'Failed to start match' };
    }
  }

  // End a match
  async endMatch(matchId: string): Promise<ApiResponse<void>> {
    try {
      const docRef = doc(this.matchesCollection, matchId);
      await updateDoc(docRef, {
        status: 'completed',
        endTime: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Send local notification
      await this.sendLocalNotification('Match Ended', 'The match has finished!');

      return { success: true };
    } catch (error) {
      console.error('Error ending match:', error);
      
      if (!this.isOnline) {
        await this.addToOfflineQueue('endMatch', { matchId });
        return { success: true };
      }
      
      return { success: false, error: 'Failed to end match' };
    }
  }

  // Add a match event
  async addMatchEvent(eventData: {
    matchId: string;
    type: LiveMatchEventType;
    timestamp: Date;
    minute: number;
    playerId?: string;
    teamId: string;
    data?: any;
  }): Promise<ApiResponse<LiveMatchEvent>> {
    try {
      const batch = writeBatch(db);

      // Add the event
      const eventRef = doc(this.eventsCollection);
      const newEvent: LiveMatchEvent = {
        ...eventData,
        id: eventRef.id,
        createdAt: new Date(),
        createdBy: 'mobile-user', // This should come from auth context
        data: eventData.data || {},
      };

      batch.set(eventRef, {
        ...eventData,
        createdAt: serverTimestamp(),
      });

      // Update match stats
      const matchRef = doc(this.matchesCollection, eventData.matchId);
      const matchDoc = await getDoc(matchRef);
      
      if (matchDoc.exists()) {
        const matchData = matchDoc.data();
        const eventForStats: LiveMatchEvent = {
          ...eventData,
          id: eventRef.id,
          createdAt: new Date(),
          createdBy: 'mobile-user',
          data: eventData.data || {},
        };
        const updatedStats = this.calculateStatsUpdate(matchData.stats, eventForStats);
        
        batch.update(matchRef, {
          stats: updatedStats,
          updatedAt: serverTimestamp(),
        });
      }

      await batch.commit();

      // Send local notification for important events
      if (['goal', 'red_card', 'penalty_goal'].includes(eventData.type)) {
        await this.sendLocalNotification(
          'Match Event',
          `${eventData.type.replace('_', ' ')} at ${eventData.minute}'`
        );
      }

      return { success: true, data: newEvent };
    } catch (error) {
      console.error('Error adding match event:', error);
      
      if (!this.isOnline) {
        await this.addToOfflineQueue('addEvent', eventData);
        return { success: true };
      }
      
      return { success: false, error: 'Failed to add match event' };
    }
  }

  // Get match events
  async getMatchEvents(matchId: string): Promise<ApiResponse<LiveMatchEvent[]>> {
    try {
      const q = query(
        this.eventsCollection,
        where('matchId', '==', matchId),
        orderBy('minute', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const events: LiveMatchEvent[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        events.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
        } as LiveMatchEvent);
      });

      return { success: true, data: events };
    } catch (error) {
      console.error('Error getting match events:', error);
      return { success: false, error: 'Failed to get match events' };
    }
  }

  // Subscribe to real-time match updates
  subscribeToMatch(matchId: string, callback: (match: LiveMatch) => void): () => void {
    const docRef = doc(this.matchesCollection, matchId);
    
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const match: LiveMatch = {
          id: doc.id,
          ...data,
          startTime: data.startTime?.toDate() || new Date(),
          endTime: data.endTime?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as LiveMatch;
        
        callback(match);
      }
    });
  }

  // Subscribe to real-time match events
  subscribeToMatchEvents(matchId: string, callback: (events: LiveMatchEvent[]) => void): () => void {
    const q = query(
      this.eventsCollection,
      where('matchId', '==', matchId),
      orderBy('minute', 'asc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const events: LiveMatchEvent[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        events.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
        } as LiveMatchEvent);
      });

      callback(events);
    });
  }

  // Subscribe to live matches
  subscribeToLiveMatches(callback: (matches: LiveMatch[]) => void): () => void {
    const q = query(
      this.matchesCollection,
      where('status', '==', 'in_progress'),
      orderBy('startTime', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const matches: LiveMatch[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        matches.push({
          id: doc.id,
          ...data,
          startTime: data.startTime?.toDate() || new Date(),
          endTime: data.endTime?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as LiveMatch);
      });

      callback(matches);
    });
  }

  // Send local notification
  private async sendLocalNotification(title: string, body: string): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  }

  // Calculate stats update based on event
  private calculateStatsUpdate(currentStats: any, event: LiveMatchEvent): any {
    const updatedStats = { ...currentStats };
    const teamKey = event.teamId === currentStats.homeTeamId ? 'homeTeam' : 'awayTeam';

    switch (event.type) {
      case 'goal':
        updatedStats[teamKey].goals += 1;
        if (event.data?.goalType === 'penalty') {
          updatedStats[teamKey].penaltyGoals = (updatedStats[teamKey].penaltyGoals || 0) + 1;
        }
        break;
      case 'assist':
        updatedStats[teamKey].assists += 1;
        break;
      case 'yellow_card':
        updatedStats[teamKey].yellowCards += 1;
        break;
      case 'red_card':
        updatedStats[teamKey].redCards += 1;
        break;
      case 'substitution_in':
        updatedStats[teamKey].substitutions = (updatedStats[teamKey].substitutions || 0) + 1;
        break;
      case 'injury':
        updatedStats[teamKey].injuries = (updatedStats[teamKey].injuries || 0) + 1;
        break;
    }

    return updatedStats;
  }

  // Get offline queue status
  getOfflineQueueStatus(): { count: number; isOnline: boolean } {
    return {
      count: this.offlineQueue.length,
      isOnline: this.isOnline
    };
  }

  // Force sync offline queue
  async forceSync(): Promise<void> {
    if (this.isOnline) {
      await this.processOfflineQueue();
    }
  }

  // Delete a match (admin only)
  async deleteMatch(matchId: string): Promise<ApiResponse<void>> {
    try {
      const docRef = doc(this.matchesCollection, matchId);
      await deleteDoc(docRef);

      return { success: true };
    } catch (error) {
      console.error('Error deleting match:', error);
      return { success: false, error: 'Failed to delete match' };
    }
  }
}

export default MobileLiveMatchService.getInstance(); 