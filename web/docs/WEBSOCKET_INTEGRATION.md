# WebSocket Integration Guide

This guide explains how to integrate the real-time WebSocket functionality with your PostgreSQL backend.

## Overview

The WebSocket implementation provides real-time synchronization between multiple devices for live match tracking, score updates, and event management.

## Architecture

```
Frontend (React) ←→ WebSocket Service ←→ Backend (Express + Socket.io)
     ↑                    ↑                      ↑
  Components         WebSocket Hook         WebSocket Server
```

## Frontend Components

### 1. WebSocket Service (`/src/lib/services/websocketService.ts`)

Core WebSocket management service with:
- Connection management
- Automatic reconnection
- Heartbeat monitoring
- Message routing
- Event handling

**Key Features:**
- Persistent connections
- Exponential backoff reconnection
- Message queuing
- Error handling

### 2. React Hook (`/src/hooks/useWebSocket.ts`)

React hook that integrates WebSocket service with components:
- Automatic connection management
- State synchronization
- Event subscription
- Cleanup on unmount

### 3. LiveMatchTracker Component

Enhanced match tracking component with real-time updates:
- WebSocket status indicators
- Real-time score synchronization
- Live event updates
- Multi-device coordination

## Backend Integration

### 1. Socket.io Server Setup

```typescript
// backend/src/services/websocketService.ts
import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

export class WebSocketService {
  private io: Server;

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3003",
        methods: ["GET", "POST"]
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Handle match subscriptions
      socket.on('SUBSCRIBE_MATCH', (data) => {
        this.handleMatchSubscription(socket, data);
      });

      // Handle match updates
      socket.on('MATCH_START', (data) => {
        this.broadcastMatchUpdate('MATCH_START', data);
      });

      socket.on('SCORE_UPDATE', (data) => {
        this.broadcastMatchUpdate('SCORE_UPDATE', data);
      });

      socket.on('EVENT_ADDED', (data) => {
        this.broadcastMatchUpdate('EVENT_ADDED', data);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  private handleMatchSubscription(socket: any, data: any) {
    const { matchId } = data;
    socket.join(`match:${matchId}`);
    console.log(`Client ${socket.id} subscribed to match ${matchId}`);
  }

  private broadcastMatchUpdate(type: string, data: any) {
    const { matchId } = data;
    
    // Broadcast to all clients subscribed to this match
    this.io.to(`match:${matchId}`).emit('MATCH_UPDATE', {
      type,
      payload: data,
      timestamp: new Date().toISOString()
    });

    // Store update in database
    this.storeMatchUpdate(type, data);
  }

  private async storeMatchUpdate(type: string, data: any) {
    try {
      // Store match events in database
      await prisma.matchEvent.create({
        data: {
          matchId: data.matchId,
          type: type,
          data: data,
          timestamp: new Date()
        }
      });

      // Update match statistics
      if (type === 'SCORE_UPDATE') {
        await this.updateMatchStatistics(data);
      }
    } catch (error) {
      console.error('Error storing match update:', error);
    }
  }

  private async updateMatchStatistics(data: any) {
    const { matchId, homeScore, awayScore } = data;
    
    await prisma.matchStatistics.upsert({
      where: { matchId },
      update: {
        homeScore,
        awayScore,
        updatedAt: new Date()
      },
      create: {
        matchId,
        homeScore,
        awayScore
      }
    });
  }
}
```

### 2. Express Server Integration

```typescript
// backend/src/index.ts
import express from 'express';
import { createServer } from 'http';
import { WebSocketService } from './services/websocketService';

const app = express();
const httpServer = createServer(app);

// Initialize WebSocket service
const webSocketService = new WebSocketService(httpServer);

// ... rest of your Express setup

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('WebSocket service initialized');
});
```

### 3. Database Schema Updates

