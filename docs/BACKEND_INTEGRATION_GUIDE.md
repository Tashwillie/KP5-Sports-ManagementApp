# Backend Integration Guide for Mobile Live Match UI

## Overview

This guide covers the complete integration between the mobile live match UI and the backend services. The integration provides real-time data synchronization, live statistics updates, and seamless communication between mobile devices and the server infrastructure.

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   Backend API    │    │   WebSocket     │
│                 │    │                  │    │    Server       │
│ • LiveMatch     │◄──►│ • REST Endpoints │◄──►│ • Real-time     │
│ • EventEntry    │    │ • Authentication │    │ • Match Events  │
│ • Statistics    │    │ • Match Data     │    │ • State Updates │
│ • Real-time     │    │ • Statistics     │    │ • Broadcasting  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Components

### 1. Mobile API Service (`mobile/src/services/apiService.ts`)

The mobile API service provides a clean interface for communicating with the backend REST API endpoints.

#### Features
- **Type-safe API calls** with TypeScript interfaces
- **Automatic token management** using AsyncStorage
- **Request/response handling** with proper error management
- **Timeout handling** for network requests
- **Platform-specific headers** for mobile identification

#### API Classes

##### BaseAPI
```typescript
class BaseAPI {
  protected makeRequest<T>(endpoint: string, options: RequestInit): Promise<ApiResponse<T>>
  protected get<T>(endpoint: string): Promise<T>
  protected post<T>(endpoint: string, data?: any): Promise<T>
  protected put<T>(endpoint: string, data?: any): Promise<T>
  protected delete<T>(endpoint: string): Promise<T>
}
```

##### MatchAPI
```typescript
class MatchAPI extends BaseAPI {
  async getMatch(matchId: string): Promise<Match>
  async getMatches(params?: MatchQueryParams): Promise<MatchListResponse>
  async getMatchEvents(matchId: string): Promise<MatchEvent[]>
  async addMatchEvent(matchId: string, eventData: Partial<MatchEvent>): Promise<void>
  async startMatch(matchId: string): Promise<void>
  async pauseMatch(matchId: string): Promise<void>
  async resumeMatch(matchId: string): Promise<void>
  async endMatch(matchId: string, scores?: MatchScores): Promise<void>
  async getMatchWebSocketStatus(matchId: string): Promise<WebSocketStatus>
  async refreshMatchState(matchId: string): Promise<void>
}
```

##### StatisticsAPI
```typescript
class StatisticsAPI extends BaseAPI {
  async getMatchStats(matchId: string): Promise<MatchStatistics>
  async getMatchStatisticsOverview(matchId: string, params?: StatsParams): Promise<MatchStatistics>
  async getPlayerMatchStats(playerId: string, matchId: string): Promise<PlayerMatchStats>
  async getTeamMatchStats(teamId: string, matchId: string): Promise<TeamStats>
}
```

##### EventEntryAPI
```typescript
class EventEntryAPI extends BaseAPI {
  async startEventEntrySession(matchId: string, userId: string): Promise<EventEntrySession>
  async endEventEntrySession(sessionId: string): Promise<void>
  async submitEventEntry(sessionId: string, eventData: any): Promise<EventSubmissionResult>
  async validateEventEntry(eventData: any): Promise<EventValidationResult>
  async getEventEntrySuggestions(matchId: string, eventType: string): Promise<EventSuggestions>
}
```

### 2. Configuration (`mobile/src/config/api.ts`)

Environment-specific configuration for API endpoints and settings.

#### Configuration Options
```typescript
interface ApiConfig {
  baseUrl: string;        // REST API base URL
  websocketUrl: string;   // WebSocket server URL
  timeout?: number;       // Request timeout in milliseconds
}
```

#### Environment Configurations
- **Development**: `http://localhost:3001/api`
- **Staging**: `https://staging-api.kp5-academy.com/api`
- **Production**: `https://api.kp5-academy.com/api`

#### Runtime Configuration
```typescript
// Environment variables for runtime configuration
EXPO_PUBLIC_API_BASE_URL=https://custom-api.example.com/api
EXPO_PUBLIC_WEBSOCKET_URL=wss://custom-api.example.com
```

### 3. Live Match Data Hook (`mobile/src/hooks/useLiveMatchData.ts`)

A comprehensive React hook that manages all live match data and real-time communication.

#### Features
- **Automatic data fetching** on component mount
- **Real-time WebSocket connection** management
- **Periodic data refresh** with configurable intervals
- **Error handling** and retry mechanisms
- **Loading states** for all data operations
- **Match control actions** (start, pause, resume, end)
- **Event management** (add, refresh, validate)

