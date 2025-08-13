# Real-Time Match System Integration Guide

This guide covers the integration of the new real-time communication system with the match management features of the KP5 Academy sports management platform.

## Overview

The real-time match system provides live updates for match events, scores, and statistics across web and mobile applications using WebSocket connections and the PostgreSQL backend.

## Architecture

### Backend Components

1. **WebSocket Service** (`backend/src/services/websocketService.ts`)
   - Handles WebSocket connections and authentication
   - Manages rooms for match-specific updates
   - Broadcasts real-time events to connected clients

2. **Match API Endpoints** (`backend/src/routes/matches.ts`)
   - RESTful API for match CRUD operations
   - WebSocket event emission on match updates
   - Real-time statistics calculation

### Frontend Components

1. **Real-Time Service** (`shared/src/services/realTimeService.ts`)
   - Client-side WebSocket connection management
   - Event subscription and emission
   - Automatic reconnection handling

2. **LiveMatchService** (`shared/src/services/LiveMatchService.ts`)
   - API calls for match operations
   - Integration with real-time service
   - Event broadcasting on match updates

3. **React Hooks** (`shared/src/hooks/useLiveMatch.ts`)
   - `useLiveMatch` - Single match management
   - `useLiveMatches` - Multiple matches list
   - Real-time subscription management

## Setup Instructions

### 1. Backend Setup

Ensure the WebSocket service is properly configured in your backend:

```typescript
// backend/src/index.ts
import { WebSocketService } from './services/websocketService';

const server = createServer(app);
export const webSocketService = new WebSocketService(server);
```

### 2. Frontend Setup

#### Web Application

Wrap your app with the RealTimeProvider:

```typescript
// web/src/app/layout.tsx
import { RealTimeProvider } from '@kp5-academy/shared';

const realTimeConfig = {
  url: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001',
  token: 'your-jwt-token', // Get from auth context
  reconnectInterval: 5000,
  maxReconnectAttempts: 5
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <RealTimeProvider config={realTimeConfig} autoConnect={true}>
          {children}
        </RealTimeProvider>
      </body>
    </html>
  );
}
```

#### Mobile Application

Initialize the real-time service in your mobile app:

```typescript
// mobile/src/App.tsx
import { RealTimeProvider } from '@kp5-academy/shared';
import MobileLiveMatchService from './src/services/LiveMatchService';

const realTimeConfig = {
  url: process.env.EXPO_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001',
  token: 'your-jwt-token', // Get from auth context
  reconnectInterval: 5000,
  maxReconnectAttempts: 5
};

export default function App() {
  return (
    <RealTimeProvider config={realTimeConfig} autoConnect={true}>
      <YourAppContent />
    </RealTimeProvider>
  );
}
```

## Usage Examples

### 1. Live Match Control Component

```typescript
import { useLiveMatch } from '@kp5-academy/shared';

function LiveMatchControl({ matchId }: { matchId: string }) {
  const {
    match,
    events,
    loading,
    error,
    startMatch,
    endMatch,
    addEvent
  } = useLiveMatch({ 
    matchId, 
    autoSubscribe: true, 
    enableRealTime: true 
  });

  const handleAddGoal = async (teamId: string) => {
    const response = await addEvent({
      type: 'goal',
      timestamp: new Date(),
      minute: 45,
      teamId,
      data: { playerName: 'John Doe' }
    });

    if (response.success) {
      console.log('Goal added successfully');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>{match?.homeTeamId} vs {match?.awayTeamId}</h2>
      <p>Status: {match?.status}</p>
      <button onClick={() => startMatch()}>Start Match</button>
      <button onClick={() => endMatch()}>End Match</button>
    </div>
  );
}
```

### 2. Live Matches List

```typescript
import { useLiveMatches } from '@kp5-academy/shared';

function LiveMatchesList() {
  const { matches, loading, error, refresh } = useLiveMatches({
    status: 'in_progress',
    limit: 10
  });

  if (loading) return <div>Loading matches...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Live Matches</h2>
      {matches.map(match => (
        <div key={match.id}>
          <h3>{match.homeTeamId} vs {match.awayTeamId}</h3>
          <p>Status: {match.status}</p>
        </div>
      ))}
    </div>
  );
}
```

### 3. Mobile Match Service

```typescript
import MobileLiveMatchService from './src/services/LiveMatchService';
import { RealTimeService } from '@kp5-academy/shared';

// Initialize with real-time service
const realTimeService = new RealTimeService(config);
MobileLiveMatchService.setRealTimeService(realTimeService);

// Subscribe to match updates
const unsubscribe = MobileLiveMatchService.subscribeToMatch(matchId, (match) => {
  console.log('Match updated:', match);
});

// Add match event
const response = await MobileLiveMatchService.addMatchEvent({
  matchId,
  type: 'goal',
  timestamp: new Date(),
  minute: 30,
  teamId: 'team-123',
  data: { playerName: 'Player Name' }
});
```

## Real-Time Events

### Match Events

The system broadcasts the following real-time events:

1. **match-created** - New match created
2. **match-updated** - Match details updated
3. **match-started** - Match started
4. **match-ended** - Match ended
5. **match-event-added** - New match event (goal, card, etc.)
6. **match-events-updated** - Match events list updated
7. **match-stats-updated** - Match statistics updated
8. **match-deleted** - Match deleted

