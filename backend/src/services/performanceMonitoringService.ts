import { logger } from '../utils/logger';
import redisService from './redisService';
import { performance } from 'perf_hooks';

export interface PerformanceMetrics {
  timestamp: Date;
  serverId: string;
  cpuUsage: number;
  memoryUsage: number;
  activeConnections: number;
  activeMatches: number;
  averageResponseTime: number;
  requestsPerSecond: number;
  errorsPerSecond: number;
  websocketEventsPerSecond: number;
  databaseQueryTime: number;
  redisResponseTime: number;
}

export interface MatchPerformanceMetrics {
  matchId: string;
  serverId: string;
  timestamp: Date;
  participantCount: number;
  eventsPerSecond: number;
  averageLatency: number;
  peakConcurrency: number;
  memoryUsage: number;
  cpuUsage: number;
  websocketConnections: number;
  databaseOperations: number;
  redisOperations: number;
}

export interface SystemPerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'critical';
  message: string;
  timestamp: Date;
  serverId?: string;
  matchId?: string;
  metrics: Partial<PerformanceMetrics>;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface PerformanceThresholds {
  cpuUsage: number; // percentage
  memoryUsage: number; // percentage
  responseTime: number; // milliseconds
  errorRate: number; // percentage
  connectionUtilization: number; // percentage
  matchUtilization: number; // percentage
}

export class PerformanceMonitoringService {
  private metrics: PerformanceMetrics[] = [];
  private matchMetrics: Map<string, MatchPerformanceMetrics[]> = new Map();
  private alerts: SystemPerformanceAlert[] = [];
  private thresholds: PerformanceThresholds;
  private monitoringInterval: NodeJS.Timeout;
  private metricsRetentionHours: number = 24;
  private maxMetricsStored: number = 1000;
  private isInitialized: boolean = false;
  private serverId: string;

  constructor() {
    this.serverId = `${process.env.HOSTNAME || 'unknown'}-${process.pid}-${Date.now()}`;
    this.thresholds = {
      cpuUsage: 80,
      memoryUsage: 85,
      responseTime: 1000,
      errorRate: 5,
      connectionUtilization: 90,
      matchUtilization: 90
    };

    this.startMonitoring();
    logger.info('PerformanceMonitoringService initialized');
  }

  // Initialization
  async initialize(): Promise<void> {
    try {
      await redisService.connect();
      this.isInitialized = true;
      logger.info('PerformanceMonitoringService initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize PerformanceMonitoringService:', error);
      throw error;
    }
  }

  // Performance monitoring
  private startMonitoring(): void {
    this.monitoringInterval = setInterval(async () => {
      await this.collectPerformanceMetrics();
    }, 10000); // 10 seconds
  }

  private async collectPerformanceMetrics(): Promise<void> {
    try {
      const metrics = await this.gatherSystemMetrics();
      this.metrics.push(metrics);
      
      // Store in Redis for cross-server access
      await this.storeMetricsInRedis(metrics);
      
      // Check thresholds and generate alerts
      await this.checkPerformanceThresholds(metrics);
      
      // Cleanup old metrics
      this.cleanupOldMetrics();
      
      logger.debug('Performance metrics collected', metrics);
    } catch (error) {
      logger.error('Failed to collect performance metrics:', error);
    }
  }

  private async gatherSystemMetrics(): Promise<PerformanceMetrics> {
    const startTime = performance.now();
    
    // CPU and memory usage
    const cpuUsage = await this.getCPUUsage();
    const memoryUsage = await this.getMemoryUsage();
    
    // Connection and match counts
    const activeConnections = await this.getActiveConnections();
    const activeMatches = await this.getActiveMatches();
    
    // Response time and throughput
    const averageResponseTime = await this.getAverageResponseTime();
    const requestsPerSecond = await this.getRequestsPerSecond();
    const errorsPerSecond = await this.getErrorsPerSecond();
    const websocketEventsPerSecond = await this.getWebSocketEventsPerSecond();
    
    // Database and Redis performance
    const databaseQueryTime = await this.getDatabaseQueryTime();
    const redisResponseTime = await this.getRedisResponseTime();
    
    const endTime = performance.now();
    
    return {
      timestamp: new Date(),
      serverId: this.serverId,
      cpuUsage,
      memoryUsage,
      activeConnections,
      activeMatches,
      averageResponseTime,
      requestsPerSecond,
      errorsPerSecond,
      websocketEventsPerSecond,
      databaseQueryTime,
      redisResponseTime
    };
  }