```sql
-- Add WebSocket session tracking
CREATE TABLE websocket_sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id),
  match_id INTEGER REFERENCES matches(id),
  connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  disconnected_at TIMESTAMP,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add real-time match events
CREATE TABLE match_events (
  id SERIAL PRIMARY KEY,
  match_id INTEGER REFERENCES matches(id) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id INTEGER REFERENCES users(id),
  device_id VARCHAR(255)
);

-- Add match statistics for real-time updates
CREATE TABLE match_statistics (
  id SERIAL PRIMARY KEY,
  match_id INTEGER REFERENCES matches(id) UNIQUE NOT NULL,
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  match_status VARCHAR(50) DEFAULT 'NOT_STARTED',
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Message Types

### Client to Server

```typescript
interface ClientMessage {
  type: 'SUBSCRIBE_MATCH' | 'MATCH_START' | 'MATCH_PAUSE' | 'MATCH_RESUME' | 'MATCH_END' | 'SCORE_UPDATE' | 'EVENT_ADDED';
  payload: any;
  timestamp: string;
}
```

### Server to Client

```typescript
interface ServerMessage {
  type: 'MATCH_UPDATE';
  payload: {
    type: string;
    matchId: string;
    data: any;
    timestamp: string;
    userId?: string;
  };
}
```

## Security Considerations

### 1. Authentication

```typescript
// Verify JWT token on WebSocket connection
socket.on('authenticate', async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    socket.authenticated = true;
  } catch (error) {
    socket.disconnect();
  }
});
```

### 2. Authorization

```typescript
// Check user permissions for match actions
private async checkMatchPermission(userId: string, matchId: string, action: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { participants: true }
  });

  const participant = match.participants.find(p => p.userId === userId);
  
  if (!participant) {
    throw new Error('User not authorized for this match');
  }

  // Check role-based permissions
  if (action === 'START_MATCH' && participant.role !== 'REFEREE' && participant.role !== 'ADMIN') {
    throw new Error('Insufficient permissions to start match');
  }

  return true;
}
```

### 3. Rate Limiting

```typescript
// Implement rate limiting for WebSocket messages
import rateLimit from 'express-rate-limit';

const wsRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many WebSocket messages, please try again later.'
});
```

## Testing

### 1. Frontend Testing

```typescript
// Test WebSocket connection
describe('WebSocket Integration', () => {
  it('should connect to WebSocket server', async () => {
    const { result } = renderHook(() => useWebSocket());
    
    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });
  });

  it('should receive match updates', async () => {
    const mockUpdate = { type: 'SCORE_UPDATE', data: { homeScore: 1, awayScore: 0 } };
    
    // Mock WebSocket message
    // ... test implementation
  });
});
```

### 2. Backend Testing

```typescript
// Test WebSocket server
describe('WebSocket Service', () => {
  it('should handle client connections', (done) => {
    const client = io('http://localhost:3001');
    
    client.on('connect', () => {
      expect(client.connected).toBe(true);
      done();
    });
  });

  it('should broadcast match updates', (done) => {
    const client = io('http://localhost:3001');
    
    client.emit('SUBSCRIBE_MATCH', { matchId: 'test-match' });
    
    client.on('MATCH_UPDATE', (update) => {
      expect(update.type).toBe('MATCH_START');
      done();
    });
    
    // Trigger update
    client.emit('MATCH_START', { matchId: 'test-match' });
  });
});
```

## Deployment

### 1. Environment Variables

```bash
# Production environment
NEXT_PUBLIC_WEBSOCKET_URL=wss://your-domain.com/ws
WEBSOCKET_CORS_ORIGIN=https://your-domain.com
JWT_SECRET=your-secure-jwt-secret
```

### 2. Load Balancing

For production deployments with multiple server instances:

```typescript
// Use Redis adapter for Socket.io
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);

this.io.adapter(createAdapter(pubClient, subClient));
```

### 3. Monitoring

```typescript
// Add WebSocket metrics
import { instrument } from '@socket.io/admin-ui';

instrument(this.io, {
  auth: false,
  mode: "development"
});
```

## Troubleshooting

### Common Issues

1. **Connection Refused**: Check if WebSocket server is running and accessible
2. **CORS Errors**: Verify CORS configuration in backend
3. **Authentication Failures**: Check JWT token validity and expiration
4. **Message Loss**: Implement message queuing and retry logic

### Debug Mode

```typescript
// Enable debug logging
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  socket.onAny((eventName, ...args) => {
    console.log(`[DEBUG] ${eventName}:`, args);
  });
}
```

## Performance Optimization

### 1. Connection Pooling

```typescript
// Limit concurrent connections per user
const MAX_CONNECTIONS_PER_USER = 3;
const userConnections = new Map();

socket.on('connection', (socket) => {
  const userId = socket.userId;
  const connections = userConnections.get(userId) || 0;
  
  if (connections >= MAX_CONNECTIONS_PER_USER) {
    socket.disconnect();
    return;
  }
  
  userConnections.set(userId, connections + 1);
});
```

### 2. Message Batching

```typescript
// Batch multiple updates into single message
let updateQueue: any[] = [];
let batchTimeout: NodeJS.Timeout;

const batchUpdate = (update: any) => {
  updateQueue.push(update);
  
  if (batchTimeout) clearTimeout(batchTimeout);
  
  batchTimeout = setTimeout(() => {
    if (updateQueue.length > 0) {
      this.broadcastBatchUpdate(updateQueue);
      updateQueue = [];
    }
  }, 100); // 100ms batch window
};
```

This integration provides a robust, scalable real-time system for your sports management platform.
