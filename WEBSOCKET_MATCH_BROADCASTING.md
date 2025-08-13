# WebSocket Match Event Broadcasting System

This document describes the complete WebSocket-based real-time match event broadcasting system for the KP5 Academy sports management platform.

## Overview

The WebSocket system provides real-time communication between:
- **Referees/Admins** entering match events
- **Players/Coaches** viewing live match updates
- **Spectators** following match progress
- **Tournament systems** receiving live standings updates

## Architecture

### Backend Components

1. **WebSocketService** (`backend/src/services/websocketService.ts`)
   - Manages Socket.IO server
   - Handles authentication and room management
   - Broadcasts match events in real-time
   - Maintains match state in memory

2. **Matches Controller** (`backend/src/controllers/matches.ts`)
   - Integrates with WebSocket for real-time updates
   - Broadcasts match status changes
   - Updates match state after events

3. **Matches Routes** (`backend/src/routes/matches.ts`)
   - WebSocket status endpoints
   - Match state management endpoints

### Frontend Components

1. **RealTimeService** (`shared/src/services/realTimeService.ts`)
   - Client-side WebSocket connection
   - Event emission and subscription
   - Room management

2. **LiveMatchService** (`shared/src/services/LiveMatchService.ts`)
   - High-level match operations
   - WebSocket integration
   - Match state management

## WebSocket Events

### Client to Server Events

#### Join/Leave Events
```typescript
// Join match room
socket.emit('join-match', matchId);

// Leave match room
socket.emit('leave-match', matchId);

// Join tournament room
socket.emit('join-tournament', tournamentId);

// Join generic room
socket.emit('join-room', roomName);
```

#### Match Control Events
```typescript
// Add match event (goal, card, substitution, etc.)
socket.emit('match-event', {
  matchId: string,
  type: 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'substitution' | 'injury' | 'other',
  minute: number,
  description?: string,
  playerId?: string,
  teamId: string,
  data?: any
});

// Change match status
socket.emit('match-status-change', {
  matchId: string,
  status: 'scheduled' | 'in_progress' | 'paused' | 'completed' | 'cancelled' | 'postponed',
  timestamp: Date,
  additionalData?: any
});

// Control match timer
socket.emit('match-timer-control', {
  matchId: string,
  action: 'start' | 'pause' | 'resume' | 'stop',
  timestamp: Date
});
```

#### Chat Events
```typescript
// Send chat message
socket.emit('chat-message', {
  room: string,
  message: string,
  teamId?: string
});

// Typing indicators
socket.emit('typing-start', { room: string, teamId?: string });
socket.emit('typing-stop', { room: string, teamId?: string });
```

### Server to Client Events

#### Match Events
```typescript
// Match event occurred
socket.on('match-event', (data) => {
  // data includes: event details + userId, userRole, userEmail, timestamp
});

// Match status changed
socket.on('match-status-change', (data) => {
  // data includes: status + userId, userRole, userEmail, timestamp, match details
});

// Match timer updated
socket.on('match-timer-update', (data) => {
  // data includes: action + userId, userRole, userEmail, timestamp
});
```

#### Match State Events
```typescript
// Initial match state
socket.on('match-state', (state: MatchState) => {
  // Complete match state when joining room
});

// Match state update
socket.on('match-state-update', (state: MatchState) => {
  // Updated match state after events
});
```

#### Chat Events
```typescript
// Chat message received
socket.on('chat-message', (data) => {
  // data includes: message + userId, userEmail, timestamp
});

// Typing indicators
socket.on('typing-start', (data) => {
  // data includes: userId, userEmail
});

socket.on('typing-stop', (data) => {
  // data includes: userId, userEmail
});
```

## Match State Structure

```typescript
interface MatchState {
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
}
```

## Usage Examples

### Frontend Implementation

#### 1. Connect to WebSocket

```typescript
import { RealTimeService } from './services/realTimeService';
import { LiveMatchService } from './services/LiveMatchService';

// Initialize services
const realTimeService = new RealTimeService({
  url: 'ws://localhost:3001',
  token: 'your-jwt-token'
});

const liveMatchService = new LiveMatchService();
liveMatchService.setRealTimeService(realTimeService);

// Connect
await realTimeService.connect();
```

#### 2. Join Match Room

```typescript
// Join match room
realTimeService.joinMatch(matchId);

// Subscribe to match state updates
const unsubscribe = liveMatchService.onMatchState(matchId, (state) => {
  console.log('Match state updated:', state);
  // Update UI with new state
});

// Listen for match events
realTimeService.on('match-event', (event) => {
  console.log('New match event:', event);
  // Handle new event (goal, card, etc.)
});
```

#### 3. Add Match Events

```typescript
// Add goal
liveMatchService.addGoal(matchId, playerId, teamId, minute, 'Great shot!');

// Add yellow card
liveMatchService.addCard(matchId, playerId, teamId, 'yellow_card', minute, 'Foul play');

// Add substitution
liveMatchService.addSubstitution(matchId, playerOutId, playerInId, teamId, minute);

// Add injury
liveMatchService.addInjury(matchId, playerId, teamId, minute, 'Ankle sprain');
```

#### 4. Control Match