  private async getCPUUsage(): Promise<number> {
    try {
      const startUsage = process.cpuUsage();
      await new Promise(resolve => setTimeout(resolve, 100));
      const endUsage = process.cpuUsage();
      
      const userCpu = endUsage.user - startUsage.user;
      const systemCpu = endUsage.system - startUsage.system;
      const totalCpu = userCpu + systemCpu;
      
      // Convert to percentage (approximate)
      return Math.min(100, (totalCpu / 1000000) * 100);
    } catch (error) {
      logger.error('Failed to get CPU usage:', error);
      return 0;
    }
  }

  private async getMemoryUsage(): Promise<number> {
    try {
      const usage = process.memoryUsage();
      const totalMemory = usage.heapTotal;
      const usedMemory = usage.heapUsed;
      
      return (usedMemory / totalMemory) * 100;
    } catch (error) {
      logger.error('Failed to get memory usage:', error);
      return 0;
    }
  }

  private async getActiveConnections(): Promise<number> {
    try {
      // This would typically come from your WebSocket service
      // For now, return a placeholder
      return Math.floor(Math.random() * 100) + 10;
    } catch (error) {
      logger.error('Failed to get active connections:', error);
      return 0;
    }
  }

  private async getActiveMatches(): Promise<number> {
    try {
      // This would typically come from your match service
      // For now, return a placeholder
      return Math.floor(Math.random() * 20) + 1;
    } catch (error) {
      logger.error('Failed to get active matches:', error);
      return 0;
    }
  }

  private async getAverageResponseTime(): Promise<number> {
    try {
      // This would typically come from your request monitoring
      // For now, return a placeholder
      return Math.floor(Math.random() * 200) + 50;
    } catch (error) {
      logger.error('Failed to get average response time:', error);
      return 0;
    }
  }

  private async getRequestsPerSecond(): Promise<number> {
    try {
      // This would typically come from your request monitoring
      // For now, return a placeholder
      return Math.floor(Math.random() * 100) + 10;
    } catch (error) {
      logger.error('Failed to get requests per second:', error);
      return 0;
    }
  }

  private async getErrorsPerSecond(): Promise<number> {
    try {
      // This would typically come from your error monitoring
      // For now, return a placeholder
      return Math.floor(Math.random() * 5);
    } catch (error) {
      logger.error('Failed to get errors per second:', error);
      return 0;
    }
  }

  private async getWebSocketEventsPerSecond(): Promise<number> {
    try {
      // This would typically come from your WebSocket service
      // For now, return a placeholder
      return Math.floor(Math.random() * 50) + 5;
    } catch (error) {
      logger.error('Failed to get WebSocket events per second:', error);
      return 0;
    }
  }

  private async getDatabaseQueryTime(): Promise<number> {
    try {
      // This would typically come from your database monitoring
      // For now, return a placeholder
      return Math.floor(Math.random() * 100) + 10;
    } catch (error) {
      logger.error('Failed to get database query time:', error);
      return 0;
    }
  }

  private async getRedisResponseTime(): Promise<number> {
    try {
      const startTime = performance.now();
      await redisService.ping();
      const endTime = performance.now();
      
      return endTime - startTime;
    } catch (error) {
      logger.error('Failed to get Redis response time:', error);
      return 0;
    }
  }

