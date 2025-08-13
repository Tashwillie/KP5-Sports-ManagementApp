import { logger } from '../utils/logger';
import redisService from './redisService';
import { MatchState, MatchEvent, RoomParticipant } from './websocketService';

export interface DistributedMatchState {
  matchId: string;
  status: string;
  currentMinute: number;
  homeScore: number;
  awayScore: number;
  events: MatchEvent[];
  lastEventTime: Date;
  isTimerRunning: boolean;
  currentPeriod: 'first_half' | 'halftime' | 'second_half' | 'extra_time' | 'penalties';
  injuryTime: number;
  serverId: string;
  lastUpdated: Date;
  version: number;
}

export interface MatchRoomState {
  matchId: string;
  participants: Map<string, RoomParticipant>;
  spectators: Map<string, RoomParticipant>;
  referees: Map<string, RoomParticipant>;
  coaches: Map<string, RoomParticipant>;
  admins: Map<string, RoomParticipant>;
  isActive: boolean;
  lastActivity: Date;
  serverId: string;
  version: number;
}

export interface MatchStatistics {
  matchId: string;
  totalEvents: number;
  totalParticipants: number;
  averageResponseTime: number;
  peakConcurrency: number;
  lastUpdated: Date;
}

export interface ServerInfo {
  serverId: string;
  hostname: string;
  port: number;
  startTime: Date;
  lastHeartbeat: Date;
  activeMatches: number;
  totalConnections: number;
  memoryUsage: number;
  cpuUsage: number;
}

export class DistributedMatchStateManager {
  private serverId: string;
  private heartbeatInterval: NodeJS.Timeout;
  private stateSyncInterval: NodeJS.Timeout;
  private localMatchStates: Map<string, DistributedMatchState> = new Map();
  private localMatchRooms: Map<string, MatchRoomState> = new Map();
  private serverRegistry: Map<string, ServerInfo> = new Map();
  private isInitialized: boolean = false;

  constructor() {
    this.serverId = `${process.env.HOSTNAME || 'unknown'}-${process.pid}-${Date.now()}`;
    this.startHeartbeat();
    this.startStateSync();
    logger.info(`DistributedMatchStateManager initialized with server ID: ${this.serverId}`);
  }

  // Initialization
  async initialize(): Promise<void> {
    try {
      // Connect to Redis
      await redisService.connect();
      
      // Register this server
      await this.registerServer();
      
      // Subscribe to cross-server events
      await this.setupCrossServerCommunication();
      
      // Load existing match states from Redis
      await this.loadExistingMatchStates();
      
      this.isInitialized = true;
      logger.info('DistributedMatchStateManager initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize DistributedMatchStateManager:', error);
      throw error;
    }
  }

  private async registerServer(): Promise<void> {
    const serverInfo: ServerInfo = {
      serverId: this.serverId,
      hostname: process.env.HOSTNAME || 'unknown',
      port: parseInt(process.env.PORT || '3001'),
      startTime: new Date(),
      lastHeartbeat: new Date(),
      activeMatches: 0,
      totalConnections: 0,
      memoryUsage: process.memoryUsage().heapUsed,
      cpuUsage: 0
    };

    await redisService.hset('servers', this.serverId, serverInfo, { ttl: 300 }); // 5 minutes TTL
    this.serverRegistry.set(this.serverId, serverInfo);
    logger.info(`Server registered with ID: ${this.serverId}`);
  }

  private async setupCrossServerCommunication(): Promise<void> {
    // Subscribe to match state updates from other servers
    await redisService.psubscribe('match:state:*', async (channel, message) => {
      if (message.source !== this.serverId) {
        await this.handleCrossServerMatchStateUpdate(message);
      }
    });

    // Subscribe to match room updates from other servers
    await redisService.psubscribe('match:room:*', async (channel, message) => {
      if (message.source !== this.serverId) {
        await this.handleCrossServerMatchRoomUpdate(message);
      }
    });

    // Subscribe to server registry updates
    await redisService.subscribe('server:registry', async (message) => {
      if (message.source !== this.serverId) {
        await this.handleServerRegistryUpdate(message);
      }
    });

    logger.info('Cross-server communication setup completed');
  }

  private async loadExistingMatchStates(): Promise<void> {
    try {
      const matchKeys = await redisService.smembers('active:matches');
      
      for (const matchId of matchKeys) {
        const matchState = await redisService.get<DistributedMatchState>(`match:state:${matchId}`);
        if (matchState) {
          this.localMatchStates.set(matchId, matchState);
          logger.info(`Loaded existing match state for: ${matchId}`);
        }
      }
    } catch (error) {
      logger.error('Failed to load existing match states:', error);
    }
  }

