import { RealTimeService } from './realTimeService';
import { LiveMatchEvent, LiveMatchEventType, LiveMatchStatus, Match } from '../types';
import { apiClient } from './apiClient';

export interface AddMatchEventData {
  matchId: string;
  type: LiveMatchEventType;
  timestamp: Date;
  minute?: number;
  description?: string;
  playerId?: string;
  teamId?: string;
  data?: any;
}

export interface GetMatchesFilters {
  status?: LiveMatchStatus;
  clubId?: string;
  tournamentId?: string;
  limit?: number;
}

export interface MatchState {
  matchId: string;
  status: string;
  currentMinute: number;
  homeScore: number;
  awayScore: number;
  events: any[];
  lastEventTime: Date;
  isTimerRunning: boolean;
  currentPeriod: 'first_half' | 'halftime' | 'second_half' | 'extra_time' | 'penalties';
  injuryTime: number;
}

class LiveMatchService {
  private realTimeService: RealTimeService | null = null;
  private matchStateCallbacks: Map<string, ((state: MatchState) => void)[]> = new Map();

  setRealTimeService(service: RealTimeService) {
    this.realTimeService = service;
  }

  // Subscribe to match state updates
  onMatchState(matchId: string, callback: (state: MatchState) => void): () => void {
    if (!this.matchStateCallbacks.has(matchId)) {
      this.matchStateCallbacks.set(matchId, []);
    }
    this.matchStateCallbacks.get(matchId)!.push(callback);

    // Also subscribe to WebSocket match state updates if available
    if (this.realTimeService) {
      this.realTimeService.onMatchState(matchId, callback);
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.matchStateCallbacks.get(matchId);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
        if (callbacks.length === 0) {
          this.matchStateCallbacks.delete(matchId);
        }
      }

      // Unsubscribe from WebSocket if available
      if (this.realTimeService) {
        // Note: RealTimeService doesn't have offMatchState method yet
        // This would need to be implemented in RealTimeService
      }
    };
  }

  // Join match room for real-time updates
  joinMatch(matchId: string): void {
    if (this.realTimeService) {
      this.realTimeService.joinMatch(matchId);
    }
  }

  // Leave match room
  leaveMatch(matchId: string): void {
    if (this.realTimeService) {
      this.realTimeService.leaveMatch(matchId);
    }
  }

  // Join tournament room
  joinTournament(tournamentId: string): void {
    if (this.realTimeService) {
      this.realTimeService.joinTournament(tournamentId);
    }
  }

  async addMatchEvent(eventData: AddMatchEventData): Promise<{ success: boolean; event?: LiveMatchEvent; error?: string }> {
    try {
      const response = await apiClient.publicRequest<LiveMatchEvent>(`/matches/${eventData.matchId}/events`, {
        method: 'POST',
        body: JSON.stringify({
          type: eventData.type,
          minute: eventData.minute,
          description: eventData.description,
          playerId: eventData.playerId,
          teamId: eventData.teamId,
          data: eventData.data,
        }),
      });

      if (response.success) {
        const event = response.data;
        
        // Emit real-time event if service is available
        if (this.realTimeService) {
          this.realTimeService.emitMatchEvent(eventData.matchId, event);
        }

        return { success: true, event };
      } else {
        return { success: false, error: response.message || 'Failed to add event' };
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }

  // Add match event via WebSocket (for real-time updates)
  addMatchEventRealTime(eventData: AddMatchEventData): void {
    if (this.realTimeService) {
      this.realTimeService.emitMatchEvent(eventData.matchId, {
        type: eventData.type,
        minute: eventData.minute,
        description: eventData.description,
        playerId: eventData.playerId,
        teamId: eventData.teamId,
        data: eventData.data,
      });
    }
  }

  // Add specific event types via WebSocket
  addGoal(matchId: string, playerId: string, teamId: string, minute: number, description?: string): void {
    if (this.realTimeService) {
      this.realTimeService.emitGoal(matchId, playerId, teamId, minute, description);
    }
  }

  addCard(matchId: string, playerId: string, teamId: string, cardType: 'yellow_card' | 'red_card', minute: number, reason?: string): void {
    if (this.realTimeService) {
      this.realTimeService.emitCard(matchId, playerId, teamId, cardType, minute, reason);
    }
  }

  addSubstitution(matchId: string, playerOutId: string, playerInId: string, teamId: string, minute: number): void {
    if (this.realTimeService) {
      this.realTimeService.emitSubstitution(matchId, playerOutId, playerInId, teamId, minute);
    }
  }

  addInjury(matchId: string, playerId: string, teamId: string, minute: number, injuryType?: string): void {
    if (this.realTimeService) {
      this.realTimeService.emitInjury(matchId, playerId, teamId, minute, injuryType);
    }
  }

  async getMatches(filters?: GetMatchesFilters): Promise<{ success: boolean; matches?: Match[]; error?: string }> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.clubId) params.append('clubId', filters.clubId);
      if (filters?.tournamentId) params.append('tournamentId', filters.tournamentId);
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await apiClient.publicRequest<Match[]>(`/matches?${params.toString()}`);
      
      if (response.success) {
        return { success: true, matches: response.data };
      } else {
        return { success: false, error: response.message || 'Failed to fetch matches' };
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }

  async getMatch(matchId: string): Promise<{ success: boolean; match?: Match; error?: string }> {
    try {
      const response = await apiClient.publicRequest<Match>(`/matches/${matchId}`);
      
      if (response.success) {
        return { success: true, match: response.data };
      } else {
        return { success: false, error: response.message || 'Failed to fetch match' };
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }

  async startMatch(matchId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiClient.publicRequest<void>(`/matches/${matchId}/start`, {
        method: 'POST',
      });

      if (response.success) {
        // Emit real-time event if service is available
        if (this.realTimeService) {
          this.realTimeService.emitMatchStatusChange(matchId, 'in_progress');
        }

        return { success: true };
      } else {
        return { success: false, error: response.message || 'Failed to start match' };
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }

  // Start match via WebSocket
  startMatchRealTime(matchId: string): void {
    if (this.realTimeService) {
      this.realTimeService.emitMatchStatusChange(matchId, 'in_progress');
    }
  }

  async endMatch(matchId: string, finalScore?: { home: number; away: number }): Promise<{ success: boolean; error?: string }> {
    try {
      const payload = finalScore ? { finalScore } : {};
      
      const response = await apiClient.publicRequest<void>(`/matches/${matchId}/end`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (response.success) {
        // Emit real-time event if service is available
        if (this.realTimeService) {
          this.realTimeService.emitMatchStatusChange(matchId, 'completed', finalScore);
        }

        return { success: true };
      } else {
        return { success: false, error: response.message || 'Failed to end match' };
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }

  // End match via WebSocket
  endMatchRealTime(matchId: string, homeScore?: number, awayScore?: number): void {
    if (this.realTimeService) {
      this.realTimeService.emitMatchStatusChange(matchId, 'completed', { homeScore, awayScore });
    }
  }

  async pauseMatch(matchId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiClient.publicRequest<void>(`/matches/${matchId}/pause`, {
        method: 'POST',
      });

      if (response.success) {
        // Emit real-time event if service is available
        if (this.realTimeService) {
          this.realTimeService.emitMatchStatusChange(matchId, 'paused');
        }

        return { success: true };
      } else {
        return { success: false, error: response.message || 'Failed to pause match' };
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }

  // Pause match via WebSocket
  pauseMatchRealTime(matchId: string): void {
    if (this.realTimeService) {
      this.realTimeService.emitMatchStatusChange(matchId, 'paused');
    }
  }

  async resumeMatch(matchId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiClient.publicRequest<void>(`/matches/${matchId}/resume`, {
        method: 'POST',
      });

      if (response.success) {
        // Emit real-time event if service is available
        if (this.realTimeService) {
          this.realTimeService.emitMatchStatusChange(matchId, 'in_progress');
        }

        return { success: true };
      } else {
        return { success: false, error: response.message || 'Failed to resume match' };
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }

  // Resume match via WebSocket
  resumeMatchRealTime(matchId: string): void {
    if (this.realTimeService) {
      this.realTimeService.emitMatchStatusChange(matchId, 'in_progress');
    }
  }

  // Timer control via WebSocket
  startTimer(matchId: string): void {
    if (this.realTimeService) {
      this.realTimeService.emitMatchTimerControl(matchId, 'start');
    }
  }

  pauseTimer(matchId: string): void {
    if (this.realTimeService) {
      this.realTimeService.emitMatchTimerControl(matchId, 'pause');
    }
  }

  resumeTimer(matchId: string): void {
    if (this.realTimeService) {
      this.realTimeService.emitMatchTimerControl(matchId, 'resume');
    }
  }

  stopTimer(matchId: string): void {
    if (this.realTimeService) {
      this.realTimeService.emitMatchTimerControl(matchId, 'stop');
    }
  }

  async getMatchEvents(matchId: string): Promise<{ success: boolean; events?: LiveMatchEvent[]; error?: string }> {
    try {
      const response = await apiClient.publicRequest<LiveMatchEvent[]>(`/matches/${matchId}/events`);
      
      if (response.success) {
        return { success: true, events: response.data };
      } else {
        return { success: false, error: response.message || 'Failed to fetch match events' };
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }

  async getMatchParticipants(matchId: string): Promise<{ success: boolean; participants?: any[]; error?: string }> {
    try {
      const response = await apiClient.publicRequest<any[]>(`/matches/${matchId}/participants`);
      
      if (response.success) {
        return { success: true, participants: response.data };
      } else {
        return { success: false, error: response.message || 'Failed to fetch match participants' };
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }

  // Get WebSocket status for a match
  async getMatchWebSocketStatus(matchId: string): Promise<{ success: boolean; status?: any; error?: string }> {
    try {
      const response = await apiClient.publicRequest<any>(`/matches/${matchId}/websocket-status`);
      
      if (response.success) {
        return { success: true, status: response.data };
      } else {
        return { success: false, error: response.message || 'Failed to fetch WebSocket status' };
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }

  // Get overall WebSocket status
  async getWebSocketStatus(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await apiClient.publicRequest<any>('/matches/websocket/status');
      
      if (response.data.success) {
        return { success: true, data: response.data.data };
      } else {
        return { success: false, error: response.data.message || 'Failed to fetch WebSocket status' };
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }

  // Refresh match state from server
  async refreshMatchState(matchId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiClient.publicRequest<void>(`/matches/${matchId}/websocket/refresh-state`, {
        method: 'POST',
      });

      if (response.success) {
        return { success: true };
      } else {
        return { success: false, error: response.message || 'Failed to refresh match state' };
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }
}

export default new LiveMatchService(); 