  // Match-specific performance tracking
  async trackMatchPerformance(matchId: string, metrics: Partial<MatchPerformanceMetrics>): Promise<void> {
    try {
      const matchMetrics: MatchPerformanceMetrics = {
        matchId,
        serverId: this.serverId,
        timestamp: new Date(),
        participantCount: 0,
        eventsPerSecond: 0,
        averageLatency: 0,
        peakConcurrency: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        websocketConnections: 0,
        databaseOperations: 0,
        redisOperations: 0,
        ...metrics
      };

      if (!this.matchMetrics.has(matchId)) {
        this.matchMetrics.set(matchId, []);
      }

      this.matchMetrics.get(matchId)!.push(matchMetrics);
      
      // Store in Redis
      await this.storeMatchMetricsInRedis(matchId, matchMetrics);
      
      // Check match-specific thresholds
      await this.checkMatchPerformanceThresholds(matchId, matchMetrics);
      
      logger.debug(`Match performance metrics tracked for ${matchId}`, matchMetrics);
    } catch (error) {
      logger.error(`Failed to track match performance for ${matchId}:`, error);
    }
  }

  // Threshold monitoring and alerts
  private async checkPerformanceThresholds(metrics: PerformanceMetrics): Promise<void> {
    try {
      const alerts: SystemPerformanceAlert[] = [];

      // CPU usage alert
      if (metrics.cpuUsage > this.thresholds.cpuUsage) {
        alerts.push({
          id: `cpu-${Date.now()}`,
          type: metrics.cpuUsage > 95 ? 'critical' : metrics.cpuUsage > 90 ? 'error' : 'warning',
          message: `High CPU usage: ${metrics.cpuUsage.toFixed(2)}%`,
          timestamp: new Date(),
          serverId: this.serverId,
          metrics: { cpuUsage: metrics.cpuUsage },
          resolved: false
        });
      }

      // Memory usage alert
      if (metrics.memoryUsage > this.thresholds.memoryUsage) {
        alerts.push({
          id: `memory-${Date.now()}`,
          type: metrics.memoryUsage > 95 ? 'critical' : metrics.memoryUsage > 90 ? 'error' : 'warning',
          message: `High memory usage: ${metrics.memoryUsage.toFixed(2)}%`,
          timestamp: new Date(),
          serverId: this.serverId,
          metrics: { memoryUsage: metrics.memoryUsage },
          resolved: false
        });
      }

      // Response time alert
      if (metrics.averageResponseTime > this.thresholds.responseTime) {
        alerts.push({
          id: `response-${Date.now()}`,
          type: metrics.averageResponseTime > 2000 ? 'critical' : 'error',
          message: `High response time: ${metrics.averageResponseTime.toFixed(2)}ms`,
          timestamp: new Date(),
          serverId: this.serverId,
          metrics: { averageResponseTime: metrics.averageResponseTime },
          resolved: false
        });
      }

      // Error rate alert
      if (metrics.errorsPerSecond > 0 && metrics.requestsPerSecond > 0) {
        const errorRate = (metrics.errorsPerSecond / metrics.requestsPerSecond) * 100;
        if (errorRate > this.thresholds.errorRate) {
          alerts.push({
            id: `error-rate-${Date.now()}`,
            type: errorRate > 20 ? 'critical' : errorRate > 10 ? 'error' : 'warning',
            message: `High error rate: ${errorRate.toFixed(2)}%`,
            timestamp: new Date(),
            serverId: this.serverId,
            metrics: { errorsPerSecond: metrics.errorsPerSecond, requestsPerSecond: metrics.requestsPerSecond },
            resolved: false
          });
        }
      }

      // Add alerts to local storage
      this.alerts.push(...alerts);
      
      // Store alerts in Redis
      for (const alert of alerts) {
        await this.storeAlertInRedis(alert);
      }

      // Log critical alerts
      const criticalAlerts = alerts.filter(a => a.type === 'critical');
      if (criticalAlerts.length > 0) {
        logger.error('Critical performance alerts generated:', criticalAlerts);
      }
    } catch (error) {
      logger.error('Failed to check performance thresholds:', error);
    }
  }

