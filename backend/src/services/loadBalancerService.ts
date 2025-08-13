import { logger } from '../utils/logger';
import redisService from './redisService';
import { ServerInfo } from './distributedMatchStateManager';

export interface LoadBalancerConfig {
  maxConnectionsPerServer: number;
  maxMatchesPerServer: number;
  healthCheckInterval: number;
  loadBalancingStrategy: 'round_robin' | 'least_connections' | 'least_matches' | 'weighted';
  serverWeights?: Record<string, number>;
}

export interface ConnectionMetrics {
  serverId: string;
  currentConnections: number;
  maxConnections: number;
  connectionUtilization: number;
  lastUpdated: Date;
}

export interface MatchDistributionMetrics {
  serverId: string;
  currentMatches: number;
  maxMatches: number;
  matchUtilization: number;
  lastUpdated: Date;
}

export interface LoadBalancerStats {
  totalServers: number;
  totalConnections: number;
  totalMatches: number;
  averageConnectionUtilization: number;
  averageMatchUtilization: number;
  loadBalancingEfficiency: number;
  lastUpdated: Date;
}

export class LoadBalancerService {
  private config: LoadBalancerConfig;
  private currentServerIndex: number = 0;
  private connectionMetrics: Map<string, ConnectionMetrics> = new Map();
  private matchDistributionMetrics: Map<string, MatchDistributionMetrics> = new Map();
  private healthCheckInterval: NodeJS.Timeout;
  private isInitialized: boolean = false;

  constructor(config: LoadBalancerConfig) {
    this.config = {
      maxConnectionsPerServer: 1000,
      maxMatchesPerServer: 100,
      healthCheckInterval: 30000, // 30 seconds
      loadBalancingStrategy: 'least_connections',
      ...config
    };

    this.startHealthCheck();
    logger.info('LoadBalancerService initialized');
  }

  // Initialization
  async initialize(): Promise<void> {
    try {
      await redisService.connect();
      await this.loadServerMetrics();
      this.isInitialized = true;
      logger.info('LoadBalancerService initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize LoadBalancerService:', error);
      throw error;
    }
  }

  private async loadServerMetrics(): Promise<void> {
    try {
      const servers = await redisService.hgetall('servers');
      if (servers) {
        for (const [serverId, serverInfo] of Object.entries(servers)) {
          const info = serverInfo as ServerInfo;
          this.updateConnectionMetrics(serverId, info.totalConnections);
          this.updateMatchDistributionMetrics(serverId, info.activeMatches);
        }
      }
    } catch (error) {
      logger.error('Failed to load server metrics:', error);
    }
  }

  // Server selection strategies
  async selectServer(strategy?: 'round_robin' | 'least_connections' | 'least_matches' | 'weighted'): Promise<string | null> {
    try {
      const availableServers = await this.getAvailableServers();
      
      if (availableServers.length === 0) {
        logger.warn('No available servers for load balancing');
        return null;
      }

      const selectedStrategy = strategy || this.config.loadBalancingStrategy;
      
      switch (selectedStrategy) {
        case 'round_robin':
          return this.roundRobinSelection(availableServers);
        case 'least_connections':
          return this.leastConnectionsSelection(availableServers);
        case 'least_matches':
          return this.leastMatchesSelection(availableServers);
        case 'weighted':
          return this.weightedSelection(availableServers);
        default:
          return this.leastConnectionsSelection(availableServers);
      }
    } catch (error) {
      logger.error('Failed to select server:', error);
      return null;
    }
  }

  private async getAvailableServers(): Promise<string[]> {
    try {
      const servers = await redisService.hgetall('servers');
      if (!servers) return [];

      const availableServers: string[] = [];
      
      for (const [serverId, serverInfo] of Object.entries(servers)) {
        const info = serverInfo as ServerInfo;
        const connectionMetrics = this.connectionMetrics.get(serverId);
        const matchMetrics = this.matchDistributionMetrics.get(serverId);
        
        // Check if server is healthy and has capacity
        if (this.isServerHealthy(info) && 
            this.hasConnectionCapacity(serverId) && 
            this.hasMatchCapacity(serverId)) {
          availableServers.push(serverId);
        }
      }
      
      return availableServers;
    } catch (error) {
      logger.error('Failed to get available servers:', error);
      return [];
    }
  }

  private isServerHealthy(serverInfo: ServerInfo): boolean {
    const now = Date.now();
    const lastHeartbeat = serverInfo.lastHeartbeat.getTime();
    const maxHeartbeatAge = 300000; // 5 minutes
    
    return (now - lastHeartbeat) < maxHeartbeatAge;
  }

  private hasConnectionCapacity(serverId: string): boolean {
    const metrics = this.connectionMetrics.get(serverId);
    if (!metrics) return false;
    
    return metrics.currentConnections < this.config.maxConnectionsPerServer;
  }