### Event Structure

```typescript
interface RealTimeEvent {
  type: string;
  data: {
    matchId: string;
    event?: LiveMatchEvent;
    updates?: Partial<LiveMatch>;
    stats?: any;
    timestamp: Date;
  };
  timestamp: Date;
  userId?: string;
  room?: string;
}
```

## Room Management

The system uses WebSocket rooms for targeted updates:

- `match:{matchId}` - Match-specific updates
- `match-events:{matchId}` - Match events updates
- `live-matches` - Live matches list updates
- `user:{userId}` - User-specific updates
- `role:{role}` - Role-based updates

## Offline Support (Mobile)

The mobile LiveMatchService includes offline support:

```typescript
// Initialize offline support
await MobileLiveMatchService.initializeOfflineSupport();

// Check offline queue status
const status = MobileLiveMatchService.getOfflineQueueStatus();
console.log(`Offline actions: ${status.count}, Online: ${status.isOnline}`);

// Force sync when back online
await MobileLiveMatchService.forceSync();
```

## Error Handling

### Connection Errors

```typescript
const realTime = useRealTimeContext();

useEffect(() => {
  if (realTime.connectionState === 'disconnected') {
    console.log('WebSocket disconnected, attempting to reconnect...');
  }
}, [realTime.connectionState]);
```

### API Errors

```typescript
const { match, error, refresh } = useLiveMatch({ matchId });

if (error) {
  return (
    <div>
      <p>Error: {error}</p>
      <button onClick={refresh}>Retry</button>
    </div>
  );
}
```

## Performance Considerations

### 1. Event Throttling

For high-frequency events, consider throttling:

```typescript
import { throttle } from 'lodash';

const throttledAddEvent = throttle(async (eventData) => {
  await addEvent(eventData);
}, 1000); // Throttle to once per second
```

### 2. Selective Subscriptions

Only subscribe to necessary events:

```typescript
const { match } = useLiveMatch({ 
  matchId, 
  autoSubscribe: true,
  enableRealTime: true // Only enable if needed
});
```

### 3. Memory Management

Clean up subscriptions properly:

```typescript
useEffect(() => {
  const unsubscribe = subscribeToMatch(matchId, callback);
  return () => unsubscribe();
}, [matchId]);
```

## Testing

### 1. Test Real-Time Connection

```typescript
// web/src/app/test-realtime/page.tsx
import { RealTimeProvider, useRealTimeContext } from '@kp5-academy/shared';

function TestComponent() {
  const realTime = useRealTimeContext();
  
  return (
    <div>
      <p>Connection: {realTime.connectionState}</p>
      <p>Connected: {realTime.isConnected ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

### 2. Test Match Events

```typescript
// Test adding a match event
const response = await addEvent({
  type: 'goal',
  timestamp: new Date(),
  minute: 45,
  teamId: 'test-team',
  data: { playerName: 'Test Player' }
});

console.log('Event added:', response.success);
```

## Security Considerations

### 1. JWT Authentication

All WebSocket connections require valid JWT tokens:

```typescript
const realTimeConfig = {
  url: 'ws://localhost:3001',
  token: getAuthToken(), // Get from secure storage
  reconnectInterval: 5000,
  maxReconnectAttempts: 5
};
```

### 2. Role-Based Access

Match operations are restricted by user roles:

```typescript
// Only referees and admins can add match events
if (userRole !== 'referee' && userRole !== 'admin') {
  throw new Error('Unauthorized to add match events');
}
```

### 3. Input Validation

Validate all match event data:

```typescript
const eventData = {
  type: 'goal',
  timestamp: new Date(),
  minute: Math.max(0, Math.min(90, minute)), // Validate minute range
  teamId: validateTeamId(teamId),
  data: sanitizeEventData(data)
};
```

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check WebSocket URL configuration
   - Verify JWT token is valid
   - Check network connectivity

2. **Real-Time Events Not Received**
   - Verify room subscription
   - Check event type matching
   - Ensure real-time service is initialized

3. **Mobile Offline Queue Issues**
   - Check NetInfo connectivity
   - Verify AsyncStorage permissions
   - Review offline queue processing

### Debug Mode

Enable debug logging:

```typescript
const realTimeConfig = {
  url: 'ws://localhost:3001',
  token: 'your-token',
  debug: true // Enable debug logging
};
```

## Best Practices

1. **Always handle loading and error states**
2. **Clean up subscriptions on component unmount**
3. **Use appropriate event throttling for high-frequency updates**
4. **Implement proper offline handling for mobile**
5. **Validate all user inputs before sending to server**
6. **Use TypeScript for type safety**
7. **Test real-time functionality thoroughly**

## Migration from Firebase

If migrating from Firebase real-time database:

1. Replace Firebase listeners with WebSocket subscriptions
2. Update API calls to use REST endpoints
3. Replace Firebase collections with PostgreSQL tables
4. Update authentication to use JWT tokens
5. Implement offline support for mobile apps

## Support

For issues and questions:

1. Check the `REALTIME_SETUP.md` documentation
2. Review WebSocket service logs
3. Test with the provided test pages
4. Verify environment configuration
5. Check network connectivity and firewall settings
