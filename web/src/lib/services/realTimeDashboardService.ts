import { io, Socket } from 'socket.io-client';

export interface DashboardUpdate {
  type: 'STATS_UPDATE' | 'NEW_ACTIVITY' | 'MATCH_UPDATE' | 'SYSTEM_ALERT';
  data: any;
  timestamp: string;
}

class RealTimeDashboardService {
  private socket: Socket | null = null;
  private listeners: Map<string, (update: DashboardUpdate) => void> = new Map();

  connect() {
    if (this.socket?.connected) return;

    try {
      this.socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001', {
        path: '/ws',
        transports: ['websocket', 'polling'],
        timeout: 5000,
      });

      this.socket.on('connect', () => {
        console.log('🔄 Real-time dashboard connected');
        this.socket?.emit('join', 'dashboard');
      });

      this.socket.on('disconnect', () => {
        console.log('🔴 Real-time dashboard disconnected');
      });

      // Listen for dashboard updates
      this.socket.on('dashboard_update', (update: DashboardUpdate) => {
        console.log('📊 Dashboard update received:', update);
        this.notifyListeners(update);
      });

      // Listen for live match updates
      this.socket.on('match_update', (matchData: any) => {
        this.notifyListeners({
          type: 'MATCH_UPDATE',
          data: matchData,
          timestamp: new Date().toISOString()
        });
      });

      // Listen for new registrations/activities
      this.socket.on('activity_update', (activity: any) => {
        this.notifyListeners({
          type: 'NEW_ACTIVITY',
          data: activity,
          timestamp: new Date().toISOString()
        });
      });

    } catch (error) {
      console.error('❌ Failed to connect to real-time dashboard:', error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribe(id: string, callback: (update: DashboardUpdate) => void) {
    this.listeners.set(id, callback);
    
    // Auto-connect when first listener is added
    if (this.listeners.size === 1) {
      this.connect();
    }
  }

  unsubscribe(id: string) {
    this.listeners.delete(id);
    
    // Auto-disconnect when no listeners
    if (this.listeners.size === 0) {
      this.disconnect();
    }
  }

  private notifyListeners(update: DashboardUpdate) {
    this.listeners.forEach(callback => {
      try {
        callback(update);
      } catch (error) {
        console.error('❌ Error in dashboard update listener:', error);
      }
    });
  }

  // Send live match event to update dashboard
  sendMatchEvent(matchId: string, event: any) {
    if (this.socket?.connected) {
      this.socket.emit('match_event', { matchId, event });
    }
  }

  // Send activity to update dashboard
  sendActivity(activity: any) {
    if (this.socket?.connected) {
      this.socket.emit('new_activity', activity);
    }
  }

  // Get current connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export default new RealTimeDashboardService();