  private hasMatchCapacity(serverId: string): boolean {
    const metrics = this.matchDistributionMetrics.get(serverId);
    if (!metrics) return false;
    
    return metrics.currentMatches < this.config.maxMatchesPerServer;
  }

  // Selection strategies
  private roundRobinSelection(availableServers: string[]): string {
    if (availableServers.length === 0) return '';
    
    const selectedServer = availableServers[this.currentServerIndex % availableServers.length];
    this.currentServerIndex = (this.currentServerIndex + 1) % availableServers.length;
    
    return selectedServer;
  }

  private leastConnectionsSelection(availableServers: string[]): string {
    if (availableServers.length === 0) return '';
    
    let selectedServer = availableServers[0];
    let minConnections = Infinity;
    
    for (const serverId of availableServers) {
      const metrics = this.connectionMetrics.get(serverId);
      if (metrics && metrics.currentConnections < minConnections) {
        minConnections = metrics.currentConnections;
        selectedServer = serverId;
      }
    }
    
    return selectedServer;
  }

  private leastMatchesSelection(availableServers: string[]): string {
    if (availableServers.length === 0) return '';
    
    let selectedServer = availableServers[0];
    let minMatches = Infinity;
    
    for (const serverId of availableServers) {
      const metrics = this.matchDistributionMetrics.get(serverId);
      if (metrics && metrics.currentMatches < minMatches) {
        minMatches = metrics.currentMatches;
        selectedServer = serverId;
      }
    }
    
    return selectedServer;
  }

  private weightedSelection(availableServers: string[]): string {
    if (availableServers.length === 0) return '';
    
    if (!this.config.serverWeights) {
      return this.leastConnectionsSelection(availableServers);
    }
    
    const weightedServers: Array<{ serverId: string; weight: number; score: number }> = [];
    
    for (const serverId of availableServers) {
      const weight = this.config.serverWeights[serverId] || 1;
      const connectionMetrics = this.connectionMetrics.get(serverId);
      const matchMetrics = this.matchDistributionMetrics.get(serverId);
      
      // Calculate score based on weight, connections, and matches
      const connectionScore = connectionMetrics ? 
        (this.config.maxConnectionsPerServer - connectionMetrics.currentConnections) / this.config.maxConnectionsPerServer : 0;
      const matchScore = matchMetrics ? 
        (this.config.maxMatchesPerServer - matchMetrics.currentMatches) / this.config.maxMatchesPerServer : 0;
      
      const score = weight * (connectionScore + matchScore) / 2;
      weightedServers.push({ serverId, weight, score });
    }
    
    // Sort by score and return the highest
    weightedServers.sort((a, b) => b.score - a.score);
    return weightedServers[0]?.serverId || availableServers[0];
  }

  // Metrics management
  updateConnectionMetrics(serverId: string, currentConnections: number): void {
    const metrics: ConnectionMetrics = {
      serverId,
      currentConnections,
      maxConnections: this.config.maxConnectionsPerServer,
      connectionUtilization: (currentConnections / this.config.maxConnectionsPerServer) * 100,
      lastUpdated: new Date()
    };
    
    this.connectionMetrics.set(serverId, metrics);
  }

  updateMatchDistributionMetrics(serverId: string, currentMatches: number): void {
    const metrics: MatchDistributionMetrics = {
      serverId,
      currentMatches,
      maxMatches: this.config.maxMatchesPerServer,
      matchUtilization: (currentMatches / this.config.maxMatchesPerServer) * 100,
      lastUpdated: new Date()
    };
    
    this.matchDistributionMetrics.set(serverId, metrics);
  }