  private async checkMatchPerformanceThresholds(matchId: string, metrics: MatchPerformanceMetrics): Promise<void> {
    try {
      const alerts: SystemPerformanceAlert[] = [];

      // High latency alert
      if (metrics.averageLatency > 500) {
        alerts.push({
          id: `match-latency-${matchId}-${Date.now()}`,
          type: metrics.averageLatency > 1000 ? 'critical' : 'error',
          message: `High match latency for ${matchId}: ${metrics.averageLatency.toFixed(2)}ms`,
          timestamp: new Date(),
          serverId: this.serverId,
          matchId,
          metrics: { averageResponseTime: metrics.averageLatency },
          resolved: false
        });
      }

      // High memory usage for match
      if (metrics.memoryUsage > 50) {
        alerts.push({
          id: `match-memory-${matchId}-${Date.now()}`,
          type: metrics.memoryUsage > 80 ? 'critical' : 'warning',
          message: `High memory usage for match ${matchId}: ${metrics.memoryUsage.toFixed(2)}%`,
          timestamp: new Date(),
          serverId: this.serverId,
          matchId,
          metrics: { memoryUsage: metrics.memoryUsage },
          resolved: false
        });
      }

      // Add alerts
      this.alerts.push(...alerts);
      
      // Store in Redis
      for (const alert of alerts) {
        await this.storeAlertInRedis(alert);
      }
    } catch (error) {
      logger.error(`Failed to check match performance thresholds for ${matchId}:`, error);
    }
  }

  // Redis storage
  private async storeMetricsInRedis(metrics: PerformanceMetrics): Promise<void> {
    try {
      const key = `performance:metrics:${this.serverId}:${Date.now()}`;
      await redisService.set(key, metrics, { ttl: 86400 }); // 24 hours
      
      // Store latest metrics
      await redisService.set(`performance:latest:${this.serverId}`, metrics, { ttl: 3600 }); // 1 hour
    } catch (error) {
      logger.error('Failed to store metrics in Redis:', error);
    }
  }

  private async storeMatchMetricsInRedis(matchId: string, metrics: MatchPerformanceMetrics): Promise<void> {
    try {
      const key = `performance:match:${matchId}:${Date.now()}`;
      await redisService.set(key, metrics, { ttl: 86400 }); // 24 hours
      
      // Store latest match metrics
      await redisService.set(`performance:match:latest:${matchId}`, metrics, { ttl: 3600 }); // 1 hour
    } catch (error) {
      logger.error(`Failed to store match metrics in Redis for ${matchId}:`, error);
    }
  }

  private async storeAlertInRedis(alert: SystemPerformanceAlert): Promise<void> {
    try {
      const key = `performance:alerts:${alert.id}`;
      await redisService.set(key, alert, { ttl: 86400 }); // 24 hours
      
      // Store in alerts list
      await redisService.lpush('performance:alerts', alert, { ttl: 86400 });
    } catch (error) {
      logger.error('Failed to store alert in Redis:', error);
    }
  }

  // Data retrieval
  async getPerformanceMetrics(serverId?: string, hours: number = 1): Promise<PerformanceMetrics[]> {
    try {
      if (serverId) {
        return this.metrics.filter(m => m.serverId === serverId && 
          m.timestamp.getTime() > Date.now() - (hours * 60 * 60 * 1000));
      }
      
      return this.metrics.filter(m => 
        m.timestamp.getTime() > Date.now() - (hours * 60 * 60 * 1000));
    } catch (error) {
      logger.error('Failed to get performance metrics:', error);
      return [];
    }
  }

  async getMatchPerformanceMetrics(matchId: string, hours: number = 1): Promise<MatchPerformanceMetrics[]> {
    try {
      const matchMetrics = this.matchMetrics.get(matchId) || [];
      return matchMetrics.filter(m => 
        m.timestamp.getTime() > Date.now() - (hours * 60 * 60 * 1000));
    } catch (error) {
      logger.error(`Failed to get match performance metrics for ${matchId}:`, error);
      return [];
    }
  }

