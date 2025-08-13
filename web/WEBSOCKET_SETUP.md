# WebSocket Setup Guide

This guide explains how to set up and use the WebSocket functionality for real-time features in the KP5 Academy sports management platform.

## Environment Configuration

Create a `.env.local` file in the `web` directory with the following configuration:

```env
# WebSocket Configuration
NEXT_PUBLIC_WEBSOCKET_URL=http://localhost:3001

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3003
```

## Backend Requirements

Ensure your backend server is running with WebSocket support:

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Verify WebSocket service is running:**
   The backend should log "WebSocket service initialized" when starting.

## Frontend Setup

The WebSocket functionality is automatically configured when the app starts:

1. **WebSocket Provider:** Automatically wraps the app in `src/components/providers/Providers.tsx`
2. **Authentication:** WebSocket connections require a valid JWT token
3. **Auto-connection:** Connects automatically when user is authenticated

## Features

### Real-Time Match Tracking
- Live match state updates
- Real-time score synchronization
- Match timer control
- Event recording (goals, cards, substitutions)

### Live Event Broadcasting
- Match events broadcast to all connected clients
- Tournament updates in real-time
- Team statistics live updates

### Multi-Device Coordination
- Multiple referees can control the same match
- Real-time synchronization across devices
- Conflict resolution and data consistency

## Usage Examples

### Basic WebSocket Connection
```tsx
import { useWebSocketContext } from '@/contexts/WebSocketContext';

function MyComponent() {
  const { isConnected, joinMatch, submitMatchEvent } = useWebSocketContext();
  
  // Join a match room
  useEffect(() => {
    if (isConnected) {
      joinMatch('match-123', 'REFEREE');
    }
  }, [isConnected, joinMatch]);
  
  // Submit a match event
  const handleGoal = () => {
    submitMatchEvent({
      matchId: 'match-123',
      eventType: 'goal',
      minute: 45,
      teamId: 'home',
      description: 'Beautiful goal!'
    });
  };
}
```

### Live Match Tracker
```tsx
import LiveMatchTracker from '@/components/live-match/LiveMatchTracker';

function MatchPage() {
  return (
    <LiveMatchTracker
      match={{
        id: 'match-123',
        homeTeam: 'Home Team',
        awayTeam: 'Away Team',
        homeScore: 2,
        awayScore: 1,
        status: 'live'
      }}
      isReferee={true}
      onMatchUpdate={(matchId, updates) => {
        console.log('Match updated:', updates);
      }}
    />
  );
}
```

### WebSocket Status Component
```tsx
import WebSocketStatus from '@/components/common/WebSocketStatus';

function Header() {
  return (
    <div>
      <WebSocketStatus variant="compact" />
      <WebSocketStatus variant="detailed" showControls={true} />
    </div>
  );
}
```

## WebSocket Events

### Client to Server
- `join-match` - Join match room
- `leave-match` - Leave match room
- `submit-event-entry` - Submit match event
- `match-timer-control` - Control match timer
- `match-status-change` - Change match status

### Server to Client
- `match-event` - New match event
- `match-state` - Match state update
- `match-status-change` - Match status change
- `match-timer-update` - Timer update
- `event-entry-submitted` - Event submission confirmation

## Error Handling

The WebSocket service includes automatic error handling:

- **Connection failures:** Automatic retry with exponential backoff
- **Authentication errors:** Re-authentication handling
- **Network issues:** Graceful degradation and reconnection
- **Data validation:** Client-side validation before sending

## Performance Considerations

- **Connection pooling:** Limited connections per user
- **Message batching:** Batched updates for efficiency
- **Heartbeat monitoring:** Connection health checks
- **Memory management:** Automatic cleanup of disconnected sessions

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Verify backend is running on port 3001
   - Check firewall settings
   - Ensure CORS is configured correctly

2. **Authentication Failures**
   - Verify JWT token is valid
   - Check token expiration
   - Ensure user is properly authenticated

3. **Events Not Broadcasting**
   - Verify match room membership
   - Check user permissions
   - Ensure backend WebSocket service is active

### Debug Mode

Enable debug logging in development:

```tsx
// In your component
const { isConnected, error } = useWebSocketContext();

if (error) {
  console.error('WebSocket error:', error);
}
```

## Security

- **JWT Authentication:** All WebSocket connections require valid tokens
- **Role-based Access:** Users can only perform actions based on their role
- **Input Validation:** All events are validated before processing
- **Rate Limiting:** Prevents abuse and ensures system stability

## Testing

Test the WebSocket functionality:

1. **Open multiple browser tabs** with the same match
2. **Use different user roles** (referee, spectator, coach)
3. **Test network interruptions** by disconnecting/reconnecting
4. **Verify real-time updates** across all connected clients

## Support

For issues or questions about the WebSocket implementation:

1. Check the browser console for error messages
2. Verify backend logs for server-side issues
3. Test with the WebSocket status component
4. Review the connection test page at `/advanced-features-demo`