  // Health check
  private startHealthCheck(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, this.config.healthCheckInterval);
  }

  private async performHealthCheck(): Promise<void> {
    try {
      const servers = await redisService.hgetall('servers');
      if (!servers) return;

      for (const [serverId, serverInfo] of Object.entries(servers)) {
        const info = serverInfo as ServerInfo;
        
        // Update metrics
        this.updateConnectionMetrics(serverId, info.totalConnections);
        this.updateMatchDistributionMetrics(serverId, info.activeMatches);
        
        // Check for unhealthy servers
        if (!this.isServerHealthy(info)) {
          logger.warn(`Server ${serverId} appears unhealthy, last heartbeat: ${info.lastHeartbeat}`);
        }
      }
    } catch (error) {
      logger.error('Failed to perform health check:', error);
    }
  }

  // Statistics and monitoring
  async getLoadBalancerStats(): Promise<LoadBalancerStats> {
    try {
      const servers = await redisService.hgetall('servers');
      const totalServers = servers ? Object.keys(servers).length : 0;
      
      let totalConnections = 0;
      let totalMatches = 0;
      let totalConnectionUtilization = 0;
      let totalMatchUtilization = 0;
      
      for (const [serverId, serverInfo] of Object.entries(servers || {})) {
        const info = serverInfo as ServerInfo;
        totalConnections += info.totalConnections;
        totalMatches += info.activeMatches;
        
        const connectionMetrics = this.connectionMetrics.get(serverId);
        const matchMetrics = this.matchDistributionMetrics.get(serverId);
        
        if (connectionMetrics) {
          totalConnectionUtilization += connectionMetrics.connectionUtilization;
        }
        if (matchMetrics) {
          totalMatchUtilization += matchMetrics.matchUtilization;
        }
      }
      
      const averageConnectionUtilization = totalServers > 0 ? totalConnectionUtilization / totalServers : 0;
      const averageMatchUtilization = totalServers > 0 ? totalMatchUtilization / totalServers : 0;
      
      // Calculate load balancing efficiency (lower is better)
      const connectionVariance = this.calculateVariance(
        Array.from(this.connectionMetrics.values()).map(m => m.connectionUtilization)
      );
      const matchVariance = this.calculateVariance(
        Array.from(this.matchDistributionMetrics.values()).map(m => m.matchUtilization)
      );
      
      const loadBalancingEfficiency = 100 - ((connectionVariance + matchVariance) / 2);
      
      return {
        totalServers,
        totalConnections,
        totalMatches,
        averageConnectionUtilization,
        averageMatchUtilization,
        loadBalancingEfficiency: Math.max(0, loadBalancingEfficiency),
        lastUpdated: new Date()
      };
    } catch (error) {
      logger.error('Failed to get load balancer stats:', error);
      return {
        totalServers: 0,
        totalConnections: 0,
        totalMatches: 0,
        averageConnectionUtilization: 0,
        averageMatchUtilization: 0,
        loadBalancingEfficiency: 0,
        lastUpdated: new Date()
      };
    }
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDifferences = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDifferences.reduce((sum, val) => sum + val, 0) / values.length;
    
    return variance;
  }

  // Server recommendations
  async getServerRecommendations(): Promise<{
    bestForConnections: string[];
    bestForMatches: string[];
    overloaded: string[];
    underutilized: string[];
  }> {
    try {
      const availableServers = await this.getAvailableServers();
      const recommendations = {
        bestForConnections: [] as string[],
        bestForMatches: [] as string[],
        overloaded: [] as string[],
        underutilized: [] as string[]
      };
      
      for (const serverId of availableServers) {
        const connectionMetrics = this.connectionMetrics.get(serverId);
        const matchMetrics = this.matchDistributionMetrics.get(serverId);
        
        if (connectionMetrics) {
          if (connectionMetrics.connectionUtilization < 30) {
            recommendations.underutilized.push(serverId);
          } else if (connectionMetrics.connectionUtilization > 80) {
            recommendations.overloaded.push(serverId);
          }
          
          if (connectionMetrics.connectionUtilization < 50) {
            recommendations.bestForConnections.push(serverId);
          }
        }
        
        if (matchMetrics) {
          if (matchMetrics.matchUtilization < 50) {
            recommendations.bestForMatches.push(serverId);
          }
        }
      }
      
      return recommendations;
    } catch (error) {
      logger.error('Failed to get server recommendations:', error);
      return {
        bestForConnections: [],
        bestForMatches: [],
        overloaded: [],
        underutilized: []
      };
    }
  }

  // Configuration management
  updateConfig(newConfig: Partial<LoadBalancerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('LoadBalancerService configuration updated', this.config);
  }

  getConfig(): LoadBalancerConfig {
    return { ...this.config };
  }

  // Cleanup
  async cleanup(): Promise<void> {
    try {
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }
      
      logger.info('LoadBalancerService cleanup completed');
    } catch (error) {
      logger.error('Failed to cleanup LoadBalancerService:', error);
    }
  }

  // Utility methods
  isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  getConnectionMetrics(): Map<string, ConnectionMetrics> {
    return new Map(this.connectionMetrics);
  }

  getMatchDistributionMetrics(): Map<string, MatchDistributionMetrics> {
    return new Map(this.matchDistributionMetrics);
  }

  getCurrentServerIndex(): number {
    return this.currentServerIndex;
  }
}

// Create and export a singleton instance
const loadBalancerService = new LoadBalancerService({
  maxConnectionsPerServer: parseInt(process.env.MAX_CONNECTIONS_PER_SERVER || '1000'),
  maxMatchesPerServer: parseInt(process.env.MAX_MATCHES_PER_SERVER || '100'),
  healthCheckInterval: parseInt(process.env.LOAD_BALANCER_HEALTH_CHECK_INTERVAL || '30000'),
  loadBalancingStrategy: (process.env.LOAD_BALANCING_STRATEGY as any) || 'least_connections'
});

export default loadBalancerService;