  async getAlerts(resolved: boolean = false): Promise<SystemPerformanceAlert[]> {
    try {
      return this.alerts.filter(a => a.resolved === resolved);
    } catch (error) {
      logger.error('Failed to get alerts:', error);
      return [];
    }
  }

  // Alert management
  async resolveAlert(alertId: string): Promise<void> {
    try {
      const alert = this.alerts.find(a => a.id === alertId);
      if (alert) {
        alert.resolved = true;
        alert.resolvedAt = new Date();
        
        // Update in Redis
        await redisService.set(`performance:alerts:${alertId}`, alert, { ttl: 86400 });
      }
    } catch (error) {
      logger.error(`Failed to resolve alert ${alertId}:`, error);
    }
  }

  // Threshold management
  updateThresholds(newThresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    logger.info('Performance thresholds updated', this.thresholds);
  }

  getThresholds(): PerformanceThresholds {
    return { ...this.thresholds };
  }

  // Cleanup
  private cleanupOldMetrics(): void {
    const cutoffTime = Date.now() - (this.metricsRetentionHours * 60 * 60 * 1000);
    
    // Cleanup performance metrics
    this.metrics = this.metrics.filter(m => m.timestamp.getTime() > cutoffTime);
    
    // Cleanup match metrics
    for (const [matchId, metrics] of this.matchMetrics.entries()) {
      this.matchMetrics.set(matchId, metrics.filter(m => m.timestamp.getTime() > cutoffTime));
    }
    
    // Cleanup old alerts
    this.alerts = this.alerts.filter(a => a.timestamp.getTime() > cutoffTime);
    
    // Limit stored metrics
    if (this.metrics.length > this.maxMetricsStored) {
      this.metrics = this.metrics.slice(-this.maxMetricsStored);
    }
  }

  // System health check
  async getSystemHealth(): Promise<{
    healthy: boolean;
    issues: string[];
    metrics: PerformanceMetrics | null;
  }> {
    try {
      const latestMetrics = this.metrics[this.metrics.length - 1];
      const issues: string[] = [];
      
      if (latestMetrics) {
        if (latestMetrics.cpuUsage > this.thresholds.cpuUsage) {
          issues.push(`High CPU usage: ${latestMetrics.cpuUsage.toFixed(2)}%`);
        }
        if (latestMetrics.memoryUsage > this.thresholds.memoryUsage) {
          issues.push(`High memory usage: ${latestMetrics.memoryUsage.toFixed(2)}%`);
        }
        if (latestMetrics.averageResponseTime > this.thresholds.responseTime) {
          issues.push(`High response time: ${latestMetrics.averageResponseTime.toFixed(2)}ms`);
        }
      }
      
      return {
        healthy: issues.length === 0,
        issues,
        metrics: latestMetrics || null
      };
    } catch (error) {
      logger.error('Failed to get system health:', error);
      return {
        healthy: false,
        issues: ['Failed to retrieve system health'],
        metrics: null
      };
    }
  }

  // Cleanup and shutdown
  async cleanup(): Promise<void> {
    try {
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
      }
      
      logger.info('PerformanceMonitoringService cleanup completed');
    } catch (error) {
      logger.error('Failed to cleanup PerformanceMonitoringService:', error);
    }
  }

  // Utility methods
  isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  getServerId(): string {
    return this.serverId;
  }

  getMetricsCount(): number {
    return this.metrics.length;
  }

  getMatchMetricsCount(): number {
    return Array.from(this.matchMetrics.values()).reduce((sum, metrics) => sum + metrics.length, 0);
  }

  getAlertsCount(): number {
    return this.alerts.length;
  }
}

// Create and export a singleton instance
const performanceMonitoringService = new PerformanceMonitoringService();

export default performanceMonitoringService;