#### Hook Interface
```typescript
interface UseLiveMatchDataReturn {
  // Data states
  match: Match | null;
  events: MatchEvent[];
  statistics: MatchStatistics | null;
  matchState: MatchState | null;
  
  // Loading states
  loading: boolean;
  eventsLoading: boolean;
  statsLoading: boolean;
  stateLoading: boolean;
  
  // Error states
  error: string | null;
  eventsError: string | null;
  statsError: string | null;
  stateError: string | null;
  
  // Connection states
  isConnected: boolean;
  isConnecting: boolean;
  
  // Actions
  refreshMatch: () => Promise<void>;
  refreshEvents: () => Promise<void>;
  refreshStatistics: () => Promise<void>;
  refreshMatchState: () => Promise<void>;
  
  // WebSocket actions
  connect: () => Promise<void>;
  disconnect: () => void;
  
  // Match control actions
  startMatch: () => Promise<void>;
  pauseMatch: () => Promise<void>;
  resumeMatch: () => Promise<void>;
  endMatch: (scores?: MatchScores) => Promise<void>;
  
  // Event actions
  addEvent: (eventData: Partial<MatchEvent>) => Promise<void>;
  
  // Utility functions
  isReferee: boolean;
  isCoach: boolean;
  isPlayer: boolean;
  canControlMatch: boolean;
}
```

#### Usage Example
```typescript
const {
  match,
  events,
  statistics,
  matchState,
  loading,
  error,
  isConnected,
  startMatch,
  pauseMatch,
  addEvent
} = useLiveMatchData({
  matchId: 'match-123',
  userId: 'user-456',
  userRole: 'referee',
  autoConnect: true,
  refreshInterval: 30000
});
```

## Backend Endpoints

### Authentication
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Matches
- `GET /api/matches` - List all matches
- `GET /api/matches/:id` - Get specific match
- `POST /api/matches` - Create new match
- `PUT /api/matches/:id` - Update match
- `DELETE /api/matches/:id` - Delete match
- `GET /api/matches/:id/events` - Get match events
- `POST /api/matches/:id/events` - Add match event
- `POST /api/matches/:id/start` - Start match
- `POST /api/matches/:id/pause` - Pause match
- `POST /api/matches/:id/resume` - Resume match
- `POST /api/matches/:id/end` - End match
- `GET /api/matches/:id/websocket-status` - Get WebSocket status
- `POST /api/matches/:id/websocket/refresh-state` - Refresh match state

### Statistics
- `GET /api/statistics/matches/:id` - Get match statistics
- `GET /api/statistics/matches/:id/overview` - Get match statistics overview
- `GET /api/statistics/players/:id/matches/:matchId` - Get player match stats
- `GET /api/statistics/teams/:id/matches/:matchId` - Get team match stats
- `GET /api/statistics/seasons/:season/top-performers` - Get top performers
- `GET /api/statistics/seasons/:season/standings` - Get team standings

### Event Entry
- `POST /api/event-entry/sessions/start` - Start event entry session
- `POST /api/event-entry/sessions/:id/end` - End event entry session
- `POST /api/event-entry/sessions/:id/submit` - Submit event entry
- `POST /api/event-entry/validate` - Validate event entry
- `GET /api/event-entry/suggestions` - Get event suggestions

### WebSocket Status
- `GET /api/matches/websocket/status` - Get overall WebSocket status

## WebSocket Events

### Client to Server
- `join-match` - Join a match room
- `leave-match` - Leave a match room
- `start-event-entry` - Start event entry session
- `end-event-entry` - End event entry session
- `submit-event-entry` - Submit event entry
- `validate-event-entry` - Validate event entry
- `get-event-suggestions` - Get event suggestions
- `get-event-entry-status` - Get event entry status

### Server to Client
- `match-joined` - Confirmation of joining match room
- `match-left` - Confirmation of leaving match room
- `match-event` - New match event
- `match-status-change` - Match status update
- `match-state` - Match state update
- `statistics-update` - Statistics update
- `event-entry-session-started` - Event entry session started
- `event-entry-session-ended` - Event entry session ended
- `event-entry-submitted` - Event entry submitted
- `event-entry-validated` - Event entry validation result

## Data Types

### Match
```typescript
interface Match {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  location?: string;
  address?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
  homeScore: number;
  awayScore: number;
  homeTeamId: string;
  awayTeamId: string;
  homeTeam?: Team;
  awayTeam?: Team;
  events?: MatchEvent[];
  participants?: MatchParticipant[];
  createdAt: string;
  updatedAt: string;
}
```

### MatchEvent
```typescript
interface MatchEvent {
  id: string;
  type: string;
  minute?: number;
  description?: string;
  playerId?: string;
  teamId?: string;
  data?: any;
  timestamp: string;
}
```

### MatchStatistics
```typescript
interface MatchStatistics {
  matchId: string;
  homeTeam: TeamStats;
  awayTeam: TeamStats;
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
  yellowCards: { home: number; away: number };
  redCards: { home: number; away: number };
}
```

### MatchState
```typescript
interface MatchState {
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
  currentPeriod: 'FIRST_HALF' | 'HALFTIME' | 'SECOND_HALF' | 'EXTRA_TIME' | 'PENALTIES';
  timeElapsed: number;
  injuryTime: number;
  homeScore: number;
  awayScore: number;
  isTimerRunning: boolean;
  lastEventTime?: string;
}
```

