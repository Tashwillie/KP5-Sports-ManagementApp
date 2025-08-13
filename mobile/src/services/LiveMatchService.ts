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
import { apiService } from '../../../shared/src/services/api';
import { RealTimeService } from '../../../shared/src/services/realTimeService';
import NetInfo from '@react-native-community/netinfo';

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
  private realTimeService: RealTimeService | null = null;
  private offlineQueue: Array<{ action: string; data: any; timestamp: number }> = [];
  private isOnline = true;
  private networkUnsubscribe: (() => void) | null = null;

  public static getInstance(): MobileLiveMatchService {
    if (!MobileLiveMatchService.instance) {
      MobileLiveMatchService.instance = new MobileLiveMatchService();
    }
    return MobileLiveMatchService.instance;
  }

  // Set real-time service instance
  setRealTimeService(realTimeService: RealTimeService): void {
    this.realTimeService = realTimeService;
  }

  // Initialize offline support
  async initializeOfflineSupport(): Promise<void> {
    try {
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
    // Monitor network status changes using NetInfo
    this.networkUnsubscribe = NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? false;
      
      if (!wasOnline && this.isOnline) {
        // Came back online - process offline queue
        this.processOfflineQueue();
      }
    });
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

    const queueToProcess = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const item of queueToProcess) {
      try {
        switch (item.action) {
          case 'createMatch':
            await this.createMatch(item.data);
            break;
          case 'updateMatch':
            await this.updateMatch(item.data.matchId, item.data.updates);
            break;
          case 'addMatchEvent':
            await this.addMatchEvent(item.data);
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
        // Re-add failed actions to queue
        this.offlineQueue.push(item);
      }
    }

    await this.saveOfflineQueue();
  }

  // Create a new match
  async createMatch(matchData: Omit<LiveMatch, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<LiveMatch>> {
    try {
      if (!this.isOnline) {
        await this.addToOfflineQueue('createMatch', matchData);
        return { success: false, error: 'Offline - action queued' };
      }

      const response = await apiService.post('/matches', matchData);
      
      if (response.success && response.data) {
        // Emit real-time event for new match
        this.realTimeService?.emit('match-created', {
          match: response.data,
          timestamp: new Date()
        });

        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error || 'Failed to create match' };
      }
    } catch (error) {
      console.error('Error creating match:', error);
      return { success: false, error: 'Failed to create match' };
    }
  }

  // Get a single match by ID
  async getMatch(matchId: string): Promise<ApiResponse<LiveMatch>> {
    try {
      const response = await apiService.get(`/matches/${matchId}`);
      
      if (response.success && response.data) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error || 'Match not found' };
      }
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
      const params = new URLSearchParams();
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.clubId) params.append('clubId', filters.clubId);
      if (filters?.tournamentId) params.append('tournamentId', filters.tournamentId);
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await apiService.get(`/matches?${params.toString()}`);
      
      if (response.success && response.data) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error || 'Failed to get matches' };
      }
    } catch (error) {
      console.error('Error getting matches:', error);
      return { success: false, error: 'Failed to get matches' };
    }
  }

  // Update match status and basic info
  async updateMatch(matchId: string, updates: Partial<LiveMatch>): Promise<ApiResponse<void>> {
    try {
      if (!this.isOnline) {
        await this.addToOfflineQueue('updateMatch', { matchId, updates });
        return { success: false, error: 'Offline - action queued' };
      }

      const response = await apiService.put(`/matches/${matchId}`, updates);
      
      if (response.success) {
        // Emit real-time event for match update
        this.realTimeService?.emit('match-updated', {
          matchId,
          updates,
          timestamp: new Date()
        });

        return { success: true };
      } else {
        return { success: false, error: response.error || 'Failed to update match' };
      }
    } catch (error) {
      console.error('Error updating match:', error);
      return { success: false, error: 'Failed to update match' };
    }
  }

  // Start a match
  async startMatch(matchId: string): Promise<ApiResponse<void>> {
    try {
      if (!this.isOnline) {
        await this.addToOfflineQueue('startMatch', { matchId });
        return { success: false, error: 'Offline - action queued' };
      }

      const response = await apiService.post(`/matches/${matchId}/start`);
      
      if (response.success) {
        // Emit real-time event for match start
        this.realTimeService?.emit('match-started', {
          matchId,
          timestamp: new Date()
        });

        // Send local notification
        await this.sendLocalNotification('Match Started', 'The match has begun!');

        return { success: true };
      } else {
        return { success: false, error: response.error || 'Failed to start match' };
      }
    } catch (error) {
      console.error('Error starting match:', error);
      return { success: false, error: 'Failed to start match' };
    }
  }

  // End a match
  async endMatch(matchId: string): Promise<ApiResponse<void>> {
    try {
      if (!this.isOnline) {
        await this.addToOfflineQueue('endMatch', { matchId });
        return { success: false, error: 'Offline - action queued' };
      }

      const response = await apiService.post(`/matches/${matchId}/end`);
      
      if (response.success) {
        // Emit real-time event for match end
        this.realTimeService?.emit('match-ended', {
          matchId,
          timestamp: new Date()
        });

        // Send local notification
        await this.sendLocalNotification('Match Ended', 'The match has finished!');

        return { success: true };
      } else {
        return { success: false, error: response.error || 'Failed to end match' };
      }
    } catch (error) {
      console.error('Error ending match:', error);
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
    createdBy: string;
  }): Promise<ApiResponse<LiveMatchEvent>> {
    try {
      if (!this.isOnline) {
        await this.addToOfflineQueue('addMatchEvent', eventData);
        return { success: false, error: 'Offline - action queued' };
      }

      const response = await apiService.post(`/matches/${eventData.matchId}/events`, eventData);
      
      if (response.success && response.data) {
        // Emit real-time event for new match event
        this.realTimeService?.emit('match-event-added', {
          matchId: eventData.matchId,
          event: response.data,
          timestamp: new Date()
        });

        // Send local notification for important events
        if (eventData.type === 'goal') {
          await this.sendLocalNotification('Goal!', `${eventData.data?.playerName || 'Player'} scored!`);
        } else if (eventData.type === 'red_card') {
          await this.sendLocalNotification('Red Card', `${eventData.data?.playerName || 'Player'} received a red card!`);
        }

        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error || 'Failed to add match event' };
      }
    } catch (error) {
      console.error('Error adding match event:', error);
      return { success: false, error: 'Failed to add match event' };
    }
  }

  // Get match events
  async getMatchEvents(matchId: string): Promise<ApiResponse<LiveMatchEvent[]>> {
    try {
      const response = await apiService.get(`/matches/${matchId}/events`);
      
      if (response.success && response.data) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error || 'Failed to get match events' };
      }
    } catch (error) {
      console.error('Error getting match events:', error);
      return { success: false, error: 'Failed to get match events' };
    }
  }

  // Subscribe to real-time match updates
  subscribeToMatch(matchId: string, callback: (match: LiveMatch) => void): () => void {
    if (!this.realTimeService) {
      console.warn('Real-time service not initialized');
      return () => {};
    }

    // Join match room
    this.realTimeService.joinRoom(`match:${matchId}`);

    // Subscribe to match updates
    const unsubscribe = this.realTimeService.on('match-updated', (event) => {
      if (event.data.matchId === matchId) {
        callback(event.data.match);
      }
    });

    return () => {
      unsubscribe();
      this.realTimeService?.leaveRoom(`match:${matchId}`);
    };
  }

  // Subscribe to real-time match events
  subscribeToMatchEvents(matchId: string, callback: (events: LiveMatchEvent[]) => void): () => void {
    if (!this.realTimeService) {
      console.warn('Real-time service not initialized');
      return () => {};
    }

    // Join match events room
    this.realTimeService.joinRoom(`match-events:${matchId}`);

    // Subscribe to match event updates
    const unsubscribe = this.realTimeService.on('match-events-updated', (event) => {
      if (event.data.matchId === matchId) {
        callback(event.data.events);
      }
    });

    return () => {
      unsubscribe();
      this.realTimeService?.leaveRoom(`match-events:${matchId}`);
    };
  }

  // Subscribe to live matches
  subscribeToLiveMatches(callback: (matches: LiveMatch[]) => void): () => void {
    if (!this.realTimeService) {
      console.warn('Real-time service not initialized');
      return () => {};
    }

    // Join live matches room
    this.realTimeService.joinRoom('live-matches');

    // Subscribe to live matches updates
    const unsubscribe = this.realTimeService.on('live-matches-updated', (event) => {
      callback(event.data.matches);
    });

    return () => {
      unsubscribe();
      this.realTimeService?.leaveRoom('live-matches');
    };
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

  // Cleanup
  cleanup(): void {
    if (this.networkUnsubscribe) {
      this.networkUnsubscribe();
      this.networkUnsubscribe = null;
    }
  }

  // Delete a match (admin only)
  async deleteMatch(matchId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiService.delete(`/matches/${matchId}`);
      
      if (response.success) {
        // Emit real-time event for match deletion
        this.realTimeService?.emit('match-deleted', {
          matchId,
          timestamp: new Date()
        });

        return { success: true };
      } else {
        return { success: false, error: response.error || 'Failed to delete match' };
      }
    } catch (error) {
      console.error('Error deleting match:', error);
      return { success: false, error: 'Failed to delete match' };
    }
  }

  // Get player match stats
  async getPlayerMatchStats(matchId: string): Promise<ApiResponse<PlayerMatchStats[]>> {
    try {
      const response = await apiService.get(`/matches/${matchId}/player-stats`);
      
      if (response.success && response.data) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error || 'Failed to get player stats' };
      }
    } catch (error) {
      console.error('Error getting player stats:', error);
      return { success: false, error: 'Failed to get player stats' };
    }
  }

  // Get team season stats
  async getTeamSeasonStats(teamId: string, season?: string): Promise<ApiResponse<TeamSeasonStats[]>> {
    try {
      const params = new URLSearchParams();
      if (season) params.append('season', season);

      const response = await apiService.get(`/teams/${teamId}/season-stats?${params.toString()}`);
      
      if (response.success && response.data) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error || 'Failed to get team stats' };
      }
    } catch (error) {
      console.error('Error getting team stats:', error);
      return { success: false, error: 'Failed to get team stats' };
    }
  }

  // Get match statistics
  async getMatchStats(matchId: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiService.get(`/matches/${matchId}/stats`);
      
      if (response.success && response.data) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error || 'Failed to get match stats' };
      }
    } catch (error) {
      console.error('Error getting match stats:', error);
      return { success: false, error: 'Failed to get match stats' };
    }
  }

  // Update match statistics
  async updateMatchStats(matchId: string, stats: any): Promise<ApiResponse<void>> {
    try {
      const response = await apiService.put(`/matches/${matchId}/stats`, stats);
      
      if (response.success) {
        // Emit real-time event for stats update
        this.realTimeService?.emit('match-stats-updated', {
          matchId,
          stats,
          timestamp: new Date()
        });

        return { success: true };
      } else {
        return { success: false, error: response.error || 'Failed to update match stats' };
      }
    } catch (error) {
      console.error('Error updating match stats:', error);
      return { success: false, error: 'Failed to update match stats' };
    }
  }
}

export default MobileLiveMatchService.getInstance(); 