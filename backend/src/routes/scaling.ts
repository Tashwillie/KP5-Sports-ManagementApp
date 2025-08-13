import { Router } from 'express';
import { param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleAuth';
import { requirePermission } from '../middleware/permissions';
import distributedMatchStateManager from '../services/distributedMatchStateManager';
import loadBalancerService from '../services/loadBalancerService';
import performanceMonitoringService from '../services/performanceMonitoringService';
import redisService from '../services/redisService';

const router = Router();

// Validation schemas
const timeRangeSchema = [
  query('hours').optional().isInt({ min: 1, max: 168 }).withMessage('Hours must be between 1 and 168')
];

const serverIdSchema = [
  param('serverId').isString().trim().isLength({ min: 1, max: 100 })
];

// System Health and Status
router.get('/health', authenticate, requirePermission('system.view'), async (req, res) => {
  try {
    const [distributedHealth, loadBalancerHealth, performanceHealth, redisHealth] = await Promise.all([
      distributedMatchStateManager.getSystemHealth(),
      loadBalancerService.getLoadBalancerStats(),
      performanceMonitoringService.getSystemHealth(),
      redisService.healthCheck()
    ]);

    const overallHealth = {
      healthy: distributedHealth.redisHealth && redisHealth && performanceHealth.healthy,
      timestamp: new Date(),
      services: {
        distributedMatchState: distributedHealth,
        loadBalancer: loadBalancerHealth,
        performanceMonitoring: performanceHealth,
        redis: { healthy: redisHealth }
      }
    };

    res.json(overallHealth);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get system health' });
  }
});

// Distributed Match State Management
router.get('/distributed/status', authenticate, requirePermission('system.view'), async (req, res) => {
  try {
    const status = {
      serverId: distributedMatchStateManager.getServerId(),
      initialized: distributedMatchStateManager.isServerInitialized(),
      localMatchCount: distributedMatchStateManager.getLocalMatchCount(),
      localRoomCount: distributedMatchStateManager.getLocalRoomCount(),
      serverRegistrySize: distributedMatchStateManager.getServerRegistrySize()
    };

    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get distributed status' });
  }
});

router.get('/distributed/servers', authenticate, requirePermission('system.view'), async (req, res) => {
  try {
    const servers = await distributedMatchStateManager.getAllServerInfo();
    res.json(servers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get server registry' });
  }
});

router.get('/distributed/matches/:matchId', [
  param('matchId').isUUID(),
  ...timeRangeSchema
], validateRequest, authenticate, requirePermission('system.view'), async (req, res) => {
  try {
    const { matchId } = req.params;
    const { hours = 1 } = req.query;

    const matchState = await distributedMatchStateManager.getMatchState(matchId);
    const matchRoom = await distributedMatchStateManager.getMatchRoom(matchId);
    const matchStats = await distributedMatchStateManager.getMatchStatistics(matchId);

    if (!matchState && !matchRoom) {
      return res.status(404).json({ error: 'Match not found' });
    }

    res.json({
      matchId,
      state: matchState,
      room: matchRoom,
      statistics: matchStats,
      timeRange: `${hours} hours`
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get distributed match info' });
  }
});

// Load Balancer
router.get('/loadbalancer/status', authenticate, requireRole(['SUPER_ADMIN']), async (req, res) => {
  try {
    const status = {
      initialized: loadBalancerService.isServiceInitialized(),
      config: loadBalancerService.getConfig(),
      currentServerIndex: loadBalancerService.getCurrentServerIndex()
    };

    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get load balancer status' });
  }
});

router.get('/loadbalancer/stats', authenticate, requireRole(['SUPER_ADMIN']), async (req, res) => {
  try {
    const stats = await loadBalancerService.getLoadBalancerStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get load balancer stats' });
  }
});

router.get('/loadbalancer/recommendations', authenticate, requireRole(['SUPER_ADMIN']), async (req, res) => {
  try {
    const recommendations = await loadBalancerService.getServerRecommendations();
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get server recommendations' });
  }
});

router.get('/loadbalancer/metrics', authenticate, requireRole(['SUPER_ADMIN']), async (req, res) => {
  try {
    const metrics = {
      connections: loadBalancerService.getConnectionMetrics(),
      matches: loadBalancerService.getMatchDistributionMetrics()
    };

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get load balancer metrics' });
  }
});

router.put('/loadbalancer/config', authenticate, requireRole(['SUPER_ADMIN']), async (req, res) => {
  try {
    const { maxConnectionsPerServer, maxMatchesPerServer, healthCheckInterval, loadBalancingStrategy, serverWeights } = req.body;

    const newConfig = {
      ...(maxConnectionsPerServer && { maxConnectionsPerServer }),
      ...(maxMatchesPerServer && { maxMatchesPerServer }),
      ...(healthCheckInterval && { healthCheckInterval }),
      ...(loadBalancingStrategy && { loadBalancingStrategy }),
      ...(serverWeights && { serverWeights })
    };

    loadBalancerService.updateConfig(newConfig);
    res.json({ message: 'Load balancer configuration updated', config: loadBalancerService.getConfig() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update load balancer configuration' });
  }
});

// Performance Monitoring
router.get('/performance/status', authenticate, requireRole(['SUPER_ADMIN']), async (req, res) => {
  try {
    const status = {
      initialized: performanceMonitoringService.isServiceInitialized(),
      serverId: performanceMonitoringService.getServerId(),
      metricsCount: performanceMonitoringService.getMetricsCount(),
      matchMetricsCount: performanceMonitoringService.getMatchMetricsCount(),
      alertsCount: performanceMonitoringService.getAlertsCount()
    };

    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get performance monitoring status' });
  }
});

router.get('/performance/metrics', [
  ...timeRangeSchema,
  query('serverId').optional().isString().trim()
], validateRequest, authenticate, requireRole(['SUPER_ADMIN']), async (req, res) => {
  try {
    const { hours = 1, serverId } = req.query;
    const metrics = await performanceMonitoringService.getPerformanceMetrics(serverId as string, hours as number);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get performance metrics' });
  }
});

router.get('/performance/matches/:matchId', [
  param('matchId').isUUID(),
  ...timeRangeSchema
], validateRequest, authenticate, requireRole(['SUPER_ADMIN', 'CLUB_ADMIN']), async (req, res) => {
  try {
    const { matchId } = req.params;
    const { hours = 1 } = req.query;

    const metrics = await performanceMonitoringService.getMatchPerformanceMetrics(matchId, hours as number);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get match performance metrics' });
  }
});

router.get('/performance/alerts', [
  query('resolved').optional().isBoolean()
], validateRequest, authenticate, requireRole(['SUPER_ADMIN']), async (req, res) => {
  try {
    const { resolved } = req.query;
    const alerts = await performanceMonitoringService.getAlerts(resolved === 'true');
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get performance alerts' });
  }
});

router.post('/performance/alerts/:alertId/resolve', [
  param('alertId').isString().trim()
], validateRequest, authenticate, requireRole(['SUPER_ADMIN']), async (req, res) => {
  try {
    const { alertId } = req.params;
    await performanceMonitoringService.resolveAlert(alertId);
    res.json({ message: 'Alert resolved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to resolve alert' });
  }
});

router.get('/performance/thresholds', authenticate, requireRole(['SUPER_ADMIN']), async (req, res) => {
  try {
    const thresholds = performanceMonitoringService.getThresholds();
    res.json(thresholds);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get performance thresholds' });
  }
});

router.put('/performance/thresholds', authenticate, requireRole(['SUPER_ADMIN']), async (req, res) => {
  try {
    const { cpuUsage, memoryUsage, responseTime, errorRate, connectionUtilization, matchUtilization } = req.body;

    const newThresholds = {
      ...(cpuUsage && { cpuUsage }),
      ...(memoryUsage && { memoryUsage }),
      ...(responseTime && { responseTime }),
      ...(errorRate && { errorRate }),
      ...(connectionUtilization && { connectionUtilization }),
      ...(matchUtilization && { matchUtilization })
    };

    performanceMonitoringService.updateThresholds(newThresholds);
    res.json({ message: 'Performance thresholds updated', thresholds: performanceMonitoringService.getThresholds() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update performance thresholds' });
  }
});

// Redis Service
router.get('/redis/status', authenticate, requireRole(['SUPER_ADMIN']), async (req, res) => {
  try {
    const status = {
      connected: redisService.getConnectionStatus(),
      health: await redisService.healthCheck(),
      ping: await redisService.ping()
    };

    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get Redis status' });
  }
});

router.get('/redis/info', authenticate, requireRole(['SUPER_ADMIN']), async (req, res) => {
  try {
    const info = await redisService.getServerInfo();
    res.json(info);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get Redis server info' });
  }
});

// System-wide scaling information
router.get('/overview', authenticate, requireRole(['SUPER_ADMIN']), async (req, res) => {
  try {
    const [distributedHealth, loadBalancerStats, performanceHealth, redisHealth] = await Promise.all([
      distributedMatchStateManager.getSystemHealth(),
      loadBalancerService.getLoadBalancerStats(),
      performanceMonitoringService.getSystemHealth(),
      redisService.healthCheck()
    ]);

    const overview = {
      timestamp: new Date(),
      overallHealth: distributedHealth.redisHealth && redisHealth && performanceHealth.healthy,
      distributedMatchState: {
        totalServers: distributedHealth.totalServers,
        totalActiveMatches: distributedHealth.totalActiveMatches,
        totalConnections: distributedHealth.totalConnections,
        redisHealth: distributedHealth.redisHealth
      },
      loadBalancer: {
        totalServers: loadBalancerStats.totalServers,
        totalConnections: loadBalancerStats.totalConnections,
        totalMatches: loadBalancerStats.totalMatches,
        averageConnectionUtilization: loadBalancerStats.averageConnectionUtilization,
        averageMatchUtilization: loadBalancerStats.averageMatchUtilization,
        loadBalancingEfficiency: loadBalancerStats.loadBalancingEfficiency
      },
      performance: {
        healthy: performanceHealth.healthy,
        issues: performanceHealth.issues,
        metricsCount: performanceMonitoringService.getMetricsCount(),
        alertsCount: performanceMonitoringService.getAlertsCount()
      },
      redis: {
        healthy: redisHealth,
        connectionStatus: redisService.getConnectionStatus()
      }
    };

    res.json(overview);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get system overview' });
  }
});

// Match scaling information
router.get('/matches/:matchId/scaling', [
  param('matchId').isUUID()
], validateRequest, authenticate, async (req, res) => {
  try {
    const { matchId } = req.params;

    const [matchState, matchRoom, matchStats, performanceMetrics] = await Promise.all([
      distributedMatchStateManager.getMatchState(matchId),
      distributedMatchStateManager.getMatchRoom(matchId),
      distributedMatchStateManager.getMatchStatistics(matchId),
      performanceMonitoringService.getMatchPerformanceMetrics(matchId, 1)
    ]);

    if (!matchState && !matchRoom) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const scalingInfo = {
      matchId,
      timestamp: new Date(),
      distributed: {
        state: matchState ? {
          serverId: matchState.serverId,
          version: matchState.version,
          lastUpdated: matchState.lastUpdated
        } : null,
        room: matchRoom ? {
          serverId: matchRoom.serverId,
          version: matchRoom.version,
          lastActivity: matchRoom.lastActivity
        } : null,
        statistics: matchStats
      },
      performance: {
        metrics: performanceMetrics,
        latestMetrics: performanceMetrics[performanceMetrics.length - 1] || null
      }
    };

    res.json(scalingInfo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get match scaling info' });
  }
});

export default router;
