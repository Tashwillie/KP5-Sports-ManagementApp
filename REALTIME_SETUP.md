# Real-Time Communication Setup

This document describes the real-time communication system implemented for the KP5 Academy sports management platform using Socket.IO.

## 🚀 Overview

The real-time communication system provides:
- **Live Match Data Entry** - Real-time match events (goals, cards, substitutions)
- **Chat System** - Team and group messaging
- **Notifications** - Real-time push notifications
- **Live Updates** - Tournament standings, team stats, and more

## 🏗️ Architecture

### Backend (Socket.IO Server)
- **Location**: `backend/src/services/websocketService.ts`
- **Port**: 3001 (same as REST API)
- **Authentication**: JWT-based token authentication
- **Rooms**: Dynamic room management for matches, teams, clubs

### Frontend (Socket.IO Client)
- **Web**: `shared/src/services/realTimeService.ts`
- **Mobile**: Same service shared across platforms
- **React Hooks**: `shared/src/hooks/useRealTime.ts`
- **Provider**: `shared/src/providers/RealTimeProvider.tsx`

## 📦 Dependencies

### Backend
```json
{
  "socket.io": "^4.7.4",
  "socket.io-client": "^4.7.4"
}
```

### Shared Package
```json
{
  "socket.io-client": "^4.7.4"
}
```

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install socket.io socket.io-client

# Shared package
cd ../shared
npm install socket.io-client
```

### 2. Environment Configuration

#### Backend (.env)
```env
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:3003
```

#### Web App (.env.local)
```env
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:3001
```

#### Mobile App (.env)
```env
EXPO_PUBLIC_WEBSOCKET_URL=wss://your-api-url.com
```

### 3. Start the Backend Server

```bash
cd backend
npm run dev
```

The WebSocket server will start on the same port as your REST API (3001).

## 🎯 Usage Examples

### 1. Basic Real-Time Connection

```tsx
import { RealTimeProvider, useRealTimeContext } from '@kp5-academy/shared';

function App() {
  const config = {
    url: 'ws://localhost:3001',
    token: 'your_jwt_token',
    reconnectInterval: 5000,
    maxReconnectAttempts: 5
  };

  return (
    <RealTimeProvider config={config} autoConnect={true}>
      <YourApp />
    </RealTimeProvider>
  );
}
```

### 2. Live Match Events

```tsx
import { useMatchEvents } from '@kp5-academy/shared';

function LiveMatch({ matchId }) {
  const { events, addEvent } = useMatchEvents(realTime, matchId);

  const handleGoal = (team: 'home' | 'away') => {
    addEvent({
      type: 'goal',
      team,
      playerName: 'John Doe',
      minute: 45
    });
  };

  return (
    <div>
      <button onClick={() => handleGoal('home')}>Home Goal</button>
      <button onClick={() => handleGoal('away')}>Away Goal</button>
      
      {events.map(event => (
        <div key={event.id}>
          {event.data.type} - {event.data.team}
        </div>
      ))}
    </div>
  );
}
```

### 3. Chat Messages

```tsx
import { useChatMessages } from '@kp5-academy/shared';

function TeamChat({ roomId }) {
  const { messages, sendMessage } = useChatMessages(realTime, roomId);
  const [input, setInput] = useState('');

  const handleSend = () => {
    sendMessage(input);
    setInput('');
  };

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>
          {msg.data.userEmail}: {msg.data.message}
        </div>
      ))}
      
      <input 
        value={input} 
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}
```

### 4. Notifications

```tsx
import { useRealTimeNotifications } from '@kp5-academy/shared';

function NotificationSystem() {
  const { notifications, sendNotification } = useRealTimeNotifications(realTime);

  const handleSendNotification = () => {
    sendNotification('user-123', {
      title: 'Match Update',
      message: 'Goal scored!',
      type: 'info'
    });
  };

  return (
    <div>
      <button onClick={handleSendNotification}>Send Notification</button>
      
      {notifications.map(notification => (
        <div key={notification.id}>
          {notification.data.title}: {notification.data.message}
        </div>
      ))}
    </div>
  );
}
```

## 🔐 Authentication

The WebSocket connection requires JWT authentication:

```tsx
const config = {
  url: 'ws://localhost:3001',
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', // JWT token
  reconnectInterval: 5000,
  maxReconnectAttempts: 5
};
```

The token should contain:
- `userId`: User's unique identifier
- `role`: User's role (coach, player, admin, etc.)
- `email`: User's email address

## 🏠 Room Management

### Automatic Rooms
- `user:{userId}` - User's personal room
- `role:{role}` - Role-based room (all coaches, all players, etc.)

### Dynamic Rooms
- `match:{matchId}` - Match-specific room
- `team:{teamId}` - Team-specific room
- `club:{clubId}` - Club-specific room
- `chat:{roomId}` - Chat room

### Joining/Leaving Rooms

```tsx
const realTime = useRealTimeContext();