  // Heartbeat and monitoring
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(async () => {
      await this.sendHeartbeat();
    }, 30000); // 30 seconds
  }

  private async sendHeartbeat(): Promise<void> {
    try {
      const serverInfo = this.serverRegistry.get(this.serverId);
      if (serverInfo) {
        serverInfo.lastHeartbeat = new Date();
        serverInfo.activeMatches = this.localMatchStates.size;
        serverInfo.memoryUsage = process.memoryUsage().heapUsed;
        
        await redisService.hset('servers', this.serverId, serverInfo, { ttl: 300 });
        
        // Publish heartbeat to other servers
        await redisService.publish('server:heartbeat', {
          type: 'heartbeat',
          data: serverInfo,
          timestamp: Date.now(),
          source: this.serverId
        });
      }
    } catch (error) {
      logger.error('Failed to send heartbeat:', error);
    }
  }

  private startStateSync(): void {
    this.stateSyncInterval = setInterval(async () => {
      await this.syncMatchStates();
    }, 60000); // 1 minute
  }

  private async syncMatchStates(): Promise<void> {
    try {
      for (const [matchId, localState] of this.localMatchStates) {
        const remoteState = await redisService.get<DistributedMatchState>(`match:state:${matchId}`);
        
        if (remoteState && remoteState.version > localState.version && remoteState.serverId !== this.serverId) {
          // Remote state is newer, update local state
          this.localMatchStates.set(matchId, remoteState);
          logger.info(`Synced match state for ${matchId} from server ${remoteState.serverId}`);
        } else if (localState.version > (remoteState?.version || 0)) {
          // Local state is newer, update remote state
          await this.updateRemoteMatchState(matchId, localState);
        }
      }
    } catch (error) {
      logger.error('Failed to sync match states:', error);
    }
  }

  // Match state management
  async getMatchState(matchId: string): Promise<DistributedMatchState | null> {
    try {
      // First check local cache
      let matchState = this.localMatchStates.get(matchId);
      
      if (!matchState) {
        // Check Redis for remote state
        matchState = await redisService.get<DistributedMatchState>(`match:state:${matchId}`);
        if (matchState) {
          this.localMatchStates.set(matchId, matchState);
        }
      }
      
      return matchState || null;
    } catch (error) {
      logger.error(`Failed to get match state for ${matchId}:`, error);
      return null;
    }
  }

  async updateMatchState(matchId: string, updates: Partial<DistributedMatchState>): Promise<void> {
    try {
      const currentState = this.localMatchStates.get(matchId);
      const updatedState: DistributedMatchState = {
        ...currentState,
        ...updates,
        serverId: this.serverId,
        lastUpdated: new Date(),
        version: (currentState?.version || 0) + 1
      } as DistributedMatchState;

      // Update local cache
      this.localMatchStates.set(matchId, updatedState);
      
      // Update Redis
      await this.updateRemoteMatchState(matchId, updatedState);
      
      // Publish update to other servers
      await redisService.publish(`match:state:${matchId}`, {
        type: 'state_update',
        data: updatedState,
        timestamp: Date.now(),
        source: this.serverId,
        target: matchId
      });

      logger.info(`Match state updated for ${matchId}, version ${updatedState.version}`);
    } catch (error) {
      logger.error(`Failed to update match state for ${matchId}:`, error);
      throw error;
    }
  }

  private async updateRemoteMatchState(matchId: string, state: DistributedMatchState): Promise<void> {
    try {
      await redisService.set(`match:state:${matchId}`, state, { ttl: 3600 }); // 1 hour TTL
      await redisService.sadd('active:matches', matchId);
    } catch (error) {
      logger.error(`Failed to update remote match state for ${matchId}:`, error);
    }
  }

  // Match room management
  async getMatchRoom(matchId: string): Promise<MatchRoomState | null> {
    try {
      let matchRoom = this.localMatchRooms.get(matchId);
      
      if (!matchRoom) {
        matchRoom = await redisService.get<MatchRoomState>(`match:room:${matchId}`);
        if (matchRoom) {
          this.localMatchRooms.set(matchId, matchRoom);
        }
      }
      
      return matchRoom || null;
    } catch (error) {
      logger.error(`Failed to get match room for ${matchId}:`, error);
      return null;
    }
  }

  async updateMatchRoom(matchId: string, updates: Partial<MatchRoomState>): Promise<void> {
    try {
      const currentRoom = this.localMatchRooms.get(matchId);
      const updatedRoom: MatchRoomState = {
        ...currentRoom,
        ...updates,
        serverId: this.serverId,
        lastActivity: new Date(),
        version: (currentRoom?.version || 0) + 1
      } as MatchRoomState;

      // Update local cache
      this.localMatchRooms.set(matchId, updatedRoom);
      
      // Update Redis
      await redisService.set(`match:room:${matchId}`, updatedRoom, { ttl: 3600 });
      
      // Publish update to other servers
      await redisService.publish(`match:room:${matchId}`, {
        type: 'room_update',
        data: updatedRoom,
        timestamp: Date.now(),
        source: this.serverId,
        target: matchId
      });

      logger.info(`Match room updated for ${matchId}, version ${updatedRoom.version}`);
    } catch (error) {
      logger.error(`Failed to update match room for ${matchId}:`, error);
      throw error;
    }
  }

  // Cross-server event handlers
  private async handleCrossServerMatchStateUpdate(message: any): Promise<void> {
    try {
      const { matchId, data } = message;
      const matchState = data as DistributedMatchState;
      
      if (matchState.version > (this.localMatchStates.get(matchId)?.version || 0)) {
        this.localMatchStates.set(matchId, matchState);
        logger.info(`Received match state update for ${matchId} from server ${matchState.serverId}`);
      }
    } catch (error) {
      logger.error('Failed to handle cross-server match state update:', error);
    }
  }

  private async handleCrossServerMatchRoomUpdate(message: any): Promise<void> {
    try {
      const { matchId, data } = message;
      const matchRoom = data as MatchRoomState;
      
      if (matchRoom.version > (this.localMatchRooms.get(matchId)?.version || 0)) {
        this.localMatchRooms.set(matchId, matchRoom);
        logger.info(`Received match room update for ${matchId} from server ${matchRoom.serverId}`);
      }
    } catch (error) {
      logger.error('Failed to handle cross-server match room update:', error);
    }
  }

  private async handleServerRegistryUpdate(message: any): Promise<void> {
    try {
      const { data } = message;
      const serverInfo = data as ServerInfo;
      
      if (serverInfo.serverId !== this.serverId) {
        this.serverRegistry.set(serverInfo.serverId, serverInfo);
        
        // Remove stale servers
        const now = Date.now();
        for (const [serverId, info] of this.serverRegistry.entries()) {
          if (now - info.lastHeartbeat.getTime() > 300000) { // 5 minutes
            this.serverRegistry.delete(serverId);
            await redisService.hdel('servers', serverId);
          }
        }
      }
    } catch (error) {
      logger.error('Failed to handle server registry update:', error);
    }
  }

  // Statistics and monitoring
  async getMatchStatistics(matchId: string): Promise<MatchStatistics | null> {
    try {
      const stats = await redisService.get<MatchStatistics>(`match:stats:${matchId}`);
      return stats;
    } catch (error) {
      logger.error(`Failed to get match statistics for ${matchId}:`, error);
      return null;
    }
  }

  async updateMatchStatistics(matchId: string, updates: Partial<MatchStatistics>): Promise<void> {
    try {
      const currentStats = await this.getMatchStatistics(matchId);
      const updatedStats: MatchStatistics = {
        ...currentStats,
        ...updates,
        lastUpdated: new Date()
      } as MatchStatistics;

      await redisService.set(`match:stats:${matchId}`, updatedStats, { ttl: 86400 }); // 24 hours TTL
    } catch (error) {
      logger.error(`Failed to update match statistics for ${matchId}:`, error);
    }
  }

  async getAllServerInfo(): Promise<ServerInfo[]> {
    try {
      const servers = await redisService.hgetall('servers');
      return servers ? Object.values(servers) : [];
    } catch (error) {
      logger.error('Failed to get all server info:', error);
      return [];
    }
  }

  async getSystemHealth(): Promise<{
    totalServers: number;
    totalActiveMatches: number;
    totalConnections: number;
    redisHealth: boolean;
    memoryUsage: number;
  }> {
    try {
      const servers = await this.getAllServerInfo();
      const redisHealth = await redisService.healthCheck();
      
      const totalActiveMatches = servers.reduce((sum, server) => sum + server.activeMatches, 0);
      const totalConnections = servers.reduce((sum, server) => sum + server.totalConnections, 0);
      const memoryUsage = process.memoryUsage().heapUsed;

      return {
        totalServers: servers.length,
        totalActiveMatches,
        totalConnections,
        redisHealth,
        memoryUsage
      };
    } catch (error) {
      logger.error('Failed to get system health:', error);
      return {
        totalServers: 0,
        totalActiveMatches: 0,
        totalConnections: 0,
        redisHealth: false,
        memoryUsage: 0
      };
    }
  }

  // Cleanup and shutdown
  async cleanup(): Promise<void> {
    try {
      // Clear intervals
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
      }
      if (this.stateSyncInterval) {
        clearInterval(this.stateSyncInterval);
      }

      // Deregister server
      await redisService.hdel('servers', this.serverId);
      
      // Publish server shutdown
      await redisService.publish('server:shutdown', {
        type: 'shutdown',
        data: { serverId: this.serverId },
        timestamp: Date.now(),
        source: this.serverId
      });

      logger.info('DistributedMatchStateManager cleanup completed');
    } catch (error) {
      logger.error('Failed to cleanup DistributedMatchStateManager:', error);
    }
  }

  // Utility methods
  getServerId(): string {
    return this.serverId;
  }

  isServerInitialized(): boolean {
    return this.isInitialized;
  }

  getLocalMatchCount(): number {
    return this.localMatchStates.size;
  }

  getLocalRoomCount(): number {
    return this.localMatchRooms.size;
  }

  getServerRegistrySize(): number {
    return this.serverRegistry.size;
  }
}

// Create and export a singleton instance
const distributedMatchStateManager = new DistributedMatchStateManager();

export default distributedMatchStateManager;
