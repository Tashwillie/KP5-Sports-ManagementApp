# 🚀 Scaling System for Multiple Concurrent Matches

This document describes the comprehensive scaling system implemented for the KP5 Academy sports management platform to handle multiple concurrent matches across multiple server instances.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Services](#services)
- [API Endpoints](#api-endpoints)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Monitoring](#monitoring)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The scaling system is designed to handle:
- **Multiple concurrent matches** across different server instances
- **Distributed state management** using Redis for cross-server communication
- **Load balancing** for WebSocket connections and match distribution
- **Performance monitoring** with real-time metrics and alerts
- **Horizontal scaling** by adding more server instances

### Key Features

- **Redis-based distributed caching** for match states and room management
- **Cross-server communication** via Redis pub/sub
- **Intelligent load balancing** with multiple strategies
- **Real-time performance monitoring** with configurable thresholds
- **Automatic health checks** and server registry management
- **Graceful scaling** without service interruption

## 🏗️ Architecture

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Server 1      │    │   Server 2      │    │   Server N      │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │WebSocket    │ │    │ │WebSocket    │ │    │ │WebSocket    │ │
│ │Service      │ │    │ │Service      │ │    │ │Service      │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │Distributed  │ │    │ │Distributed  │ │    │ │Distributed  │ │
│ │Match State  │ │    │ │Match State  │ │    │ │Match State  │ │
│ │Manager      │ │    │ │Manager      │ │    │ │Manager      │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │Load         │ │    │ │Load         │ │    │ │Load         │ │
│ │Balancer     │ │    │ │Balancer     │ │    │ │Balancer     │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │Performance  │ │    │ │Performance  │ │    │ │Performance  │ │
│ │Monitoring   │ │    │ │Monitoring   │ │    │ │Monitoring   │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │                 │
                    │      Redis      │
                    │                 │
                    │ ┌─────────────┐ │
                    │ │Cache        │ │
                    │ │Pub/Sub      │ │
                    │ │State Sync   │ │
                    │ └─────────────┘ │
                    └─────────────────┘
```

### Data Flow

1. **Client Connection**: Clients connect to any available server
2. **Load Balancing**: Load balancer distributes connections based on strategy
3. **Match Assignment**: Matches are assigned to servers with available capacity
4. **State Synchronization**: Match states are synchronized across servers via Redis
5. **Cross-Server Communication**: Events are broadcasted to all relevant servers
6. **Performance Monitoring**: Real-time metrics are collected and analyzed

## 🔧 Services

### 1. Redis Service (`redisService.ts`)

**Purpose**: Centralized caching and cross-server communication

**Features**:
- **Distributed caching** with TTL support
- **Pub/Sub messaging** for cross-server events
- **Hash operations** for complex data structures
- **Connection pooling** and automatic reconnection
- **Health monitoring** and performance metrics

**Usage**:
```typescript
import redisService from '../services/redisService';

// Cache operations
await redisService.set('key', value, { ttl: 3600 });
const value = await redisService.get('key');

// Pub/Sub operations
await redisService.publish('channel', message);
await redisService.subscribe('channel', callback);
```

### 2. Distributed Match State Manager (`distributedMatchStateManager.ts`)

**Purpose**: Manage match states across multiple server instances

**Features**:
- **Cross-server state synchronization** with version control
- **Automatic server registration** and heartbeat monitoring
- **Match state distribution** via Redis
- **Conflict resolution** using version numbers
- **Server health monitoring** and cleanup

**Usage**:
```typescript
import distributedMatchStateManager from '../services/distributedMatchStateManager';

// Get match state from any server
const matchState = await distributedMatchStateManager.getMatchState(matchId);

// Update match state (automatically syncs across servers)
await distributedMatchStateManager.updateMatchState(matchId, updates);

// Get system health
const health = await distributedMatchStateManager.getSystemHealth();
```

### 3. Load Balancer Service (`loadBalancerService.ts`)

**Purpose**: Distribute connections and matches across servers

**Features**:
- **Multiple load balancing strategies**:
  - Round Robin
  - Least Connections
  - Least Matches
  - Weighted
- **Server capacity monitoring** and health checks
- **Automatic failover** for unhealthy servers
- **Performance recommendations** and optimization

**Usage**:
```typescript
import loadBalancerService from '../services/loadBalancerService';

// Select best server for new connection
const serverId = await loadBalancerService.selectServer('least_connections');

// Get load balancing statistics
const stats = await loadBalancerService.getLoadBalancerStats();

// Update configuration
loadBalancerService.updateConfig({ maxConnectionsPerServer: 2000 });
```

### 4. Performance Monitoring Service (`performanceMonitoringService.ts`)

**Purpose**: Monitor system performance and generate alerts

**Features**:
- **Real-time metrics collection** (CPU, memory, response time)
- **Configurable thresholds** and alert generation
- **Match-specific performance tracking**
- **Historical data storage** with automatic cleanup
- **Cross-server performance aggregation**

**Usage**:
```typescript
import performanceMonitoringService from '../services/performanceMonitoringService';

// Track match performance
await performanceMonitoringService.trackMatchPerformance(matchId, {
  participantCount: 50,
  eventsPerSecond: 10,
  averageLatency: 150
});

// Get performance metrics
const metrics = await performanceMonitoringService.getPerformanceMetrics();

// Update thresholds
performanceMonitoringService.updateThresholds({ cpuUsage: 80 });
```

## 🌐 API Endpoints

### Base Path: `/api/scaling`

#### System Health
- `GET /health` - Overall system health status
- `GET /overview` - Comprehensive system overview

#### Distributed Match State Management
- `GET /distributed/status` - Current server status
- `GET /distributed/servers` - Server registry
- `GET /distributed/matches/:matchId` - Match state from distributed system

#### Load Balancer
- `GET /loadbalancer/status` - Load balancer status
- `GET /loadbalancer/stats` - Load balancing statistics
- `GET /loadbalancer/recommendations` - Server recommendations
- `GET /loadbalancer/metrics` - Connection and match metrics
- `PUT /loadbalancer/config` - Update load balancer configuration

#### Performance Monitoring
- `GET /performance/status` - Performance monitoring status
- `GET /performance/metrics` - Performance metrics
- `GET /performance/matches/:matchId` - Match-specific performance
- `GET /performance/alerts` - Performance alerts
- `POST /performance/alerts/:alertId/resolve` - Resolve alert
- `GET /performance/thresholds` - Current thresholds
- `PUT /performance/thresholds` - Update thresholds

#### Redis Service
- `GET /redis/status` - Redis connection status
- `GET /redis/info` - Redis server information

#### Match Scaling
- `GET /matches/:matchId/scaling` - Match scaling information

### Example API Usage

```bash
# Get system health
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/scaling/health

# Get load balancer stats
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/scaling/loadbalancer/stats

# Update performance thresholds
curl -X PUT -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cpuUsage": 75, "memoryUsage": 80}' \
  http://localhost:3001/api/scaling/performance/thresholds
```

## ⚙️ Configuration

### Environment Variables

```bash
# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0

# Load Balancer Configuration
MAX_CONNECTIONS_PER_SERVER=1000
MAX_MATCHES_PER_SERVER=100
LOAD_BALANCER_HEALTH_CHECK_INTERVAL=30000
LOAD_BALANCING_STRATEGY=least_connections

# Performance Monitoring
PERFORMANCE_MONITORING_INTERVAL=10000
METRICS_RETENTION_HOURS=24
MAX_METRICS_STORED=1000
```

### Load Balancing Strategies

1. **Round Robin** (`round_robin`)
   - Distributes connections sequentially across servers
   - Simple and predictable
   - Good for evenly distributed load

2. **Least Connections** (`least_connections`)
   - Routes to server with fewest active connections
   - Balances connection load
   - Recommended for most use cases

3. **Least Matches** (`least_matches`)
   - Routes to server with fewest active matches
   - Balances match distribution
   - Good for match-heavy workloads

4. **Weighted** (`weighted`)
   - Uses server weights and current capacity
   - Most sophisticated strategy
   - Requires manual weight configuration

### Performance Thresholds

```typescript
const defaultThresholds = {
  cpuUsage: 80,           // CPU usage percentage
  memoryUsage: 85,        // Memory usage percentage
  responseTime: 1000,     // Response time in milliseconds
  errorRate: 5,           // Error rate percentage
  connectionUtilization: 90, // Connection utilization percentage
  matchUtilization: 90    // Match utilization percentage
};
```

## 🚀 Deployment

### Single Server Setup

1. **Install Redis**:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install redis-server
   
   # macOS
   brew install redis
   
   # Docker
   docker run -d -p 6379:6379 redis:7-alpine
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with Redis configuration
   ```

3. **Start the server**:
   ```bash
   npm run dev
   ```

### Multi-Server Setup

1. **Prepare multiple servers** with the same codebase
2. **Configure shared Redis** instance accessible to all servers
3. **Set unique server identifiers** (HOSTNAME environment variable)
4. **Start servers** on different ports or machines
5. **Configure load balancer** (nginx, HAProxy, or cloud load balancer)

### Docker Compose (Multi-Server)

```yaml
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend-1:
    build: .
    environment:
      - PORT=3001
      - REDIS_URL=redis://redis:6379
      - HOSTNAME=server-1
    ports:
      - "3001:3001"

  backend-2:
    build: .
    environment:
      - PORT=3002
      - REDIS_URL=redis://redis:6379
      - HOSTNAME=server-2
    ports:
      - "3002:3002"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - backend-1
      - backend-2

volumes:
  redis_data:
```

### Nginx Load Balancer Configuration

```nginx
upstream backend {
    server backend-1:3001;
    server backend-2:3002;
    
    # WebSocket support
    map $http_upgrade $connection_upgrade {
        default upgrade;
        '' close;
    }
}

server {
    listen 80;
    
    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 📊 Monitoring

### Real-Time Metrics

The system provides real-time monitoring of:

- **Server Health**: CPU, memory, connection count
- **Match Distribution**: Active matches per server
- **Performance Metrics**: Response times, error rates
- **Load Balancing**: Connection distribution efficiency
- **Redis Performance**: Response times, connection status

### Alert System

**Alert Types**:
- **Warning**: System approaching limits
- **Error**: System performance degraded
- **Critical**: System at risk of failure

**Alert Triggers**:
- High CPU/memory usage
- Slow response times
- High error rates
- Connection capacity reached
- Redis connection issues

### Monitoring Dashboard

Access monitoring data via API endpoints:

```bash
# System overview
GET /api/scaling/overview

# Performance metrics
GET /api/scaling/performance/metrics?hours=24

# Load balancer stats
GET /api/scaling/loadbalancer/stats
```

## 🧪 Testing

### Running Tests

1. **Start the backend server** with Redis
2. **Run the scaling system tests**:
   ```bash
   npm run test:scaling
   ```

### Test Coverage

The test script covers:
- System health checks
- Distributed match state management
- Load balancer functionality
- Performance monitoring
- Redis service operations
- System overview and match scaling

### Manual Testing

Test individual components:

```bash
# Test Redis connection
curl http://localhost:3001/api/scaling/redis/status

# Test load balancer
curl http://localhost:3001/api/scaling/loadbalancer/stats

# Test performance monitoring
curl http://localhost:3001/api/scaling/performance/status
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Redis Connection Failed

**Symptoms**:
- Services fail to initialize
- Cross-server communication broken
- Cache operations failing

**Solutions**:
- Check Redis server status: `redis-cli ping`
- Verify connection string in environment
- Check firewall and network connectivity
- Ensure Redis is running and accessible

#### 2. Load Balancer Not Working

**Symptoms**:
- Connections not distributed evenly
- Some servers overloaded
- Load balancing efficiency low

**Solutions**:
- Check server health status
- Verify load balancing strategy
- Review server capacity settings
- Check for network issues between servers

#### 3. Performance Degradation

**Symptoms**:
- High response times
- Memory usage spikes
- CPU usage high

**Solutions**:
- Review performance thresholds
- Check for memory leaks
- Monitor database query performance
- Scale horizontally by adding servers

#### 4. Cross-Server Sync Issues

**Symptoms**:
- Match states inconsistent
- Events not propagating
- Version conflicts

**Solutions**:
- Check Redis pub/sub connectivity
- Verify server registration
- Review heartbeat intervals
- Check for network latency issues

### Debug Mode

Enable debug logging:

```bash
# Set log level
export LOG_LEVEL=debug

# Start server with debug
npm run dev
```

### Health Checks

Monitor system health:

```bash
# Overall health
curl http://localhost:3001/api/scaling/health

# Individual service health
curl http://localhost:3001/api/scaling/redis/status
curl http://localhost:3001/api/scaling/loadbalancer/status
curl http://localhost:3001/api/scaling/performance/status
```

## 🔮 Future Enhancements

### Planned Features

1. **Auto-scaling**: Automatic server provisioning based on load
2. **Geographic distribution**: Multi-region server deployment
3. **Advanced metrics**: Machine learning-based performance prediction
4. **Dynamic configuration**: Runtime configuration updates
5. **Backup and recovery**: Automated disaster recovery procedures

### Scalability Improvements

1. **Database sharding**: Distribute database load across instances
2. **CDN integration**: Global content delivery optimization
3. **Microservices**: Break down into smaller, focused services
4. **Event sourcing**: Advanced event handling and replay
5. **Caching layers**: Multi-level caching strategies

## 📚 Additional Resources

- [Redis Documentation](https://redis.io/documentation)
- [Socket.IO Scaling Guide](https://socket.io/docs/v4/using-multiple-nodes/)
- [Load Balancing Strategies](https://en.wikipedia.org/wiki/Load_balancing_(computing))
- [Performance Monitoring Best Practices](https://www.datadoghq.com/blog/monitoring-101-collecting-data/)

## 🤝 Support

For issues with the scaling system:

1. Check the troubleshooting section above
2. Review server logs for error messages
3. Verify Redis connectivity and configuration
4. Test individual service endpoints
5. Check system resource usage
6. Review performance monitoring alerts

---

**Note**: This scaling system is designed for production use with multiple concurrent matches. Ensure proper testing and monitoring before deploying to production environments.
