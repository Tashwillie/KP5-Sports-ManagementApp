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
import { db } from '../config/firebase';
import { 
  LiveMatch, 
  LiveMatchEvent, 
  LiveMatchEventType, 
  LiveMatchStatus,
  PlayerMatchStats,
  TeamSeasonStats,
  ApiResponse 
} from '../types';

export class LiveMatchService {
  private static instance: LiveMatchService;
  private matchesCollection = collection(db, 'liveMatches');
  private eventsCollection = collection(db, 'matchEvents');
  private playerStatsCollection = collection(db, 'playerMatchStats');
  private teamStatsCollection = collection(db, 'teamSeasonStats');

  public static getInstance(): LiveMatchService {
    if (!LiveMatchService.instance) {
      LiveMatchService.instance = new LiveMatchService();
    }
    return LiveMatchService.instance;
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

      return { success: true };
    } catch (error) {
      console.error('Error starting match:', error);
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

      // Trigger stats calculation
      await this.calculateFinalStats(matchId);

      return { success: true };
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
    data: any;
    createdBy: string;
  }): Promise<ApiResponse<LiveMatchEvent>> {
    try {
      const batch = writeBatch(db);

      // Add the event
      const eventRef = doc(this.eventsCollection);
      const newEvent: LiveMatchEvent = {
        ...eventData,
        id: eventRef.id,
        createdAt: new Date(),
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
        };
        const updatedStats = this.calculateStatsUpdate(matchData.stats, eventForStats);
        
        batch.update(matchRef, {
          stats: updatedStats,
          updatedAt: serverTimestamp(),
        });
      }

      await batch.commit();

      return { success: true, data: newEvent };
    } catch (error) {
      console.error('Error adding match event:', error);
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

  // Calculate stats update based on event
  private calculateStatsUpdate(currentStats: any, event: LiveMatchEvent): any {
    const updatedStats = { ...currentStats };
    const teamKey = event.teamId === currentStats.homeTeamId ? 'homeTeam' : 'awayTeam';

    switch (event.type) {
      case 'goal':
        updatedStats[teamKey].goals += 1;
        if (event.data.goalType === 'penalty') {
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

  // Calculate final stats when match ends
  private async calculateFinalStats(matchId: string): Promise<void> {
    try {
      const matchResponse = await this.getMatch(matchId);
      if (!matchResponse.success || !matchResponse.data) return;

      const match = matchResponse.data;
      const eventsResponse = await this.getMatchEvents(matchId);
      if (!eventsResponse.success) return;

      const events = eventsResponse.data || [];

      // Calculate player stats
      const playerStats = this.calculatePlayerStats(match, events);
      
      // Save player stats
      const batch = writeBatch(db);
      playerStats.forEach((stat) => {
        const statRef = doc(this.playerStatsCollection);
        batch.set(statRef, {
          ...stat,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      // Calculate team season stats
      const teamStats = this.calculateTeamSeasonStats(match, events);
      teamStats.forEach((stat) => {
        const statRef = doc(this.teamStatsCollection);
        batch.set(statRef, {
          ...stat,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error calculating final stats:', error);
    }
  }

  // Calculate individual player stats
  private calculatePlayerStats(match: LiveMatch, events: LiveMatchEvent[]): PlayerMatchStats[] {
    const playerStatsMap = new Map<string, PlayerMatchStats>();

    events.forEach((event) => {
      if (!event.playerId) return;

      if (!playerStatsMap.has(event.playerId)) {
        playerStatsMap.set(event.playerId, {
          playerId: event.playerId,
          matchId: match.id,
          teamId: event.teamId,
          minutesPlayed: 0,
          goals: 0,
          assists: 0,
          shots: 0,
          shotsOnTarget: 0,
          yellowCards: 0,
          redCards: 0,
          fouls: 0,
          foulsSuffered: 0,
          offsides: 0,
          passes: 0,
          passesCompleted: 0,
          tackles: 0,
          tacklesWon: 0,
          interceptions: 0,
          clearances: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      const stats = playerStatsMap.get(event.playerId)!;

      switch (event.type) {
        case 'goal':
          stats.goals += 1;
          break;
        case 'assist':
          stats.assists += 1;
          break;
        case 'yellow_card':
          stats.yellowCards += 1;
          break;
        case 'red_card':
          stats.redCards += 1;
          break;
      }
    });

    return Array.from(playerStatsMap.values());
  }

  // Calculate team season stats
  private calculateTeamSeasonStats(match: LiveMatch, events: LiveMatchEvent[]): TeamSeasonStats[] {
    const homeTeamStats: TeamSeasonStats = {
      teamId: match.homeTeamId,
      season: '2024', // This should be dynamic
      matchesPlayed: 1,
      wins: match.stats.homeTeam.goals > match.stats.awayTeam.goals ? 1 : 0,
      draws: match.stats.homeTeam.goals === match.stats.awayTeam.goals ? 1 : 0,
      losses: match.stats.homeTeam.goals < match.stats.awayTeam.goals ? 1 : 0,
      goalsFor: match.stats.homeTeam.goals,
      goalsAgainst: match.stats.awayTeam.goals,
      goalDifference: match.stats.homeTeam.goals - match.stats.awayTeam.goals,
      points: (match.stats.homeTeam.goals > match.stats.awayTeam.goals ? 3 : 
               match.stats.homeTeam.goals === match.stats.awayTeam.goals ? 1 : 0),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const awayTeamStats: TeamSeasonStats = {
      teamId: match.awayTeamId,
      season: '2024', // This should be dynamic
      matchesPlayed: 1,
      wins: match.stats.awayTeam.goals > match.stats.homeTeam.goals ? 1 : 0,
      draws: match.stats.awayTeam.goals === match.stats.homeTeam.goals ? 1 : 0,
      losses: match.stats.awayTeam.goals < match.stats.homeTeam.goals ? 1 : 0,
      goalsFor: match.stats.awayTeam.goals,
      goalsAgainst: match.stats.homeTeam.goals,
      goalDifference: match.stats.awayTeam.goals - match.stats.homeTeam.goals,
      points: (match.stats.awayTeam.goals > match.stats.homeTeam.goals ? 3 : 
               match.stats.awayTeam.goals === match.stats.homeTeam.goals ? 1 : 0),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return [homeTeamStats, awayTeamStats];
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

export default LiveMatchService.getInstance(); 