## Error Handling

### Network Errors
- **Timeout errors**: Automatic retry with exponential backoff
- **Connection errors**: Graceful degradation to offline mode
- **Authentication errors**: Automatic token refresh or logout

### API Errors
- **Validation errors**: User-friendly error messages
- **Permission errors**: Role-based access control
- **Server errors**: Retry mechanisms and fallback data

### WebSocket Errors
- **Connection drops**: Automatic reconnection with exponential backoff
- **Event errors**: Error logging and user notification
- **State sync errors**: Fallback to REST API calls

## Performance Optimization

### Data Fetching
- **Lazy loading**: Load data only when needed
- **Caching**: Cache frequently accessed data
- **Pagination**: Load large datasets in chunks
- **Background refresh**: Update data in background

### WebSocket Optimization
- **Connection pooling**: Reuse connections when possible
- **Event batching**: Batch multiple events together
- **Heartbeat**: Keep connections alive with minimal traffic
- **Compression**: Compress WebSocket messages

### Mobile-Specific Optimizations
- **Battery optimization**: Minimize background network calls
- **Data usage**: Compress and optimize data transfer
- **Offline support**: Cache data for offline viewing
- **Push notifications**: Use push for critical updates

## Security

### Authentication
- **JWT tokens**: Secure token-based authentication
- **Token refresh**: Automatic token renewal
- **Secure storage**: Encrypted token storage on device

### Authorization
- **Role-based access**: User role validation
- **Resource ownership**: User can only access their data
- **API rate limiting**: Prevent abuse and DoS attacks

### Data Protection
- **HTTPS/WSS**: Encrypted communication
- **Input validation**: Server-side validation of all inputs
- **SQL injection protection**: Parameterized queries
- **XSS protection**: Sanitize user inputs

## Testing

### Integration Testing
Run the comprehensive integration test suite:

```bash
# Install dependencies
npm install axios socket.io-client

# Run tests
node test-backend-integration.js

# With custom configuration
API_BASE_URL=https://your-api.com WEBSOCKET_URL=wss://your-api.com node test-backend-integration.js
```

### Test Coverage
The integration tests cover:
- Backend health and availability
- Authentication endpoints
- Match data endpoints
- Statistics endpoints
- Event entry endpoints
- WebSocket connection and events
- Mobile-specific API endpoints

### Manual Testing
1. **Start the backend server**
2. **Launch the mobile app**
3. **Navigate to a live match**
4. **Verify real-time updates**
5. **Test match controls**
6. **Verify event entry**
7. **Check statistics updates**

## Deployment

### Environment Configuration
1. **Set environment variables** for API endpoints
2. **Configure authentication** tokens and secrets
3. **Set up SSL certificates** for production
4. **Configure CORS** for mobile app domains

### Monitoring
1. **API response times** and error rates
2. **WebSocket connection** stability
3. **Database performance** and query optimization
4. **Mobile app crash** reports and analytics

### Scaling
1. **Load balancing** for multiple backend instances
2. **Database sharding** for large datasets
3. **CDN integration** for static assets
4. **Redis clustering** for WebSocket state management

## Troubleshooting

### Common Issues

#### Connection Problems
- **Check network connectivity**
- **Verify API endpoint URLs**
- **Check firewall settings**
- **Verify SSL certificates**

#### Authentication Issues
- **Check token validity**
- **Verify user permissions**
- **Check role assignments**
- **Clear stored tokens**

#### Data Sync Issues
- **Check WebSocket connection**
- **Verify event ordering**
- **Check database consistency**
- **Review error logs**

#### Performance Issues
- **Monitor API response times**
- **Check database query performance**
- **Verify WebSocket message size**
- **Review caching strategies**

### Debug Tools
- **Network inspector** for API calls
- **WebSocket debugger** for real-time events
- **Console logging** for detailed debugging
- **Performance profiler** for optimization

### Support
- **Check error logs** for detailed information
- **Review API documentation** for endpoint details
- **Test with integration script** for validation
- **Contact development team** for assistance

## Future Enhancements

### Planned Features
- **Offline-first architecture** with sync capabilities
- **Advanced caching** with intelligent invalidation
- **Real-time collaboration** for multiple users
- **AI-powered insights** and predictions
- **Advanced analytics** and reporting

### Technical Improvements
- **GraphQL integration** for flexible data queries
- **WebRTC integration** for peer-to-peer communication
- **Service worker** for background sync
- **Progressive Web App** capabilities
- **Cross-platform** code sharing

## Conclusion

The backend integration provides a robust, scalable foundation for the mobile live match UI system. With comprehensive error handling, real-time communication, and performance optimization, users can enjoy a seamless experience with live match data, statistics, and controls.

For additional support or questions, refer to the API documentation or contact the development team.