// Join a match room
realTime.joinRoom(`match:${matchId}`);

// Leave a room
realTime.leaveRoom(`match:${matchId}`);
```

## 📡 Event Types

### Match Events
- `match-event` - Live match updates
- `goal` - Goal scored
- `card` - Yellow/red card
- `substitution` - Player substitution
- `start` - Match started
- `end` - Match ended
- `pause` - Match paused
- `resume` - Match resumed

### Communication Events
- `chat-message` - Chat messages
- `notification` - Push notifications
- `user-status-change` - User online/offline status
- `team-update` - Team information updates
- `tournament-update` - Tournament updates
- `event-reminder` - Event reminders

## 🧪 Testing

### Test Page
Visit `/test-realtime` to test the real-time functionality:

1. Open multiple browser tabs
2. Send match events, chat messages, and notifications
3. Verify real-time updates across all tabs

### Manual Testing
```bash
# Start backend
cd backend && npm run dev

# Start web app
cd web && npm run dev

# Visit test page
open http://localhost:3003/test-realtime
```

## 🔧 Configuration Options

### RealTimeService Configuration
```tsx
const config = {
  url: 'ws://localhost:3001',           // WebSocket server URL
  token: 'jwt_token',                   // Authentication token
  reconnectInterval: 5000,              // Reconnection interval (ms)
  maxReconnectAttempts: 5               // Max reconnection attempts
};
```

### RealTimeProvider Options
```tsx
<RealTimeProvider 
  config={config} 
  autoConnect={true}                    // Auto-connect on mount
>
  {children}
</RealTimeProvider>
```

## 🚨 Error Handling

### Connection Errors
```tsx
const realTime = useRealTimeContext();

if (realTime.error) {
  console.error('WebSocket error:', realTime.error);
  // Handle error (show notification, retry, etc.)
}
```

### Reconnection
The system automatically handles reconnection with exponential backoff:
- Initial reconnection attempt: 5 seconds
- Max attempts: 5
- Backoff strategy: Exponential

## 📱 Mobile Support

The same real-time service works on both web and mobile:

```tsx
// Mobile app (React Native)
import { RealTimeProvider, useMatchEvents } from '@kp5-academy/shared';

// Same API as web
const { events, addEvent } = useMatchEvents(realTime, matchId);
```

## 🔍 Monitoring

### Backend Monitoring
- Health check: `GET /health` (includes WebSocket connection count)
- WebSocket status: `GET /websocket/status`

### Frontend Monitoring
```tsx
const realTime = useRealTimeContext();

console.log('Connection state:', realTime.connectionState);
console.log('Is connected:', realTime.isConnected);
console.log('Socket ID:', realTime.service?.getSocketId());
```

## 🚀 Production Deployment

### Environment Variables
```env
# Production
NEXT_PUBLIC_WEBSOCKET_URL=wss://your-api-domain.com
EXPO_PUBLIC_WEBSOCKET_URL=wss://your-api-domain.com
```

### Load Balancing
For production, consider:
- Using a load balancer that supports WebSocket connections
- Sticky sessions for WebSocket connections
- Redis adapter for Socket.IO clustering

### Security
- Use WSS (WebSocket Secure) in production
- Implement rate limiting on WebSocket connections
- Validate all incoming messages
- Use proper CORS configuration

## 📚 API Reference

### RealTimeService Methods
- `connect()` - Connect to WebSocket server
- `disconnect()` - Disconnect from server
- `isConnected()` - Check connection status
- `on(event, callback)` - Subscribe to events
- `emit(event, data)` - Send events
- `joinRoom(room)` - Join a room
- `leaveRoom(room)` - Leave a room

### React Hooks
- `useRealTime(config, options)` - Main real-time hook
- `useMatchEvents(realTime, matchId)` - Match events hook
- `useChatMessages(realTime, roomId)` - Chat messages hook
- `useRealTimeNotifications(realTime)` - Notifications hook

### Context
- `RealTimeProvider` - React context provider
- `useRealTimeContext()` - Access real-time context

## 🤝 Contributing

When adding new real-time features:

1. Define event types in `shared/src/types/index.ts`
2. Add event handlers in `backend/src/services/websocketService.ts`
3. Create React hooks in `shared/src/hooks/useRealTime.ts`
4. Update documentation
5. Add tests

## 📞 Support

For issues with real-time communication:
1. Check connection status
2. Verify JWT token validity
3. Check server logs
4. Test with the `/test-realtime` page
5. Review this documentation