```typescript
// Start match
liveMatchService.startMatchRealTime(matchId);

// Pause match
liveMatchService.pauseMatchRealTime(matchId);

// Resume match
liveMatchService.resumeMatchRealTime(matchId);

// End match
liveMatchService.endMatchRealTime(matchId, 2, 1);

// Timer control
liveMatchService.startTimer(matchId);
liveMatchService.pauseTimer(matchId);
liveMatchService.resumeTimer(matchId);
liveMatchService.stopTimer(matchId);
```

### Backend Implementation

#### 1. WebSocket Service Integration

```typescript
import { webSocketService } from '../index';

// Broadcast to match room
webSocketService.broadcastToRoom(`match:${matchId}`, 'match-event', eventData);

// Broadcast to specific user
webSocketService.broadcastToUser(userId, 'notification', notificationData);

// Broadcast to role
webSocketService.broadcastToRole('COACH', 'team-update', teamData);
```

#### 2. Match Controller Integration

```typescript
// After adding match event
const event = await prisma.matchEvent.create({...});

// Broadcast via WebSocket
try {
  const room = `match:${matchId}`;
  const broadcastData = {
    ...event,
    timestamp: new Date(),
    userId: req.user.id,
    userRole: req.user.role,
    userEmail: req.user.email
  };
  
  webSocketService.broadcastToRoom(room, 'match-event', broadcastData);
  await webSocketService.refreshMatchState(matchId);
} catch (wsError) {
  logger.error('WebSocket broadcast error:', wsError);
}
```

## Security & Permissions

### Authentication
- All WebSocket connections require JWT token
- Token validated on connection
- User information stored in socket data

### Authorization
```typescript
// Check if user can modify match
private async canUserModifyMatch(userId: string, userRole: string, matchId: string): Promise<boolean> {
  // Super admins and club admins can modify any match
  if (userRole === 'SUPER_ADMIN' || userRole === 'CLUB_ADMIN') {
    return true;
  }
  
  // Check if user is a participant in this match
  const participant = await prisma.matchParticipant.findFirst({
    where: {
      matchId,
      userId,
      role: { in: ['REFEREE', 'COACH', 'ADMIN'] }
    }
  });
  
  if (participant) {
    return true;
  }
  
  // Check if user is a coach of one of the teams
  // ... additional checks
}
```

## Room Management

### Match Rooms
- Format: `match:{matchId}`
- Users automatically join when calling `join-match`
- All match events broadcast to match room

### Tournament Rooms
- Format: `tournament:{tournamentId}`
- Users automatically join when joining match in tournament
- Tournament updates broadcast to tournament room

### Role Rooms
- Format: `role:{userRole}`
- Users automatically join based on their role
- Role-specific updates broadcast to role rooms

### User Rooms
- Format: `user:{userId}`
- Users automatically join their personal room
- Personal notifications sent to user room

## Error Handling

### WebSocket Errors
```typescript
socket.on('error', (error) => {
  console.error('WebSocket error:', error);
  // Handle error (reconnect, show user message, etc.)
});
```

### Connection Errors
```typescript
socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
  // Handle connection failure
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
  // Handle disconnection
});
```

## Performance Considerations

### Memory Management
- Match states cached in memory for fast access
- Automatic cleanup of disconnected users
- Room tracking for efficient broadcasting

### Scalability
- Room-based broadcasting (not global)
- Event filtering by room membership
- Efficient user tracking

### Offline Support
- Events queued when offline
- Automatic reconnection
- State synchronization on reconnection

## API Endpoints

### WebSocket Status
```http
GET /api/matches/websocket/status
GET /api/matches/:id/websocket-status
POST /api/matches/:id/websocket/refresh-state
```

### Health Check
```http
GET /health
GET /websocket/status
```

## Testing

### WebSocket Connection Test
```typescript
// Test connection
const status = await liveMatchService.getWebSocketStatus();
console.log('WebSocket status:', status);

// Test match room
const matchStatus = await liveMatchService.getMatchWebSocketStatus(matchId);
console.log('Match WebSocket status:', matchStatus);
```

### Event Broadcasting Test
```typescript
// Test event emission
liveMatchService.addGoal(matchId, playerId, teamId, 45, 'Test goal');

// Verify event received
realTimeService.on('match-event', (event) => {
  console.log('Event received:', event);
});
```

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check JWT token validity
   - Verify WebSocket server is running
   - Check CORS configuration

2. **Events Not Broadcasting**
   - Verify user has permissions
   - Check if user is in correct room
   - Verify event data format

3. **Match State Not Updating**
   - Check database connection
   - Verify match exists
   - Check WebSocket service logs

### Debug Logging
```typescript
// Enable debug logging
socket.onAny((eventName, data) => {
  console.log(`Event: ${eventName}`, data);
});
```

## Future Enhancements

1. **Real-time Statistics**
   - Live player performance metrics
   - Team possession and shots tracking
   - Advanced analytics

2. **Video Integration**
   - Live video streaming
   - Video highlights with events
   - Replay functionality

3. **Advanced Notifications**
   - Push notifications for mobile
   - Email notifications
   - SMS alerts

4. **Multi-language Support**
   - Internationalization
   - Localized event descriptions
   - Multi-language chat

## Conclusion

The WebSocket match event broadcasting system provides a robust, real-time foundation for live sports management. It enables referees and admins to enter match events in real-time while broadcasting updates to all connected users, creating an engaging and interactive experience for players, coaches, and spectators.

The system is designed with security, performance, and scalability in mind, making it suitable for both small local matches and large tournament events.
